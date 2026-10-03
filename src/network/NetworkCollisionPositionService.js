

const NetworkCollisionPositionService=Object.freeze({
  zeroPoint:Object.freeze({x:0,y:0}),
  points:new WeakMap(),
  point(entity){
    if(!entity)return this.zeroPoint;
    let point=this.points.get(entity);
    if(!point){
      point={x:0,y:0};
      this.points.set(entity,point);
    }
    if(
      Training.sessionMode==='online'&&
      entity._networkStateReady&&
      Number.isFinite(entity.netCollisionX)&&
      Number.isFinite(entity.netCollisionY)
    ){
      point.x=entity.netCollisionX;
      point.y=entity.netCollisionY;
      return point;
    }
    point.x=Number(entity.x)||0;
    point.y=Number(entity.y)||0;
    return point;
  }
});