


/* 범용 고정형 소환수 / 배치형 소환수 */
const SummonDeployService=Object.freeze({
  commonDeathEffect:Object.freeze({
    type:'areaCircle',
    r:44,
    range:44,
    fillAlpha:.12,
    strokeAlpha:.9,
    duration:233
  }),
  stateKind:'deployable-summon-state',
  spec(owner,stateKey){
    return owner?.character?.summons?.[stateKey]||null;
  },
  specFor(owner,stateKey,state=null){
    return (
      this.spec(owner,stateKey)||
      state?.summonSpec||
      this.entity(owner,stateKey)?.summonSpec||
      null
    );
  },
  entityId(owner,stateKey){
    return `summon.${owner?.id||'owner'}.${stateKey}`;
  },
  state(owner,stateKey,create=true){
    if(!owner?.actionState||!stateKey)return null;

    let state=owner.actionState.get(
      `summon:${stateKey}`
    )||null;

    if(!state&&create){
      const spec=this.spec(owner,stateKey);
      if(!spec)return null;

      state={
        kind:this.stateKind,
        stateKey,
        summonSpec:spec,
        active:false,
        health:Math.max(
          1,
          Number(spec.maxHealth)||1
        ),
        destroyedUntil:0,
        destroyedAt:0,
        readyFlashUntil:0,
        nextAuraAt:0,
        nextStoredRegenAt:0,
        storedNaturalRegenReadyAt:0,
        carrying:false,
        pickupReadyAt:0,
        leashBreakAt:0,
        nextHealthDecayAt:0,
        x:owner.x,
        y:owner.y
      };

      owner.actionState.set(
        `summon:${stateKey}`,
        state
      );
    }

    if(state&&!state.summonSpec){
      const currentSpec=this.spec(owner,stateKey);
      if(currentSpec)state.summonSpec=currentSpec;
    }

    return state;
  },
  entity(owner,stateKey){
    return EntityService.items.get(
      this.entityId(owner,stateKey)
    )||null;
  },
  fieldStateKey(stateKey,spec=null){
    const field=
      spec?.fieldArea||
      null;
    return String(
      field?.stateKey||
      `summon-field:${stateKey}`
    );
  },
  clearField(owner,stateKey,spec=null){
    if(!owner)return false;
    const state=this.state(
      owner,
      stateKey,
      false
    );
    return InstalledAreaFieldService.clear(
      owner,
      this.fieldStateKey(
        stateKey,
        spec||
        this.specFor(
          owner,
          stateKey,
          state
        )
      )
    );
  },
  spawnSpecEffect(
    owner,
    entity,
    effect,
    now=performance.now(),
    options={}
  ){
    if(!effect||!owner)return null;

    const snapshot=EffectSpawnService
      .definitionSnapshot(effect);
    let preparedEffect=snapshot;
    if(
      effect.scaleWithFieldRange===true&&
      options.fieldArea&&
      typeof options.fieldArea==='object'
    ){
      const baseRange=Math.max(0,Number(options.fieldArea.range)||0);
      const preparedField=AugmentService.prepareRangeField(
        entity||owner,
        options.fieldArea,
        now
      );
      const preparedRange=Math.max(0,Number(preparedField?.range)||baseRange);
      const multiplier=baseRange>0?preparedRange/baseRange:1;
      preparedEffect=AugmentService.scaleRangeGeometry(
        snapshot,
        multiplier,
        {visual:true}
      );
    }

    const spawned=EffectSpawnService.spawn(
      {
        ...preparedEffect,
        x:Number(entity?.x??owner.x)||0,
        y:Number(entity?.y??owner.y)||0,
        color:
          options.color||
          effect.color||
          entity?.color||
          owner.color,
        sourceEntityId:owner.id,
        start:now,
        dur:Math.max(
          GAME_DATA.frameMs,
          Number(effect.duration)||
          Number(effect.durationFrames)*
            GAME_DATA.frameMs||
          GAME_DATA.frameMs
        )
      },
      {source:owner}
    );

    if(options.sync===true&&spawned){
      OnlinePresentationSyncService?.sendEffect?.(
        owner,
        spawned,
        now
      );
    }

    return spawned;
  },
  spawn(owner,stateKey,options={}){
    const state=this.state(owner,stateKey,true);
    const spec=this.specFor(
      owner,
      stateKey,
      state
    );
    if(!spec||!state)return null;

    const now=performance.now();
    if(
      state.destroyedUntil>now&&
      options.force!==true
    )return null;

    if(state.active){
      return this.entity(owner,stateKey);
    }

    if(state.health<=0){
      state.health=Math.max(
        1,
        Math.min(
          Number(spec.maxHealth)||1,
          Number(spec.respawnHealth)||Number(spec.maxHealth)||1
        )
      );
      state.destroyedUntil=0;
      state.destroyedAt=0;
    }

    const entity=EntityService.create({
      id:this.entityId(owner,stateKey),
      kind:'summon',
      ownerId:owner.id,
      teamId:owner.teamId,
      x:Number(options.x??owner.x)||owner.x,
      y:Number(options.y??owner.y)||owner.y,
      radius:Math.max(
        1,
        Number(spec.radius)||
        Number(owner.radius)||
        20
      ),
      color:
        spec.presentation?.color||
        owner.color||
        '#ff1493',
      maxHealth:Math.max(
        1,
        Number(spec.maxHealth)||1
      ),
      stamina:0,
      maxStamina:0,
      speed:Math.max(
        0,
        Number(spec.speed)||0
      ),
      baseDamage:Math.max(
        0,
        Number(spec.baseDamage)||0
      ),
      healthRegenPolicy:
        spec.healthRegen===false
          ?null
          :(
            spec.healthRegenPolicy||
            owner.healthRegenPolicy||
            GAME_DATA.healthRegen
          )
    });

    entity.summonStateKey=stateKey;
    entity.summonSpec=spec;
    entity.character=owner.character;
    entity.displayName=spec.name||'소환수';

    // 모든 소환수는 생성 좌표가 벽/경계와 겹치면 공통 Entity 충돌 보정으로
    // 가장 가까운 유효 위치에 배치한다.
    MovementService.ensureValidPosition(entity);

    AugmentCooldownService.initializeEntity(
      entity,
      now
    );

    AugmentService.syncConstantBuffs(owner);
    AugmentService.syncVitals(owner);

    // 저장 체력은 증강까지 반영된 최종 maxHealth에 대해 복원한다.
    // maxHealth 감소 증강이 있을 때 base max 기준 비율로 다시 축소되는 누적 손실을 방지한다.
    entity.health=Math.max(
      1,
      Math.min(
        entity.maxHealth,
        Number(state.health)||
          entity.maxHealth
      )
    );
    entity.healthTrailHealth=entity.health;
    if(entity.health<entity.maxHealth&&entity.healthRegenPolicy){
      const policy=entity.healthRegenPolicy;
      const stats=CombatStatsService.current(entity,now);
      entity.lastNaturalRegenBlockTime=now;
      entity.nextHealthRegenAt=
        now+
        Math.max(0,Number(policy.idle)||0)*
          Math.max(0,stats.regenDelayMult);
    }

    state.active=true;
    if(spec.modeState?.stateKey){
      ModeStateService.set(
        owner,
        String(spec.modeState.stateKey),
        String(spec.modeState.initial||''),
        String(spec.modeState.initial||'')
      );
    }
    state.x=entity.x;
    state.y=entity.y;
    state.nextAuraAt=now;
    state.pickupReadyAt=
      spec.carry
        ?now+Math.max(0,Number(spec.carry.pickupCooldown)||0)
        :0;
    state.leashBreakAt=0;
    state.nextHealthDecayAt=
      spec.healthDecay
        ?now+Math.max(1,Number(spec.healthDecay.interval)||1000)
        :0;

    this.spawnSpecEffect(
      owner,
      entity,
      spec.spawnEffect,
      now,
      {
        color:options.spawnEffectColor||null,
        sync:options.syncSpawnEffect===true,
        fieldArea:spec.fieldArea||null
      }
    );

    if(
      options.spawnEffectSound&&
      (
        options.spawnEffectSoundLocalOnly!==true||
        EntitySimulationAuthorityService.isLocal(owner)
      )
    ){
      SoundService.play(String(options.spawnEffectSound));
    }

    return entity;
  },
  carryBuffSource(stateKey){
    return `summon-carry:${String(stateKey||'summon')}`;
  },
  dropCarry(owner,stateKey,cooldown=0,now=performance.now()){
    const state=this.state(owner,stateKey,false);
    if(!state?.carrying)return false;

    state.carrying=false;
    state.pickupReadyAt=
      now+Math.max(0,Number(cooldown)||0);
    BuffService.remove(
      owner,
      'speed',
      this.carryBuffSource(stateKey)
    );
    return true;
  },
  updateCarry(owner,stateKey,state,spec,entity,now){
    const carry=spec?.carry;
    if(!carry||!EntitySimulationAuthorityService.isLocal(owner)){
      return false;
    }

    const pickupRange=Math.max(0,Number(carry.pickupRange)||0);
    if(
      !state.carrying&&
      pickupRange>0&&
      now>=Math.max(0,Number(state.pickupReadyAt)||0)&&
      Math.hypot(
        Number(owner.x)-Number(entity.x),
        Number(owner.y)-Number(entity.y)
      )<=pickupRange
    ){
      state.carrying=true;
    }

    const buffSource=this.carryBuffSource(stateKey);
    if(!state.carrying){
      BuffService.remove(owner,'speed',buffSource);
      return false;
    }

    entity.x=Number(owner.x)||0;
    entity.y=Number(owner.y)||0;
    if(entity.forcedMotion){
      MovementService.finalizeForcedMotion(entity);
    }
    MovementAbilityService.clear(entity);

    const speedMultiplier=Math.max(0,Number(carry.speedMultiplier)||1);
    BuffService.refresh(
      owner,
      'speed',
      speedMultiplier-1,
      buffSource,
      150,
      {sourceEntityId:entity.id}
    );
    return true;
  },
  updateLeash(owner,stateKey,state,spec,entity,now){
    const leash=spec?.leash;
    if(!leash||!EntitySimulationAuthorityService.isLocal(owner)){
      return false;
    }

    const range=Math.max(0,Number(leash.range)||0);
    if(range<=0||state.carrying){
      state.leashBreakAt=0;
      return false;
    }

    const distance=Math.hypot(
      Number(owner.x)-Number(entity.x),
      Number(owner.y)-Number(entity.y)
    );
    if(distance<=range){
      state.leashBreakAt=0;
      return false;
    }

    if(!(state.leashBreakAt>0)){
      state.leashBreakAt=
        now+Math.max(0,Number(leash.delay)||0);
      return false;
    }
    if(now<state.leashBreakAt)return false;

    const refund=Math.max(0,Number(leash.staminaRefund)||0);
    this.destroy(owner,stateKey,now);
    if(refund>0){
      StaminaService.restore(owner,refund);
    }
    return true;
  },
  updateHealthDecay(owner,stateKey,state,spec,entity,now){
    const decay=spec?.healthDecay;
    if(!decay||!EntitySimulationAuthorityService.isLocal(entity)){
      return false;
    }

    const interval=Math.max(1,Number(decay.interval)||1000);
    if(!(state.nextHealthDecayAt>0)){
      state.nextHealthDecayAt=now+interval;
      return false;
    }

    let changed=false;
    let guard=0;
    while(
      now>=state.nextHealthDecayAt&&
      entity.alive&&
      guard<4
    ){
      const amount=
        Math.max(0,Number(decay.amount)||0)||
        entity.maxHealth*Math.max(0,Number(decay.ratio)||0);
      if(amount>0){
        HealthService.damage(
          entity,
          amount,
          state.nextHealthDecayAt
        );
        changed=true;
      }
      state.nextHealthDecayAt+=interval;
      guard++;
    }
    return changed;
  },
  recall(owner,stateKey){
    const state=this.state(owner,stateKey,false);
    if(!state?.active)return false;

    const spec=this.specFor(
      owner,
      stateKey,
      state
    );
    this.clearField(
      owner,
      stateKey,
      spec
    );

    const now=performance.now();
    const entity=this.entity(owner,stateKey);
    if(entity){
      state.health=Math.max(
        0,
        Number(entity.health)||0
      );
      state.x=entity.x;
      state.y=entity.y;

      const policy=entity.healthRegenPolicy;
      const stats=policy
        ?CombatStatsService.current(entity,now)
        :null;
      const storedIdle=policy
        ?Math.max(0,Number(policy.idle)||0)*
          Math.max(
            0,
            Number(stats?.regenDelayMult)||0
          )
        :0;

      state.storedNaturalRegenReadyAt=
        policy
          ?now+storedIdle
          :0;
      state.nextStoredRegenAt=
        state.storedNaturalRegenReadyAt;

      EntityService.items.delete(entity.id);
    }

    this.dropCarry(owner,stateKey,0,now);
    NaturalHealthRegenActivityService.mark(
      owner,
      now
    );
    state.active=false;
    state.nextAuraAt=0;
    state.leashBreakAt=0;
    state.nextHealthDecayAt=0;
    return true;
  },
  destroy(owner,stateKey,now=performance.now()){
    const state=this.state(
      owner,
      stateKey,
      false
    );
    const spec=this.specFor(
      owner,
      stateKey,
      state
    );
    this.clearField(
      owner,
      stateKey,
      spec
    );
    if(!spec||!state)return false;

    const entity=this.entity(owner,stateKey);
    if(entity){
      this.spawnSpecEffect(
        owner,
        entity,
        this.commonDeathEffect,
        now,
        {color:owner.color,sync:true}
      );
      EntityService.items.delete(entity.id);
    }

    this.dropCarry(owner,stateKey,0,now);
    state.active=false;
    state.health=0;
    state.leashBreakAt=0;
    state.nextHealthDecayAt=0;
    state.destroyedAt=now;
    state.destroyedUntil=
      now+
      Math.max(
        0,
        Number(spec.respawnDelay)||0
      );
    state.readyFlashUntil=
      state.destroyedUntil+500;
    state.nextAuraAt=0;
    state.nextStoredRegenAt=0;
    state.storedNaturalRegenReadyAt=0;
    return true;
  },
  deployCost(owner,attack,now){
    if(!AttackService.canUse(owner,attack)){
      return false;
    }
    if(!StaminaService.spend(owner,attack.cost,now)){
      return false;
    }

    owner.lastAttackTime=now;
    NaturalHealthRegenActivityService.mark(
      owner,
      now
    );

    if(owner.healthRegenPolicy){
      const stats=CombatStatsService.current(
        owner,
        now
      );
      owner.nextHealthRegenAt=
        now+
        owner.healthRegenPolicy.idle*
        Math.max(
          0,
          stats.regenDelayMult
        );
    }

    owner.cooldowns.set(
      attack.id,
      now+attack.cd
    );
    AttackService.applyAttackDelay(
      owner,
      attack,
      now
    );

    return true;
  },
  nearestEnemy(entity,now=performance.now()){
    if(!entity)return null;

    let nearest=null;
    let nearestDistance=Infinity;

    EntityService.forEachEnemy(
      entity,
      target=>{
        if(
          !SummonAIService.canPerceiveEnemy(
            entity,
            target,
            now
          )
        )return;
        const distance=Math.hypot(
          Number(target.x)-Number(entity.x),
          Number(target.y)-Number(entity.y)
        );
        if(distance>=nearestDistance)return;
        nearest=target;
        nearestDistance=distance;
      }
    );

    return nearest;
  },
  returnToOwner(
    context,
    stateKey,
    command,
    state,
    summon
  ){
    const source=context.source;
    const now=performance.now();

    const baseAttack=
      AbilityService.attackById(
        source.character,
        String(command.returnAttackId||'')
      );

    if(!baseAttack){
      context.handled=true;
      return false;
    }

    const dx=Number(source.x)-Number(summon.x);
    const dy=Number(source.y)-Number(summon.y);
    const angle=
      Math.hypot(dx,dy)>.001
        ?Math.atan2(dy,dx)
        :0;

    const attack=
      AugmentService.prepareAttack(
        summon,
        baseAttack,
        now
      );

    const executed=
      TriggeredAttackService.execute(
        summon,
        attack,
        angle
      );

    if(executed){
      source.cooldowns.set(
        context.attack.id,
        now+
        Math.max(0,Number(command.cooldown)||0)
      );
      source.lastAttackTime=now;
      NaturalHealthRegenActivityService.mark(
        source,
        now
      );
    }

    context.handled=true;
    return executed;
  },

  nearestEnemyAngle(
    summon,
    fallbackAngle=0
  ){
    let nearest=null;
    let nearestDistance=Infinity;

    const now=performance.now();
    EntityService.forEachEnemy(
      summon,
      target=>{
        if(
          !target?.alive||
          !SummonAIService.canPerceiveEnemy(
            summon,
            target,
            now
          )
        )return;

        const dx=
          Number(target.x)-
          Number(summon.x);
        const dy=
          Number(target.y)-
          Number(summon.y);
        const distance=
          dx*dx+
          dy*dy;

        if(distance>=nearestDistance)return;

        nearestDistance=distance;
        nearest=target;
      }
    );

    if(!nearest){
      return Number(fallbackAngle)||0;
    }

    return Math.atan2(
      Number(nearest.y)-Number(summon.y),
      Number(nearest.x)-Number(summon.x)
    );
  },

  modeTapCommand(
    context,
    stateKey,
    command
  ){
    const source=context.source;
    const state=this.state(
      source,
      stateKey,
      true
    );
    const summon=this.entity(
      source,
      stateKey
    );

    if(!state||!summon?.alive){
      context.handled=true;
      return false;
    }

    const now=performance.now();

    if(
      !CombatStatsService.current(
        summon,
        now
      ).canAct
    ){
      context.handled=true;
      return false;
    }

    if(
      (source.cooldowns.get(context.attack.id)||0)>now
    ){
      context.handled=true;
      return false;
    }

    const spec=this.spec(
      source,
      stateKey
    );
    const mode=ModeStateService.current(
      source,
      String(
        spec?.modeState?.stateKey||
        'spirit-mode'
      ),
      String(
        spec?.modeState?.initial||
        command.guardMode||
        'guard'
      )
    );

    if(
      mode===
      String(command.exploreMode||'explore')
    ){
      return this.command(
        context,
        stateKey,
        command.exploreDash
      );
    }

    const baseAttack=
      AbilityService.attackById(
        source.character,
        String(command.guardAttackId||'')
      );

    if(!baseAttack){
      context.handled=true;
      return false;
    }

    const guardCost=Math.max(0,Number(command.guardCost)||0);
    if(guardCost>0&&!StaminaService.spend(source,guardCost,now)){
      context.handled=true;
      return false;
    }

    const preparedGuardAttack=
      AugmentService.prepareAttack(
        summon,
        baseAttack,
        now
      );
    const fallbackAngle=
      Math.atan2(
        Number(summon.y)-Number(source.y),
        Number(summon.x)-Number(source.x)
      );
    const angle=
      this.nearestEnemyAngle(
        summon,
        fallbackAngle
      );

    const executed=
      TriggeredAttackService.execute(
        summon,
        preparedGuardAttack,
        angle
      );

    if(executed){
      source.cooldowns.set(
        context.attack.id,
        now+
        Math.max(
          0,
          Number(command.cooldown)||0
        )
      );
      source.lastAttackTime=now;
      NaturalHealthRegenActivityService.mark(
        source,
        now
      );
      NaturalHealthRegenActivityService.mark(
        summon,
        now
      );
    }

    context.handled=true;
    return executed;
  },

  command(
    context,
    stateKey,
    command
  ){
    const source=context.source;
    const summon=this.entity(
      source,
      stateKey
    );
    if(!summon?.alive)return false;

    if(context.network===true){
      context.handled=true;
      return true;
    }

    const now=performance.now();
    const abilityAttack=context.attack;

    if(
      !CombatStatsService.current(
        summon,
        now
      ).canAct
    ){
      context.handled=true;
      return false;
    }

    if(
      command.blockWhileMoving!==false&&
      MovementAbilityService.active(
        summon
      )
    ){
      context.handled=true;
      return false;
    }

    if(
      (source.cooldowns.get(
        abilityAttack.id
      )||0)>now
    ){
      context.handled=true;
      return false;
    }

    const targetMode=String(command.target||'nearest-enemy');
    const candidateList=
      Array.isArray(command.targetCandidates)
        ?command.targetCandidates.filter(
          target=>
            target?.alive&&
            !target.hidden&&
            SummonAIService.canPerceiveEnemy(
              summon,
              target,
              now
            )
        )
        :null;
    const target=
      targetMode==='aim'
        ?null
        :(
          candidateList?.length
            ?candidateList.reduce(
              (best,target)=>{
                if(!best)return target;
                const bestDistance=Math.hypot(
                  Number(best.x)-Number(summon.x),
                  Number(best.y)-Number(summon.y)
                );
                const distance=Math.hypot(
                  Number(target.x)-Number(summon.x),
                  Number(target.y)-Number(summon.y)
                );
                return distance<bestDistance
                  ?target
                  :best;
              },
              null
            )
            :(
              targetMode==='nearest-enemy'
                ?this.nearestEnemy(summon)
                :null
            )
        );

    if(targetMode!=='aim'&&!target){
      context.handled=true;
      return false;
    }

    const cost=Math.max(
      0,
      Number(command.cost)||0
    );
    if(!StaminaService.canSpend(source,cost,now)){
      context.handled=true;
      return false;
    }

    const baseAttack=
      AbilityService.attackById(
        source.character,
        String(command.attackId||'')
      );
    if(!baseAttack){
      context.handled=true;
      return false;
    }

    const aimAngle=Number(context.angle)||0;
    const rawAimPoint=
      context.targetPoint&&
      Number.isFinite(Number(context.targetPoint.x))&&
      Number.isFinite(Number(context.targetPoint.y))
        ?{
          x:Number(context.targetPoint.x),
          y:Number(context.targetPoint.y)
        }
        :null;
    const rawDx=
      targetMode==='aim'
        ?(
          command.aimFrom==='target-point'&&rawAimPoint
            ?rawAimPoint.x-Number(summon.x)
            :Math.cos(aimAngle)*Math.max(0,Number(baseAttack.range)||0)
        )
        :Number(target.x)-Number(summon.x);
    const rawDy=
      targetMode==='aim'
        ?(
          command.aimFrom==='target-point'&&rawAimPoint
            ?rawAimPoint.y-Number(summon.y)
            :Math.sin(aimAngle)*Math.max(0,Number(baseAttack.range)||0)
        )
        :Number(target.y)-Number(summon.y);
    const distance=Math.hypot(rawDx,rawDy);
    const angle=
      distance>.001
        ?Math.atan2(rawDy,rawDx)
        :aimAngle;
    const maxDistance=
      Math.max(
        0,
        Number(command.maxDistance)||
        Number(baseAttack.range)||0
      );
    const extraTargetRadius=
      targetMode!=='aim'&&command.includeTargetRadius===true
        ?Math.max(
          0,
          Number(target?.radius)||0
        )
        :0;
    const travelDistance=
      targetMode==='aim'
        ?(
          maxDistance>0
            ?Math.min(maxDistance,distance)
            :distance
        )
        :command.fixedDistance===true&&maxDistance>0
          ?maxDistance
          :maxDistance>0
            ?Math.min(maxDistance,distance+extraTargetRadius)
            :distance;
    const targetPoint={
      x:
        Number(summon.x)+
        Math.cos(angle)*travelDistance,
      y:
        Number(summon.y)+
        Math.sin(angle)*travelDistance
    };

    if(
      cost>0&&
      !StaminaService.spend(
        source,
        cost,
        now
      )
    ){
      context.handled=true;
      return false;
    }

    source.cooldowns.set(
      abilityAttack.id,
      now+
      Math.max(
        0,
        Number(command.cooldown)||0
      )
    );
    source.lastAttackTime=now;
    NaturalHealthRegenActivityService.mark(
      source,
      now
    );

    const attack=
      AugmentService.prepareAttack(
        summon,
        baseAttack,
        now
      );

    const executed=
      TriggeredAttackService.execute(
        summon,
        attack,
        angle,
        {targetPoint}
      );

    if(executed){
      NaturalHealthRegenActivityService.mark(
        summon,
        now
      );
    }

    context.handled=true;
    return executed;
  },
  recipientCandidate(
    source,
    selection,
    point,
    fallbackOrigin=null
  ){
    if(!source||!selection)return null;

    const relations=
      Array.isArray(
        selection.targetRelations
      )
        ?selection.targetRelations
        :['ally'];
    const kinds=
      Array.isArray(selection.targetKinds)
        ?selection.targetKinds
        :null;
    const origin=
      point&&
      Number.isFinite(Number(point.x))&&
      Number.isFinite(Number(point.y))
        ?{
          x:Number(point.x),
          y:Number(point.y)
        }
        :fallbackOrigin&&
          Number.isFinite(
            Number(fallbackOrigin.x)
          )&&
          Number.isFinite(
            Number(fallbackOrigin.y)
          )
          ?{
            x:Number(fallbackOrigin.x),
            y:Number(fallbackOrigin.y)
          }
          :{
            x:Number(source.x)||0,
            y:Number(source.y)||0
          };

    let best=null;
    let bestDistance=Infinity;
    const excludedOwnSummon=
      selection.excludeOwnSummonStateKey
        ?SummonDeployService.entity(
          source,
          String(
            selection.excludeOwnSummonStateKey
          )
        )
        :null;

    for(
      const candidate of
      EntityService.items.values()
    ){
      if(
        !candidate?.alive||
        candidate.hidden||
        candidate===excludedOwnSummon
      )continue;

      const relation=
        RelationService.relation(
          source,
          candidate
        );
      if(!relations.includes(relation)){
        continue;
      }

      if(
        relation!=='enemy'&&
        selection.friendlyRequiresResource
      ){
        const resource=
          String(
            selection.friendlyRequiresResource
          );
        const maximum=
          resource==='stamina'
            ?Math.max(
              0,
              Number(candidate.maxStamina)||0
            )
            :resource==='health'
              ?Math.max(
                0,
                Number(candidate.maxHealth)||0
              )
              :1;
        if(maximum<=0)continue;
      }

      if(
        kinds&&
        kinds.length&&
        !kinds.includes(
          String(candidate.kind||'')
        )
      )continue;

      const distance=Math.hypot(
        Number(candidate.x)-origin.x,
        Number(candidate.y)-origin.y
      );
      const radius=
        Math.max(
          0,
          Number(selection.radius)||0
        );

      if(
        radius>0&&
        distance>
          radius+
          Math.max(
            0,
            Number(candidate.radius)||0
          )
      )continue;

      if(distance>=bestDistance)continue;
      best=candidate;
      bestDistance=distance;
    }

    return best;
  },
  assignRecipient(
    source,
    state,
    selection,
    context,
    fallbackOrigin=null
  ){
    if(
      !source||
      !state||
      !selection
    )return null;

    const point=
      context?.targetPoint&&
      Number.isFinite(
        Number(context.targetPoint.x)
      )&&
      Number.isFinite(
        Number(context.targetPoint.y)
      )
        ?context.targetPoint
        :null;
    let recipient=
      this.recipientCandidate(
        source,
        selection,
        point,
        fallbackOrigin
      );

    const property=
      String(
        selection.stateProperty||
        'recipientEntityId'
      );
    const existingRecipient=
      state[property]
        ?EntityTargetReferenceService.resolve(
          state[property]
        )
        :null;
    const existingValid=
      existingRecipient?.alive===true&&
      !existingRecipient.hidden;

    if(
      !recipient&&
      selection.preserveExistingOnMiss===true&&
      existingValid
    ){
      recipient=existingRecipient;
    }else if(
      !recipient&&
      selection.fallback==='self'&&
      source?.alive
    ){
      recipient=source;
    }

    const selectionEffect=
      selection.selectionEffect;
    if(
      selectionEffect&&
      point
    ){
      EffectSpawnService.spawn(
        {
          ...EffectSpawnService
            .definitionSnapshot(
              selectionEffect
            ),
          x:Number(point.x),
          y:Number(point.y),
          sourceEntityId:
            String(source.id||'')
        },
        {source}
      );
    }

    state[property]=
      EntityTargetReferenceService.encode(
        recipient
      );

    return recipient;
  },
  toggle(context,module){
    const source=context.source;
    const attack=context.attack;
    const stateKey=String(module.stateKey||'');
    const state=this.state(
      source,
      stateKey,
      true
    );
    if(!state)return false;

    const now=performance.now();

    if(state.active){
      if(
        module.retargetWhileActive===true&&
        module.recipientSelection
      ){
        const selection=module.recipientSelection;
        const property=String(
          selection.stateProperty||
          'recipientEntityId'
        );
        const existingRecipient=
          state[property]
            ?EntityTargetReferenceService.resolve(
              state[property]
            )
            :null;
        const existingValid=
          existingRecipient?.alive===true&&
          !existingRecipient.hidden;
        const point=
          context?.targetPoint&&
          Number.isFinite(Number(context.targetPoint.x))&&
          Number.isFinite(Number(context.targetPoint.y))
            ?context.targetPoint
            :null;
        const candidate=this.recipientCandidate(
          source,
          selection,
          point,
          this.entity(source,stateKey)
        );

        if(
          !candidate&&
          selection.noOpOnMissWithExisting===true&&
          existingValid
        ){
          context.handled=true;
          return false;
        }

        if(
          context.network!==true&&
          (
            (source.cooldowns.get(attack.id)||0)>now||
            !AttackService.delayReady(
              source,
              attack,
              now
            )
          )
        ){
          context.handled=true;
          return false;
        }

        const recipient=this.assignRecipient(
          source,
          state,
          selection,
          context,
          this.entity(source,stateKey)
        );
        if(!recipient){
          context.handled=true;
          return false;
        }

        source.cooldowns.set(
          attack.id,
          now+
          Math.max(
            0,
            Number(module.recallCooldown)||0
          )
        );
        AttackService.applyAttackDelay(
          source,
          attack,
          now
        );
        source.lastAttackTime=now;
        NaturalHealthRegenActivityService.mark(
          source,
          now
        );
        context.handled=true;
        return true;
      }

      if(
        state.carrying&&
        module.dropWhileCarrying===true
      ){
        const carry=this.spec(source,stateKey)?.carry;
        const cooldown=Math.max(
          0,
          Number(module.dropCooldown)||
          Number(carry?.dropCooldown)||0
        );
        const dropped=this.dropCarry(
          source,
          stateKey,
          Math.max(0,Number(carry?.pickupCooldown)||0),
          now
        );
        if(dropped){
          source.cooldowns.set(attack.id,now+cooldown);
          source.lastAttackTime=now;
        }
        context.handled=true;
        return dropped;
      }

      if(module.activeCommand){
        if(
          module.activeCommand.type===
          'mode-tap-command'
        ){
          return this.modeTapCommand(
            context,
            stateKey,
            module.activeCommand
          );
        }

        return this.command(
          context,
          stateKey,
          module.activeCommand
        );
      }

      if(
        (source.cooldowns.get(attack.id)||0)>now
      ){
        context.handled=true;
        return false;
      }

      this.recall(
        source,
        stateKey
      );
      source.cooldowns.set(
        attack.id,
        now+
        Math.max(
          0,
          Number(module.recallCooldown)||0
        )
      );
      source.lastAttackTime=now;
      context.handled=true;
      return true;
    }

    if(state.destroyedUntil>now){
      context.handled=true;
      return false;
    }

    if(
      !this.deployCost(
        source,
        attack,
        now
      )
    ){
      context.handled=true;
      return false;
    }

    const placeDistance=Math.max(0,Number(module.placeDistance)||0);
    const aimPoint=
      module.placementTarget==='aim-point'&&
      context.targetPoint&&
      Number.isFinite(Number(context.targetPoint.x))&&
      Number.isFinite(Number(context.targetPoint.y))
        ?{
          x:Number(context.targetPoint.x),
          y:Number(context.targetPoint.y)
        }
        :null;
    const aimDx=aimPoint
      ?aimPoint.x-(Number(source.x)||0)
      :0;
    const aimDy=aimPoint
      ?aimPoint.y-(Number(source.y)||0)
      :0;
    const aimDistance=Math.hypot(aimDx,aimDy);
    const maxPlaceDistance=Math.max(
      0,
      Number(module.maxPlaceDistance)||placeDistance
    );
    const clampedAimDistance=
      maxPlaceDistance>0
        ?Math.min(maxPlaceDistance,aimDistance)
        :aimDistance;
    const placementAngle=
      aimPoint&&aimDistance>.001
        ?Math.atan2(aimDy,aimDx)
        :Number(context.angle)||0;
    const deployed=this.spawn(
      source,
      stateKey,
      {
        x:(Number(source.x)||0)+Math.cos(placementAngle)*(
          aimPoint?clampedAimDistance:placeDistance
        ),
        y:(Number(source.y)||0)+Math.sin(placementAngle)*(
          aimPoint?clampedAimDistance:placeDistance
        )
      }
    );
    if(
      deployed&&
      module.recipientSelection
    ){
      this.assignRecipient(
        source,
        state,
        module.recipientSelection,
        context,
        deployed
      );
    }

    const deployAttackId=String(module.deployAttackId||'');
    if(deployed&&deployAttackId){
      const baseAttack=AbilityService.attackById(source.character,deployAttackId);
      if(baseAttack){
        TriggeredAttackService.execute(
          deployed,
          AugmentService.prepareAttack(deployed,baseAttack,now),
          Number(context.angle)||0
        );
      }
    }
    context.handled=true;
    return true;
  },
  spawnFromAttack(source,module,angle,execution=null){
    if(!source?.alive)return null;
    const stateKey=String(module?.stateKey||'');
    const spec=this.spec(source,stateKey);
    if(!spec)return null;

    const state=this.state(source,stateKey,true);
    if(!state)return null;

    if(
      module.requireActive===true&&
      state.active!==true
    ){
      return null;
    }

    let preservedReplacementHealth=false;
    if(state.active&&module.replaceActive===true){
      preservedReplacementHealth=module.preserveHealthOnReplace===true;
      this.recall(source,stateKey);
      if(!preservedReplacementHealth){
        state.health=Math.max(1,Number(spec.maxHealth)||1);
      }
      state.destroyedUntil=0;
      state.destroyedAt=0;
    }else if(state.active){
      return this.entity(source,stateKey);
    }

    const distance=Math.max(0,Number(module.placeDistance)||0);
    const executionPoint=
      module.position==='impact-point'
        ?(
          execution?.projectileImpactPoint||
          execution?.targetPoint||
          null
        )
        :null;
    const hasExecutionPoint=
      executionPoint&&
      Number.isFinite(Number(executionPoint.x))&&
      Number.isFinite(Number(executionPoint.y));
    const x=hasExecutionPoint
      ?Number(executionPoint.x)
      :(Number(source.x)||0)+Math.cos(Number(angle)||0)*distance;
    const y=hasExecutionPoint
      ?Number(executionPoint.y)
      :(Number(source.y)||0)+Math.sin(Number(angle)||0)*distance;
    if(!preservedReplacementHealth){
      state.health=Math.max(1,Number(spec.maxHealth)||1);
    }
    state.destroyedUntil=0;

    const sourceRangeCheck=Math.max(0,Number(module.sourceRangeCheck)||0);
    const sourceInRange=
      sourceRangeCheck>0&&
      Math.hypot(
        (Number(source.x)||0)-x,
        (Number(source.y)||0)-y
      )<=sourceRangeCheck;
    const spawnEffectColor=
      sourceInRange
        ?module.spawnEffectColorInRange
        :module.spawnEffectColorOutOfRange;
    const spawnEffectSound=
      sourceInRange
        ?module.spawnEffectSoundInRange
        :module.spawnEffectSoundOutOfRange;

    return this.spawn(
      source,
      stateKey,
      {
        x,y,
        force:true,
        executionSequence:Number(execution?.sequence)||0,
        spawnEffectColor,
        spawnEffectSound,
        spawnEffectSoundLocalOnly:
          module.spawnEffectSoundLocalOnly===true
      }
    );
  },
  proximityAttack(
    source,
    nearAttack,
    farAttack,
    angle
  ){
    if(!nearAttack||!farAttack)return null;

    const preparedNear=
      AugmentService.prepareAttack(
        source,
        nearAttack,
        performance.now()
      );
    const module=
      AttackModuleService.module(
        preparedNear,
        'delivery.area'
      );
    if(!module)return farAttack;

    const effective=
      HitScanGeometryService.effectiveModule(
        source,
        preparedNear,
        module,
        angle
      );

    const areaGeometry=
      effective.shape==='circle'||effective.shape==='sector'
        ?AreaGeometryService.polygon(source,effective,angle)
        :null;
    let hasNear=false;

    EntityService.forEachEnemy(
      source,
      target=>{
        if(hasNear)return;

        const point=
          NetworkCollisionPositionService.point(
            target
          );

        if(
          AreaAttackService.containsPoint(
            effective,
            source,
            point.x,
            point.y,
            target.radius,
            angle,
            areaGeometry
          )
        ){
          hasNear=true;
        }
      },
      preparedNear
    );

    return hasNear
      ?nearAttack
      :farAttack;
  },
  updateLifecycle(owner,stateKey,state,spec,now){
    if(!EntitySimulationAuthorityService.isLocal(owner))return;
    const maxHealth=Math.max(1,Number(spec.maxHealth)||1);

    if(
      state.destroyedUntil>0&&
      now>=state.destroyedUntil
    ){
      state.destroyedUntil=0;
      state.destroyedAt=0;
      state.health=Math.max(
        1,
        Math.min(
          maxHealth,
          Number(spec.respawnHealth)||maxHealth
        )
      );
      state.readyFlashUntil=now+500;
      state.nextStoredRegenAt=now;
      state.storedNaturalRegenReadyAt=now;
    }

    if(
      state.active||
      state.destroyedUntil>now||
      spec.storedNaturalRegen!==true||
      state.health<=0||
      state.health>=maxHealth
    )return;

    const policy=spec.healthRegenPolicy||owner.healthRegenPolicy||GAME_DATA.healthRegen;
    if(!policy)return;

    const tick=Math.max(1,Number(policy.tick)||1000);
    if(!(state.nextStoredRegenAt>0)){
      state.nextStoredRegenAt=now+tick;
      if(!(state.storedNaturalRegenReadyAt>0)){
        state.storedNaturalRegenReadyAt=
          state.nextStoredRegenAt;
      }
    }

    let guard=0;
    while(now>=state.nextStoredRegenAt&&state.health<maxHealth&&guard<8){
      state.health=Math.min(
        maxHealth,
        ResourceValueService.round(
          state.health+maxHealth*Math.max(0,Number(policy.ratio)||0),
          state.health
        )
      );
      state.nextStoredRegenAt+=tick;
      guard++;
    }
  },
  updateAura(
    owner,
    stateKey,
    state,
    spec,
    now,
    frameScale=1
  ){
    if(!state.active)return;

    const entity=this.entity(
      owner,
      stateKey
    );
    if(!entity)return;

    if(
      entity.alive===false||
      entity.health<=0
    ){
      this.clearField(
        owner,
        stateKey,
        spec
      );

      if(
        EntitySimulationAuthorityService
          .isLocal(entity)
      ){
        this.destroy(
          owner,
          stateKey,
          now
        );
      }
      return;
    }

    entity.teamId=owner.teamId;

    if(
      !EntitySimulationAuthorityService
        .isLocal(entity)&&
      Number.isFinite(
        Number(entity._remoteSummonTargetX)
      )&&
      Number.isFinite(
        Number(entity._remoteSummonTargetY)
      )
    ){
      const targetX=
        Number(entity._remoteSummonTargetX);
      const targetY=
        Number(entity._remoteSummonTargetY);
      const dx=targetX-Number(entity.x);
      const dy=targetY-Number(entity.y);
      const distance=Math.hypot(dx,dy);

      if(distance>180){
        entity.x=targetX;
        entity.y=targetY;
      }else{
        const blend=
          1-
          Math.pow(
            .68,
            Math.max(
              .25,
              Number(frameScale)||1
            )
          );
        entity.x+=dx*blend;
        entity.y+=dy*blend;
      }
    }

    if(
      this.updateLeash(
        owner,stateKey,state,spec,entity,now
      )
    )return;

    this.updateHealthDecay(
      owner,stateKey,state,spec,entity,now
    );
    if(!entity.alive||entity.health<=0){
      this.destroy(owner,stateKey,now);
      return;
    }

    const carrying=this.updateCarry(
      owner,stateKey,state,spec,entity,now
    );

    state.health=entity.health;
    state.x=entity.x;
    state.y=entity.y;

    const field=spec.fieldArea;
    if(field){
      const modeStateKey=
        String(
          spec.modeState?.stateKey||
          ''
        );
      const currentMode=
        modeStateKey
          ?ModeStateService.current(
            owner,
            modeStateKey,
            String(
              spec.modeState?.initial||
              ''
            )
          )
          :'';
      const requiredMode=
        String(field.whenMode||'');
      const fieldEnabled=
        !requiredMode||
        currentMode===requiredMode;
      const fieldStateKey=
        field.stateKey||
        `summon-field:${stateKey}`;

      if(fieldEnabled){
        const preparedField={
          ...AugmentService.prepareRangeField(
            entity,
            field,
            now
          ),
          stateKey:fieldStateKey
        };
        const anchor=
          field.anchorTarget==='owner'
            ?owner
            :entity;

        InstalledAreaFieldService.ensureAttached(
          owner,
          preparedField,
          anchor,
          now
        );
      }else{
        InstalledAreaFieldService.clear(
          owner,
          fieldStateKey
        );
      }
    }

    // 소환수도 플레이어/봇/더미와 동일한 forcedMotion 수명을 사용한다.
    // 피격 넉백이 만들어진 경우 먼저 실제 강제이동을 소모하고,
    // 강제이동이 끝난 다음 프레임부터 AI가 정상 재개된다.
    if(entity.forcedMotion){
      MovementService.updateForced(
        entity,
        now,
        frameScale
      );
    }

    if(!carrying){
      SummonAIService.update(
        entity,
        owner,
        spec,
        now,
        frameScale
      );
    }
  },

  update(
    now=performance.now(),
    frameScale=1
  ){
    const resolvedFrameScale=
      Math.max(
        0,
        Number(frameScale)||0
      );
    for(const owner of EntityService.items.values()){
      if(
        owner?.kind!=='player'||
        !owner.actionState
      )continue;

      for(const state of owner.actionState.values()){
        if(state?.kind!==this.stateKind)continue;

        const spec=this.specFor(
          owner,
          state.stateKey,
          state
        );
        if(!spec)continue;

        this.updateLifecycle(
          owner,
          state.stateKey,
          state,
          spec,
          now
        );

        this.updateAura(
          owner,
          state.stateKey,
          state,
          spec,
          now,
          resolvedFrameScale
        );
      }
    }
  },
  serialize(owner,now=performance.now()){
    const result=[];

    if(!owner?.actionState)return result;

    for(const state of owner.actionState.values()){
      if(state?.kind!==this.stateKind)continue;

      const spec=this.specFor(
        owner,
        state.stateKey,
        state
      );
      if(!spec)continue;

      const entity=state.active
        ?this.entity(
          owner,
          state.stateKey
        )
        :null;

      result.push({
        stateKey:state.stateKey,
        active:state.active===true,
        health:
          entity
            ?Math.max(0,Number(entity.health)||0)
            :Math.max(0,Number(state.health)||0),
        x:
          entity
            ?Number(entity.x)||0
            :Number(state.x)||0,
        y:
          entity
            ?Number(entity.y)||0
            :Number(state.y)||0,
        carrying:state.carrying===true,
        recipientEntityId:
          String(
            state.recipientEntityId||''
          ),
        modeValue:
          spec.modeState?.stateKey
            ?ModeStateService.current(
              owner,
              String(spec.modeState.stateKey),
              String(spec.modeState.initial||'')
            )
            :null,
        destroyedRemaining:
          Math.max(
            0,
            Number(state.destroyedUntil)-
            now
          ),
        naturalRegenReadyRemaining:
          entity?.healthRegenPolicy
            ?Math.max(
              0,
              NaturalHealthRegenActivityService.latest(entity)+
              Math.max(0,Number(entity.healthRegenPolicy.idle)||0)*
              Math.max(0,CombatStatsService.current(entity,now).regenDelayMult)-
              now
            )
            :0,
        naturalRegenReady:
          !!entity?.healthRegenPolicy&&
          now>=(
            NaturalHealthRegenActivityService.latest(entity)+
            Math.max(0,Number(entity.healthRegenPolicy.idle)||0)*
            Math.max(0,CombatStatsService.current(entity,now).regenDelayMult)
          ),
        combatSnapshot:
          entity
            ?NetworkCombatSnapshotService
              .serialize(
                entity,
                now
              )
            :null
      });
    }

    return result;
  },
  applyRemote(owner,snapshots,now=performance.now()){
    if(!owner||!Array.isArray(snapshots)){
      return false;
    }

    for(const snapshot of snapshots){
      const stateKey=String(
        snapshot?.stateKey||''
      );

      let state=this.state(
        owner,
        stateKey,
        false
      );

      if(!state){
        state=this.state(
          owner,
          stateKey,
          true
        );
      }

      const spec=this.specFor(
        owner,
        stateKey,
        state
      );
      if(!spec||!state)continue;

      state.health=Math.max(
        0,
        Number(snapshot.health)||0
      );
      state.x=Number(snapshot.x)||owner.x;
      state.y=Number(snapshot.y)||owner.y;
      state.carrying=snapshot.carrying===true;
      state.recipientEntityId=
        String(
          snapshot.recipientEntityId||''
        );
      if(
        spec.modeState?.stateKey&&
        snapshot.modeValue!==null&&
        snapshot.modeValue!==undefined
      ){
        ModeStateService.set(
          owner,
          String(spec.modeState.stateKey),
          String(snapshot.modeValue),
          String(spec.modeState.initial||'')
        );
      }
      const destroyedRemaining=
        Math.max(
          0,
          Number(
            snapshot.destroyedRemaining
          )||0
        );
      state.destroyedUntil=
        destroyedRemaining>0
          ?now+destroyedRemaining
          :0;

      if(snapshot.active===true){
        let entity=this.entity(
          owner,
          stateKey
        );

        if(!entity){
          entity=this.spawn(
            owner,
            stateKey,
            {
              x:state.x,
              y:state.y,
              force:true
            }
          );
        }

        if(entity){
          if(
            EntitySimulationAuthorityService
              .isLocal(entity)
          ){
            entity.x=state.x;
            entity.y=state.y;
          }else if(
            !entity._remoteSummonStateReady
          ){
            entity.x=state.x;
            entity.y=state.y;
            entity._remoteSummonStateReady=true;
          }

          entity._remoteSummonTargetX=state.x;
          entity._remoteSummonTargetY=state.y;
          entity._remoteSummonTargetAt=now;

          entity.health=Math.max(
            0,
            Math.min(
              entity.maxHealth,
              state.health
            )
          );
          entity.alive=entity.health>0;
          entity.hidden=!entity.alive;

          entity._networkNaturalRegenReady=
            snapshot.naturalRegenReady===true;
          entity._networkNaturalRegenReadyAt=
            entity._networkNaturalRegenReady
              ?now
              :now+Math.max(
                0,
                Number(snapshot.naturalRegenReadyRemaining)||0
              );

          if(snapshot.combatSnapshot){
            NetworkCombatSnapshotService
              .apply(
                entity,
                snapshot.combatSnapshot,
                now
              );
          }

          state.active=entity.alive;
        }
      }else{
        const entity=this.entity(
          owner,
          stateKey
        );
        if(entity){
          EntityService.items.delete(
            entity.id
          );
        }
        state.active=false;
      }
    }

    return true;
  },
  isCarriedEntity(entity){
    if(entity?.kind!=='summon'||!entity.summonStateKey)return false;
    const owner=EntityService.owner(entity);
    const state=this.state(owner,entity.summonStateKey,false);
    return state?.active===true&&state.carrying===true;
  },

  storedNaturalRegenProgress(
    owner,
    state,
    spec,
    now=performance.now()
  ){
    if(
      !owner||
      !state||
      !spec||
      spec.storedNaturalRegen!==true
    )return null;

    const maxHealth=
      Math.max(
        1,
        Number(spec.maxHealth)||1
      );
    const health=Number(state.health)||0;
    if(health<=0||health>=maxHealth)return null;

    const policy=
      spec.healthRegenPolicy||
      owner.healthRegenPolicy||
      GAME_DATA.healthRegen;
    if(!policy)return null;

    const readyAt=
      Number(
        state.storedNaturalRegenReadyAt
      )||0;

    if(readyAt>0&&now>=readyAt){
      return 1;
    }

    const stats=
      CombatStatsService.current(
        owner,
        now
      );
    const idle=
      Math.max(
        0,
        Number(policy.idle)||0
      )*
      Math.max(
        0,
        Number(stats.regenDelayMult)||0
      );

    if(idle<=0)return 1;
    if(!(readyAt>0))return 0;

    return Math.max(
      0,
      Math.min(
        1,
        1-(readyAt-now)/idle
      )
    );
  },

  drawStoredHealthBars(ctx,owner,baseY,now){
    if(!ctx||!owner?.actionState)return 0;

    const width=WorldGaugeBarPresentationService.width;
    const height=WorldGaugeBarPresentationService.height;
    const gap=WorldGaugeBarPresentationService.gap;
    const color=
      Training.sessionMode==='online'
        ?TeamColorPresentationService.colorForEntity(owner,owner.color||'#4af')
        :owner.color||'#4af';
    let y=baseY;
    let count=0;

    ctx.save();
    for(const state of owner.actionState.values()){
      if(
        state?.kind!==this.stateKind||
        state.destroyedUntil>now||
        state.health<=0
      )continue;

      const spec=this.spec(owner,state.stateKey);
      if(!spec)continue;

      const carried=state.active===true&&state.carrying===true;
      const stored=
        state.active!==true&&
        (
          spec.storedNaturalRegen===true||
          spec.storedHealthBar===true
        );
      if(!carried&&!stored)continue;

      const entity=carried
        ?this.entity(owner,state.stateKey)
        :null;
      const maxHealth=Math.max(1,Number(entity?.maxHealth)||Number(spec.maxHealth)||1);
      const health=Math.max(0,Number(entity?.health??state.health)||0);
      const ratio=Math.max(0,Math.min(1,health/maxHealth));
      const barX=owner.x-width/2;
      WorldGaugeBarPresentationService.render(
        ctx,
        {
          x:barX,
          y,
          progress:ratio,
          color,
          background:'#111'
        }
      );

      const regenProgress=
        DisplaySettings.state.naturalRegenTimer
          ?(
            carried&&entity
              ?NaturalHealthRegenGaugePresentationService.progress(entity,now)
              :this.storedNaturalRegenProgress(
                owner,
                state,
                spec,
                now
              )
          )
          :null;
      if(regenProgress!==null){
        ctx.fillStyle='rgba(0,0,0,.72)';
        ctx.fillRect(
          barX,
          y+height+2,
          width,
          2
        );
        ctx.fillStyle='rgba(255,255,255,.92)';
        ctx.fillRect(
          barX,
          y+height+2,
          width*regenProgress,
          2
        );
      }

      y+=height+gap;
      count++;
    }
    ctx.restore();
    return count;
  },
  cooldownProgress(owner,stateKey,now=performance.now()){
    const state=this.state(owner,stateKey,false);
    const spec=this.specFor(owner,stateKey,state);

    if(
      !spec||
      !state||
      state.destroyedUntil<=now
    )return null;

    const duration=Math.max(
      1,
      Number(spec.respawnDelay)||1
    );
    const remaining=Math.max(
      0,
      state.destroyedUntil-now
    );

    return {
      remaining,
      progress:
        1-
        Math.min(
          1,
          remaining/duration
        )
    };
  },
  drawCooldown(ctx,owner,now){
    if(
      !ctx||
      !owner?.actionState||
      !duels3CanViewTeamGauge(owner)
    )return;

    for(const state of owner.actionState.values()){
      if(state?.kind!==this.stateKind)continue;
      const stateKey=String(state.stateKey||'');
      if(!stateKey)continue;

      /*
        파괴 대기시간 자체는 비활성 캐릭터 중에도 계속 흐른다.
        다만 월드 재사용 호 게이지는 현재 태그된 캐릭터가 실제로 가진
        소환수에 대해서만 표시한다. 복귀 즉시 기존 destroyedUntil의
        남은 시간으로 이어서 그려진다.
      */
      if(!this.spec(owner,stateKey))continue;

      const gauge=
        this.cooldownProgress(
          owner,
          stateKey,
          now
        );

      if(gauge){
        ArcGaugePresentationService.render(
          ctx,
          owner,
          gauge.progress,
          {
            color:owner.color,
            lineWidth:
              EntityRingLayoutService
                .WIDTHS.gauge,
            lineCap:'butt',
            radius:
              EntityRingLayoutService
                .chargeRadius(owner)
          }
        );
        continue;
      }

      if(
        Number(state.readyFlashUntil)>now
      ){
        ArcGaugePresentationService.render(
          ctx,
          owner,
          1,
          {
            color:owner.color,
            lineWidth:
              EntityRingLayoutService
                .WIDTHS.gauge,
            lineCap:'butt',
            radius:
              EntityRingLayoutService
                .chargeRadius(owner),
            maxChargeFlash:true,
            completePulseRadius:EntityRingLayoutService.maxChargeFlashRadius(
              owner,
              now
            ),
            hideArcAtComplete:false
          }
        );
      }
    }
  },
  drawRange(ctx,entity,now){
    return SummonVisualPresentationService.range(ctx,entity,now);
  },
  drawBody(ctx,entity,now){
    return SummonVisualPresentationService.body(ctx,entity,now);
  }
});