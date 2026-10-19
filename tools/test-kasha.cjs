const assert=require('node:assert/strict');
const {run,setClock,c}=require('./support/runtime-harness.cjs');
let groups=0;
function test(name,fn){fn();groups++;console.log('PASS',name)}
function start(){setClock(1000);run(`OnlineDuelService.active=false;Training.sessionMode='training';Training.selectedCharacterId='kasha';Training.start();
 Training.settings.infiniteStamina=false;Training.player.x=500;Training.player.y=500;Training.dummy.x=800;Training.dummy.y=500;
 Training.dummy.baseDamage=100;Training.dummy.healthPolicy.invulnerable=false;Training.player.healthPolicy.invulnerable=false;Training.aimAngle=()=>0;Training.mouseWorld=()=>({x:1000,y:500});`);}
function weight(){return run(`ProgressStateService.state(Training.player,'kasha-judgment')?.value||0`)}
function setWeight(n){run(`ProgressStateService.apply(Training.player,{stateKey:'kasha-judgment',max:10,operation:'set',value:${n}})`)}
function cast(){return run(`AbilityService.activate(Training.player,Training.player.character.abilities.rmb,{angle:0,resolveAim:()=>1})`)}

test('spec, distinct muted yellow, melee role, pure module data',()=>{
 start();assert.equal(run('Training.player.maxHealth'),1300);assert.equal(run('Training.player.speed'),3.75);
 assert.equal(run('Training.player.character.classification.style'),6);
 assert.equal(run('Training.player.character.classification.role'),1);
 assert.equal(run(`TagService.primaryAttackRange(Training.player.character)`),275);
 assert.equal(run(`Object.values(GAME_DATA.characters).filter(ch=>ch.color.toLowerCase()===Training.player.character.color.toLowerCase()).length`),1);
 assert.equal(run('Training.player.character.color'),'#FFFF7D');
});
test('enemy own-attack dodge and self dodge deliver one after333ms; duplicate/ally ignored; cap10',()=>{
 start();run(`GameEvents.emit('just-dodge',{target:Training.dummy,startedAt:500,now:1000,cause:{source:Training.player,attack:Training.player.character.attacks.lmb}});GameEvents.emit('just-dodge',{target:Training.dummy,startedAt:500,now:1000,cause:{source:Training.player,attack:Training.player.character.attacks.lmb}});`);assert.equal(weight(),0);
 setClock(1333);run('SimulationScheduleService.update(1333)');assert.equal(weight(),1);
 run(`GameEvents.emit('just-dodge',{target:Training.player,startedAt:600,now:1333})`);assert.equal(weight(),1);
 setClock(1666);run('SimulationScheduleService.update(1666)');assert.equal(weight(),2);
 run(`var ally=EntityService.create({id:'kasha-ally',kind:'player',teamId:Training.player.teamId,x:600,y:500,maxHealth:1000});GameEvents.emit('just-dodge',{target:ally,startedAt:600,now:1666})`);assert.equal(weight(),2);
 for(let i=0;i<20;i++)run(`GameEvents.emit('just-dodge',{target:Training.dummy,startedAt:${700+i},now:1666,cause:{source:Training.player,attack:Training.player.character.attacks.lmb}})`);
 setClock(1999);run('SimulationScheduleService.update(1999)');assert.equal(weight(),10);
});
test('received damage during dodge no longer adds weight',()=>{
 start();run(`Training.player.dodgeUntil=1200;DamagePipeline.apply({source:Training.dummy,target:Training.player,attack:{id:'test.hit',damageRatio:1,modules:[],tags:['평타']},impact:{type:'projectile'}})`);assert.equal(weight(),0);
 run(`Training.player.dodgeUntil=0;DamagePipeline.apply({source:Training.dummy,target:Training.player,attack:{id:'test.hit2',damageRatio:1,modules:[],tags:['평타']},impact:{type:'projectile'}})`);assert.equal(weight(),0);
 run(`Training.player.dodgeUntil=1200;CharacterTriggerEffectService.run(Training.player,'damage-received',{source:Training.dummy,target:Training.player,impact:{dot:true,type:'status-damage'},now:1000})`);assert.equal(weight(),0);
});
for(const n of [0,1,5,10])test('700ms windup + right-to-left sweep, '+n+' weights damage once',()=>{
 start();setWeight(n);if(n===0){assert.equal(cast(),false);assert.equal(run('Training.player.stamina'),2000);assert.equal(run('Training.fx.length'),0);return;}assert.equal(cast(),true);assert.equal(run('CombatStatsService.current(Training.player).canMove'),false);
 assert.equal(run(`Training.player.attackPreview.type`),'sector');
 assert.equal(run(`Training.fx.filter(f=>!!f.bladeImage).length`),0);
 setClock(1699);run('SimulationScheduleService.update(1699);EffectSpawnService.update(1699)');assert.equal(run('Training.dummy.health'),10000);
 setClock(1700);run('SimulationScheduleService.update(1700)');assert.equal(run('Training.dummy.health'),10000);
 assert.equal(run(`Training.fx.find(f=>!!f.damage)?.sweepDirection`),'counterclockwise');
 setClock(1800);run('EffectSpawnService.update(1800)');assert.equal(run('Training.dummy.health'),10000);
 setClock(1950);run('EffectSpawnService.update(1950)');assert.ok(Math.abs(run('Training.dummy.health')-(10000-n*800))<1e-6);
 setClock(2099);run('EffectSpawnService.update(2099)');assert.ok(Math.abs(run('Training.dummy.health')-(10000-n*800))<1e-6);
 assert.equal(run('CCService.has(Training.player,"bind",2099)'),true);
 assert.equal(run('CCService.has(Training.player,"bind",2100)'),false);
 assert.equal(weight(),0);assert.equal(run('Training.player.stamina'),1400);
});
test('skill warning and slash lock cast direction; no damage behind caster',()=>{
 start();setWeight(10);run('Training.dummy.x=200');cast();setClock(1700);run('SimulationScheduleService.update(1700)');setClock(2099);run('EffectSpawnService.update(2099)');assert.equal(run('Training.dummy.health'),10000);
 assert.equal(run(`Training.fx.find(f=>f.damage)?.angle`),0);
});
test('skill passes walls and warning is not wall-clipped',()=>{
 start();setWeight(10);run(`var oldWalls=DebugMapService.walls;DebugMapService.walls=()=>[{x:650,y:0,w:30,h:1400}]`);try{cast();setClock(1700);run('SimulationScheduleService.update(1700)');setClock(2099);run('EffectSpawnService.update(2099)');assert.equal(run('Training.dummy.health'),2000)}finally{run('DebugMapService.walls=oldWalls')}
});
test('insufficient stamina/cooldown do not bind or create warning',()=>{
 start();run('Training.player.stamina=599');assert.equal(cast(),false);assert.equal(run('CCService.has(Training.player,"bind",1000)'),false);assert.equal(run('Training.player.attackPreview==null'),true);
 start();run(`Training.player.cooldowns.set('attack.kasha.rmb',2000)`);assert.equal(cast(),false);
});
for(const status of ['stun','freeze','neutralize','sleep'])test(status+' interrupts skill windup and removes public warning',()=>{
 start();setWeight(10);cast();run(`AttackWindupService.interrupt(Training.player,${JSON.stringify(status)})`);setClock(1700);run('SimulationScheduleService.update(1700)');
 assert.equal(run(`Training.fx.filter(f=>f.type==='arcSweep').length`),0);assert.equal(run('Training.dummy.health'),10000);
});
test('normal attack150 and affordability',()=>{
 start();run('Training.dummy.x=700;AttackService.execute(Training.player,Training.player.character.attacks.lmb,0)');assert.equal(run('Training.dummy.health'),9850);assert.equal(run('Training.player.stamina'),1850);
});
test('counter has three actual sword shots, independent origins and fixed destination, CC inherited',()=>{
 start();run(`Training.dummy.x=1500;CounterStockService.acquire(Training.player,5000,1000,1000);AbilityService.activate(Training.player,Training.player.character.abilities.counter,{angle:0,targetPoint:{x:1000,y:500}})`);
 assert.equal(run('!!Training.player.counterWindup'),true);assert.equal(run('ProjectileService.items.length'),0);
 setClock(1300);run('CounterModuleService.finish(Training.player,0);SimulationScheduleService.update(1300)');assert.equal(run('ProjectileService.items.length'),1);
 setClock(1479);run('SimulationScheduleService.update(1479)');assert.equal(run('ProjectileService.items.length'),1);
 setClock(1480);run('SimulationScheduleService.update(1480)');assert.equal(run('ProjectileService.items.length'),2);
 setClock(1660);run('SimulationScheduleService.update(1660)');assert.equal(run('ProjectileService.items.length'),3);
 const shots=run('ProjectileService.items');assert.equal(new Set(shots.map(p=>p.x+":"+p.y)).size,3);
 for(const p of shots){assert.equal(p.renderStyle.type,'anchor-cross');assert.equal(p.damageOnTravel,false);assert.equal(p.projectile.collisionTargets,false);assert.equal(p.targetPoint.x,1000);assert.equal(p.targetPoint.y,500);assert.ok(Math.abs(p.angle-Math.atan2(500-p.y,1000-p.x))<1e-9)}
});
test('four-pointed cross sword image has finite geometry',()=>{
 start();cast();run(`var coords=[];var no=()=>{};var ctx=new Proxy({globalAlpha:1},{get:(o,k)=>k in o?o[k]:(...a)=>{for(const v of a)if(typeof v==='number')coords.push(v)},set:(o,k,v)=>(o[k]=v,true)});
 
 ModeGearPresentationService.drawImage(ctx,Training.player,Training.player.character.worldEffectModules[0],1,1000);`);
 assert.equal(run('coords.every(Number.isFinite)'),true);assert.ok(run('coords.length')>10);
});
test('actual training draw covers public preparation, sweep and weapon projectile',()=>{
 start();setWeight(1);cast();run('Training.draw()');setClock(1700);run('SimulationScheduleService.update(1700);Training.draw()');
 setClock(2000);run(`EffectSpawnService.update(2000);Training.draw();AttackService.execute(Training.player,Training.player.character.attacks.counter,0,{targetPoint:{x:1000,y:500}});SimulationScheduleService.update(2000);Training.draw()`);
});
console.log('KASHA GROUPS',groups);
