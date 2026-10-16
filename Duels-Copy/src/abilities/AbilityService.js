

const AbilityService=Object.freeze({
  attackById(character,attackId){
    return Object.values(character?.attacks||{}).find(attack=>attack.id===attackId)||null;
  },
  damageRatio(character,attack,seen=new Set()){
    if(!attack)return 0;
    const id=String(attack.id||'');
    if(id&&seen.has(id))return Math.max(0,Number(attack.damageRatio)||0);
    if(id)seen.add(id);

    const refId=String(attack.damageRatioRefAttackId||'');
    if(refId){
      const referenced=this.attackById(character,refId);
      if(referenced){
        return this.damageRatio(character,referenced,seen);
      }
    }
    return Math.max(0,Number(attack.damageRatio)||0);
  },
  eventAttack(source,ability,event='input.press',now=performance.now(),resolvedAttackId=''){
    if(!source||!ability)return null;

    const networkResolvedId=String(resolvedAttackId||'');
    if(networkResolvedId){
      const networkResolved=this.attackById(
        source.character,
        networkResolvedId
      );
      if(networkResolved)return networkResolved;
    }

    let attackId=
      event==='input.hold'
        ?String(ability.holdAttackId||ability.attackId||'')
        :event==='input.release'
          ?String(ability.releaseAttackId||ability.attackId||'')
          :String(ability.attackId||'');

    if(event==='input.press'){
      for(const candidate of ability.inputAttackAlternates||[]){
        if(!candidate?.attackId)continue;
        const conditions=Array.isArray(candidate.conditions)
          ?candidate.conditions
          :[];
        if(
          conditions.length&&
          !TriggerModuleService.matches(
            {
              type:'trigger',
              event:'ability.resolve-input-attack',
              conditions
            },
            'ability.resolve-input-attack',
            {source,ability,now}
          )
        )continue;
        attackId=String(candidate.attackId);
        break;
      }
    }

    return this.attackById(source.character,attackId);
  },
  resolvedInputAttack(source,ability,now=performance.now()){
    if(!source||!ability)return null;
    let attack=this.eventAttack(
      source,
      ability,
      'input.press',
      now
    );
    if(!attack)return null;

    const trigger=this.trigger(ability,'input.press');
    for(const module of trigger?.modules||[]){
      if(module?.type!=='action.attack')continue;
      const candidates=[
        ...(Array.isArray(module.alternates)?module.alternates:[]),
        ...(module.alternateWhen?[module.alternateWhen]:[])
      ];
      for(const candidate of candidates){
        if(!candidate?.attackId)continue;
        const conditions=Array.isArray(candidate.conditions)
          ?candidate.conditions
          :(candidate.stateKey
            ?[candidate.phase
              ?{type:'state.phase',stateKey:candidate.stateKey,phase:candidate.phase}
              :{type:'state.exists',stateKey:candidate.stateKey}]
            :[]);
        if(!conditions.length)continue;
        if(!TriggerModuleService.matches(
          {type:'trigger',event:'ability.resolve-input-attack',conditions},
          'ability.resolve-input-attack',
          {source,ability,now}
        ))continue;
        attack=this.attackById(source.character,candidate.attackId)||attack;
        return attack;
      }
      return attack;
    }
    return attack;
  },
  trigger(ability,event='input.press'){
    if(event==='input.release'){
      return ability?.releaseTrigger||null;
    }
    if(event==='input.hold'){
      return ability?.holdTrigger||null;
    }
    return ability?.trigger||null;
  },
  canActivate(source,ability,context={}){
    const trigger=this.trigger(
      ability,
      context.event||'input.press'
    );
    if(!source||!ability||!trigger)return false;

    const shared={
      ...context,
      source,
      ability,
      now:Number(context.now)||performance.now()
    };

    return TriggerModuleService.matches(
      trigger,
      context.event||'input.press',
      shared,
      context.network===true||context.freeAttack===true
        ?condition=>{
          if(context.freeAttack===true){
            if(
              condition.type==='ability.pending-ready'||
              condition.type==='cooldowns.ready'||
              condition.type==='resource.gte'||
              condition.type==='resource.can-spend-stamina'
            )return true;
            return undefined;
          }
          if(
            condition.type==='ability.pending-ready'||
            condition.type==='cooldowns.ready'||
            condition.type==='resource.gte'||
            condition.type==='combat.can-act'||
            condition.type==='state.absent'
          )return true;
          return undefined;
        }
        :null
    );
  },
  activate(source,ability,context={}){
    const trigger=this.trigger(
      ability,
      context.event||'input.press'
    );
    const shared={
      ...context,
      source,
      ability,
      inputSlot:context.inputSlot||ability?.input||null,
      event:context.event||'input.press',
      now:Number(context.now)||performance.now()
    };
    if(!this.canActivate(source,ability,shared)){
      return false;
    }

    const attack=this.eventAttack(
      source,
      ability,
      shared.event,
      shared.now,
      context.resolvedAttackId
    );
    if(!attack)return false;

    const runtime={
      ...shared,
      abilityUseId:
        context.abilityUseId||
        `${String(source.id||'entity')}:${String(ability.id||'ability')}:${++abilityUseSequence}`,
      trigger,
      attack,
      angle:Number(context.angle)||0,
      delayMs:0,
      handled:context.handled===true,
      executed:false,
      usageTags:new Set(
        TagService.attackTags(
          attack
        )
      )
    };
    const activated=AbilityModuleService.run(runtime);
    if(
      activated&&
      (runtime.executed===true||runtime.deferredExecution===true)
    ){
      source.lastAbilityActionTime=shared.now;
    }
    if(
      activated&&
      runtime.executed===true&&
      runtime.event==='input.press'
    ){
      GameEvents.emit(
        'ability-used',
        {
          source,
          ability,
          attack,
          usageTags:new Set(
            runtime.usageTags
          ),
          angle:runtime.angle,
          now:runtime.now,
          suppressStealthReveal:
            runtime.suppressStealthRevealOnAbilityUse===true
        }
      );
    }

    if(context.result&&typeof context.result==='object'){
      context.result.modeStep=Number(runtime.modeStep)<0?-1:1;
      context.result.modeStates=ModeStateService.serialize(source);
      context.result.handled=runtime.handled===true;
      context.result.executed=runtime.executed===true;
      context.result.deferredExecution=
        runtime.deferredExecution===true;
      context.result.skipAttackWindup=
        runtime.skipAttackWindup===true;
      context.result.attackId=
        runtime.resolvedAttackId||
        attack.id;
      context.result.networkAttackAdjustments=
        runtime.networkAttackAdjustments
          ?{...runtime.networkAttackAdjustments}
          :null;
      context.result.abilityUseId=
        String(
          runtime.abilityUseId||
          ''
        );
      context.result.targetEntityId=String(runtime.targetEntityId||'');
      context.result.cookingMealCount=Math.max(0,Math.floor(Number(runtime.cookingMealCount)||0));
      context.result.executionSequence=
        Number.isFinite(Number(runtime.executionSequence))
          ?Math.max(
            0,
            Math.floor(Number(runtime.executionSequence)||0)
          )
          :null;
      context.result.stateWindowSelection=
        runtime.stateWindowSelection&&
        typeof runtime.stateWindowSelection==='object'
          ?EffectSpawnService.definitionSnapshot(runtime.stateWindowSelection)
          :null;
      if(
        runtime.targetPoint&&
        Number.isFinite(Number(runtime.targetPoint.x))&&
        Number.isFinite(Number(runtime.targetPoint.y))
      ){
        context.result.targetPoint={
          x:Number(runtime.targetPoint.x),
          y:Number(runtime.targetPoint.y)
        };
      }
    }

    return activated;
  }
});
