/* 라운드 지형 파괴: 원본 맵은 보존하며 블록별 제거 목록과 캐시만 관리한다. */
const WorldDestructionService={
  map:null,cells:[],removed:new Set(),removedDynamic:new Set(),activeWalls:[],revision:0,
  cachedSnapshot:null,
  reset(map){
    this.map=map;this.cells=[];this.removed.clear();this.removedDynamic.clear();
    const cellSize=Math.max(1,Number(map?.tileWorldSize)||50);
    for(const wall of map?.walls||[]){
      for(let y=wall.y;y<wall.y+wall.h;y+=cellSize){
        for(let x=wall.x;x<wall.x+wall.w;x+=cellSize){
          this.cells.push({...wall,x,y,w:Math.min(cellSize,wall.x+wall.w-x),h:Math.min(cellSize,wall.y+wall.h-y)});
        }
      }
    }
    this.refresh();
  },
  refresh(){
    if(this.removed.size){
      const cells=this.cells.filter((wall,index)=>!this.removed.has(index));
      cells.sort((a,b)=>a.y-b.y||a.x-b.x);
      const walls=[];
      for(const cell of cells){
        const previous=walls[walls.length-1];
        if(previous&&previous.y===cell.y&&previous.h===cell.h&&previous.x+previous.w===cell.x){
          previous.w+=cell.w;
        }else walls.push({...cell});
      }
      this.activeWalls=walls;
    }else this.activeWalls=this.map?.walls||[];
    this.revision++;
    this.cachedSnapshot=null;
    if(typeof StaticWorldRenderer!=='undefined')StaticWorldRenderer.invalidate();
    if(typeof DynamicWallService!=='undefined')DynamicWallService.invalidate();
  },
  walls(map){
    if(this.map!==map)this.reset(map);
    return this.activeWalls;
  },
  intersects(wall,point,range){
    const x=Math.max(wall.x,Math.min(wall.x+wall.w,point.x));
    const y=Math.max(wall.y,Math.min(wall.y+wall.h,point.y));
    return Math.hypot(x-point.x,y-point.y)<=range;
  },
  exposed(wall,point,range,occluders){
    const samples=[
      {x:Math.max(wall.x,Math.min(wall.x+wall.w,point.x)),y:Math.max(wall.y,Math.min(wall.y+wall.h,point.y))},
      {x:wall.x,y:wall.y},{x:wall.x+wall.w,y:wall.y},
      {x:wall.x,y:wall.y+wall.h},{x:wall.x+wall.w,y:wall.y+wall.h}
    ];
    return samples.some(sample=>{
      if(Math.hypot(sample.x-point.x,sample.y-point.y)>range)return false;
      return occluders.every(obstacle=>{
        const entry=WorldGeometryService.segmentRectEntry(point.x,point.y,sample.x,sample.y,obstacle,0);
        return entry===null||entry>=1-1e-7;
      });
    });
  },
  destroyCircle(point,range,{source=null,wallPolicy='ignore',contactRange=0}={}){
    if(!point||!Number.isFinite(point.x)||!Number.isFinite(point.y)||!Number.isFinite(range)||range<=0)return false;
    this.walls(DebugMapService.current());
    let changed=false;
    const destroyed=[];
    const occluders=[...this.activeWalls,...DynamicWallService.all()];
    const touches=wall=>this.intersects(wall,point,range)&&(
      wallPolicy!=='block'||(contactRange>0&&this.intersects(wall,point,contactRange))||
      this.exposed(wall,point,range,occluders));
    for(let index=0;index<this.cells.length;index++){
      if(!this.removed.has(index)&&touches(this.cells[index])){
        this.removed.add(index);destroyed.push(this.cells[index]);changed=true;
      }
    }
    for(const wall of DynamicWallService.all()){
      if(!this.removedDynamic.has(wall.id)&&touches(wall)){
        this.removedDynamic.add(wall.id);destroyed.push(wall);changed=true;
      }
    }
    if(!changed)return false;
    this.refresh();
    this.presentDestruction(destroyed,source);
    GameEvents.emit('world-walls-destroyed',{source,snapshot:this.snapshot()});
    return true;
  },
  presentDestruction(walls,source){
    if(!source||!EffectSpawnService.shouldPresentAttack(source))return;
    const now=performance.now();
    const stride=Math.max(1,Math.ceil(walls.length/16));
    for(let index=0;index<walls.length;index+=stride){
      const wall=walls[index];
      const x=wall.x+wall.w/2,y=wall.y+wall.h/2;
      for(let part=0;part<2;part++){
        const angle=(index*.73+part*Math.PI)+.4;
        const effect=EffectSpawnService.spawn({type:'effectShape',shape:'rect',
          x,y,width:7,height:5,angle,fillStyle:'rgba(190,181,163,.55)',start:now,dur:240,
          animation:{fromX:x,fromY:y,toX:x+Math.cos(angle)*22,toY:y+Math.sin(angle)*22-10,
            fromAngle:angle,toAngle:angle+1.3,easing:'ease-out'}},{source});
        if(effect&&OnlinePresentationSyncService.shouldSend(source)){
          OnlinePresentationSyncService.send('effect-spawn',source,
            {effect:EffectSpawnService.presentationSnapshot(effect,now)});
        }
      }
    }
  },
  snapshot(){
    this.walls(DebugMapService.current());
    return this.cachedSnapshot||(this.cachedSnapshot={
      mapId:String(this.map?.id||''),removed:Array.from(this.removed),dynamic:Array.from(this.removedDynamic)
    });
  },
  applySnapshot(snapshot){
    if(!snapshot||snapshot.mapId!==DebugMapService.currentId||!Array.isArray(snapshot.removed))return false;
    this.walls(DebugMapService.current());
    let changed=false;
    for(const index of snapshot.removed){
      if(Number.isInteger(index)&&index>=0&&index<this.cells.length&&!this.removed.has(index)){
        this.removed.add(index);changed=true;
      }
    }
    for(const id of (Array.isArray(snapshot.dynamic)?snapshot.dynamic:[])){
      if(typeof id==='string'&&id.length<=200&&!this.removedDynamic.has(id)){
        this.removedDynamic.add(id);changed=true;
      }
    }
    if(changed)this.refresh();
    return true;
  }
};
