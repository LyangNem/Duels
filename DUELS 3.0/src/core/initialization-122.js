

GameEvents.on(
  'dodge-ended',
  event=>{
    const target=event?.target;
    if(
      !target||
      !EntitySimulationAuthorityService
        .isLocal(target)
    )return;

    AugmentEffectModuleService.runTrigger(
      target,
      'dodge-ended',
      {
        source:target,
        target,
        angle:Number(event?.aimAngle)||0,
        now:Number(event?.now)||performance.now()
      }
    );
  }
);