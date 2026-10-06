

RuntimeValueReferenceService.register(
  'summon.cluster-max-stage',
  (entity,ref)=>{
    const target=ref.target==='owner'?(EntityService.owner(entity)||entity):entity;
    if(!target)return 0;
    let highest=0;
    for(const summon of ClusterSummonService.entities(target,String(ref.summonKey||''))){
      if(!summon?.alive)continue;
      highest=Math.max(highest,Math.max(1,Math.floor(Number(summon.clusterStage)||1)));
    }
    return highest;
  }
);