


const ArcGaugePresentationService=Object.freeze({
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
      ratio>=1&&
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

    ctx.restore();
    return true;
  }
});