const AnnularSweepPresentationService=Object.freeze({
  draw(ctx,f,now,{sweepProgress=null}={}){
    if(!ctx||!f)return false;
    const progress=Math.max(0,Math.min(1,(now-Number(f.start))/Math.max(1,Number(f.dur)||1)));
        ctx.save();

        const hasAnnularClip=
          Array.isArray(f.points)&&
          f.points.length>=3;
        const applyAnnularClip=()=>{
          if(!hasAnnularClip)return;
          ctx.beginPath();
          ctx.moveTo(
            Number(f.points[0]?.x)||0,
            Number(f.points[0]?.y)||0
          );
          for(
            let pointIndex=1;
            pointIndex<f.points.length;
            pointIndex++
          ){
            ctx.lineTo(
              Number(f.points[pointIndex]?.x)||0,
              Number(f.points[pointIndex]?.y)||0
            );
          }
          ctx.closePath();
          ctx.clip();
        };
        applyAnnularClip();

        // 기존 듀얼즈 shape.annularDoubleSweep와 동일한 시각 수식.
        // Duels 3에서는 f.dur가 총 지속시간(ms)이므로 공통 progress를 사용한다.
        const legacyAlpha=1-progress;
        const sweepFraction=
          Math.max(
            .001,
            Math.min(
              .999,
              Number(f.sweepFraction)||.55
            )
          );
        const sweep=sweepProgress!==null?Math.max(0,Math.min(1,Number(sweepProgress)||0)):
          Math.min(
            1,
            progress/sweepFraction
          );
        const fade=
          progress>sweepFraction
            ?Math.pow(
              1-
              (
                progress-sweepFraction
              )/
              (
                1-sweepFraction
              ),
              Number(f.fadePower)||1.5
            )
            :1;

        // 회전 공격은 진행 중 기본 공격과 같은 선명도를 유지하고,
        // sweep 완료 뒤에만 fade 곡선으로 사라진다. 수명 alpha와 fade를
        // 중복 곱해 공격 중간부터 과도하게 흐려지는 현상을 만들지 않는다.
        const visualAlpha=sweepProgress!==null?1:
          (f.lifetimeAlpha===true?legacyAlpha:1)*
          (progress>sweepFraction?fade:1);

        const outer=
          Math.max(
            1,
            Number(f.outer)||
            Number(f.r)||
            60
          );
        const inner=
          Math.max(
            0,
            Number(f.inner)||0
          );
        const angle=
          (Number.isFinite(Number(f.angle))
            ?Number(f.angle)
            :-Math.PI/2)+
          (Number(f.startAngleOffset)||0);
        const span=
          Number.isFinite(Number(f.halfAngle))
            ?Number(f.halfAngle)
            :(
              Number.isFinite(Number(f.span))
                ?Number(f.span)
                :Math.PI
            );
        const hitColor=
          ColorService.rgbString(
            f.hitColor||
            (
              f.empow
                ?(
                  f.empoweredColor||
                  '255,160,40'
                )
                :(
                  f.color||
                  '180,180,200'
                )
            ),
            '180,180,200'
          );
        const safeColor=
          ColorService.rgbString(
            f.safeColor,
            '80,80,100'
          );

        const sweepCount=Math.max(
          1,
          Math.floor(Number(f.sweepCount)||2)
        );
        const clockwise=
          String(f.sweepDirection||'clockwise')!==
          'counterclockwise';

        for(let index=0;index<sweepCount;index++){
          const converge=
            f.converge===true;

          // 기본(Tau): 서로 반대편 시작점에서 같은 방향으로 sweep.
          // sweepCount:1은 하나의 회전 공격이 지정 span 전체를 순회한다.
          // converge: 지정된 최종 부채꼴의 양 끝에서 중앙을 향해 각각 sweep.
          const finalStart=
            angle-span;
          const finalEnd=
            angle+span;
          const startAngle=
            converge
              ?(
                index===0
                  ?finalStart
                  :finalEnd
              )
              :angle+index*(Math.PI*2/sweepCount);
          const signedSweep=
            span*sweep*(clockwise?1:-1);
          const endAngle=
            converge
              ?(
                index===0
                  ?finalStart+span*sweep
                  :finalEnd-span*sweep
              )
              :startAngle+signedSweep;
          const counterClockwise=
            converge
              ?index===1
              :!clockwise;

          if(inner>0){
            ctx.beginPath();
            ctx.moveTo(f.x,f.y);
            ctx.arc(
              f.x,
              f.y,
              inner,
              startAngle,
              endAngle,
              counterClockwise
            );
            ctx.closePath();
            ctx.fillStyle=
              `rgba(${safeColor},${visualAlpha*Math.max(0,Number(f.safeFillAlpha)||.1)})`;
            ctx.fill();
            ctx.setLineDash(
              Array.isArray(f.safeDash)
                ?f.safeDash
                :[5,4]
            );
            ctx.strokeStyle=
              `rgba(${safeColor},${visualAlpha*Math.max(0,Number(f.safeStrokeAlpha)||.55)})`;
            ctx.lineWidth=
              Math.max(
                .5,
                Number(f.safeLineWidth)||1.5
              );
            ctx.stroke();
            ctx.setLineDash([]);
          }

          const hitFillAlpha=
            visualAlpha*
            Math.max(
              0,
              Number(f.fillAlpha)||.28
            );
          const hitStrokeAlpha=
            visualAlpha*
            Math.max(
              0,
              Number(f.strokeAlpha)||.95
            );
          const visibleLineWidth=
            Math.max(
              .5,
              Number(f.lineWidth)||2.5
            );

          if(inner<=0&&f.edgeLine===false){
            /*
              중심까지 닫는 sector path는 fill 경계에 방사형 seam을 만들 수 있다.
              중심이 0인 edge-less sweep은 두꺼운 원호 stroke로 면을 채워
              시작/끝 방사선을 path 자체에서 제거한다.
            */
            ctx.save();
            ctx.lineCap='butt';
            ctx.beginPath();
            ctx.arc(
              f.x,
              f.y,
              outer*.5,
              startAngle,
              endAngle,
              counterClockwise
            );
            ctx.strokeStyle=
              `rgba(${hitColor},${hitFillAlpha})`;
            ctx.lineWidth=outer;
            ctx.stroke();
            ctx.restore();

            ctx.beginPath();
            ctx.arc(
              f.x,
              f.y,
              outer,
              startAngle,
              endAngle,
              counterClockwise
            );
            ctx.strokeStyle=
              `rgba(${hitColor},${hitStrokeAlpha})`;
            ctx.lineWidth=visibleLineWidth;
            if(!hasAnnularClip||f.clipMaskOnly===true)ctx.stroke();
          }else{
            ctx.beginPath();
            ctx.arc(
              f.x,
              f.y,
              outer,
              startAngle,
              endAngle,
              counterClockwise
            );
            if(inner>0){
              ctx.arc(
                f.x,
                f.y,
                inner,
                endAngle,
                startAngle,
                !counterClockwise
              );
            }else{
              ctx.lineTo(f.x,f.y);
            }
            ctx.closePath();
            ctx.fillStyle=
              `rgba(${hitColor},${hitFillAlpha})`;
            ctx.fill();
            ctx.strokeStyle=
              `rgba(${hitColor},${hitStrokeAlpha})`;
            ctx.lineWidth=visibleLineWidth;
            if(f.edgeLine===false){
              ctx.beginPath();
              ctx.arc(
                f.x,
                f.y,
                outer,
                startAngle,
                endAngle,
                counterClockwise
              );
              if(!hasAnnularClip||f.clipMaskOnly===true)ctx.stroke();
              if(inner>0){
                ctx.beginPath();
                ctx.arc(
                  f.x,
                  f.y,
                  inner,
                  startAngle,
                  endAngle,
                  counterClockwise
                );
                if(!hasAnnularClip||f.clipMaskOnly===true)ctx.stroke();
              }
            }else if(!hasAnnularClip){
              ctx.stroke();
            }
          }

          if(f.edgeLine===true&&Math.abs(endAngle-startAngle)>1e-5){
            const edgeColor=ColorService.rgbString(f.edgeColor,'255,255,255');
            const edgeAlpha=Math.max(0,Math.min(1,Number.isFinite(Number(f.edgeAlpha))?Number(f.edgeAlpha):.75));
            const edgeLineWidth=Math.max(.5,Number(f.edgeLineWidth)||2.5);
            ctx.beginPath();
            ctx.moveTo(
              f.x+Math.cos(endAngle)*inner,
              f.y+Math.sin(endAngle)*inner
            );
            ctx.lineTo(
              f.x+Math.cos(endAngle)*outer,
              f.y+Math.sin(endAngle)*outer
            );
            ctx.strokeStyle=`rgba(${edgeColor},${visualAlpha*edgeAlpha})`;
            ctx.lineWidth=edgeLineWidth;
            ctx.setLineDash([]);
            ctx.stroke();
          }



        }

        /*
          clipToAttackArea가 있는 회전 공격은 완성된 polygon 윤곽을 시작 프레임부터
          미리 그리지 않는다. 스야 arcSweep과 동일하게 현재 sweep 각도만큼의 geometry를
          다시 만들고 그 polygon을 stroke해 외곽선과 벽 절단면이 애니메이션 진행과 함께
          생성되도록 한다.
        */
        if(hasAnnularClip&&sweep>0&&f.clipMaskOnly!==true){
          // clip 마스크 바깥에서 현재 geometry 윤곽을 그려 벽 절단선이 반쪽으로 잘리지 않게 한다.
          ctx.restore();
          ctx.save();
          for(let index=0;index<sweepCount;index++){
            const converge=f.converge===true;
            const finalStart=angle-span;
            const finalEnd=angle+span;
            const startAngle=
              converge
                ?(index===0?finalStart:finalEnd)
                :angle+index*(Math.PI*2/sweepCount);
            const signedSweep=span*sweep*(clockwise?1:-1);
            const endAngle=
              converge
                ?(index===0?finalStart+span*sweep:finalEnd-span*sweep)
                :startAngle+signedSweep;
            const counterClockwise=converge?index===1:!clockwise;
            const currentPoints=
              ProgressiveClippedAreaOutlinePresentationService
                .annularSweepPoints(
                  f,
                  startAngle,
                  endAngle,
                  outer,
                  inner,
                  counterClockwise
                );
            ProgressiveClippedAreaOutlinePresentationService.strokePolygon(
              ctx,
              currentPoints,
              {
                color:hitColor,
                alpha:visualAlpha*Math.max(0,Number(f.strokeAlpha)||.95),
                lineWidth:Math.max(.5,Number(f.lineWidth)||2.5)
              }
            );
          }
        }

        const integratedCuts=Array.isArray(f.wallCutSegments)?f.wallCutSegments:[];
        if(integratedCuts.length){
          ctx.setLineDash([]);
          ctx.beginPath();
          for(const segment of integratedCuts){
            const ax=Number(segment?.ax),ay=Number(segment?.ay),bx=Number(segment?.bx),by=Number(segment?.by);
            if(![ax,ay,bx,by].every(Number.isFinite))continue;
            ctx.moveTo(ax,ay);
            ctx.lineTo(bx,by);
          }
          ctx.strokeStyle=`rgba(${hitColor},${visualAlpha*Math.max(0,Math.min(1,Number(f.strokeAlpha)||.95))})`;
          ctx.lineWidth=Math.max(.5,Number(f.lineWidth)||2.5);
          ctx.lineCap='round';
          ctx.lineJoin='round';
          ctx.stroke();
        }
        ctx.restore();

    return true;
  }
});
