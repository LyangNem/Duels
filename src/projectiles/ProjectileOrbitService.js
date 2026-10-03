


const ProjectileOrbitService=Object.freeze({
  config(projectile){
    return projectile?.projectile?.orbit||null;
  },
  nearestEnemyRadius(source,config){
    let nearest=Infinity;
    for(const candidate of EntityService.items.values()){
      if(
        !candidate?.alive||
        candidate.hidden||
        RelationService.relation(source,candidate)!=='enemy'
      )continue;
      const point=NetworkCollisionPositionService.point(candidate);
      const distance=Math.hypot(
        Number(point.x)-Number(source.x),
        Number(point.y)-Number(source.y)
      );
      if(distance<nearest)nearest=distance;
    }
    const maximum=Math.max(0,Number(config.maxRadius)||0);
    const minimum=Math.min(
      maximum,
      Math.max(0,Number(config.minRadius)||0)
    );
    if(!Number.isFinite(nearest))return maximum;
    return Math.max(
      minimum,
      Math.min(maximum,nearest)
    );
  },
  initialize(projectile,now=performance.now()){
    const config=this.config(projectile);
    if(!config)return null;
    const maxRadius=Math.max(0,Number(config.maxRadius)||0);
    const targetRadius=
      config.radiusMode==='nearest-enemy'
        ?this.nearestEnemyRadius(projectile.source,config)
        :maxRadius;
    const duration=
      Math.max(
        0,
        Number(config.duration)||0,
        Math.max(0,Number(config.growDuration)||0)+
        Math.max(0,Number(config.holdDuration)||0)+
        Math.max(0,Number(config.shrinkDuration)||0)
      );
    const state={
      startedAt:now,
      duration,
      targetRadius,
      previousCycle:0,
      complete:false
    };
    projectile.orbitState=state;
    projectile.persistent=true;
    return state;
  },
  radius(config,state,elapsed){
    if(Number.isFinite(Number(state?.externalRadius))){
      return Math.max(0,Number(state.externalRadius));
    }
    const minRadius=Math.max(0,Number(config.minRadius)||0);
    const maxRadius=Math.max(
      minRadius,
      Number(state.targetRadius)||0
    );
    const grow=Math.max(0,Number(config.growDuration)||0);
    const hold=Math.max(0,Number(config.holdDuration)||0);
    const shrink=Math.max(0,Number(config.shrinkDuration)||0);

    if(grow+hold+shrink<=0)return maxRadius;
    if(grow>0&&elapsed<grow){
      return minRadius+
        (maxRadius-minRadius)*
        Math.max(0,Math.min(1,elapsed/grow));
    }
    if(elapsed<grow+hold)return maxRadius;
    if(shrink<=0)return minRadius;
    const t=Math.max(
      0,
      Math.min(
        1,
        (elapsed-grow-hold)/shrink
      )
    );
    return maxRadius+(minRadius-maxRadius)*t;
  },
  angle(config,projectile,elapsed){
    if(Number.isFinite(Number(projectile?.orbitState?.externalAngle))){
      return Number(projectile.orbitState.externalAngle);
    }
    const start=Number(projectile.launchAngle)||0;
    const offset=Number(config.startAngleOffset)||0;
    if(Math.max(0,Number(config.duration)||0)>0){
      const progress=Math.max(
        0,
        Math.min(
          1,
          elapsed/
          Math.max(1,Number(config.duration)||1)
        )
      );
      return start+offset+
        (Number(config.totalAngle)||0)*progress;
    }
    return start+offset+
      (Number(config.angularSpeed)||0)*elapsed;
  },
  update(projectile,now=performance.now()){
    const config=this.config(projectile);
    if(!config)return false;
    const state=
      projectile.orbitState||
      this.initialize(projectile,now);
    if(!state)return false;

    const elapsed=Math.max(0,now-state.startedAt);
    const originAnchor=
      config.anchor==='origin';
    const center=
      originAnchor
        ?projectile.origin
        :config.anchor==='owner'
          ?EntityService.owner(projectile.source)
          :projectile.source;
    if(
      !center||
      (
        !originAnchor&&
        !center.alive
      )
    ){
      state.complete=true;
      return true;
    }

    const orbitRadius=this.radius(config,state,elapsed);
    const angle=this.angle(config,projectile,elapsed);

    if(
      Number.isFinite(Number(state.currentAngle))&&
      Number.isFinite(Number(state.currentRadius))&&
      Number.isFinite(Number(state.currentCenterX))&&
      Number.isFinite(Number(state.currentCenterY))
    ){
      state.previousAngle=Number(state.currentAngle);
      state.previousRadius=Number(state.currentRadius);
      state.previousCenterX=Number(state.currentCenterX);
      state.previousCenterY=Number(state.currentCenterY);
    }

    state.currentAngle=angle;
    state.currentRadius=orbitRadius;
    state.currentCenterX=Number(center.x)||0;
    state.currentCenterY=Number(center.y)||0;

    projectile.orbitAngle=angle;
    const desiredX=
      (Number(center.x)||0)+
      Math.cos(angle)*orbitRadius;
    const desiredY=
      (Number(center.y)||0)+
      Math.sin(angle)*orbitRadius;
    state.desiredX=desiredX;
    state.desiredY=desiredY;

    const passWalls=
      projectile.behavior?.collisionPolicy?.passWalls===true||
      projectile.behavior?.pierce?.walls===true;

    if(!passWalls){
      const centerX=Number(center.x)||0;
      const centerY=Number(center.y)||0;
      const desiredDx=desiredX-centerX;
      const desiredDy=desiredY-centerY;
      const desiredDistance=Math.hypot(
        desiredDx,
        desiredDy
      );

      if(desiredDistance>.0001){
        const desiredAngle=Math.atan2(
          desiredDy,
          desiredDx
        );
        const allowedDistance=
          WorldGeometryService.raycastDistance(
            centerX,
            centerY,
            desiredAngle,
            desiredDistance,
            ProjectileService.wallCollisionPadding(
              projectile
            )
          );
        const clampedDistance=Math.max(
          0,
          Math.min(
            desiredDistance,
            allowedDistance
          )
        );
        projectile.x=
          centerX+
          Math.cos(desiredAngle)*
          clampedDistance;
        projectile.y=
          centerY+
          Math.sin(desiredAngle)*
          clampedDistance;
      }else{
        projectile.x=desiredX;
        projectile.y=desiredY;
      }
    }else{
      projectile.x=desiredX;
      projectile.y=desiredY;
    }

    const angularDirection=
      (
        Number(config.angularSpeed)||
        Number(config.totalAngle)||0
      )>=0
        ?1
        :-1;
    projectile.angle=
      angle+
      angularDirection*Math.PI/2;
    projectile.vx=0;
    projectile.vy=0;
    projectile.travel=Math.max(
      Number(projectile.travel)||0,
      Math.abs(
        angle-
        (
          (Number(projectile.launchAngle)||0)+
          (Number(config.startAngleOffset)||0)
        )
      )*
      Math.max(orbitRadius,1)
    );

    if(config.resetHitEachRevolution===true){
      const start=
        (Number(projectile.launchAngle)||0)+
        (Number(config.startAngleOffset)||0);
      const angularTravel=Math.abs(angle-start);
      const cycle=Math.floor(
        (angularTravel+1e-9)/(Math.PI*2)
      );
      if(cycle>state.previousCycle){
        projectile.hitIds?.clear();
        projectile.rehitAt?.clear();
        state.previousCycle=cycle;
      }
    }

    state.complete=
      state.duration>0&&
      elapsed>=state.duration;
    return true;
  }
});