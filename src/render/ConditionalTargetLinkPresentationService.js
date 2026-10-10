

const ConditionalTargetLinkPresentationService=Object.freeze({
  draw(ctx,viewer){
    if(
      !ctx||
      !viewer?.alive||
      viewer!==Training.player||
      !EntitySimulationAuthorityService.isLocal(viewer)
    )return false;

    const configs=
      viewer.character?.conditionalTargetLinks;
    if(!Array.isArray(configs)||!configs.length){
      return false;
    }

    let drawn=false;
    for(const config of configs){
      if(
        String(config?.visibility||'owner')!=='owner'
      )continue;

      for(const target of EntityService.items.values()){
        if(
          !target?.alive||
          target.hidden||
          target===viewer
        )continue;

        const targetKinds=
          Array.isArray(config.targetKinds)
            ?config.targetKinds
            :null;
        if(
          targetKinds&&
          targetKinds.length&&
          !targetKinds.includes(String(target.kind||''))
        )continue;

        const relation=
          RelationService.relation(
            viewer,
            target
          );
        if(
          String(config.relation||'enemy')!==
          relation
        )continue;

        if(StealthPresentationService.state(viewer,target).hideWorldUi)continue;

        const maximum=
          Math.max(
            1,
            Number(target.maxHealth)||1
          );
        const healthRatio=
          Math.max(
            0,
            Math.min(
              1,
              (Number(target.health)||0)/
              maximum
            )
          );
        const threshold=
          Math.max(
            0,
            Math.min(
              1,
              Number(config.healthRatioBelow)||0
            )
          );
        if(!(healthRatio<threshold))continue;

        const dx=
          (Number(target.x)||0)-
          (Number(viewer.x)||0);
        const dy=
          (Number(target.y)||0)-
          (Number(viewer.y)||0);
        const distance=Math.hypot(dx,dy);
        if(distance<=.001)continue;

        const ux=dx/distance;
        const uy=dy/distance;
        const startPadding=
          Math.max(0,Number(viewer.radius)||0)+3;
        const endPadding=
          Math.max(0,Number(target.radius)||0)+3;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(
          (Number(viewer.x)||0)+ux*startPadding,
          (Number(viewer.y)||0)+uy*startPadding
        );
        ctx.lineTo(
          (Number(target.x)||0)-ux*endPadding,
          (Number(target.y)||0)-uy*endPadding
        );
        ctx.strokeStyle=
          `rgba(${ColorService.rgbString(
            config.color,
            '255,236,166'
          )},${Math.max(
            0,
            Math.min(
              1,
              Number(config.alpha)||.68
            )
          )})`;
        ctx.lineWidth=
          Math.max(
            .5,
            Number(config.lineWidth)||1.5
          );
        ctx.setLineDash(
          Array.isArray(config.dash)
            ?config.dash
            :[5,5]
        );
        ctx.stroke();
        ctx.restore();
        drawn=true;
      }
    }

    return drawn;
  }
});