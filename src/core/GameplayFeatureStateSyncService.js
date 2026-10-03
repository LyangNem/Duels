



const GameplayFeatureStateSyncService=Object.freeze({
  handlers:new Map(),
  register(namespace,handler){
    const key=String(namespace||'');
    if(!key||typeof handler!=='function')return false;
    this.handlers.set(key,handler);
    return true;
  },
  send(entity,namespace,feature,active){
    if(
      !entity||
      Training.sessionMode!=='online'||
      !RoomService.localPid||
      !EntitySimulationAuthorityService.isLocal(entity)
    )return false;
    return RoomService.sendGameplay({
      type:'duel-feature-state',
      namespace:String(namespace||''),
      feature:String(feature||''),
      active:active===true
    });
  },
  apply(entity,payload){
    if(!entity||!payload)return false;
    const handler=this.handlers.get(String(payload.namespace||''));
    return typeof handler==='function'
      ?handler(entity,String(payload.feature||''),payload.active!==false)
      :false;
  }
});