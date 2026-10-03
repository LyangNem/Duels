

const ProjectileVisualPositionService=Object.freeze({
  sample(projectile,out=null){
    const result=out&&typeof out==='object'?out:{};

    result.angle=
      Number.isFinite(Number(projectile?.angle))
        ?Number(projectile.angle)
        :Math.atan2(
          Number(projectile?.vy)||0,
          Number(projectile?.vx)||0
        );
    result.vx=Number(projectile?.vx)||0;
    result.vy=Number(projectile?.vy)||0;
    result.authoritativeMirror=false;

    // draw 시각으로 재샘플링하지 않는다. 이번 update의 충돌 위치가 표시 위치다.
    const remoteIdleVisual=
      projectile?.remoteHomingCollisionSynced===true&&
      !EntitySimulationAuthorityService.isLocal(projectile.source)&&
      projectile.behavior?.returning?.phase!=='returning'
        ?projectile
        :null;

    if(remoteIdleVisual){
      result.x=Number(remoteIdleVisual.x)||0;
      result.y=Number(remoteIdleVisual.y)||0;
      result.angle=
        Number.isFinite(
          Number(remoteIdleVisual.angle)
        )
          ?Number(remoteIdleVisual.angle)
          :result.angle;
      result.vx=Number(remoteIdleVisual.vx)||0;
      result.vy=Number(remoteIdleVisual.vy)||0;
      result.scale=1;
      result.alpha=1;
      result.strokeAlpha=1;
      result.progress=0;
      result.apex=0;
      result.lift=0;
      result.offsetX=0;
      result.offsetY=0;
      result.authoritativeMirror=true;
      return result;
    }

    const stationary=
      projectile?.stationaryArrival;
    if(stationary){
      const now=performance.now();
      const duration=Math.max(
        1,
        Number(stationary.duration)||1
      );
      const remaining=Math.max(
        0,
        (
          Number(stationary.endsAt)||now
        )-now
      );
      const alpha=
        stationary.fadeOut===true&&
        Number.isFinite(duration)&&
        Number.isFinite(remaining)
          ?Math.max(
            0,
            Math.min(
              1,
              remaining/duration
            )
          )
          :1;

      result.x=Number(projectile.x)||0;
      result.y=Number(projectile.y)||0;
      result.scale=1;
      result.alpha=alpha;
      result.strokeAlpha=alpha;
      result.progress=1;
      result.apex=0;
      result.lift=0;
      result.offsetX=0;
      result.offsetY=0;
      return result;
    }

    const maxDistance=
      Number.isFinite(Number(projectile?.targetDistance))&&
      Number(projectile.targetDistance)>0
        ?Number(projectile.targetDistance)
        :Math.max(1,Number(projectile?.attack?.range)||1);
    const progress=Math.max(
      0,
      Math.min(
        1,
        (Number(projectile?.travel)||0)/maxDistance
      )
    );
    const arc=ArcTrajectoryService.sample(
      progress,
      projectile?.behavior?.trajectory||null
    );

    result.x=(Number(projectile?.x)||0)+arc.offsetX;
    result.y=(Number(projectile?.y)||0)+arc.offsetY;

    if(
      projectile?.renderStyle?.renderReachability==='orbit-center-clamp'&&
      projectile?.orbitState&&
      projectile.behavior?.collisionPolicy?.passWalls!==true&&
      projectile.behavior?.pierce?.walls!==true
    ){
      const state=projectile.orbitState;
      const centerX=Number(state.currentCenterX);
      const centerY=Number(state.currentCenterY);
      const desiredX=Number(state.desiredX);
      const desiredY=Number(state.desiredY);

      if(
        Number.isFinite(centerX)&&
        Number.isFinite(centerY)&&
        Number.isFinite(desiredX)&&
        Number.isFinite(desiredY)
      ){
        const currentDx=result.x-centerX;
        const currentDy=result.y-centerY;
        const currentDistance=Math.hypot(currentDx,currentDy);

        if(currentDistance>.0001){
          const currentAngle=Math.atan2(currentDy,currentDx);
          const currentAllowed=
            WorldGeometryService.raycastDistance(
              centerX,
              centerY,
              currentAngle,
              currentDistance,
              ProjectileService.wallCollisionPadding(projectile)
            );

          if(currentAllowed+0.5<currentDistance){
            const desiredDx=desiredX-centerX;
            const desiredDy=desiredY-centerY;
            const desiredDistance=Math.hypot(desiredDx,desiredDy);

            if(desiredDistance>.0001){
              const desiredAngle=Math.atan2(desiredDy,desiredDx);
              const desiredAllowed=
                WorldGeometryService.raycastDistance(
                  centerX,
                  centerY,
                  desiredAngle,
                  desiredDistance,
                  ProjectileService.wallCollisionPadding(projectile)
                );
              const clampedDistance=Math.max(
                0,
                Math.min(desiredDistance,desiredAllowed)
              );

              result.x=
                centerX+
                Math.cos(desiredAngle)*
                clampedDistance;
              result.y=
                centerY+
                Math.sin(desiredAngle)*
                clampedDistance;
            }else{
              result.x=desiredX;
              result.y=desiredY;
            }
          }
        }
      }
    }

    result.scale=arc.scale;
    result.alpha=arc.alpha;
    result.strokeAlpha=arc.strokeAlpha;
    result.lift=arc.lift;
    result.apex=arc.apex;
    result.progress=progress;
    return result;
  }
});