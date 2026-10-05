/* 실제 테르디온 데이터와 공통 실행 서비스를 사용하는 제어된 전투 회귀 검사. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');let clock=1000,passed=0;
const c=vm.createContext({console,Map,Set,WeakMap,WeakSet,Math,performance:{now:()=>clock},EMPTY_RUNTIME_ITEMS:[],EMPTY_AUGMENT_EFFECTS:[]});
function load(file,name){vm.runInContext(fs.readFileSync(path.join(root,file),'utf8')+';globalThis.'+name+'='+name+';',c)}
function test(name,fn){fn();passed++;console.log('PASS '+name)}
for(const n of ['characterValue','characterCount','characterSum','characterProduct','freezeCharacterData','CHARACTER_RULES'])load('src/data/'+n+'.js',n);
c.CHARACTER_DATA={};for(const e of JSON.parse(fs.readFileSync(path.join(root,'src/data/characters/index.json'))).characters){const d=vm.runInContext('('+fs.readFileSync(path.join(root,e.path),'utf8')+')',c);c.CHARACTER_DATA[d.id]=d}
load('src/data/CharacterDataService.js','CharacterDataService');const ch=c.CharacterDataService.compile('terdion');
c.GAME_DATA={frameMs:1000/60};c.Training={sessionMode:'training'};
c.AbilityService={attackById:(character,id)=>Object.values(character.attacks).find(a=>a.id===id),damageRatio:(character,a)=>a?.damageRatio||0};
c.TagService={attackTags:a=>new Set(a.tags),derivedModuleTags:()=>[]};
c.EntitySimulationAuthorityService={isLocal:e=>e.local!==false};c.NetworkCollisionPositionService={point:e=>e};
c.RelationService={canTarget:(s,t)=>s.teamId!==t.teamId,relation:(s,t)=>s===t?'self':s.teamId===t.teamId?'ally':'enemy'};
c.BuffService={live:()=>[]};c.AugmentService={update(){},prepareAttack:(s,a)=>a,beforeIncomingDamage:x=>x.amount,onDamageApplied(){}};
c.ProgressScaledAttackService={resolve:(s,a)=>a};c.JustDodgeService={confirmDamageAttempt:t=>t.dodging===true};
c.CharacterTriggerEffectService={run:(s,event,ctx)=>ctx};c.CombatStatsService={current:()=>({damageMult:1,damageTakenMult:1})};
c.DamageResourceLayerService={absorb:(t,n)=>({absorbed:0,remaining:n})};c.ShieldService={absorb:(t,n)=>({absorbed:0,remaining:n})};
c.HealthService={damage:(t,n)=>{t.health-=n;return{applied:true,amount:n,healthDamage:n,defeated:false}}};
c.NetworkHitAuthorityService={rememberDamageSource(){},recordPredictedDodgeDamage(){},notify(){}};
c.ExecutionDamageLedgerService={record(){}};c.CCService={has:()=>false,onDamaged(){}};
c.NeutralizingKnockbackService={followupHit(){},start:x=>{motions.push(x);return true}};
c.TriggerModuleService={matches:()=>true};
load('src/core/GameEvents.js','GameEvents');load('src/combat/AttackExecutionService.js','AttackExecutionService');
load('src/combat/AttackModuleService.js','AttackModuleService');load('src/combat/DamageRangeBandService.js','DamageRangeBandService');load('src/combat/DamagePipeline.js','DamagePipeline');
load('src/core/CollisionPolicyService.js','CollisionPolicyService');load('src/core/SimulationScheduleService.js','SimulationScheduleService');load('src/projectiles/ProjectileModuleService.js','ProjectileModuleService');
load('src/projectiles/ProjectileImpactService.js','ProjectileImpactService');load('src/ui/CharacterDescriptionService.js','CharacterDescriptionService');
const source={id:'s',alive:true,teamId:'a',character:ch,baseDamage:100,x:0,y:0,attackSequence:0,actionState:new Map()};
function target(x=1000,y=0){return{id:'t',alive:true,teamId:'b',health:5000,maxHealth:5000,x,y,radius:20}}
function damage(attack,t,origin={x:1000,y:0}){const execution=c.AttackExecutionService.create(source,attack,0);return c.DamagePipeline.apply({source,target:t,attack,execution,impact:{origin,directionAngle:0,execution}})}
test('59명 공통 컴파일·체력/이속/칭호·색상 중복 없음',()=>{assert.equal(ch.maxHealth,1500);assert.equal(ch.speed,4);assert.equal(ch.moveLabel,'보통');assert.equal(ch.title,'노련한 발파원');for(const d of Object.values(c.CHARACTER_DATA))if(d.id!=='terdion')assert.notEqual(String(d.color).toLowerCase(),ch.color);assert.equal(Object.keys(c.CHARACTER_DATA).length,59)});
test('공통 피해 파이프라인: 직격과 착탄 중심의 3단계 피해 감쇠',()=>{assert.equal(damage(ch.attacks.lmb,target()).amount,150);assert.equal(damage(ch.attacks.rmb,target()).amount,200);for(const [key,values]of [['lmbExplosion',[300,200,100]],['rmbExplosion',[600,400,200]],['counterExplosion',[300,200,100]]]){const a=ch.attacks[key];for(let i=0;i<3;i++)assert.ok(Math.abs(damage(a,target(1000+a.range*i/2)).amount-values[i])<1e-9)}});
test('반 내구도 타격은 체력 피해로 집계·레이카 충전·온라인 확정량 일치',()=>{
 const h=vm.createContext({...c});
 function loadH(file,name){vm.runInContext(fs.readFileSync(path.join(root,file),'utf8')+`;globalThis.${name}=${name};`,h)}
 for(const [file,name]of [['src/core/ProgressStateService.js','ProgressStateService'],['src/combat/DamageResourceLayerService.js','DamageResourceLayerService'],['src/core/TriggerConditionService.js','TriggerConditionService'],['src/core/TriggerModuleService.js','TriggerModuleService'],['src/combat/ProgressHitTargetPolicy.js','ProgressHitTargetPolicy'],['src/render/CharacterTriggerEffectService.js','CharacterTriggerEffectService'],['src/combat/DamagePipeline.js','DamagePipeline']])loadH(file,name);
 h.ModeStateService={current:()=> 'normal'};h.Training={sessionMode:'training'};
 h.EffectSpawnService={spawn:()=>null};h.CCService={has:()=>false,onDamaged(){},isDotImpact:i=>i?.dot===true};
 const van=c.CharacterDataService.compile('van'),reika=c.CharacterDataService.compile('reika');
 const a={id:'test',damageRatio:1,modules:[],tags:[]};
 const attacker={...source,character:reika,actionState:new Map()};
 const victim={...target(),kind:'player',character:van,actionState:new Map(),health:800,maxHealth:800};
 const key=van.wrenchDurability.stateKey;
 const hit=()=>h.DamagePipeline.apply({source:attacker,target:victim,attack:a,impact:{type:'projectile'}});
 const full=hit();assert.equal(full.applied,true);assert.equal(full.healthDamage,100);assert.equal(full.amount,100);assert.equal(victim.health,800);assert.equal(victim.actionState.get(key).value,700);assert.equal(attacker.actionState.get('reika-gaho').value,6);
 victim.actionState.get(key).value=50;const split=hit();assert.equal(split.healthDamage,100);assert.equal(victim.actionState.get(key).value,0);assert.equal(victim.health,750);assert.equal(attacker.actionState.get('reika-gaho').value,12);
 const body=hit();assert.equal(body.healthDamage,100);assert.equal(victim.health,650);assert.equal(attacker.actionState.get('reika-gaho').value,18);
 loadH('src/network/NetworkHitAuthorityService.js','NetworkHitAuthorityService');
 const sent=[];h.Training.sessionMode='online';h.OnlineDuelService={active:true,roundToken:1};h.OnlineParticipantEntityService={pid:e=>e===attacker?'P1':'P2'};h.RoomService={sendGameplay:p=>sent.push(p)};
 assert.equal(h.NetworkHitAuthorityService.notify(full),true);assert.equal(sent[0].amount,100);assert.equal(sent[0].durabilityBlocked,false);assert.equal(sent[0].targetHealth,650);
});
test('저스트 회피·방어·아군: 직격과 폭발 모두 같은 피해 차단 경로',()=>{for(const a of [ch.attacks.lmb,ch.attacks.lmbExplosion]){const t=target();t.dodging=true;assert.equal(damage(a,t).amount,0);assert.equal(t.health,5000);t.dodging=false;c.AttackGuardService={blockDamage:()=>true};assert.equal(damage(a,t).amount,0);c.AttackGuardService=undefined;t.teamId='a';assert.equal(damage(a,t).amount,0)}});
const motions=[];c.MovementService={knockback:(t,angle,distance,speed)=>{motions.push({angle,distance,speed});return true}};
test('실제 onHit: 중심 기준 방사형 넉백·거리 감쇠·반격 무력화',()=>{for(const key of ['lmbExplosion','rmbExplosion','counterExplosion']){const a=ch.attacks[key],m=a.modules.find(m=>m.type.includes("knockback"));for(const fraction of [0,.5,1]){const t=target(1000,100+a.range*fraction),execution=c.AttackExecutionService.create(source,a,0);execution.projectileImpactPoint={x:1000,y:100};c.AttackExecutionService.setImpactOrigin(execution,{mode:'point',x:1000,y:100});c.AttackModuleService.onHit(source,t,a,{execution},0,a.modules[0]);const last=motions.at(-1);assert.ok(Math.abs(last.distance-(m.maxDistance+(m.minDistance-m.maxDistance)*fraction))<1e-9);if(fraction>0)assert.ok(Math.abs(last.angle-Math.PI/2)<1e-9)}}});
const impacts=[],effects=[];
c.AreaAttackService={execute:(s,a,angle,module,volley,options)=>impacts.push({a,point:options.geometrySource,time:clock})};
c.EffectSpawnService={shouldPresentAttack:()=>true,definitionSnapshot:s=>structuredClone(s),spawn:s=>{effects.push(s);return s}};c.OnlinePresentationSyncService={shouldSend:()=>false};
function carrier(key='bomb'){return{source,x:1000,y:100,angle:0,networkKey:key,attack:ch.attacks.lmb,behavior:c.ProjectileModuleService.config(ch.attacks.lmb)}}
test('실제 착탄/예약: 499ms 피해 없음·500ms 고정 좌표 폭발·중복 확정 1회',()=>{c.SimulationScheduleService.clear();impacts.length=0;effects.length=0;clock=1000;const p=carrier();assert.equal(c.ProjectileImpactService.resolve(p,'target'),true);assert.equal(effects.length,1);assert.equal(effects[0].dur,500);source.x=300;source.y=200;clock=1499;c.SimulationScheduleService.update(clock);assert.equal(impacts.length,0);clock=1500;c.SimulationScheduleService.update(clock);assert.equal(impacts.length,1);assert.equal(impacts[0].point.x,1000);assert.equal(impacts[0].point.y,100);assert.equal(c.ProjectileImpactService.resolve(carrier(),'target'),false);c.SimulationScheduleService.update(2500);assert.equal(impacts.length,1)});
test('벽/사거리 착탄·독립 폭약·소스 사망/맵 정리로 예약 취소',()=>{clock=2000;for(const reason of ['wall','range'])assert.equal(c.ProjectileImpactService.resolve(carrier(reason),reason),true);assert.equal(c.SimulationScheduleService.items.length,2);const before=impacts.length;source.alive=false;clock=2500;c.SimulationScheduleService.update(clock);assert.equal(impacts.length,before);source.alive=true;clock=3000;c.ProjectileImpactService.resolve(carrier('clear'),'wall');c.SimulationScheduleService.clear();clock=4000;c.SimulationScheduleService.update(clock);assert.equal(impacts.length,before)});
const shots=[];c.ProjectileService={spawn:x=>shots.push(x),clear(){}};
test('실제 순차 발사: 8발·40ms 간격·시계방향·중복 일반 발사 없음',()=>{clock=5000;c.SimulationScheduleService.clear();shots.length=0;const a=ch.attacks.counter;c.AttackModuleService.deliver(source,a,.2,{execution:c.AttackExecutionService.create(source,a,.2)});assert.equal(shots.length,0);assert.equal(c.SimulationScheduleService.items.length,8);for(let i=0;i<8;i++){clock=5000+i*40;c.SimulationScheduleService.update(clock);assert.equal(shots.length,i+1);assert.ok(Math.abs(shots[i].angle-(.2+i*Math.PI/4))<1e-9)}c.SimulationScheduleService.update(10000);assert.equal(shots.length,8)});
load('src/combat/CounterModuleService.js','CounterModuleService');
test('공통 반격 300ms·실제 폭발 무력화 CC 참조·설명 피해 참조',()=>{const m=ch.abilities.counter.trigger.modules[0];assert.equal(c.CounterModuleService.validate(m),true);assert.equal(m.windup,300);assert.equal(c.CounterModuleService.referencedCc(source,m).type,'movement.neutralize-knockback');for(const key of ['lmb','rmb','counter']){const d=c.CharacterDescriptionService.attackRangeDamage(ch,ch.attacks[key+'Explosion']);assert.equal(d.min,key==='rmb'?200:100);assert.equal(d.max,key==='rmb'?600:300)}});
let invalidations=0;c.StaticWorldRenderer={invalidate:()=>invalidations++};load('src/world/WorldDestructionService.js','WorldDestructionService');load('src/world/DynamicWallService.js','DynamicWallService');
const map={id:'test',tileWorldSize:50,walls:[{x:100,y:100,w:200,h:50},{x:700,y:700,w:50,h:50}]};
c.DebugMapService={currentId:'test',current:()=>map};const world=c.WorldDestructionService;
test('맵 원본 보존·긴 벽을 블록 단위 파괴·충돌 캐시 재사용·라운드 복원',()=>{world.reset(map);const original=JSON.stringify(map);assert.equal(world.destroyCircle({x:110,y:110},10,{source}),true);assert.equal(world.removed.size,1);assert.equal(world.walls(map).reduce((sum,w)=>sum+w.w*w.h,0),10000);assert.equal(world.walls(map),world.walls(map));assert.equal(JSON.stringify(map),original);assert.equal(world.destroyCircle({x:110,y:110},10,{source}),false);world.reset(map);assert.equal(world.removed.size,0);assert.equal(world.walls(map),map.walls)});
test('설치 벽 파괴: 늦은 소유자 스냅샷으로 재등장 없음',()=>{const wall={id:'dynamic:1',x:100,y:100,w:50,h:50};c.DynamicWallService.byOwner.set('s',[wall]);c.DynamicWallService.invalidate();world.destroyCircle({x:110,y:110},10,{source});assert.equal(c.DynamicWallService.all().length,0);c.DynamicWallService.applyRemote(source,[wall]);assert.equal(c.DynamicWallService.all().length,0);world.reset(map);assert.equal(c.DynamicWallService.all().length,1)});
const packets=[];c.Training.sessionMode='online';c.OnlineDuelService={active:true,roundToken:3};c.RoomService={sendGameplay:p=>packets.push(p)};
load('src/network/OnlineWorldDestructionSyncService.js','OnlineWorldDestructionSyncService');
test('지형 사건 복제·중복/역순 스냅샷은 복원하지 않음·오래된 라운드/다른 맵 차단',()=>{world.reset(map);world.destroyCircle({x:110,y:110},10,{source});assert.equal(packets.length,1);const p=structuredClone(packets[0]);world.reset(map);assert.equal(c.OnlineWorldDestructionSyncService.receive(p),true);assert.equal(world.removed.size,1);c.OnlineWorldDestructionSyncService.receive({...p,snapshot:{...p.snapshot,removed:[]}});assert.equal(world.removed.size,1);assert.equal(c.OnlineWorldDestructionSyncService.receive({...p,roundToken:2}),false);assert.equal(c.OnlineWorldDestructionSyncService.receive({...p,snapshot:{mapId:'other',removed:[0]}}),false);const revision=world.revision;c.OnlineWorldDestructionSyncService.receive(p);assert.equal(world.revision,revision)});
c.EntityService={items:new Map(),owner:e=>e};
c.AreaGeometryService={center:(s,m)=>m.centerPoint||{x:s.x,y:s.y},polygon:(s,m)=>({center:{x:s.x,y:s.y},points:[]})};
vm.runInContext(fs.readFileSync(path.join(root,'src/world/WorldGeometryService.js'),'utf8').replace('const WorldGeometryService=','const TestRectGeometry=')+';globalThis.WorldGeometryService={segmentRectEntry:TestRectGeometry.segmentRectEntry};',c);
load('src/combat/AreaAttackService.js','AreaAttackService');
test('실제 스킬 착탄→범위 실행: 폭발 전 벽 유지·500ms에만 벽 파괴 / 평타는 벽 유지',()=>{
 c.Training.sessionMode='training';world.reset(map);c.DynamicWallService.clearAll();clock=11000;
 const a=ch.attacks.rmb,p={...carrier('skill-integration'),attack:a,x:110,y:110,behavior:c.ProjectileModuleService.config(a)};
 c.ProjectileImpactService.resolve(p,'wall');assert.equal(world.removed.size,0);
 clock=11499;c.SimulationScheduleService.update(clock);assert.equal(world.removed.size,0);
 clock=11500;c.SimulationScheduleService.update(clock);assert.ok(world.removed.size>0);assert.ok(world.removed.size<world.cells.length);
 world.reset(map);clock=12000;c.ProjectileImpactService.resolve({...carrier('lmb-integration'),x:110,y:110},'wall');
 clock=12500;c.SimulationScheduleService.update(clock);assert.equal(world.removed.size,0);
});
// 경계값은 기존 radial의 > 비교를 유지한다. 정확히 경계는 안쪽 단계.
test('피해 단계 경계·구간 내 고정값·시전자와 착탄 중심 분리',()=>{
 c.Training.sessionMode='training';source.x=-300;source.y=-400;
 for(const key of ['lmbExplosion','rmbExplosion','counterExplosion']){
  const a=ch.attacks[key],max=key==='rmbExplosion'?600:300;
  for(const [distance,mult] of [[0,1],[a.range/3,1],[a.range/3+.001,2/3],[a.range*.5,2/3],[a.range*2/3,2/3],[a.range*2/3+.001,1/3],[a.range,1/3]]){
   assert.ok(Math.abs(damage(a,target(1000+distance),{x:1000,y:0}).amount-max*mult)<1e-9);
  }
 }
});
test('무기 투사체 3종·스킬/근거리 반격 공중 궤적·설명 (피해/피해)',()=>{
 for(const key of ['lmb','rmb','counter']){
  const b=c.ProjectileModuleService.config(ch.attacks[key]);assert.equal(b.presentation.type,'anchor-cross');
  assert.equal(ch.attacks[key].modules.find(m=>m.type==='projectile.presentation').kind,'weapon-projectile');
  const t=ch.tooltipSkills.find(t=>t.attack===key);assert.ok(t.text.includes('({damage}/{linkedDamage})'));
 }
 assert.equal(ch.attacks.counter.range,350);
 assert.equal(ch.attacks.counter.modules[0].radius,14);
 assert.equal(c.ProjectileModuleService.config(ch.attacks.counter).presentation.radius,14);
 assert.equal(ch.attacks.counterLanding.modules[0].radius,14);
 assert.equal(ch.attacks.counter.modules[0].damageOnTravel,false);
 assert.notEqual(ch.attacks.counter.modules[0].collisionTargets,true);
 for(const key of ['rmb','counter']){const arc=ch.attacks[key].modules.find(m=>m.type==='trajectory.arc');assert.equal(arc.height,120);assert.equal(arc.apexAlpha,.4)}
 assert.equal(ch.attacks.rmb.modules[0].arrival.passWallsInFlight,true);
 assert.equal(ch.attacks.rmb.modules[0].damageOnTravel,false);
 assert.equal(ch.attacks.rmb.range,500);
 assert.equal(ch.attacks.rmb.modules[0].radius,18);
 assert.equal(c.ProjectileModuleService.config(ch.attacks.rmb).presentation.radius,18);
 assert.equal(ch.attacks.rmbLanding.modules[0].radius,18);
 assert.equal(ch.attacks.rmbExplosion.modules.find(m=>m.type==='world.destroy-walls').contactRange,18);
});
load('src/projectiles/TargetPointProjectileService.js','TargetPointProjectileService');
load('src/projectiles/ProjectileVisualPositionService.js','ProjectileVisualPositionService');
test('실제 잔류 진입: 벽/빈 지정점/사거리→폭발 예약·무기 객체 고정·재진입 중복 없음',()=>{
 c.SimulationScheduleService.clear();clock=20000;source.alive=true;
 for(const [key,reason] of [['lmb','wall'],['rmb','target-point'],['counter','range']]){
  const a=ch.attacks[key],p={...carrier('linger-'+reason),attack:a,behavior:c.ProjectileModuleService.config(a),
   radius:a.modules[0].radius,renderStyle:c.ProjectileModuleService.config(a).presentation,travel:200,vx:10,vy:2,presentationEffectKeys:[]};
  assert.equal(c.TargetPointProjectileService.beginLinger(p,clock,reason),true);
  assert.equal(p.vx,0);assert.equal(p.vy,0);assert.equal(p.stationaryArrival.endsAt,20500);
  const visual=c.ProjectileVisualPositionService.sample(p);assert.equal(visual.x,p.x);assert.equal(visual.y,p.y);assert.equal(visual.alpha,1);
  assert.equal(c.ProjectileImpactService.resolve(p,reason),false);
 }
 assert.equal(c.SimulationScheduleService.items.length,3);
});
c.HitScanGeometryService={effectiveModule:(s,a,m)=>m};
c.ProjectileWallCollisionModeService={resolve:()=> 'radius'};
c.WorldGeometryService={raycastDistance:(x,y,angle,range)=>range};
// 실제 미리보기 서비스와 실제 AreaParts를 실행하고 polygon 좌표만 단순화한다.
c.AreaGeometryService.polygon=(s,m,angle,count,out={})=>Object.assign(out,{center:{x:s.x,y:s.y},points:[]});
load('src/combat/AttackPreviewAreaService.js','AttackPreviewAreaService');
load('src/combat/AttackPreviewService.js','AttackPreviewService');
test('실제 반격 미리보기: 경로 없이 착탄 원 8개 / 막힌 방향만 실제 벽 위치로 단축',()=>{
 const a=ch.attacks.counter;c.WorldGeometryService.raycastDistance=(x,y,angle,range)=>Math.abs(angle)<.01?75:range;
 const p=c.AttackPreviewService.delayedProjectileVolleyParts(source,a,0);
 const paths=p.filter(p=>p.type==='projectile-path'),circles=p.filter(p=>p.type==='circle');
 assert.equal(paths.length,0);assert.equal(circles.length,8);
 const full=c.AttackPreviewService.fromAttack(source,a,0,clock+300,{parts:[{type:'projectile-path'}],points:[]});
 assert.equal(full.parts.length,8);assert.ok(full.parts.every(part=>part.type==='circle'));
 assert.equal(full.projectile,false);assert.equal(full.range,0);

 for(let i=0;i<8;i++){
  const range=i===0?75:350;assert.equal(circles[i].range,120);
  assert.ok(Math.abs(circles[i].center.x-source.x-Math.cos(i*Math.PI/4)*range)<1e-9);
  assert.ok(Math.abs(circles[i].center.y-source.y-Math.sin(i*Math.PI/4)*range)<1e-9);
 }
});
c.ColorService={rgbString:(v,f)=>v||f};c.AttackVisualStyle={fillAlpha:.18,strokeAlpha:.75,strokeWidth:2};
load('src/render/AreaCircleEffectPresentationService.js','AreaCircleEffectPresentationService');
test('실제 호 게이지 렌더: 500ms 수명·100%→50%→0%·본체 중복 채움 없음',()=>{
 const m=ch.attacks.lmbLanding.modules[0],f={...m,range:10,start:0,dur:500};
 for(const [now,remaining]of [[0,1],[250,.5],[499,.002],[500,0]]){
  const arcs=[];const ctx=new Proxy({arc:(...v)=>arcs.push(v)}, {get:(o,k)=>k in o?o[k]:()=>{},set:(o,k,v)=>(o[k]=v,true)});
  c.AreaCircleEffectPresentationService.draw(ctx,f,now);
  const gauge=arcs.find(v=>v[2]===16&&v[3]===-Math.PI/2);
  if(remaining===0)assert.equal(gauge,undefined);else assert.ok(Math.abs((gauge[4]-gauge[3])/(Math.PI*2)-remaining)<1e-9);
 }
 assert.equal(m.fillAlpha,0);assert.equal(m.strokeAlpha,0);
});
// 실제 effect.spawn/타임라인 직렬화를 통해 동일 조각을 복제한다.
load('src/render/EffectSpawnService.js','EffectSpawnService');c.Training.active=true;c.Training.fx=[];
test('벽 조각 연출: 최대32개·240ms·공통 애니메이션·동일 snapshot 온라인 복제',()=>{
 const sent=[];c.OnlinePresentationSyncService={shouldSend:()=>true,send:(kind,s,data)=>sent.push({kind,data})};
 const walls=Array.from({length:100},(_,i)=>({x:i*50,y:0,w:50,h:50}));
 world.presentDestruction(walls,source);assert.ok(c.Training.fx.length<=32);assert.equal(sent.length,c.Training.fx.length);
 for(let i=0;i<sent.length;i++){
  const fx=c.Training.fx[i];assert.equal(fx.dur,240);assert.ok(fx.animationState);assert.equal(sent[i].kind,'effect-spawn');
  const restored=c.EffectSpawnService.restorePresentationSnapshot(sent[i].data.effect,clock);
  assert.equal(restored.start,fx.start);assert.deepEqual(restored.animation,fx.animation);
 }
 const count=c.Training.fx.length;c.Training.sessionMode='online';c.OnlineDuelService.active=true;source.local=false;
 world.presentDestruction(walls,source);assert.equal(c.Training.fx.length,count);source.local=true;
});

load('src/core/OFFICIAL_DUELS_MAP_SOURCE.js','OFFICIAL_DUELS_MAP_SOURCE');
test('교체 맵2개: 첨부본 전체 타일 SHA-256 일치·기존 ID와 크기 보존',()=>{
 const expected={"official-basic-closed-03": "ed20437de3b4aa0e4279df8165d589d9598de2f43623e726fb7c1d0a8300f941", "official-basic-closed-08": "1ab0695cffadc654e18a4083cfec662c46242b24cdd4ea1be2cf0b2a9bb61d26"};const crypto=require('node:crypto');
 for(const [id,hash]of Object.entries(expected)){
  const m=c.OFFICIAL_DUELS_MAP_SOURCE.find(m=>m.id===id);assert.equal(m.rows,28);assert.equal(m.cols,40);
  const tiles=Array.from({length:m.rows},()=>Array(m.cols).fill(0));
  for(const [r0,r1,c0,c1]of m.wallRects)for(let r=r0;r<=r1;r++)for(let col=c0;col<=c1;col++)tiles[r][col]=1;
  assert.equal(crypto.createHash('sha256').update(JSON.stringify(tiles)).digest('hex'),hash);
 }
});

test('실제 스킬 도착: 적/벽/빈 지점 모두 잔류·적 우선 직격200·폭발은 별도500ms 예약',()=>{
 c.Training.sessionMode='training';c.SimulationScheduleService.clear();source.local=true;clock=28000;
 c.WorldGeometryService.wallAtPoint=()=>({x:1000,y:100,w:50,h:50});
 c.AttackHitTriggerService={damage:({attack,target:t})=>damage(attack,t)};
 const a=ch.attacks.rmb;
 for(const mode of ['target','wall','empty']){
  c.EntityService.items.clear();const t=target(1000,100);if(mode==='target')c.EntityService.items.set(t.id,t);
  c.WorldGeometryService.wallAtPoint=()=>mode==='empty'?null:{x:1000,y:100,w:50,h:50};
  const p={...carrier('rmb-arrival-'+mode),attack:a,behavior:c.ProjectileModuleService.config(a),
   targetPoint:{x:1000,y:100},radius:12,renderStyle:c.ProjectileModuleService.config(a).presentation,
   travel:500,vx:18,vy:0,presentationEffectKeys:[]};
  assert.equal(c.TargetPointProjectileService.arrived(p),'linger');
  assert.equal(p.stationaryArrival.endsAt,28500);assert.equal(p.x,1000);assert.equal(p.y,100);
  assert.equal(t.health,mode==='target'?4800:5000);
 }
 assert.equal(c.SimulationScheduleService.items.length,3);c.EntityService.items.clear();
});

c.MatchModeService={DUEL:'duel'};c.Training.remotePlayers=new Map();c.OnlineParticipantEntityService={entity:pid=>pid==='owner'?source:null};
load('src/network/OnlineDuelService.js','OnlineDuelService');
test('실제 온라인 착탄 수신: 예측 소비된 무기 복원·고정 좌표·중복 확인은 1개 유지',()=>{
 const online=c.OnlineDuelService;online.active=true;online.localPid='local';online.remotePids=['owner','victim'];online.roundToken=7;
 const restored=[];c.ProjectileService={items:restored,findByNetworkKey:(s,key)=>restored.find(p=>p.networkKey===key),
  spawn:data=>{const p={...data,radius:data.projectile.radius,renderStyle:data.behavior.presentation,travel:0,vx:1,vy:1,presentationEffectKeys:[]};restored.push(p);return p}};
 c.SimulationScheduleService.clear();clock=30000;source.local=true;
 const packet={type:'duel-projectile-impact-confirmed',roundToken:7,projectileOwnerPid:'owner',projectileKey:'remote-restored',
  attackId:ch.attacks.lmb.id,executionSequence:88,angle:.4,reason:'target',impactPoint:{x:777,y:123}};
 assert.equal(online.receive('victim',packet),true);assert.equal(restored.length,1);
 const p=restored[0];assert.equal(p.x,777);assert.equal(p.y,123);assert.equal(p.stationaryArrival.endsAt,30500);
 assert.equal(p.projectile.networkSpawnCompensation,false);assert.equal(p.renderStyle.type,'anchor-cross');assert.equal(c.SimulationScheduleService.items.length,1);
 assert.equal(online.receive('victim',packet),true);assert.equal(restored.length,1);assert.equal(c.SimulationScheduleService.items.length,1);
});


load('src/world/WorldGeometryService.js','WorldGeometryService');
test('스킬 폭발 벽 차단·도달 벽 파괴·가려진 벽 보존·탄환 접촉 및 비용800',()=>{
 c.Training.sessionMode='training';source.local=true;c.SimulationScheduleService.clear();c.DynamicWallService.clearAll();
 world.reset(map);clock=40000;
 const a=ch.attacks.rmb;const p={...carrier('blocked-blast'),attack:a,x:60,y:125,behavior:c.ProjectileModuleService.config(a)};
 c.ProjectileImpactService.resolve(p,'arrival');clock=40500;c.SimulationScheduleService.update(clock);
 assert.equal(world.removed.size,1);assert.ok(world.walls(map).some(w=>w.x===150));
 assert.equal(ch.attacks.rmb.cost,800);assert.equal(ch.attacks.rmbExplosion.modules[0].wallPolicy,'block');
 world.reset(map);assert.equal(world.destroyCircle({x:110,y:110},180,{source,wallPolicy:'block',contactRange:12}),true);
 assert.equal(world.removed.size,1);
 // 실제 execute의 순서: 가시영역/벽 차단을 먼저 판정하고 지형 변경은 그 후.
 world.reset(map);const order=[];const polygon=c.AreaGeometryService.polygon;
 c.AreaGeometryService.polygon=(...args)=>{order.push(world.removed.size);return polygon(...args)};
 clock=41000;c.ProjectileImpactService.resolve({...carrier('order'),attack:a,x:60,y:125,behavior:c.ProjectileModuleService.config(a)},'arrival');
 clock=41500;c.SimulationScheduleService.update(clock);assert.ok(order.every(n=>n===0));assert.equal(world.removed.size,1);
 c.AreaGeometryService.polygon=polygon;
});
test('평타 단발 롤백: 즉시1발·예약0·비용200·판정/표시/호 반경14',()=>{
 const saved=c.ProjectileService;const fired=[];c.ProjectileService={spawn:p=>fired.push(p)};
 clock=50000;c.SimulationScheduleService.clear();const a=ch.attacks.lmb;
 c.AttackModuleService.deliver(source,a,.7,{execution:c.AttackExecutionService.create(source,a,.7)});
 assert.equal(fired.length,1);assert.equal(fired[0].angle,.7);assert.equal(c.SimulationScheduleService.items.length,0);
 assert.equal(a.cost,200);assert.equal(a.cd,450);assert.equal(a.modules[0].radius,14);
 assert.equal(c.ProjectileModuleService.config(a).presentation.radius,14);assert.equal(ch.attacks.lmbLanding.modules[0].radius,14);
 c.ProjectileService=saved;
});
test('반격 착탄 직격150: 비행 경로 제외·착탄1회·빈 지점/아군/회피 차단',()=>{
 c.SimulationScheduleService.clear();clock=51000;const a=ch.attacks.counter;
 assert.equal(a.damageRatio,1.5);assert.equal(a.modules[0].damageOnTravel,false);assert.notEqual(a.modules[0].collisionTargets,true);
 for(const mode of ['enemy','empty','ally','dodge']){
  c.EntityService.items.clear();const t=target(1000,100),mid=target(900,100);mid.id='mid';
  if(mode==='ally')t.teamId=source.teamId;if(mode==='dodge')t.dodging=true;
  c.EntityService.items.set(mid.id,mid);if(mode!=='empty')c.EntityService.items.set(t.id,t);
  const p={...carrier('counter-contact-'+mode),attack:a,behavior:c.ProjectileModuleService.config(a),
   radius:a.modules[0].radius,travel:350,presentationEffectKeys:[]};
  assert.equal(c.TargetPointProjectileService.beginLinger(p,clock,'range'),true);
  assert.equal(t.health,mode==='enemy'?4850:5000);assert.equal(mid.health,5000);
  c.TargetPointProjectileService.beginLinger(p,clock,'range');assert.equal(t.health,mode==='enemy'?4850:5000);
 }
 assert.equal(c.SimulationScheduleService.items.length,4);c.EntityService.items.clear();c.SimulationScheduleService.clear();
});
test('반격 마우스 거리:0/100/350/초과 거리·실제8발과 폭발 원 일치',()=>{
 const saved=c.ProjectileService;const fired=[];c.ProjectileService={spawn:p=>fired.push(p)};
 const ray=c.WorldGeometryService.raycastDistance;c.WorldGeometryService.raycastDistance=(x,y,angle,range)=>range;
 c.WorldBoundsService={width:()=>10000,height:()=>10000};source.x=2000;source.y=2000;
 c.DebugMapService.walls=()=>[];c.DynamicWallService.clearAll();
 const a=ch.attacks.counter;assert.equal(ch.abilities.counter.trigger.modules[0].targetPointMode,'aim-point');
 for(const distance of [0,100,350,600]){
  clock+=1000;c.SimulationScheduleService.clear();fired.length=0;
  const point={x:source.x+distance,y:source.y};const execution=c.AttackExecutionService.create(source,a,0);execution.targetPoint=point;
  c.AttackModuleService.deliver(source,a,0,{execution});c.SimulationScheduleService.update(clock+280);
  assert.equal(fired.length,8);for(const p of fired)assert.equal(p.attack.range,Math.min(350,distance));
  const preview=c.AttackPreviewService.fromAttack(source,a,0,clock+300,null,{targetPoint:point});
  assert.equal(preview.parts.length,8);for(const part of preview.parts)assert.ok(Math.abs(Math.hypot(part.center.x-source.x,part.center.y-source.y)-Math.min(350,distance))<1e-8);
 }
 c.WorldGeometryService.raycastDistance=ray;c.ProjectileService=saved;
});
const h=vm.createContext({...c});
function loadCancellation(file,name){vm.runInContext(fs.readFileSync(path.join(root,file),'utf8')+';globalThis.'+name+'='+name+';',h)}
loadCancellation('src/projectiles/ProjectileImpactService.js','ProjectileImpactService');
loadCancellation('src/core/SimulationScheduleService.js','SimulationScheduleService');
loadCancellation('src/projectiles/ProjectileService.js','ProjectileService');
vm.runInContext(fs.readFileSync(path.join(root,'src/combat/AttackGuardService.js'),'utf8').replace('const AttackGuardService=','const TestAttackGuardService=')+';globalThis.AttackGuardService=TestAttackGuardService;',h);
h.ProjectileTetherMovementService={releaseProjectile(){}};h.RemoteProjectileHomingPresentationService={clear(){}};
loadCancellation('src/projectiles/ProjectileStateService.js','ProjectileStateService');
h.InstalledAreaFieldService={KIND:'installed-area'};
test('실제 방패 제거/공통 제거/원격 guard: 착탄 후 폭발·호 취소 / 다른 폭약은 유지',()=>{
 const area=h.AreaAttackService,seen=[];h.AreaAttackService={execute:(s,a)=>seen.push(a.id)};
 const guard={...h.AttackGuardService,parryFx(){},registerBlockOccurrence(){},projectileBlockGroupKey(){return 'test'},broadcastProjectileResolution(){}};
 for(const key of ['lmb','rmb','counter']){
  clock+=1000;h.SimulationScheduleService.clear();h.ProjectileService.items.length=0;h.Training.fx.length=0;seen.length=0;
  const a=ch.attacks[key],p={...carrier('cancel-'+key),attack:a,behavior:h.ProjectileModuleService.config(a)};
  const other={...carrier('keep-'+key),attack:a,behavior:h.ProjectileModuleService.config(a)};
  h.ProjectileImpactService.resolve(p,'wall');h.ProjectileImpactService.resolve(other,'wall');
  const token=source._pendingProjectileImpacts.get(p.networkKey);assert.ok(token.effectKeys.length>0);
  p.stationaryArrival={endsAt:clock+500,triggerOnEnter:false};h.ProjectileService.items.push(p);
  clock+=200;h.AttackGuardService={intercept:(projectile,index,now)=>guard.remove(projectile,index,{source},now)};
  h.ProjectileService.updateStationary(p,0,clock);assert.equal(h.ProjectileService.items.length,0);assert.equal(token.cancelled,true);
  assert.ok(!h.Training.fx.some(f=>token.effectKeys.includes(f.key)));
  clock+=300;h.SimulationScheduleService.update(clock);assert.equal(seen.length,1);
 }
 clock+=1000;h.SimulationScheduleService.clear();seen.length=0;
 const p=carrier('generic-remove');h.ProjectileImpactService.resolve(p,'wall');clock+=100;h.ProjectileService.discard(p);clock+=500;h.SimulationScheduleService.update(clock);assert.equal(seen.length,0);
 clock+=1000;const remote=carrier('remote-cancel');h.ProjectileImpactService.resolve(remote,'wall');clock+=100;
 loadCancellation('src/network/OnlineDuelService.js','OnlineDuelService');
 h.OnlineDuelService.active=true;h.OnlineDuelService.roundToken=7;h.OnlineDuelService.localPid='local';h.OnlineDuelService.remotePids=['owner','victim'];
 assert.equal(h.OnlineDuelService.receive('victim',{type:'duel-projectile-guard-resolved',roundToken:7,projectileOwnerPid:'owner',projectileKey:remote.networkKey,outcome:'remove',impactPoint:{x:0,y:0}}),true);
 assert.equal(source._pendingProjectileImpacts.has(remote.networkKey),false);
 clock+=500;h.SimulationScheduleService.update(clock);assert.equal(seen.length,0);h.AreaAttackService=area;
});
test('만료 프레임 제거 먼저 실행해도 정상500ms 폭발 유지 / 미설정 지연 공격 유지',()=>{
 const area=h.AreaAttackService,seen=[];h.AreaAttackService={execute:(s,a)=>seen.push(a.id)};
 clock+=1000;h.SimulationScheduleService.clear();const p=carrier('expire-first');h.ProjectileImpactService.resolve(p,'wall');clock+=500;
 h.ProjectileService.finish(p);h.SimulationScheduleService.update(clock);assert.equal(seen.length,1);
 clock+=1000;const independent={...carrier('independent-delay'),behavior:{impact:{attackIds:[ch.attacks.lmbExplosion.id],oncePerProjectile:true}}};
 h.ProjectileImpactService.resolve(independent,'wall');clock+=100;h.ProjectileService.discard(independent);clock+=400;h.SimulationScheduleService.update(clock);assert.equal(seen.length,2);h.AreaAttackService=area;
});
test('실제 정상 만료와 폭발 예약 시각이0.1/1/8ms 달라도 평타/스킬/반격 폭발 유지',()=>{
 const saved=h.AreaAttackService,seen=[];h.AreaAttackService={execute:(s,a)=>seen.push(a.id)};
 for(const key of ['lmb','rmb','counter'])for(const skew of [.1,1,8])for(const expiryFirst of [true,false]){
  clock+=1000;h.SimulationScheduleService.clear();h.ProjectileService.items.length=0;seen.length=0;
  const a=ch.attacks[key],p={...carrier(`skew-${key}-${skew}-${expiryFirst}`),attack:a,behavior:h.ProjectileModuleService.config(a)};
  h.ProjectileImpactService.resolve(p,'wall');const start=clock;
  p.stationaryArrival={startedAt:start-skew,endsAt:start+500-skew,triggerOnEnter:false};h.ProjectileService.items.push(p);
  if(expiryFirst){clock=start+500-skew;h.ProjectileService.updateStationary(p,0,clock);assert.equal(h.ProjectileService.items.length,0);assert.equal(seen.length,0)}
  clock=start+500;h.SimulationScheduleService.update(clock);
  if(!expiryFirst)h.ProjectileService.updateStationary(p,0,clock);
  assert.equal(seen.length,1);h.SimulationScheduleService.update(clock+100);assert.equal(seen.length,1);
 }
 h.AreaAttackService=saved;
});
console.log('PASS '+passed+' Terdion scenarios');
