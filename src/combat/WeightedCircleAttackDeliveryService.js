

const WeightedCircleAttackDeliveryService=Object.freeze({
  execute({
    source,attack,execution,model,circles=[],impactCircleForTarget=null,
    statusStageForTarget=null,statusConfig=null,now=performance.now()
  }={}){
    if(!source||!attack||!execution||!model||!Array.isArray(circles)||!circles.length)return 0;
    const sourceDamageMultiplier=Math.max(0,Number(CombatStatsService.current(source,now).damageMult)||0);
    const executionBaseDamage=Number.isFinite(Number(execution?.sourceBaseDamageSnapshot))
      ?Math.max(0,Number(execution.sourceBaseDamageSnapshot))
      :Math.max(0,Number(source.baseDamage)||0);
    let hitCount=0;
    for(const target of EntityService.items.values()){
      if(!target||target===source||!target.alive||target.hidden||!RelationService.canTarget(source,target,{},attack))continue;
      const point=NetworkCollisionPositionService.point(target);
      const multiplier=Math.max(0,Number(model.multiplierForTarget?.(point.x,point.y,Math.max(0,Number(target.radius)||0)))||0);
      if(multiplier<=0)continue;
      const impactCircle=(typeof impactCircleForTarget==='function'?impactCircleForTarget(target):null)||circles[0];
      const impactPoint={x:Number(point.x)||0,y:Number(point.y)||0};
      const impactOrigin={x:Number(impactCircle?.x)||Number(source.x)||0,y:Number(impactCircle?.y)||Number(source.y)||0};
      const impactAngle=Math.atan2(impactPoint.y-impactOrigin.y,impactPoint.x-impactOrigin.x);
      const impact={
        type:'area',
        point:impactPoint,
        origin:{mode:'point',x:impactOrigin.x,y:impactOrigin.y},
        directionAngle:impactAngle,
        weightedCircleSet:true
      };
      const result=AttackHitTriggerService.damage({
        source,target,attack,execution,impact,
        amountOverride:executionBaseDamage*Math.max(0,Number(attack.damageRatio)||0)*sourceDamageMultiplier*multiplier
      });
      if(!result?.hit)continue;
      const deliveryModule={
        type:'delivery.area',shape:'circle',range:Math.max(0,Number(impactCircle?.r)||0),
        centerPoint:impactOrigin,wallPolicy:'ignore'
      };
      AttackExecutionService.setImpactOrigin(execution,{mode:'point',x:impactOrigin.x,y:impactOrigin.y});
      AttackExecutionService.setKoOrigin(execution,{mode:'point',x:impactOrigin.x,y:impactOrigin.y});
      AttackModuleService.onHit(source,target,attack,{execution},impactAngle,deliveryModule);
      if(result.authoritative!==false&&typeof statusStageForTarget==='function'&&statusConfig){
        StageStatusEffectService.apply(source,target,statusStageForTarget(target),statusConfig,now);
      }
      hitCount++;
    }
    return hitCount;
  }
});