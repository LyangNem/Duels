

const CombatModifierService=Object.freeze({
  statusParams(type,data={}){
    const def=COMBAT_STATUS_DEFS[type]||{};
    return {
      ...(def.defaults||{}),
      ...(data||{})
    };
  },
  empty(){
    return {
      speedMult:1,
      damageMult:1,
      damageTakenMult:1,
      regenDelayMult:1,
      regenFlatPerSec:0,
      regenPercentPerSec:0,
      staminaRegenMult:1,
      staminaRegenAdditive:0,
      staminaRegenBlocked:false,
      staminaCostMult:1,
      attackSpeedMult:1,
      projectileSpeedMult:1,
      dodgeDistanceMult:1,
      dodgeSpeedMult:1,
      healingMult:1,
      canMove:true,
      canAct:true,
      canUseDodge:true
    };
  },
  applyStatus(stats,type,data={}){
    // CCService.add에서 이미 기본값과 입력값을 병합해 저장한다.
    // 스탯 조회 때 같은 데이터를 다시 spread 하지 않는다.
    const params=data||{};

    if(
      type==='stun'||
      type==='revive'||
      type==='neutralize'||
      type==='freeze'||
      type==='sleep'
    ){
      stats.canMove=false;
      stats.canAct=false;
      stats.canUseDodge=false;
      stats.speedMult=0;
      return;
    }

    if(type==='silence'){
      stats.canAct=false;
      stats.canUseDodge=false;
      return;
    }

    if(type==='bind'){
      stats.canMove=false;
      stats.speedMult=0;
      return;
    }

    if(type==='slow'){
      stats.speedMult*=Math.max(
        0,
        Number(params.factor)||0
      );
      return;
    }

    if(type==='zap'){
      const multiplier=Number.isFinite(
        Number(params.staminaRegenMultiplier)
      )
        ?Number(params.staminaRegenMultiplier)
        :STATUS_EFFECT_RULES.zap.staminaRegenMultiplier;

      stats.staminaRegenAdditive+=
        Math.max(0,multiplier)-1;
      return;
    }

    if(type==='discharge'){
      stats.staminaRegenBlocked=true;
      stats.staminaRegenMult=0;
    }
  }
});