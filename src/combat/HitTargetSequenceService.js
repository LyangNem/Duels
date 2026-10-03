

const HitTargetSequenceService=Object.freeze({
  nearestTarget(source,target,spec,angle,deliveryModule){
    if(!source||!target||!deliveryModule)return false;
    let nearest=null,nearestDistance=Infinity;
    const geometry=(deliveryModule.shape==='circle'||deliveryModule.shape==='sector'||deliveryModule.shape==='tapered-rect')
      ?AreaGeometryService.polygon(source,deliveryModule,angle):null;
    for(const candidate of EntityService.items.values()){
      if(!candidate?.alive||candidate.hidden||RelationService.relation(source,candidate)!=='enemy')continue;
      const point=NetworkCollisionPositionService.point(candidate);
      if(!AreaAttackService.containsPoint(deliveryModule,source,point.x,point.y,candidate.radius,angle,geometry))continue;
      const d=Math.hypot(point.x-source.x,point.y-source.y);
      if(d<nearestDistance){nearest=candidate;nearestDistance=d;}
    }
    return nearest===target;
  },
  runModule(source,target,spec,execution,angle,module){
    const type=AttackModuleService.type(module);
    if(type==='movement.pull'){
      const distance=module.distanceMode==='source-contact'
        ?Math.max(0,Math.hypot(target.x-source.x,target.y-source.y)-(Number(source.radius)||0)-(Number(target.radius)||0)-Math.max(0,Number(module.gap)||0))
        :Math.max(0,Number(module.distance)||0);
      MovementService.pull(target,source,distance,Math.max(.001,Number(module.speed)||10),{gap:Math.max(0,Number(module.gap)||0),duration:Math.max(0,Number(module.duration)||0)});
      return true;
    }
    if(type==='status.apply'){
      const now=performance.now();
      CombatStatusApplicationService.apply({
        source,
        target,
        type:String(module.status||''),
        duration:Math.max(0,Number(module.duration)||0),
        sourceId:String(module.sourceId||`${source.id}:hit-sequence:${module.status||'status'}`),
        data:{
          ...(module.data||{}),
          sourceEntityId:source.id,
          stackMode:module.stackMode||'replace-source',
          presentationAppliedAt:now
        }
      });
      return true;
    }
    if(type==='action.trigger-attack'){
      const base=AbilityService.attackById(source.character,String(module.attackId||''));
      if(!base)return false;
      const prepared=AugmentService.prepareAttack(
        source,
        ProgressScaledAttackService.resolve(source,base),
        performance.now()
      );
      return TriggeredAttackService.execute(
        source,
        prepared,
        angle,
        {
          targetEntityId:String(target.id||''),
          targetPoint:{x:Number(target.x)||0,y:Number(target.y)||0},
          broadcast:false
        }
      );
    }
    return false;
  },
  start(source,target,spec,execution,angle,module,deliveryModule){
    if(module.targetMode==='nearest'&&!this.nearestTarget(source,target,spec,angle,deliveryModule))return false;
    const key=`hit-sequence:${String(module.stateKey||spec.id||'attack')}`;
    if(module.oncePerExecution&&AttackExecutionService.hasEffect(execution,key))return false;
    if(module.oncePerExecution)AttackExecutionService.markEffect(execution,key);
    for(const step of module.steps||[]){
      const run=()=>{for(const nested of step.modules||[])this.runModule(source,target,spec,execution,angle,nested);};
      const delay=Math.max(0,Number(step.delay)||0);
      if(delay>0)SimulationScheduleService.scheduleContinuation({at:performance.now()+delay,source,abilityId:key,continue:run});
      else run();
    }
    return true;
  }
});