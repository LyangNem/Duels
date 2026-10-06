

const ProjectileHomingTargetVisibilityService=Object.freeze({
  canPerceive(source,target,now=performance.now()){
    if(!source||!target?.alive)return false;

    const relation=
      RelationService.relation(
        source,
        target
      );

    if(relation!=='enemy')return true;

    if(
      typeof StealthPresentationService==='undefined'||
      !StealthPresentationService.active(
        target,
        now
      )
    )return true;

    const stealthState=
      StealthPresentationService.state(
        source,
        target,
        now
      );

    return stealthState?.detected===true;
  },
  withinSourceRange(projectile,target){
    const range=
      Number(projectile?.homing?.sourceDetectionRange);
    if(
      !Number.isFinite(range)||
      range===Infinity||
      range<=0
    )return true;

    const source=projectile?.source;
    if(!source||!target)return false;

    return Math.hypot(
      Number(target.x)-Number(source.x),
      Number(target.y)-Number(source.y)
    )<=range;
  },
  valid(projectile,target,now=performance.now()){
    if(!projectile||!target?.alive)return false;

    const relation=
      RelationService.relation(
        projectile.source,
        target
      );
    if(
      !projectile.homing
        ?.targetRelations
        ?.includes(relation)
    )return false;

    const resource=projectile.homing?.requiresResource;
    if(resource){
      const maximum=resource==='stamina'
        ?Number(target.maxStamina)
        :resource==='health'
          ?Number(target.maxHealth)
          :Number(target.resources?.[resource]?.max);
      if(!(maximum>0))return false;
    }

    return (
      this.withinSourceRange(
        projectile,
        target
      )&&
      this.canPerceive(
        projectile.source,
        target,
        now
      )
    );
  },
  contactBeforeBoundary(projectile,target,angle){
    if(
      !projectile||
      !target?.alive||
      !Number.isFinite(Number(angle))
    )return false;

    const px=Number(projectile.x)||0;
    const py=Number(projectile.y)||0;
    const tx=Number(target.x)||0;
    const ty=Number(target.y)||0;
    const dx=tx-px;
    const dy=ty-py;
    const dirX=Math.cos(Number(angle));
    const dirY=Math.sin(Number(angle));

    const forward=
      dx*dirX+
      dy*dirY;
    if(forward<0)return false;

    const collisionRadius=
      Math.max(
        0,
        Number(projectile.hitRadius)||
        Number(projectile.radius)||
        0
      )+
      Math.max(
        0,
        Number(target.radius)||0
      );

    const lateralSq=
      Math.max(
        0,
        dx*dx+
        dy*dy-
        forward*forward
      );

    if(
      lateralSq>
      collisionRadius*collisionRadius
    )return false;

    const contactOffset=
      Math.sqrt(
        Math.max(
          0,
          collisionRadius*collisionRadius-
          lateralSq
        )
      );
    const contactDistance=
      Math.max(
        0,
        forward-contactOffset
      );
    const padding=
      ProjectileService
        .wallCollisionPadding(projectile);
    const boundaryDistance=
      WorldGeometryService
        .boundaryRayDistance(
          px,
          py,
          Number(angle),
          Math.max(
            1,
            contactDistance+
            collisionRadius+
            4
          ),
          padding
        );

    return (
      contactDistance<=
      boundaryDistance+.5
    );
  }
});