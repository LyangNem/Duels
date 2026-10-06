


/*
  애니메이션형 공격의 clipToAttackArea 윤곽을 완성형 정적 선으로 미리 그리지 않고,
  현재 프레임 geometry에 맞춰 생성하기 위한 공통 프레젠테이션 서비스.
  스야 arcSweep / areaCircle progressSweep과 동일하게 벽 raycast를 현재 진행 범위에 다시 적용한다.
*/
const ProgressiveClippedAreaOutlinePresentationService=Object.freeze({
  supportedRenderTypes:Object.freeze([
    'arcSweep',
    'annularDoubleSweep',
    'areaCircle',
    'konyeongSwing',
    'progressRect'
  ]),
  supportsModule(module){
    if(
      !module||
      module.type!=='effect.spawn'||
      module.clipToAttackArea!==true||
      module.replaceAutoAreaEffect!==true
    )return false;

    const renderType=String(module.renderType||'');
    if(!this.supportedRenderTypes.includes(renderType))return false;

    if(renderType==='arcSweep')return module.animateSweep===true;
    if(renderType==='areaCircle')return module.progressSweep===true;
    if(renderType==='annularDoubleSweep')return true;
    if(renderType==='konyeongSwing')return module.animation===true;
    if(renderType==='progressRect')return module.animation===true;
    return false;
  },
  strokePolygon(ctx,points,{color,alpha=1,lineWidth=2.5,dash=[]}={}){
    if(!ctx||!Array.isArray(points)||points.length<3)return false;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(Number(points[0]?.x)||0,Number(points[0]?.y)||0);
    for(let index=1;index<points.length;index++){
      ctx.lineTo(Number(points[index]?.x)||0,Number(points[index]?.y)||0);
    }
    ctx.closePath();
    ctx.strokeStyle=`rgba(${ColorService.rgbString(color,'200,216,240')},${Math.max(0,Math.min(1,Number(alpha)||0))})`;
    ctx.lineWidth=Math.max(.5,Number(lineWidth)||2.5);
    ctx.lineJoin='round';
    ctx.lineCap='round';
    ctx.setLineDash(Array.isArray(dash)?dash:[]);
    ctx.stroke();
    ctx.restore();
    return true;
  },
  circleGeometry(x,y,range,wallPolicy='block',segments=96){
    return AreaGeometryService.polygon(
      {x:Number(x)||0,y:Number(y)||0,radius:0},
      {
        type:'delivery.area',
        shape:'circle',
        range:Math.max(0,Number(range)||0),
        wallPolicy:String(wallPolicy||'block')
      },
      0,
      segments
    );
  },
  annularSweepPoints(effect,startAngle,endAngle,outer,inner,counterClockwise=false){
    const span=Math.abs(Number(endAngle)-Number(startAngle));
    if(span<=1e-5)return [];
    // Keep completed rays fixed: redistributing span/count each frame moves
    // every existing vertex (especially wall cuts), making the outline shimmer.
    const step=Math.PI*2/96;
    const direction=Number(endAngle)>=Number(startAngle)?1:-1;
    const angles=[Number(startAngle)];
    for(let index=1;index*step<span-1e-8;index++){
      angles.push(Number(startAngle)+direction*index*step);
    }
    angles.push(Number(endAngle));
    const x=Number(effect?.x)||0;
    const y=Number(effect?.y)||0;
    const wallPolicy=String(effect?.clipWallPolicy||'block');
    const ignoreWalls=wallPolicy==='ignore';
    const outerPoints=[];
    const innerPoints=[];
    for(const angle of angles){
      const outerDistance=ignoreWalls
        ?Math.max(0,Number(outer)||0)
        :WorldGeometryService.raycastDistance(
          x,y,angle,Math.max(0,Number(outer)||0),0
        );
      const innerDistance=Math.min(
        Math.max(0,Number(inner)||0),
        outerDistance
      );
      outerPoints.push({
        x:x+Math.cos(angle)*outerDistance,
        y:y+Math.sin(angle)*outerDistance
      });
      if(inner>0){
        innerPoints.push({
          x:x+Math.cos(angle)*innerDistance,
          y:y+Math.sin(angle)*innerDistance
        });
      }
    }
    if(inner>0){
      innerPoints.reverse();
      return outerPoints.concat(innerPoints);
    }
    if(span>=Math.PI*2-1e-4){
      return outerPoints;
    }
    return [{x,y},...outerPoints];
  }
});