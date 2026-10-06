

const RemoteProjectileHomingPresentationBufferService=Object.freeze({
  syncCollision(projectile,now=performance.now()){
    const point=this.sample(projectile,now);
    if(!point){
      projectile.remoteHomingCollisionSynced=false;
      return false;
    }
    // 처음 연결될 때 독립 시뮬레이션 위치까지의 구간을 타격으로 보지 않는다.
    if(projectile.remoteHomingCollisionSynced!==true){
      projectile.prevX=point.x;
      projectile.prevY=point.y;
    }
    projectile.x=point.x;
    projectile.y=point.y;
    projectile.vx=point.vx;
    projectile.vy=point.vy;
    projectile.angle=point.angle;
    projectile.remoteHomingCollisionSynced=true;
    return true;
  },
  shortestAngle(from,to){
    return (
      (
        Number(to)-
        Number(from)+
        Math.PI*3
      )%
      (Math.PI*2)-
      Math.PI
    );
  },
  sample(projectile,now=performance.now()){
    if(
      !projectile?.homing?.idleWander||
      EntitySimulationAuthorityService.isLocal(
        projectile.source
      )||
      projectile.behavior?.returning?.phase==='returning'
    )return null;

    const samples=
      Array.isArray(
        projectile.remoteHomingPresentationSamples
      )
        ?projectile.remoteHomingPresentationSamples
        :null;
    if(!samples?.length)return null;

    const latest=
      samples[samples.length-1];

    // 최초 수신으로 시계 원점만 맞춘다. 후속 패킷 도착 시각으로
    // 재생 시계를 다시 맞추면 네트워크 지터가 표시 속도로 변환된다.
    // 배회/재조준/직진 모두 같은 시간축을 사용해 상태 전환 시 점프를 막는다.
    const clock=projectile.remoteHomingPresentationClock;
    if(!clock)return null;
    const targetTime=now-clock.offset-100;

    let before=samples[0];
    let after=null;

    for(let index=1;index<samples.length;index++){
      const candidate=samples[index];
      if(
        Number(candidate.sampleTime)>=
        targetTime
      ){
        after=candidate;
        before=samples[index-1];
        break;
      }
      before=candidate;
    }

    if(after){
      const start=
        Number(before.sampleTime);
      const end=
        Math.max(
          start+.001,
          Number(after.sampleTime)
        );
      const ratio=
        Math.max(
          0,
          Math.min(
            1,
            (targetTime-start)/(end-start)
          )
        );

      return {
        x:
          Number(before.x)+
          (
            Number(after.x)-
            Number(before.x)
          )*ratio,
        y:
          Number(before.y)+
          (
            Number(after.y)-
            Number(before.y)
          )*ratio,
        vx:
          Number(before.vx)+
          (
            Number(after.vx)-
            Number(before.vx)
          )*ratio,
        vy:
          Number(before.vy)+
          (
            Number(after.vy)-
            Number(before.vy)
          )*ratio,
        angle:
          Number(before.angle)+
          this.shortestAngle(
            before.angle,
            after.angle
          )*ratio
      };
    }

    /*
      아직 다음 샘플이 도착하지 않은 아주 짧은 구간만 최신 속도로
      최대 50ms 예측한다. 장시간 extrapolation은 속도 튐의 원인이므로 금지.
    */
    const extrapolateMs=
      Math.max(
        0,
        Math.min(
          50,
          targetTime-
          Math.max(
            0,
            Number(latest.sampleTime)
          )
        )
      );
    const frames=
      extrapolateMs/
      Math.max(
        .001,
        Number(GAME_DATA.frameMs)||16.6667
      );

    return {
      x:
        Number(latest.x)+
        (Number(latest.vx)||0)*frames,
      y:
        Number(latest.y)+
        (Number(latest.vy)||0)*frames,
      vx:Number(latest.vx)||0,
      vy:Number(latest.vy)||0,
      angle:Number(latest.angle)||0
    };
  }
});