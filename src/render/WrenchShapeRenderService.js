

const WrenchShapeRenderService=Object.freeze({
  draw(ctx,options={}){
    if(!ctx)return false;
    const radius=Math.max(4,Number(options.radius)||24);
    const angle=Number.isFinite(Number(options.angle))?Number(options.angle):0;
    const alpha=Math.max(0,Math.min(1,Number(options.alpha)??1));
    const bodyRgb=ColorService.rgbString(
      options.fillColor,
      options.bodyRgb||options.color||'159,207,85'
    );
    const strokeRgb=ColorService.rgbString(
      options.strokeColor,
      '235,255,205'
    );
    const length=radius*2.2;
    const jawRadius=radius*.52;
    const handleWidth=Math.max(4,radius*.32);
    const rearRadius=Math.max(3,radius*.24);
    const strokeWidth=Math.max(1,Number(options.strokeWidth)||2.5);
    const glow=Math.max(0,Number(options.glow)||0);
    const x=Number(options.x)||0;
    const y=Number(options.y)||0;

    ctx.save();
    ctx.translate(x,y);
    ctx.rotate(angle);
    ctx.globalAlpha*=alpha;
    if(glow>0){
      ctx.shadowColor=`rgba(${bodyRgb},.7)`;
      ctx.shadowBlur=glow;
    }
    ctx.lineCap='round';
    ctx.lineJoin='round';

    ctx.beginPath();
    ctx.moveTo(-length*.43,0);
    ctx.lineTo(length*.27,0);
    ctx.strokeStyle=`rgba(${bodyRgb},.92)`;
    ctx.lineWidth=handleWidth;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(-length*.43,0,rearRadius,0,Math.PI*2);
    ctx.fillStyle=`rgba(${bodyRgb},.92)`;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-length*.43,0,rearRadius*.45,0,Math.PI*2);
    ctx.fillStyle='rgba(12,16,14,.78)';
    ctx.fill();

    const headX=length*.33;
    ctx.strokeStyle=`rgba(${bodyRgb},.96)`;
    ctx.lineWidth=Math.max(handleWidth*1.18,jawRadius*.46);
    ctx.beginPath();
    ctx.arc(headX,0,jawRadius,Math.PI*.30,Math.PI*.78);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(headX,0,jawRadius,-Math.PI*.78,-Math.PI*.30);
    ctx.stroke();

    ctx.shadowBlur=0;
    ctx.strokeStyle=`rgba(${strokeRgb},.92)`;
    ctx.lineWidth=strokeWidth;
    const highlightStart=-length*.395;
    const highlightEnd=length*.205;
    // 밝은 선 전체가 손잡이 외곽 안쪽에 정확히 걸치도록 실제 선폭으로 계산한다.
    const highlightInset=
      Math.max(.35,strokeWidth*.12);
    const highlightOffset=
      Math.max(
        0,
        (handleWidth-strokeWidth)*.5-highlightInset
      );
    ctx.beginPath();
    ctx.moveTo(highlightStart,-highlightOffset);
    ctx.lineTo(highlightEnd,-highlightOffset);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(highlightStart,highlightOffset);
    ctx.lineTo(highlightEnd,highlightOffset);
    ctx.stroke();

    ctx.restore();
    return true;
  }
});