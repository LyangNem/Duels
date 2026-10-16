

GameEvents.on(
  'damage-applied',
  event=>{
    if(event?.defeatPrevented!==true)return;

    const source=event?.source;
    const target=event?.target;

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