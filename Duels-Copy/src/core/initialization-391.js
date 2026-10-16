

RuntimeValueReferenceService.register(
  'dynamic-wall-count',
  (entity,ref)=>{
    const target=ref.target==='owner'?(EntityService.owner(entity)||entity):entity;
    return target?DynamicWallService.wallsFor(target).length:0;
  }
);