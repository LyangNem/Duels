


const CharacterRecordProgressionService={
  saveQueue:Promise.resolve(),
  resultByRound:new Map(),
  matchGeneration:0,
  departurePenaltyGeneration:-1,
  authoritativeProgress:null,

  settlementEligibility(){
    const local=RoomService.localMember();
    if(
      !local||
      AccountState.current?.isGuest||
      local.spectator===true
    )return {allowed:false,reason:'ineligible'};

    const accountIds=new Set();
    const deviceKeys=new Set();
    for(const pid of RoomService.matchPids()){
      const member=RoomService.members.get(pid);
      if(!member)continue;

      const accountId=AccountService.normalizeId(
        member.profile?.accountId||
        (
          pid===RoomService.localPid
            ?AccountState.current?.accountId
            :''
        )
      );
      if(accountId){
        if(accountIds.has(accountId)){
          return {allowed:false,reason:'same-account'};
        }
        accountIds.add(accountId);
      }

      const deviceKey=String(
        member.deviceKey||
        (
          pid===RoomService.localPid
            ?RoomIdentityService.deviceKey()
            :''
        )||
        ''
      );
      if(deviceKey){
        if(deviceKeys.has(deviceKey)){
          return {allowed:false,reason:'same-device'};
        }
        deviceKeys.add(deviceKey);
      }
    }
    return {allowed:true,reason:'ok'};
  },
  modeValues(mode,tierId,teamSize=1){
    const lower=
      tierId==='none'||
      tierId==='bronze'||
      tierId==='silver'||
      tierId==='gold';

    if(lower)return {win:100,loss:50};
    if(tierId==='diamond')return {win:50,loss:0};
    if(tierId==='platinum')return {win:40,loss:0};
    return {win:30,loss:0};
  },

  teamSize(pid){
    const member=
      RoomService.members.get(pid);
    const teamId=member?.team;
    if(!teamId)return 1;

    return Math.max(
      1,
      RoomService.matchPids().filter(
        memberPid=>
          RoomService.members.get(
            memberPid
          )?.team===teamId
      ).length
    );
  },

  opposingTeamSize(pid){
    const member=RoomService.members.get(pid);
    const ownTeam=member?.team;
    if(!ownTeam)return 1;

    const counts=new Map();
    for(const memberPid of RoomService.matchPids()){
      const teamId=RoomService.members.get(memberPid)?.team;
      if(!teamId||teamId===ownTeam)continue;
      counts.set(
        teamId,
        (counts.get(teamId)||0)+1
      );
    }

    let largest=1;
    for(const count of counts.values()){
      largest=Math.max(largest,count);
    }
    return largest;
  },

  teamWinMultiplier(pid){
    const ownSize=this.teamSize(pid);
    const opposingSize=this.opposingTeamSize(pid);

    if(opposingSize===1&&(ownSize===2||ownSize===3)){
      return 1/ownSize;
    }
    if(ownSize===1&&opposingSize===2)return 1.5;
    if(ownSize===1&&opposingSize===3)return 2;
    return 1;
  },

  won(payload,pid){
    if(
      payload?.teamVictory&&
      payload?.winnerTeamId
    ){
      return (
        RoomService.members.get(pid)?.team===
        payload.winnerTeamId
      );
    }
    return String(payload?.winnerPid||'')===
      String(pid||'');
  },

  placement(payload,pid){
    const value=
      Number(
        payload?.placements?.[
          String(pid||'')
        ]
      );

    return Number.isFinite(value)&&value>=1
      ?Math.floor(value)
      :null;
  },

  ffaTeamCount(payload){
    const explicit=Math.floor(Number(payload?.ffaTeamCount)||0);
    if(explicit>0)return explicit;

    let maximum=0;
    for(const value of Object.values(payload?.placements||{})){
      const placement=Math.floor(Number(value)||0);
      if(placement>maximum)maximum=placement;
    }
    return Math.max(1,maximum);
  },
  ffaOutcome(payload,pid){
    const placement=this.placement(payload,pid);
    if(placement===null)return null;

    const teamCount=this.ffaTeamCount(payload);
    if(placement===1)return 'win';
    if(placement===teamCount)return 'loss';
    return 'neutral';
  },
  ffaScoreMultiplier(payload,pid){
    const placement=this.placement(payload,pid);
    const teamCount=this.ffaTeamCount(payload);
    if(placement===null)return {kind:'neutral',multiplier:0};
    if(placement>=teamCount)return {kind:'loss',multiplier:1};

    if(placement===1){
      const imbalance=this.teamWinMultiplier(pid);
      if(imbalance!==1){
        return {kind:'win',multiplier:imbalance};
      }
    }

    if(teamCount>=4){
      if(placement===1)return {kind:'win',multiplier:4};
      if(placement===2)return {kind:'neutral',multiplier:2};
      return {kind:'neutral',multiplier:1};
    }
    if(teamCount===3){
      if(placement===1)return {kind:'win',multiplier:3};
      return {kind:'neutral',multiplier:1};
    }

    if(placement===1){
      return {kind:'win',multiplier:this.teamWinMultiplier(pid)};
    }
    return {kind:'loss',multiplier:1};
  },

  characterId(pid){
    const entity=
      OnlineParticipantEntityService.entity(
        pid
      );
    return (
      entity?.character?.id||
      RoomService.duelSelections.get(pid)||
      null
    );
  },

  captureAuthoritativeProgress(
    account=AccountState.current
  ){
    if(
      this.authoritativeProgress||
      !account
    ){
      return this.authoritativeProgress;
    }

    this.authoritativeProgress={
      characterRecords:{
        ...(account.characterRecords||{})
      },
      characterStats:{
        ...(account.characterStats||{})
      }
    };

    return this.authoritativeProgress;
  },

  setAuthoritativeProgress(progress){
    if(!progress)return null;

    this.authoritativeProgress={
      characterRecords:{
        ...(progress.characterRecords||{})
      },
      characterStats:{
        ...(progress.characterStats||{})
      }
    };

    // Cache only server-confirmed progress, never the optimistic projection.
    const account=AccountState.current;
    const user=globalThis.DuelsFirebase?.currentUser?.();
    if(account?.firebaseAccount===true&&user&&account.firebaseUid===user.uid&&
      typeof FirebaseAccountCacheService!=='undefined'){
      FirebaseAccountCacheService.save({
        ...account,
        duelsAccountReady:true,
        characterRecords:this.authoritativeProgress.characterRecords,
        characterStats:this.authoritativeProgress.characterStats
      },user);
    }
    return this.authoritativeProgress;
  },

  syncLocalRecordPresentation(
    characterIds=[],
    reason='round-result-optimistic',
    broadcast=true
  ){
    const account=
      AccountState.current;

    if(
      !account||
      account.isGuest
    ){
      return false;
    }

    const localMember=
      RoomService.localMember();

    const profileSnapshot=
      PlayerProfileService.snapshot(
        account
      );

    if(localMember){
      localMember.profile=
        profileSnapshot;
    }

    const uniqueIds=[
      ...new Set(
        (characterIds||[])
          .map(id=>String(id||''))
          .filter(Boolean)
      )
    ];

    for(const characterId of uniqueIds){
      GameEvents.emit(
        'character-record-changed',
        {
          pid:
            RoomService.localPid,
          characterId,
          points:
            CharacterRecordService.points(
              characterId,
              account
            ),
          stats:
            account
              .characterStats
              ?.[characterId]||
            null,
          profile:
            profileSnapshot,
          local:true,
          reason
        }
      );
    }

    if(
      broadcast&&
      Training.sessionMode==='online'&&
      OnlineDuelService.active&&
      uniqueIds.length
    ){
      for(const characterId of uniqueIds){
        RoomService.sendGameplay({
          type:'duel-record-update',
          roundToken:
            OnlineDuelService.roundToken,
          characterId,
          points:
            CharacterRecordService.points(
              characterId,
              account
            ),
          stats:
            account
              .characterStats
              ?.[characterId]||
            null,
          profile:
            profileSnapshot,
          provisional:
            reason.includes(
              'optimistic'
            )
        });
      }
    }

    return true;
  },

  applyOptimisticRecord(
    result,
    {
      broadcast=true,
      reason='round-result-optimistic'
    }={}
  ){
    const account=
      AccountState.current;

    if(
      !account||
      !result?.characterId
    ){
      return false;
    }

    const characterId=
      String(result.characterId);

    account.characterRecords={
      ...(account.characterRecords||{}),
      [characterId]:
        Math.max(
          0,
          Math.floor(
            Number(result.after)||0
          )
        )
    };

    account.recordSettlementPending=true;

    AccountState.current=
      account;

    this.syncLocalRecordPresentation(
      [characterId],
      reason,
      broadcast
    );

    return true;
  },

  rebuildOptimisticProjection({
    broadcast=true,
    reason='round-result-optimistic-reconcile'
  }={}){
    const account=
      AccountState.current;

    const base=
      this.authoritativeProgress;

    if(
      !account||
      !base
    ){
      return false;
    }

    account.characterRecords={
      ...(base.characterRecords||{})
    };

    account.characterStats={
      ...(base.characterStats||{})
    };

    const touched=
      new Set();

    const pendingEntries=[
      ...this.resultByRound.entries()
    ]
      .filter(([,entry])=>
        entry?.pending===true&&
        entry?.payload&&entry.accountId===String(account.accountId||'')
      )
      .sort(([,a],[,b])=>
        (
          Number(a?.generation)||0
        )-
        (
          Number(b?.generation)||0
        )||Number(a?.token)-Number(b?.token)
      );

    for(const [key,entry] of pendingEntries){
      const projected=
        this.optimisticRoundResult(
          entry.payload,
          entry.pid||
            RoomService.localPid,
          account,
          entry.optimistic
        );

      if(!projected)continue;

      account.characterRecords={
        ...(account.characterRecords||{}),
        [projected.characterId]:
          projected.after
      };

      touched.add(
        projected.characterId
      );

      this.resultByRound.set(
        key,
        {
          ...entry,
          delta:
            projected.delta,
          optimistic:
            projected
        }
      );
    }

    account.recordSettlementPending=
      pendingEntries.length>0;

    AccountState.current=
      account;

    this.syncLocalRecordPresentation(
      [...touched],
      reason,
      broadcast
    );

    return true;
  },

  showRecordCorrection(
    fromScore,
    toScore,
    label='레코드 정정'
  ){
    let element=
      document.getElementById(
        'record-delta-toast'
      );

    if(!element){
      element=
        document.createElement(
          'div'
        );
      element.id=
        'record-delta-toast';
      element.className=
        'record-delta-toast';
      document.body.appendChild(
        element
      );
    }

    const from=
      Number(fromScore)||0;
    const to=
      Number(toScore)||0;

    element.textContent=
      `${label} · ${from} → ${to}`;

    element.style.color=
      to<from
        ?'#ff8585'
        :to>from
          ?'#7fffa0'
          :'#aab6c2';

    element.classList.remove(
      'show'
    );

    void element.offsetWidth;

    element.classList.add(
      'show'
    );

    clearTimeout(
      this._recordDeltaToastTimer
    );

    this._recordDeltaToastTimer=
      setTimeout(()=>{
        element.classList.remove(
          'show'
        );
      },4000);

    return true;
  },

  optimisticRoundResult(payload,pid,account,snapshot=null){
    const characterId=
      snapshot?.characterId||this.characterId(pid);

    if(!characterId)return null;

    const before=
      Math.max(
        0,
        Math.floor(
          Number(
            account
              ?.characterRecords
              ?.[characterId]
          )||0
        )
      );

    const tier=
      CharacterRecordService.tier(
        before
      );

    const values=
      this.modeValues(
        payload?.mode,
        tier.id
      );

    const mode=
      String(
        snapshot?.mode||payload?.mode||
        RoomService.matchMode||
        MatchModeService.DUEL
      );

    const placement=
      snapshot?snapshot.placement:mode===MatchModeService.FFA
        ?this.placement(
            payload,
            pid
          )
        :null;

    const ffaOutcome=
      snapshot?snapshot.outcome:mode===MatchModeService.FFA
        ?this.ffaOutcome(
            payload,
            pid
          )
        :null;

    const won=
      snapshot?snapshot.outcome==='win':mode===MatchModeService.FFA
        ?(
            ffaOutcome==='win'
              ?true
              :ffaOutcome==='loss'
                ?false
                :null
          )
        :this.won(
            payload,
            pid
          );

    const ffaScore=
      snapshot?.ffaScore||(mode===MatchModeService.FFA
        ?this.ffaScoreMultiplier(
            payload,
            pid
          )
        :null);

    const requestedDelta=
      Math.round(
        mode===MatchModeService.FFA
          ?(
              ffaScore?.kind==='loss'
                ?values.loss*
                  (
                    ffaScore?.multiplier||
                    1
                  )
                :values.win*
                  (
                    ffaScore?.multiplier||
                    1
                  )
            )
          :mode===MatchModeService.TEAM
            ?(
                won
                  ?values.win*3
                  :values.loss
              )
            :(
                won
                  ?values.win
                  :values.loss
              )
      );

    const floor=
      Math.max(
        0,
        Number(tier.min)||0
      );

    const after=
      Math.round(
        requestedDelta<0
          ?Math.max(
              floor,
              before+
                requestedDelta
            )
          :before+
            requestedDelta
      );

    return {
      token:
        Math.max(
          1,
          Number(
            payload?.roundToken
          )||1
        ),
      characterId,
      before,
      after,
      delta:
        after-before,
      requestedDelta,
      mode,
      placement,
      ffaScore,
      outcome:
        mode===MatchModeService.FFA
          ?(
              ffaOutcome||
              'neutral'
            )
          :won
            ?'win'
            :'loss',
      optimistic:true
    };
  },

  showRecordDelta(result){
    if(
      !result||
      result.blocked
    )return false;

    let element=
      document.getElementById(
        'record-delta-toast'
      );

    if(!element){
      element=
        document.createElement('div');
      element.id='record-delta-toast';
      element.className='record-delta-toast';
      document.body.appendChild(element);
    }

    const delta=
      Number(result.delta)||0;
    const sign=
      delta>0
        ?'+'
        :'';

    element.textContent=
      `레코드 ${sign}${delta} · ${result.before} → ${result.after}`;

    element.style.color=
      delta>0
        ?'#7fffa0'
        :delta<0
          ?'#ff8585'
          :'#aab6c2';

    element.classList.remove('show');
    void element.offsetWidth;
    element.classList.add('show');

    clearTimeout(
      this._recordDeltaToastTimer
    );

    this._recordDeltaToastTimer=
      setTimeout(()=>{
        element.classList.remove(
          'show'
        );
      },8000);

    return true;
  },

  scheduleSave(){
    return Promise.resolve(null);
  },

  applyServerProgress(progress,result,payload,resultKey){
    const account=
      AccountState.current;

    if(
      !account||
      account.isGuest||
      !progress
    ){
      return null;
    }

    const previousResult=
      this.resultByRound.get(
        resultKey
      );

    const previousOptimistic=
      previousResult?.optimistic||
      null;

    this.setAuthoritativeProgress(
      progress
    );

    account.characterRecords={
      ...(progress.characterRecords||{})
    };

    account.characterStats={
      ...(progress.characterStats||{})
    };

    account.recordSettlementPending=false;

    AccountState.current=
      account;

    const characterId=
      String(
        result?.characterId||''
      );

    const after=
      CharacterRecordService.points(
        characterId,
        account
      );
    const serverResult={
      token:Math.max(1,Number(payload?.roundToken)||1),
      characterId,
      won:result?.outcome==='win',
      mode:String(result?.mode||payload?.mode||RoomService.matchMode||MatchModeService.DUEL),
      placement:Number.isFinite(Number(result?.placement))?Number(result.placement):null,
      outcome:String(result?.outcome||'neutral'),
      ffaTeamCount:Number(result?.ffaTeamCount)||null,
      scoreMultiplier:Number(result?.scoreMultiplier)||1,
      teamSize:Number(result?.teamSize)||1,
      before:Number(result?.before)||0,
      after,
      delta:Number(result?.delta)||0,
      requestedDelta:Number(result?.requestedDelta)||0,
      tierBefore:CharacterRecordService.tier(Number(result?.before)||0),
      tierAfter:CharacterRecordService.tier(after),
      finalized:true
    };
    this.resultByRound.set(
      resultKey,
      serverResult
    );

    /*
     * 서버 확정값을 기준점으로 삼고, 혹시 뒤 라운드의
     * 낙관적 정산이 아직 남아 있다면 그 값만 다시 얹는다.
     */
    this.rebuildOptimisticProjection({
      broadcast:false,
      reason:'round-result-server-reconcile'
    });

    const profileSnapshot=
      PlayerProfileService.snapshot(
        AccountState.current
      );
    const localMember=
      RoomService.localMember();

    if(localMember){
      localMember.profile=
        profileSnapshot;
    }

    GameEvents.emit('character-record-changed',{
      pid:RoomService.localPid,
      characterId,
      points:
        CharacterRecordService.points(
          characterId,
          AccountState.current
        ),
      stats:AccountState.current?.characterStats?.[characterId]||null,
      profile:profileSnapshot,
      local:true,
      reason:'round-result'
    });
    if(Training.sessionMode==='online'&&OnlineDuelService.active){
      RoomService.sendGameplay({
        type:'duel-record-update',
        roundToken:OnlineDuelService.roundToken,
        characterId,
        points:
          CharacterRecordService.points(
            characterId,
            AccountState.current
          ),
        stats:AccountState.current?.characterStats?.[characterId]||null,
        profile:profileSnapshot
      });
    }
    CharacterRecordService.clearRankingCache();
    CharacterRecordService.loadAllRankings(true).catch(error=>{
      console.warn('[Duels] ranking refresh failed after settlement',error);
    });
    const sameAsOptimistic=
      previousOptimistic&&
      Number(
        previousOptimistic.before
      )===
        Number(
          serverResult.before
        )&&
      Number(
        previousOptimistic.after
      )===
        Number(
          serverResult.after
        )&&
      Number(
        previousOptimistic.delta
      )===
        Number(
          serverResult.delta
        );

    if(
      previousOptimistic&&
      !sameAsOptimistic
    ){
      this.showRecordCorrection(
        previousOptimistic.after,
        serverResult.after,
        '레코드 서버 정정'
      );
    }else if(!previousOptimistic){
      this.showRecordDelta(
        serverResult
      );
    }

    return serverResult;
  },

  applyRoundResult(payload){
    const pid=RoomService.localPid;
    const account=AccountState.current;
    const token=Math.max(1,Number(payload?.roundToken)||1);
    if(
      !pid||
      !account||
      account.isGuest||
      account.firebaseAccount!==true||
      RoomService.localMember()?.spectator===true
    )return null;
    const resultKey=`${this.matchGeneration}:${token}`;
    if(this.resultByRound.has(resultKey)){
      return this.resultByRound.get(resultKey);
    }
    const eligibility=this.settlementEligibility();
    if(!eligibility.allowed){
      console.warn('[Duels] record settlement blocked',{roundToken:token,reason:eligibility.reason});
      const blocked={token,blocked:true,reason:eligibility.reason,delta:0};
      this.resultByRound.set(resultKey,blocked);
      return blocked;
    }
    const submission=MatchResultSubmissionService.payload(payload);
    if(!submission){
      console.error('[Duels] record submission snapshot missing',{
        roundToken:token,hasMatchId:!!RoomService.serverMatchId,
        participantCount:RoomService.matchPids().length,
        participantsReady:!!MatchResultSubmissionService.participantSnapshot()
      });
      return null;
    }
    const accountId=String(account.accountId||'');
    const optimistic=
      this.optimisticRoundResult(
        payload,
        pid,
        account
      );

    this.captureAuthoritativeProgress(
      account
    );

    const pending={
      token,
      generation:this.matchGeneration,
      accountId,
      pending:true,
      delta:
        Number(
          optimistic?.delta
        )||0,
      mode:
        payload?.mode||
        RoomService.matchMode||
        MatchModeService.DUEL,
      optimistic,
      payload,
      pid
    };

    this.resultByRound.set(
      resultKey,
      pending
    );

    if(optimistic){
      /*
       * 여기서 토스트만 미리 띄우는 것이 아니라 실제 로컬
       * characterRecords 값까지 즉시 바꾼다.
       * Firebase/Worker 저장은 하지 않는다.
       */
      this.applyOptimisticRecord(
        optimistic,
        {
          broadcast:true,
          reason:'round-result-optimistic'
        }
      );

      this.showRecordDelta(
        optimistic
      );
    }

    MatchResultSubmissionService
      .submitRound(payload,submission)
      .then(response=>{
        if(String(AccountState.current?.accountId||'')!==accountId)return;
        if(response?.finalized!==true)return;
        this.applyServerProgress(
          response.progress,
          response.result,
          payload,
          resultKey
        );
      })
      .catch(error=>{
        if(String(AccountState.current?.accountId||'')!==accountId){
          this.resultByRound.delete(resultKey);
          return;
        }
        console.warn(
          '[Duels] match settlement failed',
          error
        );
        // 확정 후 UI 갱신 오류가 나더라도 서버 정산을 취소한 것으로 처리하지 않는다.
        if(this.resultByRound.get(resultKey)?.finalized===true)return;

        const provisional=
          this.resultByRound.get(
            resultKey
          )?.optimistic||
          optimistic;

        this.resultByRound.delete(
          resultKey
        );

        this.rebuildOptimisticProjection({
          broadcast:true,
          reason:'round-result-optimistic-rollback'
        });

        if(provisional){
          const restored=
            CharacterRecordService.points(
              provisional.characterId,
              AccountState.current
            );

          this.showRecordCorrection(
            provisional.after,
            restored,
            '레코드 정산 오류 · 점수 회수'
          );
        }
      });
    return pending;
  },

  applyDeparturePenalty(){
    const pid=RoomService.localPid;
    const account=AccountState.current;
    const member=RoomService.localMember();
    if(
      !pid||
      !account||
      account.isGuest||
      account.firebaseAccount!==true||
      member?.spectator===true||
      this.departurePenaltyGeneration===this.matchGeneration
    ){
      return null;
    }
    const activePhases=new Set([
      'playing',
      'round-result',
      'between',
      'between-countdown'
    ]);
    if(!activePhases.has(String(RoomService.duelPhase||''))){
      return null;
    }
    const eligibility=this.settlementEligibility();
    if(!eligibility.allowed){
      return {blocked:true,reason:eligibility.reason,delta:0};
    }
    const characterId=this.characterId(pid);
    if(!characterId)return null;
    const mode=RoomService.matchMode||OnlineDuelService.mode||MatchModeService.DUEL;
    const eventId=`${String(RoomService.serverMatchId||'match')}:departure:${this.matchGeneration}:${pid}`;
    this.departurePenaltyGeneration=this.matchGeneration;
    MatchResultSubmissionService
      .submitDeparture({characterId,mode,eventId})
      .then(response=>{
        const progress=response?.progress;
        const result=response?.result;
        if(!progress||!result)return;
        this.setAuthoritativeProgress(
          progress
        );
        account.characterRecords={...(progress.characterRecords||{})};
        account.characterStats={...(progress.characterStats||{})};
        account.recordSettlementPending=false;
        AccountState.current=account;
        const localMember=RoomService.localMember();
        if(localMember){
          localMember.profile=PlayerProfileService.snapshot(account);
        }
        const after=CharacterRecordService.points(characterId,account);
        const profileSnapshot=PlayerProfileService.snapshot(account);
        GameEvents.emit('character-record-changed',{
          pid,
          characterId,
          points:after,
          stats:account.characterStats?.[characterId]||null,
          profile:profileSnapshot,
          local:true,
          reason:'mid-match-departure'
        });
        CharacterRecordService.clearRankingCache();
        CharacterRecordService.loadAllRankings(true).catch(error=>{
          console.warn('[Duels] ranking refresh failed after departure',error);
        });
        this.showRecordDelta({
          characterId,
          before:Number(result.before)||0,
          after,
          delta:Number(result.delta)||0,
          requestedDelta:Number(result.requestedDelta)||0
        });
      })
      .catch(error=>{
        console.warn('[Duels] departure penalty save failed',error);
        this.departurePenaltyGeneration=-1;
      });
    return {
      pending:true,
      characterId,
      eventId
    };
  },

  reset(){
    this.matchGeneration+=1;
    const accountId=String(AccountState.current?.accountId||'');
    for(const [key,entry] of this.resultByRound){
      if(entry?.pending!==true||entry.accountId!==accountId)this.resultByRound.delete(key);
    }
    this.departurePenaltyGeneration=-1;
    if(!this.resultByRound.size)this.authoritativeProgress=null;

    if(AccountState.current){
      AccountState.current.recordSettlementPending=this.resultByRound.size>0;
    }
  }
};