



const MatchResultSubmissionService=Object.freeze({
  queues:new Map(),
  settlements:new Map(),
  sleep(ms){
    return new Promise(resolve=>setTimeout(resolve,ms));
  },
  accountUid(profile){
    if(profile?.isGuest===true)return '';
    return String(profile?.accountId||'').trim();
  },
  participantSnapshot(){
    const participants=[];
    for(const pid of RoomService.matchPids()){
      const member=RoomService.members.get(pid);
      if(!member||member.spectator===true)continue;
      const uid=this.accountUid(
        pid===RoomService.localPid
          ?PlayerProfileService.snapshot(AccountState.current)
          :member.profile
      );
      if(!uid)return null;
      const characterId=
        OnlineParticipantEntityService.entity(pid)?.character?.id||
        RoomService.duelSelections.get(pid)||
        null;
      if(!characterId)return null;
      participants.push({
        uid,
        pid:String(pid),
        team:String(member.team||''),
        characterId:String(characterId)
      });
    }
    participants.sort((a,b)=>a.pid.localeCompare(b.pid));
    return participants;
  },
  payload(roundPayload){
    const account=AccountState.current;
    if(!account||account.isGuest||account.firebaseAccount!==true)return null;
    const matchId=String(RoomService.serverMatchId||'').trim();
    const roundToken=Math.max(1,Math.floor(Number(roundPayload?.roundToken)||Number(RoomService.roundToken)||1));
    const participants=this.participantSnapshot();
    if(!matchId||!participants||participants.length<2)return null;
    const placements={};
    if(roundPayload?.placements&&typeof roundPayload.placements==='object'){
      for(const participant of participants){
        const value=Math.floor(Number(roundPayload.placements[participant.pid])||0);
        if(value>0)placements[participant.pid]=value;
      }
    }
    return {
      settlementId:`${matchId}:${roundToken}`,
      matchId,
      roundToken,
      mode:String(roundPayload?.mode||RoomService.matchMode||MatchModeService.DUEL),
      participants,
      result:{
        winnerPid:String(roundPayload?.winnerPid||''),
        winnerTeamId:String(roundPayload?.winnerTeamId||''),
        loserPids:[...(roundPayload?.loserPids||[])].map(String).sort(),
        placements,
        ffaTeamCount:Math.max(0,Math.floor(Number(roundPayload?.ffaTeamCount)||0))
      }
    };
  },
  async request(path,body,{forceRefresh=false}={}){
    const fb=globalThis.DuelsFirebase;
    const user=fb?.currentUser?.();
    if(!fb||!user)throw new Error('Firebase 로그인이 필요합니다.');
    const firebaseIdToken=await user.getIdToken(forceRefresh);
    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),25000);
    let response;
    let data=null;
    try{
      response=await fetch(`${DUELS3_CONFIG.accountApiBase}${path}`,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({...body,firebaseIdToken}),
        signal:controller.signal
      });
      try{data=await response.json();}catch{}
    }finally{
      clearTimeout(timeout);
    }
    if(!response.ok||!data?.ok){
      const error=new Error(data?.message||data?.error||`경기 결과 서버 요청 실패 (${response.status})`);
      error.code=data?.error||'';
      error.status=response.status;
      throw error;
    }
    return data;
  },
  async submitRound(roundPayload,submission=this.payload(roundPayload)){
    if(!submission)throw new Error('경기 결과 제출 정보를 만들 수 없습니다.');
    const accountId=String(AccountState.current?.accountId||'');
    const uid=String(globalThis.DuelsFirebase?.currentUser?.()?.uid||'');
    // 방/캐릭터가 변경되어도 같은 경기 ID와 당시 참가자로 재제출한다.
    const snapshot=JSON.parse(JSON.stringify(submission));
    const settlementKey=`${accountId}:${snapshot.settlementId}`;
    const existing=this.settlements.get(settlementKey);
    if(existing)return existing;
    const job=(async()=>{
      let refreshToken=false;
      for(let attempt=0;;attempt+=1){
        if(String(AccountState.current?.accountId||'')!==accountId||
           String(globalThis.DuelsFirebase?.currentUser?.()?.uid||'')!==uid){
          const error=new Error('정산 중 로그인 계정이 변경되었습니다.');
          error.code='account-changed';
          throw error;
        }
        try{
          // Serialize HTTP attempts, not an entire settlement's indefinite retry loop.
          // An unconfirmed earlier round must not prevent later participants/results
          // from ever reaching the server.
          const previous=this.queues.get(accountId)||Promise.resolve();
          const attemptJob=previous.catch(()=>{}).then(()=>
            this.request('/match/submit',{submission:snapshot},{forceRefresh:refreshToken})
          );
          this.queues.set(accountId,attemptJob);
          let latest;
          try{latest=await attemptJob;}finally{
            if(this.queues.get(accountId)===attemptJob)this.queues.delete(accountId);
          }
          refreshToken=false;
          if(latest?.conflict===true){
            const error=new Error('참가자들이 제출한 경기 결과가 서로 일치하지 않습니다.');
            error.code='result-conflict';
            throw error;
          }
          if(latest?.finalized===true&&latest.progress&&latest.result)return latest;
        }catch(error){
          const status=Number(error?.status)||0;
          if(error?.code==='result-conflict')throw error;
          if(status===401&&!refreshToken){
            refreshToken=true;
          }else if(status>=400&&status<500&&![408,425,429].includes(status)){
            throw error;
          }
          // 통신 실패/서버 지연은 정산 거절이 아니다. 같은 ID로 계속 재시도한다.
        }
        await this.sleep(attempt<8?500:Math.min(30000,1000*Math.pow(2,Math.min(5,attempt-8))));
      }
    })();
    this.settlements.set(settlementKey,job);
    try{return await job;}finally{
      if(this.settlements.get(settlementKey)===job)this.settlements.delete(settlementKey);
    }
  },
  async submitDeparture({characterId,mode,eventId}={}){
    return this.request('/match/departure/self',{
      characterId:String(characterId||''),
      mode:String(mode||MatchModeService.DUEL),
      eventId:String(eventId||'')
    });
  }
});