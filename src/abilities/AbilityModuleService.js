

const AbilityModuleService=Object.freeze({
  addUsageTags(context,module){
    if(
      !(context?.usageTags instanceof Set)||
      !Array.isArray(module?.tags)
    ){
      return false;
    }

    for(const tag of module.tags){
      const value=String(tag||'').trim();
      if(value)context.usageTags.add(value);
    }

    return true;
  },

  handlers:Object.freeze({
    'formula.sequence-input'(context,next,module){
      if(context.network===true){
        if(String(context.resolvedAttackId||'').startsWith('formula:')){
          context.handled=true;
          context.executed=true;
          return;
        }
        next();
        return;
      }

      const preserveNaturalRegen=
        module.preserveNaturalRegenActivity===true;
      const previousNaturalRegenBlockTime=
        preserveNaturalRegen
          ?Number(
            context.source
              ?.lastNaturalRegenBlockTime
          )||0
          :0;
      const previousNextHealthRegenAt=
        preserveNaturalRegen
          ?Number(
            context.source
              ?.nextHealthRegenAt
          )||0
          :0;
      const previousLastStaminaUse=
        preserveNaturalRegen
          ?Number(
            context.source
              ?.lastStaminaUse
          )||0
          :0;

      const result=FormulaSequenceService.input(
        context.source,
        module,
        String(module.button||''),
        context.targetPoint||null,
        Number(context.now)||performance.now()
      );

      if(
        preserveNaturalRegen&&
        result.handled===true
      ){
        context.source.lastNaturalRegenBlockTime=
          previousNaturalRegenBlockTime;
        context.source.nextHealthRegenAt=
          previousNextHealthRegenAt;
        context.source.lastStaminaUse=
          previousLastStaminaUse;
      }

      if(result.handled===true){
        context.handled=true;

        if(result.blockedByDodge===true){
          context.executed=false;
          context.suppressStealthRevealOnAbilityUse=true;
          return;
        }

        context.executed=true;
        context.suppressStealthRevealOnAbilityUse=true;
        const formulaConfig=
          FormulaSequenceConfigService(
            context.source,
            module
          );
        context.resolvedAttackId=
          `formula:${String(
            formulaConfig.stateKey||'sequence'
          )}`;

        if(
          result.completed===true&&
          formulaConfig.completeEffect&&
          typeof formulaConfig.completeEffect==='object'
        ){
          AbilityModuleService.handlers['effect.spawn'](
            context,
            ()=>{},
            formulaConfig.completeEffect
          );
        }
        return;
      }

      next();
    },
    'formation.activate'(context,next,module){
      if(
        CircleFormationService.beginActivation(
          context.source,
          CircleFormationService.pointerFor(
            context.source,
            context.targetPoint
          ),
          {
            held:false,
            now:Number(context.now)||performance.now(),
            fromAbility:true,
            formationKey:String(module.formationKey||'circleFormation')
          }
        )
      ){
        context.handled=true;
        context.executed=false;
        context.suppressStealthRevealOnAbilityUse=true;
      }
      next();
    },
    'formation.place-minimum'(context,next,module){
      if(
        CircleFormationService.placeMinimum(
          context.source,
          CircleFormationService.pointerFor(
            context.source,
            context.targetPoint
          ),
          {
            now:Number(context.now)||performance.now(),
            formationKey:String(module.formationKey||'circleFormation')
          }
        )
      ){
        context.handled=true;
        context.executed=false;
        context.suppressStealthRevealOnAbilityUse=true;
      }
      next();
    },
    'multi-click.attack'(context,next,module){
      MultiClickAttackService.press(context,module);
      next();
    },
    'multi-click.release'(context,next,module){
      MultiClickAttackService.release(context,module);
      next();
    },
    'charge.attack.start'(context,next,module){
      if(ChargedAttackService.start(context,module)){
        context.executed=true;
        // 차징 시작 자체는 실제 공격/회피/반격처럼 은신 위치를 노출하는 행동이 아니다.
        // 실제 발사는 이후 attack-fired 공통 사건에서 별도로 노출된다.
        context.suppressStealthRevealOnAbilityUse=true;
      }
      next();
    },
    'charge.attack.release'(context,next,module){
      ChargedAttackService.release(context,module);
      next();
    },
    'obstacle.wall-deploy'(context,next,module){
      if(
        module.requireExecuted===true&&
        context.executed!==true
      ){
        next();
        return;
      }
      const point=context.targetPoint||(
        context.source
          ?{
            x:(Number(context.source.x)||0)+Math.cos(Number(context.source.aimAngle)||0)*Math.max(0,Number(module.maxRange)||650),
            y:(Number(context.source.y)||0)+Math.sin(Number(context.source.aimAngle)||0)*Math.max(0,Number(module.maxRange)||650)
          }
          :null
      );
      const wall=DynamicWallService.place(
        context.source,
        point,
        module
      );
      if(wall){
        context.handled=true;
        context.executed=true;
      }
      next();
    },
    'movement.finish-active'(context,next,module){
      const state=MovementAbilityService.state(
        context.source,
        String(module?.stateKey||'movement:move')
      );
      if(state){
        MovementAbilityService.finish(context.source,state,Number(context.now)||performance.now());
        context.handled=true;
        context.executed=true;
      }
      next();
    },

    'projectile.detonate'(context,next,module){
      if(
        module.requireExecuted===true&&
        context.executed!==true
      ){
        next();
        return;
      }
      if(
        module.requireAttackId&&
        String(context.resolvedAttackId||'')!==
          String(module.requireAttackId)
      ){
        next();
        return;
      }

      const projectile=ProjectileStateService.get(
        context.source,
        String(module.stateKey||'')
      );
      if(!projectile){
        next();
        return;
      }

      const impact=projectile.behavior?.impact||null;
      const attackId=String(module.attackId||'');
      if(impact&&attackId){
        projectile.behavior={
          ...projectile.behavior,
          impact:{
            ...impact,
            attackIds:Object.freeze([attackId]),
            reasonAttackIds:Object.freeze({})
          }
        };
      }

      const resolved=ProjectileImpactService.resolve(
        projectile,
        String(module.reason||'manual')
      );
      ProjectileStateService.remove(projectile);
      context.handled=true;
      context.executed=true;
      if(resolved&&attackId){
        context.resolvedAttackId=String(module.requireAttackId||context.resolvedAttackId||'');
      }
      next();
    },
    'projectile.ride.start'(context,next,module){
      if(
        module?.requireExecuted===true&&
        context.executed!==true
      ){
        next();
        return;
      }
      if(
        ProjectileRideService.start(
          context.source,
          {
            projectileStateKey:
              String(module?.projectileStateKey||''),
            rideStateKey:
              String(module?.rideStateKey||'projectile-ride'),
            control:String(module?.control||'fixed'),
            turnPerFrame:
              Math.max(
                0,
                Number(module?.turnPerFrame)||0
              ),
            wallPass:
              module?.wallPass===true
          }
        )
      ){
        context.handled=true;
        context.executed=true;
      }
      next();
    },
    'projectile.ride.exit'(context,next,module){
      if(
        module?.requireExecuted===true&&
        context.executed!==true
      ){
        next();
        return;
      }
      if(
        ProjectileRideService.finish(
          context.source,
          String(module?.rideStateKey||'projectile-ride')
        )
      ){
        context.handled=true;
        context.executed=true;
      }
      next();
    },
    'charge.camera.suppress'(context,next,module){
      const state=ChargedAttackService.state(
        context.source,
        String(module?.stateKey||'charge:primary')
      );
      if(state){
        const mode=String(module?.mode||'suppress');
        state.cameraAimSuppressed=
          mode==='toggle'
            ?state.cameraAimSuppressed!==true
            :mode==='restore'
              ?false
              :true;
        context.handled=true;
      }
      next();
    },
    'input.drag-path'(context,next,module){
      const operation=String(module.operation||'start');

      if(operation==='start'){
        DragPathInputService.start(context,module);
        next();
        return;
      }

      if(operation==='rewind-start'){
        DragPathInputService.rewindStart(context,module);
        next();
        return;
      }

      if(operation==='release'){
        DragPathInputService.release(context,module);
        next();
        return;
      }

      if(operation==='clear'){
        DragPathInputService.clear(
          context.source,
          module
        );
        next();
        return;
      }

      next();
    },
    'field.expand-recent'(context,next,module){
      if(module?.requireExecuted===true&&context.executed!==true){
        next();
        return;
      }
      const source=context.source;
      const inputKey=String(module?.sourceStateKey||'');
      if(!source?.actionState||!inputKey){
        next();
        return;
      }
      const retained=
        source._recentProjectilePathFields instanceof Map
          ?source._recentProjectilePathFields.get(inputKey)
          :null;
      const states=(Array.isArray(retained)&&retained.length
        ?retained
        :InstalledAreaFieldService.states(source,inputKey)
          .filter(state=>state?.phase==='point'))
        .slice()
        .sort((a,b)=>(Number(b.startedAt)||0)-(Number(a.startedAt)||0))
        .slice(0,Math.max(0,Math.floor(Number(module.maxCount)||0))||Infinity);
      const attackId=String(module.attackId||'');
      const baseAttack=attackId
        ?AbilityService.attackById(source.character,attackId)
        :null;
      const preparedAttack=baseAttack
        ?AugmentService.prepareAttack(source,baseAttack,performance.now())
        :null;
      const now=performance.now();
      for(const state of states){
        const sourceModule=state.module||{};
        const duration=Math.max(
          GAME_DATA.frameMs,
          Number(module.duration)||
          Number(sourceModule.duration)||
          GAME_DATA.frameMs
        );
        const pathRange=Math.max(0,Number(sourceModule.range)||0);
        const revealSpeed=Math.max(0,Number(module.revealSpeed)||0);
        const revealDuration=
          revealSpeed>0&&pathRange>0
            ?pathRange/revealSpeed*GAME_DATA.frameMs
            :0;
        const pathTimeline=
          revealDuration>0
            ?{
              revealRatio:Math.max(.001,Math.min(.95,revealDuration/duration)),
              fadeStart:Math.max(
                0,
                Math.min(
                  1,
                  Number.isFinite(Number(module.fadeStart))
                    ?Number(module.fadeStart)
                    :.75
                )
              )
            }
            :sourceModule.pathTimeline;
        const field={
          ...sourceModule,
          stateKey:String(module.outputStateKey||sourceModule.stateKey||'expanded-field'),
          anchorMode:'point',
          liveProjectilePath:false,
          duration,
          pathTimeline,
          interval:Math.max(0,Number(module.interval)||Number(sourceModule.interval)||0),
          halfWidth:Math.max(0,Number(sourceModule.halfWidth)||0)*Math.max(0,Number(module.halfWidthMultiplier)||1),
          attackId,
          damageOnTrigger:!!preparedAttack,
          damageStackGroup:String(module.damageStackGroup||sourceModule.damageStackGroup||''),
          triggerOnEnter:
            module.triggerOnEnter!==undefined
              ?module.triggerOnEnter===true
              :sourceModule.triggerOnEnter===true,
          presentation:module.presentation?{...module.presentation}:sourceModule.presentation
        };
        InstalledAreaFieldService.activatePoint(
          source,
          field,
          {x:Number(state.pointX)||0,y:Number(state.pointY)||0},
          {
            attack:preparedAttack,
            execution:context.execution||null,
            now
          }
        );
      }
      if(states.length){
        context.handled=true;
      }
      next();
    },
    'status.apply-state-target'(context,next,module){
      const source=context.source;
      const stateKey=String(module?.stateKey||'');
      const status=String(module?.status||'');
      const now=Number(context.now)||performance.now();
      const resolvedId=`state-target-status:${stateKey}`;

      if(
        context.network===true&&
        String(context.resolvedAttackId||'')===resolvedId
      ){
        context.handled=true;
        context.executed=true;
        return;
      }

      const state=TimedActionStateService.state(
        source,
        stateKey,
        now
      );
      if(!state||!status){
        next();
        return;
      }

      const targetId=String(state.data?.targetEntityId||'');
      const target=targetId
        ?EntityService.items.get(targetId)||null
        :null;

      // 유효 타이밍의 재입력은 새 평타로 폴백하지 않는다.
      if(!target?.alive){
        context.handled=true;
        context.executed=false;
        return;
      }

      const applied=CombatStatusApplicationService.apply({
        source,
        target,
        type:status,
        duration:Math.max(0,Number(module.duration)||0),
        sourceId:String(source?.id||''),
        data:{
          ...(module.data||{}),
          sourceEntityId:String(source?.id||'')
        }
      });

      if(!applied){
        context.handled=true;
        context.executed=false;
        return;
      }

      state.completedAt=now;
      state.completionPending=false;
      state.retainUntil=
        now+
        Math.max(
          0,
          Number(module.completeRetainMs)||
          Number(state.retainCompleteMs)||
          0
        );

      const cooldownAttackId=String(module.cooldownAttackId||'');
      if(cooldownAttackId){
        source.cooldowns.set(
          cooldownAttackId,
          now+Math.max(0,Number(module.cooldown)||0)
        );
      }

      context.handled=true;
      context.executed=true;
      context.resolvedAttackId=resolvedId;
      return;
    },
    'state.window'(context,next,module){
      if(
        module.localOnly===true&&
        context.network===true
      ){
        next();
        return;
      }
      if(
        module.requireExecuted===true&&
        context.executed!==true
      ){
        next();
        return;
      }
      const operation=String(module.operation||'open');
      const stateKey=String(module.stateKey||'');
      if(!stateKey){next();return;}
      const now=Number(context.now)||performance.now();

      if(operation==='select'){
        const state=TimedActionStateService.state(context.source,stateKey,now);
        if(!state||state.expiresAt<=now){next();return;}
        state.data={...(state.data||{}),...(module.data||{})};
        if(module.captureAngle===true)state.data.angle=Number(context.angle)||0;
        // 짧은 선택형 타이밍 입력은 원격 도착 시점 재판정에 맡기지 않고
        // 송신자가 실제로 선택한 data를 duel-action에 함께 전달한다.
        context.stateWindowSelection={
          stateKey,
          data:EffectSpawnService.definitionSnapshot(state.data||{})
        };
        context.handled=true;
        context.executed=true;
        context.resolvedAttackId=`state-window:${stateKey}`;
        if(module.stopOnHandled===true)return;
        next();
        return;
      }

      if(operation==='clear'){
        TimedActionStateService.consume(context.source,stateKey,now);
        next();
        return;
      }

      if(operation==='complete'){
        const state=TimedActionStateService.state(
          context.source,
          stateKey,
          now
        );
        if(state){
          if(module.data&&typeof module.data==='object'){
            state.data={
              ...(state.data||{}),
              ...module.data
            };
          }
          state.completedAt=now;
          state.completionPending=false;
          state.retainUntil=
            now+
            Math.max(
              0,
              Number(module.retainCompleteMs)||
              Number(state.retainCompleteMs)||
              0
            );
        }
        next();
        return;
      }

      TimedActionStateService.open(
        context.source,
        {
          stateKey,
          duration:Math.max(0,Number(module.duration)||0),
          retainCompleteMs:Math.max(0,Number(module.retainCompleteMs)||0),
          data:{...(module.data||{})},
          presentation:module.previewAttackIds
            ?{
              previewAttackIds:EffectSpawnService.definitionSnapshot(module.previewAttackIds),
              resolveDataKey:String(module.resolveDataKey||'choice'),
              liveAim:true
            }
            :null
        },
        now
      );
      if(module.consumeInput===true){
        context.handled=true;
        context.executed=false;
        context.suppressStealthRevealOnAbilityUse=true;
        return;
      }
      next();
    },
    'sustain.toggle'(context,next,module){
      const stateKey=String(module.stateKey||'sustain:mode');
      const active=SustainedBuffModeService.state(context.source,stateKey);
      if(active){
        SustainedBuffModeService.stop(
          context.source,
          stateKey,
          Number(context.now)||performance.now()
        );
        context.handled=true;
        context.executed=true;
        return;
      }
      const resource=
        String(module.resource||'stamina');
      const activationCost=
        Math.max(
          0,
          Number(module.activationCost)||0
        );
      const now=
        Number(context.now)||performance.now();

      if(
        resource==='stamina'&&
        (
          Math.max(
            0,
            Number(context.source?.stamina)||0
          )<=0||
          (
            context.network!==true&&
            activationCost>0&&
            Math.max(
              0,
              Number(context.source?.stamina)||0
            )<activationCost
          )
        )
      ){
        next();
        return;
      }

      if(
        context.network!==true&&
        resource==='stamina'&&
        activationCost>0&&
        !StaminaService.spend(
          context.source,
          activationCost,
          now
        )
      ){
        next();
        return;
      }

      if(SustainedBuffModeService.start(
        context.source,
        {...module,attackId:context.attack?.id},
        now
      )){
        context.handled=true;
        context.executed=true;
        return;
      }

      if(
        context.network!==true&&
        resource==='stamina'&&
        activationCost>0
      ){
        StaminaService.restore(
          context.source,
          activationCost,
          now
        );
      }

      next();
    },
    'stealth.toggle'(context,next,module){
      const stateKey=String(module.stateKey||'stealth:mode');
      const active=StealthModeService.state(context.source,stateKey);
      if(active){
        StealthModeService.stop(context.source,stateKey,Number(context.now)||performance.now());
        context.handled=true;
        context.executed=true;
        context.suppressStealthRevealOnAbilityUse=true;
        return;
      }
      next();
      if(context.executed===true){
        if(StealthModeService.start(context.source,{...module,attackId:context.attack?.id},Number(context.now)||performance.now())){
          context.suppressStealthRevealOnAbilityUse=true;
        }
      }
    },

    'context.position-memory'(context,next,module){
      const source=context.source;
      const now=Number(context.now)||performance.now();
      if(
        context.network===true&&
        context.targetPoint&&
        Number.isFinite(Number(context.targetPoint.x))&&
        Number.isFinite(Number(context.targetPoint.y))
      ){
        context.positionMemoryResolved=true;
        next();
        return;
      }
      const latest=PositionMemoryService.latest(
        source,
        String(module.stateKey||''),
        now
      );
      if(!latest){
        context.handled=true;
        context.executed=false;
        next();
        return;
      }
      context.targetPoint={x:Number(latest.x)||0,y:Number(latest.y)||0};
      context.positionMemoryResolved=true;
      next();
    },
    'context.position-memory-consume'(context,next,module){
      if(module.requireExecuted===true&&context.executed!==true){next();return;}
      if(context.network!==true){
        PositionMemoryService.pop(
          context.source,
          String(module.stateKey||''),
          Number(context.now)||performance.now()
        );
      }
      next();
    },
    'context.temporal-snapshot'(context,next,module){
      const source=context.source;
      const now=Number(context.now)||performance.now();
      let snapshot=null;
      let targetPoint=null;
      if(
        context.network===true&&
        context.targetPoint&&
        Number.isFinite(Number(context.targetPoint.x))&&
        Number.isFinite(Number(context.targetPoint.y))
      ){
        targetPoint={x:Number(context.targetPoint.x),y:Number(context.targetPoint.y)};
      }else{
        snapshot=TemporalSnapshotService.at(
          source,
          Number(module.rewindTime)||Number(source?.character?.temporalMemory?.rewindTime)||3000,
          now
        );
        if(!snapshot){
          context.handled=true;
          context.executed=false;
          next();
          return;
        }
        targetPoint={x:Number(snapshot.x)||0,y:Number(snapshot.y)||0};
      }
      context.temporalSnapshot=snapshot;
      context.rewindFrom={x:Number(source.x)||0,y:Number(source.y)||0};
      context.rewindTo={...targetPoint};
      context.targetPoint={...targetPoint};
      next();
    },
    'resource.restore-snapshot'(context,next,module){
      if(module.requireExecuted===true&&context.executed!==true){next();return;}
      if(context.network===true){next();return;}
      const snapshot=context.temporalSnapshot;
      if(!snapshot){next();return;}
      const resource=String(module.resource||'');
      if(resource==='stamina'&&Number.isFinite(Number(snapshot.stamina))){
        StaminaService.set(context.source,Number(snapshot.stamina)||0);
      }else if(resource==='health'&&Number.isFinite(Number(snapshot.health))){
        const value=Math.max(0,Math.min(Number(context.source.maxHealth)||0,Number(snapshot.health)||0));
        context.source.health=value;
        context.source.combatSnapshotDirty=true;
      }
      next();
    },
    'context.stationary-projectile-target'(context,next,module){
      const source=context.source;
      let pointer=
        context.targetPoint&&
        Number.isFinite(Number(context.targetPoint.x))&&
        Number.isFinite(Number(context.targetPoint.y))
          ?{x:Number(context.targetPoint.x),y:Number(context.targetPoint.y)}
          :null;
      if(
        context.network!==true&&
        source===Training.player&&
        EntitySimulationAuthorityService.isLocal(source)
      ){
        const mouse=Training.mouseWorld();
        if(mouse&&Number.isFinite(Number(mouse.x))&&Number.isFinite(Number(mouse.y))){
          pointer={x:Number(mouse.x),y:Number(mouse.y)};
        }
      }
      if(!pointer){
        context.handled=true;
        context.executed=false;
        next();
        return;
      }
      const projectile=StationaryProjectileInteractionService.clickTarget(
        source,
        Array.isArray(module.groupKeys)?module.groupKeys:String(module.groupKey||''),
        pointer,
        Math.max(1,Number(module.selectionRadius)||1)
      );
      const networkFallback=
        !projectile&&
        context.network===true&&
        context.senderExecuted===true&&
        !!String(context.resolvedAttackId||'');
      if(!projectile&&!networkFallback){
        context.handled=true;
        context.executed=false;
        next();
        return;
      }
      const destination=projectile
        ?{x:Number(projectile.x)||0,y:Number(projectile.y)||0}
        :{x:Number(pointer.x)||0,y:Number(pointer.y)||0};
      context.stationaryProjectileTarget=projectile||null;
      context.targetPoint=destination;
      next();
    },
    'movement.stationary-projectile-swap'(context,next,module){
      if(module.requireExecuted===true&&context.executed!==true){next();return;}
      const destination=context.targetPoint;
      if(!destination){next();return;}
      const resolvedModule={
        ...module,
        _executionSequence:Number.isFinite(Number(context.executionSequence))
          ?Math.max(0,Math.floor(Number(context.executionSequence)||0))
          :0
      };
      const projectile=context.stationaryProjectileTarget||null;
      const swapped=projectile
        ?StationaryProjectileInteractionService.swapTeleportToProjectile(
          context.source,
          projectile,
          resolvedModule
        )
        :StationaryProjectileInteractionService.swapTeleportToPoint(
          context.source,
          destination,
          resolvedModule,
          null
        );
      if(swapped){
        AbilityModuleService.addUsageTags(context,module);
      }
      next();
    },
    'cooking.select-meal-target'(context,next,module){
      if(context.network===true){next();return;}
      const source=context.source;
      const state=CookingService.state(source,false);
      const mealCount=Math.max(0,Math.floor(Number(state?.mealCount)||0));
      if(!state||mealCount<=0){context.targetEntityId='';context.cookingMealCount=0;next();return;}
      let point=context.targetPoint||null;
      if(EntitySimulationAuthorityService.isLocal(source)&&typeof Training!=='undefined'&&typeof Training.mouseWorld==='function')point=Training.mouseWorld()||point;
      const target=CookingService.allyAtPoint(source,point);
      context.targetEntityId=target?String(target.id||''):'';
      context.cookingMealCount=target?mealCount:0;
      if(target)context.targetPoint={x:Number(target.x)||0,y:Number(target.y)||0};
      next();
    },

    'action.attack'(context,next,module){
      /*
        앞선 Ability module이 입력을 소비했다면 fallback 기본 공격은 실행하지 않는다.
        이 규칙은 로컬/원격 모두 동일해야 한다.

        온라인에서는 원격 ProjectileState가 패킷 순서/보간 시점 때문에
        소유자와 순간적으로 다를 수 있으므로, 수신 측 재판정만으로 fallback 여부를
        결정하지 않는다. 송신자가 handled=true로 확정했고 resolvedAttackId가 비어 있으면
        그 입력은 이동/회수 등 비공격 재사용으로 소비된 것이므로 기본 공격을 재생하지 않는다.
      */
      const senderConsumedWithoutAttack=
        context.network===true&&
        context.senderHandled===true&&
        !String(context.resolvedAttackId||'');

      if(
        context.handled===true||
        senderConsumedWithoutAttack
      ){
        next();
        return;
      }

      // release 입력의 원격 재생은 송신자 화면에서 실제 공격 실행이 성공했을 때만
      // 공격을 생성한다. release 정리 모듈은 계속 실행되어 원격 상태가 남지 않는다.
      if(
        context.network===true&&
        context.event==='input.release'&&
        context.senderExecuted===false
      ){
        next();
        return;
      }

      const source=context.source;
      const now=Number(context.now)||performance.now();
      const alternate=module?.alternateWhen||null;
      const alternates=
        Array.isArray(module?.alternates)
          ?module.alternates
          :[];
      let attack=context.attack;
      let matchedAlternate=false;
      let matchedCandidate=null;
      const networkAttackId=String(context.resolvedAttackId||'');

      if(context.network===true&&networkAttackId){
        attack=
          AbilityService.attackById(
            source.character,
            networkAttackId
          )||attack;

        const networkCandidates=[
          ...alternates,
          ...(alternate?[alternate]:[])
        ];
        const networkCandidate=
          networkCandidates.find(
            candidate=>
              String(candidate?.attackId||'')===
              networkAttackId
          )||
          null;

        if(
          networkCandidate?.fieldStateKey&&
          context.targetPoint&&
          Number.isFinite(Number(context.targetPoint.x))&&
          Number.isFinite(Number(context.targetPoint.y))
        ){
          const fieldPoint={
            x:Number(context.targetPoint.x),
            y:Number(context.targetPoint.y)
          };
          attack={
            ...attack,
            modules:Object.freeze(
              (attack.modules||[]).map(
                item=>
                  AttackModuleService.type(item)==='delivery.area'
                    ?Object.freeze({
                      ...item,
                      centerPoint:Object.freeze({...fieldPoint})
                    })
                    :item
              )
            )
          };
        }
      }else{
        const candidates=[
          ...alternates,
          ...(alternate?[alternate]:[])
        ];

        for(const candidate of candidates){
          if(context.freeAttack===true&&candidate?.allowFreeAttack===false)continue;
          if(
            !candidate?.attackId||
            (
              !candidate.stateKey&&
              !Array.isArray(candidate.conditions)
            )
          )continue;

          const conditions=
            Array.isArray(candidate.conditions)
              ?candidate.conditions
              :[
                candidate.phase
                  ?{
                    type:'state.phase',
                    stateKey:candidate.stateKey,
                    phase:candidate.phase
                  }
                  :{
                    type:'state.exists',
                    stateKey:candidate.stateKey
                  }
              ];

          const matched=
            TriggerModuleService.matches(
              {
                type:'trigger',
                event:'ability.module',
                conditions
              },
              'ability.module',
              {...context,now}
            );

          if(!matched)continue;

          attack=
            AbilityService.attackById(
              source.character,
              candidate.attackId
            )||attack;
          matchedAlternate=true;
          matchedCandidate=candidate;
          break;
        }
      }

      if(
        context.network!==true&&
        module?.captureTargetPoint===true
      ){
        let pointer=null;
        if(
          EntitySimulationAuthorityService.isLocal(source)&&
          typeof Training!=='undefined'&&
          typeof Training.mouseWorld==='function'
        ){
          pointer=Training.mouseWorld();
        }
        if(
          pointer&&
          Number.isFinite(Number(pointer.x))&&
          Number.isFinite(Number(pointer.y))
        ){
          const clampToAttackRange=
            module.captureTargetPointClampToAttackRange!==false;

          if(!clampToAttackRange){
            context.targetPoint={
              x:Number(pointer.x),
              y:Number(pointer.y)
            };
          }else{
            const scaledForPoint=
              ProgressScaledAttackService.resolve(
                source,
                attack
              );
            const preparedForPoint=
              AugmentService.prepareAttack(
                source,
                scaledForPoint,
                now
              );
            const maxRange=Math.max(
              0,
              Number(preparedForPoint.range)||0
            );
            const dx=Number(pointer.x)-Number(source.x);
            const dy=Number(pointer.y)-Number(source.y);
            const distance=Math.hypot(dx,dy);

            if(maxRange>0&&distance>maxRange){
              const ratio=maxRange/Math.max(.001,distance);
              context.targetPoint={
                x:Number(source.x)+dx*ratio,
                y:Number(source.y)+dy*ratio
              };
            }else{
              context.targetPoint={
                x:Number(pointer.x),
                y:Number(pointer.y)
              };
            }
          }
        }
      }

      const fallbackConditions=
        context.freeAttack===true&&Array.isArray(module?.freeAttackFallbackConditions)
          ?module.freeAttackFallbackConditions
          :module?.fallbackConditions;
      if(
        context.network!==true&&
        attack===context.attack&&
        Array.isArray(fallbackConditions)&&
        !TriggerModuleService.matches(
          {
            type:'trigger',
            event:'ability.module',
            conditions:fallbackConditions
          },
          'ability.module',
          {...context,now}
        )
      ){
        context.handled=true;
        next();
        return;
      }

      if(
        context.network!==true&&
        matchedCandidate?.fieldStateKey
      ){
        const fieldState=InstalledAreaFieldService.findState(
          source,
          String(matchedCandidate.fieldStateKey||''),
          state=>state?.phase!=='afterlife'
        );
        if(!fieldState){
          context.handled=true;
          next();
          return;
        }
        const fieldPoint={
          x:Number(fieldState.pointX)||0,
          y:Number(fieldState.pointY)||0
        };
        context.targetPoint=fieldPoint;
        attack={
          ...attack,
          modules:Object.freeze((attack.modules||[]).map(item=>
            AttackModuleService.type(item)==='delivery.area'
              ?Object.freeze({...item,centerPoint:Object.freeze({...fieldPoint})})
              :item
          ))
        };
      }

      const executed=AbilityAttackExecutionService.execute(
        context,
        attack
      );

      if(executed){
        if(
          context.network!==true&&
          matchedAlternate&&
          matchedCandidate?.consume===true
        ){
          const stateKey=String(
            matchedCandidate.stateKey||
            matchedCandidate.conditions?.find?.(condition=>condition?.stateKey)?.stateKey||
            ''
          );
          if(stateKey){
            const timed=TimedActionStateService.state(
              source,
              stateKey,
              now
            );
            if(timed)TimedActionStateService.consume(source,stateKey,now);
            else source.actionState?.delete(stateKey);
          }
        }
      }
      next();
    },
    'resource.spend'(context,next,module){
      if(
        context.network===true||
        context.freeAttack===true
      ){
        next();
        return;
      }

      const source=context.source;
      const resource=String(module.resource||'');
      const amount=Math.max(0,Number(module.amount)||0);

      if(resource!=='stamina'){
        context.handled=true;
        return;
      }

      if(!StaminaService.spend(source,amount,Number(context.now)||performance.now())){
        context.handled=true;
        return;
      }

      next();
    },
    'status.apply'(context,next,module){
      if(
        module.requireExecuted===true&&
        context.executed!==true
      ){
        next();
        return;
      }

      const target=
        module.target==='target'
          ?context.target
          :context.source;
      const status=String(module.status||'');

      if(
        target?.alive&&
        COMBAT_STATUS_DEFS[status]
      ){
        const appliedAt=
          Number(context.now)||
          performance.now();

        CombatStatusApplicationService.apply({
          source:context.source,
          target,
          type:status,
          duration:Math.max(
            0,
            Number(module.duration)||0
          ),
          sourceId:String(
            module.sourceId||
            `ability:${context.ability?.id||'ability'}:${status}`
          ),
          data:{
            ...(module.data||{}),
            sourceEntityId:
              context.source?.id||
              null,
            stackMode:
              module.stackMode||
              'replace-source',
            presentationAppliedAt:appliedAt
          }
        });
      }

      next();
    },
    'action.trigger-attack'(context,next,module){
      if(
        module.requireExecuted===true&&
        context.executed!==true
      ){
        next();
        return;
      }

      // explicitNetworkReplay는 source 권위에서 독립 triggered-attack 패킷을 보내고,
      // 일반 ability network replay에서는 같은 후속타를 중복 실행하지 않는다.
      if(module.explicitNetworkReplay===true&&context.network===true){
        next();
        return;
      }

      const baseAttack=
        AbilityService.attackById(
          context.source?.character,
          String(module.attackId||'')
        );

      if(baseAttack){
        /*
          action.trigger-attack도 일반 action.attack과 동일하게
          현재 source의 증강/스탯이 적용된 prepared AttackSpec을 실행한다.
          raw AttackSpec을 바로 실행하면 rangeBonus 같은 geometry adjustment가
          파생 공격에 적용되지 않는다.
        */
        let attack=
          AugmentService.prepareAttack(
            context.source,
            baseAttack,
            Number(context.now)||
            performance.now()
          );
        let targetPoint=context.targetPoint||null;
        const projectileStateKey=String(module.projectileStateKey||'');
        if(projectileStateKey){
          const projectile=ProjectileStateService.get(
            context.source,
            projectileStateKey
          );
          if(!projectile){
            if(module.requireProjectile===true){next();return;}
          }else{
            targetPoint={x:Number(projectile.x)||0,y:Number(projectile.y)||0};
            attack={
              ...attack,
              modules:Object.freeze((attack.modules||[]).map(item=>{
                const type=AttackModuleService.type(item);
                if(type==='delivery.area')return Object.freeze({...item,centerPoint:Object.freeze({...targetPoint})});
                if(type==='effect.spawn')return Object.freeze({...item,position:'point',x:targetPoint.x,y:targetPoint.y});
                return item;
              }))
            };
          }
        }
        const fieldStateKey=String(module.fieldStateKey||'');
        if(fieldStateKey){
          const fieldState=InstalledAreaFieldService.findState(
            context.source,
            fieldStateKey,
            state=>state?.phase!=='afterlife'
          );
          if(!fieldState){next();return;}
          targetPoint={x:Number(fieldState.pointX)||0,y:Number(fieldState.pointY)||0};
          attack={
            ...attack,
            modules:Object.freeze((attack.modules||[]).map(item=>
              AttackModuleService.type(item)==='delivery.area'
                ?Object.freeze({...item,centerPoint:Object.freeze({...targetPoint})})
                :item
            ))
          };
        }

        const executed=
          TriggeredAttackService.execute(
            context.source,
            attack,
            Number(context.angle)||0,
            {
              networkReplay:
                context.network===true,
              broadcast:module.explicitNetworkReplay===true,
              targetPoint,
              abilityUseId:context.abilityUseId||null
            }
          );

        if(executed){
          context.executed=true;
        }
      }

      next();
    },
    'summon.carry-drop'(context,next,module){
      const source=context.source;
      const stateKey=String(module.stateKey||'');
      const state=SummonDeployService.state(source,stateKey,false);
      if(!state?.carrying){
        next();
        return;
      }

      if(context.network===true){
        context.handled=true;
        context.executed=true;
        return;
      }

      const spec=SummonDeployService.spec(source,stateKey);
      const now=Number(context.now)||performance.now();
      const dropped=SummonDeployService.dropCarry(
        source,
        stateKey,
        Math.max(0,Number(spec?.carry?.pickupCooldown)||0),
        now
      );
      if(dropped){
        const cooldown=Math.max(
          0,
          Number(module.cooldown)||
          Number(spec?.carry?.dropCooldown)||0
        );
        if(context.attack?.id&&module.skipOwnCooldown!==true){
          source.cooldowns.set(context.attack.id,now+cooldown);
        }
        for(const attackId of module.cooldownAttackIds||[]){
          source.cooldowns.set(
            String(attackId),
            now+Math.max(0,Number(module.cooldownAttackDuration)||cooldown)
          );
        }
        source.lastAttackTime=now;
        AbilityModuleService.addUsageTags(context,module);
        context.handled=true;
        context.executed=true;
        return;
      }

      next();
    },
    'cooking.stove-toggle'(context,next,module){
      const source=context.source;
      const stateKey=String(module.stateKey||'');
      const state=SummonDeployService.state(source,stateKey,true);
      const now=Number(context.now)||performance.now();
      if(state?.active){
        if(context.network!==true&&(source.cooldowns.get(context.attack.id)||0)>now){context.handled=true;next();return;}
        if(EntitySimulationAuthorityService.isLocal(source))CookingService.finishStove(source);
        SummonDeployService.recall(source,stateKey);
        if(context.network!==true){source.cooldowns.set(context.attack.id,now+Math.max(0,Number(module.recallCooldown)||0));AttackService.applyAttackDelay(source,context.attack,now);source.lastAttackTime=now;NaturalHealthRegenActivityService.mark(source,now);}
        context.handled=true;context.executed=true;next();return;
      }
      const executed=SummonDeployService.toggle(context,{...module,type:'summon.toggle'});
      if(executed)context.executed=true;
      next();
    },

    'summon.toggle'(context,next,module){
      const executed=SummonDeployService.toggle(
        context,
        module
      );
      if(executed){
        AbilityModuleService.addUsageTags(
          context,
          module
        );
        context.executed=true;
      }
      next();
    },
    'summon.spawn'(context,next,module){
      if(context.network===true){
        context.handled=true;
        context.executed=true;
        AbilityModuleService.addUsageTags(
          context,
          module
        );
        next();
        return;
      }

      const spawned=
        SummonDeployService.spawnFromAttack(
          context.source,
          module,
          Number(context.angle)||0,
          context.execution||null
        );

      if(spawned){
        AbilityModuleService.addUsageTags(
          context,
          module
        );
        context.handled=true;
        context.executed=true;
      }
      next();
    },
    'summon.return-owner'(context,next,module){
      const source=context.source;
      const mode=module.whenMode||null;
      if(
        mode&&
        ModeStateService.current(
          source,
          String(mode.stateKey||''),
          String(mode.initial||'')
        )!==String(mode.value||'')
      ){
        next();
        return;
      }

      const stateKey=String(module.stateKey||'');
      const state=SummonDeployService.state(
        source,
        stateKey,
        false
      );
      const summon=SummonDeployService.entity(
        source,
        stateKey
      );

      if(!state||!summon?.alive){
        next();
        return;
      }

      const executed=
        SummonDeployService.returnToOwner(
          context,
          stateKey,
          module,
          state,
          summon
        );

      if(executed){
        if(
          mode?.stateKey&&
          module.setModeAfter!==undefined
        ){
          ModeStateService.set(
            source,
            String(mode.stateKey),
            String(module.setModeAfter),
            String(mode.initial||'')
          );
        }

        AbilityModuleService.addUsageTags(
          context,
          module
        );
        context.executed=true;
        return;
      }

      next();
    },

    'state.progress'(context,next,module){
      if(
        module.requireExecuted===true&&
        context.executed!==true
      ){
        next();
        return;
      }

      const applied=
        ProgressStateService.apply(
          context.source,
          module
        );

      if(applied){
        context.executed=true;
      }
      next();
    },
    'modifier.limited-use'(context,next,module){
      if(LimitedUseBuffService.grant(context.source,module,context.now))context.executed=true;
      next();
    },
    'equipment.select'(context,next,module){
      if(module.requireExecuted===true&&context.executed!==true){next();return;}
      const config=ReactiveEquipmentService.config(context.source);
      const value=module.operation==='previous'
        ?ModeStateService.state(context.source,config?.stateKey)?.previousValue
        :module.value;
      if(ReactiveEquipmentService.select(context.source,String(value||''),context.now))context.executed=true;
      next();
    },
    'mode.set'(context,next,module){
      if(
        module.requireExecuted===true&&
        context.executed!==true
      ){
        next();
        return;
      }

      const changed=
        ModeStateService.set(
          context.source,
          String(module.stateKey||''),
          String(module.value||''),
          String(module.initial||'')
        );

      if(changed){
        context.executed=true;
      }
      next();
    },
    'mode.toggle'(context,next,module){
      const source=context.source;
      const now=performance.now();
      const cooldown=Math.max(
        0,
        Number(module.cooldown)||0
      );

      if(
        cooldown>0&&
        (source.cooldowns.get(context.attack.id)||0)>now
      ){
        context.handled=true;
        return;
      }

      const changed=
        context.network===true&&Array.isArray(context.modeStates)
          ?context.modeStates.find(state=>state.stateKey===String(module.stateKey||''))
          :ModeStateService.toggle(source,{...module,
            step:module.inputStep===true?(Number(context.modeStep)||1):module.step});

      if(!changed){
        next();
        return;
      }

      if(cooldown>0){
        source.cooldowns.set(
          context.attack.id,
          now+cooldown
        );
      }
      source.lastAttackTime=now;
      NaturalHealthRegenActivityService.mark(
        source,
        now
      );
      AbilityModuleService.addUsageTags(
        context,
        module
      );
      context.handled=true;
      context.executed=true;
      next();
    },

    'summon.recall'(context,next,module){
      if(
        module.whenHandled!==true||
        context.handled===true
      ){
        SummonDeployService.recall(
          context.source,
          String(module.stateKey||'')
        );
      }
      next();
    },
    'orbit.inventory-recast'(context,next,module){
      if(context.network===true){
        next();
        return;
      }

      const resolvedModule={
        ...module,
        executed:context.executed===true
      };
      if(
        OrbitInventoryService.recastGate(
          context.source,
          resolvedModule,
          Number(context.now)||performance.now()
        )
      ){
        next();
      }else if(String(module.operation||'check')==='check'){
        context.handled=true;
      }else{
        next();
      }
    },

    'movement.move'(context,next,module){
      const target=module.target||null;
      let targetObject=null;
      let runtimeDistance=null;
      let moveAngle=Number(context.angle)||0;
      let extraMotion=null;
      let contextTargetPoint=null;

      if(
        module.direction==='target-point'&&
        context.targetPoint&&
        Number.isFinite(Number(context.targetPoint.x))&&
        Number.isFinite(Number(context.targetPoint.y))
      ){
        contextTargetPoint={
          x:Number(context.targetPoint.x),
          y:Number(context.targetPoint.y)
        };
        const dx=contextTargetPoint.x-context.source.x;
        const dy=contextTargetPoint.y-context.source.y;
        runtimeDistance=Math.hypot(dx,dy);
        if(runtimeDistance>.001)moveAngle=Math.atan2(dy,dx);
      }

      if(target?.type==='point'){
        const targetX=Number(target.x);
        const targetY=Number(target.y);
        if(!Number.isFinite(targetX)||!Number.isFinite(targetY)){
          next();
          return;
        }
        const dx=targetX-context.source.x;
        const dy=targetY-context.source.y;
        runtimeDistance=Math.hypot(dx,dy);
        if(runtimeDistance>.001)moveAngle=Math.atan2(dy,dx);
      }

      if(target?.type==='projectile'){
        const projectile=ProjectileStateService.get(
          context.source,
          target.stateKey
        );
        const phase=projectile?.behavior?.returning?.phase||null;

        if(
          !projectile||
          (
            target.phase&&
            phase!==target.phase&&
            !(context.network===true&&context.handled===true)
          )
        ){
          next();
          return;
        }

        targetObject=projectile;
        const dx=projectile.x-context.source.x;
        const dy=projectile.y-context.source.y;
        runtimeDistance=Math.hypot(dx,dy);
        moveAngle=runtimeDistance>.001
          ?Math.atan2(dy,dx)
          :Number(projectile.angle)||moveAngle;

        const extraDistance=Math.max(0,Number(target.extraDistance)||0);
        if(extraDistance>0){
          extraMotion={
            distance:extraDistance,
            speed:Math.max(
              .001,
              Number(module.extraDistanceSpeed)||Number(module.speed)||1
            ),
            angle:moveAngle,
            motionMode:String(module.extraDistanceMotion||'normal'),
            tags:Array.isArray(module.extraDistanceTags)
              ?[...module.extraDistanceTags]
              :[],
            collision:Object.freeze({
              passWalls:String(module.extraDistanceMotion||'normal')!=='knockback',
              passEnemies:true
            })
          };
        }
      }

      let pathPoints=null;
      if(
        module.pathSource==='drag-path'&&
        Array.isArray(context.dragPath)
      ){
        pathPoints=context.dragPath;
      }

      // target이 없는 fixed/input 이동은 module의 distance/time/speed 두 값을 그대로 사용.
      const started=MovementAbilityService.start(
        context.source,
        module,
        moveAngle,
        {
          runtimeDistance,
          pathPoints,
          angle:moveAngle,
          followup:extraMotion,
          trajectory:AttackModuleService.module(
            context.attack,
            'trajectory.arc'
          ),
          targetPoint:contextTargetPoint
        }
      );

      if(!started){
        next();
        return;
      }

      if(module.consumeTarget&&targetObject){
        ProjectileStateService.remove(targetObject);
      }

      AbilityModuleService.addUsageTags(
        context,
        module
      );
      context.handled=true;
      context.executed=true;
      next();
    },

    'projectile.waypoint-path'(context,next,module){
      const action=String(module.action||'');
      const source=context.source;
      const projectile=WaypointProjectileService.projectile(source,module.stateKey);

      if(action==='hold-start'){
        if(!projectile||projectile.behavior?.returning?.phase==='returning'){
          next();
          return;
        }
        if(
          context.freeAttack===true&&
          module.automaticCommandAttackId
        ){
          const appended=
            WaypointProjectileService.append(
              context,
              {
                ...module,
                commandAttackId:String(module.automaticCommandAttackId||''),
                commandKind:String(module.automaticCommandKind||'lmb'),
                commandCost:Math.max(0,Number(module.automaticCommandCost)||0),
                commandDelay:Math.max(0,Number(module.automaticCommandDelay)||0),
                commandKey:String(module.automaticCommandKey||module.automaticCommandKind||'lmb')
              }
            );
          context.handled=true;
          context.executed=appended===true;
          context.suppressStealthRevealOnAbilityUse=true;
          return;
        }
        if(WaypointProjectileService.beginHold(source,projectile,module,Number(context.now)||performance.now())){
          context.handled=true;
          context.executed=true;
          context.suppressStealthRevealOnAbilityUse=true;
          return;
        }
        next();
        return;
      }

      if(action==='hold-release'){
        if(WaypointProjectileService.releaseHold(context,module)){
          context.handled=true;
          context.executed=true;
          context.suppressStealthRevealOnAbilityUse=true;
        }
        next();
        return;
      }

      if(action==='append-or-fallback'){
        if(!projectile||projectile.behavior?.returning?.phase==='returning'){
          next();
          return;
        }
        const appended=
          WaypointProjectileService.append(
            context,
            module
          );
        context.handled=true;
        context.executed=appended===true;
        context.suppressStealthRevealOnAbilityUse=true;
        return;
      }

      next();
    },

    'projectile.recall'(context,next,module){
      const projectile=ProjectileStateService.get(
        context.source,
        module.stateKey
      );

      if(!projectile){
        next();
        return;
      }

      if(
        module.requireStationaryArrival===true&&
        !projectile.stationaryArrival
      ){
        if(module.blockFallbackWhileExists)return;
        next();
        return;
      }

      if(
        module.phase&&
        !TriggerModuleService.matches(
          {
            type:'trigger',
            event:'ability.module',
            conditions:[{
              type:'state.phase',
              stateKey:module.stateKey,
              phase:module.phase
            }]
          },
          'ability.module',
          context
        )&&
        !(context.network===true&&context.handled===true)
      ){
        if(module.blockFallbackWhileExists)return;
        next();
        return;
      }

      if(
        module.requireAttackReady&&
        context.network!==true&&
        (context.source.cooldowns.get(context.attack.id)||0)>performance.now()
      ){
        return;
      }

      if(!ProjectileStateService.beginReturn(projectile,{manual:true,speedOverride:module.speed})){
        if(module.blockFallbackWhileExists)return;
        next();
        return;
      }

      ProjectileService.clearBoundField(
        projectile
      );

      const movement=module.movement;
      if(movement){
        let angle=0;

        if(movement.direction==='away-from-projectile'){
          angle=Math.atan2(
            context.source.y-projectile.y,
            context.source.x-projectile.x
          );
        }

        MovementAbilityService.start(
          context.source,
          {
            ...movement,
            type:'movement.move',
            control:'fixed',
            collision:{
              passWalls:String(movement.motionMode||'normal')!=='knockback',
              passEnemies:true
            }
          },
          angle,
          {angle}
        );

      }

      context.source.lastAttackTime=performance.now();
      AbilityModuleService.addUsageTags(
        context,
        module
      );
      context.handled=true;
      context.executed=true;
      next();
    },
    'resource.restore'(context,next,module){
      if(module.requireExecuted===true&&context.executed!==true){next();return;}
      if(module.requireAttackId&&String(context.resolvedAttackId||'')!==String(module.requireAttackId)){next();return;}
      ResourceRestoreEffectService.apply({
        source:context.source,target:context.target||null,module,
        defaultRecipient:'source',presentationDefault:'ability',reason:'ability.resource.restore',
        now:Number(context.now)||performance.now()
      });
      next();
    },
    'effect.spawn'(context,next,module){
      if(!EffectSpawnService.shouldPresentAttack(context.source,context)){
        next();
        return;
      }
      if(
        module.requireExecuted===true&&
        context.executed!==true
      ){
        next();
        return;
      }
      const position=String(module.position||'source');
      const now=performance.now();
      let preparedModule=module;

      if(module.scaleWithAttackRange===true){
        const rangeAttackId=
          String(
            module.rangeScaleAttackId||
            module.requireAttackId||
            context.resolvedAttackId||
            context.attack?.id||
            ''
          );
        const rangeAttack=
          rangeAttackId
            ?AbilityService.attackById(
              context.source?.character,
              rangeAttackId
            )
            :null;

        if(rangeAttack){
          preparedModule=
            AugmentService.prepareAttackLinkedGeometry(
              context.source,
              rangeAttack,
              module,
              now,
              {visual:true}
            );
        }
      }

      if(
        preparedModule.clipToAttackArea===true&&
        preparedModule.clipAttackId
      ){
        const clipBase=
          AbilityService.attackById(
            context.source?.character,
            String(preparedModule.clipAttackId||'')
          );
        if(clipBase){
          const clipAttack=
            AugmentService.prepareAttack(
              context.source,
              ProgressScaledAttackService.resolve(
                context.source,
                clipBase
              ),
              now
            );
          const clipArea=
            AttackModuleService.module(
              clipAttack,
              'delivery.area'
            );
          if(
            clipArea&&
            (
              clipArea.shape==='circle'||
              clipArea.shape==='sector'||
              clipArea.shape==='tapered-rect'
            )
          ){
            const clipAngle=
              Number(context.angle)||0;
            const geometry=
              AreaGeometryService.polygon(
                context.source,
                clipArea,
                clipAngle+
                (Number(clipArea.angleOffset)||0)
              );
            const clipPoints=
              (geometry?.points||[]).map(
                point=>({
                  x:Number(point.x)||0,
                  y:Number(point.y)||0
                })
              );
            const wallCutSegments=
              preparedModule.clipMaskOnly===true
                ?AreaWallCutPresentationService.segments(
                  context.source,
                  clipAttack,
                  clipArea,
                  clipAngle+
                  (Number(clipArea.angleOffset)||0),
                  clipPoints
                )
                :[];
            preparedModule={
              ...preparedModule,
              points:clipPoints,
              wallCutSegments,
              clipWallPolicy:
                String(
                  clipArea.wallPolicy||'block'
                ),
              clipAreaShape:
                String(clipArea.shape||'')
            };
          }
        }
      }

      const rewindPath=position==='rewind-path'&&context.rewindFrom&&context.rewindTo;
      const baseEffectX=
        rewindPath
          ?(Number(context.rewindFrom.x)||0)
          :(position==='source'
            ?(Number(context.source?.x)||0)
            :(Number(preparedModule.x)||0));
      const baseEffectY=
        rewindPath
          ?(Number(context.rewindFrom.y)||0)
          :(position==='source'
            ?(Number(context.source?.y)||0)
            :(Number(preparedModule.y)||0));
      const effectPerpendicularOffset=
        Number(preparedModule.perpendicularOffset)||0;
      const effectAngle=
        Number(context.angle)||0;
      const windupEffect=
        AttackWindupService.isContextWindup(
          context,
          preparedModule
        );

      const windupEffectKey=
        windupEffect&&
        context.abilityUseId
          ?(
            preparedModule.key||
            `ability-windup:${String(context.source?.id||'entity')}:${String(context.abilityUseId)}:${Math.max(1,Number(context._windupEffectOrdinal=(Number(context._windupEffectOrdinal)||0)+1))}`
          )
          :preparedModule.key;

      const effect=EffectSpawnService.spawn({
        ...preparedModule,
        key:windupEffectKey,
        x:
          baseEffectX-
          Math.sin(effectAngle)*
          effectPerpendicularOffset,
        y:
          baseEffectY+
          Math.cos(effectAngle)*
          effectPerpendicularOffset,
        tx:rewindPath?(Number(context.rewindTo.x)||0):preparedModule.tx,
        ty:rewindPath?(Number(context.rewindTo.y)||0):preparedModule.ty,
        color:preparedModule.color==='character'?context.source?.color:preparedModule.color,
        sourceEntityId:context.source?.id||null
      },context);
      if(effect){
        context.executed=true;

        if(
          windupEffect&&
          context.abilityUseId&&
          effect.key
        ){
          AttackWindupService.registerEffect(
            context.source,
            context.abilityUseId,
            effect.key
          );
        }

        if(
          context.network!==true&&
          OnlinePresentationSyncService?.shouldSend?.(context.source)
        ){
          OnlinePresentationSyncService.send(
            'effect-spawn',
            context.source,
            {
              effect:EffectSpawnService.presentationSnapshot(
                effect,
                now
              )
            }
          );
        }
      }
      next();
    },
    'ability.lock'(context,next,module){
      if(
        context.skipAttackWindup===true&&
        context.executed!==true
      ){
        next();
        return;
      }

      if(module.when==='handled'){
        const trigger={
          type:'trigger',
          event:'ability.module',
          conditions:[{type:'context.truthy',key:'handled'}]
        };
        if(!TriggerModuleService.matches(trigger,'ability.module',context)){
          next();
          return;
        }
      }

      context.source.abilityPending.set(
        context.ability.id,
        performance.now()+
          Math.max(0,Number(module.duration)||0)
      );

      next();
    },
    'counter.execute'(context,next,module){
      if(CounterModuleService.execute(context,module)){
        context.executed=true;
      }
    },
    'counter.release'(context,next){
      CounterModuleService.requestRelease(
        context.source,
        context.angle,
        context.now,
        context.network===true
      );
      next();
    },
    'state.consume'(context,next,module){
      if(module.state==='counter-ready')context.source.counterReadyUntil=0;
      next();
    },
    'preview.create'(context,next,module){
      if(
        context.skipAttackWindup===true&&
        context.executed!==true
      ){
        next();
        return;
      }

      if(
        module.requireExecuted===true&&
        context.executed!==true
      ){
        next();
        return;
      }
      const previewAttack=
        module.attackId
          ?(
            AbilityService.attackById(
              context.source?.character,
              String(module.attackId)
            )||context.attack
          )
          :context.attack;
      const resolvedPreviewAttack=
        module.attackId
          ?previewAttack
          :(
            AbilityService.resolvedInputAttack(
              context.source,
              context.ability,
              Number(context.now)||performance.now()
            )||previewAttack
          );
      if(
        context.executed!==true&&
        module.requireExecuted!==true&&
        module.ignoreAttackCooldown!==true&&
        resolvedPreviewAttack&&
        !AttackService.previewReady(
          context.source,
          resolvedPreviewAttack,
          performance.now()
        )
      ){
        context.handled=true;
        return;
      }
      const persistent=module.persistent===true;
      const duration=persistent
        ?Infinity
        :Math.max(
          GAME_DATA.frameMs,
          Number(module.duration)||
          Number(context.delayMs)||
          GAME_DATA.frameMs*2
        );
      const until=persistent
        ?Infinity
        :performance.now()+duration;

      if(module.shape==='attack-sector'){
        context.source.attackPreview={
          type:'sector',
          range:resolvedPreviewAttack.range,
          halfAngle:AttackModuleService.spread(resolvedPreviewAttack)/2,
          projectile:TagService.hasAttack(resolvedPreviewAttack,'공격형태 투사체'),
          until,
          angle:context.angle
        };
      }else if(module.shape==='attack-shape'){
        context.source.attackPreview=
          AttackPreviewService.fromAttack(
            context.source,
            resolvedPreviewAttack,
            context.angle,
            until,
            context.source.attackPreview,
            {includeDeliveryAreas:module.includeDeliveryAreas!==false,targetPoint:context.targetPoint}
          );
      }

      const created=context.source.attackPreview;
      if(created){
        if(
          module.followSource===true||
          module.aimMode==='live-source'
        ){
          created.liveTracking={
            attackId:String(resolvedPreviewAttack?.id||''),
            aimMode:String(module.aimMode||'locked'),
            followSource:module.followSource===true,
            includeDeliveryAreas:module.includeDeliveryAreas!==false,
            angle:Number(context.angle)||0
          };
        }
        if(!persistent){
          SimulationScheduleService.scheduleContinuation({
            at:until,
            source:context.source,
            abilityId:context.ability?.id||null,
            continue:()=>{
              if(
                context.source.attackPreview===created&&
                Number(created.until)<=until+1
              ){
                context.source.attackPreview=null;
              }
            }
          });
        }
      }

      GameEvents.emit('ability-telegraph',context);
      next();
    },
    'modifier.set'(context,next,module){
      if(
        module.requireExecuted===true&&
        context.executed!==true
      ){
        next();
        return;
      }

      if(
        context.source?.alive&&
        COMBAT_BUFF_DEFS[module.stat]
      ){
        BuffService.set(
          context.source,
          module.stat,
          Number(module.value)||0,
          String(
            module.sourceId||
            `ability:${context.ability?.id||'ability'}:${module.stat}`
          ),
          Number.isFinite(Number(module.duration))
            ?Math.max(0,Number(module.duration))
            :Infinity,
          {
            tags:TagService.effectTags({
              type:'modifier.constant',
              value:Number(module.value)||0
            })
          }
        );
      }

      next();
    },
    'channel.attack'(context,next,module){
      if(
        module.requireExecuted===true&&
        context.executed!==true
      ){
        next();
        return;
      }

      const channelModule={
        ...module,
        windupAttackId:
          AttackWindupService.contextAttackId(
            context,
            module
          )
      };

      if(
        ChannelAttackService.start(
          context.source,
          channelModule,
          context.angle,
          Number(context.now)||performance.now()
        )
      ){
        context.executed=true;
      }

      next();
    },
    'channel.stop'(context,next,module){
      const state=
        ChannelAttackService.state(
          context.source,
          module.stateKey
        );

      if(
        state&&
        (state.phase==='active'||module.allowCharging===true)&&
        ChannelAttackService.stop(
          context.source,
          module.stateKey,
          Number(context.now)||performance.now()
        )
      ){
        context.handled=true;
        context.executed=true;
        context.resolvedAttackId='channel-stop';
        if(module.breakOnStop===true)return;
      }

      next();
    },
    'timing.delay'(context,next,module){
      if(
        context.skipAttackWindup===true&&
        context.executed!==true
      ){
        next();
        return;
      }

      if(
        module.requireExecuted===true&&
        context.executed!==true
      ){
        next();
        return;
      }
      const duration=Math.max(
        0,
        Number(module.duration)||0
      );
      const at=performance.now()+duration;
      context.deferredExecution=true;

      context.source.abilityPending.set(
        context.ability.id,
        at
      );

      const interruptibleWindup=
        AttackWindupService.isContextWindup(
          context,
          module
        );

      const windupStep=
        interruptibleWindup
          ?AttackWindupService.nextAbilityStep(
            context
          )
          :0;

      const continuationKey=
        interruptibleWindup
          ?AttackWindupService.abilityContinuationKey(
            context,
            windupStep
          )
          :'';

      const resume=()=>{
        if(module.aimMode==='live-source'){
          const liveAngle=Number(context.resolveAim?.());
          if(Number.isFinite(liveAngle))context.angle=liveAngle;
        }

        next();

        /*
         * next()가 다른 선딜 delay를 추가하지 않았다면 이 Ability의
         * 선딜용 이펙트 등록은 성공 완료 상태로 놓아준다.
         */
        if(
          interruptibleWindup&&
          Math.max(
            0,
            Math.floor(
              Number(context._windupStep)||0
            )
          )===windupStep
        ){
          AttackWindupService.releaseEffects(
            context.source,
            context.abilityUseId
          );
        }
      };

      if(
        interruptibleWindup&&
        context.network===true&&
        context.skipAttackWindup!==true
      ){
        AttackWindupService.registerRemoteContinuation(
          context.source,
          continuationKey,
          resume
        );
        return;
      }

      SimulationScheduleService.scheduleContinuation({
        at,
        source:context.source,
        abilityId:context.ability.id,
        interruptibleWindup,
        windupKind:
          interruptibleWindup
            ?'ability-delay'
            :null,
        continue:()=>{
          if(interruptibleWindup){
            AttackWindupService.sendCommit(
              context.source,
              continuationKey
            );
          }
          resume();
        }
      });
    },
    'preview.remove'(context,next,module){
      if(
        module?.requireExecuted===true&&
        context.executed!==true
      ){
        next();
        return;
      }
      context.source.attackPreview=null;
      next();
    }
  }),
  run(context,index=0){
    const module=(context.trigger?.modules||context.ability?.modules||[])[index];
    if(!module)return true;

    if(
      typeof module!=='string'&&
      module.requireAttackId&&
      String(context.resolvedAttackId||'')!==
        String(module.requireAttackId)
    ){
      return this.run(context,index+1);
    }

    if(
      typeof module!=='string'&&
      Array.isArray(module.conditions)&&
      !TriggerModuleService.matches(
        {
          type:'trigger',
          event:'ability.module',
          conditions:module.conditions
        },
        'ability.module',
        context
      )
    ){
      return this.run(context,index+1);
    }

    const type=typeof module==='string'?module:module.type;
    const handler=this.handlers[type];
    if(!handler)throw new Error(`등록되지 않은 능력 모듈: ${type}`);

    let continued=false;
    const next=()=>{
      if(continued)return;
      continued=true;
      this.run(context,index+1);
    };

    handler(context,next,module);
    return true;
  }
});
