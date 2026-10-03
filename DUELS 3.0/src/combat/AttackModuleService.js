

const AttackModuleService=Object.freeze({
  progressConditionsMatch(source,target,module,context={}){
    for(const condition of module?.conditions||[]){
      if(TriggerConditionService.matches(condition,{
        ...context,
        source,
        target,
        now:Number(context.now)||performance.now()
      })!==true)return false;
    }
    return true;
  },
  applyHitProgress(source,target,module,context={}){
    if(!source||!module)return false;
    if(
      target&&
      !ProgressHitTargetPolicy.damageProgressEligible(
        target,
        context
      )
    )return false;
    const recipient=module.recipient==='target'?target:source;
    if(!recipient?.actionState)return false;
    if(module.recipient!=='target'&&!ProgressHitTargetPolicy.eligible(target))return false;
    if(!this.progressConditionsMatch(source,target,module,context))return false;
    let resolvedModule=module;
    for(const variant of module.amountVariants||[]){
      if(!this.progressConditionsMatch(source,target,variant,context))continue;
      resolvedModule={...module,amount:Number(variant.amount)||0};
      break;
    }
    if(!ProgressStateService.apply(recipient,resolvedModule))return false;
    const state=ProgressStateService.state(recipient,module.stateKey);
    const full=!!state&&(Number(state.value)||0)>=Math.max(1,Number(state.max)||1);
    const onFull=module.onFull;
    if(full&&onFull&&typeof onFull==='object'){
      const status=String(onFull.status||'');
      if(status){
        CombatStatusApplicationService.apply({
          source,
          target:recipient,
          type:status,
          duration:Math.max(0,Number(onFull.duration)||0),
          sourceId:String(onFull.sourceId||`${source.id}:progress-full:${String(module.stateKey||status)}`),
          data:{sourceEntityId:source.id,stackMode:String(onFull.stackMode||'replace-source'),presentationAppliedAt:performance.now()}
        });
      }
      if(onFull.reset===true){
        ProgressStateService.apply(recipient,{type:'state.progress',stateKey:module.stateKey,operation:'reset'});
      }
    }
    return true;
  },
  type(module){
    return typeof module==='string'?module:module?.type;
  },
  module(spec,type){
    return (spec.modules||[]).find(module=>this.type(module)===type)||null;
  },
  hasModule(spec,execution,type){
    if(this.module(spec,type))return true;
    return (execution?.extraModules||[]).some(module=>this.type(module)===type);
  },
  rangeBandModule(spec,execution,key=''){
    const modules=[
      ...(spec?.modules||[]),
      ...(execution?.extraModules||[])
    ];
    return modules.find(module=>
      this.type(module)==='damage.range-band-multiplier'&&
      (!key||String(module.conditionKey||'')===String(key))
    )||null;
  },
  hitConditionMatches(
    source,
    target,
    spec,
    execution,
    attackAngle,
    module,
    conditionContext=null
  ){
    if(
      Array.isArray(module?.conditions)&&
      !TriggerModuleService.matches(
        {
          type:'trigger',
          event:'attack.hit',
          conditions:module.conditions
        },
        'attack.hit',
        {
          source,
          target,
          attack:spec,
          execution,
          angle:Number(attackAngle)||0,
          now:performance.now(),
          beforeHitStatuses:
            conditionContext?.beforeHitStatuses||
            null
        }
      )
    )return false;

    const condition=module?.condition;
    if(!condition||typeof condition!=='object')return true;
    if(condition.type!=='damage.range-band-match')return true;
    const band=this.rangeBandModule(
      spec,
      execution,
      String(condition.key||'')
    );
    if(!band)return false;
    return DamageRangeBandService.matches(
      source,
      target,
      spec,
      {directionAngle:Number(attackAngle)||0},
      band
    );
  },
  pelletCount(spec){
    return Math.max(1,Number(this.module(spec,'pattern.scatter')?.count)||1);
  },
  deliveryCount(spec){
    const delayed=this.module(
      spec,
      'delivery.delayed-projectile-volley'
    );
    if(delayed){
      const volleys=
        Math.max(
          1,
          Math.floor(Number(delayed.count)||1)
        );
      return delayed.perVolleyPellets===true
        ?volleys*this.pelletCount(spec)
        :volleys;
    }
    return this.pelletCount(spec);
  },
  spread(spec){
    return Math.max(0,Number(this.module(spec,'pattern.scatter')?.spread)||0);
  },
  projectile(spec){
    const standardProjectile=this.module(spec,'delivery.projectile');
    const rangeProjectile=this.module(spec,'delivery.range-projectile');
    const module=standardProjectile||rangeProjectile;
    if(!module)return null;
    return {
      speed:Math.max(0,Number(module.speed)||0),
      launchDelay:Math.max(0,Number(module.delay)||0),
      targetPointTravelDuration:Math.max(
        0,
        Number(module.targetPointTravelDuration)||0
      ),
      radius:Math.max(0,Number(module.radius)||0),
      hitRadius:Math.max(
        0,
        Number(module.hitRadius)||Number(module.radius)||0
      ),
      targetPoint:
        module.targetPoint===true||
        module.targetPoint==='source'||
        module.targetPoint==='owner',
      targetPointMode:
        module.targetPoint==='owner'
          ?'owner'
          :module.targetPoint==='source'
            ?'source'
            :module.targetPoint===true
              ?'execution'
              :'none',
      targetPointMinRange:Math.max(
        0,
        Number(module.targetPointMinRange)||0
      ),
      targetPointClampToAttackRange:
        module.targetPointClampToAttackRange!==false,
      targetPointResolve:
        String(
          module.targetPointResolve||
          (
            module.targetPoint===true
              ?'nearest-open'
              :'none'
          )
        ),
      targetPointClearance:
        Math.max(
          1,
          Number(module.targetPointClearance)||2
        ),
      followTarget:
        module.followTarget==='owner'
          ?'owner'
          :module.followSource===true||
            module.followTarget==='source'
            ?'source'
            :'none',
      targetPreview:
        module.targetPreview&&
        typeof module.targetPreview==='object'
          ?{
            ...module.targetPreview,
            style:
              module.targetPreview.style&&
              typeof module.targetPreview.style==='object'
                ?{...module.targetPreview.style}
                :null
          }
          :null,
      origin:
        module.origin&&
        typeof module.origin==='object'
          ?{...module.origin}
          :null,
      impactOriginMode:
        String(
          module.impactOriginMode||
          'projectile'
        ),
      damageOnTravel:module.damageOnTravel!==false,
      collisionTargets:
        module.collisionTargets===true,
      targetRelations:
        Array.isArray(module.targetRelations)
          ?[...module.targetRelations]
          :null,
      targetKinds:
        Array.isArray(module.targetKinds)
          ?[...module.targetKinds]
          :null,
      targetEntityOnly:
        module.targetEntityOnly===true,
      allowSourceTarget:
        module.allowSourceTarget===true,
      applyHitEffects:
        module.applyHitEffects===true,
      predictiveConsumeOnContact:
        module.predictiveConsumeOnContact!==false,
      friendlyRequiresResource:
        module.friendlyRequiresResource
          ?String(
            module.friendlyRequiresResource
          )
          :null,
      supportHitEffect:
        module.supportHitEffect&&
        typeof module.supportHitEffect==='object'
          ?EffectSpawnService.definitionSnapshot(
            module.supportHitEffect
          )
          :null,
      supportHitSound:
        module.supportHitSound!==false,
      pathfindingTarget:
        module.pathfindingTarget&&
        typeof module.pathfindingTarget==='object'
          ?{
            targetRelations:
              Array.isArray(
                module.pathfindingTarget.targetRelations
              )
                ?[
                  ...module.pathfindingTarget
                    .targetRelations
                ]
                :['enemy'],
            targetKinds:
              Array.isArray(
                module.pathfindingTarget.targetKinds
              )
                ?[
                  ...module.pathfindingTarget
                    .targetKinds
                ]
                :null,
            cellSize:Math.max(
              12,
              Number(
                module.pathfindingTarget.cellSize
              )||
              GridPathfindingService.DEFAULT_CELL
            ),
            recalcMs:Math.max(
              50,
              Number(
                module.pathfindingTarget.recalcMs
              )||250
            ),
            maxExpansions:Math.max(
              100,
              Number(
                module.pathfindingTarget.maxExpansions
              )||2600
            ),
            maxTurnPerFrame:
              Math.max(
                0,
                Number(
                  module.pathfindingTarget
                    .maxTurnPerFrame
                )||0
              ),
            nearTurnRange:
              Math.max(
                0,
                Number(
                  module.pathfindingTarget
                    .nearTurnRange
                )||0
              ),
            nearMaxTurnPerFrame:
              Math.max(
                0,
                Number(
                  module.pathfindingTarget
                    .nearMaxTurnPerFrame
                )||0
              ),
            wallSafeSteering:
              module.pathfindingTarget
                .wallSafeSteering===true,
            wallLookahead:
              Math.max(
                0,
                Number(
                  module.pathfindingTarget
                    .wallLookahead
                )||0
              ),
            wallCorrectionTurnPerFrame:
              Math.max(
                0,
                Number(
                  module.pathfindingTarget
                    .wallCorrectionTurnPerFrame
                )||0
              ),
            retargetOnDeath:
              module.pathfindingTarget
                .retargetOnDeath===true
          }
          :null,
      rehitInterval:Math.max(
        0,
        Number(module.rehitInterval)||0
      ),
      expireAtRange:
        module.expireAtRange!==false,
      rangeExtendOnHitRatio:
        Math.max(
          0,
          Number(module.rangeExtendOnHitRatio)||0
        ),
      wallCollisionMode:
        module.wallCollisionMode==='center'
          ?'center'
          :module.wallCollisionMode==='radius'
            ?'radius'
            :rangeProjectile===module
              ?'center'
              :'auto',
      boundaryAvoidance:
        module.boundaryAvoidance&&
        typeof module.boundaryAvoidance==='object'
          ?{
            margin:Math.max(
              0,
              Number(module.boundaryAvoidance.margin)||0
            ),
            lookahead:Math.max(
              0,
              Number(module.boundaryAvoidance.lookahead)||0
            ),
            turnBlockDistance:Math.max(
              0,
              Number(module.boundaryAvoidance.turnBlockDistance)||0
            ),
            maxTurnPerFrame:Math.max(
              0,
              Number(module.boundaryAvoidance.maxTurnPerFrame)||0
            ),
            strength:Math.max(
              0,
              Number(module.boundaryAvoidance.strength)||1
            )
          }
          :null,
      sourceRangeLimit:
        module.sourceRangeLimit&&
        typeof module.sourceRangeLimit==='object'
          ?{
            range:Math.max(
              0,
              Number(module.sourceRangeLimit.range)||0
            ),
            returnOnReach:
              module.sourceRangeLimit.returnOnReach===true,
            presentation:
              module.sourceRangeLimit.presentation&&
              typeof module.sourceRangeLimit.presentation==='object'
                ?{
                  ownerOnly:
                    module.sourceRangeLimit.presentation.ownerOnly===true,
                  dash:Array.isArray(
                    module.sourceRangeLimit.presentation.dash
                  )
                    ?[...module.sourceRangeLimit.presentation.dash]
                    :[10,10],
                  lineWidth:Math.max(
                    .5,
                    Number(
                      module.sourceRangeLimit.presentation.lineWidth
                    )||2
                  ),
                  alpha:Math.max(
                    0,
                    Math.min(
                      1,
                      Number(
                        module.sourceRangeLimit.presentation.alpha
                      )||.4
                    )
                  )
                }
                :null
          }
          :null,
      homing:
        module.homing&&typeof module.homing==='object'
          ?{
            startAfterHit:
              module.homing.startAfterHit===true,
            stopAfterAligned:
              module.homing.stopAfterAligned===true,
            returnWhenNoTargetOnReaim:
              module.homing.returnWhenNoTargetOnReaim===true,
            reaimAfterPassingEnemy:
              module.homing.reaimAfterPassingEnemy===true,
            passDistanceBeforeReaim:
              Math.max(
                0,
                Number(module.homing.passDistanceBeforeReaim)||0
              ),
            alignmentThreshold:Math.max(.001,Number(module.homing.alignmentThreshold)||.08),
            reacquireDelayMs:Math.max(0,Number(module.homing.reacquireDelayMs)||0),
            startTravelRatio:Math.max(0,Math.min(1,Number(module.homing.startTravelRatio)||0)),
            maxTurnPerFrame:Math.max(0,Number(module.homing.maxTurnPerFrame)||0),
            preserveTurnRadius:
              module.homing.preserveTurnRadius===true,
            turnReferenceSpeed:
              Math.max(
                0,
                Number(module.homing.turnReferenceSpeed)||0
              ),
            preferLastHitTarget:
              module.homing.preferLastHitTarget===true,
            ensureLoopTravel:
              module.homing.ensureLoopTravel===true,
            loopTravelMultiplier:
              Math.max(
                1,
                Number(module.homing.loopTravelMultiplier)||1
              ),
            turnDecelerationPerFrame:Math.max(0,Number(module.homing.turnDecelerationPerFrame)||0),
            minTurnSpeed:Math.max(0,Number(module.homing.minTurnSpeed)||0),
            restoreBaseSpeedOnAligned:module.homing.restoreBaseSpeedOnAligned===true,
            searchRange:
              Number.isFinite(Number(module.homing.searchRange))
                ?Math.max(0,Number(module.homing.searchRange))
                :Infinity,
            sourceDetectionRange:
              Number.isFinite(
                Number(module.homing.sourceDetectionRange)
              )
                ?Math.max(
                  0,
                  Number(module.homing.sourceDetectionRange)
                )
                :Infinity,
            detectionPresentation:
              module.homing.detectionPresentation&&
              typeof module.homing.detectionPresentation==='object'
                ?{
                  ownerOnly:
                    module.homing.detectionPresentation.ownerOnly===true,
                  dash:Array.isArray(
                    module.homing.detectionPresentation.dash
                  )
                    ?[...module.homing.detectionPresentation.dash]
                    :[10,10],
                  lineWidth:Math.max(
                    .5,
                    Number(
                      module.homing.detectionPresentation.lineWidth
                    )||2
                  ),
                  alpha:Math.max(
                    0,
                    Math.min(
                      1,
                      Number(
                        module.homing.detectionPresentation.alpha
                      )||.4
                    )
                  )
                }
                :null,
            idleWander:
              module.homing.idleWander&&
              typeof module.homing.idleWander==='object'
                ?{
                  enabled:
                    module.homing.idleWander.enabled!==false,
                  minRadius:Math.max(
                    0,
                    Number(module.homing.idleWander.minRadius)||0
                  ),
                  maxRadius:Math.max(
                    Math.max(
                      0,
                      Number(module.homing.idleWander.minRadius)||0
                    ),
                    Number(module.homing.idleWander.maxRadius)||0
                  ),
                  retargetMinMs:Math.max(
                    100,
                    Number(module.homing.idleWander.retargetMinMs)||650
                  ),
                  retargetMaxMs:Math.max(
                    Math.max(
                      100,
                      Number(module.homing.idleWander.retargetMinMs)||650
                    ),
                    Number(module.homing.idleWander.retargetMaxMs)||1350
                  ),
                  maxTurnPerFrame:Math.max(
                    0,
                    Number(module.homing.idleWander.maxTurnPerFrame)||0
                  ),
                  preserveBaseSpeed:
                    module.homing.idleWander.preserveBaseSpeed!==false
                }
                :null,
            targetRelations:Array.isArray(module.homing.targetRelations)
              ?[...module.homing.targetRelations]
              :['enemy'],
            targetEntityOnly:
              module.homing.targetEntityOnly===true
          }
          :null,
      proximitySpeed:
        module.proximitySpeed&&typeof module.proximitySpeed==='object'
          ?{
            active:Math.max(0,Number(module.proximitySpeed.active)||0),
            range:Math.max(0,Number(module.proximitySpeed.range)||Number(module.radius)||0),
            targetRelations:Array.isArray(module.proximitySpeed.targetRelations)
              ?[...module.proximitySpeed.targetRelations]
              :['enemy']
          }
          :null,
      orbit:
        module.orbit&&
        typeof module.orbit==='object'
          ?{
            anchor:String(module.orbit.anchor||'source'),
            radiusMode:String(module.orbit.radiusMode||'fixed'),
            minRadius:Math.max(0,Number(module.orbit.minRadius)||0),
            maxRadius:Math.max(
              0,
              Number(module.orbit.maxRadius)||0
            ),
            startAngleOffset:Number(module.orbit.startAngleOffset)||0,
            totalAngle:Number(module.orbit.totalAngle)||0,
            duration:Math.max(0,Number(module.orbit.duration)||0),
            angularSpeed:Number(module.orbit.angularSpeed)||0,
            growDuration:Math.max(0,Number(module.orbit.growDuration)||0),
            holdDuration:Math.max(0,Number(module.orbit.holdDuration)||0),
            shrinkDuration:Math.max(0,Number(module.orbit.shrinkDuration)||0),
            resetHitEachRevolution:
              module.orbit.resetHitEachRevolution===true
          }
          :null,
      speedStages:
        Array.isArray(module.speedStages)
          ?module.speedStages
            .map(stage=>({
              startTravelRatio:Math.max(
                0,
                Math.min(
                  1,
                  Number(stage?.startTravelRatio)||0
                )
              ),
              speed:Math.max(
                0,
                Number(stage?.speed)||0
              )
            }))
            .sort(
              (a,b)=>
                a.startTravelRatio-
                b.startTravelRatio
            )
          :null,
      contactStatus:
        module.contactStatus&&typeof module.contactStatus==='object'
          ?{
            status:String(module.contactStatus.status||''),
            duration:Math.max(0,Number(module.contactStatus.duration)||0),
            data:module.contactStatus.data&&typeof module.contactStatus.data==='object'?{...module.contactStatus.data}:null,
            targetRelations:Array.isArray(module.contactStatus.targetRelations)
              ?[...module.contactStatus.targetRelations]
              :['enemy']
          }
          :null,
      replaceFieldStateKey:
        module.replaceFieldStateKey
          ?String(module.replaceFieldStateKey)
          :null,
      stateKey:
        module.stateKey
          ?String(module.stateKey)
          :null
    };
  },
  forEachModule(spec,execution,visitor){
    const modules=spec.modules||[];
    for(
      let index=0;
      index<modules.length;
      index++
    ){
      visitor(
        modules[index],
        `spec:${index}`
      );
    }
    const extras=execution?.extraModules||[];
    for(
      let index=0;
      index<extras.length;
      index++
    ){
      visitor(
        extras[index],
        `extra:${index}`
      );
    }
  },
  buildAngles(spec,angle){
    const count=this.pelletCount(spec);
    const spread=this.spread(spec);
    if(count===1)return [angle];

    const angles=new Array(count);
    for(let index=0;index<count;index++){
      angles[index]=angle+(index/(count-1)-.5)*spread;
    }
    return angles;
  },
  deliver(source,spec,angle,volley){
    const delayedProjectileVolley=
      this.module(
        spec,
        'delivery.delayed-projectile-volley'
      );

    for(const module of spec.modules||[]){
      const type=this.type(module);

      if(type==='summon.cluster-spawn'){
        if(EntitySimulationAuthorityService.isLocal(source)){
          const key=`cluster-spawn:${String(module.summonKey||'')}`;
          if(!volley?.execution||!AttackExecutionService.hasEffect(volley.execution,key)){
            if(volley?.execution)AttackExecutionService.markEffect(volley.execution,key);
            ClusterSummonService.spawnFromAttack(source,module,angle,volley?.execution||null);
          }
        }
        continue;
      }

      if(type==='delivery.projectile'||type==='delivery.range-projectile'){
        if(delayedProjectileVolley)continue;

        const projectile=this.projectile(spec);
        if(!projectile)continue;

        if(projectile.targetPoint){
          const rawTarget=
            projectile.targetPointMode==='owner'
              ?(
                EntityService.owner(source)
                  ?{
                    x:
                      Number(
                        EntityService.owner(source).x
                      )||0,
                    y:
                      Number(
                        EntityService.owner(source).y
                      )||0
                  }
                  :null
              )
              :projectile.targetPointMode==='source'
                ?{
                  x:Number(source.x)||0,
                  y:Number(source.y)||0
                }
                :volley?.execution?.targetPoint||null;

          if(
            !rawTarget||
            !Number.isFinite(Number(rawTarget.x))||
            !Number.isFinite(Number(rawTarget.y))
          )continue;

          if(projectile.stateKey){
            const previous=ProjectileStateService.get(
              source,
              projectile.stateKey
            );
            if(previous){
              ProjectileStateService.remove(previous);
            }
          }

          if(projectile.replaceFieldStateKey){
            InstalledAreaFieldService.clear(
              source,
              projectile.replaceFieldStateKey
            );
          }

          let originEntity=source;
          if(
            projectile.origin?.type==='summon'&&
            projectile.origin.stateKey
          ){
            originEntity=
              SummonDeployService.entity(
                source,
                String(
                  projectile.origin.stateKey
                )
              )||
              (
                projectile.origin.fallback==='source'
                  ?source
                  :null
              );
          }
          if(!originEntity)continue;

          const originX=
            Number(originEntity.x)||0;
          const originY=
            Number(originEntity.y)||0;

          const resolvedTarget={
            x:Number(rawTarget.x),
            y:Number(rawTarget.y)
          };

          const wallSnapDistance=
            Math.max(
              0,
              Number(
                projectile.arrival
                  ?.wallSnapDistance
              )||0
            );

          if(wallSnapDistance>0){
            const wallTarget=
              WorldGeometryService
                .nearestWallTarget(
                  resolvedTarget.x,
                  resolvedTarget.y,
                  wallSnapDistance
                );

            if(wallTarget){
              resolvedTarget.x=
                Number(wallTarget.point.x);
              resolvedTarget.y=
                Number(wallTarget.point.y);
            }
          }

          let dx=
            resolvedTarget.x-originX;
          let dy=
            resolvedTarget.y-originY;
          let targetDistance=
            Math.hypot(dx,dy);
          const maxDistance=
            projectile.targetPointClampToAttackRange
              ?Math.max(
                0,
                Number(spec.range)||0
              )
              :0;
          const minDistance=
            Math.min(
              maxDistance>0
                ?maxDistance
                :Infinity,
              projectile.targetPointMinRange
            );

          if(targetDistance>.001){
            const targetAngle=
              Math.atan2(dy,dx);
            if(
              maxDistance>0&&
              targetDistance>maxDistance
            ){
              targetDistance=maxDistance;
              resolvedTarget.x=
                originX+
                Math.cos(targetAngle)*
                targetDistance;
              resolvedTarget.y=
                originY+
                Math.sin(targetAngle)*
                targetDistance;
            }else if(
              minDistance>0&&
              targetDistance<minDistance
            ){
              targetDistance=minDistance;
              resolvedTarget.x=
                originX+
                Math.cos(targetAngle)*
                targetDistance;
              resolvedTarget.y=
                originY+
                Math.sin(targetAngle)*
                targetDistance;
            }
          }else if(minDistance>0){
            targetDistance=minDistance;
            resolvedTarget.x=
              originX+
              Math.cos(angle)*
              targetDistance;
            resolvedTarget.y=
              originY+
              Math.sin(angle)*
              targetDistance;
          }

          if(
            projectile.targetPointResolve===
            'nearest-open'
          ){
            const openPoint=
              WorldGeometryService.nearestOpenPoint(
                resolvedTarget.x,
                resolvedTarget.y,
                projectile.targetPointClearance
              );

            if(openPoint){
              resolvedTarget.x=
                Number(openPoint.x);
              resolvedTarget.y=
                Number(openPoint.y);
              targetDistance=Math.hypot(
                resolvedTarget.x-originX,
                resolvedTarget.y-originY
              );
            }
          }

          dx=
            resolvedTarget.x-originX;
          dy=
            resolvedTarget.y-originY;
          const targetAngle=
            targetDistance>.001
              ?Math.atan2(dy,dx)
              :angle;

          const launchProjectile={
            ...projectile,
            speed:
              projectile.targetPointTravelDuration>0&&
              targetDistance>0
                ?targetDistance/
                  Math.max(
                    1,
                    projectile.targetPointTravelDuration/
                      Math.max(1,GAME_DATA.frameMs)
                  )
                :projectile.speed
          };
          const launch=()=>{
            if(!source?.alive)return;
            ProjectileService.spawn({
              source,
              attack:spec,
              volley,
              x:originX,
              y:originY,
              origin:{
                x:originX,
                y:originY
              },
              angle:targetAngle,
              targetPoint:{
                x:resolvedTarget.x,
                y:resolvedTarget.y
              },
              targetDistance,
              stateKey:launchProjectile.stateKey,
              targetEntityId:
                volley?.execution?.targetEntityId||'',
              projectile:launchProjectile,
              behavior:ProjectileModuleService.config(spec)
            });
          };

          if(projectile.launchDelay>0){
            const interruptibleWindup=
              module.interruptOnForcedMovement!==false&&
              AttackWindupService.isTaggedAttack(
                spec
              );

            if(
              interruptibleWindup&&
              volley?.execution
            ){
              volley.execution
                .interruptibleWindupScheduled=
                true;
            }

            SimulationScheduleService.scheduleContinuation({
              at:performance.now()+projectile.launchDelay,
              source,
              interruptibleWindup,
              windupKind:
                interruptibleWindup
                  ?'delivery-projectile-delay'
                  :null,
              continue:launch
            });
          }else{
            launch();
          }
          continue;
        }

        const angles=this.buildAngles(spec,angle);
        for(let index=0;index<angles.length;index++){
          ProjectileService.spawn({
            source,
            attack:spec,
            volley,
            x:source.x,
            y:source.y,
            origin:{x:source.x,y:source.y},
            angle:angles[index],
            stateKey:projectile.stateKey,
            targetEntityId:
              volley?.execution?.targetEntityId||'',
            projectile,
            behavior:ProjectileModuleService.config(spec)
          });
        }
      }


      if(type==='delivery.target'){
        const targetId=String(volley?.execution?.targetEntityId||'');
        const target=targetId?EntityService.items.get(targetId)||null:null;
        if(target?.alive&&!target.hidden){
          const relation=RelationService.relation(source,target);
          const allowed=!Array.isArray(module.targetRelations)||module.targetRelations.includes(relation);
          if(allowed){
            const point=NetworkCollisionPositionService.point(target);
            const impact={
              type:'direct',
              directionAngle:Number(angle)||0,
              origin:{x:Number(source.x)||0,y:Number(source.y)||0},
              point:{x:Number(point.x)||0,y:Number(point.y)||0}
            };
            const result=AttackHitTriggerService.damage({
              source,target,attack:spec,execution:volley?.execution||null,impact
            });
            if(result.hit&&result.authoritative!==false&&!result.duplicateExecutionHit){
              AttackModuleService.onHit(source,target,spec,volley,angle,module);
              volley.hits++;
            }
          }
        }
        volley.resolved=volley.total;
        volley.finished=true;
        continue;
      }

      if(type==='delivery.area'){
        if(module.steppedRewind&&typeof module.steppedRewind==='object'){
          SteppedRangeRewindDeliveryService.execute(
            source,
            spec,
            angle,
            module,
            volley
          );
          continue;
        }

        const repeatCount=Math.max(
          1,
          Math.floor(Number(module.repeatCount)||1)
        );
        const repeatInterval=Math.max(
          0,
          Number(module.repeatInterval)||0
        );
        const baseAngle=
          angle+
          (Number(module.angleOffset)||0);
        const angleFrom=Number(module.repeatAngleFrom);
        const angleTo=Number(module.repeatAngleTo);
        const hasAngleSweep=
          Number.isFinite(angleFrom)&&
          Number.isFinite(angleTo);

        for(let repeatIndex=0;repeatIndex<repeatCount;repeatIndex++){
          const repeatDistanceStart=
            Number(module.repeatCenterDistanceStart);
          const repeatDistanceStep=
            Number(module.repeatCenterDistanceStep);
          const repeatCenterDistance=
            (
              Number.isFinite(repeatDistanceStart)
                ?repeatDistanceStart
                :Number(module.centerDistance)||0
            )+
            (
              Number.isFinite(repeatDistanceStep)
                ?repeatDistanceStep
                :0
            )*
            repeatIndex;

          if(
            module.repeatPathWallPolicy==='block'&&
            repeatCenterDistance>0
          ){
            const repeatCenterX=
              (Number(source.x)||0)+
              Math.cos(baseAngle)*
              repeatCenterDistance;
            const repeatCenterY=
              (Number(source.y)||0)+
              Math.sin(baseAngle)*
              repeatCenterDistance;

            if(
              WorldGeometryService.segmentBlocked(
                Number(source.x)||0,
                Number(source.y)||0,
                repeatCenterX,
                repeatCenterY,
                0
              )
            ){
              break;
            }
          }

          const executeArea=()=>{
            if(!source?.alive)return;
            const repeatProgress=
              repeatCount<=1
                ?.5
                :repeatIndex/(repeatCount-1);
            let commitBaseAngle=baseAngle;
            if(String(module.aimMode||'locked')==='live-source'){
              if(
                EntitySimulationAuthorityService.isLocal(source)&&
                source===Training.player
              ){
                const liveAngle=Training.aimAngle();
                if(Number.isFinite(liveAngle))commitBaseAngle=liveAngle;
              }else if(Number.isFinite(Number(source?._remoteAimAngle))){
                commitBaseAngle=Number(source._remoteAimAngle);
              }
            }
            const areaAngle=
              commitBaseAngle+
              (
                hasAngleSweep
                  ?angleFrom+(angleTo-angleFrom)*repeatProgress
                  :0
              );
            const areaModule={...module};
            if(Array.isArray(module.repeatSweepDirections)&&module.repeatSweepDirections.length>0){
              areaModule.sweepDirection=String(
                module.repeatSweepDirections[Math.min(repeatIndex,module.repeatSweepDirections.length-1)]||module.sweepDirection||'clockwise'
              );
            }

            if(String(module.centerMode||'')==='live-aim-point'){
              let point=volley?.execution?.targetPoint||null;
              if(
                EntitySimulationAuthorityService.isLocal(source)&&
                source===Training.player&&
                module.centerPreferExecutionTargetPoint!==true
              ){
                point=Training.mouseWorld();
              }else if(
                (!point||module.centerPreferExecutionTargetPoint!==true)&&
                source?._remoteAimTargetPoint&&
                Number.isFinite(Number(source._remoteAimTargetPoint.x))&&
                Number.isFinite(Number(source._remoteAimTargetPoint.y))
              ){
                point=source._remoteAimTargetPoint;
              }
              if(point&&Number.isFinite(Number(point.x))&&Number.isFinite(Number(point.y))){
                const sx=Number(source.x)||0,sy=Number(source.y)||0,dx=Number(point.x)-sx,dy=Number(point.y)-sy;
                const maxRange=Math.max(0,Number(module.centerMaxRange)||0),dist=Math.hypot(dx,dy),ratio=maxRange>0&&dist>maxRange?maxRange/Math.max(.001,dist):1;
                areaModule.centerPoint={x:sx+dx*ratio,y:sy+dy*ratio};
                if(String(module.centerPointResolve||'nearest-open')==='nearest-open'){
                  const openPoint=WorldGeometryService.nearestOpenPoint(
                    areaModule.centerPoint.x,
                    areaModule.centerPoint.y,
                    Math.max(1,Number(module.centerPointClearance)||1)
                  );
                  if(openPoint){
                    areaModule.centerPoint={x:Number(openPoint.x),y:Number(openPoint.y)};
                  }
                }
              }
            }

            if(
              Number.isFinite(repeatDistanceStart)||
              Number.isFinite(repeatDistanceStep)
            ){
              areaModule.centerDistance=
                repeatCenterDistance;
            }

            const areaVolley={
              ...volley,
              execution:volley.execution,
              total:1,
              resolved:0,
              hits:0,
              finished:false
            };
            AreaAttackService.execute(
              source,
              spec,
              areaAngle,
              areaModule,
              areaVolley
            );
          };

          const areaDelay=
            (
              volley.execution?.skipWindup===true
                ?0
                :Math.max(
                  0,
                  Number(module.delay)||0
                )
            )+
            repeatInterval*repeatIndex;

          if(areaDelay<=0){
            executeArea();
          }else{
            const interruptibleWindup=
              Math.max(
                0,
                Number(module.delay)||0
              )>0&&
              volley?.execution?.skipWindup!==true&&
              module.interruptOnForcedMovement!==false&&
              AttackWindupService.isTaggedAttack(
                spec
              );

            if(
              interruptibleWindup&&
              volley?.execution
            ){
              volley.execution.interruptibleWindupScheduled=true;
            }

            const continuationKey=
              interruptibleWindup
                ?AttackWindupService.nextDeliveryKey(
                  volley.execution,
                  spec
                )
                :'';

            if(
              interruptibleWindup&&
              volley?.execution?.networkReplay===true
            ){
              AttackWindupService.registerRemoteContinuation(
                source,
                continuationKey,
                executeArea
              );
            }else{
              SimulationScheduleService.scheduleContinuation({
                at:performance.now()+areaDelay,
                source,
                interruptibleWindup,
                windupKind:
                  interruptibleWindup
                    ?'delivery-area-delay'
                    :null,
                continue:()=>{
                  if(interruptibleWindup){
                    AttackWindupService.sendCommit(
                      source,
                      continuationKey
                    );
                  }
                  executeArea();
                }
              });
            }
          }
        }
      }

      if(type==='delivery.delayed-projectile-volley'){
        const volleyAttackBase=
          module.attackId
            ?AbilityService.attackById(
              source.character,
              String(module.attackId)
            )
            :spec;
        const volleyAttack=
          volleyAttackBase===spec
            ?spec
            :AugmentService.prepareAttack(
              source,
              ProgressScaledAttackService.resolve(
                source,
                volleyAttackBase
              ),
              performance.now()
            );
        if(!volleyAttack)continue;
        const count=Math.max(1,Number(module.count)||1);
        const delay=Math.max(0,Number(module.delay)||0);
        const interval=Math.max(0,Number(module.interval)||0);
        const spread=this.spread(spec);
        const muzzleOffset=Math.max(
          0,
          Number(module.perpendicularOffset)||0
        );
        const alternating=module.alternatePerpendicular===true;
        const aimMode=
          String(module.aimMode||'locked');
        const volleyBaseAngle=
          String(module.angleMode||'relative')==='absolute'
            ?Number(module.angle)||0
            :Number(angle)||0;
        const impactPoint=
          volley?.execution?.projectileImpactPoint||null;
        const volleyOriginPoint=
          String(module.originMode||'source')==='impact-point'&&
          impactPoint&&
          Number.isFinite(Number(impactPoint.x))&&
          Number.isFinite(Number(impactPoint.y))
            ?{
              x:Number(impactPoint.x),
              y:Number(impactPoint.y)
            }
            :null;
        const phaseKey=
          `delayed-volley-phase:${String(module.phaseKey||spec.id||'default')}`;
        const phase=
          Number(source.actionState?.get(phaseKey)?.phase)||0;
        const startSign=phase===0?1:-1;

        if(alternating&&source.actionState){
          source.actionState.set(
            phaseKey,
            {phase:phase===0?1:0}
          );
        }

        const perVolleyPellets=
          module.perVolleyPellets===true;
        const pelletCount=
          perVolleyPellets
            ?this.pelletCount(volleyAttack)
            :1;
        volley.total=count*pelletCount;

        // 실시간 조준형 연속 사격의 원격 재생은 최초 action angle로
        // 가짜 탄을 예약하지 않는다. 실제 탄별 각도 패킷이 생성한다.
        if(
          aimMode==='live-source'&&
          volley?.execution?.networkReplay===true
        ){
          continue;
        }

        for(let index=0;index<count;index++){
          if(perVolleyPellets){
            const angles=this.buildAngles(volleyAttack,volleyBaseAngle);
            for(let pelletIndex=0;pelletIndex<angles.length;pelletIndex++){
              const sideRatio=
                angles.length<=1
                  ?0
                  :(pelletIndex/(angles.length-1))*2-1;

              SimulationScheduleService.scheduleProjectile({
                at:performance.now()+delay+interval*index,
                source,
                attack:volleyAttack,
                volley,
                angle:angles[pelletIndex],
                aimMode,
                shotIndex:index*angles.length+pelletIndex,
                originPoint:volleyOriginPoint,
                perpendicularOffset:
                  muzzleOffset*sideRatio
              });
            }
            continue;
          }

          const angleOffsets=Array.isArray(module.angleOffsets)?module.angleOffsets:null;
          const explicitOffset=angleOffsets&&Number.isFinite(Number(angleOffsets[index]))
            ?Number(angleOffsets[index])
            :null;
          const offset=explicitOffset!==null
            ?explicitOffset
            :(count===1?0:(index/(count-1)-.5)*spread);
          const sideSign=
            alternating
              ?startSign*(index%2===0?1:-1)
              :0;
          const perpendicularOffsets=
            Array.isArray(module.perpendicularOffsets)
              ?module.perpendicularOffsets
              :null;
          const explicitPerpendicular=
            perpendicularOffsets&&
            Number.isFinite(
              Number(perpendicularOffsets[index])
            )
              ?Number(perpendicularOffsets[index])
              :null;
          const perShotProjectileOverrides=
            Array.isArray(
              module.perShotProjectileOverrides
            )
              ?module.perShotProjectileOverrides
              :null;
          const projectileOverride=
            perShotProjectileOverrides&&
            perShotProjectileOverrides[index]&&
            typeof perShotProjectileOverrides[index]==='object'
              ?perShotProjectileOverrides[index]
              :null;

          SimulationScheduleService.scheduleProjectile({
            at:performance.now()+delay+interval*index,
            source,
            attack:volleyAttack,
            volley,
            angle:volleyBaseAngle+offset,
            aimMode,
            shotIndex:index,
            originPoint:volleyOriginPoint,
            projectileOverride,
            perpendicularOffset:
              explicitPerpendicular!==null
                ?explicitPerpendicular
                :muzzleOffset*sideSign
          });
        }
      }
    }
  },
  spawnAttackEffect(source,spec,angle,execution,module,hitTarget=null){
    if(!EffectSpawnService.shouldPresentAttack(source,execution||{}))return null;

    const now=performance.now();
    const targetPoint=execution?.targetPoint||null;
    const renderType=
      String(module.renderType||'effectShape');
    const linkedStateKey=
      String(module.stateKey||'');
    const effectKey=
      linkedStateKey&&execution
        ?`attack-effect:${source.id}:${execution.sequence}:${linkedStateKey}`
        :null;

    const deliveryAreas=
      (spec.modules||[]).filter(
        candidate=>
          this.type(candidate)==='delivery.area'
      );
    const requestedPerpendicularOffset=
      Number(module.perpendicularOffset);
    const topLevelArea=
      Number.isFinite(
        requestedPerpendicularOffset
      )
        ?(
          deliveryAreas.find(
            candidate=>
              Math.abs(
                (Number(candidate.perpendicularOffset)||0)-
                requestedPerpendicularOffset
              )<.001
          )||
          deliveryAreas[0]||
          null
        )
        :(
          deliveryAreas[0]||
          null
        );
    const nestedDamageArea=
      module.damage?.module&&
      AttackModuleService.type(module.damage.module)==='delivery.area'
        ?module.damage.module
        :null;
    const rawArea=
      topLevelArea||
      nestedDamageArea;
    const attackCenter=
      module.position==='hit-target'&&hitTarget
        ?hitTarget
        :module.position==='impact-point'
          ?(
            execution?.projectileImpactPoint||
            execution?.impactOrigin||
            targetPoint||
            source
          )
          :module.position==='attack-center'
            ?(
              execution?.projectileImpactPoint||
              (
                rawArea
                  ?AreaGeometryService.center(
                    source,
                    rawArea,
                    angle
                  )
                  :null
              )||
              (
                targetPoint&&
                Number.isFinite(Number(targetPoint.x))&&
                Number.isFinite(Number(targetPoint.y))
                  ?targetPoint
                  :null
              )||
              source
            )
            :source;

    const attackCenterOffset=
      Number(module.perpendicularOffset)||0;
    const attackCenterX=
      (Number(attackCenter.x)||0)-
      Math.sin(Number(angle)||0)*
      attackCenterOffset;
    const attackCenterY=
      (Number(attackCenter.y)||0)+
      Math.cos(Number(angle)||0)*
      attackCenterOffset;

    const effectAngle=
      String(module.angleMode||'relative')==='absolute'
        ?(Number(module.angle)||0)+(Number(module.angleOffset)||0)
        :(Number(angle)||0)+(Number(module.angleOffset)||0);
    const fixedDistance=
      Math.max(0,Number(module.distance)||0);
    const fixedTargetDistance=
      module.fixedDistanceTarget===true&&
      String(module.wallPolicy||'ignore')==='block'
        ?WorldGeometryService.raycastDistance(
          Number(source.x)||0,
          Number(source.y)||0,
          effectAngle,
          fixedDistance,
          2
        )
        :fixedDistance;

    const areaCenterDistance=
      module.targetFromAreaCenter===true&&rawArea
        ?(
          String(rawArea.wallPolicy||'ignore')==='block'
            ?WorldGeometryService.raycastDistance(
              Number(source.x)||0,
              Number(source.y)||0,
              effectAngle,
              Math.max(0,Number(rawArea.centerDistance)||0),
              2
            )
            :Math.max(0,Number(rawArea.centerDistance)||0)
        )
        :null;

    const syncedRectStrikeLength=
      module.syncAreaRectGeometry===true&&
      rawArea?.shape==='rect'
        ?Math.max(
          1,
          Math.max(0,Number(rawArea.halfWidth)||0)*2
        )
        :null;
    const syncedRectStrikeWidth=
      module.syncAreaRectGeometry===true&&
      rawArea?.shape==='rect'
        ?Math.max(
          1,
          Number(rawArea.range)||1
        )
        :null;

    const effect={
      ...EffectSpawnService.definitionSnapshot(module),
      type:renderType,
      key:effectKey,
      x:attackCenterX,
      y:attackCenterY,
      angle:effectAngle,
      tx:
        areaCenterDistance!==null
          ?(Number(source.x)||0)+Math.cos(effectAngle)*areaCenterDistance
          :module.fixedDistanceTarget===true
            ?(Number(source.x)||0)+Math.cos(effectAngle)*fixedTargetDistance
            :undefined,
      ty:
        areaCenterDistance!==null
          ?(Number(source.y)||0)+Math.sin(effectAngle)*areaCenterDistance
          :module.fixedDistanceTarget===true
            ?(Number(source.y)||0)+Math.sin(effectAngle)*fixedTargetDistance
            :undefined,
      distance:
        areaCenterDistance!==null
          ?areaCenterDistance
          :module.fixedDistanceTarget===true
            ?fixedTargetDistance
            :Number(module.distance)||0,
      strikeLength:
        syncedRectStrikeLength!==null
          ?syncedRectStrikeLength
          :Number(module.strikeLength)||0,
      strikeWidth:
        syncedRectStrikeWidth!==null
          ?syncedRectStrikeWidth
          :Number(module.strikeWidth)||0,
      startDistance:
        module.startAtSourceRadius===true
          ?Math.max(0,Number(source.radius)||0)
          :Number(module.startDistance)||0,
      start:now+Math.max(0,Number(module.startDelay)||0),
      dur:Math.max(
        GAME_DATA.frameMs,
        Number(module.duration)||
        Number(module.durationFrames)*GAME_DATA.frameMs||
        GAME_DATA.frameMs
      ),
      sourceEntityId:source.id,
      targetEntityId:module.target==='source'?String(source.id||''):String(module.targetEntityId||'')
    };

    if(effect.damage){
      effect.damage={
        ...effect.damage,
        attack:spec
      };
    }

    if(
      effect.damage&&
      Array.isArray(execution?.extraModules)&&
      execution.extraModules.length>0
    ){
      effect.damage={
        ...effect.damage,
        extraModules:execution.extraModules.map(
          extra=>EffectSpawnService.definitionSnapshot(extra)
        )
      };
    }

    if(
      module.damage?.requireMovementExecution===true
    ){
      const movementStateKey=
        String(
          module.damage.movementStateKey||
          'movement:move'
        );
      effect.damage={
        ...effect.damage,
        movementStateKey,
        movementExecutionSequence:
          Math.max(
            0,
            Number(execution?.sequence)||0
          )
      };

      /*
        이동 공격의 경로 프레젠테이션은 effect-spawn 패킷 하나만으로
        재현할 수 있도록 실제 시작된 movement의 확정 geometry/timing을
        이펙트 정의에 함께 스냅샷한다.
      */
      const movement=
        MovementAbilityService.state(
          source,
          movementStateKey
        );
      if(
        movement&&
        Math.max(
          0,
          Number(movement.executionSequence)||0
        )===
        Math.max(
          0,
          Number(execution?.sequence)||0
        )
      ){
        effect.damage.remotePathTimeline={
          startX:Number(movement.startX)||Number(source.x)||0,
          startY:Number(movement.startY)||Number(source.y)||0,
          angle:Number(movement.angle)||Number(angle)||0,
          distance:Math.max(
            0,
            Number(movement.presentationDistance)||
            Number(movement.distance)||
            0
          ),
          duration:Math.max(
            GAME_DATA.frameMs,
            Number(movement.duration)||GAME_DATA.frameMs
          ),
          easing:String(movement.easing||'linear')
        };
      }
    }

    delete effect.renderType;
    delete effect.durationFrames;
    delete effect.targetFromAreaCenter;
    delete effect.fixedDistanceTarget;
    delete effect.syncAreaRectGeometry;
    delete effect.startAtSourceRadius;

    // effect.spawn.geometryFrom: 같은 prepared AttackSpec 안의 판정 geometry 값을 직접 참조한다.
    // 판정 반경과 표시 반경을 별도 숫자로 중복 정의하지 않아 범위 증폭/수치 변경이 항상 동기화된다.
    if(module.geometryFrom&&typeof module.geometryFrom==='object'){
      const reference=module.geometryFrom;
      const moduleType=String(reference.moduleType||'');
      const status=String(reference.status||'');
      const property=String(reference.property||'range');
      const linkedModule=(spec.modules||[]).find(candidate=>{
        if(!candidate||typeof candidate!=='object')return false;
        if(moduleType&&this.type(candidate)!==moduleType)return false;
        if(status&&String(candidate.status||'')!==status)return false;
        return true;
      })||null;
      const linkedValue=linkedModule?Number(linkedModule[property]):NaN;
      if(Number.isFinite(linkedValue)){
        const radius=Math.max(0,linkedValue);
        effect.range=radius;
        effect.r=radius;
        effect.radius=radius;
      }
    }
    delete effect.geometryFrom;

    if(
      rawArea?.shape==='rect'&&
      rawArea.stopAtFirstEnemy===true
    ){
      const visualRange=
        Math.max(
          0,
          Number(rawArea.range)||0
        );
      const halfWidth=
        Math.max(
          0,
          Number(rawArea.halfWidth)||0
        );
      const visualAngle=
        Number(angle)+
        (Number(rawArea.angleOffset)||0);
      const visualOffset=
        Number(rawArea.perpendicularOffset)||0;
      const originX=
        (Number(source.x)||0)-
        Math.sin(visualAngle)*
        visualOffset;
      const originY=
        (Number(source.y)||0)+
        Math.cos(visualAngle)*
        visualOffset;
      const cos=Math.cos(visualAngle);
      const sin=Math.sin(visualAngle);
      let stopRange=visualRange;

      for(const target of EntityService.items.values()){
        if(
          !target?.alive||
          target.hidden||
          RelationService.relation(
            source,
            target
          )!=='enemy'
        )continue;

        const point=
          NetworkCollisionPositionService.point(
            target
          );
        const dx=
          Number(point.x)-
          originX;
        const dy=
          Number(point.y)-
          originY;
        const forward=
          dx*cos+
          dy*sin;
        const lateral=
          Math.abs(
            -dx*sin+
            dy*cos
          );
        const radius=
          Math.max(
            0,
            Number(target.radius)||0
          );

        if(
          forward<0||
          forward>visualRange||
          lateral>
            halfWidth+
            radius
        )continue;

        stopRange=
          Math.min(
            stopRange,
            Math.max(
              0,
              forward
            )
          );
      }

      effect.enemyStopRange=
        stopRange;
      effect.originalRange=
        Math.max(
          stopRange,
          Number(effect.range)||0
        );
      effect.range=
        Math.min(
          Math.max(
            0,
            Number(effect.range)||visualRange
          ),
          stopRange
        );
      if(
        Number.isFinite(
          Number(effect.len)
        )
      ){
        effect.len=
          Math.min(
            Math.max(
              0,
              Number(effect.len)||visualRange
            ),
            stopRange
          );
      }
    }

    if(module.clipToAttackArea===true){
      if(rawArea){
        const effectiveArea=
          rawArea.shape==='circle'
            ?rawArea
            :HitScanGeometryService
              .effectiveModule(
                source,
                spec,
                rawArea,
                angle+
                (Number(rawArea.angleOffset)||0)
              );

        if(effectiveArea.shape==='rect'){
          const clippedRange=Math.max(0,Number(effectiveArea.range)||0);
          effect.originalRange=Math.max(
            clippedRange,
            Number(effect.range)||0
          );
          effect.range=
            Math.min(
              clippedRange,
              Number.isFinite(
                Number(effect.enemyStopRange)
              )
                ?Math.max(
                  0,
                  Number(effect.enemyStopRange)
                )
                :clippedRange
            );
          if(Number.isFinite(Number(effect.len))){
            effect.originalLen=Math.max(0,Number(effect.len)||0);
            effect.len=
              Math.min(
                clippedRange,
                Number.isFinite(
                  Number(effect.enemyStopRange)
                )
                  ?Math.max(
                    0,
                    Number(effect.enemyStopRange)
                  )
                  :clippedRange
              );
          }
          effect.clipWallPolicy=String(effectiveArea.wallPolicy||'block');
          effect.clipAreaShape='rect';
        }else if(
          effectiveArea.shape==='sector'||
          effectiveArea.shape==='circle'||
          effectiveArea.shape==='tapered-rect'
        ){
          const effectiveAreaAngle=
            angle+
            (Number(effectiveArea.angleOffset)||0);
          const geometry=
            AreaGeometryService.polygon(
              source,
              effectiveArea,
              effectiveAreaAngle
            );
          if(
            effectiveArea.shape==='sector'&&
            effectiveArea.endChord===true
          ){
            effect.endChord=true;
            effect.endChordWidth=
              Math.max(
                .5,
                Number(effectiveArea.endChordWidth)||
                AttackVisualStyle.strokeWidth
              );
          }
          effect.points=
            (geometry?.points||[]).map(
              point=>({
                x:Number(point.x)||0,
                y:Number(point.y)||0
              })
            );
          effect.clipWallPolicy=String(effectiveArea.wallPolicy||'block');
          effect.clipAreaShape=String(effectiveArea.shape||'');
        }
      }
    }

    /*
      progressRect가 벽 클리핑으로 짧아질 때 range만 줄이고 dur를 그대로 두면
      같은 진행률 애니메이션이 더 짧은 거리를 같은 시간 동안 이동해 시각 탄속이 느려진다.
      원래 range/dur 비율을 보존하도록 실제 클립 길이에 비례해 duration도 줄인다.
    */
    if(
      String(module.renderType||'')==='progressRect'&&
      module.animation===true&&
      module.clipToAttackArea===true
    ){
      const originalRange=Math.max(0,Number(effect.originalRange)||0);
      const clippedRange=Math.max(0,Number(effect.range)||0);
      const currentDuration=Math.max(GAME_DATA.frameMs,Number(effect.dur)||0);
      if(
        originalRange>0&&
        clippedRange>=0&&
        clippedRange<originalRange-.01
      ){
        effect.dur=Math.max(
          GAME_DATA.frameMs,
          currentDuration*(clippedRange/originalRange)
        );
      }
    }

    if(
      targetPoint&&
      !Number.isFinite(Number(effect.tx))&&
      !Number.isFinite(Number(effect.ty))
    ){
      effect.tx=Number(targetPoint.x)||0;
      effect.ty=Number(targetPoint.y)||0;
    }

    if(module.rangeMode==='world-edge'){
      const maximumDistance=Math.hypot(
        WorldBoundsService.width(),
        WorldBoundsService.height()
      )*2;
      const edgeRange=WorldGeometryService.boundaryRayDistance(
        Number(source.x)||0,
        Number(source.y)||0,
        Number(angle)||0,
        maximumDistance,
        0
      );
      effect.range=Math.max(0,edgeRange);
      if(Math.max(0,Number(module.travelSpeed)||0)>0){
        effect.dur=Math.max(
          GAME_DATA.frameMs,
          effect.range/Number(module.travelSpeed)*1000
        );
      }
      if(effect.damage?.module){
        effect.damage={
          ...effect.damage,
          module:{...effect.damage.module,range:effect.range}
        };
      }
    }
    delete effect.rangeMode;

    if(module.animation?.mode==='forward'){
      let distance=
        module.animation.distance==='target-point'&&
        targetPoint
          ?Math.hypot(
            Number(targetPoint.x)-Number(source.x),
            Number(targetPoint.y)-Number(source.y)
          )
          :Math.max(
            0,
            Number(module.animation.distance)||0
          );
      if(module.animation.clipByMovementCollision===true){
        const movementModule=this.module(spec,'movement.move');
        const collision=movementModule
          ?MovementAbilityService.normalizeCollision(movementModule)
          :CollisionPolicyService.normalize({passWalls:false,passEnemies:true});
        distance=CollisionPolicyService.entityTravelDistance(
          source,angle,distance,collision
        );
      }
      effect.animation={
        ...module.animation,
        fromX:Number(source.x)||0,
        fromY:Number(source.y)||0,
        toX:(Number(source.x)||0)+Math.cos(angle)*distance,
        toY:(Number(source.y)||0)+Math.sin(angle)*distance,
        fromAngle:angle,
        toAngle:angle
      };
    }

    let instance=EffectSpawnService.spawn(
      effect,
      {source}
    );

    if(instance&&OnlinePresentationSyncService?.shouldSend?.(source)){
      OnlinePresentationSyncService.send(
        'effect-spawn',
        source,
        {effect:EffectSpawnService.presentationSnapshot(instance,now)}
      );
    }
    return instance;
  },
  onDeliveryResolved(source,spec,angle,execution,deliveryModule=null){
    if(!source||!spec||!execution)return false;
    const deliveryIndex=(spec.modules||[]).indexOf(deliveryModule);
    const key=`delivery-resolved:${deliveryIndex}`;
    if(AttackExecutionService.hasEffect(execution,key))return false;
    AttackExecutionService.markEffect(execution,key);
    let changed=false;
    this.forEachModule(spec,execution,module=>{
      if(String(module?.when||'')!=='after-delivery')return;
      if(
        Array.isArray(module.conditions)&&
        !TriggerModuleService.matches(
          {type:'trigger',event:'attack.delivery-resolved',conditions:module.conditions},
          'attack.delivery-resolved',
          {source,attack:spec,execution,angle,deliveryModule,now:performance.now()}
        )
      )return;
      const type=this.type(module);
      if(type==='mode.set'){
        ModeStateService.set(
          source,
          String(module.stateKey||''),
          String(module.value||''),
          String(module.initial||'')
        );
        changed=true;
        return;
      }
      if(type==='mode.toggle'){
        ModeStateService.toggle(source,module);
        changed=true;
        return;
      }
      if(type==='state.progress'){
        ProgressStateService.apply(source,module);
        changed=true;
      }
    });
    return changed;
  },
  afterAttack(source,spec,angle,execution){
    this.forEachModule(
      spec,
      execution,
      (
        module,
        moduleKey=''
      )=>{
      if(
        Array.isArray(module?.conditions)&&
        !TriggerModuleService.matches(
          {
            type:'trigger',
            event:'attack.after',
            conditions:module.conditions
          },
          'attack.after',
          {source,attack:spec,execution,angle,now:performance.now()}
        )
      )return;
      const type=this.type(module);

      if(
        type==='obstacle.wall-deploy'&&
        (!module.when||module.when==='after-attack')
      ){
        if(!EntitySimulationAuthorityService.isLocal(source))return;

        let point=execution?.targetPoint||null;
        if(
          source===Training.player&&
          typeof Training.mouseWorld==='function'
        ){
          const mouse=Training.mouseWorld();
          if(
            mouse&&
            Number.isFinite(Number(mouse.x))&&
            Number.isFinite(Number(mouse.y))
          ){
            point={
              x:Number(mouse.x),
              y:Number(mouse.y)
            };
          }
        }
        if(!point){
          point={
            x:(Number(source.x)||0)+
              Math.cos(Number(angle)||0)*
              Math.max(0,Number(module.maxRange)||650),
            y:(Number(source.y)||0)+
              Math.sin(Number(angle)||0)*
              Math.max(0,Number(module.maxRange)||650)
          };
        }

        DynamicWallService.place(
          source,
          point,
          module
        );
        return;
      }

      if(type==='cooking.acquire'&&module.when==='after-attack'){if(EntitySimulationAuthorityService.isLocal(source))CookingService.acquire(source,Math.max(0,Number(module.amount)||0));return;}

      if(type==='cooking.launch-ingredient'&&(!module.when||module.when==='after-attack')){CookingService.launchIngredient(source,execution);return;}

      if(type==='cooking.consume-ingredient'&&(!module.when||module.when==='after-attack')){if(EntitySimulationAuthorityService.isLocal(source))CookingService.consumeIngredient(source,Math.max(1,Number(module.amount)||1));return;}

      if(type==='cooking.meal-commit'&&(!module.when||module.when==='after-attack')){if(EntitySimulationAuthorityService.isLocal(source))CookingService.commitMealThrow(source,execution);return;}


      if(
        type==='orbit.inventory.mine-wall'&&
        (!module.when||module.when==='after-attack')
      ){
        OrbitInventoryService.mineWall(source,module,angle);
        return;
      }

      if(
        type==='orbit.inventory.mine-area'&&
        (!module.when||module.when==='after-attack')
      ){
        OrbitInventoryService.mineArea(source,module);
        return;
      }

      if(
        type==='orbit.inventory.fill'&&
        (!module.when||module.when==='after-attack')
      ){
        OrbitInventoryService.fill(source,module);
        return;
      }

      if(
        type==='orbit.inventory-recast'&&
        String(module.operation||'')==='start-window'&&
        (!module.when||module.when==='after-attack')
      ){
        OrbitInventoryService.recastGate(
          source,
          module,
          performance.now()
        );
        return;
      }

      if(
        type==='movement.move'&&
        (
          !module.when||
          module.when==='after-attack'
        )
      ){
        let direction=
          module.direction==='opposite-aim'
            ?angle+Math.PI
            :angle;
        let runtimeDistance=null;
        let targetPoint=execution?.targetPoint||null;
        if(module.target?.type==='projectile'){
          const projectile=ProjectileStateService.get(source,String(module.target.stateKey||''));
          if(!projectile)return;
          const dx=Number(projectile.x)-Number(source.x);
          const dy=Number(projectile.y)-Number(source.y);
          runtimeDistance=Math.hypot(dx,dy);
          if(runtimeDistance>.001)direction=Math.atan2(dy,dx);
          targetPoint={x:Number(projectile.x)||0,y:Number(projectile.y)||0};
        }
        MovementAbilityService.start(
          source,
          module,
          direction,
          {
            angle:direction,
            runtimeDistance,
            targetPoint,
            trajectory:this.module(spec,'trajectory.arc'),
            executionSequence:
              Math.max(
                0,
                Number(execution?.sequence)||0
              )
          }
        );
        return;
      }

      if(
        type==='attack.sequence'&&
        (
          !module.when||
          module.when==='after-attack'
        )
      ){
        const steps=
          Array.isArray(module.steps)
            ?module.steps
            :[];
        const sequenceSource=source;
        const sequenceCharacter=sequenceSource?.character;
        const sequenceAngle=Number(angle)||0;
        const sequenceAimMode=
          String(module.aimMode||'locked');
        let accumulatedDelay=0;

        for(const step of steps){
          const attackId=String(step?.attackId||'');
          if(!attackId)continue;

          accumulatedDelay+=
            Math.max(0,Number(step.delay)||0);

          const executeStep=()=>{
            if(
              !sequenceSource?.alive||
              sequenceSource.character!==sequenceCharacter
            )return;

            const baseAttack=
              AbilityService.attackById(
                sequenceSource.character,
                attackId
              );
            if(!baseAttack)return;

            const prepared=
              AugmentService.prepareAttack(
                sequenceSource,
                baseAttack,
                performance.now()
              );
            let stepAngle=sequenceAngle;
            if(
              sequenceAimMode==='live-source'&&
              EntitySimulationAuthorityService.isLocal(
                sequenceSource
              )
            ){
              if(sequenceSource===Training.player){
                stepAngle=Training.aimAngle();
              }else{
                const targetEntityId=
                  String(
                    execution?.targetEntityId||
                    ''
                  );
                const targetEntity=
                  targetEntityId
                    ?EntityService.items.get(
                      targetEntityId
                    )||null
                    :null;

                if(targetEntity?.alive){
                  stepAngle=Math.atan2(
                    Number(targetEntity.y)-
                    Number(sequenceSource.y),
                    Number(targetEntity.x)-
                    Number(sequenceSource.x)
                  );
                }else if(
                  Number.isFinite(
                    Number(
                      sequenceSource.lastMovementInputAngle
                    )
                  )
                ){
                  stepAngle=
                    Number(
                      sequenceSource.lastMovementInputAngle
                    );
                }
              }
            }

            TriggeredAttackService.execute(
              sequenceSource,
              prepared,
              stepAngle
            );
          };

          if(accumulatedDelay<=0){
            executeStep();
          }else{
            SimulationScheduleService.scheduleContinuation({
              at:performance.now()+accumulatedDelay,
              source:sequenceSource,
              continue:executeStep
            });
          }
        }
        return;
      }

      if(type==='attack.guard'){
        AttackGuardService.activate(
          source,
          module,
          angle,
          performance.now(),
          execution
        );
        return;
      }

      if(type==='formation.manifest'){
        CircleFormationService.manifestFromModule(
          source,
          spec,
          execution,
          module,
          angle,
          performance.now()
        );
        return;
      }

      if(
        type==='summon.spawn'&&
        EntitySimulationAuthorityService.isLocal(source)
      ){
        SummonDeployService.spawnFromAttack(
          source,
          module,
          angle,
          execution
        );
        return;
      }

      if(
        type==='summon.swap-pulse'&&
        EntitySimulationAuthorityService
          .isLocal(source)
      ){
        const stateKey=String(
          module.stateKey||''
        );
        const summon=
          stateKey
            ?SummonDeployService.entity(
              source,
              stateKey
            )
            :null;

        if(!summon?.alive){
          return;
        }

        const linkedAttack=
          AbilityService.attackById(
            source.character,
            String(module.attackId||'')
          );

        const sourceX=Number(source.x)||0;
        const sourceY=Number(source.y)||0;
        const summonX=Number(summon.x)||0;
        const summonY=Number(summon.y)||0;

        if(linkedAttack){
          const prepared=
            AugmentService.prepareAttack(
              summon,
              linkedAttack,
              performance.now()
            );
          TriggeredAttackService.execute(
            summon,
            prepared,
            Number(angle)||0
          );
        }

        source.x=summonX;
        source.y=summonY;
        summon.x=sourceX;
        summon.y=sourceY;
        if(source.forcedMotion){
          MovementService.finalizeForcedMotion(source);
        }
        if(summon.forcedMotion){
          MovementService.finalizeForcedMotion(summon);
        }
        MovementAbilityService.clear(source);
        MovementAbilityService.clear(summon);
        MovementService.resolveEmbedded(source);
        MovementService.resolveEmbedded(summon);

        const deployState=
          SummonDeployService.state(
            source,
            stateKey,
            false
          );
        if(deployState){
          deployState.x=summon.x;
          deployState.y=summon.y;

          const summonSpec=
            summon.summonSpec||
            null;
          if(
            summonSpec?.modeState?.stateKey&&
            module.resetMode
          ){
            ModeStateService.set(
              source,
              String(
                summonSpec.modeState.stateKey
              ),
              String(module.resetMode),
              String(
                summonSpec.modeState.initial||
                ''
              )
            );
          }
        }

        const presentation=module.presentation;
        if(presentation){
          for(const point of [
            {x:sourceX,y:sourceY},
            {x:summonX,y:summonY}
          ]){
            EffectSpawnService.spawn(
              {
                ...EffectSpawnService
                  .definitionSnapshot(
                    presentation
                  ),
                x:point.x,
                y:point.y,
                sourceEntityId:source.id
              },
              {source}
            );
          }
        }
        return;
      }

      if(
        type==='field.area'&&
        String(module.operation||'')==='clear'
      ){
        const retainRewardDuration=Math.max(0,Number(module.retainRewardDuration)||0);
        for(const state of InstalledAreaFieldService.states(source,String(module.stateKey||''))){
          if(retainRewardDuration>0&&state?.module?.dodgeReward){
            InstalledAreaFieldService.retainRewardOnly(source,state,retainRewardDuration,performance.now());
          }else{
            InstalledAreaFieldService.clearState(source,state);
          }
        }
        return;
      }

      if(
        type==='field.area'&&
        module.anchorMode==='self'&&
        EntitySimulationAuthorityService.isLocal(source)
      ){
        const fieldNow=performance.now();
        const state=InstalledAreaFieldService.activatePoint(
          source,
          module,
          {x:Number(source.x)||0,y:Number(source.y)||0},
          {
            attack:module.damageOnTrigger===false?null:spec,
            execution,
            now:fieldNow
          }
        );
        if(state?.kind===InstalledAreaFieldService.KIND){
          InstalledAreaFieldService.updateState(
            source,
            state,
            fieldNow
          );
        }
        return;
      }

      if(
        type==='field.area'&&
        module.anchorMode==='attack-end'&&
        EntitySimulationAuthorityService.isLocal(source)
      ){
        const distance=AttackEndAnchorService.distance(
          source,
          spec,
          module,
          angle
        );
        const delegatedAttackId=String(module.attackId||'');
        const delegatedBase=delegatedAttackId
          ?AbilityService.attackById(source.character,delegatedAttackId)
          :null;
        const fieldAttack=delegatedBase
          ?AugmentService.prepareAttack(source,delegatedBase,performance.now())
          :(module.damageOnTrigger===false?null:spec);
        const fieldNow=performance.now();
        const state=InstalledAreaFieldService.activatePoint(
          source,
          module,
          {
            x:(Number(source.x)||0)+Math.cos(angle)*distance,
            y:(Number(source.y)||0)+Math.sin(angle)*distance
          },
          {
            attack:fieldAttack,
            execution,
            now:fieldNow
          }
        );
        if(
          state?.kind===InstalledAreaFieldService.KIND&&
          module.triggerImmediately===true
        ){
          InstalledAreaFieldService.updateState(
            source,
            state,
            fieldNow
          );
        }
        return;
      }

      if(
        type==='field.area'&&
        module.anchorMode==='target-point'&&
        EntitySimulationAuthorityService.isLocal(source)
      ){
        const rawPoint=execution?.targetPoint||null;
        if(rawPoint){
          let point={
            x:Number(rawPoint.x)||0,
            y:Number(rawPoint.y)||0
          };
          if(module.clampToAttackRange!==false){
            const maxRange=Math.max(0,Number(spec.range)||0);
            const dx=point.x-(Number(source.x)||0);
            const dy=point.y-(Number(source.y)||0);
            const distance=Math.hypot(dx,dy);
            if(maxRange>0&&distance>maxRange){
              const ratio=maxRange/distance;
              point={
                x:(Number(source.x)||0)+dx*ratio,
                y:(Number(source.y)||0)+dy*ratio
              };
            }
          }
          let fieldModule=module;
          let fieldAttack=module.damageOnTrigger===false?null:spec;
          const delegatedAttackId=String(module.attackId||'');
          if(delegatedAttackId){
            const delegatedBase=AbilityService.attackById(source.character,delegatedAttackId);
            const delegatedPrepared=delegatedBase
              ?AugmentService.prepareAttack(
                source,
                ProgressScaledAttackService.resolve(
                  source,
                  delegatedBase
                ),
                performance.now()
              )
              :null;
            if(delegatedPrepared){
              fieldAttack=delegatedPrepared;
              if(module.triggerResolveRangeFromAttack===true){
                fieldModule={
                  ...module,
                  triggerResolveRange:Math.max(0,Number(delegatedPrepared.range)||Number(module.triggerResolveRange)||0)
                };
              }
            }
          }
          InstalledAreaFieldService.activatePoint(
            source,
            fieldModule,
            point,
            {
              attack:fieldAttack,
              execution,
              now:performance.now()
            }
          );
        }
        return;
      }

      if(type==='projectile.replace-attack'){
        const projectile=ProjectileStateService.get(
          source,
          String(module.stateKey||'')
        );
        if(!projectile)return;

        const baseReplacement=AbilityService.attackById(
          source.character,
          String(module.attackId||'')
        );
        if(!baseReplacement)return;

        const replacement=AugmentService.prepareAttack(
          source,
          baseReplacement,
          performance.now()
        );
        ProjectileStateService.replaceAttack(
          projectile,
          replacement
        );
        return;
      }


      if(
        type==='effect.spawn'&&
        (
          !module.when||
          module.when==='after-attack'
        )
      ){
        const effectExecutionKey=
          `effect.spawn:${String(moduleKey||'module')}`;
        if(
          execution&&
          AttackExecutionService.hasEffect(
            execution,
            effectExecutionKey
          )
        ){
          return;
        }
        if(execution){
          AttackExecutionService.markEffect(
            execution,
            effectExecutionKey
          );
        }

        const spawn=()=>this.spawnAttackEffect(
          source,
          spec,
          angle,
          execution,
          module
        );
        const delay=Math.max(
          0,
          Number(module.delay)||0
        );
        if(delay>0){
          SimulationScheduleService.scheduleContinuation({
            at:performance.now()+delay,
            source,
            interruptibleWindup:
              execution?.interruptibleWindupScheduled===true,
            windupKind:
              execution?.interruptibleWindupScheduled===true
                ?'attack-effect-delay'
                :null,
            continue:spawn
          });
        }else{
          spawn();
        }
        return;
      }

      if(type==='state.window'&&(!module.when||module.when==='after-attack')){
        const key=String(module.stateKey||'');
        if(key){
          const operation=String(module.operation||'open');
          if(operation==='clear'){
            source.actionState?.delete(key);
          }else if(operation==='complete'){
            const completedAt=performance.now();
            const state=TimedActionStateService.state(
              source,
              key,
              completedAt
            );
            if(state){
              state.completedAt=completedAt;
              state.completionPending=false;
              state.retainUntil=
                completedAt+
                Math.max(
                  0,
                  Number(module.retainCompleteMs)||
                  Number(state.retainCompleteMs)||
                  0
                );
            }
          }else{
            const openedAt=performance.now();
            const data={...(module.data||{})};
            if(module.captureAngle===true)data.angle=Number(angle)||0;
            const resolveAttackIds=
              module.resolveAttackIds&&
              typeof module.resolveAttackIds==='object'
                ?module.resolveAttackIds
                :null;

            const forcedMovementInterruptible=
              resolveAttackIds!==null&&
              module.previewAttackIds&&
              typeof module.previewAttackIds==='object'&&
              module.interruptOnForcedMovement!==false&&
              AttackWindupService.isTaggedAttack(
                spec
              );

            TimedActionStateService.open(
              source,
              {
                stateKey:key,
                duration:Math.max(0,Number(module.duration)||0),
                retainCompleteMs:Math.max(0,Number(module.retainCompleteMs)||0),
                cancelOnDamage:module.cancelOnDamage===true,
                interruptOnForcedMovement:
                  forcedMovementInterruptible,
                data,
                presentation:
                  module.previewAttackIds
                    ?{
                      previewAttackIds:EffectSpawnService.definitionSnapshot(module.previewAttackIds),
                      resolveDataKey:String(module.resolveDataKey||'choice'),
                      liveAim:true
                    }
                    :null
              },
              openedAt
            );

            const expected=
              source.actionState?.get(key)||
              null;
            if(expected&&resolveAttackIds){
              // 완료 예약이 처리되기 전에는 프레임 지연이나 UI 조회로 상태를 만료시키지 않는다.
              expected.completionPending=true;
              const continuationKey=
                forcedMovementInterruptible&&execution
                  ?AttackWindupService.nextDeliveryKey(execution,spec)
                  :'';
              const resolveWindow=()=>{
                  const state=source.actionState?.get(key)||null;
                  if(
                    !state||
                    state!==expected||
                    state.kind!=='timed-action-state'||
                    (
                      state.characterId!==String(source.character?.id||'')
                    )||
                    !source.alive
                  )return;
                  const completedAt=performance.now();
                  state.completionPending=false;
                  const retainMs=Math.max(0,Number(state.retainCompleteMs)||0);
                  if(retainMs>0){
                    state.completedAt=completedAt;
                    state.retainUntil=completedAt+retainMs;
                  }else{
                    source.actionState.delete(key);
                  }
                  const dataKey=String(module.resolveDataKey||'choice');
                  const attackId=String(resolveAttackIds[state.data?.[dataKey]]||'');
                  const resolveCharacter=
                    source.character;
                  const base=AbilityService.attackById(resolveCharacter,attackId);
                  if(!base)return;
                  const now=performance.now();
                  const prepared=AugmentService.prepareAttack(
                    source,
                    ProgressScaledAttackService.resolve(source,base),
                    now
                  );
                  let resolvedAngle=Number(state.data?.angle)||0;
                  let targetPoint=(EntitySimulationAuthorityService.isLocal(source)&&source===Training.player)
                    ?Training.mouseWorld()
                    :null;
                  if(String(module.resolveAimMode||'locked')==='live-source'){
                    if(EntitySimulationAuthorityService.isLocal(source)&&source===Training.player){
                      const liveAngle=Training.aimAngle();
                      const livePoint=Training.mouseWorld();
                      if(Number.isFinite(liveAngle))resolvedAngle=liveAngle;
                      if(
                        livePoint&&
                        Number.isFinite(Number(livePoint.x))&&
                        Number.isFinite(Number(livePoint.y))
                      ){
                        targetPoint={x:Number(livePoint.x),y:Number(livePoint.y)};
                      }
                    }else{
                      if(Number.isFinite(Number(source?._remoteAimAngle))){
                        resolvedAngle=Number(source._remoteAimAngle);
                      }
                      const remotePoint=source?._remoteAimTargetPoint;
                      if(
                        remotePoint&&
                        Number.isFinite(Number(remotePoint.x))&&
                        Number.isFinite(Number(remotePoint.y))
                      ){
                        targetPoint={x:Number(remotePoint.x),y:Number(remotePoint.y)};
                      }
                    }
                  }
                  const executed=AttackService.execute(
                    source,
                    prepared,
                    resolvedAngle,
                    {
                      freeAttack:true,
                      preparedSpec:true,
                      targetPoint,
                      networkReplay:execution?.networkReplay===true
                    }
                  );
                  const cooldownId=String(module.cooldownAttackId||'');
                  if(cooldownId&&executed){
                    source.cooldowns.set(cooldownId,now+Math.max(0,Number(module.cooldown)||0));
                  }
                  source.attackPreview=null;
              };

              if(
                forcedMovementInterruptible&&
                execution?.networkReplay===true
              ){
                AttackWindupService.registerRemoteContinuation(
                  source,
                  continuationKey,
                  resolveWindow
                );
              }else{
                SimulationScheduleService.scheduleContinuation({
                  at:expected.expiresAt,
                  source,
                  abilityId:`state-window:${key}`,
                  interruptibleWindup:
                    forcedMovementInterruptible,
                  windupKind:
                    forcedMovementInterruptible
                      ?'state-window-resolve'
                      :null,
                  continue:()=>{
                    if(forcedMovementInterruptible){
                      AttackWindupService.sendCommit(
                        source,
                        continuationKey
                      );
                    }
                    resolveWindow();
                  }
                });
              }
            }
          }
        }
        return;
      }

      if(type==='state.progress'&&module.when==='after-attack'){
        ProgressStateService.apply(source,module);
        return;
      }

      if(type==='mode.toggle'&&module.when==='after-attack'){
        ModeStateService.toggle(
          source,
          module
        );
        return;
      }

      if(type==='mode.set'&&module.when==='after-attack'){
        ModeStateService.set(
          source,
          String(module.stateKey||''),
          String(module.value||''),
          String(module.initial||'')
        );
        return;
      }


      return;
    });
  },
  onProjectileWallHit(projectile){
    const source=projectile?.source;
    const spec=projectile?.attack;
    const execution=projectile?.volley?.execution||null;
    if(
      !source?.alive||
      !spec||
      !EntitySimulationAuthorityService.isLocal(source)
    )return false;

    let moved=false;
    for(const module of spec.modules||[]){
      if(
        this.type(module)!=='movement.move'||
        module.when!=='on-projectile-wall-hit'||
        !(
          module.target==='impact-point'||
          module.target?.type==='projectile'
        )
      )continue;

      const key=`projectile-wall-move:${String(module.target?.stateKey||module.target||'impact-point')}`;
      if(
        module.oncePerExecution&&
        AttackExecutionService.hasEffect(execution,key)
      )continue;

      const moveTarget=module.target?.type==='projectile'
        ?ProjectileStateService.get(source,module.target.stateKey)
        :projectile;
      if(!moveTarget)continue;
      const dx=(Number(moveTarget.x)||0)-(Number(source.x)||0);
      const dy=(Number(moveTarget.y)||0)-(Number(source.y)||0);
      const distance=Math.hypot(dx,dy);
      const angle=distance>.001
        ?Math.atan2(dy,dx)
        :(Number(projectile.angle)||0);

      const started=MovementAbilityService.start(
        source,
        {...module,type:'movement.move',control:'fixed'},
        angle,
        {runtimeDistance:distance,angle}
      );
      if(!started)continue;

      

      if(module.oncePerExecution){
        AttackExecutionService.markEffect(execution,key);
      }
      moved=true;
    }
    return moved;
  },
  applySourceOnHitModifier(
    source,
    target,
    spec,
    execution,
    module
  ){
    if(
      !source||
      !spec||
      !module||
      this.type(module)!=='modifier.set'||
      module.when!=='on-hit'||
      module.recipient==='target'||
      !COMBAT_BUFF_DEFS[String(module.stat||'')]
    )return false;

    if(
      !this.progressConditionsMatch(
        source,
        target,
        module,
        {attack:spec,execution,now:performance.now()}
      )
    )return false;

    const key=
      `modifier-on-hit:${String(module.sourceId||module.stat||'modifier')}`;
    if(
      module.oncePerExecution&&
      AttackExecutionService.hasEffect(execution,key)
    )return false;

    BuffService.set(
      source,
      String(module.stat),
      Number(module.value)||0,
      String(module.sourceId||`${source.id}:${spec.id}:${module.stat}`),
      Number.isFinite(Number(module.duration))
        ?Math.max(0,Number(module.duration)||0)
        :Infinity,
      {
        tags:TagService.effectTags({
          type:'modifier.constant',
          value:Number(module.value)||0
        })
      }
    );
    if(module.oncePerExecution){
      AttackExecutionService.markEffect(execution,key);
    }
    return true;
  },
  applyTargetOnHitModifier(
    source,
    target,
    spec,
    execution,
    module
  ){
    if(
      !source||
      !target||
      !spec||
      !module||
      this.type(module)!=='modifier.set'||
      module.when!=='on-hit'||
      (
        module.recipient!=='target'&&
        module.recipient!=='source-and-target'
      )||
      !COMBAT_BUFF_DEFS[String(module.stat||'')]
    )return false;

    const key=
      `modifier-on-hit-target:${String(target.id||'target')}:${String(module.sourceId||module.stat||'modifier')}`;
    if(
      module.oncePerExecution&&
      AttackExecutionService.hasEffect(execution,key)
    )return false;

    BuffService.set(
      target,
      String(module.stat),
      Number(module.value)||0,
      String(
        module.sourceId||
        `${source.id}:${spec.id}:${target.id}:${module.stat}`
      ),
      Number.isFinite(Number(module.duration))
        ?Math.max(0,Number(module.duration)||0)
        :Infinity,
      {
        tags:TagService.effectTags({
          type:'modifier.constant',
          value:Number(module.value)||0
        })
      }
    );
    if(module.oncePerExecution){
      AttackExecutionService.markEffect(execution,key);
    }
    return true;
  },
  applyFriendlySourceOnHitModifiers(
    source,
    target,
    spec,
    execution,
    attackAngle
  ){
    if(!source||!target||!spec)return false;
    const relation=RelationService.relation(source,target);
    let applied=false;

    const beforeHitStatuses=new Map();
    const snapshotNow=performance.now();
    this.forEachModule(spec,execution,module=>{
      for(const condition of module?.conditions||[]){
        if(condition?.type!=='target.status-active-before-hit')continue;
        const status=String(condition.status||'');
        if(!status||beforeHitStatuses.has(status))continue;
        beforeHitStatuses.set(
          status,
          CCService.has(target,status,snapshotNow)
        );
      }
    });

    this.forEachModule(spec,execution,module=>{
      if(
        this.type(module)!=='modifier.set'||
        module.when!=='on-hit'||
        module.recipient==='target'
      )return;
      const relations=Array.isArray(module.targetRelations)
        ?module.targetRelations
        :null;
      if(relations&&!relations.includes(relation))return;
      if(
        !this.hitConditionMatches(
          source,
          target,
          spec,
          execution,
          attackAngle,
          module,
          {beforeHitStatuses}
        )
      )return;
      applied=
        this.applySourceOnHitModifier(
          source,
          target,
          spec,
          execution,
          module
        )||applied;
    });
    return applied;
  },
  onHit(
    source,
    target,
    spec,
    volley,
    attackAngle,
    deliveryModule=null
  ){
    const execution=volley?.execution;
    const relation=
      RelationService.relation(
        source,
        target
      );
    const sourceAuthoritative=
      Training.sessionMode!=='online'||
      EntitySimulationAuthorityService.isLocal(source);
    const sourceOnHitMayResolveLocally=
      sourceAuthoritative&&
      (
        Training.sessionMode!=='online'||
        EntitySimulationAuthorityService.isLocal(target)
      );

    const beforeHitStatuses=new Map();
    const snapshotNow=performance.now();
    this.forEachModule(spec,execution,module=>{
      for(const condition of module?.conditions||[]){
        if(condition?.type!=='target.status-active-before-hit')continue;
        const status=String(condition.status||'');
        if(!status||beforeHitStatuses.has(status))continue;
        beforeHitStatuses.set(
          status,
          CCService.has(target,status,snapshotNow)
        );
      }
    });

    this.forEachModule(spec,execution,module=>{
      const type=this.type(module);
      const effectRelations=
        Array.isArray(module?.targetRelations)
          ?module.targetRelations
          :null;

      // 효과 모듈이 관계를 명시했다면 해당 관계에서만 실행한다.
      // delivery 모듈 자신의 targetRelations는 전달 대상을 정하는 책임만 가진다.
      if(
        type!=='delivery.area'&&
        type!=='delivery.projectile'&&
        type!=='delivery.range-projectile'&&
        effectRelations&&
        !effectRelations.includes(relation)
      )return;

      if(
        !this.hitConditionMatches(
          source,
          target,
          spec,
          execution,
          attackAngle,
          module,
          {beforeHitStatuses}
        )
      )return;

      const hitPhase=String(deliveryModule?.phase||'');
      if(
        module?.when==='on-projectile-outbound-hit'&&
        hitPhase!=='outbound'
      )return;
      if(
        module?.when==='on-projectile-return-hit'&&
        hitPhase!=='returning'
      )return;

      if(type==='cooking.acquire'&&module.when==='on-hit'){
        if(Training.sessionMode==='online'&&!EntitySimulationAuthorityService.isLocal(source))return;
        if(Array.isArray(module.targetKinds)&&module.targetKinds.length&&!module.targetKinds.includes(String(target?.kind||'')))return;
        const key=`cooking.acquire:${String(module.effectKey||module.stateKey||'default')}`;
        if(module.oncePerExecution&&AttackExecutionService.hasEffect(execution,key))return;
        const gained=CookingService.acquire(source,Math.max(0,Number(module.amount)||0));
        if(gained>0&&module.oncePerExecution)AttackExecutionService.markEffect(execution,key);
        return;
      }

      if(type==='cooking.stove-input'&&module.when==='on-hit'){
        if(!EntitySimulationAuthorityService.isLocal(source)||!CookingService.isOwnStove(source,target))return;
        CookingService.addStoveInput(source,Math.max(1,Number(module.amount)||1));
        return;
      }

      if(type==='cooking.consume-ingredient'&&module.when==='on-hit'){
        if(Training.sessionMode==='online'&&!EntitySimulationAuthorityService.isLocal(source))return;
        const key=`cooking.consume-ingredient:${String(module.effectKey||module.stateKey||'default')}`;
        if(module.oncePerExecution&&AttackExecutionService.hasEffect(execution,key))return;
        const used=CookingService.consumeIngredient(source,Math.max(1,Number(module.amount)||1));
        if(used>0&&module.oncePerExecution)AttackExecutionService.markEffect(execution,key);
        return;
      }

      if(type==='cooking.meal-heal'&&module.when==='on-hit'){
        if((relation!=='self'&&relation!=='ally')||String(target?.kind||'')!=='player')return;
        if(Training.sessionMode==='online'&&!EntitySimulationAuthorityService.isLocal(target))return;
        const mealCount=Math.max(0,Math.floor(Number(deliveryModule?.projectile?.cookingMealMeta?.count)||Number(execution?.cookingMealCount)||0));
        CookingService.applyThrownMeal(source,target,mealCount);
        return;
      }

      if(type==='hit.sequence'){
        HitTargetSequenceService.start(
          source,
          target,
          spec,
          execution,
          attackAngle,
          module,
          deliveryModule
        );
        return;
      }


      if(
        type==='movement.pull'&&
        module.target==='hit-target'
      ){
        const key=
          `${type}:${module.target}:${target.id}`;

        if(
          module.oncePerExecution&&
          AttackExecutionService.hasEffect(
            execution,
            key
          )
        )return;

        const pullDistance=
          module.distanceMode==='source-contact'
            ?Math.max(
              0,
              Math.hypot(
                (Number(target.x)||0)-(Number(source.x)||0),
                (Number(target.y)||0)-(Number(source.y)||0)
              )-
              Math.max(0,Number(source.radius)||0)-
              Math.max(0,Number(target.radius)||0)-
              Math.max(0,Number(module.gap)||0)
            )
            :Math.max(
              0,
              Number(module.distance)||0
            );

        const movementStarted=
          MovementService.pull(
            target,
            source,
            pullDistance,
            Math.max(
              .001,
              Number(module.speed)||10
            ),
            {
              gap:Math.max(0,Number(module.gap)||0),
              duration:Math.max(0,Number(module.duration)||0)
            }
          );

        if(
          movementStarted!==false&&
          module.oncePerExecution
        ){
          AttackExecutionService.markEffect(
            execution,
            key
          );
        }
        return;
      }

      if(
        (
          type==='movement.knockback'||
          type==='movement.neutralize-knockback'
        )&&
        module.target==='hit-target'
      ){
        const key=
          `${type}:${module.effectKey||module.direction||'attack'}:${module.target}:${target.id}`;
        if(
          module.oncePerExecution&&
          AttackExecutionService.hasEffect(execution,key)
        )return;

        let direction=Number.isFinite(attackAngle)?attackAngle:0;
        if(module.direction==='away-from-source'){
          direction=Math.atan2(
            target.y-source.y,
            target.x-source.x
          );
        }else if(module.direction==='away-from-impact'){
          const descriptor=
            execution?.impactOrigin;
          const descriptorPoint=
            descriptor?.mode==='point'&&
            Number.isFinite(Number(descriptor.x))&&
            Number.isFinite(Number(descriptor.y))
              ?{
                x:Number(descriptor.x),
                y:Number(descriptor.y)
              }
              :null;

          const impactCenter=
            descriptorPoint||
            (
              deliveryModule&&
              (
                deliveryModule.shape==='circle'||
                deliveryModule.shape==='rect'
              )
                ?AreaGeometryService.center(
                  source,
                  deliveryModule,
                  attackAngle
                )
                :(
                  execution?.projectileImpactPoint||
                  null
                )
            );

          if(
            impactCenter&&
            Number.isFinite(Number(impactCenter.x))&&
            Number.isFinite(Number(impactCenter.y))
          ){
            direction=Math.atan2(
              target.y-Number(impactCenter.y),
              target.x-Number(impactCenter.x)
            );
          }
        }else if(module.direction==='toward-source'){
          direction=Math.atan2(
            source.y-target.y,
            source.x-target.x
          );
        }else if(module.direction==='opposite-attack'){
          direction+=Math.PI;
        }

        const projectileTravel=
          deliveryModule?.projectile
            ?Math.max(
              0,
              Number(
                deliveryModule.projectile.travel
              )||0
            )
            :null;
        const maxProjectileTravel=
          Number.isFinite(
            Number(module.maxProjectileTravel)
          )
            ?Math.max(
              0,
              Number(module.maxProjectileTravel)||0
            )
            :(
              Number.isFinite(
                Number(module.maxProjectileTravelRatio)
              )
                ?Math.max(
                  0,
                  Number(spec?.range)||0
                )*
                Math.max(
                  0,
                  Number(module.maxProjectileTravelRatio)||0
                )
                :null
            );

        if(
          projectileTravel!==null&&
          maxProjectileTravel!==null&&
          projectileTravel>maxProjectileTravel
        ){
          return;
        }

        let movementDistance=Math.max(0,Number(module.distance)||0);
        if(module.distanceMode==='source-contact'){
          movementDistance=Math.max(
            0,
            Math.hypot(
              (Number(source.x)||0)-(Number(target.x)||0),
              (Number(source.y)||0)-(Number(target.y)||0)
            )-
            Math.max(0,Number(source.radius)||0)-
            Math.max(0,Number(target.radius)||0)
          );
        }else if(module.distanceMode==='impact-proximity'){
          const descriptor=execution?.impactOrigin;
          const center=(
            descriptor?.mode==='point'&&
            Number.isFinite(Number(descriptor.x))&&
            Number.isFinite(Number(descriptor.y))
          )?{x:Number(descriptor.x),y:Number(descriptor.y)}:(
            execution?.projectileImpactPoint||
            (
              deliveryModule&&
              (deliveryModule.shape==='circle'||deliveryModule.shape==='rect')
                ?AreaGeometryService.center(source,deliveryModule,attackAngle)
                :null
            )
          );
          const radius=Math.max(.001,Number(module.proximityRadius)||Number(spec?.range)||1);
          const minDistance=Math.max(0,Number(module.minDistance)||0);
          const maxDistance=Math.max(minDistance,Number(module.maxDistance)||movementDistance);
          if(center&&Number.isFinite(Number(center.x))&&Number.isFinite(Number(center.y))){
            const radialDistance=Math.hypot((Number(target.x)||0)-center.x,(Number(target.y)||0)-center.y);
            const proximity=1-Math.min(1,radialDistance/radius);
            movementDistance=minDistance+(maxDistance-minDistance)*proximity;
          }
        }else if(module.distanceMode==='attack-range-end'){
          const projectileOrigin=deliveryModule?.projectile?.origin;
          const originX=Number.isFinite(Number(projectileOrigin?.x))
            ?Number(projectileOrigin.x)
            :Number(source.x)||0;
          const originY=Number.isFinite(Number(projectileOrigin?.y))
            ?Number(projectileOrigin.y)
            :Number(source.y)||0;
          const forward=(
            ((Number(target.x)||0)-originX)*Math.cos(direction)+
            ((Number(target.y)||0)-originY)*Math.sin(direction)
          );
          movementDistance=Math.max(
            0,
            Math.max(0,Number(spec?.range)||0)-forward
          );
        }

        const movementStarted=
          type==='movement.neutralize-knockback'
            ?NeutralizingKnockbackService.start({
              source,
              target,
              angle:direction,
              distance:movementDistance,
              speed:module.speed,
              execution,
              module
            })
            :MovementService.knockback(
              target,
              direction,
              movementDistance,
              Math.max(
                .001,
                Number(module.speed)||10
              ),
              module.wallImpactStatus
                ?{
                  completion:{
                    type:'wall-impact-status',
                    status:String(module.wallImpactStatus.status||'stun'),
                    duration:Math.max(0,Number(module.wallImpactStatus.duration)||0),
                    sourceId:`${source.id}:wall-impact:${Math.max(0,Number(execution?.sequence)||0)}`,
                    sourceEntityId:String(source.id||'')
                  }
                }
                :{}
            );

        if(
          movementStarted!==false&&
          module.oncePerExecution
        ){
          AttackExecutionService.markEffect(
            execution,
            key
          );
        }
        return;
      }


      if(
        type==='resource.restore'&&
        module.when==='on-hit'
      ){
        const excludedTargetKinds=
          Array.isArray(module.excludeTargetKinds)
            ?module.excludeTargetKinds
            :EMPTY_RUNTIME_ITEMS;
        if(
          excludedTargetKinds.includes(
            String(target?.kind||'')
          )
        )return;

        const recipientType=String(module.recipient||'target');
        const recipient=recipientType==='source'?source:target;

        if(!recipient)return;
        if(recipientType==='source'&&!sourceOnHitMayResolveLocally)return;

        const recipientKey=recipientType==='source'
          ?'source'
          :`${recipientType}:${target.id}`;
        const key=
          `restore:${module.resource||'health'}:${recipientKey}`;

        if(
          module.oncePerExecution!==false&&
          AttackExecutionService.hasEffect(
            execution,
            key
          )
        )return;

        const applyRestore=()=>ResourceRestoreEffectService.apply({
          source,
          target,
          module:{...module,recipient:recipientType},
          defaultRecipient:recipientType,
          presentationDefault:'ability',
          reason:'attack.on-hit.resource.restore',
          now:performance.now()
        });
        const restoreDelay=Math.max(0,Number(module.delay)||0);
        if(restoreDelay>0)SimulationScheduleService.scheduleContinuation({source,at:performance.now()+restoreDelay,continue:applyRestore});
        else applyRestore();

        if(module.oncePerExecution!==false){
          AttackExecutionService.markEffect(
            execution,
            key
          );
        }
        return;
      }

      if(
        type==='effect.spawn'&&
        module.when==='on-hit'&&
        sourceOnHitMayResolveLocally
      ){
        const key=
          `effect-on-hit:${String(module.stateKey||module.renderType||module.type||'effect')}`;
        if(
          module.oncePerExecution===true&&
          AttackExecutionService.hasEffect(
            execution,
            key
          )
        )return;

        this.spawnAttackEffect(
          source,
          spec,
          attackAngle,
          execution,
          module,
          target
        );

        if(module.oncePerExecution===true){
          AttackExecutionService.markEffect(
            execution,
            key
          );
        }
        return;
      }

      if(
        type==='state.window'&&
        module.when==='on-hit'&&
        sourceOnHitMayResolveLocally
      ){
        const key=String(module.stateKey||'');
        if(!key)return;
        const effectKey=`state-window:${key}`;
        if(module.oncePerExecution===true&&AttackExecutionService.hasEffect(execution,effectKey))return;
        const stateData={...(module.data||{})};
        if(module.captureHitTarget===true){
          stateData.targetEntityId=String(target?.id||'');
        }
        TimedActionStateService.open(source,{
          stateKey:key,
          duration:Math.max(0,Number(module.duration)||0),
          retainCompleteMs:Math.max(0,Number(module.retainCompleteMs)||0),
          data:stateData
        },performance.now());
        if(module.oncePerExecution===true)AttackExecutionService.markEffect(execution,effectKey);
        return;
      }

      if(
        type==='state.progress'&&
        module.when==='on-hit'&&
        (
          module.recipient==='target'
            ?(
              Training.sessionMode!=='online'||
              EntitySimulationAuthorityService.isLocal(target)
            )
            :sourceOnHitMayResolveLocally
        )
      ){
        const recipientId=module.recipient==='target'?String(target?.id||'target'):'source';
        const key=`progress:${module.stateKey||''}:${recipientId}`;
        if(module.oncePerExecution&&AttackExecutionService.hasEffect(execution,key))return;
        const projectile=deliveryModule?.projectile||null;
        const executionImpactPoint=
          execution?.projectileImpactPoint||
          execution?.impactOrigin||
          null;
        const hitImpact=projectile
          ?{
            type:'projectile',
            origin:projectile.origin||null,
            point:{x:Number(projectile.x)||0,y:Number(projectile.y)||0},
            angle:Number.isFinite(Number(projectile.angle))
              ?Number(projectile.angle)
              :Number(attackAngle)||0,
            phase:String(deliveryModule?.phase||'outbound')
          }
          :(executionImpactPoint
            ?{
              type:'direct',
              origin:execution?.impactOrigin||null,
              point:executionImpactPoint,
              angle:Number(attackAngle)||0
            }
            :null);
        const applied=AttackModuleService.applyHitProgress(source,target,module,{
          attack:spec,execution,impact:hitImpact,now:performance.now()
        });
        if(applied&&module.oncePerExecution)AttackExecutionService.markEffect(execution,key);
        return;
      }

      if(
        type==='modifier.set'&&
        module.when==='on-hit'&&
        COMBAT_BUFF_DEFS[String(module.stat||'')]
      ){
        if(
          sourceOnHitMayResolveLocally&&
          module.recipient!=='target'
        ){
          this.applySourceOnHitModifier(
            source,
            target,
            spec,
            execution,
            module
          );
        }
        this.applyTargetOnHitModifier(
          source,
          target,
          spec,
          execution,
          module
        );
        return;
      }

      if(
        type==='movement.move'&&
        (
          module.when==='on-hit'||
          module.when==='on-projectile-outbound-hit'||
          module.when==='on-projectile-return-hit'
        )&&
        sourceOnHitMayResolveLocally
      ){
        const key=`source-move:${module.target?.stateKey||module.target||'hit-target'}`;
        if(module.oncePerExecution&&AttackExecutionService.hasEffect(execution,key))return;
        const attackDirection=module.target==='attack-direction';
        const moveTarget=module.target?.type==='projectile'
          ?ProjectileStateService.get(source,module.target.stateKey)
          :(module.target==='hit-target'?target:null);
        if(moveTarget||attackDirection){
          const dx=moveTarget?(Number(moveTarget.x)||0)-(Number(source.x)||0):0;
          const dy=moveTarget?(Number(moveTarget.y)||0)-(Number(source.y)||0):0;
          const distance=attackDirection
            ?Math.max(0,Number(module.distance)||0)
            :Math.hypot(dx,dy);
          const moveAngle=attackDirection
            ?(Number(attackAngle)||0)
            :(distance>.001?Math.atan2(dy,dx):(Number(attackAngle)||0));
          MovementAbilityService.start(
            source,
            {...module,type:'movement.move',control:'fixed'},
            moveAngle,
            {
              runtimeDistance:distance,
              angle:moveAngle
            }
          );
          
        }
        if(module.oncePerExecution)AttackExecutionService.markEffect(execution,key);
        return;
      }

      if(type==='movement.projectile-tether'&&module.target==='hit-target'){
        const projectile=deliveryModule?.projectile||null;
        if(projectile&&sourceAuthoritative===false){
          // 온라인에서는 실제 피격자 권위 클라이언트가 대상 이동을 소유한다.
        }
        if(projectile&&EntitySimulationAuthorityService.isLocal(target)){
          const key=`projectile-tether:${projectile.networkKey||''}:${target.id}`;
          if(module.oncePerExecution&&AttackExecutionService.hasEffect(execution,key))return;
          ProjectileTetherMovementService.attach(projectile,target,source,module);
          if(module.oncePerExecution)AttackExecutionService.markEffect(execution,key);
        }
        return;
      }


      if(type==='stack.mark'){
        const key=`stack-mark:${String(module.stateKey||'mark')}:${target.id}`;
        if(
          module.oncePerExecution&&
          AttackExecutionService.hasEffect(execution,key)
        )return;
        if(sourceOnHitMayResolveLocally){
          StackMarkService.apply(
            source,
            target,
            module,
            performance.now()
          );
        }
        if(module.oncePerExecution){
          AttackExecutionService.markEffect(execution,key);
        }
        return;
      }

      if(type==='buff.time-add'){
        const key=
          `buff-time-add:${String(module.group||module.stateKey||'timer')}:${target.id}`;

        if(
          module.oncePerExecution!==false&&
          AttackExecutionService.hasEffect(
            execution,
            key
          )
        )return;

        TimedThresholdBuffService.add(
          target,
          module,
          source,
          performance.now()
        );

        if(module.oncePerExecution!==false){
          AttackExecutionService.markEffect(
            execution,
            key
          );
        }
        return;
      }

      if(type==='status.clear'&&module.status){
        const key=`status-clear:${module.status}:${target.id}`;
        if(
          module.oncePerExecution&&
          AttackExecutionService.hasEffect(execution,key)
        )return;

        CCService.clear(
          target,
          String(module.status||''),
          {applyRelease:module.triggerRelease!==false}
        );

        if(module.oncePerExecution){
          AttackExecutionService.markEffect(execution,key);
        }
        return;
      }

      if(type==='status.apply'&&module.status){
        if(!this.progressConditionsMatch(source,target,module,{
          attack:spec,
          execution,
          now:performance.now(),
          beforeHitStatuses
        }))return;
        if(module.when==='on-projectile-outbound-hit'&&hitPhase!=='outbound')return;
        if(module.when==='on-projectile-return-hit'&&hitPhase!=='returning')return;

        if(Number.isFinite(Number(module.maxImpactRange))){
          const origin=execution?.impactOrigin;
          if(
            origin?.mode!=='point'||
            !Number.isFinite(Number(origin.x))||
            !Number.isFinite(Number(origin.y))
          )return;

          const impactArea={
            shape:'circle',
            range:Math.max(0,Number(module.maxImpactRange)||0),
            wallPolicy:String(module.impactWallPolicy||'block'),
            centerPoint:{
              x:Number(origin.x),
              y:Number(origin.y)
            }
          };
          const impactSource={
            x:Number(origin.x),
            y:Number(origin.y)
          };

          const impactTargetPoint=
            NetworkCollisionPositionService.point(
              target
            );

          if(
            !AreaGeometryService.overlaps(
              impactSource,
              impactArea,
              0,
              impactTargetPoint.x,
              impactTargetPoint.y,
              Math.max(0,Number(target.radius)||0)
            )
          )return;
        }

        const key=`status:${module.status}:${target.id}`;
        if(
          module.oncePerExecution&&
          AttackExecutionService.hasEffect(execution,key)
        )return;

        const dynamicSourceMovement=module.duration==='source-movement';
        const applyStatus=()=>{
          if(!target?.alive)return false;
          const appliedAt=performance.now();
          const applied=CombatStatusApplicationService.apply({
            source,
            target,
            type:module.status,
            duration:
              dynamicSourceMovement
                ?Infinity
                :Math.max(0,Number(module.duration)||0),
            sourceId:source.id,
            data:{
              ...(module.data||{}),
              sourceEntityId:source.id,
              releaseCondition:module.releaseCondition||null,
              movementObserved:MovementAbilityService.active(source),
              presentationAppliedAt:appliedAt,
              presentationStartedAt:appliedAt
            }
          });
          if(applied){
            AttackExecutionService.markEffect(
              execution,
              `status-applied:${module.status}:${target.id}`
            );
          }
          return applied;
        };
        const statusDelay=Math.max(0,Number(module.delay)||0);
        if(statusDelay>0){
          SimulationScheduleService.scheduleContinuation({
            at:performance.now()+statusDelay,
            source:target,
            continue:applyStatus
          });
        }else{
          applyStatus();
        }

        if(module.oncePerExecution)AttackExecutionService.markEffect(execution,key);
      }

    });
  }
});