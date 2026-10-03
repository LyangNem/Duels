

const ProjectileService={
  items:[],
  wallCollisionPadding(projectile){
    return projectile?.wallCollisionMode==='center'
      ?0
      :Math.max(0,Number(projectile?.radius)||0);
  },
  insideBounds(projectile){
    const padding=this.wallCollisionPadding(projectile);
    return (
      projectile.x-padding>=0&&
      projectile.y-padding>=0&&
      projectile.x+padding<=WorldBoundsService.width()&&
      projectile.y+padding<=WorldBoundsService.height()
    );
  },
  clampToBounds(projectile){
    const padding=this.wallCollisionPadding(projectile);
    projectile.x=Math.max(
      padding,
      Math.min(
        WorldBoundsService.width()-padding,
        projectile.x
      )
    );
    projectile.y=Math.max(
      padding,
      Math.min(
        WorldBoundsService.height()-padding,
        projectile.y
      )
    );
  },
  clear(){
    for(const projectile of this.items){
      ProjectileStateService.clear(projectile);
    }
    this.items.length=0;
  },
  removeOwnedBy(source){
    if(!source)return;

    for(let index=this.items.length-1;index>=0;index--){
      const projectile=this.items[index];
      if(projectile.source!==source)continue;

      this.finish(projectile,projectile.hadHit===true);
      this.items.splice(index,1);
    }
  },
  isInstalledProjectile(projectile){
    if(!projectile)return false;

    return !!(
      projectile.stationaryArrival||
      projectile.behavior?.waypoint||
      String(projectile.stateKey||'')||
      String(
        projectile.behavior
          ?.returning
          ?.stateKey||
        ''
      )
    );
  },
  removeInstalledOwnedBy(source){
    if(!source)return 0;

    let removed=0;

    for(
      let index=this.items.length-1;
      index>=0;
      index--
    ){
      const projectile=this.items[index];

      if(
        projectile?.source!==source||
        !this.isInstalledProjectile(
          projectile
        )
      )continue;

      this.finish(
        projectile,
        projectile.hadHit===true
      );
      this.items.splice(index,1);
      removed++;
    }

    return removed;
  },
  handleWallCollision(projectile,index,{forceBlock=false,boundary=false}={}){
    let desiredEndX=Number(projectile?.x)||0;
    let desiredEndY=Number(projectile?.y)||0;

    const policy=
      projectile.behavior?.collisionPolicy||
      CollisionPolicyService.normalize({
        passWalls:projectile.behavior?.pierce?.walls===true,
        passEnemies:projectile.behavior?.pierce?.targets===true
      });
    if(!forceBlock&&policy.passWalls)return false;

    if(!boundary){
      const startX=Number(projectile.prevX)||Number(projectile.x)||0;
      const startY=Number(projectile.prevY)||Number(projectile.y)||0;
      const endX=Number(projectile.x)||startX;
      const endY=Number(projectile.y)||startY;
      desiredEndX=endX;
      desiredEndY=endY;
      const dx=endX-startX;
      const dy=endY-startY;
      const segmentDistance=Math.hypot(dx,dy);
      const impactAngle=segmentDistance>.0001
        ?Math.atan2(dy,dx)
        :(
          Number.isFinite(Number(projectile.angle))
            ?Number(projectile.angle)
            :Math.atan2(Number(projectile.vy)||0,Number(projectile.vx)||0)
        );

      if(segmentDistance>.0001){
        const contactDistance=WorldGeometryService.raycastDistance(
          startX,
          startY,
          impactAngle,
          segmentDistance,
          this.wallCollisionPadding(projectile)
        );
        const clampedDistance=Math.max(
          0,
          Math.min(segmentDistance,contactDistance)
        );
        projectile.x=startX+Math.cos(impactAngle)*clampedDistance;
        projectile.y=startY+Math.sin(impactAngle)*clampedDistance;
        projectile.travel=Math.max(
          0,
          Number(projectile.travel)||0
        )-(segmentDistance-clampedDistance);
        projectile.prevX=projectile.x;
        projectile.prevY=projectile.y;
      }
    }

    const action=projectile.behavior?.collision?.wall||'remove';


    AttackModuleService.onProjectileWallHit(projectile);

    const arrivalWallResult=
      TargetPointProjectileService.resolveWallCollision(
        projectile,
        performance.now()
      );
    if(arrivalWallResult==='linger'){
      return true;
    }
    if(arrivalWallResult){
      this.finish(projectile,projectile.hadHit===true);
      this.items.splice(index,1);
      return true;
    }

    if(action==='clamp'){
      /*
        접촉점에서 접선 방향을 다시 raycast하면 '이미 벽에 닿아 있음' 때문에
        0거리로 판정될 수 있다. clamp는 충돌한 실제 벽면을 찾아 법선 성분만
        제거하고 접선 성분은 직접 유지한다.
      */
      if(!boundary){
        const orbitDesired=
          projectile.orbitState&&
          Number.isFinite(Number(projectile.orbitState.desiredX))&&
          Number.isFinite(Number(projectile.orbitState.desiredY))
            ?{
              x:Number(projectile.orbitState.desiredX),
              y:Number(projectile.orbitState.desiredY)
            }
            :null;

        const startX=Number(projectile.prevX)||0;
        const startY=Number(projectile.prevY)||0;
        const contactX=Number(projectile.x)||startX;
        const contactY=Number(projectile.y)||startY;
        const targetX=
          orbitDesired
            ?orbitDesired.x
            :Number(desiredEndX);
        const targetY=
          orbitDesired
            ?orbitDesired.y
            :Number(desiredEndY);
        const remainingX=targetX-contactX;
        const remainingY=targetY-contactY;
        const totalDx=targetX-startX;
        const totalDy=targetY-startY;
        const padding=this.wallCollisionPadding(projectile);
        const epsilon=1.5;

        /*
          orbit 목표점 자체가 다시 도달 가능한 위치로 돌아왔으면
          벽면을 더 따라가지 않고 즉시 원래 궤도에 재합류한다.
        */
        const recoveryDx=targetX-contactX;
        const recoveryDy=targetY-contactY;
        const recoveryDistance=Math.hypot(
          recoveryDx,
          recoveryDy
        );
        if(recoveryDistance<=.0001){
          projectile.x=targetX;
          projectile.y=targetY;
          return true;
        }
        const recoveryAngle=Math.atan2(
          recoveryDy,
          recoveryDx
        );
        const recoveryClear=
          WorldGeometryService.raycastDistance(
            contactX,
            contactY,
            recoveryAngle,
            recoveryDistance,
            padding
          );
        if(
          recoveryClear>=
          recoveryDistance-.5
        ){
          projectile.x=targetX;
          projectile.y=targetY;
          return true;
        }

        let blockingFace=null;
        let bestDistance=Infinity;

        for(const wall of DebugMapService.walls()){
          const left=Number(wall.x)-padding;
          const right=
            Number(wall.x)+
            Number(wall.w)+
            padding;
          const top=Number(wall.y)-padding;
          const bottom=
            Number(wall.y)+
            Number(wall.h)+
            padding;

          const withinY=
            contactY>=top-epsilon&&
            contactY<=bottom+epsilon;
          const withinX=
            contactX>=left-epsilon&&
            contactX<=right+epsilon;

          if(withinY&&totalDx>0){
            const distance=Math.abs(contactX-left);
            if(distance<=epsilon&&distance<bestDistance){
              blockingFace='vertical';
              bestDistance=distance;
            }
          }
          if(withinY&&totalDx<0){
            const distance=Math.abs(contactX-right);
            if(distance<=epsilon&&distance<bestDistance){
              blockingFace='vertical';
              bestDistance=distance;
            }
          }
          if(withinX&&totalDy>0){
            const distance=Math.abs(contactY-top);
            if(distance<=epsilon&&distance<bestDistance){
              blockingFace='horizontal';
              bestDistance=distance;
            }
          }
          if(withinX&&totalDy<0){
            const distance=Math.abs(contactY-bottom);
            if(distance<=epsilon&&distance<bestDistance){
              blockingFace='horizontal';
              bestDistance=distance;
            }
          }
        }

        /*
          코너처럼 두 면이 동시에 후보가 되거나 수치 오차로 면을 못 찾은 경우
          벽 안으로 더 강하게 진입하는 축만 법선으로 간주한다.
        */
        if(!blockingFace){
          blockingFace=
            Math.abs(totalDx)>=Math.abs(totalDy)
              ?'vertical'
              :'horizontal';
        }

        let slideX=contactX;
        let slideY=contactY;

        if(blockingFace==='vertical'){
          slideY+=remainingY;
        }else{
          slideX+=remainingX;
        }

        /*
          접선 이동 후 다른 벽 안으로 들어가는 경우만 최종 위치를 현재 접촉점으로
          되돌린다. 같은 벽면과의 단순 접촉은 equality라 overlap으로 보지 않는다.
        */
        let blocked=false;
        for(const wall of DebugMapService.walls()){
          if(
            slideX+padding>Number(wall.x)&&
            slideX-padding<Number(wall.x)+Number(wall.w)&&
            slideY+padding>Number(wall.y)&&
            slideY-padding<Number(wall.y)+Number(wall.h)
          ){
            blocked=true;
            break;
          }
        }

        if(!blocked){
          projectile.x=slideX;
          projectile.y=slideY;
        }
      }
      return true;
    }

    if(action==='stop'){
      projectile.vx=0;
      projectile.vy=0;
      projectile.stoppedAtWall=true;
      return true;
    }

    if(action==='return'&&projectile.behavior?.returning){
      ProjectileStateService.beginReturn(projectile,{manual:false});
      return true;
    }

    ProjectileImpactService.resolve(
      projectile,
      boundary?'boundary':'wall'
    );
    this.finish(projectile,projectile.hadHit===true);
    this.items.splice(index,1);
    return true;
  },
  spawn(data){
    const behavior=data.behavior||{
      returning:null,
      pierce:{targets:false,walls:false},
      collisionPolicy:CollisionPolicyService.normalize({
        passWalls:false,
        passEnemies:false
      }),
      collision:{wall:'remove',shape:'circle',radiusScale:1},
      presentation:null
    };

    const renderRgb=
      data.projectile?.renderColor
        ?ColorService.rgbString(
          data.projectile.renderColor,
          AttackPresentationColorService.resolve(
            data.source,
            data.attack,
            {
              presentation:
                behavior.presentation
            }
          )
        )
        :AttackPresentationColorService.resolve(
          data.source,
          data.attack,
          {
            presentation:behavior.presentation
          }
        );

    const volley=data.volley||null;
    const ordinal=Math.max(
      0,
      Math.floor(
        Number(volley?._projectileSpawnOrdinal)||0
      )
    );
    if(volley){
      volley._projectileSpawnOrdinal=ordinal+1;
    }

    const executionSequence=Math.max(
      0,
      Math.floor(
        Number(volley?.execution?.sequence)||0
      )
    );
    const networkKey=
      data.networkKey||
      `${String(data.attack?.id||'attack')}:${executionSequence}:${ordinal}`;

    const projectile={
      ...data,
      behavior,
      renderRgb,
      networkKey,
      networkMeta:
        data.networkMeta&&typeof data.networkMeta==='object'
          ?{...data.networkMeta}
          :null,
      orbitInventoryMeta:
        data.orbitInventoryMeta&&typeof data.orbitInventoryMeta==='object'
          ?{...data.orbitInventoryMeta}
          :null,
      projectileOrdinal:ordinal,
      createdAt:performance.now(),
      launchAngle:Number(data.angle)||0,
      travel:0,
      prevX:data.x,
      prevY:data.y,
      vx:Math.cos(data.angle)*data.projectile.speed,
      vy:Math.sin(data.angle)*data.projectile.speed,
      radius:data.projectile.radius,
      hitRadius:data.projectile.hitRadius,
      renderStyle:behavior.presentation||null,
      targetPoint:data.targetPoint||null,
      followTarget:
        String(
          data.projectile?.followTarget||
          'none'
        ),
      targetPreview:
        data.projectile?.targetPreview
          ?{
            ...data.projectile.targetPreview,
            style:
              data.projectile.targetPreview.style
                ?{...data.projectile.targetPreview.style}
                :null,
            pointsScratch:[]
          }
          :null,
      targetDistance:Number.isFinite(Number(data.targetDistance))
        ?Math.max(0,Number(data.targetDistance))
        :null,
      damageOnTravel:data.projectile?.damageOnTravel!==false,
      baseSpeed:Math.max(0,Number(data.projectile?.speed)||0),
      rehitInterval:Math.max(0,Number(data.projectile?.rehitInterval)||0),
      expireAtRange:
        data.projectile?.expireAtRange!==false,
      rangeExtendOnHitRatio:
        Math.max(
          0,
          Number(data.projectile?.rangeExtendOnHitRatio)||0
        ),
      baseAttackRange:
        Math.max(
          0,
          Number(data.attack?.range)||0
        ),
      maxTravelDistance:
        Math.max(
          0,
          Number(data.attack?.range)||0
        ),
      fadeResetTravel:0,
      trajectoryHitAt:new Map(),
      rehitAt:new Map(),
      hitIds:new Set(),
      homing:data.projectile?.homing||null,
      boundaryAvoidance:
        data.projectile?.boundaryAvoidance||null,
      sourceRangeLimit:
        data.projectile?.sourceRangeLimit||null,
      homingTargetReference:'',
      homingTargetSynced:false,
      homingRevision:0,
      appliedHomingRevision:0,
      homingSampleSequence:0,
      appliedHomingSampleSequence:0,
      authoritativeHomingSample:null,
      proximitySpeed:data.projectile?.proximitySpeed||null,
      speedStages:data.projectile?.speedStages||null,
      orbitState:null,
      targetRelations:
        data.projectile?.targetRelations||null,
      targetKinds:
        data.projectile?.targetKinds||null,
      targetEntityOnly:
        data.projectile?.targetEntityOnly===true,
      allowSourceTarget:
        data.projectile?.allowSourceTarget===true,
      applyHitEffects:
        data.projectile?.applyHitEffects===true,
      predictiveConsumeOnContact:
        Object.prototype.hasOwnProperty.call(
          data,
          'predictiveConsumeOnContact'
        )
          ?data.predictiveConsumeOnContact!==false
          :data.projectile?.predictiveConsumeOnContact!==false,
      friendlyRequiresResource:
        data.projectile
          ?.friendlyRequiresResource||
        null,
      supportHitEffect:
        data.projectile?.supportHitEffect||null,
      supportHitSound:
        data.projectile?.supportHitSound!==false,
      pathfindingTarget:
        data.projectile?.pathfindingTarget||null,
      targetEntityId:
        String(data.targetEntityId||''),
      pathfindingState:{
        targetId:'',
        path:[],
        pathIndex:0,
        lastPathAt:0
      },
      wallCollisionMode:
        ProjectileWallCollisionModeService.resolve(
          data.projectile,
          data.source
        ),
      persistent:
        !!behavior.returning||
        !!behavior.waypoint||
        data.projectile?.expireAtRange===false,
      hadHit:false,
      impactResolved:false,
      presentationEffectKeys:[],
      networkActionSentAt:
        data.source!==Training.player
          ?Math.max(
            0,
            Number(data.source?._networkActionSentAt)||0
          )
          :0
    };

    if(projectile.projectile?.orbit){
      ProjectileOrbitService.initialize(
        projectile,
        projectile.createdAt
      );
      ProjectileOrbitService.update(
        projectile,
        projectile.createdAt
      );
      projectile.prevX=projectile.x;
      projectile.prevY=projectile.y;
    }

    if(projectile.behavior?.waypoint){
      projectile.behavior.waypoint.currentKind=String(projectile.behavior.waypoint.currentKind||projectile.behavior.waypoint.segmentKind||'lmb');
      projectile.behavior.waypoint.stopped=false;
    }

    this.items.push(projectile);

    GameEvents.emit('projectile-fired',{
      source:projectile.source,
      attack:projectile.attack,
      projectile,
      now:performance.now()
    });

    if(projectile.renderStyle?.ropeToSource===true){
      const ropeKey=
        `projectile-rope:${projectile.source.id}:${projectile.attack.id}:${projectile.volley?.execution?.sequence||0}:${this.items.length}`;
      projectile.presentationEffectKeys.push(ropeKey);
      EffectSpawnService.spawn({
        type:'segmentRope',
        key:ropeKey,
        sourceEntityId:projectile.source.id,
        projectileRef:projectile,
        width:Math.max(
          1,
          Number(projectile.renderStyle.ropeWidth)||4
        ),
        color:
          projectile.renderStyle.ropeColor||
          '74,222,128',
        alpha:Math.max(
          0,
          Math.min(
            1,
            Number(projectile.renderStyle.ropeAlpha)||.9
          )
        ),
        lineCap:
          projectile.renderStyle.ropeLineCap||
          'round',
        start:performance.now(),
        dur:30000
      },{source:projectile.source});
    }

    if(projectile.stateKey){
      ProjectileStateService.set(
        data.source,
        projectile.stateKey,
        projectile
      );
    }else if(behavior.returning){
      ProjectileStateService.set(
        data.source,
        behavior.returning.stateKey,
        projectile
      );
    }

    if(
      Training.sessionMode==='online'&&
      data.source!==Training.player&&
      data.projectile?.networkSpawnCompensation!==false&&
      Number.isFinite(data.source?._networkActionDelayMs)
    ){
      const elapsed=Math.max(
        0,
        performance.now()-(Number(data.source._networkActionReceivedAt)||performance.now())
      );
      const remaining=Math.max(0,Number(data.source._networkActionDelayMs)-elapsed);
      const compensationFrames=Math.min(4.5,remaining/Math.max(1,GAME_DATA.frameMs));
      if(compensationFrames>.05){
        const index=this.items.indexOf(projectile);
        if(index>=0)this.updateOutbound(projectile,index,compensationFrames,performance.now());
      }
    }

    return projectile;
  },
  findByNetworkKey(owner,networkKey){
    const key=String(networkKey||'');
    if(!key)return null;

    return this.items.find(projectile=>
      projectile?.source===owner&&
      String(projectile.networkKey||'')===key
    )||null;
  },
  clearBoundField(projectile){
    if(!projectile?.source)return false;
    const instanceId=
      String(projectile.boundFieldInstanceId||'');
    if(!instanceId)return false;

    projectile.boundFieldInstanceId='';
    return InstalledAreaFieldService.clear(
      projectile.source,
      instanceId
    );
  },

  discard(projectile){
    if(!projectile)return false;
    this.clearBoundField(projectile);
    ProjectileTetherMovementService.releaseProjectile(projectile);
    RemoteProjectileHomingPresentationService.clear(projectile);
    ProjectileStateService.clear(projectile);

    for(const key of projectile?.presentationEffectKeys||[]){
      EffectSpawnService.removeKey(key);
    }

    return true;
  },
  finish(projectile,hit=false){
    this.discard(projectile);

    if(projectile&&projectile._resolvedEventEmitted!==true){
      projectile._resolvedEventEmitted=true;
      GameEvents.emit('projectile-resolved',{
        projectile,
        hit:hit===true,
        now:performance.now()
      });
    }

    const volley=projectile.volley;
    if(!volley||volley.finished)return;

    AugmentService.onProjectileResolved(projectile,hit);
    volley.resolved++;
    if(hit)volley.hits++;
    if(volley.resolved>=volley.total)volley.finished=true;
  },
  confirmTrajectoryHit(
    projectile,
    targetId='',
    now=performance.now()
  ){
    if(!projectile)return false;

    const id=String(targetId||'');
    if(!(projectile.trajectoryHitAt instanceof Map)){
      projectile.trajectoryHitAt=new Map();
    }

    const rehitInterval=Math.max(
      0,
      Number(projectile.rehitInterval)||0
    );
    const reconcileWindow=
      rehitInterval>0
        ?rehitInterval
        :120;

    if(
      id&&
      now<
        (Number(projectile.trajectoryHitAt.get(id))||0)
    ){
      if(projectile.homing?.reaimAfterPassingEnemy!==true){
        projectile.hadHit=true;
      }
      return false;
    }

    if(id){
      projectile.trajectoryHitAt.set(
        id,
        now+reconcileWindow
      );
      projectile.lastTrajectoryHitTargetReference=
        EntityTargetReferenceService.encode(
          EntityTargetReferenceService.resolve(id)||
          EntityService.items.get(id)||
          null
        )||
        id;
    }

    const delayedPassReaim=
      projectile.homing?.reaimAfterPassingEnemy===true&&
      projectile.homing?.stopAfterAligned===true;

    if(delayedPassReaim){
      const hitTarget=
        id
          ?EntityTargetReferenceService.resolve(id)
          :null;

      if(hitTarget?.alive){
        projectile.homingPassTargetReference=
          EntityTargetReferenceService.encode(hitTarget);
      }
      projectile.homingPassWasAhead=false;
      projectile.homingPassHasPassed=true;
      projectile.hadHit=false;
      projectile.homingReacquireAt=0;
    }else{
      projectile.hadHit=true;
      if(projectile.homing?.stopAfterAligned===true){
        projectile.homingReacquireAt=
          now+
          Math.max(
            0,
            Number(projectile.homing.reacquireDelayMs)||0
          );
      }
    }

    if(
      EntitySimulationAuthorityService.isLocal(
        projectile.source
      )
    ){
      projectile.homingRevision=
        Math.max(
          0,
          Math.floor(Number(projectile.homingRevision)||0)
        )+1;
      projectile.appliedHomingRevision=
        projectile.homingRevision;
    }

    if(
      EntitySimulationAuthorityService.isLocal(
        projectile.source
      )&&
      Training.sessionMode==='online'&&
      OnlineDuelService.active
    ){
      /*
        homing 전환 프레임을 상대가 25ms 주기까지 기다리지 않도록
        다음 syncLocalState 호출이 즉시 보낼 수 있게 lastStateSentAt을 비운다.
      */
      OnlineDuelService.lastStateSentAt=0;
    }

    if(projectile.rangeExtendOnHitRatio>0){
      const baseRange=Math.max(
        0,
        Number(projectile.baseAttackRange)||
        Number(projectile.attack?.range)||
        0
      );
      projectile.maxTravelDistance=
        Math.max(
          Number(projectile.maxTravelDistance)||baseRange,
          Number(projectile.travel)||0
        )+
        baseRange*
        projectile.rangeExtendOnHitRatio;
      projectile.fadeResetTravel=
        Math.max(
          0,
          Number(projectile.travel)||0
        );
    }

    return true;
  },
  confirmAuthoritativeHit(
    projectile,
    targetId='',
    now=performance.now(),
    {remoteConfirmation=false}={}
  ){
    if(!projectile)return false;

    // 통과 기반 궤도는 소유자의 실시간 기하 판정이 이미 진행시킨다.
    // 지연된 hit-confirmed를 새 접촉처럼 적용하면 다음 재조준이 초기화되고
    // 재타격 대기시간도 실제 적중이 아닌 패킷 도착 시점부터 다시 시작된다.
    // 실제 피해/숫자/onHit 처리는 NetworkHitAuthorityService에서 별도로 유지한다.
    if(
      remoteConfirmation&&
      projectile.homing?.reaimAfterPassingEnemy===true&&
      projectile.homing?.stopAfterAligned===true
    )return true;

    this.confirmTrajectoryHit(
      projectile,
      targetId,
      now
    );

    const rehitInterval=
      Math.max(
        0,
        Number(projectile.rehitInterval)||0
      );

    if(targetId){
      if(rehitInterval>0){
        projectile.rehitAt?.set(
          String(targetId),
          now+rehitInterval
        );
      }else{
        projectile.hitIds?.add(
          String(targetId)
        );
      }
    }

    return true;
  },
  hitTarget(projectile,target,phase='outbound',contactMode='static'){
    const returning=projectile.behavior?.returning;
    const hitIds=
      returning?.sharedHitIds===true
        ?projectile.hitIds
        :returning
          ?(
            phase==='returning'
              ?returning.returnHitIds
              :returning.outboundHitIds
          )
          :projectile.hitIds;

    const now=performance.now();
    const rehitInterval=Math.max(0,Number(projectile.rehitInterval)||0);
    if(rehitInterval<=0&&hitIds?.has(target.id))return false;
    if(
      rehitInterval>0&&
      now<(Number(projectile.rehitAt?.get(target.id))||0)
    )return false;

    // 재타격형 투사체는 접촉 자체가 아니라 실제 피해 틱이 공격 단위다.
    // 따라서 단발 투사체의 공간 접촉 저회는 사용하지 않고, 아래 DamagePipeline의
    // 실제 피해 시도에서만 공통 80ms 저스트 회피를 판정한다.
    if(
      rehitInterval<=0&&
      RelationService.relation(
        projectile.source,
        target
      )==='enemy'&&
      JustDodgeService.confirmProjectile(target,projectile)
    ){
      hitIds?.add(target.id);

      const dodgeArrival=
        TargetPointProjectileService.arrival(
          projectile
        );
      const continueAfterJustDodge=
        dodgeArrival?.linger?.atTarget===true&&
        dodgeArrival?.linger?.atRange===true;

      /*
        적중 시 정지하지만 빗나가면 최대 사거리까지 진행하는 투사체는
        저스트 회피 접촉을 착탄으로 소비하면 안 된다.
        hitIds만 기록해 같은 대상의 저회 판정을 반복하지 않게 하고
        실제 projectile은 현재 속도로 계속 비행한다.
      */
      if(continueAfterJustDodge){
        return false;
      }

      return true;
    }

    // 정적 충돌 없이 저스트 회피 swept 경로만 교차한 호출은 일반 피해로 승격하지 않는다.
    if(contactMode==='swept-only')return false;

    const hitExecution=rehitInterval>0
      ?AttackExecutionService.create(
        projectile.source,
        projectile.attack,
        Number(projectile.angle)||0
      )
      :projectile.volley?.execution||null;
    let resolvedImpactOrigin=null;
    if(hitExecution){
      const impactPoint={
        x:Number(projectile.x)||0,
        y:Number(projectile.y)||0
      };
      const projectileOrigin={
        x:Number(projectile.origin?.x),
        y:Number(projectile.origin?.y)
      };
      const attackImpactOrigin=
        String(
          projectile.attack?.impactOrigin||
          ''
        );
      if(
        attackImpactOrigin==='source'&&
        Number.isFinite(
          Number(projectile.source?.x)
        )&&
        Number.isFinite(
          Number(projectile.source?.y)
        )
      ){
        resolvedImpactOrigin={
          x:Number(projectile.source.x),
          y:Number(projectile.source.y)
        };
      }else if(
        projectile.projectile?.impactOriginMode===
          'projectile-origin'&&
        Number.isFinite(projectileOrigin.x)&&
        Number.isFinite(projectileOrigin.y)
      ){
        resolvedImpactOrigin=projectileOrigin;
      }else{
        resolvedImpactOrigin=impactPoint;
      }
      hitExecution.projectileImpactPoint=impactPoint;
      AttackExecutionService.setImpactOrigin(
        hitExecution,
        {
          mode:'point',
          x:resolvedImpactOrigin.x,
          y:resolvedImpactOrigin.y
        }
      );
      AttackExecutionService.setKoOrigin(
        hitExecution,
        {
          mode:'point',
          x:resolvedImpactOrigin.x,
          y:resolvedImpactOrigin.y
        }
      );
    }
    const result=AttackHitTriggerService.damage({
      source:projectile.source,
      target,
      attack:projectile.attack,
      execution:hitExecution,
      impact:{
        type:'projectile',
        origin:
          resolvedImpactOrigin||
          projectile.origin||
          null,
        point:{x:projectile.x,y:projectile.y},
        angle:Number.isFinite(projectile.angle)
          ?projectile.angle
          :Math.atan2(projectile.vy||0,projectile.vx||0),
        phase:String(phase||'outbound'),
        networkMeta:
          projectile.networkMeta&&
          typeof projectile.networkMeta==='object'
            ?{
              ...projectile.networkMeta,
              projectileKey:
                String(projectile.networkKey||'')
            }
            :(
              projectile.networkKey
                ?{
                  projectileKey:
                    String(projectile.networkKey)
                }
                :null
            )
      }
    });

    if(result.hit){
      // 온라인 공격자 화면의 원격 대상 접촉은 예측일 뿐이다. 특히 원 가장자리에서는
      // 피격자 권위 좌표와 어긋날 수 있으므로 여기서 hitIds/hadHit을 기록하거나
      // 비관통 투사체를 소비하지 않고, duel-hit-confirmed에서만 확정 처리한다.
      if(
        result.authoritative===false
      ){
        const targetArrival=
          TargetPointProjectileService.arrival(
            projectile
          );
        const authoritativeTargetLinger=
          targetArrival?.linger?.atTarget===true&&
          projectile.behavior?.collisionPolicy?.passEnemies!==true&&
          projectile.behavior?.pierce?.targets!==true;

        /*
          적중 위치에 정지/설치된 뒤 다시 회수되는 투사체는
          공격자 화면의 예측 접촉만으로 소비하면 안 된다.
          예측이 틀린 경우 시각 무기와 실제 projectile/field 좌표가 분리된다.
          target 권위 hit-confirmed가 올 때까지 정상 비행을 유지한다.
        */
        if(
          !authoritativeTargetLinger&&
          projectile.predictiveConsumeOnContact!==false&&
          projectile.behavior?.collisionPolicy?.passEnemies!==true&&
          projectile.behavior?.pierce?.targets!==true
        ){
          projectile.predictedContactTargetId=
            String(target.id||'');
          projectile.predictedContactConsumeOnly=true;
          return true;
        }
        /*
          원격 대상 접촉은 피해 권위가 아니므로 피해/CC/onHit/사거리 확장은
          여기서 확정하지 않는다. 다만 startAfterHit homing은 공격자 화면에서
          보이는 궤도 상태이므로, 실제 기하 접촉을 확인한 순간 hadHit만 켠다.
          이후 실제 피해 확정은 duel-hit-confirmed에서 기존대로 처리한다.
        */
        if(
          EntitySimulationAuthorityService.isLocal(
            projectile.source
          )&&
          (
            projectile.homing?.startAfterHit===true||
            projectile.rangeExtendOnHitRatio>0
          )
        ){
          this.confirmTrajectoryHit(
            projectile,
            target.id,
            now
          );
        }
        return false;
      }
      this.confirmAuthoritativeHit(
        projectile,
        target.id,
        now
      );

      /*
        projectile.return 투사체는 phase별 중복 적중 판정에
        outboundHitIds / returnHitIds를 사용한다.
        실제 중복 검사에 사용한 현재 phase hitIds에도 기록해야
        같은 세그먼트에서 매 프레임 반복 적중하지 않는다.
      */
      if(rehitInterval<=0){
        hitIds?.add(target.id);
      }

      if(rehitInterval>0){
        projectile.rehitAt?.set(
          target.id,
          now+rehitInterval
        );
      }

      if(
        result.authoritative!==false&&
        !result.duplicateExecutionHit
      ){
        AttackModuleService.onHit(
          projectile.source,
          target,
          projectile.attack,
          rehitInterval>0
            ?{
              execution:hitExecution,
              hits:0,
              total:1,
              resolved:0,
              finished:false
            }
            :projectile.volley,
          projectile.angle,
          {type:'delivery.projectile',phase:String(phase||'outbound'),projectile}
        );
      }

      return true;
    }

    if(result.blocked){
      if(rehitInterval<=0)hitIds?.add(target.id);
      if(rehitInterval>0){
        projectile.rehitAt?.set(
          target.id,
          now+rehitInterval
        );
      }
      return true;
    }

    if(result.dodged){
      if(rehitInterval<=0)hitIds?.add(target.id);
      // 저스트 회피/회피 보호로 막힌 실제 피해 틱도 해당 틱을 소비한다.
      // 재타격형 투사체가 다음 프레임 즉시 같은 피해를 재시도하지 않게 한다.
      if(rehitInterval>0){
        projectile.rehitAt?.set(
          target.id,
          now+rehitInterval
        );
      }

      const dodgeArrival=
        TargetPointProjectileService.arrival(
          projectile
        );
      const continueAfterDodgedTarget=
        dodgeArrival?.linger?.atTarget===true&&
        dodgeArrival?.linger?.atRange===true;

      /*
        atTarget + atRange를 함께 쓰는 지속형 투사체는
        회피된 접촉을 '착탄'으로 취급하지 않는다.
        실제 적중이 아니므로 해당 위치에 멈추거나 제거하지 않고
        원래 비행을 계속해 정상적인 atRange 종료점으로 간다.
      */
      if(continueAfterDodgedTarget){
        projectile.dodgedContactTargetId='';
        projectile.dodgedContactAt=0;
        return false;
      }

      projectile.dodgedContactTargetId=
        String(target.id||'');
      projectile.dodgedContactAt=now;
      return true;
    }

    return false;
  },
  updateStationary(
    projectile,
    index,
    now
  ){
    const state=projectile?.stationaryArrival;
    if(!state)return false;

    if(
      (
        state.arrivalReason==='target'||
        projectile.arrivalReason==='target'
      )&&
      Number.isFinite(Number(state.fixedX))&&
      Number.isFinite(Number(state.fixedY))
    ){
      projectile.x=Number(state.fixedX);
      projectile.y=Number(state.fixedY);
      projectile.prevX=projectile.x;
      projectile.prevY=projectile.y;
      projectile.vx=0;
      projectile.vy=0;
      if(Number.isFinite(Number(state.fixedTravel))){
        projectile.travel=Math.max(0,Number(state.fixedTravel));
      }
    }

    if(
      TargetPointProjectileService.sourcePickupReady(
        projectile
      )
    ){
      TargetPointProjectileService.applySourcePickupRestore(
        projectile
      );

      if(
        state.sourcePickupMode==='return'&&
        projectile.behavior?.returning
      ){
        TargetPointProjectileService.removeArrivalRange(
          projectile
        );
        ProjectileService.clearBoundField(
          projectile
        );
        projectile.stationaryArrival=null;
        ProjectileStateService.beginReturn(
          projectile,
          {manual:false}
        );
        return true;
      }

      this.finish(
        projectile,
        projectile.hadHit===true
      );
      this.items.splice(index,1);
      return true;
    }

    if(
      Number.isFinite(Number(state.endsAt))&&
      now>=Number(state.endsAt)
    ){
      this.finish(
        projectile,
        projectile.hadHit===true
      );
      this.items.splice(index,1);
      return true;
    }

    if(state.triggerOnEnter!==false){
      const target=
        TargetPointProjectileService
          .contactTarget(projectile);

      if(target){
        const triggered=
          TargetPointProjectileService
            .resolveContact(
              projectile,
              target
            );

        if(
          triggered&&
          state.removeOnTrigger!==false
        ){
          projectile.hadHit=true;
          this.finish(projectile,true);
          this.items.splice(index,1);
          return true;
        }
      }
    }

    return true;
  },

  updateOutbound(projectile,index,frameScale,now){
    if(projectile.stationaryArrival){
      return this.updateStationary(
        projectile,
        index,
        now
      );
    }

    const returning=projectile.behavior?.returning;
    const policy=
      projectile.behavior?.collisionPolicy||
      CollisionPolicyService.normalize({
        passWalls:projectile.behavior?.pierce?.walls===true,
        passEnemies:projectile.behavior?.pierce?.targets===true
      });
    const passWallsInFlight=
      policy.passWalls||
      TargetPointProjectileService.arrival(projectile)?.passWallsInFlight===true;

    projectile.prevX=projectile.x;
    projectile.prevY=projectile.y;

    const orbitActive=
      ProjectileOrbitService.update(
        projectile,
        now
      );

    const pathfinding=
      projectile.pathfindingTarget;

    if(pathfinding&&!orbitActive){
      const validTarget=target=>{
        if(
          !target?.alive||
          target.hidden
        )return false;

        const relation=
          RelationService.relation(
            projectile.source,
            target
          );
        if(
          !pathfinding.targetRelations
            ?.includes(relation)
        )return false;

        if(
          relation!=='enemy'&&
          projectile.friendlyRequiresResource
        ){
          const resource=
            String(
              projectile.friendlyRequiresResource
            );
          const maximum=
            resource==='stamina'
              ?Math.max(
                0,
                Number(target.maxStamina)||0
              )
              :resource==='health'
                ?Math.max(
                  0,
                  Number(target.maxHealth)||0
                )
                :1;
          if(maximum<=0)return false;
        }

        if(
          Array.isArray(
            pathfinding.targetKinds
          )&&
          pathfinding.targetKinds.length&&
          !pathfinding.targetKinds.includes(
            String(target.kind||'')
          )
        )return false;

        return true;
      };

      let target=
        projectile.targetEntityId
          ?EntityTargetReferenceService.resolve(
            projectile.targetEntityId
          )
          :null;

      if(
        !validTarget(target)&&
        pathfinding.retargetOnDeath===true
      ){
        target=null;
        let nearestDistance=Infinity;

        for(
          const candidate of
          EntityService.items.values()
        ){
          if(!validTarget(candidate))continue;

          const distance=Math.hypot(
            Number(candidate.x)-
              Number(projectile.x),
            Number(candidate.y)-
              Number(projectile.y)
          );

          if(distance>=nearestDistance){
            continue;
          }
          nearestDistance=distance;
          target=candidate;
        }

        projectile.targetEntityId=
          EntityTargetReferenceService.encode(
            target
          );
      }

      if(target){
        const state=
          projectile.pathfindingState||
          (
            projectile.pathfindingState={
              targetId:'',
              path:[],
              pathIndex:0,
              lastPathAt:0
            }
          );

        const targetChanged=
          state.targetId!==
          String(target.id||'');
        const pathExhausted=
          !Array.isArray(state.path)||
          state.pathIndex>=state.path.length;
        const shouldRecalculate=
          targetChanged||
          pathExhausted||
          now-
            Math.max(
              0,
              Number(state.lastPathAt)||0
            )>=
            Math.max(
              50,
              Number(pathfinding.recalcMs)||250
            );

        if(shouldRecalculate){
          const result=
            GridPathfindingService.findPath(
              projectile,
              target,
              {
                radius:
                  Math.max(
                    1,
                    Number(projectile.radius)||1
                  ),
                cellSize:
                  pathfinding.cellSize,
                maxExpansions:
                  pathfinding.maxExpansions
              }
            );

          state.targetId=
            String(target.id||'');
          state.path=
            Array.isArray(result.path)
              ?result.path
              :[];
          state.pathIndex=0;
          state.lastPathAt=now;
        }

        const threshold=
          Math.max(
            4,
            (
              Number(pathfinding.cellSize)||
              GridPathfindingService.DEFAULT_CELL
            )*.45
          );

        while(
          state.pathIndex<state.path.length
        ){
          const waypoint=
            state.path[state.pathIndex];

          if(
            Math.hypot(
              Number(waypoint.x)-
                Number(projectile.x),
              Number(waypoint.y)-
                Number(projectile.y)
            )>=threshold
          ){
            break;
          }
          state.pathIndex++;
        }

        const waypoint=
          state.pathIndex<state.path.length
            ?state.path[state.pathIndex]
            :target;
        const dx=
          Number(waypoint.x)-
          Number(projectile.x);
        const dy=
          Number(waypoint.y)-
          Number(projectile.y);
        const distance=Math.hypot(dx,dy);
        const speed=
          Math.max(
            0,
            Number(projectile.baseSpeed)||0
          );

        if(distance>.0001){
          const targetAngle=
            Math.atan2(dy,dx);
          const currentAngle=
            Number.isFinite(
              Number(projectile.angle)
            )
              ?Number(projectile.angle)
              :Math.atan2(
                Number(projectile.vy)||0,
                Number(projectile.vx)||0
              );
          const baseTurn=
            Math.max(
              0,
              Number(
                pathfinding.maxTurnPerFrame
              )||0
            );
          const nearTurn=
            Math.max(
              baseTurn,
              Number(
                pathfinding.nearMaxTurnPerFrame
              )||baseTurn
            );
          const nearRange=
            Math.max(
              0,
              Number(
                pathfinding.nearTurnRange
              )||0
            );
          const targetDistance=
            Math.hypot(
              Number(target.x)-
                Number(projectile.x),
              Number(target.y)-
                Number(projectile.y)
            );
          const nearRatio=
            nearRange>0
              ?Math.max(
                0,
                Math.min(
                  1,
                  1-targetDistance/nearRange
                )
              )
              :0;
          const maxTurn=
            (
              baseTurn+
              (nearTurn-baseTurn)*
              nearRatio
            )*
            Math.max(
              0,
              Number(frameScale)||1
            );
          let nextAngle=targetAngle;

          if(maxTurn>0){
            let difference=
              (
                targetAngle-
                currentAngle+
                Math.PI*3
              )%
              (Math.PI*2)-
              Math.PI;
            difference=
              Math.max(
                -maxTurn,
                Math.min(maxTurn,difference)
              );
            nextAngle=
              currentAngle+
              difference;
          }

          if(
            pathfinding.wallSafeSteering===true&&
            speed>0
          ){
            const lookahead=
              Math.max(
                speed*3,
                Number(
                  pathfinding.wallLookahead
                )||0,
                (
                  Number(
                    pathfinding.cellSize
                  )||
                  GridPathfindingService.DEFAULT_CELL
                )*.75
              );
            const padding=
              Math.max(
                1,
                Number(projectile.radius)||1
              );
            const clearDistance=angle=>
              WorldGeometryService.raycastDistance(
                Number(projectile.x)||0,
                Number(projectile.y)||0,
                angle,
                lookahead,
                padding
              );
            const safe=angle=>
              clearDistance(angle)>=
              lookahead-.5;

            if(!safe(nextAngle)){
              const correctionLimit=
                Math.max(
                  maxTurn,
                  Math.max(
                    0,
                    Number(
                      pathfinding
                        .wallCorrectionTurnPerFrame
                    )||0
                  )*
                  Math.max(
                    0,
                    Number(frameScale)||1
                  )
                );
              const targetDifference=
                (
                  targetAngle-
                  currentAngle+
                  Math.PI*3
                )%
                (Math.PI*2)-
                Math.PI;
              const direction=
                targetDifference>=0?1:-1;
              const needed=
                Math.min(
                  Math.abs(targetDifference),
                  correctionLimit
                );
              const startTurn=
                Math.min(
                  Math.abs(
                    nextAngle-currentAngle
                  ),
                  needed
                );
              const step=
                Math.max(
                  .015*
                  Math.max(
                    0,
                    Number(frameScale)||1
                  ),
                  (
                    needed-startTurn
                  )/6
                );
              let found=false;

              for(
                let turn=
                  startTurn+step;
                turn<=needed+.0001;
                turn+=step
              ){
                const candidateAngle=
                  currentAngle+
                  direction*
                  Math.min(turn,needed);

                if(!safe(candidateAngle)){
                  continue;
                }

                nextAngle=candidateAngle;
                found=true;
                break;
              }

              if(
                !found&&
                safe(targetAngle)&&
                Math.abs(targetDifference)<=
                  correctionLimit+.0001
              ){
                nextAngle=targetAngle;
                found=true;
              }

              if(!found){
                state.lastPathAt=0;
              }
            }
          }

          projectile.angle=nextAngle;
          projectile.vx=
            Math.cos(nextAngle)*speed;
          projectile.vy=
            Math.sin(nextAngle)*speed;
        }
      }
    }

    const homing=projectile.homing;

    /*
      일부 직선 돌진형 투사체는 실제 적중 여부와 무관하게
      앞의 적을 지나친 뒤 일정 거리까지 더 직선 비행한 다음
      다음 재조준 단계로 들어간다.
      판정은 소유자 권위에서만 만들고 기존 homing snapshot으로 복제한다.
    */
    if(
      !orbitActive&&
      homing?.reaimAfterPassingEnemy===true&&
      homing.stopAfterAligned===true&&
      projectile.homingIdleWanderState?.active!==true&&
      projectile.hadHit!==true&&
      EntitySimulationAuthorityService.isLocal(projectile.source)
    ){
      const speed=Math.hypot(
        projectile.vx||0,
        projectile.vy||0
      );

      if(speed>.0001){
        const dirX=(projectile.vx||0)/speed;
        const dirY=(projectile.vy||0)/speed;
        const requiredPassDistance=
          Math.max(
            0,
            Number(homing.passDistanceBeforeReaim)||0
          );

        let tracked=
          projectile.homingPassTargetReference
            ?EntityTargetReferenceService.resolve(
              projectile.homingPassTargetReference
            )
            :null;

        const validTarget=candidate=>
          ProjectileHomingTargetVisibilityService
            .valid(
              projectile,
              candidate,
              now
            );

        if(!validTarget(tracked)){
          tracked=null;
          projectile.homingPassTargetReference='';
          projectile.homingPassWasAhead=false;
          projectile.homingPassHasPassed=false;

          let bestForward=Infinity;
          let bestDistance=Infinity;

          for(const candidate of EntityService.items.values()){
            if(!validTarget(candidate))continue;

            const dx=
              (Number(candidate.x)||0)-
              (Number(projectile.x)||0);
            const dy=
              (Number(candidate.y)||0)-
              (Number(projectile.y)||0);
            const forward=dx*dirX+dy*dirY;
            if(forward<=0)continue;

            const distance=Math.hypot(dx,dy);
            if(
              distance>
              Math.max(
                0,
                Number(homing.searchRange)||Infinity
              )
            )continue;

            if(
              forward<bestForward-.001||
              (
                Math.abs(forward-bestForward)<=.001&&
                distance<bestDistance
              )
            ){
              tracked=candidate;
              bestForward=forward;
              bestDistance=distance;
            }
          }

          if(tracked){
            projectile.homingPassTargetReference=
              EntityTargetReferenceService.encode(tracked);
            projectile.homingPassWasAhead=true;
            projectile.homingPassHasPassed=false;
          }
        }

        if(validTarget(tracked)){
          const dx=
            (Number(tracked.x)||0)-
            (Number(projectile.x)||0);
          const dy=
            (Number(tracked.y)||0)-
            (Number(projectile.y)||0);
          const forward=dx*dirX+dy*dirY;
          const distance=Math.hypot(dx,dy);

          if(
            projectile.homingPassHasPassed!==true&&
            (
              projectile.homingPassWasAhead===true&&
              forward<=0
            )
          ){
            projectile.homingPassHasPassed=true;
            projectile.homingPassWasAhead=false;
          }else if(
            projectile.homingPassHasPassed!==true
          ){
            projectile.homingPassWasAhead=forward>0;
          }

          if(
            projectile.homingPassHasPassed===true&&
            distance>=requiredPassDistance
          ){
            projectile.hadHit=true;
            projectile.homingReacquireAt=
              now+
              Math.max(
                0,
                Number(homing.reacquireDelayMs)||0
              );
            projectile.homingPassTargetReference='';
            projectile.homingPassWasAhead=false;
            projectile.homingPassHasPassed=false;
            projectile.homingRevision=
              Math.max(
                0,
                Math.floor(
                  Number(projectile.homingRevision)||0
                )
              )+1;
            projectile.appliedHomingRevision=
              projectile.homingRevision;

            if(
              Training.sessionMode==='online'&&
              OnlineDuelService.active
            ){
              OnlineDuelService.lastStateSentAt=0;
            }
          }
        }
      }
    }

    /*
      이미 유도 중인 대상이 은신해 공격자에게 보이지 않게 되는 순간
      다음 재조준 주기를 기다리지 않고 현재 target reference를 즉시 해제한다.
      이동 벡터 자체는 그대로 두므로 마지막 방향으로 직진하고,
      이후 재유도 단계에서 보이는 대상만 다시 선택한다.
    */
    if(
      homing&&
      EntitySimulationAuthorityService.isLocal(
        projectile.source
      )&&
      projectile.homingTargetReference
    ){
      const currentHomingTarget=
        EntityTargetReferenceService.resolve(
          projectile.homingTargetReference
        );

      if(
        currentHomingTarget&&
        !ProjectileHomingTargetVisibilityService
          .valid(
            projectile,
            currentHomingTarget,
            now
          )
      ){
        projectile.homingTargetReference='';
        projectile.homingTargetSynced=false;
        projectile.homingRevision=
          Math.max(
            0,
            Math.floor(
              Number(projectile.homingRevision)||0
            )
          )+1;
        projectile.appliedHomingRevision=
          projectile.homingRevision;

        if(
          Training.sessionMode==='online'&&
          OnlineDuelService.active
        ){
          OnlineDuelService.lastStateSentAt=0;
        }
      }
    }

    /*
      감지 범위 안에 유효한 적이 하나도 없으면 소유자 주변을 배회한다.
      SummonAIService.idleWander와 같은 방식으로 주기적으로 소유자 주변 목표점을
      바꾸지만, 투사체는 pathfinding 대신 현재 조향을 사용하며 기본 탄속을 보존한다.
    */
    const idleWander=
      homing?.idleWander;
    let detectedEnemy=null;
    let detectedEnemyDistance=Infinity;

    if(homing){
      for(const candidate of EntityService.items.values()){
        if(
          !ProjectileHomingTargetVisibilityService
            .valid(
              projectile,
              candidate,
              now
            )
        )continue;

        const distance=
          Math.hypot(
            Number(candidate.x)-Number(projectile.source.x),
            Number(candidate.y)-Number(projectile.source.y)
          );

        if(distance<detectedEnemyDistance){
          detectedEnemy=candidate;
          detectedEnemyDistance=distance;
        }
      }
    }

    if(
      !orbitActive&&
      idleWander?.enabled===true&&
      EntitySimulationAuthorityService.isLocal(
        projectile.source
      )
    ){
      const state=
        projectile.homingIdleWanderState||
        (
          projectile.homingIdleWanderState={
            target:null,
            nextTargetAt:0,
            seed:0,
            active:false
          }
        );

      if(!detectedEnemy){
        const wasIdleWanderActive=
          state.active===true;
        state.active=true;

        if(
          !wasIdleWanderActive&&
          Training.sessionMode==='online'&&
          OnlineDuelService.active
        ){
          OnlineDuelService.lastStateSentAt=0;
        }

        const currentTarget=state.target;
        const reached=
          currentTarget&&
          Math.hypot(
            Number(currentTarget.x)-Number(projectile.x),
            Number(currentTarget.y)-Number(projectile.y)
          )<
          Math.max(
            18,
            Number(projectile.radius)||0
          );

        if(
          !currentTarget||
          reached||
          now>=Math.max(
            0,
            Number(state.nextTargetAt)||0
          )
        ){
          state.seed=
            (
              Math.max(
                0,
                Math.floor(
                  Number(state.seed)||0
                )
              )+1
            )%100000;

          const idSeed=
            String(
              projectile.networkKey||
              projectile.source?.id||
              ''
            )
              .split('')
              .reduce(
                (sum,ch)=>sum+ch.charCodeAt(0),
                0
              );
          const seed=state.seed+idSeed;
          const angle=
            (
              seed*2.399963229728653+
              Math.sin(seed*.731)*1.7
            )%
            (Math.PI*2);
          const mix=
            .5+
            .5*Math.sin(
              seed*1.913+.37
            );
          const minRadius=
            Math.max(
              0,
              Number(idleWander.minRadius)||0
            );
          const maxRadius=
            Math.max(
              minRadius,
              Number(idleWander.maxRadius)||minRadius
            );
          const radius=
            minRadius+
            (maxRadius-minRadius)*mix;

          const wanderPadding=
            Math.max(
              1,
              this.wallCollisionPadding(projectile)+
              Math.max(
                0,
                Number(
                  projectile.boundaryAvoidance?.margin
                )||0
              )
            );
          const worldWidth=
            Math.max(
              wanderPadding*2,
              Number(WorldBoundsService.width())||0
            );
          const worldHeight=
            Math.max(
              wanderPadding*2,
              Number(WorldBoundsService.height())||0
            );
          const rawTargetX=
            Number(projectile.source.x)+
            Math.cos(angle)*radius;
          const rawTargetY=
            Number(projectile.source.y)+
            Math.sin(angle)*radius;

          state.target={
            x:Math.max(
              wanderPadding,
              Math.min(
                worldWidth-wanderPadding,
                rawTargetX
              )
            ),
            y:Math.max(
              wanderPadding,
              Math.min(
                worldHeight-wanderPadding,
                rawTargetY
              )
            )
          };

          const intervalMix=
            .5+
            .5*Math.sin(
              seed*.413+1.2
            );
          const retargetMin=
            Math.max(
              100,
              Number(idleWander.retargetMinMs)||650
            );
          const retargetMax=
            Math.max(
              retargetMin,
              Number(idleWander.retargetMaxMs)||1350
            );
          state.nextTargetAt=
            now+
            retargetMin+
            (retargetMax-retargetMin)*
            intervalMix;
        }

        if(state.target){
          const dx=
            Number(state.target.x)-
            Number(projectile.x);
          const dy=
            Number(state.target.y)-
            Number(projectile.y);

          if(
            Math.hypot(dx,dy)>.001
          ){
            const currentAngle=
              Math.atan2(
                Number(projectile.vy)||0,
                Number(projectile.vx)||0
              );
            const targetAngle=
              Math.atan2(dy,dx);
            let difference=
              (
                targetAngle-
                currentAngle+
                Math.PI*3
              )%
              (Math.PI*2)-
              Math.PI;
            const maxTurn=
              Math.max(
                0,
                Number(idleWander.maxTurnPerFrame)||0
              )*
              Math.max(
                0,
                Number(frameScale)||0
              );
            difference=
              Math.max(
                -maxTurn,
                Math.min(
                  maxTurn,
                  difference
                )
              );

            const speed=
              idleWander.preserveBaseSpeed!==false
                ?Math.max(
                  .001,
                  Number(projectile.baseSpeed)||0
                )
                :Math.max(
                  .001,
                  Math.hypot(
                    Number(projectile.vx)||0,
                    Number(projectile.vy)||0
                  )
                );

            projectile.angle=
              currentAngle+difference;
            projectile.vx=
              Math.cos(projectile.angle)*speed;
            projectile.vy=
              Math.sin(projectile.angle)*speed;
          }
        }

        projectile.hadHit=false;
        projectile.homingReacquireAt=0;
        projectile.homingTargetReference='';
        projectile.homingTargetSynced=false;
      }else if(state.active===true){
        /*
          배회 중 적이 감지 범위에 들어오면 즉시 배회를 끝내고
          이번 프레임부터 재유도 단계로 전환한다.
        */
        state.active=false;
        state.target=null;
        state.nextTargetAt=0;
        projectile.hadHit=true;
        projectile.homingReacquireAt=0;

        if(
          Training.sessionMode==='online'&&
          OnlineDuelService.active
        ){
          OnlineDuelService.lastStateSentAt=0;
        }
      }
    }

    const idleWanderActive=
      projectile.homingIdleWanderState
        ?.active===true;

    const attackRange=Math.max(.001,Number(projectile.attack?.range)||1);
    const authoritativeHomingSample=
      projectile.authoritativeHomingSample;
    const authoritativeRemoteHoming=
      !EntitySimulationAuthorityService.isLocal(
        projectile.source
      )&&
      authoritativeHomingSample?.active===true&&
      Number.isFinite(
        Number(authoritativeHomingSample.angle)
      );

    if(
      !orbitActive&&
      homing&&
      !idleWanderActive&&
      (
        homing.startAfterHit!==true||
        projectile.hadHit===true
      )&&
      projectile.travel/attackRange>=Math.max(0,Number(homing.startTravelRatio)||0)&&
      now>=Math.max(0,Number(projectile.homingReacquireAt)||0)
    ){
      if(authoritativeRemoteHoming){
        projectile.angle=
          Number(authoritativeHomingSample.angle);
        projectile.vx=
          Number(authoritativeHomingSample.vx)||0;
        projectile.vy=
          Number(authoritativeHomingSample.vy)||0;
      }else{
      let nearest=null;
      let nearestDistance=Infinity;

      if(
        homing.preferLastHitTarget===true&&
        projectile.lastTrajectoryHitTargetReference
      ){
        const preferred=
          EntityTargetReferenceService.resolve(
            projectile.lastTrajectoryHitTargetReference
          )||
          EntityService.items.get(
            String(projectile.lastTrajectoryHitTargetReference)
          )||
          null;
        if(
          preferred?.alive&&
          ProjectileHomingTargetVisibilityService.valid(
            projectile,
            preferred,
            now
          )
        ){
          nearest=preferred;
          nearestDistance=Math.hypot(
            preferred.x-projectile.x,
            preferred.y-projectile.y
          );
        }
      }

      if(homing.targetEntityOnly===true){
        const designated=
          projectile.targetEntityId
            ?EntityTargetReferenceService.resolve(
              projectile.targetEntityId
            )
            :null;
        if(designated?.alive){
          const relation=
            RelationService.relation(
              projectile.source,
              designated
            );
          if(
            homing.targetRelations
              ?.includes(relation)&&
            (
              relation!=='enemy'||
              ProjectileHomingTargetVisibilityService
                .valid(
                  projectile,
                  designated,
                  now
                )
            )
          ){
            nearest=designated;
            nearestDistance=Math.hypot(
              designated.x-projectile.x,
              designated.y-projectile.y
            );
          }
        }
      }else{
        for(const candidate of EntityService.items.values()){
          const relation=
            RelationService.relation(
              projectile.source,
              candidate
            );
          if(
            !candidate?.alive||
            !homing.targetRelations?.includes(relation)||
            !ProjectileHomingTargetVisibilityService
              .valid(
                projectile,
                candidate,
                now
              )
          )continue;

          const distance=
            Math.hypot(
              candidate.x-projectile.x,
              candidate.y-projectile.y
            );

          const currentSpeedForSearch=
            Math.max(
              .0001,
              Math.hypot(
                Number(projectile.vx)||0,
                Number(projectile.vy)||0
              )||
              Number(projectile.baseSpeed)||0
            );
          const referenceSpeedForSearch=
            Math.max(
              .0001,
              Number(homing.turnReferenceSpeed)||
              Number(projectile.baseSpeed)||0||
              currentSpeedForSearch
            );
          const turnScaleForSearch=
            homing.preserveTurnRadius===true
              ?Math.max(
                .01,
                currentSpeedForSearch/referenceSpeedForSearch
              )
              :1;
          const turnRadiansForSearch=
            Math.max(
              .0001,
              Number(homing.maxTurnPerFrame)||0
            )*
            turnScaleForSearch;
          const turnRadiusForSearch=
            currentSpeedForSearch/turnRadiansForSearch;
          const effectiveSearchRange=
            Math.max(
              Math.max(
                0,
                Number(homing.searchRange)||0
              ),
              homing.preserveTurnRadius===true
                ?turnRadiusForSearch*2.25
                :0
            );

          if(
            distance>
            (
              effectiveSearchRange>0
                ?effectiveSearchRange
                :Infinity
            )
          )continue;

          if(distance<nearestDistance){
            nearest=candidate;
            nearestDistance=distance;
          }
        }
      }

      if(
        !nearest&&
        homing.returnWhenNoTargetOnReaim===true&&
        homing.startAfterHit===true&&
        projectile.hadHit===true&&
        EntitySimulationAuthorityService.isLocal(
          projectile.source
        )
      ){
        const startedReturn=
          ProjectileStateService.beginReturn(
            projectile,
            {manual:false}
          );

        if(startedReturn){
          projectile.homingTargetReference='';
          projectile.homingTargetSynced=false;
          projectile.homingPassTargetReference='';
          projectile.homingPassWasAhead=false;
          projectile.homingPassHasPassed=false;
          projectile.homingRevision=
            Math.max(
              0,
              Math.floor(
                Number(projectile.homingRevision)||0
              )
            )+1;
          projectile.appliedHomingRevision=
            projectile.homingRevision;

          if(
            Training.sessionMode==='online'&&
            OnlineDuelService.active
          ){
            OnlineDuelService.lastStateSentAt=0;
          }

          return false;
        }
      }

      if(
        EntitySimulationAuthorityService.isLocal(
          projectile.source
        )
      ){
        const reference=
          nearest
            ?EntityTargetReferenceService.encode(
              nearest
            )
            :'';
        if(
          reference!==projectile.homingTargetReference
        ){
          projectile.homingTargetReference=
            reference;
          projectile.homingTargetSynced=
            !!reference;
          projectile.homingRevision=
            Math.max(
              0,
              Math.floor(Number(projectile.homingRevision)||0)
            )+1;
          projectile.appliedHomingRevision=
            projectile.homingRevision;

          if(
            Training.sessionMode==='online'&&
            OnlineDuelService.active
          ){
            OnlineDuelService.lastStateSentAt=0;
          }
        }
      }

      if(nearest){
        const currentAngle=Math.atan2(projectile.vy||0,projectile.vx||0);
        const targetAngle=Math.atan2(nearest.y-projectile.y,nearest.x-projectile.x);
        let difference=((targetAngle-currentAngle)+Math.PI*3)%(Math.PI*2)-Math.PI;
        const rawDifference=difference;
        const currentSpeed=
          Math.hypot(
            projectile.vx||0,
            projectile.vy||0
          );
        const turnReferenceSpeed=
          Math.max(
            .0001,
            Number(
              homing.turnReferenceSpeed
            )||
            Number(projectile.baseSpeed)||
            currentSpeed||
            1
          );
        const turnSpeedScale=
          homing.preserveTurnRadius===true
            ?Math.max(
              .01,
              currentSpeed/
              turnReferenceSpeed
            )
            :1;
        const maxTurn=
          Math.max(
            0,
            Number(homing.maxTurnPerFrame)||0
          )*
          turnSpeedScale*
          Math.max(
            0,
            Number(frameScale)||0
          );
        difference=Math.max(-maxTurn,Math.min(maxTurn,difference));

        /*
          외곽 근처에서는 유도 회전 자체가 벽 쪽 후보 각도를 선택하지 않는다.
          shortest-turn 방향이 가까운 외곽을 향하면 반대 회전 후보의 여유를 비교하고,
          반대쪽이 더 열려 있을 때 그 방향으로 돌아간다.
        */
        const boundaryAvoidance=
          projectile.boundaryAvoidance;
        const targetReachableBeforeBoundary=
          ProjectileHomingTargetVisibilityService
            .contactBeforeBoundary(
              projectile,
              nearest,
              targetAngle
            );
        if(
          boundaryAvoidance&&
          !targetReachableBeforeBoundary&&
          maxTurn>.0001&&
          Math.abs(difference)>.0001
        ){
          const padding=
            this.wallCollisionPadding(projectile);
          const checkDistance=
            Math.max(
              padding+1,
              Number(
                boundaryAvoidance.turnBlockDistance
              )||0,
              Number(
                boundaryAvoidance.lookahead
              )||0,
              Number(
                boundaryAvoidance.margin
              )||0
            );

          if(checkDistance>0){
            const candidateAngle=
              currentAngle+difference;
            const candidateClear=
              WorldGeometryService.boundaryRayDistance(
                Number(projectile.x)||0,
                Number(projectile.y)||0,
                candidateAngle,
                checkDistance,
                padding
              );

            if(
              candidateClear<
              checkDistance-.5
            ){
              const oppositeTurn=
                -Math.sign(difference)*
                Math.min(
                  maxTurn,
                  Math.max(
                    .0001,
                    Math.abs(rawDifference)
                  )
                );
              const oppositeAngle=
                currentAngle+oppositeTurn;
              const oppositeClear=
                WorldGeometryService.boundaryRayDistance(
                  Number(projectile.x)||0,
                  Number(projectile.y)||0,
                  oppositeAngle,
                  checkDistance,
                  padding
                );

              if(
                oppositeClear>
                candidateClear+.5
              ){
                difference=oppositeTurn;
              }
            }
          }
        }

        const deceleration=Math.max(0,Number(homing.turnDecelerationPerFrame)||0);
        const minTurnSpeed=Math.max(.001,Number(homing.minTurnSpeed)||0);
        const turningSpeed=
          deceleration>0
            ?Math.max(
              minTurnSpeed,
              currentSpeed-deceleration*Math.max(0,Number(frameScale)||0)
            )
            :currentSpeed;
        projectile.angle=currentAngle+difference;
        projectile.vx=Math.cos(projectile.angle)*turningSpeed;
        projectile.vy=Math.sin(projectile.angle)*turningSpeed;
        if(
          homing.stopAfterAligned===true&&
          Math.abs(rawDifference)<=Math.max(.001,Number(homing.alignmentThreshold)||.08)
        ){
          const alignedSpeed=
            homing.restoreBaseSpeedOnAligned===true
              ?Math.max(.001,Number(projectile.baseSpeed)||turningSpeed)
              :turningSpeed;
          projectile.angle=targetAngle;
          projectile.vx=Math.cos(targetAngle)*alignedSpeed;
          projectile.vy=Math.sin(targetAngle)*alignedSpeed;
          projectile.hadHit=false;
          projectile.homingReacquireAt=0;
          projectile.homingPassTargetReference='';
          projectile.homingPassWasAhead=false;
          projectile.homingPassHasPassed=false;
          projectile.homingTargetReference='';
          projectile.homingTargetSynced=false;
          if(EntitySimulationAuthorityService.isLocal(projectile.source)){
            projectile.homingRevision=Math.max(0,Math.floor(Number(projectile.homingRevision)||0))+1;
            projectile.appliedHomingRevision=projectile.homingRevision;
            if(Training.sessionMode==='online'&&OnlineDuelService.active)OnlineDuelService.lastStateSentAt=0;
          }
        }
      }

      }
    }

    const proximity=projectile.proximitySpeed;
    if(proximity&&!orbitActive){
      let active=false;
      for(const candidate of EntityService.items.values()){
        const relation=RelationService.relation(projectile.source,candidate);
        if(!candidate?.alive||!proximity.targetRelations?.includes(relation))continue;
        if(
          Math.hypot(candidate.x-projectile.x,candidate.y-projectile.y)<=
          Math.max(0,Number(proximity.range)||0)+Math.max(0,Number(candidate.radius)||0)
        ){
          active=true;
          break;
        }
      }
      const speed=active
        ?Math.max(0,Number(proximity.active)||0)
        :Math.max(0,Number(projectile.baseSpeed)||0);
      const direction=Number.isFinite(Number(projectile.angle))
        ?Number(projectile.angle)
        :Math.atan2(projectile.vy||0,projectile.vx||0);
      projectile.vx=Math.cos(direction)*speed;
      projectile.vy=Math.sin(direction)*speed;
    }

    const followEntity=
      projectile.followTarget==='owner'
        ?EntityService.owner(
          projectile.source
        )
        :projectile.followTarget==='source'
          ?projectile.source
          :null;

    if(followEntity?.alive&&!orbitActive){
      projectile.targetPoint={
        x:Number(followEntity.x)||0,
        y:Number(followEntity.y)||0
      };

      const followDx=
        projectile.targetPoint.x-
        Number(projectile.x);
      const followDy=
        projectile.targetPoint.y-
        Number(projectile.y);
      const followDistance=
        Math.hypot(
          followDx,
          followDy
        );
      const followSpeed=
        Math.max(
          0,
          Number(projectile.projectile?.speed)||0
        );

      if(followDistance>.0001){
        projectile.vx=
          followDx/followDistance*
          followSpeed;
        projectile.vy=
          followDy/followDistance*
          followSpeed;
        projectile.angle=
          Math.atan2(
            followDy,
            followDx
          );
      }

      // 움직이는 추적 대상을 따라가므로 고정 발사 거리 대신 현재 거리로 도착 판정.
      projectile.targetDistance=null;
    }

    if(
      projectile.targetPreview&&
      projectile.targetPoint&&
      projectile.source&&
      EntitySimulationAuthorityService
        .isLocal(projectile.source)
    ){
      const preview=
        projectile.targetPreview;
      const px=
        Number(projectile.targetPoint.x)||0;
      const py=
        Number(projectile.targetPoint.y)||0;
      const radius=
        Math.max(
          0,
          Number(preview.range)||0
        );
      const points=preview.pointsScratch||(preview.pointsScratch=[]);
      const segments=48;

      for(let index=0;index<segments;index++){
        const theta=Math.PI*2*index/segments;
        let point=points[index];
        if(!point){
          point={x:0,y:0};
          points[index]=point;
        }
        point.x=px+Math.cos(theta)*radius;
        point.y=py+Math.sin(theta)*radius;
      }
      points.length=segments;

      const attackPreview=projectile.source.attackPreview||{};
      attackPreview.type=String(preview.shape||'circle');
      attackPreview.x=px;
      attackPreview.y=py;
      attackPreview.range=radius;
      attackPreview.points=points;
      attackPreview.style=preview.style||{};
      attackPreview.until=now+Math.max(GAME_DATA.frameMs*2,90);
      projectile.source.attackPreview=attackPreview;
    }

    if(
      !orbitActive&&
      Array.isArray(projectile.speedStages)&&
      projectile.speedStages.length
    ){
      const attackRange=
        Math.max(
          .001,
          Number(projectile.attack?.range)||1
        );
      const travelRatio=
        Math.max(
          0,
          Number(projectile.travel)||0
        )/attackRange;
      let stagedSpeed=
        Math.max(
          0,
          Number(projectile.baseSpeed)||0
        );

      for(const stage of projectile.speedStages){
        if(
          travelRatio+
          1e-9<
          Math.max(
            0,
            Number(stage.startTravelRatio)||0
          )
        )break;
        stagedSpeed=
          Math.max(
            0,
            Number(stage.speed)||0
          );
      }

      const direction=
        Number.isFinite(Number(projectile.angle))
          ?Number(projectile.angle)
          :Math.atan2(
            Number(projectile.vy)||0,
            Number(projectile.vx)||0
          );
      projectile.vx=
        Math.cos(direction)*stagedSpeed;
      projectile.vy=
        Math.sin(direction)*stagedSpeed;
    }

    /*
      데이터로 활성화된 투사체는 실제 이동 직전에 월드 외곽을 예측해
      바깥쪽 진행을 안쪽 방향으로 제한 회전한다.
      적 추적/직선 돌진 등 앞선 조향 결과를 덮어쓰지 않고 필요한 만큼만 보정한다.
    */
    const boundaryAvoidance=
      projectile.boundaryAvoidance;
    let boundaryContactTarget=null;

    if(
      boundaryAvoidance&&
      homing&&
      !orbitActive
    ){
      const travelAngle=
        Number.isFinite(Number(projectile.angle))
          ?Number(projectile.angle)
          :Math.atan2(
            Number(projectile.vy)||0,
            Number(projectile.vx)||0
          );

      for(const candidate of EntityService.items.values()){
        if(
          !ProjectileHomingTargetVisibilityService
            .valid(
              projectile,
              candidate,
              now
            )
        )continue;

        if(
          ProjectileHomingTargetVisibilityService
            .contactBeforeBoundary(
              projectile,
              candidate,
              travelAngle
            )
        ){
          boundaryContactTarget=candidate;
          break;
        }
      }
    }

    if(
      boundaryAvoidance&&
      !boundaryContactTarget&&
      !orbitActive&&
      projectile.behavior?.returning?.phase!=='returning'
    ){
      const speed=
        Math.hypot(
          Number(projectile.vx)||0,
          Number(projectile.vy)||0
        );

      if(speed>.0001){
        const width=
          Math.max(
            0,
            Number(WorldBoundsService.width())||0
          );
        const height=
          Math.max(
            0,
            Number(WorldBoundsService.height())||0
          );
        const padding=
          this.wallCollisionPadding(projectile);
        const margin=
          Math.max(
            padding+1,
            Number(boundaryAvoidance.margin)||0
          );
        const lookahead=
          Math.max(
            margin,
            Number(boundaryAvoidance.lookahead)||0,
            speed*
              Math.max(
                1,
                Number(frameScale)||1
              )*
              4
          );

        const x=Number(projectile.x)||0;
        const y=Number(projectile.y)||0;
        const vx=(Number(projectile.vx)||0)/speed;
        const vy=(Number(projectile.vy)||0)/speed;
        const projectedX=x+vx*lookahead;
        const projectedY=y+vy*lookahead;

        const leftClear=x-padding;
        const rightClear=width-padding-x;
        const topClear=y-padding;
        const bottomClear=height-padding-y;

        let inwardX=0;
        let inwardY=0;

        const addPressure=(
          clearance,
          projectedClearance,
          nx,
          ny,
          outwardRatio
        )=>{
          const outward=
            Math.max(
              0,
              Number(outwardRatio)||0
            );
          if(outward<=.0001)return;

          const nearRatio=
            margin>0
              ?Math.max(
                0,
                Math.min(
                  1,
                  (margin-clearance)/margin
                )
              )
              :0;
          const predictedRatio=
            lookahead>0
              ?Math.max(
                0,
                Math.min(
                  1,
                  (margin-projectedClearance)/
                  Math.max(
                    1,
                    margin+lookahead
                  )
                )
              )
              :0;
          const pressure=
            Math.max(
              nearRatio,
              predictedRatio
            )*
            outward*
            Math.max(
              0,
              Number(boundaryAvoidance.strength)||1
            );
          inwardX+=nx*pressure;
          inwardY+=ny*pressure;
        };

        addPressure(
          leftClear,
          projectedX-padding,
          1,
          0,
          Math.max(0,-vx)
        );
        addPressure(
          rightClear,
          width-padding-projectedX,
          -1,
          0,
          Math.max(0,vx)
        );
        addPressure(
          topClear,
          projectedY-padding,
          0,
          1,
          Math.max(0,-vy)
        );
        addPressure(
          bottomClear,
          height-padding-projectedY,
          0,
          -1,
          Math.max(0,vy)
        );

        const inwardLength=
          Math.hypot(inwardX,inwardY);

        if(inwardLength>.0001){
          const currentAngle=
            Math.atan2(
              Number(projectile.vy)||0,
              Number(projectile.vx)||0
            );
          const desiredAngle=
            Math.atan2(
              inwardY,
              inwardX
            );
          let difference=
            (
              desiredAngle-
              currentAngle+
              Math.PI*3
            )%
            (Math.PI*2)-
            Math.PI;
          const maxTurn=
            Math.max(
              0,
              Number(
                boundaryAvoidance.maxTurnPerFrame
              )||0
            )*
            Math.max(
              0,
              Number(frameScale)||1
            );

          difference=
            Math.max(
              -maxTurn,
              Math.min(
                maxTurn,
                difference
              )
            );

          const nextAngle=
            currentAngle+difference;
          /*
            homing 감속과 외곽 회피가 매 프레임 서로 반대 방향으로 조향해도
            회피 중에는 최소 기본 탄속을 보장한다.
          */
          const avoidanceSpeed=
            Math.max(
              speed,
              Math.max(
                .001,
                Number(projectile.baseSpeed)||0
              )
            );
          projectile.angle=nextAngle;
          projectile.vx=
            Math.cos(nextAngle)*avoidanceSpeed;
          projectile.vy=
            Math.sin(nextAngle)*avoidanceSpeed;
        }
      }
    }

    if(
      idleWanderActive&&
      EntitySimulationAuthorityService.isLocal(
        projectile.source
      )
    ){
      const idleSpeed=
        Math.max(
          .001,
          Number(projectile.baseSpeed)||0
        );
      let idleAngle=
        Number.isFinite(Number(projectile.angle))
          ?Number(projectile.angle)
          :Math.atan2(
            Number(projectile.vy)||0,
            Number(projectile.vx)||0
          );

      /*
        목표점이 안전해도 곡선으로 도는 동안 외곽을 스칠 수 있다.
        배회 중에는 실제 이동 직전 현재 진행 방향과 외곽 여유를 검사해
        외곽을 향하는 속도 성분을 즉시 안쪽으로 반사한다.
      */
      const boundary=
        projectile.boundaryAvoidance;
      if(boundary){
        const collisionPadding=
          this.wallCollisionPadding(projectile);
        const safePadding=
          Math.max(
            collisionPadding+8,
            collisionPadding+
            Math.max(
              0,
              Number(boundary.margin)||0
            )*.7
          );
        const width=
          Math.max(
            safePadding*2,
            Number(WorldBoundsService.width())||0
          );
        const height=
          Math.max(
            safePadding*2,
            Number(WorldBoundsService.height())||0
          );
        const x=Number(projectile.x)||0;
        const y=Number(projectile.y)||0;
        let dirX=Math.cos(idleAngle);
        let dirY=Math.sin(idleAngle);
        const guardDistance=
          Math.max(
            idleSpeed*
            Math.max(
              4,
              Number(frameScale)||1
            ),
            Math.max(
              36,
              Number(boundary.lookahead)||0
            )*.55
          );
        let reflected=false;

        if(
          x-safePadding<guardDistance&&
          dirX<0
        ){
          dirX=Math.abs(dirX);
          reflected=true;
        }else if(
          width-safePadding-x<
          guardDistance&&
          dirX>0
        ){
          dirX=-Math.abs(dirX);
          reflected=true;
        }

        if(
          y-safePadding<guardDistance&&
          dirY<0
        ){
          dirY=Math.abs(dirY);
          reflected=true;
        }else if(
          height-safePadding-y<
          guardDistance&&
          dirY>0
        ){
          dirY=-Math.abs(dirY);
          reflected=true;
        }

        if(reflected){
          const length=
            Math.hypot(dirX,dirY);

          if(length>.0001){
            dirX/=length;
            dirY/=length;
            idleAngle=
              Math.atan2(dirY,dirX);
          }

          const state=
            projectile.homingIdleWanderState;
          if(state){
            state.target=null;
            state.nextTargetAt=0;
          }
        }
      }

      projectile.angle=idleAngle;
      projectile.vx=
        Math.cos(idleAngle)*idleSpeed;
      projectile.vy=
        Math.sin(idleAngle)*idleSpeed;
    }

    const velocity=Math.hypot(projectile.vx,projectile.vy);
    const rawStep=velocity*frameScale;
    const pointRemaining=
      projectile.followSource===true&&
      projectile.targetPoint
        ?Math.hypot(
          Number(projectile.targetPoint.x)-Number(projectile.x),
          Number(projectile.targetPoint.y)-Number(projectile.y)
        )
        :(
          projectile.targetPoint&&
          Number.isFinite(Number(projectile.targetDistance))
            ?Math.max(
              0,
              Number(projectile.targetDistance)-projectile.travel
            )
            :null
        );
    const attackRangeRemaining=
      projectile.expireAtRange===false
        ?Infinity
        :Math.max(
          0,
          (
            Number(projectile.maxTravelDistance)||
            Number(projectile.attack?.range)||
            0
          )-
          projectile.travel
        );
    const step=pointRemaining!==null
      ?Math.min(pointRemaining,rawStep)
      :(
        returning?.stopAtRange||!returning
          ?Math.min(attackRangeRemaining,rawStep)
          :rawStep
      );

    if(step>0&&velocity>.0001){
      projectile.x+=projectile.vx/velocity*step;
      projectile.y+=projectile.vy/velocity*step;
      projectile.travel+=step;
    }

    if(AttackGuardService.intercept(projectile,index,now))return true;

    const sourceRangeLimit=
      projectile.sourceRangeLimit;
    if(
      sourceRangeLimit&&
      Number(sourceRangeLimit.range)>0&&
      projectile.source?.alive&&
      projectile.behavior?.returning?.phase!=='returning'&&
      EntitySimulationAuthorityService.isLocal(
        projectile.source
      )
    ){
      const sourceDx=
        Number(projectile.x)-
        Number(projectile.source.x);
      const sourceDy=
        Number(projectile.y)-
        Number(projectile.source.y);
      const sourceDistance=
        Math.hypot(
          sourceDx,
          sourceDy
        );
      const maximumSourceDistance=
        Math.max(
          .001,
          Number(sourceRangeLimit.range)||0
        );

      if(
        sourceDistance>=
        maximumSourceDistance
      ){
        if(sourceDistance>.0001){
          projectile.x=
            Number(projectile.source.x)+
            sourceDx/sourceDistance*
            maximumSourceDistance;
          projectile.y=
            Number(projectile.source.y)+
            sourceDy/sourceDistance*
            maximumSourceDistance;
        }

        if(
          sourceRangeLimit.returnOnReach===true&&
          projectile.behavior?.returning
        ){
          const startedReturn=
            ProjectileStateService.beginReturn(
              projectile,
              {manual:false}
            );

          if(startedReturn){
            if(
              Training.sessionMode==='online'&&
              OnlineDuelService.active
            ){
              OnlineDuelService.lastStateSentAt=0;
            }
            return false;
          }
        }
      }
    }

    if(
      authoritativeRemoteHoming&&
      authoritativeHomingSample
    ){
      const elapsedMs=
        Math.max(
          0,
          Math.min(
            100,
            now-
            Math.max(
              0,
              Number(
                authoritativeHomingSample.receivedAt
              )||now
            )
          )
        );
      const elapsedFrames=
        elapsedMs/
        Math.max(
          .001,
          Number(GAME_DATA.frameMs)||16.6667
        );
      const ownerVx=
        Number(authoritativeHomingSample.vx)||0;
      const ownerVy=
        Number(authoritativeHomingSample.vy)||0;
      const ownerSpeed=
        Math.hypot(ownerVx,ownerVy);
      const targetX=
        Number(authoritativeHomingSample.x)+
        ownerVx*elapsedFrames;
      const targetY=
        Number(authoritativeHomingSample.y)+
        ownerVy*elapsedFrames;
      const targetTravel=
        Math.max(
          0,
          Number(authoritativeHomingSample.travel)||0
        )+
        ownerSpeed*elapsedFrames;
      const errorX=
        targetX-Number(projectile.x);
      const errorY=
        targetY-Number(projectile.y);
      const errorDistance=
        Math.hypot(errorX,errorY);

      /*
        원격 소유자의 궤도 방향/속도는 즉시 따르되,
        위치 자체는 packet마다 덮어쓰지 않고 프레임 단위로 수렴시킨다.
        큰 desync만 snap해 장시간 오차 누적을 방지한다.
      */
      if(
        authoritativeHomingSample
          .idleWanderActive===true
      ){
        /*
          원격 idleWander의 실제 미러 좌표는 권위 샘플로 단순 동기화한다.
          화면에는 별도 지연 보간 버퍼를 사용하므로 이 snap은 보이지 않는다.
        */
        projectile.x=targetX;
        projectile.y=targetY;
        projectile.travel=targetTravel;
      }else if(errorDistance>=320){
        projectile.x=targetX;
        projectile.y=targetY;
        projectile.travel=targetTravel;
      }else{
        const correctionMs=
          Math.max(
            .001,
            Number(GAME_DATA.frameMs)||16.6667
          )*
          Math.max(
            .1,
            Number(frameScale)||1
          );
        const correctionAlpha=
          1-Math.exp(
            -correctionMs/70
          );

        let correctionX=
          errorX*correctionAlpha;
        let correctionY=
          errorY*correctionAlpha;

        /*
          권위 위치 수렴량이 실제 탄속보다 커지면 상대 화면에서
          느려졌다 빨라지는 것처럼 보인다. idleWander는 소유자 속도를
          그대로 보여주는 것이 중요하므로 프레임당 추가 보정량을 제한한다.
        */
        if(
          authoritativeHomingSample
            .idleWanderActive===true
        ){
          const correctionLength=
            Math.hypot(
              correctionX,
              correctionY
            );
          const maxCorrection=
            Math.max(
              .5,
              Math.max(
                .001,
                Number(projectile.baseSpeed)||ownerSpeed
              )*
              Math.max(
                .1,
                Number(frameScale)||1
              )*
              .35
            );

          if(
            correctionLength>
            maxCorrection&&
            correctionLength>.0001
          ){
            correctionX=
              correctionX/
              correctionLength*
              maxCorrection;
            correctionY=
              correctionY/
              correctionLength*
              maxCorrection;
          }
        }

        projectile.x+=correctionX;
        projectile.y+=correctionY;
        projectile.travel+=
          (
            targetTravel-
            Number(projectile.travel)
          )*
          correctionAlpha;
      }

      projectile.vx=ownerVx;
      projectile.vy=ownerVy;
      projectile.angle=
        Number(authoritativeHomingSample.angle);
    }

    // 원격 검은 표시와 피격 판정 모두 같은 프레임의 권위 궤도를 사용한다.
    RemoteProjectileHomingPresentationBufferService.syncCollision(projectile,now);

    if(!this.insideBounds(projectile)){
      this.clampToBounds(projectile);

      const boundaryArrival=
        TargetPointProjectileService.arrival(
          projectile
        );
      if(
        boundaryArrival?.linger?.atRange===true
      ){
        ProjectileImpactService.resolve(
          projectile,
          'boundary'
        );
        if(
          TargetPointProjectileService.beginLinger(
            projectile,
            now,
            'boundary'
          )
        ){
          return false;
        }
      }

      if(projectile.behavior?.waypoint){
        // waypoint 무기는 맵 경계가 수명 종료 조건이 아니다. 경계 안쪽에 고정한 뒤
        // 현재 세그먼트가 도착한 것으로 처리해 정지하거나 예약된 다음 경로를 이어간다.
        WaypointProjectileService.arrive(projectile);
        return false;
      }

      /*
        returnAtRange 무기는 outbound가 더 진행할 수 없는 월드 경계도
        사거리 종점과 같은 "귀환 시작점"으로 취급한다.
        경계 기본 wall action(remove)이 먼저 무기를 삭제하면 귀환 상태가
        시작될 기회 자체가 사라지므로 boundary wall 처리보다 우선한다.
      */
      if(
        returning&&
        (
          returning.returnAtRange===true||
          returning.returnAtBoundary===true
        )
      ){
        ProjectileStateService.beginReturn(
          projectile,
          {manual:false}
        );
        return false;
      }

      const boundaryAction=
        projectile.behavior?.collision?.wall||
        'remove';
      const boundaryHandled=
        this.handleWallCollision(
          projectile,
          index,
          {forceBlock:true,boundary:true}
        );
      return (
        boundaryHandled&&
        boundaryAction!=='clamp'
      );

    }

    const movedDx=
      Number(projectile.x)-Number(projectile.prevX);
    const movedDy=
      Number(projectile.y)-Number(projectile.prevY);
    const movedDistance=Math.hypot(movedDx,movedDy);
    const sweptWallDistance=
      movedDistance>.0001&&!passWallsInFlight
        ?WorldGeometryService.raycastDistance(
          Number(projectile.prevX)||0,
          Number(projectile.prevY)||0,
          Math.atan2(movedDy,movedDx),
          movedDistance,
          this.wallCollisionPadding(projectile)
        )
        :movedDistance;
    const sweptWallHit=
      !passWallsInFlight&&
      movedDistance>.0001&&
      sweptWallDistance<movedDistance-1e-6;
    let overlapWallHit=false;
    if(!passWallsInFlight){
      const padding=this.wallCollisionPadding(projectile);
      for(const wall of DebugMapService.walls()){
        if(
          projectile.x+padding>wall.x&&
          projectile.x-padding<wall.x+wall.w&&
          projectile.y+padding>wall.y&&
          projectile.y-padding<wall.y+wall.h
        ){
          overlapWallHit=true;
          break;
        }
      }
    }

    if(sweptWallHit||overlapWallHit){
      const wallAction=
        projectile.behavior?.collision?.wall||
        'remove';
      const wallHandled=
        this.handleWallCollision(
          projectile,
          index,
          {forceBlock:false,boundary:false}
        );
      if(
        wallHandled&&
        wallAction!=='clamp'
      ){
        return true;
      }
    }

    if(projectile.renderStyle?.renderReachability==='orbit-center-clamp'&&projectile.orbitState&&
      projectile.behavior?.collisionPolicy?.passWalls!==true&&projectile.behavior?.pierce?.walls!==true){
      const visual=ProjectileVisualPositionService.sample(projectile);
      const previous=projectile.wallReachableCollisionPoint;
      projectile.prevX=previous?previous.x:visual.x;
      projectile.prevY=previous?previous.y:visual.y;
      projectile.x=visual.x;projectile.y=visual.y;
      projectile.wallReachableCollisionPoint={x:visual.x,y:visual.y};
    }

    if(
      projectile.behavior?.waypoint?.stopped!==true&&
      (
        projectile.damageOnTravel!==false||
        projectile.projectile?.collisionTargets===true
      )
    ){
      for(const target of EntityService.items.values()){
        const relation=
          RelationService.relation(
            projectile.source,
            target
          );
        const configuredRelations=
          Array.isArray(
            projectile.targetRelations
          )
            ?projectile.targetRelations
            :null;

        if(!ProjectileTargetFilterService.allows(projectile,target))continue;

        if(projectile.targetEntityOnly===true){
          const designated=
            EntityTargetReferenceService.resolve(
              projectile.targetEntityId
            );
          if(designated!==target)continue;
        }

        if(configuredRelations){
          if(
            !target?.alive||
            (
              target.hidden&&
              relation==='enemy'
            )||
            !configuredRelations.includes(
              relation
            )
          )continue;

          if(
            relation!=='enemy'&&
            projectile.friendlyRequiresResource
          ){
            const resource=
              String(
                projectile.friendlyRequiresResource
              );
            const maximum=
              resource==='stamina'
                ?Math.max(
                  0,
                  Number(target.maxStamina)||0
                )
                :resource==='health'
                  ?Math.max(
                    0,
                    Number(target.maxHealth)||0
                  )
                  :1;
            if(maximum<=0)continue;
          }

          if(
            Array.isArray(
              projectile.targetKinds
            )&&
            projectile.targetKinds.length&&
            !projectile.targetKinds.includes(
              String(target.kind||'')
            )
          )continue;
        }else if(
          !RelationService.canTarget(
            projectile.source,
            target,
            {},
            projectile.attack
          )
        )continue;

        const overlapsTarget=
          ProjectileCollisionShapeService.hitsTarget(
            projectile,
            target
          );
        const overlapsJustDodgePath=
          relation==='enemy'&&
          !overlapsTarget&&
          Math.max(0,Number(projectile.rehitInterval)||0)<=0&&
          JustDodgeService.canConfirm(target)&&
          JustDodgeService.overlapsProjectile(
            target,
            projectile
          );

        // 저스트 회피는 프레임 끝의 정적 겹침보다 회피/투사체의 swept 경로를 먼저 인정한다.
        // 큰·느린 투사체를 한 프레임에 완전히 통과해 반대편으로 빠져나가도 경로가 교차했다면
        // 실제 접촉 시도와 동일하게 공통 confirmProjectile 경로를 통과한다.
        if(!overlapsTarget&&!overlapsJustDodgePath)continue;

        if(
          overlapsTarget&&
          projectile.applyHitEffects===true&&
          (
            relation!=='enemy'||
            projectile.attack?.effectsOnly===true
          )
        ){
          const execution=
            projectile.volley?.execution||
            AttackExecutionService.create(
              projectile.source,
              projectile.attack,
              Number(projectile.angle)||0
            );

          AttackModuleService.onHit(
            projectile.source,
            target,
            projectile.attack,
            {
              execution,
              total:1,
              resolved:0,
              hits:0,
              finished:false
            },
            Number(projectile.angle)||0,
            {
              type:'delivery.projectile',
              phase:'support',
              projectile
            }
          );
          if(projectile.supportHitSound!==false){
            SoundService.play('hit');
          }

          if(
            projectile.supportHitEffect
          ){
            const supportEffect=
              EffectSpawnService
                .definitionSnapshot(
                  projectile.supportHitEffect
                );

            EffectSpawnService.spawn(
              {
                ...supportEffect,
                type:String(
                  supportEffect.renderType||
                  supportEffect.type||
                  'areaCircle'
                ),
                x:Number(target.x)||0,
                y:Number(target.y)||0,
                sourceEntityId:
                  String(
                    projectile.source?.id||''
                  ),
                start:performance.now(),
                dur:Math.max(
                  GAME_DATA.frameMs,
                  Number(
                    supportEffect.duration
                  )||
                  Number(
                    supportEffect.durationFrames
                  )*
                  GAME_DATA.frameMs||
                  300
                )
              },
              {source:projectile.source}
            );
          }

          projectile.hitIds?.add(
            target.id
          );
          projectile.hadHit=true;
          this.finish(projectile,true);
          this.items.splice(index,1);
          return true;
        }

        const contactStatus=projectile.projectile?.contactStatus||null;
        if(overlapsTarget&&contactStatus?.status&&COMBAT_STATUS_DEFS[String(contactStatus.status)]&&NetworkHitAuthorityService.targetAuthoritative(target)){
          const relation=RelationService.relation(projectile.source,target);
          const allowed=Array.isArray(contactStatus.targetRelations)?contactStatus.targetRelations:['enemy'];
          if(allowed.includes(relation)){
            CombatStatusApplicationService.apply({
              source:projectile.source,target,type:String(contactStatus.status),duration:Math.max(0,Number(contactStatus.duration)||0),
              sourceId:`projectile-contact:${String(projectile.networkKey||projectile.id||'projectile')}:${String(contactStatus.status)}`,
              data:{...(contactStatus.data||{}),sourceEntityId:projectile.source?.id||null,stackMode:contactStatus.data?.stackMode||'replace-source'}
            });
          }
        }

        if(projectile.damageOnTravel===false){
          if(
            relation==='enemy'&&
            JustDodgeService.confirmProjectile(
              target,
              projectile
            )
          ){
            projectile.hadHit=false;
            this.finish(projectile,false);
            this.items.splice(index,1);
            return true;
          }

          // swept 저회 후보였지만 현재 정적 충돌은 아니고 저회도 확정되지 않았다면
          // 일반 착탄으로 오인하지 않는다.
          if(!overlapsTarget)continue;

          /*
            충돌 전용 투사체의 target impact는 대상 권위 화면에서만 확정한다.
            이전에는 공격자 화면의 보간된 원격 대상에 먼저 닿는 순간
            projectile.impact를 즉시 실행해 루네프 화염구처럼 실제 방패/대상
            도달 전에 폭발 FX가 생길 수 있었다.

            비권위 화면에서는 투사체만 예측 소비하고 폭발은 만들지 않는다.
            대상 권위 화면이 실제 충돌점을 확인한 뒤
            duel-projectile-impact-confirmed로 동일 impact 좌표를 전파한다.
          */
          if(
            Training.sessionMode==='online'&&
            relation==='enemy'&&
            !NetworkHitAuthorityService
              .targetAuthoritative(target)
          ){
            projectile.hadHit=false;
            this.finish(
              projectile,
              false
            );
            this.items.splice(
              index,
              1
            );
            return true;
          }

          ProjectileImpactService.resolve(
            projectile,
            'target'
          );

          if(
            Training.sessionMode==='online'&&
            relation==='enemy'&&
            NetworkHitAuthorityService
              .targetAuthoritative(target)
          ){
            OnlineDuelService
              .sendProjectileImpactConfirmed(
                projectile,
                'target'
              );
          }

          projectile.hadHit=true;
          this.finish(projectile,true);
          this.items.splice(index,1);
          return true;
        }

        const hit=this.hitTarget(
          projectile,
          target,
          'outbound',
          overlapsTarget?'static':'swept-only'
        );

        if(
          hit&&
          !policy.passEnemies
        ){
          const dodgedContact=
            String(
              projectile.dodgedContactTargetId||
              ''
            )===
            String(target.id||'')&&
            now-
              Math.max(
                0,
                Number(projectile.dodgedContactAt)||0
              )<
              Math.max(
                50,
                GAME_DATA.frameMs*3
              );

          if(dodgedContact){
            projectile.dodgedContactTargetId='';
            projectile.dodgedContactAt=0;

            /*
              회피 성공은 "접촉 소비"이지만 "적중 impact"는 아니다.
              비관통 투사체만 제거하고 폭발/장판/후속 공격은 만들지 않는다.
            */
            this.finish(
              projectile,
              false
            );
            this.items.splice(index,1);
            return true;
          }

          const targetArrival=
            TargetPointProjectileService.arrival(
              projectile
            );
          if(
            targetArrival?.linger?.atTarget===true
          ){
            projectile.predictedContactConsumeOnly=false;
            ProjectileImpactService.resolve(
              projectile,
              'target'
            );
            if(
              TargetPointProjectileService.beginLinger(
                projectile,
                now,
                'target'
              )
            ){
              if(
                Training.sessionMode==='online'&&
                relation==='enemy'&&
                NetworkHitAuthorityService.targetAuthoritative(target)
              ){
                OnlineDuelService.sendProjectileImpactConfirmed(
                  projectile,
                  'target'
                );
              }
              return false;
            }
          }

          if(
            projectile.predictedContactConsumeOnly===true
          ){
            projectile.predictedContactConsumeOnly=false;
            this.finish(
              projectile,
              false
            );
            this.items.splice(index,1);
            return true;
          }

          if(
            returning?.returnOnMiss===true&&
            projectile.hadHit!==true
          ){
            ProjectileStateService.beginReturn(projectile,{manual:false});
            return true;
          }
          ProjectileImpactService.resolve(projectile,'target');
          this.finish(
            projectile,
            projectile.hadHit===true
          );
          this.items.splice(index,1);
          return true;
        }
      }
    }

    if(
      orbitActive&&
      projectile.orbitState?.complete===true
    ){
      ProjectileImpactService.resolve(
        projectile,
        'range'
      );
      this.finish(
        projectile,
        projectile.hadHit===true
      );
      this.items.splice(index,1);
      return true;
    }

    const reachedTargetPoint=
      projectile.targetPoint&&
      (
        projectile.followSource===true
          ?Math.hypot(
            Number(projectile.targetPoint.x)-Number(projectile.x),
            Number(projectile.targetPoint.y)-Number(projectile.y)
          )<=
          Math.max(
            1,
            Number(projectile.projectile?.speed)||0
          )*
          Math.max(
            1,
            Number(frameScale)||1
          )
          :(
            Number.isFinite(Number(projectile.targetDistance))&&
            projectile.travel>=Number(projectile.targetDistance)-1e-6
          )
      );

    if(reachedTargetPoint&&projectile.behavior?.waypoint){
      projectile.x=Number(projectile.targetPoint.x)||projectile.x;
      projectile.y=Number(projectile.targetPoint.y)||projectile.y;
      WaypointProjectileService.arrive(projectile);
      return false;
    }

    if(reachedTargetPoint){
      projectile.x=Number(projectile.targetPoint.x)||projectile.x;
      projectile.y=Number(projectile.targetPoint.y)||projectile.y;
      const arrivalResult=
        TargetPointProjectileService
          .arrived(projectile);

      if(arrivalResult==='linger'){
        return false;
      }

      this.finish(
        projectile,
        arrivalResult===true
      );
      this.items.splice(index,1);
      return true;
    }

    const expiryDistance=
      orbitActive||
      projectile.followSource===true||
      projectile.expireAtRange===false
        ?Infinity
        :(
          projectile.targetPoint&&
          Number.isFinite(
            Number(projectile.targetDistance)
          )
            ?Math.max(
              0,
              Number(projectile.targetDistance)||0
            )
            :Math.max(
              0,
              Number(projectile.maxTravelDistance)||
              Number(projectile.attack?.range)||
              0
            )
        );

    const expired=
      projectile.travel>=expiryDistance||
      (
        !orbitActive&&
        (
          projectile.x<0||
          projectile.y<0||
          projectile.x>WorldBoundsService.width()||
          projectile.y>WorldBoundsService.height()
        )
      );

    if(
      expired&&
      TargetPointProjectileService
        .arrival(projectile)
        ?.linger?.atRange===true
    ){
      ProjectileImpactService.resolve(
        projectile,
        'range'
      );
      if(
        TargetPointProjectileService.beginLinger(
          projectile,
          now,
          'range'
        )
      ){
        return false;
      }
    }

    if(returning){
      if(
        returning.stopAtRange&&
        projectile.travel>=(Number(projectile.attack?.range)||0)
      ){
        projectile.vx=0;
        projectile.vy=0;
        if(returning.returnAtRange===true){
          ProjectileStateService.beginReturn(projectile,{manual:false});
        }
      }

      if(
        returning.autoAfterMs>0&&
        now>=returning.createdAt+returning.autoAfterMs
      ){
        ProjectileStateService.beginReturn(projectile,{manual:false});
      }

      return false;
    }

    if(expired){
      const arrival=
        TargetPointProjectileService.arrival(
          projectile
        );
      if(arrival?.linger?.atRange===true){
        TargetPointProjectileService.snapToRangeEnd(
          projectile,
          expiryDistance
        );
      }

      ProjectileImpactService.resolve(projectile,'range');

      if(
        arrival?.linger?.atRange===true&&
        TargetPointProjectileService.beginLinger(
          projectile,
          now,
          'range'
        )
      ){
        return false;
      }

      this.finish(projectile,projectile.hadHit===true);
      this.items.splice(index,1);
      return true;
    }

    return false;
  },
  updateReturn(projectile,index,frameScale){
    const returning=projectile.behavior?.returning;
    const source=projectile.source;

    if(!returning||!source){
      ProjectileStateService.remove(projectile);
      return true;
    }

    projectile.prevX=projectile.x;
    projectile.prevY=projectile.y;

    const dx=source.x-projectile.x;
    const dy=source.y-projectile.y;
    const distance=Math.hypot(dx,dy);

    if(distance>.001){
      const step=Math.min(
        distance,
        returning.speed*frameScale
      );
      projectile.x+=dx/distance*step;
      projectile.y+=dy/distance*step;
      projectile.angle=Math.atan2(dy,dx);
      this.clampToBounds(projectile);
    }

    if(AttackGuardService.intercept(projectile,index,performance.now()))return true;

    ProjectileTetherMovementService.updateProjectile(projectile);

    if(returning.damageOnReturn!==false)for(const target of EntityService.items.values()){
      if(!RelationService.canTarget(source,target,{},projectile.attack))continue;

      if(!ProjectileCollisionShapeService.hitsTarget(projectile,target))continue;

      this.hitTarget(projectile,target,'returning');
    }

    if(
      Math.hypot(source.x-projectile.x,source.y-projectile.y)
      <=source.radius+projectile.radius
    ){
      WaypointProjectileService.onReturnArrive(projectile,performance.now());
      if(!returning.manual&&returning.autoArrivalMovement){
        const movement=returning.autoArrivalMovement;
        const angle=Math.atan2(
          source.y-returning.returnOriginY,
          source.x-returning.returnOriginX
        );
        MovementAbilityService.start(
          source,
          {
            ...movement,
            type:'movement.move',
            control:'fixed',
            collision:{
              passWalls:String(movement.motionMode||'normal')!=='knockback',
              passEnemies:true
            }
          },
          angle,
          {angle}
        );

      }

      ProjectileStateService.remove(projectile);
      return true;
    }

    return false;
  },
  update(frameScale){
    const now=performance.now();

    TargetPointProjectileService.processSourcePickupRestores(now);

    for(let index=this.items.length-1;index>=0;index--){
      /*
        updateOutbound/updateReturn 내부에서 다른 projectile까지 제거될 수 있어
        현재 루프 index가 새 length 바깥으로 밀리는 경우가 있다.
        그 상태에서 projectile.behavior를 바로 읽으면 전투 루프 전체가 중단된다.
        배열이 줄어든 프레임의 초과 index/빈 항목은 건너뛰고 다음 프레임에서
        현재 live 배열을 다시 처리한다.
      */
      if(index>=this.items.length)continue;
      const projectile=this.items[index];
      if(!projectile)continue;

      if(ScriptedProjectileMotionService.update(projectile,frameScale,now)){
        if(this.items.includes(projectile))ProjectileImpactService.updatePath(projectile);
        continue;
      }

      const returning=projectile.behavior?.returning;

      if(returning?.phase==='returning'){
        this.updateReturn(projectile,index,frameScale);
      }else{
        this.updateOutbound(projectile,index,frameScale,now);
      }
      if(this.items[index]===projectile){
        ProjectileImpactService.updatePath(projectile);
      }
    }
  }
};