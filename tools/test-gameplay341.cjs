const assert=require('node:assert/strict');
const {run,setClock}=require('./support/runtime-harness.cjs');
function start(){setClock(1000);run(`Training.selectedCharacterId='kasha';Training.start();OnlineDuelService.active=false;Training.player.x=500;Training.player.y=500;Training.dummy.healthPolicy.invulnerable=false;Training.aimAngle=()=>0;Training.mouseWorld=()=>({x:1000,y:500});Training.settings.infiniteStamina=false;`)}
start();
assert.equal(run('AbilityService.activate(Training.player,Training.player.character.abilities.rmb,{angle:0})'),false);
assert.equal(run('Training.player.stamina'),2000);assert.equal(run('Training.fx.length'),0);assert.equal(run('Training.player.attackPreview==null'),true);assert.equal(run('CombatStatsService.current(Training.player).canMove'),true);
run(`ProgressStateService.apply(Training.player,{stateKey:'kasha-judgment',max:10,operation:'set',value:1})`);
assert.equal(run('AbilityService.activate(Training.player,Training.player.character.abilities.rmb,{angle:0})'),true);
setClock(1700);run('SimulationScheduleService.update(1700)');assert.equal(run(`ProgressStateService.state(Training.player,'kasha-judgment')?.value||0`),0);
console.log('PASS zero weight rejects skill without resource/preview/bind; one weight casts and consumes');
start();run(`var origWalls=DebugMapService.walls;DebugMapService.walls=()=>[{x:900,y:400,w:200,h:200}];
 var expected=WorldGeometryService.nearestOpenPoint(1000,500,2);
 CounterStockService.acquire(Training.player,5000,1000,1000);AbilityService.activate(Training.player,Training.player.character.abilities.counter,{angle:0,targetPoint:{x:1000,y:500}});
 var preview=Training.player.attackPreview;
 CounterModuleService.finish(Training.player,0);SimulationScheduleService.update(1000);`);
assert.equal(run('ProjectileService.items[0].targetPoint.x'),run('expected.x'));assert.equal(run('ProjectileService.items[0].targetPoint.y'),run('expected.y'));
assert.equal(run('WorldGeometryService.wallAtPoint(ProjectileService.items[0].targetPoint.x,ProjectileService.items[0].targetPoint.y)==null'),true);
// Counter preview area uses the same corrected destination.
assert.equal(run('preview.parts[0].center.x'),run('expected.x'));assert.equal(run('preview.parts[0].center.y'),run('expected.y'));
run('Training.mouseWorld=()=>({x:1050,y:500});var expected2=WorldGeometryService.nearestOpenPoint(1050,500,2)');
setClock(1180);run('SimulationScheduleService.update(1180)');assert.equal(run('ProjectileService.items[1].targetPoint.x'),run('expected2.x'));assert.equal(run('ProjectileService.items[1].targetPoint.y'),run('expected2.y'));
run('DebugMapService.walls=origWalls');
console.log('PASS wall aim uses same nearest-open point as lightning; counter preview and each live shot agree');
assert.equal(run('AttackVisualStyle.fadeOpacity(1)'),1);assert.equal(run('AttackVisualStyle.fadeOpacity(0)'),.35);
assert.ok(Math.abs(run('AttackVisualStyle.fadeOpacity(.5)')-.675)<1e-12);
run(`var styles=[];var ctx=new Proxy({globalAlpha:1,measureText:t=>({width:String(t).length*7}),createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}})},{get:(o,k)=>k in o?o[k]:(()=>{}),set:(o,k,v)=>{o[k]=v;if(k==='strokeStyle'||k==='fillStyle')styles.push(v);return true}});
 AreaCircleEffectPresentationService.draw(ctx,{type:'areaCircle',x:500,y:500,r:100,start:1000,dur:1000,color:'#FF0000',strokeAlpha:1,fillAlpha:1,fadeOut:true},1900);`);
assert.ok(run('styles.some(s=>typeof s===\'string\'&&s.includes(\'0.414\'))')||run('styles.some(s=>typeof s===\'string\'&&s.includes(\'0.415\'))'));
// Actual training renderer includes all registered shapes; animation time remains unmodified.
run(`Training.ctx=ctx;Training.draw()`);
console.log('PASS shared fade keeps 35% terminal opacity, real circle uses policy, actual Training.draw remains valid');
