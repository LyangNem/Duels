

const Presentation=Object.freeze({
  numberBuffer:new Map(),
  numberMergeWindow:80,

  numberKey(entity,kind){
    const targetKey=
      entity?.id||
      `${Math.round((entity?.x||0)/6)}:${Math.round((entity?.y||0)/6)}`;
    return `${String(kind||'damage')}:${targetKey}`;
  },

  queueNumber(entity,amount,kind='damage',groupKey=''){
    if(!entity)return false;

    const value=Math.max(
      0,
      Number(amount)||0
    );
    if(value<=0)return false;

    const now=performance.now();
    const baseKey=this.numberKey(entity,kind);
    const key=groupKey?`${baseKey}:${String(groupKey)}`:baseKey;
    let entry=this.numberBuffer.get(key);

    if(!entry){
      entry={
        kind,
        total:0,
        x:entity.x,
        y:entity.y-entity.radius-10,
        flushAt:now+this.numberMergeWindow
      };
      this.numberBuffer.set(key,entry);
    }

    entry.total+=value;
    entry.x=entity.x;
    entry.y=entity.y-entity.radius-10;
    entry.flushAt=
      now+this.numberMergeWindow;
    return true;
  },

  damageNumber(entity,amount,groupKey=''){
    return this.queueNumber(
      entity,
      amount,
      'damage',
      groupKey
    );
  },

  healNumber(entity,amount){
    return this.queueNumber(
      entity,
      amount,
      'heal'
    );
  },

  update(now=performance.now()){
    for(const [key,entry] of this.numberBuffer){
      if(now<entry.flushAt)continue;

      const healing=entry.kind==='heal';

      EffectSpawnService.spawn({
        type:'dmgNum',
        x:entry.x,
        y:entry.y,
        text:
          healing
            ?`+${Math.round(entry.total)}`
            :String(Math.round(entry.total)),
        col:
          healing
            ?'#62e889'
            :'#ff6060',
        size:19,
        start:now,
        dur:533
      });
      this.numberBuffer.delete(key);
    }
  },
  dodge(entity){EffectSpawnService.spawn({type:'dodge',x:entity.x,y:entity.y,start:performance.now(),dur:180})},
  healPulse(entity,profile='default'){
    if(!entity)return false;

    EffectSpawnService.spawn({
      type:'healPulse',
      x:Number(entity.x)||0,
      y:Number(entity.y)||0,
      r:0,
      maxR:
        (Number(entity.radius)||20)+
        (profile==='regeneration'?10:12),
      start:performance.now(),
      dur:profile==='regeneration'
        ?GAME_DATA.frameMs*10
        :200
    });
    return true;
  },
  justDodge(entity){
    const now=performance.now();
    EffectSpawnService.spawn({type:'justdodge',x:entity.x,y:entity.y,start:now,dur:360});
    EffectSpawnService.spawn({type:'justDodgeText',x:entity.x,y:entity.y-entity.radius-18,text:'DODGE!',start:now,dur:620});
    MasterRecordMilestonePresentationService.justDodge(entity,now);
    if(entity===Training.player)ScreenShakeService.add('victim',18);
  },
  counterCharge(entity,duration=300,presentation=null){
    const radius=Math.max(
      0,
      Number(presentation?.chargeRadius)||30
    );
    EffectSpawnService.spawn({
      type:'counterCharge',
      entity,
      x:entity.x,
      y:entity.y,
      r:radius,
      maxR:radius,
      color:presentation?.color||null,
      start:performance.now(),
      dur:duration
    });
  },
  counterFire(entity,color=null){
    EffectSpawnService.spawn({
      type:'counter',
      x:entity.x,
      y:entity.y,
      color:
        color||
        entity?.character?.color||
        entity?.color||
        '#ffffff',
      start:performance.now(),
      dur:250
    });
  },
  deathLaunch(
    entity,
    source=null,
    koOrigin=null,
    koTarget=null,
    direction=null,
    options={}
  ){
    const now=performance.now();
    const targetPoint=
      koTarget||
      options.targetPoint||
      {
        x:Number(entity?.x)||0,
        y:Number(entity?.y)||0
      };
    const origin=
      koOrigin||
      ImpactDirectionService.entityCenter(source)||
      {
        x:targetPoint.x,
        y:targetPoint.y+1
      };

    const angle=
      Number.isFinite(Number(direction))
        ?Number(direction)
        :Math.atan2(
          targetPoint.y-origin.y,
          targetPoint.x-origin.x
        );

    SoundService.play('kill');

    const koCamera=GAME_DATA.cameraFeedback.ko;
    ScreenShakeService.forceImpact(
      koCamera.shake,
      koCamera.shakeDuration
    );

    const visible=
      WorldViewportVisibilityService
        .containsWorldPoint(
          targetPoint.x,
          targetPoint.y,
          Math.max(
            36,
            Number(entity?.radius)||20
          )
        );

    const forceDirectionalBeam=options.forceDirectionalBeam===true;

    // 일반 화면 밖 사망은 기존처럼 흔들림과 사운드만 재생한다.
    // 단, 내가 직접 처치한 대상은 사망 지점이 화면 밖이어도 실제 K.O. 각도를 유지한
    // 레이저를 화면 가장자리에서 반드시 보여준다.
    if(!visible&&!forceDirectionalBeam)return true;

    if(!visible&&forceDirectionalBeam){
      const beamPoint=WorldViewportVisibilityService.clampWorldPoint(
        targetPoint.x,
        targetPoint.y,
        30
      );

      Training.koFreezeUntil=Math.max(Training.koFreezeUntil,now+90);
      Training.koFlashUntil=Math.max(Training.koFlashUntil,now+145);

      if(DisplaySettings.state.koEffects){
        EffectSpawnService.spawn({
          type:'koBeam',
          angle,
          x:beamPoint.x,
          y:beamPoint.y,
          start:now+45,
          dur:300
        });
      }

      CameraFovService.forceKo();
      return true;
    }

    Training.koFreezeUntil=
      Math.max(
        Training.koFreezeUntil,
        now+90
      );
    Training.koFlashUntil=
      Math.max(
        Training.koFlashUntil,
        now+145
      );

    if(DisplaySettings.state.koEffects){
      EffectSpawnService.spawn({
        type:'koImpact',
        x:targetPoint.x,
        y:targetPoint.y,
        start:now,
        dur:260
      });

      // 레이저 중심은 각 화면의 중앙이 아니라 실제 사망 월드 위치다.
      EffectSpawnService.spawn({
        type:'koBeam',
        angle,
        x:targetPoint.x,
        y:targetPoint.y,
        start:now+45,
        dur:300
      });

      EffectSpawnService.spawn({
        type:'koLaunch',
        x:targetPoint.x,
        y:targetPoint.y,
        color:entity?.color||'#fff',
        angle,
        start:now+55,
        dur:390
      });

      for(let index=0;index<4;index++){
        EffectSpawnService.spawn({
          type:'koAfterimage',
          x:targetPoint.x,
          y:targetPoint.y,
          color:entity?.color||'#fff',
          angle,
          start:now+90+index*34,
          dur:300
        });
      }
    }

    CameraFovService.forceKo();
    return true;
  }});