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

// Reproduce remote interpolation contact without a target-authoritative hit.
c.OnlineParticipantEntityService={pid:e=>e?.id,entity:id=>c.EntityService.items.get(id)};
c.SoundService={play(){}};c.Presentation={damageNumber(){}};c.GAME_DATA.cameraFeedback={strongDamage:500};
c.JustDodgeService={confirmProjectile:()=>false,canConfirm:()=>false,pointSegmentDistance(x,y,x1,y1,x2,y2){const dx=x2-x1,dy=y2-y1,l=dx*dx+dy*dy,t=l?Math.max(0,Math.min(1,((x-x1)*dx+(y-y1)*dy)/l)):0;return Math.hypot(x-x1-dx*t,y-y1-dy*t)}};
load('src/projectiles/ProjectileCollisionShapeService.js','ProjectileCollisionShapeService');load('src/projectiles/ProjectileTargetFilterService.js','ProjectileTargetFilterService');
c.NetworkCollisionPositionService={point:e=>e};
c.AttackHitTriggerService={damage:context=>c.NetworkHitAuthorityService.prediction(context)};
c.Training.sessionMode='online';c.Training.player=null;c.OnlineDuelService.active=true;c.OnlineDuelService.roundToken=7;
function movingContact(predict){
 const source=entity({id:'tau-player',character:tau,x:100,y:500}),target=entity({id:'moving-enemy',teamId:'B',local:false,x:610,y:500});
 const attack={...a,modules:a.modules.map(m=>m.type==='delivery.projectile'?{...m,predictiveConsumeOnContact:predict}:m)};
 const execution=c.AttackExecutionService.create(source,attack,0);
 const projectile={source,attack,x:582,y:500,prevX:560,prevY:500,angle:0,vx:22,vy:0,radius:12,travel:482,maxTravelDistance:650,behavior:c.ProjectileModuleService.config(attack),volley:{execution,hits:0,total:1,resolved:0},hitIds:new Set(),predictiveConsumeOnContact:predict,networkKey:'tau-shot'};
 const service={...c.ProjectileService,items:[projectile],contactOrder:()=>[target],finish(){}};
 assert.equal(service.processTargets(projectile,0,clock),predict?true:null);
 assert.equal(service.items.length,predict?0:1);assert.equal(source.actionState.get('movement:move'),undefined);
 return {source,target,projectile,execution,service};
}
movingContact(true);const kept=movingContact(a.modules[0].predictiveConsumeOnContact);assert.equal(kept.projectile.hadHit,undefined);
console.log('PASS Tau old prediction-only contact disappears without move; new attack preserves projectile until confirmation');

// Delayed confirmation can arrive after the shot returns or has already been removed.
c.EntityService.items=new Map([[kept.source.id,kept.source],[kept.target.id,kept.target]]);c.ProjectileService.items=[];
c.ProjectileStateService={get:()=>null};
const packet={roundToken:7,attackerPid:kept.source.id,targetPid:kept.target.id,sourceEntityId:kept.source.id,targetEntityId:kept.target.id,attackId:a.id,executionSequence:kept.execution.sequence,amount:150,impactType:'projectile',impactPhase:'outbound',impactX:578,impactY:500,directionAngle:0,impactMeta:{projectileKey:'tau-shot'}};
assert.equal(c.NetworkHitAuthorityService.receive(kept.target.id,packet),true);const dash=kept.source.actionState.get('movement:move');assert.ok(dash);assert.equal(dash.distance,478);assert.equal(dash.duration,420);assert.equal(dash.angle,0);
assert.equal(c.NetworkHitAuthorityService.receive(kept.target.id,packet),true);assert.equal(kept.source.actionState.get('movement:move'),dash);
console.log('PASS Tau actual delayed hit-confirmed restores movement to impact coordinate after projectile removal; duplicate packet does not restart');


