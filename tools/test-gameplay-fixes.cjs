const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
function load(context,file,name){vm.runInContext(fs.readFileSync(path.join(root,file),'utf8')+`;globalThis.${name}=${name};`,context)}
function context(){
 const entities=new Map(),effects=[],messages=[];
 const c={console,performance:{now:()=>1000},Map,Set,Math,Float64Array,WeakSet,
 MatchModeService:{DUEL:'duel'},CharacterSortService:{loadMode:()=> 'default'},
 OnlineParticipantEntityService:{entity:pid=>entities.get(pid)||null},
 GAME_DATA:{frameMs:16,canvas:{width:100,height:100},cameraFollow:{edgeOverscanRatio:0}},WorldBoundsService:{width:()=>1000,height:()=>1000},
 KillRewardService:{key:(t,p)=>t+':'+p,rewardLocalKiller(){}},CombatEventToastService:{kill(){}},MasterRecordMilestonePresentationService:{elimination(){}},Presentation:{deathLaunch(){}},
 CharacterRecordProgressionService:{reset(){}},RoomIdentityService:{key:()=> 'session'},PlayerProfileService:{snapshot:()=>({})},RoomConnectionService:{dispose(){}},
 RoomUI:{render(){},setStatus(){},showRoom(){}},RoomTeams:{red:{}},
 EntitySimulationAuthorityService:{isLocal:s=>s.local!==false},
 EffectSpawnService:{spawn:spec=>{effects.push(spec);return spec},definitionSnapshot:s=>structuredClone(s)},
 OnlinePresentationSyncService:{shouldSend:s=>s.local!==false,send:(...args)=>messages.push(args)},
 AbilityService:{attackById:()=>null},
 NetworkPayloadCodec:{decode:p=>p,send(){}},
 RoomService:{members:new Map(),matchPids:()=>[...entities.keys()]},
 ProjectileService:{items:[],findByNetworkKey:()=>null},ProjectileStateService:{get:()=>null}};
 vm.createContext(c);return{c,entities,effects,messages};
}
let count=0;function test(name,fn){fn();count++;console.log('PASS '+name)}
test('확정 사망의 처치자 자동 관전 / 중복 확정은 수동 해제 되돌리지 않음',()=>{const h=context();load(h.c,'src/modes/Training.js','Training');load(h.c,'src/network/OnlineDuelService.js','OnlineDuelService');const o=h.c.OnlineDuelService,t=h.c.Training;o.localPid='P1';o.roundToken=2;h.entities.set('P1',{kind:'player',alive:false,x:40,y:60});h.entities.set('P2',{kind:'player',alive:true,x:400,y:500});const p={roundToken:2,deadPid:'P1',killerPid:'P2'};assert.equal(o.receiveConfirmedDeath(p),true);assert.equal(t.spectating,true);assert.equal(t.spectator.followPid,'P2');assert.equal(t.spectator.x,400);t.spectatorReleaseFollow();o.receiveConfirmedDeath(p);assert.equal(t.spectator.followPid,null)});
test('사망 토큰 불일치·silent·상대 사망은 로컬 관전 변경 없음',()=>{const h=context();load(h.c,'src/modes/Training.js','Training');load(h.c,'src/network/OnlineDuelService.js','OnlineDuelService');const o=h.c.OnlineDuelService,t=h.c.Training;o.localPid='P1';o.roundToken=2;h.entities.set('P2',{kind:'player',alive:true,x:100,y:100});for(const p of [{roundToken:1,deadPid:'P1',killerPid:'P2'},{roundToken:2,deadPid:'P1',killerPid:'P2',silent:true},{roundToken:2,deadPid:'P3',killerPid:'P2'}])o.receiveConfirmedDeath(p);assert.equal(t.spectator.followPid,null);assert.equal(t.spectating,false)});
test('처치자 없음·이미 사망·이탈은 자유 관전 / 좌클릭 순환·우클릭 해제 유지',()=>{const h=context();load(h.c,'src/modes/Training.js','Training');load(h.c,'src/network/OnlineDuelService.js','OnlineDuelService');const t=h.c.Training,o=h.c.OnlineDuelService;o.localPid='P1';o.roundToken=2;h.entities.set('P2',{alive:false});o.receiveConfirmedDeath({roundToken:2,deadPid:'P1',killerPid:'P2'});assert.equal(t.spectator.followPid,null);h.entities.set('P2',{alive:true,x:200,y:200});h.entities.set('P3',{alive:true,x:400,y:400});t.spectatorPickPlayer();assert.equal(t.spectator.followPid,'P2');t.spectatorPickPlayer();assert.equal(t.spectator.followPid,'P3');t.spectatorReleaseFollow();assert.equal(t.spectator.followPid,null);h.entities.delete('P3');assert.equal(t.spectatorFollowPlayer('P3'),false)});
function fields(){const h=context();h.c.Training={sessionMode:'online'};load(h.c,'src/core/InstalledAreaFieldService.js','InstalledAreaFieldService');load(h.c,'src/projectiles/ProjectileImpactService.js','ProjectileImpactService');const field=h.c.InstalledAreaFieldService,source={id:'owner',alive:true,local:true,actionState:new Map()};const module={stateKey:'echo',anchorMode:'projectile-path',shape:'rect',range:798,halfWidth:18,duration:2500,liveProjectilePath:false,presentation:{type:'progressRect',range:798}};const state=field.activatePoint(source,module,{x:10,y:20},{instanceId:'projectile-impact:arrow:echo',now:100});source._recentProjectilePathFields=new Map([['echo',[{projectileKey:'arrow',pointX:10,pointY:20,module:{...module}}]]]);return{...h,field,source,state}}
test('사라진 투사체의 방어 확정도 잔향 판정·이펙트·RMB 경로를 접촉점까지 보정',()=>{const h=fields();assert.equal(h.c.ProjectileImpactService.correctGuardPath(h.source,'arrow',{x:110,y:20}),true);const state=h.source.actionState.get(h.state.storageKey);assert.equal(state.module.range,100);assert.equal(h.effects.at(-1).range,100);assert.equal(h.source._recentProjectilePathFields.get('echo')[0].module.range,100);assert.equal(state.startedAt,100);assert.equal(state.endsAt,2600);assert.equal(h.effects.at(-1).preserveTimeline,true);assert.equal(h.messages.at(-1)[2].preserveState,true);assert.equal(state.lastTriggerAt,h.state.lastTriggerAt)});
test('셰리나 평타·반격 공통 impact: 비행 경로와 종료 후 guard 재보정',()=>{const h=fields();const character=vm.runInNewContext('('+fs.readFileSync(path.join(root,'src/data/characters/sherina.js'),'utf8')+')');for(const attack of [character.attacks.lmb,character.attacks.counter]){const impact=attack.modules.find(m=>m.type==='projectile.impact');const projectile={source:h.source,origin:{x:10,y:20},x:300,y:20,angle:0,baseSpeed:28,networkKey:attack.id,behavior:{impact},impactResolved:false};h.c.ProjectileImpactService.resolve(projectile,'range');const id=h.field.storageKey('projectile-impact:'+attack.id+':'+impact.field.stateKey);const before=h.source.actionState.get(id);assert.equal(before.module.range,290);projectile.x=110;h.c.ProjectileImpactService.resolve(projectile,'guard');const after=h.source.actionState.get(id);assert.equal(after.module.range,100);assert.equal(after.endsAt,before.endsAt);assert.equal(after.lastTriggerAt,before.lastTriggerAt)}});
test('원격 경로도 보정 / 중복·더 먼 guard는 경로·수명 연장 없음',()=>{const h=fields();h.source.local=false;const messages=h.messages.length;h.c.ProjectileImpactService.correctGuardPath(h.source,'arrow',{x:110,y:20});h.c.ProjectileImpactService.correctGuardPath(h.source,'arrow',{x:300,y:20});const state=h.source.actionState.get(h.state.storageKey);assert.equal(state.module.range,100);assert.equal(state.endsAt,2600);assert.equal(h.messages.length,messages)});
test('만료된 잔향을 늦은 확정으로 되살리지 않음 / 다른 화살·잘못된 점 무시',()=>{const h=fields();h.state.endsAt=500;h.c.ProjectileImpactService.correctGuardPath(h.source,'arrow',{x:110,y:20});assert.equal(h.source.actionState.get(h.state.storageKey).endsAt,500);const calls=h.effects.length;assert.equal(h.c.ProjectileImpactService.correctGuardPath(h.source,'other',{x:110,y:20}),false);assert.equal(h.c.ProjectileImpactService.correctGuardPath(h.source,'arrow',{x:NaN,y:20}),false);assert.equal(h.effects.length,calls)});
test('온라인 guard 수신: 투사체 없어도 공통 경로 보정 실행',()=>{const h=fields();load(h.c,'src/network/OnlineDuelService.js','OnlineDuelService');const o=h.c.OnlineDuelService;o.active=true;o.localPid='P1';o.remotePids=['P2'];o.roundToken=2;h.c.Training.remotePlayers=new Map();h.entities.set('P1',h.source);assert.equal(o.receive('P2',{type:'duel-projectile-guard-resolved',roundToken:2,projectileOwnerPid:'P1',projectileKey:'arrow',outcome:'remove',impactPoint:{x:110,y:20}}),true);assert.equal(h.source.actionState.get(h.state.storageKey).module.range,100)});
test('캐릭터·증강 설정 25 허용 / 초과는 25 / 선택지는 중복 없이 25',()=>{const h=context();load(h.c,'src/network/RoomService.js','RoomService');const r=h.c.RoomService;r.isHost=true;r.broadcast=()=>{};r.setSettings({characterCount:25,augmentCount:25});assert.equal(r.settings.characterCount,25);assert.equal(r.settings.augmentCount,25);r.setSettings({characterCount:50,augmentCount:100});assert.equal(r.settings.characterCount,25);assert.equal(r.settings.augmentCount,25);h.c.CharacterCardDataService={all:()=>Array.from({length:58},(_,i)=>({id:'c'+i}))};h.c.AugmentDataService={all:()=>Array.from({length:40},(_,i)=>({id:'a'+i,rarity:'common'}))};load(h.c,'src/core/MatchChoiceService.js','MatchChoiceService');for(const ids of [h.c.MatchChoiceService.characterOptions(25),h.c.MatchChoiceService.augmentOptions(25)]){assert.equal(ids.length,25);assert.equal(new Set(ids).size,25)}});
test('라운드 준비 패킷도 캐릭터·패배자 증강 25개 전송',()=>{const h=context();load(h.c,'src/network/RoomService.js','RoomService');const r=h.c.RoomService;r.isHost=true;r.duelPhase='round-result';r.settings.characterCount=25;r.settings.augmentCount=25;for(const pid of ['P1','P2']){r.members.set(pid,{pid,connected:true});r.activeMatchPids.add(pid)}h.c.RoomMatchLifecycleService={applyNextRoundRoster:()=>true};h.c.MatchMapService={pick:()=> 'open'};h.c.MatchChoiceService={characterOptions:n=>Array.from({length:n},(_,i)=>'c'+i),augmentOptions:n=>Array.from({length:n},(_,i)=>'a'+i)};h.c.OnlineDuelService={showBetween(){}};r.sendToPeers=()=>{};assert.equal(r.beginBetween('P1',['P2']),true);assert.equal(r._betweenPacket.charChoices.length,25);assert.equal(r._betweenPacket.augChoicesByPid.P2.length,25)});
test('경로 보정 수신도 기존 잔향 수명·타격 기록 보존',()=>{const h=fields();h.source.local=false;h.c.EntityService={items:new Map([['owner',h.source]])};h.c.OnlineDuelService={active:true,roundToken:2};load(h.c,'src/network/OnlinePresentationSyncService.js','OnlinePresentationSyncService');const data={module:{...h.state.module,range:100,presentation:{type:'progressRect',range:100}},point:{x:10,y:20},instanceId:h.state.instanceId,preserveState:true};assert.equal(h.c.OnlinePresentationSyncService.receive('P1',{roundToken:2,presentationId:'correction',entityId:'owner',kind:'field-point-spawn',data}),true);const state=h.source.actionState.get(h.state.storageKey);assert.equal(state.module.range,100);assert.equal(state.endsAt,2600);assert.equal(state.lastTriggerAt,h.state.lastTriggerAt)});
test('실제 방 UI의 캐릭터·증강 드롭다운 0~25 생성',()=>{const h=context();load(h.c,'src/network/RoomService.js','RoomService');const selects=new Map(['room-char-choices','room-aug-choices'].map(id=>[id,{options:[],appendChild(o){this.options.push(o)},addEventListener(){}}]));h.c.document={getElementById:id=>selects.get(id)||null,createElement:()=>({})};h.c.CharacterBanUI={init(){}};load(h.c,'src/ui/RoomUI.js','RoomUI');h.c.RoomUI.init();for(const s of selects.values()){assert.equal(s.options.length,26);assert.equal(s.options.at(-1).value,'25')}});
function liveEffects(){
 const h=context();let clock=100;h.c.performance.now=()=>clock;
 h.c.Training={active:true,fx:[],sessionMode:'online'};
 h.c.EntityService={items:new Map()};
 load(h.c,'src/render/EffectSpawnService.js','EffectSpawnService');
 load(h.c,'src/core/InstalledAreaFieldService.js','InstalledAreaFieldService');
 const source={id:'remote',alive:true,local:false,actionState:new Map()};
 h.c.EntityService.items.set(source.id,source);
 const module={stateKey:'echo',anchorMode:'projectile-path',shape:'rect',range:28,halfWidth:18,duration:2500,liveProjectilePath:true,presentation:{type:'progressRect',fullLength:true}};
 const receive=(range,now,extra={})=>{clock=now;return h.c.InstalledAreaFieldService.activatePoint(source,{...module,range,...extra},{x:0,y:0},{instanceId:'arrow',now,interpolatePresentation:true,preserveState:extra.preserveState===true})};
 return{...h,source,receive,effect:()=>h.c.EffectSpawnService.getByKey('field-area:remote:arrow')};
}
test('불규칙 수신 사이 잔향 길이 연속 보간 / 확정 범위 초과·수명 초기화 없음',()=>{
 const h=liveEffects(),e=h.c.EffectSpawnService;
 const first=h.receive(28,100),fx=h.effect();h.receive(140,164);
 assert.equal(h.effect(),fx);assert.equal(e.presentationRange(fx,164),28);
 assert.equal(fx.range,140);assert.equal(e.presentationRange(fx,196),84);
 const next=h.receive(252,204);assert.equal(e.presentationRange(fx,204),98);
 const lengths=[204,214,224,234,244,400].map(t=>e.presentationRange(fx,t));
 for(let i=1;i<lengths.length;i++)assert.ok(lengths[i]>lengths[i-1]||lengths[i]===252);
 assert.equal(lengths.at(-1),252);assert.equal(next.startedAt,first.startedAt);
 assert.equal(fx.start,100);assert.equal(next.lastTriggerAt,first.lastTriggerAt);
 assert.equal(h.c.Training.fx.length,1);
});
test('보간 중 방어 축소 및 최종 종료 즉시 반영 / 표시 타이머·피해 틱 보존',()=>{
 const h=liveEffects(),e=h.c.EffectSpawnService;
 const first=h.receive(28,100);h.receive(300,180);const fx=h.effect();
 assert.ok(e.presentationRange(fx,200)<300);
 const final=h.receive(120,200,{liveProjectilePath:false,preserveState:true,pathTimeline:{revealRatio:.1,fadeStart:.75}});
 assert.equal(e.presentationRange(fx,200),120);assert.equal(e.presentationRange(fx,500),120);
 assert.equal(fx.rangeTransition,null);assert.equal(fx.start,100);
 assert.equal(final.endsAt,2680);assert.equal(final.lastTriggerAt,first.lastTriggerAt);
});
test('수신 몰림에서도 표시 길이 역행 없음 / 별도 투사체와 일반 이펙트 독립',()=>{
 const h=liveEffects(),e=h.c.EffectSpawnService;h.receive(28,100);h.receive(200,180);
 const fx=h.effect(),before=e.presentationRange(fx,190);h.receive(250,190);h.receive(300,190);
 assert.equal(e.presentationRange(fx,190),before);assert.equal(e.presentationRange(fx,400),300);
 const other=e.spawn({key:'other',type:'progressRect',range:80,start:190,dur:100});
 assert.equal(e.presentationRange(other,200),80);assert.equal(h.c.Training.fx.length,2);
 const snapshot=e.presentationSnapshot(fx,200);assert.equal(snapshot.rangeTransition,undefined);assert.equal(snapshot.rangeSampleAt,undefined);
});
console.log('PASS '+count+' gameplay scenarios');
