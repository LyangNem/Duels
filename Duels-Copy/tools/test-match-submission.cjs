const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
(async()=>{
 let ready=false,refreshes=[],timers=[],calls=[],active=0,maxActive=0;
 const c={AccountState:{current:{accountId:'account'}},DuelsFirebase:{currentUser:()=>({uid:'uid',getIdToken:async force=>{refreshes.push(force);return'token'}})},DUELS3_CONFIG:{accountApiBase:'https://example.invalid'},AbortController,setTimeout:(fn,ms)=>{if(ms!==25000)timers.push(fn);return 1},clearTimeout:()=>{},fetch:async(url,options)=>{active++;maxActive=Math.max(maxActive,active);await Promise.resolve();const data=JSON.parse(options.body);const id=data.submission.settlementId;calls.push(id);active--;return{ok:true,status:200,json:async()=>id==='match:1'&&!ready?{ok:true,finalized:false}:{ok:true,finalized:true,progress:{characterRecords:{a:100}},result:{characterId:'a'}}}}};
 vm.createContext(c);vm.runInContext(fs.readFileSync(path.join(__dirname,'../src/core/MatchResultSubmissionService.js'),'utf8')+'\nthis.s=MatchResultSubmissionService;',c);
 const flush=()=>new Promise(resolve=>setImmediate(resolve));
 const one=c.s.submitRound({}, {settlementId:'match:1'});await flush();assert.deepEqual(calls,['match:1']);assert.equal(timers.length,1);
 const duplicate=c.s.submitRound({}, {settlementId:'match:1'});
 const two=c.s.submitRound({}, {settlementId:'match:2'});await flush();const result=await two;assert.equal(result.finalized,true);assert.deepEqual(calls,['match:1','match:2']);assert.equal(maxActive,1);
 ready=true;timers.shift()();await flush();assert.equal((await one).finalized,true);assert.equal((await duplicate).finalized,true);assert.deepEqual(calls,['match:1','match:2','match:1']);assert.equal(c.s.settlements.size,0);assert.equal(c.s.queues.size,0);
 console.log('PASS unresolved first round does not block next submission; request serialization; duplicate id; retries preserve snapshot; queue cleanup');
})().catch(e=>{console.error(e);process.exitCode=1});
