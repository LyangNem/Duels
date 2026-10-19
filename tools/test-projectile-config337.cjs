const assert=require('node:assert/strict');
const {run,setClock}=require('./support/runtime-harness.cjs');
setClock(1000);
function start(character){
  run(`Training.sessionMode='training';Training.selectedCharacterId=${JSON.stringify(character)};Training.start();
    Training.settings.infiniteStamina=false;Training.player.x=500;Training.player.y=500;
    Training.dummy.x=600;Training.dummy.y=500;Training.dummy.healthPolicy.invulnerable=false;`);
}
function fields(){return run(`[...Training.player.actionState.values()].filter(s=>s.kind===InstalledAreaFieldService.KIND)`);}

// Inspect real compiled AttackSpecs, not a hand-built runtime behavior that skips config().
const missing=run(`(()=>{
  const failures=[];
  const types={'projectile.impact':'impact','projectile.return':'returning','projectile.collision':'collision','projectile.waypoint-path':'waypoint'};
  function walk(value,path){
    if(!value||typeof value!=='object')return;
    if(types[value.type]){
      const result=ProjectileModuleService.config({modules:[value]})[types[value.type]];
      for(const key of Object.keys(value)){
        if(key==='type'||key==='attackId')continue;
        if(!Object.hasOwn(result,key))failures.push(path+':'+key);
      }
    }
    for(const [key,child] of Object.entries(value))walk(child,path+'.'+key);
  }
  for(const [id,ch] of Object.entries(GAME_DATA.characters))walk(ch.attacks,id+'.attacks');
  return failures;
})()`);
assert.deepEqual(Array.from(missing),[]);
console.log('PASS all registered characters: projectile behavior conversion preserves declared options');

for(const avoided of ['just-dodge','invulnerable','none']){
  start('roon');
  run(`AttackService.execute(Training.player,Training.player.character.attacks.rmb,0);
    var shot=ProjectileService.items[0];shot.prevX=540;shot.x=600;shot.travel=100;`);
  if(avoided==='just-dodge')run('JustDodgeService.begin(Training.dummy,1000)');
  if(avoided==='invulnerable')run('Training.dummy.invincibleUntil=2000');
  run('ProjectileService.processTargets(shot,0,1000)');
  assert.equal(fields().length,avoided==='none'?1:0,avoided);
  assert.equal(run('shot.hadHit'),avoided==='none',avoided);
  if(avoided==='just-dodge')assert.equal(run('Training.dummy.justDodgeConsumed'),true);
  if(avoided!=='none'){
    assert.equal(run('Training.dummy.health'),10000);
    assert.equal(run('Training.player.movementAbility!=null'),false);
    run(`var previousActive=OnlineDuelService.active;OnlineDuelService.active=true;OnlineDuelService.roundResolving=false;`);
    assert.equal(run(`OnlineDuelService.sendProjectileImpactConfirmed(shot,'target')`),false);
    run('OnlineDuelService.active=previousActive');
  }
}
console.log('PASS Roon real projectile contact: just dodge/invulnerability cannot create zone/relocate/send hit impact; successful hit creates zone');

for(const attackKey of ['lmb','counter']){
  start('sherina');
  run(`AttackService.execute(Training.player,Training.player.character.attacks.${attackKey},0);
    var shot=ProjectileService.items[0];shot.x=800;shot.y=500;shot.travel=300;
    ProjectileImpactService.updatePath(shot);`);
  assert.equal(fields().length,1);
  assert.equal(fields()[0].module.range,300);
  run(`shot.x=650;shot.travel=150;
    var savedGuardFx=AttackGuardService.parryFx,savedOccurrence=AttackGuardService.registerBlockOccurrence,savedBroadcast=AttackGuardService.broadcastProjectileResolution;
    AttackGuardService.parryFx=()=>{};AttackGuardService.registerBlockOccurrence=()=>{};AttackGuardService.broadcastProjectileResolution=()=>{};
    try{AttackGuardService.remove(shot,0,{source:Training.dummy},1000);}
    finally{AttackGuardService.parryFx=savedGuardFx;AttackGuardService.registerBlockOccurrence=savedOccurrence;AttackGuardService.broadcastProjectileResolution=savedBroadcast;}`);
  assert.equal(fields().length,1);
  assert.equal(fields()[0].module.range,150);
  assert.equal(fields()[0].module.liveProjectilePath,false);
  assert.equal(run('ProjectileService.items.includes(shot)'),false);
}
console.log('PASS Sherina LMB/counter: actual guard removal finalizes existing echo at stopped distance');

for(const [character,attackKey,allowed,denied] of [
  ['jerry','lmb','arrival','target'],
  ['lime','counter','arrival','boundary'],
  ['quri','counter','arrival','guard'],
  ['nyu','rmb','range','target']
]){
  start(character);
  run(`var attack=Training.player.character.attacks.${attackKey};
    var makeShot=()=>({source:Training.player,attack,behavior:ProjectileModuleService.config(attack),
      x:900,y:500,angle:0,hadHit:true,networkKey:'reason-test:'+Math.random(),
      volley:{execution:AttackExecutionService.create(Training.player,attack,0)}});
    var shot=makeShot();`);
  const before=fields().length;
  assert.equal(run(`ProjectileImpactService.resolve(shot,${JSON.stringify(denied)})`),false,character);
  assert.equal(run('shot.impactResolved===true'),false,character);
  assert.equal(fields().length,before,character);
  assert.equal(run(`ProjectileImpactService.resolve(shot,${JSON.stringify(allowed)})`),true,character);
  assert.equal(run('shot.impactResolved'),true,character);
  assert.equal(run(`ProjectileImpactService.allowsReason(shot.behavior.impact,${JSON.stringify(allowed==='arrival'?'target-point':allowed)})`),true);
}
console.log('PASS Jerry/Lime/Quri/Nyu: only configured impact reasons run follow-ups; target-point/arrival aliases work');

start('siro');
assert.equal(run(`ProjectileModuleService.config(Training.player.character.attacks.counterArrow).impact.previewAttackIds.length`),0);
assert.equal(run(`ProjectileImpactService.allowsReason(ProjectileModuleService.config(Training.player.character.attacks.rmb).impact,'wall')`),true);
console.log('PASS preview-only empty list retained; unspecified impact reasons keep existing unrestricted behavior');
