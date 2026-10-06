

GameEvents.on(
  'network-hit-confirmed',
  event=>{
    if(
      !event?.source||
      !EntitySimulationAuthorityService.isLocal(event.source)
    )return;
    OrbitInventoryService.consumeConfirmed(
      event.source,
      event.impact?.networkMeta
    );
  }
);