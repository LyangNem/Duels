const assert=require('node:assert/strict');
const {run,setClock}=require('./support/runtime-harness.cjs');
function start(id){setClock(1000);run(`PointerHoldInputService.releaseAll(false);Training.selectedCharacterId=${JSON.stringify(id)};Training.start();OnlineDuelService.active=false;Training.settings.infiniteStamina=false;Training.player.x=500;Training.player.y=500;Training.dummy.x=700;Training.dummy.y=500;Training.dummy.healthPolicy.invulnerable=false;Training.aimAngle=()=>0;Training.mouseWorld=()=>({x:700,y:500});`)}
start('kasha');
for(const ch of run('Object.values(GAME_DATA.characters).map(c=>({id:c.id}))')){
 const repeat=run(`PointerHoldInputService.isRepeatablePrimary({character:GAME_DATA.characters[${JSON.stringify(ch.id)}]},GAME_DATA.characters[${JSON.stringify(ch.id)}].abilities.lmb)`);
 assert.equal(repeat,ch.id!=='clea',ch.id);
 assert.equal(run(`PointerHoldInputService.isRepeatablePrimary({character:GAME_DATA.characters[${JSON.stringify(ch.id)}]},GAME_DATA.characters[${JSON.stringify(ch.id)}].abilities.rmb)`),false,ch.id+' RMB');
}
console.log('PASS all66 characters: only Clea primary forbids hold repeat; every RMB excluded');
assert.equal(run(`PointerHoldInputService.press('lmb')`),true);
assert.equal(run('Training.dummy.health'),9850);
setClock(1499);run('PointerHoldInputService.update(1499)');assert.equal(run('Training.dummy.health'),9850);
setClock(1500);run('PointerHoldInputService.update(1500)');assert.equal(run('Training.dummy.health'),9700);
setClock(2000);run('PointerHoldInputService.update(2000)');assert.equal(run('Training.dummy.health'),9550);
run(`PointerHoldInputService.release('lmb')`);setClock(2500);run('PointerHoldInputService.update(2500)');assert.equal(run('Training.dummy.health'),9550);
assert.equal(run('Training.player.stamina'),1550);
console.log('PASS real Kasha hold repeats at500ms cooldown, correct damage/cost and release stops');
start('siro');assert.equal(run(`PointerHoldInputService.press('lmb')`),true);
const began=run(`ChargedAttackService.state(Training.player,'charge:primary').startedAt`);
for(const now of [1100,1200,1500]){setClock(now);run(`PointerHoldInputService.update(${now})`);assert.equal(run(`ChargedAttackService.state(Training.player,'charge:primary').startedAt`),began)}
run(`PointerHoldInputService.release('lmb')`);assert.equal(run(`!!ChargedAttackService.state(Training.player,'charge:primary')`),false);
console.log('PASS charged primary keeps original charge while held, releases normally without restart');
start('tinya');run(`CircleFormationService.state(Training.player).circles=[{id:'a',x:0,y:0,r:30,order:1}];PointerHoldInputService.press('lmb')`);
const first=run('Training.player.stamina');
for(let now=1050;now<=3000;now+=50){setClock(now);run(`PointerHoldInputService.update(${now})`)}
assert.ok(run('Training.player.stamina')<first,'formation primary repeats through the common pointer hold loop');
run(`PointerHoldInputService.release('lmb')`);
console.log('PASS formation activation primary repeats while editing RMB remains separately handled');
