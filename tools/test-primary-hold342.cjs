const assert=require('node:assert/strict');
const {run,setClock}=require('./support/runtime-harness.cjs');
function start(id){setClock(1000);run(`PointerHoldInputService.releaseAll(false);Training.selectedCharacterId=${JSON.stringify(id)};Training.start();OnlineDuelService.active=false;Training.settings.infiniteStamina=false;Training.player.x=500;Training.player.y=500;Training.dummy.x=700;Training.dummy.y=500;Training.dummy.healthPolicy.invulnerable=false;Training.aimAngle=()=>0;Training.mouseWorld=()=>({x:700,y:500});`)}
start('van');
for(const ch of run('Object.values(GAME_DATA.characters).map(c=>({id:c.id}))')){
 const repeat=run(`PointerHoldInputService.isRepeatablePrimary({character:GAME_DATA.characters[${JSON.stringify(ch.id)}]},GAME_DATA.characters[${JSON.stringify(ch.id)}].abilities.lmb)`);
 assert.equal(repeat,!['clea','raise'].includes(ch.id),ch.id);
 assert.equal(run(`PointerHoldInputService.isRepeatablePrimary({character:GAME_DATA.characters[${JSON.stringify(ch.id)}]},GAME_DATA.characters[${JSON.stringify(ch.id)}].abilities.rmb)`),false,ch.id+' RMB');
}
console.log('PASS all66 characters: Clea and Raise primary forbid hold repeat; every RMB excluded');
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

start('raise');run("PointerHoldInputService.press('lmb')");const clicks=run("ProgressStateService.state(Training.player,'raise-punch-charge')?.value||0");assert.equal(clicks,1);for(let now=1100;now<=2000;now+=100){setClock(now);run(`PointerHoldInputService.update(${now})`)}assert.equal(run("ProgressStateService.state(Training.player,'raise-punch-charge')?.value||0"),1);run("PointerHoldInputService.release('lmb');PointerHoldInputService.press('lmb')");assert.equal(run("ProgressStateService.state(Training.player,'raise-punch-charge')?.value||0"),2);console.log('PASS Raise held primary stays1 click; release and fresh click adds2nd');

start('quri');
run(`globalThis.quriUses=0;globalThis.quriOriginalUse=Training.use;Training.use=function(...args){quriUses++;return quriOriginalUse.apply(this,args)};PointerHoldInputService.press('lmb')`);
assert.equal(run('quriUses'),1,'first formula click allowed');
for(const distance of [0,199,200]){
 run(`Training.mouseWorld=()=>({x:500+${distance},y:500})`);
 setClock(4000+distance);run(`PointerHoldInputService.update(${4000+distance})`);
 assert.equal(run('quriUses'),1,'inside and boundary block repeat');
}
run('Training.mouseWorld=()=>({x:701,y:500})');setClock(5000);run('PointerHoldInputService.update(5000)');assert.equal(run('quriUses'),2,'outside repeats');
run('Training.mouseWorld=()=>({x:600,y:500})');setClock(6000);run('PointerHoldInputService.update(6000)');assert.equal(run('quriUses'),2,'re-entering circle blocks');
run(`PointerHoldInputService.release('lmb');PointerHoldInputService.press('lmb')`);assert.equal(run('quriUses'),3,'fresh formula click allowed');
run('Training.use=quriOriginalUse');
console.log('PASS Quri inside/boundary hold blocked, outside repeats, reentry blocks, fresh click allowed');
