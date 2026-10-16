

GameEvents.on(
  'entity-defeated',
  event=>{
    const source=event?.source;
    const target=event?.entity;

    if(
      Training.sessionMode==='online'&&
      OnlineDuelService.active&&
      !EntitySimulationAuthorityService.isLocal(source)
    )return;

    CharacterKillProgressService.apply(
      source,
      target,
      event?.attack?.id
    );
  }
);