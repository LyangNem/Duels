/* 헤브 공통 발사/출혈/조건 회복/피격 확정 패킷 회귀. 브라우저/WebRTC 대체 아님. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');let clock=1000,passed=0,shots=[],areas=[],fields=[],burns=[];
const c=vm.createContext({console,Map,Set,WeakMap,WeakSet,Math,performance:{now:()=>clock},EMPTY_RUNTIME_ITEMS:[],EMPTY_AUGMENT_EFFECTS:[]});
function load(p,n){vm.runInContext(fs.readFileSync(path.join(root,p),'utf8')+`;globalThis.${n}=${n};`,c)}
function test(n,fn){shots=[];areas=[];fields=[];burns=[];clock=1000;fn();passed++;console.log('PASS '+n)}
for(const n of ['characterValue','characterCount','characterSum','characterProduct','freezeCharacterData','CHARACTER_RULES'])load('src/data/'+n+'.js',n);
c.CHARACTER_DATA={};for(const item of JSON.parse(fs.readFileSync(path.join(root,'src/data/characters/index.json'))).characters){const raw=vm.runInContext('('+fs.readFileSync(path.join(root,item.path),'utf8')+')',c);c.CHARACTER_DATA[raw.id]=raw}
load('src/data/CharacterDataService.js','CharacterDataService');const ch=c.CharacterDataService.compile('hab');
c.GAME_DATA={frameMs:1000/60};c.Training={sessionMode:'training'};c.OnlineDuelService={active:false};
c.AbilityService={attackById:(character,id)=>Object.values(character.attacks).find(a=>a.id===id),damageRatio:(character,a)=>a?.damageRatio||0};
c.EntitySimulationAuthorityService={isLocal:e=>e.local!==false};c.EntityService={items:new Map(),owner:e=>e};
c.RelationService={relation:(s,t)=>s===t?'self':s.teamId===t.teamId?'ally':'enemy',canTarget:(s,t)=>s.teamId!==t.teamId};
c.AugmentService={update(){},captureResourceConditionSnapshot:()=>null,prepareAttack:(s,a)=>a,attackCostMultiplier:()=>1};c.ProgressScaledAttackService={resolve:(s,a)=>a};
c.TagService={derivedModuleTags:()=>[],attackTags:a=>new Set(a.tags||[])};c.AttackPreviewService={fromAttack:(s,a,angle,until)=>({attack:a,angle,until})};
c.StaminaService={nominalBudget:e=>e.stamina,spend:(e,n)=>{if(e.stamina<n)return false;e.stamina-=n;return true}};
c.AttackResourceConditionService={capture:()=>null};c.COMBAT_BUFF_DEFS={evasionInvulnerable:{}};c.COMBAT_STATUS_DEFS={burn:{},bleed:{},evasionInvulnerable:{}};
c.BuffService={set:()=>true,remove:()=>true};c.CCService={removeSource(){},isDotImpact:()=>false};
c.EffectSpawnService={removeKey(){},ease:v=>v,definitionSnapshot:x=>JSON.parse(JSON.stringify(x))};
c.MovementService={travelDistance:(x,y,a,d)=>d,resolveEmbedded(){},finalizeForcedMotion(){},knockback:()=>true};
c.OnlinePresentationSyncService={send(){}};c.WorldGeometryService={wallAtPoint:()=>null,nearestWallTarget:()=>null};
c.ProjectileStateService={get:()=>null};c.ProjectileService={spawn:data=>{shots.push(data);c.AttackModuleService.onDelivery(data.source,data.attack,data.angle,data.volley?.execution);return data}};
c.AreaAttackService={execute:(s,a,angle,m,v,options)=>{areas.push({s,a,angle,m,v,options});c.AttackModuleService.onDelivery(s,a,angle,v?.execution);return true}};
c.InstalledAreaFieldService={KIND:'installed-area-field',containmentTravelDistance:(e,a,d)=>d,baseKey:m=>m.stateKey,activatePoint:(s,m,p,o)=>{const v={s,m,p,o};fields.push(v);return v}};
for(const [p,n]of [['src/core/GameEvents.js','GameEvents'],['src/core/TriggerConditionService.js','TriggerConditionService'],['src/core/TriggerModuleService.js','TriggerModuleService'],['src/core/ArcTrajectoryService.js','ArcTrajectoryService'],['src/core/CollisionPolicyService.js','CollisionPolicyService'],['src/combat/AttackExecutionService.js','AttackExecutionService'],['src/combat/AttackModuleService.js','AttackModuleService'],['src/projectiles/ProjectileModuleService.js','ProjectileModuleService'],['src/projectiles/ProjectileImpactService.js','ProjectileImpactService'],['src/projectiles/TargetPointProjectileService.js','TargetPointProjectileService'],['src/combat/TriggeredAttackService.js','TriggeredAttackService'],['src/combat/CounterModuleService.js','CounterModuleService'],['src/abilities/MovementAbilityService.js','MovementAbilityService'],['src/abilities/ChargedAttackService.js','ChargedAttackService'],['src/ui/CharacterDescriptionService.js','CharacterDescriptionService']])load(p,n);
load('src/core/ModeStateService.js','ModeStateService');
c.CombatStatusApplicationService={apply:ctx=>{burns.push(ctx);return true}};
function entity(extra={}){return{id:'hab',teamId:'A',kind:'player',character:ch,baseDamage:ch.baseDamage,alive:true,local:true,x:400,y:500,radius:20,stamina:1000,maxStamina:1000,actionState:new Map(),cooldowns:new Map(),statuses:new Map(),buffs:new Map(),...extra}}
const originalMovement=c.MovementAbilityService;
c.MovementAbilityService={...originalMovement,applyBuffs(){},clearBuffs(){},spawnEffects:()=>[],broadcastEffects(){}};
c.AttackService={canUse:(e,a)=>e.stamina>=a.cost,execute:(s,a,angle)=>c.TriggeredAttackService.execute(s,a,angle)};

let effects=[];c.EffectSpawnService.shouldPresentAttack=()=>true;c.EffectSpawnService.spawn=(spec,context)=>{effects.push({spec,context});return spec};c.EffectSpawnService.presentationSnapshot=x=>x;load('src/core/ColorService.js','ColorService');
c.NeutralizingKnockbackService={start:args=>{moves.push(args);return true}};
let moves=[];c.MovementService.knockback=(...args)=>{moves.push(args);return true};
c.CCService={...c.CCService,has:(e,status,now=clock)=> (e.statuses.get(status)||[]).some(v=>v.end>now),isDotImpact:i=>i?.dot===true||i?.type==='status'};
c.CombatStatusApplicationService={apply:ctx=>{burns.push(ctx);ctx.target.statuses.set(ctx.type,[{end:clock+ctx.duration}]);return true}};
c.AugmentEffectModuleService={runTrigger(){}};c.AugmentService.onConfirmedDamageDealt=()=>{};
for(const [p,n]of [['src/core/ResourceValueService.js','ResourceValueService'],['src/core/ModuleValueService.js','ModuleValueService'],['src/combat/StaminaService.js','StaminaService'],['src/render/ResourceRestoreEffectService.js','ResourceRestoreEffectService'],['src/render/CharacterTriggerEffectService.js','CharacterTriggerEffectService'],['src/network/NetworkHitAuthorityService.js','NetworkHitAuthorityService']])load(p,n);
function hit(s,t,a=ch.attacks.lmb,extra={}){return c.CharacterTriggerEffectService.run(s,'damage-dealt',{source:s,target:t,attack:a,execution:c.AttackExecutionService.create(s,a,0),impact:{type:'projectile'},amount:200,now:clock,...extra})}
function bleeding(t){t.statuses.set('bleed',[{end:clock+1000}]);return t}

for(const [p,n]of [['src/abilities/AbilityService.js','AbilityService'],['src/abilities/AbilityModuleService.js','AbilityModuleService'],['src/core/ProgressStateService.js','ProgressStateService'],['src/core/RuntimeValueReferenceProviders.js','RuntimeValueReferenceProviders'],['src/core/RuntimeValueReferenceService.js','RuntimeValueReferenceService'],['src/data/WEAPON_IMAGE_DEFS.js','WEAPON_IMAGE_DEFS'],['src/render/ModeGearPresentationService.js','ModeGearPresentationService']])load(p,n);
load('src/core/InstalledAreaFieldService.js','InstalledAreaFieldService');
const intu=c.CharacterDataService.compile('intu'),siro=c.CharacterDataService.compile('siro'),reika=c.CharacterDataService.compile('reika'),phase=c.CharacterDataService.compile('phase');
function gun(extra={}){const e=entity({character:intu,baseDamage:intu.baseDamage,...extra});c.ProgressStateService.apply(e,{stateKey:'intu-ammo',operation:'set',value:7,max:12,initial:12});return e}
function fire(e,a){c.TriggeredAttackService.execute(e,a,0)}
function selected(e,slot){return c.AbilityService.resolvedInputAttack(e,e.character.abilities[slot])}

const tau=c.CharacterDataService.compile('tau'),e=entity({character:tau}),t=entity({id:'enemy',teamId:'B',x:850,y:620}),a=tau.attacks.rmb,ex=c.AttackExecutionService.create(e,a,0);ex.projectileImpactPoint={x:800,y:600};c.ProjectileStateService={get:()=>null};c.AttackModuleService.onHit(e,t,a,{execution:ex},0,{phase:'outbound'});const state=e.actionState.get('movement:move');assert.ok(state);assert.equal(state.distance,Math.hypot(800-e.x,600-e.y));console.log('PASS Tau move after removed projectile');

// Actual outbound update: boundary contact moves Tau and removes the projectile without returning.
load('src/projectiles/ProjectileService.js','ProjectileService');
c.WorldBoundsService={width:()=>2000,height:()=>2000};
c.WorldGeometryService={...c.WorldGeometryService,boundaryRayDistance:(x,y,angle,length,pad)=>{const dx=Math.cos(angle),dy=Math.sin(angle);return Math.min(length,dx>1e-8?(2000-pad-x)/dx:dx<-1e-8?(pad-x)/dx:Infinity,dy>1e-8?(2000-pad-y)/dy:dy<-1e-8?(pad-y)/dy:Infinity)},raycastDistance:(x,y,a,d)=>d};
c.ProjectileOrbitService={update:()=>false,config:()=>null};
c.AttackGuardService={intercept:()=>false};
c.TargetPointProjectileService={arrival:()=>null};
c.ProjectileCollisionShapeService={};
c.ProjectileTetherMovementService={releaseProjectile(){}};c.RemoteProjectileHomingPresentationService={clear(){}};c.ProjectileImpactService={resolve:()=>true};c.AugmentService.onProjectileResolved=()=>{};
c.RemoteProjectileHomingPresentationBufferService={syncCollision(){}};
for(const [x,y,angle,endX,endY] of [[1970,1000,0,1988,1000],[30,1000,Math.PI,12,1000],[1000,1970,Math.PI/2,1000,1988],[1000,30,-Math.PI/2,1000,12],[1970,1970,Math.PI/4,1988,1988]]){
 const source=entity({character:tau,x,y}),execution=c.AttackExecutionService.create(source,a,angle);
 const p={source,attack:a,x,y,prevX:x,prevY:y,angle,vx:Math.cos(angle)*50,vy:Math.sin(angle)*50,radius:12,travel:0,maxTravelDistance:650,behavior:c.ProjectileModuleService.config(a),volley:{execution},hitIds:new Set()};
 c.ProjectileStateService={get:()=>p,clear(){assert.ok(source.actionState.get('movement:move'));},beginReturn:()=>assert.fail('boundary must not return')};
 c.ProjectileService.items=[p];
 c.ProjectileService.updateOutbound(p,0,1,clock);
 assert.equal(c.ProjectileService.items.length,0);assert.equal(p.behavior.returning.phase,'outbound');assert.ok(Math.abs(p.x-endX)<1e-6);assert.ok(Math.abs(p.y-endY)<1e-6);
 const move=source.actionState.get('movement:move');assert.ok(Math.abs(move.distance-Math.hypot(endX-x,endY-y))<1e-6);
}
console.log('PASS Tau boundary contact movement: four edges and corner, no return');

assert.equal(c.ProjectileModuleService.config({modules:[{type:'projectile.return',returnAtRange:true}]}).returning.returnAtBoundary,true);
assert.equal(c.ProjectileModuleService.config(a).returning.returnAtRange,true);
console.log('PASS ordinary range return preserved and boundary override independent');
