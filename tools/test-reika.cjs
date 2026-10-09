/* 실제 캐릭터와 공통 차징/전달/착탄/이동/장판 경로 회귀. 브라우저/WebRTC 대체 아님. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');let clock=1000,passed=0,shots=[],areas=[],fields=[],burns=[];
const c=vm.createContext({console,Map,Set,WeakMap,WeakSet,Math,performance:{now:()=>clock},EMPTY_RUNTIME_ITEMS:[],EMPTY_AUGMENT_EFFECTS:[]});
function load(p,n){vm.runInContext(fs.readFileSync(path.join(root,p),'utf8')+`;globalThis.${n}=${n};`,c)}
function test(n,fn){shots=[];areas=[];fields=[];burns=[];clock=1000;fn();passed++;console.log('PASS '+n)}
for(const n of ['characterValue','characterCount','characterSum','characterProduct','freezeCharacterData','CHARACTER_RULES'])load('src/data/'+n+'.js',n);
c.CHARACTER_DATA={};for(const item of JSON.parse(fs.readFileSync(path.join(root,'src/data/characters/index.json'))).characters){const raw=vm.runInContext('('+fs.readFileSync(path.join(root,item.path),'utf8')+')',c);c.CHARACTER_DATA[raw.id]=raw}
load('src/data/CharacterDataService.js','CharacterDataService');const ch=c.CharacterDataService.compile('reika');
c.GAME_DATA={frameMs:1000/60};c.Training={sessionMode:'training'};c.OnlineDuelService={active:false};
c.AbilityService={attackById:(character,id)=>Object.values(character.attacks).find(a=>a.id===id),damageRatio:(character,a)=>a?.damageRatio||0};
c.EntitySimulationAuthorityService={isLocal:e=>e.local!==false};c.EntityService={items:new Map(),owner:e=>e};
c.RelationService={relation:(s,t)=>s===t?'self':s.teamId===t.teamId?'ally':'enemy',canTarget:(s,t)=>s.teamId!==t.teamId};
c.AugmentService={update(){},captureResourceConditionSnapshot:()=>null,prepareAttack:(s,a)=>a,attackCostMultiplier:()=>1};c.ProgressScaledAttackService={resolve:(s,a)=>a};
c.TagService={derivedModuleTags:()=>[],attackTags:a=>new Set(a.tags||[])};c.AttackPreviewService={fromAttack:(s,a,angle,until)=>({attack:a,angle,until})};
c.StaminaService={nominalBudget:e=>e.stamina,spend:(e,n)=>{if(e.stamina<n)return false;e.stamina-=n;return true}};
c.AttackResourceConditionService={capture:()=>null};c.COMBAT_BUFF_DEFS={evasionInvulnerable:{}};c.COMBAT_STATUS_DEFS={burn:{},evasionInvulnerable:{}};
c.BuffService={set:()=>true,remove:()=>true};c.CCService={removeSource(){},isDotImpact:()=>false};
c.EffectSpawnService={removeKey(){},ease:v=>v,definitionSnapshot:x=>JSON.parse(JSON.stringify(x))};
let neutralizeCalls=[];c.NeutralizingKnockbackService={start:args=>{neutralizeCalls.push(args);return true;}};
c.MovementService={travelDistance:(x,y,a,d)=>d,resolveEmbedded(){},finalizeForcedMotion(){},knockback:()=>true};
c.OnlinePresentationSyncService={send(){}};c.WorldGeometryService={wallAtPoint:()=>null,nearestWallTarget:()=>null};
c.ProjectileStateService={get:()=>null};c.ProjectileService={spawn:data=>{shots.push(data);c.AttackModuleService.onDelivery(data.source,data.attack,data.angle,data.volley?.execution);return data}};
c.AreaAttackService={execute:(s,a,angle,m,v,options)=>{areas.push({s,a,angle,m,v,options});c.AttackModuleService.onDelivery(s,a,angle,v?.execution);return true}};
c.InstalledAreaFieldService={KIND:'installed-area-field',containmentTravelDistance:(e,a,d)=>d,baseKey:m=>m.stateKey,activatePoint:(s,m,p,o)=>{const v={s,m,p,o};fields.push(v);return v}};
for(const [p,n]of [['src/core/GameEvents.js','GameEvents'],['src/core/TriggerConditionService.js','TriggerConditionService'],['src/core/TriggerModuleService.js','TriggerModuleService'],['src/core/ArcTrajectoryService.js','ArcTrajectoryService'],['src/core/CollisionPolicyService.js','CollisionPolicyService'],['src/combat/AttackExecutionService.js','AttackExecutionService'],['src/combat/AttackModuleService.js','AttackModuleService'],['src/projectiles/ProjectileModuleService.js','ProjectileModuleService'],['src/projectiles/ProjectileImpactService.js','ProjectileImpactService'],['src/projectiles/TargetPointProjectileService.js','TargetPointProjectileService'],['src/combat/TriggeredAttackService.js','TriggeredAttackService'],['src/combat/CounterModuleService.js','CounterModuleService'],['src/abilities/MovementAbilityService.js','MovementAbilityService'],['src/abilities/ChargedAttackService.js','ChargedAttackService'],['src/ui/CharacterDescriptionService.js','CharacterDescriptionService']])load(p,n);
load('src/core/ModeStateService.js','ModeStateService');
c.CombatStatusApplicationService={apply:ctx=>{burns.push(ctx);return true}};
function entity(extra={}){return{id:'reika',teamId:'A',kind:'player',character:ch,baseDamage:ch.baseDamage,alive:true,local:true,x:400,y:500,radius:20,stamina:1000,actionState:new Map(),cooldowns:new Map(),statuses:new Map(),buffs:new Map(),...extra}}
function carrier(s,a=ch.attacks.counterArrow){return{source:s,attack:a,behavior:c.ProjectileModuleService.config(a),x:400,y:500,angle:Math.PI,radius:12,targetPoint:{x:400,y:500},networkKey:'arrow-'+clock,volley:{execution:c.AttackExecutionService.create(s,a,Math.PI)}}}
const originalMovement=c.MovementAbilityService;
c.MovementAbilityService={...originalMovement,applyBuffs(){},clearBuffs(){},spawnEffects:()=>[],broadcastEffects(){}};
c.AttackService={canUse:(e,a)=>e.stamina>=a.cost,execute:(s,a,angle)=>c.TriggeredAttackService.execute(s,a,angle)};

load('src/core/ProgressStateService.js','ProgressStateService');
load('src/combat/ProgressHitTargetPolicy.js','ProgressHitTargetPolicy');
load('src/core/PassiveProgressRateService.js','PassiveProgressRateService');
load('src/core/SimulationScheduleService.js','SimulationScheduleService');
load('src/render/CharacterTriggerEffectService.js','CharacterTriggerEffectService');
c.AugmentEffectModuleService={runTrigger(){}};
c.OnlinePresentationSyncService.shouldSend=()=>false;
load('src/core/ColorService.js','ColorService');load('src/render/AttackPresentationColorService.js','AttackPresentationColorService');
c.EffectSpawnService.shouldPresentAttack=()=>false;
load('src/core/RuntimeValueReferenceProviders.js','RuntimeValueReferenceProviders');load('src/core/RuntimeValueReferenceService.js','RuntimeValueReferenceService');
c.EffectSpawnService.presentationSnapshot=x=>x;
c.NetworkCollisionPositionService={point:e=>e};
c.WorldGeometryService.nearestOpenPoint=(x,y)=>({x,y});
c.AttackWindupService={isTaggedAttack:()=>false};
c.MovementPresentationService={pushLine(){}};
c.EntityService.forEachEnemy=(source,fn)=>{for(const target of c.EntityService.items.values())if(target.alive&&target.teamId!==source.teamId)fn(target)};
function gauge(e,value){c.ProgressStateService.apply(e,{stateKey:'reika-gaho',operation:'set',value,max:200});}
function value(e){return c.ProgressStateService.state(e,'reika-gaho').value;}
function mode(e){return c.ModeStateService.current(e,'reika-mode','normal');}
function damageCharge(e,amount){c.CharacterTriggerEffectService.run(e,'damage-dealt',{source:e,target:entity({id:'enemy',teamId:'B'}),attack:ch.attacks.lmbBlessed,amount,healthDamage:amount,now:clock});}
test('스펙·제거된 가호 스킬/회피 변형·기본 근거리 상한',()=>{
 assert.equal(ch.maxHealth,1300);assert.equal(ch.speed,3.75);assert.equal(ch.title,'태양의 기사');assert.equal(ch.color,'#ff7a00');
 assert.equal(ch.attacks.lmb.range,350);assert.equal(ch.attacks.lmbBlessed.range,350);assert.equal(ch.attacks.gahoWeapon.range,500);
 for(const key of ['rmbPush','gahoActivate','counterBlessed','counterBlessedExplosion'])assert.equal(ch.attacks[key],undefined);
 assert.equal(ch.passives.some(p=>p.type==='dodge.trail-field'),false);
 for(const ability of [ch.abilities.rmb,ch.abilities.counter])assert.equal(ability.trigger.modules.some(m=>m.alternateWhen||m.alternates),false);
});
test('가호 중 적중 충전 복구·일반/활성50피해2%·소진 복귀',()=>{
 const e=entity();gauge(e,50);c.ModeStateService.set(e,'reika-mode','blessed','normal');damageCharge(e,100);assert.equal(value(e),54);damageCharge(e,5000);assert.equal(value(e),200);
 c.PassiveProgressRateService.update(e,clock);clock+=250;c.PassiveProgressRateService.update(e,clock);assert.equal(value(e),193.75);assert.equal(mode(e),'blessed');
 gauge(e,1);clock+=250;c.PassiveProgressRateService.update(e,clock);assert.equal(value(e),0);assert.equal(mode(e),'normal');damageCharge(e,50);assert.equal(value(e),2);damageCharge(e,5000);assert.equal(value(e),200);
});
test('스킬은 100%이상/비활성에서만 입력허용·100%미만/활성은 공격/미리보기 없음',()=>{
 for(const initial of [0,99,100,150,200]){
  for(const active of [false,true]){
   clock=1000;shots=[];areas=[];c.SimulationScheduleService.clear();const e=entity();gauge(e,initial);if(active)c.ModeStateService.set(e,'reika-mode','blessed','normal');
   const allowed=c.TriggerModuleService.matches(ch.abilities.rmb.trigger,'input.press',{source:e,now:clock},condition=>['state.progress-gte','state.mode-is'].includes(condition.type)?undefined:true);
   assert.equal(allowed,initial>=100&&!active);if(!allowed){assert.equal(shots.length,0);assert.equal(areas.length,0);assert.equal(e.attackPreview,undefined);assert.equal(c.MovementAbilityService.active(e),false);continue;}
   assert.equal(c.TriggeredAttackService.execute(e,ch.attacks.gahoWeapon,0,{targetPoint:{x:700,y:500}}),true);
   assert.equal(mode(e),'blessed');let air=e.actionState.get('movement:reika-airborne');assert.ok(air);assert.equal(air.distance,0);assert.equal(air.blocksAction,true);assert.equal(shots.length,0);
   clock=1100;c.MovementAbilityService.update(e,clock,100,{x:1,y:0});assert.equal(e.x,400);assert.ok(e.actionState.get(air.stateKey));assert.ok(c.MovementAbilityService.presentation(e,clock).lift>80);
   clock=1219;c.SimulationScheduleService.update(clock);assert.equal(shots.length,0);clock=1220;c.SimulationScheduleService.update(clock);assert.equal(shots.length,1);
   const shot=shots[0];assert.equal(shot.attack.range,500);assert.equal(shot.projectile.targetPointClampToAttackRange,true);
   const p={source:e,attack:ch.attacks.gahoWeapon,behavior:c.ProjectileModuleService.config(ch.attacks.gahoWeapon),x:700,y:500,angle:0,networkKey:'reika-'+initial+active,volley:shot.volley};
   clock=1320;assert.equal(c.ProjectileImpactService.resolve(p,'target'),true);assert.equal(areas.length,1);
   clock=1370;c.SimulationScheduleService.update(clock);air=e.actionState.get('movement:reika-airborne');assert.ok(air);assert.equal(air.distance,300);assert.equal(air.trajectory.startHeight,90);
   clock=1510;c.MovementAbilityService.update(e,clock,140,{x:0,y:0});assert.equal(e.x,700);assert.equal(areas.length,2);assert.equal(areas[1].a.id,ch.attacks.gahoLand.id);
  }
 }
});
test('반격은 실제 정지 위치에서만 회전 타격·적 충돌/최대 이동',()=>{
 for(const targetX of [500,1000]){
  clock=1000;areas=[];c.EntityService.items.clear();const e=entity(),enemy=entity({id:'enemy',teamId:'B',x:targetX});c.EntityService.items.set(e.id,e);c.EntityService.items.set(enemy.id,enemy);
  c.TriggeredAttackService.execute(e,ch.attacks.counter,0);assert.equal(areas.length,0);
  clock=1220;c.MovementAbilityService.update(e,clock,220,{x:0,y:0});assert.equal(areas.length,1);assert.equal(areas[0].a.id,ch.attacks.counterSpin.id);
  assert.equal(e.x,targetX===500?484:700);assert.ok(c.ModeStateService.state(e,'reika-sword-rotation'));assert.equal(e.actionState.has('movement:move'),false);
 }
});
test('가호 검격100·875 범위투사체 검기100/화염·적 관통/벽 차단',()=>{
 const a=ch.attacks.lmbWave,m=a.modules[0];assert.equal(a.range,875);assert.equal(m.type,'delivery.range-projectile');assert.equal(m.radius,104);assert.equal(a.damageRatio*ch.baseDamage,100);
 const e=entity();c.TriggeredAttackService.execute(e,a,0);assert.equal(shots.length,1);assert.equal(shots[0].behavior.pierce.targets,true);assert.equal(shots[0].behavior.pierce.walls,false);
 c.AttackModuleService.onHit(e,entity({teamId:'B'}),a,{execution:c.AttackExecutionService.create(e,a,0)},0,{});assert.equal(burns.length,1);
});
test('제자리 공중 궤적은 시간으로 유지·원격 동일 높이·시간 끝 정리',()=>{
 const e=entity();c.MovementAbilityService.start(e,ch.attacks.gahoWeapon.modules.find(m=>m.type==='movement.move'),0,{},clock);
 clock+=100;c.MovementAbilityService.update(e,clock,100);assert.ok(c.MovementAbilityService.active(e));
 const packet=c.MovementAbilityService.serialize(e,clock),remote=entity({local:false});
 remote._remoteMovementAbilityActive=true;remote._remoteMovementEffectState=c.MovementAbilityService.remoteEffectState(remote,packet,clock);
 c.Training.sessionMode='online';assert.equal(c.MovementAbilityService.presentation(remote,clock).lift,c.MovementAbilityService.presentation(e,clock).lift);c.Training.sessionMode='training';
 clock=1510;c.MovementAbilityService.update(e,clock,410);assert.equal(c.MovementAbilityService.active(e),false);assert.equal(c.MovementAbilityService.presentation(e,clock).lift,0);
});
test('스킬 목표점500 제한·활성중 스킬타격도 게이지 충전',()=>{
 const e=entity();gauge(e,200);c.SimulationScheduleService.clear();c.TriggeredAttackService.execute(e,ch.attacks.gahoWeapon,0,{targetPoint:{x:1400,y:500}});clock+=220;c.SimulationScheduleService.update(clock);assert.equal(shots[0].targetPoint.x,900);
 gauge(e,0);c.ModeStateService.set(e,'reika-mode','blessed','normal');damageCharge(e,200);c.AttackModuleService.onDeliveryResolved(e,ch.attacks.gahoLand,0,c.AttackExecutionService.create(e,ch.attacks.gahoLand,0));assert.equal(mode(e),'blessed');assert.equal(value(e),8);
});
test('50피해당 100%기준2%·낙하2타 같은180범위·소모25·스윕 제거',()=>{
 const e=entity();gauge(e,0);damageCharge(e,50);assert.equal(value(e),2);assert.equal(value(e)/100,.02);
 for(const m of [ch.triggers[0].modules[0],...ch.passives]){assert.equal(m.presentation.layers,2);assert.equal(m.presentation.readyAtRatio,.5);} 
 assert.equal(ch.attacks.gahoSlam.range,180);assert.equal(ch.attacks.gahoLand.range,180);assert.equal(ch.passives[1].ratePerSecond,-25);
 for(const key of ['lmb','lmbBlessed']){const fx=ch.attacks[key].modules.find(m=>m.renderType==='arcSweep');assert.equal(fx.animateSweep,false);}
});
test('가호중 모든 공격 공용 팔레트는 하늘색·일반반격 기존색 유지',()=>{
 const e=entity();c.ModeStateService.set(e,'reika-mode','blessed','normal');
 for(const attack of Object.values(ch.attacks))assert.equal(c.AttackPresentationColorService.resolve(e,attack,{color:'255,122,0'}),'56,189,248',attack.id);
 c.ModeStateService.set(e,'reika-mode','normal','normal');assert.equal(c.AttackPresentationColorService.resolve(e,ch.attacks.counterSpin,{color:'255,122,0'}),'255,122,0');
});
test('회전/검기 실제 생성 이펙트 팔레트·원본색 보존',()=>{
 load('src/world/AreaGeometryService.js','AreaGeometryService');c.WorldGeometryService.segmentBlocked=()=>false;c.WorldGeometryService.raycastDistance=(x,y,a,d)=>d;
 const e=entity();c.EffectSpawnService.shouldPresentAttack=()=>true;let emitted=null;c.EffectSpawnService.spawn=fx=>(emitted=fx);c.OnlinePresentationSyncService.shouldSend=()=>false;
 for(const blessed of [false,true]){
  c.ModeStateService.set(e,'reika-mode',blessed?'blessed':'normal','normal');
  const attack=ch.attacks.counterSpin,m=attack.modules.find(m=>m.type==='effect.spawn');
  c.AttackModuleService.spawnAttackEffect(e,attack,0,c.AttackExecutionService.create(e,attack,0),m);
  assert.equal(emitted.hitColor,blessed?'56,189,248':'255,122,0');assert.equal(m.hitColor,'255,122,0');
 }
});
test('검기 잔상 실제 렌더: 지나온 위치 고정·시간 감소·240ms 정리',()=>{
 load('src/projectiles/ProjectileVisualPositionService.js','ProjectileVisualPositionService');
 const src=fs.readFileSync(path.join(root,'src/modes/Training.js'),'utf8');
 const start=src.indexOf("if(style?.kind==='range-projectile'){");const end=src.indexOf("if(style?.kind==='weapon-projectile'&&style?.type==='anchor-cross')",start);
 const render=vm.runInContext('(function(ctx,b,visual,style,now,alpha){for(let i=0;i<1;i++){'+src.slice(start,end)+'}})',c);
 let fills=[],x=0;const ctx={save(){},restore(){},beginPath(){},arc(v){x=v},fill(){fills.push({x,color:this.fillStyle})},stroke(){}};
 const b={radius:104,renderRgb:'56,189,248'},style={kind:'range-projectile',afterimage:{duration:240,interval:40,alpha:.18}};
 render(ctx,b,{x:400,y:500,scale:1},style,1000,1);fills=[];
 render(ctx,b,{x:500,y:500,scale:1},style,1040,1);assert.equal(fills[0].x,400);const first=fills[0].color;fills=[];
 render(ctx,b,{x:600,y:500,scale:1},style,1080,1);assert.equal(fills[0].x,400);assert.notEqual(fills[0].color,first);fills=[];
 render(ctx,b,{x:900,y:500,scale:1},style,1240,1);assert.equal(fills.some(f=>f.x===400),false);
 assert.equal(c.ProjectileVisualPositionService.afterimages({}, {x:1,y:1,scale:1},null,1240).length,0);
});
test('반격 이동은 실제 이동분만 잔선 생성·상태별 색·온라인 전송',()=>{
 load('src/render/MovementPresentationService.js','MovementPresentationService');c.Training.active=true;
 for(const blessed of [false,true]){
  clock=1000;c.EntityService.items.clear();const e=entity();c.ModeStateService.set(e,'reika-mode',blessed?'blessed':'normal','normal');
  let emitted=[],packets=[];c.EffectSpawnService.spawn=fx=>(emitted.push(fx),fx);c.OnlinePresentationSyncService.shouldSend=()=>true;c.OnlinePresentationSyncService.send=(...args)=>packets.push(args);
  c.TriggeredAttackService.execute(e,ch.attacks.counter,0);assert.equal(emitted.length,0);
  clock=1016;c.MovementAbilityService.update(e,clock,16);assert.ok(emitted.length>0);const fx=emitted[0];
  assert.equal(fx.x,400);assert.equal(fx.tx,e.x);assert.ok(fx.tx<700);assert.equal(fx.dur,250);assert.equal(fx.color,blessed?'56,189,248':'255,122,0');assert.equal(packets[0][0],'effect-spawn');
 }
 c.OnlinePresentationSyncService.shouldSend=()=>false;
});
console.log(`PASS ${passed} Reika remake regression groups`);
