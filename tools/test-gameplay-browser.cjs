const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
(async()=>{
 const listeners={},docListeners={};let calls=0,locks=0,unlocks=0,deny=true;
 const c={Training:{active:true},window:{addEventListener:(k,f,capture)=>{assert.equal(capture,true);listeners[k]=f}},document:{fullscreenElement:null,addEventListener:(k,f)=>docListeners[k]=f},navigator:{keyboard:{lock:async keys=>{assert.deepEqual(Array.from(keys),['KeyW']);locks++},unlock:()=>unlocks++}},Promise};
 c.document.documentElement={requestFullscreen:()=>{calls++;if(deny)return Promise.reject(Error('activation required'));c.document.fullscreenElement={};return Promise.resolve()}};
 vm.createContext(c);vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'../src/core/GameplayBrowserService.js'),'utf8')+'\nthis.service=GameplayBrowserService;',c);
 const flush=()=>new Promise(resolve=>setImmediate(resolve));
 c.service.enter();await flush();assert.equal(calls,1);assert.equal(c.service.pending,true);
 deny=false;listeners.pointerdown({isTrusted:true});await flush();assert.equal(calls,2);assert.equal(locks,1);assert.equal(c.service.pending,false);
 let prevented=0,stopped=0;const key={key:'w',code:'KeyW',ctrlKey:true,preventDefault:()=>prevented++,stopImmediatePropagation:()=>stopped++};
 listeners.keydown(key);assert.equal(prevented,1);assert.equal(stopped,1);
 listeners.keydown({...key,ctrlKey:false});assert.equal(prevented,1);
 c.Training.active=false;listeners.keydown(key);assert.equal(prevented,1);
 c.document.fullscreenElement=null;docListeners.fullscreenchange();assert.equal(unlocks,1);c.Training.active=true;listeners.pointerdown({isTrusted:true});await flush();assert.equal(calls,2);
 c.document.documentElement.requestFullscreen=()=>{throw Error('unsupported policy')};c.service.enter();assert.equal(c.service.requesting,false);
 delete c.document.documentElement.requestFullscreen;c.service.enter();assert.equal(c.service.pending,false);
 console.log('PASS gameplay browser: denied retry, fullscreen/lock, Ctrl+W scope, movement W, Escape, unsupported APIs');
})().catch(e=>{console.error(e);process.exitCode=1});
