

const WallOverlapAttackDeferService=Object.freeze({
  movingThroughWalls(entity,now=performance.now()){
    if(!entity)return false;
    return (
      MovementAbilityService.active(entity)||
      entity.forcedMotion?.kind==='dodge'||
      now<Math.max(0,Number(entity.dodgeUntil)||0)
    );
  },
  overlappingWall(entity){
    if(!entity)return false;
    return MovementService.collides(
      Number(entity.x)||0,
      Number(entity.y)||0,
      Math.max(0,Number(entity.radius)||0)
    );
  },
  shouldDefer(entity,options={},now=performance.now()){
    if(options.wallDeferredCommit===true)return false;
    if(MovementAbilityService.deferAttacks(entity))return true;
    return (
      this.movingThroughWalls(entity,now)&&
      this.overlappingWall(entity)
    );
  },
  queue(entity,spec,angle,options={},now=performance.now()){
    if(!entity||!spec)return false;
    if(!Array.isArray(entity.wallDeferredAttacks)){
      entity.wallDeferredAttacks=[];
    }
    entity.wallDeferredAttacks.push({
      spec,
      angle:Number(angle)||0,
      options:{
        networkReplay:options.networkReplay===true,
        freeAttack:options.freeAttack===true,
        targetPoint:
          options.targetPoint&&
          Number.isFinite(Number(options.targetPoint.x))&&
          Number.isFinite(Number(options.targetPoint.y))
            ?{
              x:Number(options.targetPoint.x),
              y:Number(options.targetPoint.y)
            }
            :null,
        abilityUseId:options.abilityUseId||null,
        skipWindup:options.skipWindup===true,
        extraModules:Array.isArray(options.extraModules)
          ?[...options.extraModules]
          :null,
        wallDeferredCommit:true,
        preparedSpec:true
      },
      queuedAt:now
    });
    return true;
  },
  clear(entity){
    if(!entity)return false;
    entity.wallDeferredAttacks=[];
    return true;
  },
  liveAim(entity,fallbackAngle=0,fallbackTargetPoint=null){
    if(EntitySimulationAuthorityService.isLocal(entity)&&Training.player===entity){
      const point=Training.mouseWorld();
      return {
        angle:Training.aimAngle(),
        targetPoint:{x:Number(point.x)||0,y:Number(point.y)||0}
      };
    }
    const remotePoint=entity?._remoteAimTargetPoint;
    return {
      angle:Number.isFinite(Number(entity?._remoteAimAngle))
        ?Number(entity._remoteAimAngle)
        :Number(fallbackAngle)||0,
      targetPoint:
        remotePoint&&
        Number.isFinite(Number(remotePoint.x))&&
        Number.isFinite(Number(remotePoint.y))
          ?{x:Number(remotePoint.x),y:Number(remotePoint.y)}
          :fallbackTargetPoint
    };
  },
  update(entity,now=performance.now()){
    const queued=entity?.wallDeferredAttacks;
    if(!Array.isArray(queued)||queued.length<=0)return false;
    if(!entity.alive){
      this.clear(entity);
      return false;
    }
    if(MovementAbilityService.deferAttacks(entity))return false;
    if(this.overlappingWall(entity))return false;

    const attacks=queued.splice(0,queued.length);
    let executed=false;
    for(const item of attacks){
      const liveAim=this.liveAim(
        entity,
        item.angle,
        item.options?.targetPoint||null
      );
      const options={
        ...item.options,
        targetPoint:liveAim.targetPoint
      };
      executed=
        AttackService.execute(
          entity,
          item.spec,
          liveAim.angle,
          options
        )||executed;
    }
    return executed;
  }
});