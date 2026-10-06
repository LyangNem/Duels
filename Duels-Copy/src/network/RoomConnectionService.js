// One owner for asynchronous room operations. Gameplay remains in RoomService.
const RoomConnectionService={
  protocol:1, registrationMs:12000, handshakeMs:10000, migrationMs:45000,
  generation:0, state:'idle', timers:new Set(),
  peerId(code){return `duels3-room-v${this.protocol}-${code}`},
  valid(room,token,peer=null){return token===this.generation&&(!peer||room.peer===peer)},
  later(callback,ms){const id=setTimeout(()=>{this.timers.delete(id);callback()},ms);this.timers.add(id);return id},
  cancel(id){clearTimeout(id);this.timers.delete(id)},
  dispose(room){
    ++this.generation;this.state='idle';
    for(const id of this.timers)clearTimeout(id);this.timers.clear();
    const peer=room.peer,host=room.hostConnection,connections=[...room.connections.values()];
    room.peer=null;room.hostConnection=null;room.connections.clear();room.isHost=false;
    for(const c of connections){try{c.close()}catch(_){}}
    try{host?.close()}catch(_){}try{peer?.destroy()}catch(_){}
  },
  fail(room,token,message,mode){
    if(!this.valid(room,token))return;
    const migrating=mode==='migration';
    room.reset();this.state='failed';
    if(migrating)OnlineDuelService.stop({returnToRoom:false});
    if(mode==='join')RoomUI.setJoinStatus(message,'err');else RoomUI.showLobby(message);
  },
  watchSignaling(room,peer,token){
    peer.on('disconnected',()=>{
      if(!this.valid(room,token,peer)||peer.destroyed)return;
      // Losing the signaling server does not mean losing live DataChannels.
      this.later(()=>{if(this.valid(room,token,peer)&&peer.disconnected&&!peer.destroyed){try{peer.reconnect()}catch(_){}}},1000);
    });
  },
  async start(room,mode,code=''){
    if(this.state==='loading'||this.state==='creating'||this.state==='joining')return false;
    room.reset();const token=this.generation;this.state='loading';
    if(mode==='host'){RoomUI.showRoom();RoomUI.setStatus('방 생성 중...')}
    else RoomUI.setJoinStatus('방 연결 중...');
    try{await PeerRuntime.ensure()}catch(error){this.fail(room,token,error.message,mode);return false}
    if(!this.valid(room,token))return false;
    if(mode==='host'){this.state='creating';this.create(room,token);}
    else{this.state='joining';room.code=code;this.clientPeer(room,token,()=>this.connect(room,token,{},()=>this.fail(room,token,'방에 연결하지 못했습니다. 번호와 네트워크를 확인해주세요.','join')),'join');}
    return true;
  },
  create(room,token,attempt=0){
    if(!this.valid(room,token))return;
    if(attempt>=32){this.fail(room,token,'사용 가능한 방 번호를 확보하지 못했습니다. 다시 시도해주세요.','host');return}
    const code=room.generateAvailableCodeCandidate();
    const previous=room.peer;room.peer=null;try{previous?.destroy()}catch(_){}
    let peer;try{peer=new window.Peer(this.peerId(code))}catch(error){this.fail(room,token,'방 연결을 시작하지 못했습니다.','host');return}
    room.peer=peer;let settled=false;
    const timeout=this.later(()=>{if(this.valid(room,token,peer))this.fail(room,token,'방 번호 등록 시간이 초과되었습니다. 다시 시도해주세요.','host')},this.registrationMs);
    peer.on('open',()=>{
      if(!this.valid(room,token,peer)||settled)return;settled=true;this.cancel(timeout);
      room.code=code;room.roomInstance=globalThis.crypto?.randomUUID?.()||`room-${Date.now()}-${Math.random().toString(36).slice(2)}`;room.isHost=true;room.localPid='P1';
      room.members.set('P1',room.createMember('P1',room.profile(),{host:true,sessionKey:room.localSessionKey,deviceKey:RoomIdentityService.deviceKey(),joinOrder:0}));
      this.state='connected';RoomUI.setStatus('참가자 연결 대기 중');room.broadcast();
    });
    peer.on('connection',c=>{if(this.valid(room,token,peer)&&room.isHost)room.bindHostConnection(c);else{try{c.close()}catch(_){}}});
    peer.on('error',error=>{
      if(!this.valid(room,token,peer))return;
      if(!settled&&error?.type==='unavailable-id'){settled=true;this.cancel(timeout);this.create(room,token,attempt+1);return}
      if(error?.type==='peer-unavailable')return;
      if(settled&&!peer.destroyed&&(error?.type==='network'||error?.type==='server-error'||error?.type==='socket-error')){RoomUI.setStatus('신호 서버 연결을 복구하는 중입니다.');return}
      this.fail(room,token,`방 연결 오류: ${error?.type||'unknown'}`,'host');
    });this.watchSignaling(room,peer,token);
  },
  clientPeer(room,token,onOpen,mode,onFailure=null){
    if(!this.valid(room,token))return;
    const previous=room.peer;room.peer=null;try{previous?.destroy()}catch(_){}
    let peer;try{peer=new window.Peer()}catch(_){(onFailure||(()=>this.fail(room,token,'연결을 시작하지 못했습니다.',mode)))();return}
    room.peer=peer;let opened=false,finished=false;
    const fail=()=>{if(finished||!this.valid(room,token,peer))return;finished=true;this.cancel(timeout);(onFailure||(()=>this.fail(room,token,'네트워크 연결 시간이 초과되었습니다.',mode)))()};
    const timeout=this.later(fail,this.registrationMs);
    peer.on('open',()=>{if(finished||opened||!this.valid(room,token,peer))return;opened=true;this.cancel(timeout);onOpen()});
    peer.on('error',error=>{if(!this.valid(room,token,peer))return;if(!opened)fail();else if(error?.type==='peer-unavailable'){/* The connection handshake owns its timeout. */}else if(peer.destroyed)fail()});
    this.watchSignaling(room,peer,token);
  },
  connect(room,token,options,onFailure){
    if(!this.valid(room,token)||room.isHost)return;
    let c;try{c=room.peer.connect(this.peerId(room.code),{reliable:true})}catch(_){onFailure();return}
    room.attachClientConnection(c,{...options,onFailure});
  },
  migrate(room,rank,epoch){
    const token=this.generation,started=Date.now();this.state='migrating';
    for(const id of this.timers)clearTimeout(id);this.timers.clear();
    // Invalidate the old channel before closing it; all callbacks check ownership.
    const old=room.hostConnection;room.hostConnection=null;try{old?.close()}catch(_){}
    const current=()=>this.valid(room,token)&&room._migrationEpoch===epoch&&this.state==='migrating';
    const deadline=this.later(()=>{if(current())this.fail(room,token,'호스트 승계에 실패했습니다. 새 방에 입장해주세요.','migration')},this.migrationMs);
    const retry=()=>{if(current())this.later(step,700)};
    const accepted=()=>{this.cancel(deadline);this.state='connected'};
    const claim=()=>{
      if(!current())return;
      const previous=room.peer;room.peer=null;try{previous?.destroy()}catch(_){}
      let peer;try{peer=new window.Peer(this.peerId(room.code))}catch(_){retry();return}
      room.peer=peer;let settled=false;
      const timeout=this.later(()=>{if(current()&&room.peer===peer&&!settled){settled=true;room.peer=null;try{peer.destroy()}catch(_){}retry()}},this.registrationMs);
      peer.on('open',()=>{
        if(!current()||room.peer!==peer||settled)return;settled=true;this.cancel(timeout);accepted();
        room.isHost=true;room.hostConnection=null;room.connections.clear();RoomMemberCleanupService.pruneDeparted(room);
        for(const m of room.members.values())m.host=m.pid===room.localPid;
        const local=room.localMember();if(local){local.connected=true;local.departed=false;local.spectating=false}
        RoomUI.setStatus('현재 방의 호스트입니다.');RoomUI.render();
        if(RoomMatchLifecycleService.reevaluateRemainingPlayers(room))return;
        OnlineDuelService.applyRosterUpdate({mode:room.matchMode,activeMatchPids:room.matchPids(),members:[...room.members.values()],scores:room.scoreObject(),selections:room.selectionObject(),augments:room.augmentObject()});
        room.broadcast();room.resumeDelegatedHostPhase();
      });
      peer.on('connection',c=>{if(this.valid(room,token,peer)&&room.isHost)room.bindHostConnection(c);else{try{c.close()}catch(_){}}});
      peer.on('error',()=>{
        if(!this.valid(room,token,peer))return;
        if(settled){if(peer.destroyed)this.fail(room,token,'호스트 연결이 종료되었습니다.','migration');return}
        settled=true;this.cancel(timeout);room.peer=null;try{peer.destroy()}catch(_){}
        // An occupied ID may already belong to the winner: reconnect before claiming again.
        this.clientPeer(room,token,()=>this.connect(room,token,{migration:true,desiredPid:room.localPid,onAccepted:accepted},retry),'migration',retry);
      });this.watchSignaling(room,peer,token);
    };
    const step=()=>{
      if(!current())return;
      if(Date.now()-started>=4000*rank+150){claim();return}
      const connect=()=>this.connect(room,token,{migration:true,desiredPid:room.localPid,onAccepted:accepted},retry);
      if(room.peer?.open&&!room.peer.destroyed)connect();else this.clientPeer(room,token,connect,'migration',retry);
    };
    this.later(step,150);
  }
};
