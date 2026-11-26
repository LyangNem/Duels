/* target.select 선택 판정과 같은 유효 대상·포인터 반경을 표시한다. */
const AbilityTargetRangePresentationService=Object.freeze({
  draw(ctx,source){
    if(!ctx||!source?.alive||!EntitySimulationAuthorityService.isLocal(source))return false;
    let drawn=false;
    for(const ability of Object.values(source.character?.abilities||{})){
      const attack=AbilityService.attackById(source.character,ability.attackId);
      for(const module of ability.trigger?.modules||[]){
        if(module.type!=='target.select'||module.showTargetRange!==true)continue;
        for(const target of EntityService.items.values()){
          if(target.hidden||!AbilityModuleService.targetEligible(source,target,attack,module))continue;
          ctx.save();ctx.beginPath();
          ctx.arc(Number(target.x)||0,Number(target.y)||0,AbilityModuleService.targetPointerRadius(target,module),0,Math.PI*2);
          ctx.strokeStyle=`rgba(${ColorService.rgbString(source.color)},.55)`;
          ctx.lineWidth=1.8;ctx.setLineDash([7,6]);ctx.stroke();ctx.setLineDash([]);ctx.restore();
          drawn=true;
        }
      }
    }
    return drawn;
  }
});
