/* 실제 명령/입력/변환 서비스를 사용하는 가에 및 연계 밸런스 회귀. */
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');let now=1000,passed=0;const c=vm.createContext({console,Map,Set,Math,performance:{now:()=>now}});
function load(file,name){vm.runInContext(fs.readFileSync(path.join(root,file),'utf8')+';globalThis.'+name+'='+name+';',c)}
function test(name,fn){fn();passed++;console.log('PASS '+name)}
for(const n of ['characterValue','characterCount','characterSum','characterProduct','freezeCharacterData','CHARACTER_RULES'])load('src/data/'+n+'.js',n);
c.CHARACTER_DATA={};for(const id of ['gae','van','lete','cherity'])c.CHARACTER_DATA[id]=vm.runInContext('('+fs.readFileSync(path.join(root,'src/data/characters/'+id+'.js'),'utf8')+')',c);
load('src/data/CharacterDataService.js','CharacterDataService');load('src/core/ModeStateService.js','ModeStateService');load('src/core/CommandFeatureService.js','CommandFeatureService');
const ch=c.CharacterDataService.compile('gae'),e={character:ch,alive:true,local:true,actionState:new Map(),health:100,maxHealth:1300,stamina:900};
c.EntitySimulationAuthorityService={isLocal:e=>e.local};const packets=[];c.GameplayFeatureStateSyncService={send:(...p)=>packets.push(p)};
c.ModuleValueService={resolve:(e,value)=>Number(value)||0};load('src/render/ResourceRestoreEffectService.js','ResourceRestoreEffectService');c.HealthService={restore:(e,n)=>{e.health=Math.min(e.maxHealth,e.health+n);return n}};
c.AttackModuleService={type:m=>m.type};load('src/combat/AttackFeatureTransformService.js','AttackFeatureTransformService');
test('기본 LASER·정상 스테미나·초기화/리셋·삭제 명령 거부',()=>{assert.equal(c.CommandFeatureService.ensure(e),true);assert.equal(c.CommandFeatureService.has(e,'laser'),true);assert.equal(e.stamina,900);assert.equal(c.CommandFeatureService.blocksNaturalStaminaRegen(e),false);c.CommandFeatureService.onAction(e,ch.attacks.laser);assert.equal(e.stamina,900);for(const command of ['/repair','/cooling'])assert.equal(c.CommandFeatureService.activate(e,command).ok,false);c.CommandFeatureService.resetEntity(e);c.CommandFeatureService.ensure(e);assert.equal(c.CommandFeatureService.has(e,'laser'),true);assert.equal(e.stamina,900);assert.equal(ch.dodgeResourcePolicy,undefined);assert.equal(ch.killRewardStaminaMode,undefined)});
test('FIX 잃은체력25%·1초 표시·원격은 중복 회복 없이 표시',()=>{assert.equal(c.CommandFeatureService.activate(e,'/fix').ok,true);assert.equal(e.health,400);assert.equal(c.CommandFeatureService.has(e,'fix'),true);now=1999;assert.equal(c.CommandFeatureService.has(e,'fix'),true);now=2000;assert.equal(c.CommandFeatureService.has(e,'fix'),false);e.local=false;c.CommandFeatureService.applyRemote(e,'fix');assert.equal(e.health,400);assert.equal(c.CommandFeatureService.has(e,'fix'),true);e.local=true;assert.equal(packets.at(-1)[2],'fix');for(const [health,expected] of [[1000,1075],[1300,1300]]){e.health=health;c.CommandFeatureService.runFix(e);assert.equal(e.health,expected)};e.health=400});
test('ACCELERATE 평타1.4배·재변환 안정·모드 네트워크 복제',()=>{c.CommandFeatureService.activate(e,'/accelerate');const a=c.AttackFeatureTransformService.prepare(e,ch.attacks.laser);assert.ok(Math.abs(a.cd-600/1.4)<1e-9);assert.equal(c.AttackFeatureTransformService.prepare(e,a).cd,a.cd);assert.equal(ch.stats.speed,3.75);const remote={...e,actionState:new Map(),_commandFeatureInitialized:false};c.CommandFeatureService.applyNetworkSnapshot(remote,c.CommandFeatureService.networkSnapshot(e));assert.equal(c.CommandFeatureService.has(remote,'accelerate'),true)});
test('KNOCKBACK/ELECTRIC 투사체·즉시 레이저 공통 적중 모듈과 색',()=>{for(const f of ['knockback','electric'])c.CommandFeatureService.activate(e,'/'+f);for(const instant of [false,true]){c.CommandFeatureService.setState(e,'laser-instant',instant);const a=c.AttackFeatureTransformService.prepare(e,ch.attacks.laser);assert.equal(a.modules.find(m=>m.type==='status.apply').status,'zap');assert.equal(a.modules.find(m=>m.type==='status.apply').duration,1000);assert.equal(a.modules.find(m=>m.type==='movement.knockback').distance,160);const color=instant?a.modules.find(m=>m.type==='effect.spawn').color:a.modules.find(m=>m.type==='projectile.presentation').style.outerColor;const [r,g,b]=color.split(',').map(Number);assert.equal(r,255);assert.equal(g,145);assert.equal(b,35)}});
c.Training={active:true,spectating:false,player:e};c.GameInputResetService={releaseAll(){}};c.OnlineChatService={close(){}};load('src/input/CharacterCommandInputService.js','CharacterCommandInputService');
test('명령 타이핑 마지막 글자 자동 실행·창 닫힘·잘못된 명령 유지',()=>{const input=c.CharacterCommandInputService;input.open();for(const code of ['KeyW','KeyI','KeyD'])input.handleKeydown({code,preventDefault(){},stopPropagation(){}});assert.equal(input.openState,true);input.handleKeydown({code:'KeyE',preventDefault(){},stopPropagation(){}});assert.equal(input.openState,false);assert.equal(c.CommandFeatureService.has(e,'laser-wide'),true);input.open();input.handleKeydown({code:'KeyX',preventDefault(){},stopPropagation(){}});assert.equal(input.openState,true);input.close();assert.deepEqual(Array.from(c.CommandFeatureService.featureEntries.slice(0,4),e=>e.label),['KNOCKBACK','ACCELERATE','FIX','ELECTRIC'])});
test('스킬 선딜500/방전1000·반격 무적/기절 고정2000·반/레테/체리티',()=>{assert.equal(ch.abilities.rmb.trigger.modules.find(m=>m.type==='timing.delay').duration,500);assert.equal(ch.attacks.rmb.modules.find(m=>m.type==='status.apply').status,'discharge');assert.equal(ch.attacks.rmb.modules.find(m=>m.type==='status.apply').duration,1000);const counter=ch.abilities.counter.trigger.modules[0];assert.equal(counter.selfModifiers[0].duration,2000);assert.equal(counter.onFinishModules[0].duration,2000);assert.equal(counter.onFinishModules[0].status,'stun');const van=c.CharacterDataService.compile('van');assert.equal(van.attacks.rmb.cost,200);assert.equal(van.wrenchDurability.intactRegenPerSecond,25);assert.equal(van.abilities.counter.trigger.modules[0].cc.type,'movement.neutralize-knockback');for(const k of ['rmb','counter'])assert.ok(!van.attacks[k].modules.some(m=>m.status==='stun'));assert.equal(c.CharacterDataService.compile('lete').attacks.lmb.cost,350);assert.equal(c.CharacterDataService.compile('cherity').attacks.lmb.modules.find(m=>m.type==='delivery.projectile').speed,52)});
test('명령 두 줄 정렬·FIX1초 녹색 표시·글로우 없음',()=>{
 const drawn=[];const ctx={save(){},restore(){},measureText:t=>({width:t.length*5}),strokeText(){},fillText(t,x,y){drawn.push({t,y,color:this.fillStyle,glow:this.shadowBlur})}};
 c.CommandFeatureService.runFix(e);c.CharacterCommandInputService.draw(ctx,e,100,now);
 const top=drawn.filter(x=>x.y===108);assert.deepEqual(top.map(x=>x.t),['KNOCKBACK','ACCELERATE','FIX','ELECTRIC']);assert.equal(top.find(x=>x.t==='FIX').glow,0);assert.equal(top.find(x=>x.t==='FIX').color,'#9fe3b0');
 now+=1000;drawn.length=0;c.CharacterCommandInputService.draw(ctx,e,100,now);const fix=drawn.find(x=>x.t==='FIX');assert.equal(fix.glow,0);assert.equal(fix.color,'#ff9c9c');
});

