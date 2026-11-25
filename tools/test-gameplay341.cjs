const assert=require('node:assert/strict');
const {run,setClock}=require('./support/runtime-harness.cjs');
setClock(1000);run("Training.selectedCharacterId='van';Training.start()");
assert.equal(run('AttackVisualStyle.fadeOpacity(1)'),1);assert.equal(run('AttackVisualStyle.fadeOpacity(0)'),.35);
assert.ok(Math.abs(run('AttackVisualStyle.fadeOpacity(.5)')-.675)<1e-12);
run(`var styles=[];var ctx=new Proxy({globalAlpha:1,measureText:t=>({width:String(t).length*7}),createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}})},{get:(o,k)=>k in o?o[k]:(()=>{}),set:(o,k,v)=>{o[k]=v;if(k==='strokeStyle'||k==='fillStyle')styles.push(v);return true}});
 AreaCircleEffectPresentationService.draw(ctx,{type:'areaCircle',x:500,y:500,r:100,start:1000,dur:1000,color:'#FF0000',strokeAlpha:1,fillAlpha:1,fadeOut:true},1900);`);
assert.ok(run('styles.some(s=>typeof s===\'string\'&&s.includes(\'0.414\'))')||run('styles.some(s=>typeof s===\'string\'&&s.includes(\'0.415\'))'));
// Actual training renderer includes all registered shapes; animation time remains unmodified.
run(`Training.ctx=ctx;Training.draw()`);
console.log('PASS shared fade keeps 35% terminal opacity, real circle uses policy, actual Training.draw remains valid');
