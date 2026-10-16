const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
let wallNow=0;const c={performance:{now:()=>wallNow},COMBAT_BUFF_DEFS:{speed:{},staminaRegen:{},dodgeDistance:{}},EMPTY_RUNTIME_ITEMS:[],EntityService:{items:new Map()},RelationService:{relation:(s,t)=>s.teamId===t.teamId?'ally':'enemy'},NetworkHitAuthorityService:{targetAuthoritative:t=>t.local!==false},EffectSpawnService:{spawn:()=>{}},GAME_DATA:{frameMs:1000/60},characterValue:()=>0};vm.createContext(c);
for(const name of ['BuffService','TimedThresholdBuffService'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../src/core/'+name+'.js'),'utf8')+'\nthis.'+name+'='+name,c);
vm.runInContext('this.char='+fs.readFileSync(path.join(__dirname,'../src/data/characters/nsonya.js'),'utf8'),c);
const svc=c.TimedThresholdBuffService,moduleConfig=c.char.attacks.rmbPulse.modules.find(m=>m.type==='buff.time-add'),group=moduleConfig.group;
function entity(id,x=0,local=true,teamId='A'){return{id,x,y:0,radius:20,alive:true,local,teamId,buffs:new Map()}}
const source=entity('source'),ally=entity('ally',100),outside=entity('outside',1000),enemy=entity('enemy',100,true,'B'),remote=entity('remote',100,false);
for(const e of [source,ally,outside,enemy,remote])c.EntityService.items.set(e.id,e);
wallNow=0;svc.add(source,moduleConfig,source,0);svc.add(ally,moduleConfig,source,0);assert.equal(svc.remaining(ally,group,0),5000);assert.equal(svc.master(ally,group,0).config.aura,null);
// Rendering/processing happens 80ms after the frame timestamp: must not inflate timers.
for(let now=10;now<=1000;now+=10){wallNow=now+80;svc.updateAuras(now,10)}
assert.equal(svc.remaining(ally,group,1000),6000);assert.equal(svc.remaining(source,group,1000),4000);
assert.equal(svc.remaining(outside,group,1000),0);assert.equal(svc.remaining(enemy,group,1000),0);assert.equal(svc.remaining(remote,group,1000),0);
// Leaving aura restores normal decay. Entering after cast gains only gradual charge.
ally.x=1000;outside.x=100;for(let now=1010;now<=2000;now+=10){wallNow=now+80;svc.updateAuras(now,10)}
assert.equal(svc.remaining(ally,group,2000),5000);assert.equal(svc.remaining(outside,group,2000),1010);
wallNow=2000;svc.add(ally,moduleConfig,source,2000);assert.equal(svc.remaining(ally,group,2000),10000);
console.log('PASS timed threshold: cast one segment, exact gradual rate despite frame/processing clock skew, leave/late entry, no ally aura propagation, enemy/remote exclusion');
