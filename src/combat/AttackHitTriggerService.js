

/* 공격 적중 Trigger: 기하 판정이 실제 적중을 확정한 뒤 피해 파이프라인 진입을 공통 Trigger로 통일한다. */
const AttackHitTriggerService=Object.freeze({
  trigger:Object.freeze({type:'trigger',event:'attack.hit',conditions:Object.freeze([])}),
  damage(context){
    if(
      !NetworkHitAuthorityService
        .targetAuthoritative(
          context.target
        )
    ){
      return NetworkHitAuthorityService
        .prediction(context);
    }

    const oncePerExecution=AttackModuleService.hasModule(
      context.attack,
      context.execution,
      'hit.once-per-execution'
    );

    if(
      oncePerExecution&&
      AttackExecutionService.hasHitOn(context.execution,context.target)
    ){
      return {
        applied:false,
        hit:true,
        amount:0,
        duplicateExecutionHit:true,
        source:context.source,
        target:context.target,
        attack:context.attack,
        execution:context.execution,
        impact:context.impact||null
      };
    }

    let result={applied:false,amount:0};
    TriggerDispatchService.execute(
      this.trigger,
      'attack.hit',
      context,
      ()=>{result=DamagePipeline.apply(context)}
    );

    if(
      oncePerExecution&&
      (result.hit||result.durabilityBlocked===true)
    ){
      AttackExecutionService.markHitOn(context.execution,context.target);
    }

    return result;
  }
});