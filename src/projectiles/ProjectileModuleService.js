

const ProjectileModuleService=Object.freeze({
  type(module){
    return typeof module==='string'?module:module?.type;
  },
  module(spec,type){
    return (spec?.modules||[]).find(
      module=>this.type(module)===type
    )||null;
  },
  withShotOverride(behavior,override){
    if(
      !behavior||
      !override||
      typeof override!=='object'
    )return behavior;

    const hasWallOverride=
      typeof override.pierceWalls==='boolean';
    const hasTargetOverride=
      typeof override.pierceTargets==='boolean';

    if(!hasWallOverride&&!hasTargetOverride){
      return behavior;
    }

    const pierce={
      ...(behavior.pierce||{}),
      ...(hasWallOverride
        ?{walls:override.pierceWalls===true}
        :{}),
      ...(hasTargetOverride
        ?{targets:override.pierceTargets===true}
        :{})
    };

    return {
      ...behavior,
      pierce,
      collisionPolicy:
        CollisionPolicyService.normalize({
          passWalls:pierce.walls===true,
          passEnemies:pierce.targets===true
        })
    };
  },
  config(spec){
    const returning=this.module(spec,'projectile.return');
    const pierce=this.module(spec,'projectile.pierce');
    const collision=this.module(spec,'projectile.collision');
    const presentation=this.module(spec,'projectile.presentation');
    const trajectory=this.module(spec,'trajectory.arc');
    const impact=this.module(spec,'projectile.impact');
    const waypoint=this.module(spec,'projectile.waypoint-path');

    return {
      waypoint:waypoint
        ?{
          stateKey:String(waypoint.stateKey||'projectile'),
          segmentKind:String(waypoint.segmentKind||'lmb'),
          holdStateKey:String(waypoint.holdStateKey||`projectile-waypoint-hold:${String(waypoint.stateKey||'projectile')}`),
          returnLockAttackId:String(waypoint.returnLockAttackId||''),
          returnLockDuration:Math.max(0,Number(waypoint.returnLockDuration)||0),
          presentation:waypoint.presentation&&typeof waypoint.presentation==='object'?{...waypoint.presentation}:null,
          queue:[],
          commandReadyAt:Object.create(null),
          currentKind:String(waypoint.segmentKind||'lmb'),
          stopped:false
        }
        :null,
      returning:returning
        ?{
          stateKey:String(returning.stateKey||'projectile'),
          returnAttackId:String(returning.returnAttackId||''),
          phase:'outbound',
          stopAtRange:returning.stopAtRange===true,
          returnAtRange:returning.returnAtRange===true,
          returnAtBoundary:returning.returnAtBoundary===undefined
            ?returning.returnAtRange===true
            :returning.returnAtBoundary===true,
          returnOnMiss:returning.returnOnMiss===true,
          autoAfterMs:Math.max(0,Number(returning.autoAfterMs)||0),
          speed:Math.max(.001,Number(returning.speed)||1),
          damageOnReturn:returning.damageOnReturn!==false,
          sharedHitIds:returning.sharedHitIds===true,
          resetSharedHitAfterStationaryMs:
            Math.max(
              0,
              Number(returning.resetSharedHitAfterStationaryMs)||0
            ),
          createdAt:performance.now(),
          returnHitIds:new Set(),
          outboundHitIds:new Set(),
          manual:false,
          returnOriginX:0,
          returnOriginY:0,
          autoArrivalMovement:returning.autoArrivalMovement||null
        }
        :null,
      pierce:{
        targets:pierce?.targets===true,
        walls:pierce?.walls===true
      },
      collisionPolicy:CollisionPolicyService.normalize({
        passWalls:pierce?.walls===true,
        passEnemies:pierce?.targets===true
      }),
      collision:{
        wall:collision?.wall||'remove',
        shape:String(collision?.shape||'circle'),
        radiusScale:
          Number.isFinite(Number(collision?.radiusScale))
            ?Math.max(0,Number(collision.radiusScale))
            :1
      },
      trajectory:trajectory||null,
      impact:impact
        ?{
          shareHitTargets:impact.shareHitTargets===true,
          snapToRangeEnd:impact.snapToRangeEnd===true,
          oncePerProjectile:impact.oncePerProjectile===true,
          cancelDelayedOnRemove:impact.cancelDelayedOnRemove===true,
          attackIds:Array.isArray(impact.attackIds)
            ?impact.attackIds.map(String)
            :(
              impact.attackId
                ?[String(impact.attackId)]
                :[]
            ),
          reasonAttackIds:
            impact.reasonAttackIds&&
            typeof impact.reasonAttackIds==='object'
              ?Object.fromEntries(
                Object.entries(impact.reasonAttackIds)
                  .map(([key,value])=>[
                    String(key),
                    Array.isArray(value)
                      ?value.map(String)
                      :value
                        ?[String(value)]
                        :[]
                  ])
              )
              :{},
          fieldOrder:String(
            impact.fieldOrder||
            'after-attacks'
          ),
          field:
            impact.field&&typeof impact.field==='object'
              ?{...impact.field}
              :null,
          summonRelocate:
            impact.summonRelocate&&
            typeof impact.summonRelocate==='object'
              ?{...impact.summonRelocate}
              :null,
          sourceRelocate:
            impact.sourceRelocate&&
            typeof impact.sourceRelocate==='object'
              ?{
                ...impact.sourceRelocate,
                collision:
                  impact.sourceRelocate.collision
                    ?{...impact.sourceRelocate.collision}
                    :null,
                presentation:
                  impact.sourceRelocate.presentation
                    ?{...impact.sourceRelocate.presentation}
                    :null,
                onEndAttackIds:
                  Array.isArray(
                    impact.sourceRelocate.onEndAttackIds
                  )
                    ?impact.sourceRelocate.onEndAttackIds.map(String)
                    :[]
              }
              :null,
          cooldown:
            impact.cooldown&&
            typeof impact.cooldown==='object'
              ?{
                ...impact.cooldown,
                reasons:Array.isArray(impact.cooldown.reasons)
                  ?impact.cooldown.reasons.map(String)
                  :[]
              }
              :null
        }
        :null,
      presentation:presentation
        ?{
          ...(presentation.style||{}),
          kind:String(
            presentation.kind||
            'projectile-style'
          )
        }
        :null
    };
  }
});
