

/* 목표 지점형 투사체의 탄착 처리.
   delivery.projectile의 targetPoint 옵션을 재사용하며 탄착 후 field.segment를 활성화할 수 있다. */

// WaypointProjectileService: 지속 투사체를 경유지 큐로 재지정하고 정지/회수하는 범용 서비스.
// 캐릭터 ID를 모르며 projectile.waypoint-path 데이터와 stateKey만 사용한다.
const WaypointProjectileService=Object.freeze({
  HOLD_KIND:'projectile-waypoint-hold',
  config(projectile){return projectile?.behavior?.waypoint||null;},
  projectile(source,stateKey){return ProjectileStateService.get(source,String(stateKey||''));},
  targetPoint(context){
    const point=context?.targetPoint;
    if(Number.isFinite(Number(point?.x))&&Number.isFinite(Number(point?.y))){
      return {x:Number(point.x),y:Number(point.y)};
    }
    if(EntitySimulationAuthorityService.isLocal(context?.source)&&Training.player===context?.source){
      const live=Training.mouseWorld();
      return {x:Number(live.x)||0,y:Number(live.y)||0};
    }
    const remote=context?.source?._remoteAimTargetPoint;
    if(Number.isFinite(Number(remote?.x))&&Number.isFinite(Number(remote?.y))){
      return {x:Number(remote.x),y:Number(remote.y)};
    }
    return null;
  },
  holdState(source,key){return source?.actionState?.get(String(key||''))||null;},
  beginHold(source,projectile,module,now=performance.now()){
    if(!source?.actionState||!projectile||projectile.behavior?.returning?.phase==='returning')return false;
    const key=String(module.holdStateKey||this.config(projectile)?.holdStateKey||'projectile-waypoint-hold');
    source.actionState.set(key,{
      kind:this.HOLD_KIND,
      stateKey:key,
      projectileStateKey:String(module.stateKey||projectile.stateKey||''),
      projectileNetworkKey:String(projectile.networkKey||''),
      startedAt:now,
      threshold:Math.max(1,Number(module.threshold)||300)
    });
    return true;
  },
  clearHold(source,key){
    if(!source?.actionState)return false;
    return source.actionState.delete(String(key||''));
  },
  applySegment(projectile,attackId,point,kind='lmb'){
    const source=projectile?.source;
    if(!source||!point)return false;
    const base=AbilityService.attackById(source.character,String(attackId||''));
    if(!base)return false;
    const attack=AugmentService.prepareAttack(source,base,performance.now());
    const delivery=AttackModuleService.projectile(attack);
    if(!delivery)return false;
    const cfg=ProjectileModuleService.config(attack);
    const dx=Number(point.x)-Number(projectile.x);
    const dy=Number(point.y)-Number(projectile.y);
    const distance=Math.hypot(dx,dy);
    const angle=distance>.001?Math.atan2(dy,dx):(Number(projectile.angle)||0);
    const waypoint=projectile.behavior?.waypoint||null;
    const returning=projectile.behavior?.returning||null;

    projectile.attack=attack;
    projectile.projectile={...delivery};
    projectile.behavior={
      ...projectile.behavior,
      waypoint,
      returning,
      pierce:{targets:cfg.pierce?.targets===true,walls:cfg.pierce?.walls===true},
      collisionPolicy:CollisionPolicyService.normalize({passWalls:cfg.pierce?.walls===true,passEnemies:cfg.pierce?.targets===true}),
      collision:{...cfg.collision},
      presentation:cfg.presentation||projectile.behavior?.presentation||null,
      trajectory:cfg.trajectory||null
    };
    projectile.renderStyle=projectile.behavior.presentation||null;
    projectile.renderRgb=AttackPresentationColorService.resolve(source,attack,{presentation:projectile.behavior.presentation});
    projectile.radius=Math.max(0,Number(delivery.radius)||projectile.radius||0);
    projectile.hitRadius=Math.max(0,Number(delivery.hitRadius)||Number(delivery.radius)||projectile.hitRadius||projectile.radius||0);
    projectile.baseSpeed=Math.max(0,Number(delivery.speed)||0);
    projectile.vx=Math.cos(angle)*projectile.baseSpeed;
    projectile.vy=Math.sin(angle)*projectile.baseSpeed;
    projectile.angle=angle;
    projectile.targetPoint={x:Number(point.x)||0,y:Number(point.y)||0};
    projectile.targetDistance=distance;
    projectile.travel=0;
    projectile.prevX=projectile.x;
    projectile.prevY=projectile.y;
    projectile.hitIds.clear();
    projectile.rehitAt.clear();
    if(returning?.outboundHitIds instanceof Set){
      returning.outboundHitIds.clear();
    }
    if(waypoint){
      waypoint.currentKind=String(kind||'lmb');
      waypoint.stopped=false;
      waypoint.segmentOriginX=Number(projectile.x)||0;
      waypoint.segmentOriginY=Number(projectile.y)||0;
    }
    return true;
  },
  append(context,module){
    const source=context?.source;
    const projectile=this.projectile(source,module.stateKey);
    if(!projectile||projectile.behavior?.returning?.phase==='returning')return false;
    const waypoint=this.config(projectile);
    if(!waypoint)return false;
    const now=Number(context.now)||performance.now();
    const commandKey=String(module.commandKey||module.commandKind||'waypoint');
    if(now<(Number(waypoint.commandReadyAt?.[commandKey])||0))return false;
    const point=this.targetPoint(context);
    if(!point)return false;
    const cost=Math.max(0,Number(module.commandCost)||0);
    if(context.network!==true&&cost>0&&!StaminaService.spend(source,cost,now))return false;

    const entry={
      x:point.x,y:point.y,
      attackId:String(module.commandAttackId||projectile.attack?.id||''),
      kind:String(module.commandKind||'lmb')
    };
    waypoint.commandReadyAt[commandKey]=now+Math.max(0,Number(module.commandDelay)||0);
    if(waypoint.stopped||!projectile.targetPoint){
      this.applySegment(projectile,entry.attackId,entry,entry.kind);
    }else{
      waypoint.queue.push(entry);
    }
    source.lastAttackTime=now;
    NaturalHealthRegenActivityService.mark(source,now);
    return true;
  },
  recall(source,projectile){
    const waypoint=this.config(projectile);
    if(!projectile||!waypoint)return false;
    waypoint.queue.length=0;
    waypoint.stopped=false;
    projectile.targetPoint=null;
    projectile.targetDistance=null;
    projectile.travel=0;
    return ProjectileStateService.beginReturn(projectile,{manual:true});
  },
  releaseHold(context,module){
    const source=context?.source;
    const projectile=this.projectile(source,module.stateKey);
    const key=String(module.holdStateKey||projectile?.behavior?.waypoint?.holdStateKey||'projectile-waypoint-hold');
    const state=this.holdState(source,key);
    if(!state)return false;
    this.clearHold(source,key);
    if(context.network===true&&context.senderExecuted===false)return false;
    if(!projectile||String(projectile.networkKey||'')!==String(state.projectileNetworkKey||''))return true;
    const held=Math.max(0,(Number(context.now)||performance.now())-Number(state.startedAt));
    const threshold=Math.max(1,Number(module.threshold)||Number(state.threshold)||300);
    if(held>=threshold){
      this.recall(source,projectile);
      source.lastAttackTime=performance.now();
      return true;
    }
    return this.append(context,module);
  },
  arrive(projectile){
    const waypoint=this.config(projectile);
    if(!waypoint)return false;
    if(waypoint.queue.length){
      const next=waypoint.queue.shift();
      this.applySegment(projectile,next.attackId,next,next.kind);
    }else{
      waypoint.stopped=true;
      projectile.targetPoint=null;
      projectile.targetDistance=null;
      projectile.travel=0;
      projectile.vx=0;
      projectile.vy=0;
      projectile.persistent=true;
    }
    return true;
  },
  onReturnArrive(projectile,now=performance.now()){
    const waypoint=this.config(projectile);
    const source=projectile?.source;
    if(!waypoint||!source)return false;
    if(waypoint.returnLockAttackId&&waypoint.returnLockDuration>0){
      source.cooldowns.set(
        waypoint.returnLockAttackId,
        Math.max(Number(source.cooldowns.get(waypoint.returnLockAttackId))||0,now+waypoint.returnLockDuration)
      );
    }
    this.clearHold(source,waypoint.holdStateKey);
    return true;
  },
  hasHoldGauge(entity){
    if(!entity?.actionState)return false;
    for(const state of entity.actionState.values()){
      if(state?.kind===this.HOLD_KIND)return true;
    }
    return false;
  },
  drawHoldGauge(ctx,entity,now=performance.now()){
    if(!ctx||!entity?.actionState)return false;
    if(Training.sessionMode==='online'&&!EntitySimulationAuthorityService.isLocal(entity))return false;
    for(const state of entity.actionState.values()){
      if(state?.kind!==this.HOLD_KIND)continue;
      const ratio=Math.max(0,Math.min(1,(now-Number(state.startedAt))/Math.max(1,Number(state.threshold)||300)));
      const levinaHold=
        String(state.projectileStateKey||'')==='levina-spear';

      ArcGaugePresentationService.render(ctx,entity,ratio,{
        radius:EntityRingLayoutService.chargeRadius(entity),
        color:entity.color,
        completeColor:
          levinaHold&&ratio>=1
            ?ColorService.brighten(entity.color,.45)
            :entity.color,
        lineWidth:3,
        lineCap:'butt',
        showEmpty:true,
        completeAccent:
          levinaHold&&ratio>=1,
        maxChargeFlash:
          levinaHold&&ratio>=1,
        completePulseColor:
          levinaHold
            ?ColorService.brighten(entity.color,.55)
            :entity.color,
        completePulseRadius:
          EntityRingLayoutService.maxChargeFlashRadius(
            entity,
            now
          ),
        completePulseDash:[4,3]
      });

      return true;
    }
    return false;
  },
  activeProjectile(entity){
    if(!entity?.actionState)return null;
    for(const value of entity.actionState.values()){
      if(value?.behavior?.waypoint&&ProjectileService.items.includes(value))return value;
    }
    return null;
  },
  pointerAnchor(entity){
    const projectile=this.activeProjectile(entity);
    if(!projectile)return null;
    return {
      x:Number(projectile.x)||0,
      y:Number(projectile.y)||0
    };
  },
  suppressesOwnerAimLine(entity){
    const projectile=this.activeProjectile(entity);
    if(!projectile)return false;
    return projectile.behavior?.waypoint?.presentation?.suppressOwnerAimLine===true;
  },
  drawPath(ctx,entity){
    if(!ctx||!entity||Training.player!==entity)return false;
    const projectile=this.activeProjectile(entity);
    if(!projectile||projectile.behavior?.returning?.phase==='returning')return false;
    const waypoint=this.config(projectile);
    const presentation=waypoint?.presentation||{};
    const points=[];
    if(projectile.targetPoint){
      points.push({x:Number(projectile.targetPoint.x)||0,y:Number(projectile.targetPoint.y)||0,kind:waypoint.currentKind||'lmb'});
    }
    for(const item of waypoint?.queue||[])points.push(item);

    ctx.save();
    let sx=Number(projectile.x)||0,sy=Number(projectile.y)||0;
    for(let index=0;index<points.length;index++){
      const point=points[index];
      const isRmb=String(point.kind||'lmb')==='rmb';
      const color=ColorService.rgbString(
        isRmb?(presentation.rmbColor||'230,190,50'):(presentation.lmbColor||entity.color),
        isRmb?'230,190,50':'166,59,70'
      );
      ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(point.x,point.y);
      ctx.setLineDash([6,5]);
      if(index===0){
        const originX=Number(waypoint.segmentOriginX);
        const originY=Number(waypoint.segmentOriginY);
        if(Number.isFinite(originX)&&Number.isFinite(originY)){
          const advanced=Math.hypot((Number(projectile.x)||0)-originX,(Number(projectile.y)||0)-originY);
          ctx.lineDashOffset=-(advanced%11);
        }
      }
      ctx.strokeStyle=`rgba(${color},${isRmb ? .9 : .8})`;ctx.lineWidth=2.5;ctx.stroke();
      ctx.setLineDash([]);ctx.lineDashOffset=0;
      const marker=ColorService.rgbString(
        isRmb?(presentation.waypointRmbColor||'255,220,80'):(presentation.waypointLmbColor||entity.color),
        isRmb?'255,220,80':'166,59,70'
      );
      ctx.beginPath();ctx.arc(point.x,point.y,10,0,Math.PI*2);ctx.strokeStyle=`rgba(${marker},1)`;ctx.lineWidth=2.5;ctx.stroke();
      ctx.beginPath();ctx.arc(point.x,point.y,5,0,Math.PI*2);ctx.fillStyle=`rgba(${marker},1)`;ctx.fill();
      ctx.fillStyle='rgba(0,0,0,.85)';ctx.font='bold 10px Pretendard';ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.fillText(String(index+1),point.x,point.y);
      sx=point.x;sy=point.y;
    }
    const aim=this.targetPoint({source:entity});
    if(aim){
      ctx.beginPath();ctx.moveTo(points.length?sx:Number(projectile.x)||0,points.length?sy:Number(projectile.y)||0);ctx.lineTo(aim.x,aim.y);
      ctx.strokeStyle='rgba(255,80,80,.2)';ctx.lineWidth=1.5;ctx.stroke();
    }
    ctx.restore();
    return true;
  }
});