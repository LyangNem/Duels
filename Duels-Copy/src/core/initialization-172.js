

GameEvents.on(
  'attack-fired',
  event=>{
    const source=event?.source;

    if(
      !source||
      !EntitySimulationAuthorityService
        .isLocal(source)
    )return;

    CommandFeatureService.onAction(
      source,
      event.attack,
      Number(event.now)||
      performance.now()
    );
  }
);