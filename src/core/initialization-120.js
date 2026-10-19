

GameEvents.on(
  'just-dodge',
  event=>{
    const target=event?.target;
    if(
      !target||
      !EntitySimulationAuthorityService
        .isLocal(target)
    )return;

    CharacterTriggerEffectService.observe('enemy-just-dodge',target,
      {now:Number(event?.now)||performance.now(),cause:event?.cause},String(event?.startedAt??event?.now));
    CharacterTriggerEffectService.run(target,'just-dodge',{source:target,target,cause:event?.cause,now:Number(event?.now)||performance.now()});

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
