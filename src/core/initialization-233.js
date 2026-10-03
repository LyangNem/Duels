


GameEvents.on(
  'ability-used',
  event=>{
    const source=event?.source;
    if(
      !source||
      !EntitySimulationAuthorityService
        .isLocal(source)
    )return;

    AugmentEffectModuleService.runTrigger(
      source,
      'ability-used',
      {
        source,
        target:null,
        ability:event.ability||null,
        attack:event.attack||null,
        usageTags:
          event.usageTags instanceof Set
            ?event.usageTags
            :new Set(),
        execution:null,
        angle:Number(event.angle)||0,
        now:
          Number(event.now)||
          performance.now()
      }
    );
  }
);