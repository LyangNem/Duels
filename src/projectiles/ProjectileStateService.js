

const ProjectileStateService=Object.freeze({
  get(source,stateKey){
    const key=String(stateKey||'');
    if(!source?.actionState||!key)return null;

    let projectile=
      source.actionState.get(key)||null;

    if(
      projectile&&
      ProjectileService.items.includes(projectile)
    ){
      return projectile;
    }

    if(projectile){
      source.actionState.delete(key);
      projectile=null;
    }

    const pendingKey=
      source._remoteProjectileStateKeys instanceof Map
        ?String(
          source._remoteProjectileStateKeys.get(key)||''
        )
        :'';

    if(!pendingKey)return null;

    projectile=
      ProjectileService.findByNetworkKey(
        source,
        pendingKey
      );

    if(!projectile)return null;

    source.actionState.set(
      key,
      projectile
    );
    return projectile;
  },
  set(source,stateKey,projectile){
    if(!source?.actionState||!stateKey||!projectile)return false;
    source.actionState.set(stateKey,projectile);
    return true;
  },
  clear(projectile){
    const source=projectile?.source;
    const stateKey=
      projectile?.stateKey||
      projectile?.behavior?.returning?.stateKey;

    if(
      source?.actionState&&
      stateKey&&
      source.actionState.get(stateKey)===projectile
    ){
      source.actionState.delete(stateKey);
    }
  },
  beginReturn(projectile,{manual=false,speedOverride=null}={}){
    const returning=projectile?.behavior?.returning;
    if(!returning||returning.phase==='returning')return false;

    const resetSharedHitAfterStationaryMs=
      Math.max(
        0,
        Number(returning.resetSharedHitAfterStationaryMs)||0
      );
    const stationaryStartedAt=
      Number(
        projectile.stationaryArrival?.startedAt??
        projectile.lastStationaryArrivalStartedAt
      );

    if(
      returning.sharedHitIds===true&&
      resetSharedHitAfterStationaryMs>0&&
      Number.isFinite(stationaryStartedAt)&&
      performance.now()-stationaryStartedAt>=
        resetSharedHitAfterStationaryMs
    ){
      projectile.hitIds?.clear?.();
      returning.outboundHitIds?.clear?.();
      returning.returnHitIds?.clear?.();
    }

    const returnAttackId=String(returning.returnAttackId||'');
    if(returnAttackId){
      const baseReturnAttack=
        AbilityService.attackById(
          projectile.source?.character,
          returnAttackId
        );
      if(!baseReturnAttack)return false;

      const returnAttack=
        AugmentService.prepareAttack(
          projectile.source,
          baseReturnAttack,
          performance.now()
        );

      projectile.outboundAttack=
        projectile.outboundAttack||
        projectile.attack;
      projectile.attack=returnAttack;

      const returnConfig=
        ProjectileModuleService.config(
          returnAttack
        );
      const returnProjectile=
        AttackModuleService.projectile(
          returnAttack
        );

      if(returnProjectile){
        projectile.radius=
          Math.max(
            0,
            Number(returnProjectile.radius)||
            projectile.radius||
            0
          );
        projectile.hitRadius=
          Math.max(
            0,
            Number(returnProjectile.hitRadius)||
            Number(returnProjectile.radius)||
            projectile.hitRadius||
            projectile.radius||
            0
          );
      }

      projectile.behavior={
        ...projectile.behavior,
        pierce:{
          targets:
            returnConfig.pierce?.targets===true,
          walls:
            returnConfig.pierce?.walls===true
        },
        collisionPolicy:
          CollisionPolicyService.normalize({
            passWalls:
              returnConfig.pierce?.walls===true,
            passEnemies:
              returnConfig.pierce?.targets===true
          }),
        collision:{
          wall:
            returnConfig.collision?.wall||
            projectile.behavior?.collision?.wall||
            'remove',
          shape:String(
            returnConfig.collision?.shape||
            projectile.behavior?.collision?.shape||
            'circle'
          ),
          radiusScale:
            Number.isFinite(Number(returnConfig.collision?.radiusScale))
              ?Math.max(0,Number(returnConfig.collision.radiusScale))
              :Math.max(0,Number(projectile.behavior?.collision?.radiusScale)||1)
        },
        presentation:
          returnConfig.presentation||
          projectile.behavior?.presentation||
          null,
        trajectory:
          returnConfig.trajectory||
          projectile.behavior?.trajectory||
          null
      };

      projectile.renderStyle=
        projectile.behavior.presentation||
        null;
      projectile.renderRgb=
        AttackPresentationColorService.resolve(
          projectile.source,
          returnAttack,
          {
            presentation:
              projectile.behavior.presentation
          }
        );
    }

    returning.phase='returning';
    returning.manual=manual===true;
    if(Number.isFinite(Number(speedOverride))&&Number(speedOverride)>0){
      returning.speed=Math.max(.001,Number(speedOverride));
    }
    returning.returnOriginX=projectile.x;
    returning.returnOriginY=projectile.y;
    returning.returnHitIds.clear();

    // 외곽 회피는 outbound 비행 전용이다.
    // 귀환이 시작되면 현재 위치에서 source까지 곧장 복귀하도록
    // 남아 있는 회피 조향 상태를 즉시 제거한다.
    projectile.boundaryAvoidance=null;

    projectile.vx=0;
    projectile.vy=0;
    return true;
  },
  replaceAttack(projectile,attack){
    if(!projectile?.source||!attack)return false;

    const delivery=AttackModuleService.projectile(attack);
    const behavior=ProjectileModuleService.config(attack);
    if(!delivery)return false;

    const direction=
      Number.isFinite(Number(projectile.angle))
        ?Number(projectile.angle)
        :Math.atan2(
          Number(projectile.vy)||0,
          Number(projectile.vx)||0
        );

    projectile.attack=attack;
    projectile.projectile={...delivery};
    projectile.behavior=behavior;
    projectile.renderStyle=behavior.presentation||null;
    projectile.renderRgb=AttackPresentationColorService.resolve(
      projectile.source,
      attack,
      {presentation:behavior.presentation}
    );
    projectile.radius=Math.max(0,Number(delivery.radius)||projectile.radius||0);
    projectile.hitRadius=Math.max(
      0,
      Number(delivery.hitRadius)||
      Number(delivery.radius)||
      projectile.hitRadius||
      projectile.radius||
      0
    );
    projectile.damageOnTravel=delivery.damageOnTravel!==false;
    projectile.baseSpeed=Math.max(
      0,
      Number(delivery.speed)||0
    );
    projectile.rehitInterval=Math.max(
      0,
      Number(delivery.rehitInterval)||0
    );
    projectile.rangeExtendOnHitRatio=Math.max(
      0,
      Number(delivery.rangeExtendOnHitRatio)||0
    );
    projectile.baseAttackRange=
      Math.max(
        0,
        Number(projectile.baseAttackRange)||
        Number(attack.range)||
        0
      );
    projectile.maxTravelDistance=
      Math.max(
        Number(projectile.maxTravelDistance)||0,
        Number(projectile.baseAttackRange)||0
      );
    projectile.expireAtRange=
      delivery.expireAtRange!==false;
    projectile.homing=
      delivery.homing||null;
    projectile.proximitySpeed=
      delivery.proximitySpeed||null;
    projectile.speedStages=
      delivery.speedStages||null;
    projectile.vx=Math.cos(direction)*projectile.baseSpeed;
    projectile.vy=Math.sin(direction)*projectile.baseSpeed;
    projectile.angle=direction;
    return true;
  },

  serialize(source){
    if(!source?.actionState)return [];

    const result=[];
    for(const [stateKey,value] of source.actionState){
      if(!ProjectileService.items.includes(value))continue;

      const networkKey=String(value?.networkKey||'');
      if(!networkKey)continue;

      const returning=value?.behavior?.returning||null;
      result.push({
        stateKey:String(stateKey),
        networkKey,
        stationary:
          value?.stationaryArrival
            ?{
              x:Number(value.x)||0,
              y:Number(value.y)||0,
              arrivalReason:String(value.stationaryArrival.arrivalReason||value.arrivalReason||''),
              fixedX:Number.isFinite(Number(value.stationaryArrival.fixedX))?Number(value.stationaryArrival.fixedX):null,
              fixedY:Number.isFinite(Number(value.stationaryArrival.fixedY))?Number(value.stationaryArrival.fixedY):null,
              fixedTravel:Number.isFinite(Number(value.stationaryArrival.fixedTravel))?Number(value.stationaryArrival.fixedTravel):null
            }
            :null,
        returning:returning
          ?{
            phase:String(returning.phase||'outbound'),
            manual:returning.manual===true,
            returnOriginX:Number(returning.returnOriginX)||0,
            returnOriginY:Number(returning.returnOriginY)||0
          }
          :null
      });
    }
    return result;
  },
  applyRemote(source,snapshots,stateSentAt=0){
    if(
      !source?.actionState||
      !Array.isArray(snapshots)
    )return false;

    const stateStamp=
      Math.max(0,Number(stateSentAt)||0);
    const incomingKeys=new Set();
    const pending=
      source._remoteProjectileStateKeys instanceof Map
        ?source._remoteProjectileStateKeys
        :(source._remoteProjectileStateKeys=new Map());

    for(const snapshot of snapshots){
      const stateKey=String(snapshot?.stateKey||'');
      if(!stateKey)continue;
      incomingKeys.add(stateKey);

      const networkKey=String(
        snapshot?.networkKey||''
      );
      if(networkKey){
        pending.set(stateKey,networkKey);
      }

      const projectile=
        networkKey
          ?ProjectileService.findByNetworkKey(
            source,
            networkKey
          )
          :this.get(source,stateKey);

      if(projectile){
        source.actionState.set(
          stateKey,
          projectile
        );
        if(
          snapshot?.stationary&&
          projectile.stationaryArrival
        ){
          const sx=Number(snapshot.stationary.x);
          const sy=Number(snapshot.stationary.y);
          if(Number.isFinite(sx)&&Number.isFinite(sy)){
            projectile.x=sx;
            projectile.y=sy;
            projectile.prevX=sx;
            projectile.prevY=sy;
          }
          const arrivalReason=String(snapshot.stationary.arrivalReason||'');
          if(arrivalReason){
            projectile.arrivalReason=arrivalReason;
            projectile.stationaryArrival.arrivalReason=arrivalReason;
          }
          for(const key of ['fixedX','fixedY','fixedTravel']){
            const value=Number(snapshot.stationary[key]);
            if(snapshot.stationary[key]!=null&&Number.isFinite(value)){
              projectile.stationaryArrival[key]=value;
            }
          }
        }
      }

      const returning=
        projectile?.behavior?.returning||null;
      const returningSnapshot=
        snapshot?.returning||
        (
          snapshot&&
          Object.prototype.hasOwnProperty.call(
            snapshot,
            'phase'
          )
            ?snapshot
            :null
        );

      if(!returning||!returningSnapshot)continue;

      const phase=String(
        returningSnapshot.phase||'outbound'
      );
      if(
        phase==='returning'&&
        returning.phase!=='returning'
      ){
        this.beginReturn(
          projectile,
          {
            manual:
              returningSnapshot.manual===true
          }
        );
      }

      returning.manual=
        returningSnapshot.manual===true;
      if(
        Number.isFinite(
          Number(returningSnapshot.returnOriginX)
        )
      ){
        returning.returnOriginX=
          Number(returningSnapshot.returnOriginX);
      }
      if(
        Number.isFinite(
          Number(returningSnapshot.returnOriginY)
        )
      ){
        returning.returnOriginY=
          Number(returningSnapshot.returnOriginY);
      }
    }

    // 원격 snapshot에서 사라진 stateKey는 연결만 해제한다.
    // 귀환 투사체는 기존 계약대로 소유자 쪽에서 사라졌다면 실제 투사체도 정리한다.
    for(const [stateKey,value] of [...source.actionState]){
      if(!ProjectileService.items.includes(value))continue;
      if(incomingKeys.has(String(stateKey)))continue;

      const returning=value?.behavior?.returning||null;
      if(returning){
        const actionStamp=
          Math.max(
            0,
            Number(value?.networkActionSentAt)||0
          );
        if(
          !(
            actionStamp>0&&
            stateStamp>0&&
            stateStamp<actionStamp
          )
        ){
          this.remove(value);
        }
      }else{
        source.actionState.delete(stateKey);
      }
      pending.delete(String(stateKey));
    }

    for(const stateKey of [...pending.keys()]){
      if(!incomingKeys.has(stateKey)){
        pending.delete(stateKey);
      }
    }

    return true;
  },
  remove(projectile){
    if(!projectile)return false;

    ProjectileTetherMovementService.releaseProjectile(projectile);
    const index=ProjectileService.items.indexOf(projectile);

    if(index>=0){
      ProjectileService.finish(
        projectile,
        projectile.hadHit===true
      );
      ProjectileService.items.splice(index,1);
    }else{
      this.clear(projectile);
    }

    return index>=0;
  }
});