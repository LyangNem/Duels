

/* 고주기 월드 렌더 helper는 draw() 내부에서 매 프레임 재생성하지 않고 단일 서비스로 재사용한다. */
const AreaCircleEffectPresentationService=Object.freeze({
  draw(ctx,f,now){
    if(!ctx||!f)return false;

    const progress=Math.max(
      0,
      Math.min(
        1,
        (
          now-
          Number(f.start)
        )/
        Math.max(
          1,
          Number(f.dur)||1
        )
      )
    );
    const alpha=1-progress;
    const points=
      Array.isArray(f.points)
        ?f.points
        :[];
    // sourceEntityId는 고정형 field에서도 색상/관계 판정의 소유자 진실값이다.
    // followSource는 중심 좌표를 소유자 위치에 추적할지 여부만 결정한다.
    const source=
      EntityService.items.get(
        String(f.sourceEntityId||'')
      )||null;
    const followSource=
      f.followSource===true&&source?.alive
        ?source
        :null;
    const cx=
      followSource
        ?Number(followSource.x)||0
        :Number(f.x)||0;
    const cy=
      followSource
        ?Number(followSource.y)||0
        :Number(f.y)||0;
    const fillAlpha=
      Number.isFinite(Number(f.fillAlpha))
        ?Math.max(
          0,
          Math.min(
        1,
        Number(f.fillAlpha)
          )
        )
        :AttackVisualStyle.fillAlpha;
    const strokeAlpha=
      Number.isFinite(Number(f.strokeAlpha))
        ?Math.max(
          0,
          Math.min(
        1,
        Number(f.strokeAlpha)
          )
        )
        :AttackVisualStyle.strokeAlpha;

    const viewer=Training.player;
    const viewerRelation=
      source&&viewer
        ?RelationService.relation(
          viewer,
          source
        )
        :'neutral';
    const isFriendly=
      viewerRelation==='self'||
      viewerRelation==='ally';
    const relationAlphaScale=
      viewerRelation==='ally'&&Number.isFinite(Number(f.allyAlphaScale))
        ?Math.max(0,Math.min(1,Number(f.allyAlphaScale)))
        :isFriendly
          ?1
          :Math.max(
            0,
            Math.min(
              1,
              Number.isFinite(
                Number(f.nonFriendlyAlphaScale)
              )
                ?Number(f.nonFriendlyAlphaScale)
                :1
            )
          );
    const visualAlpha=
      (f.fadeOut===false?1:alpha)*
      relationAlphaScale;
    const baseRgb=ColorService.rgbString(
      f.color,
      '238,0,255'
    );
    const strokeRgb=
      f.strokeColorMode==='source-team'&&
      source
        ?ColorService.rgbString(
          TeamColorPresentationService
            .colorForEntity(
              source,
              source.color||'#ee00ff'
            ),
          baseRgb
        )
        :ColorService.rgbString(
          f.strokeColor||f.color,
          baseRgb
        );
    const pulseValue=
      f.pulse===true
        ?.5+.5*Math.sin(
          now*Math.max(0,Number(f.pulseSpeed)||.006)
        )
        :0;
    const pulseStrokeMin=
      Math.max(
        0,
        Math.min(
          1,
          Number.isFinite(Number(f.pulseStrokeMin))
            ?Number(f.pulseStrokeMin)
            :strokeAlpha
        )
      );
    const pulseStrokeMax=
      Math.max(
        0,
        Math.min(
          1,
          Number.isFinite(Number(f.pulseStrokeMax))
            ?Number(f.pulseStrokeMax)
            :strokeAlpha
        )
      );
    const renderedStrokeAlpha=
      f.pulse===true
        ?pulseStrokeMin+(pulseStrokeMax-pulseStrokeMin)*pulseValue
        :strokeAlpha;

    if(now<Number(f.start||0))return false;

    if(f.travelToken===true){
      const target=EntityService.items.get(String(f.targetEntityId||''));
      const tx=target?.alive?Number(target.x)||cx:Number(f.tx)||cx;
      const ty=target?.alive?Number(target.y)||cy:Number(f.ty)||cy;
      const t=Math.max(0,Math.min(1,(now-Number(f.start||now))/Math.max(1,Number(f.dur)||333)));
      const x=cx+(tx-cx)*t;
      const y=cy+(ty-cy)*t-Math.sin(t*Math.PI)*60;
      const pulse=.7+.3*Math.sin(now*.02);

      const tokenRgb=
        ColorService.rgbString(
          f.color||
          source?.character?.color||
          source?.color,
          '195,201,222'
        );
      const tokenStrokeRgb=
        ColorService.rgbString(
          f.strokeColor||
          f.color||
          source?.character?.color||
          source?.color,
          tokenRgb
        );

      ctx.save();
      ctx.beginPath();
      ctx.arc(x,y,20,0,Math.PI*2);
      ctx.fillStyle=`rgba(${tokenRgb},${.18*pulse})`;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x,y,14,0,Math.PI*2);
      ctx.fillStyle=`rgba(${tokenRgb},.35)`;
      ctx.fill();
      ctx.strokeStyle=`rgba(${tokenStrokeRgb},${pulse})`;
      ctx.lineWidth=3.5;
      ctx.stroke();

      ctx.fillStyle=`rgba(${tokenStrokeRgb},.95)`;
      ctx.font='bold 20px serif';
      ctx.textAlign='center';
      ctx.textBaseline='middle';
      ctx.fillText('C',x,y);
      ctx.restore();
      return true;
    }

    if(f.forecastStrike===true){
      const radius=Math.max(1,Number(f.r)||Number(f.range)||60);
      const strikeProgress=Math.max(0,Math.min(1,(now-Number(f.start||now))/Math.max(1,Number(f.dur)||500)));
      ctx.save();
      if(f.showTokens!==false){
        const tokenRadius=radius*.07;
        const rotation=.4*Math.PI*strikeProgress;
        for(let index=0;index<4;index++){
          const angle=Math.PI/4+index*Math.PI*2/4+rotation;
          const distance=radius*(1-strikeProgress);
          const tx=cx+Math.cos(angle)*distance;
          const ty=cy+Math.sin(angle)*distance;
          ctx.beginPath();ctx.arc(tx,ty,tokenRadius*2.2,0,Math.PI*2);
          ctx.fillStyle='rgba(220,225,255,0.18)';ctx.fill();
          ctx.beginPath();ctx.arc(tx,ty,tokenRadius,0,Math.PI*2);
          ctx.fillStyle='rgba(195,201,222,0.5)';ctx.fill();
          ctx.strokeStyle='rgba(240,245,255,0.95)';ctx.lineWidth=2;ctx.stroke();
        }
      }
      if(f.showContractingCircle!==false){
        ctx.beginPath();ctx.arc(cx,cy,radius*(1-strikeProgress*.5),0,Math.PI*2);
        ctx.strokeStyle='rgba(195,201,222,0.35)';ctx.lineWidth=1.5;ctx.setLineDash([5,5]);ctx.stroke();ctx.setLineDash([]);
      }
      if(f.showCenterFlash!==false&&strikeProgress>.6){
        const fp=(strikeProgress-.6)/.4;
        const fr=radius*.4*fp;
        if(fr>0){
          const gradient=ctx.createRadialGradient(cx,cy,0,cx,cy,fr);
          gradient.addColorStop(0,`rgba(240,245,255,${fp*.8})`);
          gradient.addColorStop(1,'rgba(195,201,222,0)');
          ctx.beginPath();ctx.arc(cx,cy,fr,0,Math.PI*2);ctx.fillStyle=gradient;ctx.fill();
        }
      }
      if(strikeProgress>0){
        const start=-Math.PI/2,end=start+Math.PI*2*strikeProgress;
        ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,radius,start,end);ctx.closePath();
        ctx.fillStyle='rgba(220,225,255,0.18)';ctx.fill();
        ctx.beginPath();ctx.arc(cx,cy,radius,start,end);
        ctx.strokeStyle='rgba(220,225,255,0.8)';ctx.lineWidth=3.5;ctx.stroke();
      }
      ctx.restore();
      return true;
    }

    if(f.forecastFade===true){
      const radius=Math.max(1,Number(f.r)||Number(f.range)||60);
      const elapsed=Math.max(0,now-Number(f.start||now));
      const remain=Math.max(0,1-elapsed/Math.max(1,Number(f.dur)||500));
      const pulse=.5+.5*Math.sin(now*.01);
      ctx.save();
      ctx.beginPath();ctx.arc(cx,cy,radius,0,Math.PI*2);
      ctx.strokeStyle=`rgba(195,201,222,${remain*(.4+.2*pulse)})`;
      ctx.lineWidth=2.5;ctx.setLineDash([8,6]);ctx.stroke();ctx.setLineDash([]);
      if(f.drainGauge===true&&remain>0){
        const start=-Math.PI/2,end=start+Math.PI*2*remain;
        ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,radius,start,end);ctx.closePath();
        ctx.fillStyle=`rgba(220,225,255,${remain*.14})`;ctx.fill();
        ctx.beginPath();ctx.arc(cx,cy,radius,start,end);
        ctx.strokeStyle=`rgba(220,225,255,${remain*.75})`;ctx.lineWidth=3.5;ctx.stroke();
      }
      ctx.restore();
      return true;
    }

    if(f.forecastField&&typeof f.forecastField==='object'){
      const style=f.forecastField;
      const radius=Math.max(1,Number(f.r)||Number(f.range)||60);
      const elapsed=Math.max(0,now-Number(f.start||now));
      const armDelay=Math.max(0,Number(style.armDelay)||0);
      const readyDuration=Math.max(1,Number(style.readyDuration)||Math.max(1,Number(f.dur)||1)-armDelay);
      const armed=elapsed>=armDelay;
      const pulse=.5+.5*Math.sin(now*(Number(style.pulseSpeed)||.01));
      const warningFillPulse=Number(style.warningFillPulse)||0;
      const warningStrokePulse=Number(style.warningStrokePulse)||0;
      ctx.save();
      ctx.globalAlpha=relationAlphaScale;
      ctx.beginPath();ctx.arc(cx,cy,radius,0,Math.PI*2);
      ctx.fillStyle=`rgba(${baseRgb},${fillAlpha*(1+warningFillPulse*pulse)})`;ctx.fill();
      ctx.strokeStyle=`rgba(${strokeRgb},${strokeAlpha*(1+warningStrokePulse*pulse)})`;
      ctx.lineWidth=Math.max(.5,Number(f.lineWidth)||2.5);ctx.setLineDash(Array.isArray(f.dash)?f.dash:[8,5]);ctx.stroke();ctx.setLineDash([]);

      const overlayRgb=ColorService.rgbString(style.overlayColor,'195,201,222');
      const overlayAlpha=armed?(.6+.25*pulse):(.2+.1*pulse);
      ctx.beginPath();ctx.arc(cx,cy,radius,0,Math.PI*2);
      ctx.fillStyle=`rgba(${overlayRgb},${overlayAlpha*(Number(style.overlayFillAlpha)||.08)})`;ctx.fill();
      if(style.overlayStroke!==false){
        ctx.strokeStyle=`rgba(${overlayRgb},${overlayAlpha})`;ctx.lineWidth=Math.max(.5,Number(style.overlayLineWidth)||2.5);
        ctx.setLineDash(Array.isArray(style.overlayDash)?style.overlayDash:[8,6]);ctx.stroke();ctx.setLineDash([]);
      }

      if(!armed){
        const owner=EntityService.items.get(String(f.sourceEntityId||''));
        if(owner?.alive){
          const linkRgb=ColorService.rgbString(style.linkColor,overlayRgb);
          ctx.beginPath();ctx.moveTo(Number(owner.x)||0,Number(owner.y)||0);ctx.lineTo(cx,cy);
          ctx.strokeStyle=`rgba(${linkRgb},${Number(style.linkAlpha)||.35})`;ctx.lineWidth=Math.max(.5,Number(style.linkWidth)||1.5);
          ctx.setLineDash(Array.isArray(style.linkDash)?style.linkDash:[5,5]);ctx.stroke();ctx.setLineDash([]);
        }
        ctx.beginPath();ctx.arc(cx,cy,Math.max(1,Number(style.markerRadius)||10),0,Math.PI*2);
        ctx.strokeStyle=`rgba(${overlayRgb},${Number(style.markerAlpha)||.4})`;ctx.lineWidth=Math.max(.5,Number(style.markerWidth)||1.5);
        ctx.setLineDash(Array.isArray(style.markerDash)?style.markerDash:[3,4]);ctx.stroke();ctx.setLineDash([]);
        if(armDelay>0){
          const ratio=Math.max(0,Math.min(1,elapsed/armDelay));
          if(ratio>0){
            const start=-Math.PI/2,end=start+Math.PI*2*ratio;
            const gaugeRgb=ColorService.rgbString(style.armGaugeColor,'220,225,255');
            const gaugeStrokeRgb=
              style.armGaugeStrokeColorMode==='source-team'&&source
                ?ColorService.rgbString(
                  TeamColorPresentationService.colorForEntity(source,source.color||'#ee00ff'),
                  gaugeRgb
                )
                :ColorService.rgbString(style.armGaugeStrokeColor||style.armGaugeColor,gaugeRgb);
            ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,radius,start,end);ctx.closePath();
            ctx.fillStyle=`rgba(${gaugeRgb},${Number(style.armGaugeFillAlpha)||.22})`;ctx.fill();
            ctx.beginPath();ctx.arc(cx,cy,radius,start,end);
            ctx.strokeStyle=`rgba(${gaugeStrokeRgb},${Number(style.armGaugeStrokeAlpha)||.85})`;ctx.lineWidth=Math.max(.5,Number(style.armGaugeLineWidth)||3.5);ctx.stroke();
          }
        }
      }else{
        const readyElapsed=Math.max(0,elapsed-armDelay);
        const remaining=Math.max(0,Math.min(1,1-readyElapsed/readyDuration));
        if(remaining>0){
          const gaugeRgb=ColorService.rgbString(style.readyGaugeColor,'255,255,255');
          const gaugeStrokeRgb=
            style.readyGaugeStrokeColorMode==='source-team'&&source
              ?ColorService.rgbString(
                TeamColorPresentationService.colorForEntity(source,source.color||'#ee00ff'),
                gaugeRgb
              )
              :ColorService.rgbString(style.readyGaugeStrokeColor||style.readyGaugeColor,gaugeRgb);
          const gaugeRadius=radius+Math.max(0,Number(style.readyGaugeOffset)||6);
          const start=-Math.PI/2,end=start+Math.PI*2*remaining;
          ctx.beginPath();ctx.arc(cx,cy,gaugeRadius,start,end);
          ctx.strokeStyle=`rgba(${gaugeStrokeRgb},${Number(style.readyGaugeAlpha)||.8})`;ctx.lineWidth=Math.max(.5,Number(style.readyGaugeLineWidth)||3);ctx.stroke();
          const label=String(style.readyLabel||'');
          if(label){
            ctx.fillStyle=`rgba(${overlayRgb},${Number(style.readyLabelAlpha)||.85})`;
            ctx.font=String(style.readyLabelFont||'bold 11px Pretendard');ctx.textAlign='center';ctx.textBaseline='alphabetic';
            ctx.fillText(label,cx,cy-radius-Math.max(0,Number(style.readyLabelOffset)||8));
          }
        }
      }
      // 범위 자체의 윤곽은 보조 overlay/게이지와 독립된 최종 레이어로 마감한다.
      if(style.boundaryStrokeOnTop===true){
        ctx.beginPath();ctx.arc(cx,cy,radius,0,Math.PI*2);
        ctx.strokeStyle=`rgba(${strokeRgb},${strokeAlpha})`;
        ctx.lineWidth=Math.max(.5,Number(f.lineWidth)||2.5);
        ctx.setLineDash(Array.isArray(f.dash)?f.dash:[]);ctx.stroke();ctx.setLineDash([]);
      }
      ctx.restore();
      return true;
    }

    ctx.save();

    if(f.progressSweep===true){
      const radius=Math.max(0,Number(f.range)||Number(f.r)||0);
      const startAngle=-Math.PI/2;
      const direction=String(f.progressSweepDirection||'clockwise');
      const signedSweep=
        Math.PI*2*progress*(direction==='counterclockwise'?-1:1);
      const endAngle=startAngle+signedSweep;
      if(progress>0){
        const lineWidth=Math.max(.5,Number(f.lineWidth)||AttackVisualStyle.strokeWidth);
        ctx.fillStyle=`rgba(${baseRgb},${relationAlphaScale*fillAlpha})`;
        ctx.strokeStyle=`rgba(${strokeRgb},${relationAlphaScale*strokeAlpha})`;
        ctx.lineWidth=lineWidth;

        if(points.length>=3){
          const fullCircle=Math.abs(signedSweep)>=Math.PI*2-1e-4;
          const sweepModule=fullCircle
            ?{
              type:'delivery.area',
              shape:'circle',
              range:radius,
              wallPolicy:'block'
            }
            :{
              type:'delivery.area',
              shape:'sector',
              range:radius,
              halfAngle:Math.abs(signedSweep)/2,
              wallPolicy:'block'
            };
          const sweepCenterAngle=fullCircle
            ?0
            :startAngle+signedSweep/2;
          const geometry=AreaGeometryService.polygon(
            {x:cx,y:cy,radius:0},
            sweepModule,
            sweepCenterAngle,
            96
          );
          const currentPoints=geometry?.points||[];
          if(currentPoints.length>=3){
            ctx.beginPath();
            ctx.moveTo(currentPoints[0].x,currentPoints[0].y);
            for(let index=1;index<currentPoints.length;index++){
              ctx.lineTo(currentPoints[index].x,currentPoints[index].y);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
          }
        }else if(Math.abs(signedSweep)>=Math.PI*2-1e-4){
          ctx.beginPath();
          ctx.arc(cx,cy,radius,0,Math.PI*2);
          ctx.fill();
          ctx.stroke();
        }else{
          ctx.beginPath();
          ctx.moveTo(cx,cy);
          ctx.arc(
            cx,
            cy,
            radius,
            startAngle,
            endAngle,
            direction==='counterclockwise'
          );
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
      }
      ctx.restore();
      return true;
    }

    ctx.beginPath();

    if(points.length>=3){
      ctx.moveTo(
        points[0].x,
        points[0].y
      );
      for(
        let index=1;
        index<points.length;
        index++
      ){
        ctx.lineTo(
          points[index].x,
          points[index].y
        );
      }
      ctx.closePath();
    }else{
      ctx.arc(
        cx,
        cy,
        Math.max(
          0,
          Number(f.range)||
          Number(f.r)||
          0
        ),
        0,
        Math.PI*2
      );
    }

    const hollowRatio=
      Number.isFinite(Number(f.hollowInnerRatio))
        ?Math.max(
          0,
          Math.min(
        .98,
        Number(f.hollowInnerRatio)
          )
        )
        :0;

    if(
      hollowRatio>0&&
      points.length<3
    ){
      const outerRadius=
        Math.max(
          0,
          Number(f.range)||
          Number(f.r)||
          0
        );
      const innerRadius=
        outerRadius*hollowRatio;

      ctx.beginPath();
      ctx.arc(
        cx,
        cy,
        outerRadius,
        0,
        Math.PI*2
      );
      ctx.moveTo(
        cx+innerRadius,
        cy
      );
      ctx.arc(
        cx,
        cy,
        innerRadius,
        0,
        Math.PI*2,
        true
      );
      ctx.fillStyle=
        `rgba(${baseRgb},${visualAlpha*fillAlpha})`;
      ctx.fill('evenodd');

      /*
        outer arc 끝점에서 inner arc 시작점으로 자동 연결되는 방사선이
        오른쪽 가이드와 겹치지 않도록 두 원의 stroke도 별도 subpath로 그린다.
      */
      ctx.strokeStyle=
        `rgba(${strokeRgb},${visualAlpha*renderedStrokeAlpha})`;
      ctx.lineWidth=
        Math.max(
          .5,
          Number(f.lineWidth)||
          AttackVisualStyle.strokeWidth
        );
      ctx.setLineDash(
        Array.isArray(f.dash)
          ?f.dash
          :[]
      );

      ctx.beginPath();
      ctx.arc(
        cx,
        cy,
        outerRadius,
        0,
        Math.PI*2
      );
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(
        cx,
        cy,
        innerRadius,
        0,
        Math.PI*2
      );
      ctx.stroke();
      ctx.setLineDash([]);
    }else{
      ctx.fillStyle=
        `rgba(${baseRgb},${visualAlpha*fillAlpha})`;
      ctx.fill();

      ctx.strokeStyle=
        `rgba(${strokeRgb},${visualAlpha*renderedStrokeAlpha})`;
      ctx.lineWidth=
        Math.max(
          .5,
          Number(f.lineWidth)||
          AttackVisualStyle.strokeWidth
        );
      ctx.setLineDash(
        Array.isArray(f.dash)
          ?f.dash
          :[]
      );
      ctx.stroke();
      ctx.setLineDash([]);
    }

    if(
      Number(f.innerRingScale)>0
    ){
      const scale=Math.max(0,Math.min(1,Number(f.innerRingScale)||0));
      const radius=Math.max(0,Number(f.range)||Number(f.r)||0)*scale;
      if(radius>0){
        const innerRgb=ColorService.rgbString(f.innerRingStrokeColor||strokeRgb,strokeRgb);
        const innerAlpha=Number.isFinite(Number(f.innerRingStrokeAlpha))
          ?Math.max(0,Math.min(1,Number(f.innerRingStrokeAlpha)))
          :.35;
        ctx.beginPath();
        ctx.arc(cx,cy,radius,0,Math.PI*2);
        ctx.strokeStyle=`rgba(${innerRgb},${visualAlpha*innerAlpha})`;
        ctx.lineWidth=Math.max(.5,Number(f.innerRingLineWidth)||1.5);
        ctx.stroke();
      }
    }

    if(
      f.remainingArcGauge===true
    ){
      const baseRadius=Math.max(0,Number(f.range)||Number(f.r)||0);
      const radius=baseRadius+Math.max(0,Number(f.remainingArcOffset)||0);
      const remaining=Math.max(0,Math.min(1,1-progress));
      if(radius>0&&remaining>0){
        const arcRgb=ColorService.rgbString(
          f.remainingArcColor||f.strokeColor||f.color,
          strokeRgb
        );
        const arcAlpha=Number.isFinite(Number(f.remainingArcAlpha))
          ?Math.max(0,Math.min(1,Number(f.remainingArcAlpha)))
          :.9;
        const startAngle=-Math.PI/2;
        const endAngle=startAngle+Math.PI*2*remaining;
        ctx.beginPath();
        ctx.arc(cx,cy,radius,startAngle,endAngle);
        ctx.strokeStyle=`rgba(${arcRgb},${relationAlphaScale*arcAlpha})`;
        ctx.lineWidth=Math.max(.5,Number(f.remainingArcLineWidth)||3.5);
        ctx.setLineDash([]);
        ctx.stroke();
      }
    }

    if(
      Number(f.radialTeeth)>0&&
      points.length<3
    ){
      const outerRadius=Math.max(0,Number(f.range)||Number(f.r)||0);
      const teeth=Math.max(3,Math.floor(Number(f.radialTeeth)||0));
      const innerRatio=Math.max(0,Math.min(.95,Number(f.radialToothInnerRatio)||.42));
      const outerRatio=Math.max(innerRatio,Math.min(1,Number(f.radialToothOuterRatio)||.72));
      const innerRadius=outerRadius*innerRatio;
      const outerToothRadius=outerRadius*outerRatio;
      ctx.save();
      ctx.fillStyle=`rgba(${strokeRgb},${visualAlpha*strokeAlpha*.72})`;
      for(let index=0;index<teeth;index++){
        const angle=-Math.PI/2+(Math.PI*2*index/teeth);
        const half=Math.PI/teeth*.34;
        ctx.beginPath();
        ctx.moveTo(cx+Math.cos(angle-half)*outerToothRadius,cy+Math.sin(angle-half)*outerToothRadius);
        ctx.lineTo(cx+Math.cos(angle)*innerRadius,cy+Math.sin(angle)*innerRadius);
        ctx.lineTo(cx+Math.cos(angle+half)*outerToothRadius,cy+Math.sin(angle+half)*outerToothRadius);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }

    if(
      f.cardinalGuides===true&&
      points.length<3
    ){
      const outerRadius=
        Math.max(
          0,
          Number(f.range)||
          Number(f.r)||
          0
        );
      const innerRatio=
        Math.max(
          0,
          Math.min(
            .98,
            Number(f.cardinalGuideInnerRatio)||0
          )
        );
      const outerRatio=
        Math.max(
          innerRatio,
          Math.min(
            1,
            Number(f.cardinalGuideOuterRatio)||1
          )
        );
      const innerRadius=
        outerRadius*innerRatio;
      const guideRadius=
        outerRadius*outerRatio;
      const guideAlpha=
        Math.max(
          0,
          Math.min(
            1,
            Number(f.cardinalGuideAlpha)||.34
          )
        );

      ctx.save();
      ctx.strokeStyle=
        `rgba(${f.color},${visualAlpha*guideAlpha})`;
      ctx.lineWidth=Math.max(
        .5,
        Number(f.cardinalGuideWidth)||1
      );
      ctx.lineCap='round';

      const guideCenterX=
        Math.round(cx)+.5;
      const guideCenterY=
        Math.round(cy)+.5;

      for(let index=0;index<4;index++){
        const angle=
          index*Math.PI/2;
        const dx=Math.cos(angle);
        const dy=Math.sin(angle);

        ctx.beginPath();
        ctx.moveTo(
          guideCenterX+
            dx*
            innerRadius,
          guideCenterY+
            dy*
            innerRadius
        );
        ctx.lineTo(
          guideCenterX+
            dx*
            guideRadius,
          guideCenterY+
            dy*
            guideRadius
        );
        ctx.stroke();
      }

      ctx.restore();
    }

    const centerLabel=String(f.centerLabel||'');
    if(centerLabel){
      const centerLabelRgb=ColorService.rgbString(
        f.centerLabelColor||f.color,
        baseRgb
      );
      const centerLabelAlpha=
        Math.max(
          0,
          Math.min(
            1,
            Number.isFinite(Number(f.centerLabelAlpha))
              ?Number(f.centerLabelAlpha)
              :.8
          )
        );
      ctx.fillStyle=`rgba(${centerLabelRgb},${visualAlpha*centerLabelAlpha})`;
      ctx.font=String(f.centerLabelFont||'bold 12px Pretendard');
      ctx.textAlign='center';
      ctx.textBaseline='alphabetic';
      ctx.fillText(
        centerLabel,
        cx,
        cy+(Number(f.centerLabelOffsetY)||0)
      );
    }

    if(
      source?.alive&&
      f.timerGroup
    ){
      const remaining=
        TimedThresholdBuffService.remaining(
          source,
          String(f.timerGroup||''),
          now
        );
      const maximum=Math.max(
        1,
        Number(f.timerMaxMs)||1
      );
      const ratio=Math.max(
        0,
        Math.min(
          1,
          remaining/maximum
        )
      );
      const sweepRadius=
        Math.max(
          6,
          (
        Math.max(
          0,
          Number(f.range)||
          Number(f.r)||
          0
        )
          )*
          Math.max(
        .1,
        Math.min(
          .98,
          Number(f.timerRingRadiusRatio)||.84
        )
          )
        );
      const startAngle=-Math.PI/2;
      const sweepAngle=
        Math.PI*2*ratio;
      const endAngle=
        startAngle-
        sweepAngle;

      /*
        기존 arcSweep 공격 이펙트와 같은 "중심→호→중심" 채움 방식을 재사용한다.
        별도 이펙트 타입이나 점/링 디자인을 만들지 않는다.
        남은 시간만큼 채워진 부채꼴이 유지되고, 시간 감소에 따라
        경계가 반시계방향으로 이동하며 채워진 영역이 비워진다.
      */
      if(ratio>0){
        ctx.beginPath();
        ctx.moveTo(
          cx,
          cy
        );
        ctx.arc(
          cx,
          cy,
          sweepRadius,
          startAngle,
          endAngle,
          true
        );
        ctx.closePath();
        const timerFillAlpha=
          Math.max(
            0,
            Math.min(
              1,
              Number.isFinite(Number(f.timerFillAlpha))
                ?Number(f.timerFillAlpha)
                :.14
            )
          );
        const timerStrokeAlpha=
          Math.max(
            0,
            Math.min(
              1,
              Number.isFinite(Number(f.timerStrokeAlpha))
                ?Number(f.timerStrokeAlpha)
                :.72
            )
          );

        ctx.fillStyle=
          `rgba(${f.color},${visualAlpha*timerFillAlpha})`;
        ctx.fill();

        /*
          타이머 채움의 방사 경계선은 상하좌우 가이드와 겹칠 수 있으므로
          stroke하지 않고 외곽 호만 별도로 그린다.
        */
        ctx.beginPath();
        ctx.arc(
          cx,
          cy,
          sweepRadius,
          startAngle,
          endAngle,
          true
        );
        ctx.strokeStyle=
          `rgba(${f.color},${visualAlpha*timerStrokeAlpha})`;
        ctx.lineWidth=
          Math.max(
        .5,
        Number(f.timerRingLineWidth)||1.5
          );
        ctx.stroke();
      }
    }

    ctx.restore();
    return true;
  }
});