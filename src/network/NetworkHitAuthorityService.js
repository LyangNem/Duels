

/*
  온라인 피격 권위:
  - 원격 대상에 대한 공격자 화면 충돌은 예측일 뿐 피해를 적용하지 않는다.
  - 대상 소유 클라이언트가 자기 캐릭터의 충돌을 확인한 경우에만 실제 피해를 확정한다.
  - 실제 적중은 duel-hit-confirmed로 공격자에게 통보한다.
  - 입력 공격이 아닌 attack.trigger도 duel-triggered-attack으로 동일 AttackSpec/실행번호를
    다른 클라이언트에 재생해, effectsOnly 넉백 같은 onHit 효과가 대상 권위 화면에서 확정된다.
  - trigger 재생은 발동 source 권위가 이미 이벤트를 확정한 결과이므로 수신 측 원격 source의 alive 미러로
    다시 거부하지 않는다. effectsOnly의 실제 이동/상태 효과는 항상 피격 target 권위에서만 적용한다.
*/
const NetworkHitAuthorityService={
  sequence:0,
  confirmations:new Map(),
  targetAuthoritative(target){
    return (
      Training.sessionMode!=='online'||
      EntitySimulationAuthorityService
        .isLocal(target)
    );
  },
  isOnline(){
    return Training.sessionMode==='online'&&OnlineDuelService.active;
  },
  targetAuthorityPid(target){
    return (
      OnlineParticipantEntityService.pid(
        target
      )||
      String(
        target?.simulationAuthorityPid||
        ''
      )||
      null
    );
  },
  rememberDamageSource(source,target){
    if(!this.isOnline()||!source||!target)return false;

    const sourcePid=OnlineParticipantEntityService.pid(EntityService.owner(source));
    const targetPid=OnlineParticipantEntityService.pid(target);
    if(!sourcePid||!targetPid||sourcePid===targetPid)return false;

    target.lastDamageSourcePid=sourcePid;
    OnlineKillAttributionService.remember(
      targetPid,
      sourcePid,
      OnlineDuelService.roundToken
    );
    return true;
  },
  recordPredictedDodgeDamage(target,healthResult,now){
    if(
      !this.isOnline()||
      !target||
      EntitySimulationAuthorityService.isLocal(target)||
      (target.dodgeUntil||0)<=now
    )return false;

    const ledger=target._predictedDodgeDamage||(target._predictedDodgeDamage=[]);
    ledger.push({
      at:now,
      amount:Math.max(0,Number(healthResult?.healthDamage??healthResult?.amount)||0)
    });
    if(ledger.length>16)ledger.splice(0,ledger.length-16);
    return true;
  },
  prediction(context){
    const sourcePid=
      OnlineParticipantEntityService.pid(
        context?.source
      );
    const targetPid=
      this.targetAuthorityPid(
        context?.target
      );

    return {
      applied:false,
      hit:true,
      predicted:true,
      authoritative:false,
      amount:0,
      source:context?.source||null,
      target:context?.target||null,
      attack:context?.attack||null,
      execution:context?.execution||null,
      impact:context?.impact||null,
      sourcePid,
      targetPid
    };
  },
  confirmationKey({
    attackerPid,
    targetPid,
    attackId,
    executionSequence
  }){
    return [
      String(attackerPid||''),
      String(targetPid||''),
      String(attackId||''),
      Math.max(
        0,
        Math.floor(
          Number(executionSequence)||0
        )
      )
    ].join(':');
  },
  notify(result){
    if(
      Training.sessionMode!=='online'||
      !OnlineDuelService.active||
      !(result?.applied||result?.durabilityBlocked===true)||
      !result?.target||
      CCService.isDotImpact(
        result.impact
      )||
      !EntitySimulationAuthorityService
        .isLocal(result.target)
    )return false;

    const attackerPid=
      OnlineParticipantEntityService.pid(
        result.source
      );
    const targetPid=
      this.targetAuthorityPid(
        result.target
      );

    if(
      !attackerPid||
      !targetPid||
      attackerPid===targetPid
    )return false;

    RoomService.sendGameplay({
      type:'duel-hit-confirmed',
      roundToken:OnlineDuelService.roundToken,
      hitSequence:++this.sequence,
      sentAt:Date.now(),
      attackerPid,
      targetPid,
      sourceEntityId:String(
        result.source?.id||''
      ),
      targetEntityId:String(
        result.target?.id||''
      ),
      attackId:String(
        result.attack?.id||''
      ),
      executionSequence:
        Math.max(
          0,
          Math.floor(
            Number(
              result.execution?.sequence
            )||0
          )
        ),
      directionAngle:
        Number.isFinite(Number(result.execution?.directionAngle))
          ?Number(result.execution.directionAngle)
          :Number(result.impact?.directionAngle)||0,
      amount:
        Math.max(
          0,
          Number(
            result.healthDamage??
            result.amount
          )||0
        ),
      displayAmount:
        Math.max(
          0,
          Number(
            result.durabilityBlocked===true
              ?result.durabilityDamage
              :result.amount
          )||0
        ),
      feedbackAmount:
        Math.max(
          0,
          Number(
            result.durabilityDamage??
            result.amount
          )||0
        ),
      targetHealth:
        Math.max(
          0,
          Number(result.target.health)||0
        ),
      targetAlive:
        result.target.alive!==false,
      defeated:
        result.defeated===true,
      defeatPrevented:
        result.defeatPrevented===true,
      prevented:
        result.prevented===true,
      durabilityBlocked:
        result.durabilityBlocked===true,
      impactType:String(
        result.impact?.type||''
      ),
      impactPhase:String(
        result.impact?.phase||''
      ),
      impactStatus:String(
        result.impact?.status||''
      ),
      impactDot:
        result.impact?.dot===true,
      impactX:
        Number.isFinite(Number(result.impact?.point?.x))
          ?Number(result.impact.point.x)
          :null,
      impactY:
        Number.isFinite(Number(result.impact?.point?.y))
          ?Number(result.impact.point.y)
          :null,
      strongPresentation:
        CCService.has(
          result.target,
          'neutralize',
          result.now||performance.now()
        ),
      impactMeta:
        result.impact?.networkMeta&&
        typeof result.impact.networkMeta==='object'
          ?{...result.impact.networkMeta}
          :null
    });

    return true;
  },
  receive(pid,payload){
    if(
      !OnlineDuelService.active||
      Number(payload?.roundToken)!==
        Number(OnlineDuelService.roundToken)
    )return false;

    const key=this.confirmationKey({
      attackerPid:payload.attackerPid,
      targetPid:payload.targetPid,
      attackId:payload.attackId,
      executionSequence:
        payload.executionSequence
    });

    this.confirmations.set(
      key,
      {
        at:performance.now(),
        amount:
          Math.max(
            0,
            Number(payload.amount)||0
          ),
        defeated:
          payload.defeated===true
      }
    );

    if(this.confirmations.size>256){
      this.confirmations.delete(
        this.confirmations.keys().next().value
      );
    }

    const confirmedAmount=
      Math.max(
        0,
        Number(payload.amount)||0
      );
    const displayAmount=
      Math.max(
        0,
        Number(
          payload.displayAmount??
          payload.amount
        )||0
      );
    const feedbackAmount=
      Math.max(
        0,
        Number(
          payload.feedbackAmount??
          payload.displayAmount??
          payload.amount
        )||0
      );
    const strongPresentation=
      payload.strongPresentation===true;
    const presentationAmount=
      strongPresentation
        ?Math.max(
          displayAmount,
          GAME_DATA.cameraFeedback.strongDamage
        )
        :displayAmount;
    const targetEntity=
      EntityService.items.get(
        String(payload.targetEntityId||'')
      )||
      OnlineParticipantEntityService
        .entity(payload.targetPid);

    const targetIsLocallyAuthoritative=
      targetEntity&&
      EntitySimulationAuthorityService
        .isLocal(targetEntity);

    if(
      targetEntity?.kind==='dummy'&&
      !targetIsLocallyAuthoritative&&
      Number.isFinite(
        Number(payload.targetHealth)
      )
    ){
      targetEntity.health=
        Math.max(
          0,
          Math.min(
            Number(targetEntity.maxHealth)||0,
            Number(payload.targetHealth)||0
          )
        );
      targetEntity.healthTrailHealth=
        Math.max(
          targetEntity.health,
          Number(targetEntity.healthTrailHealth)||
            targetEntity.health
        );
      targetEntity.alive=
        payload.targetAlive!==false;
      targetEntity.hidden=false;
      targetEntity.healthTrailDelayUntil=
        performance.now()+
        GAME_DATA.healthBarTrail.delay;
    }

    // 피격자 본인 화면은 DamagePipeline의 damage-applied에서 이미 같은 숫자를 표시한다.
    // 그 외 공격자/제3자 화면은 확정 패킷으로 동일 피해 숫자를 표시한다.
    if(
      displayAmount>0&&
      targetEntity&&
      !targetIsLocallyAuthoritative
    ){
      Presentation.damageNumber(
        targetEntity,
        displayAmount
      );
    }
    if(
      displayAmount>0&&
      targetEntity&&
      !targetIsLocallyAuthoritative
    ){
      SoundService.play('hit');
    }

    const sourceEntity=
      OnlineParticipantEntityService.entity(payload.attackerPid)||
      EntityService.items.get(String(payload.sourceEntityId||''));

    if(
      payload.durabilityBlocked===true&&
      targetEntity&&
      !targetIsLocallyAuthoritative
    ){
      HitContactFeedbackService.apply({
        source:sourceEntity,
        target:targetEntity,
        attack:
          sourceEntity
            ?AbilityService.attackById(
              sourceEntity.character,
              String(payload.attackId||'')
            )
            :null,
        impact:{
          type:String(payload.impactType||'direct'),
          phase:String(payload.impactPhase||''),
          status:String(payload.impactStatus||''),
          dot:payload.impactDot===true,
          point:
            Number.isFinite(Number(payload.impactX))&&
            Number.isFinite(Number(payload.impactY))
              ?{x:Number(payload.impactX),y:Number(payload.impactY)}
              :null
        },
        amount:feedbackAmount,
        now:performance.now()
      });
    }

    /*
      내구도 100% 흡수처럼 체력 피해가 0인 확정 적중도
      공격자 소유의 orbit inventory 소비는 반드시 확정한다.
      일반 network-hit-confirmed 이벤트 경로와 중복되어도 consumeConfirmed가
      이미 사라진 item에는 false를 반환하므로 안전하다.
    */
    if(
      sourceEntity&&
      EntitySimulationAuthorityService.isLocal(sourceEntity)&&
      payload.durabilityBlocked===true&&
      payload.impactMeta?.kind==='orbit-inventory-projectile'
    ){
      OrbitInventoryService.consumeConfirmed(
        sourceEntity,
        payload.impactMeta
      );
    }

    const confirmedProjectileKey=
      String(
        payload.impactMeta?.projectileKey||''
      );
    let ownerConfirmedProjectile=null;

    if(
      sourceEntity&&
      EntitySimulationAuthorityService.isLocal(sourceEntity)&&
      confirmedProjectileKey
    ){
      ownerConfirmedProjectile=
        ProjectileService.findByNetworkKey(
          sourceEntity,
          confirmedProjectileKey
        );

      if(ownerConfirmedProjectile){
        ProjectileService.confirmAuthoritativeHit(
          ownerConfirmedProjectile,
          String(
            payload.targetEntityId||
            targetEntity?.id||
            ''
          ),
          performance.now(),
          {remoteConfirmation:true}
        );
      }
    }

    if(
      sourceEntity===Training.player&&
      displayAmount>0
    ){
      ScreenShakeService.queue(
        'attacker',
        presentationAmount,
        targetEntity?.id||'target'
      );
      CameraFovService.queue(
        'attacker',
        presentationAmount,
        targetEntity?.id||'target'
      );
    }

    if(
      sourceEntity&&
      EntitySimulationAuthorityService.isLocal(sourceEntity)
    ){
      const executionSequence=
        Math.max(
          0,
          Math.floor(
            Number(payload.executionSequence)||0
          )
        );
      const attack=AbilityService.attackById(sourceEntity.character,String(payload.attackId||''));
      const target=targetEntity||OnlineParticipantEntityService.entity(payload.targetPid);
      if(attack&&target){
        const execution=
          AttackExecutionService.bySequence(
            sourceEntity,
            executionSequence,
            attack,
            Number(payload.directionAngle)||0
          );

        const impact={
          type:String(
            payload.impactType||
            'direct'
          ),
          phase:String(
            payload.impactPhase||
            ''
          ),
          status:String(
            payload.impactStatus||
            ''
          ),
          dot:
            payload.impactDot===true,
          point:
            Number.isFinite(Number(payload.impactX))&&
            Number.isFinite(Number(payload.impactY))
              ?{
                x:Number(payload.impactX),
                y:Number(payload.impactY)
              }
              :null,
          networkMeta:
            payload.impactMeta&&
            typeof payload.impactMeta==='object'
              ?{...payload.impactMeta}
              :null
        };

        const confirmedNow=performance.now();
        const confirmedDamageContext={
          source:sourceEntity,
          target,
          attack,
          execution,
          impact,
          amount:confirmedAmount,
          healthDamage:confirmedAmount,
          executionHealthDamage:confirmedAmount,
          prevented:payload.prevented===true,
          defeatPrevented:
            payload.defeatPrevented===true,
          defeated:payload.defeated===true,
          now:confirmedNow
        };

        GameEvents.emit(
          'network-hit-confirmed',
          confirmedDamageContext
        );

        const sourceTriggerKey=[
          String(payload.attackerPid||''),
          String(payload.targetPid||''),
          String(payload.attackId||''),
          executionSequence,
          Math.max(0,Math.floor(Number(payload.hitSequence)||0))
        ].join(':');
        const sourceConfirmedTriggers=
          sourceEntity._confirmedCharacterDamageTriggers||
          (sourceEntity._confirmedCharacterDamageTriggers=new Set());

        if(
          confirmedAmount>0&&
          !sourceConfirmedTriggers.has(sourceTriggerKey)
        ){
          CharacterTriggerEffectService.run(
            sourceEntity,
            'damage-dealt',
            confirmedDamageContext
          );
          sourceConfirmedTriggers.add(sourceTriggerKey);
          if(sourceConfirmedTriggers.size>512){
            sourceConfirmedTriggers.delete(
              sourceConfirmedTriggers.values().next().value
            );
          }
        }

        if(payload.durabilityBlocked!==true){
          AugmentService.onConfirmedDamageDealt({
            source:sourceEntity,
            target,
            attack,
            execution,
            impact,
            healthDamage:confirmedAmount,
            now:confirmedNow
          });
        }

        const confirmKey=`${String(payload.attackId||'')}:${executionSequence}`;
        const confirmed=sourceEntity._confirmedSourceHitEffects||(sourceEntity._confirmedSourceHitEffects=new Set());
        for(const module of attack.modules||[]){
          // 스패너 내구도만 깎인 완전 방어는 실제 대상 적중이 아니다.
          // 피격자 권위의 로컬 onHit이 이미 차단되는 것과 동일하게,
          // 공격자 화면에서 재생되는 source on-hit 효과도 전부 차단한다.
          // 크리티컬 공격 선택/판정은 이 후처리 경로가 아니므로 영향을 받지 않는다.
          if(payload.durabilityBlocked===true)break;
          const type=AttackModuleService.type(module);
          const impactPhase=String(payload.impactPhase||'');
          const moveTargetIsSupported=
            module.target==='hit-target'||
            module.target==='attack-direction'||
            module.target?.type==='projectile';
          const sourceMove=(
            type==='movement.move'&&
            moveTargetIsSupported&&
            (
              module.when==='on-hit'||
              (module.when==='on-projectile-outbound-hit'&&impactPhase==='outbound')||
              (module.when==='on-projectile-return-hit'&&impactPhase==='returning')
            )
          );
          const sourceModifier=(
            type==='modifier.set'&&
            module.when==='on-hit'&&
            module.recipient!=='target'&&
            COMBAT_BUFF_DEFS[String(module.stat||'')]
          );
          const sourceRestore=(
            type==='resource.restore'&&
            module.when==='on-hit'&&
            String(module.recipient||'target')==='source'
          );
          const sourceEffect=(
            type==='effect.spawn'&&
            module.when==='on-hit'
          );
          const sourceWindow=(
            type==='state.window'&&
            module.when==='on-hit'
          );
          const sourceStackMark=(
            type==='stack.mark'&&
            module.when==='on-hit'
          );
          const sourceCookingAcquire=(
            type==='cooking.acquire'&&
            module.when==='on-hit'
          );
          if(type!=='state.progress'&&!sourceMove&&!sourceModifier&&!sourceRestore&&!sourceEffect&&!sourceWindow&&!sourceStackMark&&!sourceCookingAcquire)continue;
          if(type==='state.progress'&&module.when!=='on-hit')continue;
          const effectKey=`${confirmKey}:${type}:${String(module.stateKey||module.sourceId||module.stat||module.resource||module.renderType||module.target||'')}:${impactPhase}`;
          if(module.oncePerExecution&&confirmed.has(effectKey))continue;
          if(sourceCookingAcquire){
            if(payload.prevented===true)continue;
            if(Array.isArray(module.targetKinds)&&module.targetKinds.length&&!module.targetKinds.includes(String(target?.kind||'')))continue;
            const key=`cooking.acquire:${String(module.effectKey||module.stateKey||'default')}`;
            if(module.oncePerExecution&&AttackExecutionService.hasEffect(execution,key))continue;
            const gained=CookingService.acquire(sourceEntity,Math.max(0,Number(module.amount)||0));
            if(gained>0&&module.oncePerExecution)AttackExecutionService.markEffect(execution,key);
          }else if(sourceStackMark){
            if(payload.prevented===true)continue;
            StackMarkService.apply(
              sourceEntity,
              target,
              module,
              confirmedNow
            );
          }else if(type==='state.progress'){
            AttackModuleService.applyHitProgress(sourceEntity,target,module,{
              attack,
              execution,
              impact,
              healthDamage:confirmedAmount,
              prevented:payload.prevented===true,
              now:confirmedNow
            });
          }else if(sourceRestore){
            const excludedTargetKinds=
              Array.isArray(module.excludeTargetKinds)
                ?module.excludeTargetKinds
                :EMPTY_RUNTIME_ITEMS;
            if(
              excludedTargetKinds.includes(
                String(target?.kind||'')
              )
            )continue;

            const applyRestore=()=>ResourceRestoreEffectService.apply({
              source:sourceEntity,
              target,
              module:{...module,recipient:'source'},
              defaultRecipient:'source',
              presentationDefault:'ability',
              reason:'network-hit-confirmed.resource.restore',
              now:performance.now()
            });
            const restoreDelay=Math.max(0,Number(module.delay)||0);
            if(restoreDelay>0)SimulationScheduleService.scheduleContinuation({source:sourceEntity,at:performance.now()+restoreDelay,continue:applyRestore});
            else applyRestore();
          }else if(sourceWindow){
            if(payload.prevented===true)continue;
            if(
              !AttackModuleService.hitConditionMatches(
                sourceEntity,
                target,
                attack,
                execution,
                Number(execution?.directionAngle)||
                  Number(payload.directionAngle)||
                  0,
                module
              )
            )continue;
            const stateKey=String(module.stateKey||'');
            if(!stateKey)continue;
            const stateData={...(module.data||{})};
            if(module.captureHitTarget===true){
              stateData.targetEntityId=String(target?.id||'');
            }
            TimedActionStateService.open(sourceEntity,{
              stateKey,
              duration:Math.max(0,Number(module.duration)||0),
              retainCompleteMs:Math.max(0,Number(module.retainCompleteMs)||0),
              data:stateData
            },confirmedNow);
          }else if(sourceEffect){
            AttackModuleService.spawnAttackEffect(
              sourceEntity,
              attack,
              Number(execution?.directionAngle)||Number(payload.directionAngle)||0,
              execution,
              module,
              target
            );
          }else if(sourceModifier){
            AttackModuleService.applySourceOnHitModifier(
              sourceEntity,
              target,
              attack,
              execution,
              module
            );
          }else if(sourceMove){
            const sourceMoveKey=`source-move:${module.target?.stateKey||module.target||'hit-target'}`;
            if(
              module.oncePerExecution&&
              AttackExecutionService.hasEffect(execution,sourceMoveKey)
            )continue;
            const attackDirection=module.target==='attack-direction';
            let moveTarget=module.target?.type==='projectile'
              ?ProjectileStateService.get(
                sourceEntity,
                module.target.stateKey
              )
              :(attackDirection?null:target);

            if(
              !moveTarget&&
              module.target?.type==='projectile'&&
              Number.isFinite(Number(payload.impactX))&&
              Number.isFinite(Number(payload.impactY))
            ){
              moveTarget={
                x:Number(payload.impactX),
                y:Number(payload.impactY),
                confirmedImpact:true
              };
            }

            if(!moveTarget&&!attackDirection)continue;

            const dx=moveTarget
              ?(Number(moveTarget.x)||0)-(Number(sourceEntity.x)||0)
              :0;
            const dy=moveTarget
              ?(Number(moveTarget.y)||0)-(Number(sourceEntity.y)||0)
              :0;
            const distance=attackDirection
              ?Math.max(0,Number(module.distance)||0)
              :Math.hypot(dx,dy);
            const angle=attackDirection
              ?(
                Number.isFinite(Number(execution?.directionAngle))
                  ?Number(execution.directionAngle)
                  :Number(payload.directionAngle)||0
              )
              :(distance>.001?Math.atan2(dy,dx):0);

            MovementAbilityService.start(
              sourceEntity,
              {...module,type:'movement.move',control:'fixed'},
              angle,
              {
                runtimeDistance:distance,
                angle
              }
            );

            if(module.oncePerExecution){
              AttackExecutionService.markEffect(execution,sourceMoveKey);
            }

            
          }
          if(module.oncePerExecution)confirmed.add(effectKey);
        }
        if(confirmed.size>128){
          const first=confirmed.values().next().value;
          confirmed.delete(first);
        }

        /*
          대상 권위가 확정한 일반 비관통 투사체 적중은
          공격자 화면에서도 같은 execution의 실제 투사체를 소비한다.
          3.1101에서 prediction 단계의 즉시 삭제를 제거했으므로,
          확정 제거를 귀환 outbound에만 한정하면 일반 총알이 피해는 주면서
          공격자 화면에서 대상을 그대로 통과해 보이게 된다.
        */
        if(
          confirmedAmount>0&&
          impact.type==='projectile'
        ){
          let projectileIndex=
            confirmedProjectileKey
              ?ProjectileService.items.findIndex(
                projectile=>
                  projectile?.source===sourceEntity&&
                  String(
                    projectile.networkKey||''
                  )===confirmedProjectileKey
              )
              :-1;

          // 구형/키 없는 일반 투사체 패킷만 기존 execution 기반 탐색으로 호환.
          if(projectileIndex<0&&!confirmedProjectileKey){
            projectileIndex=
              ProjectileService.items.findIndex(
                projectile=>{
                  if(projectile?.source!==sourceEntity)return false;

                  const sequence=Math.max(
                    0,
                    Math.floor(
                      Number(
                        projectile.volley
                          ?.execution
                          ?.sequence
                      )||0
                    )
                  );
                  if(sequence!==executionSequence)return false;

                  const phase=
                    String(impact.phase||'outbound');

                  const projectileAttackId=
                    phase==='returning'
                      ?String(
                        projectile.attack?.id||
                        ''
                      )
                      :String(
                        projectile.outboundAttack?.id||
                        projectile.attack?.id||
                        ''
                      );

                  if(
                    projectileAttackId!==
                    String(payload.attackId||'')
                  )return false;

                  const returning=
                    projectile.behavior?.returning;

                  if(
                    returning&&
                    phase&&
                    String(returning.phase||'')!==
                      phase
                  )return false;

                  const collisionPolicy=
                    projectile.behavior
                      ?.collisionPolicy||
                    CollisionPolicyService.normalize({
                      passWalls:
                        projectile.behavior
                          ?.pierce
                          ?.walls===true,
                      passEnemies:
                        projectile.behavior
                          ?.pierce
                          ?.targets===true
                    });

                  return (
                    collisionPolicy
                      .passEnemies!==true
                  );
                }
              );
          }

          if(projectileIndex>=0){
            const projectile=
              ProjectileService.items[
                projectileIndex
              ];

            if(!confirmedProjectileKey){
              ProjectileService.confirmAuthoritativeHit(
                projectile,
                String(
                  payload.targetEntityId||
                  target?.id||
                  ''
                ),
                confirmedNow,
                {remoteConfirmation:true}
              );
            }

            const collisionPolicy=
              projectile.behavior
                ?.collisionPolicy||
              CollisionPolicyService.normalize({
                passWalls:
                  projectile.behavior
                    ?.pierce
                    ?.walls===true,
                passEnemies:
                  projectile.behavior
                    ?.pierce
                    ?.targets===true
              });

            /*
              exact projectileKey로 찾은 경우에도 소비 여부는
              projectile.pierce/collisionPolicy를 단일 기준으로 사용한다.
              적 관통 투사체는 확정 적중 후에도 현재 경로를 계속 유지한다.
            */
            if(
              collisionPolicy.passEnemies!==true
            ){
              const targetArrival=
                TargetPointProjectileService.arrival(
                  projectile
                );
              const lingerOnTarget=
                targetArrival?.linger?.atTarget===true;

              /*
                적중 확정 좌표를 원본 projectile에 먼저 반영한다.
                이후 impact field, stationary linger, 귀환은 모두 이 좌표를
                단일 진실 원천으로 사용한다.
              */
              if(
                Number.isFinite(Number(payload.impactX))&&
                Number.isFinite(Number(payload.impactY))
              ){
                projectile.x=Number(payload.impactX);
                projectile.y=Number(payload.impactY);
                projectile.prevX=projectile.x;
                projectile.prevY=projectile.y;

                if(projectile.origin){
                  projectile.travel=Math.hypot(
                    projectile.x-
                      (Number(projectile.origin.x)||0),
                    projectile.y-
                      (Number(projectile.origin.y)||0)
                  );
                }
              }

              ProjectileImpactService.resolve(
                projectile,
                'target'
              );

              if(lingerOnTarget){
                projectile.predictedContactConsumeOnly=false;

                if(!projectile.stationaryArrival){
                  TargetPointProjectileService.beginLinger(
                    projectile,
                    confirmedNow,
                    'target'
                  );
                }
              }else{
                ProjectileService.finish(
                  projectile,
                  true
                );
                ProjectileService.items.splice(
                  projectileIndex,
                  1
                );
              }
            }
          }else{
            /*
              대상 권위의 적중 확정이 도착했지만 공격자 화면에서 원본 투사체가
              이미 정리된 경우에도 projectile.impact의 target 후처리는 유실되면 안 된다.
              실제 충돌점과 기존 AttackSpec의 impact 설정만 담은 carrier를 만들어
              동일 ProjectileImpactService 경로를 재사용한다.
            */
            const impactConfig=
              ProjectileModuleService.config(
                attack
              )?.impact||
              null;
            const impactPoint=
              impact.point||
              (
                Number.isFinite(Number(payload.impactX))&&
                Number.isFinite(Number(payload.impactY))
                  ?{
                    x:Number(payload.impactX),
                    y:Number(payload.impactY)
                  }
                  :null
              );

            if(
              impactConfig&&
              impactPoint&&
              !AttackExecutionService.hasEffect(
                execution,
                'confirmed-projectile-impact:target'
              )
            ){
              const carrier={
                source:sourceEntity,
                attack,
                x:Number(impactPoint.x),
                y:Number(impactPoint.y),
                angle:
                  Number.isFinite(Number(execution?.directionAngle))
                    ?Number(execution.directionAngle)
                    :Number(payload.directionAngle)||0,
                behavior:{
                  impact:impactConfig
                },
                volley:{
                  execution
                },
                networkKey:
                  confirmedProjectileKey||
                  `confirmed-impact:${String(payload.attackId||'')}:${executionSequence}`
              };

              ProjectileImpactService.resolve(
                carrier,
                'target'
              );
              AttackExecutionService.markEffect(
                execution,
                'confirmed-projectile-impact:target'
              );
            }
          }
        }
      }
    }


    return true;
  },
  reset(){
    this.sequence=0;
    this.confirmations.clear();
  }
};