

RuntimeValueReferenceService.register(
  'orbit-inventory-quality-ratio',
  (entity,ref)=>{
    const target=ref.target==='owner'?(EntityService.owner(entity)||entity):entity;
    if(!target)return 0;
    const config=OrbitInventoryService.config(target,String(ref.stateKey||''));
    if(!config)return 0;
    const quality=OrbitInventoryService.quality(target,String(ref.stateKey||''));
    const maxQuality=Math.max(1,Math.floor(Number(config.maxQuality)||1));
    return Math.max(0,Math.min(1,Math.max(1,quality)/maxQuality));
  }
);