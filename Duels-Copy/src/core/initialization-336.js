

GameEvents.on('scripted-projectile-arrived',event=>{
  const projectile=event?.projectile;
  const meta=projectile?.cookingMealMeta;
  const source=projectile?.source;
  if(!meta||!source||!CookingService.config(source))return;
  if(meta.mode==='incoming'){
    const state=CookingService.state(source,true);
    const grant=Math.max(1,Math.floor(Number(meta.count)||1));
    state.incomingMealCount=Math.max(0,Math.floor(Number(state.incomingMealCount)||0)-grant);
    state.mealCount=Math.min(CookingService.stoveCapacity(source),grant);
    CookingService.syncReady(source);
    source.combatSnapshotDirty=true;
    return;
  }
  if(meta.mode==='thrown'&&String(event?.motion?.mode||'')==='anchored-arc'){
    if(EntitySimulationAuthorityService.isLocal(source)){
      CookingService.applyThrownMeal(source,event.target||source,meta.count);
    }
  }
});