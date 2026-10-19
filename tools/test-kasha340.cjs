const assert=require('node:assert/strict');
const {run,setClock}=require('./support/runtime-harness.cjs');
function start(){setClock(1000);run(`Training.selectedCharacterId='kasha';Training.start();OnlineDuelService.active=false;Training.player.x=700;Training.player.y=700;Training.dummy.x=1000;Training.dummy.y=700;Training.settings.infiniteStamina=false;DebugMapService.walls=()=>[];Training.dummy.healthPolicy.invulnerable=false;Training.aimAngle=()=>0;Training.mouseWorld=()=>({x:1100,y:700});`)}
start();
assert.ok(run(`Training.player.character.worldEffectModules[0].rotationRadians`)<0);
assert.equal(run('Training.player.character.color'),'#FFFF7D');
assert.equal(run(`Training.player.character.worldEffectModules.slice(1).every(m=>m.renderType==='weaponProjectile'&&m.attackId==='attack.kasha.counter')`),true);
assert.ok(Math.abs(run('Training.player.character.attacks.rmb.previewGeometry.halfAngle')*2-220*Math.PI/180)<1e-10);
run(`ProgressStateService.apply(Training.player,{stateKey:'kasha-judgment',max:10,operation:'set',value:1});AbilityService.activate(Training.player,Training.player.character.abilities.rmb,{angle:0});`);
assert.equal(run('Training.player.attackPreview.style.strokeColor'),'255,70,70');
assert.equal(run(`Training.fx.find(f=>f.type==='arcSweep').color`),'#FF4646');
setClock(1700);run('SimulationScheduleService.update(1700)');
assert.equal(run(`Training.fx.filter(f=>f.type==='arcSweep').at(-1).color`),'#FF4646');
setClock(1950);run('EffectSpawnService.update(1950)');
assert.equal(run('Training.dummy.health'),9200);
assert.equal(run('Training.dummy.forcedMotion.distance'),350);assert.equal(run('Training.dummy.forcedMotion.speed'),22);
assert.equal(run(`Training.player.character.attacks.rmb.modules.some(m=>m.type==='movement.knockback'&&m.distance===350&&m.speed===22)`),true);
console.log('PASS reversed rotation, yellow, 220 degrees, red preview/windup/sweep, hit damage + strong knockback module');
start();run(`AttackService.execute(Training.player,Training.player.character.attacks.counter,0,{targetPoint:{x:1100,y:700}});SimulationScheduleService.update(1000);Training.mouseWorld=()=>({x:700,y:1100});`);
setClock(1180);run('SimulationScheduleService.update(1180)');
assert.equal(run('ProjectileService.items[0].targetPoint.x'),1100);assert.equal(run('ProjectileService.items[0].targetPoint.y'),700);
assert.equal(run('ProjectileService.items[1].targetPoint.x'),700);assert.equal(run('ProjectileService.items[1].targetPoint.y'),1100);
run('Training.mouseWorld=()=>({x:1000,y:1000})');setClock(1360);run('SimulationScheduleService.update(1360)');
assert.equal(run('ProjectileService.items[2].targetPoint.x'),1000);assert.equal(run('ProjectileService.items[2].targetPoint.y'),1000);
console.log('PASS each throw reads latest aim point; airborne shots retain their destinations');
// Targets at 100 degrees belong to a 220 degree sector, 125 degrees do not.
for(const degrees of [100,-100,125,-125]){
 start();run(`Training.dummy.x=700+500*Math.cos(${degrees}*Math.PI/180);Training.dummy.y=700+500*Math.sin(${degrees}*Math.PI/180);ProgressStateService.apply(Training.player,{stateKey:'kasha-judgment',max:10,operation:'set',value:1});AttackService.execute(Training.player,Training.player.character.attacks.rmb,0);`);
 setClock(1399);run('EffectSpawnService.update(1399)');assert.equal(run('Training.dummy.health')<10000,Math.abs(degrees)<110);
}
console.log('PASS real sweep hits both ±100 degrees and excludes ±125 degrees');
