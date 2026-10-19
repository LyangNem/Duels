const assert=require('node:assert/strict');
const {run,setClock}=require('./support/runtime-harness.cjs');
let passed=0;
function test(name,fn){fn();passed++;console.log('PASS',name)}
function start(id='kasha'){setClock(1000);run(`OnlineDuelService.active=false;Training.sessionMode='training';Training.selectedCharacterId=${JSON.stringify(id)};Training.start();Training.settings.infiniteStamina=false;Training.player.x=500;Training.player.y=500;Training.dummy.x=800;Training.dummy.y=500;Training.player.healthPolicy.invulnerable=false;Training.dummy.healthPolicy.invulnerable=false;Training.dummy.baseDamage=100;Training.aimAngle=()=>0;Training.mouseWorld=()=>({x:1000,y:500});`)}
function weight(){return run(`ProgressStateService.state(Training.player,'kasha-judgment')?.value||0`)}
test('skill900,220deg,400ms; no blade image; warning and damage ignore walls',()=>{
 start();assert.equal(run('Training.player.character.attacks.rmb.range'),900);
 assert.ok(Math.abs(run('Training.player.character.attacks.rmb.previewGeometry.halfAngle')-Math.PI*110/180)<1e-12);
 assert.equal(run(`Training.player.character.attacks.rmb.modules[1].duration`),400);
 assert.equal(run(`Training.player.character.attacks.rmb.modules[1].damage.module.wallPolicy`),'ignore');
 assert.equal(run(`JSON.stringify(Training.player.character).includes('bladeImage')`),false);
});
test('weight consumed only on successful swing commitment; final damage uses consumed value',()=>{
 start();run(`ProgressStateService.apply(Training.player,{stateKey:'kasha-judgment',max:10,operation:'set',value:4});AbilityService.activate(Training.player,Training.player.character.abilities.rmb,{angle:0})`);
 assert.equal(weight(),4);setClock(1699);run('SimulationScheduleService.update(1699)');assert.equal(weight(),4);
 setClock(1700);run('SimulationScheduleService.update(1700)');assert.equal(weight(),0);
 run(`GameEvents.emit('just-dodge',{target:Training.dummy,startedAt:1690,now:1700,cause:{source:Training.player,attack:Training.player.character.attacks.lmb}})`);assert.equal(weight(),0);
 setClock(1950);run('EffectSpawnService.update(1950)');assert.equal(run('Training.dummy.health'),6800);
 assert.equal(weight(),0);setClock(2033);run('SimulationScheduleService.update(2033)');assert.equal(weight(),1);
});
test('cancelled windup preserves weight; received attack adds none; actual own just dodge adds one',()=>{
 start();run(`ProgressStateService.apply(Training.player,{stateKey:'kasha-judgment',max:10,operation:'set',value:4});AbilityService.activate(Training.player,Training.player.character.abilities.rmb,{angle:0});AttackWindupService.interrupt(Training.player,'stun')`);
 setClock(1700);run('SimulationScheduleService.update(1700)');assert.equal(weight(),4);
 start();run(`Training.player.dodgeUntil=1200;DamagePipeline.apply({source:Training.dummy,target:Training.player,attack:{id:'test.hit',damageRatio:1,modules:[],tags:['평타']},impact:{type:'projectile'}})`);assert.equal(weight(),0);
 run('JustDodgeService.begin(Training.player,1000);JustDodgeService.confirm(Training.player,1000)');assert.equal(weight(),0);setClock(1333);run('SimulationScheduleService.update(1333)');assert.equal(weight(),1);
 assert.equal(run('JustDodgeService.confirm(Training.player,1000)'),false);assert.equal(weight(),1);
});
for(const a of [0,Math.PI/2,Math.PI,-Math.PI/2,.7])test('counter origins and images behind last movement '+a,()=>{
 start();run(`Training.player.lastMovementInputAngle=${a};Training.dummy.x=1400;AttackService.execute(Training.player,Training.player.character.attacks.counter,0,{targetPoint:{x:1000,y:500}});SimulationScheduleService.update(1000)`);
 const shot=run('ProjectileService.items[0]');const cfg=run('Training.player.character.worldEffectModules[1]');
 const expected={x:Math.cos(a)*cfg.x-Math.sin(a)*cfg.y,y:Math.sin(a)*cfg.x+Math.cos(a)*cfg.y};
 assert.ok(Math.abs(shot.x-500-expected.x)<1e-9);assert.ok(Math.abs(shot.y-500-expected.y)<1e-9);
 const image=run(`ModeGearPresentationService.imageOffset(Training.player,Training.player.character.worldEffectModules[1])`);
 assert.ok(Math.abs(image.x-expected.x)<1e-9);assert.ok(Math.abs(image.y-expected.y)<1e-9);
 for(const m of run('Training.player.character.worldEffectModules.slice(1)'))assert.ok(m.x<0);
 assert.equal(shot.renderStyle.kind,'weapon-projectile');assert.equal(shot.renderStyle.type,'anchor-cross');
});
test('second throw uses latest movement direction, not aim or first throw direction',()=>{
 start();run(`Training.player.lastMovementInputAngle=0;AttackService.execute(Training.player,Training.player.character.attacks.counter,0,{targetPoint:{x:1000,y:500}});SimulationScheduleService.update(1000);Training.player.lastMovementInputAngle=Math.PI/2`);
 setClock(1180);run('SimulationScheduleService.update(1180)');assert.equal(run('ProjectileService.items[1].x'),500);assert.equal(run('ProjectileService.items[1].y'),370);
});
test('each actual throw and normal/skill attack rotate background image',()=>{
 start();run('AttackService.execute(Training.player,Training.player.character.attacks.lmb,0)');assert.equal(run(`ModeStateService.state(Training.player,'kasha-sword-spin').turns`),1);
 run(`AttackService.execute(Training.player,Training.player.character.attacks.rmb,0)`);assert.equal(run(`ModeStateService.state(Training.player,'kasha-sword-spin').turns`),2);
 run(`AttackService.execute(Training.player,Training.player.character.attacks.counter,0,{targetPoint:{x:1000,y:500}});SimulationScheduleService.update(1000)`);assert.equal(run(`ModeStateService.state(Training.player,'kasha-sword-spin').turns`),3);
 setClock(1180);run('SimulationScheduleService.update(1180)');assert.equal(run(`ModeStateService.state(Training.player,'kasha-sword-spin').turns`),4);
 setClock(1360);run('SimulationScheduleService.update(1360)');assert.equal(run(`ModeStateService.state(Training.player,'kasha-sword-spin').turns`),5);
});
test('flight ignores enemies, wall and guard; damage/CC occurs once at actual destination',()=>{
 start();run(`Training.dummy.x=700;var wallFn=DebugMapService.walls;DebugMapService.walls=()=>[{x:750,y:0,w:20,h:1400}];
 var landing=EntityService.create({id:'landing-target',kind:'dummy',teamId:'enemy',x:1000,y:500,radius:20,maxHealth:1000});landing.healthPolicy.invulnerable=false;
 AttackService.execute(Training.player,Training.player.character.attacks.counter,0,{targetPoint:{x:1000,y:500}});SimulationScheduleService.update(1000);var shot=ProjectileService.items[0];
 AttackGuardService.activate(Training.dummy,{type:'attack.guard',shape:'circle',range:120,duration:2000},0,1000);`);
 try{
  assert.equal(run('ProjectileService.items.includes(shot)'),true);
  assert.equal(run('shot.projectile.collisionMode'),'landing-only');
  for(let i=1;i<=50&&run('ProjectileService.items.includes(shot)');i++){
   const now=1000+i*17;setClock(now);run(`ProjectileService.updateOutbound(shot,ProjectileService.items.indexOf(shot),1,${now})`);
  }
  assert.equal(run('ProjectileService.items.includes(shot)'),false);
  assert.equal(run('Training.dummy.health'),10000);assert.equal(run('landing.health'),850);
  assert.equal(run(`CCService.has(landing,'neutralize',performance.now())`),true);
  assert.equal(run(`ProjectileImpactService.resolve(shot,'arrival')`),false);assert.equal(run('landing.health'),850);
 }finally{run('DebugMapService.walls=wallFn;AttackGuardService.active.clear()')}
});
test('counter preview is destination circle100 only, no flight path',()=>{
 start();run(`CounterStockService.acquire(Training.player,5000,1000,1000);AbilityService.activate(Training.player,Training.player.character.abilities.counter,{angle:0,targetPoint:{x:1000,y:500}})`);
 const p=run('Training.player.attackPreview');assert.ok(p);
 assert.equal(p.type,'circle');assert.equal(p.range,100);
 assert.equal((p.parts||[]).some(part=>part.type==='projectile-path'),false);
 assert.equal(run('Training.player.counterWindup.previewHideAttackShape'),true);
});
test('Reika ascent/descent have movement-lifetime dodge invulnerability and network state',()=>{
 start('reika');run(`AttackService.execute(Training.player,Training.player.character.attacks.gahoWeapon,0,{targetPoint:{x:900,y:500}});var state=MovementAbilityService.state(Training.player,'movement:reika-airborne');`);
 assert.equal(run('state.evasionUntargetable'),true);
 assert.equal(run('ActionStateCombatPolicyService.isEvasionUntargetable(Training.player)'),true);
 run(`var hp=Training.player.health;DamagePipeline.apply({source:Training.dummy,target:Training.player,attack:{id:'test.invul',damageRatio:1,modules:[],tags:['평타']},impact:{type:'projectile'}})`);assert.equal(run('Training.player.health'),run('hp'));
 run(`var carrier={source:Training.player,attack:Training.player.character.attacks.gahoWeapon,x:900,y:500,angle:0,behavior:ProjectileModuleService.config(Training.player.character.attacks.gahoWeapon),volley:{execution:AttackExecutionService.create(Training.player,Training.player.character.attacks.gahoWeapon,0)}};ProjectileImpactService.resolve(carrier,'arrival')`);
 setClock(1050);run('SimulationScheduleService.update(1050)');assert.equal(run('MovementAbilityService.state(Training.player,"movement:reika-airborne").duration'),140);
 assert.equal(run('ActionStateCombatPolicyService.isEvasionUntargetable(Training.player)'),true);
 run(`var payload=MovementAbilityService.serialize(Training.player,1050);var peer=EntityService.create({id:'peer',kind:'player',teamId:'other',x:500,y:500,maxHealth:1300});MovementAbilityService.applyRemote(peer,payload,1050)`);
 assert.equal(run('payload.evasionUntargetable'),true);assert.equal(run('ActionStateCombatPolicyService.isEvasionUntargetable(peer,1050)'),true);
 setClock(1190);run(`MovementAbilityService.finish(Training.player,MovementAbilityService.state(Training.player,'movement:reika-airborne'),1190);MovementAbilityService.applyRemote(peer,{active:false,remaining:0},1190)`);
 assert.equal(run('ActionStateCombatPolicyService.isEvasionUntargetable(Training.player,1190)'),false);assert.equal(run('ActionStateCombatPolicyService.isEvasionUntargetable(peer,1190)'),false);
});
console.log('339 GROUPS',passed);
