

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

    // 양쪽 열린 턱과 각진 어깨를 가진 오프셋 스패너.
    ctx.beginPath();
    ctx.moveTo(-radius*1.12,-radius*.43);
    ctx.lineTo(-radius*.76,-radius*.43);ctx.lineTo(-radius*.57,-radius*.22);
    ctx.lineTo(radius*.57,-radius*.22);ctx.lineTo(radius*.76,-radius*.43);
    ctx.lineTo(radius*1.12,-radius*.43);ctx.lineTo(radius*1.23,-radius*.22);
    ctx.lineTo(radius*.86,-radius*.22);ctx.lineTo(radius*.74,0);
    ctx.lineTo(radius*.86,radius*.22);ctx.lineTo(radius*1.23,radius*.22);
    ctx.lineTo(radius*1.12,radius*.43);ctx.lineTo(radius*.76,radius*.43);
    ctx.lineTo(radius*.57,radius*.22);ctx.lineTo(-radius*.57,radius*.22);
    ctx.lineTo(-radius*.76,radius*.43);ctx.lineTo(-radius*1.12,radius*.43);
    ctx.lineTo(-radius*1.23,radius*.22);ctx.lineTo(-radius*.86,radius*.22);
    ctx.lineTo(-radius*.74,0);ctx.lineTo(-radius*.86,-radius*.22);
    ctx.lineTo(-radius*1.23,-radius*.22);ctx.closePath();
    ctx.fillStyle=`rgba(${bodyRgb},.96)`;ctx.fill();ctx.shadowBlur=0;
    ctx.strokeStyle=`rgba(${strokeRgb},.95)`;ctx.lineWidth=strokeWidth;ctx.stroke();
    ctx.beginPath();ctx.moveTo(-radius*.5,-radius*.08);
    ctx.lineTo(radius*.5,-radius*.08);ctx.lineTo(radius*.5,radius*.08);
    ctx.lineTo(-radius*.5,radius*.08);ctx.closePath();
    ctx.fillStyle='rgba(12,16,14,.55)';ctx.fill();
    ctx.strokeStyle=`rgba(${strokeRgb},.55)`;ctx.lineWidth=Math.max(.7,strokeWidth*.45);ctx.stroke();
    ctx.beginPath();ctx.moveTo(-radius*.45,-radius*.14);ctx.lineTo(radius*.45,-radius*.14);
    ctx.strokeStyle=`rgba(${strokeRgb},.85)`;ctx.lineWidth=Math.max(.8,strokeWidth*.55);ctx.stroke();

    ctx.restore();
    return true;
  }
});