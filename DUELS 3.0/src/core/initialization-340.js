

ProjectileTargetFilterService.register(
  'cooking.stove-input',
  ({projectile,target})=>!(
    CookingService.isOwnStove(projectile?.source,target)&&
    CookingService.stoveFull(projectile?.source)
  )
);