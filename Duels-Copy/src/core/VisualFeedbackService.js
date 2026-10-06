

/* 렌더 피드백 */
const VisualFeedbackService=Object.freeze({
  attackProfile(entity){
    const configured=
      entity?.presentation?.attackFeedback||
      entity?.summonSpec?.presentation?.attackFeedback||
      null;

    return {
      durationMs:Math.max(
        1,
        Number(configured?.durationMs)||125
      ),
      recoil:Math.max(
        0,
        Number(configured?.recoil)||3.8
      ),
      squashX:Math.max(
        0,
        Number(configured?.squashX)||.10
      ),
      stretchY:Math.max(
        0,
        Number(configured?.stretchY)||.07
      )
    };
  },
  attack(entity,angle=0){
    if(!entity)return false;

    const profile=this.attackProfile(entity);
    entity.renderAttack={
      startedAt:performance.now(),
      durationMs:profile.durationMs,
      angle:Number(angle)||0,
      recoil:profile.recoil,
      squashX:profile.squashX,
      stretchY:profile.stretchY
    };
    return true;
  },
  motion(entity,now=performance.now()){
    if(!entity)return RENDER_NEUTRAL_MOTION;

    const x=Number(entity.x)||0;
    const y=Number(entity.y)||0;
    let state=entity.renderMotion;

    if(!state){
      state=entity.renderMotion={
        x,
        y,
        t:now,
        speed:0,
        angle:0,
        pulse:0,
        pulseAt:now,
        output:{
          scaleX:1,
          scaleY:1,
          rotation:0,
          offsetX:0,
          offsetY:0
        }
      };
      return state.output;
    }

    const dt=Math.max(1,Math.min(80,now-state.t));
    const dx=x-state.x;
    const dy=y-state.y;
    const dist=Math.hypot(dx,dy);
    const speed=dist/dt;
    const moving=speed>.015;
    const angle=moving?Math.atan2(dy,dx):state.angle;

    if(moving&&state.speed>.015){
      const diff=Math.abs(
        Math.atan2(
          Math.sin(angle-state.angle),
          Math.cos(angle-state.angle)
        )
      );
      if(diff>1.15){
        state.pulse=.12;
        state.pulseAt=now;
      }
    }else if(!moving&&state.speed>.02){
      state.pulse=.09;
      state.pulseAt=now;
    }

    state.x=x;
    state.y=y;
    state.t=now;
    state.speed=speed;
    state.angle=angle;

    const stride=moving?Math.min(1,speed/.22):0;
    const bob=moving?Math.sin(now*.018)*.015*stride:0;
    let pulse=0;

    if(state.pulse>0){
      const pt=(now-state.pulseAt)/150;
      if(pt<1){
        pulse=state.pulse*Math.sin(Math.PI*pt);
      }else{
        state.pulse=0;
      }
    }

    const out=state.output;
    out.scaleX=1+.045*stride+bob-pulse*.82;
    out.scaleY=1-.032*stride-bob+pulse*.70;
    out.rotation=angle;
    out.offsetX=0;
    out.offsetY=0;
    return out;
  },
  attackState(entity,now=performance.now()){
    const state=entity?.renderAttack;
    if(!state)return RENDER_NEUTRAL_ATTACK;

    const t=Math.max(
      0,
      Math.min(
        1,
        (now-state.startedAt)/
          Math.max(1,state.durationMs)
      )
    );

    if(t>=1){
      entity.renderAttack=null;
      return RENDER_NEUTRAL_ATTACK;
    }

    const out=
      state.output||
      (state.output={
        active:true,
        offsetX:0,
        offsetY:0,
        scaleX:1,
        scaleY:1,
        rotation:0
      });

    const wave=Math.sin(Math.PI*t);
    const recoil=
      Math.max(
        0,
        Number(state.recoil)||3.8
      )*
      wave;
    const squashX=
      Math.max(
        0,
        Number(state.squashX)||.10
      );
    const stretchY=
      Math.max(
        0,
        Number(state.stretchY)||.07
      );

    out.active=true;
    out.offsetX=-Math.cos(state.angle)*recoil;
    out.offsetY=-Math.sin(state.angle)*recoil;
    out.scaleX=1-squashX*wave;
    out.scaleY=1+stretchY*wave;
    out.rotation=state.angle;
    return out;
  },

});