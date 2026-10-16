/* Actual action.attack -> AbilityAttackExecution -> AttackService; mocked projectile delivery, not browser. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');let now=1000,costRatio=1,delivered=0,rides=0,exits=0;
const c=vm.createContext({console,Map,Set,WeakMap,Math,performance:{now:()=>now},EMPTY_RUNTIME_ITEMS:[]});
function load(p,n){vm.runInContext(fs.readFileSync(path.join(root,p),'utf8')+';globalThis.'+n+'='+n,c)}
for(const n of ['characterValue','characterCount','characterSum','characterProduct','freezeCharacterData','CHARACTER_RULES'])load('src/data/'+n+'.js',n);
c.CHARACTER_DATA={nare:vm.runInContext('('+fs.readFileSync(path.join(root,'src/data/characters/nare.js'),'utf8')+')',c)};
load('src/data/CharacterDataService.js','CharacterDataService');const ch=c.CharacterDataService.compile('nare');
c.Training={};c.EntitySimulationAuthorityService={isLocal:()=>true};c.CombatStatsService={current:()=>({canAct:true})};c.AbilityService={attackById:(ch,id)=>Object.values(ch.attacks).find(a=>a.id===id)};
c.TagService={attackTags:()=>new Set()};c.AugmentService={update(){},prepareAttack:(e,a)=>({...a,cost:a.cost*costRatio})};c.ProgressScaledAttackService={resolve:(e,a)=>a};c.AttackFeatureTransformService={prepare:(e,a)=>a};c.AugmentEffectModuleService={runTrigger:()=>null};c.WallOverlapAttackDeferService={shouldDefer:()=>false};c.NaturalHealthRegenActivityService={mark(){}};
c.StaminaService={canSpend:(e,n)=>e.stamina>=n,spend:(e,n)=>{if(e.stamina<n)return false;e.stamina-=n;return true}};c.AttackExecutionService={create:(e)=>({sequence:++e.attackSequence})};
c.AttackModuleService={type:m=>m.type,deliveryCount:()=>1,deliver:(e,a)=>{delivered++;if(a.id===ch.attacks.rmb.id)e.actionState.set('nare-rmb-plane',{kind:'projectile'})},afterAttack(){}};c.GameEvents={emit(){}};
c.ProjectileRideService={start:e=>{rides++;e.actionState.set('projectile-ride',{kind:'ride'});return true},finish:e=>{exits++;e.actionState.delete('projectile-ride');return true}};
for(const [p,n]of [['src/core/TriggerConditionService.js','TriggerConditionService'],['src/core/TriggerModuleService.js','TriggerModuleService'],['src/combat/AttackService.js','AttackService'],['src/abilities/AbilityAttackExecutionService.js','AbilityAttackExecutionService'],['src/abilities/AbilityModuleService.js','AbilityModuleService']])load(p,n);
function entity(stamina){const e={id:'nare',character:ch,alive:true,stamina,actionState:new Map(),cooldowns:new Map(),attackSequence:0,x:0,y:0};c.Training.player=e;return e}
function press(e,legacy=false){let trigger=ch.abilities.rmb.trigger;if(legacy){trigger=JSON.parse(JSON.stringify(trigger));trigger.modules[0].fallbackConditions.push({type:'resource.gte',resource:'stamina',value:1200})}const ctx={source:e,ability:ch.abilities.rmb,attack:ch.attacks.rmb,trigger,event:'input.press',inputSlot:'rmb',now,angle:0,usageTags:new Set()};assert.equal(c.TriggerModuleService.matches(trigger,ctx.event,ctx),true);c.AbilityModuleService.run(ctx);return ctx}
assert.equal(ch.attacks.rmb.cost,400);
let e=entity(500);assert.notEqual(press(e,true).executed,true);assert.equal(e.stamina,500);assert.equal(rides,0);
for(const [stamina,expected]of [[399,false],[400,true],[500,true],[1199,true]]){e=entity(stamina);const before=rides;assert.equal(press(e).executed===true,expected);assert.equal(e.stamina,expected?stamina-400:stamina);assert.equal(rides,before+(expected?1:0));}
for(const [ratio,stamina,expected]of [[.5,199,false],[.5,200,true],[2,799,false],[2,800,true]]){costRatio=ratio;e=entity(stamina);assert.equal(press(e).executed===true,expected);assert.equal(e.stamina,expected?stamina-400*ratio:stamina)}costRatio=1;
e=entity(500);e.cooldowns.set(ch.attacks.rmb.id,now+1);assert.notEqual(press(e).executed,true);assert.equal(e.stamina,500);
e=entity(400);assert.equal(press(e).executed,true);assert.equal(e.stamina,0);const before=exits;assert.equal(press(e).resolvedAttackId,ch.attacks.rmbExit.id);assert.equal(exits,before+1);assert.equal(e.stamina,0);assert.equal(e.actionState.has('nare-rmb-plane'),true);assert.equal(e.actionState.has('projectile-ride'),false);
console.log('PASS Nare: reproduced1200 gate / 399,400,500,1199 / adjusted costs200,800 / cooldown / zero-stamina ride exit');
