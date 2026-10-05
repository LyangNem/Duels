

const DamagePipeline=Object.freeze({
  apply({
    source,
    target,
    attack,
    execution=null,
    impact=null,
    amountOverride=null,
    targetPolicy=null
  }){
    const relationAllowed=!!source&&!!target&&!!attack&&RelationService.canTarget(source,target,targetPolicy||{},attack);
    if(!relationAllowed){
      return {applied:false,amount:0};
    }

    // 사망 후 respawn 대기 중인 Entity는 월드에 좌표가 남아 있어도
    // 전투 대상이 아니다. 장판/DOT/투사체를 포함한 모든 피해를 공통 차단한다.
    if(target.alive===false){
      return {
        applied:false,
        hit:false,
        amount:0,
        unavailable:true
      };
    }

    const now=performance.now();

    if(
      typeof AttackGuardService!=='undefined'&&
      AttackGuardService.blockDamage(
        {
          source,
          target,
          attack,
          execution,
          impact
        },
        now
      )
    ){
      return {
        applied:false,
        hit:false,
        amount:0,
        blocked:true,
        source,
        target,
        attack,
        execution,
        impact,
        now
      };
    }

    if(
      JustDodgeService.confirmDamageAttempt(
        target,
        now,
        attack
      )
    ){
      return {
        applied:false,
        hit:false,
        amount:0,
        dodged:true,
        source,
        target,
        attack,
        execution,
        impact,
        now
      };
    }

    if(
      target.invincibleUntil>now||
      BuffService.live(target,'invulnerable',now).length>0
    ){
      return {applied:false,amount:0,dodged:true};
    }

    if(impact?.contactOnly===true){
      return {
        applied:false,
        hit:true,
        amount:0,
        contactOnly:true,
        source,
        target,
        attack,
        execution,
        impact,
        now
      };
    }

    AugmentService.update(source,now);
    AugmentService.update(target,now);

    const sourceStats=CombatStatsService.current(source,now);
    const refreshedTargetStats=CombatStatsService.current(target,now);
    const hasAmountOverride=
      amountOverride!==null&&
      amountOverride!==undefined&&
      Number.isFinite(Number(amountOverride));

    const executionBaseDamage=
      Number.isFinite(Number(execution?.sourceBaseDamageSnapshot))
        ?Math.max(0,Number(execution.sourceBaseDamageSnapshot))
        :Math.max(0,Number(source.baseDamage)||0);

    let baseAmount=hasAmountOverride
      ?Math.max(0,Number(amountOverride))
      :executionBaseDamage*attack.damageRatio;
    let preserveZeroDamageHit=false;

    if(!hasAmountOverride){
      for(const module of attack.modules||[]){
        const moduleType=AttackModuleService.type(module);
        if(moduleType==='damage.target-max-health-ratio'){
          baseAmount+=Math.max(0,Number(target.maxHealth)||0)*Math.max(0,Number(module.ratio)||0);
          continue;
        }
        if(moduleType==='damage.range-band-multiplier'){
          const resolvedMultiplier=DamageRangeBandService.multiplier(source,target,attack,impact,module);
          baseAmount*=resolvedMultiplier;
          if(resolvedMultiplier===0&&module.preserveHitEffects===true){
            preserveZeroDamageHit=true;
          }
        }
        if(moduleType==='damage.target-status-multiplier'){
          const status=String(module.status||'');
          if(status&&CCService.has(target,status,now)){
            baseAmount*=
              Math.max(
                0,
                Number(module.multiplier)||1
              );
          }
          continue;
        }
        if(
          moduleType===
            'damage.target-health-ratio-multiplier'
        ){
          const maximum=
            Math.max(
              1,
              Number(target.maxHealth)||1
            );
          const ratio=
            Math.max(
              0,
              Math.min(
                1,
                (Number(target.health)||0)/
                maximum
              )
            );
          const threshold=
            Math.max(
              0,
              Math.min(
                1,
                Number(module.threshold)||0
              )
            );
          const matched=
            module.strict===true
              ?ratio<threshold
              :ratio<=threshold;
          if(matched){
            baseAmount*=
              Math.max(
                0,
                Number(module.multiplier)||1
              );
          }
        }
      }

      baseAmount*=sourceStats.damageMult;
    }
    // 같은 AttackExecution에서 동시에 발사된 여러 탄환은 하나의 공격으로 취급한다.
    // 첫 적중 순간의 받는 피해 배율을 실행 단위로 고정해, 첫 탄이 1회성 방어를
    // 소비하더라도 같은 공격의 나머지 탄환에는 동일한 방어 상태가 적용된다.
    const incomingSnapshot=
      AttackExecutionService.incomingDamageSnapshot(
        execution,
        target,
        refreshedTargetStats
      );

    const rawDamage=Math.max(
      0,
      baseAmount*
        incomingSnapshot.damageTakenMult
    );

    if(rawDamage<=0){
      if(preserveZeroDamageHit){
        return {
          applied:false,
          hit:true,
          amount:0,
          suppressedDamage:true,
          source,
          target,
          attack,
          execution,
          impact,
          now
        };
      }
      return {applied:false,amount:0};
    }

    const characterIncoming=
      CharacterTriggerEffectService.run(
        target,
        'before-damage-received',
        {
          source,
          target,
          attack,
          execution,
          impact,
          amount:rawDamage,
          now
        }
      );

    const finalDamage=AugmentService.beforeIncomingDamage({
      source,
      target,
      attack,
      execution,
      impact,
      amount:Math.max(
        0,
        Number(characterIncoming.amount)||0
      ),
      now
    });

    if(finalDamage<=0)return {applied:false,amount:0};

    const resourceLayerResult=DamageResourceLayerService.absorb(
      target,
      finalDamage,
      {impact,now}
    );
    const durabilityAbsorbed=Math.max(0,Number(resourceLayerResult.absorbed)||0);
    const damageAfterDurability=Math.max(0,Number(resourceLayerResult.remaining)||0);
    if(durabilityAbsorbed>0)target.lastDamageTime=now;

    /*
      내구도 같은 선행 방어 자원이 피해를 100% 받아냈고
      해당 캐릭터 데이터가 완전 방어를 요구하면 실제 적중으로 취급하지 않는다.
      따라서 AttackModuleService.onHit으로 이어지는 CC/회복/상태/넉백/적중 증강 등이
      전부 발동하지 않는다.

      단, 설치형 범위 공격(field-area)은 방어 자원이 피해 자체는 흡수해도
      장판/덫의 적중 효과까지 무효화하지 않는다. 피해는 내구도로 막되 onHit은 정상 진행한다.
    */
    if(
      resourceLayerResult.blockHitEffects===true&&
      durabilityAbsorbed>0&&
      damageAfterDurability<=0
    ){
      target.lastDamageTime=now;
      target.lastHitTime=now;
      target.combatSnapshotDirty=true;

      const durabilityBlockedResult={
        applied:false,
        hit:false,
        blocked:true,
        durabilityBlocked:true,
        amount:0,
        durabilityDamage:durabilityAbsorbed,
        shieldDamage:0,
        healthDamage:0,
        defeated:false,
        source,
        target,
        attack,
        execution,
        impact,
        now
      };

      HitContactFeedbackService.apply({
        source,
        target,
        attack,
        impact,
        amount:durabilityAbsorbed,
        now
      });

      // 체력 피해가 0이어도 실제로 감소한 스패너 내구도량은
      // 일반 피해 숫자와 같은 dmgNum 프레젠테이션으로 표시한다.
      Presentation.damageNumber(
        target,
        durabilityAbsorbed
      );

      NetworkHitAuthorityService.notify(
        durabilityBlockedResult
      );

      return durabilityBlockedResult;
    }

    // 실제로 내구도를 넘어 피해가 들어가는 경우에만 공격자를 피해 원인으로 기억한다.
    NetworkHitAuthorityService.rememberDamageSource(
      source,
      target
    );

    const shieldResult=ShieldService.absorb(
      target,
      damageAfterDurability,
      source,
      {now,reason:'damage'}
    );

    const healthResult=
      shieldResult.remaining>0
        ?HealthService.damage(
          target,
          shieldResult.remaining,
          now,
          {
            beforeDefeat:()=>AugmentService.beforeDefeat({
              source,target,attack,execution,impact,
              amount:shieldResult.remaining,
              now
            })
          }
        )
        :{
          applied:false,
          amount:0,
          healthDamage:0,
          defeated:false,
          defeatPrevented:false
        };

    const totalApplied=
      Math.max(0,Number(durabilityAbsorbed)||0)+
      Math.max(0,Number(shieldResult.absorbed)||0)+
      Math.max(0,Number(healthResult.amount)||0);

    if(totalApplied<=0){
      return {
        applied:false,hit:true,amount:0,
        shieldDamage:0,healthDamage:0,
        defeated:healthResult.defeated,
        source,target,attack,execution,impact,now
      };
    }

    target.lastHitTime=now;

    NetworkHitAuthorityService.recordPredictedDodgeDamage(
      target,
      {
        ...healthResult,
        amount:totalApplied,
        shieldDamage:Math.max(0,Number(shieldResult.absorbed)||0)
      },
      now
    );

    const result={
      applied:true,
      hit:true,
      amount:totalApplied,
      shieldDamage:Math.max(0,Number(shieldResult.absorbed)||0),
      healthDamage:Math.max(0,Number(healthResult.healthDamage)||0)+
        Math.max(0,Number(resourceLayerResult.healthDamage)||0),
      prevented:healthResult.prevented===true||healthResult.defeatPrevented===true,
      defeatPrevented:healthResult.defeatPrevented===true,
      defeated:healthResult.defeated,
      source,target,attack,execution,impact,now
    };

    if(healthResult.defeatReplacementPresentation){
      const koVector=ImpactDirectionService.resolve({
        source,
        target,
        execution,
        impact
      });
      Presentation.deathLaunch(
        target,
        source||null,
        koVector.origin,
        healthResult.defeatReplacementPresentation.point||koVector.target,
        koVector.angle,
        {replacement:true}
      );
    }

    result.executionHealthDamage=execution
      ?AttackExecutionService.addDamage(
        execution,
        target,
        result.healthDamage
      )
      :result.healthDamage;

    ExecutionDamageLedgerService.record(
      source,
      target,
      execution,
      result.amount,
      now
    );

    if(result.healthDamage>0){
      CharacterTriggerEffectService.run(
        target,
        'damage-received',
        result
      );
    }
    if(
      Training.sessionMode!=='online'||
      EntitySimulationAuthorityService.isLocal(source)
    ){
      CharacterTriggerEffectService.run(
        source,
        'damage-dealt',
        result
      );
    }
    AugmentService.onDamageApplied(result);
    GameEvents.emit('damage-applied',result);
    CCService.onDamaged(target,result);

    NeutralizingKnockbackService.followupHit({
      source,
      target,
      now
    });

    NetworkHitAuthorityService.notify(
      result
    );

    if(result.defeated){
      const koVector=ImpactDirectionService.resolve({
        source,
        target,
        execution,
        impact
      });

      GameEvents.emit('entity-defeated',{
        entity:target,
        source,
        attack,
        execution,
        impact,
        koOrigin:koVector.origin,
        koTarget:koVector.target,
        direction:koVector.angle,
        now
      });
    }

    return result;
  }
});
