



/*
  일정 간격으로 AttackSpec을 반복 실행하는 범용 채널 상태.
  공격 자체의 판정/피해/이펙트/네트워크는 기존 TriggeredAttackService를 재사용한다.
*/
const ChannelAttackService=Object.freeze({
  KIND:'attack-channel',
  GAUGE_COMPLETE_KIND:'attack-channel-gauge-complete',
  EMPTY_SNAPSHOTS:Object.freeze([]),
  attackAnimationDuration(attack){
    let duration=0;
    for(const module of attack?.modules||[]){
      if(
        AttackModuleService.type(module)!=='effect.spawn'||
        module.animation!==true||
        !module.damage
      )continue;

      duration=Math.max(
        duration,
        Number(module.duration)||0,
        (Number(module.durationFrames)||0)*GAME_DATA.frameMs
      );
    }
    return Math.max(0,duration);
  },
  state(entity,stateKey){
    const key=String(stateKey||'');
    const state=
      entity?.actionState?.get(key)||
      null;
    if(state?.kind!==this.KIND)return null;
    if(
      !EntitySimulationAuthorityService.isLocal(entity)&&
      Number.isFinite(Number(state.expiresAt))&&
      performance.now()>Number(state.expiresAt)+GAME_DATA.frameMs*2
    ){
      if(state.presentationKey)EffectSpawnService.removeKey(state.presentationKey);
      entity.actionState.delete(key);
      return null;
    }
    return state;
  },
  serialize(entity){
    if(!entity?.actionState)return this.EMPTY_SNAPSHOTS;

    let snapshots=null;
    for(const state of entity.actionState.values()){
      if(state?.kind!==this.KIND)continue;
      if(!snapshots)snapshots=[];
      snapshots.push({
        stateKey:String(state.stateKey||''),
        angle:Number(state.angle)||0,
        originX:Number(state.originX)||0,
        originY:Number(state.originY)||0
      });
    }
    return snapshots||this.EMPTY_SNAPSHOTS;
  },
  applyRemote(entity,snapshots){
    if(
      !entity?.actionState||
      !Array.isArray(snapshots)
    )return false;

    let changed=false;
    for(const snapshot of snapshots){
      const state=this.state(
        entity,
        String(snapshot?.stateKey||'')
      );
      if(!state)continue;

      const angle=Number(snapshot.angle);
      const originX=Number(snapshot.originX);
      const originY=Number(snapshot.originY);
      if(Number.isFinite(angle))state.angle=angle;
      if(Number.isFinite(originX))state.originX=originX;
      if(Number.isFinite(originY))state.originY=originY;
      changed=true;
    }
    if(changed)this.updatePresentation(entity);
    return changed;
  },
  updatePresentation(entity){
    if(!entity?.actionState)return false;

    let updated=false;
    for(const state of entity.actionState.values()){
      if(
        state?.kind!==this.KIND||
        !state.presentationKey
      )continue;

      const effect=
        EffectSpawnService.getByKey(
          state.presentationKey
        );
      if(!effect)continue;

      effect.x=state.originX;
      effect.y=state.originY;
      effect.angle=state.angle;
      updated=true;
    }
    return updated;
  },
  start(entity,module,angle=0,now=performance.now()){
    if(!entity?.alive||!entity.actionState)return false;

    const stateKey=
      String(module.stateKey||'attack-channel');
    if(this.state(entity,stateKey))return false;
    entity.actionState.delete(
      `${stateKey}:gauge-complete`
    );

    const attackId=String(module.attackId||'');
    const channelAttack=
      AbilityService.attackById(
        entity.character,
        attackId
      );
    if(!channelAttack)return false;

    const chargeDuration=
      Math.max(
        0,
        Number(module.chargeDuration)||0
      );

    const state={
      kind:this.KIND,
      stateKey,
      attackId,
      phase:
        chargeDuration>0
          ?'charging'
          :'active',
      startedAt:now,
      activeAt:now+chargeDuration,
      nextTickAt:now+chargeDuration,
      interval:Math.max(
        GAME_DATA.frameMs,
        Number(module.interval)||GAME_DATA.frameMs
      ),
      fireSound:String(module.fireSound||''),
      angle:Number(angle)||0,
      initialAngle:Number(angle)||0,
      originX:Number(entity.x)||0,
      originY:Number(entity.y)||0,
      followSourcePosition:module.followSourcePosition===true,
      aimMode:String(module.aimMode||'locked'),
      maxAngleDrift:Number.isFinite(Number(module.maxAngleDrift))
        ?Math.max(0,Number(module.maxAngleDrift))
        :Infinity,
      maxTicks:Math.max(0,Math.floor(Number(module.maxTicks)||0)),
      finishDelay:
        module.finishDelay==='attack-animation'
          ?this.attackAnimationDuration(channelAttack)
          :Math.max(0,Number(module.finishDelay)||0),
      finishAt:0,
      finishReady:false,
      tickCount:0,
      stopField:module.stopField&&typeof module.stopField==='object'
        ?AugmentService.prepareAttackLinkedGeometry(
          entity,
          channelAttack,
          {
            ...module.stopField,
            type:'field.area'
          },
          now,
          {recursive:true}
        )
        :null,
      presentation:module.presentation&&typeof module.presentation==='object'
        ?AugmentService.prepareAttackLinkedGeometry(
          entity,
          channelAttack,
          module.presentation,
          now,
          {visual:true}
        )
        :null,
      gauge:module.gauge&&typeof module.gauge==='object'
        ?module.gauge
        :null,
      actionLocks:Array.isArray(module.actionLocks)
        ?new Set(module.actionLocks.map(String))
        :null,
      presentationKey:null,
      drainStateKey:String(module.drainStateKey||''),
      drainAmount:Math.max(0,Number(module.drainAmount)||0),
      selfStatus:
        module.selfStatus&&
        COMBAT_STATUS_DEFS[
          String(module.selfStatus.status||'')
        ]
          ?{
            status:String(module.selfStatus.status),
            data:{...(module.selfStatus.data||{})},
            applyDuringCharge:
              module.selfStatus.applyDuringCharge===true
          }
          :null,
      selfStatusSourceId:
        `channel:${entity.id}:${stateKey}:self-status`,
      selfStatusApplied:false,
      cooldownMs:Math.max(0,Number(module.cooldownMs)||0),
      cooldownAttackIds:
        Array.isArray(module.cooldownAttackIds)
          ?module.cooldownAttackIds.map(String)
          :[],
      windupAttackId:
        String(
          module.windupAttackId||
          ''
        ),
      interruptOnForcedMovement:
        module.interruptOnForcedMovement!==false&&
        AttackWindupService.isTaggedAttackId(
          entity,
          String(
            module.windupAttackId||
            ''
          )
        )
    };

    if(state.maxTicks>0){
      state.expiresAt=
        state.activeAt+
        state.interval*Math.max(0,state.maxTicks-1)+
        state.finishDelay+
        GAME_DATA.frameMs;
    }else{
      state.expiresAt=Infinity;
    }

    entity.actionState.set(stateKey,state);

    if(state.presentation){
      const duration=Number.isFinite(state.expiresAt)
        ?Math.max(GAME_DATA.frameMs,state.expiresAt-now)
        :Math.max(GAME_DATA.frameMs,Number(state.presentation.duration)||1000);
      const key=`channel-presentation:${entity.id}:${stateKey}`;
      state.presentationKey=key;
      EffectSpawnService.spawn({
        ...state.presentation,
        type:String(state.presentation.renderType||state.presentation.type||'beamLine'),
        key,
        sourceEntityId:entity.id,
        x:state.originX,
        y:state.originY,
        angle:state.angle,
        start:now,
        dur:duration
      },{source:entity});
    }

    if(
      chargeDuration<=0||
      state.selfStatus?.applyDuringCharge===true
    ){
      this.applySelfStatus(
        entity,
        state
      );
    }

    if(chargeDuration>0){
      const base=
        AbilityService.attackById(
          entity.character,
          attackId
        );
      if(base){
        entity.attackPreview=
          AttackPreviewService.fromAttack(
            entity,
            base,
            state.angle,
            state.activeAt
          );
      }
    }

    return true;
  },
  interruptCharging(
    entity,
    reason='forced-movement'
  ){
    if(!entity?.actionState)return false;

    const keys=[];

    for(const [key,state] of entity.actionState){
      if(
        state?.kind!==this.KIND||
        state.phase!=='charging'||
        state.interruptOnForcedMovement===false
      ){
        continue;
      }

      keys.push(
        String(key)
      );
    }

    let stopped=false;

    for(const key of keys){
      stopped=
        this.stop(
          entity,
          key,
          performance.now(),
          {
            applyCooldown:true,
            createStopField:false,
            completeGauge:false
          }
        )||
        stopped;
    }

    if(stopped){
      entity.attackPreview=null;

      GameEvents.emit(
        'attack-channel-charge-interrupted',
        {
          target:entity,
          reason
        }
      );
    }

    return stopped;
  },

  locksAction(entity,action){
    if(!entity?.actionState)return false;
    const key=String(action||'');
    if(!key)return false;
    for(const state of entity.actionState.values()){
      if(
        state?.kind===this.KIND&&
        state.actionLocks instanceof Set&&
        state.actionLocks.has(key)
      )return true;
    }
    return false;
  },
  hasGauge(entity){
    if(!entity?.actionState)return false;
    if(!duels3CanViewTeamGauge(entity))return false;
    for(const state of entity.actionState.values()){
      if(
        (
          state?.kind===this.KIND||
          state?.kind===this.GAUGE_COMPLETE_KIND
        )&&
        state.gauge
      )return true;
    }
    return false;
  },
  hasFlash(entity){
    if(!entity?.actionState)return false;
    if(!duels3CanViewTeamGauge(entity))return false;
    for(const state of entity.actionState.values()){
      if(
        state?.kind===this.GAUGE_COMPLETE_KIND&&
        Number(state.readyFlashUntil)>performance.now()
      )return true;
    }
    return false;
  },
  drawGauge(ctx,entity,now=performance.now()){
    if(!ctx||!entity?.actionState)return false;
    if(!duels3CanViewTeamGauge(entity))return false;
    for(const state of entity.actionState.values()){
      if(
        !(
          state?.kind===this.KIND||
          state?.kind===this.GAUGE_COMPLETE_KIND
        )||
        !state.gauge
      )continue;

      const completed=
        state.kind===this.GAUGE_COMPLETE_KIND;
      const total=completed
        ?1
        :Math.max(
          GAME_DATA.frameMs,
          Number(state.expiresAt)-Number(state.startedAt)
        );
      const progress=completed
        ?1
        :Math.max(
          0,
          Math.min(1,(now-Number(state.startedAt))/total)
        );
      const style=state.gauge;
      const radius=EntityRingLayoutService.chargeRadius(entity);
      const color=style.color||entity.color;

      ArcGaugePresentationService.render(ctx,entity,progress,{
        color,
        lineWidth:Number(style.lineWidth)||EntityRingLayoutService.WIDTHS.gauge,
        lineCap:String(style.lineCap||'butt'),
        radius,
        showEmpty:true,
        completeAccent:progress>=1
      });

      if(
        completed&&
        Number(state.readyFlashUntil)>now
      ){
        ArcGaugePresentationService.render(ctx,entity,1,{
          color,
          radius,
          completeAccent:true,
          hideArcAtComplete:true,
          maxChargeFlash:true,
          completePulseColor:style.flashColor||color,
          completePulseRadius:EntityRingLayoutService.maxChargeFlashRadius(entity,now)
        });
      }
      return true;
    }
    return false;
  },
  applySelfStatus(
    entity,
    state
  ){
    if(
      !entity||
      !state?.selfStatus||
      state.selfStatusApplied===true
    )return false;

    const applied=
      CombatStatusApplicationService.apply({
        source:entity,
        target:entity,
        type:state.selfStatus.status,
        duration:Infinity,
        sourceId:state.selfStatusSourceId,
        data:{
          ...state.selfStatus.data,
          sourceEntityId:entity.id
        }
      });

    state.selfStatusApplied=
      applied===true;
    return applied;
  },
  clearSelfStatus(
    entity,
    state
  ){
    if(
      !entity||
      !state?.selfStatus||
      !state.selfStatusSourceId
    )return false;

    const removed=
      CCService.removeSource(
        entity,
        state.selfStatus.status,
        state.selfStatusSourceId
      );
    state.selfStatusApplied=false;
    return removed;
  },
  stop(
    entity,
    stateKey,
    now=performance.now(),
    {
      applyCooldown=true,
      createStopField=true,
      completeGauge=false
    }={}
  ){
    const state=this.state(entity,stateKey);
    if(!state)return false;

    this.clearSelfStatus(
      entity,
      state
    );

    if(state.presentationKey){
      EffectSpawnService.removeKey(state.presentationKey);
    }

    const completionFlashDuration=
      completeGauge
        ?Math.max(
          0,
          Number(state.gauge?.completionFlashDuration)||0
        )
        :0;

    if(
      createStopField&&
      state.stopField&&
      EntitySimulationAuthorityService.isLocal(entity)
    ){
      const elapsed=Math.max(0,now-state.startedAt);
      const multiplier=Math.max(0,Number(state.stopField.durationFromElapsedMultiplier)||0);
      const minDuration=Math.max(GAME_DATA.frameMs,Number(state.stopField.minDuration)||GAME_DATA.frameMs);
      const maxDuration=Number.isFinite(Number(state.stopField.maxDuration))
        ?Math.max(minDuration,Number(state.stopField.maxDuration))
        :Infinity;
      const duration=multiplier>0
        ?Math.min(maxDuration,Math.max(minDuration,elapsed*multiplier))
        :Math.min(maxDuration,Math.max(minDuration,Number(state.stopField.duration)||minDuration));
      const fieldModule={
        ...state.stopField,
        duration,
        angle:state.angle,
        presentation:state.stopField.presentation
          ?{...state.stopField.presentation,angle:state.angle}
          :state.stopField.presentation
      };
      InstalledAreaFieldService.activatePoint(
        entity,
        fieldModule,
        {x:state.originX,y:state.originY},
        {now}
      );
    }

    entity.actionState.delete(
      String(stateKey||'')
    );
    if(completionFlashDuration>0){
      entity.actionState.set(
        `${String(stateKey||'')}:gauge-complete`,
        {
          kind:this.GAUGE_COMPLETE_KIND,
          gauge:state.gauge,
          readyFlashUntil:now+completionFlashDuration
        }
      );
    }
    if(entity.attackPreview){
      entity.attackPreview=null;
    }

    if(applyCooldown&&state.cooldownMs>0){
      for(const attackId of state.cooldownAttackIds){
        entity.cooldowns.set(
          attackId,
          now+state.cooldownMs
        );
      }
    }

    return true;
  },
  update(entity,now=performance.now()){
    if(!entity?.actionState)return false;

    let updated=false;

    for(const [actionStateKey,state] of entity.actionState){
      if(state?.kind===this.GAUGE_COMPLETE_KIND){
        if(now>=Number(state.readyFlashUntil)||!entity.alive){
          entity.actionState.delete(actionStateKey);
        }
        continue;
      }
      if(state?.kind!==this.KIND)continue;

      if(!entity.alive){
        this.stop(
          entity,
          state.stateKey,
          now,
          {applyCooldown:false,createStopField:false}
        );
        continue;
      }

      if(state.followSourcePosition===true){
        state.originX=Number(entity.x)||0;
        state.originY=Number(entity.y)||0;
      }

      if(
        state.aimMode==='live-source'&&
        entity===Training.player
      ){
        const liveAngle=Training.aimAngle();
        if(Number.isFinite(state.maxAngleDrift)){
          let diff=((liveAngle-state.initialAngle)+Math.PI*3)%(Math.PI*2)-Math.PI;
          diff=Math.max(-state.maxAngleDrift,Math.min(state.maxAngleDrift,diff));
          state.angle=state.initialAngle+diff;
        }else{
          state.angle=liveAngle;
        }
      }

      if(state.phase==='charging'){
        if(entity.attackPreview){
          const base=
            AbilityService.attackById(
              entity.character,
              state.attackId
            );
          if(base){
            entity.attackPreview=
              AttackPreviewService.fromAttack(
                entity,
                base,
                state.angle,
                state.activeAt,
                entity.attackPreview
              );
          }
        }

        if(now<state.activeAt)continue;

        state.phase='active';
        state.nextTickAt=now;
        entity.attackPreview=null;
        this.applySelfStatus(
          entity,
          state
        );
      }

      if(state.phase==='finishing'){
        if(now<state.finishAt)continue;

        /*
          종료 공격의 animation damage가 같은 프레임의 후단 Effect update에서
          마지막 progress를 소비할 수 있도록 한 update 경계를 보장한다.
        */
        if(state.finishReady!==true){
          state.finishReady=true;
          continue;
        }

        this.stop(
          entity,
          state.stateKey,
          now,
          {
            applyCooldown:false,
            createStopField:true,
            completeGauge:true
          }
        );
        updated=true;
        continue;
      }

      if(state.phase!=='active')continue;

      while(now>=state.nextTickAt&&entity.alive){
        const base=
          AbilityService.attackById(
            entity.character,
            state.attackId
          );
        if(!base){
          this.stop(
            entity,
            state.stateKey,
            now,
            {applyCooldown:false}
          );
          break;
        }

        const preparedBase=
          AugmentService.prepareAttack(
            entity,
            base,
            state.nextTickAt
          );
        const prepared=
          state.tickCount===0&&state.fireSound
            ?Object.freeze({
              ...preparedBase,
              fireSound:state.fireSound
            })
            :preparedBase;

        TriggeredAttackService.execute(
          entity,
          prepared,
          state.angle
        );
        state.tickCount++;

        if(
          state.maxTicks>0&&
          state.tickCount>=state.maxTicks
        ){
          if(state.finishDelay>0){
            state.phase='finishing';
            state.finishAt=
              state.nextTickAt+
              state.finishDelay;
            state.finishReady=false;
          }else{
            this.stop(
              entity,
              state.stateKey,
              state.nextTickAt,
              {
                applyCooldown:false,
                createStopField:true,
                completeGauge:true
              }
            );
          }
          updated=true;
          break;
        }

        if(
          state.drainStateKey&&
          state.drainAmount>0
        ){
          ProgressStateService.consume(
            entity,
            state.drainStateKey,
            state.drainAmount
          );

          const resource=
            ProgressStateService.state(
              entity,
              state.drainStateKey
            );

          if(!resource||(Number(resource.value)||0)<=0){
            this.stop(
              entity,
              state.stateKey,
              now
            );
            updated=true;
            break;
          }
        }

        state.nextTickAt+=state.interval;
        updated=true;

        // 탭이 오래 멈췄다가 복귀했을 때 한 프레임에 무한 catch-up하지 않는다.
        if(now-state.nextTickAt>state.interval*4){
          state.nextTickAt=now+state.interval;
          break;
        }
      }
    }

    this.updatePresentation(entity);
    return updated;
  }
});