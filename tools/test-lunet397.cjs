const assert=require('node:assert/strict');
const {run,setClock}=require('./support/runtime-harness.cjs');
setClock(1000);run(`Training.selectedCharacterId='lunet';Training.start();var target=Training.dummy;target.healthPolicy.invulnerable=false;var source=Training.player;
var addPoison=(id,value,duration)=>CCService.add(target,'poison',duration,id,{mode:'flat',value,interval:1000,tickAtEnd:true,stackMode:'refresh-source',damagePriority:'highest',sourceEntityId:source.id});
addPoison('weak',100,8000);`);
function update(t,damage){setClock(t);run(`CCService.update(target,${t})`);assert.equal(run('10000-target.health'),damage,`damage at ${t}`)}
update(2000,100);
setClock(2400);run("addPoison('strong',150,2100)");
assert.equal(run("target.statuses.get('poison')[1].nextTick"),3000);
update(2999,100);update(3000,250);
setClock(3350);run("addPoison('weak',100,8000)");
update(3999,250);update(4000,400);
update(4501,400);update(4999,400);update(5000,500);
// Repeated fresh sources at different phases cannot add an extra tick.
for(const t of [5150,5370,5660]){setClock(t);run(`addPoison('extra-${t}',100,2000)`)}
update(5999,500);update(6000,600);update(6999,600);update(7000,700);
console.log('PASS overlapping priority poison shares cadence; strong expiry, refresh and new sources preserve 1s spacing');
