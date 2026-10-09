

const ProjectileImpactService=Object.freeze({
  cancelPending(source,projectileKey,now=performance.now()){
    const pending=source?._pendingProjectileImpacts;
    const key=String(projectileKey||'');
    const token=pending?.get(key);
    if(!token||now>=token.until)return false;
    token.cancelled=true;
    pending.delete(key);
    for(const effectKey of token.effectKeys)EffectSpawnService.removeKey(effectKey);
    return true;
  },
  correctGuardPath(source,projectileKey,point){
    const cancelled=this.cancelPending(source,projectileKey);
    if(!source?.actionState||!projectileKey||!point||
      !Number.isFinite(point.x)||!Number.isFinite(point.y))return false;
    const prefix=`projectile-impact:${String(projectileKey)}:`;
    const now=performance.now();
    let corrected=cancelled;
    for(const state of source.actionState.values()){
      if(state?.kind!==InstalledAreaFieldService.KIND||state.phase!=='point'||
        !String(state.instanceId||'').startsWith(prefix)||
        state.module?.anchorMode!=='projectile-path')continue;
      const dx=point.x-state.pointX,dy=point.y-state.pointY;
      const range=Math.min(Number(state.module.range)||0,Math.hypot(dx,dy));
      const module={...state.module,range,angle:Math.atan2(dy,dx),liveProjectilePath:false,
        presentation:state.module.presentation?{...state.module.presentation,range}:null};
      const broadcast=EntitySimulationAuthorityService.isLocal(source);
      if(range<.001){InstalledAreaFieldService.clearState(source,state,{broadcast});}
      else if(state.endsAt>now){
        InstalledAreaFieldService.activatePoint(source,module,{x:state.pointX,y:state.pointY},
          {attack:state.attack,execution:state.execution,instanceId:state.instanceId,now,broadcast,preserveState:true});
      }
      corrected=true;
    }
    // RMB and other consumers must reuse the actual stopped path, not its old full range.
    for(const history of source._recentProjectilePathFields?.values?.()||[]){
      for(const entry of history){
        if(entry.projectileKey!==String(projectileKey))continue;
        const dx=point.x-entry.pointX,dy=point.y-entry.pointY;
        const range=Math.min(Number(entry.module.range)||0,Math.hypot(dx,dy));
        entry.module={...entry.module,range,angle:Math.atan2(dy,dx),liveProjectilePath:false,
          presentation:entry.module.presentation?{...entry.module.presentation,range}:null};
        corrected=true;
      }
    }
    return corrected;
  },
  updatePath(projectile){
    if(projectile?.behavior?.impact?.field?.liveProjectilePath!==true)return;
    this.resolve(projectile,'path-progress');
  },
  resolve(projectile,reason='impact'){
    const impact=projectile?.behavior?.impact;
    if(!impact)return false;

    const source=projectile.source;
    const pathProgress=reason==='path-progress'&&impact.field?.liveProjectilePath===true;
    const guardPathCorrection=
      projectile.impactResolved===true&&
      String(reason||'impact')==='guard'&&
      impact.resolveOnGuard===true&&
      String(impact.field?.anchorMode||'')==='projectile-path';

    if(guardPathCorrection)projectile.impactResolved=false;

    if(projectile.impactResolved===true)return false;
    // 확정 피해와 확정 착탄 패킷이 서로 다른 carrier로 재생돼도 한 폭약은 한 번만 착탄한다.
    if(source?.alive&&!pathProgress&&impact.oncePerProjectile===true&&projectile.networkKey){
      const keys=source._resolvedProjectileImpactKeys||(source._resolvedProjectileImpactKeys=new Set());
      const key=String(projectile.networkKey);
      if(keys.has(key))return false;
      keys.add(key);
      while(keys.size>2048)keys.delete(keys.values().next().value);
    }
    if(!pathProgress)projectile.impactResolved=true;

    if(
      !pathProgress&&source&&
      projectile.targetPreview&&
      source.attackPreview
    ){
      source.attackPreview=null;
    }

    if(!source?.alive)return false;

    const point={
      x:Number(projectile.x)||0,
      y:Number(projectile.y)||0
    };
    const angle=
      Number.isFinite(Number(projectile.angle))
        ?Number(projectile.angle)
        :Math.atan2(
          Number(projectile.vy)||0,
          Number(projectile.vx)||0
        );

    let resolved=false;
    const preparedAttacks=new Map();
    let pendingToken=null;
    const pendingKey=String(projectile.networkKey||'');
    if(impact.cancelDelayedOnRemove===true&&pendingKey){
      const pending=source._pendingProjectileImpacts||(source._pendingProjectileImpacts=new Map());
      for(const [key,token] of pending){
        if(token.until<=performance.now())pending.delete(key);
      }
      pendingToken={until:performance.now(),cancelled:false,effectKeys:[]};
      pending.set(pendingKey,pendingToken);
    }


    const fieldBeforeAttacks=
      String(impact.fieldOrder||'after-attacks')===
      'before-attacks';

    const resolveImpactField=()=>{
      if(
        !impact.field||
        (
          Array.isArray(impact.field.reasons)&&
          impact.field.reasons.length>0&&
          !pathProgress&&!impact.field.reasons.includes(String(reason||'impact'))
        )
      )return false;

      // 온라인 원격 공격 재생은 투사체 궤적/충돌 AttackSpec만 재현한다.
      // point field는 source 권위 측 InstalledAreaFieldService가 field-point-spawn으로
      // 별도 동기화하므로 여기서 다시 생성하면 상대 화면에 같은 장판이 두 개 생긴다.
      if(
        Training.sessionMode==='online'&&
        !EntitySimulationAuthorityService.isLocal(source)
      ){
        return false;
      }

      let field=impact.field;
      const rangeRef=field.rangeRef;

      if(rangeRef?.type==='impact-attack-range'){
        const linkedAttackId=String(rangeRef.attackId||'');
        let linkedAttack=
          preparedAttacks.get(linkedAttackId)||
          null;

        if(!linkedAttack&&linkedAttackId){
          const linkedBaseAttack=AbilityService.attackById(
            source.character,
            linkedAttackId
          );
          if(linkedBaseAttack){
            linkedAttack=AugmentService.prepareAttack(
              source,
              linkedBaseAttack,
              performance.now()
            );
            preparedAttacks.set(
              linkedAttackId,
              linkedAttack
            );
          }
        }

        const linkedArea=
          linkedAttack
            ?AttackModuleService.module(
              linkedAttack,
              'delivery.area'
            )
            :null;
        const linkedRange=Math.max(
          0,
          Number(linkedArea?.range)||
          Number(linkedAttack?.range)||
          Number(field.range)||
          0
        );

        field=field.triggerResolveRangeFromAttack===true
          ?{
            ...field,
            triggerResolveRange:linkedRange
          }
          :{
            ...field,
            range:linkedRange,
            presentation:field.presentation
              ?{
                ...field.presentation,
                r:linkedRange,
                range:linkedRange,
                maxR:linkedRange
              }
              :field.presentation
          };
      }

      let fieldPoint=point;
      if(String(field.anchorMode||'')==='projectile-path'){
        const origin={
          x:Number(projectile.origin?.x),
          y:Number(projectile.origin?.y)
        };
        if(Number.isFinite(origin.x)&&Number.isFinite(origin.y)){
          const dx=point.x-origin.x;
          const dy=point.y-origin.y;
          const pathRange=Math.hypot(dx,dy);
          if(pathRange<.001)return false;
          const pathAngle=Math.atan2(dy,dx);
          const fieldDuration=Math.max(
            GAME_DATA.frameMs,
            Number(field.duration)||GAME_DATA.frameMs
          );
          const projectileSpeed=Math.max(
            .001,
            Number(projectile.baseSpeed)||
            Math.hypot(Number(projectile.vx)||0,Number(projectile.vy)||0)
          );
          const revealDuration=(pathRange/projectileSpeed)*GAME_DATA.frameMs;
          const pathTimeline=
            pathProgress&&field.liveProjectilePath===true
              ?null
              :field.pathTimeline&&typeof field.pathTimeline==='object'
                ?{
                  ...field.pathTimeline,
                  revealRatio:Math.max(
                    .001,
                    Math.min(.49,revealDuration/fieldDuration)
                  )
                }
                :field.pathTimeline;
          fieldPoint=origin;
          field={
            ...field,
            // 비행 중에는 경로가 계속 늘어나지만 최종 종료 뒤에는
            // 고정된 잔향으로 전환해야 pathTimeline의 fade 구간이 동작한다.
            liveProjectilePath:pathProgress&&field.liveProjectilePath===true,
            range:pathRange,
            angle:pathAngle,
            pathTimeline,
            presentation:field.presentation
              ?{
                ...field.presentation,
                range:pathRange
              }
              :field.presentation
          };

          if(field.retainRecentPath===true&&!pathProgress){
            if(!(source._recentProjectilePathFields instanceof Map)){
              source._recentProjectilePathFields=new Map();
            }
            const historyKey=String(field.stateKey||'projectile-path');
            const history=source._recentProjectilePathFields.get(historyKey)||[];
            const projectileKey=String(projectile.networkKey||'');
            if(projectileKey){
              for(let index=history.length-1;index>=0;index--){
                if(history[index].projectileKey===projectileKey)history.splice(index,1);
              }
            }
            history.unshift({
              projectileKey,
              pointX:origin.x,
              pointY:origin.y,
              startedAt:performance.now(),
              module:{...field}
            });
            const limit=Math.max(
              1,
              Math.floor(Number(field.recentPathLimit)||3)
            );
            history.length=Math.min(history.length,limit);
            source._recentProjectilePathFields.set(historyKey,history);
          }
        }
      }

      const fieldAttackId=String(field.attackId||'');
      const fieldBaseAttack=fieldAttackId
        ?AbilityService.attackById(source.character,fieldAttackId)
        :null;
      const fieldAttack=fieldBaseAttack
        ?AugmentService.prepareAttack(
          source,
          fieldBaseAttack,
          performance.now()
        )
        :null;
      const fieldNow=performance.now();
      const impactFieldInstanceId=
        `projectile-impact:${String(projectile.networkKey||'projectile')}:${InstalledAreaFieldService.baseKey(field)}`;
      const livePathBroadcastInterval=
        Math.max(
          GAME_DATA.frameMs,
          Number(field.liveProjectilePathBroadcastInterval)||
          GAME_DATA.frameMs
        );
      const shouldBroadcastPath=
        !pathProgress||
        fieldNow-
          (projectile.pathFieldSentAt||-Infinity)>=
          livePathBroadcastInterval;

      const state=InstalledAreaFieldService.activatePoint(
        source,
        field,
        fieldPoint,
        {
          attack:fieldAttack,
          execution:projectile.volley?.execution||null,
          instanceId:impactFieldInstanceId,
          now:fieldNow,
          preserveState:reason==='guard',
          broadcast:shouldBroadcastPath
        }
      );
      if(shouldBroadcastPath){
        projectile.pathFieldSentAt=fieldNow;
      }

      if(
        state&&
        field.bindToProjectile===true
      ){
        projectile.boundFieldInstanceId=
          String(state.instanceId||'');
      }

      if(
        state&&
        field.triggerImmediately===true&&
        state.kind===InstalledAreaFieldService.KIND
      ){
        InstalledAreaFieldService.updateState(
          source,
          state,
          fieldNow
        );
      }

      return !!state;
    };

    if(pathProgress)return resolveImpactField();

    if(
      fieldBeforeAttacks&&
      resolveImpactField()
    ){
      resolved=true;
    }
    const reasonAttackIds=
      impact.reasonAttackIds?.[
        String(reason||'impact')
      ]||[];

    const linkedAttackIds=[
      ...(impact.attackIds||[]),
      ...reasonAttackIds
    ];

    for(const attackId of linkedAttackIds){
      const attackKey=String(attackId||'');
      let attack=preparedAttacks.get(attackKey)||null;

      if(!attack){
        const baseAttack=AbilityService.attackById(
          source.character,
          attackKey
        );
        if(!baseAttack)continue;

        attack=AugmentService.prepareAttack(
          source,
          ProgressScaledAttackService.resolve(
            source,
            baseAttack
          ),
          performance.now()
        );
        preparedAttacks.set(
          attackKey,
          attack
        );
      }

      const delivery=AttackModuleService.module(
        attack,
        'delivery.area'
      );

      const execution=
        AttackExecutionService.create(
          source,
          attack,
          angle
        );
      if(impact.shareHitTargets===true)AttackExecutionService.shareHits(execution,projectile.volley?.execution);
      execution.projectileImpactReason=String(reason||'impact');
      execution.projectileImpactPoint={...point};
      execution.targetPoint={...point};

      AttackExecutionService.setImpactOrigin(
        execution,
        {
          mode:'point',
          x:point.x,
          y:point.y
        }
      );
      AttackExecutionService.setKoOrigin(
        execution,
        {
          mode:'point',
          x:point.x,
          y:point.y
        }
      );

      const areaModule=delivery
        ?{...delivery}
        :null;
      const volley={
        execution,
        total:1,
        resolved:0,
        hits:0,
        finished:false
      };

      const executeImpactAttack=()=>{
        if(pendingToken?.cancelled===true||!source?.alive)return;
        const impactAngle=
          Number(angle||0)+
          (Number(areaModule?.angleOffset)||0);

        if(areaModule){
          AreaAttackService.execute(
            source,
            attack,
            impactAngle,
            areaModule,
            volley,
            {
              geometrySource:point
            }
          );
        }else{
          AttackModuleService.deliver(
            source,
            attack,
            impactAngle,
            volley
          );
        }

        AttackModuleService.afterAttack(
          source,
          attack,
          impactAngle,
          execution
        );
        if(pendingToken){
          for(const module of attack.modules||[]){
            if(module.type==='effect.spawn'&&module.stateKey){
              pendingToken.effectKeys.push(`attack-effect:${source.id}:${execution.sequence}:${module.stateKey}`);
            }
          }
        }

      };
      const impactDelay=Math.max(
        0,
        Number(delivery?.delay)||0
      );
      if(impactDelay>0){
        const at=performance.now()+impactDelay;
        if(pendingToken)pendingToken.until=Math.max(pendingToken.until,at);
        SimulationScheduleService.scheduleContinuation({
          at,
          source,
          continue:()=>{
            executeImpactAttack();
            if(pendingToken&&performance.now()>=pendingToken.until&&source._pendingProjectileImpacts?.get(pendingKey)===pendingToken){
              source._pendingProjectileImpacts.delete(pendingKey);
            }
          }
        });
      }else{
        executeImpactAttack();
      }
      resolved=true;
    }



    if(
      !fieldBeforeAttacks&&
      resolveImpactField()
    ){
      resolved=true;
    }

    if(
      impact.summonRelocate&&
      EntitySimulationAuthorityService
        .isLocal(source)
    ){
      const stateKey=
        String(
          impact.summonRelocate.stateKey||
          ''
        );
      const owner=
        EntityService.owner(source)||
        source;
      const summon=
        source?.kind==='summon'&&
        String(source.summonStateKey||'')===stateKey
          ?source
          :stateKey
            ?SummonDeployService.entity(
              owner,
              stateKey
            )
            :null;

      if(summon){
        summon.x=point.x;
        summon.y=point.y;
        if(summon.forcedMotion){
          MovementService.finalizeForcedMotion(summon);
        }

        const summonState=
          SummonDeployService.state(
            owner,
            stateKey,
            false
          );
        if(summonState){
          const summonSpec=
            summon.summonSpec||
            null;

          if(
            summonSpec?.modeState?.stateKey&&
            impact.summonRelocate.commandMode
          ){
            ModeStateService.set(
              owner,
              String(
                summonSpec.modeState.stateKey
              ),
              String(
                impact.summonRelocate.commandMode
              ),
              String(
                summonSpec.modeState.initial||
                ''
              )
            );
          }

          summonState.x=point.x;
          summonState.y=point.y;
        }
        MovementAbilityService.clear(
          summon
        );
        MovementService.resolveEmbedded(
          summon
        );

        const presentation=
          impact.summonRelocate.presentation;
        if(
          presentation&&
          typeof presentation==='object'
        ){
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

        const arrivalPreview=
          impact.summonRelocate.arrivalPreview;
        if(
          arrivalPreview&&
          typeof arrivalPreview==='object'
        ){
          const previewAngle=
            arrivalPreview.direction==='projectile'
              ?angle
              :(
                Number.isFinite(Number(arrivalPreview.angle))
                  ?Number(arrivalPreview.angle)
                  :angle
              );
          EffectSpawnService.spawn(
            {
              type:'effectShape',
              shape:'rect',
              x:point.x+
                Math.cos(previewAngle)*
                Math.max(
                  0,
                  Number(arrivalPreview.length)||180
                )/2,
              y:point.y+
                Math.sin(previewAngle)*
                Math.max(
                  0,
                  Number(arrivalPreview.length)||180
                )/2,
              angle:previewAngle,
              width:
                Math.max(
                  1,
                  Number(arrivalPreview.length)||180
                ),
              height:
                Math.max(
                  1,
                  Number(arrivalPreview.width)||24
                ),
              fillStyle:
                String(
                  arrivalPreview.fillStyle||
                  'rgba(200,216,240,.12)'
                ),
              start:performance.now(),
              dur:
                Math.max(
                  GAME_DATA.frameMs,
                  Number(arrivalPreview.duration)||220
                ),
              sourceEntityId:source.id
            },
            {source}
          );
        }

        resolved=true;
      }
    }

    if(
      impact.sourceRelocate&&
      (
        !Array.isArray(impact.sourceRelocate.reasons)||
        impact.sourceRelocate.reasons.length===0||
        impact.sourceRelocate.reasons.includes(String(reason||'impact'))
      )&&
      EntitySimulationAuthorityService.isLocal(source)
    ){
      const relocate=impact.sourceRelocate;
      const delay=Math.max(0,Number(relocate.delay)||0);
      const duration=Math.max(
        GAME_DATA.frameMs,
        Number(relocate.duration)||140
      );
      const beginRelocate=()=>{
        if(!source?.alive)return;

        const forwardOffset=
          Number.isFinite(Number(relocate.forwardOffset))
            ?Number(relocate.forwardOffset)
            :0;
        const relocatePoint={
          x:Number(point.x)+Math.cos(angle)*forwardOffset,
          y:Number(point.y)+Math.sin(angle)*forwardOffset
        };

        MovementAbilityService.start(
          source,
          {
            type:'movement.move',
            stateKey:String(
              relocate.stateKey||
              'projectile-impact-source-relocate'
            ),
            replaceActive:relocate.replaceActive===true,
            blocksAction:relocate.blocksAction===true,
            trajectory:relocate.trajectory||null,
            buffs:Array.isArray(relocate.buffs)?relocate.buffs:[],
            direction:'target-point',
            duration,
            tags:Array.isArray(relocate.tags)
              ?[...relocate.tags]
              :['이동기'],
            collision:{
              passWalls:true,
              passEnemies:true,
              ...(relocate.collision||{})
            },
            resolveOverlapOnEnd:
              relocate.resolveOverlapOnEnd!==false,
            presentation:
              relocate.presentation||null,
            onEndAttackIds:
              Array.isArray(relocate.onEndAttackIds)
                ?relocate.onEndAttackIds
                :[]
          },
          angle,
          {
            targetPoint:relocatePoint,
            angle,
            executionSequence:
              projectile.volley?.execution?.sequence||0
          },
          performance.now()
        );
      };

      if(delay>0){
        SimulationScheduleService.scheduleContinuation({
          at:performance.now()+delay,
          source,
          continue:beginRelocate
        });
      }else{
        beginRelocate();
      }
      resolved=true;
    }

    if(
      impact.cooldown&&
      EntitySimulationAuthorityService.isLocal(source)
    ){
      const cooldown=impact.cooldown;
      const reasons=Array.isArray(cooldown.reasons)?cooldown.reasons:[];
      if(
        reasons.length===0||
        reasons.includes(String(reason||'impact'))
      ){
        const attackId=String(cooldown.attackId||projectile.attack?.id||'');
        if(attackId){
          source.cooldowns.set(
            attackId,
            performance.now()+Math.max(0,Number(cooldown.duration)||0)
          );
        }
      }
    }

    return resolved;
  }
});
