


const GameplayEffectEventSyncService=Object.freeze({
  handlers:new Map(),
  register(namespace,handler){
    const key=String(namespace||'');
    if(!key||typeof handler!=='function')return false;
    this.handlers.set(key,handler);
    return true;
  },
  send(namespace,payload=null,{targetPid=''}={}){
    if(Training.sessionMode!=='online'||!OnlineDuelService.active)return false;
    return RoomService.sendGameplay({
      type:'duel-effect-event',
      roundToken:OnlineDuelService.roundToken,
      sentAt:Date.now(),
      namespace:String(namespace||''),
      targetPid:String(targetPid||''),
      payload:payload&&typeof payload==='object'
        ?EffectSpawnService.definitionSnapshot(payload)
        :payload
    });
  },
  apply(packet){
    if(!packet)return false;
    const targetPid=String(packet.targetPid||'');
    if(targetPid&&targetPid!==String(OnlineDuelService.localPid||''))return false;
    const handler=this.handlers.get(String(packet.namespace||''));
    return typeof handler==='function'
      ?handler(packet.payload||null,packet)
      :false;
  }
});