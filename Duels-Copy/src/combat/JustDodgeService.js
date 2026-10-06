

/* 저스트 회피 */
const JustDodgeService=Object.freeze({
  begin(entity,now=performance.now()){
    const expiresAt=
      now+
      GAME_DATA.dodge.justWindow;

    entity.justDodgeStartedAt=now;
    entity.justDodgeWindowUntil=expiresAt;
    entity.justCheck={
      prevX:entity.x,
      prevY:entity.y,
      currX:entity.x,
      currY:entity.y,
      radius:entity.radius+14,
      startedAt:now,
      expiresAt
    };
    entity.justDodgeConsumed=false;
  },
  beginFrame(entity){
    const check=entity?.justCheck;
    if(!check||entity.justDodgeConsumed)return;
    check.prevX=check.currX;
    check.prevY=check.currY;
  },
  endFrame(entity){
    const check=entity?.justCheck;
    if(!check||entity.justDodgeConsumed)return;
    check.currX=entity.x;
    check.currY=entity.y;
  },
  expire(entity,now=performance.now()){
    if(entity?.justCheck&&now>entity.justCheck.expiresAt)entity.justCheck=null;
  },
  orientation(ax,ay,bx,by,cx,cy){
    return (bx-ax)*(cy-ay)-(by-ay)*(cx-ax);
  },
  pointSegmentDistance(px,py,ax,ay,bx,by){
    const vx=bx-ax,vy=by-ay;
    const vv=vx*vx+vy*vy;
    if(vv<=1e-8)return Math.hypot(px-ax,py-ay);
    const t=Math.max(0,Math.min(1,((px-ax)*vx+(py-ay)*vy)/vv));
    const qx=ax+vx*t,qy=ay+vy*t;
    return Math.hypot(px-qx,py-qy);
  },
  segmentsIntersect(ax,ay,bx,by,cx,cy,dx,dy){
    const o1=this.orientation(ax,ay,bx,by,cx,cy);
    const o2=this.orientation(ax,ay,bx,by,dx,dy);
    const o3=this.orientation(cx,cy,dx,dy,ax,ay);
    const o4=this.orientation(cx,cy,dx,dy,bx,by);
    return ((o1>0&&o2<0)||(o1<0&&o2>0))&&
           ((o3>0&&o4<0)||(o3<0&&o4>0));
  },
  segmentsDistance(ax,ay,bx,by,cx,cy,dx,dy){
    if(this.segmentsIntersect(ax,ay,bx,by,cx,cy,dx,dy))return 0;
    return Math.min(
      this.pointSegmentDistance(ax,ay,cx,cy,dx,dy),
      this.pointSegmentDistance(bx,by,cx,cy,dx,dy),
      this.pointSegmentDistance(cx,cy,ax,ay,bx,by),
      this.pointSegmentDistance(dx,dy,ax,ay,bx,by)
    );
  },
  overlapsProjectile(target,projectile,now=performance.now()){
    const check=target?.justCheck;
    if(!check||target.justDodgeConsumed||now>check.expiresAt)return false;

    const px1=Number.isFinite(projectile.prevX)?projectile.prevX:projectile.x;
    const py1=Number.isFinite(projectile.prevY)?projectile.prevY:projectile.y;

    return this.segmentsDistance(
      px1,py1,projectile.x,projectile.y,
      check.prevX,check.prevY,check.currX,check.currY
    )<=check.radius+(projectile.radius||0);
  },
  canConfirm(target){
    if(
      Training.sessionMode!=='online'
    )return true;

    return EntitySimulationAuthorityService
      .isLocal(target);
  },
  confirmProjectile(target,projectile,now=performance.now()){
    if(!this.canConfirm(target))return false;
    if(!this.overlapsProjectile(target,projectile,now))return false;
    return this.confirm(target,now,{cause:{source:projectile.source,attack:projectile.attack,impact:{type:'projectile'}}});
  },
  confirmArea(target,source,module,angle,containsPoint,now=performance.now(),cause={}){
    if(!this.canConfirm(target))return false;
    const check=target?.justCheck;
    if(!check||target.justDodgeConsumed||now>check.expiresAt)return false;

    // 현재 프레임에서 이동한 짧은 구간만 샘플링한다.
    // 과거에 지나온 회피 경로는 다음 프레임부터 판정에 남지 않는다.
    const samples=3;
    for(let index=0;index<=samples;index++){
      const ratio=index/samples;
      const x=check.prevX+(check.currX-check.prevX)*ratio;
      const y=check.prevY+(check.currY-check.prevY)*ratio;
      if(containsPoint(module,source,x,y,check.radius,angle)){
        return this.confirm(target,now,{cause:{source,...cause,impact:cause.impact||{type:module?.type==='field.area'?'field-area':'area'}}});
      }
    }
    return false;
  },
  confirmDamageAttempt(target,now=performance.now(),attack=null,cause=null){
    if(!this.canConfirm(target))return false;
    if(
      !target||
      target.justDodgeConsumed
    )return false;

    const check=target.justCheck;
    const extension=
      Math.max(
        0,
        Number(
          attack?.justDodgeWindowExtension
        )||0
      );
    const windowUntil=
      Math.max(
        Number(check?.expiresAt)||0,
        Number(target.justDodgeWindowUntil)||0
      )+
      extension;

    if(now>windowUntil)return false;

    // DamagePipeline까지 도달했다는 것은 실제 피해 적용 직전이라는 뜻이다.
    // DOT/상태 피해처럼 별도 공간 판정이 없는 공격은 geometry check가 프레임 정리로
    // 사라졌더라도 회피 시작 시 저장한 canonical 80ms 창이 살아 있으면 저회를 확정한다.
    return this.confirm(
      target,
      now,
      {
        allowWindowFallback:true,
        windowExtension:extension,
        cause
      }
    );
  },
  confirm(
    target,
    now=performance.now(),
    {
      allowWindowFallback=false,
      windowExtension=0,
      cause=null
    }={}
  ){
    const check=target?.justCheck;
    const windowUntil=
      Math.max(
        Number(check?.expiresAt)||0,
        allowWindowFallback
          ?Number(target?.justDodgeWindowUntil)||0
          :0
      )+
      Math.max(
        0,
        Number(windowExtension)||0
      );

    if(
      !target||
      target.justDodgeConsumed||
      now>windowUntil||
      (
        !check&&
        !allowWindowFallback
      )
    )return false;

    const startedAt=
      Number(check?.startedAt)||
      Number(target.justDodgeStartedAt)||
      now;

    target.justDodgeConsumed=true;
    target.justCheck=null;
    target.justDodgeWindowUntil=0;

    const dodgeProtectionDuration=
      GAME_DATA.dodge.justWindow;
    target.invincibleUntil=
      now+
      dodgeProtectionDuration;
    BuffService.set(
      target,
      'invulnerable',
      1,
      'system:dodge',
      dodgeProtectionDuration,
      {presentation:{opacity:.45}}
    );

    CounterStockService.acquire(
      target,
      GAME_DATA.counter.window+
        Math.max(
          0,
          BuffService.resolve(
            target,
            'counterWindow',
            now
          )
        ),
      now,
      startedAt,
      {kind:'normal'}
    );
    GameEvents.emit(
      'just-dodge',
      {
        target,
        now,
        startedAt,
        cause
      }
    );

    if(
      Training.sessionMode==='online'&&
      EntitySimulationAuthorityService
        .isLocal(target)&&
      target===Training.player&&
      OnlineDuelService.active
    ){
      OnlineDuelService
        .sendJustDodgeConfirmed(
          startedAt,
          now
        );
    }

    return true;
  }
});