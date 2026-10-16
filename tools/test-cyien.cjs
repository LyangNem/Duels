/* 실제 사이엔 데이터·처치 이벤트/원격 확정·격 상태/절격 선택 회귀. */
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');let passed=0;
const c=vm.createContext({console,Math,Map,Set,WeakMap,EMPTY_RUNTIME_ITEMS:[],performance:{now:()=>1000}});
function load(p,n){vm.runInContext(fs.readFileSync(path.join(root,p),'utf8')+`;globalThis.${n}=${n};`,c)}
function test(name,fn){fn();passed++;console.log('PASS '+name)}
for(const n of ['characterValue','characterCount','characterSum','characterProduct','freezeCharacterData','CHARACTER_RULES'])load('src/data/'+n+'.js',n);
c.CHARACTER_DATA={cyien:vm.runInContext('('+fs.readFileSync(path.join(root,'src/data/characters/cyien.js'),'utf8')+')',c)};
load('src/data/CharacterDataService.js','CharacterDataService');const ch=c.CharacterDataService.compile('cyien');
c.RelationService={relation:(s,t)=>s===t?'self':s.teamId===t.teamId?'ally':'enemy'};
c.EntitySimulationAuthorityService={isLocal:e=>e?.local!==false};c.Training={sessionMode:'training'};c.OnlineDuelService={active:false};c.COMBAT_BUFF_DEFS={};
for(const [p,n]of [['src/core/ProgressStateService.js','ProgressStateService'],['src/core/CharacterKillProgressService.js','CharacterKillProgressService'],['src/core/GameEvents.js','GameEvents'],['src/core/RuntimeValueReferenceProviders.js','RuntimeValueReferenceProviders'],['src/core/RuntimeValueReferenceService.js','RuntimeValueReferenceService'],['src/core/TriggerConditionService.js','TriggerConditionService'],['src/core/TriggerModuleService.js','TriggerModuleService'],['src/abilities/AbilityService.js','AbilityService']])load(p,n);
for(const p of ['src/core/initialization-217.js','src/core/initialization-218.js','src/core/initialization-219.js'])vm.runInContext(fs.readFileSync(path.join(root,p),'utf8'),c);
function entity(extra={}){return{id:'source',kind:'player',teamId:'A',alive:true,local:true,character:ch,actionState:new Map(),...extra}}
function value(e){return c.ProgressStateService.state(e,'cyien-gyeok')?.value||0}
function ready(e){return c.AbilityService.resolvedInputAttack(e,ch.abilities.rmb).id===ch.attacks.rmbCharged.id}
test('모든 공격 처치와 온라인 확정은 격을 충전하지 않음',()=>{for(const attack of Object.values(ch.attacks)){const e=entity(),t=entity({id:'enemy',teamId:'B',alive:false});c.GameEvents.emit('entity-defeated',{source:e,entity:t,attack});c.GameEvents.emit('network-hit-confirmed',{source:e,target:t,attack,defeated:true});assert.equal(value(e),0);assert.equal(ready(e),false)}});
test('직접 격 충전 최대치에서만 절격 선택·부분격 유지',()=>{const e=entity();c.ProgressStateService.apply(e,{stateKey:'cyien-gyeok',operation:'set',value:7,max:8});assert.equal(ready(e),false);c.ProgressStateService.apply(e,{stateKey:'cyien-gyeok',operation:'set',value:8,max:8});assert.equal(ready(e),true)});
test('ALWAYS 처치 문구 및 처치 충전 데이터 제거',()=>{assert.equal(ch.tooltipSkills[0].text,'격 최대치 시 절격 활성화');assert.equal(ch.killRewardProgress,undefined)});
test('쌍도낙엽 실제 적중은 격1·같은 실행 중복 충전 차단',()=>{
 c.HealthService={isInvulnerable:()=>false};c.TagService={attackTags:a=>new Set(a.tags||[]),derivedModuleTags:()=>[]};c.NeutralizingKnockbackService={start:()=>true};
 load('src/combat/ProgressHitTargetPolicy.js','ProgressHitTargetPolicy');load('src/combat/AttackExecutionService.js','AttackExecutionService');load('src/combat/AttackModuleService.js','AttackModuleService');
 const e=entity({attackSequence:0}),target=entity({id:'enemy',teamId:'B'}),attack=ch.attacks.counter,execution=c.AttackExecutionService.create(e,attack,0);
 c.AttackModuleService.onHit(e,target,attack,{execution},0);assert.equal(value(e),1);
 c.AttackModuleService.onHit(e,target,attack,{execution},0);assert.equal(value(e),1);
 c.AttackModuleService.onHit(e,target,attack,{execution:c.AttackExecutionService.create(e,attack,0)},0);assert.equal(value(e),2);
});
console.log(`PASS ${passed} Cyien regression groups`);
