

GameplayAttackSnapshotSyncService.register(
  'circle-formation',
  (entity,payload)=>CircleFormationService.receiveManifest(entity,payload)
);