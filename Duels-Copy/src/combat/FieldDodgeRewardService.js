

/* 설치 field 안에서 발생한 회피 결과를 회피자 권위에서 확정하고 field 소유자에게 보상하는 범용 서비스. */
const FieldDodgeRewardService=Object.freeze({
  pending:new Map(),
  key(entity){return String(entity?.id||'');},
  serialize(source,now=performance.now()){
    const result=[];
    for(const state of InstalledAreaFieldService.states(source)){
      const reward=state?.module?.dodgeReward;
      if(!reward||state?.phase==='afterlife'||now>=Number(state?.endsAt||Infinity))continue;
      result.push({
        instanceId:String(state.instanceId||''),
        stateKey:String(state.baseStateKey||state.module?.stateKey||''),
        pointX:Number(state.pointX)||0,pointY:Number(state.pointY)||0,
        armedIn:Math.max(0,Number(state.armedAt||now)-now),
        endsIn:Math.max(0,Number(state.endsAt||now)-now),
        rewardOnly:state.rewardOnly===true,
        module:{
          shape:String(state.module?.shape||'circle'),
          range:Math.max(0,Number(state.module?.range)||0),
          innerRange:Math.max(0,Number(state.module?.innerRange)||0),
          halfWidth:Math.max(0,Number(state.module?.halfWidth)||0),
          halfAngle:Math.max(0,Number(state.module?.halfAngle)||0),
          angle:Number(state.module?.angle)||0,
          stateKey:String(state.baseStateKey||state.module?.stateKey||''),
          dodgeReward:{...reward}
        }
      });
    }
    return result;
  },
  applyRemote(source,items=[],now=performance.now()){
    if(!source)return false;
    source._remoteFieldDodgeRewards=(Array.isArray(items)?items:[]).map(item=>({
      instanceId:String(item?.instanceId||''),
      baseStateKey:String(item?.stateKey||''),
      phase:'point',rewardOnly:item?.rewardOnly===true,
      pointX:Number(item?.pointX)||0,pointY:Number(item?.pointY)||0,
      armedAt:now+Math.max(0,Number(item?.armedIn)||0),
      endsAt:now+Math.max(0,Number(item?.endsIn)||0),
      module:{...(item?.module||{}),dodgeReward:{...(item?.module?.dodgeReward||{})}},
      areaGeometry:null
    }));
    return true;
  },
  definition(source,stateKey){
    const key=String(stateKey||'');
    for(const attack of Object.values(source?.character?.attacks||{})){
      for(const module of attack?.modules||[]){
        if(
          AttackModuleService.type(module)==='field.area'&&
          String(module.stateKey||'')===key&&
          module.dodgeReward&&typeof module.dodgeReward==='object'
        )return module.dodgeReward;
      }
    }
    return null;
  },
  candidates(target,now=performance.now()){
    // begin()은 회피자 시뮬레이션 권위에서만 호출된다.
    // 따라서 회피 시작 위치의 진실값은 target.x/y이며 원격 보간용 netCollision 좌표를 사용하지 않는다.
    const point={
      x:Number(target?.x)||0,
      y:Number(target?.y)||0
    };
    const result=[];
    for(const source of EntityService.items.values()){
      if(!source?.alive||source===target)continue;
      if(RelationService.relation(source,target)!=='enemy')continue;
      const localStates=InstalledAreaFieldService.states(source).filter(state=>state?.module?.dodgeReward);
      const remoteStates=Array.isArray(source._remoteFieldDodgeRewards)?source._remoteFieldDodgeRewards:[];
      const states=[];
      const seenStates=new Set();
      for(const state of [...localStates,...remoteStates]){
        const stateIdentity=`${String(state?.baseStateKey||state?.module?.stateKey||'')}::${String(state?.instanceId||'')}`;
        if(seenStates.has(stateIdentity))continue;
        seenStates.add(stateIdentity);
        states.push(state);
      }
      for(const state of states){
        const reward=state?.module?.dodgeReward;
        if(!reward||String(reward.result||'non-just')!=='non-just')continue;
        if(now<Number(state.armedAt||0)||now>=Number(state.endsAt||Infinity))continue;
        const area=InstalledAreaFieldService.collisionArea(state,now);
        if(!area)continue;
        if(!InstalledAreaFieldService.overlapsAreaPoint(
          area,point.x,point.y,target.radius,state.areaGeometry
        ))continue;
        result.push({
          source,
          sourcePid:OnlineParticipantEntityService.pid(source)||'',
          stateKey:String(state.baseStateKey||state.module?.stateKey||''),
          instanceId:String(state.instanceId||''),
          reward:{...reward},
          x:Number(point.x)||0,
          y:Number(point.y)||0
        });
      }
    }
    return result;
  },
  begin(target,now=performance.now()){
    if(!target?.alive||!EntitySimulationAuthorityService.isLocal(target))return false;
    const list=this.candidates(target,now);
    const key=this.key(target);
    if(list.length)this.pending.set(key,list);
    else this.pending.delete(key);
    return list.length>0;
  },
  spawnTravelToken(source,reward,origin=null){
    if(!source?.alive||!reward||!origin||reward.effect===false)return 0;
    const duration=333;
    EffectSpawnService.spawn({
      type:'areaCircle',x:Number(origin.x)||0,y:Number(origin.y)||0,
      travelToken:true,targetEntityId:String(source.id||''),
      color:String(reward.color||'195,201,222'),dur:duration,fadeOut:false
    },{source});
    return duration;
  },
  apply(source,reward,origin=null){
    if(!source?.alive||!reward)return false;
    const healthRatio=Math.max(0,Number(reward.healthMaxRatio)||0);
    const staminaRatio=Math.max(0,Number(reward.staminaMaxRatio)||0);
    const travelDuration=this.spawnTravelToken(source,reward,origin);
    const restore=()=>{
      if(!source?.alive)return;
      if(healthRatio>0){
        ResourceRestoreEffectService.apply({
          source,
          target:source,
          module:{type:'resource.restore',resource:'health',recipient:'source',maxResourceRatio:healthRatio,presentation:'ability'},
          presentationDefault:'ability'
        });
      }
      if(staminaRatio>0){
        ResourceRestoreEffectService.apply({
          source,
          target:source,
          module:{type:'resource.restore',resource:'stamina',recipient:'source',maxResourceRatio:staminaRatio}
        });
      }
    };
    if(travelDuration>0)SimulationScheduleService.scheduleContinuation({source,at:performance.now()+travelDuration,continue:restore});
    else restore();
    return true;
  },
  finish(target,now=performance.now()){
    if(!target||!EntitySimulationAuthorityService.isLocal(target))return false;
    const key=this.key(target);
    const list=this.pending.get(key)||[];
    this.pending.delete(key);
    if(!list.length||target.justDodgeConsumed===true)return false;
    let applied=false;
    for(const item of list){
      if(!item?.source?.alive)continue;
      if(EntitySimulationAuthorityService.isLocal(item.source)){
        applied=this.apply(item.source,item.reward,{x:item.x,y:item.y})||applied;
        continue;
      }
      if(Training.sessionMode==='online'&&OnlineDuelService.active&&item.sourcePid){
        // 회피자 화면에도 같은 범용 travelToken을 즉시 생성한다.
        // 회복은 reward owner 권위에서만 처리하므로 이 경로는 presentation-only다.
        this.spawnTravelToken(item.source,item.reward,{x:item.x,y:item.y});
        GameplayEffectEventSyncService.send(
          'field-dodge-reward',
          {
            stateKey:item.stateKey,
            origin:{x:item.x,y:item.y}
          },
          {targetPid:item.sourcePid}
        );
        applied=true;
      }
    }
    return applied;
  },
  receive(payload){
    if(!payload)return false;
    const source=Training.player;
    if(!source?.alive||!EntitySimulationAuthorityService.isLocal(source))return false;
    const reward=this.definition(source,String(payload.stateKey||''));
    if(!reward)return false;
    return this.apply(source,reward,payload.origin||null);
  },
  clear(entity=null){
    if(entity){
      const key=this.key(entity);
      this.pending.delete(key);
    }else{
      this.pending.clear();
    }
  }
});