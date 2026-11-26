

const CharacterTriggerEffectService=Object.freeze({
  observedEvents:new WeakMap(),
  observe(event,target,context={},eventKey=''){
    if(!target)return;
    for(const entity of EntityService.items.values()){
      if(!entity?.alive||!EntitySimulationAuthorityService.isLocal(entity)||
        RelationService.relation(entity,target)!=='enemy'||
        !entity.character?.triggers?.some(trigger=>trigger.event===event))continue;
      if(eventKey){
        let seen=this.observedEvents.get(entity);
        if(!seen){seen=new Set();this.observedEvents.set(entity,seen);}
        const key=`${OnlineDuelService.roundToken||0}:${event}:${target.id}:${eventKey}`;
        if(seen.has(key))continue;
        seen.add(key);
        if(seen.size>256)seen.delete(seen.values().next().value);
      }
      this.run(entity,event,{...context,source:entity,target});
    }
  },
  run(entity,event,context={}){
    if(!entity)return context;
    // Damage can make a target satisfy a passive condition during this same hit.
    // Confirmed target snapshots are read for this event without mutating remote mirrors.
    if(event==='damage-dealt'&&entity.alive&&entity.character?.passiveBuffs?.length){
      CharacterPassiveBuffService.sync(entity,{targetHealthSnapshots:context.targetHealthSnapshots});
    }

    const shared={
      ...context,
      source:
        context.source||
        entity,
      target:
        context.target||
        entity,
      triggerEvent:event,
      now:
        Number(context.now)||
        performance.now()
    };

    for(const trigger of entity?.character?.triggers||[]){
      if(trigger?.event!==event)continue;
      if(
        !TriggerModuleService.matches(
          trigger,
          event,
          shared
        )
      )continue;

      for(const module of trigger.modules||[]){
        if(!module)continue;

        if(module.type==='state.progress'){
          if(
            event==='damage-dealt'&&
            !ProgressHitTargetPolicy.eligible(shared.target)
          )continue;
          const amountFrom=
            String(module.amountFrom||'');
          const resolvedAmount=
            amountFrom
              ?Math.max(
                0,
                Number(shared[amountFrom])||0
              )
              :Math.max(
                0,
                Number(module.amount)||0
              );
          const resolved={
            ...module,
            amount:
              resolvedAmount*
              (
                Number.isFinite(
                  Number(module.amountScale)
                )
                  ?Number(module.amountScale)
                  :1
              )
          };

          const apply=()=>ProgressStateService.apply(entity,resolved);
          const delay=Math.max(0,Number(module.delay)||0);
          if(delay>0)SimulationScheduleService.scheduleContinuation({source:entity,at:shared.now+delay,continue:apply});
          else apply();
          continue;
        }

        if(module.type==='damage.multiply'){
          shared.amount=
            Math.max(
              0,
              (Number(shared.amount)||0)*
              Math.max(0,Number(module.value)||0)
            );
          continue;
        }

        if(module.type==='effect.spawn'){
          const attack=module.attackId?AbilityService.attackById(entity.character,module.attackId):shared.attack;
          if(!attack||!shared.target)continue;
          AttackModuleService.spawnAttackEffect(
            entity,attack,
            Number(shared.execution?.directionAngle)||0,
            shared.execution||null,module,shared.target
          );
          continue;
        }

        if(module.type==='resource.restore'){
          const recipient=
            module.recipient==='target'
              ?shared.target
              :module.recipient==='owner'
                ?(EntityService.owner(entity)||entity)
                :shared.source||entity;
          if(!recipient)continue;

          const effectKey=
            `character-trigger-restore:${trigger.id||event}:${module.resource||'health'}`;
          if(
            module.oncePerExecution===true&&
            shared.execution&&
            AttackExecutionService.hasEffect(
              shared.execution,
              effectKey
            )
          )continue;

          const restored=ResourceRestoreEffectService.apply({
            source:entity,
            target:recipient,
            module:{...module,recipient:'target',...(module.amountFrom?{amount:Math.max(0,Number(shared[module.amountFrom])||0)*(Number(module.amountScale)||0)}:{})},
            presentationDefault:'default',
            reason:'resource.restore',
            now:shared.now
          });

          if(
            restored>0&&
            module.oncePerExecution===true&&
            shared.execution
          ){
            AttackExecutionService.markEffect(
              shared.execution,
              effectKey
            );
          }
          continue;
        }

        if(module.type==='modifier.remove'){
          BuffService.remove(entity,String(module.stat||''),String(module.sourceId||''));
          continue;
        }
        if(module.type==='modifier.set'){
          if(!COMBAT_BUFF_DEFS[module.stat])continue;

          BuffService.set(
            entity,
            module.stat,
            Number(module.value)||0,
            String(
              module.sourceId||
              `character-trigger:${trigger.id||event}:${module.stat}`
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
      }
    }

    return shared;
  }
});
