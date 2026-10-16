

const DynamicWallService={
  byOwner:new Map(),
  revision:0,
  cacheRevision:-1,
  cache:[],
  activeByOwner:new Map(),
  ownerKey(owner){
    return String(owner?.id||owner||'');
  },
  wallsFor(owner){
    const key=this.ownerKey(owner);
    const walls=this.byOwner.get(key)||[];
    if(!WorldDestructionService.removedDynamic.size)return walls;
    if(!this.activeByOwner.has(key)){
      this.activeByOwner.set(key,walls.filter(wall=>!WorldDestructionService.removedDynamic.has(wall.id)));
    }
    return this.activeByOwner.get(key);
  },
  all(){
    if(this.cacheRevision===this.revision)return this.cache;
    const merged=[];
    for(const walls of this.byOwner.values()){
      for(const wall of walls){
        if(!WorldDestructionService.removedDynamic.has(wall.id))merged.push(wall);
      }
    }
    this.cache=merged;
    this.cacheRevision=this.revision;
    return merged;
  },
  invalidate(){
    this.revision++;
    this.cacheRevision=-1;
    this.activeByOwner.clear();
  },
  clearOwner(owner){
    const key=this.ownerKey(owner);
    if(!key||!this.byOwner.has(key))return false;
    this.byOwner.delete(key);
    this.invalidate();
    return true;
  },
  clearAll(){
    if(!this.byOwner.size)return false;
    this.byOwner.clear();
    this.invalidate();
    return true;
  },
  normalizeWall(ownerKey,wall,index=0){
    const x=Number(wall?.x)||0;
    const y=Number(wall?.y)||0;
    const w=Math.max(1,Number(wall?.w)||1);
    const h=Math.max(1,Number(wall?.h)||1);
    return {
      id:String(wall?.id||`${ownerKey}:wall:${index}`),
      ownerId:ownerKey,
      x,y,w,h,
      dynamic:true,
      movementOnly:true,
      color:String(wall?.color||'#b5652b')
    };
  },
  placementConfig(owner,module={}){
    const map=
      typeof DebugMapService!=='undefined'
        ?DebugMapService.current()
        :null;
    const tileWorldSize=Math.max(
      1,
      Number(map?.tileWorldSize)||
      Number(module.cellSize)||
      50
    );
    return {
      cellSize:tileWorldSize,
      longCells:Math.max(1,Math.floor(Number(module.longCells)||5)),
      shortCells:Math.max(1,Math.floor(Number(module.shortCells)||1)),
      maxInstances:Math.max(1,Math.floor(Number(module.maxInstances)||2)),
      maxRange:Math.max(0,Number(module.maxRange)||650),
      color:String(module.color||owner?.color||'#b5652b')
    };
  },
  snapCenter(value,span,worldSize,cell){
    const min=span/2;
    const max=Math.max(min,worldSize-span/2);
    const clamped=Math.max(min,Math.min(max,Number(value)||0));
    const snapped=
      Math.round((clamped-cell/2)/cell)*cell+
      cell/2;
    return Math.max(min,Math.min(max,snapped));
  },
  resolvePlacement(owner,targetPoint,module={}){
    if(!owner||!targetPoint)return null;
    const config=this.placementConfig(owner,module);
    const dx=(Number(targetPoint.x)||0)-(Number(owner.x)||0);
    const dy=(Number(targetPoint.y)||0)-(Number(owner.y)||0);
    const vertical=Math.abs(dx)>=Math.abs(dy);
    const w=
      (vertical?config.shortCells:config.longCells)*
      config.cellSize;
    const h=
      (vertical?config.longCells:config.shortCells)*
      config.cellSize;

    let cx=Number(targetPoint.x)||0;
    let cy=Number(targetPoint.y)||0;
    const distance=Math.hypot(dx,dy);
    if(
      config.maxRange>0&&
      distance>config.maxRange&&
      distance>0
    ){
      cx=
        (Number(owner.x)||0)+
        dx/distance*config.maxRange;
      cy=
        (Number(owner.y)||0)+
        dy/distance*config.maxRange;
    }

    const worldW=WorldBoundsService.width();
    const worldH=WorldBoundsService.height();
    cx=this.snapCenter(
      cx,
      w,
      worldW,
      config.cellSize
    );
    cy=this.snapCenter(
      cy,
      h,
      worldH,
      config.cellSize
    );

    return {
      x:cx-w/2,
      y:cy-h/2,
      w,
      h,
      vertical,
      config
    };
  },
  place(owner,targetPoint,module={}){
    if(!owner||!targetPoint)return false;
    const ownerKey=this.ownerKey(owner);
    if(!ownerKey)return false;
    const placement=
      this.resolvePlacement(
        owner,
        targetPoint,
        module
      );
    if(!placement)return false;

    const wall=this.normalizeWall(ownerKey,{
      id:`${ownerKey}:dynamic-wall:${Date.now()}:${Math.random().toString(36).slice(2,7)}`,
      x:placement.x,
      y:placement.y,
      w:placement.w,
      h:placement.h,
      color:placement.config.color
    });

    const walls=[...this.wallsFor(owner)];
    walls.push(wall);
    while(walls.length>placement.config.maxInstances){
      walls.shift();
    }
    this.byOwner.set(ownerKey,walls);
    this.invalidate();
    return wall;
  },
  chargeDeployConfig(owner){
    const ability=owner?.character?.abilities?.lmb;
    const attackId=String(ability?.attackId||'');
    const attack=attackId
      ?AbilityService.attackById(owner?.character,attackId)
      :null;
    const fullModules=attack?.charge?.fullSpec?.modules||[];
    const module=fullModules.find(item=>
      String(item?.type||'')==='obstacle.wall-deploy'
    )||null;
    if(!module)return null;

    const startModule=(ability?.trigger?.modules||[]).find(item=>
      String(item?.type||'')==='charge.attack.start'
    )||null;
    const stateKey=String(
      startModule?.stateKey||
      'charge:primary'
    );
    return {
      ability,
      attack,
      module,
      stateKey
    };
  },
  drawPlacementPreview(ctx,owner){
    if(
      !ctx||
      !owner||
      owner!==Training.player
    )return false;

    const config=this.chargeDeployConfig(owner);
    if(!config)return false;

    const state=ChargedAttackService.state(
      owner,
      config.stateKey
    );
    if(!state)return false;

    const progress=ChargedAttackService.progress(
      state,
      config.attack,
      performance.now()
    );
    if(
      progress<
      ChargedAttackService.maxProgress(config.attack)
    )return false;

    const point=Training.mouseWorld();
    const placement=
      this.resolvePlacement(
        owner,
        point,
        config.module
      );
    if(!placement)return false;

    ctx.save();
    ctx.fillStyle='rgba(165,175,185,.032)';
    ctx.strokeStyle='rgba(255,255,255,.55)';
    ctx.lineWidth=1.5;
    ctx.setLineDash([7,5]);
    ctx.fillRect(
      placement.x,
      placement.y,
      placement.w,
      placement.h
    );
    ctx.strokeRect(
      placement.x+1.5,
      placement.y+1.5,
      Math.max(0,placement.w-3),
      Math.max(0,placement.h-3)
    );
    ctx.setLineDash([]);
    ctx.restore();
    return true;
  },
  drawWorld(ctx,localPlayer){
    if(!ctx)return false;
    let drawn=false;

    for(const wall of this.all()){
      const rgb=ColorService.rgbString(
        wall.color||'#b5652b',
        '181,101,43'
      );
      const wallOwner=
        EntityService.items.get(
          String(wall.ownerId||'')
        )||null;
      const outlineColor=
        TeamColorPresentationService.colorForEntity(
          wallOwner,
          wall.color||'#b5652b'
        );
      const outlineRgb=ColorService.rgbString(
        outlineColor,
        rgb
      );
      ctx.save();
      ctx.fillStyle=`rgba(${rgb},.24)`;
      ctx.strokeStyle=`rgba(${outlineRgb},.82)`;
      ctx.lineWidth=2;
      ctx.fillRect(
        Number(wall.x)||0,
        Number(wall.y)||0,
        Math.max(1,Number(wall.w)||1),
        Math.max(1,Number(wall.h)||1)
      );
      ctx.strokeRect(
        (Number(wall.x)||0)+1,
        (Number(wall.y)||0)+1,
        Math.max(0,(Number(wall.w)||1)-2),
        Math.max(0,(Number(wall.h)||1)-2)
      );
      ctx.restore();
      drawn=true;
    }

    const ownerPresentation=
      localPlayer?.character?.dynamicWallPresentation||null;
    if(
      localPlayer?.alive&&
      ownerPresentation&&
      (
        ownerPresentation.linkToOwner===true||
        ownerPresentation.showOrder===true
      )
    ){
      const ownWalls=this.wallsFor(localPlayer);
      const rgb=ColorService.rgbString(
        localPlayer.color||'#b5652b',
        '181,101,43'
      );

      for(let index=0;index<ownWalls.length;index++){
        const wall=ownWalls[index];
        const cx=(Number(wall.x)||0)+Math.max(1,Number(wall.w)||1)/2;
        const cy=(Number(wall.y)||0)+Math.max(1,Number(wall.h)||1)/2;

        ctx.save();
        if(ownerPresentation.linkToOwner===true){
          ctx.setLineDash([7,6]);
          ctx.lineWidth=1.5;
          ctx.strokeStyle=`rgba(${rgb},.72)`;
          ctx.beginPath();
          ctx.moveTo(
            Number(localPlayer.x)||0,
            Number(localPlayer.y)||0
          );
          ctx.lineTo(cx,cy);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        if(ownerPresentation.showOrder===true){
          ctx.beginPath();
          ctx.arc(cx,cy,11,0,Math.PI*2);
          ctx.fillStyle='rgba(13,13,15,.72)';
          ctx.fill();
          ctx.strokeStyle=`rgba(${rgb},.95)`;
          ctx.lineWidth=2;
          ctx.stroke();

          ctx.fillStyle=`rgba(${rgb},1)`;
          ctx.font='bold 11px Pretendard';
          ctx.textAlign='center';
          ctx.textBaseline='middle';
          ctx.fillText(String(index+1),cx,cy+.5);
        }
        ctx.restore();
      }
    }

    return drawn;
  },
  serialize(owner){
    return this.wallsFor(owner).map((wall,index)=>({
      id:String(wall.id||`${this.ownerKey(owner)}:wall:${index}`),
      x:Number(wall.x)||0,
      y:Number(wall.y)||0,
      w:Math.max(1,Number(wall.w)||1),
      h:Math.max(1,Number(wall.h)||1),
      color:String(wall.color||owner?.color||'#b5652b')
    }));
  },
  applyRemote(owner,payload){
    if(!owner)return false;
    const key=this.ownerKey(owner);
    const list=Array.isArray(payload)?payload:[];
    if(!list.length){
      if(this.byOwner.has(key)){
        this.byOwner.delete(key);
        this.invalidate();
      }
      return true;
    }
    this.byOwner.set(
      key,
      list.slice(0,8).map(
        (wall,index)=>
          this.normalizeWall(key,wall,index)
      )
    );
    this.invalidate();
    return true;
  }
};
