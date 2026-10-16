/* Generic permanent module invention from nearby enemies and combat observations. */
const IdeaModuleService=Object.freeze({
 allows(config,entity){return !!entity&&!config.excludedEntityKinds?.includes(String(entity.kind||''));},
 config(e){return e?.kind==='player'?e.character?.ideaModules:null;},
 state(e,now=performance.now()){
  const config=this.config(e);if(!config||!e.actionState)return null;
  let state=e.actionState.get('idea-module-observer');
  if(!state){state={kind:'idea-module-observer',lastAt:now,seen:new Set(),objects:new WeakSet()};e.actionState.set('idea-module-observer',state);}
  ProgressStateService.ensure(e,{stateKey:config.stateKey,max:config.threshold,initial:0,presentation:{type:'arc-gauge',color:e.color,lineWidth:3.5,maxChargeFlash:true}});
  return state;
 },
 enemies(e,range=this.config(e)?.range){
  const config=this.config(e);if(!config)return [];
  return [...EntityService.items.values()].filter(target=>target!==e&&target?.alive&&this.allows(config,target)&&RelationService.relation(e,target)==='enemy'&&ProjectileHomingTargetVisibilityService.canPerceive(e,target)&&Math.hypot(target.x-e.x,target.y-e.y)<=range);
 },
 facts(e){
  const config=this.config(e),targets=this.enemies(e,config.situationRange??config.range);
  return {close:targets.some(t=>Math.hypot(t.x-e.x,t.y-e.y)<=config.closeDistance),far:targets.some(t=>Math.hypot(t.x-e.x,t.y-e.y)>config.closeDistance),behindWall:targets.some(t=>ReactiveEquipmentService.behindWall(e,t))};
 },
 invent(e,now=performance.now()){
  const config=this.config(e);if(!config||!e.alive||!EntitySimulationAuthorityService.isLocal(e))return false;
  const progress=ProgressStateService.state(e,config.stateKey);
  if(config.items.every(item=>ModeStateService.current(e,item.stateKey,'inactive')==='active')){ProgressStateService.apply(e,{stateKey:config.stateKey,max:config.threshold,operation:'set',value:config.threshold});return false;}if(!progress||progress.value+1e-9<config.threshold)return false;
  const facts=this.facts(e),item=config.items.find(item=>ModeStateService.current(e,item.stateKey,'inactive')!=='active'&&facts[item.situation]);
  if(!item)return false;
  ProgressStateService.apply(e,{stateKey:config.stateKey,max:config.threshold,operation:'set',value:Math.max(0,progress.value-config.threshold)});
  return this.grant(e,item.value,now);
 },
 grant(e,value,now=performance.now()){
  const config=this.config(e),item=config?.items.find(item=>item.value===value);
  if(!item||ModeStateService.current(e,item.stateKey,'inactive')==='active')return false;
  ModeStateService.set(e,item.stateKey,'active','inactive');
  ProgressStateService.apply(e,{stateKey:config.countStateKey,max:config.items.length,operation:'add',amount:1});
  const state=ModeStateService.state(e,config.rotationStateKey,true,'initial');state.previousTurns=Number(state.turns)||0;state.turns=state.previousTurns+1;state.changedAt=now;ModeStateService.set(e,config.rotationStateKey,item.value,'initial');
  if(config.items.every(item=>ModeStateService.current(e,item.stateKey,'inactive')==='active')){this.state(e,now);ProgressStateService.apply(e,{stateKey:config.stateKey,max:config.threshold,operation:'set',value:config.threshold});}
  return true;
 },
 gain(e,amount,now=performance.now()){
  const config=this.config(e);if(!config||!e.alive||!EntitySimulationAuthorityService.isLocal(e)||!(Number(amount)>0))return false;
  this.state(e,now);ProgressStateService.apply(e,{stateKey:config.stateKey,max:config.threshold,operation:'add',amount:Math.max(0,Number(amount)||0)});this.invent(e,now);return true;
 },
 hit(event){
  const e=event?.source,config=this.config(e);if(!config||!this.allows(config,event.target)||!(event.amount>0)||event.duplicateExecutionHit||RelationService.relation(e,event.target)!=='enemy')return false;
  return this.gain(e,config.hitGain,event.now);
 },
 segmentDistance(e,a,b){const dx=b.x-a.x,dy=b.y-a.y,d=dx*dx+dy*dy,t=d>0?Math.max(0,Math.min(1,((e.x-a.x)*dx+(e.y-a.y)*dy)/d)):0;return Math.hypot(e.x-a.x-dx*t,e.y-a.y-dy*t);},
 observe(e,object,key,now){
  const state=this.state(e,now);if(key){if(state.seen.has(key))return false;state.seen.add(key);}else{if(state.objects.has(object))return false;state.objects.add(object);}
  return this.gain(e,this.config(e).attackGain,now);
 },
 attack(event){
  if(this.config(event?.source))this.invent(event.source,event.now);
  for(const e of EntityService.items.values()){
   const config=this.config(e);if(!config||!e.alive||!this.allows(config,event.source)||!EntitySimulationAuthorityService.isLocal(e)||RelationService.relation(e,event.source)!=='enemy')continue;
   for(const module of event.attack?.modules||[]){
    if(module.type!=='delivery.area')continue;
    const source=module.centerPoint||event.execution?.targetPoint||event.source;
    let near=false;
    if(module.shape==='rect'){
     const angle=event.angle||0,dx=e.x-source.x,dy=e.y-source.y,x=dx*Math.cos(angle)+dy*Math.sin(angle),y=-dx*Math.sin(angle)+dy*Math.cos(angle),range=Number(module.range)||event.attack.range||0;
     near=Math.hypot(x-Math.max(0,Math.min(range,x)),Math.max(0,Math.abs(y)-(Number(module.halfWidth)||0)))<=config.range;
    }else near=AreaGeometryService.overlaps(source,module,event.angle||0,e.x,e.y,config.range);
    if(near){this.observe(e,event.execution||event,`attack:${event.source.id}:${event.execution?.sequence??event.now}`,event.now);break;}
   }
  }
 },
 update(e,now=performance.now()){
  const config=this.config(e);if(!config||!e.alive||!EntitySimulationAuthorityService.isLocal(e))return;
  const state=this.state(e,now),dt=Math.max(0,Math.min(250,now-state.lastAt));state.lastAt=now;
  const count=this.enemies(e).length;
  if(count)this.gain(e,config.presencePerSecond*dt/1000*(config.presencePerEnemy===true?count:1),now);
  for(const p of ProjectileService.items||[]){
   if(!p.source||!this.allows(config,p.source)||RelationService.relation(e,p.source)!=='enemy')continue;
   const a={x:Number(p.prevX??p.x),y:Number(p.prevY??p.y)},b={x:Number(p.x),y:Number(p.y)};
   if(this.segmentDistance(e,a,b)<=config.range+(Number(p.radius)||0))this.observe(e,p,p.networkKey?`projectile:${p.networkKey}`:null,now);
  }
  const excluded=new Set(['pathCarrier','weaponImage','weaponImageEcho','weaponImagePulse','dodge','justdodge','parry','hitImpactRing','text','damage']);
  for(const f of Training.fx||[]){
   const source=EntityService.items.get(String(f.sourceEntityId||''));if(!source||!this.allows(config,source)||excluded.has(f.type)||RelationService.relation(e,source)!=='enemy'||now<Number(f.start)||now>Number(f.start)+Number(f.dur))continue;
   const a={x:Number(f.x)||0,y:Number(f.y)||0},b={x:Number(f.tx??f.x)||0,y:Number(f.ty??f.y)||0},radius=Math.max(0,Number(f.r)||Number(f.range)||0);
   if(this.segmentDistance(e,a,b)<=config.range+radius)this.observe(e,f,f.executionSequence?`attack:${source.id}:${f.executionSequence}`:f.abilityUseId?`ability:${source.id}:${f.abilityUseId}`:f.effectKey?`effect:${f.effectKey}`:null,now);
  }
  this.invent(e,now);
 }
});
