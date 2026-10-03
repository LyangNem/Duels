

const AreaZonePresentationService=Object.freeze({
  draw(
    ctx,
    {
      x,
      y,
      radius,
      bodyColor,
      source=null,
      pulse=1,
      alpha=1
    }={}
  ){
    if(!ctx)return false;

    const bodyRgb=
      ColorService.rgbString(
        bodyColor,
        '255,20,147'
      );
    const outline=
      source
        ?TeamColorPresentationService
          .colorForEntity(
            source,
            source.color||'#ff1493'
          )
        :ColorService.css(
          bodyColor,
          '#ff1493'
        );

    ctx.save();
    ctx.beginPath();
    ctx.arc(
      Number(x)||0,
      Number(y)||0,
      Math.max(0,Number(radius)||0),
      0,
      Math.PI*2
    );
    ctx.fillStyle=
      `rgba(${bodyRgb},${.06*pulse*alpha})`;
    ctx.fill();
    ctx.strokeStyle=outline;
    ctx.globalAlpha=
      .38*pulse*alpha;
    ctx.lineWidth=1.8;
    ctx.setLineDash([]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
    return true;
  }
});