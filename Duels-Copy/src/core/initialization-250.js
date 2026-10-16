



GameEvents.on(
  'damage-applied',
  event=>{
    const target=event?.target;
    if(
      !target||
      target.kind!=='summon'||
      !EntitySimulationAuthorityService
        .isLocal(target)
    )return;

    SummonAIService.recordDamageEscape(
      target,
      event,
      Number(event?.now)||
      performance.now()
    );
  }
);