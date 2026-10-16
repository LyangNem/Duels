/* Public charge aim / weighted formation distance / fixed regeneration. VM regression, not browser/WebRTC. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');let now=1000,passed=0;
const c=vm.createContext({console,Map,Set,WeakMap,WeakSet,Math,performance:{now:()=>now},EMPTY_RUNTIME_ITEMS:[]});
function load(p,n){vm.runInContext(fs.readFileSync(path.join(root,p),'utf8')+';globalThis.'+n+'='+n,c)}
function test(n,fn){now=1000;fn();passed++;console.log('PASS '+n)}
for(const n of ['characterValue','characterCount','characterSum','characterProduct','freezeCharacterData','CHARACTER_RULES'])load('src/data/'+n+'.js',n);
c.CHARACTER_DATA={};for(const id of ['cherity','tinya','gae'])c.CHARACTER_DATA[id]=vm.runInContext('('+fs.readFileSync(path.join(root,'src/data/characters/'+id+'.js'),'utf8')+')',c);
load('src/data/CharacterDataService.js','CharacterDataService');const chars=c.CharacterDataService.compileAll();
c.AbilityService={attackById:(ch,id)=>Object.values(ch.attacks).find(a=>a.id===id)};
c.EntitySimulationAuthorityService={isLocal:e=>e.local!==false};c.EntityService={items:new Map()};
c.Training={player:null,aimAngle:()=>.3};c.RoomTeams={A:{color:'#ff0000'},B:{color:'#0000ff'}};c.CCService={removeSource(){}};
load('src/core/ColorService.js','ColorService');load('src/render/TeamColorPresentationService.js','TeamColorPresentationService');load('src/abilities/ChargedAttackService.js','ChargedAttackService');load('src/render/ArcGaugePresentationService.js','ArcGaugePresentationService');
c.WorldBoundsService={width:()=>4000,height:()=>3000};c.DebugMapService={walls:()=>[]};load('src/world/WorldGeometryService.js','WorldGeometryService');
function entity(id='gae',extra={}){const ch=chars[id];return{id,character:ch,kind:'player',local:true,alive:true,hidden:false,x:0,y:0,radius:20,baseDamage:ch.baseDamage,teamId:'A',actionState:new Map(),buffs:new Map(),health:100,maxHealth:1300,healthRegenPolicy:{idle:100000,ratio:0,tick:1000},...extra}}
function canvas(){let depth=0;return{ops:[],save(){depth++},restore(){depth--;assert.ok(depth>=0)},beginPath(){},moveTo(...p){this.ops.push(['move',...p])},lineTo(...p){this.ops.push(['line',...p])},setLineDash(){},stroke(){this.ops.push(['stroke',this.strokeStyle,this.lineWidth])},get depth(){return depth}}}
test('체리티 charge line: self/ally/enemy/spectator all see source-team color and remote latest aim',()=>{
 const e=entity('cherity',{x:100,y:200,_remoteAimAngle:Math.PI/2,local:false}),a=e.character.attacks.lmb;e.actionState.set('charge:primary',{kind:c.ChargedAttackService.KIND,attackId:a.id,angle:0,startedAt:1000});
 for(const viewer of [e,entity('gae',{teamId:'A'}),entity('gae',{teamId:'B'}),null]){c.Training.player=viewer;const ctx=canvas();assert.equal(c.ArcGaugePresentationService.drawChargeAimLine(ctx,e,now),true);assert.equal(ctx.depth,0);const end=ctx.ops.find(x=>x[0]==='line');const angle=viewer===e?.3:Math.PI/2;assert.ok(Math.abs(end[1]-(100+c.WorldGeometryService.boundaryRayDistance(100,200,angle,Infinity)*Math.cos(angle)))<1e-7);assert.ok(Math.abs(end[2]-(200+c.WorldGeometryService.boundaryRayDistance(100,200,angle,Infinity)*Math.sin(angle)))<1e-7);assert.ok(ctx.ops.some(x=>x[0]==='stroke'&&x[1]==='rgba(255,0,0,0.65)'));}
 e.teamId='B';const ctx=canvas();c.ArcGaugePresentationService.drawChargeAimLine(ctx,e,now);assert.ok(ctx.ops.some(x=>x[1]==='rgba(0,0,255,0.65)'));
 assert.equal(c.ChargedAttackService.cancel(e),true);assert.equal(c.ArcGaugePresentationService.drawChargeAimLine(canvas(),e,now),true); const faded=canvas(); now+=150; c.ArcGaugePresentationService.drawChargeAimLine(faded,e,now); assert.ok(faded.ops.some(x=>x[1]==='rgba(0,0,255,0.325)')); now+=150; assert.equal(c.ArcGaugePresentationService.drawChargeAimLine(canvas(),e,now),false);e.alive=false;assert.equal(c.ArcGaugePresentationService.drawChargeAimLine(canvas(),e,now),false);
 const src=fs.readFileSync(path.join(root,'src/modes/Training.js'),'utf8');assert.ok(src.includes('ArcGaugePresentationService.drawChargeAimLine(ctx,entity,now)'));
});
c.AugmentService={attackAdjustmentTotals:()=>({rangeMult:1}),prepareAttack:(e,a)=>a};c.ProgressScaledAttackService={resolve:(e,a)=>a};
c.CombatStatsService={current:()=>({damageMult:1,regenDelayMult:1,regenFlatPerSec:0,regenPercentPerSec:0})};
c.RelationService={canTarget:(s,t)=>s!==t};c.NetworkCollisionPositionService={point:t=>t};
let amounts=[];c.AttackHitTriggerService={damage:x=>{amounts.push(x.amountOverride);return{hit:true,authoritative:false}}};
c.AttackExecutionService={setImpactOrigin(){},setKoOrigin(){},bySequence:(s,sequence,a)=>({sequence,sourceBaseDamageSnapshot:20})};c.AttackModuleService={onHit(){}};
load('src/combat/WeightedCircleAttackDeliveryService.js','WeightedCircleAttackDeliveryService');load('src/abilities/CircleFormationService.js','CircleFormationService');
test('티냐 actual formation distance: all distances base20 before x8; unrelated delivery unchanged',()=>{
 const e=entity('tinya'),a=e.character.attacks.lmb;assert.equal(e.baseDamage,20);assert.equal(e.character.difficulty,5);
 for(const [distance,expected]of [[0,160],[499,160],[500,160],[999,160],[1000,160],[1500,160],[2000,160],[3000,160]]){
  const circle={id:'circle',x:distance,y:0,r:100},target=entity('gae',{id:'victim',x:distance,y:0});c.EntityService.items=new Map([['source',e],['target',target]]);amounts=[];
  const model={multiplierForTarget:(x,y,r,base)=>8*(base?base(circle):1)};
  c.WeightedCircleAttackDeliveryService.execute({source:e,attack:a,execution:{sourceBaseDamageSnapshot:20},model,circles:[circle],distanceFalloff:e.character.circleFormation.damage.distanceFalloff});assert.equal(amounts[0],expected);
  amounts=[];c.WeightedCircleAttackDeliveryService.execute({source:e,attack:a,execution:{sourceBaseDamageSnapshot:20},model,circles:[circle]});assert.equal(amounts[0],160);
 }
});
test('티냐 real overlap model x8 unchanged, LMB/counter distance falloff removed, remote origin retained',()=>{
 const e=entity('tinya'),circles=[{id:'o',x:2200,y:0,r:240},{id:'a',x:2140,y:0,r:150},{id:'b',x:2260,y:0,r:150}],target=entity('gae',{id:'victim',x:2200,y:0});c.EntityService.items=new Map([['s',e],['t',target]]);
 const model=c.CircleFormationService.damageModel(e,circles);assert.equal(model.multiplierForTarget(2200,0,20),8);
 for(const a of [e.character.attacks.lmb,e.character.attacks.counter]){amounts=[];c.CircleFormationService.applyManifestDamage(e,a,{sourceBaseDamageSnapshot:20},circles,0);assert.equal(amounts[0],160);assert.equal(model.multiplierForTarget(2200,0,20),8);}
 let packet;c.GameplayAttackSnapshotSyncService={send:(s,kind,p)=>(packet=JSON.parse(JSON.stringify(p)),true)};assert.equal(c.CircleFormationService.broadcastManifest(e,e.character.attacks.lmb,circles,0,42),true);assert.deepEqual(packet.snapshot.damageOrigin,{x:0,y:0});
 const remote=entity('tinya',{local:false,x:1500}),svc={...c.CircleFormationService,createBurst(){}};amounts=[];c.EntityService.items=new Map([['s',remote],['t',target]]);assert.equal(svc.receiveManifest(remote,packet),true);assert.equal(amounts[0],160);
});
load('src/core/COMBAT_BUFF_DEFS.js','COMBAT_BUFF_DEFS');load('src/core/BuffService.js','BuffService');load('src/core/ModeStateService.js','ModeStateService');load('src/core/CommandFeatureService.js','CommandFeatureService');
c.ModuleValueService={resolve:(e,v)=>Number(v)||0};c.HealthService={restore:(e,n)=>{if(!e.alive)return 0;const before=e.health;e.health=Math.min(e.maxHealth,e.health+n);return e.health-before}};c.NaturalHealthRegenActivityService={latest:()=>now};c.GameplayFeatureStateSyncService={send(){}};
load('src/render/ResourceRestoreEffectService.js','ResourceRestoreEffectService');load('src/combat/HealthRegenService.js','HealthRegenService');
test('FIX immediate50 + 1second ticks for5seconds; repeated instant healing and refreshed tick, no stacked rate; expiry/death/reset/remote',()=>{
 const e=entity('gae');c.EntityService.items.set(e.id,e);c.CommandFeatureService.runFix(e);assert.equal(e.health,150);
 for(const time of [1999,2000,3000,4000,5000,6000]){now=time;c.HealthRegenService.update(e,now);assert.equal(e.health,time<2000?150:Math.min(350,150+50*Math.min(4,Math.floor((time-1000)/1000))));}
 assert.equal(e.health,350);assert.equal(c.BuffService.live(e,'regeneration',now).length,0);
 now=7000;c.CommandFeatureService.runFix(e);assert.equal(e.health,400);const buff=e.buffs.get('regeneration')[0],tick=buff.data.nextTick;
 now=7500;for(let i=0;i<4;i++)c.CommandFeatureService.runFix(e);assert.equal(e.health,600);assert.equal(e.buffs.get('regeneration').length,1);assert.equal(buff.data.nextTick,8500);assert.equal(buff.end,12500);
 now=8000;c.HealthRegenService.update(e,now);assert.equal(e.health,600);now=8499;c.HealthRegenService.update(e,now);assert.equal(e.health,600);now=8500;c.HealthRegenService.update(e,now);assert.equal(e.health,650);
 const remote=entity('gae',{local:false});remote.buffs.set('regeneration',[{...buff,data:{...buff.data}}]);now=9000;c.HealthRegenService.update(remote,now);assert.equal(remote.health,100);c.CommandFeatureService.applyRemote(remote,'fix');assert.equal(remote.health,100);
 e.alive=false;now=10000;c.HealthRegenService.update(e,now);assert.equal(e.health,650);e.alive=true;c.CommandFeatureService.resetEntity(e);assert.equal(c.BuffService.live(e,'regeneration',now).length,0);
});


c.AttackModuleService.projectile=attack=>attack.modules.find(m=>m.type==='delivery.projectile');
c.AttackModuleService.type=m=>m.type;
test('체리티 매우 느림 / 차징100단위100~900 / 다른 차징 연속값 유지',()=>{
 const ch=chars.cherity,a=ch.attacks.lmb;assert.equal(ch.speed,3.5);assert.equal(c.CHARACTER_RULES.moveLabels.cherity,'매우 느림');
 for(let i=0;i<=800;i++){const p=i/400;const actual=c.ChargedAttackService.dynamicSpec(a,p).damageRatio*ch.baseDamage;assert.ok(Math.abs(actual-(100+Math.floor(i/100)*100))<1e-7);}
 const other={...a,charge:{...a.charge,damageRatio:{from:1,to:6}}};assert.equal(c.ChargedAttackService.dynamicSpec(other,1).damageRatio,3.5);
 assert.equal(chars.tinya.circleFormation.damage.distanceFalloff,undefined);
});

test('체리티 잔선 위치고정 / 재차징 갱신 / 은신·사망 잔선정리',()=>{
 const e=entity('cherity'),a=e.character.attacks.lmb; c.Training.player=e;
 const start=()=>e.actionState.set('charge:primary',{kind:c.ChargedAttackService.KIND,attackId:a.id,angle:0,startedAt:now});
 start();const first=canvas();c.ArcGaugePresentationService.drawChargeAimLine(first,e,now);
 e.actionState.clear();e.x=500;now+=100;const faded=canvas();c.ArcGaugePresentationService.drawChargeAimLine(faded,e,now);
 assert.deepEqual(faded.ops.find(x=>x[0]==='line'),first.ops.find(x=>x[0]==='line'));
 start();const fresh=canvas();c.ArcGaugePresentationService.drawChargeAimLine(fresh,e,now);assert.ok(fresh.ops.some(x=>x[1]==='rgba(255,0,0,0.65)'));assert.notDeepEqual(fresh.ops.find(x=>x[0]==='line'),first.ops.find(x=>x[0]==='line'));
 e.hidden=true;assert.equal(c.ArcGaugePresentationService.drawChargeAimLine(canvas(),e,now),false);e.hidden=false;e.actionState.clear();assert.equal(c.ArcGaugePresentationService.drawChargeAimLine(canvas(),e,now),false);
 start();c.ArcGaugePresentationService.drawChargeAimLine(canvas(),e,now);e.alive=false;assert.equal(c.ArcGaugePresentationService.drawChargeAimLine(canvas(),e,now),false);
});
console.log('PASS '+passed+' update252 regression groups');

load('src/render/StealthPresentationService.js','StealthPresentationService');
test('체리티 실제 은신버프: 자기/아군/적/관전자 레이저와 페이드 잔선 숨김·해제후 복구',()=>{
 const e=entity('cherity'),a=e.character.attacks.lmb;const start=()=>e.actionState.set('charge:primary',{kind:c.ChargedAttackService.KIND,attackId:a.id,angle:0,startedAt:now});start();assert.equal(c.ArcGaugePresentationService.drawChargeAimLine(canvas(),e,now),true);
 c.BuffService.set(e,'stealth',1,'test',500,{},now);assert.equal(e.hidden,false);for(const viewer of [e,entity('gae',{teamId:'A'}),entity('gae',{teamId:'B'}),null]){c.Training.player=viewer;const ctx=canvas();assert.equal(c.ArcGaugePresentationService.drawChargeAimLine(ctx,e,now),false);assert.equal(ctx.ops.length,0);}
 c.BuffService.remove(e,'stealth','test');assert.equal(c.ArcGaugePresentationService.drawChargeAimLine(canvas(),e,now),true);e.actionState.clear();now+=100;assert.equal(c.ArcGaugePresentationService.drawChargeAimLine(canvas(),e,now),true);c.BuffService.set(e,'stealth',1,'test',500,{},now);assert.equal(c.ArcGaugePresentationService.drawChargeAimLine(canvas(),e,now),false);c.BuffService.remove(e,'stealth','test');assert.equal(c.ArcGaugePresentationService.drawChargeAimLine(canvas(),e,now),false);
 start();c.BuffService.set(e,'stealth',1,'test',100,{},now);assert.equal(c.ArcGaugePresentationService.drawChargeAimLine(canvas(),e,now),false);now+=101;assert.equal(c.ArcGaugePresentationService.drawChargeAimLine(canvas(),e,now),true);
});


test('actual projectile spawn fixes shot-origin fade after movement between renders, no prior draw, remote and spectators',()=>{
 load('src/core/GameEvents.js','GameEvents');load('src/projectiles/ProjectileService.js','ProjectileService');
 c.AttackPresentationColorService={resolve:()=> '255,0,0'};c.ProjectileWallCollisionModeService={resolve:()=> 'center'};c.ProjectileFollowSourceService={initialize(){}};c.AttackModuleService.onDelivery=()=>{};c.AttackModuleService.onProjectileShot=()=>{};
 c.GameEvents.on('projectile-fired',event=>c.ArcGaugePresentationService.captureChargeShot(event));
 const attack=chars.cherity.attacks.lmb;assert.equal(attack.range,Infinity);assert.equal(c.ChargedAttackService.dynamicSpec(attack,2).range,Infinity);
 for(const local of [true,false])for(const priorDraw of [true,false]){
  const e=entity('cherity',{x:100,y:200,local,_remoteAimAngle:.1});c.Training.player=local?e:null;e.actionState.set('charge:primary',{kind:c.ChargedAttackService.KIND,attackId:attack.id,angle:.1,startedAt:now});if(priorDraw)c.ArcGaugePresentationService.drawChargeAimLine(canvas(),e,now);
  e.x=900;e.y=600;e.actionState.clear();now+=20;
  const shot=c.ProjectileService.spawn({source:e,attack,x:e.x,y:e.y,angle:.7,projectile:attack.modules[0],behavior:{pierce:{},collisionPolicy:{},collision:{}}});assert.equal(shot.maxTravelDistance,Infinity);
  e.x=1400;e.y=700;now+=150;const ctx=canvas();assert.equal(c.ArcGaugePresentationService.drawChargeAimLine(ctx,e,now),true);assert.deepEqual(ctx.ops.find(x=>x[0]==='move'),['move',900,600]);const d=c.WorldGeometryService.boundaryRayDistance(900,600,.7,Infinity);const end=ctx.ops.find(x=>x[0]==='line');assert.ok(Math.abs(end[1]-(900+Math.cos(.7)*d))<1e-8);assert.ok(Math.abs(end[2]-(600+Math.sin(.7)*d))<1e-8);assert.ok(ctx.ops.some(x=>x[1]==='rgba(255,0,0,0.325)'));now+=150;assert.equal(c.ArcGaugePresentationService.drawChargeAimLine(canvas(),e,now),false);
 }
 const source=fs.readFileSync(path.join(root,'src/render/TrainingPresentationBindings.js'),'utf8');assert.ok(source.includes("GameEvents.on('projectile-fired',event=>{\n      ArcGaugePresentationService.captureChargeShot(event);"));
});

test('infinite range preview is finite at map edge for uncharged/fully charged shots',()=>{
 c.AttackModuleService.module=(a,t)=>a.modules.find(m=>m.type===t);c.AttackModuleService.area=()=>null;c.AttackModuleService.spread=()=>0;c.AttackFeatureTransformService={prepare:(s,a)=>a};c.AttackPreviewAreaService={parts:()=>[]};load('src/combat/AttackPreviewService.js','AttackPreviewService');
 const e=entity('cherity',{x:100,y:200});for(const progress of [0,2]){const attack=c.ChargedAttackService.dynamicSpec(e.character.attacks.lmb,progress);const preview=c.AttackPreviewService.fromAttack(e,attack,0,now+100);assert.equal(preview.type,'projectile-path');assert.equal(preview.range,3900);assert.ok(Number.isFinite(preview.range));}
});
