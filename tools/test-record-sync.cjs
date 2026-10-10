const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
(async()=>{
 let resolveLoad,cacheWrites=[],pendingProfile;const user={uid:'uid'};
 const c={console,AccountState:{current:null},AccountUI:{enter:a=>c.AccountState.current=a,updateChip:()=>{},setSyncState:()=>{}},ProfileSettingsUI:{render:()=>{}},PlayerProfileService:{snapshot:a=>a},RoomService:{localMember:()=>null},document:{getElementById:()=>null},FirebaseAccountCacheService:{load:()=>({duelsAccountReady:true,characterRecords:{siro:100},characterStats:{siro:{wins:1}}}),save:(profile)=>cacheWrites.push(profile)},DuelsFirebase:{currentUser:()=>user,loadOwnAccount:()=>new Promise(resolve=>resolveLoad=resolve)}};
 vm.createContext(c);for(const [file,name] of [['src/account/FirebaseAccountMigrationUI.js','FirebaseAccountMigrationUI'],['src/account/CharacterRecordProgressionService.js','CharacterRecordProgressionService']])vm.runInContext(fs.readFileSync(path.join(__dirname,'..',file),'utf8')+'\nthis.'+name+'='+name,c);
 const flush=()=>new Promise(resolve=>setImmediate(resolve));
 await c.FirebaseAccountMigrationUI.afterGoogleLogin(user);assert.equal(c.AccountState.current.characterRecords.siro,100);
 // Settlement finalizes while the old login response is in flight.
 c.AccountState.current.characterRecords={siro:200};c.AccountState.current.characterStats={siro:{wins:2}};
 c.CharacterRecordProgressionService.setAuthoritativeProgress({characterRecords:{siro:200},characterStats:{siro:{wins:2}}});assert.equal(cacheWrites.at(-1).characterRecords.siro,200);
 resolveLoad({duelsAccountReady:true,displayName:'updated profile',characterRecords:{siro:100},characterStats:{siro:{wins:1}}});await flush();
 assert.equal(c.AccountState.current.characterRecords.siro,200);assert.equal(c.AccountState.current.characterStats.siro.wins,2);assert.equal(c.AccountState.current.displayName,'updated profile');assert.equal(cacheWrites.at(-1).characterRecords.siro,200);
 // Pending optimistic state is preserved but must not replace confirmed cache.
 await c.FirebaseAccountMigrationUI.afterGoogleLogin(user);c.AccountState.current.recordSettlementPending=true;c.AccountState.current.characterRecords={siro:300};resolveLoad({duelsAccountReady:true,characterRecords:{siro:200},characterStats:{siro:{wins:2}}});await flush();assert.equal(c.AccountState.current.characterRecords.siro,300);assert.equal(cacheWrites.at(-1).characterRecords.siro,200);
 console.log('PASS delayed login cannot overwrite confirmed/new or pending record; authoritative progress cache refreshed; profile updates retained');
})().catch(e=>{console.error(e);process.exitCode=1});
