

const MovementAbilityService=Object.freeze({
  KIND:'movement-ability-state',

  resolveKinematics(spec={},runtimeDistance=null){
    const hasRuntimeDistance=
      runtimeDistance!==null&&
      runtimeDistance!==undefined&&
      Number.isFinite(Number(runtimeDistance));

    const hasSpeed=Number.isFinite(Number(spec.speed))&&Number(spec.speed)>0;
    const hasDuration=Number.isFinite(Number(spec.duration))&&Number(spec.duration)>0;
    const hasDistance=hasRuntimeDistance
      ?Number(runtimeDistance)>=0
      :Number.isFinite(Number(spec.distance))&&Number(spec.distance)>=0;

    let speed=hasSpeed?Number(spec.speed):null;
    let duration=hasDuration?Number(spec.duration):null;
    let distance=hasRuntimeDistance
      ?Math.max(0,Number(runtimeDistance))
      :(hasDistance?Math.max(0,Number(spec.distance)):null);

    const count=(speed!==null?1:0)+(duration!==null?1:0)+(distance!==null?1:0);
    if(count!==2){
      return {
        valid:false,
        reason:`movement.move requires exactly two of speed/duration/distance, got ${count}`
      };
    }

    if(distance===null){
      distance=speed*(duration/1000);
    }else if(duration===null){
      duration=distance/Math.max(.001,speed)*1000;
    }else if(speed===null){
      speed=distance/Math.max(1,duration)*1000;
    }

    const speedMultiplier=
      Math.max(
        .001,
        Number(spec.speedMultiplier)||1
      );
    if(Math.abs(speedMultiplier-1)>1e-9){
      speed*=speedMultiplier;
      duration/=speedMultiplier;
    }

    return {
      valid:true,
      speed:Math.max(.001,speed),
      duration:Math.max(GAME_DATA.frameMs,duration),
      distance:Math.max(0,distance)
    };
  },

  remoteStateActive(entity,now=performance.now()){
    if(entity?._remoteMovementAbilityActive!==true)return false;

    const state=entity?._remoteMovementEffectState;
    if(!state)return false;

    const endsAt=Number(state.endsAt);
    if(
      Number.isFinite(endsAt)&&
      endsAt<=now
    ){
      entity._remoteMovementAbilityActive=false;
      entity._remoteMovementEffectState=null;
      EffectSpawnService.removeKey(
        `movement-effect:${entity.id}:${state.stateKey}`
      );
      return false;
    }

    return true;
  },

  state(entity,stateKey='movement:move'){
    const key=String(stateKey||'movement:move');

    if(
      entity&&
      Training.sessionMode==='online'&&
      !EntitySimulationAuthorityService
        .isLocal(entity)
    ){
      const remote=
        this.remoteStateActive(entity)
          ?entity._remoteMovementEffectState||null
          :null;

      if(remote?.stateKey===key){
        return remote;
      }
    }

    const value=
      entity?.actionState?.get(key)||
      null;

    if(value?.kind===this.KIND){
      return value;
    }

    const remote=
      this.remoteStateActive(entity)
        ?entity?._remoteMovementEffectState||null
        :null;

    return remote?.stateKey===key
      ?remote
      :null;
  },

  active(entity){
    if(
      entity&&
      Training.sessionMode==='online'&&
      !EntitySimulationAuthorityService.isLocal(entity)
    ){
      return this.remoteStateActive(entity);
    }

    if(entity?.actionState){
      for(const value of entity.actionState.values()){
        if(value?.kind===this.KIND)return true;
      }
    }

    return this.remoteStateActive(entity);
  },
  deferAttacks(entity){
    if(
      entity&&
      Training.sessionMode==='online'&&
      !EntitySimulationAuthorityService.isLocal(entity)
    ){
      return (
        this.remoteStateActive(entity)&&
        entity?._remoteMovementEffectState?.
          deferAttacksUntilEnd===true
      );
    }

    if(entity?.actionState){
      for(const value of entity.actionState.values()){
        if(
          value?.kind===this.KIND&&
          value.deferAttacksUntilEnd===true
        )return true;
      }
    }

    return (
      this.remoteStateActive(entity)&&
      entity?._remoteMovementEffectState?.
        deferAttacksUntilEnd===true
    );
  },
  presentation(entity,now=performance.now()){
    if(!entity){
      return ArcTrajectoryService.sample(0,null);
    }

    if(
      Training.sessionMode==='online'&&
      !EntitySimulationAuthorityService.isLocal(entity)
    ){
      const state=
        this.remoteStateActive(entity,now)
          ?entity._remoteMovementEffectState||null
          :null;

      if(state){
        const duration=
          Math.max(
            GAME_DATA.frameMs,
            Number(state.duration)||GAME_DATA.frameMs
          );
        const progress=
          Math.max(
            0,
            Math.min(
              1,
              (now-Number(state.startedAt||now))/duration
            )
          );

        return ArcTrajectoryService.sample(
          progress,
          state.trajectory||null
        );
      }
    }

    if(entity.actionState){
      for(const state of entity.actionState.values()){
        if(state?.kind!==this.KIND)continue;
        const progress=
          state.distance>0
            ?Math.max(
              0,
              Math.min(
                1,
                state.traveled/state.distance
              )
            )
            :0;
        return ArcTrajectoryService.sample(
          progress,
          state.trajectory||null
        );
      }
    }

    return ArcTrajectoryService.sample(0,null);
  },

  drawPath(ctx,entity){
    if(!ctx||!entity?.actionState)return false;
    let drawn=false;
    for(const state of entity.actionState.values()){
      if(
        state?.kind!==this.KIND||
        !Array.isArray(state.pathPoints)||
        !state.pathPoints.length||
        state.presentation?.pathVisible!==true
      )continue;
      const startIndex=Math.max(0,Math.min(state.pathPoints.length,state.pathIndex||0));
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(Number(entity.x)||0,Number(entity.y)||0);
      for(let index=startIndex;index<state.pathPoints.length;index++){
        const point=state.pathPoints[index];
        ctx.lineTo(Number(point?.x)||0,Number(point?.y)||0);
      }
      ctx.strokeStyle=`rgba(${String(state.presentation.pathColor||state.presentation.color||'255,215,0')},${Math.max(0,Math.min(1,Number(state.presentation.pathAlpha)||.35))})`;
      ctx.lineWidth=Math.max(.5,Number(state.presentation.pathWidth)||2);
      ctx.setLineDash(Array.isArray(state.presentation.pathDash)?state.presentation.pathDash:[6,4]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
      drawn=true;
    }
    return drawn;
  },

  effectSpec(effect,entity,state,trigger,now){
    if(!effect||effect.type!=='effect.spawn'||effect.trigger!==trigger)return null;
    const atStart=String(effect.position||'source')==='start';
    const duration=
      effect.duration==='movement'
        ?Math.max(
          GAME_DATA.frameMs,
          Number(state.duration)||
          Math.max(0,state.endsAt-state.startedAt)
        )
        :Math.max(
          GAME_DATA.frameMs,
          Number(effect.duration)||
          Number(effect.durationFrames)*GAME_DATA.frameMs||
          GAME_DATA.frameMs
        );
    const effectStart=
      trigger==='start'&&
      Number.isFinite(Number(state.startedAt))
        ?Number(state.startedAt)
        :now;
    return {
      ...effect,
      x:atStart?state.startX:Number(entity.x)||0,
      y:atStart?state.startY:Number(entity.y)||0,
      start:effectStart,
      dur:duration,
      color:entity.color,
      fillColor:ColorService.rgbString(entity.color),
      strokeColor:ColorService.rgbString(entity.color),
      sourceEntityId:entity.id,
      preserveTimeline:effect.variant==='idle',
      key:
        effect.variant==='idle'
          ?(
            trigger==='end'
              ?`movement-effect-end-idle:${entity.id}:${state.stateKey}`
              :`movement-effect:${entity.id}:${state.stateKey}`
          )
          :trigger==='end'
            ?`movement-effect-end:${entity.id}:${state.stateKey}`
            :null
    };
  },

  spawnEffects(entity,state,trigger,now=performance.now()){
    const spawned=[];

    for(const effect of state.effects||[]){
      const spec=this.effectSpec(
        effect,
        entity,
        state,
        trigger,
        now
      );
      if(!spec)continue;

      const instance=EffectSpawnService.spawn(
        spec,
        {source:entity}
      );
      if(instance){
        spawned.push({
          spec,
          instance
        });
      }
    }

    return spawned;
  },

  broadcastEffects(entity,spawned,now=performance.now(),filter=null){
    if(
      !Array.isArray(spawned)||
      !spawned.length||
      Training.sessionMode!=='online'||
      typeof OnlinePresentationSyncService==='undefined'||
      !OnlinePresentationSyncService.shouldSend(entity)
    ){
      return false;
    }

    let sent=false;
    for(const item of spawned){
      if(!item?.instance)continue;
      if(
        typeof filter==='function'&&
        !filter(item)
      )continue;

      OnlinePresentationSyncService.send(
        'effect-spawn',
        entity,
        {
          effect:
            EffectSpawnService.presentationSnapshot(
              item.instance,
              now
            )
        }
      );
      sent=true;
    }
    return sent;
  },

  applyBuffs(entity,state,module,now=performance.now()){
    for(const buff of module?.buffs||[]){
      if(!COMBAT_BUFF_DEFS[buff?.type])continue;
      const duration=buff.duration==='movement'
        ?Math.max(GAME_DATA.frameMs,state.endsAt-now)
        :Math.max(0,Number(buff.duration)||0);
      BuffService.set(
        entity,
        buff.type,
        Number(buff.value)||0,
        `movement:${state.stateKey}:${buff.type}`,
        duration,
        buff.data||{}
      );
      state.buffTypes.push(buff.type);
    }
  },

  clearBuffs(entity,state){
    for(const type of state?.buffTypes||[]){
      BuffService.remove(
        entity,
        type,
        `movement:${state.stateKey}:${type}`
      );
    }
  },

  normalizeCollision(module={}){
    const motionMode=
      String(module.motionMode||'normal');

    if(motionMode==='knockback'){
      return CollisionPolicyService.normalize({
        passWalls:false,
        passEnemies:
          module.collision?.passEnemies===true
      });
    }

    return CollisionPolicyService.normalize({
      passWalls:true,
      passEnemies:false,
      ...(module.collision||{})
    });
  },

  start(entity,module,angle=0,options={},now=performance.now()){
    if(!entity?.actionState||!module)return false;

    const stateKey=String(module.stateKey||'movement:move');


    if(this.active(entity)){
      if(module.replaceActive!==true)return false;
      this.clear(entity);
    }

    let runtimeDistance=
      options.runtimeDistance!==null&&
      options.runtimeDistance!==undefined&&
      Number.isFinite(Number(options.runtimeDistance))
        ?Number(options.runtimeDistance)
        :null;

    let resolvedTargetPoint=
      module.direction==='target-point'&&
      options.targetPoint&&
      Number.isFinite(Number(options.targetPoint.x))&&
      Number.isFinite(Number(options.targetPoint.y))
        ?{x:Number(options.targetPoint.x),y:Number(options.targetPoint.y)}
        :null;

    // target-point 이동이 자체 distance를 가진 경우 해당 값은 최대 사거리다.
    // 런타임 마우스 좌표가 더 멀어도 이동 자체가 설정 사거리를 넘어가지 않게 공통 clamp한다.
    if(
      resolvedTargetPoint&&
      Number.isFinite(Number(module.distance))&&
      Number(module.distance)>=0
    ){
      const dx=resolvedTargetPoint.x-entity.x;
      const dy=resolvedTargetPoint.y-entity.y;
      const distance=Math.hypot(dx,dy);
      const maxDistance=Math.max(0,Number(module.distance));
      if(distance>maxDistance&&distance>0){
        const ratio=maxDistance/distance;
        resolvedTargetPoint={
          x:entity.x+dx*ratio,
          y:entity.y+dy*ratio
        };
      }
      if(runtimeDistance===null||runtimeDistance>maxDistance){
        runtimeDistance=Math.min(distance,maxDistance);
      }
    }else if(
      runtimeDistance===null&&
      resolvedTargetPoint
    ){
      runtimeDistance=Math.hypot(
        resolvedTargetPoint.x-entity.x,
        resolvedTargetPoint.y-entity.y
      );
    }

    const pathPoints=
      Array.isArray(options.pathPoints)
        ?options.pathPoints
          .filter(point=>
            Number.isFinite(Number(point?.x))&&
            Number.isFinite(Number(point?.y))
          )
          .map(point=>({
            x:Number(point.x),
            y:Number(point.y)
          }))
        :null;

    if(pathPoints?.length){
      let px=Number(entity.x)||0;
      let py=Number(entity.y)||0;
      let total=0;
      for(const point of pathPoints){
        total+=Math.hypot(point.x-px,point.y-py);
        px=point.x;
        py=point.y;
      }
      runtimeDistance=total;
    }

    const kinematics=this.resolveKinematics(
      module,
      runtimeDistance
    );
    if(!kinematics.valid){
      console.warn('[movement.move]',kinematics.reason,module);
      return false;
    }

    // 기존 저수준 강제 이동이 남아 있다면 completion까지 확정한 뒤 자기 이동기를 시작한다.
    // neutralize knockback을 단순 null 처리하면 Infinity 상태가 남을 수 있다.
    if(entity.forcedMotion){
      MovementService.finalizeForcedMotion(entity);
    }

    const control=String(module.control||'fixed')==='input'?'input':'fixed';
    const requestedAngle=Number.isFinite(Number(options.angle))
      ?Number(options.angle)
      :Number(angle)||0;
    let fixedAngle=
      control==='input'&&Number.isFinite(Number(entity.lastMovementInputAngle))
        ?Number(entity.lastMovementInputAngle)
        :requestedAngle;

    let targetX=null;
    let targetY=null;
    if(resolvedTargetPoint){
      targetX=resolvedTargetPoint.x;
      targetY=resolvedTargetPoint.y;
      fixedAngle=Math.atan2(targetY-entity.y,targetX-entity.x);
    }

    if(module.cancelDodgeState===true){
      if(entity.forcedMotion){
        MovementService.finalizeForcedMotion(entity);
      }
      entity.dodgeUntil=0;
      AugmentDodgeSequenceService.reset(entity);
      entity.invincibleUntil=0;
      entity.justCheck=null;
      entity.justDodgeStartedAt=0;
      entity.justDodgeWindowUntil=0;
      entity.justDodgeConsumed=false;
      BuffService.remove(entity,'invulnerable','system:dodge');
    }

    const state={
      kind:this.KIND,
      stateKey,
      startedAt:now,
      endsAt:now+kinematics.duration,
      startX:Number(entity.x)||0,
      startY:Number(entity.y)||0,
      speed:kinematics.speed,
      duration:kinematics.duration,
      distance:
        targetX!==null&&targetY!==null
          ?Math.hypot(targetX-entity.x,targetY-entity.y)
          :kinematics.distance,
      traveled:0,
      control,
      angle:fixedAngle,
      targetX,
      targetY,
      pathPoints:pathPoints?.length?[...pathPoints]:null,
      pathIndex:0,
      easing:String(module.easing||'linear'),
      lastInputAngle:fixedAngle,
      hasInputDirection:false,
      collision:this.normalizeCollision(module),
      enemyCollisionOvershoot:
        module.collision?.passEnemies===false
          ?(
            Number.isFinite(Number(module.collision?.enemyOvershoot))
              ?Math.max(0,Number(module.collision.enemyOvershoot))
              :24
          )
          :0,
      tags:[...new Set([
        ...(Array.isArray(module.tags)?module.tags:[]),
        ...TagService.derivedModuleTags([module],{character:entity.character})
      ])],
      presentation:module.presentation?{...module.presentation}:null,
      resolveOverlapOnEnd:
        module.resolveOverlapOnEnd===true||
        entity.kind==='summon',
      effects:[...(module.effects||[])],
      buffTypes:[],
      trajectory:
        options.trajectory||
        module.trajectory||
        null,
      followup:options.followup||null,
      deferAttacksUntilEnd:
        module.deferAttacksUntilEnd===true,
      blocksAction:
        module.blocksAction===true,
      onEndAttackIds:
        Array.isArray(module.onEndAttackIds)
          ?module.onEndAttackIds.map(String)
          :[],
      onEndShareHitTargets:module.onEndShareHitTargets===true,
      executionSequence:
        Math.max(
          0,
          Number(options.executionSequence)||0
        ),
      presentationDistance:0,
      pathDamageEffects:[],
      damagePathSegments:[]
    };

    state.presentationDistance=
      state.control==='fixed'&&!state.pathPoints?.length
        ?CollisionPolicyService.entityTravelDistance(
          entity,
          state.angle,
          state.distance,
          state.collision
        )
        :state.distance;

    entity.actionState.set(stateKey,state);
    this.applyBuffs(entity,state,module,now);

    const presentationAuthority=
      Training.sessionMode!=='online'||
      EntitySimulationAuthorityService.isLocal(entity);

    if(
      state.tags.includes('이동기')&&
      module.presentation!==false&&
      presentationAuthority
    ){
      const presentation=module.presentation||{type:'dash-line',width:6,alpha:.4,duration:167};
      if(presentation.resolveOnFinish===true){
        state.resolvedMovementPresentation={...presentation};
      }else{
        const presentationDistance=
          Math.max(
            0,
            Number(state.presentationDistance)||
            Number(state.distance)||
            0
          );
        if(state.pathPoints?.length){
          let px=state.startX,py=state.startY;
          for(const point of state.pathPoints){
            MovementPresentationService.pushLine(entity,px,py,point.x,point.y,presentation);
            px=point.x;py=point.y;
          }
        }else{
          const destinationX=state.startX+Math.cos(state.angle)*presentationDistance;
          const destinationY=state.startY+Math.sin(state.angle)*presentationDistance;
          MovementPresentationService.pushLine(entity,state.startX,state.startY,destinationX,destinationY,presentation);
        }
      }
    }

    const startedEffects=this.spawnEffects(
      entity,
      state,
      'start',
      now
    );

    // start의 순간성 pulse는 state snapshot으로 재구성하지 않고
    // 로컬에서 실제 생성한 EffectSpec 그대로 한 번만 전송한다.
    this.broadcastEffects(
      entity,
      startedEffects,
      now,
      item=>item?.spec?.variant!=='idle'
    );
    return true;
  },

  startFollowup(entity,state,followup,now){
    if(!followup)return false;
    const kinematics=this.resolveKinematics(followup,null);
    if(!kinematics.valid){
      console.warn('[movement.move followup]',kinematics.reason,followup);
      return false;
    }

    state.startedAt=now;
    state.endsAt=now+kinematics.duration;
    state.startX=Number(entity.x)||0;
    state.startY=Number(entity.y)||0;
    state.speed=kinematics.speed;
    state.duration=kinematics.duration;
    state.distance=kinematics.distance;
    state.traveled=0;
    state.control='fixed';
    state.angle=Number(followup.angle)||0;
    state.lastInputAngle=state.angle;
    state.hasInputDirection=true;
    state.collision=this.normalizeCollision(followup);
    state.tags=Array.isArray(followup.tags)
      ?[...followup.tags]
      :[];
    state.followup=followup.followup||null;
    return true;
  },

  finish(entity,state,now=performance.now()){
    if(!entity||!state)return false;

    if(state.resolvedMovementPresentation){
      const presentationAuthority=
        Training.sessionMode!=='online'||
        EntitySimulationAuthorityService.isLocal(entity);
      const moved=Math.hypot((Number(entity.x)||0)-(Number(state.startX)||0),(Number(entity.y)||0)-(Number(state.startY)||0));
      if(presentationAuthority&&moved>.001){
        MovementPresentationService.pushLine(entity,Number(state.startX)||0,Number(state.startY)||0,Number(entity.x)||0,Number(entity.y)||0,state.resolvedMovementPresentation);
      }
      state.resolvedMovementPresentation=null;
    }

    if(entity.actionState?.get(state.stateKey)===state){
      entity.actionState.delete(state.stateKey);
    }

    this.clearBuffs(entity,state);

    if(state.resolveOverlapOnEnd){
      MovementService.resolveEmbedded(entity);
    }

    // 이동 종료 순간 '출발/이동 중' idle만 제거한다.
    // 종료 idle은 별도 key를 사용하므로 이후 원격 active:false 패킷에도 삭제되지 않는다.
    EffectSpawnService.removeKey(
      `movement-effect:${entity.id}:${state.stateKey}`
    );

    const spawned=this.spawnEffects(
      entity,
      state,
      'end',
      now
    );

    this.broadcastEffects(
      entity,
      spawned,
      now
    );

    if(typeof ChargedAttackService!=='undefined'){
      ChargedAttackService.releaseQueued(entity,now);
    }

    if(
      entity.alive&&
      EntitySimulationAuthorityService.isLocal(entity)
    ){
      for(const attackId of state.onEndAttackIds||[]){
        const baseAttack=
          AbilityService.attackById(
            entity.character,
            attackId
          );
        if(!baseAttack)continue;

        const scaledAttack=
          ProgressScaledAttackService.resolve(
            entity,
            baseAttack
          );
        const attack=
          AugmentService.prepareAttack(
            entity,
            scaledAttack,
            now
          );
        TriggeredAttackService.execute(
          entity,
          attack,
          Number(state.angle)||0,
          {hitGroupSequence:state.onEndShareHitTargets===true?state.executionSequence:null}
        );
      }
    }

    return true;
  },

  clear(entity){
    if(!entity?.actionState)return false;
    let changed=false;
    for(const [key,state] of entity.actionState){
      if(state?.kind!==this.KIND)continue;
      this.clearBuffs(entity,state);
      EffectSpawnService.removeKey(
        `movement-effect:${entity.id}:${state.stateKey}`
      );
      entity.actionState.delete(key);
      changed=true;
    }
    entity._remoteMovementAbilityActive=false;
    entity._remoteMovementEffectState=null;
    return changed;
  },

  serialize(entity,now=performance.now()){
    let state=null;
    if(entity?.actionState){
      for(const value of entity.actionState.values()){
        if(value?.kind===this.KIND){state=value;break;}
      }
    }

    if(
      state&&
      Number.isFinite(Number(state.endsAt))&&
      Number(state.endsAt)<=now
    ){
      state=null;
    }

    return {
      active:!!state,
      stateKey:state?state.stateKey:null,
      remaining:state?Math.max(0,state.endsAt-now):0,
      elapsed:state?Math.max(0,now-state.startedAt):0,
      duration:state?Math.max(0,Number(state.duration)||0):0,
      executionSequence:
        state
          ?Math.max(0,Number(state.executionSequence)||0)
          :0,
      deferAttacksUntilEnd:
        state?.deferAttacksUntilEnd===true,
      trajectory:
        state?.trajectory
          ?{...state.trajectory}
          :null,
      startX:state?state.startX:null,
      startY:state?state.startY:null,
      angle:state?state.angle:null,
      distance:state?state.distance:0,
      presentationDistance:
        state
          ?Math.max(
            0,
            Number(state.presentationDistance)||
            Number(state.distance)||
            0
          )
          :0,
      easing:state?state.easing:'linear',
      effects:state
        ?state.effects.map(
          effect=>
            EffectSpawnService.definitionSnapshot(
              effect
            )
        )
        :[]
    };
  },

  remoteEffectState(entity,payload,now=performance.now()){
    const elapsed=
      Math.max(
        0,
        Number(payload.elapsed)||0
      );
    const duration=
      Math.max(
        GAME_DATA.frameMs,
        Number(payload.duration)||
        elapsed+
        Math.max(0,Number(payload.remaining)||0)
      );

    return {
      stateKey:String(payload.stateKey||'movement:move'),
      startedAt:now-elapsed,
      duration,
      executionSequence:
        Math.max(
          0,
          Number(payload.executionSequence)||0
        ),
      deferAttacksUntilEnd:
        payload.deferAttacksUntilEnd===true,
      trajectory:
        payload.trajectory&&
        typeof payload.trajectory==='object'
          ?{...payload.trajectory}
          :null,
      startX:Number(payload.startX)||Number(entity.x)||0,
      startY:Number(payload.startY)||Number(entity.y)||0,
      angle:Number(payload.angle)||0,
      distance:Math.max(0,Number(payload.distance)||0),
      presentationDistance:
        Math.max(
          0,
          Number(payload.presentationDistance)||
          Number(payload.distance)||
          0
        ),
      easing:String(payload.easing||'linear'),
      endsAt:now+Math.max(0,Number(payload.remaining)||0),
      effects:Array.isArray(payload.effects)?payload.effects:[],
      buffTypes:[]
    };
  },

  applyRemote(entity,payload,now=performance.now()){
    if(!entity||!payload||typeof payload!=='object')return false;

    const wasActive=this.remoteStateActive(
      entity,
      now
    );
    const remaining=
      Math.max(
        0,
        Number(payload.remaining)||0
      );
    const active=
      payload.active===true&&
      remaining>0;
    const state=this.remoteEffectState(
      entity,
      payload,
      now
    );

    entity._remoteMovementAbilityActive=active;

    if(active){
      // 지속형 idle만 state snapshot에서 갱신한다.
      // startedAt/duration이 원본과 같은 timeline이므로 25ms state sync마다
      // fade 진행률이 처음으로 되감기지 않는다.
      for(const effect of state.effects){
        if(
          effect?.type!=='effect.spawn'||
          effect.trigger!=='start'||
          effect.variant!=='idle'
        )continue;

        const spec=this.effectSpec(
          effect,
          entity,
          state,
          'start',
          now
        );
        if(spec){
          EffectSpawnService.spawn(
            spec,
            {source:entity}
          );
        }
      }
    }else if(wasActive){
      // 로컬 finish와 동일하게 '출발/이동 중' idle만 제거한다.
      // 종료 idle/pulse는 별도 key의 실제 EffectSpec을 presentation으로 받아
      // 자신의 전체 수명과 페이드 타임라인을 끝까지 유지한다.
      const previous=
        entity._remoteMovementEffectState||
        state;
      EffectSpawnService.removeKey(
        `movement-effect:${entity.id}:${previous.stateKey}`
      );
    }

    entity._remoteMovementEffectState=
      active?state:null;
    return true;
  },

  travelWithEnemyOvershoot(entity,state,angle,requested){
    const baseRequested=Math.max(0,Number(requested)||0);
    const allowed=CollisionPolicyService.entityTravelDistance(
      entity,
      angle,
      baseRequested,
      state?.collision||{}
    );

    const overshoot=Math.max(
      0,
      Number(state?.enemyCollisionOvershoot)||0
    );
    if(
      overshoot<=0||
      state?.collision?.passEnemies===true||
      allowed>=baseRequested-1e-6
    ){
      return {allowed,enemyCollision:false};
    }

    const enemyDistance=CollisionPolicyService.enemyTravelDistance(
      entity,
      angle,
      baseRequested
    );
    if(
      enemyDistance>=baseRequested-1e-6||
      Math.abs(enemyDistance-allowed)>1e-4
    ){
      return {allowed,enemyCollision:false};
    }

    // 적을 무시했을 때도 같은 지점에서 막힌다면 벽/필드 경계 충돌이므로
    // 적 충돌 오버슈트를 적용하지 않는다.
    const withoutEnemy=CollisionPolicyService.entityTravelDistance(
      entity,
      angle,
      baseRequested,
      {
        ...(state?.collision||{}),
        passEnemies:true
      }
    );
    if(withoutEnemy<=enemyDistance+1e-4){
      return {allowed,enemyCollision:false};
    }

    const remainingDistance=Math.max(
      0,
      (Number(state?.distance)||0)-(Number(state?.traveled)||0)
    );
    const extendedRequested=Math.min(
      remainingDistance,
      enemyDistance+overshoot
    );
    const extendedAllowed=CollisionPolicyService.entityTravelDistance(
      entity,
      angle,
      extendedRequested,
      {
        ...(state?.collision||{}),
        passEnemies:true
      }
    );

    return {
      allowed:Math.max(allowed,extendedAllowed),
      enemyCollision:true
    };
  },

  applyPathDamage(
    entity,
    state,
    fromX,
    fromY,
    toX,
    toY
  ){
    if(!entity||!state)return false;

    const segmentLength=Math.hypot(
      Number(toX)-Number(fromX),
      Number(toY)-Number(fromY)
    );
    const pointContact=segmentLength<=1e-6;

    if(!Array.isArray(state.damagePathSegments)){
      state.damagePathSegments=[];
    }
    state.damagePathSegments.push({
      fromX:Number(fromX)||0,
      fromY:Number(fromY)||0,
      toX:Number(toX)||0,
      toY:Number(toY)||0,
      pointContact
    });
    if(state.damagePathSegments.length>64){
      state.damagePathSegments.splice(
        0,
        state.damagePathSegments.length-64
      );
    }

    if(
      !Array.isArray(state.pathDamageEffects)||
      state.pathDamageEffects.length===0
    ){
      return false;
    }

    let applied=false;
    for(const effect of [...state.pathDamageEffects]){
      if(
        !effect||
        !Training.fx.includes(effect)||
        effect?.animationState?.movementDamageFinished===true
      ){
        continue;
      }

      const bodyContact=
        String(effect?.damage?.hitMode||'')==='body-contact';
      if(pointContact&&!bodyContact){
        continue;
      }

      if(!pointContact){
        EffectSpawnService.appendMovementPathPresentation(
          effect,fromX,fromY,toX,toY
        );
      }
      if(
        EffectSpawnService.applyAnimationDamage(
          effect,
          Number(fromX)||0,
          Number(fromY)||0,
          Number(toX)||0,
          Number(toY)||0,
          {skipMovementValidation:true}
        )
      ){
        applied=true;
      }

      if(effect.animationState){
        effect.animationState.movementDamagePreviousX=
          Number(toX)||0;
        effect.animationState.movementDamagePreviousY=
          Number(toY)||0;
      }
    }
    return applied;
  },

  update(entity,now,dt,movement=null){
    if(!entity?.actionState)return false;

    let state=null;
    for(const value of entity.actionState.values()){
      if(value?.kind===this.KIND){state=value;break;}
    }
    if(!state)return false;

    if(entity.alive===false){
      this.finish(entity,state,now);
      return true;
    }
    if(!EntitySimulationAuthorityService.isLocal(entity))return true;

    const frameStartX=Number(entity.x)||0;
    const frameStartY=Number(entity.y)||0;

    let angle=state.angle;
    if(state.control==='input'){
      const dx=Number(movement?.x)||0;
      const dy=Number(movement?.y)||0;

      if(Math.hypot(dx,dy)>.0001){
        state.lastInputAngle=Math.atan2(dy,dx);
        entity.lastMovementInputAngle=state.lastInputAngle;
        state.hasInputDirection=true;
      }

      angle=state.hasInputDirection
        ?state.lastInputAngle
        :state.angle;
    }

    const remainingDistance=Math.max(0,state.distance-state.traveled);
    if(remainingDistance<=.0001){
      // 실제 이동거리가 0이어도 몸통 접촉 공격은 현재 위치를 1회 판정해야 한다.
      this.applyPathDamage(
        entity,
        state,
        frameStartX,
        frameStartY,
        frameStartX,
        frameStartY
      );
      if(state.followup&&this.startFollowup(entity,state,state.followup,now)){
        return true;
      }
      this.finish(entity,state,now);
      return true;
    }

    const linearRequested=
      state.speed*Math.max(0,Number(dt)||0)/1000;
    let requested=Math.min(
      remainingDistance,
      linearRequested
    );

    if(state.easing!=='linear'){
      const elapsed=Math.max(0,Math.min(state.duration,now-state.startedAt));
      const raw=state.duration>0?elapsed/state.duration:1;
      const eased=EffectSpawnService.ease(raw,state.easing);
      requested=Math.min(
        remainingDistance,
        Math.max(0,state.distance*eased-state.traveled)
      );
    }

    if(state.pathPoints?.length){
      let remainingRequested=requested;
      let moved=0;
      let blocked=false;

      while(
        remainingRequested>1e-6&&
        state.pathIndex<state.pathPoints.length
      ){
        const point=state.pathPoints[state.pathIndex];
        const dx=point.x-entity.x;
        const dy=point.y-entity.y;
        const distance=Math.hypot(dx,dy);

        if(distance<=1e-6){
          state.pathIndex++;
          continue;
        }

        const step=Math.min(distance,remainingRequested);
        const segmentAngle=Math.atan2(dy,dx);
        const allowed=CollisionPolicyService.entityTravelDistance(
          entity,
          segmentAngle,
          step,
          state.collision
        );

        const segmentStartX=entity.x;
        const segmentStartY=entity.y;
        entity.x+=Math.cos(segmentAngle)*allowed;
        entity.y+=Math.sin(segmentAngle)*allowed;
        this.applyPathDamage(entity,state,segmentStartX,segmentStartY,entity.x,entity.y);
        moved+=allowed;
        remainingRequested-=allowed;

        if(allowed+1e-6<step){
          blocked=true;
          break;
        }

        if(step>=distance-1e-6){
          entity.x=point.x;
          entity.y=point.y;
          state.pathIndex++;
        }
      }

      state.traveled+=moved;

      if(blocked){
        this.finish(entity,state,now);
        return true;
      }

      if(
        state.pathIndex>=state.pathPoints.length||
        state.traveled>=state.distance-1e-6
      ){
        if(state.followup&&this.startFollowup(entity,state,state.followup,now)){
          return true;
        }
        this.finish(entity,state,now);
      }
      return true;
    }

    const travel=this.travelWithEnemyOvershoot(
      entity,
      state,
      angle,
      requested
    );
    const allowed=travel.allowed;

    entity.x+=Math.cos(angle)*allowed;
    entity.y+=Math.sin(angle)*allowed;
    state.traveled+=allowed;

    this.applyPathDamage(
      entity,
      state,
      frameStartX,
      frameStartY,
      Number(entity.x)||0,
      Number(entity.y)||0
    );

    const blocked=
      travel.enemyCollision===true||
      allowed+1e-6<requested;
    if(blocked){
      this.finish(entity,state,now);
      return true;
    }

    if(state.traveled>=state.distance-1e-6){
      if(state.followup&&this.startFollowup(entity,state,state.followup,now)){
        return true;
      }
      this.finish(entity,state,now);
    }
    return true;
  }
});
