

const CharacterTriggerEffectService=Object.freeze({
  run(entity,event,context={}){
    if(!entity)return context;

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

          ProgressStateService.apply(
            entity,
            resolved
          );
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
            module:{...module,recipient:'target'},
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