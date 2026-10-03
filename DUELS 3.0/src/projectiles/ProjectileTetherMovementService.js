


/* 귀환/이동 투사체에 피격 대상을 묶어 같은 경로로 이동시키는 범용 강제이동 서비스.
   캐릭터/스킬 이름을 모르며, 투사체 수명과 함께 상태를 정리한다. */
const ProjectileTetherMovementService=Object.freeze({
  KIND:'projectile-tether-motion',
  items:new Map(),
  key(projectile,target){
    return `${String(projectile?.networkKey||projectile?.id||'projectile')}:${String(target?.id||'target')}`;
  },
  attach(projectile,target,source,module={}){
    if(!projectile||!target?.alive||!source)return false;
    if(!EntitySimulationAuthorityService.isLocal(target))return false;
    const key=this.key(projectile,target);
    if(this.items.has(key))return true;

    ForcedMovementWindupInterruptService.interrupt(
      target,
      'projectile-tether'
    );

    const status=String(module.status||'bind');
    const statusSourceId=`projectile-tether:${key}`;
    if(status&&COMBAT_STATUS_DEFS[status]){
      const duration=
        Number.isFinite(Number(module.duration))
          ?Math.max(
            0,
            Number(module.duration)||0
          )
          :Infinity;

      CCService.add(
        target,
        status,
        duration,
        statusSourceId,
        {
          sourceEntityId:source.id,
          stackMode:'replace-source'
        }
      );
    }
    const state={kind:this.KIND,key,projectile,target,source,status,statusSourceId,contactSource:module.contactSource!==false};
    this.items.set(key,state);
    return true;
  },
  release(state){
    if(!state)return false;
    this.items.delete(state.key);
    if(state.status&&state.target){
      CCService.removeSource(state.target,state.status,state.statusSourceId);
    }
    return true;
  },
  releaseProjectile(projectile){
    let changed=false;
    for(const state of this.items.values()){
      if(state.projectile!==projectile)continue;
      this.release(state);changed=true;
    }
    return changed;
  },
  updateProjectile(projectile){
    if(!projectile)return false;
    let changed=false;
    for(const state of this.items.values()){
      if(state.projectile!==projectile)continue;
      const target=state.target,source=state.source;
      if(!target?.alive||!source?.alive){
        this.release(state);continue;
      }
      if(!EntitySimulationAuthorityService.isLocal(target))continue;
      let tx=Number(projectile.x)||0,ty=Number(projectile.y)||0;
      if(state.contactSource){
        const dx=tx-(Number(source.x)||0),dy=ty-(Number(source.y)||0);
        const dist=Math.hypot(dx,dy);
        const contact=Math.max(0,(Number(source.radius)||0)+(Number(target.radius)||0));
        if(dist<=contact+Math.max(0,Number(projectile.radius)||0)){
          const angle=dist>.001?Math.atan2(dy,dx):(Number(projectile.angle)||0);
          tx=(Number(source.x)||0)+Math.cos(angle)*contact;
          ty=(Number(source.y)||0)+Math.sin(angle)*contact;
        }
      }
      const dx=tx-(Number(target.x)||0),dy=ty-(Number(target.y)||0);
      const dist=Math.hypot(dx,dy);
      if(dist>.001){
        const angle=Math.atan2(dy,dx);
        const projectilePolicy=
          projectile.behavior?.collisionPolicy||
          CollisionPolicyService.normalize({
            passWalls:
              projectile.behavior?.pierce?.walls===true,
            passEnemies:
              projectile.behavior?.pierce?.targets===true
          });

        const allowed=
          CollisionPolicyService.entityTravelDistance(
            target,
            angle,
            dist,
            {
              passWalls:projectilePolicy.passWalls,
              passEnemies:true
            }
          );

        target.x+=Math.cos(angle)*allowed;
        target.y+=Math.sin(angle)*allowed;
      }
      changed=true;
    }
    return changed;
  },
});