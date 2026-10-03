

/* 자연 회복을 막는 플레이 행동을 한 곳에서 기록한다.
   정밀 이동은 자연 회복을 막지 않는 유일한 이동 예외다. */
const NaturalHealthRegenActivityService=Object.freeze({
  mark(entity,now=performance.now(),{
    precisionMovement=false
  }={}){
    if(!entity||precisionMovement)return false;

    const at=Math.max(
      0,
      Number(now)||performance.now()
    );

    entity.lastNaturalRegenBlockTime=
      Math.max(
        Number(entity.lastNaturalRegenBlockTime)||0,
        at
      );

    if(entity.healthRegenPolicy){
      const stats=
        CombatStatsService.current(
          entity,
          at
        );
      entity.nextHealthRegenAt=
        at+
        entity.healthRegenPolicy.idle*
          Math.max(
            0,
            stats.regenDelayMult
          );
    }

    return true;
  },
  latest(entity){
    return Math.max(
      Number(entity?.lastDamageTime)||0,
      Number(entity?.lastAttackTime)||0,
      Number(
        entity?.lastNaturalRegenBlockTime
      )||0
    );
  },
  startNow(entity,now=performance.now()){
    if(!entity?.healthRegenPolicy)return false;
    const stats=
      CombatStatsService.current(
        entity,
        now
      );
    const idle=
      Math.max(
        0,
        entity.healthRegenPolicy.idle*
          Math.max(
            0,
            stats.regenDelayMult
          )
      );
    const readyAt=
      Math.max(
        0,
        Number(now)||performance.now()
      )-
      idle-
      1;
    entity.lastDamageTime=
      Math.min(
        Number(entity.lastDamageTime)||0,
        readyAt
      );
    entity.lastAttackTime=
      Math.min(
        Number(entity.lastAttackTime)||0,
        readyAt
      );
    entity.lastNaturalRegenBlockTime=
      Math.min(
        Number(entity.lastNaturalRegenBlockTime)||0,
        readyAt
      );
    entity.nextHealthRegenAt=
      Math.max(
        0,
        Number(now)||performance.now()
      );
    return true;
  }
});