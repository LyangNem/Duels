

const GameplayAttackSnapshotSyncService=Object.freeze({
  handlers:new Map(),
  register(namespace,handler){
    const key=String(namespace||'');
    if(!key||typeof handler!=='function')return false;
    this.handlers.set(key,handler);
    return true;
  },
  send(entity,namespace,{attackId='',angle=0,executionSequence=0,snapshot=null}={}){
    if(
      !entity||
      Training.sessionMode!=='online'||
      !OnlineDuelService.active||
      !EntitySimulationAuthorityService.isLocal(entity)
    )return false;
    return RoomService.sendGameplay({
      type:'duel-attack-snapshot',
      roundToken:OnlineDuelService.roundToken,
      sentAt:Date.now(),
      namespace:String(namespace||''),
      attackId:String(attackId||''),
      angle:Number(angle)||0,
      executionSequence:Math.max(0,Math.floor(Number(executionSequence)||0)),
      snapshot:EffectSpawnService.definitionSnapshot(snapshot)
    });
  },
  apply(entity,payload){
    if(!entity||!payload)return false;
    const handler=this.handlers.get(String(payload.namespace||''));
    return typeof handler==='function'
      ?handler(entity,payload)
      :false;
  }
});