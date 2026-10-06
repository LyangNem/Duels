


const EnvelopeIconPresentationService=Object.freeze({
  draw(
    ctx,
    x,
    y,
    {
      width=14,
      height=10,
      color='#d7ded4',
      lineWidth=1.5,
      rotation=0,
      alpha=1
    }={}
  ){
    if(!ctx)return false;

    const w=Math.max(4,Number(width)||14);
    const h=Math.max(3,Number(height)||10);

    ctx.save();
    ctx.translate(Number(x)||0,Number(y)||0);
    ctx.rotate(Number(rotation)||0);
    ctx.globalAlpha*=
      Math.max(0,Math.min(1,Number(alpha)||0));
    ctx.strokeStyle=String(color||'#d7ded4');
    ctx.lineWidth=Math.max(.5,Number(lineWidth)||1.5);
    ctx.lineJoin='round';
    ctx.lineCap='round';

    ctx.strokeRect(-w/2,-h/2,w,h);

    ctx.beginPath();
    ctx.moveTo(-w/2,-h/2);
    ctx.lineTo(0,0);
    ctx.lineTo(w/2,-h/2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-w/2,h/2);
    ctx.lineTo(-w*.08,0);
    ctx.moveTo(w/2,h/2);
    ctx.lineTo(w*.08,0);
    ctx.stroke();

    ctx.restore();
    return true;
  }
});