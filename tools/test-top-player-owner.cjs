const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),path=require('path');
const cards=[];
function card(pid,account){const c={dataset:{id:'latis',...(pid?{masteryPid:pid}:{})},_recordAccountData:account,badge:null,querySelector(){return this.badge},appendChild(b){this.badge=b;b.remove=()=>this.badge=null}};cards.push(c);return c;}
const context={AccountState:{current:{firebaseUid:'me',accountId:'legacy',isGuest:false}},RoomService:{localPid:'P1',members:new Map([['P2',{profile:{firebaseUid:'peer',accountId:'old-peer'}}],['P3',{profile:{isGuest:true,accountId:'guest'}}]])},CharacterCardLayoutService:{schedule(){}},document:{querySelectorAll:()=>cards,createElement:()=>({})}};
vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(__dirname,'../src/account/CharacterRecordService.js'),'utf8')+'\nthis.service=CharacterRecordService',context);
const s=context.service,me=card('P1'),peer=card('P2'),missing=card('P4',context.AccountState.current),guest=card('P3'),normal=card();
s.allRankingState.characters={latis:[{accountId:'me'}]};s.refreshTopPlayerBadges();assert.ok(me.badge);assert.ok(normal.badge);assert.equal(peer.badge,null);assert.equal(missing.badge,null);assert.equal(guest.badge,null);
s.allRankingState.characters.latis=[{accountId:'peer'}];s.refreshTopPlayerBadges();assert.equal(me.badge,null);assert.equal(normal.badge,null);assert.ok(peer.badge);
context.RoomService.members.get('P2').profile={accountId:'peer'};s.refreshTopPlayerBadges();assert.ok(peer.badge);context.RoomService.members.delete('P2');s.refreshTopPlayerBadges();assert.equal(peer.badge,null);
console.log('PASS local/remote TOP ownership, Firebase UID priority, legacy identity fallback, missing/guest hidden and ranking refresh removes stale badges');
