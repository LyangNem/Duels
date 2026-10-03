


/* 목표 지점 투사체의 렌더 좌표.
   충돌 좌표는 직선 이동을 유지하고, Jerry식 sin(progress*pi) 시각 높이만 렌더에 적용한다. */

/* trajectory.arc
   투사체/Entity 등 어떤 이동 객체든 0~1 진행률만 넘기면
   공중 높이, 화면 오프셋, 크기, 투명도, 그림자 값을 같은 규칙으로 얻는다.
   실제 XY 충돌 경로와 Z축처럼 보이는 시각 궤적을 분리한다. */
const ArcTrajectoryService=Object.freeze({
  sample(progress,module=null,out=null){
    const result=out&&typeof out==='object'?out:{};
    const p=Math.max(0,Math.min(1,Number(progress)||0));

    if(!module||module.type!=='trajectory.arc'){
      result.progress=p;
      result.apex=0;
      result.lift=0;
      result.offsetX=0;
      result.offsetY=0;
      result.scale=1;
      result.alpha=1;
      result.strokeAlpha=1;
      return result;
    }

    const apex=Math.sin(p*Math.PI);
    const height=Math.max(0,Number(module.height)||0);
    const lift=height*apex;
    const screenLiftRatio=Math.max(
      0,
      Number(module.screenLiftRatio)||1
    );
    const apexScale=Math.max(
      .01,
      Number(module.apexScale)||1
    );
    const apexAlpha=Math.max(
      0,
      Math.min(
        1,
        Number.isFinite(Number(module.apexAlpha))
          ?Number(module.apexAlpha)
          :1
      )
    );
    const apexStrokeAlpha=Math.max(
      0,
      Math.min(
        1,
        Number.isFinite(Number(module.apexStrokeAlpha))
          ?Number(module.apexStrokeAlpha)
          :apexAlpha
      )
    );
    result.progress=p;
    result.apex=apex;
    result.lift=lift;
    result.offsetX=0;
    result.offsetY=-lift*screenLiftRatio;
    result.scale=1+(apexScale-1)*apex;
    result.alpha=1-(1-apexAlpha)*apex;
    result.strokeAlpha=1-(1-apexStrokeAlpha)*apex;
    return result;
  }
});