GameEvents.on('damage-applied',event=>ReactiveEquipmentService.damage(event));
GameEvents.on('projectile-redirected',event=>ProjectileRedirectSyncService.broadcast(event.projectile));
GameEvents.on('projectile-wall-relayed',event=>ProjectileRedirectSyncService.relay(event));
GameEvents.on('just-dodge',event=>ReactiveEquipmentService.damage({...event.cause,target:event.target,now:event.now,dodged:true}));
GameEvents.on('damage-avoided',event=>ReactiveEquipmentService.damage(event));
