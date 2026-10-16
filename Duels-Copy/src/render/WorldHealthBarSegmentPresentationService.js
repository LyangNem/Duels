

const WorldHealthBarSegmentPresentationService=Object.freeze({
  step:300,
  drawValue(ctx,maxValue,bx,by,bw,bh){
    if(
      !DisplaySettings.state.healthBarSegments||
      !ctx
    )return false;
    const maximum=Math.max(0,Number(maxValue)||0);
    const step=Math.max(1,Number(this.step)||300);
    if(maximum<=step)return false;

    ctx.save();
    for(let value=step;value<maximum;value+=step){
      const x=bx+bw*(value/maximum);

      // 체력과 보조 내구도 모두 같은 300 단위 눈금을 사용한다.
      ctx.beginPath();
      ctx.moveTo(x,by+.35);
      ctx.lineTo(x,by+bh-.35);
      ctx.strokeStyle='rgba(0,0,0,.76)';
      ctx.lineWidth=1.8;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x+.45,by+.7);
      ctx.lineTo(x+.45,by+bh-.7);
      ctx.strokeStyle='rgba(255,255,255,.30)';
      ctx.lineWidth=.65;
      ctx.stroke();
    }
    ctx.restore();
    return true;
  },
  draw(ctx,entity,bx,by,bw,bh){
    if(!entity)return false;
    return this.drawValue(
      ctx,
      entity.maxHealth,
      bx,by,bw,bh
    );
  }
});