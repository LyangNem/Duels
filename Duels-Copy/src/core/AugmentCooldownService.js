

const AugmentCooldownService=Object.freeze({
  effect(augment,cooldownId){
    return (augment?.effects||[]).find(effect=>
      effect.type==='cooldown'&&
      String(effect.id||'cooldown')===String(cooldownId||'cooldown')
    )||null;
  },
  key(augment,effect){
    return `${augment.id}:cooldown:${effect.id||'cooldown'}`;
  },
  state(
    entity,
    augment,
    effect,
    now=performance.now(),
    out=null
  ){
    const result=out||{};
    const owner=AugmentService.owner(entity);
    const duration=
      Math.max(1,Number(effect?.duration)||0);

    result.duration=duration;

    if(!owner){
      result.progress=0;
      result.ready=false;
      result.readyAt=Infinity;
      return result;
    }

    const acquiredAt=
      Number(
        owner.augmentState.augmentAcquiredAt.get(
          augment.id
        )
      )||0;
    const initialReadyAt=
      effect.startCharged===false
        ?acquiredAt+duration
        :0;
    const cooldownState=
      entity?.augmentState?.effectCooldowns;
    const readyAt=Math.max(
      cooldownState instanceof Map
        ?cooldownState.get(
          this.key(augment,effect)
        )||0
        :0,
      initialReadyAt
    );

    result.readyAt=readyAt;
    result.ready=now>=readyAt;
    result.progress=result.ready
      ?1
      :Math.max(
        0,
        Math.min(
          1,
          1-(readyAt-now)/duration
        )
      );

    return result;
  },
  ready(entity,augment,cooldownId,now=performance.now()){
    const effect=this.effect(augment,cooldownId);
    return !!effect&&this.state(entity,augment,effect,now).ready;
  },
  consume(entity,augment,cooldownId,now=performance.now()){
    const owner=AugmentService.owner(entity);
    const effect=this.effect(augment,cooldownId);
    const cooldownState=
      entity?.augmentState?.effectCooldowns;

    if(
      !owner||
      !effect||
      !(cooldownState instanceof Map)
    )return false;

    cooldownState.set(
      this.key(augment,effect),
      now+Math.max(0,Number(effect.duration)||0)
    );
    return true;
  },
  initializeEntity(
    entity,
    now=performance.now()
  ){
    const owner=AugmentService.owner(entity);
    const cooldownState=
      entity?.augmentState?.effectCooldowns;

    if(
      !owner||
      !(cooldownState instanceof Map)
    )return false;

    let initialized=false;

    for(const id of owner.augmentCache?.counts?.keys?.()||[]){
      const augment=
        AugmentDataService.get(id);
      if(!augment)continue;

      for(const effect of augment.effects||[]){
        if(
          effect?.type!=='cooldown'||
          effect.startCharged!==false
        )continue;

        cooldownState.set(
          this.key(augment,effect),
          now+
            Math.max(
              0,
              Number(effect.duration)||0
            )
        );
        initialized=true;
      }
    }

    return initialized;
  },
});