test('actual RMB waits500ms and cooldown blocks scheduling',()=>{
 load('src/core/SimulationScheduleService.js','SimulationScheduleService');load('src/abilities/AbilityModuleService.js','AbilityModuleService');
 c.GAME_DATA={frameMs:1000/60};c.AttackWindupService={isContextWindup:()=>false};c.AbilityService={resolvedInputAttack:()=>ch.attacks.rmb};let ready=true;c.AttackService={previewReady:()=>ready};c.AttackPreviewService={fromAttack:(s,a,angle,until)=>({until})};c.GameEvents={emit(){}};const fired=[];
 c.AbilityAttackExecutionService={execute(context,attack){fired.push(now);context.executed=true;context.resolvedAttackId=attack.id;return true}};
 e.abilityPending=new Map();e.attackPreview=null;const context=()=>({source:e,ability:ch.abilities.rmb,trigger:ch.abilities.rmb.trigger,attack:ch.attacks.rmb,now,angle:0,executed:false,resolvedAttackId:''});
 const start=now;c.AbilityModuleService.run(context());assert.equal(fired.length,0);assert.equal(e.attackPreview.until,start+500);now=start+499;c.SimulationScheduleService.update(now);assert.equal(fired.length,0);now=start+500;c.SimulationScheduleService.update(now);assert.equal(fired.length,1);assert.equal(fired[0],start+500);ready=false;c.AbilityModuleService.run(context());now+=500;c.SimulationScheduleService.update(now);assert.equal(fired.length,1);
});
test('fixed electric layers and tooltip order',()=>{
 for(const instant of [false,true]){c.CommandFeatureService.setState(e,'laser-instant',instant);const a=c.AttackFeatureTransformService.prepare(e,ch.attacks.laser);if(instant){const fx=a.modules.find(m=>m.type==='effect.spawn');assert.equal(fx.coreColor,'255,145,35')}else{const style=a.modules.find(m=>m.type==='projectile.presentation').style;for(const k of ['outerColor','midColor','coreColor','centerColor'])assert.equal(style[k],'255,145,35')}}
 assert.deepEqual(Array.from(ch.tooltipSkills,t=>t.key==='/'?t.name:t.key),['LMB','RMB','L-Shift','기능 활성화','/knockback','/accelerate','/fix','/electric','/dual','/pierce','/instant','/wide','/range']);
});
test('다음 온라인 라운드 진입 전 미완성 입력·결과·입력 잠금 초기화',()=>{
 const input=c.CharacterCommandInputService;
 // Execute the actual setupSession method with a stand-in world builder.
 const source=fs.readFileSync(path.join(root,'src/modes/Training.js'),'utf8');
 const method=source.slice(source.indexOf('  setupSession(){')+'  setupSession(){'.length,source.indexOf('\n  exit(){')).trim().replace(/},$/,'');
 const setup=vm.runInContext('(function(){'+method+'})',c);
 for(const oldText of ['/ele','/range']){
   input.open();input.buffer=oldText;input.showResult('/wide','ok',now);
   let rebuilt=false;
   const training={sessionMode:'online',setupOnlineSession(){rebuilt=true;assert.equal(input.openState,false);assert.equal(input.buffer,'');assert.equal(input.resultText,'');assert.equal(input.capturesGameInput(),false);assert.equal(input.visibleText(now),null);return true;}};
   assert.equal(setup.call(training),true);assert.equal(rebuilt,true);
   input.open();assert.equal(input.buffer,'/');input.close();
 }
});
console.log('PASS '+passed+' Gae/remake groups');
