

GameplayFeatureStateSyncService.register(
  'command',
  (entity,feature,active)=>CommandFeatureService.applyRemote(entity,feature,active)
);