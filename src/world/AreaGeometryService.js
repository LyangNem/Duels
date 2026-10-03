

/* 원형/부채꼴 범위는 같은 가시영역 geometry를 미리보기·판정·이펙트가 공유한다. */
const AreaGeometryService=Object.freeze({
  center(source,module,angle=0,out=null){
    let x=Number(source?.x)||0;
    let y=Number(source?.y)||0;

    if(
      module?.centerPoint&&
      Number.isFinite(Number(module.centerPoint.x))&&
      Number.isFinite(Number(module.centerPoint.y))
    ){
      x=Number(module.centerPoint.x);
      y=Number(module.centerPoint.y);
    }else{
      const distance=Math.max(0,Number(module?.centerDistance)||0);
      if(distance>0){
        x+=(Math.cos(angle)*distance);
        y+=(Math.sin(angle)*distance);
      }
    }

    if(out&&typeof out==='object'){
      out.x=x;
      out.y=y;
      return out;
    }
    return {x,y};
  },
  rayDistance(x,y,angle,range,module){
    return module?.wallPolicy==='ignore'
      ?range
      :WorldGeometryService.raycastDistance(x,y,angle,range,0);
  },
  writePoint(points,index,x,y){
    let point=points[index];
    if(!point){
      point={x,y};
      points[index]=point;
    }else{
      point.x=x;
      point.y=y;
    }
    return point;
  },
  polygon(source,module,angle=0,segments=96,reuse=null){
    const range=Math.max(0,Number(module?.range)||0);
    const count=Math.max(24,Math.floor(Number(segments)||96));
    const geometry=(reuse&&typeof reuse==='object')?reuse:{};
    const center=this.center(
      source,
      module,
      angle,
      geometry.center||(geometry.center={x:0,y:0})
    );
    const points=Array.isArray(geometry.points)
      ?geometry.points
      :(geometry.points=[]);

    if(module?.shape==='circle'){
      for(let index=0;index<count;index++){
        const rayAngle=index/count*Math.PI*2;
        const distance=this.rayDistance(center.x,center.y,rayAngle,range,module);
        this.writePoint(
          points,
          index,
          center.x+Math.cos(rayAngle)*distance,
          center.y+Math.sin(rayAngle)*distance
        );
      }
      points.length=count;
      return geometry;
    }

    if(module?.shape==='sector'){
      const sourceX=Number(source?.x)||0;
      const sourceY=Number(source?.y)||0;
      center.x=sourceX;
      center.y=sourceY;
      const halfAngle=Math.max(0,Number(module.halfAngle)||0);
      this.writePoint(points,0,sourceX,sourceY);
      for(let index=0;index<=count;index++){
        const rayAngle=angle-halfAngle+(index/count)*(halfAngle*2);
        const distance=this.rayDistance(sourceX,sourceY,rayAngle,range,module);
        this.writePoint(
          points,
          index+1,
          sourceX+Math.cos(rayAngle)*distance,
          sourceY+Math.sin(rayAngle)*distance
        );
      }
      points.length=count+2;
      return geometry;
    }

    if(module?.shape==='tapered-rect'){
      const sourceX=Number(source?.x)||0;
      const sourceY=Number(source?.y)||0;
      center.x=sourceX;
      center.y=sourceY;

      const startHalfWidth=Math.max(
        0,
        Number(module.startHalfWidth)||
        Number(module.halfWidth)||
        0
      );
      const endHalfWidth=Math.max(
        0,
        Number(module.endHalfWidth)||0
      );
      const rangeSafe=Math.max(
        .001,
        range
      );
      const widthSlope=
        (endHalfWidth-startHalfWidth)/
        rangeSafe;

      this.writePoint(
        points,
        0,
        sourceX,
        sourceY
      );

      for(let index=0;index<=count;index++){
        const localAngle=
          -Math.PI/2+
          (index/count)*Math.PI;
        const cosLocal=Math.max(
          .000001,
          Math.cos(localAngle)
        );
        const sinAbs=Math.abs(
          Math.sin(localAngle)
        );
        const denominator=
          sinAbs-
          widthSlope*cosLocal;
        const shapeDistance=
          denominator>1e-9
            ?Math.min(
              rangeSafe/cosLocal,
              startHalfWidth/denominator
            )
            :rangeSafe/cosLocal;
        const rayAngle=
          angle+
          localAngle;
        const distance=this.rayDistance(
          sourceX,
          sourceY,
          rayAngle,
          Math.max(
            0,
            shapeDistance
          ),
          module
        );

        this.writePoint(
          points,
          index+1,
          sourceX+
            Math.cos(rayAngle)*
            distance,
          sourceY+
            Math.sin(rayAngle)*
            distance
        );
      }

      points.length=count+2;
      return geometry;
    }

    center.x=Number(source?.x)||0;
    center.y=Number(source?.y)||0;
    points.length=0;
    return geometry;
  },
  pointInPolygon(x,y,points){
    let inside=false;
    for(let i=0,j=points.length-1;i<points.length;j=i++){
      const a=points[i],b=points[j];
      const crosses=((a.y>y)!==(b.y>y))&&
        x<(b.x-a.x)*(y-a.y)/((b.y-a.y)||1e-9)+a.x;
      if(crosses)inside=!inside;
    }
    return inside;
  },
  pointSegmentDistanceSquared(px,py,ax,ay,bx,by){
    const dx=bx-ax,dy=by-ay;
    const lengthSquared=dx*dx+dy*dy;
    if(lengthSquared<=1e-9){
      const ex=px-ax,ey=py-ay;
      return ex*ex+ey*ey;
    }
    const t=Math.max(0,Math.min(1,((px-ax)*dx+(py-ay)*dy)/lengthSquared));
    const qx=ax+dx*t,qy=ay+dy*t;
    const ex=px-qx,ey=py-qy;
    return ex*ex+ey*ey;
  },
  circleIntersectsPolygon(x,y,radius,points){
    if(!Array.isArray(points)||points.length<3)return false;
    if(this.pointInPolygon(x,y,points))return true;

    const r=Math.max(0,Number(radius)||0);
    const r2=r*r;
    for(let i=0,j=points.length-1;i<points.length;j=i++){
      const a=points[i],b=points[j];
      const vx=a.x-x,vy=a.y-y;
      if(vx*vx+vy*vy<=r2)return true;
      if(this.pointSegmentDistanceSquared(x,y,a.x,a.y,b.x,b.y)<=r2)return true;
    }
    return false;
  },
  overlaps(source,module,angle,x,y,radius=0,geometry=null){
    if(
      module?.shape!=='circle'&&
      module?.shape!=='sector'&&
      module?.shape!=='tapered-rect'
    )return false;
    const resolved=geometry||this.polygon(source,module,angle);
    return this.circleIntersectsPolygon(x,y,radius,resolved.points);
  }
});