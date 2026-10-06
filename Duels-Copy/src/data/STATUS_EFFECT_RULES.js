

/* 상태 / 버프 정의 */
const STATUS_EFFECT_RULES=freezeCharacterData({
  freeze:{maxHealthDamageRatio:CHARACTER_RULES.statusDefaults.freeze.ratio,interval:CHARACTER_RULES.statusDefaults.freeze.interval},
  burn:{flatDamage:CHARACTER_RULES.statusDefaults.burn.flat,interval:CHARACTER_RULES.statusDefaults.burn.interval},
  bleed:{maxHealthDamageRatio:CHARACTER_RULES.statusDefaults.bleed.ratio,interval:CHARACTER_RULES.statusDefaults.bleed.interval},
  zap:{staminaRegenMultiplier:CHARACTER_RULES.statusDefaults.zap.staminaRegenMultiplier},
  slow:{factor:CHARACTER_RULES.statusDefaults.slow.factor}
});