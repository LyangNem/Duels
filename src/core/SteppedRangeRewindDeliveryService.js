

/* delivery.area stepped rewind helper.
   다단계 거리 공격이 현재 벽/조준에 맞춰 최외곽 단계부터 안쪽으로 순차 실행되는 범용 동작. */
const SteppedRangeRewindDeliveryService=Object.freeze({
  active:new WeakSet(),
  isActive(source){
    return !!source&&this.active.has(source);
  },
  liveAngle(source,fallback){
    if(
      EntitySimulationAuthorityService.isLocal(source)&&
      source===Training.player
    ){
      const angle=Training.aimAngle();
      if(Number.isFinite(angle))return angle;
    }
    if(Number.isFinite(Number(source?._remoteAimAngle))){
      return Number(source._remoteAimAngle);
    }
    return Number(fallback)||0;
  },
  config(module){
    const raw=module?.steppedRewind||{};
    const stages=Math.max(1,Math.floor(Number(raw.stages)||1));
    const minDistance=Math.max(0,Number(raw.minDistance)||0);
    const stepDistance=Math.max(1,Number(raw.stepDistance)||1);
    return {
      stateKey:String(raw.stateKey||''),
      initial:Number.isFinite(Number(raw.initial))?Number(raw.initial):1,
      stages,
      minDistance,
      stepDistance,
      interval:Math.max(0,Number(raw.interval)||0),
      wallPadding:Math.max(0,Number(raw.wallPadding)||0),
      maxDistance:minDistance+(stages-1)*stepDistance,
      effect:raw.effect&&typeof raw.effect==='object'?raw.effect:null
    };
  },
  reachableStage(source,angle,config){
    const wallDistance=WorldGeometryService.raycastDistance(
      Number(source.x)||0,
      Number(source.y)||0,
      angle,
      config.maxDistance,
      config.wallPadding
    );
    return Math.max(
      1,
      Math.min(
        config.stages,
        Math.floor(
          (wallDistance-config.minDistance)/
          config.stepDistance
        )+1
      )
    );
  },
  setStage(source,config,stage){
    if(!config.stateKey)return false;
    return ProgressStateService.apply(source,{
      type:'state.progress',
      stateKey:config.stateKey,
      operation:'set',
      value:stage,
      initial:config.initial,
      max:config.stages,
      blocksStaminaRegen:false
    });
  },
  spawnStepEffect(source,module,angle,stage,distance,config){
    const ref=config.effect;
    if(!ref)return null;
    const x=Number(source.x)||0;
    const y=Number(source.y)||0;
    const tx=x+Math.cos(angle)*distance;
    const ty=y+Math.sin(angle)*distance;
    return EffectSpawnService.spawn(
      {
        ...EffectSpawnService.definitionSnapshot(ref),
        type:'rulerCounterStrike',
        x,
        y,
        tx,
        ty,
        angle,
        distance,
        startDistance:Math.max(0,Number(source.radius)||0),
        stage,
        stepStage:stage,
        stages:config.stages,
        strikeLength:
          Math.max(
            1,
            Math.max(
              0,
              Number(module.halfWidth)||64
            )*2
          ),
        strikeWidth:
          Math.max(
            1,
            Number(module.range)||72
          ),
        sourceEntityId:String(source.id||''),
        start:performance.now(),
        dur:Math.max(
          GAME_DATA.frameMs,
          Number(ref.duration)||
          Number(ref.durationFrames)*GAME_DATA.frameMs||
          GAME_DATA.frameMs
        )
      },
      {source}
    );
  },
  execute(source,spec,baseAngle,module,volley){
    const config=this.config(module);
    const characterId=String(source?.character?.id||'');
    const firstAngle=this.liveAngle(source,baseAngle);
    const firstStage=this.reachableStage(source,firstAngle,config);
    this.setStage(source,config,firstStage);

    const state={nextStage:firstStage};
    this.active.add(source);

    const finish=()=>{
      this.active.delete(source);
    };

    const runStep=()=>{
      if(
        !source?.alive||
        String(source?.character?.id||'')!==characterId||
        state.nextStage<1
      ){
        finish();
        return;
      }

      const angle=this.liveAngle(source,baseAngle);
      const reachable=this.reachableStage(source,angle,config);
      const stage=Math.min(state.nextStage,reachable);
      const distance=
        config.minDistance+
        (stage-1)*config.stepDistance;

      const areaModule={
        ...module,
        steppedRewind:undefined,
        repeatCount:1,
        repeatInterval:0,
        centerDistance:distance,
        rectCenterMode:'center',
        aimMode:'locked'
      };

      const areaVolley={
        ...volley,
        execution:volley.execution,
        total:1,
        resolved:0,
        hits:0,
        finished:false
      };

      AreaAttackService.execute(
        source,
        spec,
        angle,
        areaModule,
        areaVolley
      );

      this.setStage(source,config,stage);
      this.spawnStepEffect(
        source,
        areaModule,
        angle,
        stage,
        Math.min(
          distance,
          WorldGeometryService.raycastDistance(
            Number(source.x)||0,
            Number(source.y)||0,
            angle,
            distance,
            config.wallPadding
          )
        ),
        config
      );

      state.nextStage=stage-1;
      if(state.nextStage<1){
        finish();
        return;
      }

      SimulationScheduleService.scheduleContinuation({
        at:performance.now()+config.interval,
        source,
        continue:runStep
      });
    };

    runStep();
    volley.resolved=volley.total;
    volley.finished=true;
    return true;
  }
});