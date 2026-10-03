

/* Entity */
const EntityService={
  items:new Map(),
  create(spec={}){
    const entity={
      id:spec.id,
      kind:spec.kind||'entity',
      ownerId:spec.ownerId||spec.id,
      teamId:spec.teamId||spec.id,
      simulationAuthorityPid:
        spec.simulationAuthorityPid||null,
      x:spec.x||0,
      y:spec.y||0,
      baseX:spec.x||0,
      baseY:spec.y||0,
      radius:spec.radius||20,
      color:spec.color||'#888',
      baseMaxHealth:spec.maxHealth||100,
      maxHealth:spec.maxHealth||100,
      health:spec.maxHealth||100,
      shield:Math.max(0,Math.min(spec.maxHealth||100,Number(spec.shield)||0)),
      healthTrailHealth:spec.maxHealth||100,
      healthTrailDelayUntil:0,
      healthPolicy:{
        minimum:Number(spec.healthPolicy?.minimum)||0,
        invulnerable:spec.healthPolicy?.invulnerable===true
      },
      deathPolicy:{
        respawnMs:Math.max(0,Number(spec.deathPolicy?.respawnMs)||0)
      },
      stamina:spec.stamina??0,
      baseMaxStamina:spec.maxStamina??0,
      maxStamina:spec.maxStamina??0,
      speed:spec.speed||0,
      baseDamage:spec.baseDamage||0,
      alive:true,
      hidden:false,
      velocity:{x:0,y:0},
      forcedMotion:null,
      lastMovementInputAngle:null,
      statuses:new Map(),
      buffs:new Map(),
      cooldowns:new Map(),
      abilityPending:new Map(),
      actionState:new Map(),
      wallDeferredAttacks:[],
      augmentDodgeRepeatsLeft:0,
      augmentDodgeRepeatAt:0,
      augmentDodgeEndAt:0,
      augmentDodgeDirectionX:0,
      augmentDodgeDirectionY:0,
      counterReadyCharges:0,
      augments:Array.isArray(spec.augments)?[...spec.augments]:[],
      augmentCache:{counts:new Map(),effects:[]},
      augmentState:{
        lifeUses:new Map(),
        nextCooldownReduction:new Map(),
        effectCooldowns:new Map(),
        augmentAcquiredAt:new Map(),
        counterEmpower:false,
        persistent:new Map(),
        conditionalActive:new Set(),
        defeatProtection:new WeakMap()
      },
      attackSequence:0,
      lastDamageTime:0,
      lastDamageSourcePid:null,
      lastNaturalRegenBlockTime:0,
      nextHealthRegenAt:0,
      healthRegenPolicy:spec.healthRegenPolicy||null,
      lastAttackTime:0,
      buffRegenTickAt:performance.now(),
      combatSnapshotDirty:true,
      respawnAt:0
    };

    this.items.set(entity.id,entity);
    return entity;
  },
  clear(){
    this.items.clear();
  },
  owner(entity){
    return this.items.get(entity?.ownerId)||entity;
  },
  forEachEnemy(entity,visitor,attack=null,targetPolicy=null){
    for(const target of this.items.values()){
      if(
        RelationService.canTarget(
          entity,
          target,
          targetPolicy||{},
          attack
        )
      )visitor(target);
    }
  }
};