

GameEvents.on(
  'dodge-started',
  event=>{
    const target=event?.target;
    if(
      !target||
      !EntitySimulationAuthorityService
        .isLocal(target)
    )return;

    AugmentEffectModuleService.runTrigger(
      target,
      'dodge-started',
      {
        source:target,
        target,
        angle:Number(event?.aimAngle)||0,
        dodgeDuration:GAME_DATA.dodge.dur,
        now:Number(event?.now)||performance.now()
      }
    );
  }
);