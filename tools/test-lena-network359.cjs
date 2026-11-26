const assert=require('node:assert/strict'),path=require('node:path');const harness=path.join(__dirname,'support/runtime-harness.cjs');
function fresh(pid){delete require.cache[require.resolve(harness)];const h=require(harness);h.setClock(1000);h.run(`Training.selectedCharacterId='lena';Training.start();Training.sessionMode='online';OnlineDuelService.active=true;OnlineDuelService.localPid='${pid}';OnlineDuelService.roundToken=1;OnlineDuelService.remotePids=['${pid==='P1'?'P2':'P1'}'];RoomService.localPid='${pid}';EntityService.clear();Training.remotePlayers=new Map();RoomService.sendGameplay=()=>true;
for(const id of ['P1','P2']){var e=EntityService.create({id:'net:'+id,kind:'player',teamId:id,simulationAuthorityPid:id,x:id==='P1'?500:1300,y:500,radius:20,maxHealth:1200,stamina:2000,maxStamina:2000,baseDamage:100,speed:4.25});e.character=GAME_DATA.characters[id==='P1'?'lena':'shubi'];if(id==='${pid}')Training.player=e;else Training.remotePlayers.set(id,e)}var s=EntityService.items.get('net:P1'),cfg=s.character.worldEffectModules[0];ModeGearPresentationService.facingAngle(s,cfg);`);return h}
const a=fresh('P1'),b=fresh('P2');
function send(){a.run('var packet=OnlineDuelService.statePacket(s,performance.now(),true)');const p=JSON.parse(a.run('JSON.stringify(packet)'));b.c.packet=p;assert.equal(b.run("OnlineDuelService.receive('P1',packet)"),true);return p}
for(const [dx,dy,want] of [[20,0,0],[0,-20,-Math.PI/2],[-20,0,Math.PI],[0,20,Math.PI/2]]){
 a.run(`s.x+=${dx};s.y+=${dy}`);const p=send();assert.ok(Math.abs(p.weaponMovementAngle-want)<1e-9);
 assert.ok(Math.abs(b.run('ModeGearPresentationService.facingAngle(s,cfg)')-want)<1e-9);
 b.run('s.x+=50;s.y-=50');assert.ok(Math.abs(b.run('ModeGearPresentationService.sampleImage(s,cfg,1000).sample.facingAngle')-want)<1e-9);
 b.run('s.x-=90;s.y+=70');assert.ok(Math.abs(b.run('ModeGearPresentationService.facingAngle(s,cfg)')-want)<1e-9);
}
console.log('PASS owner four movement directions match peer weapon samples despite repeated renders/interpolation deltas');
const stopped=send();assert.equal(stopped.weaponMovementAngle,Math.PI/2);assert.equal(b.run('ModeGearPresentationService.facingAngle(s,cfg)'),Math.PI/2);
a.run('AbilityService.activate(s,s.character.abilities.rmb,{angle:Math.PI})');const dash=send();assert.equal(dash.weaponMovementAngle,Math.PI);assert.equal(b.run('ModeGearPresentationService.facingAngle(s,cfg)'),Math.PI);
b.c.packet=stopped;assert.equal(b.run("OnlineDuelService.receive('P1',packet)"),false);assert.equal(b.run('ModeGearPresentationService.facingAngle(s,cfg)'),Math.PI);
b.run('delete s._remoteWeaponMovementAngle;s.lastMovementInputAngle=-Math.PI/2;s.movementAbility=null;s._remoteMovementEffectState=null;s._remoteMovementAbilityActive=false;s.actionState.clear()');assert.equal(b.run('ModeGearPresentationService.facingAngle(s,cfg)'),-Math.PI/2);b.run('s.lastMovementInputAngle=0');assert.equal(b.run('ModeGearPresentationService.facingAngle(s,cfg)'),0);
console.log('PASS stopped facing, immediate dash angle, stale packet rejection and old-packet last-input fallback');
