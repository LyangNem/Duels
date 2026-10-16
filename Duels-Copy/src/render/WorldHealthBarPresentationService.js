

const WorldHealthBarPresentationService=Object.freeze({
  ratio(entity,now=performance.now(),frameScale=1){
    const out=
      entity?.worldHealthBarState||
      (entity
        ?(entity.worldHealthBarState={
          current:0,
          trail:0
        })
        :null);

    if(!entity?.maxHealth){
      return out||RENDER_NEUTRAL_HEALTH_BAR;
    }

    const current=Math.max(
      0,
      Math.min(1,entity.health/entity.maxHealth)
    );

    let trailHealth=Number(entity.healthTrailHealth);
    if(!Number.isFinite(trailHealth)){
      trailHealth=entity.health;
    }

    if(entity.health>=trailHealth){
      trailHealth=entity.health;
    }else if(now>=(entity.healthTrailDelayUntil||0)){
      const followPerFrame=Math.max(
        entity.maxHealth*.035,
        1
      );
      trailHealth=Math.max(
        entity.health,
        trailHealth-
          followPerFrame*Math.max(0,frameScale)
      );
    }

    entity.healthTrailHealth=trailHealth;
    out.current=current;
    out.trail=Math.max(
      current,
      Math.min(1,trailHealth/entity.maxHealth)
    );
    return out;
  }
});