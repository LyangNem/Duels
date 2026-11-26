const assert=require('node:assert/strict');const {run,setClock}=require('./support/runtime-harness.cjs');
for(const id of ['cherity','prill','huri'])for(const immunityBefore of [false,true]){
 setClock(1000);run(`Training.selectedCharacterId='${id}';Training.start();var p=Training.player;`);if(immunityBefore)run("BuffService.set(p,'statusImmunity',1,'test',5000)");
 if(id==='cherity')run("PointerHoldInputService.press('lmb')");if(id==='prill')run("Training.use('rmb');ChannelAttackService.update(p,1000)");if(id==='huri')run("CounterStockService.acquire(p,5000,1000,1000);Training.use('counter')");
 setClock(1600);run('CounterModuleService.update(p,1600,()=>0);ChannelAttackService.update(p,1600)');const type=id==='huri'?'stun':'bind';assert.equal(run(`CCService.has(p,'${type}')`),true,id+' applies self CC under immunity');
 run(`var self=p.statuses.get('${type}').find(s=>CCService.isSelfApplied(p,s));var end=self.end;CCService.add(p,'${type}',5000,Training.dummy.id,{sourceEntityId:Training.dummy.id});BuffService.set(p,'statusImmunity',1,'test',5000)`);
 assert.equal(run(`p.statuses.get('${type}').length`),1);assert.equal(run(`p.statuses.get('${type}')[0]===self`),true);assert.equal(run('self.end===end'),true);
 run("BuffService.refresh(p,'statusImmunity',1,'test',5000);BuffService.add(p,'statusImmunity',1,5000,'other')");assert.equal(run(`CCService.has(p,'${type}')`),true);assert.equal(run("CCService.add(p,'freeze',5000,Training.dummy.id,{sourceEntityId:Training.dummy.id})"),false);
}
console.log('PASS actual Cherity charge bind/Prill channel bind/Huri recovery stun before+after immunity, mixed same-type enemy removed, self identity/duration retained across set/refresh/add, enemy freeze still blocked');
