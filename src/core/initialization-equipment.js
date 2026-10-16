GameEvents.on('damage-applied',event=>ReactiveEquipmentService.damage(event));
GameEvents.on('projectile-redirected',event=>ProjectileRedirectSyncService.broadcast(event.projectile));
GameEvents.on('projectile-wall-relayed',event=>ProjectileRedirectSyncService.relay(event));
GameEvents.on('damage-avoided',event=>ReactiveEquipmentService.damage(event));

GameEvents.on('damage-applied',event=>IdeaModuleService.hit(event));
GameEvents.on('source-damage-confirmed',event=>IdeaModuleService.hit(event));
GameEvents.on('attack-fired',event=>IdeaModuleService.attack(event));
