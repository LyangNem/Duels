

const LimitedUseBuffService=Object.freeze({
  KIND:'limited-use-buff',
  grant(entity,config={},now=performance.now()){
    if(!entity?.actionState)return false;
    const stateKey=String(config.stateKey||'limited-use-buff');
    const stat=String(config.stat||'');
    if(!COMBAT_BUFF_DEFS[stat])return false;
    const uses=Math.max(0,Math.floor(Number(config.uses)||0));
    if(uses<=0)return false;
    const increase=Math.max(0,Number(config.attackRateIncrease)||0);
    const value=stat==='attackRate'&&increase>0?increase/(1+increase):Number(config.value)||0;
    const sourceId=`limited-use:${entity.id}:${stateKey}:${stat}`;
    entity.actionState.set(stateKey,{
      kind:this.KIND,
      stateKey,
      stat,
      sourceId,
      remaining:uses,
      maximum:uses,
      attackTag:String(config.attackTag||''),
      value
    });
    BuffService.set(entity,stat,value,sourceId,Infinity,{tags:TagService.effectTags({type:'modifier.constant',value})});
    return true;
  },
  serialize(entity){
    return [...(entity?.actionState?.values?.()||[])].filter(state=>state?.kind===this.KIND)
      .map(({stateKey,stat,remaining,maximum,attackTag,value})=>({stateKey,stat,remaining,maximum,attackTag,value}));
  },
  applyRemote(entity,snapshots){
    if(!entity?.actionState||!Array.isArray(snapshots))return false;
    const keys=new Set();
    for(const snapshot of snapshots.slice(0,32)){
      if(!snapshot?.stateKey||!COMBAT_BUFF_DEFS[snapshot.stat]||Number(snapshot.remaining)<=0)continue;
      keys.add(String(snapshot.stateKey));
      this.grant(entity,{...snapshot,uses:Math.max(Number(snapshot.maximum)||0,Number(snapshot.remaining)||0)});
      entity.actionState.get(String(snapshot.stateKey)).remaining=Math.floor(Number(snapshot.remaining));
    }
    for(const state of [...entity.actionState.values()]){
      if(state?.kind===this.KIND&&!keys.has(state.stateKey))this.clear(entity,state.stateKey);
    }
    return true;
  },
  consume(entity,attack){
    if(!entity?.actionState||!attack)return false;
    let changed=false;
    for(const [key,state] of entity.actionState){
      if(state?.kind!==this.KIND)continue;
      if(state.attackTag&&!TagService.hasAttack(attack,state.attackTag))continue;
      state.remaining=Math.max(0,(Number(state.remaining)||0)-1);
      changed=true;
      if(state.remaining<=0){
        BuffService.remove(entity,state.stat,state.sourceId);
        entity.actionState.delete(key);
      }
    }
    return changed;
  },
  clear(entity,stateKey){
    const state=entity?.actionState?.get(String(stateKey||''));
    if(state?.kind!==this.KIND)return false;
    BuffService.remove(entity,state.stat,state.sourceId);
    entity.actionState.delete(state.stateKey);
    return true;
  }
});
