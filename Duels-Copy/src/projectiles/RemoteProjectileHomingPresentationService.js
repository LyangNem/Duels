

const RemoteProjectileHomingPresentationService=Object.freeze({
  states:new WeakMap(),
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
  sample(projectile,authoritative,now=performance.now()){
    if(
      !projectile||
      !authoritative||
      projectile.behavior?.returning?.phase==='returning'
    ){
      if(projectile)this.states.delete(projectile);
      return null;
    }

    const elapsedMs=
      Math.max(
        0,
        Math.min(
          75,
          now-
          Math.max(
            0,
            Number(authoritative.receivedAt)||now
          )
        )
      );
    const elapsedFrames=
      elapsedMs/
      Math.max(
        .001,
        Number(GAME_DATA.frameMs)||16.6667
      );
    const vx=Number(authoritative.vx)||0;
    const vy=Number(authoritative.vy)||0;
    const targetX=
      Number(authoritative.x)+
      vx*elapsedFrames;
    const targetY=
      Number(authoritative.y)+
      vy*elapsedFrames;
    const targetAngle=
      Number(authoritative.angle)||0;

    let state=this.states.get(projectile)||null;
    if(
      !state||
      !Number.isFinite(Number(state.x))||
      !Number.isFinite(Number(state.y))
    ){
      state={
        x:targetX,
        y:targetY,
        angle:targetAngle,
        vx,
        vy,
        lastAt:now
      };
      this.states.set(projectile,state);
      return state;
    }

    const dt=Math.max(
      0,
      Math.min(
        50,
        now-
        Math.max(
          0,
          Number(state.lastAt)||now
        )
      )
    );
    state.lastAt=now;

    const distance=Math.hypot(
      targetX-state.x,
      targetY-state.y
    );

    if(distance>=260){
      state.x=targetX;
      state.y=targetY;
      state.angle=targetAngle;
    }else{
      const alpha=
        1-Math.exp(
          -dt/45
        );
      state.x+=
        (targetX-state.x)*alpha;
      state.y+=
        (targetY-state.y)*alpha;
      state.angle+=
        this.shortestAngle(
          state.angle,
          targetAngle
        )*alpha;
    }

    state.vx=vx;
    state.vy=vy;
    return state;
  },
  clear(projectile){
    if(!projectile)return false;
    return this.states.delete(projectile);
  }
});