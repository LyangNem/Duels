

GameEvents.on(
  'just-dodge',
  event=>{
    const target=event?.target;
    if(
      !target||
      !EntitySimulationAuthorityService
        .isLocal(target)
    )return;

    CharacterTriggerEffectService.run(target,'just-dodge',{source:target,target,now:Number(event?.now)||performance.now()});

    AugmentEffectModuleService.runTrigger(
      target,
      'just-dodge',
      {
        source:target,
        target,
        now:
          Number(event?.now)||
          performance.now()
      }
    );
  }
);