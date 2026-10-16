const assert=require('node:assert/strict');const {run,setClock,c}=require('./support/runtime-harness.cjs');
function reset(){setClock(1000);run(`Training.selectedCharacterId='lena';Training.start();Training.settings.infiniteStamina=false;Training.settings.infiniteHp=false;Training.player.x=500;Training.player.y=500;Training.player.stamina=1000;Training.dummy.x=620;Training.dummy.y=500;Training.dummy.health=5000;Training.dummy.maxHealth=5000;Training.dummy.healthPolicy.invulnerable=false;Training.mouseWorld=()=>({x:1500,y:500});`)}
function use(slot){return run(`AbilityService.activate(Training.player,Training.player.character.abilities.${slot},{angle:0})`)}
reset();assert.equal(run('Training.player.maxHealth'),1200);use('lmb');assert.equal(run('Training.dummy.health'),4900);assert.equal(run("CCService.has(Training.dummy,'zap')"),false);setClock(1400);use('lmb');assert.equal(run('Training.dummy.health'),4800);assert.equal(run("CCService.has(Training.dummy,'zap')"),true);assert.equal(run('Training.player.attackSequence'),2);use('lmb');assert.equal(run('Training.player.attackSequence'),2);console.log('PASS first attack normal, chained attack zap, shared input cooldown');
setClock(6401);assert.equal(run("CCService.has(Training.dummy,'zap')"),false);reset();use('lmb');setClock(1501);assert.equal(run("AbilityService.eventAttack(Training.player,Training.player.character.abilities.lmb).id"),'attack.lena.lmb');console.log('PASS 500ms window expiry and 5s zap expiry');
reset();run('Training.dummy.x=720');use('rmb');assert.equal(run('Training.dummy.health'),5000);for(let t=1010;t<=1400;t+=10){setClock(t);run('Training.update(10,performance.now())')}assert.equal(run('Training.dummy.health'),4850);console.log('PASS dash has no premature damage; collision area once');
reset();run('Training.player.counterReadyCharges=1;Training.player.counterReadyUntil=10000');use('counter');for(let t=1010;t<=1400;t+=10){setClock(t);run('Training.update(10,performance.now())')}assert.equal(run('Training.dummy.health'),4850);console.log('PASS circular counter damage');
reset();run('Training.dummy.x=950');use('rmb');for(let t=1010;t<=1400;t+=10){setClock(t);run('Training.update(10,performance.now())')}assert.equal(run('Training.dummy.health'),5000);console.log('PASS no collision at maximum dash distance gives no area damage');
reset();use('lmb');run('Training.dummy.x=720');setClock(1400);use('rmb');for(let t=1410;t<=1800;t+=10){setClock(t);run('Training.update(10,performance.now())')}assert.equal(run("CCService.has(Training.dummy,'zap')"),true);console.log('PASS chained dash carries 5s zap into delayed impact');
reset();run('Training.dummy.x=900;DebugMapService.walls=()=>[{x:650,y:450,w:40,h:100}]');use('rmb');for(let t=1010;t<=1400;t+=10){setClock(t);run('Training.update(10,performance.now())')}assert.ok(run('Training.player.x')<650);assert.equal(run('Training.dummy.health'),5000);console.log('PASS wall blocks dash and area damage');
reset();run('DebugMapService.walls=()=>[]');use('lmb');setClock(1400);run('Training.player.counterReadyCharges=1;Training.player.counterReadyUntil=10000');use('counter');for(let t=1410;t<=1800;t+=10){setClock(t);run('Training.update(10,performance.now())')}assert.equal(run("CCService.has(Training.dummy,'zap')"),true);console.log('PASS counter keeps input-time combo through windup');
assert.equal(run('Training.player.character.color'),'#e4ed36');assert.equal(run('Training.player.character.moveLabel'),'빠름');assert.equal(run('Training.player.character.classification.style'),3);assert.equal(run('Training.player.character.classification.role'),5);

// Regression: contact and collision used to finish the same move twice at point blank.
for(const distance of [0,10,40,60,120]){
 reset();run(`Training.dummy.x=${500+distance}`);use('rmb');
 assert.equal(run('Training.player.stamina'),700);
 assert.ok(run("ModeStateService.state(Training.player,'lena-board-motion').turns")>0);
 for(let t=1010;t<=1400;t+=10){setClock(t);run('Training.update(10,performance.now())')}
 assert.equal(run('Training.dummy.health'),4850);
 assert.equal(run("[...Training.player._attackExecutionRegistry.values()].filter(x=>x.attackId==='attack.lena.rmbImpact').length"),1);
}
console.log('PASS point-blank collision produces exactly one impact, cost300, board spin');
reset();use('lmb');assert.equal(run('Training.player.stamina'),900);
assert.equal(run('RuntimeValueReferenceService.resolve(Training.player,Training.player.character.worldGaugeModules[0].valueRef)'),1);
setClock(1250);assert.equal(run('RuntimeValueReferenceService.resolve(Training.player,Training.player.character.worldGaugeModules[0].valueRef)'),.5);
setClock(1501);assert.equal(run('RuntimeValueReferenceService.resolve(Training.player,Training.player.character.worldGaugeModules[0].valueRef)'),0);
console.log('PASS cost100 and combo arc 500ms countdown');
reset();run('var boardConfig=Training.player.character.worldEffectModules[0]');
assert.equal(run('ModeGearPresentationService.facingAngle(Training.player,boardConfig)'),0);
run('Training.player.y-=20');assert.equal(run('ModeGearPresentationService.facingAngle(Training.player,boardConfig)'),-Math.PI/2);
run('Training.player.x-=20');assert.equal(run('ModeGearPresentationService.facingAngle(Training.player,boardConfig)'),Math.PI);
assert.equal(run('ModeGearPresentationService.facingAngle(Training.player,boardConfig)'),Math.PI);
run('var fixed=ModeGearPresentationService.sampleImage(Training.player,boardConfig,performance.now());Training.player.y+=20');assert.equal(run('fixed.sample.facingAngle'),Math.PI);
console.log('PASS board follows actual movement, retains stopped direction, snapshots freeze angle');
reset();run('Training.dummy.x=1800;AbilityService.activate(Training.player,Training.player.character.abilities.rmb,{angle:Math.PI/2})');
assert.equal(run('ModeGearPresentationService.facingAngle(Training.player,Training.player.character.worldEffectModules[0])'),Math.PI/2);
console.log('PASS dash immediately orients board and starts rotation');

reset();let ringDashes=[];c.lenaGaugeCtx={save(){},restore(){},beginPath(){},arc(){},stroke(){},setLineDash(v){ringDashes.push([...v])}};
run('ArcGaugePresentationService.render(lenaGaugeCtx,Training.player,1,Training.player.character.worldGaugeModules[0])');assert.ok(ringDashes.some(v=>String(v)==='4,3'));
ringDashes=[];run('ArcGaugePresentationService.render(lenaGaugeCtx,Training.player,.5,Training.player.character.worldGaugeModules[0])');assert.equal(ringDashes.some(v=>v.length>0),false);
assert.equal(run('Training.player.character.tooltipSkills[2].text'),'적 또는 벽에 적중 시 주변에 피해 ({linkedDamage})');console.log('PASS combo gauge dashed ring only at full; skill tooltip');
