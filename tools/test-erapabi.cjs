/* 실제 캐릭터와 공통 차징/전달/착탄/이동/장판 경로 회귀. 브라우저/WebRTC 대체 아님. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');let clock=1000,passed=0,shots=[],areas=[],fields=[],burns=[];
const c=vm.createContext({console,Map,Set,WeakMap,WeakSet,Math,performance:{now:()=>clock},EMPTY_RUNTIME_ITEMS:[],EMPTY_AUGMENT_EFFECTS:[]});
function load(p,n){vm.runInContext(fs.readFileSync(path.join(root,p),'utf8')+`;globalThis.${n}=${n};`,c)}
function test(n,fn){shots=[];areas=[];fields=[];burns=[];clock=1000;fn();passed++;console.log('PASS '+n)}
for(const n of ['characterValue','characterCount','characterSum','characterProduct','freezeCharacterData','CHARACTER_RULES'])load('src/data/'+n+'.js',n);
c.CHARACTER_DATA={};for(const item of JSON.parse(fs.readFileSync(path.join(root,'src/data/characters/index.json'))).characters){const raw=vm.runInContext('('+fs.readFileSync(path.join(root,item.path),'utf8')+')',c);c.CHARACTER_DATA[raw.id]=raw}
load('src/data/CharacterDataService.js','CharacterDataService');const ch=c.CharacterDataService.compile('erapabi');
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

load('src/core/COMBAT_BUFF_DEFS.js','COMBAT_BUFF_DEFS');load('src/core/BuffService.js','BuffService');load('src/combat/ModifierLimitService.js','ModifierLimitService');
load('src/core/RuntimeValueReferenceProviders.js','RuntimeValueReferenceProviders');load('src/core/RuntimeValueReferenceService.js','RuntimeValueReferenceService');
load('src/abilities/ChannelAttackService.js','ChannelAttackService');
load('src/abilities/AbilityModuleService.js','AbilityModuleService');
load('src/combat/JustDodgeService.js','JustDodgeService');
c.TagService.effectTags=()=>[];
c.GAME_DATA.dodge={justWindow:80};c.GAME_DATA.counter={window:1000};
c.CounterStockService={acquire(){}};c.AugmentEffectModuleService={runTrigger(){}};
vm.runInContext(fs.readFileSync(path.join(root,'src/core/initialization-120.js'),'utf8'),c);
function armor(e,n){c.ProgressStateService.apply(e,{stateKey:'erapabi-charge-armor',max:7200,operation:'set',value:n*72});}
function stored(e){return c.ProgressStateService.state(e,'erapabi-charge-armor')?.value/72||0;}
function start(e){
 const ability=ch.abilities.rmb,ctx={source:e,ability,trigger:ability.trigger,attack:ch.attacks.megaLaserStart,now:clock,angle:0};
 if(c.TriggerModuleService.matches(ctx.trigger,'input.press',{...ctx,slot:'rmb'},()=>true))c.AbilityModuleService.run(ctx);
 return c.ChannelAttackService.state(e,'erapabi-mega-laser');
}
c.AttackWindupService.isTaggedAttackId=()=>false;c.AttackWindupService.contextAttackId=()=>ch.attacks.megaLaserStart.id;
c.AbilityAttackExecutionService={execute(ctx,a){ctx.executed=c.TriggeredAttackService.execute(ctx.source,a,ctx.angle);ctx.resolvedAttackId=a.id;return ctx.executed;}};
c.AbilityService.resolvedInputAttack=()=>ch.attacks.megaLaserStart;
c.AbilityService.attackById=(character,id)=>Object.values(character.attacks).find(a=>a.id===id);
test('리메이크 전 원문 복구·칭호/색/피격충전·스킬 분기·영구성장 없음',()=>{
 assert.equal(ch.title,'파비 빔!!!!!!!!!!!!!!!!!!!!');assert.equal(ch.maxHealth,1800);assert.equal(ch.color,'#38bdf8');assert.equal(ch.dodge,undefined);
 assert.equal(ch.triggers[0].event,'damage-received');assert.equal(ch.attacks.counter.modules.filter(m=>m.type==='delivery.area').length,2);
 assert.equal(ch.attacks.counter.modules.some(m=>m.type==='state.progress'),false);assert.equal(ch.attacks.rmbBurst.range,200);
});
test('실제 피격 피해 저장·20%가 아닌 체력기준4배상한·저회 충전 없음',()=>{
 const e=entity({maxHealth:1800});c.CharacterTriggerEffectService.run(e,'damage-received',{healthDamage:900,now:clock});
 let state=c.ProgressStateService.state(e,'erapabi-charge-armor');assert.equal(state.value,900);assert.equal(state.max,7200);
 c.CharacterTriggerEffectService.run(e,'just-dodge',{now:clock});assert.equal(state.value,900);
 c.CharacterTriggerEffectService.run(e,'damage-received',{healthDamage:9000,now:clock});assert.equal(state.value,7200);
 c.JustDodgeService.begin(e,clock);assert.equal(e.justCheck.expiresAt-clock,80);
});
test('버티기·충전레이저 원래 조건과 방어/넉백·레이저 소모/고갈',()=>{
 const e=entity({maxHealth:1800});const modules=ch.abilities.rmb.trigger.modules;
 const branch=modules.find(m=>m.type==='action.attack').alternateWhen.conditions[0];
 armor(e,49);assert.equal(c.TriggerConditionService.matches(branch,{source:e,now:clock}),false);
 armor(e,50);assert.equal(c.TriggerConditionService.matches(branch,{source:e,now:clock}),true);
 const defense=modules.find(m=>m.type==='modifier.set');assert.equal(defense.stat,'defense');assert.equal(defense.value,.5);assert.equal(defense.duration,3000);
 const channel=modules.find(m=>m.type==='channel.attack');armor(e,50);assert.equal(c.ChannelAttackService.start(e,channel,0,clock),true);
 clock+=500;c.ChannelAttackService.update(e,clock);assert.equal(c.ProgressStateService.state(e,'erapabi-charge-armor').value,3500);
 for(let i=0;i<40&&c.ChannelAttackService.state(e,channel.stateKey);i++){clock+=40;c.ChannelAttackService.update(e,clock);}
 assert.equal(c.ChannelAttackService.state(e,channel.stateKey),null);assert.equal(stored(e),0);
});
console.log('PASS '+passed+' Erapabi rollback groups');
