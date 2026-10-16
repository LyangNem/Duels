

/* 소환수 AI.
   타겟 선택·길찾기·추적·근접 공격의 수명만 담당하고,
   실제 이동/피해는 기존 MovementService/AttackService를 사용한다. */
const SummonAIService=Object.freeze({
  KIND:'summon-ai-state',

  state(entity){
    if(!entity)return null;
    if(
      !entity.summonAIState||
      entity.summonAIState.kind!==this.KIND
    ){
      entity.summonAIState={
        kind:this.KIND,
        targetId:null,
        path:[],
        pathIndex:0,
        lastPathAt:0,
        pathAlgorithm:'none',
        enteredMeleeAt:0,
        nextMeleeAt:0,
        nextMovementAttackAt:0,
        nextSupportAt:0,
        wanderTarget:null,
        wanderPath:[],
        wanderPathIndex:0,
        nextWanderTargetAt:0,
        wanderSeed:0,
        damageEscapeUntil:0,
        damageEscapeTarget:null,
        damageEscapeSourceId:null,
        fleePhase:0,
        projectileAvoidUntil:0,
        projectileAvoidVector:null,
        fieldAvoidPath:[],
        fieldAvoidPathIndex:0,
        fieldAvoidPathAt:0,
        fieldAvoidDesperate:false,
        fieldAvoidThreatKey:null,
        enemyAvoidWanderAnchor:null,
        enemyAvoidWanderTarget:null,
        enemyAvoidWanderPath:[],
        enemyAvoidWanderPathIndex:0,
        nextEnemyAvoidWanderTargetAt:0,
        enemyAvoidWanderSeed:0,
        enemyAvoidPath:[],
        enemyAvoidPathIndex:0,
        enemyAvoidPathAt:0,
        enemyAvoidPathFallback:false,
        enemyAvoidDesperate:false,
        enemyAvoidDesperateTargetId:null,
        ownerThreatWanderTarget:null,
        ownerThreatWanderPath:[],
        ownerThreatWanderPathIndex:0,
        nextOwnerThreatWanderTargetAt:0,
        ownerThreatWanderSeed:0,
        ownerThreatSafeAnchor:null,
        ownerReturnPathFound:true
      };
    }
    return entity.summonAIState;
  },

  canPerceiveEnemy(
    viewer,
    target,
    now=performance.now()
  ){
    if(
      !viewer?.alive||
      !target?.alive||
      RelationService.relation(
        viewer,
        target
      )!=='enemy'
    )return false;

    if(
      typeof StealthPresentationService==='undefined'||
      !StealthPresentationService.active(
        target,
        now
      )
    )return true;

    return !!(
      StealthPresentationService.detectedBy(
        viewer,
        target,
        now
      )||
      StealthPresentationService.temporarilyRevealed(
        target,
        now
      )
    );
  },

  damageEscapeActive(
    entity,
    now=performance.now()
  ){
    const state=this.state(entity);
    return !!(
      state&&
      state.damageEscapeTarget&&
      now<Math.max(
        0,
        Number(state.damageEscapeUntil)||0
      )
    );
  },

  engagedEnemy(
    entity,
    owner,
    ai,
    now=performance.now()
  ){
    const state=this.state(entity);
    const target=
      EntityService.items.get(
        String(state?.targetId||'')
      )||null;
    if(
      !target?.alive||
      RelationService.relation(
        entity,
        target
      )!=='enemy'||
      !this.canPerceiveEnemy(
        entity,
        target,
        now
      )
    )return null;

    const guardRange=
      Math.max(
        0,
        Number(ai?.ownerGuardRange)||0
      );
    if(
      owner?.alive&&
      guardRange>0&&
      Math.hypot(
        Number(target.x)-Number(owner.x),
        Number(target.y)-Number(owner.y)
      )>
      guardRange+
      (
        ai?.strictOwnerGuardRange===true
          ?0
          :Math.max(
            0,
            Number(target.radius)||0
          )
      )
    )return null;

    const meleeRange=
      this.meleeRange(
        entity,
        entity.summonSpec,
        now
      );
    const distance=
      Math.hypot(
        Number(target.x)-Number(entity.x),
        Number(target.y)-Number(entity.y)
      );
    return (
      distance<
      meleeRange+
      Math.max(
        0,
        Number(target.radius)||0
      )
    )
      ?target
      :null;
  },

  recordDamageEscape(
    entity,
    result,
    now=performance.now()
  ){
    if(
      !entity?.alive||
      !EntitySimulationAuthorityService
        .isLocal(entity)
    )return false;

    const ai=entity.summonSpec?.ai;
    const config=ai?.damageEscape;
    if(!config||config.enabled===false)return false;

    const owner=EntityService.owner(entity);
    if(
      this.engagedEnemy(
        entity,
        owner,
        ai,
        now
      )
    )return false;

    const source=result?.source||null;
    const impact=result?.impact||null;

    if(
      source?.alive&&
      RelationService.relation(
        entity,
        source
      )==='enemy'&&
      !this.canPerceiveEnemy(
        entity,
        source,
        now
      )
    )return false;

    let threatX=Number(
      impact?.origin?.x
    );
    let threatY=Number(
      impact?.origin?.y
    );

    if(
      !Number.isFinite(threatX)||
      !Number.isFinite(threatY)
    ){
      threatX=Number(source?.x);
      threatY=Number(source?.y);
    }
    if(
      !Number.isFinite(threatX)||
      !Number.isFinite(threatY)
    ){
      threatX=Number(impact?.point?.x);
      threatY=Number(impact?.point?.y);
    }
    if(
      !Number.isFinite(threatX)||
      !Number.isFinite(threatY)
    )return false;

    const ex=Number(entity.x)||0;
    const ey=Number(entity.y)||0;
    let dx=ex-threatX;
    let dy=ey-threatY;
    let length=Math.hypot(dx,dy);

    if(length<=.001){
      const seed=
        String(entity.id||'')
          .split('')
          .reduce(
            (sum,char)=>
              sum+char.charCodeAt(0),
            0
          );
      const angle=
        (
          seed*2.399963229728653+
          now*.001
        )%
        (Math.PI*2);
      dx=Math.cos(angle);
      dy=Math.sin(angle);
      length=1;
    }

    dx/=length;
    dy/=length;

    const distance=Math.max(
      20,
      Number(config.distance)||170
    );
    let targetX=ex+dx*distance;
    let targetY=ey+dy*distance;

    const ownerReturnDistance=
      Math.max(
        0,
        Number(ai?.ownerReturn?.distance)||0
      );
    const nearOwnerDistance=
      Math.max(
        0,
        Number(config.nearOwnerDistance)||
        ownerReturnDistance
      );

    if(
      owner?.alive&&
      nearOwnerDistance>0&&
      Math.hypot(
        ex-Number(owner.x),
        ey-Number(owner.y)
      )<=nearOwnerDistance
    ){
      let odx=
        Number(owner.x)-threatX;
      let ody=
        Number(owner.y)-threatY;
      let olen=Math.hypot(odx,ody);

      if(olen<=.001){
        odx=dx;
        ody=dy;
        olen=1;
      }

      odx/=olen;
      ody/=olen;

      const localRadius=
        Math.max(
          55,
          Math.min(
            nearOwnerDistance*.78,
            Math.max(
              55,
              Number(config.nearOwnerRadius)||
              distance
            )
          )
        );

      targetX=
        Number(owner.x)+
        odx*localRadius;
      targetY=
        Number(owner.y)+
        ody*localRadius;
    }

    const open=
      WorldGeometryService.nearestOpenPoint(
        targetX,
        targetY,
        Math.max(
          2,
          Number(entity.radius)||20
        )
      );
    if(open){
      targetX=Number(open.x);
      targetY=Number(open.y);
    }

    const state=this.state(entity);
    state.damageEscapeTarget={
      x:targetX,
      y:targetY
    };
    state.damageEscapeSourceId=
      source?.alive&&
      RelationService.relation(
        entity,
        source
      )==='enemy'
        ?String(source.id||'')
        :null;
    state.damageEscapeUntil=
      now+
      Math.max(
        100,
        Number(config.duration)||650
      );
    state.path.length=0;
    state.pathIndex=0;
    state.enteredMeleeAt=0;
    return true;
  },

  damageEscape(
    entity,
    ai,
    state,
    now,
    frameScale
  ){
    const sourceId=String(
      state?.damageEscapeSourceId||''
    );
    const source=sourceId
      ?EntityService.items.get(sourceId)||null
      :null;

    if(
      source?.alive&&
      RelationService.relation(
        entity,
        source
      )==='enemy'&&
      !this.canPerceiveEnemy(
        entity,
        source,
        now
      )
    ){
      state.damageEscapeTarget=null;
      state.damageEscapeSourceId=null;
      state.damageEscapeUntil=0;
      return false;
    }

    const target=state?.damageEscapeTarget;
    if(
      !target||
      now>=Math.max(
        0,
        Number(state.damageEscapeUntil)||0
      )
    ){
      if(state){
        state.damageEscapeTarget=null;
        state.damageEscapeSourceId=null;
        state.damageEscapeUntil=0;
      }
      return false;
    }

    const dx=
      Number(target.x)-
      Number(entity.x);
    const dy=
      Number(target.y)-
      Number(entity.y);
    if(
      Math.hypot(dx,dy)<
      Math.max(
        10,
        Number(entity.radius)||20
      )
    ){
      state.damageEscapeTarget=null;
      state.damageEscapeSourceId=null;
      state.damageEscapeUntil=0;
      return false;
    }

    return MovementService.move(
      entity,
      dx,
      dy,
      frameScale,
      {
        speedOverride:
          Number.isFinite(
            Number(ai?.damageEscape?.speed)
          )
            ?Math.max(
              0,
              Number(ai.damageEscape.speed)
            )
            :Math.max(
              0,
              Number(entity.speed)||0
            )
      }
    );
  },

  attackTraversal(ai){
    const config=ai?.attackTraversal;
    if(
      !config||
      config.enabled!==true||
      !config.attackId
    )return null;

    return {
      enabled:true,
      attackId:String(config.attackId),
      attackInterval:
        Math.max(
          1,
          Number(config.attackInterval)||600
        ),
      maxBlockedCells:
        Math.max(
          1,
          Math.floor(Number(config.maxBlockedCells)||1)
        ),
      movementDistance:
        Math.max(
          1,
          Number(config.movementDistance)||0
        )
    };
  },

  attackWithMovementDistance(
    entity,
    target,
    attackId,
    now,
    movementDistance
  ){
    const base=
      AbilityService.attackById(
        EntityService.owner(entity)?.character,
        attackId
      )||
      AbilityService.attackById(
        entity.character,
        attackId
      );
    if(!base)return false;

    const stagedBase=
      this.resolveStageAttack(
        entity,
        base
      );
    const desiredDistance=
      Math.max(
        0,
        Number(movementDistance)||0
      );
    const modules=
      stagedBase.modules.map(module=>{
        if(
          module?.type!=='movement.move'||
          desiredDistance<=0
        )return module;

        return Object.freeze({
          ...module,
          distance:desiredDistance
        });
      });
    const prepared=
      AugmentService.prepareAttack(
        entity,
        Object.freeze({
          ...stagedBase,
          modules:Object.freeze(modules)
        }),
        now
      );
    const angle=Math.atan2(
      Number(target.y)-Number(entity.y),
      Number(target.x)-Number(entity.x)
    );
    const executed=
      TriggeredAttackService.execute(
        entity,
        prepared,
        angle
      );

    if(executed){
      NaturalHealthRegenActivityService.mark(
        entity,
        now
      );
    }
    return executed;
  },

  movementAttack(entity,point,config,state,now){
    if(!entity?.alive||!point||!config?.attackId)return false;
    if(now<Math.max(0,Number(state.nextMovementAttackAt)||0))return false;

    const traversalDistance=
      point.traversal==='movement-attack'
        ?Math.max(
          0,
          Number(point.traversalDistance)||0,
          Number(config.movementDistance)||0
        )
        :0;
    const executed=
      traversalDistance>0
        ?this.attackWithMovementDistance(
          entity,
          point,
          String(config.attackId),
          now,
          traversalDistance
        )
        :this.attack(
          entity,
          point,
          String(config.attackId),
          now,
          0
        );

    if(!executed)return false;
    state.nextMovementAttackAt=
      now+
      Math.max(
        1,
        Number(config.attackInterval)||
        Number(config.interval)||
        600
      );
    return true;
  },

  enemyAvoidDesperateConfig(ai){
    const config=
      ai?.enemyAvoidance?.desperateMode;
    if(
      !config||
      config.enabled!==true
    )return null;

    return {
      enabled:true,
      exitDistance:
        Math.max(
          0,
          Number(config.exitDistance)||0
        )
    };
  },

  clearEnemyAvoidDesperate(state){
    if(!state)return false;
    state.enemyAvoidDesperate=false;
    state.enemyAvoidDesperateTargetId=null;
    state.enemyAvoidPathFallback=false;
    state.enemyAvoidPath.length=0;
    state.enemyAvoidPathIndex=0;
    state.enemyAvoidPathAt=0;
    return true;
  },

  fleeEnemy(
    entity,
    owner,
    target,
    ai,
    state,
    now,
    frameScale
  ){
    if(!entity?.alive||!target?.alive)return false;

    const config=ai?.enemyAvoidance||{};
    const desperateConfig=
      this.enemyAvoidDesperateConfig(ai);
    const currentEnemyDistance=
      Math.hypot(
        Number(entity.x)-Number(target.x),
        Number(entity.y)-Number(target.y)
      );

    if(
      state.enemyAvoidDesperate===true&&
      desperateConfig&&
      desperateConfig.exitDistance>0&&
      currentEnemyDistance>=
        desperateConfig.exitDistance
    ){
      this.clearEnemyAvoidDesperate(state);
    }

    let dx=Number(entity.x)-Number(target.x);
    let dy=Number(entity.y)-Number(target.y);
    let length=Math.hypot(dx,dy);
    if(length<=.001){
      const seed=String(entity.id||'').split('').reduce((sum,char)=>sum+char.charCodeAt(0),0);
      const angle=(seed*2.399963229728653+now*.001)%(Math.PI*2);
      dx=Math.cos(angle);dy=Math.sin(angle);length=1;
    }
    dx/=length;
    dy/=length;

    const traversal=this.attackTraversal(ai);
    const cellSize=
      Math.max(
        16,
        Number(ai?.pathCellSize)||
        GridPathfindingService.DEFAULT_CELL
      );
    const recalcMs=
      Math.max(
        50,
        Number(config.pathRecalcMs)||180
      );
    const pathDistance=
      Math.max(
        cellSize*2,
        Number(config.pathDistance)||260
      );
    const pathConsumed=
      !Array.isArray(state.enemyAvoidPath)||
      !state.enemyAvoidPath.length||
      state.enemyAvoidPathIndex>=
        state.enemyAvoidPath.length;
    const desperate=
      state.enemyAvoidDesperate===true;

    if(
      pathConsumed||
      (
        !desperate&&
        now-Math.max(
          0,
          Number(state.enemyAvoidPathAt)||0
        )>=recalcMs
      )
    ){
      const fleeTarget={
        x:Number(entity.x)+dx*pathDistance,
        y:Number(entity.y)+dy*pathDistance
      };
      const open=
        WorldGeometryService.nearestOpenPoint(
          fleeTarget.x,
          fleeTarget.y,
          Math.max(
            2,
            Number(entity.radius)||20
          )
        );
      const resolvedTarget=
        open||
        fleeTarget;

      let result=
        GridPathfindingService.findPath(
          entity,
          resolvedTarget,
          {
            radius:entity.radius,
            cellSize,
            maxExpansions:ai.maxPathExpansions,
            traversal
          }
        );
      let fallback=false;

      const fleeEnd=
        (
          Array.isArray(result.path)&&
          result.path.length
        )
          ?result.path[result.path.length-1]
          :entity;
      const fleeEndEnemyDistance=
        Math.hypot(
          Number(fleeEnd.x)-Number(target.x),
          Number(fleeEnd.y)-Number(target.y)
        );
      const minimumEscapeGain=
        Math.max(
          12,
          cellSize*.35
        );
      const meaningfulEscape=
        result.found===true&&
        fleeEndEnemyDistance>=
          currentEnemyDistance+
          minimumEscapeGain;

      if(
        !meaningfulEscape&&
        config.fallbackToEnemyWhenTrapped===true
      ){
        result=
          GridPathfindingService.findPath(
            entity,
            target,
            {
              radius:entity.radius,
              cellSize,
              maxExpansions:ai.maxPathExpansions,
              traversal
            }
          );
        fallback=true;

        if(
          desperateConfig?.enabled===true
        ){
          state.enemyAvoidDesperate=true;
          state.enemyAvoidDesperateTargetId=
            String(target.id||'');
        }
      }

      state.enemyAvoidPath=
        Array.isArray(result.path)
          ?result.path
          :[];
      state.enemyAvoidPathIndex=0;
      state.enemyAvoidPathAt=now;
      state.enemyAvoidPathFallback=fallback;
    }

    const threshold=Math.max(8,cellSize*.45);
    let waypoint=null;
    while(
      state.enemyAvoidPathIndex<
      state.enemyAvoidPath.length
    ){
      const candidate=
        state.enemyAvoidPath[
          state.enemyAvoidPathIndex
        ];
      if(
        Math.hypot(
          Number(candidate.x)-Number(entity.x),
          Number(candidate.y)-Number(entity.y)
        )>=threshold
      ){
        waypoint=candidate;
        break;
      }
      state.enemyAvoidPathIndex++;
    }

    const movementConfig=
      waypoint?.traversal==='movement-attack'&&
      traversal
        ?traversal
        :config;

    if(
      waypoint?.traversal==='movement-attack'
    ){
      this.movementAttack(
        entity,
        waypoint,
        movementConfig,
        state,
        now
      );
      return true;
    }

    if(waypoint){
      if(
        this.movementAttack(
          entity,
          waypoint,
          config,
          state,
          now
        )
      )return true;

      return MovementService.move(
        entity,
        Number(waypoint.x)-Number(entity.x),
        Number(waypoint.y)-Number(entity.y),
        frameScale,
        {
          speedOverride:
            Math.max(
              0,
              Number(config.speed)||
              Number(entity.speed)||
              0
            )
        }
      );
    }

    if(state.enemyAvoidDesperate===true){
      return MovementService.move(
        entity,
        dx,
        dy,
        frameScale,
        {
          speedOverride:
            Math.max(
              0,
              Number(config.speed)||
              Number(entity.speed)||
              0
            )
        }
      );
    }

    const attackDistance=
      Math.max(
        40,
        Number(config.attackAimDistance)||
        Number(ai?.meleeRange)||
        95
      );
    const fleePoint={
      x:Number(entity.x)+dx*attackDistance,
      y:Number(entity.y)+dy*attackDistance
    };
    if(
      this.movementAttack(
        entity,
        fleePoint,
        config,
        state,
        now
      )
    )return true;

    return MovementService.move(
      entity,
      dx,
      dy,
      frameScale,
      {
        speedOverride:
          Math.max(
            0,
            Number(config.speed)||
            Number(entity.speed)||
            0
          )
      }
    );
  },

  projectileRemainingDistance(projectile){
    if(!projectile)return 0;

    const travel=Math.max(0,Number(projectile.travel)||0);

    if(
      projectile.targetPoint&&
      Number.isFinite(Number(projectile.targetDistance))
    ){
      return Math.max(0,Number(projectile.targetDistance)-travel);
    }

    return Math.max(
      0,
      (Number(projectile.attack?.range)||0)-travel
    );
  },

  projectileRayCircleDistance(
    originX,
    originY,
    dirX,
    dirY,
    centerX,
    centerY,
    radius,
    maxDistance
  ){
    const ox=Number(originX)-Number(centerX);
    const oy=Number(originY)-Number(centerY);
    const r=Math.max(0,Number(radius)||0);
    const c=ox*ox+oy*oy-r*r;

    if(c<=0)return 0;

    const b=ox*dirX+oy*dirY;
    if(b>=0)return Infinity;

    const discriminant=b*b-c;
    if(discriminant<0)return Infinity;

    const distance=-b-Math.sqrt(discriminant);
    if(
      distance<0||
      distance>Math.max(0,Number(maxDistance)||0)
    )return Infinity;

    return distance;
  },

  projectileCanCollideWithTarget(projectile,target){
    if(
      !projectile||
      !target?.alive||
      target.hidden
    )return false;

    if(
      target===projectile.source&&
      projectile.allowSourceTarget!==true
    )return false;

    if(!ProjectileTargetFilterService.allows(projectile,target))return false;

    const configuredRelations=
      Array.isArray(projectile.targetRelations)
        ?projectile.targetRelations
        :null;
    const relation=RelationService.relation(
      projectile.source,
      target
    );

    if(projectile.targetEntityOnly===true){
      const designated=EntityTargetReferenceService.resolve(
        projectile.targetEntityId
      );
      if(designated!==target)return false;
    }

    if(configuredRelations){
      if(!configuredRelations.includes(relation))return false;

      if(
        relation!=='enemy'&&
        projectile.friendlyRequiresResource
      ){
        const resource=String(
          projectile.friendlyRequiresResource
        );
        const maximum=
          resource==='stamina'
            ?Math.max(0,Number(target.maxStamina)||0)
            :resource==='health'
              ?Math.max(0,Number(target.maxHealth)||0)
              :1;
        if(maximum<=0)return false;
      }

      if(
        Array.isArray(projectile.targetKinds)&&
        projectile.targetKinds.length&&
        !projectile.targetKinds.includes(
          String(target.kind||'')
        )
      )return false;

      return true;
    }

    return RelationService.canTarget(
      projectile.source,
      target,
      {},
      projectile.attack
    );
  },

  projectilePredictedCollision(projectile){
    if(!projectile)return null;

    const remaining=this.projectileRemainingDistance(projectile);
    const startX=Number(projectile.x)||0;
    const startY=Number(projectile.y)||0;

    if(remaining<=.001){
      return {x:startX,y:startY,distance:0,type:'range'};
    }

    const angle=
      Number.isFinite(Number(projectile.angle))
        ?Number(projectile.angle)
        :Math.atan2(
          Number(projectile.vy)||0,
          Number(projectile.vx)||0
        );
    const dirX=Math.cos(angle);
    const dirY=Math.sin(angle);

    let bestDistance=remaining;
    let bestType='range';

    const policy=
      projectile.behavior?.collisionPolicy||
      CollisionPolicyService.normalize({
        passWalls:projectile.behavior?.pierce?.walls===true,
        passEnemies:projectile.behavior?.pierce?.targets===true
      });

    const wallAction=
      projectile.behavior?.collision?.wall||
      'remove';

    const passWallsInFlight=
      policy.passWalls||
      TargetPointProjectileService
        .arrival(projectile)
        ?.passWallsInFlight===true;

    if(
      !passWallsInFlight&&
      wallAction!=='clamp'&&
      wallAction!=='stop'&&
      wallAction!=='return'
    ){
      const wallDistance=
        WorldGeometryService.raycastDistance(
          startX,
          startY,
          angle,
          remaining,
          ProjectileService.wallCollisionPadding(projectile)
        );

      if(
        Number.isFinite(wallDistance)&&
        wallDistance<bestDistance-1e-6
      ){
        bestDistance=Math.max(0,wallDistance);
        bestType='wall';
      }
    }

    const collidesWithTargets=
      projectile.damageOnTravel!==false||
      projectile.projectile?.collisionTargets===true;

    if(
      collidesWithTargets&&
      policy.passEnemies!==true
    ){
      const projectileRadius=Math.max(
        0,
        Number(projectile.hitRadius)||
        Number(projectile.radius)||
        0
      );

      for(const target of EntityService.items.values()){
        if(
          !this.projectileCanCollideWithTarget(
            projectile,
            target
          )
        )continue;

        const targetPoint=
          NetworkCollisionPositionService.point(target);
        const targetRadius=Math.max(
          0,
          Number(target.radius)||0
        );

        const hitDistance=
          this.projectileRayCircleDistance(
            startX,
            startY,
            dirX,
            dirY,
            Number(targetPoint.x)||0,
            Number(targetPoint.y)||0,
            projectileRadius+targetRadius,
            bestDistance
          );

        if(hitDistance<bestDistance-1e-6){
          bestDistance=hitDistance;
          bestType='target';
        }
      }
    }

    return {
      x:startX+dirX*bestDistance,
      y:startY+dirY*bestDistance,
      distance:bestDistance,
      type:bestType
    };
  },

  projectileImpactPoint(projectile){
    const predicted=this.projectilePredictedCollision(projectile);

    if(predicted){
      return {
        x:Number(predicted.x)||0,
        y:Number(predicted.y)||0
      };
    }

    if(
      projectile?.targetPoint&&
      Number.isFinite(Number(projectile.targetPoint.x))&&
      Number.isFinite(Number(projectile.targetPoint.y))
    ){
      return {
        x:Number(projectile.targetPoint.x),
        y:Number(projectile.targetPoint.y)
      };
    }

    return {
      x:Number(projectile?.x)||0,
      y:Number(projectile?.y)||0
    };
  },

  projectileFollowupAttacks(projectile,now=performance.now()){
    const source=projectile?.source;
    if(!source?.character)return [];

    const ids=[];
    const impact=projectile.behavior?.impact;

    for(const id of impact?.attackIds||[]){
      const key=String(id||'');
      if(key&&!ids.includes(key))ids.push(key);
    }

    for(
      const id of
      impact?.sourceRelocate?.onEndAttackIds||
      []
    ){
      const key=String(id||'');
      if(key&&!ids.includes(key))ids.push(key);
    }

    const result=[];
    for(const attackId of ids){
      const base=
        AbilityService.attackById(
          source.character,
          attackId
        );
      if(!base)continue;

      const attack=
        AugmentService.prepareAttack(
          source,
          ProgressScaledAttackService.resolve(
            source,
            base
          ),
          now
        );
      const area=
        AttackModuleService.module(
          attack,
          'delivery.area'
        );
      const range=
        Math.max(
          0,
          Number(area?.range)||
          Number(attack?.range)||0
        );
      if(range<=0)continue;

      result.push({
        attack,
        range
      });
    }

    return result;
  },

  projectileFollowupThreat(
    entity,
    projectile,
    now=performance.now()
  ){
    const point=
      this.projectileImpactPoint(
        projectile
      );
    if(!point)return null;

    const vx=Number(projectile?.vx)||0;
    const vy=Number(projectile?.vy)||0;
    const speedSq=vx*vx+vy*vy;
    if(speedSq>1e-6){
      const toImpactX=
        Number(point.x)-Number(projectile.x);
      const toImpactY=
        Number(point.y)-Number(projectile.y);

      // 예측 착탄점까지 이미 지나간 투사체는 후속 폭발 위협으로 유지하지 않는다.
      if(toImpactX*vx+toImpactY*vy<=.001){
        return null;
      }
    }

    const followups=
      this.projectileFollowupAttacks(
        projectile,
        now
      );
    if(!followups.length)return null;

    const entityRadius=
      Math.max(
        0,
        Number(entity?.radius)||0
      );
    const distance=
      Math.hypot(
        Number(entity.x)-Number(point.x),
        Number(entity.y)-Number(point.y)
      );
    const maxRange=
      followups.reduce(
        (value,item)=>
          Math.max(
            value,
            Math.max(
              0,
              Number(item.range)||0
            )
          ),
        0
      );

    if(distance>maxRange+entityRadius){
      return null;
    }

    let dx=
      Number(entity.x)-Number(point.x);
    let dy=
      Number(entity.y)-Number(point.y);
    let length=Math.hypot(dx,dy);

    if(length<=.001){
      const angle=
        Number.isFinite(Number(projectile.angle))
          ?Number(projectile.angle)+Math.PI/2
          :Math.atan2(
            Number(projectile.vy)||0,
            Number(projectile.vx)||0
          )+Math.PI/2;
      dx=Math.cos(angle);
      dy=Math.sin(angle);
      length=1;
    }

    return {
      projectile,
      followup:true,
      impactPoint:point,
      distance,
      followupRange:maxRange,
      x:dx/length,
      y:dy/length
    };
  },

  projectileThreat(
    entity,
    ai
  ){
    const config=ai?.projectileAvoidance;
    if(
      !config||
      config.enabled===false
    )return null;

    const range=
      Math.max(
        0,
        Number(config.range)||0
      );
    if(range<=0)return null;

    let best=null;
    let bestTime=Infinity;

    for(const projectile of ProjectileService.items){
      if(
        !projectile||
        !projectile.source||
        RelationService.relation(
          entity,
          projectile.source
        )!=='enemy'
      )continue;

      const followupThreat=
        this.projectileFollowupThreat(
          entity,
          projectile
        );
      if(
        followupThreat&&
        bestTime>0
      ){
        bestTime=0;
        best=followupThreat;
      }

      const px=Number(projectile.x)||0;
      const py=Number(projectile.y)||0;
      const ex=Number(entity.x)||0;
      const ey=Number(entity.y)||0;
      const rx=ex-px;
      const ry=ey-py;
      const centerDistance=Math.hypot(rx,ry);

      const projectileRadius=
        Math.max(
          0,
          Number(projectile.hitRadius)||
          Number(projectile.radius)||0
        );
      const entityRadius=
        Math.max(
          0,
          Number(entity.radius)||0
        );
      const collisionRadius=
        projectileRadius+
        entityRadius;

      if(
        centerDistance>
        range+
        collisionRadius
      )continue;

      const vx=
        Number.isFinite(Number(projectile.vx))
          ?Number(projectile.vx)
          :Math.cos(
            Number(projectile.angle)||0
          )*
          Math.max(
            0,
            Number(projectile.speed)||0
          );
      const vy=
        Number.isFinite(Number(projectile.vy))
          ?Number(projectile.vy)
          :Math.sin(
            Number(projectile.angle)||0
          )*
          Math.max(
            0,
            Number(projectile.speed)||0
          );
      const speedSq=vx*vx+vy*vy;
      if(speedSq<=1e-6)continue;

      const approachDot=
        rx*vx+
        ry*vy;

      // 이미 중심선을 지나 멀어지는 탄환은 즉시 위협에서 제외.
      if(approachDot<=.001)continue;

      const timeToClosest=
        approachDot/
        speedSq;
      if(timeToClosest<=.001)continue;

      const lookAhead=
        Math.max(
          1,
          Number(config.lookAheadFrames)||28
        );
      if(timeToClosest>lookAhead)continue;

      const closestX=
        rx-
        vx*timeToClosest;
      const closestY=
        ry-
        vy*timeToClosest;
      const closestDistance=
        Math.hypot(
          closestX,
          closestY
        );

      if(
        closestDistance>
        collisionRadius
      )continue;

      /*
        timeToClosest는 투사체 중심이 대상 중심선에 가장 가까워지는 시점이다.
        실제 피격은 그보다 앞서 projectileRadius + entityRadius 경계에
        처음 진입할 때 발생하므로, 저스트 회피 타이밍은 최초 접촉 시점을 사용한다.
      */
      const contactOffset=
        Math.sqrt(
          Math.max(
            0,
            collisionRadius*collisionRadius-
            closestDistance*closestDistance
          )/
          speedSq
        );
      const timeToContact=
        Math.max(
          0,
          timeToClosest-
          contactOffset
        );

      if(timeToContact>=bestTime)continue;

      const speed=Math.sqrt(speedSq);
      const nx=vx/speed;
      const ny=vy/speed;
      const cross=
        vx*ry-
        vy*rx;
      const side=
        Math.abs(cross)>.001
          ?(
            cross>0
              ?1
              :-1
          )
          :(
            String(entity.id||'')
              .length%2===0
              ?1
              :-1
          );

      bestTime=timeToContact;
      best={
        projectile,
        distance:centerDistance,
        closestDistance,
        collisionRadius,
        timeToClosest,
        timeToContact,
        x:-ny*side,
        y:nx*side
      };
    }

    return best;
  },

  projectileAvoid(
    entity,
    ai,
    state,
    now,
    frameScale
  ){
    const threat=
      this.projectileThreat(
        entity,
        ai
      );
    if(threat){
      state.projectileAvoidVector={
        x:Number(threat.x)||0,
        y:Number(threat.y)||0
      };
      state.projectileAvoidUntil=
        now+
        Math.max(
          80,
          Number(
            ai?.projectileAvoidance
              ?.holdMs
          )||220
        );
    }

    if(
      !state.projectileAvoidVector||
      now>=Math.max(
        0,
        Number(state.projectileAvoidUntil)||0
      )
    ){
      state.projectileAvoidVector=null;
      state.projectileAvoidUntil=0;
      return false;
    }

    return MovementService.move(
      entity,
      Number(
        state.projectileAvoidVector.x
      )||0,
      Number(
        state.projectileAvoidVector.y
      )||0,
      frameScale,
      {
        speedOverride:
          Number.isFinite(
            Number(
              ai?.projectileAvoidance
                ?.speed
            )
          )
            ?Math.max(
              0,
              Number(
                ai.projectileAvoidance
                  .speed
              )
            )
            :Math.max(
              0,
              Number(entity.speed)||0
            )
      }
    );
  },

  fieldThreats(entity,ai,now=performance.now()){
    const config=ai?.fieldAvoidance;
    if(
      !entity?.alive||
      !config||
      config.enabled!==true
    )return [];

    const result=[];
    const padding=
      Math.max(
        0,
        Number(config.detectionPadding)||0
      );
    const point=
      NetworkCollisionPositionService.point(
        entity
      );

    for(const source of EntityService.items.values()){
      if(
        !source?.alive||
        !source.actionState||
        RelationService.relation(
          entity,
          source
        )!=='enemy'
      )continue;

      for(const state of source.actionState.values()){
        if(
          state?.kind!==
            InstalledAreaFieldService.KIND||
          state.phase==='afterlife'||
          now>=Number(state.endsAt||Infinity)||
          (
            Number.isFinite(
              Number(state.module?.activeDuration)
            )&&
            now>=
              Number(state.startedAt||0)+
              Math.max(
                0,
                Number(state.module.activeDuration)||0
              )
          )
        )continue;

        const damaging=
          (
            state.attack&&
            Math.max(
              0,
              Number(state.attack.damageRatio)||0
            )>0
          )||
          state.module?.damageOnTrigger===true;

        if(!damaging)continue;

        if(
          !InstalledAreaFieldService.relationAllowed(
            source,
            entity,
            state.module
          )
        )continue;

        const area=
          InstalledAreaFieldService.collisionArea(
            state,
            now
          );
        if(!area)continue;

        const geometry=
          state.areaGeometry||
          (
            area.module.shape==='circle'||
            area.module.shape==='sector'||
            area.module.shape==='tapered-rect'
              ?AreaGeometryService.polygon(
                area.source,
                area.module,
                area.angle
              )
              :null
          );

        if(
          !InstalledAreaFieldService.overlapsAreaPoint(
            area,
            point.x,
            point.y,
            Math.max(
              0,
              Number(entity.radius)||0
            )+
            padding,
            geometry
          )
        )continue;

        const center=
          area.center||
          area.source;
        const dx=
          Number(point.x)-
          Number(center.x);
        const dy=
          Number(point.y)-
          Number(center.y);
        const distance=Math.hypot(dx,dy);

        result.push({
          source,
          state,
          area,
          geometry,
          center:{
            x:Number(center.x)||0,
            y:Number(center.y)||0
          },
          distance,
          key:
            `${String(source.id||'')}:${String(state.instanceId||state.storageKey||'field')}`
        });
      }
    }

    result.sort(
      (a,b)=>
        a.distance-b.distance||
        String(a.key).localeCompare(
          String(b.key)
        )
    );
    return result;
  },

  clearFieldAvoidDesperate(state){
    if(!state)return false;
    state.fieldAvoidDesperate=false;
    state.fieldAvoidThreatKey=null;
    state.fieldAvoidPath.length=0;
    state.fieldAvoidPathIndex=0;
    state.fieldAvoidPathAt=0;
    return true;
  },

  fieldThreatByKey(entity,ai,key,now=performance.now()){
    const wanted=String(key||'');
    if(!wanted)return null;
    return this.fieldThreats(
      entity,
      ai,
      now
    ).find(
      threat=>
        String(threat.key)===wanted
    )||null;
  },

  fieldAvoid(
    entity,
    ai,
    state,
    now,
    frameScale
  ){
    const config=ai?.fieldAvoidance;
    if(
      !config||
      config.enabled!==true
    ){
      this.clearFieldAvoidDesperate(state);
      return false;
    }

    let threat=
      state.fieldAvoidDesperate===true
        ?this.fieldThreatByKey(
          entity,
          ai,
          state.fieldAvoidThreatKey,
          now
        )
        :null;

    if(!threat){
      threat=
        this.fieldThreats(
          entity,
          ai,
          now
        )[0]||
        null;
    }

    if(!threat){
      this.clearFieldAvoidDesperate(state);
      return false;
    }

    const center=threat.center;
    let dx=
      Number(entity.x)-
      Number(center.x);
    let dy=
      Number(entity.y)-
      Number(center.y);
    let length=Math.hypot(dx,dy);

    if(length<=.001){
      const seed=
        String(entity.id||'')
          .split('')
          .reduce(
            (sum,char)=>
              sum+char.charCodeAt(0),
            0
          );
      const angle=
        (
          seed*2.399963229728653+
          now*.001
        )%
        (Math.PI*2);
      dx=Math.cos(angle);
      dy=Math.sin(angle);
      length=1;
    }

    dx/=length;
    dy/=length;

    const cellSize=
      Math.max(
        16,
        Number(ai?.pathCellSize)||
        GridPathfindingService.DEFAULT_CELL
      );
    const pathDistance=
      Math.max(
        cellSize*2,
        Number(config.pathDistance)||260
      );
    const recalcMs=
      Math.max(
        50,
        Number(config.pathRecalcMs)||180
      );
    const desperateConfig=
      config.desperateMode&&
      config.desperateMode.enabled===true
        ?config.desperateMode
        :null;

    if(
      state.fieldAvoidDesperate===true&&
      desperateConfig
    ){
      const exitPadding=
        Math.max(
          0,
          Number(
            desperateConfig.exitPadding
          )||0
        );
      const point=
        NetworkCollisionPositionService.point(
          entity
        );
      const stillInside=
        InstalledAreaFieldService
          .overlapsAreaPoint(
            threat.area,
            point.x,
            point.y,
            Math.max(
              0,
              Number(entity.radius)||0
            )+
            exitPadding,
            threat.geometry
          );

      if(!stillInside){
        this.clearFieldAvoidDesperate(
          state
        );
        return false;
      }
    }

    const pathConsumed=
      !Array.isArray(state.fieldAvoidPath)||
      !state.fieldAvoidPath.length||
      state.fieldAvoidPathIndex>=
        state.fieldAvoidPath.length;

    if(
      pathConsumed||
      (
        state.fieldAvoidDesperate!==true&&
        now-
          Math.max(
            0,
            Number(state.fieldAvoidPathAt)||0
          )>=recalcMs
      )
    ){
      const fleeTarget={
        x:
          Number(entity.x)+
          dx*pathDistance,
        y:
          Number(entity.y)+
          dy*pathDistance
      };
      const open=
        WorldGeometryService.nearestOpenPoint(
          fleeTarget.x,
          fleeTarget.y,
          Math.max(
            2,
            Number(entity.radius)||20
          )
        );
      const resolvedTarget=
        open||
        fleeTarget;
      const traversal=
        this.attackTraversal(ai);

      let result=
        GridPathfindingService.findPath(
          entity,
          resolvedTarget,
          {
            radius:entity.radius,
            cellSize,
            maxExpansions:
              ai.maxPathExpansions,
            traversal
          }
        );

      const end=
        (
          Array.isArray(result.path)&&
          result.path.length
        )
          ?result.path[
            result.path.length-1
          ]
          :entity;

      const currentThreatDistance=
        Math.hypot(
          Number(entity.x)-
            Number(center.x),
          Number(entity.y)-
            Number(center.y)
        );
      const endThreatDistance=
        Math.hypot(
          Number(end.x)-
            Number(center.x),
          Number(end.y)-
            Number(center.y)
        );
      const minimumEscapeGain=
        Math.max(
          12,
          cellSize*.35
        );
      const endInside=
        InstalledAreaFieldService
          .overlapsAreaPoint(
            threat.area,
            Number(end.x)||0,
            Number(end.y)||0,
            Math.max(
              0,
              Number(entity.radius)||0
            ),
            threat.geometry
          );

      const meaningfulEscape=
        result.found===true&&
        endInside!==true&&
        endThreatDistance>=
          currentThreatDistance+
          minimumEscapeGain;

      if(
        !meaningfulEscape&&
        config.fallbackToThreatWhenTrapped===true
      ){
        result=
          GridPathfindingService.findPath(
            entity,
            center,
            {
              radius:entity.radius,
              cellSize,
              maxExpansions:
                ai.maxPathExpansions,
              traversal
            }
          );

        if(desperateConfig){
          state.fieldAvoidDesperate=true;
          state.fieldAvoidThreatKey=
            String(threat.key);
        }
      }

      state.fieldAvoidPath=
        Array.isArray(result.path)
          ?result.path
          :[];
      state.fieldAvoidPathIndex=0;
      state.fieldAvoidPathAt=now;
    }

    const threshold=
      Math.max(
        8,
        cellSize*.45
      );
    let waypoint=null;

    while(
      state.fieldAvoidPathIndex<
      state.fieldAvoidPath.length
    ){
      const candidate=
        state.fieldAvoidPath[
          state.fieldAvoidPathIndex
        ];
      if(
        Math.hypot(
          Number(candidate.x)-
            Number(entity.x),
          Number(candidate.y)-
            Number(entity.y)
        )>=threshold
      ){
        waypoint=candidate;
        break;
      }
      state.fieldAvoidPathIndex++;
    }

    const traversal=
      this.attackTraversal(ai);
    if(
      waypoint?.traversal===
        'movement-attack'&&
      traversal
    ){
      this.movementAttack(
        entity,
        waypoint,
        traversal,
        state,
        now
      );
      return true;
    }

    if(waypoint){
      if(
        this.movementAttack(
          entity,
          waypoint,
          ai.enemyAvoidance||{},
          state,
          now
        )
      )return true;

      return MovementService.move(
        entity,
        Number(waypoint.x)-
          Number(entity.x),
        Number(waypoint.y)-
          Number(entity.y),
        frameScale,
        {
          speedOverride:
            Math.max(
              0,
              Number(entity.speed)||0
            )
        }
      );
    }

    if(state.fieldAvoidDesperate===true){
      return MovementService.move(
        entity,
        dx,
        dy,
        frameScale,
        {
          speedOverride:
            Math.max(
              0,
              Number(entity.speed)||0
            )
        }
      );
    }

    return MovementService.move(
      entity,
      dx,
      dy,
      frameScale,
      {
        speedOverride:
          Math.max(
            0,
            Number(entity.speed)||0
          )
      }
    );
  },

  interruptClusterPursuit(
    entity,
    owner,
    spec,
    now=performance.now()
  ){
    const ai=spec?.ai;
    if(!ai)return false;
    if(this.damageEscapeActive(entity,now)){
      return true;
    }
    if(
      ai.projectileAvoidance?.enabled===true&&
      this.projectileThreat(
        entity,
        ai
      )
    ){
      return true;
    }
    if(
      ai.fieldAvoidance?.enabled===true&&
      this.fieldThreats(
        entity,
        ai,
        now
      ).length
    ){
      return true;
    }
    if(
      ai.enemyAvoidance?.enabled!==true
    )return false;

    const mode=
      ModeStateService.current(
        owner,
        String(
          spec.modeState?.stateKey||
          ''
        ),
        String(
          spec.modeState?.initial||
          'guard'
        )
      );

    return !!this.nearestEnemy(
      entity,
      owner,
      ai,
      mode
    ).target;
  },

  attackInterval(
    entity,
    baseInterval,
    now=performance.now()
  ){
    const attackSpeedMult=
      Math.max(
        .0001,
        Number(
          CombatStatsService.current(
            entity,
            now
          ).attackSpeedMult
        )||1
      );

    return Math.max(
      1,
      Math.max(
        0,
        Number(baseInterval)||0
      )/
      attackSpeedMult
    );
  },

  nearestEnemy(
    entity,
    owner=null,
    ai=null,
    commandMode='guard',
    now=performance.now()
  ){
    let nearest=null;
    let distance=Infinity;

    const detectionOrigin=
      String(
        ai?.detectionOrigin||
        (
          Number(ai?.detectionRange)>0
            ?'self'
            :'owner'
        )
      );
    const detectionRange=
      Math.max(
        0,
        Number(ai?.detectionRange)||
        Number(ai?.ownerGuardRange)||
        0
      );
    const unrestricted=
      String(commandMode)===
        String(ai?.unrestrictedMode||'explore')||
      detectionRange<=0;

    const origin=
      detectionOrigin==='self'
        ?entity
        :owner;

    EntityService.forEachEnemy(
      entity,
      target=>{
        if(
          !this.canPerceiveEnemy(
            entity,
            target,
            now
          )
        )return;

        if(
          !unrestricted&&
          origin&&
          Math.hypot(
            Number(target.x)-Number(origin.x),
            Number(target.y)-Number(origin.y)
          )>
          detectionRange+
          (
            ai?.strictDetectionRange===true||
            ai?.strictOwnerGuardRange===true
              ?0
              :Math.max(
                0,
                Number(target.radius)||0
              )
          )
        ){
          return;
        }

        const d=Math.hypot(
          Number(target.x)-Number(entity.x),
          Number(target.y)-Number(entity.y)
        );
        if(d>=distance)return;
        nearest=target;
        distance=d;
      }
    );

    return {target:nearest,distance};
  },

  wanderAround(
    entity,
    anchor,
    ai,
    state,
    now,
    frameScale,
    wander,
    prefix='wander'
  ){
    if(!entity?.alive||!anchor?.alive||!wander)return false;

    const meleeRange=
      this.meleeRange(
        entity,
        entity.summonSpec,
        now
      );
    const minRadius=
      wander.minRadiusRef==='melee-range'
        ?meleeRange*Math.max(0,Number(wander.minRadiusRatio)||0)
        :Math.max(0,Number(wander.minRadius)||55);
    const maxRadius=
      wander.maxRadiusRef==='melee-range'
        ?Math.max(
          minRadius,
          meleeRange*Math.max(0,Number(wander.maxRadiusRatio)||1)
        )
        :Math.max(minRadius,Number(wander.maxRadius)||135);
    const retargetMin=Math.max(150,Number(wander.retargetMinMs)||650);
    const retargetMax=Math.max(retargetMin,Number(wander.retargetMaxMs)||1350);
    const cellSize=Number(ai.pathCellSize)||GridPathfindingService.DEFAULT_CELL;
    const anchorDistance=Math.hypot(
      Number(entity.x)-Number(anchor.x),
      Number(entity.y)-Number(anchor.y)
    );
    const nearAnchor=
      anchorDistance<=maxRadius+Math.max(12,Number(entity.radius)||0);
    const ignoreSpeedModifiersNearAnchor=
      wander.ignoreSpeedModifiersNearAnchor!==false;
    const applyMoveSpeedOnlyNearAnchor=
      wander.applyMoveSpeedOnlyNearAnchor!==false;

    const targetKey=`${prefix}Target`;
    const pathKey=`${prefix}Path`;
    const pathIndexKey=`${prefix}PathIndex`;
    const nextAtKey=`next${prefix[0].toUpperCase()}${prefix.slice(1)}TargetAt`;
    const seedKey=`${prefix}Seed`;
    const currentTarget=state[targetKey];
    const currentPath=Array.isArray(state[pathKey])?state[pathKey]:[];
    const currentIndex=Math.max(0,Number(state[pathIndexKey])||0);

    const needsTarget=
      !currentTarget||
      now>=Math.max(0,Number(state[nextAtKey])||0)||
      Math.hypot(
        Number(currentTarget?.x)-Number(entity.x),
        Number(currentTarget?.y)-Number(entity.y)
      )<Math.max(12,cellSize*.35);

    if(needsTarget){
      state[seedKey]=(Math.max(0,Number(state[seedKey])||0)+1)%100000;
      const seed=
        state[seedKey]+
        String(entity.id||'').split('').reduce((sum,ch)=>sum+ch.charCodeAt(0),0);
      const angle=(seed*2.399963229728653+Math.sin(seed*.731)*1.7)%(Math.PI*2);
      const radialMix=.5+.5*Math.sin(seed*1.913+.37);
      const radius=minRadius+(maxRadius-minRadius)*radialMix;
      const target={
        x:Number(anchor.x)+Math.cos(angle)*radius,
        y:Number(anchor.y)+Math.sin(angle)*radius
      };
      const result=GridPathfindingService.findPath(
        entity,
        target,
        {
          radius:entity.radius,
          cellSize,
          maxExpansions:ai.maxPathExpansions,
          dynamicObstacles:
            this.hostileFieldObstacles(
              entity,
              ai,
              {
                clearance:
                  Math.max(
                    0,
                    Number(
                      ai?.fieldAvoidance
                        ?.detectionPadding
                    )||0
                  ),
                now
              }
            )
        }
      );
      state[targetKey]=target;
      state[pathKey]=Array.isArray(result.path)?result.path:[];
      state[pathIndexKey]=0;
      const intervalMix=.5+.5*Math.sin(seed*.413+1.2);
      state[nextAtKey]=
        now+retargetMin+(retargetMax-retargetMin)*intervalMix;
    }else{
      state[pathKey]=currentPath;
      state[pathIndexKey]=currentIndex;
    }

    const threshold=Math.max(8,cellSize*.45);
    while(state[pathIndexKey]<state[pathKey].length){
      const waypoint=state[pathKey][state[pathIndexKey]];
      if(
        Math.hypot(
          Number(waypoint.x)-Number(entity.x),
          Number(waypoint.y)-Number(entity.y)
        )>=threshold
      ){
        return MovementService.move(
          entity,
          Number(waypoint.x)-Number(entity.x),
          Number(waypoint.y)-Number(entity.y),
          frameScale,
          {
            ...(nearAnchor&&ignoreSpeedModifiersNearAnchor?{ignoreSpeedModifiers:true}:{}),
            ...(
              Number.isFinite(Number(wander.moveSpeed))&&
              (
                !applyMoveSpeedOnlyNearAnchor||
                nearAnchor
              )
                ?{
                  speedOverride:
                    Math.max(
                      0,
                      Number(wander.moveSpeed)
                    )
                }
                :{}
            )
          }
        );
      }
      state[pathIndexKey]++;
    }

    const target=state[targetKey];
    if(!target)return false;
    return MovementService.move(
      entity,
      Number(target.x)-Number(entity.x),
      Number(target.y)-Number(entity.y),
      frameScale,
      {
        ...(nearAnchor&&ignoreSpeedModifiersNearAnchor?{ignoreSpeedModifiers:true}:{}),
        ...(
          Number.isFinite(Number(wander.moveSpeed))&&
          (
            !applyMoveSpeedOnlyNearAnchor||
            nearAnchor
          )
            ?{
              speedOverride:
                Math.max(
                  0,
                  Number(wander.moveSpeed)
                )
            }
            :{}
        )
      }
    );
  },

  idleWander(
    entity,
    owner,
    ai,
    state,
    now,
    frameScale
  ){
    return this.wanderAround(
      entity,
      owner,
      ai,
      state,
      now,
      frameScale,
      ai?.idleWander,
      'wander'
    );
  },

  targetWander(
    entity,
    target,
    ai,
    state,
    now,
    frameScale
  ){
    return this.wanderAround(
      entity,
      target,
      ai,
      state,
      now,
      frameScale,
      ai?.targetWander,
      'targetWander'
    );
  },

  stageAttackScale(entity,kind='range'){
    const scaling=entity?.summonSpec?.stageAttackScaling;
    if(!scaling)return 1;
    const stage=Math.max(1,Math.floor(Number(entity.clusterStage)||1));
    const step=
      kind==='movement'
        ?Math.max(0,Number(scaling.movementDistancePerStage)||0)
        :Math.max(0,Number(scaling.rangePerStage)||0);
    return 1+(stage-1)*step;
  },

  resolveStageAttack(entity,base){
    if(!base)return base;
    const rangeScale=this.stageAttackScale(entity,'range');
    const moveScale=this.stageAttackScale(entity,'movement');
    if(Math.abs(rangeScale-1)<.0001&&Math.abs(moveScale-1)<.0001)return base;
    const modules=(base.modules||[]).map(module=>{
      const type=AttackModuleService.type(module);
      if(type==='movement.move'&&Number.isFinite(Number(module.distance))){
        return Object.freeze({
          ...module,
          distance:Math.max(0,Number(module.distance)*moveScale)
        });
      }
      if(
        type==='delivery.area'&&
        Number.isFinite(Number(module.range))
      ){
        return Object.freeze({
          ...module,
          range:Math.max(0,Number(module.range)*rangeScale)
        });
      }
      if(
        type==='effect.spawn'&&
        module.animation&&
        Number.isFinite(Number(module.animation.distance))
      ){
        return Object.freeze({
          ...module,
          animation:Object.freeze({
            ...module.animation,
            distance:Math.max(0,Number(module.animation.distance)*moveScale)
          })
        });
      }
      return module;
    });
    return Object.freeze({
      ...base,
      range:Math.max(0,Number(base.range)||0)*rangeScale,
      modules:Object.freeze(modules)
    });
  },

  attack(
    entity,
    target,
    attackId,
    now,
    aimJitter=0
  ){
    const base=
      AbilityService.attackById(
        EntityService.owner(entity)?.character,
        attackId
      )||
      AbilityService.attackById(
        entity.character,
        attackId
      );

    if(!base)return false;

    const baseAngle=Math.atan2(
      Number(target.y)-Number(entity.y),
      Number(target.x)-Number(entity.x)
    );
    const jitter=Math.max(0,Number(aimJitter)||0);
    const angle=
      baseAngle+
      (jitter>0?(Math.random()-.5)*2*jitter:0);
    const stagedBase=
      this.resolveStageAttack(
        entity,
        base
      );
    const attack=
      AugmentService.prepareAttack(
        entity,
        stagedBase,
        now
      );

    const executed=
      TriggeredAttackService.execute(
        entity,
        attack,
        angle
      );

    if(executed){
      NaturalHealthRegenActivityService.mark(
        entity,
        now
      );
    }

    return executed;
  },

  chooseWaypoint(
    entity,
    target,
    state,
    ai,
    now
  ){
    const targetChanged=
      state.targetId!==target.id;
    const pathExhausted=
      !Array.isArray(state.path)||
      state.pathIndex>=state.path.length;
    const elapsed=
      now-
      Math.max(
        0,
        Number(state.lastPathAt)||0
      );
    const recalcMs=
      pathExhausted
        ?Math.max(
          50,
          Number(ai.emptyPathRecalcMs)||200
        )
        :Math.max(
          50,
          Number(ai.pathRecalcMs)||500
        );

    if(
      targetChanged||
      elapsed>=recalcMs
    ){
      const result=
        GridPathfindingService.findPath(
          entity,
          target,
          {
            radius:entity.radius,
            cellSize:
              ai.pathCellSize,
            maxExpansions:
              ai.maxPathExpansions
          }
        );

      state.targetId=target.id;
      state.path=
        Array.isArray(result.path)
          ?result.path
          :[];
      state.pathIndex=0;
      state.lastPathAt=now;
      state.pathAlgorithm=
        result.algorithm||
        'none';
    }

    const threshold=
      Math.max(
        4,
        (
          Number(ai.pathCellSize)||
          GridPathfindingService.DEFAULT_CELL
        )*.55
      );

    while(
      state.pathIndex<
        state.path.length
    ){
      const waypoint=
        state.path[
          state.pathIndex
        ];
      if(
        Math.hypot(
          waypoint.x-entity.x,
          waypoint.y-entity.y
        )>=threshold
      ){
        return waypoint;
      }
      state.pathIndex++;
    }

    return target;
  },

  meleeRange(
    entity,
    spec,
    now=performance.now()
  ){
    const ai=spec?.ai;
    if(!ai)return 0;

    if(
      ai.rangeField&&
      typeof ai.rangeField==='object'
    ){
      const prepared=
        AugmentService.prepareRangeField(
          entity,
          ai.rangeField,
          now
        );
      return Math.max(
        0,
        Number(prepared?.range)||0
      );
    }

    if(
      ai.meleeAttackId&&
      ai.useAttackRangeForMelee!==false
    ){
      return AugmentService.preparedAttackRange(
        entity,
        ai.meleeAttackId,
        now,
        Number(ai.meleeRange)||0
      )*
      this.stageAttackScale(
        entity,
        'range'
      );
    }

    return Math.max(
      0,
      Number(ai.meleeRange)||0
    )*
    this.stageAttackScale(
      entity,
      'range'
    );
  },

  supportRecipient(
    entity,
    owner,
    spec,
    ai
  ){
    const deployState=
      owner&&entity?.summonStateKey
        ?SummonDeployService.state(
          owner,
          entity.summonStateKey,
          false
        )
        :null;
    if(!deployState)return null;

    const relations=
      Array.isArray(ai?.targetRelations)
        ?ai.targetRelations
        :['ally'];
    const kinds=
      Array.isArray(ai?.targetKinds)
        ?ai.targetKinds
        :null;
    const property=
      String(
        ai?.recipientStateProperty||
        'recipientEntityId'
      );

    const valid=target=>{
      if(
        !target?.alive||
        target.hidden||
        target===entity
      )return false;

      const relation=
        RelationService.relation(
          entity,
          target
        );
      if(!relations.includes(relation)){
        return false;
      }

      if(
        relation!=='enemy'&&
        String(
          ai.friendlyRequiresResource||
          'stamina'
        )==='stamina'&&
        Math.max(
          0,
          Number(target.maxStamina)||0
        )<=0
      ){
        return false;
      }

      if(
        kinds&&
        kinds.length&&
        !kinds.includes(
          String(target.kind||'')
        )
      )return false;

      return true;
    };

    let target=
      deployState[property]
        ?EntityTargetReferenceService.resolve(
          deployState[property]
        )
        :null;

    if(valid(target))return target;

    target=null;
    let nearestDistance=Infinity;

    for(
      const candidate of
      EntityService.items.values()
    ){
      if(!valid(candidate))continue;

      const distance=Math.hypot(
        Number(candidate.x)-
          Number(entity.x),
        Number(candidate.y)-
          Number(entity.y)
      );
      if(distance>=nearestDistance){
        continue;
      }

      target=candidate;
      nearestDistance=distance;
    }

    deployState[property]=
      EntityTargetReferenceService.encode(
        target
      );

    return target;
  },

  updateStationarySupportProjectile(
    entity,
    owner,
    spec,
    ai,
    now
  ){
    const state=this.state(entity);
    if(!state)return false;

    const target=
      this.supportRecipient(
        entity,
        owner,
        spec,
        ai
      );
    if(!target)return false;

    if(state.supportInitialized!==true){
      state.supportInitialized=true;
      state.nextSupportAt=
        now+
        this.attackInterval(
          entity,
          Math.max(
            1,
            Number(ai.interval)||2000
          ),
          now
        );
      return true;
    }

    if(
      now<
      Math.max(
        0,
        Number(state.nextSupportAt)||0
      )
    )return true;

    const attackId=
      String(ai.attackId||'');
    const baseAttack=
      AbilityService.attackById(
        owner?.character,
        attackId
      )||
      AbilityService.attackById(
        entity.character,
        attackId
      );
    if(!baseAttack)return false;

    const dx=
      Number(target.x)-
      Number(entity.x);
    const dy=
      Number(target.y)-
      Number(entity.y);
    const angle=
      Math.atan2(dy,dx);
    const attack=
      AugmentService.prepareAttack(
        entity,
        baseAttack,
        now
      );

    const executed=
      TriggeredAttackService.execute(
        entity,
        attack,
        angle,
        {
          targetEntityId:
            EntityTargetReferenceService.encode(
              target
            )
        }
      );

    if(executed){
      state.nextSupportAt=
        now+
        this.attackInterval(
          entity,
          Math.max(
            1,
            Number(ai.interval)||2000
          ),
          now
        );
      NaturalHealthRegenActivityService.mark(
        entity,
        now
      );
    }

    return executed;
  },

  enemyObstacles(
    entity,
    {
      dangerRadius=0,
      clearance=0,
      now=performance.now()
    }={}
  ){
    const result=[];
    EntityService.forEachEnemy(
      entity,
      target=>{
        if(
          !target?.alive||
          !this.canPerceiveEnemy(
            entity,
            target,
            now
          )
        )return;
        result.push({
          x:Number(target.x)||0,
          y:Number(target.y)||0,
          radius:
            Math.max(
              Math.max(
                0,
                Number(target.radius)||0
              ),
              Math.max(
                0,
                Number(dangerRadius)||0
              )
            ),
          clearance:
            Math.max(
              0,
              Number(clearance)||0
            )
        });
      }
    );
    return result;
  },

  hostileFieldObstacles(
    entity,
    ai,
    {
      clearance=0,
      now=performance.now()
    }={}
  ){
    const config=ai?.fieldAvoidance;
    if(
      !entity?.alive||
      !config||
      config.enabled!==true
    )return [];

    const result=[];

    for(const source of EntityService.items.values()){
      if(
        !source?.alive||
        !source.actionState||
        RelationService.relation(
          entity,
          source
        )!=='enemy'
      )continue;

      for(const state of source.actionState.values()){
        if(
          state?.kind!==
            InstalledAreaFieldService.KIND||
          state.phase==='afterlife'||
          now>=Number(state.endsAt||Infinity)||
          (
            Number.isFinite(
              Number(state.module?.activeDuration)
            )&&
            now>=
              Number(state.startedAt||0)+
              Math.max(
                0,
                Number(state.module.activeDuration)||0
              )
          )
        )continue;

        const damaging=
          (
            state.attack&&
            Math.max(
              0,
              Number(state.attack.damageRatio)||0
            )>0
          )||
          state.module?.damageOnTrigger===true;

        if(!damaging)continue;

        if(
          !InstalledAreaFieldService.relationAllowed(
            source,
            entity,
            state.module
          )
        )continue;

        const area=
          InstalledAreaFieldService.collisionArea(
            state,
            now
          );
        if(!area)continue;

        const shape=String(
          area.module?.shape||
          'circle'
        );
        const range=
          Math.max(
            0,
            Number(area.module?.range)||0
          );
        const halfWidth=
          Math.max(
            0,
            Number(area.module?.halfWidth)||0
          );

        let x=Number(area.source?.x)||0;
        let y=Number(area.source?.y)||0;
        let radius=range;

        if(
          shape==='rect'||
          shape==='tapered-rect'
        ){
          const angle=Number(area.angle)||0;
          x+=Math.cos(angle)*range*.5;
          y+=Math.sin(angle)*range*.5;
          radius=Math.hypot(
            range*.5,
            halfWidth
          );
        }else if(shape==='sector'){
          radius=range;
        }

        result.push({
          x,
          y,
          radius,
          clearance:
            Math.max(
              0,
              Number(clearance)||0
            ),
          sourceId:String(source.id||''),
          fieldKey:String(
            state.instanceId||
            state.storageKey||
            ''
          )
        });
      }
    }

    return result;
  },

  segmentCrossesHostileField(
    entity,
    target,
    ai,
    now=performance.now()
  ){
    if(
      !entity?.alive||
      !target
    )return false;

    const obstacles=
      this.hostileFieldObstacles(
        entity,
        ai,
        {
          clearance:
            Math.max(
              0,
              Number(
                ai?.fieldAvoidance
                  ?.detectionPadding
              )||0
            ),
          now
        }
      );

    if(!obstacles.length)return false;

    return GridPathfindingService
      .segmentBlockedByDynamic(
        Number(entity.x)||0,
        Number(entity.y)||0,
        Number(target.x)||0,
        Number(target.y)||0,
        Math.max(
          0,
          Number(entity.radius)||0
        ),
        obstacles
      );
  },

  nearestEnemyAround(
    entity,
    origin,
    range,
    now=performance.now()
  ){
    if(!entity||!origin)return {target:null,distance:Infinity};
    let nearest=null;
    let distance=Infinity;
    const maxRange=Math.max(0,Number(range)||0);
    EntityService.forEachEnemy(entity,target=>{
      if(
        !target?.alive||
        !this.canPerceiveEnemy(
          entity,
          target,
          now
        )
      )return;
      const d=Math.hypot(Number(target.x)-Number(origin.x),Number(target.y)-Number(origin.y));
      if(maxRange>0&&d>maxRange+Math.max(0,Number(target.radius)||0))return;
      if(d>=distance)return;
      nearest=target;distance=d;
    });
    return {target:nearest,distance};
  },

  ownerThreatHold(entity,owner,ai,state,now,frameScale,options={}){
    const config=ai?.ownerThreatHold;
    if(!config||config.enabled===false||!owner?.alive){
      state.ownerThreatSafeAnchor=null;
      return false;
    }
    const threat=this.nearestEnemyAround(
      entity,
      owner,
      Math.max(0,Number(config.ownerThreatRange)||0),
      now
    );
    if(!threat.target){
      state.ownerThreatSafeAnchor=null;
      state.ownerThreatWanderTarget=null;
      state.ownerThreatWanderPath.length=0;
      state.ownerThreatWanderPathIndex=0;
      state.nextOwnerThreatWanderTargetAt=0;
      return false;
    }
    if(!state.ownerThreatSafeAnchor){
      state.ownerThreatSafeAnchor={alive:true,x:Number(entity.x)||0,y:Number(entity.y)||0};
      state.ownerThreatWanderTarget=null;
      state.ownerThreatWanderPath.length=0;
      state.ownerThreatWanderPathIndex=0;
      state.nextOwnerThreatWanderTargetAt=0;
    }

    const mergeTarget=options?.ownerThreatMergeTarget;
    if(mergeTarget?.alive){
      state.ownerThreatWanderTarget=null;
      state.ownerThreatWanderPath.length=0;
      state.ownerThreatWanderPathIndex=0;
      state.nextOwnerThreatWanderTargetAt=0;

      return MovementService.move(
        entity,
        Number(mergeTarget.x)-Number(entity.x),
        Number(mergeTarget.y)-Number(entity.y),
        frameScale,
        {
          speedOverride:
            Math.max(
              0,
              Number(ai?.idleWander?.moveSpeed)||
              Number(entity.speed)||
              0
            )
        }
      );
    }

    return this.wanderAround(
      entity,state.ownerThreatSafeAnchor,ai,state,now,frameScale,
      {
        minRadius:Math.max(0,Number(config.wanderMin)||18),
        maxRadius:Math.max(Math.max(0,Number(config.wanderMin)||18),Number(config.wanderMax)||70),
        retargetMinMs:Math.max(150,Number(config.retargetMinMs)||650),
        retargetMaxMs:Math.max(Math.max(150,Number(config.retargetMinMs)||650),Number(config.retargetMaxMs)||1350),
        moveSpeed:Math.max(0,Number(ai?.idleWander?.moveSpeed)||Number(entity.speed)||0),
        ignoreSpeedModifiersNearAnchor:false,
        applyMoveSpeedOnlyNearAnchor:false
      },
      'ownerThreatWander'
    );
  },

  ownerReturn(
    entity,
    owner,
    spec,
    ai,
    state,
    now,
    frameScale=1
  ){
    const config=ai?.ownerReturn;
    if(!config||!owner?.alive)return false;
    const distance=Math.hypot(
      Number(entity.x)-Number(owner.x),
      Number(entity.y)-Number(owner.y)
    );
    if(distance<=Math.max(0,Number(config.distance)||0))return false;

    const recalcMs=Math.max(50,Number(config.recalcMs)||260);
    if(
      !Array.isArray(state.ownerReturnPath)||
      !state.ownerReturnPath.length||
      now-Math.max(0,Number(state.ownerReturnPathAt)||0)>=recalcMs
    ){
      const result=GridPathfindingService.findPath(
        entity,
        owner,
        {
          radius:entity.radius,
          cellSize:Number(config.pathCellSize)||Number(ai.pathCellSize)||48,
          maxExpansions:Number(config.maxPathExpansions)||Number(ai.maxPathExpansions)||2600,
          dynamicObstacles:[
            ...(
              config.avoidEnemies===true
                ?this.enemyObstacles(
                  entity,
                  {
                    dangerRadius:
                      Math.max(
                        0,
                        Number(config.enemyDangerRadius)||0
                      ),
                    clearance:
                      Math.max(
                        0,
                        Number(config.enemyClearance)||0
                      ),
                    now
                  }
                )
                :[]
            ),
            ...this.hostileFieldObstacles(
              entity,
              ai,
              {
                clearance:
                  Math.max(
                    0,
                    Number(
                      ai?.fieldAvoidance
                        ?.detectionPadding
                    )||0
                  ),
                now
              }
            )
          ],
          traversal:this.attackTraversal(ai)
        }
      );
      state.ownerReturnPath=
        result.found&&
        Array.isArray(result.path)
          ?result.path
          :[];
      state.ownerReturnPathIndex=0;
      state.ownerReturnPathAt=now;
      state.ownerReturnPathFound=
        result.found===true;
    }

    const threshold=Math.max(8,(Number(config.pathCellSize)||Number(ai.pathCellSize)||48)*.45);
    let waypoint=null;
    while(state.ownerReturnPathIndex<state.ownerReturnPath.length){
      const candidate=state.ownerReturnPath[state.ownerReturnPathIndex];
      if(
        Math.hypot(
          Number(candidate.x)-Number(entity.x),
          Number(candidate.y)-Number(entity.y)
        )>=threshold
      ){
        waypoint=candidate;
        break;
      }
      state.ownerReturnPathIndex++;
    }

    if(
      waypoint?.traversal==='movement-attack'
    ){
      const traversal=
        this.attackTraversal(ai);
      if(traversal){
        this.movementAttack(
          entity,
          waypoint,
          traversal,
          state,
          now
        );
      }
      state.lastMeleeTargetId=null;
      state.enteredMeleeAt=0;
      return true;
    }

    if(waypoint&&this.movementAttack(entity,waypoint,config,state,now)){
      state.lastMeleeTargetId=null;
      state.enteredMeleeAt=0;
      return true;
    }

    if(waypoint){
      return MovementService.move(
        entity,
        Number(waypoint.x)-Number(entity.x),
        Number(waypoint.y)-Number(entity.y),
        frameScale,
        config.useBaseSpeed===false
          ?{}
          :{
            speedOverride:
              Math.max(0,Number(spec.speed)||0)
          }
      );
    }

    return false;
  },

  stationaryAutoAttack(
    entity,
    target,
    spec,
    ai,
    state,
    now
  ){
    if(
      ai?.stationary!==true||
      !ai?.meleeAttackId
    )return false;

    // Carryable stationary summons do not fire while being carried.
    if(
      SummonDeployService.isCarriedEntity(
        entity
      )
    ){
      state.lastMeleeTargetId=null;
      state.enteredMeleeAt=0;
      return true;
    }

    if(!target?.alive){
      state.lastMeleeTargetId=null;
      state.enteredMeleeAt=0;
      return true;
    }

    const range=
      this.meleeRange(
        entity,
        spec,
        now
      );
    const distance=
      Math.hypot(
        Number(target.x)-Number(entity.x),
        Number(target.y)-Number(entity.y)
      );

    if(
      distance>
      range+
      Math.max(
        0,
        Number(target.radius)||0
      )
    ){
      state.lastMeleeTargetId=null;
      state.enteredMeleeAt=0;
      return true;
    }

    const targetId=String(target.id||'');
    if(state.lastMeleeTargetId!==targetId){
      state.lastMeleeTargetId=targetId;
      state.enteredMeleeAt=now;
    }

    const windup=
      Math.max(
        0,
        Number(ai.meleeWindup)||0
      );
    if(
      now<
      Math.max(
        0,
        Number(state.enteredMeleeAt)||0
      )+
      windup
    )return true;

    if(
      now<
      Math.max(
        0,
        Number(state.nextMeleeAt)||0
      )
    )return true;

    const executed=
      this.attack(
        entity,
        target,
        String(ai.meleeAttackId),
        now,
        Number(ai.aimJitter)||0
      );

    if(executed){
      state.nextMeleeAt=
        now+
        this.attackInterval(
          entity,
          Math.max(
            1,
            Number(ai.meleeInterval)||800
          ),
          now
        );
    }

    return true;
  },


  chaseMeleeUpdate(
    entity,
    owner,
    spec,
    ai,
    now,
    frameScale=1
  ){
    const state=this.state(entity);
    if(!state)return false;

    const commandMode=
      ModeStateService.current(
        owner,
        String(spec.modeState?.stateKey||''),
        String(spec.modeState?.initial||'guard')
      );

    const nearest=this.nearestEnemy(
      entity,
      owner,
      ai,
      commandMode
    );
    const target=nearest.target;

    if(!target){
      state.targetId=null;
      state.path.length=0;
      state.pathIndex=0;
      state.enteredMeleeAt=0;

      if(ai.idleWander){
        return this.idleWander(
          entity,
          owner,
          ai,
          state,
          now,
          frameScale
        );
      }
      return false;
    }

    state.wanderTarget=null;
    state.wanderPath.length=0;
    state.wanderPathIndex=0;
    state.targetId=target.id;

    const meleeRange=
      this.meleeRange(
        entity,
        spec,
        now
      );

    const stopRange=
      ai.stopRangeRef==='melee-range'
        ?meleeRange*
          Math.max(
            0,
            Number(ai.stopRangeRatio)||1
          )
        :Math.max(
          0,
          Number(ai.stopRange)||
          meleeRange
        );

    const contactDistance=
      Math.max(
        0,
        Number(target.radius)||0
      );

    const inMelee=
      nearest.distance<
      meleeRange+
      contactDistance;

    if(inMelee){
      if(!state.enteredMeleeAt){
        const targetId=String(target.id||'');
        const sameRecentTarget=
          state.lastMeleeTargetId===targetId&&
          now-
          Math.max(
            0,
            Number(state.lastMeleeExitAt)||0
          )<500;

        state.enteredMeleeAt=now;
        state.lastMeleeTargetId=targetId;

        if(!sameRecentTarget){
          state.nextMeleeAt=
            now+
            Math.max(
              0,
              Number(ai.meleeWindup)||500
            );
        }
      }

      if(
        now>=state.nextMeleeAt&&
        ai.meleeAttackId
      ){
        const attacked=this.attack(
          entity,
          target,
          String(ai.meleeAttackId),
          now,
          Number(ai.aimJitter)||0
        );

        if(attacked){
          state.nextMeleeAt=
            now+
            this.attackInterval(
              entity,
              Number(ai.meleeInterval)||600,
              now
            );
        }
      }
    }else{
      if(state.enteredMeleeAt){
        state.lastMeleeTargetId=
          String(target.id||'');
        state.lastMeleeExitAt=now;
      }
      state.enteredMeleeAt=0;
    }

    if(ai.stationary===true){
      state.path.length=0;
      state.pathIndex=0;
      return inMelee;
    }

    if(nearest.distance<=stopRange){
      state.path.length=0;
      state.pathIndex=0;
      return true;
    }

    const waypoint=
      this.chooseWaypoint(
        entity,
        target,
        state,
        ai,
        now
      );

    return MovementService.move(
      entity,
      Number(waypoint.x)-Number(entity.x),
      Number(waypoint.y)-Number(entity.y),
      frameScale
    );
  },

  priorityUpdate(entity,owner,spec,now,frameScale=1,options={}){
    const ai=spec?.ai;
    if(!entity?.alive||!ai||ai.enabled===false||!EntitySimulationAuthorityService.isLocal(entity))return false;
    if(String(ai.type||'')==='stationary-support-projectile'){
      return this.updateStationarySupportProjectile(entity,owner,spec,ai,now);
    }
    if(MovementAbilityService.active(entity)||entity.forcedMotion)return true;
    const stats=CombatStatsService.current(entity,now);
    if(!stats.canAct)return true;

    const hasPriorityBehavior=
      ai.projectileAvoidance?.enabled===true||
      ai.fieldAvoidance?.enabled===true||
      ai.enemyAvoidance?.enabled===true||
      ai.damageEscape?.enabled===true||
      ai.ownerThreatHold?.enabled===true||
      !!ai.ownerReturn||
      ai.attackTraversal?.enabled===true;

    /*
      순수 chase-melee만 일반 추적/공격 루프로 보낸다.
      라임 어린 슬라임처럼 기존 우선행동 세트를 가진 소환수는
      아래의 회피/도주/주인 보호/복귀 흐름을 그대로 사용한다.
    */
    if(
      String(ai.type||'')==='chase-melee'&&
      !hasPriorityBehavior
    ){
      return this.chaseMeleeUpdate(
        entity,
        owner,
        spec,
        ai,
        now,
        frameScale
      );
    }

    const state=this.state(entity);

    if(this.projectileAvoid(entity,ai,state,now,frameScale))return true;
    if(this.fieldAvoid(entity,ai,state,now,frameScale))return true;

    const commandMode=ModeStateService.current(
      owner,
      String(spec.modeState?.stateKey||''),
      String(spec.modeState?.initial||'guard')
    );
    const nearest=this.nearestEnemy(entity,owner,ai,commandMode);

    if(
      this.stationaryAutoAttack(
        entity,
        nearest.target,
        spec,
        ai,
        state,
        now
      )
    )return true;

    // 1. 자기 주변 적 회피.
    if(
      ai.enemyAvoidance?.enabled===true&&
      state.enemyAvoidDesperate===true
    ){
      const desperateTarget=
        EntityService.items.get(
          String(
            state.enemyAvoidDesperateTargetId||
            ''
          )
        )||null;

      if(
        desperateTarget?.alive&&
        RelationService.relation(
          entity,
          desperateTarget
        )==='enemy'&&
        this.canPerceiveEnemy(
          entity,
          desperateTarget,
          now
        )
      ){
        state.targetId=
          String(desperateTarget.id||'');
        state.path.length=0;
        state.pathIndex=0;
        state.ownerThreatSafeAnchor=null;
        state.ownerThreatWanderTarget=null;
        state.ownerThreatWanderPath.length=0;
        state.ownerThreatWanderPathIndex=0;
        state.nextOwnerThreatWanderTargetAt=0;
        return this.fleeEnemy(
          entity,
          owner,
          desperateTarget,
          ai,
          state,
          now,
          frameScale
        );
      }

      this.clearEnemyAvoidDesperate(state);
    }

    if(ai.enemyAvoidance?.enabled===true&&nearest.target){
      state.targetId=String(nearest.target.id||'');
      state.path.length=0;state.pathIndex=0;
      state.ownerThreatSafeAnchor=null;
      state.ownerThreatWanderTarget=null;
      state.ownerThreatWanderPath.length=0;
      state.ownerThreatWanderPathIndex=0;
      state.nextOwnerThreatWanderTargetAt=0;
      return this.fleeEnemy(entity,owner,nearest.target,ai,state,now,frameScale);
    }
    state.targetId=null;
    this.clearEnemyAvoidDesperate(state);

    if(this.damageEscape(entity,ai,state,now,frameScale))return true;

    // 2A. 라임 주변 위협: 현재 안전 위치에서 배회.
    if(
      this.ownerThreatHold(
        entity,
        owner,
        ai,
        state,
        now,
        frameScale,
        options
      )
    )return true;

    // 2B. 라임 주변 안전: 멀어졌다면 라임 추종.
    if(this.ownerReturn(entity,owner,spec,ai,state,now,frameScale))return true;

    return false;
  },

  idleUpdate(entity,owner,spec,now,frameScale=1){
    const ai=spec?.ai;
    if(!entity?.alive||!ai||ai.enabled===false||!EntitySimulationAuthorityService.isLocal(entity))return false;
    if(MovementAbilityService.active(entity)||entity.forcedMotion)return true;
    if(ai.idleWander){
      return this.idleWander(entity,owner,ai,this.state(entity),now,frameScale);
    }
    return false;
  },

  update(entity,owner,spec,now,frameScale=1){
    if(this.priorityUpdate(entity,owner,spec,now,frameScale))return true;
    return this.idleUpdate(entity,owner,spec,now,frameScale);
  }
});