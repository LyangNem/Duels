const assert=require('node:assert/strict');
const {run,setClock}=require('./support/runtime-harness.cjs');
function start(x=780){
 setClock(1000);run(`Training.selectedCharacterId='geopin';Training.start();OnlineDuelService.active=false;Training.settings.infiniteStamina=false;Training.player.x=500;Training.player.y=500;Training.dummy.x=${x};Training.dummy.y=500;Training.dummy.healthPolicy.invulnerable=false;DebugMapService.walls=()=>[];ModeStateService.set(Training.player,'geopin-module-punch','active');AttackService.execute(Training.player,Training.player.character.attacks.lmb,0);var effect=Training.fx.find(f=>f.damage?.hitMode==='progressive-rect');`);
}
start();run('EffectSpawnService.applyProgressiveDamage(effect,0,.1)');assert.equal(run('ProjectileService.items.length'),1);assert.equal(run('Training.dummy.health'),10000);
setClock(1030);run('ProjectileService.update(2)');assert.equal(run('Training.dummy.health'),9850,'actual followup bullet hits150');
run('Training.dummy.x=735;EffectSpawnService.applyProgressiveDamage(effect,.1,.2)');assert.equal(run('Training.dummy.health'),9850,'no late pressure hit after bullet');
assert.ok(run('Training.fx.includes(effect)'),'visual echo remains');
console.log('PASS reproduced bullet150 then entering pressure endpoint never adds another150; visual remains');
start();run('EffectSpawnService.applyProgressiveDamage(effect,0,.1);Training.dummy.x=735;EffectSpawnService.applyProgressiveDamage(effect,.1,.2)');assert.equal(run('Training.dummy.health'),10000,'no late pressure hit even before bullet connects');assert.equal(run('ProjectileService.items.length'),1);
console.log('PASS after followup launch pressure is closed even if bullet has not yet hit');
start(700);run('EffectSpawnService.applyProgressiveDamage(effect,0,.1)');assert.equal(run('Training.dummy.health'),9850);assert.equal(run('ProjectileService.items.length'),0,'pressure hit prevents followup');run('EffectSpawnService.applyProgressiveDamage(effect,.1,.2)');assert.equal(run('Training.dummy.health'),9850);
console.log('PASS pressure-first hits150 once and emits no followup');
setClock(1400);run(`AttackService.execute(Training.player,Training.player.character.attacks.lmb,0);var nextEffect=Training.fx.filter(f=>f.damage?.hitMode==='progressive-rect').at(-1);EffectSpawnService.applyProgressiveDamage(nextEffect,0,.1)`);assert.equal(run('Training.dummy.health'),9700,'new attack still hits');
console.log('PASS next independent attack still hits; no lasting target immunity');
