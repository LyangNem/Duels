

const StaminaService=Object.freeze({
  spentRound(){
    return `${typeof Training!=='undefined'?Training.sessionMode:''}:${typeof OnlineDuelService!=='undefined'?OnlineDuelService.roundToken||0:0}`;
  },
  spentTotal(entity){
    return entity?._staminaSpentRound===this.spentRound()?Math.max(0,Number(entity._staminaSpentTotal)||0):0;
  },
  dispatchSpent(entity,amount,now){
    if(!(amount>0)||typeof CharacterTriggerEffectService==='undefined')return;
    CharacterTriggerEffectService.run(entity,'stamina-spent',{source:entity,target:entity,amount,now});
    CharacterTriggerEffectService.observe('enemy-stamina-spent',entity,{amount,now});
  },
  notifySpent(entity,before,now){
    if(!entity||EntitySimulationAuthorityService.isLocal(entity)!==true)return;
    const amount=Math.max(0,(Number(before)||0)-(Number(entity.stamina)||0));
    if(amount<=0)return;
    entity._staminaSpentTotal=this.spentTotal(entity)+amount;
    entity._staminaSpentRound=this.spentRound();
    this.dispatchSpent(entity,amount,now);
  },
  receiveSpentTotal(entity,total,now=performance.now()){
    if(!entity||EntitySimulationAuthorityService.isLocal(entity)||!Number.isFinite(total)||total<0)return false;
    const round=this.spentRound();
    const previous=entity._observedStaminaSpentRound===round?Number(entity._observedStaminaSpentTotal)||0:0;
    if(total<=previous)return false;
    entity._observedStaminaSpentRound=round;
    entity._observedStaminaSpentTotal=total;
    if(typeof CharacterTriggerEffectService!=='undefined')CharacterTriggerEffectService.observe('enemy-stamina-spent',entity,{amount:total-previous,now});
    return true;
  },
  notifyChanged(entity,before,after,now=performance.now()){
    if(!entity)return false;
    const from=Math.max(0,Number(before)||0);
    const to=Math.max(0,Number(after)||0);
    if(Math.abs(to-from)<=1e-6)return false;

    AugmentEffectModuleService.runTrigger(entity,'resource.changed',{
      source:entity,
      target:entity,
      resource:'stamina',
      before:from,
      after:to,
      amount:to-from,
      now
    });
    return true;
  },
  multiplier(entity,now=performance.now()){
    if(!entity)return 1;
    const stats=CombatStatsService.current(entity,now);
    return Math.max(.60,Number(stats.staminaCostMult)||1)*Math.max(.1,Number(stats.staminaCostScale??1)||1);
  },
  cost(entity,amount,now=performance.now()){
    const value=Math.max(0,Number(amount)||0);
    if(!entity)return value;
    return value*this.multiplier(entity,now);
  },
  nominalBudget(entity,now=performance.now()){
    if(!entity)return 0;
    return Math.max(0,Number(entity.stamina)||0)/this.multiplier(entity,now);
  },
  canSpend(entity,amount,now=performance.now()){
    if(!entity)return false;
    const cost=this.cost(entity,amount,now);
    if(Math.max(0,Number(entity.stamina)||0)+1e-6>=cost){
      return true;
    }

    const healthRatio=
      AugmentService.staminaHealthFallbackRatio(entity);
    return (
      healthRatio>0&&
      Math.max(0,Number(entity.health)||0)-
        cost*healthRatio>1
    );
  },
  spend(entity,amount,now=performance.now()){
    const value=this.cost(entity,amount,now);
    if(!entity)return false;

    ResourceValueService.normalizeStamina(entity);
    const before=entity.stamina;
    const debug=entity.debugControl;

    if(debug?.staminaInfinite){
      entity.stamina=entity.maxStamina||entity.stamina||0;
      entity.lastStaminaUse=now;
      this.notifyChanged(entity,before,entity.stamina,now);
      return true;
    }

    if(entity.stamina<value){
      const healthRatio=
        AugmentService.staminaHealthFallbackRatio(entity);
      const healthCost=value*healthRatio;

      if(
        healthRatio<=0||
        entity.health-healthCost<=1
      )return false;

      HealthService.damage(
        entity,
        healthCost,
        now
      );
      entity.stamina=0;
      this.notifySpent(entity,before,now);
      entity.lastStaminaUse=now;
      this.notifyChanged(entity,before,entity.stamina,now);
      return true;
    }

    entity.stamina=Math.max(0,entity.stamina-value);
    this.notifySpent(entity,before,now);
    entity.lastStaminaUse=now;
    this.notifyChanged(entity,before,entity.stamina,now);
    return true;
  },
  restore(entity,amount,now=performance.now()){
    if(!entity)return 0;

    ResourceValueService.normalizeStamina(entity);
    const debug=entity.debugControl;
    const before=entity.stamina;

    if(debug?.staminaInfinite){
      entity.stamina=entity.maxStamina||entity.stamina||0;
      this.notifyChanged(entity,before,entity.stamina,now);
      return entity.stamina-before;
    }

    entity.stamina=Math.min(
      entity.maxStamina,
      entity.stamina+Math.max(0,Number(amount)||0)
    );
    this.notifyChanged(entity,before,entity.stamina,now);
    return entity.stamina-before;
  },
  set(entity,value,now=performance.now()){
    if(!entity)return 0;
    ResourceValueService.normalizeStamina(entity);
    const before=entity.stamina;
    entity.stamina=entity.debugControl?.staminaInfinite
      ?entity.maxStamina
      :Math.max(
        0,
        Math.min(
          entity.maxStamina,
          Number(value)||0
        )
      );
    this.notifyChanged(entity,before,entity.stamina,now);
    return entity.stamina;
  }
});