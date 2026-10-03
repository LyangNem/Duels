

const TargetPointProjectileService=Object.freeze({
  delivery(projectile){
    return AttackModuleService.module(projectile?.attack,'delivery.projectile')||
      AttackModuleService.module(projectile?.attack,'delivery.range-projectile');
  },

  arrival(projectile){
    return this.delivery(projectile)?.arrival||null;
  },

  snapToRangeEnd(projectile,range){
    const linger=this.arrival(projectile)?.linger;
    if(
      linger?.snapToRangeEnd!==true||
      !projectile?.origin||
      projectile.targetPoint||
      projectile.stationaryArrival?.arrivalReason==='target'||
      projectile.arrivalReason==='target'
    )return false;

    const targetRange=Math.max(0,Number(range)||0);
    if(!(targetRange>0))return false;

    const ox=Number(projectile.origin.x)||0;
    const oy=Number(projectile.origin.y)||0;
    let dx=(Number(projectile.x)||0)-ox;
    let dy=(Number(projectile.y)||0)-oy;
    let length=Math.hypot(dx,dy);
    if(length<=1e-6){
      dx=Math.cos(Number(projectile.angle)||0);
      dy=Math.sin(Number(projectile.angle)||0);
      length=1;
    }
    projectile.x=ox+dx/length*targetRange;
    projectile.y=oy+dy/length*targetRange;
    projectile.prevX=projectile.x;
    projectile.prevY=projectile.y;
    projectile.travel=targetRange;
    return true;
  },

  targetRelations(projectile){
    const configured=
      this.arrival(projectile)?.targetRelations;
    return Array.isArray(configured)
      ?configured
      :[];
  },
  targetRadius(projectile){
    const arrival=this.arrival(projectile);
    const explicit=
      Number(arrival?.targetRadius);

    if(Number.isFinite(explicit)){
      return Math.max(0,explicit);
    }

    const base=
      arrival?.targetRadiusBase==='visual'
        ?Math.max(
          0,
          Number(
            projectile?.renderStyle?.radius||
            projectile?.radius
          )||0
        )
        :Math.max(
          0,
          Number(
            projectile?.hitRadius||
            projectile?.radius
          )||0
        );

    return base*
      Math.max(
        0,
        Number(arrival?.targetRadiusScale)||1
      );
  },


  contactTarget(
    projectile,
    point=null
  ){
    if(!projectile?.source)return null;

    const source=projectile.source;
    const relations=
      this.targetRelations(projectile);
    if(!relations.length)return null;

    const center=
      point||
      {
        x:Number(projectile.x)||0,
        y:Number(projectile.y)||0
      };
    const radius=
      this.targetRadius(projectile);

    let best=null;
    let bestDistance=Infinity;

    for(
      const target of
      EntityService.items.values()
    ){
      if(
        !target?.alive||
        target.hidden||
        target===source
      )continue;

      const relation=
        RelationService.relation(
          source,
          target
        );
      if(!relations.includes(relation))continue;

      const targetPoint=
        NetworkCollisionPositionService.point(
          target
        );
      const distance=Math.hypot(
        targetPoint.x-Number(center.x),
        targetPoint.y-Number(center.y)
      );

      if(
        distance>
        radius+
        Math.max(
          0,
          Number(target.radius)||0
        )
      )continue;

      if(distance>=bestDistance)continue;
      best=target;
      bestDistance=distance;
    }

    return best;
  },


  spawnArrivalRange(
    projectile,
    duration,
    fadeOut=true,
    now=performance.now()
  ){
    if(!projectile?.source)return null;

    const source=projectile.source;
    const effect=
      EffectSpawnService.spawn(
        {
          type:'areaZoneIndicator',
          key:
            `target-point-arrival-range:${source.id}:${projectile.networkKey}:${Math.floor(now)}`,
          x:Number(projectile.x)||0,
          y:Number(projectile.y)||0,
          radius:this.targetRadius(projectile),
          bodyColor:projectile.renderRgb,
          sourceEntityId:source.id,
          alpha:.95,
          fadeOut:fadeOut===true,
          start:now,
          dur:Math.max(
            GAME_DATA.frameMs,
            Number(duration)||GAME_DATA.frameMs
          )
        },
        {source}
      );

    if(
      effect&&
      OnlinePresentationSyncService?.shouldSend?.(
        source
      )
    ){
      OnlinePresentationSyncService.send(
        'effect-spawn',
        source,
        {
          effect:
            EffectSpawnService.presentationSnapshot(
              effect,
              now
            )
        }
      );
    }

    return effect;
  },


  removeFlightPresentation(projectile){
    if(!projectile)return false;

    let removed=false;
    for(const key of projectile.presentationEffectKeys||[]){
      removed=
        EffectSpawnService.removeKey(key)||
        removed;
    }
    projectile.presentationEffectKeys.length=0;
    return removed;
  },

  enforceLingerCapacity(projectile,linger){
    const maxInstances=Math.max(
      0,
      Math.floor(Number(linger?.maxInstances)||0)
    );
    const groupKey=String(linger?.groupKey||'');
    if(
      !(maxInstances>0)||
      !groupKey||
      !projectile?.source
    )return false;

    const candidates=ProjectileService.items
      .filter(candidate=>{
        if(
          candidate===projectile||
          candidate?.source!==projectile.source||
          !candidate?.stationaryArrival
        )return false;

        const candidateLinger=
          this.arrival(candidate)?.linger;
        return String(
          candidateLinger?.groupKey||
          ''
        )===groupKey;
      })
      .sort((a,b)=>{
        const timeDelta=
          (Number(a?.stationaryArrival?.startedAt)||0)-
          (Number(b?.stationaryArrival?.startedAt)||0);
        if(Math.abs(timeDelta)>.001)return timeDelta;
        return String(a?.networkKey||'')
          .localeCompare(String(b?.networkKey||''));
      });

    const overflow=
      candidates.length+1-maxInstances;
    if(overflow<=0)return false;

    for(let index=0;index<overflow;index++){
      ProjectileStateService.remove(
        candidates[index]
      );
    }
    return true;
  },

  beginLinger(
    projectile,
    now=performance.now(),
    stopReason=''
  ){
    const linger=this.arrival(projectile)?.linger;
    if(!linger)return false;

    const persistent=
      linger.persistent===true;
    const duration=
      persistent
        ?Infinity
        :Math.max(
          GAME_DATA.frameMs,
          Number(linger.duration)||0
        );
    if(!persistent&&duration<=0)return false;

    // 비행 중 메후구와 투사체를 연결하던 선은 착탄 즉시 제거.
    this.removeFlightPresentation(projectile);

    // 같은 projectile 객체를 그대로 정지시킨다.
    projectile.vx=0;
    projectile.vy=0;
    projectile.prevX=projectile.x;
    projectile.prevY=projectile.y;

    const targetDistance=
      Number(projectile.targetDistance);
    const stoppedTravel=Math.max(
      0,
      Number(projectile.travel)||0
    );
    const normalizedStopReason=String(stopReason||'unknown');
    const stoppedOnTarget=
      linger.atTarget===true&&
      normalizedStopReason==='target';

    // 정지 원인의 단일 진실원천. 이후 좌표/스냅/귀환 로직은 이 값만 사용한다.
    projectile.arrivalReason=normalizedStopReason;

    /*
      targetPoint/atRange 착탄은 실제 끝점 도착이므로 progress=1을 유지한다.
      반면 atTarget 적중은 최대 사거리 전에 멈춘 것이므로 실제 travel을 보존해야 한다.
      여기서 targetDistance로 덮어쓰면 적중 좌표와 진행 거리 상태가 분리되어
      후속 snapshot/표시에서 사거리 끝으로 튀는 현상이 생긴다.
    */
    if(
      Number.isFinite(targetDistance)&&
      !stoppedOnTarget
    ){
      projectile.travel=
        targetDistance;
    }

    // targetPoint/targetDistance는 착탄 progress=1 렌더를 보존하기 위해 유지한다.
    // stationaryArrival 분기가 다음 프레임부터 이동/도착 처리보다 먼저 실행된다.
    projectile.lastStationaryArrivalStartedAt=now;
    projectile.stationaryArrival={
      startedAt:now,
      endsAt:now+duration,
      duration,
      radius:this.targetRadius(projectile),
      fadeOut:linger.fadeOut!==false,
      triggerOnEnter:linger.triggerOnEnter!==false,
      removeOnTrigger:linger.removeOnTrigger!==false,
      showRange:linger.showRange!==false,
      sourcePickupRange:Math.max(0,Number(linger.sourcePickupRange)||0),
      sourcePickupMode:String(linger.sourcePickupMode||'finish'),
      sourcePickupRequireExit:linger.sourcePickupRequireExit===true,
      sourcePickupArmed:linger.sourcePickupRequireExit!==true,
      sourcePickupRestore:
        linger.sourcePickupRestore&&
        typeof linger.sourcePickupRestore==='object'
          ?{...linger.sourcePickupRestore}
          :null,
      pickupRestoreClaimed:false,
      rangeEffectKey:null,
      arrivalReason:projectile.arrivalReason||normalizedStopReason,
      fixedX:Number(projectile.x)||0,
      fixedY:Number(projectile.y)||0,
      fixedTravel:stoppedOnTarget?stoppedTravel:null
    };

    this.enforceLingerCapacity(
      projectile,
      linger
    );

    // 기존 projectile renderer가 사거리 말단 fade로 0이 되지 않게 유지.
    projectile.persistent=true;

    if(
      projectile.stationaryArrival.showRange&&
      Number.isFinite(duration)
    ){
      const effect=
        this.spawnArrivalRange(
          projectile,
          duration,
          true,
          now
        );

      if(effect?.effectKey){
        projectile.stationaryArrival
          .rangeEffectKey=
            effect.effectKey;
        projectile.presentationEffectKeys
          .push(effect.effectKey);
      }
    }

    return true;
  },


  suppressSourcePickup(
    source,
    duration=GAME_DATA.frameMs
  ){
    if(!source)return 0;
    const until=
      performance.now()+
      Math.max(0,Number(duration)||0);
    source._stationaryProjectilePickupSuppressedUntil=
      Math.max(
        Number(source._stationaryProjectilePickupSuppressedUntil)||0,
        until
      );
    return source._stationaryProjectilePickupSuppressedUntil;
  },

  sourcePickupSuppressed(
    source,
    now=performance.now()
  ){
    return !!(
      source&&
      Number(source._stationaryProjectilePickupSuppressedUntil)>Number(now)
    );
  },

  sourcePickupReady(projectile){
    const state=projectile?.stationaryArrival;
    const source=projectile?.source;
    if(!state||!source?.alive)return false;
    if(this.sourcePickupSuppressed(source))return false;

    const pickupRange=Math.max(
      0,
      Number(state.sourcePickupRange)||0
    );
    if(!(pickupRange>0))return false;

    const distance=Math.hypot(
      Number(source.x)-Number(projectile.x),
      Number(source.y)-Number(projectile.y)
    );

    if(
      state.sourcePickupRequireExit===true&&
      state.sourcePickupArmed!==true
    ){
      if(distance>pickupRange){
        state.sourcePickupArmed=true;
      }
      return false;
    }

    return distance<=pickupRange;
  },

  sourcePickupRestoreAmount(projectile){
    const state=projectile?.stationaryArrival;
    const source=projectile?.source;
    const restore=state?.sourcePickupRestore;
    if(
      !source?.alive||
      !restore||
      typeof restore!=='object'||
      !EntitySimulationAuthorityService.isLocal(source)
    )return null;

    const resource=String(restore.resource||'stamina');
    const maximum=
      resource==='health'
        ?Math.max(0,Number(source.maxHealth)||0)
        :resource==='stamina'
          ?Math.max(0,Number(source.maxStamina)||0)
          :0;
    let amount=Math.max(0,Number(restore.amount)||0);
    if(Number.isFinite(Number(restore.maxResourceRatio))){
      amount=maximum*Math.max(0,Number(restore.maxResourceRatio)||0);
    }
    if(amount<=0)return null;
    return {source,resource,amount};
  },

  processSourcePickupRestores(now=performance.now()){
    const totals=new Map();

    for(const projectile of ProjectileService.items){
      const state=projectile?.stationaryArrival;
      if(!state||state.pickupRestoreClaimed===true)continue;
      const source=projectile?.source;
      if(!this.sourcePickupReady(projectile))continue;

      const restore=this.sourcePickupRestoreAmount(projectile);
      if(!restore)continue;
      state.pickupRestoreClaimed=true;
      const key=`${String(source.id||'source')}::${restore.resource}`;
      const current=totals.get(key)||{source,resource:restore.resource,amount:0};
      current.amount+=restore.amount;
      totals.set(key,current);
    }

    for(const item of totals.values()){
      if(item.resource==='health'){
        HealthService.restore(item.source,item.amount,item.source,{presentation:'projectile-pickup'});
      }else if(item.resource==='stamina'){
        StaminaService.restore(item.source,item.amount,now);
      }
    }
    return totals.size>0;
  },

  collectReadySourcePickups(
    source,
    now=performance.now()
  ){
    if(
      !source?.alive||
      !EntitySimulationAuthorityService.isLocal(source)
    )return 0;

    const candidates=ProjectileService.items.filter(
      projectile=>
        projectile?.source===source&&
        !!projectile.stationaryArrival&&
        this.sourcePickupReady(projectile)
    );
    if(!candidates.length)return 0;

    const totals=new Map();
    for(const projectile of candidates){
      const state=projectile.stationaryArrival;
      if(state?.pickupRestoreClaimed!==true){
        const restore=this.sourcePickupRestoreAmount(projectile);
        if(restore){
          state.pickupRestoreClaimed=true;
          const key=String(restore.resource);
          const current=totals.get(key)||{resource:restore.resource,amount:0};
          current.amount+=restore.amount;
          totals.set(key,current);
        }
      }
    }

    for(const item of totals.values()){
      if(item.resource==='health'){
        HealthService.restore(source,item.amount,source,{presentation:'projectile-pickup'});
      }else if(item.resource==='stamina'){
        StaminaService.restore(source,item.amount,now);
      }
    }

    for(const projectile of candidates){
      const state=projectile.stationaryArrival;
      if(
        state?.sourcePickupMode==='return'&&
        projectile.behavior?.returning
      ){
        this.removeArrivalRange(projectile);
        ProjectileService.clearBoundField(projectile);
        projectile.stationaryArrival=null;
        ProjectileStateService.beginReturn(
          projectile,
          {manual:false}
        );
      }else{
        ProjectileStateService.remove(projectile);
      }
    }
    return candidates.length;
  },

  applySourcePickupRestore(projectile){
    const state=projectile?.stationaryArrival;
    const source=projectile?.source;
    const restore=state?.sourcePickupRestore;
    if(state?.pickupRestoreClaimed===true)return false;
    if(
      !source?.alive||
      !restore||
      typeof restore!=='object'||
      !EntitySimulationAuthorityService.isLocal(source)
    )return false;

    const resource=String(restore.resource||'stamina');
    const maximum=
      resource==='health'
        ?Math.max(0,Number(source.maxHealth)||0)
        :resource==='stamina'
          ?Math.max(0,Number(source.maxStamina)||0)
          :0;
    let amount=Math.max(0,Number(restore.amount)||0);
    if(Number.isFinite(Number(restore.maxResourceRatio))){
      amount=maximum*Math.max(0,Number(restore.maxResourceRatio)||0);
    }
    if(amount<=0)return false;
    state.pickupRestoreClaimed=true;

    if(resource==='health'){
      HealthService.restore(source,amount,source,{presentation:'projectile-pickup'});
      return true;
    }
    if(resource==='stamina'){
      StaminaService.restore(source,amount);
      return true;
    }
    return false;
  },

  removeArrivalRange(projectile){
    const state=projectile?.stationaryArrival;
    const key=String(
      state?.rangeEffectKey||''
    );
    if(!key)return false;

    const removed=
      EffectSpawnService.removeKey(key);
    state.rangeEffectKey=null;

    const keys=
      projectile.presentationEffectKeys;
    if(Array.isArray(keys)){
      const index=keys.indexOf(key);
      if(index>=0)keys.splice(index,1);
    }

    return removed;
  },

  resolveContact(
    projectile,
    target
  ){
    if(!projectile||!target)return false;

    const triggered=
      this.triggerTarget(
        projectile,
        target
      );

    if(triggered){
      this.removeArrivalRange(
        projectile
      );
    }

    return triggered;
  },


  triggerTarget(projectile,target){
    if(!projectile||!target)return false;

    const arrival=this.arrival(projectile);
    if(!arrival)return false;

    const result=
      AttackHitTriggerService.damage({
        source:projectile.source,
        target,
        attack:projectile.attack,
        execution:
          projectile.volley?.execution||null,
        impact:{
          type:'projectile-arrival',
          origin:projectile.origin||null,
          point:{
            x:Number(projectile.x)||0,
            y:Number(projectile.y)||0
          },
          angle:Number(projectile.angle)||0
        }
      });

    const authoritativeHit=
      result.hit&&
      result.authoritative!==false;

    if(
      authoritativeHit&&
      !result.duplicateExecutionHit&&
      arrival.triggerHitEffects===true
    ){
      AttackModuleService.onHit(
        projectile.source,
        target,
        projectile.attack,
        projectile.volley,
        projectile.angle
      );
    }

    projectile.hadHit=
      projectile.hadHit||
      authoritativeHit;

    return !!(
      result.hit||
      result.dodged||
      result.blocked
    );
  },

  resolveWallCollision(
    projectile,
    now=performance.now()
  ){
    if(!projectile?.source)return false;
    const arrival=this.arrival(projectile);
    if(!arrival)return false;

    if(
      arrival.linger?.atWall===true&&
      this.beginLinger(projectile,now,'wall')
    ){
      return 'linger';
    }

    const field=AttackModuleService.module(projectile.attack,'field.area');
    if(!field)return false;

    const radius=Math.max(1,Number(projectile.radius)||1);
    const snapDistance=Math.max(radius*1.5,Number(arrival.wallSnapDistance)||0);
    const directWall=WorldGeometryService.wallAtPoint(projectile.x,projectile.y,radius*.5);
    const snapped=directWall?null:WorldGeometryService.nearestWallTarget(projectile.x,projectile.y,snapDistance);
    const wall=directWall||snapped?.wall||null;
    if(!wall)return false;

    const point=snapped?.point||{x:Number(projectile.x)||0,y:Number(projectile.y)||0};
    projectile.x=Number(point.x)||projectile.x;
    projectile.y=Number(point.y)||projectile.y;

    if(String(arrival.targetPriority||'after-wall')==='before-wall'){
      const target=this.contactTarget(projectile,point);
      if(target){
        if(this.beginLinger(projectile,now,'target')){
          this.resolveContact(projectile,target);
        }else{
          this.triggerTarget(projectile,target);
        }
        return true;
      }
    }

    InstalledAreaFieldService.activate(
      projectile.source,
      projectile.attack,
      field,
      projectile.volley?.execution||null,
      {x:projectile.x,y:projectile.y},
      wall,
      now
    );
    return true;
  },

  arrived(projectile){
    if(!projectile?.targetPoint)return false;

    const targetPoint=projectile.targetPoint;
    const arrival=this.arrival(projectile);
    const targetPriority=String(
      arrival?.targetPriority||
      'after-wall'
    );

    if(targetPriority==='before-wall'){
      const target=
        this.contactTarget(
          projectile,
          targetPoint
        );

      if(target){
        // 직접 착탄도 잔류와 동일한 원 범위 상태를 만든 뒤
        // 동일 contact 처리로 즉시 적중/제거한다.
        if(this.beginLinger(projectile,performance.now(),'target')){
          return this.resolveContact(
            projectile,
            target
          );
        }

        return this.triggerTarget(
          projectile,
          target
        );
      }
    }

    const directWall=
      WorldGeometryService.wallAtPoint(
        targetPoint.x,
        targetPoint.y,
        Math.max(
          0,
          Number(projectile.radius)||0
        )*.25
      );

    const wallSnapDistance=
      Math.max(
        0,
        Number(arrival?.wallSnapDistance)||0
      );

    const snappedWallTarget=
      !directWall&&wallSnapDistance>0
        ?WorldGeometryService.nearestWallTarget(
          targetPoint.x,
          targetPoint.y,
          wallSnapDistance
        )
        :null;

    const passWalls=
      projectile.behavior
        ?.collisionPolicy
        ?.passWalls===true;
    const wall=
      passWalls
        ?null
        :(
          directWall||
          snappedWallTarget?.wall||
          null
        );

    if(wall){
      const wallPoint=
        snappedWallTarget?.point||
        targetPoint;

      projectile.x=
        Number(wallPoint.x)||projectile.x;
      projectile.y=
        Number(wallPoint.y)||projectile.y;

      const field=AttackModuleService.module(
        projectile.attack,
        'field.area'
      );

      if(field){
        InstalledAreaFieldService.activate(
          projectile.source,
          projectile.attack,
          field,
          projectile.volley?.execution||null,
          {
            x:projectile.x,
            y:projectile.y
          },
          wall,
          performance.now()
        );
      }

      return true;
    }

    if(targetPriority!=='before-wall'){
      const target=
        this.contactTarget(
          projectile,
          targetPoint
        );

      if(target){
        if(this.beginLinger(projectile,performance.now(),'target')){
          return this.resolveContact(
            projectile,
            target
          );
        }

        return this.triggerTarget(
          projectile,
          target
        );
      }
    }

    if(this.beginLinger(projectile,performance.now(),'target-point')){
      return 'linger';
    }

    if(projectile.behavior?.impact){
      return ProjectileImpactService.resolve(
        projectile,
        'arrival'
      );
    }

    return false;
  }
});