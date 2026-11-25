const assert=require('node:assert/strict');
const {run,setClock}=require('./support/runtime-harness.cjs');
function start(ms,wall=false){setClock(1000);run(`Training.selectedCharacterId='bell';Training.start();OnlineDuelService.active=false;Training.player.x=500;Training.player.y=500;Training.dummy.x=800;Training.dummy.y=500;Training.dummy.healthPolicy.invulnerable=false;Training.aimAngle=()=>0;DebugMapService.walls=()=>${wall?'[{x:650,y:400,w:30,h:200}]':'[]'};var ally=EntityService.create({id:'cleanse-ally',kind:'player',character:Training.player.character,teamId:Training.player.teamId,x:800,y:500,maxHealth:900,radius:20});CCService.add(ally,'burn',5000,Training.dummy.id);PointerHoldInputService.press('lmb');`);setClock(1000+ms);run(`PointerHoldInputService.release('lmb');var wave=Training.fx.find(f=>f.type==='progressRect');`)}
for(const ms of [0,999,1000]){
 start(ms);assert.equal(run('!!wave'),true);assert.equal(run('Training.dummy.health'),10000);assert.equal(run("CCService.has(ally,'burn')"),true);
 run('EffectSpawnService.applyProgressiveDamage(wave,0,.2)');assert.equal(run('Training.dummy.health'),10000,'no hit before wave arrives');assert.equal(run("CCService.has(ally,'burn')"),true);
 run('EffectSpawnService.applyProgressiveDamage(wave,.2,.75)');assert.equal(run('Training.dummy.health'),9900);assert.equal(run("CCService.has(ally,'burn')"),ms<1000,'only full charge cleanses upon arrival');assert.equal(run('ally.health'),900,'no friendly damage');
 run('EffectSpawnService.applyProgressiveDamage(wave,.75,1)');assert.equal(run('Training.dummy.health'),9900,'one hit');
 assert.equal(run('wave.color'),ms===1000?'#ff6565':'#e8e6d9');assert.equal(run('wave.strokeColor'),ms===1000?'#ff6565':'#e8e6d9');
}
start(1000,true);run('EffectSpawnService.applyProgressiveDamage(wave,0,1)');assert.equal(run('Training.dummy.health'),10000);assert.equal(run("CCService.has(ally,'burn')"),true);
console.log('PASS basic/999/full1000 progressive straight attacks: delayed contact100 once, red only full, friendly cleanse at contact without damage, walls block both');
