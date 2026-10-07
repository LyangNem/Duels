/* 조건 사건→우선순위 누적→발견→자동 장착. 캐릭터 ID와 무기 이름을 모른다. */
const ReactiveEquipmentService=Object.freeze({
 config(e){return e?.character?.reactiveEquipment||null},
 state(e){
  if(!this.config(e)||!e.actionState)return null;
  let s=e.actionState.get('reactive-equipment-observer');
  if(!s){s={kind:'equipment-observer',pending:new Map(),blocked:new Map(),approaches:new Map(),currentCondition:'',currentAt:0};e.actionState.set('reactive-equipment-observer',s)}
  return s;
 },
 signal(e,facts={},key='',now=performance.now()){
  const config=this.config(e);if(!config||!e.alive||!EntitySimulationAuthorityService.isLocal(e))return false;
  const observer=this.state(e);
  let selected=null;
  for(const item of config.items||[]){
   if(TriggerModuleService.matches(item.trigger,'equipment.situation',{source:e,facts,now},(condition,context)=>{
    if(condition.type==='situation.flag')return facts[condition.flag]===true;
   })){selected=item;break}
  }
  if(!selected)return false;
  const id=String(key||facts.sourceId||'situation');
  if(now>=observer.currentAt){observer.currentCondition=selected.value;observer.currentAt=now;}
  const previous=observer.pending.get(id);
  if(!previous||(config.items.indexOf(selected)<config.items.indexOf(previous.item)))observer.pending.set(id,{item:selected,now});
  return true;
 },
 select(e,value,now=performance.now()){
  const config=this.config(e);if(!config||!e.actionState||(value!==config.initial&&!config.items.some(item=>item.value===value)))return false;
  if(ModeStateService.current(e,config.stateKey,config.initial)===value)return false;
  const state=ModeStateService.state(e,config.stateKey,true,config.initial);
  state.previousValue=ModeStateService.current(e,config.stateKey,config.initial);
  state.previousTurns=Number(state.turns)||0;state.turns=state.previousTurns+1;state.changedAt=now;
  return ModeStateService.set(e,config.stateKey,value,config.initial);
 },
 discover(e,item,force=false,now=performance.now()){
  const config=this.config(e);if(!config||!item)return false;
  const state=ProgressStateService.ensure(e,{stateKey:item.stateKey,max:item.required,initial:0});
  if(state.value<item.required){ProgressStateService.apply(e,{stateKey:item.stateKey,max:item.required,operation:force?'set':'add',...(force?{value:item.required}:{amount:1})});state.lastActivityAt=now}
  state.lastActivityAt=now;
  if(state.value>=item.required)this.select(e,item.value,now);
  return true;
 },
 flush(e,now=performance.now()){
  const s=this.state(e);if(!s)return false;
  for(const entry of s.pending.values())this.discover(e,entry.item,false,entry.now);
  s.pending.clear();return true;
 },
 behindWall(e,a){
  if(WorldGeometryService.segmentBlocked(e.x,e.y,a.x,a.y,0))return true;
  for(const wall of DynamicWallService.all())if(WorldGeometryService.segmentIntersectsRect(e.x,e.y,a.x,a.y,wall,0))return true;
  return false;
 },
 justDodge(target,cause,now=performance.now()){
  const attack=cause?.attack||cause?.execution?.attack||null;
  const source=cause?.source||EntityService.items.get(cause?.execution?.sourceId)||null;
  let impact=cause?.impact||null;
  if(!impact?.type&&attack){
   const modules=attack.modules||[];
   const type=modules.some(m=>m.type==='delivery.projectile'||m.type==='delivery.range-projectile')?'projectile'
    :modules.some(m=>m.type==='delivery.area')?'area'
    :modules.some(m=>m.type==='effect.spawn'&&m.damage)?'effect-animation':null;
   if(type)impact={...impact,type};
  }
  const changed=this.damage({...cause,source,attack,impact,target,now,dodged:true,justDodged:true});
  if(changed)this.flush(target,now);
  return changed;
 },
 damage(event){
  const e=event?.target,a=event?.source,config=this.config(e);
  if(event?.impact?.type==='field-area'){
   if(config?.fieldTrigger!=='damage'||(!(event.amount>0)&&event.justDodged!==true)||!(Number(event.impact.fieldDuration)>0||event.impact.fieldPersistent===true)||!a||RelationService.relation(e,a)!=='enemy')return false;
   return this.signal(e,{field:true,sourceId:a.id},a.id,event.now);
  }
  if(!config||!a||RelationService.relation(e,a)!=='enemy'||(!(event.amount>0)&&event.dodged!==true))return false;
  const distance=Math.hypot(a.x-e.x,a.y-e.y);
  const baseline=AbilityService.attackById(e.character,config.farAttackId);
  const range=Number(baseline?.range)||config.longDistance;
  const tags=event.attack?TagService.attackTags(event.attack):null;
  const directDistance=(config.distanceImpactTypes||[]).includes(event.impact?.type)&&event.impact?.dot!==true&&
   !(config.distanceExcludedAttackTags||[]).some(tag=>tags?.has(tag));
  const restricted=event.dodged===true&&!!tags&&(config.restrictedAttackTags||[]).some(tag=>tags.has(tag));
  return this.signal(e,{restricted,sourceId:a.id,behindWall:directDistance&&this.behindWall(e,a),summon:a.kind==='summon',far:directDistance&&(config.farExclusive===true?distance>range:distance>=range),close:directDistance&&distance<=config.closeDistance},a.id,event.now);
 },
 field(e,source,state,now){
  if(this.config(e)?.fieldTrigger==='damage'||state?.rewardOnly===true||state?.module?.reactiveEquipmentEntry===false)return false;
  if(!(Number(state?.duration)>0||Number(state?.module?.duration)>0||Number(state?.endsAt)>now)||RelationService.relation(e,source)!=='enemy')return false;
  return this.signal(e,{field:true,sourceId:source?.id},source?.id,now);
 },
 restriction(e,type,sourceId,now){
  const config=this.config(e);if(!config||!config.restrictedStatuses.includes(type))return false;
  const source=EntityService.items.get(sourceId);
  if(source&&RelationService.relation(e,source)!=='enemy')return false;
  if(sourceId===e.id||String(sourceId).startsWith('system:'))return false;
  return this.signal(e,{restricted:true,sourceId:source?.id||sourceId},source?.id||sourceId,now);
 },
 blocked(e,sourceId,key,now=performance.now()){
  const state=this.state(e);if(!state)return false;
  const defender=EntityService.items.get(sourceId);
  if(defender&&RelationService.relation(e,defender)!=='enemy')return false;
  const id=String(key);if(state.blocked.has(id))return false;
  state.blocked.set(id,now);for(const [k,at] of state.blocked)if(now-at>5000)state.blocked.delete(k);
  return this.signal(e,{blocked:true,sourceId},`block:${key}`,now);
 },
 update(e,now=performance.now()){
  const config=this.config(e);if(!config||!e.alive||!EntitySimulationAuthorityService.isLocal(e))return;
  const observer=this.state(e);
  for(const other of EntityService.items.values()){
   if(!other?.alive||!config.approachTargetKinds.includes(other.kind)||RelationService.relation(e,other)!=='enemy')continue;
   const distance=Math.hypot(other.x-e.x,other.y-e.y);
   let track=observer.approaches.get(other.id);
   if(!track){
    const capacity=Math.max(2,Math.ceil(config.approachWindow/16)+2);
    track={samples:Array.from({length:capacity},()=>({at:0,distance:0,x:0,y:0})),head:0,count:0,lastAt:-Infinity,armed:true};
    observer.approaches.set(other.id,track);
   }
   const pulled=e.forcedMotion?.kind==='pull';
   const walkSpeed=Math.max(0,Number(other.speed)||Number(other.character?.speed)||0)*Math.max(0,CombatStatsService.current(other).speedMult)/GAME_DATA.frameMs;
   const requiredSpeed=walkSpeed*Math.max(1,Number(config.approachSpeedRatio)||1);
   if(track.armed&&distance<=config.approachNear){
    for(let i=0;i<track.count;i++){
     const sample=track.samples[(track.head-1-i+track.samples.length)%track.samples.length];
     if(now-sample.at>config.approachWindow)break;
     const enemyMove=Math.hypot(other.x-sample.x,other.y-sample.y);
     const elapsed=now-sample.at;
     const fastApproach=elapsed>0&&enemyMove/elapsed>requiredSpeed;
     if(sample.distance-distance>=config.approachDelta&&((enemyMove>=config.approachDelta*.75&&fastApproach)||pulled)){
      this.signal(e,{approach:true,sourceId:other.id},other.id,now);track.armed=false;break;
     }
    }
   }
   if(distance>config.approachNear+config.approachDelta)track.armed=true;
   // Reuse a bounded rolling history: a dodge spanning a fixed window boundary
   // must retain its pre-movement position; no allocation in the frame loop.
   if(now-track.lastAt>=16){
    const sample=track.samples[track.head];sample.at=now;sample.distance=distance;sample.x=other.x;sample.y=other.y;
    track.head=(track.head+1)%track.samples.length;track.count=Math.min(track.samples.length,track.count+1);track.lastAt=now;
   }
  }
  for(const [id] of observer.approaches)if(!EntityService.items.get(id)?.alive)observer.approaches.delete(id);
  this.flush(e,now);
 },
 resolveCurrent(e,module,now=performance.now()){
  if(!EntitySimulationAuthorityService.isLocal(e))return false;
  this.flush(e,now);const config=this.config(e),observer=this.state(e);if(!config||!observer)return false;
  const value=observer.currentCondition;
  const item=config.items.find(item=>item.value===value);
  if(item)return this.discover(e,item,true,now);
  return this.select(e,config.initial,now);
 }
});
