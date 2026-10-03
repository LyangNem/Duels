

GameEvents.on(
  'entity-defeated',
  event=>{
    const entity=event?.entity;

    if(
      entity?.kind!=='summon'||
      entity.clusterSummonKind===ClusterSummonService.KIND||
      !entity.summonStateKey
    )return;

    const owner=EntityService.owner(
      entity
    );

    if(
      !EntitySimulationAuthorityService
        .isLocal(entity)
    )return;

    SummonDeployService.destroy(
      owner,
      entity.summonStateKey,
      Number(event.now)||
        performance.now()
    );
  }
);