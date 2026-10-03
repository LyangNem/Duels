

/* 훈련장 + 현재 파일의 공식 맵 데이터만 관리한다. */


const StationaryProjectileInteractionService=Object.freeze({
  linger(projectile){
    return TargetPointProjectileService
      .arrival(projectile)
      ?.linger||
      null;
  },
  interaction(projectile){
    const value=this.linger(projectile)?.interaction;
    return value&&typeof value==='object'
      ?value
      :null;
  },
  groupKey(projectile){
    const linger=this.linger(projectile);
    const interaction=this.interaction(projectile);
    return String(
      interaction?.groupKey||
      linger?.groupKey||
      ''
    );
  },
  items(source,groupKey=''){
    const keys=Array.isArray(groupKey)
      ?groupKey.map(value=>String(value||'')).filter(Boolean)
      :(
        String(groupKey||'')
          ?[String(groupKey||'')]
          :[]
      );
    return ProjectileService.items
      .filter(projectile=>
        projectile?.source===source&&
        !!projectile.stationaryArrival&&
        (
          !keys.length||
          keys.includes(this.groupKey(projectile))
        )
      )
      .sort((a,b)=>{
        const timeDelta=
          (Number(a?.stationaryArrival?.startedAt)||0)-
          (Number(b?.stationaryArrival?.startedAt)||0);
        if(Math.abs(timeDelta)>.001)return timeDelta;
        return String(a?.networkKey||'')
          .localeCompare(String(b?.networkKey||''));
      });
  },
  networkSnapshots(source,now=performance.now()){
    if(!source)return [];
    const snapshots=[];
    for(const projectile of this.items(source)){
      const interaction=this.interaction(projectile);
      if(interaction?.networkSync!==true)continue;
      const state=projectile.stationaryArrival;
      const networkKey=String(projectile.networkKey||'');
      const attackId=String(projectile.attack?.id||'');
      if(!networkKey||!attackId||!state)continue;
      const infinite=state.endsAt===Infinity||state.duration===Infinity;
      snapshots.push({
        networkKey,
        attackId,
        x:Number(projectile.x)||0,
        y:Number(projectile.y)||0,
        angle:Number(projectile.angle)||0,
        groupKey:this.groupKey(projectile),
        arrivalReason:String(state.arrivalReason||projectile.arrivalReason||''),
        ageMs:Math.max(0,now-(Number(state.startedAt)||now)),
        duration:infinite?'infinite':Math.max(GAME_DATA.frameMs,Number(state.duration)||GAME_DATA.frameMs),
        remainingMs:infinite?'infinite':Math.max(0,(Number(state.endsAt)||now)-now),
        fixedX:Number.isFinite(Number(state.fixedX))?Number(state.fixedX):null,
        fixedY:Number.isFinite(Number(state.fixedY))?Number(state.fixedY):null,
        fixedTravel:Number.isFinite(Number(state.fixedTravel))?Number(state.fixedTravel):null
      });
    }
    return snapshots;
  },
  restoreNetworkProjectile(source,snapshot,now=performance.now(),stateSentAt=0){
    if(!source?.alive||!snapshot)return null;
    const networkKey=String(snapshot.networkKey||'');
    const attackId=String(snapshot.attackId||'');
    if(!networkKey||!attackId)return null;

    let projectile=ProjectileService.findByNetworkKey(source,networkKey);
    if(!projectile){
      const base=AbilityService.attackById(source.character,attackId);
      if(!base)return null;
      const attack=AugmentService.prepareAttack(source,base,now);
      const projectileSpec=AttackModuleService.projectile(attack);
      if(!projectileSpec)return null;
      projectile=ProjectileService.spawn({
        source,
        attack,
        volley:null,
        x:Number(snapshot.x)||0,
        y:Number(snapshot.y)||0,
        origin:{x:Number(snapshot.x)||0,y:Number(snapshot.y)||0},
        angle:Number(snapshot.angle)||0,
        networkKey,
        networkMeta:{kind:'stationary-interaction-sync',groupKey:String(snapshot.groupKey||'')},
        projectile:{
          ...projectileSpec,
          speed:0,
          damageOnTravel:false,
          collisionTargets:false,
          expireAtRange:false,
          networkSpawnCompensation:false
        },
        behavior:ProjectileModuleService.config(attack)
      });
      if(!projectile)return null;
      projectile._stationaryInteractionNetworkRestored=true;
    }

    const interaction=this.interaction(projectile);
    if(interaction?.networkSync!==true)return projectile;

    const delay=Math.max(0,Date.now()-Math.max(0,Number(stateSentAt)||Date.now()));
    const infinite=snapshot.remainingMs==='infinite'||snapshot.duration==='infinite';
    const remaining=infinite
      ?Infinity
      :Math.max(0,(Number(snapshot.remainingMs)||0)-delay);
    if(!infinite&&remaining<=0){
      const index=ProjectileService.items.indexOf(projectile);
      ProjectileService.discard(projectile);
      if(index>=0)ProjectileService.items.splice(index,1);
      return null;
    }

    projectile.x=Number(snapshot.x)||0;
    projectile.y=Number(snapshot.y)||0;
    projectile.prevX=projectile.x;
    projectile.prevY=projectile.y;
    projectile.vx=0;
    projectile.vy=0;
    projectile.angle=Number(snapshot.angle)||0;
    projectile.persistent=true;

    const linger=this.linger(projectile)||{};
    const duration=infinite
      ?Infinity
      :Math.max(GAME_DATA.frameMs,Number(snapshot.duration)||remaining||GAME_DATA.frameMs);
    const age=Math.max(0,Number(snapshot.ageMs)||0)+delay;
    const startedAt=infinite?now-age:now-Math.min(duration,age);
    const arrivalReason=String(snapshot.arrivalReason||'network-sync');
    projectile.arrivalReason=arrivalReason;
    projectile.stationaryArrival={
      ...(projectile.stationaryArrival||{}),
      startedAt,
      endsAt:infinite?Infinity:now+remaining,
      duration,
      radius:Math.max(0,Number(projectile.hitRadius)||Number(projectile.radius)||0),
      fadeOut:linger.fadeOut!==false,
      triggerOnEnter:linger.triggerOnEnter!==false,
      removeOnTrigger:linger.removeOnTrigger!==false,
      showRange:linger.showRange!==false,
      sourcePickupRange:Math.max(0,Number(linger.sourcePickupRange)||0),
      sourcePickupMode:String(linger.sourcePickupMode||'finish'),
      sourcePickupRequireExit:linger.sourcePickupRequireExit===true,
      sourcePickupArmed:linger.sourcePickupRequireExit!==true,
      sourcePickupRestore:linger.sourcePickupRestore&&typeof linger.sourcePickupRestore==='object'
        ?{...linger.sourcePickupRestore}
        :null,
      pickupRestoreClaimed:false,
      rangeEffectKey:null,
      arrivalReason,
      fixedX:Number.isFinite(Number(snapshot.fixedX))?Number(snapshot.fixedX):Number(snapshot.x)||0,
      fixedY:Number.isFinite(Number(snapshot.fixedY))?Number(snapshot.fixedY):Number(snapshot.y)||0,
      fixedTravel:Number.isFinite(Number(snapshot.fixedTravel))?Number(snapshot.fixedTravel):Math.max(0,Number(projectile.travel)||0)
    };
    projectile._stationaryInteractionMissingSince=0;
    return projectile;
  },
  applyNetworkSnapshots(source,snapshots,stateSentAt=0,now=performance.now()){
    if(!source||!Array.isArray(snapshots))return false;
    const seen=new Set();
    let changed=false;
    for(const snapshot of snapshots){
      const key=String(snapshot?.networkKey||'');
      if(!key)continue;
      seen.add(key);
      if(this.restoreNetworkProjectile(source,snapshot,now,stateSentAt))changed=true;
    }

    for(const projectile of [...ProjectileService.items]){
      if(projectile?.source!==source||!projectile.stationaryArrival)continue;
      if(this.interaction(projectile)?.networkSync!==true)continue;
      const key=String(projectile.networkKey||'');
      if(seen.has(key)){
        projectile._stationaryInteractionMissingSince=0;
        continue;
      }
      if(!projectile._stationaryInteractionMissingSince){
        projectile._stationaryInteractionMissingSince=now;
        continue;
      }
      if(now-projectile._stationaryInteractionMissingSince<500)continue;
      const index=ProjectileService.items.indexOf(projectile);
      ProjectileService.discard(projectile);
      if(index>=0)ProjectileService.items.splice(index,1);
      changed=true;
    }
    return changed;
  },
  ordinal(projectile){
    if(!projectile?.source)return 0;
    const ordered=this.items(
      projectile.source,
      this.groupKey(projectile)
    );
    const index=ordered.indexOf(projectile);
    return index>=0?index+1:0;
  },
  clickTarget(source,groupKey,point,selectionRadius=1){
    if(
      !source||
      !point||
      !Number.isFinite(Number(point.x))||
      !Number.isFinite(Number(point.y))
    )return null;
    const radius=Math.max(1,Number(selectionRadius)||1);
    let nearest=null;
    let nearestDistance=Infinity;
    for(const projectile of this.items(source,groupKey)){
      const distance=Math.hypot(
        (Number(projectile.x)||0)-Number(point.x),
        (Number(projectile.y)||0)-Number(point.y)
      );
      if(distance>radius||distance>=nearestDistance)continue;
      nearest=projectile;
      nearestDistance=distance;
    }
    return nearest;
  },
  resolveTargetPoint(source,execution){
    const point=execution?.targetPoint;
    if(
      point&&
      Number.isFinite(Number(point.x))&&
      Number.isFinite(Number(point.y))
    ){
      return {
        x:Number(point.x)||0,
        y:Number(point.y)||0
      };
    }
    if(
      source===Training.player&&
      EntitySimulationAuthorityService.isLocal(source)
    ){
      const mouse=Training.mouseWorld?.();
      if(
        mouse&&
        Number.isFinite(Number(mouse.x))&&
        Number.isFinite(Number(mouse.y))
      ){
        return {
          x:Number(mouse.x)||0,
          y:Number(mouse.y)||0
        };
      }
    }
    const remote=source?._remoteAimTargetPoint;
    if(
      remote&&
      Number.isFinite(Number(remote.x))&&
      Number.isFinite(Number(remote.y))
    ){
      return {
        x:Number(remote.x)||0,
        y:Number(remote.y)||0
      };
    }
    return null;
  },
  spawnStationaryProjectile(
    source,
    config,
    point,
    executionSequence=0
  ){
    if(
      !source?.alive||
      !config||
      !point||
      !Number.isFinite(Number(point.x))||
      !Number.isFinite(Number(point.y))
    )return null;

    const baseAttack=AbilityService.attackById(
      source.character,
      String(config.attackId||'')
    );
    if(!baseAttack)return null;

    const attack=AugmentService.prepareAttack(
      source,
      baseAttack,
      performance.now()
    );
    const projectileSpec=
      AttackModuleService.projectile(attack);
    if(!projectileSpec)return null;

    const now=performance.now();
    // projectileSpec은 이동용 정규화 데이터이며 arrival을 포함하지 않는다.
    // 일반 착탄과 동일하게 원본 AttackSpec에서 회수/수명 설정을 조회한다.
    const canonicalLinger=this.linger({attack});
    const duration=Math.max(
      GAME_DATA.frameMs,
      Number(canonicalLinger?.duration)||
      Number(config.duration)||
      GAME_DATA.frameMs
    );
    const groupKey=String(
      canonicalLinger?.groupKey||
      canonicalLinger?.interaction?.groupKey||
      config.groupKey||
      config.interaction?.groupKey||
      ''
    );
    const sequence=Math.max(
      0,
      Math.floor(Number(executionSequence)||0)
    );
    const networkKey=
      `${String(attack.id||'stationary-projectile')}:${String(source.id||'source')}:${sequence}`;

    const projectile=ProjectileService.spawn({
      source,
      attack,
      volley:null,
      x:Number(point.x)||0,
      y:Number(point.y)||0,
      origin:{
        x:Number(point.x)||0,
        y:Number(point.y)||0
      },
      angle:0,
      networkKey,
      networkMeta:{
        kind:'stationary-ability-projectile',
        groupKey
      },
      projectile:{
        ...projectileSpec,
        speed:0,
        damageOnTravel:false,
        collisionTargets:false,
        expireAtRange:false
      },
      behavior:
        ProjectileModuleService.config(attack)
    });

    if(!projectile)return null;

    projectile.vx=0;
    projectile.vy=0;
    projectile.prevX=projectile.x;
    projectile.prevY=projectile.y;
    projectile.persistent=true;
    projectile.stationaryArrival={
      startedAt:now,
      endsAt:now+duration,
      duration,
      radius:Math.max(
        0,
        Number(projectile.hitRadius)||
        Number(projectile.radius)||
        0
      ),
      fadeOut:false,
      triggerOnEnter:false,
      removeOnTrigger:false,
      showRange:canonicalLinger?.showRange!==false,
      sourcePickupRange:Math.max(
        0,
        Number(canonicalLinger?.sourcePickupRange)||0
      ),
      sourcePickupMode:String(
        canonicalLinger?.sourcePickupMode||'finish'
      ),
      sourcePickupRequireExit:
        canonicalLinger?.sourcePickupRequireExit===true,
      sourcePickupArmed:
        canonicalLinger?.sourcePickupRequireExit!==true,
      sourcePickupRestore:
        canonicalLinger?.sourcePickupRestore&&
        typeof canonicalLinger.sourcePickupRestore==='object'
          ?{...canonicalLinger.sourcePickupRestore}
          :null,
      pickupRestoreClaimed:false,
      rangeEffectKey:null
    };

    return projectile;
  },
  swapTeleportToPoint(source,destination,module,projectile=null){
    if(
      !source?.alive||
      !destination||
      !Number.isFinite(Number(destination.x))||
      !Number.isFinite(Number(destination.y))
    )return false;

    const origin={
      x:Number(source.x)||0,
      y:Number(source.y)||0
    };
    destination={
      x:Number(destination.x)||0,
      y:Number(destination.y)||0
    };

    const pickupResumeAt=
      TargetPointProjectileService.suppressSourcePickup(
        source,
        GAME_DATA.frameMs*2
      );

    // 선택 projectile 소모 여부는 데이터로 결정한다. 기본값은 기존 호환을 위해 소모.
    if(
      module?.consumeTarget!==false&&
      projectile
    ){
      ProjectileStateService.remove(
        projectile
      );
    }

    const executionSequence=
      Number(module?._executionSequence)||0;

    if(module?.leaveProjectile){
      this.spawnStationaryProjectile(
        source,
        module.leaveProjectile,
        origin,
        executionSequence
      );
    }

    const arrivalAttackId=String(
      module?.arrivalAttackId||
      ''
    );
    if(arrivalAttackId){
      const baseArrivalAttack=
        AbilityService.attackById(
          source.character,
          arrivalAttackId
        );
      if(baseArrivalAttack){
        const preparedArrivalAttack=
          AugmentService.prepareAttack(
            source,
            baseArrivalAttack,
            performance.now()
          );
        const arrivalExecution=
          AttackExecutionService.create(
            source,
            preparedArrivalAttack,
            0,
            null
          );
        arrivalExecution.targetPoint={
          x:destination.x,
          y:destination.y
        };
        const arrivalVolley={
          execution:arrivalExecution,
          total:AttackModuleService.deliveryCount(preparedArrivalAttack),
          resolved:0,
          hits:0,
          source,
          attack:preparedArrivalAttack,
          finished:false
        };
        const areaModule=
          AttackModuleService.module(
            preparedArrivalAttack,
            'delivery.area'
          );
        if(areaModule){
          AreaAttackService.execute(
            source,
            preparedArrivalAttack,
            0,
            areaModule,
            arrivalVolley,
            {
              geometrySource:destination
            }
          );
        }
        AttackModuleService.afterAttack(
          source,
          preparedArrivalAttack,
          0,
          arrivalExecution
        );
      }
    }

    if(EntitySimulationAuthorityService.isLocal(source)){
      const angle=Math.atan2(
        destination.y-origin.y,
        destination.x-origin.x
      );
      MovementAbilityService.start(
        source,
        {
          type:'movement.move',
          stateKey:String(
            module?.moveStateKey||
            'movement:move'
          ),
          direction:'target-point',
          replaceActive:true,
          duration:1,
          collision:{
            passWalls:true,
            passEnemies:true
          },
          resolveOverlapOnEnd:true,
          tags:['이동기'],
          presentation:module?.presentation
        },
        Number.isFinite(angle)?angle:0,
        {
          targetPoint:destination,
          runtimeDistance:Math.hypot(
            destination.x-origin.x,
            destination.y-origin.y
          )
        }
      );
    }

    if(EntitySimulationAuthorityService.isLocal(source)){
      SimulationScheduleService.scheduleContinuation({
        at:Math.max(
          performance.now()+GAME_DATA.frameMs,
          pickupResumeAt+1
        ),
        source,
        continue:()=>{
          source._stationaryProjectilePickupSuppressedUntil=0;
          return TargetPointProjectileService.collectReadySourcePickups(
            source,
            performance.now()
          );
        }
      });
    }

    return true;
  },
  swapTeleportToProjectile(source,projectile,module){
    if(
      !source?.alive||
      !projectile||
      projectile.source!==source||
      !projectile.stationaryArrival
    )return false;

    return this.swapTeleportToPoint(
      source,
      {
        x:Number(projectile.x)||0,
        y:Number(projectile.y)||0
      },
      module,
      projectile
    );
  },
  swapTeleport(source,module,execution){
    if(!source?.alive)return false;
    const projectile=this.clickTarget(
      source,
      Array.isArray(module?.groupKeys)
        ?module.groupKeys
        :String(module?.groupKey||''),
      this.resolveTargetPoint(source,execution),
      Math.max(1,Number(module?.selectionRadius)||1)
    );
    return this.swapTeleportToProjectile(
      source,
      projectile,
      module
    );
  },
  drawWorld(ctx){
    if(!ctx)return false;

    const groups=new Map();
    for(const projectile of ProjectileService.items){
      if(
        !projectile?.stationaryArrival||
        !projectile?.source?.alive
      )continue;

      const interaction=this.interaction(projectile);
      if(!interaction)continue;

      const groupKey=this.groupKey(projectile);
      const source=projectile.source;
      const key=`${String(source.id||'source')}::${groupKey}`;

      if(!groups.has(key)){
        groups.set(key,{
          source,
          groupKey,
          interaction,
          projectiles:[]
        });
      }
      groups.get(key).projectiles.push(projectile);
    }

    let drawn=false;

    for(const group of groups.values()){
      const source=group.source;
      const interaction=group.interaction;
      const projectiles=group.projectiles
        .slice()
        .sort((a,b)=>{
          const timeDelta=
            (Number(a?.stationaryArrival?.startedAt)||0)-
            (Number(b?.stationaryArrival?.startedAt)||0);
          if(Math.abs(timeDelta)>.001)return timeDelta;
          return String(a?.networkKey||'')
            .localeCompare(String(b?.networkKey||''));
        });

      const color=String(
        interaction.color||
        source.color||
        '#ffffff'
      );
      const rgb=ColorService.rgbString(
        color,
        '255,255,255'
      );
      const selectionRadius=Math.max(
        0,
        Number(interaction.selectionRadius)||0
      );
      const ownerOnlyUi=
        source===Training.player&&
        EntitySimulationAuthorityService.isLocal(source);

      for(let index=0;index<projectiles.length;index++){
        const projectile=projectiles[index];
        const x=Number(projectile.x)||0;
        const y=Number(projectile.y)||0;

        ctx.save();

        if(
          ownerOnlyUi&&
          interaction.showSelectionRadius!==false&&
          selectionRadius>0
        ){
          ctx.setLineDash([7,6]);
          ctx.strokeStyle=`rgba(${rgb},.48)`;
          ctx.lineWidth=1.5;
          ctx.beginPath();
          ctx.arc(
            x,
            y,
            selectionRadius,
            0,
            Math.PI*2
          );
          ctx.stroke();
          ctx.setLineDash([]);
        }

        if(
          ownerOnlyUi&&
          interaction.linkToSource===true
        ){
          ctx.setLineDash([7,6]);
          ctx.strokeStyle=`rgba(${rgb},.56)`;
          ctx.lineWidth=1.5;
          ctx.beginPath();
          ctx.moveTo(
            Number(source.x)||0,
            Number(source.y)||0
          );
          ctx.lineTo(x,y);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        if(
          interaction.durationGauge===true&&
          source===Training.player&&
          EntitySimulationAuthorityService.isLocal(source)
        ){
          const state=projectile.stationaryArrival;
          const duration=Math.max(
            GAME_DATA.frameMs,
            Number(state?.duration)||GAME_DATA.frameMs
          );
          const remaining=Math.max(
            0,
            Math.min(
              duration,
              Number(state?.endsAt)-performance.now()
            )
          );
          const ratio=Math.max(
            0,
            Math.min(1,remaining/duration)
          );
          const gaugeRadius=Math.max(
            16,
            Number(projectile.radius)||0,
            Number(projectile.renderStyle?.radius)||0
          )+6;

          ArcGaugePresentationService.render(
            ctx,
            projectile,
            ratio,
            {
              visibility:'all',
              color:String(
                interaction.gaugeColor||
                interaction.color||
                source.color||
                '#ffffff'
              ),
              radius:gaugeRadius,
              lineWidth:EntityRingLayoutService.WIDTHS.gauge,
              lineCap:'round',
              startAngle:-Math.PI/2,
              span:Math.PI*2,
              showEmpty:false
            }
          );
        }

        ctx.restore();
        drawn=true;
      }
    }

    return drawn;
  }
});