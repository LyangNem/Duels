

const CollisionPolicyService=Object.freeze({
  normalize(policy={}){
    return {
      passWalls:policy?.passWalls===true,
      passEnemies:policy?.passEnemies===true
    };
  },
  enemyTravelDistance(entity,angle,requested){
    let allowed=Math.max(0,Number(requested)||0);
    if(allowed<=0||!entity)return allowed;

    const dx=Math.cos(angle);
    const dy=Math.sin(angle);
    const sx=Number(entity.x)||0;
    const sy=Number(entity.y)||0;

    for(const target of EntityService.items.values()){
      if(
        !target?.alive||
        RelationService.relation(entity,target)!=='enemy'
      )continue;

      const ox=sx-(Number(target.x)||0);
      const oy=sy-(Number(target.y)||0);
      const radius=
        Math.max(0,Number(entity.radius)||0)+
        Math.max(0,Number(target.radius)||0);
      const b=2*(ox*dx+oy*dy);
      const c=ox*ox+oy*oy-radius*radius;
      const discriminant=b*b-4*c;
      if(discriminant<0)continue;

      const root=Math.sqrt(discriminant);
      const near=(-b-root)/2;
      const far=(-b+root)/2;
      let hit=Infinity;
      if(near>=0)hit=near;
      else if(far>=0)hit=0;
      if(hit<allowed)allowed=Math.max(0,hit);
    }
    return allowed;
  },
  entityTravelDistance(entity,angle,requested,policy={}){
    const normalized=this.normalize(policy);
    let allowed=MovementService.travelDistance(
      entity.x,
      entity.y,
      angle,
      requested,
      entity.radius,
      normalized.passWalls
    );
    if(!normalized.passEnemies){
      allowed=Math.min(
        allowed,
        this.enemyTravelDistance(entity,angle,requested)
      );
    }
    return InstalledAreaFieldService.containmentTravelDistance(entity,angle,Math.max(0,allowed));
  }
});