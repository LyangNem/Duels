/* 실제 캐릭터 데이터와 공통 조건/무기/표시/충돌/복제 서비스 회귀. 실기기 WebRTC 대체 아님. */
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');let clock=1000,passed=0,walls=[],damage=[];
const c=vm.createContext({console,Map,Set,WeakMap,WeakSet,Math,performance:{now:()=>clock},EMPTY_RUNTIME_ITEMS:[],EMPTY_AUGMENT_EFFECTS:[]});
function load(file,name){vm.runInContext(fs.readFileSync(path.join(root,file),'utf8')+`;globalThis.${name}=${name};`,c)}
function test(name,fn){walls=[];damage=[];clock=1000;fn();passed++;console.log('PASS '+name)}
for(const n of ['characterValue','characterCount','characterSum','characterProduct','freezeCharacterData','CHARACTER_RULES'])load('src/data/'+n+'.js',n);
c.CHARACTER_DATA={geopin:vm.runInContext('('+fs.readFileSync(path.join(root,'src/data/characters/geopin.js'),'utf8')+')',c)};
load('src/data/CharacterDataService.js','CharacterDataService');c.CHARACTER_DATA.hab=vm.runInContext('('+fs.readFileSync(path.join(root,'src/data/characters/hab.js'),'utf8')+')',c);const ch=c.CharacterDataService.compile('hab');
const items=new Map();c.EntityService={items,owner:e=>e};
c.RelationService={relation:(a,b)=>a===b?'self':a?.teamId===b?.teamId?'ally':'enemy'};
c.EntitySimulationAuthorityService={isLocal:e=>e?.local!==false};c.NetworkCollisionPositionService={point:e=>e};
c.DynamicWallService={all:()=>[]};c.CombatStatsService={current:e=>({speedMult:e.walkMultiplier??1})};
c.WorldBoundsService={width:()=>2000,height:()=>2000};c.DebugMapService={walls:()=>walls};
c.Training={sessionMode:'training',active:true,player:null,remotePlayers:new Map()};c.GAME_DATA={frameMs:1000/60};
c.EffectSpawnService={ease:v=>v};c.AugmentService={prepareAttack:(s,a)=>a};c.ProgressScaledAttackService={resolve:(s,a)=>a};
c.TagService={derivedModuleTags:()=>[],attackTags:a=>new Set(a.tags||[]),hasAttack:(a,t)=>t==='히트스캔'&&(a.modules||[]).some(m=>m.type==='delivery.area')};
for(const n of ['ModeStateService','ProgressStateService','TriggerConditionService','TriggerModuleService','GameEvents','ReactiveEquipmentService'])load('src/core/'+n+'.js',n);
load('src/abilities/AbilityService.js','AbilityService');load('src/abilities/AbilityModuleService.js','AbilityModuleService');
load('src/world/WorldGeometryService.js','WorldGeometryService');load('src/world/AreaGeometryService.js','AreaGeometryService');load('src/world/HitScanGeometryService.js','HitScanGeometryService');
load('src/combat/AttackExecutionService.js','AttackExecutionService');load('src/combat/AreaAttackService.js','AreaAttackService');
load('src/projectiles/ProjectileHomingTargetVisibilityService.js','ProjectileHomingTargetVisibilityService');
load('src/projectiles/ProjectileModuleService.js','ProjectileModuleService');load('src/projectiles/ProjectileRedirectService.js','ProjectileRedirectService');load('src/projectiles/ProjectileService.js','ProjectileService');
load('src/network/ProjectileRedirectSyncService.js','ProjectileRedirectSyncService');load('src/combat/AttackGuardService.js','AttackGuardService');
c.ColorService={rgbString:()=> '230,202,59'};load('src/render/ArcGaugePresentationService.js','ArcGaugePresentationService');
load('src/render/ModeGearPresentationService.js','ModeGearPresentationService');load('src/render/EquipmentGaugePresentationService.js','EquipmentGaugePresentationService');
c.EntityTargetReferenceService={resolve:id=>items.get(id),encode:e=>e?.id};
c.JustDodgeService={confirmProjectile:()=>false};c.AttackHitTriggerService={damage:ctx=>{damage.push(ctx);return{hit:true,authoritative:true,amount:ch.baseDamage*ctx.attack.damageRatio}}};c.AttackModuleService={onDeliveryResolved(){},onHit(){},module:(a,t)=>(a.modules||[]).find(m=>m.type===t)};
const r=c.ReactiveEquipmentService;
function entity(id='p',extra={}){const e={id,kind:'player',alive:true,local:true,teamId:'a',character:ch,actionState:new Map(),statuses:new Map(),attackSequence:0,speed:4.5,x:100,y:500,radius:20,...extra};items.set(id,e);return e}
function reset(){items.clear();return entity()}
function enemy(id='enemy',extra={}){return entity(id,{character:{},teamId:'b',x:500,...extra})}
function mode(e){return c.ModeStateService.current(e,ch.reactiveEquipment.stateKey,ch.reactiveEquipment.initial)}
function progress(e,index){return c.ProgressStateService.state(e,ch.reactiveEquipment.items[index].stateKey)?.value||0}
function signal(e,flag,key='enemy'){r.signal(e,{[flag]:true},key,clock);r.flush(e,clock);clock+=16}
function projectile(e,attack=ch.attacks.lmb,extra={}){return{source:e,attack,x:200,y:500,prevX:175,prevY:500,angle:0,vx:24,vy:0,radius:9,baseSpeed:24,travel:100,maxTravelDistance:attack.range,networkKey:'bullet',hitIds:new Set(),behavior:{},volley:{execution:c.AttackExecutionService.create(e,attack,0),hits:0,total:1,resolved:0,finished:false},...extra}}

