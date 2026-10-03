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
test('58명 함수 없는 데이터·동결·Trigger·반격 및 공격 참조 검사',()=>{
 assert.equal(Object.keys(chars).length,58);
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
test('반 고갈 수리 완료·이펙트 1회·공통 설정 정상 재생 회복',()=>{
 const e=entity();e.character=chars.van;e.radius=20;const key=e.character.combatIdleProgressRepair.stateKey;e.actionState.set(key,{kind:'progress-state',stateKey:key,value:0,max:800});e._combatIdleRepairTickAt=new Map([[e.character.combatIdleProgressRepair.progressStateKey,1000]]);
 c.ProgressStateService.updateIdleRepair(e,6000);assert.equal(e.actionState.get(key).value,800);assert.equal(fx.length,1);c.ProgressStateService.updateIdleRepair(e,7000);assert.equal(fx.length,1);
 e.actionState.get(key).value=400;c.ProgressStateService.updateIdleRepair(e,8000);assert.equal(e.actionState.get(key).value,425);
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
 for(const [module,local,expected]of [[{type:'movement.move',speed:100,distance:100},true,1],[{type:'movement.move',speed:100,distance:100,tags:['이동기']},true,1],[{type:'movement.move',speed:100,distance:100},false,0],[{type:'movement.move',speed:100,distance:100,motionMode:'knockback'},true,0],[{type:'movement.move',speed:100,distance:100,presentation:false},true,0]]){
  const e=entity();e.x=0;e.y=0;e.local=local;const before=lines.length;assert.equal(service.start(e,module),true);assert.equal(lines.length-before,expected);
 }
});
test('전역 장판 주기는 대상이 없어도 정상 진행',()=>{
 load('src/core/InstalledAreaFieldService.js','InstalledAreaFieldService');const service={...c.InstalledAreaFieldService,refreshEndpoints(){},enforceContainment(){},collisionArea:()=>({module:{shape:'rect'}}),triggerReady:()=>true};
 const state={endsAt:3000,module:{intervalMode:'global',interval:100},insideTargets:new Map(),nextInsideTargets:new Map()};assert.equal(service.updateState(entity(),state,1000),true);assert.equal(state.nextGlobalTriggerAt,1100);
});
console.log(`PASS ${passed} structure/regression groups / ${Object.keys(chars).length} characters`);
