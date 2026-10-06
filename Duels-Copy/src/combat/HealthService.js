

const HealthService=Object.freeze({
  isInvulnerable(entity,now=performance.now()){
    return !!(
      entity&&
      (
        entity.debugControl?.healthInfinite===true||
        entity.healthPolicy?.invulnerable===true||
        (
          typeof BuffService!=='undefined'&&
          BuffService.live(entity,'invulnerable',now).length>0
        )
      )
    );
  },
  damage(entity,amount,now=performance.now(),options={}){
    if(!entity?.alive)return {applied:false,amount:0,healthDamage:0,defeated:false};

    ResourceValueService.normalizeHealth(entity);

    const value=Math.max(0,Number(amount)||0);

    if(value<=0)return {applied:false,amount:0,healthDamage:0,defeated:false};

    const invulnerable=this.isInvulnerable(entity,now);

    entity.lastDamageTime=now;
    NaturalHealthRegenActivityService.mark(
      entity,
      now
    );
    if(entity.healthRegenPolicy){
      entity.nextHealthRegenAt=now+entity.healthRegenPolicy.idle;
    }

    if(invulnerable){
      return {
        applied:true,
        amount:value,
        healthDamage:0,
        defeated:false,
        prevented:true
      };
    }

    const minimum=Math.max(
      0,
      Number(entity.healthPolicy?.minimum)||0
    );
    const before=entity.health;
    entity.health=Math.max(
      minimum,
      ResourceValueService.round(entity.health-value,entity.health)
    );

    let actual=Math.max(0,before-entity.health);
    if(actual>0){
      entity.healthTrailHealth=Math.max(
        Number(entity.healthTrailHealth)||before,
        before
      );
      entity.healthTrailDelayUntil=now+110;
    }
    let defeated=entity.health<=0;
    let defeatPrevented=false;
    let defeatReplacementPresentation=null;

    if(defeated&&typeof options.beforeDefeat==='function'){
      const decision=options.beforeDefeat({
        entity,
        before,
        after:entity.health,
        amount:actual,
        now
      })||null;
      if(decision?.prevented===true){
        entity.health=Math.min(
          entity.maxHealth,
          Math.max(1,Number(decision.health)||1)
        );
        actual=Math.max(0,before-entity.health);
        defeated=false;
        defeatPrevented=true;
      }
    }


    if(
      defeated&&
      typeof ClusterSummonService!=='undefined'
    ){
      const replacement=
        ClusterSummonService.replaceOwnerBeforeDefeat(
          entity,
          now
        );
      if(replacement?.prevented===true){
        if(replacement.presentDefeat===true){
          defeatReplacementPresentation={
            point:replacement.presentationPoint||null
          };
        }
        /*
          치명 피해 actual은 이미 적용된 피해량이다.
          replacement의 새 체력과 before를 다시 비교하면 부활 체력이 더 높을 때
          actual=0이 되어 damage-applied/K.O. 연출이 유실된다.
        */
        entity.health=Math.min(
          entity.maxHealth,
          Math.max(1,Number(replacement.health)||1)
        );
        defeated=false;
        defeatPrevented=true;
      }
    }


    if(defeated){
      entity.alive=false;
      entity.hidden=true;
      entity.respawnAt=
        now+
        Math.max(
          0,
          Number(
            entity.deathPolicy?.respawnMs
          )||0
        );

      EntityCharacterDeathResetService.reset(
        entity,
        now
      );
    }

    if(actual>0){
      AugmentEffectModuleService.runTrigger(entity,'resource.changed',{
        source:entity,
        target:entity,
        resource:'health',
        before,
        after:entity.health,
        amount:-actual,
        now
      });
    }

    return {
      applied:actual>0,
      amount:actual,
      healthDamage:actual,
      defeated,
      defeatPrevented,
      defeatReplacementPresentation
    };
  },
  restore(entity,amount,source=entity,options={}){
    if(!entity)return 0;

    ResourceValueService.normalizeHealth(entity);

    const healingMult=
      options.applyHealingModifier===false
        ?1
        :Math.max(
          0,
          CombatStatsService
            .current(entity)
            .healingMult
        );
    const value=
      Math.max(0,Number(amount)||0)*
      healingMult;
    const before=entity.health;

    entity.health=Math.min(
      entity.maxHealth,
      ResourceValueService.round(entity.health+value,entity.health)
    );

    if(entity.health>=entity.healthTrailHealth){
      entity.healthTrailHealth=entity.health;
      entity.healthTrailDelayUntil=0;
    }

    const restored=entity.health-before;
    if(
      restored>0&&
      options.notify!==false
    ){
      const restoredAt=performance.now();
      AugmentEffectModuleService.runTrigger(entity,'resource.changed',{
        source:entity,
        target:entity,
        resource:'health',
        before,
        after:entity.health,
        amount:restored,
        now:restoredAt,
        presentation:String(options.presentation||'default')
      });
      GameEvents.emit('health-restored',{
        source:source||entity,
        target:entity,
        amount:restored,
        now:restoredAt,
        presentation:String(options.presentation||'default')
      });
    }

    return restored;
  },
  setInvulnerable(entity,enabled){
    if(!entity)return false;
    entity.healthPolicy.invulnerable=enabled===true;
    return entity.healthPolicy.invulnerable;
  }
});