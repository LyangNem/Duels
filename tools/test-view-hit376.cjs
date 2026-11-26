const assert=require('node:assert/strict');const {run,setClock}=require('./support/runtime-harness.cjs');
setClock(1000);run(`Training.selectedCharacterId='bell';Training.start();Training.cameraState={x:200,y:150};Training.mouse={x:900,y:450};Training.spectating=false;ScreenShakeService.offset=()=>({x:0,y:0})`);
let point=run('({...Training.mouseWorld(null,{allowOutsideWorld:true})})');assert.equal(point.x,1175);assert.equal(point.y,612.5);
for(const scale of [.6,1,1.4]){run(`CameraFovService.setDebugScale(${scale})`);const p=run('({...Training.mouseWorld(null,{allowOutsideWorld:true})})');const z=run('CameraFovService.scale(1000)');assert.ok(Math.abs((p.x-800)*z+600-900)<1e-6);assert.ok(Math.abs((p.y-550)*z+400-450)<1e-6)}
run('CameraFovService.setDebugScale(1)');const bounds=run('WorldViewportVisibilityService.bounds()');assert.equal(bounds.left,50);assert.equal(bounds.right,1550);assert.equal(run('WorldViewportVisibilityService.containsWorldPoint(100,500)'),true);
console.log('PASS zoom80% inverse pointer mapping at three zooms and expanded viewport bounds');
function shot(x,y){setClock(1000);run(`Training.selectedCharacterId='bell';Training.start();Training.player.x=500;Training.player.y=500;Training.dummy.x=${x};Training.dummy.y=${y};Training.dummy.healthPolicy.invulnerable=false;DebugMapService.walls=()=>[{x:650,y:450,w:30,h:100}];AttackService.execute(Training.player,Training.player.character.attacks.lmb,0);var wave=Training.fx.find(f=>f.type==='progressRect')`);assert.equal(run('wave.range'),150)}
shot(700,570);run('EffectSpawnService.applyProgressiveDamage(wave,0,1)');assert.equal(run('Training.dummy.health'),10000,'no invisible hit past clipped end');
shot(660,552);run('EffectSpawnService.applyProgressiveDamage(wave,0,1)');assert.equal(run('Training.dummy.health'),9900,'visible body contact is not rejected by center behind wall');
shot(665,567);run('EffectSpawnService.applyProgressiveDamage(wave,0,1)');assert.equal(run('Training.dummy.health'),10000,'no square corner false positive');
shot(600,500);run('EffectSpawnService.applyProgressiveDamage(wave,0,.5)');assert.equal(run('Training.dummy.health'),10000,'damage never outruns visible front');run('EffectSpawnService.applyProgressiveDamage(wave,.5,.6)');assert.equal(run('Training.dummy.health'),9900);
console.log('PASS wall clipped progressRect actual length/timing/body corner matches visual');
