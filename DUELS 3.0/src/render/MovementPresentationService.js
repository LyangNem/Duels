

/* 투사체 */
const MovementPresentationService=Object.freeze({
  pushLine(source,fromX,fromY,toX,toY,spec){
    if(!Training.active||!spec)return null;

    const now=performance.now();
    const duration=Math.max(
      1,
      Number(spec.duration)||
      (Number(spec.durationFrames)>0?Number(spec.durationFrames)*GAME_DATA.frameMs:167)
    );
    const effect=EffectSpawnService.spawn({
      ...spec,
      type:spec.type||'dash-line',
      x:fromX,
      y:fromY,
      tx:toX,
      ty:toY,
      color:ColorService.rgbString(
        spec.color,
        ColorService.rgbString(source?.color)
      ),
      width:Math.max(.5,Number(spec.width)||6),
      alpha:Math.max(0,Math.min(1,Number(spec.alpha)||.4)),
      start:now,
      dur:duration,
      sourceEntityId:source?.id||null
    },{source});

    if(
      effect&&
      OnlinePresentationSyncService?.shouldSend?.(source)
    ){
      OnlinePresentationSyncService.send(
        'effect-spawn',
        source,
        {
          effect:
            EffectSpawnService.presentationSnapshot(
              effect,
              now
            )
        }
      );
    }

    return effect;
  }
});