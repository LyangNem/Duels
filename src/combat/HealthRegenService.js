

/* 체력 회복 */
const HealthRegenService=Object.freeze({
  update(entity,now=performance.now()){
    const policy=entity?.healthRegenPolicy;
    if(
      !entity?.alive||
      !policy
    )return false;

    const forcedAt=
      Math.max(0,Number(entity.forcedNaturalRegenAt)||0);
    if(forcedAt>0&&now>=forcedAt){
      entity.forcedNaturalRegenAt=0;
      NaturalHealthRegenActivityService.startNow(
        entity,
        now
      );
    }

    const stats=CombatStatsService.current(entity,now);
    // 체력 정지는 기본 자연 회복만 막는다. 피해, 직접 회복, 버프 회복에는 관여하지 않는다.
    if(!entity.debugControl?.healthFrozen){
      const lastCombatAt=
        NaturalHealthRegenActivityService
          .latest(entity);
      const idle=Math.max(
        0,
        policy.idle*Math.max(0,stats.regenDelayMult)
      );

      if(now-lastCombatAt<idle){
        entity.nextHealthRegenAt=lastCombatAt+idle;
      }else if(now>=(entity.nextHealthRegenAt||0)){
        if(entity.health<entity.maxHealth){
          HealthService.restore(
            entity,
            entity.maxHealth*policy.ratio,
            entity
          );
        }
        entity.nextHealthRegenAt=now+policy.tick;
      }
    }

    // 틱형 재생 버프는 자연 회복과 별도로 정확한 tickInterval마다 회복한다.
    for(const item of BuffService.live(entity,'regeneration',now)){
      const interval=Math.max(
        1,
        Number(item.data?.tickInterval)||250
      );
      let nextTick=Number(item.data?.nextTick);
      if(!Number.isFinite(nextTick)){
        nextTick=(Number(item.start)||now)+interval;
      }

      let guard=0;
      while(
        now>=nextTick&&
        nextTick<=item.end&&
        guard<8
      ){
        HealthService.restore(
          entity,
          Math.max(
            0,
            Number(item.value)||0
          ),
          EntityService.items.get(
            item.sourceId
          )||entity,
          {presentation:'regeneration'}
        );

        nextTick+=interval;
        guard++;
      }

      item.data.nextTick=nextTick;
    }

    // 초당 회복 버프는 자연 회복과 별도의 효과라 체력 정지의 영향을 받지 않는다.
    if(stats.regenFlatPerSec!==0||stats.regenPercentPerSec!==0){
      const tickAt=entity.buffRegenTickAt||now;
      const elapsed=Math.max(0,now-tickAt);
      const ticks=Math.floor(elapsed/1000);

      if(ticks>=1){
        const amount=(
          stats.regenFlatPerSec+
          entity.maxHealth*stats.regenPercentPerSec
        )*ticks;

        if(amount>0){
          HealthService.restore(entity,amount,entity);
        }else if(amount<0){
          StatusDamageService.apply({type:'regen-negative',source:entity,target:entity,amount:-amount});
        }

        entity.buffRegenTickAt=tickAt+ticks*1000;
      }
    }

    return true;
  }
});