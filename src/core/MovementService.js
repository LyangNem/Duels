

const MovementService=Object.freeze({
  collides(x,y,radius){
    if(
      x-radius<0||
      y-radius<0||
      x+radius>WorldBoundsService.width()||
      y+radius>WorldBoundsService.height()
    )return true;

    return DebugMapService.movementWalls().some(w=>
      x+radius>w.x&&
      x-radius<w.x+w.w&&
      y+radius>w.y&&
      y-radius<w.y+w.h
    );
  },
  insideExpandedWall(x,y,wall,radius){
    return (
      x>wall.x-radius&&
      x<wall.x+wall.w+radius&&
      y>wall.y-radius&&
      y<wall.y+wall.h+radius
    );
  },
  travelDistance(x,y,angle,distance,radius,ignoreWalls=false){
    let allowed=Math.max(0,Number(distance)||0);
    if(allowed<=0)return 0;

    const dx=Math.cos(angle);
    const dy=Math.sin(angle);
    const epsilon=1e-9;

    if(dx>epsilon){
      allowed=Math.min(
        allowed,
        (WorldBoundsService.width()-radius-x)/dx
      );
    }else if(dx<-epsilon){
      allowed=Math.min(
        allowed,
        (radius-x)/dx
      );
    }

    if(dy>epsilon){
      allowed=Math.min(
        allowed,
        (WorldBoundsService.height()-radius-y)/dy
      );
    }else if(dy<-epsilon){
      allowed=Math.min(
        allowed,
        (radius-y)/dy
      );
    }

    allowed=Math.max(0,allowed);
    if(ignoreWalls||allowed<=0)return allowed;

    const endX=x+dx*allowed;
    const endY=y+dy*allowed;

    for(const wall of DebugMapService.movementWalls()){
      const entry=WorldGeometryService.segmentRectEntry(
        x,
        y,
        endX,
        endY,
        wall,
        radius
      );

      if(entry===null)continue;

      if(entry<=epsilon){
        const probe=Math.min(allowed,.05);
        if(probe<=0)continue;

        if(!this.insideExpandedWall(
          x+dx*probe,
          y+dy*probe,
          wall,
          radius
        )){
          continue;
        }
      }

      allowed=Math.min(
        allowed,
        Math.max(0,allowed*entry)
      );
    }

    return allowed;
  },
  findNearestFreePosition(
    entity,
    originX=entity?.x,
    originY=entity?.y
  ){
    if(!entity)return null;

    const radius=
      Math.max(
        0,
        Number(entity.radius)||0
      );
    const worldWidth=
      WorldBoundsService.width();
    const worldHeight=
      WorldBoundsService.height();
    const ox=Math.max(
      radius,
      Math.min(
        worldWidth-radius,
        Number(originX)||radius
      )
    );
    const oy=Math.max(
      radius,
      Math.min(
        worldHeight-radius,
        Number(originY)||radius
      )
    );

    if(!this.collides(ox,oy,radius)){
      return {x:ox,y:oy};
    }

    const candidates=[];
    const seen=new Set();
    const add=(x,y)=>{
      const cx=Math.max(
        radius,
        Math.min(
          worldWidth-radius,
          Number(x)||0
        )
      );
      const cy=Math.max(
        radius,
        Math.min(
          worldHeight-radius,
          Number(y)||0
        )
      );
      const key=
        `${cx.toFixed(4)}:${cy.toFixed(4)}`;
      if(seen.has(key))return;
      seen.add(key);
      candidates.push({
        x:cx,
        y:cy,
        d2:
          (cx-ox)*(cx-ox)+
          (cy-oy)*(cy-oy)
      });
    };

    const localRange=
      Math.max(
        800,
        radius*20
      );

    for(const wall of DebugMapService.movementWalls()){
      const left=wall.x-radius;
      const right=wall.x+wall.w+radius;
      const top=wall.y-radius;
      const bottom=wall.y+wall.h+radius;

      const nearestX=
        Math.max(
          left,
          Math.min(right,ox)
        );
      const nearestY=
        Math.max(
          top,
          Math.min(bottom,oy)
        );
      const distance=
        Math.hypot(
          nearestX-ox,
          nearestY-oy
        );

      if(distance>localRange)continue;

      const clampedY=
        Math.max(top,Math.min(bottom,oy));
      const clampedX=
        Math.max(left,Math.min(right,ox));

      // 모든 인접 벽의 바깥 경계 후보를 함께 검사하므로
      // 가장 가까운 한 방향이 다른 벽에 막혀도 그 방향에 고정되지 않는다.
      add(left,clampedY);
      add(right,clampedY);
      add(clampedX,top);
      add(clampedX,bottom);

      add(left,top);
      add(left,bottom);
      add(right,top);
      add(right,bottom);
    }

    candidates.sort(
      (a,b)=>a.d2-b.d2
    );

    for(const candidate of candidates){
      if(
        !this.collides(
          candidate.x,
          candidate.y,
          radius
        )
      ){
        return {
          x:candidate.x,
          y:candidate.y
        };
      }
    }

    // 복잡하게 닫힌 벽 군집용 보조 탐색.
    // 매 프레임이 아니라 실제 끼임 발생 시에만 실행된다.
    const radialStep=
      Math.max(
        8,
        Math.min(
          16,
          radius*.5||8
        )
      );
    const worldRadius=
      Math.hypot(
        worldWidth,
        worldHeight
      );
    // 벽 끼임 fallback이 맵 전체를 세밀하게 스캔하면 한 프레임을 오래 점유할 수 있다.
    // 인접 벽 경계 후보 검사 뒤에는 국소 범위만 탐색한다.
    const maxSearchRadius=Math.min(
      worldRadius,
      Math.max(640,radius*24)
    );
    const angleCount=32;

    for(
      let searchRadius=radialStep;
      searchRadius<=maxSearchRadius;
      searchRadius+=radialStep
    ){
      for(
        let index=0;
        index<angleCount;
        index++
      ){
        const angle=
          Math.PI*2*
          index/angleCount;
        const x=
          ox+
          Math.cos(angle)*
          searchRadius;
        const y=
          oy+
          Math.sin(angle)*
          searchRadius;

        if(
          x<radius||
          y<radius||
          x>worldWidth-radius||
          y>worldHeight-radius
        )continue;

        if(!this.collides(x,y,radius)){
          return {x,y};
        }
      }
    }

    return null;
  },
  resolveEmbedded(entity){
    if(!entity)return false;

    const radius=
      Math.max(
        0,
        Number(entity.radius)||0
      );
    const startX=Math.max(
      radius,
      Math.min(
        WorldBoundsService.width()-radius,
        Number(entity.x)||radius
      )
    );
    const startY=Math.max(
      radius,
      Math.min(
        WorldBoundsService.height()-radius,
        Number(entity.y)||radius
      )
    );

    entity.x=startX;
    entity.y=startY;

    if(
      !this.collides(
        startX,
        startY,
        radius
      )
    ){
      return false;
    }

    const free=
      this.findNearestFreePosition(
        entity,
        startX,
        startY
      );

    if(!free)return false;

    entity.x=free.x;
    entity.y=free.y;
    return true;
  },
  ensureValidPosition(entity){
    if(!entity)return false;

    if(
      !this.collides(
        entity.x,
        entity.y,
        entity.radius
      )
    ){
      return false;
    }

    return this.resolveEmbedded(entity);
  },
  finalizeForcedMotion(entity){
    if(!entity)return false;

    const motion=entity.forcedMotion;
    entity.forcedMotion=null;

    // wallPass가 살아 있는 동안은 벽 내부 위치도 유효하다.
    // 버프가 끝나는 시점의 소유 능력이 resolveEmbedded()를 호출해 정상 위치로 복귀시킨다.
    if(BuffService.resolveRaw(entity,'wallPass')<=0){
      this.ensureValidPosition(entity);
    }

    ForcedMotionCompletionService.resolve(
      entity,
      motion
    );
    return true;
  },
  move(entity,dx,dy,frameScale=1,options={}){
    if(!entity?.alive)return false;

    const wallPassActive=BuffService.resolveRaw(entity,'wallPass')>0;
    if(!wallPassActive)this.ensureValidPosition(entity);

    const len=Math.hypot(dx,dy);
    if(len<=.0001)return false;

    entity.lastMovementInputAngle=Math.atan2(dy,dx);

    const stats=CombatStatsService.current(entity);
    if(!stats.canMove)return false;
    if(
      typeof ChargedAttackService!=='undefined'&&
      ChargedAttackService.blocksMovement(entity)
    )return false;

    const baseSpeed=
      Number.isFinite(Number(options.speedOverride))
        ?Math.max(0,Number(options.speedOverride))
        :Math.max(0,Number(entity.speed)||0);
    const step=
      baseSpeed*
      (
        options.ignoreSpeedModifiers===true
          ?1
          :Math.max(0,stats.speedMult)
      )*
      frameScale;

    const nx=dx/len;
    const ny=dy/len;

    const xDistance=Math.abs(nx*step);
    if(xDistance>.0001){
      const xAngle=nx>=0?0:Math.PI;
      const allowedX=this.travelDistance(
        entity.x,
        entity.y,
        xAngle,
        xDistance,
        entity.radius,
        wallPassActive
      );
      if(allowedX+1e-6<xDistance){
        EntitySquashPresentationService.wallContact(entity,xAngle);
      }
      entity.x+=Math.cos(xAngle)*allowedX;
    }

    const yDistance=Math.abs(ny*step);
    if(yDistance>.0001){
      const yAngle=ny>=0?Math.PI/2:-Math.PI/2;
      const allowedY=this.travelDistance(
        entity.x,
        entity.y,
        yAngle,
        yDistance,
        entity.radius,
        wallPassActive
      );
      if(allowedY+1e-6<yDistance){
        EntitySquashPresentationService.wallContact(entity,yAngle);
      }
      entity.y+=Math.sin(yAngle)*allowedY;
    }

    return true;
  },
  startMotion(entity,targetX,targetY,speed,options={}){
    if(!entity)return false;

    // 기존 강제이동의 completion을 잃은 채 새 이동으로 덮어쓰지 않는다.
    // neutralize의 무기한 knockback phase가 교체되어 영구히 남는 것을 막는다.
    if(entity.forcedMotion){
      this.finalizeForcedMotion(entity);
    }

    const dx=(Number(targetX)||entity.x)-entity.x;
    const dy=(Number(targetY)||entity.y)-entity.y;
    const distance=Math.hypot(dx,dy);

    if(distance<=.001){
      this.finalizeForcedMotion(entity);
      return false;
    }

    entity.forcedMotion={
      kind:String(options.kind||'forced'),
      directionX:dx/distance,
      directionY:dy/distance,
      distance,
      traveled:0,
      speed:Math.max(.001,Number(speed)||.001),

      // Duels 이동기의 기본 규칙:
      // 별도 명시가 없으면 벽을 통과한다.
      // blockedByWalls/ignoreWalls:false인 이동만 벽에 막힌다.
      ignoreWalls:
        options.blockedByWalls===true
          ?false
          :options.ignoreWalls!==false,
      followup:options.followup&&typeof options.followup==='object'
        ?{...options.followup}
        :null,
      completion:
        options.completion&&
        typeof options.completion==='object'
          ?{...options.completion}
          :null
    };
    return true;
  },
  moveByVector(entity,angle,distance,speed,options={}){
    if(!entity)return false;

    const finalDistance=Math.max(0,Number(distance)||0);
    return this.startMotion(
      entity,
      entity.x+Math.cos(angle)*finalDistance,
      entity.y+Math.sin(angle)*finalDistance,
      speed,
      options
    );
  },
  pull(entity,source,distance,speed=10,options={}){
    if(!entity||!source)return false;

    // 끌어오기는 피격 대상의 현재 위치에서 source 쪽으로 향하는 독립 강제이동 상태다.
    // 벽은 통과하지만 월드 경계는 MovementService 공통 규칙을 유지한다.
    if(
      typeof MovementAbilityService!=='undefined'&&
      MovementAbilityService.active(entity)
    ){
      MovementAbilityService.clear(entity);
    }

    const dx=
      (Number(source.x)||0)-
      (Number(entity.x)||0);
    const dy=
      (Number(source.y)||0)-
      (Number(entity.y)||0);
    const centerDistance=Math.hypot(dx,dy);

    if(centerDistance<=.001){
      this.finalizeForcedMotion(entity);
      return false;
    }

    const contactDistance=Math.max(
      0,
      centerDistance-
      Math.max(0,Number(source.radius)||0)-
      Math.max(0,Number(entity.radius)||0)-
      Math.max(0,Number(options.gap)||0)
    );
    const pullDistance=Math.min(
      Math.max(0,Number(distance)||0),
      contactDistance
    );

    if(pullDistance<=.001){
      this.finalizeForcedMotion(entity);
      return false;
    }

    ForcedMovementWindupInterruptService.interrupt(
      entity,
      'pull'
    );

    const ux=dx/centerDistance;
    const uy=dy/centerDistance;
    const duration=Math.max(0,Number(options.duration)||0);
    const resolvedSpeed=duration>0
      ?pullDistance/Math.max(1,duration/GAME_DATA.frameMs)
      :Math.max(.001,Number(speed)||10);

    return this.startMotion(
      entity,
      entity.x+ux*pullDistance,
      entity.y+uy*pullDistance,
      resolvedSpeed,
      {
        ...options,
        kind:'pull',
        ignoreWalls:true,
        blockedByWalls:false
      }
    );
  },
  knockback(entity,angle,distance,speed=10,options={}){
    const forcedDistance=
      Math.max(
        0,
        Number(distance)||0
      );

    if(forcedDistance>.001){
      ForcedMovementWindupInterruptService.interrupt(
        entity,
        'knockback'
      );
    }

    if(
      typeof CommandFeatureService!=='undefined'
    ){
      CommandFeatureService.cancelCoolingWindup?.(
        entity
      );
    }

    // 피격 넉백은 자기 이동기보다 우선한다.
    // 회피 무적은 공격 상호작용 단계에서 이미 배제되므로 여기까지 오지 않는다.
    if(
      typeof MovementAbilityService!=='undefined'&&
      MovementAbilityService.active(entity)
    ){
      MovementAbilityService.clear(entity);
    }

    return this.moveByVector(
      entity,
      angle,
      distance,
      speed,
      {
        ...options,
        blockedByWalls:true,
        ignoreWalls:false
      }
    );
  },
  updateForced(entity,now=performance.now(),frameScale=1){
    const motion=entity?.forcedMotion;

    if(!motion){
      if(BuffService.resolveRaw(entity,'wallPass')<=0){
        this.ensureValidPosition(entity);
      }
      return false;
    }

    const remaining=Math.max(
      0,
      motion.distance-motion.traveled
    );
    const requestedStep=Math.min(
      remaining,
      motion.speed*Math.max(
        0,
        Number(frameScale)||0
      )
    );

    const angle=Math.atan2(
      motion.directionY,
      motion.directionX
    );
    const allowedStep=this.travelDistance(
      entity.x,
      entity.y,
      angle,
      requestedStep,
      entity.radius,
      motion.ignoreWalls
    );

    entity.x+=motion.directionX*allowedStep;
    entity.y+=motion.directionY*allowedStep;
    motion.traveled+=allowedStep;

    const blocked=allowedStep+1e-6<requestedStep;
    const completed=motion.traveled>=motion.distance-1e-6;

    if(blocked){
      EntitySquashPresentationService.wallContact(entity,angle,{},now);
    }

    if(blocked){
      motion.blocked=true;
      this.finalizeForcedMotion(entity);
      return true;
    }

    if(completed){
      const followup=motion.followup
        ?{...motion.followup}
        :null;

      if(followup&&Math.max(0,Number(followup.distance)||0)>0){
        const oldSpeed=Math.max(.001,Number(motion.speed)||.001);
        const usedFrameScale=allowedStep/oldSpeed;
        const remainingFrameScale=Math.max(
          0,
          (Number(frameScale)||0)-usedFrameScale
        );

        const followupAngle=Number(followup.angle)||0;
        const followupDistance=Math.max(0,Number(followup.distance)||0);
        const followupSpeed=Math.max(.001,Number(followup.speed)||1);
        const knockbackMode=String(followup.mode||'normal')==='knockback';

        motion.directionX=Math.cos(followupAngle);
        motion.directionY=Math.sin(followupAngle);
        motion.distance=followupDistance;
        motion.traveled=0;
        motion.speed=followupSpeed;
        motion.ignoreWalls=knockbackMode
          ?false
          :followup.ignoreWalls!==false;
        motion.followup=
          followup.followup&&typeof followup.followup==='object'
            ?{...followup.followup}
            :null;
        motion.completion=
          followup.completion&&
          typeof followup.completion==='object'
            ?{...followup.completion}
            :motion.completion;

        if(remainingFrameScale>.0001){
          return this.updateForced(
            entity,
            now,
            remainingFrameScale
          );
        }
        return true;
      }

      this.finalizeForcedMotion(entity);
    }

    return true;
  }
});