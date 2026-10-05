

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

    // 하나로 이어진 열린 육각 턱·두꺼운 목·납작한 손잡이 실루엣.
    ctx.beginPath();
    ctx.moveTo(-radius*.93,-radius*.19);
    ctx.lineTo(radius*.34,-radius*.19);
    ctx.lineTo(radius*.5,-radius*.44);
    ctx.lineTo(radius*.84,-radius*.59);
    ctx.lineTo(radius*1.14,-radius*.4);
    ctx.lineTo(radius*.84,-radius*.3);
    ctx.lineTo(radius*.7,-radius*.14);
    ctx.lineTo(radius*.7,radius*.14);
    ctx.lineTo(radius*.84,radius*.3);
    ctx.lineTo(radius*1.14,radius*.4);
    ctx.lineTo(radius*.84,radius*.59);
    ctx.lineTo(radius*.5,radius*.44);
    ctx.lineTo(radius*.34,radius*.19);
    ctx.lineTo(-radius*.93,radius*.19);
    ctx.arc(-radius*.93,0,radius*.19,Math.PI/2,Math.PI*1.5);
    ctx.closePath();
    ctx.fillStyle=`rgba(${bodyRgb},.96)`;ctx.fill();
    ctx.shadowBlur=0;
    ctx.strokeStyle=`rgba(${strokeRgb},.9)`;ctx.lineWidth=strokeWidth;ctx.stroke();
    // 볼트용 끝 구멍과 손잡이의 홈은 모든 크기에서 같은 비율을 사용한다.
    ctx.beginPath();ctx.arc(-radius*.91,0,radius*.085,0,Math.PI*2);
    ctx.fillStyle='rgba(12,16,14,.9)';ctx.fill();
    ctx.strokeStyle=`rgba(${strokeRgb},.55)`;ctx.lineWidth=Math.max(.6,strokeWidth*.5);ctx.stroke();
    ctx.beginPath();ctx.moveTo(-radius*.64,0);ctx.lineTo(radius*.22,0);
    ctx.strokeStyle='rgba(12,16,14,.65)';ctx.lineWidth=radius*.09;ctx.stroke();
    ctx.beginPath();ctx.moveTo(-radius*.58,-radius*.1);ctx.lineTo(radius*.17,-radius*.1);
    ctx.strokeStyle=`rgba(${strokeRgb},.45)`;ctx.lineWidth=Math.max(.6,strokeWidth*.6);ctx.stroke();

    ctx.restore();
    return true;
  }
});