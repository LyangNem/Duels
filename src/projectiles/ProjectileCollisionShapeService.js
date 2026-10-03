


/* 투사체 시각 형상과 실제 대상 충돌 형상을 동일 데이터로 처리하는 범용 서비스.
   diamond는 진행 방향을 X축으로 삼은 정마름모를 이전 위치~현재 위치까지 스윕한 볼록다각형으로 판정한다. */
const ProjectileCollisionShapeService=Object.freeze({
  shape(projectile){
    return String(projectile?.behavior?.collision?.shape||'circle').toLowerCase();
  },
  radius(projectile){
    const scale=Math.max(0,Number(projectile?.behavior?.collision?.radiusScale)||1);
    return Math.max(0,Number(projectile?.radius)||0)*scale;
  },
  diamondVertices(x,y,angle,radius){
    const ux=Math.cos(angle),uy=Math.sin(angle);
    const vx=-uy,vy=ux;
    return [
      {x:x+ux*radius,y:y+uy*radius},
      {x:x+vx*radius,y:y+vy*radius},
      {x:x-ux*radius,y:y-uy*radius},
      {x:x-vx*radius,y:y-vy*radius}
    ];
  },
  cross(a,b,c){
    return (b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
  },
  convexHull(points){
    const pts=(points||[])
      .map(point=>({x:Number(point.x)||0,y:Number(point.y)||0}))
      .sort((a,b)=>a.x===b.x?a.y-b.y:a.x-b.x);
    if(pts.length<=1)return pts;
    const lower=[];
    for(const point of pts){
      while(lower.length>=2&&this.cross(lower[lower.length-2],lower[lower.length-1],point)<=0)lower.pop();
      lower.push(point);
    }
    const upper=[];
    for(let index=pts.length-1;index>=0;index--){
      const point=pts[index];
      while(upper.length>=2&&this.cross(upper[upper.length-2],upper[upper.length-1],point)<=0)upper.pop();
      upper.push(point);
    }
    lower.pop();upper.pop();
    return lower.concat(upper);
  },
  pointInConvex(point,polygon){
    if(!point||!Array.isArray(polygon)||polygon.length<3)return false;
    let sign=0;
    for(let index=0;index<polygon.length;index++){
      const a=polygon[index],b=polygon[(index+1)%polygon.length];
      const value=this.cross(a,b,point);
      if(Math.abs(value)<=1e-8)continue;
      const next=value>0?1:-1;
      if(sign&&sign!==next)return false;
      sign=next;
    }
    return true;
  },
  pointSegmentDistance(point,a,b){
    const abx=b.x-a.x,aby=b.y-a.y;
    const lengthSq=abx*abx+aby*aby;
    if(lengthSq<=1e-12)return Math.hypot(point.x-a.x,point.y-a.y);
    const t=Math.max(0,Math.min(1,((point.x-a.x)*abx+(point.y-a.y)*aby)/lengthSq));
    const x=a.x+abx*t,y=a.y+aby*t;
    return Math.hypot(point.x-x,point.y-y);
  },
  pointPolygonDistance(point,polygon){
    if(this.pointInConvex(point,polygon))return 0;
    let distance=Infinity;
    for(let index=0;index<polygon.length;index++){
      distance=Math.min(distance,this.pointSegmentDistance(point,polygon[index],polygon[(index+1)%polygon.length]));
    }
    return distance;
  },
  sweptDiamondHitsTarget(projectile,target){
    if(!projectile||!target)return false;
    const radius=this.radius(projectile);
    const dx=Number(projectile.x)-Number(projectile.prevX);
    const dy=Number(projectile.y)-Number(projectile.prevY);
    const angle=Math.hypot(dx,dy)>.0001
      ?Math.atan2(dy,dx)
      :(
        Number.isFinite(Number(projectile.angle))
          ?Number(projectile.angle)
          :Math.atan2(Number(projectile.vy)||0,Number(projectile.vx)||0)
      );
    const start=this.diamondVertices(Number(projectile.prevX)||0,Number(projectile.prevY)||0,angle,radius);
    const end=this.diamondVertices(Number(projectile.x)||0,Number(projectile.y)||0,angle,radius);
    const hull=this.convexHull(start.concat(end));
    const point=NetworkCollisionPositionService.point(target);
    return this.pointPolygonDistance(point,hull)<=Math.max(0,Number(target.radius)||0);
  },
  normalizeAngleDelta(value){
    let angle=Number(value)||0;
    while(angle>Math.PI)angle-=Math.PI*2;
    while(angle<-Math.PI)angle+=Math.PI*2;
    return angle;
  },
  orbitHitsTarget(projectile,target){
    const state=projectile?.orbitState;
    if(!state)return false;

    const point=
      NetworkCollisionPositionService.point(
        target
      );
    const hitRadius=
      Math.max(
        0,
        Number(
          projectile.hitRadius||
          projectile.radius
        )||0
      )+
      Math.max(
        0,
        Number(target.radius)||0
      );

    const currentAngle=Number(state.currentAngle);
    const currentRadius=Number(state.currentRadius);
    const currentCenterX=Number(state.currentCenterX);
    const currentCenterY=Number(state.currentCenterY);

    if(
      !Number.isFinite(currentAngle)||
      !Number.isFinite(currentRadius)||
      !Number.isFinite(currentCenterX)||
      !Number.isFinite(currentCenterY)
    ){
      return Math.hypot(
        Number(point.x)-Number(projectile.x),
        Number(point.y)-Number(projectile.y)
      )<=hitRadius;
    }

    const previousAngle=Number(state.previousAngle);
    const previousRadius=Number(state.previousRadius);
    const previousCenterX=Number(state.previousCenterX);
    const previousCenterY=Number(state.previousCenterY);

    if(
      !Number.isFinite(previousAngle)||
      !Number.isFinite(previousRadius)||
      !Number.isFinite(previousCenterX)||
      !Number.isFinite(previousCenterY)
    ){
      return Math.hypot(
        Number(point.x)-Number(projectile.x),
        Number(point.y)-Number(projectile.y)
      )<=hitRadius;
    }

    const angleDelta=
      this.normalizeAngleDelta(
        currentAngle-previousAngle
      );
    const centerTravel=
      Math.hypot(
        currentCenterX-previousCenterX,
        currentCenterY-previousCenterY
      );
    const radialTravel=
      Math.abs(
        currentRadius-previousRadius
      );
    const arcTravel=
      Math.abs(angleDelta)*
      Math.max(
        currentRadius,
        previousRadius
      );
    const steps=
      Math.max(
        1,
        Math.min(
          96,
          Math.ceil(
            (
              centerTravel+
              radialTravel+
              arcTravel
            )/4
          )
        )
      );

    const passWalls=projectile.behavior?.collisionPolicy?.passWalls===true||projectile.behavior?.pierce?.walls===true;
    const reachablePoint=(cx,cy,angle,radius)=>{
      const reach=passWalls?radius:WorldGeometryService.raycastDistance(cx,cy,angle,radius,ProjectileService.wallCollisionPadding(projectile));
      return {x:cx+Math.cos(angle)*reach,y:cy+Math.sin(angle)*reach};
    };
    const visibleFrom=sample=>{
      if(passWalls)return true;
      const dx=point.x-sample.x,dy=point.y-sample.y,distance=Math.hypot(dx,dy);
      const reach=WorldGeometryService.raycastDistance(sample.x,sample.y,Math.atan2(dy,dx),distance,0);
      return reach>=distance-Math.max(0,Number(target.radius)||0)-1e-6;
    };
    let previousPoint=reachablePoint(previousCenterX,previousCenterY,previousAngle,previousRadius);

    for(let index=1;index<=steps;index++){
      const ratio=index/steps;
      const angle=
        previousAngle+
        angleDelta*ratio;
      const radius=
        previousRadius+
        (currentRadius-previousRadius)*
        ratio;
      const centerX=
        previousCenterX+
        (currentCenterX-previousCenterX)*
        ratio;
      const centerY=
        previousCenterY+
        (currentCenterY-previousCenterY)*
        ratio;
      const nextPoint=reachablePoint(centerX,centerY,angle,radius);

      if(
        JustDodgeService.pointSegmentDistance(
          point.x,
          point.y,
          previousPoint.x,
          previousPoint.y,
          nextPoint.x,
          nextPoint.y
        )<=hitRadius&&visibleFrom(nextPoint)
      ){
        return true;
      }

      previousPoint=nextPoint;
    }

    return false;
  },
  hitsTarget(projectile,target){
    if(projectile.wallReachableCollisionPoint&&projectile.orbitState&&
      projectile.behavior?.collisionPolicy?.passWalls!==true&&projectile.behavior?.pierce?.walls!==true){
      const point=NetworkCollisionPositionService.point(target);
      const radius=Math.max(0,Number(projectile.hitRadius)||Number(projectile.radius)||0)+Math.max(0,Number(target.radius)||0);
      const contact=JustDodgeService.pointSegmentDistance(point.x,point.y,projectile.prevX,projectile.prevY,projectile.x,projectile.y)<=radius;
      if(!contact)return false;
      // 벽면 위 방패 중심으로 raycast하면 0거리 차단될 수 있다.
      // 궤도 중심에서 대상의 가까운 면까지 확인해 같은 쪽 접촉은 유지한다.
      const cx=Number(projectile.orbitState.currentCenterX)||0;
      const cy=Number(projectile.orbitState.currentCenterY)||0;
      const dx=point.x-cx,dy=point.y-cy,distance=Math.hypot(dx,dy);
      return WorldGeometryService.raycastDistance(cx,cy,Math.atan2(dy,dx),distance,0)>=distance-Math.max(0,Number(target.radius)||0)-1e-6;
    }
    if(
      projectile?.orbitState&&
      ProjectileOrbitService.config(projectile)
    ){
      return this.orbitHitsTarget(
        projectile,
        target
      );
    }
    if(this.shape(projectile)==='diamond')return this.sweptDiamondHitsTarget(projectile,target);
    const collisionPoint=NetworkCollisionPositionService.point(target);
    const collisionDistance=JustDodgeService.pointSegmentDistance(
      collisionPoint.x,collisionPoint.y,
      projectile.prevX,projectile.prevY,
      projectile.x,projectile.y
    );
    return collisionDistance<=(projectile.hitRadius||projectile.radius)+target.radius;
  }
});