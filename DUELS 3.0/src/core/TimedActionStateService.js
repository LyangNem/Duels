

const TimedActionStateService=Object.freeze({
  open(entity,config,now=performance.now()){
    if(!entity?.actionState||!config?.stateKey)return false;
    const key=String(config.stateKey);
    const duration=Math.max(0,Number(config.duration)||0);
    entity.actionState.set(key,{
      kind:'timed-action-state',
      stateKey:key,
      characterId:String(entity.character?.id||''),
      startedAt:now,
      expiresAt:now+duration,
      data:config.data||null,
      presentation:config.presentation||null,
      cancelOnDamage:config.cancelOnDamage===true,
      interruptOnForcedMovement:
        config.interruptOnForcedMovement===true,
      retainCompleteMs:Math.max(0,Number(config.retainCompleteMs)||0),
      completedAt:0,
      // 완료 프레임에서 presentation/state 조회가 예약된 resolve continuation보다
      // 먼저 실행되어 상태를 삭제하지 않도록, retainCompleteMs가 있으면 처음부터
      // 완료 후 유지 구간까지 수명을 확보한다. resolve 시 실제 completedAt 기준으로 갱신한다.
      retainUntil:duration>0&&Math.max(0,Number(config.retainCompleteMs)||0)>0
        ?now+duration+Math.max(0,Number(config.retainCompleteMs)||0)
        :0
    });
    return true;
  },
  state(entity,stateKey,now=performance.now()){
    const key=String(stateKey||'');
    const state=entity?.actionState?.get(key)||null;
    if(!state||state.kind!=='timed-action-state')return null;
    if(
      (!state.completionPending&&(state.retainUntil>0?state.retainUntil:state.expiresAt)<=now)||
      state.characterId!==String(entity.character?.id||'')
    ){
      entity.actionState.delete(key);
      return null;
    }
    return state;
  },
  consume(entity,stateKey,now=performance.now()){
    const state=this.state(entity,stateKey,now);
    if(!state)return null;
    entity.actionState.delete(state.stateKey);
    return state;
  },
  cancelOnDamage(entity){
    if(!entity?.actionState)return false;
    let removed=false;
    for(const [key,state] of entity.actionState){
      if(
        state?.kind!=='timed-action-state'||
        state.cancelOnDamage!==true
      )continue;
      entity.actionState.delete(key);
      removed=true;
    }
    return removed;
  },

  cancelOnForcedMovement(entity){
    if(!entity?.actionState)return false;

    let removed=false;

    for(const [key,state] of entity.actionState){
      if(
        state?.kind!=='timed-action-state'||
        state.interruptOnForcedMovement!==true
      ){
        continue;
      }

      entity.actionState.delete(key);
      removed=true;
    }

    if(removed){
      entity.attackPreview=null;
    }

    return removed;
  },
  serialize(entity,now=performance.now()){
    const result=[];
    for(const state of entity?.actionState?.values?.()||[]){
      if(state?.kind!=='timed-action-state')continue;
      const end=state.retainUntil>0?state.retainUntil:state.expiresAt;
      if(end<=now)continue;
      result.push({
        stateKey:String(state.stateKey||''),
        characterId:String(state.characterId||''),
        elapsed:Math.max(0,now-Number(state.startedAt||now)),
        remaining:Math.max(0,Number(state.expiresAt||now)-now),
        retainRemaining:Math.max(0,Number(state.retainUntil||0)-now),
        completed:Math.max(0,Number(state.completedAt||0))>0,
        cancelOnDamage:state.cancelOnDamage===true,
        interruptOnForcedMovement:
          state.interruptOnForcedMovement===true,
        presentation:state.presentation&&typeof state.presentation==='object'?EffectSpawnService.definitionSnapshot(state.presentation):null,
        data:
          state.data?.networkSync===true&&
          typeof state.data==='object'
            ?EffectSpawnService.definitionSnapshot(state.data)
            :null
      });
    }
    return result;
  },
  applyRemote(entity,snapshots,now=performance.now()){
    if(!entity?.actionState||!Array.isArray(snapshots))return false;
    const incoming=new Set();
    for(const snap of snapshots){
      const key=String(snap?.stateKey||'');
      if(!key)continue;
      incoming.add(key);
      const remaining=Math.max(0,Number(snap?.remaining)||0);
      const retainRemaining=Math.max(0,Number(snap?.retainRemaining)||0);
      const elapsed=Math.max(0,Number(snap?.elapsed)||0);
      const existing=entity.actionState.get(key);
      const state=existing?.kind==='timed-action-state'?existing:{kind:'timed-action-state',stateKey:key,data:null};
      state.characterId=String(snap?.characterId||entity.character?.id||'');
      state.startedAt=now-elapsed;
      state.expiresAt=now+remaining;
      state.retainUntil=retainRemaining>0?now+retainRemaining:0;
      state.completedAt=snap?.completed===true?Math.min(now,state.expiresAt):0;
      state.cancelOnDamage=snap?.cancelOnDamage===true;
      state.interruptOnForcedMovement=
        snap?.interruptOnForcedMovement===true;
      state.presentation=snap?.presentation&&typeof snap.presentation==='object'?EffectSpawnService.definitionSnapshot(snap.presentation):null;
      state.data=
        snap?.data&&typeof snap.data==='object'
          ?EffectSpawnService.definitionSnapshot(snap.data)
          :(existing?.kind==='timed-action-state'?existing.data:null);
      state.retainCompleteMs=Math.max(0,state.retainUntil-state.expiresAt);
      entity.actionState.set(key,state);
    }
    for(const [key,state] of entity.actionState){
      if(state?.kind==='timed-action-state'&&!incoming.has(String(key)))entity.actionState.delete(key);
    }
    return true;
  },
  updatePresentation(entity,now=performance.now()){
    if(entity!==Training.player||!entity?.alive)return false;
    let rendered=false;
    for(const config of entity.character?.dodgeStateWindows||[]){
      const state=this.state(entity,config.stateKey,now);
      if(!state||config.showIndicator===false)continue;
      EffectSpawnService.spawn({
        type:'actionWindowIndicator',
        key:`action-window:${entity.id}:${state.stateKey}`,
        x:entity.x,y:entity.y,
        radius:entity.radius+16,
        sourceRadius:entity.radius,
        color:'255,119,0',
        alpha:.6+.4*Math.sin(now*.016),
        width:3,dash:[4,4],text:'⚔',
        start:now,dur:GAME_DATA.frameMs*3
      },{source:entity});
      rendered=true;
    }

    // timed-action-state가 선택형 공격 미리보기를 선언하면 현재 선택과 실시간 조준을
    // 기존 AttackPreviewService에 연결한다. 캐릭터 ID는 알지 않는다.
    for(const state of entity.actionState?.values?.()||[]){
      if(state?.kind!=='timed-action-state')continue;
      const presentation=state.presentation||null;
      const attackIds=presentation?.previewAttackIds;
      if(!attackIds||typeof attackIds!=='object')continue;
      if(state.expiresAt<=now)continue;
      const dataKey=String(presentation.resolveDataKey||'choice');
      const attackId=String(attackIds[state.data?.[dataKey]]||'');
      const attack=AbilityService.attackById(entity.character,attackId);
      if(!attack)continue;
      let angle=Number(state.data?.angle)||0;
      if(presentation.liveAim===true&&entity===Training.player){
        const liveAngle=Training.aimAngle();
        if(Number.isFinite(liveAngle))angle=liveAngle;
        state.data={...(state.data||{}),angle};
      }
      entity.attackPreview=AttackPreviewService.fromAttack(
        entity,
        attack,
        angle,
        Math.max(now+GAME_DATA.frameMs*3,Number(state.expiresAt)||now),
        entity.attackPreview
      );
      entity.attackPreview.timedActionStateKey=state.stateKey;
      rendered=true;
    }
    return rendered;
  }
});