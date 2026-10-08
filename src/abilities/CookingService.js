

const CookingService=Object.freeze({
  KIND:'cooking-state',
  config(entity){const config=entity?.character?.cooking;return config&&typeof config==='object'?config:null;},
  state(entity,create=true){
    const config=this.config(entity);if(!entity||!config)return null;
    const characterId=String(entity.character?.id||'');let state=entity._cookingState||null;
    if(state&&String(state.characterId||'')!==characterId){state=null;entity._cookingState=null;}
    if(!state&&create){state={kind:this.KIND,characterId,ingredients:0,stoveInputs:0,mealCount:0,thrownMealCount:0,incomingMealCount:0};entity._cookingState=state;}
    return state;
  },
  capacity(entity){return Math.max(1,Math.floor(Number(this.config(entity)?.ingredientCapacity)||5));},
  stoveCapacity(entity){const config=this.config(entity);return Math.max(1,Math.floor(Number(config?.stoveCapacity)||Number(config?.ingredientCapacity)||5));},
  stoveFull(entity){const state=this.state(entity,true);return !!state&&Math.max(0,Math.floor(Number(state.stoveInputs)||0))>=this.stoveCapacity(entity);},
  mealProjectileRadius(entity,count){const c=this.config(entity)||{};return Math.max(18,(Number(c.mealProjectileBaseRadius)||18)+(Math.max(1,Math.floor(Number(count)||1))-1)*(Number(c.mealProjectileRadiusPerIngredient)||2));},
  mealWeaponStyle(entity,count){const radius=this.mealProjectileRadius(entity,count);return {kind:'weapon-projectile',type:'anchor-cross',radius,fillAlpha:.28,strokeColor:'#d58b4a',strokeAlpha:.95,strokeWidth:3,innerColor:'#fff0cf',innerStrokeWidth:2.5,crossHalfLength:radius*.5};},
  syncReady(entity){
    const config=this.config(entity);const state=this.state(entity,false);if(!config||!state||!entity?.actionState)return false;
    const ingredientKey=String(config.ingredientReadyStateKey||'cooking:ingredient-ready');
    const mealKey=String(config.mealReadyStateKey||'cooking:meal-ready');
    if(state.ingredients>0)entity.actionState.set(ingredientKey,{kind:'cooking-ingredient-ready',stateKey:ingredientKey,count:state.ingredients});else entity.actionState.delete(ingredientKey);
    if(state.mealCount>0)entity.actionState.set(mealKey,{kind:'cooking-meal-ready',stateKey:mealKey,count:state.mealCount});else entity.actionState.delete(mealKey);
    return true;
  },
  acquire(entity,count=1){const state=this.state(entity,true);if(!state)return 0;const before=Math.max(0,Math.floor(Number(state.ingredients)||0));state.ingredients=Math.min(this.capacity(entity),before+Math.max(0,Math.floor(Number(count)||0)));this.syncReady(entity);entity.combatSnapshotDirty=true;return state.ingredients-before;},
  consumeIngredient(entity,count=1){const state=this.state(entity,true);if(!state)return 0;const before=Math.max(0,Math.floor(Number(state.ingredients)||0));const used=Math.min(before,Math.max(0,Math.floor(Number(count)||0)));state.ingredients=before-used;this.syncReady(entity);entity.combatSnapshotDirty=true;return used;},
  addStoveInput(entity,count=1){const state=this.state(entity,true);if(!state||this.stoveFull(entity))return 0;const before=Math.max(0,Math.floor(Number(state.stoveInputs)||0));state.stoveInputs=Math.min(this.stoveCapacity(entity),before+Math.max(0,Math.floor(Number(count)||0)));entity.combatSnapshotDirty=true;return state.stoveInputs-before;},
  spawnMealProjectile(entity,{x,y,count,mode='incoming',duration=0}={}){
    if(!entity||!(count>0))return null;
    const radius=this.mealProjectileRadius(entity,count);const style=this.mealWeaponStyle(entity,count);const now=performance.now();
    const attack={id:`attack.dira.meal-${mode}-visual`,range:99999,damageRatio:0,effectsOnly:true,presentation:{color:String(this.config(entity)?.mealColor||entity.color||'#ffe2ad')},modules:[]};
    const projectile=ProjectileService.spawn({
      source:entity,attack,volley:null,x:Number(x)||0,y:Number(y)||0,origin:{x:Number(x)||0,y:Number(y)||0},angle:0,
      networkKey:`dira-meal-${mode}:${String(entity.id||'source')}:${Math.floor(now)}:${Math.random().toString(36).slice(2,7)}`,
      projectile:{speed:0,radius,hitRadius:radius,damageOnTravel:false,collisionTargets:false,expireAtRange:false},
      behavior:{returning:null,pierce:{targets:true,walls:true},collisionPolicy:CollisionPolicyService.normalize({passWalls:true,passEnemies:true}),collision:{wall:'ignore',shape:'circle',radiusScale:1},presentation:style}
    });
    if(!projectile)return null;
    projectile.persistent=true;projectile.cookingMealMeta={mode,count:Math.max(1,Math.floor(Number(count)||1)),ownerId:String(entity.id||''),createdAt:now};
    if(mode==='incoming'){
      projectile.scriptedMotion={
        mode:'seek-entity',
        targetEntityId:String(entity.id||''),
        speed:Math.max(.1,Number(this.config(entity)?.mealReturnSpeed)||24)
      };
    }
    return projectile;
  },
  allyAtPoint(entity,point){
    if(!entity||!point)return null;
    const radius=Math.max(1,Number(this.config(entity)?.mealTargetSelectionRadius)||90);
    let best=null,bestDistance=Infinity;
    for(const target of EntityService.items.values()){
      if(!target?.alive||String(target.kind||'')!=='player')continue;
      const relation=RelationService.relation(entity,target);
      if(relation!=='self'&&relation!=='ally')continue;
      const distance=Math.hypot((Number(target.x)||0)-Number(point.x),(Number(target.y)||0)-Number(point.y));
      if(distance<=radius&&distance<bestDistance){best=target;bestDistance=distance;}
    }
    return best;
  },
  drawMealTargetRanges(ctx,entity){
    if(!ctx||!entity?.alive||!EntitySimulationAuthorityService.isLocal(entity))return false;
    const state=this.state(entity,false);
    if(!state||Math.max(0,Math.floor(Number(state.mealCount)||0))<=0)return false;
    const radius=Math.max(1,Number(this.config(entity)?.mealTargetSelectionRadius)||90);
    let drawn=false;
    for(const target of EntityService.items.values()){
      if(!target?.alive||target.hidden||String(target.kind||'')!=='player')continue;
      const relation=RelationService.relation(entity,target);
      if(relation!=='self'&&relation!=='ally')continue;
      ctx.save();
      ctx.beginPath();
      ctx.arc(Number(target.x)||0,Number(target.y)||0,radius,0,Math.PI*2);
      ctx.strokeStyle=`rgba(${ColorService.rgbString(entity.color,'243,179,111')},.55)`;
      ctx.lineWidth=1.8;
      ctx.setLineDash([7,6]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
      drawn=true;
    }
    return drawn;
  },
  launchIngredient(entity,execution=null){
    if(!entity||!execution)return false;
    const state=this.state(entity,false);
    if(!state||Math.max(0,Math.floor(Number(state.ingredients)||0))<=0)return false;
    const baseAttack=entity.character?.attacks?.ingredient||null;
    if(!baseAttack)return false;
    const attack=AugmentService.prepareAttack(
      entity,
      ProgressScaledAttackService.resolve(entity,baseAttack),
      performance.now()
    );
    return TriggeredAttackService.execute(
      entity,
      attack,
      Number(execution.directionAngle)||0,
      {
        networkReplay:execution.networkReplay===true,
        executionSequence:Math.max(0,Math.floor(Number(execution.sequence)||0)),
        broadcast:false,
        abilityUseId:execution.abilityUseId||null
      }
    );
  },
  finishStove(entity){
    const state=this.state(entity,true);if(!state)return 0;
    const cooked=Math.max(0,Math.floor(Number(state.stoveInputs)||0));if(cooked<=0)return 0;
    const stove=SummonDeployService.entity(entity,String(this.config(entity)?.stoveStateKey||'dira-stove'));
    const deploy=SummonDeployService.state(entity,String(this.config(entity)?.stoveStateKey||'dira-stove'),false);
    const x=Number(stove?.x??deploy?.x??entity.x)||0,y=Number(stove?.y??deploy?.y??entity.y)||0;
    state.stoveInputs=0;state.incomingMealCount=Math.min(this.stoveCapacity(entity),Math.max(0,Math.floor(Number(state.incomingMealCount)||0))+cooked);
    this.spawnMealProjectile(entity,{x,y,count:cooked,mode:'incoming'});this.syncReady(entity);entity.combatSnapshotDirty=true;return cooked;
  },
  isOwnStove(source,target){const config=this.config(source);return !!(config&&target?.kind==='summon'&&String(target.ownerId||'')===String(source?.id||'')&&String(target.summonStateKey||'')===String(config.stoveStateKey||''));},
  applyThrownMeal(entity,target,countOverride=0){
    if(!entity||!target)return false;
    if(Training.sessionMode==='online'&&!EntitySimulationAuthorityService.isLocal(target))return false;
    const state=this.state(entity,true);
    const explicitCount=Math.max(0,Math.floor(Number(countOverride)||0));
    const count=explicitCount>0?explicitCount:Math.max(0,Math.floor(Number(state?.thrownMealCount)||0));
    if(count<=0)return false;
    const config=this.config(entity)||{};
    const healthRatio=Math.max(0,Number(config.mealHealthRatioPerIngredient)||0)*count;
    const staminaRatio=Math.max(0,Number(config.mealStaminaRatioPerIngredient)||0)*count;
    if(healthRatio>0)ResourceRestoreEffectService.apply({source:entity,target,module:{type:'resource.restore',resource:'health',recipient:'target',maxResourceRatio:healthRatio,applyHealingModifier:false}});
    if(staminaRatio>0)ResourceRestoreEffectService.apply({source:entity,target,module:{type:'resource.restore',resource:'stamina',recipient:'target',maxResourceRatio:staminaRatio}});
    const effect=EffectSpawnService.spawn({
      type:'areaCircle',renderType:'areaCircle',x:Number(target.x)||0,y:Number(target.y)||0,
      range:72,r:72,color:String(entity.color||'#d58b4a'),fillAlpha:.02,strokeAlpha:.44,lineWidth:1.5,duration:220,renderLayer:'below-entities'
    },{source:entity,target});
    if(effect&&OnlinePresentationSyncService?.shouldSend?.(entity)){
      OnlinePresentationSyncService.send('effect-spawn',entity,{effect:EffectSpawnService.presentationSnapshot(effect,performance.now())});
    }
    if(state&&Math.max(0,Math.floor(Number(state.thrownMealCount)||0))===count)state.thrownMealCount=0;
    entity.combatSnapshotDirty=true;
    return true;
  },
  commitMealThrow(entity,execution=null){
    const state=this.state(entity,true);if(!state)return false;
    const explicitCount=Math.max(0,Math.floor(Number(execution?.cookingMealCount)||0));
    const count=explicitCount>0?explicitCount:Math.max(0,Math.floor(Number(state.mealCount)||0));
    if(count<=0)return false;
    const local=EntitySimulationAuthorityService.isLocal(entity);
    if(local){state.thrownMealCount=count;state.mealCount=0;}
    const projectile=ProjectileService.items.slice().reverse().find(p=>p?.source===entity&&p?.volley?.execution===execution&&String(p?.attack?.id||'')==='attack.dira.meal');
    if(projectile){
      const radius=this.mealProjectileRadius(entity,count);
      projectile.radius=radius;projectile.hitRadius=radius;
      projectile.projectile={...(projectile.projectile||{}),radius,hitRadius:radius};
      projectile.renderStyle=this.mealWeaponStyle(entity,count);
      projectile.cookingMealMeta={mode:'thrown',count,ownerId:String(entity.id||'')};
      const targetId=String(execution?.targetEntityId||projectile.targetEntityId||'');
      if(targetId&&targetId===String(entity.id||'')){
        const now=performance.now();
        projectile.scriptedMotion={
          mode:'anchored-arc',
          targetEntityId:String(entity.id||''),
          startedAt:now,
          duration:520,
          height:96
        };
        projectile.collisionTargets=false;
        projectile.targetRelations=[];
        projectile.homing=null;
        projectile.targetEntityOnly=false;
        projectile.allowSourceTarget=false;
        projectile.vx=0;projectile.vy=0;projectile.baseSpeed=0;
        projectile.expireAtRange=false;projectile.persistent=true;
        projectile.x=Number(entity.x)||0;projectile.y=Number(entity.y)||0;
        projectile.prevX=projectile.x;projectile.prevY=projectile.y;
      }
    }
    if(local){this.syncReady(entity);entity.combatSnapshotDirty=true;}return true;
  },
  update(entity){if(!this.config(entity))return false;this.state(entity,true);return this.syncReady(entity);},
  serialize(entity){const state=this.state(entity,false);if(!state)return null;return {ingredients:Math.max(0,Math.floor(Number(state.ingredients)||0)),stoveInputs:Math.max(0,Math.floor(Number(state.stoveInputs)||0)),mealCount:Math.max(0,Math.floor(Number(state.mealCount)||0)),thrownMealCount:Math.max(0,Math.floor(Number(state.thrownMealCount)||0)),incomingMealCount:Math.max(0,Math.floor(Number(state.incomingMealCount)||0))};},
  applyRemote(entity,snapshot){if(!this.config(entity)||!snapshot||typeof snapshot!=='object')return false;const state=this.state(entity,true);const ingredientCap=this.capacity(entity);const stoveCap=this.stoveCapacity(entity);state.ingredients=Math.min(ingredientCap,Math.max(0,Math.floor(Number(snapshot.ingredients)||0)));state.stoveInputs=Math.min(stoveCap,Math.max(0,Math.floor(Number(snapshot.stoveInputs)||0)));state.mealCount=Math.min(stoveCap,Math.max(0,Math.floor(Number(snapshot.mealCount)||0)));state.thrownMealCount=Math.min(stoveCap,Math.max(0,Math.floor(Number(snapshot.thrownMealCount)||0)));state.incomingMealCount=Math.min(stoveCap,Math.max(0,Math.floor(Number(snapshot.incomingMealCount)||0)));this.syncReady(entity);return true;}
 });