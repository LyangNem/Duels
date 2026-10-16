

GameEvents.on(
  'attack-fired',
  event=>{
    const source=event?.source;
    if(
      !source||
      !EntitySimulationAuthorityService
        .isLocal(source)
    )return;

    AugmentEffectModuleService.runTrigger(
      source,
      'attack-fired',
      {
        source,
        target:null,
        attack:event.attack||null,
        execution:event.execution||null,
        angle:Number(event.angle)||0,
        now:
          Number(event.now)||
          performance.now()
      }
    );
  }
);