
RuntimeValueReferenceService.register(
  'cooking-meal-ratio',
  (entity,ref)=>{
    const target=ref.target==='owner'?(EntityService.owner(entity)||entity):entity;
    const count=Math.max(0,Math.floor(Number(CookingService.state(target,true)?.mealCount)||0));
    return count>0?Math.max(0,Math.min(1,count/Math.max(1,CookingService.stoveCapacity(target)))):0;
  }
);