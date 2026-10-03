

const AugmentEffectModuleService=Object.freeze({
  executionAggregateIds:new WeakMap(),
  executionAggregateCounter:{value:0},
  executionAggregates:new Map(),
  executionAggregateId(execution){
    if(!execution||typeof execution!=='object')return 0;
    let id=this.executionAggregateIds.get(execution)||0;
    if(id>0)return id;
    id=++this.executionAggregateCounter.value;
    this.executionAggregateIds.set(execution,id);
    return id;
  },
  queueExecutionAggregate(entity,augment,effect,context){
    const executionId=this.executionAggregateId(context.execution);
    if(executionId<=0)return false;

    const key=[
      String(entity?.id||'entity'),
      String(augment?.id||'augment'),
      String(effect?.id||'trigger'),
      executionId
    ].join(':');
    let aggregate=this.executionAggregates.get(key)||null;

    if(!aggregate){
      aggregate={
        entity,
        augment,
        effect,
        context:{...context},
        amount:0,
        healthDamage:0
      };
      this.executionAggregates.set(key,aggregate);
      queueMicrotask(()=>{
        const resolved=this.executionAggregates.get(key)||null;
        if(!resolved)return;
        this.executionAggregates.delete(key);
        this.run(
          resolved.entity,
          resolved.augment,
          resolved.effect,
          {
            ...resolved.context,
            amount:resolved.amount,
            healthDamage:resolved.healthDamage,
            executionHealthDamage:resolved.healthDamage,
            executionAggregateResolved:true,
            now:performance.now()
          }
        );
      });
    }

    aggregate.amount+=Math.max(0,Number(context.amount)||0);
    aggregate.healthDamage+=Math.max(0,Number(context.healthDamage)||0);
    aggregate.context={...aggregate.context,...context};
    return true;
  },
  triggers(entity,event){
    return (
      AugmentService.owner(entity)?.augmentCache?.effectsByEvent?.get(event)||
      EMPTY_AUGMENT_EFFECTS
    );
  },
  usageKey(augment,effect){
    return `${augment.id}:${effect.id||'trigger'}`;
  },
  abilityUseEffectKey(augment,effect,context){
    const abilityUseId=String(context?.execution?.abilityUseId||context?.abilityUseId||'');
    return abilityUseId
      ?`${abilityUseId}|${augment.id}:${effect.id||'trigger'}`
      :'';
  },
  abilityUseAlreadyTriggered(entity,augment,effect,context){
    if(effect?.oncePerAbilityUse!==true)return false;
    const key=this.abilityUseEffectKey(augment,effect,context);
    if(!key)return false;
    return entity?._augmentAbilityUseEffects?.has(key)===true;
  },
  markAbilityUseTriggered(entity,augment,effect,context){
    if(effect?.oncePerAbilityUse!==true)return false;
    const key=this.abilityUseEffectKey(augment,effect,context);
    if(!key)return false;
    if(!(entity._augmentAbilityUseEffects instanceof Set)){
      entity._augmentAbilityUseEffects=new Set();
    }
    entity._augmentAbilityUseEffects.add(key);
    while(entity._augmentAbilityUseEffects.size>512){
      entity._augmentAbilityUseEffects.delete(
        entity._augmentAbilityUseEffects.values().next().value
      );
    }
    return true;
  },
  conditionMatches(entity,augment,effect,condition,context){
    if(!condition)return true;
    const now=Number(context.now)||performance.now();
    if(condition.type==='impact.direct'){
      return !CCService.isDotImpact(context.impact);
    }
    if(condition.type==='attack.tag'){
      return !!context.attack&&TagService.hasAttack(context.attack,condition.tag);
    }
    if(condition.type==='attack.tag-absent'){
      return !context.attack||!TagService.hasAttack(context.attack,condition.tag);
    }
    if(condition.type==='usage.available'){
      const owner=AugmentService.owner(entity);
      const used=owner?.augmentState.lifeUses.get(this.usageKey(augment,effect))||0;
      return used<
        Math.max(1,Number(condition.limit)||1)*
        (
          condition.limitPerStack===true
            ?Math.max(1,AugmentService.count(entity,augment.id))
            :1
        );
    }
    if(condition.type==='cooldown.ready'){
      const executionKey=`augment-effect-ready:${augment.id}:${effect.id||'trigger'}:${condition.cooldownId||'cooldown'}`;
      if(condition.shareExecution&&AttackExecutionService.hasEffect(context.execution,executionKey))return true;
      const ready=AugmentCooldownService.ready(entity,augment,condition.cooldownId,now);
      if(ready&&condition.shareExecution&&context.execution){
        AttackExecutionService.markEffect(context.execution,executionKey);
      }
      return ready;
    }
    if(condition.type==='buff.source-absent'){
      if(!COMBAT_BUFF_DEFS[condition.stat])return false;
      const sourceId=`trigger:${augment.id}:${condition.key||effect.id||condition.stat}`;
      return !BuffService.hasSource(entity,condition.stat,sourceId,now);
    }
    return TriggerConditionService.matches(
      condition,
      {
        ...context,
        source:context.source||entity,
        entity,
        attack:context.attack||null,
        now
      }
    );
  },
  triggeredAttack(entity,module,value,count){
    if(!module?.attack)return null;

    const modules=(module.attack.modules||[]).map(candidate=>{
      if(!candidate||typeof candidate==='string')return candidate;
      let next={...candidate};

      for(const scaling of module.scaleModuleValues||[]){
        if(
          AttackModuleService.type(candidate)!==String(scaling?.type||'')||
          !String(scaling?.property||'')
        )continue;

        const property=String(scaling.property);
        if(Number.isFinite(Number(candidate[property]))){
          next[property]=Number(candidate[property])*count;
        }
      }

      return next;
    });

    return {
      ...module.attack,
      modules,
      damageRatio:
        Number.isFinite(Number(module.fixedDamage))
          ?(
            Math.max(0,Number(module.fixedDamage)||0)*
            (module.scaleFixedDamagePerStack===true?count:1)
          )/Math.max(1,Number(entity?.baseDamage)||1)
          :module.damageFromPipeline===true
            ?Math.max(0,Number(value)||0)/
              (
                Math.max(1,Number(entity?.baseDamage)||1)*
                Math.max(
                  .10,
                  Number(
                    CombatStatsService.current(
                      entity,
                      performance.now()
                    ).damageMult
                  )||1
                )
              )
            :Math.max(0,Number(module.attack.damageRatio)||0)
    };
  },
  basicAttackAbility(entity){
    if(!entity?.character)return null;
    return Object.values(entity.character.abilities||{}).find(ability=>{
      if(String(ability?.input||'')!=='lmb')return false;
      const attack=AbilityService.attackById(
        entity.character,
        ability.attackId
      );
      return !!attack&&TagService.hasAttack(attack,'평타');
    })||null;
  },
  automaticScaledBasicAttackSpec(
    entity,
    ability,
    now=performance.now()
  ){
    const baseAttack=
      AbilityService.attackById(
        entity?.character,
        ability?.attackId
      );
    if(
      !baseAttack||
      (!baseAttack.charge&&!baseAttack.progressScale)
    )return null;

    let resolvedAttack=baseAttack;

    if(baseAttack.charge){
      const state=
        ChargedAttackService.states(entity).find(
          candidate=>
            candidate.attackId===baseAttack.id
        )||null;
      const progress=state
        ?ChargedAttackService.progress(
          state,
          baseAttack,
          now
        )
        :0;
      resolvedAttack=
        ChargedAttackService.dynamicSpec(
          baseAttack,
          progress
        );
    }else{
      resolvedAttack=
        ProgressScaledAttackService.resolve(
          entity,
          baseAttack
        );
    }

    return AugmentService.prepareAttack(
      entity,
      resolvedAttack,
      now
    );
  },
  run(entity,augment,effect,context){
    if(this.abilityUseAlreadyTriggered(entity,augment,effect,context))return context;
    const count=Math.max(1,AugmentService.count(entity,augment.id));
    const event=context.triggerEvent||effect.event;
    const matched=TriggerModuleService.matches(
      effect,
      event,
      context,
      (condition,sharedContext)=>this.conditionMatches(
        entity,augment,effect,condition,sharedContext
      )
    );
    if(!matched)return context;

    if(
      effect.aggregateByExecution===true&&
      context.executionAggregateResolved!==true&&
      this.queueExecutionAggregate(
        entity,
        augment,
        effect,
        context
      )
    ){
      return context;
    }

    let value=0;
    let triggered=false;
    const now=Number(context.now)||performance.now();

    for(const module of effect.modules||[]){
      if(!module)continue;

      if(module.type==='value.read'){
        value=Math.max(0,Number(context[module.source])||0);
        continue;
      }
      if(module.type==='value.multiply'){
        value*=Number(module.value)||0;
        if(module.perStack!==false)value*=count;
        continue;
      }
      if(module.type==='value.divide-by-target-max-health'){
        value/=
          Math.max(
            1,
            Number(context.target?.maxHealth)||1
          );
        continue;
      }
      if(module.type==='resource.restore'){
        const recipientType=
          String(module.recipient||'self');
        const recipient=
          recipientType==='owner'
            ?AugmentService.owner(entity)
            :recipientType==='source'
              ?(
                context.source||
                entity
              )
              :recipientType==='target'
                ?(
                  context.target||
                  entity
                )
                :entity;
        if(!recipient)continue;

        const restoreStackMultiplier=
          module.perStack===true
            ?count
            :1;
        let restoreValue=value;
        if(Number.isFinite(Number(module.amount))){
          restoreValue=
            Math.max(
              0,
              Number(module.amount)
            )*
            restoreStackMultiplier;
        }
        if(
          Number.isFinite(
            Number(module.maxResourceRatio)
          )
        ){
          const maximum=
            module.resource==='stamina'
              ?Math.max(
                0,
                Number(recipient.maxStamina)||0
              )
              :Math.max(
                0,
                Number(recipient.maxHealth)||0
              );

          restoreValue=
            maximum*
            Math.max(
              0,
              Number(module.maxResourceRatio)||0
            )*
            restoreStackMultiplier;
        }

        if(restoreValue<=0)continue;

        triggered=ResourceRestoreEffectService.apply({
          source:entity,
          target:recipient,
          module:{
            ...module,
            recipient:'target',
            amount:restoreValue,
            maxResourceRatio:undefined,
            missingResourceRatio:undefined
          },
          now:Number(context.now)||performance.now()
        })>0||triggered;
        continue;
      }
      if(module.type==='status.apply'){
        const target=context.target;
        if(!target||!COMBAT_STATUS_DEFS[module.status])continue;
        const data={...(module.data||{}),sourceEntityId:entity.id};
        if(module.valueFromPipeline)data.value=value;
        const duration=Math.max(0,Number(module.duration)||0)*(module.durationPerStack?count:1);
        triggered=CombatStatusApplicationService.apply({
          source:entity,
          target,
          type:module.status,
          duration,
          sourceId:entity.id,
          data
        })||triggered;
        continue;
      }
      if(module.type==='cooldown.consume'){
        const executionKey=
          `augment-cooldown-consume:${augment.id}:${effect.id||'trigger'}:${module.cooldownId||'cooldown'}`;

        if(
          module.oncePerExecution===true&&
          context.execution&&
          AttackExecutionService.hasEffect(
            context.execution,
            executionKey
          )
        ){
          continue;
        }

        const consumed=
          AugmentCooldownService.consume(
            entity,
            augment,
            module.cooldownId,
            now
          );

        if(
          consumed&&
          module.oncePerExecution===true&&
          context.execution
        ){
          AttackExecutionService.markEffect(
            context.execution,
            executionKey
          );
        }

        triggered=consumed||triggered;
        continue;
      }
      if(module.type==='cooldown.reset'){
        triggered=AugmentCooldownService.consume(entity,augment,module.cooldownId,now)||triggered;
        continue;
      }
      if(module.type==='modifier.set'){
        if(COMBAT_BUFF_DEFS[module.stat]){
          const owner=AugmentService.owner(entity)||entity;
          const sourceId=`trigger:${augment.id}:${module.key||effect.id||module.stat}`;
          const contextDuration=
            String(module.durationFromContext||'')
              ?Number(context[String(module.durationFromContext)])
              :NaN;
          const duration=
            Number.isFinite(contextDuration)
              ?Math.max(
                0,
                contextDuration+
                  (Number(module.durationOffset)||0)
              )
              :Number.isFinite(Number(module.duration))
                ?Math.max(0,Number(module.duration))
                :Infinity;
          const resolvedModifierValue=
            module.valueRef&&typeof module.valueRef==='object'
              ?CharacterPassiveBuffService.value(entity,module.valueRef)
              :Number(module.value)||0;
          BuffService.set(
            entity,
            module.stat,
            resolvedModifierValue*
              (
                module.perStack===false
                  ?1
                  :count
              ),
            sourceId,
            duration,
            {tags:TagService.effectTags(effect)}
          );
          owner.augmentState.persistent.set(`augment:trigger:${module.stat}:${sourceId}`,true);
          if(module.stat==='maxHealth'||module.stat==='maxStamina'){
            AugmentService.syncVitals(owner);
          }
          triggered=true;
        }
        continue;
      }
      if(module.type==='modifier.remove'){
        if(COMBAT_BUFF_DEFS[module.stat]){
          const owner=AugmentService.owner(entity)||entity;
          const sourceId=`trigger:${augment.id}:${module.key||effect.id||module.stat}`;
          BuffService.remove(entity,module.stat,sourceId);
          owner.augmentState.persistent.delete(`augment:trigger:${module.stat}:${sourceId}`);
          if(module.stat==='maxHealth'||module.stat==='maxStamina'){
            AugmentService.syncVitals(owner);
          }
          triggered=true;
        }
        continue;
      }
      if(module.type==='damage.multiply'){
        context.amount=Math.max(0,(Number(context.amount)||0)*Math.max(0,Number(module.value)||0));
        triggered=true;
        continue;
      }
      if(module.type==='defeat.prevent'){
        context.defeatPrevented=true;
        context.preventedHealth=
          Math.max(
            1,
            Number(module.health)||1
          );

        if(
          module.protectDamageBatch===true&&
          context.execution&&
          entity?.augmentState
        ){
          if(
            !(entity.augmentState.defeatProtection instanceof WeakMap)
          ){
            entity.augmentState.defeatProtection=
              new WeakMap();
          }

          entity.augmentState.defeatProtection.set(
            context.execution,
            now+
              Math.max(
                0,
                Number(module.protectDuration)||0
              )
          );
        }

        triggered=true;
        continue;
      }
      if(module.type==='movement.move'){
        const baseDistance=Math.max(0,Number(module.distance)||0);
        const movementModule={
          ...module,
          distance:
            baseDistance*
            (module.perStack===false?1:count)
        };
        const moveAngle=Number(module.angle??context.angle)||0;
        const started=MovementAbilityService.start(
          entity,
          movementModule,
          moveAngle,
          {angle:moveAngle}
        );
        if(started&&module.deferAttackUntilEnd===true){
          context.deferAttackUntilMovementEnd=true;
          if(Array.isArray(module.deferredAttackModules)&&module.deferredAttackModules.length){
            if(!Array.isArray(context.deferredAttackModules))context.deferredAttackModules=[];
            context.deferredAttackModules.push(...module.deferredAttackModules);
          }
        }
        triggered=started||triggered;
        continue;
      }
      if(module.type==='attack.trigger'){
        const triggeredAttack=this.triggeredAttack(
          entity,
          module,
          value,
          count
        );
        if(triggeredAttack){
          triggered=
            TriggeredAttackService.execute(
              entity,
              triggeredAttack,
              Number(module.angle??context.angle)||0
            )||triggered;
        }
        continue;
      }
      if(module.type==='action.basic-attack'){
        const ability=this.basicAttackAbility(entity);
        if(!ability)continue;

        const angle=Number(context.angle)||0;
        const repeats=
          module.repeatPerStack===true
            ?count
            :1;
        const delay=Math.max(0,Number(module.delay)||0);
        const delayStep=Math.max(0,Number(module.delayStep)||0);
        for(let index=0;index<repeats;index++){
          const executeBasicAttack=()=>{
            if(!entity?.alive)return;

            const liveMousePoint=
              entity===Training.player
                ?Training.mouseWorld()
                :null;
            const targetPoint=
              liveMousePoint&&
              Number.isFinite(Number(liveMousePoint.x))&&
              Number.isFinite(Number(liveMousePoint.y))
                ?{
                  x:Number(liveMousePoint.x),
                  y:Number(liveMousePoint.y)
                }
                :null;

            const scaledSpec=
              this.automaticScaledBasicAttackSpec(
                entity,
                ability,
                performance.now()
              );
            if(scaledSpec){
              if(
                CombatStatsService.current(
                  entity,
                  performance.now()
                ).canAct!==true
              )return;

              TriggeredAttackService.execute(
                entity,
                scaledSpec,
                angle,
                {
                  targetPoint,
                  skipWindup:true
                }
              );
              return;
            }

            const result={handled:false,executed:false};
            const activated=AbilityService.activate(
              entity,
              ability,
              {
                event:'input.press',
                  inputSlot:'lmb',
                  angle,
                  freeAttack:true,
                  skipAttackWindup:true,
                  targetPoint,
                  result
              }
            );
            const online=
              activated&&
              Training.sessionMode==='online'&&
              OnlineDuelService.active&&
              EntitySimulationAuthorityService.isLocal(entity);
            if(online){
              OnlineDuelService.sendAbility(
                'lmb',
                angle,
                result,
                targetPoint
              );
            }
          };
          const scheduledDelay=delay+delayStep*index;
          if(scheduledDelay>0){
            SimulationScheduleService.scheduleContinuation({
              at:now+scheduledDelay,
              source:entity,
              continue:executeBasicAttack
            });
          }else{
            executeBasicAttack();
          }
        }
        triggered=true;
        continue;
      }
      if(module.type==='survival.revive-delay'){
        const delay=Math.max(0,Number(module.delay)||0);
        context.defeatPrevented=true;
        context.preventedHealth=1;
        EntityCharacterDeathResetService.reset(
          entity,
          now,
          {preserveReplacementState:true}
        );
        entity.statuses?.clear?.();
        entity.hidden=false;
        MovementService.finalizeForcedMotion(entity);
        entity.attackPreview=null;
        entity.counterWindup=null;
        entity.abilityPending?.clear?.();
        CCService.add(
          entity,
          'revive',
          delay,
          `augment-revive:${augment.id}`,
          {sourceEntityId:entity.id}
        );
        BuffService.set(
          entity,
          'invulnerable',
          1,
          `augment-revive:${augment.id}`,
          delay
        );
        EffectSpawnService.spawn({
          type:'areaCircle',
          key:`augment-revive:${entity.id}`,
          x:entity.x,
          y:entity.y,
          r:entity.radius+34,
          range:entity.radius+34,
          fillAlpha:.06,
          strokeAlpha:.9,
          lineWidth:3,
          start:now,
          dur:delay,
          color:entity.character?.color||entity.color
        },{source:entity});
        SimulationScheduleService.scheduleContinuation({
          at:now+delay,
          source:entity,
          continue:()=>{
            if(!entity)return;
            entity.alive=true;
            ResourceRestoreEffectService.apply({
              source:entity,
              target:entity,
              module:{
                type:'resource.restore',
                resource:'health',
                recipient:'target',
                maxResourceRatio:1,
                applyHealingModifier:false
              },
              now:performance.now()
            });
            entity.healthTrailHealth=entity.health;
            ResourceRestoreEffectService.apply({
              source:entity,
              target:entity,
              module:{
                type:'resource.restore',
                resource:'stamina',
                recipient:'target',
                maxResourceRatio:1
              },
              now:performance.now()
            });
            CCService.removeSource(
              entity,
              'revive',
              `augment-revive:${augment.id}`
            );
            BuffService.remove(
              entity,
              'invulnerable',
              `augment-revive:${augment.id}`
            );
            MovementService.resolveEmbedded(entity);
          }
        });
        triggered=true;
        continue;
      }
      if(module.type==='usage.consume'){
        const owner=AugmentService.owner(entity);
        if(owner){
          const key=this.usageKey(augment,effect);
          owner.augmentState.lifeUses.set(key,(owner.augmentState.lifeUses.get(key)||0)+1);
          triggered=true;
        }
      }
    }

    if(triggered){
      this.markAbilityUseTriggered(entity,augment,effect,context);
      GameEvents.emit('augment-triggered',{
        entity:AugmentService.owner(entity)||entity,
        damagedEntity:context.target||null,
        source:context.source||null,
        attack:context.attack||null,
        execution:context.execution||null,
        impact:context.impact||null,
        effectId:effect.id||'',
        tags:TagService.effectTags(effect),
        amount:value,
        now
      });
    }
    return context;
  },
  runTrigger(entity,trigger,context={}){
    const entries=this.triggers(entity,trigger);
    if(!entries.length)return context;

    const shared={
      ...context,
      triggerEvent:trigger,
      now:Number(context.now)||performance.now()
    };
    for(const {augment,effect} of entries){
      this.run(entity,augment,effect,shared);
    }
    return shared;
  }
});