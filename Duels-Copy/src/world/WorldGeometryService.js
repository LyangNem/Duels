

/* 이동 */
const WorldGeometryService=Object.freeze({
  boundaryWallAtPoint(x,y,padding=0){
    const px=Number(x);
    const py=Number(y);
    if(!Number.isFinite(px)||!Number.isFinite(py))return null;

    const pad=Math.max(0,Number(padding)||0);
    const width=WorldBoundsService.width();
    const height=WorldBoundsService.height();
    const minX=pad;
    const maxX=width-pad;
    const minY=pad;
    const maxY=height-pad;

    if(px>=minX&&px<=maxX&&py>=minY&&py<=maxY)return null;

    const leftDistance=Math.abs(px-minX);
    const rightDistance=Math.abs(px-maxX);
    const topDistance=Math.abs(py-minY);
    const bottomDistance=Math.abs(py-maxY);
    const nearest=Math.min(
      leftDistance,
      rightDistance,
      topDistance,
      bottomDistance
    );

    if(nearest===leftDistance){
      return {x:minX,y:0,w:0,h:height,boundary:true,side:'left'};
    }
    if(nearest===rightDistance){
      return {x:maxX,y:0,w:0,h:height,boundary:true,side:'right'};
    }
    if(nearest===topDistance){
      return {x:0,y:minY,w:width,h:0,boundary:true,side:'top'};
    }
    return {x:0,y:maxY,w:width,h:0,boundary:true,side:'bottom'};
  },
  boundaryRayDistance(x,y,angle,maxDistance,padding=0){
    const distance=Math.max(0,Number(maxDistance)||0);
    if(distance<=0)return 0;

    const pad=Math.max(0,Number(padding)||0);
    const width=WorldBoundsService.width();
    const height=WorldBoundsService.height();
    const minX=pad;
    const maxX=width-pad;
    const minY=pad;
    const maxY=height-pad;
    const px=Number(x)||0;
    const py=Number(y)||0;

    if(px<minX||px>maxX||py<minY||py>maxY)return 0;

    const dx=Math.cos(angle);
    const dy=Math.sin(angle);
    let nearest=distance;

    if(dx>1e-9)nearest=Math.min(nearest,(maxX-px)/dx);
    else if(dx<-1e-9)nearest=Math.min(nearest,(minX-px)/dx);

    if(dy>1e-9)nearest=Math.min(nearest,(maxY-py)/dy);
    else if(dy<-1e-9)nearest=Math.min(nearest,(minY-py)/dy);

    return Math.max(0,Math.min(distance,nearest));
  },
  segmentIntersectsRect(ax,ay,bx,by,rect,padding=0){
    return this.segmentRectEntry(
      ax,
      ay,
      bx,
      by,
      rect,
      padding
    )!==null;
  },
  segmentRectEntry(ax,ay,bx,by,rect,padding=0){
    const left=rect.x-padding;
    const right=rect.x+rect.w+padding;
    const top=rect.y-padding;
    const bottom=rect.y+rect.h+padding;

    const dx=bx-ax;
    const dy=by-ay;
    let tMin=0;
    let tMax=1;

    const clip=(p,q)=>{
      if(Math.abs(p)<1e-9)return q>=0;

      const ratio=q/p;

      if(p<0){
        if(ratio>tMax)return false;
        if(ratio>tMin)tMin=ratio;
      }else{
        if(ratio<tMin)return false;
        if(ratio<tMax)tMax=ratio;
      }

      return true;
    };

    if(
      !clip(-dx,ax-left)||
      !clip(dx,right-ax)||
      !clip(-dy,ay-top)||
      !clip(dy,bottom-ay)
    ){
      return null;
    }

    return tMin;
  },
  segmentBlocked(ax,ay,bx,by,padding=0){
    const pad=Math.max(0,Number(padding)||0);
    const width=WorldBoundsService.width();
    const height=WorldBoundsService.height();

    if(
      ax<pad||ax>width-pad||
      ay<pad||ay>height-pad||
      bx<pad||bx>width-pad||
      by<pad||by>height-pad
    )return true;

    for(const wall of DebugMapService.walls()){
      if(this.segmentIntersectsRect(ax,ay,bx,by,wall,pad)){
        return true;
      }
    }
    return false;
  },
  wallAtPoint(x,y,padding=0){
    const px=Number(x);
    const py=Number(y);
    if(!Number.isFinite(px)||!Number.isFinite(py))return null;

    const pad=Math.max(0,Number(padding)||0);
    const boundary=this.boundaryWallAtPoint(px,py,pad);
    if(boundary)return boundary;

    for(const wall of DebugMapService.walls()){
      if(
        px>=wall.x-pad&&
        px<=wall.x+wall.w+pad&&
        py>=wall.y-pad&&
        py<=wall.y+wall.h+pad
      ){
        return wall;
      }
    }
    return null;
  },
  nearestOpenPoint(x,y,clearance=1){
    const px=Number(x);
    const py=Number(y);
    if(!Number.isFinite(px)||!Number.isFinite(py))return null;

    const gap=Math.max(1,Number(clearance)||1);
    const wall=this.wallAtPoint(px,py,0);
    if(!wall){
      return {x:px,y:py,adjusted:false};
    }

    const width=WorldBoundsService.width();
    const height=WorldBoundsService.height();

    if(wall.boundary===true){
      return {
        x:Math.max(gap,Math.min(width-gap,px)),
        y:Math.max(gap,Math.min(height-gap,py)),
        adjusted:true
      };
    }

    const point=this.closestPointOnRectPerimeter(
      px,
      py,
      wall
    );
    const left=Number(wall.x)||0;
    const right=left+Math.max(0,Number(wall.w)||0);
    const top=Number(wall.y)||0;
    const bottom=top+Math.max(0,Number(wall.h)||0);

    const d0=Math.abs(point.x-left);
    const d1=Math.abs(point.x-right);
    const d2=Math.abs(point.y-top);
    const d3=Math.abs(point.y-bottom);
    let usedMask=0;

    for(let attempt=0;attempt<4;attempt++){
      let side=-1;
      let nearest=Infinity;
      for(let index=0;index<4;index++){
        if((usedMask&(1<<index))!==0)continue;
        const distance=
          index===0?d0:
          index===1?d1:
          index===2?d2:d3;
        if(distance>=nearest)continue;
        side=index;
        nearest=distance;
      }
      if(side<0)break;
      usedMask|=1<<side;

      let cx=point.x;
      let cy=point.y;
      if(side===0)cx=left-gap;
      else if(side===1)cx=right+gap;
      else if(side===2)cy=top-gap;
      else cy=bottom+gap;

      cx=Math.max(gap,Math.min(width-gap,cx));
      cy=Math.max(gap,Math.min(height-gap,cy));
      if(!this.wallAtPoint(cx,cy,0)){
        return {x:cx,y:cy,adjusted:true};
      }
    }

    return {
      x:Math.max(gap,Math.min(width-gap,point.x)),
      y:Math.max(gap,Math.min(height-gap,point.y)),
      adjusted:true
    };
  },
  closestPointOnRectPerimeter(x,y,rect,out=null){
    const result=out&&typeof out==='object'?out:{};
    if(!rect){
      result.x=Number(x)||0;
      result.y=Number(y)||0;
      return result;
    }

    const px=Number(x)||0;
    const py=Number(y)||0;
    const left=Number(rect.x)||0;
    const right=left+Math.max(0,Number(rect.w)||0);
    const top=Number(rect.y)||0;
    const bottom=top+Math.max(0,Number(rect.h)||0);

    const clampedX=Math.max(left,Math.min(right,px));
    const clampedY=Math.max(top,Math.min(bottom,py));

    const outside=
      px<left||
      px>right||
      py<top||
      py>bottom;

    if(outside){
      result.x=clampedX;
      result.y=clampedY;
      return result;
    }

    let nearestDistance=Math.abs(px-left);
    result.x=left;
    result.y=py;

    const rightDistance=Math.abs(right-px);
    if(rightDistance<nearestDistance){
      nearestDistance=rightDistance;
      result.x=right;
      result.y=py;
    }

    const topDistance=Math.abs(py-top);
    if(topDistance<nearestDistance){
      nearestDistance=topDistance;
      result.x=px;
      result.y=top;
    }

    const bottomDistance=Math.abs(bottom-py);
    if(bottomDistance<nearestDistance){
      result.x=px;
      result.y=bottom;
    }
    return result;
  },
  nearestWallTarget(x,y,maxDistance=0){
    const px=Number(x);
    const py=Number(y);
    if(!Number.isFinite(px)||!Number.isFinite(py))return null;

    const direct=this.wallAtPoint(px,py,0);
    if(direct){
      return {wall:direct,point:{x:px,y:py},distance:0};
    }

    const limit=Math.max(0,Number(maxDistance)||0);
    const width=WorldBoundsService.width();
    const height=WorldBoundsService.height();
    const clampedX=Math.max(0,Math.min(width,px));
    const clampedY=Math.max(0,Math.min(height,py));

    let bestWall=null;
    let bestBoundarySide='';
    let bestX=0;
    let bestY=0;
    let bestDistance=Infinity;

    const leftDistance=Math.hypot(px,clampedY-py);
    if(leftDistance<=limit){
      bestBoundarySide='left';
      bestX=0;
      bestY=clampedY;
      bestDistance=leftDistance;
    }

    const rightDistance=Math.hypot(width-px,clampedY-py);
    if(rightDistance<=limit&&rightDistance<bestDistance){
      bestBoundarySide='right';
      bestX=width;
      bestY=clampedY;
      bestDistance=rightDistance;
    }

    const topDistance=Math.hypot(clampedX-px,py);
    if(topDistance<=limit&&topDistance<bestDistance){
      bestBoundarySide='top';
      bestX=clampedX;
      bestY=0;
      bestDistance=topDistance;
    }

    const bottomDistance=Math.hypot(clampedX-px,height-py);
    if(bottomDistance<=limit&&bottomDistance<bestDistance){
      bestBoundarySide='bottom';
      bestX=clampedX;
      bestY=height;
      bestDistance=bottomDistance;
    }

    const pointScratch={x:0,y:0};
    for(const wall of DebugMapService.walls()){
      this.closestPointOnRectPerimeter(px,py,wall,pointScratch);
      const distance=Math.hypot(pointScratch.x-px,pointScratch.y-py);
      if(distance>limit||distance>=bestDistance)continue;
      bestWall=wall;
      bestBoundarySide='';
      bestX=pointScratch.x;
      bestY=pointScratch.y;
      bestDistance=distance;
    }

    if(!Number.isFinite(bestDistance))return null;

    if(!bestWall&&bestBoundarySide){
      if(bestBoundarySide==='left'){
        bestWall={x:0,y:0,w:0,h:height,boundary:true,side:'left'};
      }else if(bestBoundarySide==='right'){
        bestWall={x:width,y:0,w:0,h:height,boundary:true,side:'right'};
      }else if(bestBoundarySide==='top'){
        bestWall={x:0,y:0,w:width,h:0,boundary:true,side:'top'};
      }else{
        bestWall={x:0,y:height,w:width,h:0,boundary:true,side:'bottom'};
      }
    }

    return {
      wall:bestWall,
      point:{x:bestX,y:bestY},
      distance:bestDistance
    };
  },
  raycastDistance(x,y,angle,maxDistance,padding=0){
    const distance=Math.max(0,Number(maxDistance)||0);
    const bx=x+Math.cos(angle)*distance;
    const by=y+Math.sin(angle)*distance;
    let nearest=this.boundaryRayDistance(
      x,
      y,
      angle,
      distance,
      padding
    );

    for(const wall of DebugMapService.walls()){
      const entry=this.segmentRectEntry(
        x,
        y,
        bx,
        by,
        wall,
        padding
      );

      if(entry===null)continue;
      nearest=Math.min(nearest,distance*entry);
    }

    return nearest;
  },
});