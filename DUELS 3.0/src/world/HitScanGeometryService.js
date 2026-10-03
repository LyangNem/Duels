

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

    const range=this.effectiveRange(source,module,angle);
    if(range===module.range)return module;

    return {
      ...module,
      range
    };
  }
});