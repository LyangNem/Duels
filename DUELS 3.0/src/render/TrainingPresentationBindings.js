

const TrainingPresentationBindings=Object.freeze({
  init(){
    if(trainingPresentationBindingsInitialized)return;
    trainingPresentationBindingsInitialized=true;
GameEvents.on('entity-defeated',event=>{
      if(!Training.active)return;

      if(Training.sessionMode==='online'){
        // 온라인 K.O. 연출은 실제 소유 플레이어가 보고한 사망을
        // 방장이 확정한 duel-death-confirmed에서만 재생한다.
        if(
          EntitySimulationAuthorityService.isLocal(
            event.entity
          )
        ){
          OnlineDuelService.captureLocalDefeat(
            event
          );
        }
        return;
      }

      if(event.source?.kind==='player'){
        MasterRecordMilestonePresentationService.elimination(
          event.source,
          Number(event.entity?.x)||0,
          Number(event.entity?.y)||0,
          'kill'
        );
      }

      Presentation.deathLaunch(
        event.entity,
        event.source||null,
        event.koOrigin||null,
        event.koTarget||null,
        event.direction
      );
    });

    GameEvents.on('wall-contact-feedback',event=>{
      const target=event?.target;
      if(!target||!EntitySimulationAuthorityService.isLocal(target))return;
      OnlinePresentationSyncService.send(
        'wall-contact',
        target,
        {angle:Number(event.angle)||0}
      );
    });

    GameEvents.on('damage-applied',event=>{
      const {source,target,amount}=event;
      StealthPresentationService.exposeState(
        target,
        800,
        event.now||performance.now()
      );
      const strongPresentation=
        CCService.has(
          target,
          'neutralize',
          event.now||performance.now()
        );
      const presentationAmount=
        strongPresentation
          ?Math.max(
            amount,
            GAME_DATA.cameraFeedback.strongDamage
          )
          :amount;

      const squashOrigin=ImpactDirectionService.squashOrigin(
        source,
        event.impact
      );
      EntitySquashPresentationService.impact(
        target,
        presentationAmount,
        squashOrigin,
        {
          directionless:CCService.isDotImpact(event.impact)
        },
        event.now||performance.now()
      );
      Presentation.damageNumber(target,amount);
      SoundService.play('hit');

      const hitRing=
        !CCService.isDotImpact(event.impact)&&
        event.impact?.suppressHitImpactRing!==true
          ?EffectSpawnService.spawn({
          type:'hitImpactRing',
          x:Number(target.x)||0,
          y:Number(target.y)||0,
          color:AttackPresentationColorService.resolve(
            source,
            event.attack
          ),
          r:Math.max(8,Number(target.radius)||20),
          maxR:Math.max(
            42,
            (Number(target.radius)||20)+
            (
              presentationAmount>=GAME_DATA.cameraFeedback.strongDamage
                ?48
                :34
            )
          ),
          start:event.now||performance.now(),
          dur:
            presentationAmount>=GAME_DATA.cameraFeedback.strongDamage
              ?14*GAME_DATA.frameMs
              :10*GAME_DATA.frameMs,
          sourceEntityId:target.id
        },{source:target})
        :null;

      if(EntitySimulationAuthorityService.isLocal(target)){
        if(hitRing){
          OnlinePresentationSyncService.send('effect-spawn',target,{effect:EffectSpawnService.presentationSnapshot(hitRing,event.now||performance.now())});
        }
        if(CCService.isDotImpact(event.impact)){
          OnlinePresentationSyncService.send(
            'status-damage',
            target,
            {
              sourcePid:OnlinePresentationSyncService.entityPid(source),
              amount,
              status:event.impact?.status||null
            }
          );
        }else{
          OnlinePresentationSyncService.send(
            'hit-contact',
            target,
            {
              sourcePid:OnlinePresentationSyncService.entityPid(source),
              sourceEntityId:String(source?.id||''),
              amount,
              strongPresentation,
              impactType:String(event.impact?.type||'direct'),
              impactPoint:event.impact?.point&&
                Number.isFinite(Number(event.impact.point.x))&&
                Number.isFinite(Number(event.impact.point.y))
                  ?{
                    x:Number(event.impact.point.x),
                    y:Number(event.impact.point.y)
                  }
                  :null
            }
          );
        }
      }

      if(Training.active){
        if(source===Training.player){
          ScreenShakeService.queue(
            'attacker',
            presentationAmount,
            target.id||'target'
          );
          CameraFovService.queue(
            'attacker',
            presentationAmount,
            target.id||'target'
          );

          if(RelationService.relation(source,target)==='enemy'){
            Training.trackDamage(event);
          }
        }

        if(target===Training.player){
          Training.screenHitFlashUntil=event.now+CombatScreenFeedback.immediateDuration;
          ScreenShakeService.queue(
            'victim',
            presentationAmount,
            target.id||'local'
          );
          CameraFovService.queue(
            'victim',
            presentationAmount,
            target.id||'local'
          );
        }
      }
    });

    GameEvents.on('health-restored',event=>{
      const target=event?.target;
      const amount=Math.max(0,Number(event?.amount)||0);
      if(!target||amount<=0)return;

      const presentation=String(event.presentation||'default');
      Presentation.healPulse(target,presentation);
      Presentation.healNumber(target,amount);

      if(EntitySimulationAuthorityService.isLocal(target)){
        OnlinePresentationSyncService.send(
          'health-restored',
          target,
          {amount,presentation}
        );
      }
    });

    GameEvents.on('ability-used',event=>{
      if(event?.suppressStealthReveal===true)return;
      StealthPresentationService.exposeState(
        event.source,
        600,
        event.now||performance.now()
      );
    });

    GameEvents.on('attack-fired',event=>{
      LimitedUseBuffService.consume(event.source,event.attack);
      StealthPresentationService.exposeState(
        event.source,
        600,
        event.now||performance.now()
      );
      if(
        event?.attack?.presentation?.suppressAttackFeedback!==true
      ){
        VisualFeedbackService.attack(
          event.source,
          event.angle
        );
      }

      if(Training.active&&event.source===Training.player){
        const attack=event.attack||null;
        const explicitFireSound=String(attack?.fireSound||'');
        const instantLaser=
          attack?.suppressProjectileFireSound!==true&&
          (attack?.modules||[]).some(module=>
            AttackModuleService.type(module)==='delivery.area'&&
            String(module?.projectileClassification||'')==='instant-laser'
          );
        if(explicitFireSound){
          SoundService.play(explicitFireSound);
        }else if(instantLaser){
          SoundService.play('shoot');
        }
        ScreenShakeService.fire();
      }
    });


    GameEvents.on('projectile-fired',event=>{
      if(!Training.active)return;
      if(event?.source!==Training.player)return;
      if(
        event?.attack?.suppressProjectileFireSound===true
      )return;

      // 공격음은 입력/AttackSpec 실행 횟수가 아니라 실제 projectile 생성 시점에 재생한다.
      // 같은 프레임의 산탄/동시 다발은 SoundService의 frame dedupe로 한 번만 나고,
      // 시간차 연발은 각 실제 발사 시점마다 별도로 재생된다.
      SoundService.play('shoot');
    });

    GameEvents.on('dodge-ended',event=>{
      FieldDodgeRewardService.finish(event?.target,event?.now||performance.now());
    });

    GameEvents.on('dodge-started',event=>{
      StealthPresentationService.exposeState(
        event.target,
        600,
        event.now||performance.now()
      );
      Presentation.dodge(event.target);
    });

    GameEvents.on('just-dodge',event=>{
      Presentation.justDodge(event.target);
      OnlinePresentationSyncService.send(
        'just-dodge',
        event.target
      );
    });

    GameEvents.on('augment-inventory-changed',event=>{
      if(
        Training.active&&
        (
          event.entity===Training.player||
          [...Training.remotePlayers.values()]
            .includes(event.entity)
        )
      ){
        Training.renderAugHud();
      }
    });

    GameEvents.on('area-attack-fired',event=>{
      if(!Training.active)return;
      if(event?.module?.visual===false)return;
      if(!EffectSpawnService.shouldPresentAttack(event?.source)){
        // 원격 공격의 범위 이펙트는 source 권위 화면에서 생성된
        // 동일 EffectSpec의 effect-spawn 네트워크 복제만 렌더한다.
        // 피격자 권위 재생에서 다시 자동 생성하면 상대 화면에 두 개가 겹친다.
        return;
      }

      const spawnAreaEffect=(spec,source)=>{
        const now=performance.now();
        const effect=EffectSpawnService.spawn(
          {
            ...spec,
            start:
              Number.isFinite(Number(spec.start))
                ?Number(spec.start)
                :now,
            sourceEntityId:
              spec.sourceEntityId||
              source?.id||
              null
          },
          {source}
        );

        if(
          effect&&
          OnlinePresentationSyncService?.shouldSend?.(source)
        ){
          OnlinePresentationSyncService.send(
            'effect-spawn',
            source,
            {
              effect:
                EffectSpawnService.presentationSnapshot(
                  effect,
                  now
                )
            }
          );
        }

        return effect;
      };

      const {
        source,
        angle,
        module,
        center,
        polygon
      }=event;
      const effectColor=AttackPresentationColorService.resolve(
        source,
        event.attack,
        module
      );

      const replacementEffects=(event.attack?.modules||[]).filter(candidate=>{
        if(
          candidate?.type!=='effect.spawn'||
          candidate.replaceAutoAreaEffect!==true
        )return false;
        if(!Array.isArray(candidate.conditions))return true;
        return TriggerModuleService.matches(
          {
            type:'trigger',
            event:'attack.after',
            conditions:candidate.conditions
          },
          'attack.after',
          {
            source:event.source,
            attack:event.attack,
            angle:Number(event.angle)||0,
            now:Number(event.now)||performance.now()
          }
        );
      });
      const wallCutSegments=
        AreaWallCutPresentationService.segments(
          source,
          event.attack,
          module,
          angle,
          polygon
        );
      const clippedOutlineAlreadyDrawn=
        replacementEffects.length===0||
        module.drawsClippedOutline===true||
        replacementEffects.some(
          candidate=>
            candidate.drawsClippedOutline===true||
            ProgressiveClippedAreaOutlinePresentationService
              .supportsModule(candidate)
        );
      if(wallCutSegments.length&&!clippedOutlineAlreadyDrawn){
        const customDuration=replacementEffects
          .reduce((duration,candidate)=>
            Math.max(
              duration,
              Number(candidate.duration)||0,
              (Number(candidate.durationFrames)||0)*GAME_DATA.frameMs
            ),0
          );
        const requestedStrokeAlpha=replacementEffects
          .map(candidate=>Number(candidate.wallCutStrokeAlpha))
          .find(Number.isFinite);
        spawnAreaEffect({
          type:'areaWallCutOutline',
          segments:wallCutSegments,
          start:performance.now(),
          dur:Math.max(
            GAME_DATA.frameMs,
            customDuration,
            Number(event.attack?.presentation?.duration)||0,
            (Number(event.attack?.presentation?.durationFrames)||0)*GAME_DATA.frameMs,
            200
          ),
          color:effectColor,
          strokeAlpha:Number.isFinite(requestedStrokeAlpha)?requestedStrokeAlpha:AttackVisualStyle.strokeAlpha,
          lineWidth:AttackVisualStyle.strokeWidth
        },source);
      }

      if(
        event.module?.autoPresentation===false||
        replacementEffects.length>0
      ){
        return;
      }

      if(module.shape==='sector'){
        spawnAreaEffect({
          type:'botSwing',
          x:source.x,
          y:source.y,
          angle,
          range:module.range,
          halfAngle:module.halfAngle,
          endChord:module.endChord===true,
          endChordWidth:
            Math.max(
              .5,
              Number(module.endChordWidth)||
              AttackVisualStyle.strokeWidth
            ),
          points:Array.isArray(polygon)?polygon.map(point=>({x:point.x,y:point.y})):[],
          start:performance.now(),
          dur:Math.max(
            GAME_DATA.frameMs,
            Number(event.attack?.presentation?.duration)||200
          ),
          color:effectColor
        },source);
      }else if(module.shape==='circle'){
        const renderType=String(module.renderType||'areaCircle');
        spawnAreaEffect({
          type:renderType,
          x:center?.x??source.x,
          y:center?.y??source.y,
          angle,
          range:module.range,
          r:renderType==='annularDoubleSweep'?module.range:0,
          maxR:module.range,
          outer:module.range,
          inner:Math.max(0,Number(module.innerRange)||0),
          span:module.span,
          halfAngle:module.halfAngle,
          sweepCount:module.sweepCount,
          sweepDirection:module.sweepDirection,
          startAngleOffset:module.startAngleOffset,
          converge:module.converge,
          sweepFraction:module.sweepFraction,
          fadePower:module.fadePower,
          lifetimeAlpha:module.lifetimeAlpha,
          hitColor:module.hitColor||effectColor,
          safeColor:module.safeColor,
          fillAlpha:module.fillAlpha,
          strokeAlpha:module.strokeAlpha,
          lineWidth:module.lineWidth,
          safeFillAlpha:module.safeFillAlpha,
          safeStrokeAlpha:module.safeStrokeAlpha,
          safeLineWidth:module.safeLineWidth,
          safeDash:module.safeDash,
          edgeLine:module.edgeLine,
          edgeColor:module.edgeColor,
          edgeAlpha:module.edgeAlpha,
          edgeLineWidth:module.edgeLineWidth,
          hollowInnerRatio:
            Math.max(0,Number(module.innerRange)||0)>0&&Math.max(0,Number(module.range)||0)>0
              ?Math.max(0,Math.min(.98,Number(module.innerRange)/Number(module.range)))
              :0,
          points:
            module.presentationWallClip===false
              ?[]
              :Array.isArray(polygon)
                ?polygon.map(point=>({
                  x:point.x,
                  y:point.y
                }))
                :[],
          wallCutSegments:[],
          start:performance.now(),
          dur:
            Number(module.durationFrames)>0
              ?Number(module.durationFrames)*GAME_DATA.frameMs
              :Number(module.duration)>0
                ?Number(module.duration)
                :renderType==='rocketExplosion'
                  ?22*GAME_DATA.frameMs
                  :(renderType==='bombBlast'
                    ?16*GAME_DATA.frameMs
                    :Math.max(GAME_DATA.frameMs,Number(event.attack?.presentation?.duration)||260)),
          color:effectColor
        },source);
      }else if(module.shape==='tapered-rect'){
        spawnAreaEffect({
          type:'taperedArea',
          x:source.x,
          y:source.y,
          angle,
          range:module.range,
          startHalfWidth:
            Math.max(
              0,
              Number(module.startHalfWidth)||
              Number(module.halfWidth)||
              0
            ),
          endHalfWidth:
            Math.max(
              0,
              Number(module.endHalfWidth)||0
            ),
          start:performance.now(),
          dur:Math.max(
            1,
            Number(event.attack?.presentation?.duration)||
            (
              (Number(event.attack?.presentation?.durationFrames)||0)*
              GAME_DATA.frameMs
            )||
            200
          ),
          color:effectColor
        },source);
      }else{
        const perpendicularOffset=
          Number(module.perpendicularOffset)||0;
        spawnAreaEffect({
          type:'botDrill',
          x:
            (Number(source.x)||0)-
            Math.sin(Number(angle)||0)*
            perpendicularOffset,
          y:
            (Number(source.y)||0)+
            Math.cos(Number(angle)||0)*
            perpendicularOffset,
          angle,
          len:module.range,
          width:module.halfWidth,
          start:performance.now(),
          dur:Math.max(1,Number(event.attack?.presentation?.duration)||((Number(event.attack?.presentation?.durationFrames)||0)*GAME_DATA.frameMs)||200),
          color:effectColor,
          fillAlpha:Number.isFinite(Number(module.fillAlpha))?Number(module.fillAlpha):AttackVisualStyle.fillAlpha,
          strokeAlpha:Number.isFinite(Number(module.strokeAlpha))?Number(module.strokeAlpha):AttackVisualStyle.strokeAlpha
        },source);
      }
    });

    GameEvents.on('ability-telegraph',context=>{
      if(TagService.hasAttack(context.attack,'반격')){
        const counterModule=
          (context.trigger?.modules||[]).find(
            module=>module?.type==='counter.execute'
          )||null;
        const counterPresentation=
          context.source?.character
            ?.counterReadyPresentation||
          null;
        const counterKind=
          String(
            context.source?.counterWindup
              ?.counterKind||
            'normal'
          );
        const counterChargeColor=
          counterPresentation?.kindColors?.[
            counterKind
          ]||
          counterPresentation?.color||
          null;
        Presentation.counterCharge(
          context.source,
          CounterModuleService.requiredWindup,
          {
            ...(counterModule?.presentation||{}),
            color:
              counterChargeColor||
              counterModule?.presentation?.color||
              null
          }
        );
      }
    });

    GameEvents.on('ability-finished',context=>{
      if(TagService.hasAttack(context.attack,'반격')){
        const counterModule=
          (context.trigger?.modules||[]).find(
            module=>module?.type==='counter.execute'
          )||null;
        if(counterModule?.presentation?.fireEffect!==false){
          Presentation.counterFire(
            context.source,
            counterModule?.presentation?.fireColor||null
          );
        }

        if(
          context.source===Training.player&&
          Training.sessionMode==='online'&&
          OnlineDuelService.active
        ){
          OnlineDuelService.sendCounterResolve(
            context.angle,
            context.attack
          );
        }
      }
    });
  }
});