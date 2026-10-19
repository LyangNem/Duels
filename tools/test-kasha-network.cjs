const assert=require('node:assert/strict');
const harness=require('node:path').join(__dirname,'support/runtime-harness.cjs');
function fresh(pid){
 delete require.cache[require.resolve(harness)];const h=require(harness);
 h.run(`Training.selectedCharacterId='kasha';Training.start();Training.sessionMode='online';OnlineDuelService.active=true;
 OnlineDuelService.localPid='${pid}';OnlineDuelService.roundToken=1;OnlineDuelService.remotePids=['${pid==='P1'?'P2':'P1'}'];RoomService.localPid='${pid}';
 EntityService.clear();Training.remotePlayers=new Map();OnlineDuelService.remotePlayers=Training.remotePlayers;
 globalThis.sent=[];RoomService.sendGameplay=p=>{sent.push(p);return true};var actors=new Map();
 for(const [id,x] of [['P1',500],['P2',800]]){
  var e=EntityService.create({id:'net:'+id,kind:'player',teamId:id,simulationAuthorityPid:id,x,y:500,radius:20,maxHealth:id==='P1'?1300:5000,stamina:2000,maxStamina:2000,baseDamage:150,speed:3.75,color:'#FFFF7D'});
  e.character=GAME_DATA.characters[id==='P1'?'kasha':'shubi'];actors.set(id,e);if(id==='${pid}')Training.player=e;else Training.remotePlayers.set(id,e);
 }var source=actors.get('P1'),target=actors.get('P2');Training.mouseWorld=()=>({x:1100,y:650});`);
 return h;
}
const a=fresh('P1'),b=fresh('P2');
function packets(h){return JSON.parse(h.run('JSON.stringify(sent.splice(0))'))}
function deliver(h,pid,p){h.c.packet=p;assert.equal(h.run(`OnlineDuelService.receive('${pid}',packet)`),true)}
function weight(h){return h.run(`ProgressStateService.state(source,'kasha-judgment')?.value||0`)}

b.run('JustDodgeService.begin(target,1000);JustDodgeService.confirm(target,1000,{cause:{source,attack:source.character.attacks.lmb}})');
const dodge=packets(b).find(p=>p.type==='duel-just-dodge-confirmed');assert.ok(dodge);
assert.equal(weight(a),0);assert.equal(weight(b),0);
deliver(a,'P2',dodge);assert.equal(weight(a),0);deliver(a,'P2',dodge);assert.equal(weight(a),0);a.setClock(1333);a.run('SimulationScheduleService.update(1333)');assert.equal(weight(a),1);a.setClock(1000);
const lightPacket=packets(a).find(p=>p.type==='duel-presentation'&&p.kind==='effect-spawn'&&p.data.effect.tokenStyle==='light');assert.ok(lightPacket);b.c.packet=lightPacket;assert.equal(b.run(`OnlinePresentationSyncService.receive('P1',packet)`),true);assert.equal(b.run(`Training.fx.some(f=>f.tokenStyle==='light'&&f.targetEntityId===source.id)`),true);
console.log('PASS real remote just-dodge packet grants one stack only to locally owned enemy observer');

// Attack effects carry the prepared ratio, even if the remote source state has not arrived yet.
a.run(`ProgressStateService.apply(source,{stateKey:'kasha-judgment',max:10,operation:'set',value:5});AttackService.execute(source,source.character.attacks.rmb,0);`);
const effect=packets(a).find(p=>p.type==='duel-presentation'&&p.kind==='effect-spawn'&&p.data.effect.damage);
assert.ok(effect);assert.equal(weight(b),0);b.c.packet=effect;assert.equal(b.run(`OnlinePresentationSyncService.receive('P1',packet)`),true);
b.setClock(1250);b.run('EffectSpawnService.update(1250)');assert.equal(b.run('target.health'),3000);
b.setClock(1399);b.run('EffectSpawnService.update(1399)');assert.equal(b.run('target.health'),3000);
console.log('PASS prepared 40% ratio survives stale remote weight state, applies once at target authority');

a.setClock(2000);b.setClock(2000);a.run(`AttackService.execute(source,source.character.attacks.counter,0,{targetPoint:{x:1100,y:650}})`);
// Remote action replay must wait for the authoritative per-shot geometry instead of scheduling duplicates.
b.run(`var replay=AttackExecutionService.create(source,source.character.attacks.counter,0);replay.networkReplay=true;replay.targetPoint={x:1100,y:650};AttackModuleService.deliver(source,source.character.attacks.counter,0,{execution:replay,total:3,resolved:0,hits:0,finished:false})`);
assert.equal(b.run('SimulationScheduleService.items.filter(s=>s.type==="projectile").length'),0);
for(const time of [2000,2180,2360]){
 a.setClock(time);b.setClock(time);a.run(`Training.mouseWorld=()=>({x:${1100+(time-2000)/18},y:650});SimulationScheduleService.update(${time})`);
 const shot=packets(a).find(p=>p.type==='duel-scheduled-projectile-shot');assert.ok(shot);
 deliver(b,'P1',shot);deliver(b,'P1',shot);b.run(`SimulationScheduleService.update(${time})`);
}
const local=a.run(`ProjectileService.items.filter(p=>p.attack.id==='attack.kasha.counter')`);
const remote=b.run(`ProjectileService.items.filter(p=>p.attack.id==='attack.kasha.counter')`);
assert.equal(local.length,3);assert.equal(remote.length,3);
for(let i=0;i<3;i++){
 for(const key of ['x','y','angle','targetDistance'])assert.ok(Math.abs(local[i][key]-remote[i][key])<1e-9,key);
 assert.equal(remote[i].targetPoint.x,1100+i*10);assert.equal(remote[i].targetPoint.y,650);
}
console.log('PASS three authoritative sword origins/directions/destinations match in independent runtimes; duplicate packets ignored');

a.run(`source.lastMovementInputAngle=Math.PI/2;var state=OnlineDuelService.statePacket(source,2360,true)`);
const state=JSON.parse(a.run('JSON.stringify(state)'));deliver(b,'P1',state);
assert.equal(b.run('source.lastMovementInputAngle'),Math.PI/2);
const offset=b.run(`ModeGearPresentationService.imageOffset(source,source.character.worldEffectModules[1])`);
assert.ok(Math.abs(offset.x-70)<1e-9);assert.ok(Math.abs(offset.y+95)<1e-9);
console.log('PASS last movement direction reaches peer state and rotates summon image placement');

b.run(`target.x=1100;target.y=650;target.netCollisionX=1100;target.netCollisionY=650;
 for(const shot of ProjectileService.items.filter(p=>p.attack.id==='attack.kasha.counter')){
  shot.x=shot.targetPoint.x;shot.y=shot.targetPoint.y;ProjectileImpactService.resolve(shot,'arrival');ProjectileImpactService.resolve(shot,'arrival');
 }`);
assert.equal(b.run('target.health'),2550);
assert.equal(b.run(`CCService.has(target,'neutralize',performance.now())`),true);
console.log('PASS remote target authority receives exactly three landing hits/CC, duplicate arrivals do not deal damage');

a.run('Presentation.numberBuffer.clear()');
for(const packet of packets(b).filter(p=>p.type==='duel-hit-confirmed'&&p.attackId==='attack.kasha.counter-impact')){deliver(a,'P2',packet);deliver(a,'P2',packet);}
assert.equal(a.run('Presentation.numberBuffer.size'),3);assert.equal(a.run('[...Presentation.numberBuffer.values()].every(e=>e.total===150)'),true);
console.log('PASS three remote landing confirmations display separate150 numbers instead of450/300');
