

/* 화면 피드백 */
const CombatScreenFeedback=Object.freeze({
  hitDuration:1500,
  immediateDuration:120,
  draw(ctx,width,height,player,now){
    if(!player?.alive)return;

    const hitAge=now-(player.lastHitTime||0);
    const immediate=Training.screenHitFlashUntil>now;
    const hitAlpha=immediate
      ?.55
      :hitAge>=0&&hitAge<this.hitDuration
        ?.35*(1-hitAge/this.hitDuration)
        :0;

    const counterReady=(player.counterReadyUntil||0)>now;
    const counterAlpha=counterReady
      ?.28+.18*Math.sin(now*.007)
      :0;

    if(hitAlpha<=0&&counterAlpha<=0)return;

    let r=0,g=0,b=0,alpha=0;

    if(hitAlpha>0&&counterAlpha>0){
      r=255;
      g=Math.round(120*counterAlpha/(hitAlpha+counterAlpha));
      b=0;
      alpha=Math.max(hitAlpha,counterAlpha);
    }else if(hitAlpha>0){
      r=220;
      alpha=hitAlpha;
    }else{
      r=255;
      g=200;
      alpha=counterAlpha;
    }

    ctx.save();
    ctx.setTransform(1,0,0,1,0,0);

    const gradient=ctx.createRadialGradient(
      width/2,height/2,height*.28,
      width/2,height/2,height*.85
    );
    gradient.addColorStop(0,`rgba(${r},${g},${b},0)`);
    gradient.addColorStop(1,`rgba(${r},${g},${b},${alpha})`);

    ctx.fillStyle=gradient;
    ctx.fillRect(0,0,width,height);
    ctx.restore();
  }
});