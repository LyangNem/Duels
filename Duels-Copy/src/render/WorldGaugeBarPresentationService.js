

/* 월드 개체 하단의 짧은 게이지 바를 공통 규격으로 그린다. */
const WorldGaugeBarPresentationService=Object.freeze({
  width:48,
  height:4,
  gap:5,
  render(ctx,{x,y,progress,color,background='#111',width=this.width,height=this.height}={}){
    if(!ctx)return false;
    const ratio=Math.max(0,Math.min(1,Number(progress)||0));
    const w=Math.max(1,Number(width)||this.width);
    const h=Math.max(1,Number(height)||this.height);
    ctx.fillStyle=background;
    ctx.fillRect(Number(x)||0,Number(y)||0,w,h);
    ctx.fillStyle=String(color||'#4af');
    ctx.fillRect(Number(x)||0,Number(y)||0,w*ratio,h);
    return true;
  }
});