

/* 공격 실행 */
const CharacterKillProgressService=Object.freeze({
  apply(source,target,attackId){
    if(
      !source?.alive||
      !target||
      target===source||
      RelationService.relation(source,target)!=='enemy'
    )return false;

    const config=
      source.character?.killRewardProgress;
    if(
      !config||
      typeof config!=='object'
    )return false;

    const excludedKinds=
      Array.isArray(config.excludeTargetKinds)
        ?config.excludeTargetKinds
        :EMPTY_RUNTIME_ITEMS;
    if(
      excludedKinds.includes(
        String(target.kind||'')
      )
    )return false;

    const attackIds=
      Array.isArray(config.attackIds)
        ?config.attackIds
        :EMPTY_RUNTIME_ITEMS;
    if(
      attackIds.length&&
      !attackIds.includes(
        String(attackId||'')
      )
    )return false;

    return ProgressStateService.apply(
      source,
      {
        type:'state.progress',
        ...config
      }
    );
  }
});