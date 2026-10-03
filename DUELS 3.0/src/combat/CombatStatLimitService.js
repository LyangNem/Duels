


/* 전투 스탯 */
const CombatStatLimitService=Object.freeze({
  apply(stats){
    if(!stats)return stats;
    stats.damageMult=Math.max(.10,stats.damageMult);
    stats.projectileSpeedMult=Math.max(.10,stats.projectileSpeedMult);
    stats.speedMult=Math.max(.10,stats.speedMult);
    stats.staminaRegenMult=Math.max(.10,stats.staminaRegenMult);
    stats.staminaCostMult=Math.max(.60,stats.staminaCostMult);
    stats.attackSpeedMult=Math.max(.0001,stats.attackSpeedMult);
    stats.damageTakenMult=Math.max(.10,stats.damageTakenMult);
    stats.dodgeDistanceMult=Math.max(0,stats.dodgeDistanceMult);
    stats.dodgeSpeedMult=Math.max(.10,stats.dodgeSpeedMult);
    stats.healingMult=Math.max(0,stats.healingMult);
    stats.regenDelayMult=Math.max(0,stats.regenDelayMult);
    return stats;
  }
});