function outboundHarness(){
 if(!c.ProjectileCollisionShapeService)load('src/projectiles/ProjectileCollisionShapeService.js','ProjectileCollisionShapeService');
 c.CollisionPolicyService={normalize:v=>v};c.ProjectileOrbitService={update:()=>false,config:()=>null};
 c.TargetPointProjectileService={arrival:()=>null,resolveWallCollision:()=>false};c.ProjectileTargetFilterService={allows:()=>true};
 c.RemoteProjectileHomingPresentationBufferService={syncCollision(){}};c.RemoteProjectileHomingPresentationService={clear(){}};
 c.ProjectileTetherMovementService={releaseProjectile(){}};c.ProjectileStateService={clear(){}};
 c.ProjectileImpactService={resolve(p,reason){p.testImpact=reason;return true;}};
 c.AttackGuardService.intercept=()=>false;c.AttackModuleService.onProjectileWallHit=()=>{};
 c.AugmentService.onProjectileResolved=()=>{};c.JustDodgeService={confirmProjectile:()=>false,canConfirm:()=>false,pointSegmentDistance:(x,y,ax,ay,bx,by)=>{const dx=bx-ax,dy=by-ay,q=dx*dx+dy*dy,t=q?Math.max(0,Math.min(1,((x-ax)*dx+(y-ay)*dy)/q)):0;return Math.hypot(x-ax-dx*t,y-ay-dy*t)}};
 c.ProjectileService.items.length=0;
}
function fired(e,attack=ch.attacks.lmb,extra={}){
 const p=projectile(e,attack,{x:100,prevX:100,travel:0,vx:300,vy:0,radius:14,behavior:{collisionPolicy:{passWalls:false,passEnemies:false}},...extra});c.ProjectileService.items.push(p);return p;
}

test('헤브 반격 범위 안의 각 대상에게 최초1회만 타격·프레임 중복 없음',()=>{outboundHarness();const e=reset(),a=enemy('A'),b=enemy('B');const p=projectile(e,ch.attacks.counter,{behavior:c.ProjectileModuleService.config(ch.attacks.counter),rehitInterval:0,rehitAt:new Map(),origin:{x:100,y:500}});assert.equal(c.ProjectileService.hitTarget(p,a),true);assert.equal(c.ProjectileService.hitTarget(p,b),true);clock+=999;assert.equal(c.ProjectileService.hitTarget(p,a),false);assert.equal(damage.length,2);clock++;assert.equal(c.ProjectileService.hitTarget(p,a),false);assert.equal(damage.length,2)});
test('헤브 반격 사거리750 이후 유지·벽 관통·실제 맵 경계에서 제거',()=>{outboundHarness();const e=reset();walls=[{x:1200,y:400,w:50,h:200}];const p=fired(e,ch.attacks.counter,{x:1100,prevX:1100,vx:2,vy:0,travel:1000,maxTravelDistance:750,expireAtRange:false,behavior:c.ProjectileModuleService.config(ch.attacks.counter)});c.ProjectileService.updateOutbound(p,0,1,clock);assert.equal(c.ProjectileService.items.length,1);assert.equal(p.x,1102);p.x=1999;p.prevX=1999;c.ProjectileService.updateOutbound(p,0,1,clock+16);assert.equal(c.ProjectileService.items.length,0)});
console.log(`PASS ${passed} Hab projectile regression groups`);
