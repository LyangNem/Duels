const assert=require('node:assert/strict');const {run,setClock}=require('./support/runtime-harness.cjs');
const value=s=>run(s);
assert.equal(value('GAME_DATA.characters.lunet.maxHealth'),1100);assert.equal(value('GAME_DATA.characters.latis.maxHealth'),1200);assert.equal(value('GAME_DATA.characters.latis.attacks.lmb.cost'),200);
for(const [slot,ms] of [['lmb',2000],['rmb',3000]]){
 assert.equal(value(`GAME_DATA.characters.lunet.attacks.${slot}.modules[2].field.duration`),ms);
 for(const i of [0,1,2])assert.equal(value(`GAME_DATA.characters.lunet.attacks.${slot}.modules[2].field.onTrigger[${i}].duration`),ms);
 assert.equal(value(`GAME_DATA.characters.lunet.attacks.${slot}.modules[2].field.onTrigger[1].value`),100);assert.equal(value(`GAME_DATA.characters.lunet.attacks.${slot}.modules[2].field.onTrigger[2].data.value`),50);
}
assert.equal(value('GAME_DATA.characters.lunet.attacks.rmb.modules[2].field.range'),176);
for(const [key,expected] of [['lmb','150/100~300'],['rmb','200/150~450'],['counter','150/100~300']]){
 assert.ok(value(`CharacterDescriptionService.interpolate(GAME_DATA.characters.terdion,GAME_DATA.characters.terdion.tooltipSkills.find(s=>s.attack==='${key}'))`).includes(expected));
}
assert.equal(value('GAME_DATA.characters.terdion.attacks.rmb.cost'),650);
value("var g=GAME_DATA.characters.gereta;var html=CharacterDescriptionService.html(g)");assert.ok(value('html').includes('스테미나 200~650'));assert.ok(value('html').includes('스테미나 200'));
assert.equal(value("g.tooltipSkills.some(s=>s.key==='RMB')"),false);
assert.equal(value('g.attacks.rmb.cost'),200);assert.equal(value('g.attacks.rmb.charge.costMax'),650);assert.equal(value('ChargedAttackService.dynamicSpec(g.attacks.rmb,1).damageRatio*g.baseDamage'),800);assert.equal(value('g.color'),'#bcbcbc');
assert.equal(value('GAME_DATA.characters.airi.attacks.rmb.modules[0].radius'),25);assert.equal(value('GAME_DATA.characters.airi.attacks.rmb.modules[3].duration'),1000);assert.equal(value('GAME_DATA.characters.airi.attacks.lmb.cost'),150);
assert.equal(value("GAME_DATA.characters.geopin.abilities.rmb.releaseTrigger.modules.find(m=>m.type==='movement.path-carrier').speed"),1800);
console.log('PASS396 all balance data and rendered damage/cost references, Gereta gray preserved');
