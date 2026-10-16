/* 미아루키 실제 공구함 배치 회복·비적대 대상·중복 방지 회귀. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');let clock=1000,passed=0,shots=[],areas=[],fields=[],burns=[];
const c=vm.createContext({console,Map,Set,WeakMap,WeakSet,Math,performance:{now:()=>clock},EMPTY_RUNTIME_ITEMS:[],EMPTY_AUGMENT_EFFECTS:[]});
function load(p,n){vm.runInContext(fs.readFileSync(path.join(root,p),'utf8')+`;globalThis.${n}=${n};`,c)}
function test(n,fn){shots=[];areas=[];fields=[];burns=[];clock=1000;fn();passed++;console.log('PASS '+n)}
for(const n of ['characterValue','characterCount','characterSum','characterProduct','freezeCharacterData','CHARACTER_RULES'])load('src/data/'+n+'.js',n);
c.CHARACTER_DATA={};for(const item of JSON.parse(fs.readFileSync(path.join(root,'src/data/characters/index.json'))).characters){const raw=vm.runInContext('('+fs.readFileSync(path.join(root,item.path),'utf8')+')',c);c.CHARACTER_DATA[raw.id]=raw}
load('src/data/CharacterDataService.js','CharacterDataService');const ch=c.CharacterDataService.compile('miaruky');
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
load('src/world/AreaGeometryService.js','AreaGeometryService');
c.OnlinePresentationSyncService={send(){}};c.WorldGeometryService={wallAtPoint:()=>null,nearestWallTarget:()=>null,raycastDistance:(x,y,a,d)=>d,segmentBlocked:()=>false};
c.ProjectileStateService={get:()=>null};c.ProjectileService={items:[],spawn:data=>{shots.push(data);c.AttackModuleService.onDelivery(data.source,data.attack,data.angle,data.volley?.execution);return data}};
c.AreaAttackService={execute:(s,a,angle,m,v,options)=>{areas.push({s,a,angle,m,v,options});return true}};
c.InstalledAreaFieldService={KIND:'installed-area-field',containmentTravelDistance:(e,a,d)=>d,baseKey:m=>m.stateKey,activatePoint:(s,m,p,o)=>{const v={s,m,p,o};fields.push(v);return v}};
for(const [p,n]of [['src/core/GameEvents.js','GameEvents'],['src/core/TriggerConditionService.js','TriggerConditionService'],['src/core/TriggerModuleService.js','TriggerModuleService'],['src/core/ArcTrajectoryService.js','ArcTrajectoryService'],['src/core/CollisionPolicyService.js','CollisionPolicyService'],['src/combat/AttackExecutionService.js','AttackExecutionService'],['src/combat/AttackModuleService.js','AttackModuleService'],['src/projectiles/ProjectileModuleService.js','ProjectileModuleService'],['src/projectiles/ProjectileImpactService.js','ProjectileImpactService'],['src/projectiles/TargetPointProjectileService.js','TargetPointProjectileService'],['src/combat/TriggeredAttackService.js','TriggeredAttackService'],['src/combat/CounterModuleService.js','CounterModuleService'],['src/abilities/MovementAbilityService.js','MovementAbilityService'],['src/abilities/ChargedAttackService.js','ChargedAttackService'],['src/ui/CharacterDescriptionService.js','CharacterDescriptionService']])load(p,n);
load('src/core/ModeStateService.js','ModeStateService');
c.CombatStatusApplicationService={apply:ctx=>{burns.push(ctx);return true}};
function entity(extra={}){return{id:'source',teamId:'A',kind:'player',character:ch,baseDamage:ch.baseDamage,alive:true,local:true,x:400,y:500,radius:20,stamina:1000,maxStamina:1000,actionState:new Map(),abilityPending:new Map(),cooldowns:new Map(),statuses:new Map(),buffs:new Map(),...extra}}
const originalMovement=c.MovementAbilityService;
c.MovementAbilityService={...originalMovement,applyBuffs(){},clearBuffs(){},spawnEffects:()=>[],broadcastEffects(){}};
c.AttackService={canUse:(e,a)=>e.stamina>=a.cost,execute:(s,a,angle)=>c.TriggeredAttackService.execute(s,a,angle)};


load('src/projectiles/ProjectileTargetFilterService.js','ProjectileTargetFilterService');
load('src/core/TimedActionStateService.js','TimedActionStateService');
load('src/core/SimulationScheduleService.js','SimulationScheduleService');
load('src/combat/SelectableAttackService.js','SelectableAttackService');
load('src/abilities/AbilityService.js','AbilityService');
load('src/abilities/AbilityModuleService.js','AbilityModuleService');
load('src/abilities/AbilityAttackExecutionService.js','AbilityAttackExecutionService');
c.TagService.attackTags=a=>new Set(a.tags||[]);
c.EffectSpawnService.shouldPresentAttack=()=>true;c.EffectSpawnService.spawn=x=>x;
c.EffectSpawnService.presentationSnapshot=x=>x;
c.COMBAT_STATUS_DEFS.bind={};c.CCService.has=()=>false;
const guards=[],healers=[];
c.AttackGuardService={activate:(...args)=>guards.push(args)};
c.NaturalHealthRegenActivityService={startNow:t=>healers.push(t)};
c.AttackService.execute=(e,a,angle,o={})=>{if(e.stamina<a.cost)return false;e.stamina-=a.cost;return c.TriggeredAttackService.execute(e,a,angle,{broadcast:false,...o})};
c.AttackService.previewReady=(e,a,now,resource=false)=>!resource||e.stamina>=a.cost;
c.AttackWindupService={isContextWindup:()=>false};

c.NetworkCollisionPositionService={point:e=>e};c.NetworkHitAuthorityService={targetAuthoritative:e=>e.local!==false};c.TagService.hasAttack=()=>false;c.HitScanGeometryService={effectiveModule:(s,a,m)=>m};load('src/combat/AreaAttackService.js','AreaAttackService');
test('미아루키 배치 넉백 제거·아군200회복·공구함/근거리176 동기화',()=>{
 const ch=c.CharacterDataService.compile('miaruky'),a=ch.attacks.toolboxDeployKnockback;
 assert.equal(ch.summons.toolbox.maxHealth,400);assert.equal(ch.summons.toolbox.respawnHealth,400);assert.equal(ch.summons.toolbox.fieldArea.interval,250);assert.equal(ch.summons.toolbox.fieldArea.onTrigger[0].value,40);
 assert.equal(ch.attacks.lmbMelee.range,176);assert.equal(ch.summons.toolbox.fieldArea.range,176);assert.equal(ch.worldGaugeModules[0].range,176);assert.equal(a.range,176);
 assert.equal(a.modules.some(m=>m.type==='movement.knockback'),false);assert.equal(ch.baseDamage*ch.attacks.counter.damageRatio,200);
 const source=entity({id:'toolbox',kind:'summon',character:ch,health:400,maxHealth:400,x:400,y:500}),ally=entity({id:'heal-ally',character:ch,health:300,maxHealth:1000,x:450,y:500}),enemy=entity({id:'heal-enemy',character:ch,teamId:'B',health:300,maxHealth:1000,x:450,y:500}),outside=entity({id:'heal-outside',character:ch,health:300,maxHealth:1000,x:1000,y:500});
 c.EntityService.items=new Map([source,ally,enemy,outside].map(e=>[e.id,e]));const old=c.ResourceRestoreEffectService,oldSound=c.SoundService;const calls=[];
 c.ResourceRestoreEffectService={apply:ctx=>{calls.push(ctx.target.id);ctx.target.health=Math.min(ctx.target.maxHealth,ctx.target.health+ctx.module.amount);return true}};c.SoundService={play(){}};
 const execution=c.AttackExecutionService.create(source,a,0),volley={execution,hits:0};const module=a.modules.find(m=>m.type==='delivery.area'&&m.applyHitEffects);
 c.AreaAttackService.execute(source,a,0,module,volley);c.AreaAttackService.execute(source,a,0,module,volley);
 assert.equal(ally.health,500);assert.equal(enemy.health,300);assert.equal(outside.health,300);assert.equal(calls.filter(id=>id===ally.id).length,1);
 c.ResourceRestoreEffectService=old;c.SoundService=oldSound;
});
console.log('PASS toolbox gameplay regression');
