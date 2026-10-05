/* 실제 데이터/서비스를 로드하는 구조 검사 및 회귀 검사. 브라우저/E2E 검사를 대체하지 않는다. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');let passed=0;
const c=vm.createContext({console,Map,Set,WeakMap,WeakSet,Math,performance:{now:()=>1000},EMPTY_RUNTIME_ITEMS:[],EMPTY_AUGMENT_EFFECTS:[],attackTagMetadataCache:new WeakMap(),attackTagCache:new WeakMap()});
function load(file,name){vm.runInContext(fs.readFileSync(path.join(root,file),'utf8')+`;globalThis.${name}=${name};`,c)}
function test(name,fn){fn();passed++;console.log('PASS '+name)}
for(const name of ['characterValue','characterCount','characterSum','characterProduct','freezeCharacterData','CHARACTER_RULES','STATUS_EFFECT_RULES'])load('src/data/'+name+'.js',name);
const index=JSON.parse(fs.readFileSync(path.join(root,'src/data/characters/index.json'),'utf8'));c.CHARACTER_DATA={};
for(const entry of index.characters){const source=fs.readFileSync(path.join(root,entry.path),'utf8');const raw=vm.runInContext('('+source+')',c);c.CHARACTER_DATA[raw.id]=raw;}
load('src/data/CharacterDataService.js','CharacterDataService');const chars=c.CharacterDataService.compileAll();
for(const name of ['COMBAT_STATUS_DEFS','COMBAT_BUFF_DEFS','TagService','BuffService','AugmentService','ProgressStateService','SimulationScheduleService'])load('src/core/'+name+'.js',name);
load('src/combat/ModifierLimitService.js','ModifierLimitService');
load('src/abilities/MovementAbilityService.js','MovementAbilityService');load('src/combat/CounterModuleService.js','CounterModuleService');
c.GAME_DATA={characters:chars,ranges:c.CHARACTER_RULES.ranges,frameMs:1000/60,counter:{window:3000}};
load('src/data/AUGMENTS.js','AUGMENTS');
c.AbilityService={attackById:(ch,id)=>Object.values(ch.attacks||{}).find(a=>a.id===id)};
function walk(v,fn){assert.notEqual(typeof v,'function');if(!v||typeof v!=='object')return;fn(v);for(const x of Object.values(v))walk(x,fn)}
test('59명 함수 없는 데이터·동결·Trigger·반격 및 공격 참조 검사',()=>{
 assert.equal(Object.keys(chars).length,59);
 for(const ch of Object.values(chars)){
  assert.ok(Object.isFrozen(ch));const attacks=Object.values(ch.attacks||{});const ids=new Set(attacks.map(a=>a.id));assert.equal(ids.size,attacks.length,ch.name);
  walk(ch,m=>{if(m.type==='counter.execute'){assert.ok(c.CounterModuleService.validate(m),ch.name);assert.equal(m.allowNoCc,undefined);if(m.ccRefAttackId)assert.ok(c.CounterModuleService.referencedCc({character:ch},m),ch.name)}if(m.type==='attack.execute')assert.ok(ids.has(m.attackId),ch.name+':'+m.attackId)});
  for(const a of Object.values(ch.abilities||{}))assert.equal(a.trigger?.type,'trigger',ch.name);
 }
});
test('모든 AttackSpec 파생 태그 수동 기재 없음 / 디라 의미 태그와 파생 결과',()=>{
 for(const ch of Object.values(chars))for(const a of Object.values(ch.attacks||{}))for(const t of a.tags||[])assert.equal(c.TagService.isDerivedTag(t),false,ch.name+':'+t);
 const ch=chars.dira;for(const a of Object.values(ch.attacks)){const effective=c.TagService.attackTags(a);assert.ok(effective.size>0,a.id)}
});
test('체리티 기존 공격의 무력화 넉백 참조 / 검증 우회 거부',()=>{
 const module=chars.cherity.abilities.counter.trigger.modules.find(m=>m.type==='counter.execute');const cc=c.CounterModuleService.referencedCc({character:chars.cherity},module);assert.equal(cc.type,'movement.neutralize-knockback');assert.equal(c.CounterModuleService.validate({windup:300,allowNoCc:true}),false);
});
const items=new Map();c.EntityService={items,owner:e=>e?.owner||e};c.AugmentDataService={get:id=>c.AUGMENTS.find(a=>a.id===id)};c.AugmentEffectModuleService={runTrigger(){}};c.ResourceValueService={round:v=>Math.round(v)};
function entity(){return{alive:true,augments:[],augmentState:{augmentAcquiredAt:new Map(),persistent:new Map()},buffs:new Map(),baseMaxHealth:1000,maxHealth:1000,health:500,baseMaxStamina:1000,maxStamina:1000,stamina:500,actionState:new Map()}}
test('충전 반격 1·2중첩·제거 최대 스테미나 및 소환수 상속 / 자원 비율 유지',()=>{
 const p=entity(),s=entity();s.owner=p;items.set('p',p);items.set('s',s);
 for(const [count,max]of [[1,800],[2,600],[0,1000]]){p.augments=Array(count).fill('charged_counter');c.AugmentService.rebuild(p);for(const e of [p,s]){assert.equal(e.maxStamina,max);assert.equal(e.stamina,max/2)}}items.clear();
 const a=c.AugmentDataService.get('charged_counter');assert.ok(a.desc.includes('활성 시간 초기화'));assert.ok(!a.desc.includes('최대 소지량'));assert.equal(a.effects.find(e=>e.type==='counter.stock').capacityBonusPerStack,1);
});
test('회복 비율 감소 하한은 -100%',()=>{const e=entity();c.BuffService.set(e,'regenPercent',-2,'test');assert.equal(c.BuffService.resolve(e,'regenPercent'),-1)});
c.EntitySimulationAuthorityService={isLocal:e=>e.local!==false};const fx=[];c.EffectSpawnService={spawn:e=>{fx.push(e);return e},presentationSnapshot:e=>e};c.OnlinePresentationSyncService={send(){}};
test('반 파괴 후 시간 복구 없음·5회 적중 복구·초당25 재생',()=>{
 const e=entity();e.character=chars.van;e.radius=20;const key=e.character.combatIdleProgressRepair.stateKey,repair=e.character.combatIdleProgressRepair.progressStateKey;
 e.actionState.set(key,{kind:'progress-state',stateKey:key,value:0,max:800});
 c.ProgressStateService.updateIdleRepair(e,6000);c.ProgressStateService.updateIdleRepair(e,60000);
 assert.equal(e.actionState.get(key).value,0);assert.equal(e.actionState.get(repair).value,0);assert.equal(fx.length,0);
 for(let hit=1;hit<=5;hit++){
  c.ProgressStateService.apply(e,{stateKey:repair,max:5,amount:1});
  c.ProgressStateService.updateIdleRepair(e,60000+hit);
  assert.equal(e.actionState.get(key).value,hit<5?0:800);
 }
 assert.equal(fx.length,1);assert.equal(e.actionState.get(repair).value,0);
 c.ProgressStateService.updateIdleRepair(e,61000);assert.equal(fx.length,1);
 e.actionState.get(key).value=400;c.ProgressStateService.updateIdleRepair(e,62000);assert.equal(e.actionState.get(key).value,425);
 e.actionState.get(key).value=0;c.ProgressStateService.updateIdleRepair(e,100000);assert.equal(e.actionState.get(key).value,0);assert.equal(e.actionState.get(repair).value,0);
});
test('반 실제 적중 Trigger·DOT/소환수 제외·4회 유지·5회 복구·재파괴 초기화',()=>{
 const h=vm.createContext({performance:{now:()=>1000},ProgressStateService:c.ProgressStateService,EntitySimulationAuthorityService:{isLocal:()=>true},CCService:{isDotImpact:i=>i?.dot===true},RuntimeValueReferenceService:{resolve:(e,r)=>e.actionState.get(r.stateKey)?.value??r.initial??0}});
 for(const [file,name]of [['src/core/TriggerConditionService.js','TriggerConditionService'],['src/core/TriggerModuleService.js','TriggerModuleService'],['src/combat/ProgressHitTargetPolicy.js','ProgressHitTargetPolicy'],['src/render/CharacterTriggerEffectService.js','CharacterTriggerEffectService']])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8')+`;globalThis.${name}=${name};`,h);
 const e=entity();e.character=chars.van;const key=chars.van.wrenchDurability.stateKey,repair=chars.van.wrenchDurability.repairProgressStateKey;
 e.actionState.set(key,{kind:'progress-state',stateKey:key,max:800,value:800});
 const hit=(target={kind:'player'},impact={})=>h.CharacterTriggerEffectService.run(e,'damage-dealt',{source:e,target,impact,amount:100});
 hit();assert.equal(e.actionState.has(repair),false);e.actionState.get(key).value=0;
 hit({kind:'summon'});hit({kind:'player'},{dot:true});assert.equal(e.actionState.has(repair),false);
 for(let i=1;i<=4;i++){hit();c.ProgressStateService.updateIdleRepair(e,1000+i);assert.equal(e.actionState.get(key).value,0);assert.equal(e.actionState.get(repair).value,i)}
 c.ProgressStateService.updateIdleRepair(e,90000);assert.equal(e.actionState.get(repair).value,4);
 hit();c.ProgressStateService.updateIdleRepair(e,90001);assert.equal(e.actionState.get(key).value,800);assert.equal(e.actionState.get(repair).value,0);
 e.actionState.get(key).value=0;hit();c.ProgressStateService.updateIdleRepair(e,91000);assert.equal(e.actionState.get(repair).value,1);assert.equal(e.actionState.get(key).value,0);
});
test('반 내구도 피해는 적중 효과 차단 없음 / 완전흡수·파괴·초과피해',()=>{
 load('src/combat/DamageResourceLayerService.js','DamageResourceLayerService');
 const e=entity();e.character=chars.van;e.radius=20;
 const key=chars.van.wrenchDurability.stateKey;
 e.actionState.set(key,{kind:'progress-state',stateKey:key,max:800,value:800});
 assert.equal(chars.van.damageResourceLayers[0].blockHitEffectsWhenFullyAbsorbed,false);
 for(const impact of [{type:'projectile'},{type:'melee'},{type:'field-area'}]){
  e.actionState.get(key).value=800;
  const r=c.DamageResourceLayerService.absorb(e,100,{impact,now:1000});
  assert.equal(r.absorbed,100);assert.equal(r.remaining,0);assert.equal(r.blockHitEffects,false);assert.equal(e.actionState.get(key).value,700);
 }
 e.actionState.get(key).value=100;
 const r=c.DamageResourceLayerService.absorb(e,150,{impact:{type:'projectile'},now:1000});
 assert.equal(r.absorbed,100);assert.equal(r.remaining,50);assert.equal(r.blockHitEffects,false);assert.equal(e.actionState.get(key).value,0);
});
test('캐릭터 Trigger 회복은 이벤트 시각 전달',()=>{
 c.TriggerModuleService={matches:()=>true};let received;c.ResourceRestoreEffectService={apply:x=>{received=x;return 10}};load('src/render/CharacterTriggerEffectService.js','CharacterTriggerEffectService');
 const e=entity();e.character={triggers:[{type:'trigger',event:'damage-dealt',modules:[{type:'resource.restore',resource:'health'}]}]};c.CharacterTriggerEffectService.run(e,'damage-dealt',{now:1234});assert.equal(received.now,1234);
});
test('지연 반격 후속 공격: 게임 시간 도달 시 1회 / 사망·예약 제거 취소',()=>{
 let hits=0;const service={...c.CounterModuleService,executeFollowUp:()=>hits++};const e=entity();service.scheduleFollowUps(e,[{delay:333}],0);c.SimulationScheduleService.update(1332);assert.equal(hits,0);c.SimulationScheduleService.update(1333);assert.equal(hits,1);service.scheduleFollowUps(e,[{delay:333}],0);e.alive=false;c.SimulationScheduleService.update(2000);assert.equal(hits,1);e.alive=true;service.scheduleFollowUps(e,[{delay:333}],0);c.SimulationScheduleService.clear();c.SimulationScheduleService.update(2000);assert.equal(hits,1);
});
test('회피 보상은 종료 이벤트 단일 경로 / 중복 종료·취소',()=>{
 load('src/combat/FieldDodgeRewardService.js','FieldDodgeRewardService');const e=entity(),owner=entity();owner.id='owner';e.id='dodger';let rewards=0;const service={...c.FieldDodgeRewardService,pending:new Map(),candidates:()=>[{source:owner,reward:{}}],apply:()=>{rewards++;return true}};
 service.begin(e);assert.equal(rewards,0);service.finish(e);service.finish(e);assert.equal(rewards,1);service.begin(e);service.clear(e);service.finish(e);assert.equal(rewards,1);
});
test('이동기 파생 태그와 흔적 단일 생성 / 원격·자가 반동·명시 숨김 제외',()=>{
 const lines=[];c.Training={sessionMode:'online'};c.CollisionPolicyService={normalize:x=>x,entityTravelDistance:(e,a,d)=>d};c.MovementPresentationService={pushLine:(...args)=>lines.push(args)};
 const service={...c.MovementAbilityService,applyBuffs(){},spawnEffects:()=>[],broadcastEffects(){}};
 for(const [module,local,expected]of [[{type:'movement.move',speed:100,distance:100},true,1],[{type:'movement.move',speed:100,distance:100,tags:['이동기']},true,1],[{type:'movement.move',speed:100,distance:100},false,0],[{type:'movement.move',speed:100,distance:100,motionMode:'knockback'},true,0],[{type:'movement.move',speed:100,distance:100,presentation:false},true,0],[c.CharacterDataService.compile('hatsuhats').abilities.rmb.releaseTrigger.modules.find(m=>m.type==='movement.move'),true,0]]){
  const e=entity();e.x=0;e.y=0;e.local=local;const before=lines.length;assert.equal(service.start(e,module,0,module.pathSource==='drag-path'?{pathPoints:[{x:50,y:0},{x:100,y:0}]}:{}),true);assert.equal(lines.length-before,expected);
 }
});
test('전역 장판 주기는 대상이 없어도 정상 진행',()=>{
 load('src/core/InstalledAreaFieldService.js','InstalledAreaFieldService');const service={...c.InstalledAreaFieldService,refreshEndpoints(){},enforceContainment(){},collisionArea:()=>({module:{shape:'rect'}}),triggerReady:()=>true};
 const state={endsAt:3000,module:{intervalMode:'global',interval:100},insideTargets:new Map(),nextInsideTargets:new Map()};assert.equal(service.updateState(entity(),state,1000),true);assert.equal(state.nextGlobalTriggerAt,1100);
});
test('레테 평타 유도: 자원 없는 아군/적 소환수 제외·현재 스테미나0 유지',()=>{
 load('src/projectiles/ProjectileHomingTargetVisibilityService.js','ProjectileHomingTargetVisibilityService');
 c.RelationService={relation:(source,target)=>target.relation};
 load('src/combat/AttackModuleService.js','AttackModuleService');
 const homing=c.AttackModuleService.projectile(chars.lete.attacks.lmb).homing;
 assert.equal(homing.requiresResource,'stamina');
 const projectile={source:{x:0,y:0},homing};
 for(const relation of ['ally','enemy']){
  for(const maxStamina of [undefined,0])assert.equal(c.ProjectileHomingTargetVisibilityService.valid(projectile,{alive:true,relation,maxStamina},1000),false);
  assert.equal(c.ProjectileHomingTargetVisibilityService.valid(projectile,{alive:true,relation,maxStamina:3000,stamina:0},1000),true);
  assert.equal(c.ProjectileHomingTargetVisibilityService.valid({...projectile,homing:{targetRelations:['ally','enemy']}},{alive:true,relation,maxStamina:0},1000),true);
 }
 const target={alive:true,relation:'enemy',maxStamina:100};
 assert.equal(c.ProjectileHomingTargetVisibilityService.valid(projectile,target,1000),true);
 target.maxStamina=0;assert.equal(c.ProjectileHomingTargetVisibilityService.valid(projectile,target,1000),false);
 assert.equal(chars.lete.attacks.mailboxMail.modules[0].homing.requiresResource,undefined);
});


load('src/projectiles/ProjectileVisualPositionService.js','ProjectileVisualPositionService');
load('src/projectiles/TargetPointProjectileService.js','TargetPointProjectileService');
load('src/projectiles/StationaryProjectileInteractionService.js','StationaryProjectileInteractionService');
test('시아넬리 상대 착탄: 원격 자체 회수 금지·착탄 snapshot이 귀환 예측 복구',()=>{
 const ch=c.CharacterDataService.compile('xianelli');c.GAME_DATA={frameMs:1000/60};
 c.AttackModuleService={module:(a,type)=>a.modules.find(m=>m.type===type)};
 for(const key of ['lmb','counterDagger','shunpoDagger']){
  const e=entity();e.x=500;e.y=200;e.local=false;
  const p={source:e,attack:ch.attacks[key],x:500,y:200,networkKey:key,behavior:{returning:{phase:'returning'}},stationaryArrival:{sourcePickupRange:150}};
  assert.equal(c.TargetPointProjectileService.sourcePickupReady(p),false);
  e.local=true;assert.equal(c.TargetPointProjectileService.sourcePickupReady(p),true);e.local=false;
  c.ProjectileService={findByNetworkKey:()=>p};
  const restored=c.StationaryProjectileInteractionService.restoreNetworkProjectile(e,{networkKey:key,attackId:p.attack.id,x:600,y:300,duration:4000,remainingMs:3500,ageMs:500},1000);
  assert.equal(restored,p);assert.equal(p.behavior.returning.phase,'outbound');assert.equal(p.stationaryArrival.endsAt,4500);assert.equal(p.x,600);assert.equal(p.y,300);
 }
});
test('분할 전 원본 무선 이동11개·하츠하츠 표시 제외 유지',()=>{
 const entries=[["shubi", ".attacks.rmb.modules.2"], ["shubi", ".attacks.counter.modules.2"], ["ruvu", ".attacks.rmb.modules.1.autoArrivalMovement"], ["ruvu", ".abilities.rmb.trigger.modules.0.movement"], ["mainmad", ".attacks.rmb.modules.0"], ["lian", ".attacks.rmb.modules.0"], ["tau", ".attacks.rmb.modules.5"], ["tau", ".attacks.rmb.modules.7"], ["herjang", ".attacks.lmb.modules.1"], ["herjang", ".attacks.counter.modules.3"], ["levina", ".attacks.counter.modules.2"]];
 for(const [id,path]of entries){let module=chars[id];for(const key of path.split('.').filter(Boolean))module=module[key];assert.equal(module.presentation,false,id+path);}
 assert.equal(chars.hatsuhats.abilities.rmb.releaseTrigger.modules.find(m=>m.type==='movement.move').presentation,false);
});
test('엘린 홀드 게이지 명시 비용0 보존 / 소환750·모드150 분리',()=>{
 const chargeContext=vm.createContext({performance:{now:()=>1000},AbilityService:c.AbilityService,COMBAT_STATUS_DEFS:c.COMBAT_STATUS_DEFS});
 vm.runInContext(fs.readFileSync(path.join(root,'src/abilities/ChargedAttackService.js'),'utf8')+';globalThis.ChargedAttackService=ChargedAttackService;',chargeContext);
 const e=entity();e.character=chars.elin;e.cooldowns=new Map();
 const attack=e.character.attacks.rmb;assert.equal(attack.cost,750);
 assert.equal(e.character.abilities.rmb.holdTrigger.modules[0].amount,150);
 chargeContext.AugmentService={attackCostMultiplier:()=>1,update(){},captureResourceConditionSnapshot:()=>({})};
 chargeContext.AttackService={canUse:(source,spec)=>source.stamina>=spec.cost};
 const service={...chargeContext.ChargedAttackService,syncPreview:()=>true};
 for(const stamina of [0,149,150,200,749,750]){
  e.stamina=stamina;e.actionState.clear();
  assert.equal(service.start({source:e,attack,now:1000,angle:0},{stateKey:'hold'}),true,`stamina=${stamina}`);
  assert.equal(e.stamina,stamina);assert.equal(service.state(e,'hold').drained,0);
 }
 chargeContext.Training={player:e,aimAngle:()=>0,mouseWorld:()=>({x:0,y:0}),use:()=>false};
 chargeContext.CircleFormationService={handlesInput:()=>false,update(){}};
 chargeContext.EntitySimulationAuthorityService={isLocal:()=>false};
 vm.runInContext(fs.readFileSync(path.join(root,'src/input/PointerHoldInputService.js'),'utf8')+';globalThis.PointerHoldInputService=PointerHoldInputService;',chargeContext);
 const pointer={...chargeContext.PointerHoldInputService,holdAvailable:()=>true};
 chargeContext.AbilityService={...c.AbilityService,eventAttack:()=>attack};
 for(const stamina of [150,200,749]){
  e.stamina=stamina;e.actionState.clear();pointer.state.rmb.held=false;
  assert.equal(pointer.press('rmb'),true);assert.equal(pointer.state.rmb.held,true);
  assert.equal(e.stamina,stamina);assert.ok(service.state(e,'charge:elin-rmb-mode'));
 }
 e.stamina=749;e.actionState.clear();
 const omitted={...attack,charge:{duration:200}};
 assert.equal(service.start({source:e,attack:omitted,now:1000},{}),false);
 e.stamina=99;e.actionState.clear();
 assert.equal(service.start({source:e,attack:{...attack,charge:{duration:200,costMin:100}},now:1000},{}),false);
 e.stamina=100;e.actionState.clear();
 assert.equal(service.start({source:e,attack:{...attack,charge:{duration:200,costMin:100}},now:1000},{}),true);
});
load('src/projectiles/ProjectileService.js','ProjectileService');c.MatchModeService={DUEL:'duel'};load('src/network/OnlineDuelService.js','OnlineDuelService');
test('시아넬리 3종 원격 착탄:시계차±60초/보정20ms·실제 정지 update·표시 alpha·null좌표',()=>{
 const ch=c.CharacterDataService.compile('xianelli');c.Date={now:()=>100000};
 for(const key of ['lmb','counterDagger','shunpoDagger'])for(const skew of [-60000,60000]){
  const pid=key+skew;assert.equal(c.OnlineDuelService.networkDelayMs(pid,100000-skew),0);assert.equal(c.OnlineDuelService.networkDelayMs(pid,100000-skew-20),20);
  const e=entity();e.character=ch;e.local=false;e.x=500;e.y=200;
  const p={source:e,attack:ch.attacks[key],x:600,y:300,radius:15,hitRadius:15,travel:700,networkKey:key,behavior:{returning:{phase:'returning'}},stationaryArrival:{}};
  c.ProjectileService.items=[p];const snapshot={networkKey:key,attackId:p.attack.id,x:600,y:300,arrivalReason:'target',duration:4000,remainingMs:3500,ageMs:500,fixedX:null,fixedY:null,fixedTravel:null};
  assert.equal(c.StationaryProjectileInteractionService.applyNetworkSnapshots(e,[snapshot],100000-skew,1000,20),true);
  assert.equal(p.stationaryArrival.endsAt,4480);assert.equal(c.ProjectileService.items.length,1);
  assert.equal(c.ProjectileService.updateStationary(p,0,1000),true);assert.equal(p.x,600);assert.equal(p.y,300);assert.equal(p.travel,700);
  const visual=c.ProjectileVisualPositionService.sample(p);assert.equal(visual.x,600);assert.equal(visual.y,300);assert.ok(visual.alpha>.8);assert.equal(p.behavior.returning.phase,'outbound');
 }
 assert.ok(fs.readFileSync(path.join(root,'src/network/OnlineDuelService.js'),'utf8').includes('payload.stationaryProjectiles||[],\n        payload.sentAt,\n        performance.now(),\n        delayMs'));
});
console.log(`PASS ${passed} structure/regression groups / ${Object.keys(chars).length} characters`);
