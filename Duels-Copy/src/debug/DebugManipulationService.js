

const DebugManipulationService=Object.freeze({
  canEditCombatant(entity){
    return !!entity&&entity.kind==='player';
  },
  setCharacter(entity,characterId){
    if(!this.canEditCombatant(entity))return false;
    const character=GAME_DATA.characters[characterId];
    if(!character)return false;

    const hpRatio=entity.maxHealth>0?entity.health/entity.maxHealth:1;
    const staminaRatio=entity.maxStamina>0?entity.stamina/entity.maxStamina:1;

    // 디버그 캐릭터 변경도 일반 캐릭터 변경과 동일하게
    // 이전 캐릭터가 소유한 transient combat runtime을 먼저 제거한다.
    Training.clearCharacterRuntime(entity);
    SimulationScheduleService.clearForSource?.(entity);

    entity.actionState?.clear?.();
    entity.wallDeferredAttacks=[];
    MovementService.finalizeForcedMotion(entity);
    entity.attackPreview=null;
    entity.counterWindup=null;
    entity.counterReadyUntil=0;
    entity.counterReadyCharges=0;
    entity.dodgeUntil=0;
    entity.invincibleUntil=0;
    entity.abilityPending?.clear?.();
    entity.cooldowns?.clear?.();

    entity.character=character;
    entity.radius=character.radius;
    entity.color=character.color;
    entity.baseMaxHealth=character.maxHealth;
    entity.maxHealth=character.maxHealth;
    entity.health=Math.max(0,Math.min(entity.maxHealth,entity.maxHealth*hpRatio));
    entity.shield=Math.max(
      0,
      Math.min(
        entity.maxHealth,
        Number(entity.shield)||0
      )
    );
    entity.speed=character.speed;
    entity.baseDamage=character.baseDamage;
    entity.baseMaxStamina=GAME_DATA.stamina.max;
    entity.maxStamina=GAME_DATA.stamina.max;
    entity.stamina=Math.max(0,Math.min(entity.maxStamina,entity.maxStamina*staminaRatio));
    entity.lastStaminaUse=0;
    AugmentService.rebuild(entity);

    return true;
  }
});