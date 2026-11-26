const assert=require('node:assert/strict');const {run,setClock}=require('./support/runtime-harness.cjs');
setClock(1000);run(`Training.selectedCharacterId='lunet';Training.start();Training.player.x=500;Training.player.y=500;Training.player.health=500;Training.dummy.x=1400;Training.dummy.y=500;Training.dummy.healthPolicy.invulnerable=false;Training.aimAngle=()=>0;DebugMapService.walls=()=>[];CounterStockService.acquire(Training.player,5000,1000,1000);Training.use('counter')`);
setClock(1300);run('CounterModuleService.update(Training.player,1300,()=>0)');
assert.equal(run('ProjectileService.items.length'),2);assert.equal(run("ProjectileService.items.filter(p=>p.scriptedMotion?.mode==='anchored-arc').length"),1);
setClock(1560);run('ProjectileService.update(1)');assert.equal(run("ProjectileService.items.find(p=>p.scriptedMotion)?.y"),404);assert.equal(run('Training.player.health'),500);
setClock(1820);run('ProjectileService.update(1)');assert.equal(run('Training.player.health'),550);assert.equal(run("BuffService.resolve(Training.player,'regeneration')"),100);
assert.equal(run('GAME_DATA.characters.airi.difficulty'),4);assert.equal(run('GAME_DATA.characters.gereta.difficulty'),5);
console.log('PASS403 self volley throws up96 and lands after520ms, immediate heal50 and regen100; difficulty4/5');