// Actual online confirmation and production event bindings, including hidden targets and duplicate packets.
load('src/core/IdeaModuleService.js','IdeaModuleService');c.ReactiveEquipmentService={damage(){},behindWall:()=>false};c.ProjectileRedirectSyncService={broadcast(){},relay(){}};
load('src/projectiles/ProjectileHomingTargetVisibilityService.js','ProjectileHomingTargetVisibilityService');
vm.runInContext(fs.readFileSync(path.join(root,'src/core/initialization-equipment.js'),'utf8'),c);
const geopin=c.CharacterDataService.compile('geopin');c.StealthPresentationService={active:e=>e.hidden===true,state:()=>({detected:false})};
function idea(e){return c.ProgressStateService.state(e,geopin.ideaModules.stateKey)?.value||0}
for(const hidden of [true,false]){
 const source=entity({id:'geopin-source-'+hidden,character:geopin,x:100,y:500}),target=entity({id:'hidden-target-'+hidden,teamId:'B',local:false,hidden,x:300,y:500});c.EntityService.items=new Map([[source.id,source],[target.id,target]]);c.Training.player=null;const attack=geopin.attacks.lmb,execution=c.AttackExecutionService.create(source,attack,0);
 const confirmed={roundToken:7,attackerPid:source.id,targetPid:target.id,sourceEntityId:source.id,targetEntityId:target.id,attackId:attack.id,executionSequence:execution.sequence,hitSequence:1,amount:150,displayAmount:0,impactType:'projectile',impactPhase:'outbound'};
 // Before the fix, receiver-side damage cannot mutate the attacker's remote mirror and hidden presence grants nothing.
 assert.equal(c.ProjectileHomingTargetVisibilityService.canPerceive(source,target),!hidden);source.local=false;c.GameEvents.emit('damage-applied',{source,target,attack,amount:150,now:clock});assert.equal(idea(source),0);source.local=true;
 assert.equal(c.NetworkHitAuthorityService.receive(target.id,confirmed),true);assert.equal(idea(source),.1);
 assert.equal(c.NetworkHitAuthorityService.receive(target.id,confirmed),true);assert.equal(idea(source),.1);
 assert.equal(c.NetworkHitAuthorityService.receive(target.id,{...confirmed,amount:0,hitSequence:2}),true);assert.equal(idea(source),.1);
 const next=c.AttackExecutionService.create(source,attack,0);assert.equal(c.NetworkHitAuthorityService.receive(target.id,{...confirmed,executionSequence:next.sequence,hitSequence:3}),true);assert.equal(idea(source),.2);
 target.kind='summon';const summonHit=c.AttackExecutionService.create(source,attack,0);assert.equal(c.NetworkHitAuthorityService.receive(target.id,{...confirmed,executionSequence:summonHit.sequence,hitSequence:4}),true);assert.equal(idea(source),.2);
 target.kind='player';source.local=false;const remoteHit=c.AttackExecutionService.create(source,attack,0);assert.equal(c.NetworkHitAuthorityService.receive(target.id,{...confirmed,executionSequence:remoteHit.sequence,hitSequence:5}),true);assert.equal(idea(source),.2);
}
console.log('PASS Geopin actual online receive: hidden/visible target grants10% per hit, duplicate/zero damage/summon/remote owner grant0');

// Dodge during every movement adds protection while the existing ability continues.
{
load('src/combat/EntityDodgeService.js','EntityDodgeService');c.Training.sessionMode='training';c.OnlineDuelService.active=false;
c.AugmentService.staminaHealthFallbackRatio=()=>0;c.GAME_DATA.dodge={cost:200,dist:119,speed:20,dur:130,justWindow:80};c.ChannelAttackService={locksAction:()=>false};c.AugmentDodgeSequenceService={ready:()=>true,begin(){},finishSegment(){}};c.NaturalHealthRegenActivityService={mark(){}};c.JustDodgeService.begin=()=>{};c.RecordDodgePresentationService={begin(){}};c.CombatStatsService={current:()=>({dodgeDistanceMult:1,dodgeSpeedMult:1})};let dodgeMotions=0;c.MovementService.startMotion=()=>{dodgeMotions++;return true};
for(const module of [tau.attacks.rmb.modules.find(m=>m.type==='movement.move'&&m.when==='on-projectile-outbound-hit'),tau.attacks.rmb.modules.find(m=>m.type==='movement.move'&&m.when==='on-projectile-wall-hit'),{type:'movement.move',distance:100,duration:420}]){
 const source=entity({id:'movement-dodge',character:tau,x:100,y:100});assert.equal(c.MovementAbilityService.start(source,module,0,{runtimeDistance:500}),true);const state=c.MovementAbilityService.state(source);
 source.stamina=0;assert.equal(c.EntityDodgeService.activate(source,{x:0,y:1}),false);assert.equal(c.MovementAbilityService.state(source),state);source.stamina=1000;const before=dodgeMotions;
 assert.equal(c.EntityDodgeService.activate(source,{x:0,y:1}),true);assert.equal(source.stamina,800);assert.equal(source.invincibleUntil,clock+80);assert.equal(source.dodgeUntil,clock+130);assert.equal(c.MovementAbilityService.state(source),state);assert.equal(dodgeMotions,before);const oldX=source.x;c.MovementAbilityService.update(source,clock+100,100,null);assert.ok(source.x>oldX);assert.equal(source.y,100);
}
const source=entity({id:'tau-serialized',character:tau}),module=tau.attacks.rmb.modules.find(m=>m.type==='movement.move');c.MovementAbilityService.start(source,module,0,{runtimeDistance:300});const snap=c.MovementAbilityService.serialize(source,clock);const remote=entity({id:'remote-dodge',character:tau,local:false});c.Training.sessionMode='online';c.MovementAbilityService.applyRemote(remote,JSON.parse(JSON.stringify(snap)),clock);const state=remote._remoteMovementEffectState;const before=dodgeMotions;assert.equal(c.EntityDodgeService.activate(remote,{x:0,y:1},{spend:false}),true);assert.equal(remote._remoteMovementEffectState,state);assert.equal(dodgeMotions,before);assert.equal(remote.invincibleUntil,clock+80);c.Training.sessionMode='training';
const normal=entity({id:'normal-dodge',character:tau});assert.equal(c.EntityDodgeService.activate(normal,{x:1,y:0}),true);assert.equal(dodgeMotions,before+1);
console.log('PASS All movement dodge: protection only; actual movement continues, failed cost preserves move, peer replay retains path, normal dodge still moves');
}
