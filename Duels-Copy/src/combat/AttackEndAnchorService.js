

/* 공격 끝점 앵커: attack-end field 설치/미리보기/조건부 피해가 동일한 벽 절단 끝점을 공유한다. */
const AttackEndAnchorService=Object.freeze({
  distance(source,attack,module,angle=0){
    const requestedDistance=Math.max(
      0,
      Number(module?.centerDistance)||Number(attack?.range)||0
    );
    const deliveryArea=(attack?.modules||[]).find(candidate=>
      AttackModuleService.type(candidate)==='delivery.area'
    )||null;
    const blocksAnchor=
      module?.anchorWallPolicy==='block'||
      (
        module?.anchorWallPolicy!=='ignore'&&
        deliveryArea?.wallPolicy==='block'
      );
    if(!blocksAnchor)return requestedDistance;
    const rayDistance=WorldGeometryService.raycastDistance(
      Number(source?.x)||0,
      Number(source?.y)||0,
      Number(angle)||0,
      requestedDistance,
      0
    );
    return rayDistance<requestedDistance
      ?Math.max(0,rayDistance-.5)
      :rayDistance;
  },
  point(source,attack,module,angle=0,out=null){
    const distance=this.distance(source,attack,module,angle);
    const point=out||{};
    point.x=(Number(source?.x)||0)+Math.cos(Number(angle)||0)*distance;
    point.y=(Number(source?.y)||0)+Math.sin(Number(angle)||0)*distance;
    point.distance=distance;
    return point;
  }
});