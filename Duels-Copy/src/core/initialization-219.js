

GameEvents.on(
  'network-hit-confirmed',
  event=>{
    if(
      (
        event?.defeated!==true&&
        event?.defeatPrevented!==true
      )||
      !EntitySimulationAuthorityService.isLocal(
        event?.source
      )
    )return;

    CharacterKillProgressService.apply(
      event.source,
      event.target,
      event?.attack?.id
    );
  }
);