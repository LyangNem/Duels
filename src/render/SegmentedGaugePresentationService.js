

/* 값 배열을 칸으로 나눠 표시하는 범용 월드 게이지 렌더러. */
const SegmentedGaugePresentationService=Object.freeze({
  draw(ctx,{
    x,
    y,
    width=48,
    height=4,
    gap=2,
    value='',
    valueMode='value',
    segmentDuration=5000,
    segments=[],
    highlightCount=0,
    highlightColor='',
    highlightFrom='left',
    colorOverride='',
    activeAlpha=.95,
    background='rgba(10,18,22,0.92)',
    stroke='rgba(205,238,244,0.34)'
  }={}){
    if(!ctx||!Array.isArray(segments)||segments.length<1)return false;

    const count=segments.length;
    const resolvedGap=Math.max(0,Number(gap)||0);
    const resolvedHeight=Math.max(1,Number(height)||4);
    const fullWidth=Math.max(count,Number(width)||48);
    const cellWidth=
      (
        fullWidth-
        resolvedGap*(count-1)
      )/count;

    ctx.save();

    for(let index=0;index<count;index++){
      const segment=segments[index]||{};
      const gx=
        Number(x)+
        index*(cellWidth+resolvedGap);

      ctx.fillStyle=String(background);
      ctx.fillRect(
        gx,
        Number(y),
        cellWidth,
        resolvedHeight
      );

      const mode=String(valueMode||'value');
      const fillRatio=
        mode==='time'
          ?Math.max(
            0,
            Math.min(
              1,
              (
                Number(value)-
                index*
                  Math.max(
                    1,
                    Number(segmentDuration)||5000
                  )
              )/
              Math.max(
                1,
                Number(segmentDuration)||5000
              )
            )
          )
          :(
            mode==='count'
              ?(
                index<
                Math.max(
                  0,
                  Math.floor(Number(value)||0)
                )
                  ?1
                  :0
              )
              :(
                String(value)===String(segment.value||'')
                  ?1
                  :0
              )
          );

      if(fillRatio>0){
        ctx.globalAlpha=Math.max(
          0,
          Math.min(
            1,
            Number(activeAlpha)||.95
          )
        );
        ctx.fillStyle=String(
          (highlightColor&&(highlightFrom==='right'
            ?index>=Math.max(0,Math.floor(Number(value)||0))-Math.max(0,Math.floor(Number(highlightCount)||0))
            :index<Math.max(0,Math.floor(Number(highlightCount)||0)))
            ?highlightColor
            :(colorOverride||segment.color))||
          '#92cbd6'
        );
        ctx.fillRect(
          gx,
          Number(y),
          cellWidth*fillRatio,
          resolvedHeight
        );
        ctx.globalAlpha=1;
      }

      ctx.strokeStyle=String(stroke);
      ctx.lineWidth=.75;
      ctx.strokeRect(
        gx+.375,
        Number(y)+.375,
        Math.max(0,cellWidth-.75),
        Math.max(0,resolvedHeight-.75)
      );
    }

    ctx.restore();
    return true;
  }
});