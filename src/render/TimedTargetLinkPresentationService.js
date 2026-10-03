

const TimedTargetLinkPresentationService=Object.freeze({
  draw(ctx,source,now=performance.now()){
    if(!ctx||!source?.alive||!source.actionState)return false;
    let drawn=false;

    for(const state of source.actionState.values()){
      if(
        state?.kind!=='timed-action-state'||
        state.data?.targetLink!==true
      )continue;

      const linkDuration=Math.max(0,Number(state.data?.linkDuration)||0);
      if(
        linkDuration>0&&
        now-Number(state.startedAt||now)>linkDuration
      )continue;

      const target=EntityService.items.get(
        String(state.data?.targetEntityId||'')
      )||null;
      if(!target?.alive)continue;

      const rgb=ColorService.rgbString(
        state.data?.linkColor||source.color,
        '242,217,138'
      );

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(Number(source.x)||0,Number(source.y)||0);
      ctx.lineTo(Number(target.x)||0,Number(target.y)||0);
      ctx.strokeStyle=`rgba(${rgb},.34)`;
      ctx.lineWidth=1.5;
      ctx.setLineDash([5,6]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
      drawn=true;
    }

    return drawn;
  }
});