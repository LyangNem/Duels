




/* 독립 스퀴시 표현 시스템
   - 기존 renderHit/renderWallContact 상태를 사용하지 않는다.
   - 온라인 플레이어는 PID, 그 외 Entity는 ID를 키로 사용한다.
   - 따라서 네트워크 snapshot이나 Entity 참조가 교체돼도 동일한 시각 상태를 유지한다. */
const EntitySquashPresentationService=Object.freeze({
  impactStates:new Map(),
  wallStates:new Map(),
  neutral:Object.freeze({
    active:false,
    offsetX:0,
    offsetY:0,
    scaleX:1,
    scaleY:1,
    rotation:0,
    flash:false
  }),
  key(entity,explicitPid=null){
    // PID 키는 실제 플레이어 본체에만 사용한다.
    // 소환수는 owner PID를 공유하므로 반드시 고유 Entity ID로 분리해야 한다.
    if(entity?.kind==='player'){
      const pid=String(
        explicitPid||
        (
          Training.sessionMode==='online'
            ?OnlineParticipantEntityService.pid(entity)
            :''
        )||''
      );
      if(pid)return `pid:${pid}`;
    }
    const id=String(entity?.id||'');
    return id?`entity:${id}`:null;
  },
  impact(entity,damage=0,source=null,options={},now=performance.now()){
    const key=this.key(entity,options.targetPid||null);
    if(!key)return false;

    const amount=Math.max(0,Number(damage)||0);
    if(amount<=0)return false;

    const directionless=options.directionless===true;
    const sourceX=Number(source?.x);
    const sourceY=Number(source?.y);
    const targetX=Number(entity?.x);
    const targetY=Number(entity?.y);
    const angle=(
      !directionless&&
      Number.isFinite(sourceX)&&
      Number.isFinite(sourceY)&&
      Number.isFinite(targetX)&&
      Number.isFinite(targetY)
    )
      ?Math.atan2(targetY-sourceY,targetX-sourceX)
      :0;

    // 피해량에 따라 0~1 사이에서 부드럽게 강도를 올린다.
    const normalized=Math.max(
      0,
      Math.min(
        1,
        amount/Math.max(1,GAME_DATA.cameraFeedback.strongDamage)
      )
    );
    const strength=.16+.20*Math.sqrt(normalized);
    const distance=4+10*Math.sqrt(normalized);
    const durationMs=135+70*normalized;

    this.impactStates.set(key,{
      startedAt:now,
      durationMs,
      angle,
      directionless,
      strength,
      distance,
      flashUntil:now+45+30*normalized
    });
    return true;
  },
  wallContact(entity,angle=0,options={},now=performance.now()){
    const key=this.key(entity,options.targetPid||null);
    if(!key)return false;

    let state=this.wallStates.get(key);
    if(!state||now-Number(state.lastAt||0)>140){
      state={
        startedAt:now,
        lastAt:now,
        angle:Number(angle)||0,
        lastBroadcastAt:-Infinity
      };
      this.wallStates.set(key,state);
    }else{
      state.lastAt=now;
      state.angle=Number(angle)||0;
    }

    if(
      options.broadcast!==false&&
      entity&&
      now-Number(state.lastBroadcastAt||-Infinity)>=50
    ){
      state.lastBroadcastAt=now;
      GameEvents.emit('wall-contact-feedback',{
        target:entity,
        angle:Number(angle)||0,
        now
      });
    }
    return true;
  },
  sample(entity,now=performance.now()){
    const key=this.key(entity);
    if(!key)return this.neutral;

    let hit=this.impactStates.get(key)||null;
    if(hit&&now-hit.startedAt>=hit.durationMs){
      this.impactStates.delete(key);
      hit=null;
    }

    let wall=this.wallStates.get(key)||null;
    if(wall&&now-Number(wall.lastAt||0)>135){
      this.wallStates.delete(key);
      wall=null;
    }

    if(!hit&&!wall)return this.neutral;

    let offsetX=0;
    let offsetY=0;
    let scaleX=1;
    let scaleY=1;
    let rotation=0;
    let flash=false;

    if(wall){
      const age=Math.max(0,now-wall.startedAt);
      const since=Math.max(0,now-wall.lastAt);
      const inFactor=Math.min(1,age/55);
      const outFactor=since<=25?1:Math.max(0,1-(since-25)/110);
      const amount=.13*inFactor*outFactor;
      if(amount>0){
        rotation=Number(wall.angle)||0;
        scaleX*=1-amount;
        scaleY*=1+amount*.62;
      }
    }

    if(hit){
      const t=Math.max(0,Math.min(1,(now-hit.startedAt)/Math.max(1,hit.durationMs)));
      const punch=t<.18?1:Math.pow(1-(t-.18)/.82,2.1);
      const wave=Math.sin(Math.PI*Math.min(1,t/.78));
      const amount=hit.strength*wave;

      if(hit.directionless){
        scaleX*=1-amount*.55;
        scaleY*=1-amount*.55;
      }else{
        rotation=hit.angle;
        scaleX*=1-amount;
        scaleY*=1+amount*.62;
        offsetX=Math.cos(hit.angle)*hit.distance*punch;
        offsetY=Math.sin(hit.angle)*hit.distance*punch;
      }
      flash=now<hit.flashUntil;
    }

    return {
      active:true,
      offsetX,
      offsetY,
      scaleX,
      scaleY,
      rotation,
      flash
    };
  },
  reset(){
    this.impactStates.clear();
    this.wallStates.clear();
  }
});