


/* 공격/스킬 선딜 중 이동만 잠그는 범용 시간 상태.
   CC가 아니므로 기절/속박 표시나 행동 불가를 만들지 않는다. */

const DodgeFollowupStateService=Object.freeze({
  config(entity){
    return entity?.character?.dodgeFollowupState||null;
  },
  clear(entity){
    const config=this.config(entity);
    if(!entity?.actionState||!config)return false;
    const movingKey=String(config.movingStateKey||'');
    const stoppedKey=String(config.stoppedStateKey||'');
    if(movingKey)entity.actionState.delete(movingKey);
    if(stoppedKey)entity.actionState.delete(stoppedKey);
    return true;
  },
  presentStopped(entity,config,now){
    if(!config?.stoppedEffects?.length||!EffectSpawnService.shouldPresentAttack(entity))return false;
    let shown=false;
    for(const spec of config.stoppedEffects){
      const effect=EffectSpawnService.spawn({...spec,x:entity.x,y:entity.y,start:now,targetEntityId:entity.id},{source:entity});
      if(!effect)continue;shown=true;
      OnlinePresentationSyncService.send('effect-spawn',entity,{effect:EffectSpawnService.presentationSnapshot(effect,now)});
    }
    return shown;
  },
  begin(
    entity,
    movement=null,
    now=performance.now()
  ){
    const config=this.config(entity);
    if(!config||!entity?.actionState)return false;

    this.clear(entity);

    const dx=Number(movement?.x)||0;
    const dy=Number(movement?.y)||0;
    const moving=
      Math.hypot(dx,dy)>
      Math.max(
        0,
        Number(config.movingThreshold)||.01
      );

    const activeKey=String(
      moving
        ?config.movingStateKey
        :config.stoppedStateKey
    );
    if(!activeKey)return false;

    TimedActionStateService.open(
      entity,
      {
        stateKey:activeKey,
        duration:Math.max(
          0,
          Number(config.duration)||2000
        ),
        data:Object.freeze({
          mode:moving?'moving':'stopped'
        })
      },
      now
    );
    if(!moving)this.presentStopped(entity,config,now);
    return true;
  },
  observeMovement(entity,movement=null,now=performance.now()){
    const config=this.config(entity);
    if(!config||!entity?.actionState)return false;
    if(!(Number(entity.dodgeUntil)||0)||now>=Number(entity.dodgeUntil)||entity.forcedMotion?.kind!=='dodge')return false;

    const movingKey=String(config.movingStateKey||'');
    const stoppedKey=String(config.stoppedStateKey||'');
    if(!movingKey||!stoppedKey)return false;
    if(!entity.actionState.has(movingKey))return false;

    const dx=Number(movement?.x)||0;
    const dy=Number(movement?.y)||0;
    const threshold=Math.max(0,Number(config.movingThreshold)||.01);
    if(Math.hypot(dx,dy)>threshold)return false;

    entity.actionState.delete(movingKey);
    TimedActionStateService.open(
      entity,
      {
        stateKey:stoppedKey,
        duration:Math.max(0,Number(config.duration)||2000),
        data:Object.freeze({mode:'stopped'})
      },
      now
    );
    this.presentStopped(entity,config,now);
    return true;
  },
  cancelDodge(entity){
    if(!entity)return false;

    if(entity.forcedMotion?.kind==='dodge'){
      MovementService.finalizeForcedMotion(entity);
    }

    entity.dodgeUntil=0;
    AugmentDodgeSequenceService.reset(entity);
    entity.invincibleUntil=0;
    entity.justCheck=null;
    entity.justDodgeStartedAt=0;
    entity.justDodgeWindowUntil=0;
    entity.justDodgeConsumed=false;
    BuffService.remove(
      entity,
      'invulnerable',
      'system:dodge'
    );
    return true;
  }
});