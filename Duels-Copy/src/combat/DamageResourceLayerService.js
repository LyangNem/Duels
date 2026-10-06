

const DamageResourceLayerService=Object.freeze({
  configs(target){
    const list=target?.character?.damageResourceLayers;
    return Array.isArray(list)
      ?list.filter(item=>item&&typeof item==='object').slice().sort((a,b)=>(Number(b.priority)||0)-(Number(a.priority)||0))
      :[];
  },
  spawnTransitionEffect(target,effect,now){
    if(!target||!effect||!EntitySimulationAuthorityService.isLocal(target))return false;
    const radius=Math.max(
      Math.max(0,Number(effect.minRadius)||0),
      (Number(target.radius)||20)*Math.max(0,Number(effect.radiusMultiplier)||0)
    );
    const fx=EffectSpawnService.spawn({
      ...effect,
      type:String(effect.type||'areaCircle'),
      x:Number(target.x)||0,
      y:Number(target.y)||0,
      r:radius,
      range:radius,
      color:effect.color||target.character?.color||target.color||'#ffffff',
      start:now,
      dur:Math.max(1,Number(effect.duration)||320),
      sourceEntityId:target.id
    },{source:target});
    if(fx){
      OnlinePresentationSyncService?.send(
        'effect-spawn',target,
        {effect:EffectSpawnService.presentationSnapshot(fx,now)}
      );
    }
    return !!fx;
  },
  absorb(target,amount,{impact=null,now=performance.now()}={}){
    let remaining=Math.max(0,Number(amount)||0);
    let absorbed=0;
    let healthDamage=0;
    let blockHitEffects=false;
    const entries=[];
    for(const config of this.configs(target)){
      if(remaining<=0)break;
      if(String(config.type||'progress')!=='progress')continue;
      const stateKey=String(config.stateKey||'');
      if(!stateKey)continue;
      const maximum=Math.max(1,Number(config.max)||1);
      const state=ProgressStateService.ensure(target,{stateKey,max:maximum,initial:maximum});
      if(!state||(Number(state.value)||0)<=0)continue;
      const before=Math.max(0,Number(state.value)||0);
      const ratio=Math.max(0,Number(config.absorbRatio)||1);
      const resourceCostPerDamage=Math.max(.000001,Number(config.resourceCostPerDamage)||1);
      const maxDamageByResource=before/resourceCostPerDamage;
      const damageAbsorbed=Math.min(remaining,maxDamageByResource*ratio);
      const resourceSpent=Math.min(before,damageAbsorbed/Math.max(.000001,ratio)*resourceCostPerDamage);
      if(resourceSpent<=0)continue;
      ProgressStateService.apply(target,{stateKey,max:state.max,operation:'subtract',amount:resourceSpent});
      const after=Math.max(0,Number(ProgressStateService.state(target,stateKey)?.value)||0);
      remaining=Math.max(0,remaining-damageAbsorbed);
      absorbed+=damageAbsorbed;
      if(config.countsAsHealthDamage===true)healthDamage+=damageAbsorbed;
      entries.push({config,stateKey,before,after,damageAbsorbed,resourceSpent});
      if(before>0&&after<=0&&config.depletedEffect){
        this.spawnTransitionEffect(target,config.depletedEffect,now);
      }
      if(
        config.blockHitEffectsWhenFullyAbsorbed===true&&
        remaining<=0&&
        !(impact?.type==='field-area'&&config.allowFieldHitEffectsWhenFullyAbsorbed!==false)
      ){
        blockHitEffects=true;
      }
    }
    return {remaining,absorbed,healthDamage,blockHitEffects,entries};
  }
});