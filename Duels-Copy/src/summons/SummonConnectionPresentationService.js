

const SummonConnectionPresentationService=Object.freeze({
  visibleToLocal(owner){
    const viewer=Training.player;
    if(!owner||!viewer)return false;

    const relation=
      RelationService.relation(
        viewer,
        owner
      );

    return (
      relation==='self'||
      relation==='ally'
    );
  },
  draw(ctx,entity){
    if(
      !ctx||
      entity?.kind!=='summon'
    )return false;

    const owner=EntityService.owner(
      entity
    );

    if(
      !owner||
      !this.visibleToLocal(owner)
    )return false;

    const rgb=ColorService.rgbString(
      owner.color||entity.color,
      '210,220,235'
    );

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(owner.x,owner.y);
    ctx.lineTo(entity.x,entity.y);
    ctx.strokeStyle=
      `rgba(${rgb},.18)`;
    ctx.lineWidth=1.5;
    ctx.setLineDash([5,6]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
    return true;
  }
});