const assert=require('node:assert/strict');const {run,setClock}=require('./support/runtime-harness.cjs');
setClock(1000);run(`Training.selectedCharacterId='ki';Training.start();Training.settings.infiniteStamina=true;Training.player.x=500;Training.player.y=500;Training.dummy.x=1400;Training.mouseWorld=()=>({x:500,y:500});Training.aimAngle=()=>0;DebugMapService.walls=()=>[];Training.use('rmb')`);
setClock(1600);run("PointerHoldInputService.press('lmb')");
const before=run('Training.player.attackSequence');
for(const t of [1601,1700,1900,2100,2900,4000]){setClock(t);run(`PointerHoldInputService.update(${t});SimulationScheduleService.update(${t})`)}
assert.equal(run('Training.player.attackSequence'),before,'skill activation press must not become held primary after field disappears');
run("PointerHoldInputService.release('lmb');PointerHoldInputService.press('lmb')");assert.ok(run('Training.player.attackSequence')>before,'new click must still fire primary');
console.log('PASS Ki RMB/LMB consumes held click; no simultaneous or later primary, fresh click still attacks');
