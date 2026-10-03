


const AttackExecutionService=Object.freeze({
  create(source,attack,angle=0,extraModules=null){
    const execution=this.replica(
      source,
      attack,
      ++source.attackSequence,
      angle,
      extraModules
    );
    this.remember(source,execution);
    return execution;
  },

  remember(source,execution){
    if(!source||!execution)return false;

    const registry=
      source._attackExecutionRegistry||
      (
        source._attackExecutionRegistry=
          new Map()
      );

    registry.set(
      Math.max(
        0,
        Math.floor(
          Number(execution.sequence)||0
        )
      ),
      execution
    );

    while(registry.size>128){
      registry.delete(
        registry.keys().next().value
      );
    }

    return true;
  },

  bySequence(
    source,
    sequence,
    attack=null,
    angle=0
  ){
    if(!source)return null;

    const key=
      Math.max(
        0,
        Math.floor(Number(sequence)||0)
      );
    const existing=
      source._attackExecutionRegistry?.get(
        key
      )||
      null;

    if(existing)return existing;
    if(!attack)return null;

    const execution=this.replica(
      source,
      attack,
      key,
      angle
    );
    this.remember(source,execution);
    return execution;
  },

  replica(
    source,
    attack,
    sequence,
    angle=0,
    extraModules=null
  ){
    const tags=new Set(['공격 실행']);

    for(const tag of TagService.attackTags(attack)){
      tags.add(tag);
    }

    for(const tag of TagService.derivedModuleTags(extraModules)){
      tags.add(tag);
    }

    const resolvedSequence=Math.max(
      0,
      Math.floor(Number(sequence)||0)
    );

    return {
      sequence:resolvedSequence,
      sourceId:source.id,
      attackId:attack.id,
      attack,
      sourceBaseDamageSnapshot:Math.max(0,Number(source?.baseDamage)||0),
      directionAngle:Number(angle)||0,
      koDirectionMode:
        String(
          attack?.koDirectionMode||
          ''
        ),
      extraModules,
      tags,
      hitTargets:new Set(),
      damageByTarget:new Map(),
      incomingDamageSnapshots:new Map(),
      effectKeys:new Set()
    };
  },
  hasHitOn(execution,target){
    return !!(execution&&target&&execution.hitTargets.has(target.id));
  },
  markHitOn(execution,target){
    if(!execution||!target)return false;
    execution.hitTargets.add(target.id);
    return true;
  },
  addDamage(execution,target,amount){
    const value=Math.max(0,Number(amount)||0);
    if(!execution||!target||value<=0)return value;
    const total=(execution.damageByTarget.get(target.id)||0)+value;
    execution.damageByTarget.set(target.id,total);
    return total;
  },
  incomingDamageSnapshot(execution,target,currentStats){
    if(!execution||!target)return currentStats;

    const key=String(target.id||'');
    if(!key)return currentStats;

    let snapshot=execution.incomingDamageSnapshots?.get(key)||null;
    if(snapshot)return snapshot;

    snapshot={
      damageTakenMult:Math.max(
        0,
        Number(currentStats?.damageTakenMult)||0
      )
    };
    execution.incomingDamageSnapshots?.set(key,snapshot);
    return snapshot;
  },
  hasEffect(execution,key){
    return execution?.effectKeys?.has(key)||false;
  },
  markEffect(execution,key){
    execution?.effectKeys?.add(key);
  },
  setImpactOrigin(execution,descriptor){
    if(!execution||!descriptor)return false;
    execution.impactOrigin=descriptor;
    return true;
  },
  setKoOrigin(execution,descriptor){
    if(!execution||!descriptor)return false;
    execution.koOrigin=descriptor;
    return true;
  },
});