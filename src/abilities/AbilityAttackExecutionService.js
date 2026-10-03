

const AbilityAttackExecutionService=Object.freeze({
  execute(context,attack,options={}){
    if(!context?.source||!attack)return false;
    const attackResult={};
    const executed=AttackService.execute(
      context.source,
      attack,
      Number(context.angle)||0,
      {
        networkReplay:context.network===true,
        freeAttack:context.freeAttack===true,
        targetPoint:
          options.targetPoint!==undefined
            ?options.targetPoint
            :(context.targetPoint||null),
        targetEntityId:
          options.targetEntityId!==undefined
            ?options.targetEntityId
            :(context.targetEntityId||null),
        cookingMealCount:
          options.cookingMealCount!==undefined
            ?Math.max(0,Math.floor(Number(options.cookingMealCount)||0))
            :Math.max(0,Math.floor(Number(context.cookingMealCount)||0)),
        abilityUseId:context.abilityUseId||null,
        skipWindup:context.skipAttackWindup===true,
        networkAttackAdjustments:context.networkAttackAdjustments||null,
        resourceConditionSnapshot:context.resourceConditionSnapshot||null,
        executionSequence:
          Number.isFinite(Number(options.executionSequence))
            ?Math.max(0,Math.floor(Number(options.executionSequence)||0))
            :Number.isFinite(Number(context.executionSequence))
              ?Math.max(0,Math.floor(Number(context.executionSequence)||0))
              :null,
        attackResult
      }
    );
    if(!executed)return false;

    for(const tag of TagService.attackTags(attack)){
      context.usageTags.add(tag);
    }
    context.executed=true;
    context.handled=true;
    context.resolvedAttackId=attack.id;
    context.networkAttackAdjustments=
      attackResult.networkAttackAdjustments||
      context.networkAttackAdjustments||
      null;
    context.executionSequence=
      Number.isFinite(Number(attackResult.executionSequence))
        ?Math.max(0,Math.floor(Number(attackResult.executionSequence)||0))
        :context.executionSequence;
    context.lastAttackResult=attackResult;
    return true;
  }
});