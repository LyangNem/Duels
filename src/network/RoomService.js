

const RoomService={
  maxChoiceCount:25,
  maxPlayers:4,peer:null,hostConnection:null,connections:new Map(),members:new Map(),localPid:null,code:'',isHost:false,serverMatchId:'',
  settings:{winsRequired:5,characterCount:15,augmentCount:5,gameMode:'normal'},
  teamOrder:['red','blue','yellow','green'],matchMode:null,
  duelPhase:'room',activeMatchPids:new Set(),duelSelections:new Map(),characterReady:new Set(),startAugmentChoices:new Map(),startAugments:new Map(),matchAugments:new Map(),
  betweenReady:new Set(),betweenSelections:new Map(),
  bannedCharacters:new Set(),characterBanProposal:null,_characterBanProposalSequence:0,characterBanNotice:null,_characterBanNoticeSequence:0,_lastCharacterBanNoticeId:0,
  roundScores:new Map(),resolvedRoundTokens:new Set(),currentRound:1,roundToken:0,currentMapId:null,currentSpawnOrder:[],_betweenPacket:null,
  _roundResolveTimer:0,_betweenCountdownTimer:0,_startCountdownTimer:0,
  _hostTriedCodes:new Set(),
  _joinSequence:0,
  _migrationEpoch:0,
  _migrationTimer:0,
  _migrationReconnectTimer:0,
  _pendingMigrationMatchAbort:false,
  _lastRoundWinnerPid:null,
  _lastRoundLoserPids:[],
  departedMatchPids:new Set(),
  blockedRejoinKeys:new Set(),
  characterPreviewSelections:new Map(),
  augmentPreviewSelections:new Map(),
  localSessionKey:'',roomInstance:'',
  roomSettingsStore(){
    let data={};
    try{data=JSON.parse(localStorage.getItem('duels-room-settings-v1')||'{}')||{}}catch(_){}
    return data;
  },
  savedRoomSettings(mode=null){
    const data=this.roomSettingsStore();
    const gameMode=(mode||data.gameMode)==='augment'?'augment':'normal';
    const saved=data.modes?.[gameMode]||{};
    const bounded=(value,fallback,max,min=0)=>Number.isFinite(Number(value))?Math.max(min,Math.min(max,Math.floor(Number(value)))):fallback;
    return {gameMode,winsRequired:bounded(saved.winsRequired,5,8,1),characterCount:bounded(saved.characterCount,gameMode==='normal'?15:7,25),augmentCount:bounded(saved.augmentCount,5,25)};
  },
  saveRoomSettings(){
    const data=this.roomSettingsStore();
    data.gameMode=this.settings.gameMode;
    data.modes={...(data.modes||{}),[this.settings.gameMode]:{winsRequired:this.settings.winsRequired,characterCount:this.settings.characterCount,augmentCount:this.settings.augmentCount}};
    try{localStorage.setItem('duels-room-settings-v1',JSON.stringify(data))}catch(_){}
  },
  reset(){
    RoomConnectionService.dispose(this);this.roomInstance='';
    this.members.clear();this.localPid=null;this.code='';this.isHost=false;this.serverMatchId='';
    this.settings=this.savedRoomSettings();
    this.matchMode=null;this.duelPhase='room';this.activeMatchPids.clear();this.duelSelections.clear();this.characterReady.clear();
    this.startAugmentChoices.clear();this.startAugments.clear();this.matchAugments.clear();
    this.betweenReady.clear();this.betweenSelections.clear();this.bannedCharacters.clear();this.characterBanProposal=null;this._characterBanProposalSequence=0;this.characterBanNotice=null;this._characterBanNoticeSequence=0;this._lastCharacterBanNoticeId=0;this.roundScores.clear();this.resolvedRoundTokens.clear();CharacterRecordProgressionService.reset();this.characterPreviewSelections.clear();this.augmentPreviewSelections.clear();
    this.currentRound=1;this.roundToken=0;this.currentMapId=null;this.currentSpawnOrder=[];this._betweenPacket=null;
    this._hostTriedCodes.clear();
    this._joinSequence=0;
    this._migrationEpoch=0;
    this._lastRoundWinnerPid=null;
    this._lastRoundLoserPids=[];
    this.departedMatchPids.clear();
    this.blockedRejoinKeys.clear();
    this.localSessionKey=RoomIdentityService.key();
    clearTimeout(this._startCountdownTimer);clearTimeout(this._betweenCountdownTimer);clearTimeout(this._roundResolveTimer);
    clearTimeout(this._migrationTimer);clearTimeout(this._migrationReconnectTimer);
    this._startCountdownTimer=0;this._betweenCountdownTimer=0;this._roundResolveTimer=0;
    this._migrationTimer=0;this._migrationReconnectTimer=0;
    this._pendingMigrationMatchAbort=false;
  },
  profile(){return PlayerProfileService.snapshot()},
  localMember(){return this.localPid?this.members.get(this.localPid)||null:null},
  allocatePid(){for(let i=1;i<=this.maxPlayers;i++){const pid=`P${i}`;if(!this.members.has(pid))return pid}return null},
  initialTeam(pid){
    const used=new Set(
      [...this.members.values()]
        .filter(member=>
          member&&
          member.pid!==pid&&
          member.connected!==false&&
          member.departed!==true&&
          !member.spectator
        )
        .map(member=>String(member.team||''))
        .filter(Boolean)
    );
    return this.teamOrder.find(teamId=>!used.has(teamId))||this.teamOrder[0];
  },
  syncJoinSequence(sequence=0){
    // Keep the high-water mark even after the most recent member leaves.
    if(Number.isSafeInteger(sequence)&&sequence>=0){
      this._joinSequence=Math.max(this._joinSequence,sequence);
    }
    for(const member of this.members.values()){
      if(Number.isSafeInteger(member?.joinOrder)&&member.joinOrder>=0){
        this._joinSequence=Math.max(this._joinSequence,member.joinOrder);
      }
    }
    return this._joinSequence;
  },
  allocateJoinOrder(joinOrder=null){
    this.syncJoinSequence();
    // Only an explicitly supplied numeric order is preserved (host starts at 0).
    // null/undefined must allocate a new order rather than becoming Number(null)=0.
    if(Number.isSafeInteger(joinOrder)&&joinOrder>=0){
      this.syncJoinSequence(joinOrder);
      return joinOrder;
    }
    return ++this._joinSequence;
  },
  createMember(
    pid,
    profile,
    {
      host=false,
      spectator=false,
      spectating=false,
      sessionKey='',
      deviceKey='',
      identityKey='',
      joinOrder=null
    }={}
  ){
    const actualSessionKey=
      String(sessionKey||'');
    const actualDeviceKey=String(deviceKey||(pid===this.localPid?RoomIdentityService.deviceKey():''));
    const actualIdentityKey=
      String(
        identityKey||
        RoomIdentityService.profileKey(
          profile,
          actualSessionKey
        )
      );

    return {
      pid,
      profile:{...profile},
      team:this.initialTeam(pid),
      ready:false,
      host:!!host,
      spectator:!!spectator,
      spectating:!!spectating,
      connected:true,
      departed:false,
      sessionKey:actualSessionKey,
      deviceKey:actualDeviceKey,
      identityKey:actualIdentityKey,
      joinOrder:this.allocateJoinOrder(joinOrder)
    };
  },
  matchPids(){
    if(this.activeMatchPids.size){
      return [...this.activeMatchPids]
        .filter(pid=>this.members.has(pid))
        .sort((a,b)=>a.localeCompare(b));
    }

    return [...this.members.values()]
      .filter(member=>!member.spectator)
      .map(member=>member.pid)
      .sort((a,b)=>a.localeCompare(b));
  },
  characterBanVotingPids(){
    return [...this.members.values()]
      .filter(member=>
        member&&
        member.connected!==false&&
        member.departed!==true&&
        !member.spectator
      )
      .map(member=>member.pid)
      .sort((a,b)=>a.localeCompare(b));
  },
  isCharacterBanned(characterId){
    return this.bannedCharacters.has(
      String(characterId||'')
    );
  },
  characterBanMemberName(pid){
    const member=this.members.get(String(pid||''))||null;
    return String(
      member?.profile?.displayName||
      member?.displayName||
      pid||
      '플레이어'
    );
  },
  resolveCharacterBanConsensus(){
    const proposal=this.characterBanProposal;
    if(!proposal)return false;
    const voters=this.characterBanVotingPids();
    const approvals=proposal.approvals instanceof Set
      ?proposal.approvals
      :new Set(proposal.approvals||[]);
    proposal.approvals=approvals;
    if(
      voters.length>0&&
      voters.every(pid=>approvals.has(pid))
    ){
      const maximumBanned=
        Math.max(
          0,
          CharacterCardDataService.all().length-1
        );

      for(const characterId of proposal.characterIds||[]){
        if(!GAME_DATA.characters[characterId])continue;

        if(this.bannedCharacters.has(characterId)){
          this.bannedCharacters.delete(characterId);
        }else if(
          this.bannedCharacters.size<maximumBanned
        ){
          this.bannedCharacters.add(characterId);
        }
      }

      this.characterBanProposal=null;
      return true;
    }
    return false;
  },
  submitCharacterBanProposal(characterIds){
    if(
      !this.isHost||
      this.duelPhase!=='room'||
      this.characterBanProposal
    )return false;
    const ids=[...new Set(
      [...(characterIds||[])].map(String)
    )].filter(id=>
      !!GAME_DATA.characters[id]
    );
    if(!ids.length)return false;

    const totalCharacters=
      CharacterCardDataService.all().length;
    const finalBanned=
      new Set(this.bannedCharacters);

    for(const characterId of ids){
      if(finalBanned.has(characterId)){
        finalBanned.delete(characterId);
      }else{
        finalBanned.add(characterId);
      }
    }

    if(finalBanned.size>=totalCharacters){
      RoomUI.setStatus(
        '최소 1개의 캐릭터는 금지하지 않고 남겨야 합니다.',
        'err'
      );
      return false;
    }

    this.characterBanNotice=null;
    this.characterBanProposal={
      id:++this._characterBanProposalSequence,
      characterIds:ids,
      proposerPid:this.localPid,
      approvals:new Set(
        this.localPid?[this.localPid]:[]
      )
    };
    const committed=this.resolveCharacterBanConsensus();
    RoomUI.setStatus(
      committed
        ?'캐릭터 금지 설정이 확정되었습니다.'
        :'캐릭터 금지 설정 요청을 제안했습니다.'
    );
    this.broadcast();
    return true;
  },
  submitCharacterBanVote(agree){
    const proposal=this.characterBanProposal;
    if(!proposal||this.duelPhase!=='room'||!this.localPid)return false;
    if(this.isHost){
      return this.receiveCharacterBanVote(
        this.localPid,
        proposal.id,
        agree
      );
    }
    return NetworkPayloadCodec.send(
      this.hostConnection,
      {
        type:'room-character-ban-vote',
        proposalId:proposal.id,
        agree:agree===true
      }
    );
  },
  receiveCharacterBanVote(pid,proposalId,agree){
    const proposal=this.characterBanProposal;
    if(
      !this.isHost||
      this.duelPhase!=='room'||
      !proposal||
      Number(proposal.id)!==Number(proposalId)||
      !this.characterBanVotingPids().includes(pid)
    )return false;
    if(agree!==true){
      const rejectorPid=String(pid||'');
      const rejectorName=
        this.characterBanMemberName(rejectorPid);

      this.characterBanProposal=null;
      this.characterBanNotice={
        id:++this._characterBanNoticeSequence,
        type:'rejected',
        pid:rejectorPid,
        at:Date.now()
      };
      this._lastCharacterBanNoticeId=
        Number(this.characterBanNotice.id)||0;

      RoomUI.setStatus(
        `${rejectorName}님이 캐릭터 금지 설정 제안을 거절했습니다.`,
        'err'
      );
      this.broadcast();
      return true;
    }
    if(!(proposal.approvals instanceof Set)){
      proposal.approvals=new Set(proposal.approvals||[]);
    }
    proposal.approvals.add(pid);
    const committed=this.resolveCharacterBanConsensus();
    RoomUI.setStatus(
      committed
        ?'모든 플레이어가 동의해 캐릭터 금지 설정이 확정되었습니다.'
        :'캐릭터 금지 설정 요청에 동의했습니다.'
    );
    this.broadcast();
    return true;
  },
  snapshot(){
    this.resolveCharacterBanConsensus();
    return {
      type:'room-state',
      code:this.code,
      protocol:RoomConnectionService.protocol,
      roomInstance:this.roomInstance,
      serverMatchId:this.serverMatchId,
      settings:{...this.settings},
      bannedCharacters:[...this.bannedCharacters],
      characterBanProposal:this.characterBanProposal
        ?{
          id:this.characterBanProposal.id,
          characterIds:[...(this.characterBanProposal.characterIds||[])],
          proposerPid:this.characterBanProposal.proposerPid||null,
          approvals:[...(this.characterBanProposal.approvals||[])]
        }
        :null,
      characterBanNotice:this.characterBanNotice
        ?{...this.characterBanNotice}
        :null,
      matchMode:this.matchMode,
      duelPhase:this.duelPhase,
      activeMatchPids:this.matchPids(),
      migrationEpoch:this._migrationEpoch,
      joinSequence:this._joinSequence,
      blockedRejoinKeys:[...this.blockedRejoinKeys],
      currentRound:this.currentRound,
      roundToken:this.roundToken,
      currentMapId:this.currentMapId,
      currentSpawnOrder:[...this.currentSpawnOrder],
      roundScores:this.scoreObject(),
      duelSelections:this.selectionObject(),
      characterReady:[...this.characterReady],
      startAugmentChoices:Object.fromEntries(
        [...this.startAugmentChoices].map(
          ([pid,ids])=>[pid,[...(ids||[])]]
        )
      ),
      startAugments:Object.fromEntries(
        this.startAugments
      ),
      matchAugments:this.augmentObject(),
      betweenReady:[...this.betweenReady],
      betweenSelections:Object.fromEntries(
        [...this.betweenSelections].map(
          ([pid,value])=>[pid,{...(value||{})}]
        )
      ),
      betweenPacket:this._betweenPacket
        ?{...this._betweenPacket}
        :null,
      resolvedRoundTokens:[...this.resolvedRoundTokens],
      lastRoundWinnerPid:this._lastRoundWinnerPid,
      lastRoundLoserPids:[...this._lastRoundLoserPids],
      members:[...this.members.values()].map(
        member=>({
          ...member,
          profile:{...member.profile}
        })
      )
    };
  },
  sendToPeers(payload,{excludePid=null}={}){
    if(!this.isHost)return false;

    let encoded=null;

    for(const [pid,connection] of this.connections){
      if(
        pid===excludePid||
        !connection?.open
      )continue;

      if(encoded===null){
        encoded=
          NetworkPayloadCodec.transport(
            payload
          );
      }

      NetworkPayloadCodec.sendEncoded(
        connection,
        encoded
      );
    }

    return true;
  },
  sendGameplay(payload){
    const packet={
      ...payload,
      sourcePid:this.localPid
    };
    if(['duel-action','duel-triggered-attack','duel-scheduled-projectile-shot'].includes(String(payload?.type||''))){
    }
    if(this.isHost){
      this.sendToPeers(packet);
    }else{
      NetworkPayloadCodec.send(
        this.hostConnection,
        packet
      );
    }
    return true;
  },
  broadcast(){
    if(!this.isHost)return;
    const state=this.snapshot();
    this.sendToPeers(state);
    RoomUI.render();

    if(OnlineDuelService.active){
      OnlineDuelService.updateRoundScore();
    }
  },
  acceptState(payload){
    this.roomInstance=payload?.roomInstance||this.roomInstance;
    this.code=String(payload?.code||this.code);
    this.serverMatchId=String(payload?.serverMatchId||this.serverMatchId||'');
    const incomingSettings={
      ...(payload?.settings||{})
    };
    if(
      incomingSettings.winsRequired===undefined&&
      incomingSettings.total!==undefined
    ){
      incomingSettings.winsRequired=
        Math.ceil(
          Math.max(
            1,
            Number(incomingSettings.total)||9
          )/2
        );
    }
    delete incomingSettings.total;


    this.settings={
      ...this.settings,
      ...incomingSettings
    };
    this.bannedCharacters=new Set(
      (payload?.bannedCharacters||[])
        .map(String)
        .filter(id=>!!GAME_DATA.characters[id])
    );
    if(payload?.characterBanProposal){
      this.characterBanProposal={
        id:Number(payload.characterBanProposal.id)||0,
        characterIds:[...new Set(
          (payload.characterBanProposal.characterIds||[])
            .map(String)
            .filter(id=>!!GAME_DATA.characters[id])
        )],
        proposerPid:String(payload.characterBanProposal.proposerPid||''),
        approvals:new Set(
          (payload.characterBanProposal.approvals||[]).map(String)
        )
      };
      this._characterBanProposalSequence=Math.max(
        this._characterBanProposalSequence,
        Number(this.characterBanProposal.id)||0
      );
    }else{
      this.characterBanProposal=null;
    }

    const incomingCharacterBanNotice=
      payload?.characterBanNotice&&
      typeof payload.characterBanNotice==='object'
        ?{
          id:Number(payload.characterBanNotice.id)||0,
          type:String(payload.characterBanNotice.type||''),
          pid:String(payload.characterBanNotice.pid||''),
          at:Number(payload.characterBanNotice.at)||0
        }
        :null;

    this.characterBanNotice=
      incomingCharacterBanNotice;

    this._characterBanNoticeSequence=
      Math.max(
        this._characterBanNoticeSequence,
        Number(incomingCharacterBanNotice?.id)||0
      );

    this.matchMode=
      payload?.matchMode||
      this.matchMode||
      null;
    this.duelPhase=String(
      payload?.duelPhase||
      this.duelPhase||
      'room'
    );
    this.activeMatchPids=
      new Set(
        payload?.activeMatchPids||[]
      );
    this._migrationEpoch=
      Math.max(
        this._migrationEpoch,
        Number(payload?.migrationEpoch)||0
      );
    this.blockedRejoinKeys=
      new Set(
        payload?.blockedRejoinKeys||[]
      );

    this.currentRound=Math.max(
      1,
      Number(payload?.currentRound)||
        this.currentRound||1
    );
    this.roundToken=Math.max(
      0,
      Number(payload?.roundToken)||0
    );
    this.currentMapId=
      payload?.currentMapId||
      this.currentMapId||null;
    this.currentSpawnOrder=
      Array.isArray(payload?.currentSpawnOrder)
        ?[...payload.currentSpawnOrder]
        :this.currentSpawnOrder;

    this.roundScores=new Map(
      Object.entries(
        payload?.roundScores||{}
      ).map(([pid,value])=>[
        pid,
        Number(value)||0
      ])
    );
    this.duelSelections=new Map(
      Object.entries(
        payload?.duelSelections||{}
      ).filter(([,value])=>!!value)
    );
    this.characterReady=new Set(
      payload?.characterReady||[]
    );
    this.startAugmentChoices=new Map(
      Object.entries(
        payload?.startAugmentChoices||{}
      ).map(([pid,ids])=>[
        pid,
        [...(ids||[])]
      ])
    );
    this.startAugments=new Map(
      Object.entries(
        payload?.startAugments||{}
      )
    );
    this.matchAugments=new Map(
      Object.entries(
        payload?.matchAugments||{}
      ).map(([pid,ids])=>[
        pid,
        [...(ids||[])]
      ])
    );
    this.betweenReady=new Set(
      payload?.betweenReady||[]
    );
    this.betweenSelections=new Map(
      Object.entries(
        payload?.betweenSelections||{}
      ).map(([pid,value])=>[
        pid,
        {...(value||{})}
      ])
    );
    this._betweenPacket=
      payload?.betweenPacket
        ?{...payload.betweenPacket}
        :this._betweenPacket;
    this.resolvedRoundTokens=new Set(
      payload?.resolvedRoundTokens||[]
    );
    this._lastRoundWinnerPid=
      payload?.lastRoundWinnerPid||
      this._lastRoundWinnerPid||null;
    this._lastRoundLoserPids=[
      ...(payload?.lastRoundLoserPids||
        this._lastRoundLoserPids||[])
    ];

    this.members.clear();

    for(const member of payload?.members||[]){
      if(member?.pid){
        this.members.set(
          member.pid,
          member
        );
      }
    }

    this.syncJoinSequence(payload?.joinSequence);

    RoomUI.render();

    if(
      incomingCharacterBanNotice?.type==='rejected'&&
      Number(incomingCharacterBanNotice.id)>
        Number(this._lastCharacterBanNoticeId||0)&&
      (
        !incomingCharacterBanNotice.at||
        Math.abs(
          Date.now()-
          Number(incomingCharacterBanNotice.at)
        )<15000
      )
    ){
      this._lastCharacterBanNoticeId=
        Number(incomingCharacterBanNotice.id)||0;

      RoomUI.setStatus(
        `${this.characterBanMemberName(
          incomingCharacterBanNotice.pid
        )}님이 캐릭터 금지 설정 제안을 거절했습니다.`,
        'err'
      );
    }

    if(OnlineDuelService.active){
      OnlineDuelService.updateRoundScore();
    }
  },
  startBlockReason(){
    if(this.duelPhase!=='room')return '현재는 게임을 시작할 수 없습니다.';
    if(this.characterBanProposal)return '캐릭터 금지 제안의 동의를 기다리는 중입니다.';

    const members=[...this.members.values()].filter(
      member=>member&&member.connected!==false&&member.departed!==true&&!member.spectator
    );
    if(members.length<2)return '상대 플레이어가 참가해야 시작할 수 있습니다.';

    const waiting=members.filter(member=>!member.host&&!member.ready);
    if(waiting.length)return '참가자의 준비 완료를 기다리는 중입니다.';

    if(!MatchModeService.resolve(members)){
      return '현재 팀 구성으로 게임을 시작할 수 없습니다.';
    }

    return '';
  },
  matchEntryTrigger(){
    return {
      type:'trigger',
      event:'room.start-request',
      conditions:[
        {type:'room.members-count-between',min:2,max:4},
        {type:'room.non-host-ready'},
        {type:'room.match-format-valid'}
      ]
    };
  },
  requestGameStart(){
    if(!this.isHost||this.duelPhase!=='room')return false;
    if(this.characterBanProposal){
      RoomUI.setStatus(
        '캐릭터 금지 제안의 동의를 기다리는 중입니다.'
      );
      return false;
    }

    let started=false;
    TriggerDispatchService.execute(
      this.matchEntryTrigger(),
      'room.start-request',
      {room:this,source:this},
      ()=>{
        this.matchMode=
          MatchModeService.resolve(this.members);
        if(!this.matchMode)return;
        this.beginDuelSelect();
        started=true;
      }
    );
    if(started)return true;

    const reason=this.startBlockReason();
    if(reason)RoomUI.setStatus(reason,'err');
    return false;
  },
  resetMatchRuntimeForSelection({
    participants=null
  }={}){
    this.duelSelections.clear();
    this.characterReady.clear();
    this.startAugmentChoices.clear();
    this.startAugments.clear();
    this.matchAugments.clear();
    this.betweenReady.clear();
    this.betweenSelections.clear();
    this.resolvedRoundTokens.clear();
    this.roundScores.clear();

    // 새 매치는 roundToken을 1부터 다시 사용하므로
    // 이전 매치의 레코드 정산 dedupe 캐시도 같은 경계에서 초기화한다.
    CharacterRecordProgressionService.reset();

    this.currentRound=1;
    this.roundToken=0;
    this.currentMapId=null;
    this._betweenPacket=null;

    clearTimeout(this._startCountdownTimer);
    clearTimeout(this._betweenCountdownTimer);
    clearTimeout(this._roundResolveTimer);

    this._startCountdownTimer=0;
    this._betweenCountdownTimer=0;
    this._roundResolveTimer=0;

    const resolvedParticipants=
      Array.isArray(participants)
        ?participants
        :[...this.members.values()]
          .filter(member=>!member.spectator)
          .map(member=>member.pid);

    this.activeMatchPids=
      new Set(resolvedParticipants);
    this.departedMatchPids.clear();
    this.blockedRejoinKeys.clear();

    for(const pid of this.matchPids()){
      this.roundScores.set(pid,0);
      this.matchAugments.set(pid,[]);
      const member=this.members.get(pid);
      if(member){
        member.departed=false;
        member.connected=true;
        member.spectating=false;
      }
    }

    return true;
  },
  beginDuelSelect(){
    if(
      !this.isHost||
      this.duelPhase!=='room'
    )return false;

    const participants=[
      ...this.members.values()
    ]
      .filter(member=>
        member&&
        member.connected!==false&&
        member.departed!==true&&
        !member.spectator
      )
      .map(member=>member.pid);

    this.duelPhase='select';
    this.characterPreviewSelections.clear();
    this.serverMatchId=crypto?.randomUUID?.()||`${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    this.resetMatchRuntimeForSelection({
      participants
    });

    const packet={
      type:'duel-select',
      mode:this.matchMode,
      serverMatchId:this.serverMatchId,
      members:this.matchPids().map(pid=>{
        const member=this.members.get(pid);
        return {
          pid,
          team:member?.team
        };
      })
    };

    this.sendToPeers(packet);
    OnlineDuelService.showSelect(packet);
    this.broadcast();
    return true;
  },
  alliedCharacterPreviewPids(pid){
    const member=this.members.get(pid);
    if(!member?.team)return [];

    return this.matchPids().filter(
      otherPid=>
        otherPid!==pid&&
        this.members.get(otherPid)?.team===
          member.team&&
        this.members.get(otherPid)?.departed!==true
    );
  },
  submitCharacterPreview(characterId){
    const id=String(characterId||'');
    const previewPhase=
      this.duelPhase==='select'||
      this.duelPhase==='between';

    if(
      !previewPhase||
      !this.localPid||
      (
        id&&
        (
          !GAME_DATA.characters[id]||
          this.isCharacterBanned(id)
        )
      )
    )return false;

    // 아군이 없는 1대1/개인 FFA에서는 추가 패킷을 만들지 않는다.
    if(
      !this.alliedCharacterPreviewPids(
        this.localPid
      ).length
    ){
      return false;
    }

    if(this.isHost){
      return this.receiveCharacterPreview(
        this.localPid,
        id
      );
    }

    return NetworkPayloadCodec.send(
      this.hostConnection,
      {
        type:'duel-character-preview',
        characterId:id
      }
    );
  },
  receiveCharacterPreview(pid,characterId){
    const id=String(characterId||'');
    const member=this.members.get(pid);
    const previewPhase=
      this.duelPhase==='select'||
      this.duelPhase==='between';

    if(
      !this.isHost||
      !previewPhase||
      !this.activeMatchPids.has(pid)||
      !member||
      (
        id&&
        (
          !GAME_DATA.characters[id]||
          this.isCharacterBanned(id)
        )
      )
    )return false;

    if(id){
      this.characterPreviewSelections.set(
        pid,
        id
      );
    }else{
      this.characterPreviewSelections.delete(
        pid
      );
    }

    const packet={
      type:'duel-character-preview',
      pid,
      characterId:id,
      team:member.team,
      name:
        PlayerDisplayNameService.resolve(
          pid,
          member.profile
        )
    };

    // 호스트 자신이 같은 팀이면 로컬 UI에도 즉시 적용한다.
    if(
      this.localPid!==pid&&
      this.members.get(this.localPid)?.team===
        member.team
    ){
      OnlineDuelService
        .updateCharacterPreview(packet);
    }

    for(
      const allyPid of
      this.alliedCharacterPreviewPids(pid)
    ){
      if(allyPid===this.localPid)continue;

      const connection=
        this.connections.get(allyPid);
      if(!connection?.open)continue;

      NetworkPayloadCodec.send(
        connection,
        packet
      );
    }

    // 클릭한 본인의 UI에도 닉네임 배지를 같은 단일 렌더 경로로 적용.
    if(pid===this.localPid){
      OnlineDuelService
        .updateCharacterPreview(packet);
    }

    return true;
  },
  submitAugmentPreview(augmentId){
    const id=String(augmentId||'');

    if(
      this.duelPhase!=='between'||
      !this.localPid||
      (
        id&&
        !AugmentDataService.get(id)
      )
    )return false;

    if(
      !this.alliedCharacterPreviewPids(
        this.localPid
      ).length
    ){
      return false;
    }

    if(this.isHost){
      return this.receiveAugmentPreview(
        this.localPid,
        id
      );
    }

    return NetworkPayloadCodec.send(
      this.hostConnection,
      {
        type:'duel-augment-preview',
        augmentId:id||null
      }
    );
  },
  receiveAugmentPreview(pid,augmentId){
    const id=String(augmentId||'');
    const member=this.members.get(pid);

    if(
      !this.isHost||
      this.duelPhase!=='between'||
      !this.activeMatchPids.has(pid)||
      !member||
      (
        id&&
        !AugmentDataService.get(id)
      )
    )return false;

    if(id){
      this.augmentPreviewSelections.set(
        pid,
        id
      );
    }else{
      this.augmentPreviewSelections.delete(
        pid
      );
    }

    const packet={
      type:'duel-augment-preview',
      pid,
      augmentId:id||null,
      team:member.team,
      name:
        PlayerDisplayNameService.resolve(
          pid,
          member.profile
        )
    };

    if(
      this.localPid!==pid&&
      this.members.get(this.localPid)?.team===
        member.team
    ){
      OnlineDuelService
        .updateAugmentPreview(packet);
    }

    for(
      const allyPid of
      this.alliedCharacterPreviewPids(pid)
    ){
      if(allyPid===this.localPid)continue;

      const connection=
        this.connections.get(allyPid);
      if(!connection?.open)continue;

      NetworkPayloadCodec.send(
        connection,
        packet
      );
    }

    if(pid===this.localPid){
      OnlineDuelService
        .updateAugmentPreview(packet);
    }

    return true;
  },
  submitCharacter(characterId){
    const id=String(characterId||'');if(!GAME_DATA.characters[id]||this.isCharacterBanned(id)||!this.localPid)return false;
    if(this.isHost)this.receiveCharacterReady(this.localPid,id);else NetworkPayloadCodec.send(this.hostConnection,{type:'duel-character-ready',characterId:id});
    return true;
  },
  receiveCharacterReady(pid,characterId){
    if(
      !this.isHost||
      this.duelPhase!=='select'||
      !this.activeMatchPids.has(pid)||
      !GAME_DATA.characters[characterId]||
      this.isCharacterBanned(characterId)
    )return false;
    this.duelSelections.set(pid,characterId);
    this.characterPreviewSelections.set(
      pid,
      characterId
    );
    this.characterReady.add(pid);
    const statePacket={type:'duel-character-state',ready:[...this.characterReady],selections:this.selectionObject()};
    this.sendToPeers(statePacket);
    OnlineDuelService.updateCharacterReadyState(statePacket);
    if(
      this.matchPids().length>=2&&
      this.characterReady.size===this.matchPids().length
    )this.beginStartAugments();
    return true;
  },
  beginStartAugments(){
    this.duelPhase='start-augment';
    const choicesByPid={};
    for(const pid of this.matchPids()){
      const choices=this.settings.gameMode==='augment'?MatchChoiceService.augmentOptions(10):[];
      this.startAugmentChoices.set(pid,choices);
      choicesByPid[pid]=choices;
    }
    const packet={
      type:'duel-start-augment',
      gameMode:this.settings.gameMode,
      choicesByPid,
      selections:this.selectionObject(),
    };
    this.sendToPeers(packet);
    OnlineDuelService.showStartAugment(packet);
    if(this.settings.gameMode!=='augment'){
      for(const pid of this.matchPids())this.startAugments.set(pid,null);
      this.beginStartCountdown();
    }
  },
  submitStartAugment(augmentId){
    if(!this.localPid)return false;
    if(this.isHost)this.receiveStartAugment(this.localPid,augmentId);else NetworkPayloadCodec.send(this.hostConnection,{type:'duel-start-augment-ready',augmentId});
    return true;
  },
  receiveStartAugment(pid,augmentId){
    if(
      !this.isHost||
      this.duelPhase!=='start-augment'||
      !this.activeMatchPids.has(pid)
    )return false;

    if(this.settings.gameMode!=='augment'&&augmentId)return false;
    const choices=this.startAugmentChoices.get(pid)||[];
    // 기존 Duels처럼 '선택 없이 시작'도 유효하다.
    if(augmentId&&choices.length&&!choices.includes(augmentId))return false;

    this.startAugments.set(pid,augmentId||null);

    const ready=[...this.startAugments.keys()];
    const selected={};
    for(const memberPid of this.matchPids()){
      selected[memberPid]=this.startAugments.has(memberPid)
        ?this.startAugments.get(memberPid)
        :undefined;
    }

    const statePacket={
      type:'duel-start-augment-state',
      ready,
      selected
    };
    this.sendToPeers(statePacket);
    OnlineDuelService.updateStartAugmentReadyState(statePacket);

    if(this.startAugments.size===this.matchPids().length){
      this.beginStartCountdown();
    }
    return true;
  },
  beginStartCountdown(){
    if(!this.isHost||this.duelPhase!=='start-augment')return false;
    this.duelPhase='start-countdown';

    for(const pid of this.matchPids()){
      const chosen=this.startAugments.get(pid);
      const list=[];
      if(chosen)list.push(chosen);
      this.matchAugments.set(pid,list);
    }

    const selected={};
    for(const pid of this.matchPids())selected[pid]=this.startAugments.get(pid)||null;

    let seconds=MatchReadyCountdownService.seconds(this.matchPids().length);
    const step=()=>{
      if(!this.isHost||this.duelPhase!=='start-countdown')return;

      const packet={
        type:'duel-start-countdown',
        seconds,
        selected,
        selections:this.selectionObject(),
      };
      this.sendToPeers(packet);
      OnlineDuelService.showStartAugmentCountdown(packet);

      if(seconds<=0){
        this.startFirstRound();
        return;
      }

      seconds--;
      clearTimeout(this._startCountdownTimer);
      this._startCountdownTimer=setTimeout(step,1000);
    };
    step();
    return true;
  },
  startFirstRound(){
    if(!this.isHost||this.duelPhase!=='start-countdown')return false;
    clearTimeout(this._startCountdownTimer);
    this._startCountdownTimer=0;

    this.currentMapId=MatchMapService.pick(this.matchMode)||this.currentMapId||'open';
    MatchMapService.apply(this.currentMapId);

    this.currentRound=1;
    this.roundToken=1;
    this.duelPhase='playing';
    this.sendRoundStart('duel-start');
    return true;
  },
  scoreObject(){
    const out={};
    for(const pid of this.matchPids()){
      out[pid]=this.roundScores.get(pid)||0;
    }
    return out;
  },
  augmentObject(){
    const out={};
    for(const pid of this.matchPids()){
      out[pid]=[
        ...(this.matchAugments.get(pid)||[])
      ];
    }
    return out;
  },
  selectionObject(){
    const out={};
    for(const pid of this.matchPids()){
      out[pid]=this.duelSelections.get(pid);
    }
    return out;
  },
  teamObject(){
    const out={};
    for(const pid of this.matchPids()){
      out[pid]=this.members.get(pid)?.team;
    }
    return out;
  },
  sendRoundStart(type='duel-round-start'){
    const matchPids=this.matchPids();
    this.currentSpawnOrder=
      this.matchMode===MatchModeService.FFA
        ?MatchSpawnService.shuffled(matchPids)
        :[...matchPids];

    const packet={
      type,
      mode:this.matchMode,
      selections:this.selectionObject(),
      teams:this.teamObject(),
      augments:this.augmentObject(),
      scores:this.scoreObject(),
      round:this.currentRound,
      roundToken:this.roundToken,
      winsRequired:this.settings.winsRequired,
      mapId:this.currentMapId,
      spawnOrder:[...this.currentSpawnOrder],
      members:matchPids.map(pid=>{
        const member=this.members.get(pid);
        return {
          pid,
          team:member?.team,
          profile:{...(member?.profile||{})}
        };
      })
    };
    this.sendToPeers(packet);OnlineDuelService.startRound(packet);this.broadcast();
  },
  receiveRoundDeath(
    pid,
    roundToken=this.roundToken,
    deathInfo=null
  ){
    if(
      !this.isHost||
      this.duelPhase!=='playing'||
      !this.activeMatchPids.has(pid)
    )return false;

    const rawToken=Number(roundToken);
    if(!Number.isFinite(rawToken)||rawToken<1)return false;
    const token=Math.floor(rawToken);
    if(token!==this.roundToken||this.resolvedRoundTokens.has(token))return false;

    const normalizedDeathInfo={
      ...(deathInfo||{}),
      sourcePid:
        deathInfo?.killerPid||
        (
          pid===this.localPid
            ?deathInfo?.sourcePid
            :null
        )||
        OnlineKillAttributionService.sourceFor(
          pid,
          token
        )||
        OnlineParticipantEntityService.entity(
          pid
        )?.lastDamageSourcePid||
        null
    };

    OnlineDuelService.hostReportDeath(
      pid,
      token,
      normalizedDeathInfo
    );
    return true;
  },
  finalizeRound(
    winnerPid,
    loserPids,
    roundToken=this.roundToken,
    {
      winnerTeamId=null,
      teamVictory=false,
      simultaneousDeath=false,
      placements=null
    }={}
  ){
    if(!this.isHost||this.duelPhase!=='playing')return false;

    const rawToken=Number(roundToken);
    if(!Number.isFinite(rawToken)||rawToken<1)return false;
    const token=Math.floor(rawToken);
    if(token!==this.roundToken||this.resolvedRoundTokens.has(token))return false;

    const losers=Array.isArray(loserPids)
      ?[...new Set(loserPids.filter(pid=>pid&&pid!==winnerPid))]
      :loserPids&&loserPids!==winnerPid
        ?[loserPids]
        :[];

    this.resolvedRoundTokens.add(token);
    this.duelPhase='round-result';

    const resolvedWinnerTeam=
      teamVictory&&winnerTeamId
        ?winnerTeamId
        :null;

    const winnerPids=
      resolvedWinnerTeam
        ?this.matchPids().filter(pid=>
          this.members.get(pid)?.team===
            resolvedWinnerTeam&&
          this.members.get(pid)?.departed!==true
        )
        :[winnerPid];

    RoundResolutionProtectionService
      .protectMany(winnerPids);

    for(const pid of winnerPids){
      this.roundScores.set(
        pid,
        (this.roundScores.get(pid)||0)+1
      );
    }

    const scores=this.scoreObject();
    const targetWins=
      Math.max(
        1,
        Math.min(
          8,
          Number(this.settings.winsRequired)||5
        )
      );
    const matchOver=
      winnerPids.some(pid=>
        (scores[pid]||0)>=targetWins
      );

    this._lastRoundWinnerPid=winnerPid;
    this._lastRoundLoserPids=[...losers];

    const packet={
      type:'duel-round-result',
      authorityPid:this.localPid||'P1',
      mode:this.matchMode,
      winnerPid,
      winnerTeamId:resolvedWinnerTeam,
      teamVictory:
        !!resolvedWinnerTeam,
      loserPid:losers[0]||null,
      loserPids:losers,
      placements:
        placements&&typeof placements==='object'
          ?{...placements}
          :null,
      scores,
      round:this.currentRound,
      roundToken:token,
      matchOver,
      targetWins,
      simultaneousDeath:
        simultaneousDeath===true
    };

    this.sendToPeers(packet);
    OnlineDuelService.handleRoundResult(packet);

    setTimeout(()=>{
      if(
        this.isHost&&
        this.resolvedRoundTokens.has(token)
      ){
        this.sendToPeers(packet);
      }
    },220);

    if(matchOver){
      this.duelPhase='match-result';
      return true;
    }

    clearTimeout(this._roundResolveTimer);
    this._roundResolveTimer=setTimeout(()=>{
      if(
        this.isHost&&
        this.duelPhase==='round-result'
      ){
        this.beginBetween(
          winnerPid,
          losers
        );
      }
    },3000);
    return true;
  },
  beginBetween(winnerPid,loserPids){
    if(!this.isHost||this.duelPhase!=='round-result')return false;

    if(
      !RoomMatchLifecycleService
        .applyNextRoundRoster(this)
    ){
      return false;
    }

    if(!this.members.has(winnerPid)){
      winnerPid=this.matchPids()[0]||null;
    }

    this.duelPhase='between';
    this.betweenReady.clear();
    this.betweenSelections.clear();

    const currentPids=
      new Set(this.matchPids());
    const losers=(
      Array.isArray(loserPids)
        ?[...new Set(loserPids)]
        :loserPids?[loserPids]:[]
    ).filter(pid=>currentPids.has(pid));

    const charCount=
      Math.max(
        0,
        Math.min(
          this.maxChoiceCount,
          Number(this.settings.characterCount)||0
        )
      );
    const augmentMode=this.settings.gameMode==='augment';
    const augCount=
      augmentMode
        ?Math.max(
          0,
          Math.min(
            this.maxChoiceCount,
            Number(this.settings.augmentCount)||0
          )
        )
        :0;

    const charChoices=
      MatchChoiceService.characterOptions(
        charCount,
        {excludeIds:this.bannedCharacters}
      );

    const augChoicesByPid={};
    for(const pid of losers){
      augChoicesByPid[pid]=
        MatchChoiceService.augmentOptions(
          augCount,
          {
            ownedIds:
              this.matchAugments.get(pid)||[]
          }
        );
    }

    // 다음 라운드 맵은 준비 화면 진입 시 한 번만 결정한다.
    // 실제 월드 적용은 기존처럼 between-countdown 시작 시 수행한다.
    this.currentMapId=
      MatchMapService.pick(this.matchMode)||
      this.currentMapId||
      'open';

    const packet={
      type:'duel-between',
      mode:this.matchMode,
      mapId:this.currentMapId,
      winnerPid,
      loserPid:losers[0]||null,
      loserPids:losers,
      charChoices,
      augChoices:
        augChoicesByPid[losers[0]]||[],
      augChoicesByPid,
      gameMode:this.settings.gameMode,
      choiceConfig:{
        characterCount:charCount,
        augmentCount:augCount
      },
      nextRound:this.currentRound+1,
      scores:this.scoreObject(),
      selections:this.selectionObject(),
      augments:this.augmentObject()
    };

    this._betweenPacket=packet;
    this.sendToPeers(packet);
    OnlineDuelService.showBetween(packet);
    return true;
  },
  submitBetween(payload){
    if(!this.localPid||this.duelPhase!=='between')return false;

    const packet={
      type:'duel-between-ready',
      characterId:payload?.characterId||null,
      augmentId:payload?.augmentId||null
    };

    if(this.isHost)this.receiveBetweenReady(this.localPid,packet);
    else NetworkPayloadCodec.send(this.hostConnection,packet);
    return true;
  },
  receiveBetweenReady(pid,payload){
    if(
      !this.isHost||
      this.duelPhase!=='between'||
      !this.activeMatchPids.has(pid)
    )return false;
    if(this.betweenReady.has(pid))return false;

    const between=this._betweenPacket||{};
    const currentCharacter=this.duelSelections.get(pid);
    const requestedCharacter=payload?.characterId||null;
    const augmentMode=this.settings.gameMode==='augment';
    const requestedAugment=
      augmentMode
        ?payload?.augmentId||null
        :null;

    let nextCharacter=currentCharacter;

    if(requestedCharacter){
      if(
        !GAME_DATA.characters[requestedCharacter]||
        this.isCharacterBanned(requestedCharacter)
      )return false;
      if(Array.isArray(between.charChoices)&&between.charChoices.length&&!between.charChoices.includes(requestedCharacter))return false;
      nextCharacter=requestedCharacter;
    }

    const loserPids=Array.isArray(between.loserPids)
      ?between.loserPids
      :between.loserPid
        ?[between.loserPid]
        :[];
    const isLoser=loserPids.includes(pid);
    const augmentChoices=
      between.augChoicesByPid?.[pid]||
      (
        pid===between.loserPid
          ?between.augChoices
          :[]
      )||
      [];

    if(requestedAugment){
      if(!isLoser)return false;
      if(
        Array.isArray(augmentChoices)&&
        augmentChoices.length&&
        !augmentChoices.includes(
          requestedAugment
        )
      )return false;
    }

    // 실제 캐릭터 변경은 다음 라운드 시작 직전에만 반영한다.

    if(
      augmentMode&&
      isLoser&&requestedAugment
    ){
      const list=this.matchAugments.get(pid)||[];
      list.push(requestedAugment);
      this.matchAugments.set(pid,list);
    }

    this.betweenReady.add(pid);
    this.betweenSelections.set(pid,{
      characterId:requestedCharacter||null,
      resolvedCharacterId:nextCharacter,
      augmentId:
        augmentMode&&isLoser
          ?(requestedAugment||null)
          :null
    });

    const selections={};
    for(const [memberPid,value] of this.betweenSelections){
      selections[memberPid]={...value};
    }

    const statePacket={
      type:'duel-between-state',
      ready:[...this.betweenReady],
      selections
    };
    this.sendToPeers(statePacket);
    OnlineDuelService.updateBetweenState(statePacket);

    if(this.betweenReady.size===this.matchPids().length)this.beginBetweenCountdown();
    return true;
  },
  beginBetweenCountdown(){
    if(!this.isHost||this.duelPhase!=='between')return false;
    this.duelPhase='between-countdown';

    this.currentMapId=
      this._betweenPacket?.mapId||
      this.currentMapId||
      MatchMapService.pick(this.matchMode)||
      'open';
    MatchMapService.apply(this.currentMapId);

    let seconds=MatchReadyCountdownService.seconds(this.matchPids().length);
    const step=()=>{
      if(!this.isHost||this.duelPhase!=='between-countdown')return;

      const packet={
        type:'duel-between-countdown',
        seconds,
        mapId:this.currentMapId,
        selections:Object.fromEntries(
          [...this.betweenSelections].map(([pid,value])=>[pid,{...value}])
        )
      };

      this.sendToPeers(packet);
      OnlineDuelService.showBetweenCountdown(packet);

      if(seconds<=0){
        clearTimeout(this._betweenCountdownTimer);
        this._betweenCountdownTimer=0;

        for(const [pid,value] of this.betweenSelections){
          const resolvedCharacterId=value?.resolvedCharacterId;
          if(resolvedCharacterId&&GAME_DATA.characters[resolvedCharacterId]){
            this.duelSelections.set(pid,resolvedCharacterId);
          }
        }

        this.currentRound++;
        this.roundToken++;
        this.duelPhase='playing';
        this.sendRoundStart('duel-round-start');
        return;
      }

      seconds--;
      clearTimeout(this._betweenCountdownTimer);
      this._betweenCountdownTimer=setTimeout(step,1000);
    };

    step();
    return true;
  },
  spectatorRoundPacket(){
    if(
      !this.currentMapId||
      !this.matchPids().length||
      !['playing','round-result'].includes(
        this.duelPhase
      )
    )return null;

    return {
      type:'duel-spectator-start',
      spectatorActivation:true,
      mode:this.matchMode,
      selections:this.selectionObject(),
      teams:this.teamObject(),
      augments:this.augmentObject(),
      scores:this.scoreObject(),
      round:this.currentRound,
      roundToken:this.roundToken,
      winsRequired:this.settings.winsRequired,
      mapId:this.currentMapId,
      spawnOrder:[...this.currentSpawnOrder],
      members:this.matchPids().map(pid=>{
        const member=this.members.get(pid);
        return {
          pid,
          team:member?.team,
          profile:{...(member?.profile||{})}
        };
      })
    };
  },
  sendSpectatorRound(pid){
    if(!this.isHost)return false;

    const member=this.members.get(pid);
    const connection=this.connections.get(pid);
    if(
      !member?.spectator||
      !connection?.open
    )return false;

    const packet=this.spectatorRoundPacket();
    if(!packet)return false;

    NetworkPayloadCodec.send(
      connection,
      packet
    );
    return true;
  },
  sendSpectatorPhase(pid){
    if(!this.isHost)return false;

    const member=this.members.get(pid);
    const connection=this.connections.get(pid);

    if(
      !member?.spectator||
      !connection?.open
    )return false;

    member.spectating=true;
    this.broadcast();

    if(
      ['playing','round-result']
        .includes(this.duelPhase)
    ){
      return this.sendSpectatorRound(pid);
    }

    if(this.duelPhase==='start-augment'){
      const choicesByPid={};

      for(const playerPid of this.matchPids()){
        choicesByPid[playerPid]=[
          ...(this.startAugmentChoices.get(
            playerPid
          )||[])
        ];
      }

      NetworkPayloadCodec.send(
        connection,
        {
          type:'duel-start-augment',
          gameMode:this.settings.gameMode,
          spectatorActivation:true,
          selections:this.selectionObject(),
          choicesByPid
        }
      );

      const selected={};
      for(const playerPid of this.matchPids()){
        if(this.startAugments.has(playerPid)){
          selected[playerPid]=
            this.startAugments.get(playerPid);
        }
      }

      NetworkPayloadCodec.send(
        connection,
        {
          type:'duel-start-augment-state',
          ready:[...this.startAugments.keys()],
          selected
        }
      );
      return true;
    }

    if(
      this.duelPhase==='between'&&
      this._betweenPacket
    ){
      NetworkPayloadCodec.send(
        connection,
        {
          ...this._betweenPacket,
          spectatorActivation:true
        }
      );

      const selections={};
      for(
        const [playerPid,value] of
        this.betweenSelections
      ){
        selections[playerPid]={
          ...value
        };
      }

      NetworkPayloadCodec.send(
        connection,
        {
          type:'duel-between-state',
          ready:[...this.betweenReady],
          selections
        }
      );
      return true;
    }

    return false;
  },
  requestSpectate(){
    const member=this.localMember();
    if(
      !member?.spectator||
      ![
        'playing',
        'round-result',
        'start-augment',
        'between'
      ].includes(this.duelPhase)
    )return false;

    if(this.isHost){
      return false;
    }

    NetworkPayloadCodec.send(
      this.hostConnection,
      {type:'duel-spectate-request'}
    );
    return true;
  },
  abortLocalMatchToRoom(
    reason='플레이어 이탈로 매치가 종료되었습니다.'
  ){
    clearTimeout(this._startCountdownTimer);
    clearTimeout(this._betweenCountdownTimer);
    clearTimeout(this._roundResolveTimer);
    clearTimeout(this._migrationTimer);
    clearTimeout(this._migrationReconnectTimer);

    this._startCountdownTimer=0;
    this._betweenCountdownTimer=0;
    this._roundResolveTimer=0;
    this._migrationTimer=0;
    this._migrationReconnectTimer=0;
    this._pendingMigrationMatchAbort=false;

    const local=this.localMember();

    this.activeMatchPids.clear();
    this.departedMatchPids.clear();
    this.blockedRejoinKeys.clear();
    this.characterReady.clear();
    this.startAugmentChoices.clear();
    this.startAugments.clear();
    this.matchAugments.clear();
    this.betweenReady.clear();
    this.betweenSelections.clear();
    this.resolvedRoundTokens.clear();

    this.matchMode=null;
    this.duelPhase='room';
    this.currentRound=1;
    this.roundToken=0;
    this.currentMapId=null;
    this._betweenPacket=null;
    this._lastRoundWinnerPid=null;
    this._lastRoundLoserPids=[];

    if(local){
      local.ready=false;
      local.spectator=false;
      local.spectating=false;
      local.departed=false;
      local.connected=true;
      this.activeMatchPids.add(local.pid);
    }

    OnlineDuelService.returnToRoomAfterMatch();
    RoomUI.setStatus(reason);
    RoomUI.render();
    return true;
  },
  abortMatchToRoom(
    reason='플레이어 이탈로 매치가 종료되었습니다.'
  ){
    clearTimeout(this._startCountdownTimer);
    clearTimeout(this._betweenCountdownTimer);
    clearTimeout(this._roundResolveTimer);
    this._startCountdownTimer=0;
    this._betweenCountdownTimer=0;
    this._roundResolveTimer=0;

    const connected=
      RoomMemberCleanupService
        .pruneDeparted(this);

    for(const member of connected){
      member.ready=false;
      member.spectator=false;
      member.spectating=false;
      member.departed=false;
    }
    this.activeMatchPids.clear();
    this.departedMatchPids.clear();
    this.blockedRejoinKeys.clear();
    this.duelPhase='room';
    this.matchMode=null;

    this.resetMatchRuntimeForSelection({
      participants:
        connected.map(member=>member.pid)
    });
    this.duelPhase='room';

    this.sendToPeers({
      type:'duel-match-abort',
      reason,
      state:this.snapshot()
    });

    OnlineDuelService.returnToRoomAfterMatch();
    RoomUI.setStatus(reason);
    this.broadcast();
    return true;
  },
  handleHostSideDisconnect(pid){
    if(!pid)return false;

    this.connections.delete(pid);
    return RoomMatchLifecycleService
      .onHostMemberDisconnected(
        this,
        pid
      );
  },
  finishMatchToRoom(){
    if(!this.isHost||this.duelPhase!=='match-result')return false;

    clearTimeout(this._startCountdownTimer);
    clearTimeout(this._betweenCountdownTimer);
    clearTimeout(this._roundResolveTimer);
    this._startCountdownTimer=0;
    this._betweenCountdownTimer=0;
    this._roundResolveTimer=0;

    const connected=
      RoomMemberCleanupService
        .pruneDeparted(this);

    for(const member of connected){
      member.ready=false;
      member.spectator=false;
      member.spectating=false;
      member.departed=false;
    }

    this.resetMatchRuntimeForSelection({
      participants:
        connected.map(member=>member.pid)
    });
    this.blockedRejoinKeys.clear();
    this.duelPhase='room';

    this.sendToPeers({
      type:'duel-return-room'
    });

    OnlineDuelService.returnToRoomAfterMatch();
    this.broadcast();
    return true;
  },
  receiveGameplay(pid,payload){
    if(!payload||typeof payload!=='object')return false;

    if(
      payload.type===
        'duel-character-preview'
    ){
      return this.receiveCharacterPreview(
        pid,
        payload.characterId
      );
    }

    if(
      payload.type===
        'duel-augment-preview'
    ){
      return this.receiveAugmentPreview(
        pid,
        payload.augmentId
      );
    }

    if(payload.type==='room-character-ban-vote'){
      return this.receiveCharacterBanVote(
        pid,
        payload.proposalId,
        payload.agree===true
      );
    }


    if(payload.type==='duel-character-ready'){
      return this.receiveCharacterReady(pid,String(payload.characterId||''));
    }

    if(payload.type==='duel-start-augment-ready'){
      return this.receiveStartAugment(
        pid,
        payload.augmentId===null||payload.augmentId===undefined
          ?null
          :String(payload.augmentId)
      );
    }

    if(payload.type==='duel-between-ready'){
      return this.receiveBetweenReady(pid,payload);
    }

    if(payload.type==='duel-record-update'){
      const member=
        this.members.get(pid);
      if(!member)return false;

      const characterId=
        String(
          payload.characterId||
          ''
        );
      if(
        !ProfileCharacterService.has(
          characterId
        )
      )return false;

      const points=
        Math.max(
          0,
          Math.floor(
            Number(payload.points)||0
          )
        );

      const currentProfile=
        member.profile||{};
      const incomingProfile=
        payload.profile&&
        typeof payload.profile==='object'
          ?payload.profile
          :{};

      member.profile={
        ...currentProfile,
        ...incomingProfile,
        characterRecords:{
          ...(currentProfile.characterRecords||{}),
          ...(incomingProfile.characterRecords||{}),
          [characterId]:points
        },
        characterStats:{
          ...(currentProfile.characterStats||{}),
          ...(incomingProfile.characterStats||{}),
          ...(payload.stats
            ?{
              [characterId]:
                {...payload.stats}
            }
            :{})
        }
      };

      if(
        member.profile.mainCharacterId===
        characterId
      ){
        member.profile.recordPoints=
          points;
      }

      GameEvents.emit(
        'character-record-changed',
        {
          pid,
          characterId,
          points,
          stats:
            payload.stats||null,
          profile:member.profile,
          local:
            pid===this.localPid,
          reason:'network'
        }
      );

      if(this.isHost){
        this.sendToPeers(
          {
            ...payload,
            sourcePid:pid,
            points,
            profile:member.profile
          },
          {excludePid:pid}
        );
      }

      return true;
    }

    if(payload.type==='duel-round-death'){
      return this.receiveRoundDeath(
        pid,
        Number(payload.roundToken),
        payload
      );
    }

    if(ROOM_CHAT_PACKET_TYPES.has(payload.type)){
      OnlineChatService.receive(pid,payload);
      if(this.isHost){
        this.sendToPeers(
          {...payload,sourcePid:pid},
          {excludePid:pid}
        );
      }
      return true;
    }

    if(ROOM_GAMEPLAY_PACKET_TYPES.has(payload.type)){
      OnlineDuelService.receive(pid,payload);
      if(this.isHost){
        this.sendToPeers(
          {...payload,sourcePid:pid},
          {excludePid:pid}
        );
      }
      return true;
    }

    return false;
  },
  generateAvailableCodeCandidate(){
    if(this._hostTriedCodes.size>=9000)return null;

    const start=Math.floor(Math.random()*9000);
    for(let offset=0;offset<9000;offset++){
      const code=String(
        1000+((start+offset)%9000)
      );
      if(this._hostTriedCodes.has(code))continue;

      this._hostTriedCodes.add(code);
      return code;
    }
    return null;
  },
  host(){return RoomConnectionService.start(this,'host')},
  bindHostConnection(connection){
    const token=RoomConnectionService.generation,peer=this.peer;
    let pid=null,closed=false,rejected=false;
    const current=()=>!closed&&RoomConnectionService.valid(this,token,peer)&&this.isHost&&(!pid||this.connections.get(pid)===connection);
    const close=()=>{
      if(!current())return;closed=true;RoomConnectionService.cancel(deadline);
      if(pid)this.handleHostSideDisconnect(pid);
      try{connection.close()}catch(_){}
    };
    const reject=reason=>{
      if(!current())return;
      rejected=true;NetworkPayloadCodec.send(connection,{type:'room-rejected',reason});
      // Deliver the rejection before closing the reliable channel.
      RoomConnectionService.cancel(deadline);
      RoomConnectionService.later(close,250);
    };
    const deadline=RoomConnectionService.later(close,RoomConnectionService.handshakeMs);

    connection.on(
      'data',
      rawPayload=>{
        if(!current()||rejected)return;
        const payload=
          NetworkPayloadCodec.decode(
            rawPayload
          );
        if(
          !payload||
          typeof payload!=='object'
        )return;

        if(payload.type==='hello'){
          if(pid)return;
          if(payload.protocol!==RoomConnectionService.protocol||payload.code!==this.code){reject('version');return}
          if(typeof payload.sessionKey!=='string'||!payload.sessionKey||!payload.profile||typeof payload.profile!=='object'){reject('invalid');return}
          if(payload.migration===true&&(payload.roomInstance!==this.roomInstance||Number(payload.migrationEpoch)!==this._migrationEpoch)){reject('migration');return}
          RoomConnectionService.cancel(deadline);

          const profile=
            payload.profile||{};
          const sessionKey=
            String(payload.sessionKey||'');
          const deviceKey=String(payload.deviceKey||'');
          const identityKey=
            String(
              payload.identityKey||
              RoomIdentityService.profileKey(
                profile,
                sessionKey
              )
            );

          const migration=
            payload.migration===true&&
            Number(payload.migrationEpoch)===
              Number(this._migrationEpoch);
          const desiredPid=
            String(payload.desiredPid||'');

          if(migration&&desiredPid){
            const existing=
              this.members.get(desiredPid);

            if(
              existing&&
              existing.sessionKey===sessionKey&&
              !existing.departed
            ){
              pid=desiredPid;
              existing.connected=true;
              existing.host=false;
              this.connections.set(
                pid,
                connection
              );

              NetworkPayloadCodec.send(
                connection,
                {
                  type:'room-assign',
                  pid,
                  migration:true,
                  state:this.snapshot()
                }
              );

              this.broadcast();
              return;
            }
          }

          if(payload.migration===true){reject('migration');return}
          const duplicate=[...this.members.values()].find(m=>m.sessionKey===sessionKey&&m.connected!==false);
          if(duplicate){reject('duplicate');return}

          const returningDeparted=
            RoomMatchLifecycleService
              .matchActive(this)&&
            this.blockedRejoinKeys.has(
              identityKey
            );

          if(returningDeparted){
            for(
              const [oldPid,oldMember] of
              this.members
            ){
              if(
                oldMember?.identityKey===identityKey&&
                oldMember?.departed===true&&
                oldMember?.connected===false
              ){
                this.members.delete(oldPid);
                break;
              }
            }
          }

          if(this.duelPhase==='room'){
            for(const [stalePid,staleMember] of [...this.members]){
              if(
                staleMember?.host!==true&&
                staleMember?.connected===false&&
                !this.connections.get(stalePid)?.open
              ){
                this.members.delete(stalePid);
                this.characterReady.delete(stalePid);
              }
            }
          }

          pid=this.allocatePid();

          if(!pid){
            rejected=true;NetworkPayloadCodec.send(
              connection,
              {type:'room-full'}
            );
            RoomConnectionService.later(close,250);
            return;
          }

          const spectator=
            this.duelPhase!=='room';
          const rejoinedAsSpectator=
            spectator&&returningDeparted;

          this.connections.set(
            pid,
            connection
          );
          this.members.set(
            pid,
            this.createMember(
              pid,
              profile,
              {
                spectator,
                spectating:false,
                sessionKey,
                deviceKey,
                identityKey
              }
            )
          );

          NetworkPayloadCodec.send(
            connection,
            {
              type:'room-assign',
              pid,
              rejoinedAsSpectator,
              state:this.snapshot()
            }
          );

          this.broadcast();
          return;
        }

        if(!pid)return;

        if(payload.type==='ready'){
          const member=
            this.members.get(pid);
          if(
            member&&
            this.duelPhase==='room'&&
            !member.spectator
          ){
            member.ready=
              !!payload.ready;
            this.broadcast();
          }
          return;
        }

        if(payload.type==='team-request'){
          const member=
            this.members.get(pid);
          if(
            member&&
            this.duelPhase==='room'&&
            !member.spectator&&
            !member.ready&&
            RoomTeams[payload.team]
          ){
            member.team=payload.team;
            this.broadcast();
          }
          return;
        }

        if(
          payload.type===
            'duel-spectate-request'
        ){
          this.sendSpectatorPhase(pid);
          return;
        }

        this.receiveGameplay(pid,payload);
      }
    );

    connection.on('close',close);
    connection.on('error',close);
  },
  showJoin(){
    RoomUI.showJoin();
  },
  helloPacket({
    migration=false,
    desiredPid=null
  }={}){
    const profile=this.profile();
    const sessionKey=
      this.localSessionKey||
      RoomIdentityService.key();

    this.localSessionKey=sessionKey;

    return {
      type:'hello',
      protocol:RoomConnectionService.protocol,
      code:this.code,
      roomInstance:this.roomInstance,
      profile,
      sessionKey,
      deviceKey:RoomIdentityService.deviceKey(),
      identityKey:
        RoomIdentityService.profileKey(
          profile,
          sessionKey
        ),
      migration:!!migration,
      desiredPid:
        desiredPid||null,
      migrationEpoch:
        this._migrationEpoch
    };
  },
  handleClientPacket(payload){
    if(
      !payload||
      typeof payload!=='object'
    )return false;

    const localMember=
      this.localMember();
    const matchPresentationPacket=
      [
        'duel-select',
        'duel-character-preview',
        'duel-augment-preview',
        'duel-character-state',
        'duel-start-augment',
        'duel-start-augment-state',
        'duel-start-countdown',
        'duel-start',
        'duel-round-start',
        'duel-round-result',
        'duel-match-ending',
        'duel-between',
        'duel-between-state',
        'duel-between-countdown'
      ].includes(payload.type);

    if(
      matchPresentationPacket&&
      localMember?.spectator===true&&
      localMember?.spectating!==true&&
      payload.spectatorActivation!==true
    ){
      return true;
    }

    if(payload.type==='room-full'){
      RoomUI.setJoinStatus(
        '방이 가득 찼습니다!',
        'err'
      );
      return true;
    }

    if(
      payload.type===
        'room-rejoin-blocked'
    ){
      RoomUI.setJoinStatus(
        '현재 게임에는 관전자로 다시 참가할 수 있습니다.',
        'err'
      );
      return true;
    }

    if(payload.type==='room-assign'){
      this.localPid=payload.pid;
      this.acceptState(payload.state);

      if(payload.migration){
        const local=this.localMember();
        if(local){
          local.connected=true;
          local.spectating=false;
        }
        clearTimeout(
          this._migrationTimer
        );
        clearTimeout(
          this._migrationReconnectTimer
        );
        this._migrationTimer=0;
        this._migrationReconnectTimer=0;

        if(OnlineDuelService.active){
          OnlineDuelService.applyRosterUpdate({
            mode:this.matchMode,
            activeMatchPids:
              this.matchPids(),
            members:[
              ...this.members.values()
            ],
            scores:this.scoreObject(),
            selections:
              this.selectionObject(),
            augments:
              this.augmentObject()
          });
        }
      }else{
        RoomUI.showRoom();
        if(payload.rejoinedAsSpectator){
          RoomUI.setStatus(
            '현재 게임에는 관전자로 다시 참가했습니다. 관전 버튼을 눌러 입장하세요.'
          );
        }
      }
      return true;
    }

    if(payload.type==='room-team-forced'){
      const member=
        this.members.get(
          String(payload.pid||'')
        );

      if(member&&RoomTeams[payload.toTeam]){
        member.team=payload.toTeam;
      }

      CombatEventToastService.teamChange(
        payload.pid,
        payload.fromTeam,
        payload.toTeam
      );
      RoomUI.render();
      return true;
    }

    if(payload.type==='room-state'){
      this.acceptState(payload);
      return true;
    }

    if(payload.type==='duel-member-left'){
      const pid=String(payload.pid||'');
      const member=this.members.get(pid);
      if(member){
        member.connected=false;
        member.departed=true;
        member.spectating=false;
      }
      this.activeMatchPids.delete(pid);
      OnlineDuelService.eliminateDepartedPlayer(pid);
      OnlineChatService.clearTyping(pid);

      if(payload.chatText){
        OnlineChatService.system(
          payload.chatText
        );
      }

      CombatEventToastService.departure(
        pid,
        payload.name
      );

      if(
        RoomMatchLifecycleService.matchActive(
          this
        )&&
        RoomMatchLifecycleService
          .abortIfInsufficient(this)
      ){
        return true;
      }

      RoomUI.render();
      return true;
    }

    if(payload.type==='duel-roster-update'){
      this.matchMode=
        payload.mode||this.matchMode;
      this.activeMatchPids=
        new Set(
          payload.activeMatchPids||[]
        );

      const active=
        new Set(
          payload.activeMatchPids||[]
        );

      for(
        const [pid,member] of
        this.members
      ){
        if(
          this.departedMatchPids.has(pid)&&
          !active.has(pid)
        ){
          this.members.delete(pid);
        }
      }

      if(Array.isArray(payload.members)){
        for(const data of payload.members){
          if(!data?.pid)continue;
          this.members.set(
            data.pid,
            {
              ...(this.members.get(data.pid)||{}),
              ...data,
              profile:{
                ...(this.members.get(data.pid)?.profile||{}),
                ...(data.profile||{})
              }
            }
          );
        }
      }

      OnlineDuelService.applyRosterUpdate(
        payload
      );
      RoomUI.render();
      return true;
    }

    if(payload.type==='duel-match-abort'){
      if(payload.state){
        this.acceptState(payload.state);
      }
      this.duelPhase='room';
      OnlineDuelService.returnToRoomAfterMatch();
      RoomUI.setStatus(
        payload.reason||
        '플레이어 이탈로 매치가 종료되었습니다.'
      );
      return true;
    }

    if(payload.type==='duel-select'){
      this.duelPhase='select';
      this.serverMatchId=String(payload?.serverMatchId||this.serverMatchId||'');
      this.resetMatchRuntimeForSelection();
      OnlineDuelService.showSelect(payload);
      return true;
    }

    if(
      payload.type===
        'duel-character-preview'
    ){
      const pid=String(payload.pid||'');
      const characterId=
        String(payload.characterId||'');

      if(pid){
        if(
          characterId&&
          GAME_DATA.characters[
            characterId
          ]
        ){
          this.characterPreviewSelections.set(
            pid,
            characterId
          );
        }else if(!characterId){
          this.characterPreviewSelections.delete(
            pid
          );
        }

        OnlineDuelService
          .updateCharacterPreview(payload);
      }
      return true;
    }

    if(
      payload.type===
        'duel-augment-preview'
    ){
      const pid=String(payload.pid||'');
      const augmentId=String(
        payload.augmentId||''
      );

      if(pid){
        if(
          augmentId&&
          AugmentDataService.get(
            augmentId
          )
        ){
          this.augmentPreviewSelections.set(
            pid,
            augmentId
          );
        }else if(!augmentId){
          this.augmentPreviewSelections.delete(
            pid
          );
        }

        OnlineDuelService
          .updateAugmentPreview(payload);
      }
      return true;
    }

    if(payload.type==='duel-character-state'){
      this.characterReady=new Set(
        payload.ready||[]
      );
      for(
        const [pid,characterId] of
        Object.entries(payload.selections||{})
      ){
        if(characterId){
          this.duelSelections.set(
            pid,
            characterId
          );
        }
      }
      OnlineDuelService
        .updateCharacterReadyState(payload);
      return true;
    }

    if(payload.type==='duel-start-augment'){
      this.duelPhase='start-augment';

      if(
        payload.selections&&
        typeof payload.selections==='object'
      ){
        for(
          const [pid,charId] of
          Object.entries(payload.selections)
        ){
          if(
            pid&&
            GAME_DATA.characters[charId]
          ){
            this.duelSelections.set(
              pid,
              charId
            );
          }
        }
      }

      OnlineDuelService
        .showStartAugment(payload);
      return true;
    }

    if(
      payload.type===
        'duel-start-augment-state'
    ){
      this.startAugments=new Map(
        Object.entries(
          payload.selected||{}
        )
      );
      OnlineDuelService
        .updateStartAugmentReadyState(
          payload
        );
      return true;
    }

    if(
      payload.type===
        'duel-start-countdown'
    ){
      this.duelPhase='start-countdown';
      if(payload.selections&&typeof payload.selections==='object'){
        for(const [pid,charId] of Object.entries(payload.selections)){
          if(pid&&GAME_DATA.characters[charId]){
            this.duelSelections.set(pid,charId);
          }
        }
      }
      OnlineDuelService
        .showStartAugmentCountdown(
          payload
        );
      return true;
    }

    if(
      payload.type==='duel-start'||
      payload.type===
        'duel-round-start'||
      payload.type===
        'duel-spectator-start'
    ){
      this.duelPhase='playing';
      this.currentRound=Math.max(
        1,
        Number(payload.round)||
          this.currentRound||1
      );
      this.roundToken=Math.max(
        1,
        Number(payload.roundToken)||
          this.roundToken||1
      );
      this.currentMapId=
        payload.mapId||
        this.currentMapId||null;
      this.roundScores=new Map(
        Object.entries(
          payload.scores||{}
        ).map(([pid,value])=>[
          pid,
          Number(value)||0
        ])
      );
      if(payload.mode){
        this.matchMode=payload.mode;
      }
      OnlineDuelService.startRound(
        payload
      );
      return true;
    }

    if(
      payload.type===
        'duel-death-confirmed'
    ){
      OnlineDuelService
        .receiveConfirmedDeath(payload);
      return true;
    }

    if(
      payload.type===
        'duel-round-result'
    ){
      this.duelPhase=
        payload.matchOver
          ?'match-result'
          :'round-result';
      this.roundToken=
        Number(payload.roundToken)||
        this.roundToken;
      this.currentRound=
        Number(payload.round)||
        this.currentRound;
      this._lastRoundWinnerPid=
        payload.winnerPid||null;
      this._lastRoundLoserPids=[
        ...(payload.loserPids||[])
      ];
      this.roundScores=new Map(
        Object.entries(
          payload.scores||{}
        ).map(([pid,value])=>[
          pid,
          Number(value)||0
        ])
      );
      OnlineDuelService
        .handleRoundResult(payload);
      return true;
    }

    if(payload.type==='duel-between'){
      this.duelPhase='between';
      this.currentMapId=
        payload.mapId||
        this.currentMapId||null;
      this._betweenPacket={...payload};
      OnlineDuelService.showBetween(
        payload
      );
      return true;
    }

    if(
      payload.type===
        'duel-between-state'
    ){
      this.betweenReady=new Set(
        payload.ready||[]
      );
      this.betweenSelections=new Map(
        Object.entries(
          payload.selections||{}
        ).map(([pid,value])=>[
          pid,
          {...(value||{})}
        ])
      );
      OnlineDuelService
        .updateBetweenState(payload);
      return true;
    }

    if(
      payload.type===
        'duel-between-countdown'
    ){
      this.duelPhase=
        'between-countdown';
      OnlineDuelService
        .showBetweenCountdown(payload);
      return true;
    }

    if(
      payload.type===
        'duel-match-ending'
    ){
      this.duelPhase='match-result';
      OnlineDuelService
        .showMatchEnding();
      return true;
    }

    if(payload.type==='duel-return-room'){
      this.duelPhase='room';

      const connected=
        RoomMemberCleanupService
          .pruneDeparted(this);

      for(const member of connected){
        member.ready=false;
        member.spectator=false;
        member.spectating=false;
        member.departed=false;
      }

      this.resetMatchRuntimeForSelection({
        participants:
          connected.map(member=>member.pid)
      });
      this.blockedRejoinKeys.clear();
      OnlineDuelService
        .returnToRoomAfterMatch();
      return true;
    }

    if(
      ROOM_GAMEPLAY_PACKET_TYPES.has(payload.type)||
      ROOM_CHAT_PACKET_TYPES.has(payload.type)
    ){
      this.receiveGameplay(
        String(
          payload.sourcePid||
          [...this.members.values()].find(member=>member.host)?.pid||
          this.localPid||
          'P1'
        ),
        payload
      );
      return true;
    }

    if(payload.type==='room-closed'){
      OnlineDuelService.stop({
        returnToRoom:false
      });
      this.reset();
      RoomUI.showLobby(
        '방이 종료되었습니다.'
      );
      return true;
    }

    return false;
  },
  attachClientConnection(connection,{migration=false,desiredPid=null,onFailure=null,onAccepted=null}={}){
    const token=RoomConnectionService.generation,peer=this.peer;
    const previous=this.hostConnection;this.hostConnection=connection;
    try{previous?.close()}catch(_){}
    let assigned=false,finished=false;
    const current=()=>!finished&&RoomConnectionService.valid(this,token,peer)&&this.hostConnection===connection;
    const fail=message=>{
      if(!current())return;finished=true;RoomConnectionService.cancel(deadline);this.hostConnection=null;
      try{connection.close()}catch(_){}
      if(onFailure)onFailure();else RoomConnectionService.fail(this,token,message||'방 연결이 종료되었습니다.','join');
    };
    const deadline=RoomConnectionService.later(()=>fail('방 연결 시간이 초과되었습니다.'),RoomConnectionService.handshakeMs);
    connection.on('open',()=>{if(current())NetworkPayloadCodec.send(connection,this.helloPacket({migration,desiredPid}))});
    connection.on('data',raw=>{
      if(!current())return;
      const payload=NetworkPayloadCodec.decode(raw);if(!payload||typeof payload!=='object')return;
      if(payload.type==='room-rejected'||payload.type==='room-full'){
        const reasons={version:'게임 버전이 다릅니다. 모두 같은 DUELS 3.0 파일로 실행해주세요.',migration:'호스트 승계 정보가 일치하지 않습니다.',duplicate:'이미 참가 중인 연결입니다.',invalid:'잘못된 참가 정보입니다.'};
        fail(payload.type==='room-full'?'방이 가득 찼습니다.':reasons[payload.reason]||'입장이 거절되었습니다.');return;
      }
      if(payload.type==='room-assign'){
        const state=payload.state;
        if(assigned||!state||state.protocol!==RoomConnectionService.protocol||state.code!==this.code||!state.roomInstance||!Array.isArray(state.members)||!state.members.some(m=>m.pid===payload.pid&&m.sessionKey===this.localSessionKey))return;
        if(migration&&(payload.migration!==true||payload.pid!==desiredPid||state.roomInstance!==this.roomInstance||state.migrationEpoch!==this._migrationEpoch))return;
        assigned=true;RoomConnectionService.cancel(deadline);this.roomInstance=state.roomInstance;
        RoomConnectionService.state='connected';if(onAccepted)onAccepted();this.handleClientPacket(payload);return;
      }
      if(!assigned)return;
      if(payload.type==='room-state'&&(payload.roomInstance!==this.roomInstance||payload.protocol!==RoomConnectionService.protocol))return;
      this.handleClientPacket(payload);
    });
    const disconnected=()=>{
      if(!current())return;
      if(!assigned){fail();return}
      finished=true;RoomConnectionService.cancel(deadline);this.hostConnection=null;
      try{connection.close()}catch(_){}
      this.beginHostMigration();
    };
    connection.on('close',disconnected);connection.on('error',disconnected);return true;
  },
  join(code){
    const normalized=String(code||'').trim();
    if(!/^[1-9]\d{3}$/.test(normalized)){RoomUI.setJoinStatus('1000~9999의 4자리 방 코드를 입력해주세요.','err');return false}
    return RoomConnectionService.start(this,'join',normalized);
  },
  migrationCandidates(oldHostPid){
    return [
      ...this.members.values()
    ]
      .filter(member=>
        member.pid!==oldHostPid&&
        member.connected!==false&&
        !member.departed
      )
      .sort((a,b)=>
        Number(a.spectator===true)-
          Number(b.spectator===true)||
        (Number(a.joinOrder)||0)-
          (Number(b.joinOrder)||0)||
        a.pid.localeCompare(b.pid)
      );
  },
  beginHostMigration(){
    if(this.isHost||!this.localPid)return false;

    const oldHost=[
      ...this.members.values()
    ].find(member=>member.host);

    if(!oldHost)return false;

    const oldHostName=
      PlayerDisplayNameService.resolve(
        oldHost.pid,
        oldHost.profile
      );

    oldHost.host=false;
    oldHost.connected=false;
    oldHost.spectating=false;

    OnlineChatService.system(
      `${oldHostName}님이 게임을 나갔습니다.`
    );
    CombatEventToastService.departure(
      oldHost.pid,
      oldHostName
    );

    const oldHostWasPlaying=
      RoomMatchLifecycleService.matchActive(
        this
      )&&
      this.activeMatchPids.has(
        oldHost.pid
      );

    if(oldHostWasPlaying){
      oldHost.departed=true;
      this.departedMatchPids.add(
        oldHost.pid
      );
      this.activeMatchPids.delete(
        oldHost.pid
      );
      if(oldHost.identityKey){
        this.blockedRejoinKeys.add(
          oldHost.identityKey
        );
      }
      OnlineDuelService.eliminateDepartedPlayer(
        oldHost.pid
      );
    }

    // 방 대기 상태의 stale activeMatchPids 때문에 이전 호스트가
    // 프로필 카드로 남지 않도록 phase와 무관하게 멤버 목록에서는 즉시 제거한다.
    this.members.delete(oldHost.pid);
    this.characterReady.delete(oldHost.pid);
    this.startAugmentChoices.delete(oldHost.pid);
    this.startAugments.delete(oldHost.pid);
    this.betweenReady.delete(oldHost.pid);
    this.betweenSelections.delete(oldHost.pid);

    // 호스트 이탈 뒤의 최종 생존자 판정은 새 호스트 권위가 확보된 뒤 수행한다.
    // 여기서 로컬 매치를 먼저 종료하면 새 호스트 재평가 경로 자체가 사라질 수 있다.
    this._pendingMigrationMatchAbort=false;

    this._migrationEpoch++;
    const epoch=this._migrationEpoch;
    const candidates=
      this.migrationCandidates(
        oldHost.pid
      );
    const rank=
      candidates.findIndex(
        member=>
          member.pid===this.localPid
      );

    if(rank<0){
      OnlineDuelService.stop({
        returnToRoom:false
      });
      RoomUI.showLobby(
        '방 연결이 종료되었습니다.'
      );
      return false;
    }

    RoomConnectionService.migrate(this,rank,epoch);
    return true;
  },
  resumeDelegatedHostPhase(){
    if(!this.isHost)return false;

    const pids=this.matchPids();
    if(
      RoomMatchLifecycleService
        .reevaluateRemainingPlayers(
          this
        )
    ){
      return true;
    }

    if(this.duelPhase==='select'){
      const packet={
        type:'duel-character-state',
        ready:[...this.characterReady],
        selections:this.selectionObject()
      };
      this.sendToPeers(packet);
      OnlineDuelService
        .updateCharacterReadyState(packet);

      if(
        this.characterReady.size===pids.length
      ){
        this.beginStartAugments();
      }
      return true;
    }

    if(
      this.duelPhase==='start-augment'||
      this.duelPhase==='start-countdown'
    ){
      if(this.duelPhase==='start-countdown'){
        this.duelPhase='start-augment';
      }

      const selected=Object.fromEntries(
        this.startAugments
      );
      const state={
        type:'duel-start-augment-state',
        ready:[...this.startAugments.keys()],
        selected
      };
      this.sendToPeers(state);
      OnlineDuelService
        .updateStartAugmentReadyState(state);

      if(
        this.startAugments.size===pids.length
      ){
        this.beginStartCountdown();
      }
      return true;
    }

    if(this.duelPhase==='playing'){
      OnlineDuelService.active=true;
      OnlineDuelService.roundResolving=false;
      OnlineDuelService.evaluateRoundSurvivors(
        this.roundToken
      );
      return true;
    }

    if(this.duelPhase==='round-result'){
      clearTimeout(this._roundResolveTimer);
      this._roundResolveTimer=setTimeout(
        ()=>{
          if(
            this.isHost&&
            this.duelPhase==='round-result'
          ){
            this.beginBetween(
              this._lastRoundWinnerPid,
              this._lastRoundLoserPids
            );
          }
        },
        3000
      );
      return true;
    }

    if(
      this.duelPhase==='between'||
      this.duelPhase==='between-countdown'
    ){
      this.duelPhase='between';
      const selections=Object.fromEntries(
        this.betweenSelections
      );
      const state={
        type:'duel-between-state',
        ready:[...this.betweenReady],
        selections
      };
      this.sendToPeers(state);
      OnlineDuelService.updateBetweenState(
        state
      );

      if(
        this.betweenReady.size===pids.length
      ){
        this.beginBetweenCountdown();
      }
      return true;
    }

    if(this.duelPhase==='match-result'){
      clearTimeout(this._roundResolveTimer);
      this._roundResolveTimer=setTimeout(
        ()=>{
          if(this.isHost){
            this.finishMatchToRoom();
          }
        },
        3000
      );
      return true;
    }

    return true;
  },
  setReady(value){const m=this.localMember();if(!m||m.host||m.spectator||this.duelPhase!=='room')return false;NetworkPayloadCodec.send(
      this.hostConnection,
      {type:'ready',ready:!!value}
    );return true},
  setTeam(pid,team){
    if(
      !RoomTeams[team]||
      this.duelPhase!=='room'
    )return false;

    const member=this.members.get(pid);
    if(
      !member||
      member.spectator===true
    )return false;

    if(
      member.ready===true&&
      !this.isHost
    )return false;

    if(this.isHost){
      const previousTeam=member.team;

      if(previousTeam===team){
        return true;
      }

      member.team=team;

      if(pid!==this.localPid){
        const connection=
          this.connections.get(pid);

        if(connection?.open){
          NetworkPayloadCodec.send(
            connection,
            {
              type:'room-team-forced',
              pid,
              fromTeam:previousTeam,
              toTeam:team
            }
          );
        }
      }

      this.broadcast();
      return true;
    }

    if(
      pid!==this.localPid||
      !this.hostConnection?.open
    )return false;

    member.team=team;
    RoomUI.render();
    NetworkPayloadCodec.send(
      this.hostConnection,
      {type:'team-request',team}
    );
    return true;
  },
  setSettings(next){
    if(!this.isHost||this.duelPhase!=='room')return false;
    const nextMode=(next.gameMode??this.settings.gameMode)==='augment'?'augment':'normal';
    if(nextMode!==this.settings.gameMode){
      this.saveRoomSettings();
      this.settings=this.savedRoomSettings(nextMode);
    }
    this.settings={
      gameMode:nextMode,
      winsRequired:Math.max(1,Math.min(8,Number(next.winsRequired??next.total??this.settings.winsRequired)||this.settings.winsRequired)),
      characterCount:Math.max(0,Math.min(this.maxChoiceCount,Number(next.characterCount??this.settings.characterCount)||0)),
      augmentCount:Math.max(0,Math.min(this.maxChoiceCount,Number(next.augmentCount??this.settings.augmentCount)||0))
    };
    this.saveRoomSettings();
    this.broadcast();
    return true;
  },
  leave({silent=false}={}){
    if(!silent){
      CharacterRecordProgressionService
        .applyDeparturePenalty();
    }

    OnlineDuelService.stop({
      returnToRoom:false
    });

    const canDelegate=
      this.isHost&&
      [...this.members.values()].some(
        member=>
          member.pid!==this.localPid&&
          member.connected!==false&&
          !member.departed
      );

    if(
      this.isHost&&
      !silent&&
      !canDelegate
    ){
      for(
        const connection of
        this.connections.values()
      ){
        NetworkPayloadCodec.send(
          connection,
          {type:'room-closed'}
        );
      }
    }

    // 다른 플레이어가 남아 있으면 room-closed를 보내지 않는다.
    // 연결 close 자체가 모든 클라이언트의 동일 host migration 경로를 시작시킨다.
    this.reset();
    return true;
  }
};