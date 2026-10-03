

const NaturalHealthRegenGaugePresentationService=Object.freeze({
  progress(entity,now=performance.now()){
    if(
      !entity?.alive||
      !entity.healthRegenPolicy||
      entity.health>=entity.maxHealth
    )return null;

    const stats=
      CombatStatsService.current(
        entity,
        now
      );
    const delay=
      Math.max(
        0,
        Number(entity.healthRegenPolicy.idle)||0
      )*
      Math.max(
        0,
        Number(stats.regenDelayMult)||0
      );

    const remoteReadyAt=
      Number(
        entity
          ?._networkNaturalRegenReadyAt
      );

    const readyAt=
      (
        Training.sessionMode==='online'&&
        !EntitySimulationAuthorityService
          .isLocal(entity)&&
        Number.isFinite(remoteReadyAt)
      )
        ?remoteReadyAt
        :NaturalHealthRegenActivityService
          .latest(entity)+delay;

    if(
      entity?._networkNaturalRegenReady===true||
      now>=readyAt
    ){
      return 1;
    }

    if(delay<=0)return 1;

    return Math.max(
      0,
      Math.min(
        1,
        1-(readyAt-now)/delay
      )
    );
  },

  draw(ctx,entity,x,y,width,now=performance.now()){
    if(
      !DisplaySettings.state
        .naturalRegenTimer
    )return false;

    const progress=this.progress(
      entity,
      now
    );
    if(progress===null)return false;

    const height=2;
    ctx.fillStyle='rgba(0,0,0,.72)';
    ctx.fillRect(x,y,width,height);
    ctx.fillStyle='rgba(255,255,255,.92)';
    ctx.fillRect(
      x,
      y,
      width*progress,
      height
    );
    return true;
  }
});