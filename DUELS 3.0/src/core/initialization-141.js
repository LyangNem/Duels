

GameplayEffectEventSyncService.register(
  'field-dodge-reward',
  payload=>FieldDodgeRewardService.receive(payload)
);