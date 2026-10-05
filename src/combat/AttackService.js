

const AttackService=Object.freeze({
  delayKey(spec){
    const group=String(
      spec?.attackDelayGroup||''
    );
    return group
      ?`attack-delay:${group}`
      :null;
  },
  delayDuration(spec){
    return Math.max(
      0,
      Number(spec?.attackDelay)||0
    );
  },
  delayReady(source,spec,now=performance.now()){
    const key=this.delayKey(spec);
    if(!key)return true;
    return (
      (source?.cooldowns?.get(key)||0)<=now
    );
  },
  cooldownReady(source,spec,now=performance.now()){
    if(!source||!spec)return false;
    return (
      (source.cooldowns?.get(spec.id)||0)<=now&&
      this.delayReady(source,spec,now)
    );
  },
  previewReady(source,baseSpec,now=performance.now()){
    if(!source||!baseSpec)return false;
    const resolved=
      ProgressScaledAttackService.resolve(
        source,
        baseSpec
      );
    const prepared=
      AugmentService.prepareAttack(
        source,
        resolved,
        now
      );
    return this.cooldownReady(
      source,
      prepared,
      now
    );
  },
  applyAttackDelay(source,spec,now=performance.now()){
    const key=this.delayKey(spec);
    const duration=this.delayDuration(spec);
    if(!source||!key||duration<=0)return false;

    source.cooldowns.set(
      key,
      now+duration
    );
    return true;
  },
  canUse(source,spec){
    const now=performance.now();
    if(!source?.alive||!spec)return false;
    const stats=CombatStatsService.current(source,now);
    if(
      !stats.canAct||
      (source.cooldowns.get(spec.id)||0)>now||
      !this.delayReady(source,spec,now)
    )return false;

    return StaminaService.canSpend(source,spec.cost,now);
  },
  targetPointPolicy(spec){
    let hasTargetPoint=false;
    let explicitResolve='';
    let clearance=2;

    for(const module of spec?.modules||[]){
      if(!module||typeof module!=='object')continue;
      const type=AttackModuleService.type(module);

      if(
        (
          type==='delivery.projectile'||
          type==='delivery.range-projectile'
        )&&
        module.targetPoint===true
      ){
        hasTargetPoint=true;
        if(module.targetPointResolve){
          explicitResolve=String(module.targetPointResolve);
        }
        if(Number.isFinite(Number(module.targetPointClearance))){
          clearance=Math.max(1,Number(module.targetPointClearance));
        }
        continue;
      }

      if(
        type==='movement.move'&&
        String(module.direction||'')==='target-point'
      ){
        hasTargetPoint=true;
        if(module.targetPointResolve){
          explicitResolve=String(module.targetPointResolve);
        }
        if(Number.isFinite(Number(module.targetPointClearance))){
          clearance=Math.max(1,Number(module.targetPointClearance));
        }
      }
    }

    return {
      enabled:hasTargetPoint,
      resolve:
        explicitResolve||
        (
          hasTargetPoint
            ?'nearest-open'
            :'none'
        ),
      clearance
    };
  },
  resolveTargetPoint(spec,point){
    if(
      !point||
      !Number.isFinite(Number(point.x))||
      !Number.isFinite(Number(point.y))
    )return null;

    const resolved={
      x:Number(point.x),
      y:Number(point.y)
    };
    const policy=this.targetPointPolicy(spec);

    if(
      policy.enabled&&
      policy.resolve==='nearest-open'
    ){
      const openPoint=
        WorldGeometryService.nearestOpenPoint(
          resolved.x,
          resolved.y,
          policy.clearance
        );
      if(openPoint){
        resolved.x=Number(openPoint.x);
        resolved.y=Number(openPoint.y);
      }
    }

    return resolved;
  },
  execute(source,baseSpec,angle,options={}){
    if(!baseSpec){
      return false;
    }
    // 재장전 같은 수동 입력 없는 상태 완료는 CC와 공격 이벤트의 영향을 받지 않는다.
    // 상태 수치 변경만 허용하며, 일반 공격/피해 모듈은 이 경로로 실행할 수 없다.
    if(options.freeAttack===true&&baseSpec.passiveCompletion===true&&baseSpec.effectsOnly===true){
      if(!source?.alive)return false;
      const modules=baseSpec.modules||[];
      if(!modules.length||modules.some(module=>module.type!=='state.progress'))return false;
      for(const module of modules)ProgressStateService.apply(source,module);
      return true;
    }
    const now=performance.now();
    const committed=options.wallDeferredCommit===true;
    if(!committed)AugmentService.update(source,now);
    const scaledBaseSpec=options.preparedSpec===true
      ?baseSpec
      :ProgressScaledAttackService.resolve(source,baseSpec);
    const featurePreparedSpec=options.preparedSpec===true
      ?scaledBaseSpec
      :AttackFeatureTransformService.prepare(source,scaledBaseSpec,now);
    const networkAttackAdjustments={};
    const spec=options.preparedSpec===true
      ?featurePreparedSpec
      :AugmentService.prepareAttack(
        source,
        featurePreparedSpec,
        now,
        {
          networkAdjustments:
            options.networkAttackAdjustments||
            null,
          captureAdjustments:
            networkAttackAdjustments,
          resourceConditionSnapshot:
            options.resourceConditionSnapshot||
            null
        }
      );
    if(
      options.attackResult&&
      typeof options.attackResult==='object'
    ){
      options.attackResult.networkAttackAdjustments={
        ...networkAttackAdjustments
      };
    }
    const networkReplay=options.networkReplay===true;
    const freeAttack=options.freeAttack===true;

    let augmentRequestContext=null;
    if(!committed&&!networkReplay&&!freeAttack){
      if(!this.canUse(source,spec))return false;
      augmentRequestContext=
        AugmentEffectModuleService.runTrigger(
          source,
          'attack-requested',
          {
            source,
            attack:spec,
            angle:Number(angle)||0,
            now
          }
        );
      if(Array.isArray(augmentRequestContext?.deferredAttackModules)&&augmentRequestContext.deferredAttackModules.length){
        options.extraModules=[
          ...(Array.isArray(options.extraModules)?options.extraModules:[]),
          ...augmentRequestContext.deferredAttackModules
        ];
      }
      if(!StaminaService.spend(source,spec.cost,now))return false;
    }else if(
      !committed&&
      !networkReplay&&
      freeAttack&&
      (
        !source?.alive||
        CombatStatsService.current(source,now).canAct!==true
      )
    ){
      return false;
    }

    if(!committed&&!networkReplay&&!freeAttack){
      source.cooldowns.set(spec.id,now+spec.cd);
      this.applyAttackDelay(
        source,
        spec,
        now
      );
    }

    const shouldWallDefer=
      !committed&&
      WallOverlapAttackDeferService.shouldDefer(
        source,
        options,
        now
      );
    if(source!==Training.player){
      const movementState=
        MovementAbilityService.state(
          source,
          'movement:raise-jump'
        )||
        (
          source?._remoteMovementEffectState||
          (
            [...(source?.actionState?.values?.()||[])]
              .find(
                state=>
                  state?.kind===
                  MovementAbilityService.KIND
              )||
            null
          )
        );

    }
    if(shouldWallDefer){
      const queued=WallOverlapAttackDeferService.queue(source,spec,angle,options,now);
      return queued;
    }

    source.lastAttackTime=now;
    NaturalHealthRegenActivityService.mark(
      source,
      now
    );
    if(source.healthRegenPolicy){
      const stats=CombatStatsService.current(source,now);
      source.nextHealthRegenAt=now+source.healthRegenPolicy.idle*Math.max(0,stats.regenDelayMult);
    }

    const execution=
      networkReplay&&
      Number.isFinite(Number(options.executionSequence))
        ?AttackExecutionService.replica(
          source,
          spec,
          Math.max(
            0,
            Math.floor(Number(options.executionSequence)||0)
          ),
          angle,
          options.extraModules||null
        )
        :AttackExecutionService.create(
          source,
          spec,
          angle,
          options.extraModules||null
        );
    execution.networkReplay=networkReplay;
    if(networkReplay)AttackExecutionService.remember(source,execution);
    execution.networkAttackAdjustments={
      ...networkAttackAdjustments
    };
    if(
      options.attackResult&&
      typeof options.attackResult==='object'
    ){
      options.attackResult.executionSequence=
        Math.max(
          0,
          Math.floor(Number(execution.sequence)||0)
        );
    }
    execution.skipWindup=
      options.skipWindup===true;
    execution.abilityUseId=
      options.abilityUseId||null;
    execution.targetEntityId=options.targetEntityId?String(options.targetEntityId):'';
    execution.cookingMealCount=Math.max(0,Math.floor(Number(options.cookingMealCount)||0));
    const resolvedTargetPoint=
      this.resolveTargetPoint(
        spec,
        options.targetPoint
      );
    if(resolvedTargetPoint){
      execution.targetPoint=
        resolvedTargetPoint;
    }
    const volley={
      execution,
      total:AttackModuleService.deliveryCount(spec),
      resolved:0,
      hits:0,
      source,
      attack:spec,
      finished:false
    };

    for(const module of spec.modules||[]){
      if(
        AttackModuleService.type(module)==='state.progress'&&
        module.when==='before-attack'
      ){
        ProgressStateService.apply(
          source,
          module
        );
      }
    }

    AttackModuleService.deliver(source,spec,angle,volley);
    AttackModuleService.afterAttack(source,spec,angle,execution);
    for(const module of spec.modules||[]){
      if(
        AttackModuleService.type(module)==='resource.restore'&&
        module.recipient==='source'&&
        (!module.when||module.when==='after-attack')
      ){
        const key=`restore:${module.resource||'health'}:source`;
        if(AttackExecutionService.hasEffect(execution,key))continue;
        ResourceRestoreEffectService.apply({
          source,
          target:source,
          module,
          defaultRecipient:'source',
          presentationDefault:'default',
          reason:'attack.resource.restore',
          now
        });
        AttackExecutionService.markEffect(execution,key);
      }
    }


    GameEvents.emit('attack-fired',{source,attack:spec,execution,angle,now});

    if(
      options.broadcastTriggeredAttack===true&&
      networkReplay!==true
    ){
      TriggeredAttackService.broadcast(
        source,
        spec,
        angle,
        execution
      );
    }

    return true;
  }
});
