

/* 범용 이동기.
   기본 control은 fixed.
   input은 이동 중 마지막으로 입력된 유효 WASD 방향을 기억하고,
   입력을 떼더라도 그 마지막 방향으로 계속 이동한다.
   passWalls/passEnemies가 false이면 충돌한 순간 이동을 즉시 종료한다. */

/* movement.move의 단일 실행 서비스.
   speed(units/sec), duration(ms), distance 중 두 값으로 나머지 하나를 계산한다.
   control 기본값은 fixed이며 input은 마지막 유효 이동 입력 방향을 계속 유지한다. */

/* input.drag-path: 포인터 드래그 경로를 수집해 release 단계의 Attack/Movement 모듈에 전달한다.
   거리 기반 지속 스테미나 소모, 진행도 상태, 이동 잠금, 경로 프리뷰를 같은 범용 입력 상태로 관리한다. */
const DragPathInputService=Object.freeze({
  KIND:'drag-path-state',
  MAX_POINTS:1024,

  state(entity,stateKey){
    const value=entity?.actionState?.get(String(stateKey||''))||null;
    return value?.kind===this.KIND?value:null;
  },

  abilityModule(ability,operation=null){
    for(const trigger of [ability?.trigger,ability?.releaseTrigger]){
      for(const module of trigger?.modules||[]){
        if(module?.type!=='input.drag-path')continue;
        if(operation&&String(module.operation||'')!==operation)continue;
        return module;
      }
    }
    return null;
  },

  pointerWorld(){
    if(typeof Training==='undefined'||!Training.active)return null;
    const point=Training.mouseWorld();
    return {
      x:Number(point?.x)||0,
      y:Number(point?.y)||0
    };
  },

  start(context,module){
    const source=context.source;
    if(
      !source?.actionState||
      context.network===true
    ){
      if(context.network===true){
        context.handled=true;
        context.executed=true;
      }
      return context.network===true;
    }

    const stateKey=String(module.stateKey||'');
    if(!stateKey||this.state(source,stateKey))return false;

    const now=Number(context.now)||performance.now();
    const world=this.pointerWorld()||{
      x:Number(source.x)||0,
      y:Number(source.y)||0
    };
    const screen={
      x:Number(Training?.mouse?.x)||0,
      y:Number(Training?.mouse?.y)||0
    };
    const distanceMode=
      String(module.distanceMode||'world')==='screen'
        ?'screen'
        :'world';

    const path=
      distanceMode==='world'
        ?[
          {
            x:Number(source.x)||0,
            y:Number(source.y)||0
          }
        ]
        :[
          {
            x:world.x,
            y:world.y
          }
        ];

    const state={
      kind:this.KIND,
      stateKey,
      abilityId:String(context.ability?.id||''),
      resourceConditionSnapshot:
        AugmentService.captureResourceConditionSnapshot(
          source
        ),
      progressStateKey:String(module.progressStateKey||''),
      distanceMode,
      threshold:Math.max(0,Number(module.threshold)||0),
      maxDistance:
        Number.isFinite(Number(module.maxDistance))
          ?Math.max(0,Number(module.maxDistance))
          :Infinity,
      sampleInterval:Math.max(0,Number(module.sampleInterval)||0),
      lastSampleAt:now,
      totalDistance:0,
      rewindOffset:0,
      spent:0,
      frozen:false,
      lockMovement:module.lockMovement===true,
      pathOrigin:String(module.pathOrigin||'pointer'),
      previewPath:module.previewPath===true,
      previewColor:String(module.previewColor||'255,215,0'),
      previewLivePointer:module.previewLivePointer===true,
      previewAlphaBeforeThreshold:Number.isFinite(Number(module.previewAlphaBeforeThreshold))?Math.max(0,Math.min(1,Number(module.previewAlphaBeforeThreshold))):.72,
      previewAlphaActive:Number.isFinite(Number(module.previewAlphaActive))?Math.max(0,Math.min(1,Number(module.previewAlphaActive))):.72,
      previewLineWidth:Math.max(.5,Number(module.previewLineWidth)||2.5),
      previewDash:Array.isArray(module.previewDash)?[...module.previewDash]:[6,4],
      previewStartPoint:module.previewStartPoint?{...module.previewStartPoint}:null,
      previewEndPoint:module.previewEndPoint?{...module.previewEndPoint}:null,
      cost:{
        min:Math.max(0,Number(module.cost?.min)||0),
        max:Math.max(0,Number(module.cost?.max)||0),
        perDistance:Math.max(0,Number(module.cost?.perDistance)||0)
      },
      path,
      screenPath:[{x:screen.x,y:screen.y}],
      segmentDistances:[],
      pathBreaks:[],
      lastWorld:
        distanceMode==='world'&&String(module.pathOrigin||'pointer')==='source'
          ?{x:Number(source.x)||0,y:Number(source.y)||0}
          :world,
      lastScreen:screen
    };

    source.actionState.set(stateKey,state);

    if(state.progressStateKey){
      ProgressStateService.apply(
        source,
        {
          stateKey:state.progressStateKey,
          max:1,
          operation:'set',
          value:0
        }
      );
    }

    context.handled=true;
    context.executed=true;
    return true;
  },

  rewindStart(context,module){
    const source=context.source;
    if(!source?.actionState||context.network===true){
      if(context.network===true){
        context.handled=true;
        context.executed=true;
      }
      return context.network===true;
    }

    const stateKey=String(module.stateKey||'');
    const targetStateKey=String(module.targetStateKey||'');
    const target=this.state(source,targetStateKey);
    if(!stateKey||!target||this.state(source,stateKey))return false;

    const now=Number(context.now)||performance.now();
    const world=this.pointerWorld()||{x:Number(source.x)||0,y:Number(source.y)||0};
    const screen={x:Number(Training?.mouse?.x)||0,y:Number(Training?.mouse?.y)||0};
    const distanceMode=String(module.distanceMode||'screen')==='world'?'world':'screen';
    const state={
      kind:this.KIND,
      stateKey,
      mode:'rewind',
      targetStateKey,
      distanceMode,
      distanceScale:Math.max(0,Number(module.distanceScale)||1),
      sampleInterval:Math.max(0,Number(module.sampleInterval)||0),
      lastSampleAt:now,
      lastWorld:world,
      lastScreen:screen,
      path:[{x:world.x,y:world.y}],
      screenPath:[{x:screen.x,y:screen.y}],
      segmentDistances:[],
      pathBreaks:[],
      totalDistance:0,
      spent:0,
      frozen:false,
      previewPath:module.previewPath===true,
      previewRole:'rewind',
      previewColor:String(module.previewColor||'255,215,0'),
      previewLivePointer:module.previewLivePointer===true,
      previewAlphaBeforeThreshold:Number.isFinite(Number(module.previewAlphaBeforeThreshold))?Math.max(0,Math.min(1,Number(module.previewAlphaBeforeThreshold))):.72,
      previewAlphaActive:Number.isFinite(Number(module.previewAlphaActive))?Math.max(0,Math.min(1,Number(module.previewAlphaActive))):.72,
      previewLineWidth:Math.max(.5,Number(module.previewLineWidth)||2.5),
      previewDash:Array.isArray(module.previewDash)?[...module.previewDash]:[6,4],
      previewStartPoint:module.previewStartPoint?{...module.previewStartPoint}:null,
      previewEndPoint:module.previewEndPoint?{...module.previewEndPoint}:null,
      lockMovement:false
    };
    target.suspendedBy=stateKey;
    source.actionState.set(stateKey,state);
    context.handled=true;
    context.executed=true;
    return true;
  },

  desiredCost(state,segmentDistance){
    const distance=Math.max(0,Number(segmentDistance)||0);
    if(distance<=0)return 0;

    if(state.cost.perDistance>0){
      return distance*state.cost.perDistance;
    }

    const min=state.cost.min;
    const max=Math.max(min,state.cost.max);
    if(max<=0||state.maxDistance<=state.threshold)return 0;

    const before=Math.max(
      0,
      (Number(state.totalDistance)||0)-(Number(state.rewindOffset)||0)
    );
    const after=Math.min(
      state.maxDistance,
      before+distance
    );
    let desired=0;

    if(before<state.threshold&&after>=state.threshold){
      desired+=min;
    }

    const scalableStart=Math.max(
      state.threshold,
      before
    );
    const scalableEnd=Math.max(
      state.threshold,
      after
    );
    if(scalableEnd>scalableStart&&max>min){
      desired+=
        (scalableEnd-scalableStart)*
        (max-min)/
        Math.max(.001,state.maxDistance-state.threshold);
    }

    // 이미 지불한 총액으로 다시 그리기 비용을 상쇄하지 않는다.
    // 덧칠로 유효 드래그 길이가 감소한 뒤 같은 구간을 다시 늘리면 그 구간 비용을 다시 지불한다.
    return Math.max(0,desired);
  },

  spend(source,state,amount,now){
    const value=Math.max(0,Number(amount)||0);
    if(value<=0)return true;
    if(!StaminaService.spend(source,value,now)){
      state.frozen=true;
      return false;
    }
    state.spent+=value;
    ResourceValueService.normalizeStamina(source);
    if(Math.max(0,Number(source?.stamina)||0)<=.001){
      state.frozen=true;
    }
    return true;
  },

  // spendSegment: 드래그 한 구간의 비용을 지불하고 실제로 기록 가능한 거리까지 반환한다.
  // 스테미나가 부족하면 남은 스테미나를 가능한 거리만큼 정확히 소모하고 frozen 상태로 전환한다.
  spendSegment(source,state,distance,now){
    const requested=Math.max(0,Number(distance)||0);
    if(requested<=0)return 0;

    const desired=this.desiredCost(state,requested);
    if(desired<=0)return requested;

    ResourceValueService.normalizeStamina(source);
    const available=Math.max(0,Number(source?.stamina)||0);
    if(available>=desired){
      if(!this.spend(source,state,desired,now))return 0;
      return requested;
    }

    if(available<=0){
      state.frozen=true;
      return 0;
    }

    // 거리당 비용은 남은 스테미나에 정확히 대응하는 거리까지만 기록한다.
    if(state.cost.perDistance>0){
      const accepted=Math.max(
        0,
        Math.min(
          requested,
          available/state.cost.perDistance
        )
      );
      const cost=accepted*state.cost.perDistance;
      if(cost>0&&StaminaService.spend(source,cost,now)){
        state.spent+=cost;
      }
      ResourceValueService.normalizeStamina(source);
      state.frozen=true;
      return accepted;
    }

    // 최소 비용/구간 비례 비용은 현재 남은 스테미나로 지불 가능한 최대 거리를 찾는다.
    let low=0;
    let high=requested;
    for(let index=0;index<18;index++){
      const middle=(low+high)/2;
      if(this.desiredCost(state,middle)<=available){
        low=middle;
      }else{
        high=middle;
      }
    }

    let accepted=low;
    let cost=this.desiredCost(state,accepted);
    if(accepted>.001&&cost>0){
      if(StaminaService.spend(source,cost,now)){
        state.spent+=cost;
      }else{
        accepted=0;
        cost=0;
      }
    }

    // 최소 비용 경계를 넘기 직전처럼 거리는 더 기록할 수 없지만 남은 스테미나는
    // 다음 동일 드래그를 이어 그릴 때 사용할 선지불분으로 보존한다.
    if(accepted<=.001){
      const prepaid=Math.min(
        available,
        Math.max(0,this.desiredCost(state,requested))
      );
      if(prepaid>0&&StaminaService.spend(source,prepaid,now)){
        state.spent+=prepaid;
      }
    }

    state.frozen=true;
    return accepted;
  },

  setProgress(source,state){
    if(!state.progressStateKey)return;
    const denominator=
      Number.isFinite(state.maxDistance)&&state.maxDistance>0
        ?Math.max(
          .001,
          state.maxDistance-state.threshold
        )
        :1;
    const effectiveDistance=Math.max(
      0,
      (Number(state.totalDistance)||0)-(Number(state.rewindOffset)||0)
    );
    const progress=
      effectiveDistance<state.threshold
        ?0
        :Math.max(
          0,
          Math.min(
            1,
            (effectiveDistance-state.threshold)/denominator
          )
        );

    ProgressStateService.apply(
      source,
      {
        stateKey:state.progressStateKey,
        max:1,
        operation:'set',
        value:progress
      }
    );
  },

  appendPoint(state,point,screenPoint=null,segmentDistance=0){
    if(!state||!point)return false;
    const path=state.path;
    const last=path[path.length-1];
    if(
      last&&
      Math.hypot(
        Number(point.x)-Number(last.x),
        Number(point.y)-Number(last.y)
      )<=.5
    )return false;

    if(path.length>=this.MAX_POINTS){
      // 경로 역감기 정확도를 위해 단순 압축 대신 가장 오래된 중간점을 하나 제거하고
      // 인접 세그먼트 거리를 합친다. 화면/월드 끝점 대응은 그대로 유지한다.
      if(path.length>2){
        path.splice(1,1);
        if(Array.isArray(state.screenPath)&&state.screenPath.length>1)state.screenPath.splice(1,1);
        if(Array.isArray(state.segmentDistances)&&state.segmentDistances.length>1){
          state.segmentDistances[1]=(Number(state.segmentDistances[0])||0)+(Number(state.segmentDistances[1])||0);
          state.segmentDistances.splice(0,1);
        }
      }
    }

    path.push({
      x:Number(point.x)||0,
      y:Number(point.y)||0
    });
    if(!Array.isArray(state.screenPath))state.screenPath=[];
    state.screenPath.push(screenPoint?{x:Number(screenPoint.x)||0,y:Number(screenPoint.y)||0}:null);
    if(!Array.isArray(state.segmentDistances))state.segmentDistances=[];
    state.segmentDistances.push(Math.max(0,Number(segmentDistance)||0));
    return true;
  },

  // beginPreviewSegment: 기존 누적 거리에는 영향을 주지 않고 새 프리뷰 선분의 시작점을 만든다.
  // 재개 입력처럼 포인터 기준점만 이동해야 할 때 이전 경로 끝과 직선으로 연결되는 것을 막는다.
  beginPreviewSegment(state,world,screen){
    if(!state||!world)return false;
    if(!Array.isArray(state.path))state.path=[];
    if(!Array.isArray(state.screenPath))state.screenPath=[];
    if(!Array.isArray(state.segmentDistances))state.segmentDistances=[];
    if(!Array.isArray(state.pathBreaks))state.pathBreaks=[];

    const point={x:Number(world.x)||0,y:Number(world.y)||0};
    const screenPoint=screen?{x:Number(screen.x)||0,y:Number(screen.y)||0}:null;
    const last=state.path[state.path.length-1]||null;
    if(last&&Math.hypot(point.x-Number(last.x),point.y-Number(last.y))<=.5){
      state.lastWorld=point;
      if(screenPoint)state.lastScreen=screenPoint;
      return false;
    }

    const index=state.path.length;
    state.path.push(point);
    state.screenPath.push(screenPoint);
    state.segmentDistances.push(0);
    state.pathBreaks.push(index);
    state.lastWorld=point;
    if(screenPoint)state.lastScreen=screenPoint;
    return true;
  },

  rewindDistance(source,state,distance){
    if(!state)return 0;
    const requested=Math.max(0,Number(distance)||0);
    if(requested<=0)return 0;
    const before=Math.max(0,Number(state.rewindOffset)||0);
    const maxRewind=Math.max(0,Number(state.totalDistance)||0);
    state.rewindOffset=Math.min(maxRewind,before+requested);
    this.setProgress(source,state);
    return Math.max(0,state.rewindOffset-before);
  },

  sample(now=performance.now()){
    if(
      typeof Training==='undefined'||
      !Training.active||
      !Training.player?.actionState
    )return false;

    const source=Training.player;
    let changed=false;

    for(const state of source.actionState.values()){
      if(state?.kind!==this.KIND)continue;

      if(state.mode==='rewind'){
        if(now-state.lastSampleAt<state.sampleInterval)continue;
        const target=this.state(source,state.targetStateKey);
        if(!target)continue;
        const world=this.pointerWorld();
        if(!world)continue;
        const screen={x:Number(Training.mouse?.x)||0,y:Number(Training.mouse?.y)||0};
        const distance=state.distanceMode==='world'
          ?Math.hypot(world.x-state.lastWorld.x,world.y-state.lastWorld.y)
          :Math.hypot(screen.x-state.lastScreen.x,screen.y-state.lastScreen.y);
        state.lastWorld={x:world.x,y:world.y};
        state.lastScreen=screen;
        state.lastSampleAt=now;
        if(distance<=.001)continue;
        state.totalDistance+=distance;
        this.appendPoint(state,world,screen,distance);
        const rewound=this.rewindDistance(source,target,distance*state.distanceScale);
        if(rewound>0){
          // 덧칠은 원래 LMB 경로를 지우지 않는다. 효과값만 감소시키고,
          // RMB 종료 후 LMB가 현재 포인터 위치에서 자연스럽게 이어지도록 샘플 기준만 옮긴다.
          target.lastWorld={x:world.x,y:world.y};
          target.lastScreen={x:screen.x,y:screen.y};
          target.lastSampleAt=now;
          changed=true;
        }
        continue;
      }

      if(state.suspendedBy&&this.state(source,state.suspendedBy))continue;
      if(state.suspendedBy)state.suspendedBy='';

      // 스테미나 부족으로 멈춘 드래그는 입력 자체를 끝내지 않는다.
      // 외부 회복/디버그 등으로 스테미나가 다시 생기면 같은 드래그 상태에서 즉시 이어 그린다.
      if(state.frozen){
        ResourceValueService.normalizeStamina(source);
        if(Math.max(0,Number(source.stamina)||0)<=0)continue;
        state.frozen=false;
        state.lastSampleAt=now-state.sampleInterval;
      }

      if(now-state.lastSampleAt<state.sampleInterval)continue;

      const world=this.pointerWorld();
      if(!world)continue;
      const screen={
        x:Number(Training.mouse?.x)||0,
        y:Number(Training.mouse?.y)||0
      };

      const rawDistance=
        state.distanceMode==='screen'
          ?Math.hypot(
            screen.x-state.lastScreen.x,
            screen.y-state.lastScreen.y
          )
          :Math.hypot(
            world.x-state.lastWorld.x,
            world.y-state.lastWorld.y
          );
      if(rawDistance<=.001){
        state.lastSampleAt=now;
        continue;
      }

      // maxDistance는 '유효 드래그 길이(totalDistance-rewindOffset)'의 상한이다.
      // 덧칠로 길이를 줄였다면 다시 그리는 구간은 rewindOffset을 먼저 되돌리며,
      // 그 구간에도 정상적으로 스테미나 비용이 다시 발생한다.
      const bounded=Number.isFinite(state.maxDistance);
      const effectiveBefore=Math.max(
        0,
        (Number(state.totalDistance)||0)-(Number(state.rewindOffset)||0)
      );
      const remaining=bounded
        ?Math.max(0,state.maxDistance-effectiveBefore)
        :rawDistance;
      if(bounded&&remaining<=.001){
        state.lastWorld={x:world.x,y:world.y};
        state.lastScreen={x:screen.x,y:screen.y};
        state.lastSampleAt=now;
        this.setProgress(source,state);
        continue;
      }
      const requestedDistance=bounded?Math.min(rawDistance,remaining):rawDistance;
      const accepted=this.spendSegment(
        source,
        state,
        requestedDistance,
        now
      );
      if(accepted<=.001)continue;

      const ratio=accepted/rawDistance;
      const sampledWorld={
        x:state.lastWorld.x+(world.x-state.lastWorld.x)*ratio,
        y:state.lastWorld.y+(world.y-state.lastWorld.y)*ratio
      };
      const sampledScreen={
        x:state.lastScreen.x+(screen.x-state.lastScreen.x)*ratio,
        y:state.lastScreen.y+(screen.y-state.lastScreen.y)*ratio
      };

      let forwardRemaining=accepted;
      if((Number(state.rewindOffset)||0)>0){
        const restored=Math.min(Math.max(0,Number(state.rewindOffset)||0),forwardRemaining);
        state.rewindOffset=Math.max(0,(Number(state.rewindOffset)||0)-restored);
        forwardRemaining-=restored;
      }
      if(forwardRemaining>0){
        state.totalDistance=Number.isFinite(state.maxDistance)
          ?Math.min(state.maxDistance,state.totalDistance+forwardRemaining)
          :state.totalDistance+forwardRemaining;
      }
      state.lastWorld=sampledWorld;
      state.lastScreen=sampledScreen;
      state.lastSampleAt=now;
      this.appendPoint(state,sampledWorld,sampledScreen,accepted);
      this.setProgress(source,state);
      changed=true;
    }

    return changed;
  },

  releaseData(entity,ability){
    const module=this.abilityModule(ability,'start');
    if(!module)return null;
    const state=this.state(entity,module.stateKey);
    if(!state)return null;

    const progressState=state.progressStateKey
      ?ProgressStateService.state(entity,state.progressStateKey)
      :null;

    return {
      dragStateKey:state.stateKey,
      dragDistance:Math.max(0,Number(state.totalDistance)||0),
      dragProgress:progressState
        ?Math.max(0,Math.min(1,Number(progressState.value)||0))
        :0,
      dragPath:state.path.map(point=>({
        x:Number(point.x)||0,
        y:Number(point.y)||0
      }))
    };
  },

  capturePointer(source,state,now=performance.now()){
    if(!source||!state||state.distanceMode!=='world')return true;
    // 이미 스테미나 부족으로 동결된 경로는 마지막으로 확정된 유효 지점까지만 사용한다.
    if(state.frozen===true)return true;
    const world=this.pointerWorld();
    if(!world)return true;
    const rawDistance=Math.hypot(
      world.x-state.lastWorld.x,
      world.y-state.lastWorld.y
    );
    if(rawDistance<=.001){
      // 단순 우클릭도 source → 현재 포인터 경로를 갖도록 보장한다.
      if(state.path.length===1&&state.pathOrigin==='source'){
        this.appendPoint(state,world,{x:Number(Training?.mouse?.x)||0,y:Number(Training?.mouse?.y)||0},rawDistance);
      }
      return true;
    }
    const cost=this.desiredCost(state,rawDistance);
    if(!this.spend(source,state,cost,now))return false;
    state.totalDistance+=rawDistance;
    state.lastWorld={x:world.x,y:world.y};
    state.lastScreen={x:Number(Training?.mouse?.x)||0,y:Number(Training?.mouse?.y)||0};
    state.lastSampleAt=now;
    this.appendPoint(state,world,state.lastScreen,rawDistance);
    this.setProgress(source,state);
    return true;
  },

  release(context,module){
    const source=context.source;
    const stateKey=String(module.stateKey||context.dragStateKey||'');
    let path=null;
    let distance=0;
    let progress=0;

    if(context.network===true){
      path=Array.isArray(context.dragPath)
        ?context.dragPath
          .filter(point=>
            Number.isFinite(Number(point?.x))&&
            Number.isFinite(Number(point?.y))
          )
          .slice(0,this.MAX_POINTS)
          .map(point=>({
            x:Number(point.x),
            y:Number(point.y)
          }))
        :[];
      distance=Math.max(0,Number(context.dragDistance)||0);
      progress=Math.max(0,Math.min(1,Number(context.dragProgress)||0));
      if(module.progressStateKey){
        ProgressStateService.apply(
          source,
          {
            stateKey:String(module.progressStateKey),
            max:1,
            operation:'set',
            value:progress
          }
        );
      }
    }else{
      const state=this.state(source,stateKey);
      if(!state){
        context.handled=true;
        return false;
      }
      if(
        module.capturePointer===true&&
        !this.capturePointer(source,state,Number(context.now)||performance.now())
      ){
        context.handled=true;
        return false;
      }
      if(
        module.allowClick===true&&
        state.totalDistance<Math.max(0,Number(module.threshold)||0)&&
        String(module.clickCost||'')==='min'&&
        state.spent<=0&&
        state.cost.min>0
      ){
        if(!this.spend(source,state,state.cost.min,Number(context.now)||performance.now())){
          context.handled=true;
          return false;
        }
      }
      path=state.path.map(point=>({x:point.x,y:point.y}));
      distance=Math.max(0,Number(state.totalDistance)||0);
      const progressState=state.progressStateKey
        ?ProgressStateService.state(source,state.progressStateKey)
        :null;
      progress=progressState
        ?Math.max(0,Math.min(1,Number(progressState.value)||0))
        :0;
      context.resourceConditionSnapshot=
        state.resourceConditionSnapshot||
        null;
    }

    const threshold=Math.max(0,Number(module.threshold)||0);
    const minimumPoints=Math.max(0,Math.floor(Number(module.minimumPoints)||0));
    const ready=
      (distance>=threshold||module.allowClick===true)&&
      (path.length>=minimumPoints||module.allowClick===true);

    context.dragPath=path;
    context.dragDistance=distance;
    context.dragProgress=progress;
    context.dragReady=ready;

    if(!ready){
      context.handled=true;
      return false;
    }

    return true;
  },

  clear(entity,module){
    if(!entity?.actionState)return false;
    const stateKey=String(module?.stateKey||'');
    const progressStateKey=String(module?.progressStateKey||'');
    let changed=false;

    if(stateKey){
      const state=this.state(entity,stateKey);
      if(state?.mode==='rewind'){
        const target=this.state(entity,state.targetStateKey);
        if(target&&module?.preservePathOnTarget===true&&Array.isArray(state.path)&&state.path.length>1){
          if(!Array.isArray(target.previewOverlayPaths))target.previewOverlayPaths=[];
          target.previewOverlayPaths.push({
            path:state.path.map(point=>({x:Number(point.x)||0,y:Number(point.y)||0})),
            pathBreaks:Array.isArray(state.pathBreaks)?[...state.pathBreaks]:[],
            color:String(state.previewColor||'255,215,0'),
            alpha:Math.max(0,Math.min(1,Number(state.previewAlphaActive)||.72)),
            lineWidth:Math.max(.5,Number(state.previewLineWidth)||2.5),
            dash:Array.isArray(state.previewDash)?[...state.previewDash]:[6,4]
          });
        }
        if(target?.suspendedBy===stateKey){
          // 덧칠 종료 시 LMB의 누적 경로 끝과 현재 포인터를 직선으로 잇지 않는다.
          // 현재 포인터를 새 프리뷰 선분의 0거리 시작점으로만 등록해 다음 샘플 기준을 맞춘다.
          const world=this.pointerWorld();
          const screen={x:Number(Training?.mouse?.x)||0,y:Number(Training?.mouse?.y)||0};
          if(world)this.beginPreviewSegment(target,world,screen);
          target.lastSampleAt=performance.now();
          target.suspendedBy='';
        }
      }
      if(entity.actionState.delete(stateKey))changed=true;
    }
    if(progressStateKey&&entity.actionState.delete(progressStateKey)){
      changed=true;
    }
    if(
      entity.attackPreview&&
      module?.preserveAttackPreview!==true&&
      (progressStateKey||module?.clearPreview===true)
    ){
      entity.attackPreview=null;
    }
    return changed;
  },

  clearAll(entity){
    if(!entity?.actionState)return false;
    let changed=false;
    for(const [key,state] of entity.actionState){
      if(state?.kind!==this.KIND)continue;
      entity.actionState.delete(key);
      if(state.progressStateKey){
        entity.actionState.delete(state.progressStateKey);
      }
      changed=true;
    }
    if(changed&&entity.attackPreview)entity.attackPreview=null;
    return changed;
  },

  blocksMovement(entity){
    if(!entity?.actionState)return false;
    for(const state of entity.actionState.values()){
      if(
        state?.kind===this.KIND&&
        state.lockMovement===true&&
        state.totalDistance>0
      )return true;
    }
    return false;
  },

  blocksStaminaRegen(entity){
    if(!entity?.actionState)return false;
    for(const state of entity.actionState.values()){
      if(state?.kind===this.KIND)return true;
    }
    return false;
  },

  draw(ctx,entity,now=performance.now()){
    if(!ctx||!entity?.actionState)return false;
    let drawn=false;

    for(const state of entity.actionState.values()){
      if(
        state?.kind!==this.KIND||
        state.previewPath!==true||
        !Array.isArray(state.path)||
        !state.path.length
      )continue;

      ctx.save();

      // 종료된 보조 드래그 경로는 부모 드래그 세션이 끝날 때까지 누적 표시한다.
      if(Array.isArray(state.previewOverlayPaths)){
        for(const overlay of state.previewOverlayPaths){
          if(!Array.isArray(overlay?.path)||overlay.path.length<2)continue;
          ctx.beginPath();
          ctx.moveTo(overlay.path[0].x,overlay.path[0].y);
          const overlayBreaks=new Set(Array.isArray(overlay.pathBreaks)?overlay.pathBreaks:[]);
          for(let index=1;index<overlay.path.length;index++){
            if(overlayBreaks.has(index))ctx.moveTo(overlay.path[index].x,overlay.path[index].y);
            else ctx.lineTo(overlay.path[index].x,overlay.path[index].y);
          }
          ctx.strokeStyle=`rgba(${String(overlay.color||state.previewColor)},${Math.max(0,Math.min(1,Number(overlay.alpha)||.72))})`;
          ctx.lineWidth=Math.max(.5,Number(overlay.lineWidth)||state.previewLineWidth);
          ctx.setLineDash(Array.isArray(overlay.dash)?overlay.dash:state.previewDash);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      ctx.beginPath();
      ctx.moveTo(state.path[0].x,state.path[0].y);
      const pathBreaks=new Set(Array.isArray(state.pathBreaks)?state.pathBreaks:[]);
      for(let index=1;index<state.path.length;index++){
        if(pathBreaks.has(index)){
          ctx.moveTo(state.path[index].x,state.path[index].y);
        }else{
          ctx.lineTo(state.path[index].x,state.path[index].y);
        }
      }

      const liveWorld=this.pointerWorld();
      const suspended=!!(state.suspendedBy&&this.state(entity,state.suspendedBy));
      const staminaEmpty=
        state.mode!=='rewind'&&
        Math.max(0,Number(entity?.stamina)||0)<=.001&&
        (state.cost?.perDistance>0||state.cost?.min>0||state.cost?.max>0);
      const atDistanceCap=
        state.mode!=='rewind'&&
        Number.isFinite(state.maxDistance)&&
        state.totalDistance>=state.maxDistance-.001;
      if(
        liveWorld&&
        state.frozen!==true&&
        !staminaEmpty&&
        !suspended&&
        !atDistanceCap&&
        (state.distanceMode==='screen'||state.previewLivePointer===true)
      ){
        ctx.lineTo(liveWorld.x,liveWorld.y);
      }

      const thresholdReached=state.mode==='rewind'
        ?state.totalDistance>0
        :state.totalDistance>=state.threshold;
      // 스테미나 부족으로 frozen 되어도 프리뷰의 시각 스타일은 바꾸지 않는다.
      // frozen은 경로 샘플링/끝점만 멈추는 입력 상태이며, 색/알파/점선은 기존 상태를 그대로 유지한다.
      const pathAlpha=thresholdReached
        ?state.previewAlphaActive
        :state.previewAlphaBeforeThreshold;
      ctx.strokeStyle=`rgba(${state.previewColor},${pathAlpha})`;
      ctx.lineWidth=state.previewLineWidth;
      ctx.setLineDash(state.previewDash);
      ctx.stroke();
      ctx.setLineDash([]);

      const drawPoint=(point,spec)=>{
        if(!point||!spec)return;
        ctx.beginPath();
        ctx.arc(point.x,point.y,Math.max(1,Number(spec.radius)||1),0,Math.PI*2);
        ctx.fillStyle=`rgba(${String(spec.color||state.previewColor)},${Math.max(0,Math.min(1,Number(spec.alpha)||0))})`;
        ctx.fill();
      };
      drawPoint(state.path[0],state.previewStartPoint);
      const endPoint=(state.frozen===true||staminaEmpty||suspended)
        ?state.path[state.path.length-1]
        :(liveWorld||state.path[state.path.length-1]);
      drawPoint(endPoint,state.previewEndPoint);

      ctx.restore();
      drawn=true;
    }

    return drawn;
  }
});