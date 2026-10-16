


const ArcGaugePresentationService=Object.freeze({
  chargeAimLines:new WeakMap(),
  aimLineSnapshot(entity,attack,angle,now,point=entity,radius=entity.radius){
    const config=attack?.charge?.aimLine;if(!config)return null;
    const x=Number(point.x)||0,y=Number(point.y)||0;
    const requested=Math.max(0,Number(attack.range)||0);
    const range=Number.isFinite(requested)?requested:WorldGeometryService.boundaryRayDistance(x,y,angle,Infinity,0);
    if(!Number.isFinite(range)||range<=0)return null;
    return {attackId:attack.id,x,y,radius:Math.max(0,Number(radius)||0),range,angle,
      color:config.teamColor===true?TeamColorPresentationService.colorForEntity(entity,entity.color):config.color||entity.color,
      alpha:Math.max(0,Math.min(1,Number(config.alpha)||.65)),width:Math.max(.5,Number(config.lineWidth)||1.5),
      fadeDuration:Math.max(0,Number(config.fadeDuration)||0),hideDuringStealth:config.hideDuringStealth===true,lastActiveAt:now};
  },
  captureChargeShot(event){
    const entity=event?.source,attack=event?.attack,projectile=event?.projectile;
    if(!entity?.alive||!projectile||!attack?.charge?.aimLine)return false;
    const now=Number(event.now)||performance.now();
    const stealth=typeof StealthPresentationService!=='undefined'&&StealthPresentationService.active(entity,now);
    if(entity.hidden||stealth&&attack.charge.aimLine.hideDuringStealth===true){this.chargeAimLines.delete(entity);return false;}
    const snapshot=this.aimLineSnapshot(entity,attack,Number(projectile.launchAngle??projectile.angle)||0,now,projectile,0);
    if(!snapshot)return false;
    let lines=this.chargeAimLines.get(entity);if(!lines){lines=new Map();this.chargeAimLines.set(entity,lines);}
    let key='shot:'+attack.id;
    for(const [storedKey,line] of lines)if(line.attackId===attack.id){key=storedKey;lines.delete(storedKey);}
    lines.set(key,snapshot);return true;
  },
  drawChargeAimLine(ctx,entity,now=performance.now()){
    if(!ctx||!entity)return false;
    if(!entity.alive||entity.hidden||!entity.actionState){
      this.chargeAimLines.delete(entity);return false;
    }
    let lines=this.chargeAimLines.get(entity);
    if(!lines){lines=new Map();this.chargeAimLines.set(entity,lines);}
    const stealth=typeof StealthPresentationService!=='undefined'&&StealthPresentationService.active(entity,now);
    const active=new Set();
    for(const [key,state] of entity.actionState){
      if(state?.kind!==ChargedAttackService.KIND)continue;
      const attack=ChargedAttackService.attack(entity,state);
      const line=attack?.charge?.aimLine;
      if(!line)continue;
      if(stealth&&line.hideDuringStealth===true){lines.delete(key);continue;}
      const local=entity===Training.player;
      const angle=local&&typeof Training.aimAngle==='function'
        ?Number(Training.aimAngle())||0
        :Number.isFinite(Number(entity._remoteAimAngle))
          ?Number(entity._remoteAimAngle):Number(state.angle)||0;
      const snapshot=this.aimLineSnapshot(entity,attack,angle,now);
      if(!snapshot)continue;
      active.add(key);
      lines.delete('shot:'+attack.id);
      lines.set(key,snapshot);
    }
    let drawn=false;
    for(const [key,line] of lines){
      if(stealth&&line.hideDuringStealth){lines.delete(key);continue;}
      let fade=1;
      if(!active.has(key)){
        fade=line.fadeDuration>0?Math.max(0,1-(now-line.lastActiveAt)/line.fadeDuration):0;
        if(fade<=0){lines.delete(key);continue;}
      }
      ctx.save();ctx.beginPath();
      ctx.moveTo(line.x+Math.cos(line.angle)*line.radius,line.y+Math.sin(line.angle)*line.radius);
      ctx.lineTo(line.x+Math.cos(line.angle)*line.range,line.y+Math.sin(line.angle)*line.range);
      ctx.strokeStyle=`rgba(${ColorService.rgbString(line.color)},${line.alpha*fade})`;
      ctx.lineWidth=line.width;ctx.setLineDash([]);ctx.stroke();ctx.restore();drawn=true;
    }
    if(lines.size===0)this.chargeAimLines.delete(entity);
    return drawn;
  },
  render(ctx,target,progress,options={}){
    if(!ctx||!target)return false;

    if(
      options.visibility!=='all'&&
      Training.sessionMode==='online'&&
      !EntitySimulationAuthorityService
        .isLocal(target)
    ){
      return false;
    }

    const ratio=Math.max(0,Math.min(1,Number(progress)||0));
    if(ratio<=0&&!options.showEmpty)return false;

    const radius=Math.max(
      1,
      Number(options.radius)||
        (Number(target.radius)||20)+8
    );
    const start=Number.isFinite(Number(options.startAngle))
      ?Number(options.startAngle)
      :-Math.PI/2;
    const span=Number.isFinite(Number(options.span))
      ?Number(options.span)
      :Math.PI*2;

    const baseColor=String(
      options.color||
      target.color||
      'rgba(255,255,255,0.90)'
    );
    const completeAccentEnabled=
      ratio>=1&&
      options.completeAccent===true;
    const baseRgb=
      ColorService.rgbString(
        baseColor,
        ColorService.rgbString(
          target.color,
          '255,255,255'
        )
      );
    const completeAccentColor=
      completeAccentEnabled
        ?String(
          options.completeColor||
          target.character?.accentColor||
          ColorService.brighten(
            baseRgb,
            .35
          )
        )
        :baseColor;

    ctx.save();
    ctx.lineWidth=Number(options.lineWidth)||3;
    ctx.lineCap=String(options.lineCap||'butt');
    if(
      Number(options.shadowBlur)>0
    ){
      ctx.shadowColor=String(
        options.shadowColor||
        options.color||
        target.color||
        '#ffffff'
      );
      ctx.shadowBlur=
        Math.max(
          0,
          Number(options.shadowBlur)||0
        );
    }
    if(
      !(
        ratio>=1&&
        options.hideArcAtComplete===true
      )
    ){
      ctx.beginPath();
      ctx.arc(
        Number(target.x)||0,
        Number(target.y)||0,
        radius,
        start,
        start+span*ratio
      );
      ctx.strokeStyle=
        completeAccentEnabled
          ?completeAccentColor
          :baseColor;
      ctx.stroke();
    }

    if(
      (ratio>=1||options.flashWhilePartial===true)&&
      options.maxChargeFlash===true
    ){
      const pulse=
        .5+
        .5*
        Math.sin(
          performance.now()*
          .025
        );
      const rgb=ColorService.rgbString(
        completeAccentEnabled
          ?completeAccentColor
          :(
            options.completePulseColor||
            baseColor
          ),
        '255,255,255'
      );

      ctx.beginPath();
      ctx.arc(
        Number(target.x)||0,
        Number(target.y)||0,
        Number(options.completePulseRadius)||
          Number(options.radius)||
          (Number(target.radius)||20)+8,
        0,
        Math.PI*2
      );
      ctx.strokeStyle=
        `rgba(${rgb},${Math.max(
          0,
          Math.min(
            1,
            pulse*
            Math.max(
              0,
              Number(options.completePulseAlphaScale)||.8
            )
          )
        )})`;
      ctx.lineWidth=
        Math.max(
          .1,
          Number(options.completePulseLineWidth)||
          EntityRingLayoutService.WIDTHS.flash
        );
      ctx.setLineDash(
        Array.isArray(options.completePulseDash)
          ?options.completePulseDash
          :[4,3]
      );
      ctx.stroke();
      ctx.setLineDash([]);
    }

    if(options.outlineRing===true&&ratio>0&&ratio<1&&options.flashWhilePartial!==true){
      const width=Math.max(.1,Number(options.completePulseLineWidth)||EntityRingLayoutService.WIDTHS.flash);
      const outer=Number(options.completePulseRadius)||EntityRingLayoutService.nextRadius(radius,Number(options.lineWidth)||3,width);
      ctx.beginPath();ctx.arc(Number(target.x)||0,Number(target.y)||0,outer,0,Math.PI*2);
      ctx.lineWidth=width;ctx.strokeStyle=`rgba(${baseRgb},0.5)`;
      ctx.setLineDash(Array.isArray(options.completePulseDash)?options.completePulseDash:[4,3]);
      ctx.stroke();ctx.setLineDash([]);
    }
    ctx.restore();
    return true;
  }
});