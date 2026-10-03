

const CombatStatsService=Object.freeze({
  buffOnly(entity,now=performance.now()){
    const stats=CombatModifierService.empty();
    if(entity){
      CharacterPassiveBuffService.sync(entity);
      BuffService.applyToStats(entity,stats,now);
    }
    stats.staminaRegenMult=
      Math.max(
        0,
        1+Number(stats.staminaRegenAdditive||0)
      );
    return stats;
  },
  current(entity,now=performance.now()){
    const stats=this.buffOnly(entity,now);
    if(entity){
      CCService.applyToStats(entity,stats,now);
      if(entity.actionState){
        for(const state of entity.actionState.values()){
          if(
            state?.blocksAction===true&&
            (state.endsAt===undefined||Number(state.endsAt)>now)
          ){
            stats.canAct=false;
            break;
          }
        }
      }
    }

    // 스테미나 회복속도 버프와 감전은 같은 가산 계층에서 합산한 뒤 한 번만 배율화한다.
    stats.staminaRegenMult=
      stats.staminaRegenBlocked===true
        ?0
        :Math.max(
            0,
            1+Number(stats.staminaRegenAdditive||0)
          );

    return CombatStatLimitService.apply(stats);
  }
});