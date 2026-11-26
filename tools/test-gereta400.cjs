const assert=require('node:assert/strict'),path=require('node:path').join(__dirname,'support/runtime-harness.cjs');
function fresh(pid){delete require.cache[require.resolve(path)];const h=require(path);h.run(`Training.selectedCharacterId='gereta';Training.start();Training.settings.infiniteStamina=false;Training.sessionMode='online';OnlineDuelService.active=true;OnlineDuelService.localPid='${pid}';OnlineDuelService.roundToken=1;OnlineDuelService.remotePids=['${pid==='P1'?'P2':'P1'}'];RoomService.localPid='${pid}';EntityService.clear();Training.remotePlayers=new Map();globalThis.sent=[];RoomService.sendGameplay=p=>{sent.push(p);return true};for(const [id,x] of [['P1',500],['P2',650]]){const e=EntityService.create({id:'net:'+id,kind:'player',character:GAME_DATA.characters.gereta,teamId:id,simulationAuthorityPid:id,x,y:500,radius:20,maxHealth:10000,stamina:2000,maxStamina:2000,baseDamage:150,speed:4});e.health=10000;e.character=GAME_DATA.characters.gereta;if(id==='${pid}')Training.player=e;else Training.remotePlayers.set(id,e)}var source=EntityService.items.get('net:P1');var target=EntityService.items.get('net:P2');DebugMapService.walls=()=>[];DebugMapService.movementWalls=()=>[];Training.mouseWorld=()=>({x:1000,y:500});Training.aimAngle=()=>0;`);return h}
const all=[fresh('P1'),fresh('P2')];
function flush(){for(let pass=0;pass<12;pass++){let changed=false;for(let i=0;i<2;i++){const packets=JSON.parse(all[i].run('JSON.stringify(sent.splice(0))'));for(const p of packets){changed=true;all[1-i].c.packet=p;all[1-i].run(`OnlineDuelService.receive('P${i+1}',packet)`);}}if(!changed)return}throw Error('packet loop')}
for(const [at,hold,damage] of [[1000,0,200],[3000,1500,800]]){
 for(const h of all)h.setClock(at);
 all[0].run("source.stamina=2000;Training.use('rmb')");flush();
 for(const h of all)h.setClock(at+hold);
 all[0].run("Training.releaseInput('rmb')");
 const packet=JSON.parse(all[0].run("JSON.stringify(sent.find(p=>p.action==='ability-release'))"));assert.ok(packet.executionSequence>0,'release must carry actual attack sequence');
 flush();assert.ok(all[1].run('AttackWindupService.continuationMap(source,false)?.size')>0);
 const before=all[1].run('target.health');
 for(const h of all){h.setClock(at+hold+350);h.run(`SimulationScheduleService.update(${at+hold+350})`)}flush();
 assert.equal(all[1].run('target.health'),before-damage,'victim owner must receive delayed charged hit');
}
console.log('PASS two independent online runtimes: real Gereta tap/full release packets, matching windup commit and victim-authoritative 200/800 damage');
