

/* 대상별 중첩 표식. 소유자 Entity가 상태를 소유하고 대상 ID/만료/이탈거리/폭발을 함께 관리한다. */

const OrbitInventoryService=Object.freeze({
  KIND:'orbit-inventory',
  config(entity,stateKey=''){
    const config=entity?.character?.orbitInventory||null;
    if(!config)return null;
    if(stateKey&&String(config.stateKey||'')!==String(stateKey))return null;
    return config;
  },
  state(entity,stateKey='',create=false){
    if(!entity?.actionState)return null;
    const config=this.config(entity,stateKey);
    if(!config)return null;
    const key=String(config.stateKey||stateKey||'orbit-inventory');
    let state=entity.actionState.get(key)||null;
    if(state?.kind!==this.KIND){
      if(!create)return null;
      state={
        kind:this.KIND,
        stateKey:key,
        quality:1,
        items:[],
        counterItems:[],
        nextId:1,
        phase:0,
        phaseAt:performance.now()
      };
      entity.actionState.set(key,state);
    }
    return state;
  },
  quality(entity,stateKey=''){
    return Math.max(1,Math.floor(Number(this.state(entity,stateKey,false)?.quality)||1));
  },
  palette(config,quality){
    const palette=Array.isArray(config?.palette)?config.palette:[];
    const index=Math.max(0,Math.min(palette.length-1,Math.floor(Number(quality)||1)-1));
    return palette[index]||'#ffffff';
  },
  highestHeldQuality(state){
    if(!state)return 1;
    let highest=1;
    for(const item of state.items||[]){
      highest=Math.max(
        highest,
        Math.max(1,Math.floor(Number(item?.quality)||1))
      );
    }
    for(const item of state.counterItems||[]){
      highest=Math.max(
        highest,
        Math.max(1,Math.floor(Number(item?.quality)||1))
      );
    }
    return highest;
  },
  effectiveQuality(entity,stateKey=''){
    const config=this.config(entity,stateKey);
    const state=this.state(entity,stateKey,false);
    if(!config||!state)return 1;
    return Math.max(
      1,
      Math.min(
        Math.max(1,Math.floor(Number(config.maxQuality)||1)),
        Math.max(
          Math.floor(Number(state.quality)||1),
          this.highestHeldQuality(state)
        )
      )
    );
  },

  addOne(entity,stateKey='',qualityOverride=null){
    const config=this.config(entity,stateKey);
    const state=this.state(entity,stateKey,true);
    if(!config||!state)return null;
    const maxQuality=Math.max(1,Math.floor(Number(config.maxQuality)||1));
    const quality=Math.max(
      1,
      Math.min(
        maxQuality,
        Math.floor(
          qualityOverride===null
            ?this.effectiveQuality(entity,stateKey)
            :Number(qualityOverride)||1
        )
      )
    );
    const capacity=Math.max(1,Math.floor(Number(config.capacity)||1));
    const usedSlots=new Set(
      state.items
        .map(item=>Math.floor(Number(item.slot)))
        .filter(slot=>Number.isFinite(slot)&&slot>=0&&slot<capacity)
    );
    let slot=-1;
    for(let index=0;index<capacity;index++){
      if(!usedSlots.has(index)){
        slot=index;
        break;
      }
    }

    const item={
      id:`${state.stateKey}:${state.nextId++}`,
      quality,
      slot,
      acquiredAt:performance.now()
    };

    if(state.items.length<capacity&&slot>=0){
      state.items.push(item);
    }else{
      let worstIndex=0;
      for(let i=1;i<state.items.length;i++){
        if(Number(state.items[i].quality)<Number(state.items[worstIndex].quality)){
          worstIndex=i;
        }
      }
      if(quality>Number(state.items[worstIndex]?.quality||0)){
        item.slot=Math.max(
          0,
          Math.min(
            capacity-1,
            Math.floor(Number(state.items[worstIndex]?.slot)||0)
          )
        );
        state.items[worstIndex]=item;
      }else{
        return null;
      }
    }

    if(qualityOverride===null){
      state.quality=Math.min(maxQuality,quality+1);
    }
    return item;
  },
  addCounterOne(entity,stateKey='',qualityOverride=null,capacityOverride=10){
    const config=this.config(entity,stateKey);
    const state=this.state(entity,stateKey,true);
    if(!config||!state)return null;

    const maxQuality=Math.max(
      1,
      Math.floor(Number(config.maxQuality)||1)
    );
    const quality=Math.max(
      1,
      Math.min(
        maxQuality,
        Math.floor(Number(qualityOverride)||1)
      )
    );
    const capacity=Math.max(
      1,
      Math.floor(Number(capacityOverride)||10)
    );

    if(!Array.isArray(state.counterItems)){
      state.counterItems=[];
    }

    const usedSlots=new Set(
      state.counterItems
        .map(item=>Math.floor(Number(item.slot)))
        .filter(slot=>
          Number.isFinite(slot)&&
          slot>=0&&
          slot<capacity
        )
    );
    let slot=-1;
    for(let index=0;index<capacity;index++){
      if(!usedSlots.has(index)){
        slot=index;
        break;
      }
    }

    const item={
      id:`counter:${state.stateKey}:${state.nextId++}`,
      quality,
      slot,
      acquiredAt:performance.now()
    };

    if(
      state.counterItems.length<capacity&&
      slot>=0
    ){
      state.counterItems.push(item);
      return item;
    }

    let worstIndex=0;
    for(let index=1;index<state.counterItems.length;index++){
      if(
        Number(state.counterItems[index]?.quality||0)<
        Number(state.counterItems[worstIndex]?.quality||0)
      ){
        worstIndex=index;
      }
    }

    if(
      quality>
      Number(state.counterItems[worstIndex]?.quality||0)
    ){
      item.slot=Math.max(
        0,
        Math.min(
          capacity-1,
          Math.floor(
            Number(state.counterItems[worstIndex]?.slot)||0
          )
        )
      );
      state.counterItems[worstIndex]=item;
      return item;
    }

    return null;
  },

  addMany(entity,stateKey,count,{
    collection='normal',
    counterCapacity=10,
    advanceQuality=true
  }={}){
    const config=this.config(entity,stateKey);
    const state=this.state(entity,stateKey,true);
    if(!config||!state)return [];

    const gained=[];
    const amount=Math.max(0,Math.floor(Number(count)||0));

    // 일반/반격 두 링에 남아 있는 가장 좋은 품질을 포함해
    // 현재 획득 가능한 품질의 하한을 보존한다.
    const currentQuality=this.effectiveQuality(
      entity,
      stateKey
    );

    // 한 번의 범위 채굴은 모두 동일 품질.
    for(let index=0;index<amount;index++){
      const item=
        String(collection)==='counter'
          ?this.addCounterOne(
            entity,
            stateKey,
            currentQuality,
            counterCapacity
          )
          :this.addOne(
            entity,
            stateKey,
            currentQuality
          );

      if(item)gained.push({...item});
    }

    // 평타 채굴만 다음 품질 단계 상승.
    if(
      advanceQuality!==false&&
      amount>0
    ){
      state.quality=Math.min(
        Math.max(1,Math.floor(Number(config.maxQuality)||1)),
        currentQuality+1
      );
    }else{
      // 스킬/반격은 품질 진행도를 올리지 않되
      // 보유 중인 높은 품질보다 내려가지도 않는다.
      state.quality=currentQuality;
    }

    return gained;
  },
  fill(entity,module={}){
    const stateKey=String(module?.stateKey||'');
    const config=this.config(entity,stateKey);
    const state=this.state(entity,stateKey,true);
    if(!config||!state)return [];
    const capacity=Math.max(1,Math.floor(Number(config.capacity)||1));
    const missing=Math.max(0,capacity-(state.items||[]).length);
    if(missing<=0)return [];
    return this.addMany(
      entity,
      stateKey,
      missing,
      {collection:'normal',advanceQuality:false}
    );
  },
  resetIfEmpty(entity,state){
    if(!state)return;
    const normalEmpty=(state.items||[]).length===0;
    const counterEmpty=(state.counterItems||[]).length===0;
    if(normalEmpty&&counterEmpty){
      state.quality=1;
    }else{
      state.quality=Math.max(
        Math.floor(Number(state.quality)||1),
        this.highestHeldQuality(state)
      );
    }
  },
  wallCellCountCircle(x,y,range,wallUnit=50){
    const radius=Math.max(0,Number(range)||0);
    const size=Math.max(1,Number(wallUnit)||50);
    const seen=new Set();
    for(const wall of DebugMapService.walls()){
      const left=Math.floor(Number(wall.x)/size);
      const right=Math.ceil((Number(wall.x)+Number(wall.w))/size)-1;
      const top=Math.floor(Number(wall.y)/size);
      const bottom=Math.ceil((Number(wall.y)+Number(wall.h))/size)-1;
      for(let row=top;row<=bottom;row++){
        for(let col=left;col<=right;col++){
          const cellX=col*size;
          const cellY=row*size;
          const nearestX=Math.max(cellX,Math.min(cellX+size,Number(x)||0));
          const nearestY=Math.max(cellY,Math.min(cellY+size,Number(y)||0));
          const dx=nearestX-(Number(x)||0);
          const dy=nearestY-(Number(y)||0);
          if(dx*dx+dy*dy<=radius*radius){
            seen.add(`${row}:${col}`);
          }
        }
      }
    }
    return seen.size;
  },
  wallInSector(entity,range,halfAngle,angle){
    const maxRange=Math.max(0,Number(range)||0);
    const half=Math.max(0,Number(halfAngle)||0);
    const ex=Number(entity.x)||0;
    const ey=Number(entity.y)||0;

    // 시작점이 이미 벽 내부/경계에 닿아 있으면 즉시 채굴 성공.
    if(WorldGeometryService.wallAtPoint(ex,ey,0)){
      return true;
    }

    // 부채꼴 전체를 균등 ray로 검사한다.
    // 105px 초근거리 채굴에서 25개 ray면 50px 벽 타일보다 충분히 촘촘하다.
    const samples=25;
    for(let index=0;index<samples;index++){
      const ratio=
        samples<=1
          ?.5
          :index/(samples-1);
      const rayAngle=
        Number(angle)-
        half+
        half*2*ratio;

      const distance=
        WorldGeometryService.raycastDistance(
          ex,
          ey,
          rayAngle,
          maxRange,
          0
        );

      if(distance<maxRange-.001){
        return true;
      }
    }

    // ray 사이에 아주 짧게 걸친 벽을 보완하기 위해
    // 기존 최근접점/모서리 검사도 fallback으로 유지한다.
    const inSector=(px,py)=>{
      const dx=Number(px)-ex;
      const dy=Number(py)-ey;
      const distance=Math.hypot(dx,dy);
      if(distance>maxRange+.0001)return false;

      const targetAngle=Math.atan2(dy,dx);
      const diff=Math.atan2(
        Math.sin(targetAngle-angle),
        Math.cos(targetAngle-angle)
      );
      return Math.abs(diff)<=half+.0001;
    };

    const mineableWalls=[
      ...DebugMapService.walls(),
      ...(
        typeof DynamicWallService!=='undefined'
          ?DynamicWallService.all()
          :[]
      )
    ];

    for(const wall of mineableWalls){
      const left=Number(wall.x)||0;
      const top=Number(wall.y)||0;
      const right=left+Math.max(0,Number(wall.w)||0);
      const bottom=top+Math.max(0,Number(wall.h)||0);
      const closest=
        WorldGeometryService.closestPointOnRectPerimeter(
          ex,
          ey,
          wall
        );

      if(inSector(closest.x,closest.y))return true;
      if(inSector(left,top))return true;
      if(inSector(right,top))return true;
      if(inSector(left,bottom))return true;
      if(inSector(right,bottom))return true;
    }

    return false;
  },
  mineWall(entity,module,angle){
    if(!EntitySimulationAuthorityService.isLocal(entity))return false;
    if(
      !this.wallInSector(
        entity,
        module.range,
        module.halfAngle,
        angle
      )
    ){
      return false;
    }

    const config=this.config(
      entity,
      module.stateKey
    );
    const state=this.state(
      entity,
      module.stateKey,
      true
    );
    if(!config||!state)return false;

    const maxQuality=Math.max(
      1,
      Math.floor(Number(config.maxQuality)||1)
    );
    const minedQuality=this.effectiveQuality(
      entity,
      module.stateKey
    );

    // 채굴한 원석은 가능한 경우 빈 슬롯/최저 품질 슬롯에 반영한다.
    // amountPerWall을 지정한 공격은 벽 채굴 1회 성공당 여러 개를 획득한다.
    // 인벤토리가 가득 차도 벽 채굴 성공 자체는 취소하지 않는다.
    const amountPerWall=Math.max(
      1,
      Math.floor(Number(module.amountPerWall)||1)
    );
    for(let index=0;index<amountPerWall;index++){
      this.addOne(
        entity,
        module.stateKey,
        minedQuality
      );
    }

    // 품질 진행은 "벽을 실제로 채굴했는가"만 기준으로 한다.
    state.quality=Math.min(
      maxQuality,
      minedQuality+1
    );

    // 벽 채굴도 일반 적중과 동일한 공통 hit 사운드를 1회 재생한다.
    // 같은 프레임에 적 타격까지 동시에 발생하면 SoundService의 frame dedupe가 중복을 막는다.
    SoundService.play('hit');

    return true;
  },
  mineArea(entity,module){
    if(!EntitySimulationAuthorityService.isLocal(entity))return 0;
    const count=this.wallCellCountCircle(
      entity.x,
      entity.y,
      module.range,
      module.wallUnit
    );
    this.addMany(
      entity,
      module.stateKey,
      count,
      {
        collection:String(module.collection||'normal'),
        counterCapacity:
          Math.max(
            1,
            Math.floor(Number(module.counterCapacity)||10)
          ),
        advanceQuality:module.advanceQuality!==false
      }
    );
    return count;
  },
  recastGate(entity,module,now=performance.now()){
    if(!entity?.actionState)return false;

    const key=String(module.stateKey||'orbit-recast');
    const operation=String(module.operation||'check');
    const windowMs=Math.max(
      1,
      Number(module.window)||1000
    );
    const configuredMaxUses=
      Math.floor(Number(module.maxUses)||0);
    const unlimited=
      configuredMaxUses<=0;
    let state=entity.actionState.get(key)||null;

    if(
      state&&
      (
        state.kind!=='orbit-recast'||
        (
          Number(state.expiresAt||0)>0&&
          now>=Number(state.expiresAt||0)
        )
      )
    ){
      entity.actionState.delete(key);
      state=null;
    }

    if(operation==='check'){
      return (
        unlimited||
        !state||
        Math.max(0,Number(state.uses)||0)<configuredMaxUses
      );
    }

    if(operation==='commit'){
      if(module.requireExecuted===true&&module.executed===false){
        return false;
      }

      if(!state){
        state={
          kind:'orbit-recast',
          uses:1,
          // 첫 사용은 이미 기본 범위로 실행된 뒤 commit된다.
          // 다음 재사용은 2단계 범위를 사용한다.
          scaleStage:2,
          startedAt:now,
          // 이동 중에는 재사용 창을 소모하지 않는다.
          expiresAt:0
        };
        entity.actionState.set(key,state);
      }else{
        state.uses=
          Math.max(0,Number(state.uses)||0)+1;
        state.scaleStage=
          Math.min(
            5,
            Math.max(
              1,
              Number(state.scaleStage)||1
            )+1
          );
        // 이번 이동이 끝날 때까지 새 재사용 창을 정지.
        state.expiresAt=0;
      }

      return true;
    }

    if(operation==='start-window'){
      if(!state)return false;

      const cooldownAttackId=
        String(module.cooldownAttackId||'');
      const cooldownUntil=
        cooldownAttackId
          ?Math.max(
            0,
            Number(
              entity.cooldowns?.get(
                cooldownAttackId
              )
            )||0
          )
          :0;
      const windowStart=
        module.windowAfterCooldown===true
          ?Math.max(now,cooldownUntil)
          :now;

      state.expiresAt=
        windowStart+
        windowMs;
      return true;
    }

    return true;
  },
  rangeMultiplier(entity,config){
    const tags=Array.isArray(config?.rangeScaleTags)
      ?new Set(config.rangeScaleTags)
      :new Set();
    return Math.max(
      .05,
      1+AugmentService.rangeAdjustmentTotalForTags(
        entity,
        tags
      )
    );
  },
  projectileGeometry(entity,config,now=performance.now()){
    const attackId=String(config?.attackId||'');
    const base=attackId
      ?AbilityService.attackById(
        entity?.character,
        attackId
      )
      :null;
    const prepared=base
      ?AugmentService.prepareAttack(
        entity,
        base,
        now
      )
      :null;
    const projectile=prepared
      ?AttackModuleService.projectile(prepared)
      :null;
    return {
      attack:prepared,
      projectile,
      speed:Math.max(
        0,
        Number(projectile?.speed)||
        Number(config?.baseProjectileSpeed)||
        6.75
      ),
      radius:Math.max(
        1,
        Number(projectile?.radius)||
        Number(config?.itemRadius)||
        10
      ),
      hitRadius:Math.max(
        1,
        Number(projectile?.hitRadius)||
        Number(projectile?.radius)||
        Number(config?.itemRadius)||
        10
      )
    };
  },

  nearestEnemyOrbitTarget(entity,config){
    const rangeMultiplier=this.rangeMultiplier(
      entity,
      config
    );
    const maxRadius=Math.max(
      0,
      (Number(config?.orbitRadiusMax)||220)*
      rangeMultiplier
    );
    const itemRadius=this.projectileGeometry(
      entity,
      config
    ).hitRadius;

    let best=null;
    let bestDistance=Infinity;

    EntityService.forEachEnemy(entity,target=>{
      if(!target?.alive)return;

      const point=
        NetworkCollisionPositionService.point(target);
      const dx=
        Number(point.x)-Number(entity.x);
      const dy=
        Number(point.y)-Number(entity.y);
      const centerDistance=Math.hypot(dx,dy);
      const targetRadius=Math.max(
        0,
        Number(target.radius)||0
      );

      // 너무 가까운 적도 후보에서 제외하지 않는다.
      // 최대 궤도보다 멀어서 원석이 절대 닿을 수 없는 적만 제외.
      const nearestPossibleContact=
        Math.max(
          0,
          centerDistance-targetRadius-itemRadius
        );

      if(nearestPossibleContact>maxRadius){
        return;
      }

      if(centerDistance<bestDistance){
        bestDistance=centerDistance;
        best={
          target,
          centerDistance,
          targetRadius
        };
      }
    });

    return best;
  },
  desiredOrbitRadius(entity,config){
    const rangeMultiplier=this.rangeMultiplier(
      entity,
      config
    );
    const minRadius=Math.max(
      0,
      (Number(config?.orbitRadiusMin)||90)*
      rangeMultiplier
    );
    const maxRadius=Math.max(
      minRadius,
      (Number(config?.orbitRadiusMax)||220)*
      rangeMultiplier
    );

    if(String(config?.orbitRadiusMode||'')==='fixed'){
      return maxRadius;
    }

    const itemRadius=this.projectileGeometry(
      entity,
      config
    ).hitRadius;

    const target=
      this.nearestEnemyOrbitTarget(
        entity,
        config
      );

    if(!target){
      return maxRadius;
    }

    // 적이 지나치게 가까워져 계산값이 최소 반경 안쪽으로 들어와도
    // 최대 반경으로 복귀하지 않고 최소 반경을 그대로 유지한다.
    const desired=
      target.centerDistance-
      target.targetRadius-
      itemRadius*.5;

    return Math.max(
      minRadius,
      Math.min(
        maxRadius,
        desired
      )
    );
  },
  orbitRadius(entity,config,now=performance.now()){
    const syncedState=this.state(
      entity,
      config?.stateKey,
      false
    );
    if(
      syncedState?.remoteOrbitSync===true&&
      !EntitySimulationAuthorityService.isLocal(entity)&&
      Number.isFinite(Number(syncedState.syncedOrbitRadius))
    ){
      return Math.max(0,Number(syncedState.syncedOrbitRadius));
    }

    const rangeMultiplier=this.rangeMultiplier(
      entity,
      config
    );
    const minRadius=Math.max(
      0,
      (Number(config?.orbitRadiusMin)||90)*
      rangeMultiplier
    );
    const maxRadius=Math.max(
      minRadius,
      (Number(config?.orbitRadiusMax)||220)*
      rangeMultiplier
    );
    const state=this.state(
      entity,
      config?.stateKey,
      true
    );
    const desired=this.desiredOrbitRadius(
      entity,
      config
    );

    if(!state){
      return desired;
    }

    const previous=
      Number.isFinite(Number(state.orbitRadius))
        ?Number(state.orbitRadius)
        :desired;
    const previousAt=
      Number.isFinite(Number(state.orbitRadiusAt))
        ?Number(state.orbitRadiusAt)
        :Number(now);

    const dt=Math.max(
      0,
      Math.min(
        100,
        Number(now)-previousAt
      )
    );

    // 약 0.12초 수준으로 빠르게 목표 반경을 따라간다.
    // 적 사망/이탈로 desired가 maxRadius가 되어도 즉시 점프하지 않는다.
    const followMs=120;
    const blend=
      1-Math.exp(
        -dt/Math.max(1,followMs)
      );

    const resolved=
      previous+
      (desired-previous)*blend;

    state.orbitRadius=Math.max(
      minRadius,
      Math.min(
        maxRadius,
        resolved
      )
    );
    state.orbitRadiusAt=Number(now);

    return state.orbitRadius;
  },
  phaseSpeed(entity,config,now=performance.now()){
    if(!config)return 0;
    const syncedState=this.state(
      entity,
      config?.stateKey,
      false
    );
    if(
      syncedState?.remoteOrbitSync===true&&
      !EntitySimulationAuthorityService.isLocal(entity)&&
      Number.isFinite(Number(syncedState.syncedPhaseSpeed))
    ){
      return Number(syncedState.syncedPhaseSpeed);
    }

    const geometry=this.projectileGeometry(
      entity,
      config,
      now
    );
    const baseProjectileSpeed=Math.max(
      .001,
      Number(config.baseProjectileSpeed)||6.75
    );
    const projectileSpeedRatio=
      Math.max(0,Number(geometry.speed)||0)/
      baseProjectileSpeed;
    return (
      (Number(config.angularSpeed)||.0027)*
      projectileSpeedRatio
    );
  },
  phase(entity,state,config,now=performance.now()){
    if(!state||!config)return 0;

    const speed=this.phaseSpeed(
      entity,
      config,
      now
    );
    const previousAt=
      Number.isFinite(Number(state.phaseAt))
        ?Number(state.phaseAt)
        :Number(now);
    const dt=Math.max(
      0,
      Math.min(
        250,
        Number(now)-previousAt
      )
    );

    state.phase=
      (
        (Number(state.phase)||0)+
        dt*speed
      )%(Math.PI*2);
    state.phaseAt=Number(now);

    return state.phase;
  },

  points(entity,state,now=performance.now()){
    const config=this.config(entity,state?.stateKey);
    if(!config||!state)return [];

    const radius=this.orbitRadius(entity,config,now);
    const phase=this.phase(
      entity,
      state,
      config,
      now
    );
    const normalSlots=Math.max(
      1,
      Math.floor(
        Number(config.fixedSlots)||
        Number(config.capacity)||
        8
      )
    );

    const normal=state.items.map((item,index)=>{
      const slot=Math.max(
        0,
        Math.min(
          normalSlots-1,
          Number.isFinite(Number(item.slot))
            ?Math.floor(Number(item.slot))
            :index%normalSlots
        )
      );
      const angle=
        phase+
        Math.PI*2*slot/normalSlots;
      return {
        item,
        collection:'normal',
        x:(Number(entity.x)||0)+Math.cos(angle)*radius,
        y:(Number(entity.y)||0)+Math.sin(angle)*radius
      };
    });

    const counterItems=
      Array.isArray(state.counterItems)
        ?state.counterItems
        :[];
    const counterSlots=Math.max(
      1,
      Math.floor(Number(config.counterFixedSlots)||10)
    );
    const counterRadius=
      radius+
      Math.max(
        0,
        (Number(config.counterOrbitRadiusOffset)||40)*
        this.rangeMultiplier(entity,config)
      );

    const counter=counterItems.map((item,index)=>{
      const slot=Math.max(
        0,
        Math.min(
          counterSlots-1,
          Number.isFinite(Number(item.slot))
            ?Math.floor(Number(item.slot))
            :index%counterSlots
        )
      );
      const angle=
        -phase+
        Math.PI*2*slot/counterSlots;
      return {
        item,
        collection:'counter',
        x:(Number(entity.x)||0)+Math.cos(angle)*counterRadius,
        y:(Number(entity.y)||0)+Math.sin(angle)*counterRadius
      };
    });

    return [...normal,...counter];
  },
  resolvedItemKey(collection,itemId){
    return `${String(collection||'normal')}:${String(itemId||'')}`;
  },
  resolvedItems(state,create=false){
    if(!state)return null;
    if(state.resolvedProjectileItems instanceof Set){
      return state.resolvedProjectileItems;
    }
    if(!create)return null;
    state.resolvedProjectileItems=new Set();
    return state.resolvedProjectileItems;
  },
  markProjectileResolved(entity,stateKey,collection,itemId){
    const state=this.state(
      entity,
      String(stateKey||''),
      false
    );
    if(!state)return false;

    const set=this.resolvedItems(state,true);
    const key=this.resolvedItemKey(
      collection,
      itemId
    );
    set.add(key);

    // 원석 ID는 증가형이라 같은 state 안에서 재사용되지 않는다.
    // 장시간 전투에서도 로컬 tombstone이 무한 증가하지 않게 상한만 둔다.
    while(set.size>256){
      set.delete(set.values().next().value);
    }
    return true;
  },
  projectileWasResolved(state,collection,itemId){
    return !!this.resolvedItems(state,false)?.has(
      this.resolvedItemKey(
        collection,
        itemId
      )
    );
  },
  consumePoint(entity,state,point){
    if(!state||!point?.item)return false;
    const collection=
      point.collection==='counter'
        ?state.counterItems
        :state.items;
    const index=collection.findIndex(
      item=>String(item.id)===String(point.item.id)
    );
    if(index<0)return false;
    collection.splice(index,1);
    if(point.collection!=='counter'){
      this.resetIfEmpty(entity,state);
    }
    if(entity)entity.combatSnapshotDirty=true;
    return true;
  },
  consumeConfirmed(entity,networkMeta){
    if(
      !entity||
      !networkMeta||
      networkMeta.kind!=='orbit-inventory-projectile'
    )return false;

    const stateKey=String(networkMeta.stateKey||'');
    const collection=String(networkMeta.collection||'normal');
    const itemId=String(networkMeta.itemId||'');
    const state=this.state(
      entity,
      stateKey,
      false
    );
    if(!state)return false;

    const consumed=this.consumePoint(
      entity,
      state,
      {
        collection,
        item:{id:itemId}
      }
    );
    if(!consumed)return false;

    /*
      대상 권위의 적중 확정이 돌아온 시점에는 inventory만 줄이고 끝내지 않는다.
      소유자 화면에 남아 있는 정확한 orbit Projectile도 같은 itemId로 즉시 제거한다.
      finish()는 projectile-resolved를 다시 발생시키므로 상태 동기화 제거와 같은
      discard()를 사용해 중복 resolve 없이 시각/상태 객체만 정리한다.
    */
    this.markProjectileResolved(
      entity,
      stateKey,
      collection,
      itemId
    );

    const projectile=this.projectileFor(
      entity,
      stateKey,
      collection,
      itemId
    );
    if(projectile){
      const index=ProjectileService.items.indexOf(projectile);
      ProjectileService.discard(projectile);
      if(index>=0)ProjectileService.items.splice(index,1);
    }

    return true;
  },
  projectileNetworkKey(stateKey,collection,itemId){
    return [
      'orbit-inventory',
      String(stateKey||''),
      String(collection||'normal'),
      String(itemId||'')
    ].join(':');
  },
  projectileFor(entity,stateKey,collection,itemId){
    const key=this.projectileNetworkKey(
      stateKey,
      collection,
      itemId
    );
    return ProjectileService.items.find(projectile=>
      projectile?.source===entity&&
      String(projectile.networkKey||'')===key
    )||null;
  },
  preparedProjectileAttack(entity,config,item,now){
    const base=
      AbilityService.attackById(
        entity.character,
        String(config.attackId||'')
      );
    if(!base)return null;

    /*
      회전 원석 피해는 config.damage로 별도 재계산하지 않는다.
      config.attackId가 가리키는 AttackSpec을 단일 원본으로 사용한다.
    */
    return AugmentService.prepareAttack(
      entity,
      base,
      now
    );
  },
  spawnProjectile(entity,state,point,now){
    const config=this.config(entity,state?.stateKey);
    if(!config||!point?.item)return null;

    const attack=this.preparedProjectileAttack(
      entity,
      config,
      point.item,
      now
    );
    if(!attack)return null;

    const delivery=
      AttackModuleService.projectile(attack);
    if(!delivery)return null;

    const execution=
      AttackExecutionService.create(
        entity,
        attack,
        0
      );
    const volley={
      execution,
      total:1,
      resolved:0,
      hits:0,
      finished:false
    };

    const projectile={
      ...delivery,
      renderColor:
        this.palette(config,point.item.quality),
      orbit:{
        ...(delivery.orbit||{}),
        anchor:'source',
        duration:0
      }
    };

    const spawned=ProjectileService.spawn({
      source:entity,
      attack,
      volley,
      x:Number(point.x)||Number(entity.x)||0,
      y:Number(point.y)||Number(entity.y)||0,
      origin:{
        x:Number(entity.x)||0,
        y:Number(entity.y)||0
      },
      angle:0,
      networkKey:
        this.projectileNetworkKey(
          state.stateKey,
          point.collection,
          point.item.id
        ),
      networkMeta:{
        kind:'orbit-inventory-projectile',
        stateKey:state.stateKey,
        collection:point.collection,
        itemId:String(point.item.id)
      },
      orbitInventoryMeta:{
        stateKey:state.stateKey,
        collection:point.collection,
        itemId:String(point.item.id)
      },
      predictiveConsumeOnContact:false,
      projectile,
      behavior:
        ProjectileModuleService.config(attack)
    });

    return spawned;
  },
  syncProjectiles(entity,state,points,now){
    const desiredKeys=new Set(
      points.map(point=>
        this.projectileNetworkKey(
          state.stateKey,
          point.collection,
          point.item.id
        )
      )
    );
    const keptKeys=new Set();

    for(
      let index=ProjectileService.items.length-1;
      index>=0;
      index--
    ){
      const projectile=
        ProjectileService.items[index];
      const meta=projectile?.orbitInventoryMeta;

      if(
        projectile?.source!==entity||
        meta?.stateKey!==state.stateKey
      )continue;

      const key=this.projectileNetworkKey(
        meta.stateKey,
        meta.collection,
        meta.itemId
      );
      const shouldKeep=
        desiredKeys.has(key)&&
        !keptKeys.has(key);

      if(shouldKeep){
        keptKeys.add(key);
        continue;
      }

      // 상태 동기화/중복 정리는 게임플레이상의 투사체 소멸이 아니다.
      // projectile-resolved를 발생시키면 살아 있는 inventory item까지 소비될 수 있다.
      ProjectileService.discard(projectile);
      ProjectileService.items.splice(index,1);
    }

    for(const point of points){
      let projectile=
        this.projectileFor(
          entity,
          state.stateKey,
          point.collection,
          point.item.id
        );

      if(!projectile){
        projectile=this.spawnProjectile(
          entity,
          state,
          point,
          now
        );
      }
      if(!projectile)continue;

      if(!projectile.orbitState){
        ProjectileOrbitService.initialize(
          projectile,
          now
        );
      }

      const dx=
        Number(point.x)-Number(entity.x);
      const dy=
        Number(point.y)-Number(entity.y);

      projectile.orbitState.externalRadius=
        Math.hypot(dx,dy);
      projectile.orbitState.externalAngle=
        Math.atan2(dy,dx);
    }

    return true;
  },
  clear(entity,{preserveInventory=false}={}){
    if(!entity)return false;

    let changed=false;
    const stateKeys=new Set();

    for(const [key,state] of entity.actionState||[]){
      if(state?.kind!==this.KIND)continue;

      stateKeys.add(
        String(state.stateKey||key)
      );

      if(!preserveInventory){
        entity.actionState.delete(key);
      }

      changed=true;
    }

    if(entity.actionState?.has('atsuteo-rmb-chain')){
      entity.actionState.delete(
        'atsuteo-rmb-chain'
      );
      changed=true;
    }

    for(
      let index=ProjectileService.items.length-1;
      index>=0;
      index--
    ){
      const projectile=
        ProjectileService.items[index];
      const meta=
        projectile?.orbitInventoryMeta;

      if(
        projectile?.source!==entity||
        !meta
      )continue;

      if(
        stateKeys.size&&
        !stateKeys.has(
          String(meta.stateKey||'')
        )
      )continue;

      /*
        태그 시에는 실제 원석 Projectile만 치우고
        inventory item 자체는 소비하지 않는다.
        다시 해당 캐릭터가 활성화되면 syncProjectiles가
        같은 item 상태를 기준으로 Projectile을 복구한다.
      */
      ProjectileService.discard(projectile);
      ProjectileService.items.splice(index,1);
      changed=true;
    }

    return changed;
  },
  update(entity,now=performance.now()){
    const config=this.config(entity);
    if(!config)return false;
    const state=this.state(
      entity,
      config.stateKey,
      false
    );
    if(!state)return false;

    const recast=
      entity.actionState?.get(
        'atsuteo-rmb-chain'
      );
    if(
      recast?.kind==='orbit-recast'&&
      Number(recast.expiresAt||0)>0&&
      now>=Number(recast.expiresAt||0)
    ){
      entity.actionState.delete(
        'atsuteo-rmb-chain'
      );
    }

    const points=this.points(
      entity,
      state,
      now
    );
    this.syncProjectiles(
      entity,
      state,
      points,
      now
    );

    return true;
  },
  serialize(entity,now=performance.now()){
    const config=this.config(entity);
    if(!config)return null;
    const state=this.state(entity,config.stateKey,false);
    if(!state)return null;
    const phase=this.phase(
      entity,
      state,
      config,
      now
    );
    return {
      stateKey:state.stateKey,
      quality:state.quality,
      phase,
      phaseSpeed:this.phaseSpeed(
        entity,
        config,
        now
      ),
      orbitRadius:this.orbitRadius(
        entity,
        config,
        now
      ),
      items:state.items.map(item=>({
        id:item.id,
        quality:item.quality,
        slot:item.slot
      })),
      counterItems:(state.counterItems||[]).map(item=>({
        id:item.id,
        quality:item.quality,
        slot:item.slot
      })),
      nextId:state.nextId
    };
  },
  applyRemote(
    entity,
    snapshot,
    now=performance.now(),
    packetSentAt=null
  ){
    const config=this.config(entity,snapshot?.stateKey);
    if(!config||!snapshot)return false;
    const state=this.state(entity,config.stateKey,true);
    state.quality=Math.max(1,Math.min(Number(config.maxQuality)||12,Math.floor(Number(snapshot.quality)||1)));

    const speed=
      Number.isFinite(Number(snapshot.phaseSpeed))
        ?Number(snapshot.phaseSpeed)
        :this.phaseSpeed(
          entity,
          config,
          now
        );
    state.remoteOrbitSync=true;
    state.syncedPhaseSpeed=speed;
    const transportMs=
      Number.isFinite(Number(packetSentAt))
        ?Math.max(
          0,
          Math.min(
            1000,
            Date.now()-Number(packetSentAt)
          )
        )
        :0;
    state.phase=
      (
        (Number(snapshot.phase)||0)+
        transportMs*speed
      )%(Math.PI*2);
    state.phaseAt=Number(now);

    if(Number.isFinite(Number(snapshot.orbitRadius))){
      const syncedRadius=Math.max(
        0,
        Number(snapshot.orbitRadius)
      );
      state.syncedOrbitRadius=syncedRadius;
      state.orbitRadius=syncedRadius;
      state.orbitRadiusAt=Number(now);
    }
    state.items=Array.isArray(snapshot.items)
      ?snapshot.items
        .filter(item=>
          !this.projectileWasResolved(
            state,
            'normal',
            item?.id
          )
        )
        .map((item,index)=>({
          id:String(item.id),
          quality:Math.max(1,Math.floor(Number(item.quality)||1)),
          slot:Number.isFinite(Number(item.slot))
            ?Math.floor(Number(item.slot))
            :index
        }))
      :[];
    state.counterItems=Array.isArray(snapshot.counterItems)
      ?snapshot.counterItems
        .filter(item=>
          !this.projectileWasResolved(
            state,
            'counter',
            item?.id
          )
        )
        .map((item,index)=>({
          id:String(item.id),
          quality:Math.max(1,Math.floor(Number(item.quality)||1)),
          slot:Number.isFinite(Number(item.slot))
            ?Math.floor(Number(item.slot))
            :index
        }))
      :[];
    state.nextId=Math.max(1,Math.floor(Number(snapshot.nextId)||1));
    return true;
  },
  draw(ctx,entity,now=performance.now()){
    return false;
  },
  drawCountGauge(ctx,entity,x,y,width){
    const config=this.config(entity);
    if(!ctx||!config)return 0;
    const state=this.state(entity,config.stateKey,false);
    if(!state)return 0;
    const count=Math.max(0,Math.min(Number(config.capacity)||8,state.items.length));
    const capacity=Math.max(1,Math.floor(Number(config.capacity)||8));
    const gap=2;
    const height=4;
    const cellWidth=(width-gap*(capacity-1))/capacity;
    for(let i=0;i<capacity;i++){
      ctx.fillStyle='#111';
      ctx.fillRect(x+i*(cellWidth+gap),y,cellWidth,height);
      if(i<count){
        ctx.fillStyle=this.palette(config,state.items[i].quality);
        ctx.fillRect(x+i*(cellWidth+gap),y,cellWidth,height);
      }
    }
    return height+WorldGaugeBarPresentationService.gap;
  }
});