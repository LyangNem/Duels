const assert=require('node:assert/strict');
const {run,setClock}=require('./support/runtime-harness.cjs');
function start(blocked){setClock(1000);run(`Training.selectedCharacterId='erapabi';Training.start();OnlineDuelService.active=false;Training.player.x=500;Training.player.y=500;Training.dummy.x=600;Training.dummy.y=500;Training.dummy.healthPolicy.invulnerable=false;Training.aimAngle=()=>0;var rear=EntityService.create({id:'rear',kind:'dummy',character:Training.player.character,teamId:Training.dummy.teamId,x:400,y:500,maxHealth:1000,radius:20});rear.health=1000;DebugMapService.walls=()=>${blocked?"[{x:550,y:450,w:30,h:100},{x:420,y:450,w:30,h:100}]":"[]"};CounterStockService.acquire(Training.player,5000,1000,1000);Training.use('counter');`)}
for(const blocked of [true,false]){
 start(blocked);setClock(1300);run('CounterModuleService.update(Training.player,1300,()=>0);SimulationScheduleService.update(1300)');
 assert.equal(run('Training.dummy.health'),blocked?10000:9760,'front hit respects walls');
 assert.equal(run('rear.health'),1000,'rear waits200ms');
 setClock(1500);run('SimulationScheduleService.update(1500)');
 assert.equal(run('rear.health'),blocked?1000:760,'delayed rear hit respects walls');
 assert.equal(run('AreaGeometryService.pointInPolygon(600,500,Training.fx.filter(f=>f.type==="botSwing")[0].points)'),!blocked,'front visual clipped consistently');
 assert.equal(run('AreaGeometryService.pointInPolygon(400,500,Training.fx.filter(f=>f.type==="botSwing").at(-1).points)'),!blocked,'rear visual clipped consistently');
 for(const target of ['Training.dummy','rear'])assert.equal(run(`!!${target}.forcedMotion`),!blocked,'no knockback behind wall');
 console.log('PASS actual counter windup/front/delayed rear '+(blocked?'blocked by walls without damage or knockback':'unobstructed damage240 and knockback'));
}
assert.equal(run("Training.player.character.attacks.counter.modules.filter(m=>m.type==='delivery.area').every(m=>m.wallPolicy==='block')"),true);
assert.equal(run("Training.player.character.attacks.megaLaserTick.modules.find(m=>m.type==='delivery.area')?.wallPolicy"),'ignore','skill laser wall policy unchanged');
