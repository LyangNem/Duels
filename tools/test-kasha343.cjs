const assert=require('node:assert/strict');
const {run,setClock}=require('./support/runtime-harness.cjs');
function start(){setClock(1000);run(`Training.selectedCharacterId='kasha';Training.start();OnlineDuelService.active=false;Training.player.x=500;Training.player.y=500;Training.dummy.x=1000;Training.dummy.y=500;Training.dummy.healthPolicy.invulnerable=false;Training.mouseWorld=()=>({x:1000,y:500});DebugMapService.walls=()=>[];Presentation.numberBuffer.clear();`)}
function weight(){return run(`ProgressStateService.state(Training.player,'kasha-judgment')?.value||0`)}
start();run(`GameEvents.emit('just-dodge',{target:Training.dummy,startedAt:1000,now:1000,cause:{source:Training.player,attack:Training.player.character.attacks.lmb}})`);
assert.equal(weight(),0);assert.equal(run(`Training.fx.filter(f=>f.travelToken&&f.tokenStyle==='light').length`),1);
assert.equal(run(`Training.fx.find(f=>f.travelToken).x`),1000);assert.equal(run(`Training.fx.find(f=>f.travelToken).targetEntityId`),run('Training.player.id'));
setClock(1332);run('SimulationScheduleService.update(1332)');assert.equal(weight(),0);
setClock(1333);run('SimulationScheduleService.update(1333)');assert.equal(weight(),1);
console.log('PASS opposing dodge sends light from dodger; weight only arrives at333ms');
start();run(`var other=EntityService.create({id:'other',kind:'player',teamId:'enemy',x:1000,y:1000,maxHealth:1000});GameEvents.emit('just-dodge',{target:Training.dummy,startedAt:1000,now:1000,cause:{source:other,attack:{id:'other.attack'}}})`);
setClock(1333);run('SimulationScheduleService.update(1333)');assert.equal(weight(),0);assert.equal(run('Training.fx.filter(f=>f.travelToken).length'),0);
console.log('PASS dodging an unrelated attacker grants Kasha no light/weight');
start();run(`JustDodgeService.begin(Training.player,1000);JustDodgeService.confirm(Training.player,1000,{cause:{source:Training.dummy,attack:{id:'enemy.attack'}}})`);
assert.equal(weight(),0);assert.equal(run(`Training.fx.find(f=>f.travelToken).followSource`),true);
run(`var token=Training.fx.find(f=>f.travelToken);var coords=[],letters=[];var ctx=new Proxy({globalAlpha:1},{get:(o,k)=>k in o?o[k]:(...a)=>{if(k==='arc')coords.push(a);if(k==='fillText')letters.push(a[0])},set:(o,k,v)=>(o[k]=v,true)});AreaCircleEffectPresentationService.draw(ctx,token,1166.5)`);
assert.equal(run('letters.length'),0);assert.ok(run('coords.some(a=>Math.abs(a[1]-440)<.01)'));
setClock(1333);run('SimulationScheduleService.update(1333)');assert.equal(weight(),1);
console.log('PASS own dodge produces rising/falling light without coin letter; credit on landing');
start();run(`JustDodgeService.begin(Training.player,1000);JustDodgeService.confirm(Training.player,1000);SimulationScheduleService.clearSource(Training.player)`);
setClock(1333);run('SimulationScheduleService.update(1333)');assert.equal(weight(),0);
console.log('PASS pending reward is cancelled by standard source reset/death cleanup');
start();run(`AttackService.execute(Training.player,Training.player.character.attacks.counter,0,{targetPoint:{x:1000,y:500}});SimulationScheduleService.update(1000)`);
setClock(1180);run(`SimulationScheduleService.update(1180);for(const p of ProjectileService.items.slice()){p.x=p.targetPoint.x;p.y=p.targetPoint.y;ProjectileImpactService.resolve(p,'arrival')}`);
assert.equal(run('Training.dummy.health'),9700);assert.equal(run('Presentation.numberBuffer.size'),2);
assert.equal(run('[...Presentation.numberBuffer.values()].every(e=>e.total===150)'),true);
setClock(1260);run('Presentation.update(1260)');assert.equal(run(`Training.fx.filter(f=>f.type==='dmgNum'&&f.text==='150').length`),2);assert.equal(run(`Training.fx.some(f=>f.type==='dmgNum'&&f.text==='300')`),false);
// Ordinary attacks retain their old merge policy.
run(`Presentation.numberBuffer.clear();Presentation.damageNumber(Training.dummy,100);Presentation.damageNumber(Training.dummy,100)`);assert.equal(run('[...Presentation.numberBuffer.values()][0].total'),200);
assert.equal(run('Training.player.character.color'),'#FFFF7D');
console.log('PASS simultaneous counter landings deal150 each and display150+150; other attacks still merge');
