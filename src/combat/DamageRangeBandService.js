

/* 조건부 피해 구간 판정: 피해 계산과 on-hit 조건이 동일 geometry 규칙을 공유한다. */
const DamageRangeBandService=Object.freeze({
  matches(source,target,attack,impact,module){
    if(!source||!target||!attack||!module)return false;

    const thresholdRatio=Math.max(
      0,
      Math.min(1,Number(module.thresholdRatio)||0)
    );
    const threshold=Math.max(0,Number(attack.range)||0)*thresholdRatio;
    const point=NetworkCollisionPositionService.point(target);
    const dx=(Number(point.x)||0)-(Number(source.x)||0);
    const dy=(Number(point.y)||0)-(Number(source.y)||0);

    if(module.mode==='forward'){
      const direction=Number(impact?.directionAngle)||0;
      const forward=dx*Math.cos(direction)+dy*Math.sin(direction);
      return forward>=threshold;
    }

    if(module.mode==='radial'){
      const targetRadius=module.includeTargetRadius===true
        ?Math.max(0,Number(target.radius)||0)
        :0;
      return Math.hypot(dx,dy)+targetRadius>threshold;
    }

    if(module.mode==='attack-end-radius'){
      const direction=Number(impact?.directionAngle)||0;
      const fieldStateKey=String(module.fieldStateKey||'');
      const fieldModule=(attack.modules||[]).find(candidate=>
        AttackModuleService.type(candidate)==='field.area'&&
        (!fieldStateKey||String(candidate.stateKey||'')===fieldStateKey)
      )||null;
      const radius=Math.max(
        0,
        Number(module.radius)||Number(fieldModule?.range)||0
      );
      if(radius<=0)return false;

      const anchorModule=fieldModule||module;
      const center=AttackEndAnchorService.point(
        source,
        attack,
        anchorModule,
        direction
      );
      const targetRadius=module.includeTargetRadius===true
        ?Math.max(0,Number(target.radius)||0)
        :0;
      return AreaAttackService.containsPoint(
        {
          type:'delivery.area',
          shape:'circle',
          range:radius,
          wallPolicy:String(fieldModule?.wallPolicy||'ignore')
        },
        center,
        Number(point.x)||0,
        Number(point.y)||0,
        targetRadius,
        0
      );
    }

    return false;
  }
});