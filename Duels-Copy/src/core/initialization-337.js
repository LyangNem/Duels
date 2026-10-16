

RuntimeValueReferenceService.register(
  'cooking-ingredient-count',
  (entity,ref)=>{
    const target=ref.target==='owner'?(EntityService.owner(entity)||entity):entity;
    return Math.max(0,Math.floor(Number(CookingService.state(target,true)?.ingredients)||0));
  }
);