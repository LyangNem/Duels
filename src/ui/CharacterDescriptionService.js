


/* 캐릭터 설명 */
const CharacterDescriptionService=Object.freeze({
  attackDamage(character,attack){
    return Math.round(
      (Number(character?.baseDamage)||0)*
      AbilityService.damageRatio(character,attack)
    );
  },
  attackRangeDamage(character,attack){
    const maximum=this.attackDamage(character,attack);
    const multipliers=(attack?.modules||[])
      .filter(module=>module?.type==='damage.range-band-multiplier')
      .map(module=>Math.max(0,Number(module.multiplier)||1));
    const minimum=Math.round(
      multipliers.reduce((value,multiplier)=>value*multiplier,maximum)
    );
    return {min:minimum,max:maximum};
  },
  restoreAmount(character,module){
    const reference=module?.amountRef;

    if(reference?.type==='attack-damage'){
      const referencedAttack=AbilityService.attackById(
        character,
        String(reference.attackId||'')
      );
      return this.attackDamage(character,referencedAttack)*(
        Number.isFinite(Number(reference.multiplier))
          ?Number(reference.multiplier)
          :1
      );
    }

    if(reference?.type==='summon-field-modifier'){
      return ModuleValueService.summonFieldModifier(
        {character},
        reference
      );
    }

    return Number(module?.amount)||0;
  },
  seconds(ms){
    if(ms===null||ms===undefined||ms==='')return null;
    const raw=Number(ms);
    if(!Number.isFinite(raw))return null;
    const value=Math.max(0,raw)/1000;
    return Number.isInteger(value)
      ?String(value)
      :String(Number(value.toFixed(3)));
  },
  englishName(character){
    const explicit=String(character?.englishName||'').trim();
    if(explicit)return explicit;

    return String(character?.id||'')
      .split(/[-_\s]+/)
      .filter(Boolean)
      .map(part=>
        part.charAt(0).toUpperCase()+
        part.slice(1)
      )
      .join(' ');
  },
  abilityReferencesAttack(ability,attackId){
    const wanted=String(attackId||'');
    if(!ability||!wanted)return false;

    if(String(ability.attackId||'')===wanted){
      return true;
    }

    const seen=new Set();
    const contains=value=>{
      if(value===null||value===undefined)return false;

      if(typeof value==='string'){
        return value===wanted;
      }

      if(
        typeof value!=='object'||
        seen.has(value)
      )return false;

      seen.add(value);

      if(Array.isArray(value)){
        return value.some(contains);
      }

      for(const [key,item] of Object.entries(value)){
        if(
          (
            key==='attackId'||
            key==='requireAttackId'||
            key==='linkedAttackId'||
            key==='alternateAttackId'
          )&&
          String(item||'')===wanted
        ){
          return true;
        }

        if(
          (
            key==='attackIds'||
            key==='alternateWhen'||
            key==='alternates'||
            key==='modules'
          )&&
          contains(item)
        ){
          return true;
        }
      }

      return false;
    };

    return (
      contains(ability.trigger)||
      contains(ability.releaseTrigger)
    );
  },
  abilityForSkill(character,skill){
    if(skill?.ability){
      return character?.abilities?.[String(skill.ability)]||null;
    }

    const attackKeys=[
      skill?.attack,
      skill?.costAttack,
      skill?.baseAttack,
      skill?.progressAttack,
      skill?.detailAttack,
      skill?.linkedAttack,
      skill?.secondaryAttack,
      skill?.fieldAttack
    ]
      .map(key=>String(key||''))
      .filter(Boolean);

    const abilities=
      Object.values(character?.abilities||{});

    for(const key of attackKeys){
      const attack=
        character?.attacks?.[key]||
        null;
      const attackId=
        String(attack?.id||'');

      const matched=
        abilities.find(ability=>
          attackId&&
          this.abilityReferencesAttack(
            ability,
            attackId
          )
        )||
        character?.abilities?.[key]||
        null;

      if(matched)return matched;
    }

    return null;
  },
  abilityModule(ability,type){
    return (ability?.trigger?.modules||[]).find(
      module=>(typeof module==='string'?module:module?.type)===type
    )||null;
  },
  abilityModuleAny(ability,type){
    for(const trigger of [ability?.trigger,ability?.releaseTrigger]){
      const module=(trigger?.modules||[]).find(
        item=>(typeof item==='string'?item:item?.type)===type
      );
      if(module)return module;
    }
    return null;
  },
  attackModule(attack,type){
    return (attack?.modules||[]).find(
      module=>(typeof module==='string'?module:module?.type)===type
    )||null;
  },
  attackModuleMatching(attack,type,predicate=()=>true){
    return (attack?.modules||[]).find(module=>
      (typeof module==='string'?module:module?.type)===type&&predicate(module)
    )||null;
  },
  attackFieldModule(attack){
    for(const module of attack?.modules||[]){
      if(module?.type==='field.area')return module;
      if(
        module?.type==='projectile.impact'&&
        module.field?.type==='field.area'
      )return module.field;
    }
    return null;
  },
  abilityCondition(ability,type){
    for(const module of ability?.trigger?.modules||[]){
      for(const condition of module?.alternateWhen?.conditions||[]){
        if(condition?.type===type)return condition;
      }
    }
    for(const condition of ability?.trigger?.conditions||[]){
      if(condition?.type===type)return condition;
    }
    return null;
  },
  summonDescriptionValues(
    character,
    spec
  ){
    if(!spec)return {};

    const field=spec.fieldArea||null;
    const regeneration=
      field?.onTrigger?.find(
        module=>
          module?.type==='modifier.set'&&
          module.stat==='regeneration'
      )||null;
    const regenerationLabel=
      COMBAT_BUFF_DEFS.regeneration?.label||
      '재생';

    const aiAttackId=
      String(
        spec.ai?.meleeAttackId||
        spec.ai?.attackId||
        ''
      );
    const aiAttack=
      aiAttackId
        ?AbilityService.attackById(
          character,
          aiAttackId
        )
        :null;
    const supportStaminaRestore=
      aiAttack
        ?(aiAttack.modules||[]).find(
          module=>
            module?.type==='resource.restore'&&
            module.resource==='stamina'
        )||null
        :null;

    return {
      maxHealth:
        Math.max(
          1,
          Number(spec.maxHealth)||1
        ),
      moveLabel:String(Number(spec.speed)||0),
      regenerationLabel,
      regenerationValue:
        Math.max(
          0,
          Number(regeneration?.value)||0
        ),
      regenerationSeconds:
        this.seconds(
          regeneration?.data?.tickInterval
        ),
      respawnSeconds:
        this.seconds(
          spec.respawnDelay
        ),
      autoAttackDamage:
        aiAttack
          ?this.attackDamage(
            character,
            aiAttack
          )
          :0,
      supportStaminaPercent:
        Math.round(
          Math.max(
            0,
            Number(
              supportStaminaRestore
                ?.maxResourceRatio
            )||0
          )*100
        )
    };
  },
  interpolateSummon(
    character,
    spec,
    stat
  ){
    if(!spec||!stat)return '';

    const template=
      typeof stat==='string'
        ?`{${stat}}`
        :String(stat.text||'');
    const values=
      this.summonDescriptionValues(
        character,
        spec
      );
    const referencedAttack=
      typeof stat==='object'&&stat?.attack
        ?character?.attacks?.[String(stat.attack)]||null
        :null;

    return CharacterDataService.interpolate(character,template).replace(
      /\{(maxHealth|moveLabel|regenerationLabel|regenerationValue|regenerationSeconds|respawnSeconds|autoAttackDamage|supportStaminaPercent|damage)\}/g,
      (_,key)=>{
        if(key==='damage'){
          return String(
            referencedAttack
              ?this.attackDamage(
                character,
                referencedAttack
              )
              :values.autoAttackDamage
          );
        }
        return String(values[key]??'');
      }
    );
  },

  interpolateStatic(character,text){
    const values={
      repairMissingHealthPercent:
        Math.round(
          Math.max(
            0,
            Number(
              character?.commandRepair
                ?.missingHealthRatio
            )||0
          )*100
        )
    };

    return CharacterDataService.interpolate(character,text).replace(
      /\{(repairMissingHealthPercent)\}/g,
      (token,key)=>
        Object.prototype.hasOwnProperty.call(
          values,
          key
        )
          ?String(values[key])
          :token
    );
  },

  interpolate(character,skill){
    const attack=character.attacks?.[skill.attack];
    if(!attack)return this.interpolateStatic(character,skill.text);

    const charge=attack.charge||null;
    const ability=this.abilityForSkill(character,skill);
    const counterModule=this.abilityModule(
      ability,
      'counter.execute'
    );
    const coolingBurstModule=this.abilityModule(
      ability,
      'resource.cooling-burst'
    );
    const overclockModule=
      (counterModule?.onFinishModules||[]).find(
        module=>module?.type==='resource.overclock-charge'
      )||null;
    const rapidCoolingModule=
      (counterModule?.onFinishModules||[]).find(
        module=>module?.type==='resource.rapid-cooling'
      )||null;
    const returnModule=this.attackModule(
      attack,
      'projectile.return'
    );
    const healAttack=skill.healAttack
      ?character.attacks?.[String(skill.healAttack)]||attack
      :attack;
    const restoreModule=[
      ...(healAttack.modules||[]),
      ...(healAttack.charge?.fullSpec?.modules||[])
    ].find(
      module=>
        module?.type==='resource.restore'&&
        module.resource==='health'&&
        (
          Number.isFinite(Number(module.amount))||
          (
            module.amountRef&&
            typeof module.amountRef==='object'
          )||
          Number.isFinite(Number(module.missingResourceRatio))||
          Number.isFinite(Number(module.maxResourceRatio))
        )
    )||null;
    const healTrigger=skill.healTrigger
      ?(character.triggers||[]).find(
        trigger=>String(trigger?.id||'')===String(skill.healTrigger)
      )||null
      :null;
    const healTriggerRestore=(healTrigger?.modules||[]).find(
      module=>
        module?.type==='resource.restore'&&
        module.resource==='health'
    )||null;
    const sleepModule=
      (attack.modules||[]).find(
        module=>module?.type==='status.apply'&&module.status==='sleep'
      )||
      (ability?.trigger?.modules||[]).find(
        module=>module?.type==='status.apply'&&module.status==='sleep'
      )||
      (
        counterModule?.cc?.type==='status.apply'&&
        counterModule.cc.status==='sleep'
          ?counterModule.cc
          :null
      );
    const progressModule=
      this.attackModule(
        attack,
        'state.progress'
      );
    const targetMaxHealthModule=
      this.attackModule(
        attack,
        'damage.target-max-health-ratio'
      );
    const rangeBandDamageModule=
      this.attackModule(
        attack,
        'damage.range-band-multiplier'
      );
    const repeatedArea=
      this.attackModule(
        attack,
        'delivery.area'
      );
    const firstSummon=
      Object.values(
        character.summons||{}
      )[0]||null;
    const firstSummonCarrySpeedMultiplier=
      Number(firstSummon?.carry?.speedMultiplier);
    const summonModifier=
      firstSummon?.fieldArea?.onTrigger?.find(
        module=>
          module?.type==='modifier.set'&&
          module.stat==='regeneration'
      )||null;

    const linkedAttack=
      skill.linkedAttack
        ?character.attacks?.[
          String(skill.linkedAttack)
        ]||null
        :null;
    const secondaryAttack=
      skill.secondaryAttack
        ?character.attacks?.[
          String(skill.secondaryAttack)
        ]||null
        :null;
    const linkedProgressModule=
      this.attackModule(
        linkedAttack,
        'state.progress'
      );
    const secondaryProgressModule=
      this.attackModule(
        secondaryAttack,
        'state.progress'
      );
    const guardModule=
      this.attackModule(
        attack,
        'attack.guard'
      );
    const guardProgressModule=
      guardModule?.onBlock?.progress||
      null;
    const targetHealthMultiplierModule=
      this.attackModule(
        attack,
        'damage.target-health-ratio-multiplier'
      );
    const detailAttack=
      skill.detailAttack
        ?character.attacks?.[String(skill.detailAttack)]||null
        :attack;
    const detailBuff=this.attackModule(detailAttack,'buff.time-add');
    const detailDodgeStage=(detailBuff?.stages||[]).find(
      stage=>stage?.stat==='dodgeDistance'
    )||null;
    const stunModule=this.attackModuleMatching(
      attack,'status.apply',module=>module?.status==='stun'
    );
    const linkedStunModule=this.attackModuleMatching(
      linkedAttack,'status.apply',module=>module?.status==='stun'
    );
    const abilityDelay=this.abilityModule(ability,'timing.delay');
    const abilityModifier=this.abilityModule(ability,'modifier.set');
    const attackModifier=this.attackModuleMatching(
      attack,
      'modifier.set',
      module=>module?.when==='on-hit'
    );
    const modifierReferenceAttack=skill.modifierAttack
      ?character.attacks?.[String(skill.modifierAttack)]||null
      :null;
    const modifierProgressModule=this.attackModule(
      modifierReferenceAttack,
      'state.progress'
    );
    const progressThresholdModifier=Array.isArray(modifierProgressModule?.thresholdModifiers)
      ?modifierProgressModule.thresholdModifiers.find(module=>
        module&&COMBAT_BUFF_DEFS[String(module.stat||'')]
      )||null
      :null;
    const channelModule=this.abilityModule(ability,'channel.attack');
    const channelFieldModifier=(channelModule?.stopField?.onTrigger||[]).find(
      module=>module?.type==='modifier.set'
    )||null;
    const descriptionModifier=
      abilityModifier||
      attackModifier||
      channelFieldModifier||
      progressThresholdModifier;
    const movementModule=this.abilityModuleAny(ability,'movement.move');
    const movementDefenseBuff=(movementModule?.buffs||[]).find(
      buff=>buff?.type==='defense'
    )||null;
    const baseAttack=skill.baseAttack
      ?character.attacks?.[String(skill.baseAttack)]||null
      :null;
    const progressScale=attack.progressScale||null;
    const currentDamage=this.attackDamage(character,attack);
    const baseAttackDamage=baseAttack?this.attackDamage(character,baseAttack):0;
    const fieldReferenceAttack=skill.fieldAttack
      ?character.attacks?.[String(skill.fieldAttack)]||attack
      :attack;
    const installField=this.attackFieldModule(fieldReferenceAttack);
    const referencedDescriptionAttacks=[
      attack,
      linkedAttack,
      secondaryAttack,
      detailAttack,
      fieldReferenceAttack,
      ...(
        (attack.modules||[])
          .filter(module=>module?.type==='projectile.impact')
          .flatMap(module=>module.attackIds||[])
          .map(id=>
            AbilityService.attackById(
              character,
              String(id||'')
            )
          )
      )
    ].filter(Boolean);

    const directStatusModule=
      referencedDescriptionAttacks
        .flatMap(item=>item.modules||[])
        .find(
          module=>
            module?.type==='status.apply'&&
            Number.isFinite(Number(module?.duration))
        )||
      (ability?.trigger?.modules||[]).find(
        module=>
          module?.type==='status.apply'&&
          Number.isFinite(Number(module?.duration))
      )||
      null;
    const fieldStatusModule=
      (installField?.onTrigger||[]).find(
        module=>
          module?.type==='status.apply'&&
          Number.isFinite(Number(module?.duration))
      )||null;
    const summonStageCondition=
      (ability?.trigger?.modules||[])
        .flatMap(module=>module?.alternates||[])
        .flatMap(alternate=>alternate?.conditions||[])
        .find(
          condition=>
            condition?.type==='summon.cluster-stage'&&
            Number.isFinite(Number(condition?.minStage))
        )||
      (ability?.trigger?.conditions||[]).find(
        condition=>
          condition?.type==='summon.cluster-stage'&&
          Number.isFinite(Number(condition?.minStage))
      )||
      null;
    const rangeProjectile=
      this.attackModule(fieldReferenceAttack,'delivery.range-projectile')||
      this.attackModule(attack,'delivery.range-projectile');
    const fieldExpandModule=this.abilityModule(ability,'field.expand-recent');
    const abilityComboProgress=(ability?.trigger?.modules||[]).find(module=>
      module?.type==='state.progress'&&module?.operation==='add'
    )||null;
    const staminaCostPassive=(character.passiveBuffs||[]).find(buff=>
      buff?.stat==='staminaCost'
    )||null;
    const progressReferenceAttack=skill.progressAttack
      ?character.attacks?.[String(skill.progressAttack)]||attack
      :attack;
    const progressReferenceModule=this.attackModule(progressReferenceAttack,'state.progress');
    const segmentedGauge=(character.worldGaugeModules||[]).find(module=>
      module?.type==='gauge.segmented'&&
      String(module?.valueRef?.stateKey||'')===String(progressReferenceModule?.stateKey||'')
    )||null;
    const selfStealthModifier=(counterModule?.selfModifiers||[]).find(
      modifier=>modifier?.stat==='stealth'
    )||null;
    const selfSpeedModifier=(counterModule?.selfModifiers||[]).find(
      modifier=>modifier?.stat==='speed'
    )||null;
    const stealthToggleModule=this.abilityModule(ability,'stealth.toggle');
    const stealthDetectAttack=
      stealthToggleModule?.detectAttackId
        ?character.attacks?.[
          String(stealthToggleModule.detectAttackId)
        ]||null
        :null;
    const stealthDetectStatusModule=
      (stealthDetectAttack?.modules||[])
        .flatMap(module=>
          module?.type==='hit.sequence'
            ?(module.steps||[])
              .flatMap(step=>step?.modules||[])
            :[module]
        )
        .find(module=>
          module?.type==='status.apply'&&
          Number.isFinite(Number(module?.duration))
        )||
      null;
    const freezeModule=
      referencedDescriptionAttacks
        .map(item=>
          this.attackModuleMatching(
            item,
            'status.apply',
            module=>module?.status==='freeze'
          )||
          (item.modules||[])
            .find(module=>
              module?.type==='state.progress'&&
              module?.onFull?.status==='freeze'
            )?.onFull||
          null
        )
        .find(Boolean)||
      null;
    const restoreModuleForCost=(attack.modules||[]).find(module=>
      module?.type==='resource.restore'&&module.resource==='stamina'
    )||null;
    const referenceAttack=skill.referenceAttack
      ?character.attacks?.[String(skill.referenceAttack)]||null
      :null;
    const progressStateKey=String(skill.progressStateKey||'');
    const progressTrigger=(character.triggers||[]).find(trigger=>
      (trigger?.modules||[]).some(module=>
        module?.type==='state.progress'&&String(module.stateKey||'')===progressStateKey
      )
    )||null;
    const progressTriggerModule=(progressTrigger?.modules||[]).find(module=>
      module?.type==='state.progress'&&String(module.stateKey||'')===progressStateKey
    )||null;
    const progressCondition=this.abilityCondition(ability,'state.progress-ratio-gte');
    const burnModule=
      referencedDescriptionAttacks
        .flatMap(item=>item.modules||[])
        .find(
          module=>
            module?.type==='status.apply'&&
            module.status==='burn'
        )||
      (ability?.trigger?.modules||[]).find(
        module=>
          module?.type==='status.apply'&&
          module.status==='burn'
      )||
      null;
    const zapModule=
      referencedDescriptionAttacks
        .flatMap(item=>item.modules||[])
        .find(
          module=>
            module?.type==='status.apply'&&
            module.status==='zap'
        )||
      (ability?.trigger?.modules||[]).find(
        module=>
          module?.type==='status.apply'&&
          module.status==='zap'
      )||
      null;
    const detailZapModule=(detailAttack?.modules||[]).find(module=>module?.type==='status.apply'&&module.status==='zap')||null;
    const installedFieldZapModule=(installField?.onTrigger||[]).find(module=>module?.type==='status.apply'&&module.status==='zap')||null;
    const abilityActionModules=(ability?.trigger?.modules||[]).filter(module=>
      module?.type==='action.attack'||module?.type==='action.trigger-attack'
    );
    const requiredProgressCondition=(ability?.trigger?.conditions||[]).find(condition=>
      condition?.type==='state.progress-gte'||condition?.type==='state.progress-ratio-gte'
    )||null;
    const fieldDodgeReward=installField?.dodgeReward||null;
    const maxResourceRestore=
      (attack.modules||[]).find(module=>
        module?.type==='resource.restore'&&
        Number.isFinite(Number(module?.maxResourceRatio))
      )||
      (ability?.trigger?.modules||[]).find(module=>
        module?.type==='resource.restore'&&
        Number.isFinite(Number(module?.maxResourceRatio))&&
        (
          !module.requireAttackId||
          String(module.requireAttackId)===
            String(attack?.id||'')
        )
      )||
      null;
    const progressDecayModule=(attack.modules||[]).find(module=>
      module?.type==='state.progress'&&Number.isFinite(Number(module?.decay?.delay))
    )||null;
    const timedWindowModule=(attack.modules||[]).find(module=>
      module?.type==='state.window'&&
      Number.isFinite(Number(module?.duration))
    )||null;
    const progressAddModule=(attack.modules||[]).find(module=>
      module?.type==='state.progress'&&
      module.operation==='add'&&
      Number.isFinite(Number(module?.amount))&&
      Number.isFinite(Number(module?.max))
    )||null;

    const stackMarkModule=
      this.attackModule(
        attack,
        'stack.mark'
      );
    const markMaxStacks=Math.max(
      1,
      Math.floor(
        Number(stackMarkModule?.max)||1
      )
    );
    const markBurstDamage=
      stackMarkModule?.burstDamage&&
      typeof stackMarkModule.burstDamage==='object'
        ?stackMarkModule.burstDamage
        :null;
    const markBurstFirst=Math.max(
      0,
      Number(markBurstDamage?.first)||0
    );
    const markBurstStep=Math.max(
      0,
      Number(markBurstDamage?.step)||0
    );
    const markMinBurstDamage=
      String(markBurstDamage?.mode||'')==='progressive-total'
        ?markBurstFirst
        :this.attackDamage(
          character,
          character.attacks?.[
            String(stackMarkModule?.burstAttackId||'')
          ]||attack
        );
    const markMaxBurstDamage=
      String(markBurstDamage?.mode||'')==='progressive-total'
        ?(
          markMaxStacks*markBurstFirst+
          markBurstStep*
            markMaxStacks*
            (markMaxStacks-1)/2
        )
        :markMinBurstDamage*markMaxStacks;

    const sustainModule=
      this.abilityModule(
        ability,
        'sustain.toggle'
      );
    const sustainSpeedBuff=
      (sustainModule?.buffs||[]).find(
        buff=>
          String(buff?.type||'')==='speed'
      )||
      null;
    const sustainMaxSeconds=this.seconds(
      sustainModule?.maxDuration
    );
    const sustainSpeedPercent=Math.round(
      Math.max(
        0,
        Number(sustainSpeedBuff?.value)||0
      )*100
    );
    const sustainDrainPerSecond=Math.max(
      0,
      Number(sustainModule?.drainPerSecond)||0
    );

    const orbitInventory=
      character?.orbitInventory&&
      typeof character.orbitInventory==='object'
        ?character.orbitInventory
        :null;
    const orbitDamage=
      orbitInventory?.damage&&
      typeof orbitInventory.damage==='object'
        ?orbitInventory.damage
        :null;
    const orbitMaxQuality=Math.max(
      1,
      Math.floor(Number(orbitInventory?.maxQuality)||1)
    );
    const orbitMinDamage=Math.max(
      0,
      Number(orbitDamage?.base)||0
    );
    const orbitMaxDamage=Math.max(
      orbitMinDamage,
      orbitMinDamage+
      Math.max(
        0,
        orbitMaxQuality-1
      )*
      Math.max(
        0,
        Number(orbitDamage?.perQuality)||0
      )
    );

    const recastModules=
      (ability?.trigger?.modules||[])
        .filter(module=>
          module?.type==='orbit.inventory-recast'
        );
    const recastAbilityFallbacks=
      Object.values(character?.abilities||{})
        .map(candidate=>({
          ability:candidate,
          modules:
            (candidate?.trigger?.modules||[])
              .filter(module=>
                module?.type==='orbit.inventory-recast'
              )
        }))
        .filter(entry=>entry.modules.length>0);
    const recastFallbackModules=
      recastModules.length===0&&
      recastAbilityFallbacks.length===1
        ?recastAbilityFallbacks[0].modules
        :[];
    const resolvedRecastModules=
      recastModules.length>0
        ?recastModules
        :recastFallbackModules;
    const recastReference=
      resolvedRecastModules.find(module=>
        String(module?.operation||'')==='check'
      )||
      resolvedRecastModules[0]||
      null;
    const recastWindowSeconds=
      recastReference
        ?this.seconds(recastReference.window)
        :'';
    const recastProgressScale=
      skill.progressAttack
        ?character.attacks?.[
          String(skill.progressAttack)
        ]?.progressScale||null
        :attack?.progressScale||null;
    const recastMaxStage=Math.max(
      1,
      Math.floor(
        Number(
          recastProgressScale?.valueRange?.to
        )||1
      )
    );
    const recastRangeIncreasePercent=Math.round(
      Math.max(
        0,
        (
          Number(recastProgressScale?.factor)||1
        )-1
      )*
      100
    );

    const passiveDamageBuff=(character.passiveBuffs||[]).find(
      buff=>String(buff?.stat||'')==='damage'
    )||null;
    const passiveDefenseBuff=(character.passiveBuffs||[]).find(
      buff=>String(buff?.stat||'')==='defense'
    )||null;
    const passiveSpeedBuff=(character.passiveBuffs||[]).find(
      buff=>String(buff?.stat||'')==='speed'
    )||null;
    const passiveValue=buff=>{
      if(!buff)return null;
      const value=
        buff?.valueRef&&
        Number.isFinite(Number(buff.valueRef.value))
          ?Number(buff.valueRef.value)
          :Number.isFinite(Number(buff.value))
            ?Number(buff.value)
            :null;
      return value;
    };
    const passiveDamageValue=passiveValue(passiveDamageBuff);
    const passiveDefenseValue=passiveValue(passiveDefenseBuff);
    const passiveSpeedValue=passiveValue(passiveSpeedBuff);

    const damageSequenceAttacks=(
      Array.isArray(skill.damageSequenceAttacks)&&
      skill.damageSequenceAttacks.length
        ?skill.damageSequenceAttacks.map(
          id=>character.attacks?.[String(id)]||null
        )
        :[attack,linkedAttack,secondaryAttack]
    ).filter(Boolean);
    const damageSequence=damageSequenceAttacks
      .map(item=>this.attackDamage(character,item))
      .filter(value=>Number(value)>0)
      .map(value=>String(value))
      .join('/');

    const values={
      pellets:AttackModuleService.pelletCount(attack),
      passiveDamagePercent:
        passiveDamageValue===null
          ?null
          :Math.round(Math.abs(passiveDamageValue)*100),
      passiveDefensePercent:
        passiveDefenseValue===null
          ?null
          :Math.round(Math.abs(passiveDefenseValue)*100),
      passiveSpeedPenaltyPercent:
        passiveSpeedValue===null
          ?null
          :Math.round(Math.abs(passiveSpeedValue)*100),
      orbitMaxQuality,
      orbitMinDamage,
      orbitMaxDamage,
      recastWindowSeconds,
      recastMaxStage,
      recastRangeIncreasePercent,
      markMaxStacks,
      markMinBurstDamage,
      markMaxBurstDamage,
      sustainMaxSeconds,
      sustainSpeedPercent,
      sustainDrainPerSecond,
      damage:this.attackDamage(character,attack),
      detailDamage:this.attackDamage(character,detailAttack),
      fullCost:Math.max(
        0,
        Number(attack.charge?.fullCost)||
        Number(attack.charge?.costMax)||
        Number(attack.cost)||
        0
      ),
      healPercent:Math.round(
        Math.max(
          0,
          Number(
            healTriggerRestore?.missingResourceRatio??
            healTriggerRestore?.maxResourceRatio??
            restoreModule?.missingResourceRatio??
            restoreModule?.maxResourceRatio
          )||0
        )*100
      ),
      sleepSeconds:this.seconds(sleepModule?.duration),
      rewindSeconds:Math.max(0,Number(character.temporalMemory?.rewindTime)||0)/1000,
      tipDamage:rangeBandDamageModule
        ?Math.round(
          this.attackDamage(character,attack)*
          Math.max(0,Number(rangeBandDamageModule.multiplier)||1)
        )
        :this.attackDamage(character,attack),
      damageSequence,
      hitCount:
        1+
        (linkedAttack?1:0)+
        (secondaryAttack?1:0),
      linkedDamage:
        linkedAttack
          ?this.attackDamage(
            character,
            linkedAttack
          )
          :0,
      linkedMinDamage:
        linkedAttack
          ?this.attackRangeDamage(character,linkedAttack).min
          :0,
      linkedMaxDamage:
        linkedAttack
          ?this.attackRangeDamage(character,linkedAttack).max
          :0,
      secondaryDamage:
        secondaryAttack
          ?this.attackDamage(
            character,
            secondaryAttack
          )
          :0,
      comboSeconds:
        Number(
          (ability?.trigger?.modules||[])
            .find(module=>module?.type==='state.progress'&&module?.presentation?.type==='arc-gauge'&&module?.decay)
            ?.max
        )/1000||0,
      channelIntervalSeconds:
        Number(channelModule?.interval||0)/1000,
      channelMaxTicks:
        Math.max(0,Math.floor(Number(channelModule?.maxTicks)||0)),
      combinedDamage:
        this.attackDamage(
          character,
          attack
        )+
        (
          linkedAttack
            ?this.attackDamage(
              character,
              linkedAttack
            )
            :0
        ),
      minDamage:charge?.damageRatio
        ?Math.round(character.baseDamage*Number(charge.damageRatio.from||0))
        :Array.isArray(progressScale?.damageRatio?.steps)&&progressScale.damageRatio.steps.length
          ?Math.round(character.baseDamage*Number(progressScale.damageRatio.steps[0]||0))
          :progressScale?.damageRatio
            ?Math.round(character.baseDamage*Number(progressScale.damageRatio.from||0))
            :this.attackRangeDamage(character,attack).min,
      maxDamage:charge?.damageRatio
        ?Math.round(character.baseDamage*Number(charge.damageRatio.to||0))
        :Array.isArray(progressScale?.damageRatio?.steps)&&progressScale.damageRatio.steps.length
          ?Math.round(character.baseDamage*Number(progressScale.damageRatio.steps[progressScale.damageRatio.steps.length-1]||0))
          :progressScale?.damageRatio
            ?Math.round(character.baseDamage*Number(progressScale.damageRatio.to||0))
            :this.attackRangeDamage(character,attack).max,
      throwDamage:character.attacks?.rmbThrow
        ?this.attackDamage(character,character.attacks.rmbThrow)
        :0,
      chargeSeconds:this.seconds(
        counterModule?.charge?.duration??
        attack.charge?.duration
      ),
      autoReturnSeconds:this.seconds(returnModule?.autoAfterMs),
      healAmount:Math.max(
        0,
        restoreModule&&Number.isFinite(Number(restoreModule.missingResourceRatio))
          ?Math.round(
            Math.max(0,Number(character?.maxHealth)||0)*
            Math.max(0,Number(restoreModule.missingResourceRatio)||0)
          )
          :restoreModule&&Number.isFinite(Number(restoreModule.maxResourceRatio))
            ?Math.round(
              Math.max(0,Number(character?.maxHealth)||0)*
              Math.max(0,Number(restoreModule.maxResourceRatio)||0)
            )
            :this.restoreAmount(character,restoreModule)
      ),
      fullDamage:
        attack.charge?.fullSpec?.damageRatio!==undefined
          ?character.baseDamage*
            Math.max(
              0,
              Number(attack.charge.fullSpec.damageRatio)||0
            )
          :this.attackDamage(character,attack),
      bindSeconds:this.seconds(
        (
          attack.charge?.fullSpec?.modules||
          attack.modules||
          []
        ).find(
          module=>
            module?.type==='status.apply'&&
            module.status==='bind'
        )?.duration
      ),
      fieldSeconds:
        installField&&Number.isFinite(Number(installField.duration))
          ?this.seconds(installField.duration)
          :null,
      statusSeconds:
        directStatusModule&&Number.isFinite(Number(directStatusModule.duration))
          ?this.seconds(directStatusModule.duration)
          :null,
      fieldStatusSeconds:
        fieldStatusModule&&Number.isFinite(Number(fieldStatusModule.duration))
          ?this.seconds(fieldStatusModule.duration)
          :null,
      requiredSummonStage:Math.max(
        0,
        Math.floor(Number(summonStageCondition?.minStage)||0)
      ),
      piercePercent:
        Number.isFinite(Number(charge?.pierceWallsAt??attack.cameraAimOffset?.minProgress))
          ?Math.round(
            Math.max(
              0,
              Number(charge?.pierceWallsAt??attack.cameraAimOffset?.minProgress)
            )*100
          )
          :null,
      selfStealthSeconds:this.seconds(selfStealthModifier?.duration),
      selfSpeedPercent:
        selfSpeedModifier&&Number.isFinite(Number(selfSpeedModifier.value))
          ?Math.round(Math.abs(Number(selfSpeedModifier.value))*100)
          :null,
      skillCost:Math.max(
        0,
        Number(
          (
            skill?.costAttack
              ?character?.attacks?.[String(skill.costAttack)]||attack
              :attack
          )?.cost
        )||0
      ),
      stealthDurationSeconds:this.seconds(stealthToggleModule?.maxDuration),
      stealthMaxStaminaCost:
        Math.max(
          0,
          Number(
            (
              skill?.costAttack
                ?character?.attacks?.[String(skill.costAttack)]||attack
                :attack
            )?.cost
          )||0
        )+
        Math.max(
          0,
          Number(stealthToggleModule?.drainPerSecond)||0
        )*
        Math.max(
          0,
          Number(stealthToggleModule?.maxDuration)||0
        )/1000,
      stealthSpeedPercent:
        stealthToggleModule&&Number.isFinite(Number(stealthToggleModule.speedModifier))
          ?Math.round(
            Math.max(0,Number(stealthToggleModule.speedModifier))*100
          )
          :null,
      stealthFreezeSeconds:this.seconds(
        stealthToggleModule?.detectStatusDuration??
        stealthDetectStatusModule?.duration
      ),
      stealthBoostCount:Math.max(0,Number(stealthToggleModule?.attackBoost?.uses)||0),
      freezeSeconds:this.seconds(
        freezeModule?.status==='freeze'?freezeModule?.duration:0
      ),
      burnSeconds:
        burnModule&&Number.isFinite(Number(burnModule.duration))
          ?this.seconds(burnModule.duration)
          :null,
      zapSeconds:
        zapModule&&Number.isFinite(Number(zapModule.duration))
          ?this.seconds(zapModule.duration)
          :null,
      detailZapSeconds:
        Number.isFinite(
          Number(
            detailZapModule?.duration??
            installedFieldZapModule?.duration
          )
        )
          ?this.seconds(
            detailZapModule?.duration??
            installedFieldZapModule?.duration
          )
          :null,
        holdIntervalSeconds:Number(character?.abilities?.rmb?.inputPolicy?.holdRepeatProgress?.interval||0)/1000,
        stageMax:Number(character?.abilities?.rmb?.inputPolicy?.holdRepeatProgress?.max||7),
        stageMin:Number(character?.abilities?.rmb?.inputPolicy?.holdRepeatProgress?.min||1),
      attackSequenceCount:Math.max(1,abilityActionModules.length),
      requiredProgress:Math.max(0,Number(requiredProgressCondition?.value)||0),
      fieldRewardPercent:
        fieldDodgeReward&&
        Number.isFinite(Number(fieldDodgeReward.healthMaxRatio??fieldDodgeReward.staminaMaxRatio))
          ?Math.round(
            Math.max(
              0,
              Number(fieldDodgeReward.healthMaxRatio??fieldDodgeReward.staminaMaxRatio)
            )*100
          )
          :null,
      restoreMaxResourcePercent:
        maxResourceRestore&&
        Number.isFinite(Number(maxResourceRestore.maxResourceRatio))
          ?Math.round(
            Math.max(
              0,
              Number(maxResourceRestore.maxResourceRatio)
            )*100
          )
          :null,
      progressDecaySeconds:this.seconds(progressDecayModule?.decay?.delay),
      windowSeconds:this.seconds(timedWindowModule?.duration),
      progressPercent:
        progressAddModule&&
        Number.isFinite(Number(progressAddModule.amount))&&
        Number.isFinite(Number(progressAddModule.max))
          ?Math.round(
            Math.max(0,Number(progressAddModule.amount))/
            Math.max(1,Number(progressAddModule.max))*
            100
          )
          :null,
      memoryCount:Math.max(0,Number(character.dodgeMemory?.maxCount)||0),
      memorySeconds:this.seconds(character.dodgeMemory?.window),
      dashWindowSeconds:this.seconds(character.dodgeStateWindows?.[0]?.duration),
      burstCount:
        Math.max(
          1,
          Number(
            this.attackModule(
              attack,
              'delivery.delayed-projectile-volley'
            )?.count
          )||
          AttackModuleService.pelletCount(attack)
        ),
      explosionDamage:
        character.baseDamage*
        Math.max(
          0,
          Number(character.attacks?.rmbImpact?.damageRatio)||0
        ),
      bombCount:
        Math.max(
          1,
          Number(
            this.attackModule(
              attack,
              'delivery.area'
            )?.repeatCount
          )||1
        ),
      repeatCount:
        Math.max(
          1,
          Number(repeatedArea?.repeatCount)||1
        ),
      progressAmount:
        Math.max(
          0,
          Number(progressModule?.amount)||0
        ),
      linkedProgressAmount:
        Math.max(
          0,
          Number(linkedProgressModule?.amount)||0
        ),
      secondaryProgressAmount:
        Math.max(
          0,
          Number(secondaryProgressModule?.amount)||0
        ),
      progressMax:
        Math.max(
          0,
          Number(progressModule?.max)||0
        ),
      guardProgressAmount:
        Math.max(
          0,
          Number(guardProgressModule?.amount)||0
        ),
      targetHealthThresholdPercent:
        targetHealthMultiplierModule&&
        Number.isFinite(Number(targetHealthMultiplierModule.threshold))
          ?Math.round(
            Math.max(0,Number(targetHealthMultiplierModule.threshold))*100
          )
          :null,
      targetHealthDamageIncreasePercent:
        targetHealthMultiplierModule&&
        Number.isFinite(Number(targetHealthMultiplierModule.multiplier))
          ?Math.round(
            Math.max(0,Number(targetHealthMultiplierModule.multiplier))*100-100
          )
          :null,
      actionStaminaGain:
        Math.max(
          0,
          Number(character?.staminaGainPerAction)||0
        ),
      coolingDelaySeconds:
        this.seconds(coolingBurstModule?.delay),
      coolingReducePercent:
        coolingBurstModule&&
        Number.isFinite(Number(coolingBurstModule.reduceMaxStaminaRatio))
          ?Math.round(
            Math.max(0,Number(coolingBurstModule.reduceMaxStaminaRatio))*100
          )
          :null,
      overclockGainPerSecond:
        Math.max(
          0,
          Number(overclockModule?.gainPerSecond)||0
        ),
      overclockAttackSpeedPercent:
        Math.round(
          Math.max(
            0,
            Number(overclockModule?.attackRate)||0
          )*100
        ),
      rapidCoolingDurationSeconds:
        this.seconds(
          rapidCoolingModule?.duration
        ),
      targetMaxHealthPercent:
        Math.round(
          Math.max(
            0,
            Number(targetMaxHealthModule?.ratio)||0
          )*100
        ),
      summonRegenSeconds:
        this.seconds(
          summonModifier?.data?.tickInterval
        ),
      summonRegenValue:
        Math.max(
          0,
          Number(summonModifier?.value)||0
        ),
      summonCarrySpeedPenaltyPercent:
        Math.round(
          Math.max(
            0,
            1-(
              Number.isFinite(firstSummonCarrySpeedMultiplier)
                ?Math.max(0,firstSummonCarrySpeedMultiplier)
                :1
            )
          )*100
        ),
      damageIncreasePercent:
        descriptionModifier
          ?Math.round(Math.abs(Number(descriptionModifier.value)||0)*100)
          :baseAttackDamage>0
            ?Math.round((currentDamage/baseAttackDamage-1)*100)
            :0,
      stunSeconds:this.seconds(stunModule?.duration),
      linkedStunSeconds:this.seconds(linkedStunModule?.duration),
      buffSeconds:this.seconds(detailBuff?.addDuration),
      dodgeDistancePercent:Math.round(
        Math.max(0,Number(detailDodgeStage?.value)||0)*100
      ),
      delaySeconds:this.seconds(abilityDelay?.duration),
      modifierSeconds:this.seconds(descriptionModifier?.duration),
      modifierPercent:
        descriptionModifier&&Number.isFinite(Number(descriptionModifier.value))
          ?Math.round(Math.abs(Number(descriptionModifier.value))*100)
          :null,
      movementDefensePercent:
        movementDefenseBuff&&Number.isFinite(Number(movementDefenseBuff.value))
          ?Math.round(Math.max(0,Number(movementDefenseBuff.value))*100)
          :null,
      channelChargeSeconds:this.seconds(channelModule?.chargeDuration),
      progressThresholdPercent:
        progressTriggerModule&&
        progressCondition&&
        Number.isFinite(Number(progressTriggerModule.maxHealthRatio))&&
        Number.isFinite(Number(progressCondition.value))
          ?Math.round(
            Math.max(0,Number(progressTriggerModule.maxHealthRatio))*
            Math.max(0,Number(progressCondition.value))*100
          )
          :null,
      maxInstances:Math.max(0,Number(installField?.maxInstances)||0),
      attackDelaySeconds:this.seconds(repeatedArea?.delay),
      fieldIntervalSeconds:this.seconds(
        installField?.interval??rangeProjectile?.rehitInterval
      ),
      chargeRangeMinPercent:charge?.range
        ?Math.round(Math.max(0,Number(charge.range.from)||0)/Math.max(1,Number(attack.range)||1)*100)
        :100,
      chargeRangeMaxPercent:charge?.range
        ?Math.round(Math.max(0,Number(charge.range.to)||0)/Math.max(1,Number(attack.range)||1)*100)
        :100,
      recentPathLimit:Math.max(
        0,
        Number(fieldExpandModule?.maxCount)||
        Number(installField?.recentPathLimit)||0
      ),
      staminaCostReductionPercent:Math.round(
        Math.abs(
          Number(staminaCostPassive?.valueRef?.to) ||
          Number(staminaCostPassive?.value)||0
        )*100
      ),
      comboMaxHits:Math.max(0,Number(abilityComboProgress?.max)||0),
      progressStageAmount:
        progressReferenceModule&&Number(segmentedGauge?.segmentDuration)>0
          ?Math.max(0,Number(progressReferenceModule.amount)||0)/Number(segmentedGauge.segmentDuration)
          :0,
      maxProgressStages:
        progressReferenceModule&&Number(segmentedGauge?.segmentDuration)>0
          ?Math.max(0,Number(progressReferenceModule.max)||0)/Number(segmentedGauge.segmentDuration)
          :0,
      multiClickMax:Math.max(0,Math.floor(Number(attack.multiClick?.maxClicks)||0)),
      multiClickMax:
        Math.max(
          0,
          Math.floor(
            Number(attack?.multiClick?.maxClicks)||0
          )
        ),
      multiClickWindowSeconds:this.seconds(attack.multiClick?.maxWindow),
      multiClickIdleSeconds:this.seconds(attack.multiClick?.idleRelease),
      restoreCostPercent:
        referenceAttack&&
        Number(referenceAttack.cost)>0&&
        restoreModuleForCost&&
        Number.isFinite(Number(restoreModuleForCost.amount))
          ?Math.round(
            Math.max(0,Number(restoreModuleForCost.amount))/
            Number(referenceAttack.cost)*100
          )
          :null
    };
    const unresolved=new Set();
    const rendered=CharacterDataService.interpolate(character,skill.text).replace(
      /\{(pellets|passiveDamagePercent|passiveDefensePercent|passiveSpeedPenaltyPercent|damage|detailDamage|hitCount|fullCost|healPercent|sleepSeconds|rewindSeconds|tipDamage|damageSequence|linkedDamage|linkedMinDamage|linkedMaxDamage|secondaryDamage|combinedDamage|minDamage|maxDamage|throwDamage|chargeSeconds|autoReturnSeconds|healAmount|fullDamage|bindSeconds|fieldSeconds|piercePercent|selfStealthSeconds|selfSpeedPercent|memoryCount|memorySeconds|dashWindowSeconds|burstCount|explosionDamage|bombCount|repeatCount|progressAmount|linkedProgressAmount|secondaryProgressAmount|progressMax|guardProgressAmount|targetHealthThresholdPercent|targetHealthDamageIncreasePercent|actionStaminaGain|coolingDelaySeconds|coolingReducePercent|overclockGainPerSecond|overclockAttackSpeedPercent|rapidCoolingDurationSeconds|targetMaxHealthPercent|summonRegenSeconds|summonRegenValue|summonCarrySpeedPenaltyPercent|damageIncreasePercent|stunSeconds|linkedStunSeconds|buffSeconds|dodgeDistancePercent|delaySeconds|modifierSeconds|modifierPercent|movementDefensePercent|channelChargeSeconds|comboSeconds|channelIntervalSeconds|channelMaxTicks|progressThresholdPercent|maxInstances|attackDelaySeconds|fieldIntervalSeconds|chargeRangeMinPercent|chargeRangeMaxPercent|recentPathLimit|staminaCostReductionPercent|comboMaxHits|progressStageAmount|maxProgressStages|multiClickMax|multiClickWindowSeconds|multiClickIdleSeconds|restoreCostPercent|skillCost|stealthDurationSeconds|stealthMaxStaminaCost|stealthSpeedPercent|stealthFreezeSeconds|stealthBoostCount|freezeSeconds|burnSeconds|zapSeconds|detailZapSeconds|attackSequenceCount|requiredProgress|fieldRewardPercent|restoreMaxResourcePercent|progressDecaySeconds|windowSeconds|progressPercent|statusSeconds|fieldStatusSeconds|requiredSummonStage|orbitMaxQuality|orbitMinDamage|orbitMaxDamage|recastWindowSeconds|recastMaxStage|recastRangeIncreasePercent|markMaxStacks|markMinBurstDamage|markMaxBurstDamage|sustainMaxSeconds|sustainSpeedPercent|sustainDrainPerSecond|stageMin|stageMax)\}/g,
      (token,key)=>{
        const value=values[key];
        if(
          value===null||
          value===undefined||
          (
            typeof value==='number'&&
            !Number.isFinite(value)
          )
        ){
          unresolved.add(key);
          return token;
        }
        return String(value);
      }
    );

    if(!unresolved.size)return rendered;

    /*
      참조 경로가 끊긴 설명은 0으로 위조하지 않는다.
      개발 중 즉시 찾을 수 있도록 경고하고, 사용자 화면에는
      `{key}`/`0초`/`0%` 대신 수치가 포함된 최소 구절만 제거한다.
    */
    console.warn(
      '[CharacterDescriptionService] unresolved tooltip reference',
      character?.id,
      skill?.key,
      [...unresolved]
    );

    return rendered
      .replace(/\{[A-Za-z0-9_]+\}(?:초|%|\/s)?\s*/g,'')
      .replace(/\s{2,}/g,' ')
      .replace(/\s+([,.])/g,'$1')
      .trim();
  },
  skillCost(character,skill,attack){
    const ref=skill?.costRef||null;
    if(ref){
      const ability=character?.abilities?.[String(ref.ability||'')]||null;
      const triggerName=String(ref.trigger||'trigger');
      const trigger=ability?.[triggerName]||null;
      const moduleType=String(ref.module||'');
      const module=(trigger?.modules||[]).find(item=>
        (typeof item==='string'?item:item?.type)===moduleType
      )||null;
      if(module&&ref.property){
        const value=String(ref.property)
          .split('.')
          .filter(Boolean)
          .reduce(
            (current,key)=>current?.[key],
            module
          );
        return Math.max(0,Number(value)||0);
      }
      if(module&&ref.resource!==false){
        return Math.max(0,Number(module.amount)||0);
      }
    }

    const costAttack=
      skill?.costAttack
        ?character?.attacks?.[String(skill.costAttack)]||attack
        :attack;
    return Math.max(0,Number(costAttack?.cost)||0);
  },
  skillCostText(character,skill,attack){
    const ref=skill?.costRef||null;
    if(ref?.format){
      const ability=character?.abilities?.[String(ref.ability||'')]||null;
      const trigger=ability?.[String(ref.trigger||'trigger')]||null;
      const module=(trigger?.modules||[]).find(item=>
        (typeof item==='string'?item:item?.type)===String(ref.module||'')
      )||null;
      const read=property=>String(property||'')
        .split('.')
        .filter(Boolean)
        .reduce((current,key)=>current?.[key],module);

      if(ref.format==='range'&&module){
        const min=Math.max(0,Number(read(ref.minProperty))||0);
        const max=Math.max(0,Number(read(ref.maxProperty))||0);
        return min===max
          ?`스테미나 ${min}`
          :`스테미나 ${min}~${max}`;
      }

      if(ref.format==='per-distance'&&module){
        const value=Math.max(0,Number(read(ref.property))||0);
        return `스테미나 ${value}/px`;
      }
    }

    const multiClick=attack?.multiClick||null;
    if(Number.isFinite(Number(multiClick?.clickCost))&&Number(multiClick.clickCost)>0){
      const suffix=
        Object.prototype.hasOwnProperty.call(
          multiClick,
          'staminaCostSuffix'
        )
          ?String(multiClick.staminaCostSuffix||'')
          :'/클릭';
      return `스테미나 ${Math.max(0,Number(multiClick.clickCost)||0)}${suffix}`;
    }

    const charge=attack?.charge||null;
    if(
      Number.isFinite(Number(charge?.costMin))&&
      Number.isFinite(Number(charge?.costMax))&&
      (
        Number(charge.costMin)>0||
        Number(charge.costMax)>0
      )
    ){
      const min=Math.max(0,Number(charge.costMin)||0);
      const max=Math.max(0,Number(charge.costMax)||0);
      return min===max
        ?`스테미나 ${min}`
        :`스테미나 ${min}~${max}`;
    }

    const resolvedCost=this.skillCost(character,skill,attack);
    return `스테미나 ${resolvedCost}`;
  },
  html(character,options={}){
    if(!character)return '';
    const includeCosts=options.includeCosts!==false;
    const recordPoints=Number(options.recordPoints);
    const recordHtml=Number.isFinite(recordPoints)
      ?(()=>{
        const points=Math.max(0,Math.floor(recordPoints));
        const tier=CharacterRecordService.tier(points);
        return `<div style="margin:3px 0 5px;">`+
          `<strong class="duels-skill-key">[RECORD]</strong> ${tier.name} · ${points}</div>`;
      })()
      :'';
    const groupedSkills=new Map();
    const basicSkills=[];
    for(const skill of character.tooltipSkills||[]){
      const key=String(skill.key||'');
      const group=String(skill.section||(key.startsWith('/')?'COMMAND':key.match(/(?:^|\s)(WEAPON|PROTECTION|SUMMONER)(?:$|\s)/)?.[1])||'');
      if(!group){basicSkills.push(skill);continue;}
      if(!groupedSkills.has(group))groupedSkills.set(group,[]);
      groupedSkills.get(group).push(skill);
    }
    const renderSkill=skill=>{
      if(Array.isArray(skill.inlineStages)){
        const inline=
          skill.inlineStages
            .map(stage=>{
              const stageText=this.interpolate(character,stage);
              return `<strong class="duels-skill-key">[${stage.key}]</strong>`+
                `${stageText?` ${stageText}`:''}`;
            })
            .join(' ');
        return inline;
      }

      const attack=character.attacks?.[skill.attack]||null;
      if(!attack){
        const description=
          this.interpolateStatic(
            character,
            skill.text
          ).trim();
        if(!description)return '';
        const skillNameText=skill.name?` ${skill.name}`:'';
        return `<strong class="duels-skill-key">[${skill.key}]</strong>${skillNameText} — ${description}`;
      }
      const costText=
        !includeCosts||skill.showCost===false
          ?''
          :` / ${
            skill.costText
              ?this.interpolate(
                character,
                {...skill,text:skill.costText}
              )
              :this.skillCostText(character,skill,attack)
          }`;
      const skillNameText=skill.name?` ${skill.name}`:'';
      const description=this.interpolate(character,skill);
      return `<strong class="duels-skill-key">[${skill.key}]</strong>${skillNameText}${description?` — ${description}`:''}${costText}`;
    };
    const skillsHtml=basicSkills.map(renderSkill).filter(Boolean).join('<br>');
    const extraSkillsHtml=[...groupedSkills.values()].map(skills=>
      `<div style="margin-top:11px;">${skills.map(renderSkill).filter(Boolean).join('<br>')}</div>`
    ).join('');

    const summonHtml=(character.summonSpecs||[])
      .map(summon=>{
        const spec=
          character.summons?.[summon.stateKey]||
          null;
        if(!spec)return '';

        const stats=(summon.stats||[])
          .map(stat=>{
            const key=
              typeof stat==='string'
                ?String(stat||'')
                :String(stat?.key||'');
            if(key==='MOVE SPEED'&&Number(spec.speed||0)===0)return '';
            const value=
              this.interpolateSummon(
                character,
                spec,
                stat
              );
            return (
              !key||
              value===''
            )
              ?''
              :`<strong class="duels-skill-key">[${key}]</strong> ${value}`;
          })
          .filter(Boolean)
          .join('<br>');

        return `<div style="margin-top:11px;">`+
          `<strong class="duels-skill-key">[SUMMON] ${spec.name||'소환수'}</strong>`+
          `${stats?`<br>${stats}`:''}`+
          `</div>`;
      })
      .join('');


    const englishName=this.englishName(character);
    const titleColor=String(character.color||'#dbe7ef');
    const titleHtml=
      `<div style="margin:0 0 6px;color:${titleColor};font-weight:800;font-style:italic;font-synthesis:style;letter-spacing:.3px;">`+
      `${character.name} : ${englishName}</div>`;

    const baseStatsHtml=
      `<div style="margin:3px 0 5px;white-space:nowrap;">`+
      `<strong class="duels-skill-key">[HEALTH]</strong> ${character.maxHealth}`+
      `<span style="display:inline-block;width:18px;"></span>`+
      `<strong class="duels-skill-key">[MOVE SPEED]</strong> ${character.moveLabel||character.speed}</div>`;

    return titleHtml+`<span class="duels-character-summary">${CharacterDataService.interpolate(character,character.desc)}</span><br>`+
      baseStatsHtml+
      recordHtml+
      skillsHtml+
      extraSkillsHtml+
      summonHtml;
  }
});