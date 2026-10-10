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
function armor(e,n){e.maxHealth??=ch.maxHealth;c.ProgressStateService.apply(e,{stateKey:'erapabi-charge-armor',maxHealthRatio:2,operation:'set',value:e.maxHealth*n/100});}
function stored(e){return (c.ProgressStateService.state(e,'erapabi-charge-armor')?.value||0)/(e.maxHealth||ch.maxHealth)*100;}
function start(e){
 const ability=ch.abilities.rmb,ctx={source:e,ability,trigger:ability.trigger,attack:ch.attacks.megaLaserStart,now:clock,angle:0};
 if(c.TriggerModuleService.matches(ctx.trigger,'input.press',{...ctx,slot:'rmb'},()=>true))c.AbilityModuleService.run(ctx);
 return c.ChannelAttackService.state(e,'erapabi-mega-laser');
}
c.AttackWindupService.isTaggedAttackId=()=>false;c.AttackWindupService.contextAttackId=()=>ch.attacks.megaLaserStart.id;
c.AbilityAttackExecutionService={execute(ctx,a){ctx.executed=c.TriggeredAttackService.execute(ctx.source,a,ctx.angle);ctx.resolvedAttackId=a.id;return ctx.executed;}};
c.AbilityService.resolvedInputAttack=()=>ch.attacks.megaLaserStart;
c.AbilityService.attackById=(character,id)=>Object.values(character.attacks).find(a=>a.id===id);

test('평타 탄당50/2×2·버티기삭제·RMB 레이저 단일 스킬·기존반격 유지',()=>{
 assert.equal(ch.attacks.lmb.damageRatio*ch.baseDamage,40);assert.equal(ch.tooltipSkills[1].name,'레이저 건 아머');assert.equal(ch.tooltipSkills[2].key,'RMB');assert.equal(ch.tooltipSkills.length,4);
 assert.equal(ch.attacks.rmb,undefined);assert.equal(ch.attacks.rmbBurst,undefined);assert.equal(ch.abilities.rmb.attackId,ch.attacks.megaLaserStart.id);
 assert.equal(ch.attacks.lmb.modules[0].count,2);assert.equal(ch.attacks.lmb.modules[2].count,2);assert.equal(ch.attacks.counter.modules.filter(m=>m.type==='delivery.area').length,2);
});
test('체력100%피격=첫링100%·200%=상한·체력변화 참조·저회충전없음',()=>{
 for(const health of [1800,3600]){
  const e=entity({maxHealth:health});c.PassiveProgressRateService.update(e,clock);
  c.CharacterTriggerEffectService.run(e,'damage-received',{healthDamage:health,now:clock});assert.equal(stored(e),100);assert.equal(c.ProgressStateService.state(e,'erapabi-charge-armor').max,health*2);
  c.CharacterTriggerEffectService.run(e,'just-dodge',{now:clock});assert.equal(stored(e),100);
  c.CharacterTriggerEffectService.run(e,'damage-received',{healthDamage:health*3,now:clock});assert.equal(stored(e),200);
 }
});
test('실제 일반스킬모듈 0/99/100/150/200% 사용·시작시100%미만2배·고정소모',()=>{
 for(const initial of [0,99,100,150,200]){
  clock=1000;areas=[];const e=entity({maxHealth:1800});armor(e,initial);const state=start(e);assert.ok(state);assert.equal(state.drainAmount,initial<100?200:100);
  clock=1499;c.ChannelAttackService.update(e,clock);assert.equal(areas.length,0);
  clock=1500;c.ChannelAttackService.update(e,clock);
  if(initial===0){assert.equal(areas.length,0);assert.equal(c.ChannelAttackService.state(e,state.stateKey),null);continue;}
  assert.equal(areas.length,1);assert.equal(c.ProgressStateService.state(e,'erapabi-charge-armor').value,1800*initial/100-state.drainAmount);
  const fixed=state.drainAmount;armor(e,200);assert.equal(state.drainAmount,fixed);
  for(let i=0;i<40&&c.ChannelAttackService.state(e,state.stateKey);i++){clock+=40;c.ChannelAttackService.update(e,clock);}
  assert.equal(stored(e),0);assert.equal(c.ChannelAttackService.state(e,state.stateKey),null);assert.ok(e.cooldowns.has(ch.attacks.megaLaserStart.id));
 }
});
test('체력버프에서도100%비율 경계로 안정·불안정 선택',()=>{
 for(const pct of [99,100]){const e=entity({maxHealth:3600});armor(e,pct);const state=start(e);assert.equal(state.drainAmount,pct<100?200:100);}
});
console.log('PASS '+passed+' Erapabi laser groups');
