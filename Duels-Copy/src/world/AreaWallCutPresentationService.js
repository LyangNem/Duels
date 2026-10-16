



/* 벽에 잘린 범위공격은 최종 판정 polygon에서 새로 생긴 벽 경계선만 공통으로 추출한다. */
const AreaWallCutPresentationService=Object.freeze({
  epsilon:0.75,
  sameNumber(a,b,tolerance=.001){
    return Math.abs((Number(a)||0)-(Number(b)||0))<=tolerance;
  },
  preparedSourceModule(attack,module){
    const candidates=(attack?.modules||[]).filter(candidate=>
      candidate?.type==='delivery.area'&&
      String(candidate.shape||'rect')===String(module?.shape||'rect')&&
      String(candidate.wallPolicy||'block')===String(module?.wallPolicy||'block')&&
      this.sameNumber(candidate.halfWidth,module?.halfWidth)&&
      this.sameNumber(candidate.startHalfWidth,module?.startHalfWidth)&&
      this.sameNumber(candidate.endHalfWidth,module?.endHalfWidth)&&
      this.sameNumber(candidate.centerDistance,module?.centerDistance)&&
      this.sameNumber(candidate.angleOffset,module?.angleOffset)
    );
    if(!candidates.length)return null;

    let best=null;
    let bestRange=-Infinity;
    for(const candidate of candidates){
      const range=Math.max(0,Number(candidate.range)||0);
      if(range<Math.max(0,Number(module?.range)||0)-this.epsilon)continue;
      if(range>bestRange){
        best=candidate;
        bestRange=range;
      }
    }
    return best||candidates[0]||null;
  },
  polygonSegments(source,module,angle,polygon){
    if(!Array.isArray(polygon)||polygon.length<3)return [];

    const shape=String(module?.shape||'');
    if(!['circle','sector','tapered-rect'].includes(shape))return [];

    const idealModule={...module,wallPolicy:'ignore'};
    const segmentCount=
      shape==='circle'
        ?polygon.length
        :Math.max(24,polygon.length-2);
    const idealGeometry=AreaGeometryService.polygon(
      source,
      idealModule,
      angle,
      segmentCount
    );
    const ideal=idealGeometry?.points||[];
    if(ideal.length!==polygon.length)return [];

    const clipped=polygon.map((point,index)=>{
      const target=ideal[index];
      if(!point||!target)return false;
      return Math.hypot(point.x-target.x,point.y-target.y)>this.epsilon;
    });

    const segments=[];
    for(let index=0;index<polygon.length;index++){
      const next=(index+1)%polygon.length;
      if(!clipped[index]||!clipped[next])continue;
      const a=polygon[index];
      const b=polygon[next];
      if(Math.hypot(b.x-a.x,b.y-a.y)<=this.epsilon)continue;
      segments.push({
        ax:a.x,ay:a.y,
        bx:b.x,by:b.y
      });
    }
    return segments;
  },
  rectSegments(source,attack,module,angle){
    if(String(module?.shape||'rect')!=='rect')return [];
    const original=this.preparedSourceModule(attack,module);
    const originalRange=Math.max(0,Number(original?.range)||0);
    const actualRange=Math.max(0,Number(module?.range)||0);
    if(originalRange<=actualRange+this.epsilon)return [];

    const halfWidth=Math.max(0,Number(module?.halfWidth)||0);
    if(halfWidth<=0)return [];

    const cos=Math.cos(angle);
    const sin=Math.sin(angle);
    const cx=(Number(source?.x)||0)+cos*actualRange;
    const cy=(Number(source?.y)||0)+sin*actualRange;
    return [{
      ax:cx-sin*halfWidth,
      ay:cy+cos*halfWidth,
      bx:cx+sin*halfWidth,
      by:cy-cos*halfWidth
    }];
  },
  segments(source,attack,module,angle,polygon){
    if(!source||!module||module.wallPolicy==='ignore')return [];
    const polygonCuts=this.polygonSegments(
      source,module,angle,polygon
    );
    if(polygonCuts.length)return polygonCuts;
    return this.rectSegments(
      source,attack,module,angle
    );
  }
});