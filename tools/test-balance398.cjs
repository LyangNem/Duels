const assert=require('node:assert/strict');
const {run,setClock}=require('./support/runtime-harness.cjs');
for(const [id,slot,min,max] of [['gereta','rmb',200,800],['mainmad','lmb',200,600],['hatsuhats','lmb',150,450]]){
 setClock(1000);run(`Training.selectedCharacterId='${id}';Training.start();var p=Training.player;var a=p.character.attacks.${slot};`);
 const values=[];
 for(let i=0;i<=100;i++){
  const t=i/100;
  const damage=run(id==='hatsuhats'?`(()=>{p.actionState.set('progress:hatsuhats:lmb',{value:${t}});return ProgressScaledAttackService.resolve(p,a).damageRatio*p.character.stats.baseDamage})()`:`ChargedAttackService.dynamicSpec(a,${t}).damageRatio*p.character.stats.baseDamage`);
  assert.ok(Math.abs(damage/50-Math.round(damage/50))<1e-7,`${id}: ${damage}`);values.push(Math.round(damage));
 }
 assert.equal(values[0],min);assert.equal(values.at(-1),max);
 assert.deepEqual([...new Set(values)],Array.from({length:(max-min)/50+1},(_,i)=>min+i*50));
}
console.log('PASS actual charge/progress resolution: all three attacks increase in 50 damage steps; endpoints unchanged');
