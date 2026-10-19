const assert=require('node:assert/strict');
const {run,setClock}=require('./support/runtime-harness.cjs');
let now=1000;
function start(id){now+=2000;setClock(now);run(`Training.sessionMode='training';OnlineDuelService.active=false;Training.selectedCharacterId=${JSON.stringify(id)};Training.start();Training.settings.infiniteStamina=false;Training.player.x=500;Training.player.y=500;Training.dummy.x=1000;Training.dummy.y=500;Training.dummy.healthPolicy.invulnerable=false;Training.dummy.health=10000;Training.dummy.maxHealth=10000;DebugMapService.walls=()=>[];`)}
function tick(dt){now+=dt;setClock(now);run('SimulationScheduleService.update(performance.now())')}
function value(code){return run(code)}
start('peluna');run('Training.dummy.x=1500;AttackService.execute(Training.player,Training.player.character.attacks.counter,0)');assert.equal(value("ProgressStateService.state(Training.player,'peluna-forge-time').value"),9000);
run("ProgressStateService.apply(Training.player,{stateKey:'peluna-forge-time',operation:'reset'});AttackService.execute(Training.player,Training.player.character.attacks.counterStage3,0)");assert.equal(value("ProgressStateService.state(Training.player,'peluna-forge-time').value"),9000);
console.log('PASS Peluna missed counter and enhanced counter both grant stage3');
for(const [id,key,cost,damage] of [['meramona','lmb',300,150],['meramona','lmbStage1',300,150],['meramona','lmbStage3',300,150],['meramona','rmb',0,0],['hab','rmb',500,150],['cyien','lmbSecond',0,100],['yui','lmb',250,300],['latis','lmb',150,200],['shello','rmb',200,0]]){
 assert.equal(value(`GAME_DATA.characters.${id}.attacks.${key}.cost`),cost);
 assert.equal(value(`GAME_DATA.characters.${id}.attacks.${key}.damageRatio*GAME_DATA.characters.${id}.baseDamage`),damage);
}
assert.equal(value('GAME_DATA.characters.hapupu.maxHealth'),1000);
assert.equal(value('GAME_DATA.characters.maisil.attacks.lmbCritical.modules[0].halfAngle'),.16755160819145565*.6);
assert.equal(value('GAME_DATA.characters.mainmad.attacks.lmb.charge.duration'),1000);
assert.equal(value("GAME_DATA.characters.shello.attacks.rmb.modules.find(m=>m.type==='attack.guard').duration"),300);
assert.equal(value("GAME_DATA.characters.dazbin.attacks.rmb.modules.find(m=>m.type==='delivery.range-projectile').radius"),180);
assert.equal(value('GAME_DATA.characters.ki.attacks.rmb.modules[0].range'),399.05);
assert.equal(value("GAME_DATA.characters.ki.attacks.lmbFinal.modules.some(m=>m.type==='resource.restore'||m.travelToken===true)"),false);
console.log('PASS requested costs, damage, health, central critical angle, guard, radius and forecast');
start('quri');
for(let stage=0;stage<=4;stage++){
 run(`ProgressStateService.apply(Training.player,{stateKey:'quri-cube-stage',operation:'set',value:${stage},max:4});var scaled=ProgressScaledAttackService.resolve(Training.player,Training.player.character.attacks.lmb)`);
 assert.equal(value('scaled.range'),180+stage*45);
 assert.equal(value("scaled.modules.find(m=>m.type==='delivery.area').range"),180+stage*45);
}
for(const key of ['lmb','lmbShadow']){
 const multipliers=Array.from(value(`GAME_DATA.characters.clea.attacks.${key}.modules.filter(m=>m.type==='damage.range-band-multiplier').map(m=>m.multiplier)`));
 let damage=90;const actual=[damage];for(const m of multipliers){damage*=m;actual.push(damage)}
 for(let i=0;i<4;i++)assert.ok(Math.abs(actual[i]-[90,70,50,30][i])<1e-8);
}
start('cyien');run("var c=Training.player,a=c.character.attacks.lmbBack;AttackModuleService.onHit(c,Training.dummy,a,{execution:AttackExecutionService.create(c,a,0)},0)");assert.equal(value("ProgressStateService.state(Training.player,'cyien-gyeok').value"),4);assert.equal(value('GAME_DATA.characters.cyien.attacks.lmb.modules[1].max'),12);
console.log('PASS Quri each stage +20%, Clea90/70/50/30, Cyien third hit4/max12');
for(const key of ['lmb','rmb','counter'])for(const fraction of [.1,.5,1]){
 start('terdion');run(`var source=Training.player,attack=source.character.attacks.${key},delivery=AttackModuleService.projectile(attack),behavior=ProjectileModuleService.config(attack);var bomb=ProjectileService.spawn({source,attack,projectile:delivery,behavior,x:1000,y:500,angle:0});var fuse=behavior.impact.fuse;var total=fuse.range/fuse.speed*GAME_DATA.frameMs;bomb.travel=fuse.range*${fraction};`);
 const total=value('total');tick(total*fraction);const remaining=value('ProjectileImpactService.remainingFuse(bomb)');assert.ok(Math.abs(remaining-total*(1-fraction))<1e-6);
 run("ProjectileImpactService.resolve(bomb,'wall')");
 if(fraction===1){assert.ok(value('Training.dummy.health')<10000);assert.equal(value('TargetPointProjectileService.beginLinger(bomb,performance.now(),\'wall\')'),false);if(key==='counter')assert.equal(value('Training.dummy.health'),9550)}
 else{
  run("TargetPointProjectileService.beginLinger(bomb,performance.now(),'wall')");const landedHealth=value('Training.dummy.health');assert.ok(Math.abs(value('bomb.stationaryArrival.endsAt')-(now+remaining))<1e-6);
  tick(remaining-.01);assert.equal(value('Training.dummy.health'),landedHealth);tick(.02);assert.ok(value('Training.dummy.health')<landedHealth);
 }
}
console.log('PASS all3 Terdion attacks: short/half/max flight fuse, matching linger and actual explosion');
start('terdion');run("var source=Training.player,attack=source.character.attacks.lmb,bomb=ProjectileService.spawn({source,attack,projectile:AttackModuleService.projectile(attack),behavior:ProjectileModuleService.config(attack),x:1000,y:500,angle:0});ProjectileImpactService.resolve(bomb,'wall');ProjectileService.discard(bomb)");const cancelledHealth=value('Training.dummy.health');tick(1000);assert.equal(value('Training.dummy.health'),cancelledHealth);console.log('PASS removed bomb cancels remaining fuse explosion');
for(const [id,key,remove] of [['hab','rmb',false],['nare','lmb',false],['nare','rmb',true],['hab','counter',true]]){
 start(id);run(`Training.player.x=WorldBoundsService.width()-30;Training.dummy.y=1000;AttackService.execute(Training.player,Training.player.character.attacks.${key},0);SimulationScheduleService.update(performance.now());var shot=ProjectileService.items[0];`);
 assert.ok(value('shot'));run('ProjectileService.updateOutbound(shot,0,10,performance.now())');
 assert.equal(value('ProjectileService.items.includes(shot)'),!remove,`${id}.${key}`);
 if(!remove){assert.ok(value('shot.x>WorldBoundsService.width()'));assert.notEqual(value("shot.behavior?.returning?.phase"),'returning');assert.notEqual(value('shot.impactResolved'),true)}
}
start('cherity');run('Training.player.x=WorldBoundsService.width()-30;Training.dummy.y=1000;var attack=ChargedAttackService.dynamicSpec(Training.player.character.attacks.lmb,2);AttackService.execute(Training.player,attack,0);var shot=ProjectileService.items[0];ProjectileService.updateOutbound(shot,0,10,performance.now())');assert.equal(value('ProjectileService.items.includes(shot)'),false);assert.notEqual(value('shot.impactResolved'),true);
console.log('PASS finite piercing passes map edge without impact/return; infinite range and Nare skill quietly removed');
