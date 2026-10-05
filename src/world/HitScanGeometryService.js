

const HitScanGeometryService=Object.freeze({
  effectiveRange(source,module,angle){
    const range=Math.max(0,Number(module?.range)||0);
    if(!source||range<=0)return range;

    return WorldGeometryService.raycastDistance(
      source.x,
      source.y,
      angle,
      range
    );
  },
  firstEnemyRange(source,module,angle){
    let range=Math.max(0,Number(module?.range)||0);
    if(module?.stopAtFirstEnemy!==true)return range;
    const cos=Math.cos(angle),sin=Math.sin(angle),width=Math.max(0,Number(module.halfWidth)||0);
    for(const target of EntityService.items.values()){
      if(!target?.alive||target.hidden||RelationService.relation(source,target)!=='enemy')continue;
      const point=NetworkCollisionPositionService.point(target);
      const dx=Number(point.x)-Number(source.x),dy=Number(point.y)-Number(source.y);
      const forward=dx*cos+dy*sin,lateral=Math.abs(-dx*sin+dy*cos);
      if(forward>=0&&forward<=range&&lateral<=width+Math.max(0,Number(target.radius)||0))range=Math.min(range,forward);
    }
    return range;
  },
  effectiveModule(source,spec,module,angle){
    if(
      !TagService.hasAttack(spec,'히트스캔')||
      module?.wallPolicy==='ignore'||
      module?.shape==='circle'||
      module?.shape==='sector'||
      module?.shape==='tapered-rect'
    ){
      return module;
    }

    const enemyRange=this.firstEnemyRange(source,module,angle);
    const range=this.effectiveRange(source,{...module,range:enemyRange},angle);
    if(range===module.range)return module;

    return {
      ...module,
      range
    };
  }
});