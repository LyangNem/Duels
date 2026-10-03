


const PositionMemoryService=Object.freeze({
  config(entity){return entity?.character?.dodgeMemory||null;},
  state(entity,stateKey='backup'){
    if(!entity)return [];
    if(!entity._positionMemories)entity._positionMemories=new Map();
    const key=String(stateKey||'backup');
    let list=entity._positionMemories.get(key);
    if(!Array.isArray(list)){
      list=[];
      entity._positionMemories.set(key,list);
    }
    return list;
  },
  prune(entity,stateKey='backup',now=performance.now()){
    const list=this.state(entity,stateKey);
    const characterId=String(entity?.character?.id||'');
    let write=0;
    for(const item of list){
      if(!item||Number(item.expiry)<=now||String(item.characterId||'')!==characterId)continue;
      list[write++]=item;
    }
    list.length=write;
    return list;
  },
  recordDodge(entity,now=performance.now()){
    const config=this.config(entity);
    if(!config)return false;
    const key=String(config.stateKey||'backup');
    const list=this.prune(entity,key,now);
    entity._positionMemorySequence=Math.max(0,Number(entity._positionMemorySequence)||0)+1;
    list.push({
      id:`${key}:${entity._positionMemorySequence}`,
      characterId:String(entity.character?.id||''),
      x:Number(entity.x)||0,
      y:Number(entity.y)||0,
      createdAt:now,
      expiry:now+Math.max(0,Number(config.window)||0)
    });
    const maxCount=Math.max(1,Math.floor(Number(config.maxCount)||1));
    while(list.length>maxCount)list.shift();
    return true;
  },
  latest(entity,stateKey='backup',now=performance.now()){
    const list=this.prune(entity,stateKey,now);
    return list.length?list[list.length-1]:null;
  },
  pop(entity,stateKey='backup',now=performance.now()){
    return this.prune(entity,stateKey,now).pop()||null;
  },
  updatePresentation(entity,now=performance.now()){
    const config=this.config(entity);
    if(!config||entity!==Training.player||!entity?.alive)return false;
    const key=String(config.stateKey||'backup');
    const list=this.prune(entity,key,now);
    const windowMs=Math.max(1,Number(config.window)||1);
    if(!list.length)return false;
    const pointCount=list.length+1;
    for(let i=0;i<list.length;i++){
      const from=list[i];
      const to=i+1<list.length
        ?list[i+1]
        :entity;
      const alpha=.3+.5*(i/Math.max(1,pointCount-1));
      EffectSpawnService.spawn({
        type:'positionMemoryLink',
        key:`position-memory-link:${entity.id}:${key}:${i}`,
        x:from.x,y:from.y,
        tx:to.x,ty:to.y,
        color:'255,119,0',alpha:alpha*.5,width:1.5,dash:[5,4],
        start:now,dur:GAME_DATA.frameMs*3
      },{source:entity});
    }
    for(let i=0;i<list.length;i++){
      const item=list[i];
      const alpha=list.length===1?.9:.4+.5*(i/Math.max(1,list.length-1));
      const ratio=Math.max(0,Math.min(1,(item.expiry-now)/windowMs));
      EffectSpawnService.spawn({
        type:'positionMemoryMarker',
        key:`position-memory-marker:${entity.id}:${item.id}`,
        x:item.x,y:item.y,radius:10,color:'255,119,0',alpha,ratio,
        start:now,dur:GAME_DATA.frameMs*3
      },{source:entity});
    }
    return true;
  }
});