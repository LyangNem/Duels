

const LimitedUseBuffService=Object.freeze({
  KIND:'limited-use-buff',
  grant(entity,config={},now=performance.now()){
    if(!entity?.actionState)return false;
    const stateKey=String(config.stateKey||'limited-use-buff');
    const stat=String(config.stat||'');
    if(!COMBAT_BUFF_DEFS[stat])return false;
    const uses=Math.max(0,Math.floor(Number(config.uses)||0));
    if(uses<=0)return false;
    const sourceId=`limited-use:${entity.id}:${stateKey}:${stat}`;
    entity.actionState.set(stateKey,{
      kind:this.KIND,
      stateKey,
      stat,
      sourceId,
      remaining:uses,
      maximum:uses,
      attackTag:String(config.attackTag||''),
      value:Number(config.value)||0
    });
    BuffService.set(entity,stat,Number(config.value)||0,sourceId,Infinity,{tags:TagService.effectTags({type:'modifier.constant',value:Number(config.value)||0})});
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