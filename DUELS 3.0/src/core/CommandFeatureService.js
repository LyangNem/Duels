

const CommandFeatureService={
  commandMap:Object.freeze({
    '/laser':'laser',
    '/cooling':'cooling',
    '/accelerate':'accelerate',
    '/repair':'repair',
    '/dual':'laser-dual',
    '/pierce':'laser-pierce',
    '/instant':'laser-instant',
    '/wide':'laser-wide',
    '/range':'laser-range',
  }),

  featureEntries:Object.freeze([
    Object.freeze({feature:'laser',label:'LASER'}),
    Object.freeze({feature:'cooling',label:'COOLING'}),
    Object.freeze({feature:'accelerate',label:'ACCELERATE'}),
    Object.freeze({feature:'repair',label:'REPAIR',oneShot:true}),
    Object.freeze({feature:'laser-dual',label:'DUAL'}),
    Object.freeze({feature:'laser-pierce',label:'PIERCE'}),
    Object.freeze({feature:'laser-instant',label:'INSTANT'}),
    Object.freeze({feature:'laser-wide',label:'WIDE'}),
    Object.freeze({feature:'laser-range',label:'RANGE'}),
  ]),

  isCharacter(entity){
    return !!(entity?.character?.commandFeatures&&typeof entity.character.commandFeatures==='object');
  },

  stateKey(feature){
    return `command:${String(feature||'')}`;
  },

  ensure(entity){
    if(!this.isCharacter(entity))return false;
    if(entity._commandFeatureInitialized===true)return true;

    entity._commandFeatureInitialized=true;
    entity._commandOverclock=null;
    StaminaService.set(entity,0);
    return true;
  },
  resetEntity(entity){
    if(!entity)return false;

    if(entity.actionState){
      for(
        const entry of
        this.featureEntries
      ){
        entity.actionState.delete(
          ModeStateService.key(
            this.stateKey(entry.feature)
          )
        );
      }
    }

    BuffService.remove(
      entity,
      'speed',
      'command-feature:accelerate'
    );
    BuffService.remove(
      entity,
      'attackRate',
      'command-feature:overclock'
    );

    this.cancelCoolingWindup(entity);
    this.stopRapidCooling(entity);
    entity._commandOverclock=null;
    entity._commandFeatureInitialized=false;
    entity.lastStaminaUse=0;
    return true;
  },


  has(entity,feature){
    return ModeStateService.current(
      entity,
      this.stateKey(feature),
      'inactive'
    )==='active';
  },

  networkSnapshot(entity){
    if(!this.isCharacter(entity))return null;
    const active=[];
    for(const entry of this.featureEntries){
      if(
        entry.oneShot===true||
        entry.feature==='repair'
      )continue;
      if(this.has(entity,entry.feature)){
        active.push(String(entry.feature));
      }
    }
    return active;
  },

  applyNetworkSnapshot(entity,snapshot){
    if(
      !this.isCharacter(entity)||
      !Array.isArray(snapshot)
    )return false;

    const active=new Set(
      snapshot.map(value=>String(value||''))
    );
    for(const entry of this.featureEntries){
      const feature=String(entry.feature||'');
      if(
        !feature||
        entry.oneShot===true||
        feature==='repair'
      )continue;

      const shouldBeActive=active.has(feature);
      const currentlyActive=this.has(entity,feature);
      if(shouldBeActive===currentlyActive)continue;

      this.setState(
        entity,
        feature,
        shouldBeActive,
        {network:true}
      );
    }
    return true;
  },

  applyFeatureSideEffects(
    entity,
    feature,
    active
  ){
    const enabled=active===true;

    if(feature==='accelerate'){
      if(enabled){
        BuffService.set(
          entity,
          'speed',
          entity.character.commandFeatures.accelerateSpeed,
          'command-feature:accelerate',
          Infinity,
          {tags:['버프','이동속도']}
        );
      }else{
        BuffService.remove(
          entity,
          'speed',
          'command-feature:accelerate'
        );
      }
    }

    return true;
  },

  runRepair(entity,now=performance.now()){
    if(!this.ensure(entity))return false;

    const ratio=
      Math.max(
        0,
        Math.min(
          1,
          Number(
            entity.character?.commandRepair
              ?.missingHealthRatio
          )||0
        )
      );
    const missing=
      Math.max(
        0,
        (Number(entity.maxHealth)||0)-
        (Number(entity.health)||0)
      );
    if(ratio<=0||missing<=0)return true;

    ResourceRestoreEffectService.apply({
      source:entity,
      target:entity,
      module:{type:'resource.restore',resource:'health',recipient:'source',missingResourceRatio:ratio,applyHealingModifier:false}
    });
    return true;
  },

  setState(
    entity,
    feature,
    active=true,
    {network=false}={}
  ){
    if(
      !this.ensure(entity)||
      !feature||
      feature==='repair'
    )return false;

    const key=this.stateKey(feature);

    ModeStateService.set(
      entity,
      key,
      active===true?'active':'inactive',
      'inactive'
    );

    this.applyFeatureSideEffects(
      entity,
      String(feature),
      active===true
    );

    if(network!==true){
      GameplayFeatureStateSyncService.send(
        entity,
        'command',
        String(feature),
        active===true
      );
    }

    return true;
  },

  toggle(entity,feature,options={}){
    if(feature==='repair'){
      return this.runRepair(entity);
    }

    return this.setState(
      entity,
      feature,
      !this.has(entity,feature),
      options
    );
  },

  activate(
    entity,
    command,
    {network=false}={}
  ){
    if(!this.ensure(entity)){
      return {
        ok:false,
        status:'error',
        feature:''
      };
    }

    const normalized=
      String(command||'')
        .trim()
        .replace(/\s+/g,' ')
        .toLowerCase();

    const feature=
      this.commandMap[normalized]||'';

    if(!feature){
      return {
        ok:false,
        status:'error',
        feature:''
      };
    }

    if(feature==='repair'){
      const ok=this.runRepair(entity);
      return {
        ok,
        status:ok?'ok':'error',
        feature
      };
    }

    if(this.has(entity,feature)){
      return {
        ok:true,
        status:'already',
        feature
      };
    }

    this.setState(
      entity,
      feature,
      true,
      {network}
    );

    return {
      ok:true,
      status:'ok',
      feature
    };
  },

  applyRemote(entity,feature,active=true){
    if(!this.isCharacter(entity))return false;

    if(feature==='repair'){
      return this.runRepair(entity);
    }

    return this.setState(
      entity,
      String(feature||''),
      active!==false,
      {network:true}
    );
  },

  blocksNaturalStaminaRegen(entity){
    return this.isCharacter(entity);
  },

  coolingBlocked(
    entity,
    now=performance.now()
  ){
    return (
      CombatStatsService
        .current(entity,now)
        .staminaRegenBlocked===true
    );
  },

  actionGainBase(entity){
    return Math.max(
      0,
      Number(
        entity?.character?.staminaGainPerAction
      )||0
    );
  },

  actionGainMultiplier(
    entity,
    attack,
    now=performance.now()
  ){
    if(!attack)return 1;

    const useMultiplier=
      Math.max(
        0,
        Number(
          AugmentService.attackCostMultiplier(
            entity,
            attack,
            now
          )
        )||0
      );

    // 사용량 -30%(.70) => 충전량 +30%(1.30)
    // 사용량 +30%(1.30) => 충전량 -30%(.70)
    return Math.max(
      0,
      2-useMultiplier
    );
  },

  canChargeAction(entity){
    if(!this.ensure(entity))return false;
    ResourceValueService.normalizeStamina(entity);
    return (
      Number(entity.stamina)||0
    )<
    (
      Number(entity.maxStamina)||0
    )-1e-6;
  },

  onAction(
    entity,
    attack=null,
    now=performance.now()
  ){
    if(!this.ensure(entity))return false;
    if(entity._commandOverclock?.active===true)return false;
    if(
      attack?.tags?.includes?.(
        '행동충전제외'
      )
    )return false;
    if(!this.canChargeAction(entity))return false;

    const amount=
      this.actionGainBase(entity)*
      this.actionGainMultiplier(
        entity,
        attack,
        now
      );

    ResourceRestoreEffectService.apply({
      source:entity,
      target:entity,
      module:{type:'resource.restore',resource:'stamina',recipient:'source',amount},
      now
    });
    return true;
  },

  startOverclock(
    entity,
    module,
    now=performance.now()
  ){
    if(!this.ensure(entity))return false;
    if(!this.canChargeAction(entity))return false;

    entity._commandOverclock={
      active:true,
      startedAt:now,
      gainPerSecond:
        Math.max(
          0,
          Number(module?.gainPerSecond??entity.character.commandFeatures.overclock.gainPerSecond)
        )
    };

    BuffService.set(
      entity,
      'attackRate',
      Math.max(
        0,
        Number(module?.attackRate??entity.character.commandFeatures.overclock.attackRate)
      ),
      'command-feature:overclock',
      Infinity,
      {tags:['버프','공격속도']}
    );

    return true;
  },

  cancelCoolingWindup(entity){
    if(!entity?.actionState)return false;

    const state=
      entity.actionState.get(
        'command:cooling-windup'
      );
    if(state?.kind!=='cooling-windup'){
      return false;
    }

    entity.actionState.delete(
      'command:cooling-windup'
    );
    entity._coolingWindupToken=
      (Number(entity._coolingWindupToken)||0)+1;
    entity.attackPreview=null;

    CCService.removeSource(
      entity,
      'stun',
      'command-feature:cooling-stun'
    );

    return true;
  },

  coolingInterrupted(
    entity,
    now=performance.now()
  ){
    if(
      entity?.actionState?.get?.(
        'command:cooling-windup'
      )?.kind!=='cooling-windup'
    )return false;

    for(
      const type of
      ['stun','revive','neutralize','freeze','sleep']
    ){
      for(
        const status of
        CCService.live(entity,type,now)
      ){
        if(status.end<=now)continue;
        if(
          type==='stun'&&
          status.sourceId===
            'command-feature:cooling-stun'
        )continue;
        return true;
      }
    }

    return false;
  },

  rapidCoolingState(entity){
    const state=
      entity?.actionState?.get?.(
        'command:rapid-cooling'
      )||null;
    return state?.kind==='command-rapid-cooling'
      ?state
      :null;
  },

  refreshRapidCoolingProtection(
    entity,
    state,
    now=performance.now()
  ){
    if(!entity||!state)return false;

    if(state.invulnerable===true){
      BuffService.refresh(
        entity,
        'invulnerable',
        1,
        'command-feature:rapid-cooling',
        entity.character.commandFeatures.protectionRefreshMs,
        {presentation:{opacity:entity.character.commandFeatures.protectionOpacity}}
      );
    }else{
      BuffService.remove(
        entity,
        'invulnerable',
        'command-feature:rapid-cooling'
      );
    }

    CombatStatusApplicationService.apply({
      source:entity,
      target:entity,
      type:'stun',
      duration:entity.character.commandFeatures.protectionRefreshMs,
      sourceId:'command-feature:rapid-cooling',
      data:{
        stackMode:'replace-source',
        sourceEntityId:entity.id,
        presentationAppliedAt:now
      }
    });
    return true;
  },

  stopRapidCooling(
    entity,
    now=performance.now()
  ){
    const state=this.rapidCoolingState(entity);
    if(!state)return false;

    entity.actionState.delete(
      'command:rapid-cooling'
    );
    BuffService.remove(
      entity,
      'invulnerable',
      'command-feature:rapid-cooling'
    );
    CCService.removeSource(
      entity,
      'stun',
      'command-feature:rapid-cooling'
    );
    return true;
  },

  startRapidCooling(
    entity,
    module,
    now=performance.now()
  ){
    if(!this.ensure(entity))return false;

    const startStamina=
      Math.max(
        0,
        Number(entity.stamina)||0
      );
    const duration=
      Math.max(
        1,
        Number(module?.duration??entity.character.commandFeatures.rapidCoolingDuration)
      );

    // 스테미나 0에서는 반격 공격만 실행하고
    // 급속 냉각의 자기 기절/무적/감소 상태는 만들지 않는다.
    if(startStamina<=0){
      return true;
    }

    const state={
      kind:'command-rapid-cooling',
      stateKey:String(
        module?.stateKey||
        'command:rapid-cooling'
      ),
      active:true,
      startedAt:now,
      endsAt:now+duration,
      duration,
      startStamina,
      invulnerable:startStamina>0
    };
    entity.actionState.set(
      'command:rapid-cooling',
      state
    );
    this.refreshRapidCoolingProtection(
      entity,
      state,
      now
    );
    return true;
  },

  update(
    entity,
    dt,
    now=performance.now()
  ){
    if(!this.ensure(entity))return false;

    if(this.coolingInterrupted(entity,now)){
      this.cancelCoolingWindup(entity);
    }

    if(
      this.has(entity,'cooling')&&
      entity._commandOverclock?.active!==true&&
      !this.rapidCoolingState(entity)&&
      !this.coolingBlocked(entity,now)&&
      entity.stamina>0
    ){
      StaminaService.set(
        entity,
        Math.max(
          0,
          (Number(entity.stamina)||0)-
          entity.character.commandFeatures.coolingPerSecond*
          (
            Math.max(
              0,
              Number(dt)||0
            )/1000
          )
        ),
        now
      );
    }

    const rapidCooling=
      this.rapidCoolingState(entity);

    if(rapidCooling){
      const duration=
        Math.max(
          1,
          Number(rapidCooling.duration??entity.character.commandFeatures.rapidCoolingDuration)
        );
      const remainingRatio=
        Math.max(
          0,
          Math.min(
            1,
            (
              Number(rapidCooling.endsAt)-
              now
            )/
            duration
          )
        );

      this.refreshRapidCoolingProtection(
        entity,
        rapidCooling,
        now
      );

      if(
        EntitySimulationAuthorityService
          .isLocal(entity)
      ){
        StaminaService.set(
          entity,
          Math.max(
            0,
            Number(rapidCooling.startStamina)||0
          )*
          remainingRatio,
          now
        );
      }

      if(
        now>=Number(rapidCooling.endsAt)
      ){
        if(
          EntitySimulationAuthorityService
            .isLocal(entity)
        ){
          StaminaService.set(
            entity,
            0,
            now
          );
        }
        this.stopRapidCooling(
          entity,
          now
        );
      }
    }

    const overclock=
      entity._commandOverclock;

    if(overclock?.active===true){
      const gain=
        Math.max(
          0,
          Number(overclock.gainPerSecond??entity.character.commandFeatures.overclock.gainPerSecond)
        )*
        (
          Math.max(
            0,
            Number(dt)||0
          )/1000
        );

      ResourceRestoreEffectService.apply({
        source:entity,
        target:entity,
        module:{type:'resource.restore',resource:'stamina',recipient:'source',amount:gain},
        now
      });

      if(
        (Number(entity.stamina)||0)>=
        (Number(entity.maxStamina)||0)-1e-6
      ){
        StaminaService.set(
          entity,
          Math.max(
            0,
            Number(entity.maxStamina)||0
          ),
          now
        );
        overclock.active=false;
        BuffService.remove(
          entity,
          'attackRate',
          'command-feature:overclock'
        );
      }
    }

    return true;
  },

  beginCooling(context,module){
  const source=context?.source;

  if(!this.ensure(source))return false;

  const now=
    Number(context.now)||
    performance.now();
  const attack=context.attack;

  const prepared=
    AugmentService.prepareAttack(
      source,
      attack,
      now
    );

  if(
    !AttackService.cooldownReady(
      source,
      prepared,
      now
    )
  )return false;

  source.cooldowns.set(
    prepared.id,
    now+
    Math.max(
      0,
      Number(prepared.cd)||0
    )
  );
  source.lastAttackTime=now;

  // 냉각은 비용도 충전도 없는 순수 0 변화 스킬이다.

  CombatStatusApplicationService.apply({
    source,
    target:source,
    type:'stun',
    duration:
      Math.max(
        0,
        Number(module.delay??source.character.commandFeatures.coolingDelay)
      ),
    sourceId:
      'command-feature:cooling-stun',
    data:{
      stackMode:'replace-source'
    }
  });

  const delay=
    Math.max(
      0,
      Number(module.delay??source.character.commandFeatures.coolingDelay)
    );
  const coolingWindupToken=
    (Number(source._coolingWindupToken)||0)+1;
  source._coolingWindupToken=
    coolingWindupToken;
  source.actionState?.set?.(
    'command:cooling-windup',
    {
      kind:'cooling-windup',
      token:coolingWindupToken,
      endsAt:now+delay
    }
  );

  // 냉각은 공격/넉백/범위 FX 없이 선딜 뒤 과열만 감소시킨다.

  const interruptibleWindup=
    AttackWindupService.isTaggedAttack(
      prepared
    );

  SimulationScheduleService
    .scheduleContinuation({
      source,
      at:now+delay,
      interruptibleWindup,
      windupKind:
        interruptibleWindup
          ?'resource-cooling-delay'
          :null,
      continue:()=>{
        if(!source?.alive)return;

        const windupState=
          source.actionState?.get?.(
            'command:cooling-windup'
          );
        if(
          windupState?.kind!=='cooling-windup'||
          Number(windupState.token)!==
            coolingWindupToken
        ){
          return;
        }

        source.actionState.delete(
          'command:cooling-windup'
        );
        source.attackPreview=null;

        EffectSpawnService.spawn(
          {
            type:'areaCircle',
            x:Number(source.x)||0,
            y:Number(source.y)||0,
            entity:source,
            ...source.character.commandFeatures.coolingEffect
          },
          {source}
        );

        const currentStamina=
          Math.max(
            0,
            Number(source.stamina)||0
          );
        const reduction=
          Math.max(
            0,
            Number(source.maxStamina)||0
          )*
          Math.max(
            0,
            Math.min(
              1,
              Number(module.reduceMaxStaminaRatio??source.character.commandFeatures.coolingRatio)
            )
          );

        if(
          !this.coolingBlocked(
            source,
            performance.now()
          )
        ){
          StaminaService.set(
            source,
            Math.max(
              0,
              currentStamina-
              reduction
            )
          );
        }

      }
    });

  context.handled=true;
  context.executed=true;
  context.resolvedAttackId=
    attack.id;

  return true;
  }


};