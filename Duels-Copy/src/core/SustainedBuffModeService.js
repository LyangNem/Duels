


/* 지속형 능력용 범용 토글 상태.
   버프 자체는 자원 소모 책임을 갖지 않고, 이 상태가 별도로 자원을 소모한다. */
const SustainedBuffModeService=Object.freeze({
  KIND:'sustained-buff-mode',
  state(entity,stateKey){
    const value=entity?.actionState?.get(String(stateKey||''))||null;
    return value?.kind===this.KIND?value:null;
  },
  start(entity,module,now=performance.now()){
    if(!entity?.alive||!entity.actionState)return false;
    const stateKey=String(module.stateKey||'sustain:mode');
    if(this.state(entity,stateKey))return false;
    const maxDuration=Math.max(0,Number(module.maxDuration)||0);
    const buffs=[];
    let index=0;
    for(const entry of module.buffs||[]){
      const type=String(entry?.type||'');
      if(!COMBAT_BUFF_DEFS[type])continue;
      const sourceId=`sustain:${entity.id}:${stateKey}:${index++}:${type}`;
      BuffService.set(
        entity,
        type,
        Number(entry.value)||0,
        sourceId,
        maxDuration>0?maxDuration:Infinity,
        {
          ...(entry.data||{}),
          tags:Array.isArray(entry.tags)
            ?entry.tags
            :TagService.effectTags({type:'modifier.constant',value:Number(entry.value)||0})
        }
      );
      buffs.push({
        type,
        sourceId,
        value:Number(entry.value)||0,
        data:{
          ...(entry.data||{}),
          tags:Array.isArray(entry.tags)
            ?entry.tags
            :TagService.effectTags({type:'modifier.constant',value:Number(entry.value)||0})
        }
      });
    }
    const state={
      kind:this.KIND,
      stateKey,
      startedAt:now,
      lastUpdatedAt:now,
      expiresAt:maxDuration>0?now+maxDuration:Infinity,
      resource:String(module.resource||'stamina'),
      drainPerSecond:Math.max(0,Number(module.drainPerSecond)||0),
      cooldownAttackId:String(module.cooldownAttackId||module.attackId||''),
      cooldownOnStop:Math.max(0,Number(module.cooldownOnStop)||0),
      buffs
    };
    entity.actionState.set(stateKey,state);
    NaturalHealthRegenActivityService.mark(entity,now);
    return true;
  },
  stop(entity,stateKey,now=performance.now()){
    const state=this.state(entity,stateKey);
    if(!state)return false;
    for(const entry of state.buffs||[]){
      BuffService.remove(entity,entry.type,entry.sourceId);
    }
    entity.actionState.delete(state.stateKey);
    if(state.cooldownAttackId&&state.cooldownOnStop>0){
      entity.cooldowns.set(
        state.cooldownAttackId,
        now+state.cooldownOnStop
      );
    }
    MovementService.resolveEmbedded(entity);
    return true;
  },
  toggle(entity,module,now=performance.now()){
    const stateKey=String(module.stateKey||'sustain:mode');
    if(this.state(entity,stateKey)){
      return this.stop(entity,stateKey,now);
    }
    return this.start(entity,module,now);
  },
  update(entity,now=performance.now()){
    if(!entity?.actionState)return false;
    let changed=false;
    for(const state of [...entity.actionState.values()]){
      if(state?.kind!==this.KIND)continue;
      if(!entity.alive||now>=Number(state.expiresAt)){
        this.stop(entity,state.stateKey,now);
        changed=true;
        continue;
      }
      for(const entry of state.buffs||[]){
        BuffService.refresh(
          entity,
          entry.type,
          Number(entry.value)||0,
          entry.sourceId,
          250,
          entry.data||{}
        );
      }
      if(!EntitySimulationAuthorityService.isLocal(entity))continue;
      const elapsed=Math.max(0,now-(Number(state.lastUpdatedAt)||now));
      state.lastUpdatedAt=now;
      const request=Math.max(0,Number(state.drainPerSecond)||0)*elapsed/1000;
      if(request<=0)continue;
      const resource=String(state.resource||'stamina');
      let paid=true;
      if(resource==='stamina'){
        const available=Math.max(0,Number(entity.stamina)||0);
        const spend=Math.min(available,request);
        if(spend>0)StaminaService.spend(entity,spend,now);
        paid=spend+1e-6>=request&&entity.stamina>1e-6;
      }
      if(!paid){
        this.stop(entity,state.stateKey,now);
        changed=true;
      }
    }
    return changed;
  },
  clear(entity){
    if(!entity?.actionState)return false;
    let changed=false;
    for(const state of [...entity.actionState.values()]){
      if(state?.kind!==this.KIND)continue;
      this.stop(entity,state.stateKey,performance.now());
      changed=true;
    }
    return changed;
  }
});