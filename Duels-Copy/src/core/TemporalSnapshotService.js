


/* 연속 시간축의 위치/자원 스냅샷을 재사용 가능한 원형 버퍼로 보존한다. */
const TemporalSnapshotService=Object.freeze({
  config(entity){return entity?.character?.temporalMemory||null;},
  state(entity){
    if(!entity)return null;
    const config=this.config(entity);
    if(!config)return null;
    const characterId=String(entity.character?.id||'');
    const interval=Math.max(1,Number(config.sampleInterval)||30);
    const duration=Math.max(interval,Number(config.maxDuration)||3500);
    const capacity=Math.max(2,Math.ceil(duration/interval)+2);
    let state=entity._temporalSnapshotState||null;
    if(
      !state||state.characterId!==characterId||
      state.capacity!==capacity||state.stateKey!==String(config.stateKey||'temporal')
    ){
      state={
        stateKey:String(config.stateKey||'temporal'),characterId,capacity,
        items:new Array(capacity),head:0,length:0,lastSampleAt:0,
        presentation:{x:0,y:0,stamina:undefined}
      };
      entity._temporalSnapshotState=state;
    }
    return state;
  },
  sample(entity,now=performance.now()){
    const config=this.config(entity);
    const state=this.state(entity);
    if(!config||!state||!entity.alive)return false;
    const interval=Math.max(1,Number(config.sampleInterval)||30);
    if(state.lastSampleAt&&now-state.lastSampleAt<interval)return false;
    state.lastSampleAt=now;
    const index=(state.head+state.length)%state.capacity;
    const slot=state.length<state.capacity?index:state.head;
    if(state.length>=state.capacity)state.head=(state.head+1)%state.capacity;
    else state.length++;
    const snap=state.items[slot]||{};
    snap.t=now;snap.x=Number(entity.x)||0;snap.y=Number(entity.y)||0;
    if((config.resources||[]).includes('stamina'))snap.stamina=Number(entity.stamina)||0;
    state.items[slot]=snap;
    return true;
  },
  at(entity,ageMs,now=performance.now()){
    const state=this.state(entity);
    if(!state||state.length<1)return null;
    const target=now-Math.max(0,Number(ageMs)||0);
    let candidate=null;
    for(let i=0;i<state.length;i++){
      const item=state.items[(state.head+i)%state.capacity];
      if(!item)continue;
      if(item.t<=target)candidate=item;
      else break;
    }
    return candidate||state.items[state.head]||null;
  },
  presentationSnapshot(entity,ageMs,now=performance.now()){
    const state=this.state(entity);
    if(!state||state.length<1)return null;
    const target=now-Math.max(0,Number(ageMs)||0);
    let previous=null;
    let next=null;
    for(let i=0;i<state.length;i++){
      const item=state.items[(state.head+i)%state.capacity];
      if(!item)continue;
      if(item.t<=target)previous=item;
      else{next=item;break;}
    }
    if(!previous)return null;
    const result=state.presentation;
    if(!next||next.t<=previous.t){
      result.x=previous.x;
      result.y=previous.y;
      result.stamina=previous.stamina;
      return result;
    }
    const ratio=Math.max(0,Math.min(1,(target-previous.t)/(next.t-previous.t)));
    result.x=previous.x+(next.x-previous.x)*ratio;
    result.y=previous.y+(next.y-previous.y)*ratio;
    result.stamina=previous.stamina;
    return result;
  },
  update(entity,now=performance.now()){
    if(!this.config(entity)||!EntitySimulationAuthorityService.isLocal(entity))return false;
    return this.sample(entity,now);
  },
  updatePresentation(entity,now=performance.now()){
    const config=this.config(entity);
    if(!config||entity!==Training.player||!entity?.alive)return false;
    const snap=this.presentationSnapshot(entity,Number(config.rewindTime)||3000,now);
    if(!snap)return false;
    const maxStamina=Math.max(1,Number(entity.maxStamina)||1);
    const staminaRatio=Number.isFinite(Number(snap.stamina))
      ?Math.max(0,Math.min(1,Number(snap.stamina)/maxStamina))
      :null;
    const pulse=.5+.5*Math.sin(now*.006);
    EffectSpawnService.spawn({
      type:'positionMemoryMarker',
      key:`temporal-marker:${entity.id}:${String(config.stateKey||'temporal')}`,
      x:snap.x,y:snap.y,radius:Math.max(1,Number(entity.radius)||20)+4,
      color:config.color||entity.color||'#6e97ff',
      alpha:.55,ratio:1,dash:[4,4],lineWidth:2,baseStrokeAlpha:0,
      arcAlpha:.6+.3*pulse,
      fillRadius:Math.max(1,Number(entity.radius)||20),fillAlpha:.0825,
      icon:'⟲',iconColor:'180,210,255',iconAlpha:.495,iconFont:'bold 14px Arial',iconOffsetY:5,
      resourceRatio:staminaRatio,resourceWidth:48,resourceHeight:4,
      resourceOffsetY:Math.max(1,Number(entity.radius)||20)+7,
      resourceBackColor:'#111',resourceHighColor:'#fa0',resourceLowColor:'#f64',
      resourceThreshold:.4,resourceAlpha:.75,
      start:now,dur:GAME_DATA.frameMs*3
    },{source:entity});
    return true;
  }
});