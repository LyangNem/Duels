


GameEvents.on(
  'projectile-resolved',
  event=>{
    const projectile=event?.projectile;
    const meta=projectile?.orbitInventoryMeta;
    if(
      !meta||
      !projectile?.source
    )return;

    const state=
      OrbitInventoryService.state(
        projectile.source,
        String(meta.stateKey||''),
        false
      );
    if(!state)return;

    const collection=
      String(meta.collection||'normal');
    const itemId=
      String(meta.itemId||'');

    // 이 클라이언트에서 실제 terminal resolution된 정확한 Projectile ID를 기록한다.
    // 원격 소유자의 이전 duel-state snapshot이 늦게 도착해도 같은 원석을 되살리지 않는다.
    OrbitInventoryService.markProjectileResolved(
      projectile.source,
      meta.stateKey,
      collection,
      itemId
    );

    OrbitInventoryService.consumePoint(
      projectile.source,
      state,
      {
        collection,
        item:{id:itemId}
      }
    );
  }
);