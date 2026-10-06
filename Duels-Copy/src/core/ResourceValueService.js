


/* 체력 */
const ResourceValueService=Object.freeze({
  round(value,fallback=0){
    const number=Number(value);
    return Math.round(Number.isFinite(number)?number:fallback);
  },
  normalizeHealth(entity){
    if(!entity)return false;

    const fallbackMax=Math.max(
      1,
      this.round(entity.baseMaxHealth,1)
    );
    entity.maxHealth=Math.max(
      1,
      this.round(entity.maxHealth,fallbackMax)
    );

    const health=Number(entity.health);
    entity.health=Number.isFinite(health)
      ?Math.max(0,Math.min(entity.maxHealth,health))
      :entity.maxHealth;

    const shield=Number(entity.shield);
    entity.shield=Number.isFinite(shield)
      ?Math.max(0,Math.min(entity.maxHealth,shield))
      :0;

    return true;
  },
  normalizeStamina(entity){
    if(!entity)return false;

    const fallbackMax=Math.max(
      0,
      this.round(entity.baseMaxStamina,0)
    );
    entity.maxStamina=Math.max(
      0,
      this.round(entity.maxStamina,fallbackMax)
    );

    const stamina=Number(entity.stamina);
    entity.stamina=Number.isFinite(stamina)
      ?Math.max(0,Math.min(entity.maxStamina,stamina))
      :entity.maxStamina;

    return true;
  },
});