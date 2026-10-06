/* 실제 캐릭터 데이터와 공통 조건/무기/표시/충돌/복제 서비스 회귀. 실기기 WebRTC 대체 아님. */
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');let clock=1000,passed=0,walls=[],damage=[];
const c=vm.createContext({console,Map,Set,WeakMap,WeakSet,Math,performance:{now:()=>clock},EMPTY_RUNTIME_ITEMS:[],EMPTY_AUGMENT_EFFECTS:[]});
function load(file,name){vm.runInContext(fs.readFileSync(path.join(root,file),'utf8')+`;globalThis.${name}=${name};`,c)}
function test(name,fn){walls=[];damage=[];clock=1000;fn();passed++;console.log('PASS '+name)}
for(const n of ['characterValue','characterCount','characterSum','characterProduct','freezeCharacterData','CHARACTER_RULES'])load('src/data/'+n+'.js',n);
c.CHARACTER_DATA={geopin:vm.runInContext('('+fs.readFileSync(path.join(root,'src/data/characters/geopin.js'),'utf8')+')',c)};
load('src/data/CharacterDataService.js','CharacterDataService');const ch=c.CharacterDataService.compile('geopin');
const items=new Map();c.EntityService={items,owner:e=>e};
c.RelationService={relation:(a,b)=>a===b?'self':a?.teamId===b?.teamId?'ally':'enemy'};
c.EntitySimulationAuthorityService={isLocal:e=>e?.local!==false};c.NetworkCollisionPositionService={point:e=>e};
c.DynamicWallService={all:()=>[]};c.CombatStatsService={current:e=>({speedMult:e.walkMultiplier??1})};
c.WorldBoundsService={width:()=>2000,height:()=>2000};c.DebugMapService={walls:()=>walls};
c.Training={sessionMode:'training',active:true,player:null,remotePlayers:new Map()};c.GAME_DATA={frameMs:1000/60};
c.EffectSpawnService={ease:v=>v};c.AugmentService={prepareAttack:(s,a)=>a};c.ProgressScaledAttackService={resolve:(s,a)=>a};
c.TagService={derivedModuleTags:()=>[],attackTags:a=>new Set(a.tags||[]),hasAttack:(a,t)=>t==='히트스캔'&&(a.modules||[]).some(m=>m.type==='delivery.area')};
for(const n of ['ModeStateService','ProgressStateService','TriggerConditionService','TriggerModuleService','GameEvents','ReactiveEquipmentService'])load('src/core/'+n+'.js',n);
load('src/abilities/AbilityService.js','AbilityService');load('src/abilities/AbilityModuleService.js','AbilityModuleService');
load('src/world/WorldGeometryService.js','WorldGeometryService');load('src/world/AreaGeometryService.js','AreaGeometryService');load('src/world/HitScanGeometryService.js','HitScanGeometryService');
load('src/combat/AttackExecutionService.js','AttackExecutionService');load('src/combat/AreaAttackService.js','AreaAttackService');
load('src/projectiles/ProjectileHomingTargetVisibilityService.js','ProjectileHomingTargetVisibilityService');
load('src/projectiles/ProjectileModuleService.js','ProjectileModuleService');load('src/projectiles/ProjectileRedirectService.js','ProjectileRedirectService');load('src/projectiles/ProjectileService.js','ProjectileService');
load('src/network/ProjectileRedirectSyncService.js','ProjectileRedirectSyncService');load('src/combat/AttackGuardService.js','AttackGuardService');
c.ColorService={rgbString:()=> '230,202,59'};load('src/render/ArcGaugePresentationService.js','ArcGaugePresentationService');
load('src/render/ModeGearPresentationService.js','ModeGearPresentationService');load('src/render/EquipmentGaugePresentationService.js','EquipmentGaugePresentationService');
c.EntityTargetReferenceService={resolve:id=>items.get(id),encode:e=>e?.id};
c.JustDodgeService={confirmProjectile:()=>false};c.AttackHitTriggerService={damage:ctx=>{damage.push(ctx);return{hit:true,authoritative:true,amount:ch.baseDamage*ctx.attack.damageRatio}}};c.AttackModuleService={onDeliveryResolved(){},onHit(){},module:(a,t)=>(a.modules||[]).find(m=>m.type===t)};
const r=c.ReactiveEquipmentService;
function entity(id='p',extra={}){const e={id,kind:'player',alive:true,local:true,teamId:'a',character:ch,actionState:new Map(),statuses:new Map(),attackSequence:0,speed:4.5,x:100,y:500,radius:20,...extra};items.set(id,e);return e}
function reset(){items.clear();return entity()}
function enemy(id='enemy',extra={}){return entity(id,{character:{},teamId:'b',x:500,...extra})}
function mode(e){return c.ModeStateService.current(e,ch.reactiveEquipment.stateKey,ch.reactiveEquipment.initial)}
function progress(e,index){return c.ProgressStateService.state(e,ch.reactiveEquipment.items[index].stateKey)?.value||0}
function signal(e,flag,key='enemy'){r.signal(e,{[flag]:true},key,clock);r.flush(e,clock);clock+=16}
function projectile(e,attack=ch.attacks.lmb,extra={}){return{source:e,attack,x:200,y:500,prevX:175,prevY:500,angle:0,vx:24,vy:0,radius:9,baseSpeed:24,travel:100,maxTravelDistance:attack.range,networkKey:'bullet',hitIds:new Set(),behavior:{},volley:{execution:c.AttackExecutionService.create(e,attack,0),hits:0,total:1,resolved:0,finished:false},...extra}}
test('벽튕 유도는 미탐지 은신 제외·공개 적 선택·없으면 반사',()=>{
 const e=reset(),hidden=enemy('hidden',{x:150,y:550}),visible=enemy('visible',{x:100,y:700});
 c.StealthPresentationService={active:t=>t===hidden,state:()=>({detected:false})};
 const p=projectile(e),config=c.ProjectileRedirectService.module(p,'projectile.redirect');
 assert.equal(c.ProjectileRedirectService.nearest(p,config),visible);
 items.delete(visible.id);assert.equal(c.ProjectileRedirectService.nearest(p,config),null);
 p.x=191;p.prevX=175;walls=[{x:200,y:450,w:30,h:100}];
 assert.equal(c.ProjectileRedirectService.wall(p,false),true);
 assert.ok(p.vx<0);assert.ok(Math.abs(p.vy)<1e-6);
 c.StealthPresentationService.state=()=>({detected:true});
 assert.equal(c.ProjectileRedirectService.nearest(p,config),hidden);
 delete c.StealthPresentationService;
});
test('체력1100·매우빠름·노란색·8종/기본 무기 및 공통 반격 데이터',()=>{
 for(const key of ["lmb","jump","wall","laser","chain","punch","recoil","sniper","bomb"])assert.equal(ch.attacks[key].cd,350);assert.equal(ch.baseDamage*ch.attacks.lmb.damageRatio,150);assert.equal(ch.maxHealth,1100);assert.equal(ch.speed,4.5);assert.equal(ch.color,'#e6ca3b');assert.equal(ch.reactiveEquipment.items.length,8);assert.equal(ch.worldGaugeModules[0].visibility,'owner');assert.equal(ch.abilities.counter.trigger.modules[0].windup,300);
 const raw=fs.readFileSync(path.join(root,'src/projectiles/ProjectileRedirectService.js'),'utf8');assert.ok(!raw.includes('geopin'));assert.ok(!raw.includes('RoomService'));assert.ok(!raw.includes('Training'));
});
test('8가지 각각1/2회 미발명·3회 완성/장착·우클릭 복귀 후 자동 재장착',()=>{
 for(let i=0;i<8;i++){
  const e=reset(),item=ch.reactiveEquipment.items[i],flag=item.trigger.conditions[0].flag;
  for(let n=1;n<=3;n++){signal(e,flag);assert.equal(progress(e,i),n);assert.equal(mode(e),n<3?'rubber':item.value)}
  r.select(e,'rubber',clock);signal(e,flag);assert.equal(progress(e,i),3);assert.equal(mode(e),item.value);
 }
});
test('겹치는 조건은 목록 우선순위·한 사건 한 게이지·다른 적 사건 독립',()=>{
 const e=reset();r.signal(e,{close:true,summon:true},'A',clock);r.signal(e,{restricted:true},'A',clock);r.signal(e,{field:true},'A',clock);r.signal(e,{far:true},'B',clock);r.flush(e);assert.equal(progress(e,0),1);assert.equal(progress(e,3),0);assert.equal(progress(e,5),0);assert.equal(progress(e,6),1);
});
test('사망/원격/아군 피격 무시·벽뒤/소환수/원거리/초근거리 분류',()=>{
 const e=reset(),a=enemy();r.damage({impact:{type:'direct'},target:e,source:entity('ally'),amount:100,now:clock});r.flush(e);assert.equal(progress(e,7),0);
 e.local=false;assert.equal(r.signal(e,{field:true}),false);e.local=true;e.alive=false;assert.equal(r.signal(e,{field:true}),false);e.alive=true;
 a.x=120;r.damage({impact:{type:'direct'},target:e,source:a,amount:100,now:clock});r.flush(e);assert.equal(progress(e,7),1);
 a.x=1000;r.damage({impact:{type:'direct'},target:e,source:a,amount:100,now:clock});r.flush(e);assert.equal(progress(e,6),1);
 a.kind='summon';r.damage({impact:{type:'direct'},target:e,source:a,amount:100,now:clock});r.flush(e);assert.equal(progress(e,3),1);
 walls=[{x:400,y:400,w:30,h:200}];r.damage({impact:{type:'direct'},target:e,source:a,amount:100,now:clock});r.flush(e);assert.equal(progress(e,1),1);assert.equal(progress(e,3),1);
});
test('원거리 조건은 장착 무기와 무관한 기본 사거리 이상·0피해는 미누적',()=>{
 const e=reset(),a=enemy('enemy',{x:450});r.select(e,'punch',clock);r.damage({impact:{type:'direct'},target:e,source:a,amount:100,now:clock});r.flush(e);assert.equal(progress(e,6),0);
 a.x=451;r.damage({impact:{type:'direct'},target:e,source:a,amount:0,now:clock});r.flush(e);assert.equal(progress(e,6),0);r.damage({impact:{type:'direct'},target:e,source:a,amount:100,now:clock});r.flush(e);assert.equal(progress(e,6),1);
 r.select(e,'sniper',clock);a.x=1000;r.damage({impact:{type:'direct'},target:e,source:a,amount:100,now:clock});r.flush(e);assert.equal(progress(e,6),2);
});
test('지속 장판 갱신별 누적·일회성/아군 장판 제외',()=>{
 const e=reset(),a=enemy();for(let i=0;i<3;i++){r.damage({source:a,target:e,amount:100,impact:{type:'field-area',fieldDuration:4000},now:clock});r.flush(e);clock+=500}assert.equal(progress(e,0),3);assert.equal(mode(e),'jump');
 const fresh=reset();r.field(fresh,a,{endsAt:clock-1},clock);r.field(fresh,entity('ally'),{endsAt:5000},clock);r.flush(fresh);assert.equal(progress(fresh,0),0);
});
test('이동 CC 갱신3회·감전/자가/아군 CC 제외',()=>{
 const e=reset(),a=enemy();for(let i=0;i<3;i++){r.restriction(e,'bind',a.id,clock);r.flush(e);clock+=16}assert.equal(mode(e),'recoil');
 const f=reset();r.restriction(f,'zap',a.id,clock);r.restriction(f,'bind',f.id,clock);r.restriction(f,'slow',entity('ally').id,clock);r.flush(f);assert.equal(progress(f,5),0);
});
test('급접근: 자기 걸음 제외·적100/350ms 조건·재진입/이탈 정리',()=>{
 const e=reset(),a=enemy('enemy',{x:600});r.update(e,clock);clock+=100;e.x=300;r.update(e,clock);assert.equal(progress(e,4),0);
 const f=reset(),b=enemy('enemy',{x:600,kind:'trainingBot'});r.update(f,1000);b.x=350;r.update(f,1100);assert.equal(progress(f,4),1);r.update(f,1110);assert.equal(progress(f,4),1);
 b.x=650;r.update(f,1400);b.x=300;r.update(f,1500);assert.equal(progress(f,4),2);items.delete(b.id);r.update(f,1600);assert.equal(r.state(f).approaches.size,0);
});
test('방어 누적은 공격 실행 단위·중복 확정 무시·벽 충돌 자체는 미집계',()=>{
 const e=reset(),a=enemy();for(let n=1;n<=3;n++){const key=`${e.id}:attack:execution:${n}`;assert.equal(r.blocked(e,a.id,key,clock),true);assert.equal(r.blocked(e,a.id,key,clock),false);r.flush(e);clock+=16}assert.equal(mode(e),'laser');
 assert.equal(c.AttackGuardService.projectileBlockGroupKey(projectile(e)),`${e.id}:${ch.attacks.lmb.id}:execution:1`);
});
test('반격은 마지막 상황 무기 즉시 완성·시간 경과 기억 유지·원격 발명 금지',()=>{
 const e=reset();signal(e,'summon');r.resolveCurrent(e,{},clock);assert.equal(mode(e),'chain');assert.equal(progress(e,3),3);r.select(e,'rubber',clock);clock+=10001;r.resolveCurrent(e,{},clock);assert.equal(mode(e),'chain');
 const f=reset();signal(f,'restricted');f.local=false;r.resolveCurrent(f,{},clock);assert.equal(progress(f,5),1);
});
test('현재 모드가 실제 평타 대체 AttackSpec 선택·RMB 실패 시 장착 보존',()=>{
 const e=reset();for(const item of ch.reactiveEquipment.items){r.select(e,item.value,clock);assert.equal(c.AbilityService.resolvedInputAttack(e,ch.abilities.lmb).id,ch.attacks[item.value].id)}
 let next=0;r.select(e,'laser',clock);c.AbilityModuleService.handlers['equipment.select']({source:e,executed:false,now:clock},()=>next++,{value:'rubber',requireExecuted:true});assert.equal(mode(e),'laser');c.AbilityModuleService.handlers['equipment.select']({source:e,executed:true,now:clock},()=>next++,{value:'rubber',requireExecuted:true});assert.equal(mode(e),'rubber');assert.equal(next,2);
});
test('기어 한바퀴350ms·같은 무기는 재회전 없음·원격 snapshot 재수신 재시작 없음',()=>{
 const e=reset(),gear=ch.worldEffectModules[0].gears[0];r.select(e,'laser',1000);assert.equal(c.ModeGearPresentationService.rotation(e,gear,350,1000),0);assert.equal(c.ModeGearPresentationService.rotation(e,gear,350,1175),Math.PI);assert.equal(c.ModeGearPresentationService.rotation(e,gear,350,1350),Math.PI*2);assert.equal(r.select(e,'laser',1400),false);
 const remote=entity('remote',{local:false});c.ModeStateService.applyRemote(remote,c.ModeStateService.serialize(e,1175),2000);assert.equal(c.ModeGearPresentationService.rotation(remote,gear,350,2000),Math.PI);c.ModeStateService.applyRemote(remote,c.ModeStateService.serialize(e,1200),2025);assert.equal(c.ModeStateService.state(remote,ch.reactiveEquipment.stateKey).changedAt,1825);
});
function canvas(){const strokes=[];return{strokes,globalAlpha:1,save(){},restore(){},translate(){},beginPath(){},arc(){},stroke(){strokes.push(this.globalAlpha)},fill(){}}}
test('자신만8호·갱신 후 불투명→반투명·활성 호 항상 불투명',()=>{
 const e=reset(),ctx=canvas();c.Training.player=e;const module=ch.worldGaugeModules[0];assert.equal(c.EquipmentGaugePresentationService.draw(ctx,e,module,1000),true);assert.equal(ctx.strokes.length,16);assert.equal(ctx.strokes[0],.35);
 signal(e,'summon');ctx.strokes.length=0;c.EquipmentGaugePresentationService.draw(ctx,e,module,1100);assert.equal(ctx.strokes[6],1);ctx.strokes.length=0;c.EquipmentGaugePresentationService.draw(ctx,e,module,2500);assert.equal(ctx.strokes[6],.35);
 r.select(e,'chain',2500);ctx.strokes.length=0;c.EquipmentGaugePresentationService.draw(ctx,e,module,9999);assert.equal(ctx.strokes[6],1);assert.equal(c.EquipmentGaugePresentationService.draw(canvas(),enemy(),module,9999),false);
});
test('실제 벽 접촉점에서 고무탄 반사·벽 너머 적 제외·속력 보존',()=>{
 const e=reset();walls=[{x:250,y:350,w:30,h:300}];const p=projectile(e,ch.attacks.lmb,{x:241,prevX:230,travel:141});enemy('behind',{x:400});assert.equal(c.ProjectileRedirectService.wall(p,false),true);assert.ok(p.vx<0);assert.ok(Math.abs(Math.hypot(p.vx,p.vy)-15.6)<1e-8);assert.equal(p.redirectCount,1);assert.equal(p.prevX,p.x);assert.equal(progress(e,2),0);
});
test('적중 연쇄는 실제 hitTarget 후 방향 전환·동일 대상 제외·후보 소진 시 종료',()=>{
 const e=reset(),a=enemy('a',{x:200}),b=enemy('b',{x:350}),d=enemy('d',{x:450});const p=projectile(e,ch.attacks.chain);
 assert.equal(c.ProjectileService.hitTarget(p,a),true);assert.equal(p.redirectCount,1);assert.equal(c.ProjectileService.hitTarget(p,a),false);
 p.x=b.x;assert.equal(c.ProjectileService.hitTarget(p,b),true);assert.equal(p.redirectCount,2);p.x=d.x;assert.equal(c.ProjectileService.hitTarget(p,d),true);assert.equal(p.redirectEnded,true);assert.equal(damage.length,3);
});
test('벽 전달은 반대편 좌표에서 짧은 네모 실행·중복1회·다음 벽 관통',()=>{
 const e=reset();walls=[{x:250,y:350,w:30,h:300},{x:390,y:350,w:20,h:300}];enemy('hit',{x:350,radius:5});enemy('blocked',{x:450,radius:5});
 const p=projectile(e,ch.attacks.wall,{x:241,networkKey:'relay-one'}),module=ch.attacks.wall.modules[1];let event;c.GameEvents.on('area-attack-fired',x=>event=x);
 assert.equal(c.ProjectileRedirectService.relay(p,module),true);assert.equal(c.ProjectileRedirectService.relay(p,module),false);assert.equal(damage.length,2);assert.equal(damage[0].target.id,'hit');assert.ok(event.geometryOrigin.x>280);assert.equal(event.module.range,200);assert.equal(event.source,e);
});
test('방향 확정 snapshot은 예측 동일 revision 보정·중복/역순 무시·생성 전 복원',()=>{
 const e=reset(),p=projectile(e);p.redirectRevision=2;
 const snapshot={projectileKey:'bullet',revision:2,x:200,y:550,angle:Math.PI/2,vx:0,vy:24,travel:100,redirectCount:1,hitIds:['enemy']};assert.equal(c.ProjectileRedirectService.apply(p,snapshot),true);assert.equal(p.vy,24);assert.equal(c.ProjectileRedirectService.apply(p,snapshot),false);
 c.ProjectileService.items.length=0;assert.equal(c.ProjectileRedirectSyncService.receive(e,{...snapshot,revision:3,ended:true}),true);c.ProjectileRedirectSyncService.restore(p);assert.equal(p.redirectEnded,true);assert.equal(p.networkRedirectRevision,3);assert.equal(c.ProjectileRedirectSyncService.receive(e,snapshot),false);
});
test('무기별 공통 모듈: 낮은 점프·반동·사거리끝 폭발·반격 무력화',()=>{
 const jump=ch.attacks.jump.modules.find(m=>m.type==='movement.move');assert.equal(ch.attacks.jump.modules[0].height,55);assert.equal(jump.distance,220);assert.equal(jump.duration,200);assert.equal(ch.attacks.recoil.modules[1].direction,'opposite-aim');assert.equal(ch.attacks.bomb.modules[0].collisionTargets,true);assert.equal(ch.attacks.bomb.damageRatio,1.5);assert.equal(ch.attacks.explosion.damageRatio,1.5);assert.equal(ch.attacks.counter.damageRatio,2.5);assert.equal(ch.abilities.counter.trigger.modules[0].cc.type,'movement.neutralize-knockback');
});
test('모든 고무탄 벽 반사·기본 사거리500·전체 투사체 확대',()=>{
 assert.equal(ch.attacks.lmb.range,650);
 for(const key of ['lmb','wall','chain','recoil','sniper','bomb']){const a=ch.attacks[key],m=a.modules.find(m=>m.type==='projectile.redirect');assert.ok(c.ProjectileRedirectService.supports(m,'wall'));assert.equal(m.maxWallRedirects,0);assert.equal(a.modules.find(m=>m.type==='delivery.projectile').radius,15)}
 assert.equal(ch.attacks.laser.modules[0].projectileClassification,"instant-laser");assert.equal(ch.worldEffectModules[0].radius,50);
});
test('벽 반사 사거리는반복되어도500 고정',()=>{
 const e=reset(),p=projectile(e);for(const expected of [650,650,650,650,650,650]){assert.equal(c.ProjectileRedirectService.wall(p,true),true);assert.equal(p.maxTravelDistance,expected)}assert.equal(p.rangeBounceCount,undefined);assert.equal(p.rangeBounceBase,undefined);
});
test('벽 증가 없음·적중마다280 증가·적 전환 횟수는 벽 횟수와 독립',()=>{
 const e=reset(),a=enemy('a',{x:200}),b=enemy('b',{x:300}),d=enemy('d',{x:400}),p=projectile(e,ch.attacks.chain);
 c.ProjectileRedirectService.wall(p,true);assert.equal(p.maxTravelDistance,850);assert.equal(p.hitRedirectCount,undefined);
 assert.equal(c.ProjectileService.hitTarget(p,a),true);assert.equal(p.maxTravelDistance,1190);assert.equal(p.hitRedirectCount,1);
 c.ProjectileRedirectService.wall(p,true);assert.equal(p.maxTravelDistance,1190);p.x=b.x;c.ProjectileService.hitTarget(p,b);assert.equal(p.maxTravelDistance,1530);assert.equal(p.hitRedirectCount,2);
 p.x=d.x;c.ProjectileService.hitTarget(p,d);assert.equal(p.redirectEnded,true);assert.equal(p.maxTravelDistance,1870);
});
test('적이 없을 때 수직 벽은 정상 반사각·반사로 사거리 감소 없음',()=>{
 const e=reset();walls=[{x:250,y:350,w:30,h:300}];const angle=Math.PI/6,p=projectile(e,ch.attacks.lmb,{x:241,angle,vx:Math.cos(angle)*24,vy:Math.sin(angle)*24});
 c.ProjectileRedirectService.wall(p,false);assert.ok(Math.abs(p.angle-(Math.PI-angle))<1e-8);assert.equal(p.maxTravelDistance,650);
});
test('개인8호는11반경의3/3/2배치·활성 밝은색·중앙점 없음·기준 원150/500',()=>{
 const e=reset();c.Training.player=e;r.select(e,'jump',clock);const ctx=canvas(),arcs=[],colors=[];let fills=0;
 ctx.arc=(...args)=>arcs.push(args);ctx.stroke=function(){colors.push(this.strokeStyle)};ctx.fill=()=>fills++;
 c.EquipmentGaugePresentationService.draw(ctx,e,ch.worldGaugeModules[0],clock);
 assert.deepEqual(arcs.filter((a,i)=>i%2===0).map(a=>a.slice(0,3)),[[58,-30,11],[87,-30,11],[116,-30,11],[58,-1,11],[87,-1,11],[116,-1,11],[58,28,11],[87,28,11]]);
 assert.equal(colors[1],ch.worldGaugeModules[0].activeColor);assert.equal(fills,0);
 r.select(e,'rubber',clock);arcs.length=0;ctx.setLineDash=()=>{};c.EquipmentGaugePresentationService.thresholds(ctx,e,ch.worldGaugeModules[1]);assert.deepEqual(arcs.map(a=>a[2]),[350]);
 assert.equal(c.EquipmentGaugePresentationService.thresholds(ctx,enemy(),ch.worldGaugeModules[1]),false);
});
test('공통 디버깅 명령으로9종 무기 완성/활성화·잘못된 값 거부',()=>{
 load('src/debug/OnlineDebugControlSyncService.js','OnlineDebugControlSyncService');const e=reset();
 for(const item of ch.reactiveEquipment.items){assert.equal(c.OnlineDebugControlSyncService.perform('equipment-equip',e,{value:item.value}),true);assert.equal(mode(e),item.value);assert.equal(c.ProgressStateService.state(e,item.stateKey).value,3)}
 assert.equal(c.OnlineDebugControlSyncService.perform('equipment-equip',e,{value:'rubber'}),true);assert.equal(mode(e),'rubber');assert.equal(c.OnlineDebugControlSyncService.perform('equipment-equip',e,{value:'invalid'}),false);
});
test('범위 증가/벽·적 전환 횟수 snapshot 복원·후속 반사로 증가 없음',()=>{
 const e=reset(),p=projectile(e);const snapshot={revision:1,x:p.x,y:p.y,angle:0,vx:24,vy:0,travel:10,redirectCount:2,maxTravelDistance:1200,rangeBounceBase:500,rangeBounceCount:2,wallRedirectCount:1,hitRedirectCount:1,hitIds:[]};
 assert.equal(c.ProjectileRedirectService.apply(p,snapshot),true);assert.equal(p.maxTravelDistance,1200);c.ProjectileRedirectService.wall(p,true);assert.equal(p.maxTravelDistance,1200);
});
test('실제 저회 사건: 벽 뒤 회피를 기억·게이지 누적·이후 장판이 마지막 조건',()=>{
 load('src/combat/JustDodgeService.js','JustDodgeService');c.BuffService={set(){},resolve:()=>0};c.CounterStockService={acquire(){}};c.GAME_DATA.counter={window:3000};c.GAME_DATA.dodge={justWindow:80};
 vm.runInContext(fs.readFileSync(path.join(root,'src/core/initialization-equipment.js'),'utf8'),c);
 const e=reset(),a=enemy('attacker',{x:600});walls=[{x:400,y:400,w:30,h:200}];e.justCheck={expiresAt:1080,startedAt:1000};
 assert.equal(c.JustDodgeService.confirmDamageAttempt(e,1000,ch.attacks.lmb,{source:a,attack:ch.attacks.lmb,impact:{type:'projectile'}}),true);
 assert.equal(r.state(e).currentCondition,'wall');r.flush(e);assert.equal(progress(e,1),1);r.resolveCurrent(e,{},100000);assert.equal(mode(e),'wall');assert.equal(progress(e,1),3);
 r.damage({source:a,target:e,amount:100,impact:{type:'field-area',fieldDuration:4000},now:100001});r.resolveCurrent(e,{},100002);assert.equal(mode(e),'jump');assert.equal(progress(e,0),3);
});
test('실제 기어/스패너 렌더·회전 중 불투명 후 복귀·확대 톱니 geometry',()=>{
 const e=reset();c.Training.player=e;r.select(e,'laser',1000);const effect=ch.worldEffectModules[0];c.EffectSpawnService.getByKey=()=>effect;
 const ctx=canvas(),points=[];ctx.moveTo=(x,y)=>points.push([x,y]);ctx.lineTo=(x,y)=>points.push([x,y]);ctx.closePath=()=>{};ctx.rotate=()=>{};
 assert.equal(c.ModeGearPresentationService.drawBehind(ctx,e,1,1100),true);assert.ok(ctx.strokes.every(alpha=>alpha===1));assert.ok(points.every(p=>p.every(Number.isFinite)));assert.ok(points.some(p=>Math.hypot(...p)>40));
 ctx.strokes.length=0;assert.equal(c.ModeGearPresentationService.drawBehind(ctx,e,1,2500),true);assert.ok(ctx.strokes.every(alpha=>alpha===.2));
 load('src/render/WrenchShapeRenderService.js','WrenchShapeRenderService');points.length=0;assert.equal(c.WrenchShapeRenderService.draw(ctx,{radius:40,alpha:1}),true);assert.ok(points.length>=25);assert.ok(points.every(p=>p.every(Number.isFinite)));
});

test('우클릭 해제 이전 무기·200ms 홀드 호게이지/해제 기본 복귀·이력 snapshot',()=>{
 const e=reset();r.select(e,'sniper',clock);r.select(e,'chain',clock+16);
 const tap=ch.abilities.rmb.trigger.modules[1],hold=ch.abilities.rmb.holdTrigger.modules[0];
 c.AbilityModuleService.handlers['equipment.select']({source:e,executed:true,now:clock+32},()=>{},tap);assert.equal(mode(e),'sniper');
 c.AbilityModuleService.handlers['equipment.select']({source:e,executed:true,now:clock+48},()=>{},tap);assert.equal(mode(e),'chain');
 c.AbilityModuleService.handlers['equipment.select']({source:e,executed:false,now:clock+248},()=>{},hold);assert.equal(mode(e),'rubber');
 assert.equal(ch.abilities.rmb.inputPolicy.holdThresholdMs,200);assert.ok(!ch.abilities.rmb.inputPolicy.holdTriggerWhilePressed);assert.equal(ch.abilities.rmb.inputPolicy.tapHoldSplit,true);assert.equal(ch.abilities.rmb.inputPolicy.holdGauge,true);
 const remote=entity('history-remote',{local:false});c.ModeStateService.applyRemote(remote,c.ModeStateService.serialize(e,clock+248),clock+300);assert.equal(c.ModeStateService.state(remote,ch.reactiveEquipment.stateKey).previousValue,'chain');
});

test('실제 Pointer press/release:199ms 이전·200/250ms 기본·누를 때 미발동·취소 미발동',()=>{
 const input=vm.createContext({performance:{now:()=>clock},Math,Number,String,clearInterval});
 input.CircleFormationService={handlesInput:()=>false};
 input.TriggerModuleService={matches:()=>true};
 input.AbilityService={canActivate:()=>true,eventAttack:()=>ch.attacks.rmb};
 input.ChargedAttackService={state:()=>null};
 const e=reset();input.Training={player:e,aimAngle:()=>0,mouseWorld:()=>({x:0,y:0}),
  use:()=>{r.select(e,'previous',clock);return true},
  holdInput:()=>{r.select(e,'rubber',clock);return true}};
 // Use the actual selection handler to match operation:previous semantics.
 input.Training.use=()=>{c.AbilityModuleService.handlers['equipment.select']({source:e,executed:true,now:clock},()=>{},ch.abilities.rmb.trigger.modules[1]);return true};
 vm.runInContext(fs.readFileSync(path.join(root,'src/input/PointerHoldInputService.js'),'utf8')+';globalThis.pointer=PointerHoldInputService;',input);
 for(const [ms,expected] of [[199,'sniper'],[200,'rubber'],[250,'rubber']]){
  r.select(e,'sniper',clock);r.select(e,'chain',clock);assert.equal(input.pointer.press('rmb'),true);assert.equal(mode(e),'chain');
  clock+=ms;assert.equal(input.pointer.release('rmb'),true);assert.equal(mode(e),expected);if(ms>=200)assert.equal(input.pointer.state.rmb.gaugeRetainUntil,clock+500);
 }
 r.select(e,'chain',clock);input.pointer.press('rmb');clock+=250;input.pointer.release('rmb',false);assert.equal(mode(e),'chain');
});

test('무적으로 막은 실제 DamagePipeline 시도도 발명 게이지3회 누적',()=>{
 const e=reset(),a=enemy('summon',{kind:'summon'});e.invincibleUntil=9999;
 c.RelationService.canTarget=(s,t)=>s!==t&&s.teamId!==t.teamId&&t.alive;
 c.BuffService.live=()=>[];load('src/combat/DamagePipeline.js','DamagePipeline');
 for(let n=0;n<3;n++){clock+=100;const result=c.DamagePipeline.apply({source:a,target:e,attack:ch.attacks.lmb,impact:{type:'projectile'}});assert.equal(result.dodged,true);r.flush(e);}
 assert.equal(progress(e,3),3);assert.equal(mode(e),'chain');
});
function outboundHarness(){
 if(!c.ProjectileCollisionShapeService)load('src/projectiles/ProjectileCollisionShapeService.js','ProjectileCollisionShapeService');
 c.CollisionPolicyService={normalize:v=>v};c.ProjectileOrbitService={update:()=>false,config:()=>null};
 c.TargetPointProjectileService={arrival:()=>null};c.ProjectileTargetFilterService={allows:()=>true};
 c.RemoteProjectileHomingPresentationBufferService={syncCollision(){}};c.RemoteProjectileHomingPresentationService={clear(){}};
 c.ProjectileTetherMovementService={releaseProjectile(){}};c.ProjectileStateService={clear(){}};
 c.ProjectileImpactService={resolve(p,reason){p.testImpact=reason;return true;}};
 c.AttackGuardService.intercept=()=>false;c.AttackModuleService.onProjectileWallHit=()=>{};
 c.AugmentService.onProjectileResolved=()=>{};c.JustDodgeService={confirmProjectile:()=>false,canConfirm:()=>false,pointSegmentDistance:(x,y,ax,ay,bx,by)=>{const dx=bx-ax,dy=by-ay,q=dx*dx+dy*dy,t=q?Math.max(0,Math.min(1,((x-ax)*dx+(y-ay)*dy)/q)):0;return Math.hypot(x-ax-dx*t,y-ay-dy*t)}};
 c.ProjectileService.items.length=0;
}
function fired(e,attack=ch.attacks.lmb,extra={}){
 const p=projectile(e,attack,{x:100,prevX:100,travel:0,vx:300,vy:0,radius:14,behavior:{collisionPolicy:{passWalls:false,passEnemies:false}},...extra});c.ProjectileService.items.push(p);return p;
}
test('실제 빠른 투사체 update: 벽에 붙은 적을 벽 처리 전 적중·뒤 적은 차단',()=>{
 outboundHarness();const e=reset();walls=[{x:250,y:400,w:50,h:200}];enemy('far-first',{x:350});enemy('wall-front',{x:230});
 const p=fired(e);c.ProjectileService.updateOutbound(p,0,1,clock);assert.equal(damage.length,1);assert.equal(damage[0].target.id,'wall-front');assert.ok(damage[0].impact.point.x<230);assert.ok(damage[0].impact.origin.x<230);assert.equal(c.ProjectileService.items.length,0);
});
test('적 접촉 순서는 Entity 등록 순서가 아닌 이동 순서',()=>{
 outboundHarness();const e=reset();enemy('far-first',{x:350});enemy('near-last',{x:200});const p=fired(e);c.ProjectileService.updateOutbound(p,0,1,clock);assert.equal(damage[0].target.id,'near-last');assert.equal(damage.length,1);
});
test('실제 업데이트: 벽 블록 이음새 반사 후 다음 프레임 진행·벽 뒤 피해 없음',()=>{
 outboundHarness();const e=reset();walls=[{x:250,y:400,w:50,h:100},{x:250,y:500,w:50,h:100}];enemy('behind',{x:350});const p=fired(e);
 c.ProjectileService.updateOutbound(p,0,1,clock);assert.equal(damage.length,0);assert.ok(p.vx<0);const x=p.x;c.ProjectileService.updateOutbound(p,0,.1,clock+16);assert.ok(p.x<x-15);assert.equal(p.wallRedirectCount,1);
});
test('충격 전달은 기울어진 접촉에서 실제 벽 반대편으로 전달·각도별 finite',()=>{
 for(const angle of [-1,-.6,0,.6,1]){
  reset();damage=[];walls=[{x:250,y:300,w:50,h:400}];const e=items.get('p'),p=projectile(e,ch.attacks.wall,{angle,vx:24*Math.cos(angle),vy:24*Math.sin(angle),x:236,y:500,prevX:200,prevY:500-Math.tan(angle)*36,radius:14,networkKey:'slope-'+angle});let event;c.GameEvents.on('projectile-wall-relayed',v=>event=v);
  assert.equal(c.ProjectileRedirectService.relay(p,ch.attacks.wall.modules[1]),true);assert.ok(event.point.x>300||event.point.y<300||event.point.y>700);assert.ok(Number.isFinite(event.point.x)&&Number.isFinite(event.point.y));
 }
});
test('사거리 끝에서는 적이 보여도 방향/사거리 증가 없이 종료',()=>{
 outboundHarness();const e=reset();enemy('visible',{x:900,y:550});const p=fired(e,ch.attacks.lmb,{x:580,prevX:580,vx:30,travel:630,maxTravelDistance:650});
 c.ProjectileService.updateOutbound(p,0,1,clock);assert.equal(p.testImpact,'range');assert.equal(p.maxTravelDistance,650);assert.equal(p.wallRedirectCount,undefined);assert.equal(p.redirectCount,undefined);assert.equal(c.ProjectileService.items.length,0);
});
test('폭발 고무탄 실제 직접 적중200·폭발 후속 실행·비행 접촉 켜짐',()=>{
 outboundHarness();const e=reset();enemy('target',{x:200});const p=fired(e,ch.attacks.bomb,{projectile:ch.attacks.bomb.modules[0],behavior:{collisionPolicy:{passWalls:false,passEnemies:false},impact:ch.attacks.bomb.modules[1]}});
 c.ProjectileService.updateOutbound(p,0,1,clock);assert.equal(damage.length,1);assert.equal(damage[0].attack.damageRatio,1.5);assert.equal(p.testImpact,'target');assert.equal(p.hadHit,true);
});
test('점프 비타격 무적도 게이지 누적·투사체 유지·같은 접촉 재집계 없음',()=>{
 outboundHarness();load('src/combat/ActionStateCombatPolicyService.js','ActionStateCombatPolicyService');
 const e=reset();e.x=200;e.actionState.set('jump',{evasionUntargetable:true});const a=enemy('attacker',{x:100});
 c.BuffService.live=()=>[];const p=fired(a,ch.attacks.lmb,{x:100,prevX:100,vx:100});c.ProjectileService.updateOutbound(p,0,1,clock);r.flush(e);assert.equal(progress(e,7),1);assert.equal(damage.length,0);assert.equal(c.ProjectileService.items.length,1);
 c.ProjectileService.processTargets(p,0,clock+16);r.flush(e);assert.equal(progress(e,7),1);
 const result=c.DamagePipeline.apply({source:a,target:e,attack:ch.attacks.lmb,impact:{type:'area'}});assert.equal(result.dodged,true);r.flush(e);assert.equal(progress(e,7),2);
});
test('반사 뒤 실제 적중 execution 방향은 현재 탄환 진행 방향',()=>{
 outboundHarness();const e=reset(),a=enemy('left',{x:150});const p=fired(e,ch.attacks.lmb,{x:300,prevX:300,vx:-150,angle:Math.PI});c.ProjectileService.updateOutbound(p,0,1,clock);assert.equal(damage.length,1);assert.equal(damage[0].execution.directionAngle,Math.PI);assert.ok(damage[0].impact.origin.x>a.x);assert.ok(damage[0].impact.point.x>a.x);
});
test('초고속 한 프레임에 벽과 맵 경계를 모두 지나도 최초 벽에서 반사',()=>{
 outboundHarness();const e=reset();walls=[{x:250,y:400,w:50,h:200}];const p=fired(e,{...ch.attacks.lmb,range:5000},{vx:3000,maxTravelDistance:6500});c.ProjectileService.updateOutbound(p,0,1,clock);assert.ok(p.x<250);assert.ok(p.vx<0);assert.equal(p.wallRedirectCount,1);assert.ok(p.travel<200);
});
test('벽 반경 안에서 시작한 고무탄도 반사 후 즉시 벽 밖으로 진행',()=>{
 outboundHarness();const e=reset();walls=[{x:250,y:400,w:50,h:200}];const p=fired(e,ch.attacks.lmb,{x:248,prevX:248,vx:30});
 c.ProjectileService.updateOutbound(p,0,1,clock);const x=p.x;c.ProjectileService.updateOutbound(p,0,1,clock+16);
 assert.ok(p.x<x-15,JSON.stringify({x,after:p.x,bounces:p.wallRedirectCount}));assert.equal(p.wallRedirectCount,1);
});
test('무기별 탄속25%·주먹12240·점프200ms·레이저 실제/표시 사거리500',()=>{
 for(const [key,speed] of [['lmb',32.643],['wall',30],['chain',28.07686607142857],['recoil',57.12525],['sniper',51.83421428571428],['bomb',27.5]])assert.equal(ch.attacks[key].modules[0].speed,speed);
 assert.equal(ch.attacks.punch.modules[0].travelSpeed,12240);assert.equal(ch.attacks.laser.range,500);assert.equal(ch.attacks.laser.modules[0].range,500);assert.equal(ch.attacks.laser.modules[1].range,500);
});
test('각 고무탄은 발사한 무기 사거리를 유지·장착 변경 영향 없음',()=>{
 for(const key of ['lmb','wall','chain','recoil','sniper','bomb']){
  const e=reset(),a=ch.attacks[key],p=projectile(e,a,{baseAttackRange:a.range,maxTravelDistance:a.range});r.select(e,'punch',clock);
  for(const mult of [1,1,1,1,1]){c.ProjectileRedirectService.wall(p,true);assert.ok(Math.abs(p.maxTravelDistance-a.range*mult)<1e-8)}
 }
});
test('실제 벽 반사에서 남은 사거리 밖/탐색600 밖 적도 조준·벽 뒤 제외',()=>{
 const e=reset();walls=[{x:250,y:400,w:50,h:200}];const p=projectile(e,ch.attacks.lmb,{x:236,prevX:200,radius:14,travel:630});enemy('blocked',{x:310,y:500});const visible=enemy('visible',{x:100,y:1500});
 c.ProjectileRedirectService.wall(p,false);assert.ok(Math.abs(p.angle-Math.atan2(visible.y-p.y,visible.x-p.x))<1e-8);assert.equal(p.maxTravelDistance,650);
 walls=[];const f=reset(),q=projectile(f,ch.attacks.chain,{x:200,travel:640,maxTravelDistance:650});const hit=enemy('hit',{x:200});q.hitIds.add(hit.id);const far=enemy('far',{x:1300,y:550});assert.equal(c.ProjectileRedirectService.hit(q,hit),true);assert.ok(Math.abs(q.angle-Math.atan2(far.y-q.y,far.x-q.x))<1e-8);
});
test('벽 반경 내부·가로/세로 이음새·비스듬한 각도에서 재충돌 정지 없음',()=>{
 for(const horizontal of [false,true])for(const offset of [1,5,13])for(const angle of [-1,-.5,0,.5,1]){
  outboundHarness();const e=reset();walls=horizontal?[{x:400,y:250,w:100,h:50},{x:500,y:250,w:100,h:50}]:[{x:250,y:400,w:50,h:100},{x:250,y:500,w:50,h:100}];
  const a=horizontal?Math.PI/2+angle:angle,x=horizontal?500:250-offset,y=horizontal?250-offset:500;
  const p=fired(e,ch.attacks.lmb,{x,y,prevX:x,prevY:y,vx:30*Math.cos(a),vy:30*Math.sin(a),angle:a});
  c.ProjectileService.updateOutbound(p,0,1,clock);const bx=p.x,by=p.y;c.ProjectileService.updateOutbound(p,0,1,clock+16);
  assert.ok(Math.hypot(p.x-bx,p.y-by)>15,JSON.stringify({horizontal,offset,angle,x:p.x,y:p.y}));assert.equal(p.wallRedirectCount,1);
 }
});

test('탄환 두께에 걸리는 중간 벽과 좁은 틈은 유도 후보 제외',()=>{
 const e=reset(),p=projectile(e,ch.attacks.lmb,{x:200,y:500,radius:14});
 const blocked=enemy('blocked',{x:600,y:500});walls=[{x:390,y:510,w:20,h:100}];
 assert.equal(c.WorldGeometryService.segmentBlocked(200,500,600,500,0),false);
 assert.equal(c.ProjectileRedirectService.nearest(p,{searchRadius:0}),null);
 const visible=enemy('visible',{x:200,y:1100});assert.equal(c.ProjectileRedirectService.nearest(p,{searchRadius:0}),visible);
 items.delete(visible.id);walls=[{x:390,y:300,w:20,h:187},{x:390,y:513,w:20,h:200}];assert.equal(c.ProjectileRedirectService.nearest(p,{searchRadius:0}),null);
 walls=[{x:390,y:300,w:20,h:185},{x:390,y:515,w:20,h:200}];assert.equal(c.ProjectileRedirectService.nearest(p,{searchRadius:0}),blocked);
 p.radius=17;assert.equal(c.ProjectileRedirectService.nearest(p,{searchRadius:0}),null);
});
test('벽 앞의 적은 중심 뒤 벽이 있어도 최초 접촉까지 안전하면 선택',()=>{
 const e=reset(),p=projectile(e,ch.attacks.lmb,{radius:14});const target=enemy('front',{x:380,y:500});walls=[{x:400,y:400,w:30,h:200}];assert.equal(c.ProjectileRedirectService.nearest(p,{searchRadius:0}),target);
});
test('전이탄은 6명 연쇄·중복 타격 제외·적중마다280 증가·벽 추가 증가 없음',()=>{
 const e=reset(),targets=Array.from({length:6},(_,i)=>enemy('chain'+i,{x:200+i*60}));const p=projectile(e,ch.attacks.chain);
 for(let i=0;i<targets.length;i++){p.x=targets[i].x;assert.equal(c.ProjectileService.hitTarget(p,targets[i]),true);assert.equal(c.ProjectileService.hitTarget(p,targets[i]),false);assert.equal(p.maxTravelDistance,850+(i+1)*340);if(i<5)assert.notEqual(p.redirectEnded,true)}
 assert.equal(p.hitRedirectCount,5);assert.equal(damage.length,6);assert.equal(p.redirectEnded,true);
 p.travel=2500;c.ProjectileRedirectService.wall(p,true);assert.equal(p.maxTravelDistance,2890);assert.equal(ch.attacks.sniper.range,850);
});

test('주먹 실제 progressive-rect 진행: 15ms 미접촉·17ms 끝 적 타격',()=>{
 load('src/render/EffectSpawnService.js','EffectSpawnService');const e=reset(),target=enemy('punch-end',{x:290,y:500,radius:5}),m=ch.attacks.punch.modules[0];
 c.EntityService.forEachEnemy=(source,fn)=>{for(const t of items.values())if(c.RelationService.relation(source,t)==='enemy')fn(t)};
 const effect={...m,x:e.x,y:e.y,angle:0,dur:m.duration,sourceEntityId:e.id,animationState:{attack:ch.attacks.punch,execution:c.AttackExecutionService.create(e,ch.attacks.punch,0)}};

 assert.equal(c.EffectSpawnService.applyProgressiveDamage(effect,0,15/m.duration),false);assert.equal(damage.length,0);
 assert.equal(c.EffectSpawnService.applyProgressiveDamage(effect,15/m.duration,17/m.duration),true);assert.deepEqual(damage.map(x=>x.target.id),[target.id]);
});
test('적중 증가 사거리 snapshot 복제·중복 무시·준비된 사거리 원본',()=>{
 const e=reset(),a=enemy('a',{x:200}),b=enemy('b',{x:300});const p=projectile(e,{...ch.attacks.chain,range:1000});
 r.select(e,'punch',clock);c.ProjectileService.hitTarget(p,a);assert.equal(p.maxTravelDistance,1400);assert.equal(p.rangeBounceCount,1);
 const q=projectile(e,p.attack);const snap={revision:p.redirectRevision,x:p.x,y:p.y,angle:p.angle,vx:p.vx,vy:p.vy,travel:p.travel,redirectCount:p.redirectCount,maxTravelDistance:p.maxTravelDistance,rangeBounceBase:p.rangeBounceBase,rangeBounceCount:p.rangeBounceCount,hitRedirectCount:p.hitRedirectCount,hitIds:Array.from(p.hitIds)};
 assert.equal(c.ProjectileRedirectService.apply(q,snap),true);assert.equal(c.ProjectileRedirectService.apply(q,snap),false);assert.equal(c.ProjectileService.hitTarget(q,a),false);
 q.x=b.x;c.ProjectileService.hitTarget(q,b);assert.equal(q.maxTravelDistance,1800);assert.equal(q.rangeBounceCount,2);
});
test('주먹 옆쪽 적중도 실제 onHit 넉백 방향은 공격 방향 고정',()=>{
 load('src/combat/AttackModuleService.js','AttackModuleService');c.CCService={has:()=>false};c.TriggerModuleService.matches=()=>true;const motions=[];c.MovementService={knockback:(target,angle,distance,speed)=>{motions.push({angle,distance,speed});return true}};
 const e=reset(),t=enemy('side',{x:180,y:545});
 for(const angle of [0,Math.PI/2,-Math.PI/3]){const execution=c.AttackExecutionService.create(e,ch.attacks.punch,angle);c.AttackExecutionService.setImpactOrigin(execution,{mode:'point',x:100,y:500});c.AttackModuleService.onHit(e,t,ch.attacks.punch,{execution},angle);assert.ok(Math.abs(motions.at(-1).angle-angle)<1e-9);assert.equal(motions.at(-1).distance,180)}
});
test('급접근 소환수 포함·350ms/100/최종350 경계·아군 제외',()=>{
 for(const kind of ['player','trainingBot','summon']){const e=reset(),t=enemy('approacher',{kind,x:550});r.update(e,1000);t.x=450;r.update(e,1250);assert.equal(progress(e,4),1);r.update(e,1360);assert.equal(progress(e,4),1)}
 const e=reset(),ally=entity('ally',{kind:'summon',x:550});r.update(e,1000);ally.x=350;r.update(e,1100);assert.equal(progress(e,4),0);
});
test('급접근 미충족: 감소99·최종351·시간351·지오핀 자체 회피',()=>{
 for(const [start,end,time] of [[549,450,1300],[551,451,1300],[550,450,1351]]){const e=reset(),t=enemy('enemy',{x:start});r.update(e,1000);t.x=end;r.update(e,time);assert.equal(progress(e,4),0)}
 const e=reset();enemy('stationary',{x:550});r.update(e,1000);e.x+=140;e.forcedMotion={kind:'dodge'};r.update(e,1130);assert.equal(progress(e,4),0);
});
test('실제 기본 회피140/130ms 이동량은 고정 시간 경계를 가로질러도 감지',()=>{
 const e=reset(),t=enemy('dodger',{x:550});t.forcedMotion={kind:'dodge'};
 for(let now=1000;now<=1430;now+=10){t.x=550-140*Math.max(0,Math.min(1,(now-1300)/130));r.update(e,now)}
 assert.equal(progress(e,4),1);assert.equal(r.state(e).currentCondition,'punch');assert.ok(r.state(e).approaches.get(t.id).samples.length<=24);
 t.x=551;r.update(e,1500);t.x=410;r.update(e,1630);assert.equal(progress(e,4),2);
 t.x=551;r.update(e,1700);t.x=410;r.update(e,1830);assert.equal(progress(e,4),3);assert.equal(mode(e),'punch');
});
test('급접근 기록은 이동 전 관측 필요·사망 정리·원격 관측자 제외',()=>{
 const e=reset(),t=enemy('spawned',{kind:'summon',x:300});r.update(e,1000);assert.equal(progress(e,4),0);t.alive=false;r.update(e,1100);assert.equal(r.state(e).approaches.size,0);
 const f=reset();f.local=false;const target=enemy('far',{x:550});r.update(f,1000);target.x=410;r.update(f,1130);assert.equal(progress(f,4),0);
});
test('충격 전달 실제 updateOutbound 벽 접촉에서 뒤 적에게300 피해',()=>{
 outboundHarness();const e=reset();walls=[{x:250,y:400,w:50,h:200}];enemy('behind-relay',{x:350});const p=fired(e,ch.attacks.wall);c.ProjectileService.updateOutbound(p,0,1,clock);assert.equal(damage.length,1);assert.equal(damage[0].attack.damageRatio,2.5);
});
test('충격 전달 벽에 붙어 발사한 탄환도 뒤 네모 피해 실행',()=>{
 outboundHarness();const e=reset();walls=[{x:250,y:400,w:50,h:200}];enemy('behind-close',{x:350});const p=fired(e,ch.attacks.wall,{x:249,prevX:249});c.ProjectileService.updateOutbound(p,0,1,clock);assert.equal(damage.length,1);assert.equal(damage[0].attack.damageRatio,2.5);
});
test('장판 피해/무적/저회는 발명 게이지 증가 없음',()=>{
 const e=reset(),a=enemy();for(let i=0;i<10;i++){r.damage({impact:{type:'direct'},source:a,target:e,amount:100,impact:{type:'field-area'},now:clock});r.damage({impact:{type:'direct'},source:a,target:e,dodged:true,impact:{type:'field-area'},now:clock});r.flush(e);clock+=500}assert.equal(progress(e,0),0);assert.equal(mode(e),'rubber');
});
test('델트루브형 동적 차막이 뒤 공격·저회는 벽뒤 조건',()=>{
 const e=reset(),a=enemy('wall-attacker',{x:600});c.DynamicWallService.all=()=>[{x:350,y:400,w:50,h:200}];
 r.damage({impact:{type:'direct'},source:a,target:e,amount:100,impact:{type:'area'},now:clock});r.flush(e);assert.equal(progress(e,1),1);
 r.damage({impact:{type:'direct'},source:a,target:e,dodged:true,impact:{type:'area'},now:clock+16});r.flush(e);assert.equal(progress(e,1),2);c.DynamicWallService.all=()=>[];
});
test('실제 장판 updateState: 진입1회·대기/반복틱 미누적·이탈 재진입3회',()=>{
 load('src/core/InstalledAreaFieldService.js','InstalledAreaFieldService');c.NetworkHitAuthorityService={targetAuthoritative:t=>t.local!==false};
 const e=reset(),source=enemy('field-owner');const field=c.InstalledAreaFieldService;
 const state={phase:'point',pointX:100,pointY:500,startedAt:1000,endsAt:10000,instanceId:'entry-field',module:{shape:'circle',range:100,duration:9000,intervalMode:'global',interval:500,targetRelations:['enemy']},insideTargets:new Map(),nextInsideTargets:new Map(),enteredAt:new Map(),lastTriggerAt:new Map(),nextGlobalTriggerAt:3000};
 field.updateState(source,state,1000);r.flush(e);assert.equal(progress(e,0),0);assert.equal(mode(e),'rubber');
 for(let now=1016;now<=4000;now+=16){field.updateState(source,state,now);r.flush(e)}assert.equal(progress(e,0),0);
 for(const now of [4200,4500]){e.x=300;field.updateState(source,state,now);e.x=100;field.updateState(source,state,now+16);r.flush(e)}assert.equal(progress(e,0),0);assert.equal(mode(e),'rubber');
});
test('근거리/원거리: 직접 공격만 누적·트랩/상태DOT/CC/출처불명 제외',()=>{
 for(const x of [120,750]){
  const e=reset(),a=enemy('distance-source',{x}),index=x===120?7:6;
  for(const type of ['field-area','status','debug','unknown',undefined]){
   r.damage({impact:{type:'direct'},source:a,target:e,amount:100,impact:{type},now:clock});r.flush(e);
   r.damage({impact:{type:'direct'},source:a,target:e,dodged:true,impact:{type},now:clock+16});r.flush(e);
  }
  for(const tag of ['상태 피해','덫 발동',...ch.reactiveEquipment.restrictedAttackTags]){
   r.damage({impact:{type:'direct'},source:a,target:e,amount:100,attack:{tags:[tag]},impact:{type:'area'},now:clock});r.flush(e);
  }
  r.damage({impact:{type:'direct'},source:a,target:e,amount:100,impact:{type:'projectile',dot:true},now:clock});r.flush(e);
  r.restriction(e,'bind',a.id,clock);r.flush(e);assert.equal(progress(e,index),0);
  for(const type of ['projectile','area','effect-animation']){r.damage({impact:{type:'direct'},source:a,target:e,amount:100,attack:{tags:['평타']},impact:{type},now:clock});r.flush(e);clock+=16}
  assert.equal(progress(e,index),3);assert.equal(mode(e),x===120?'bomb':'sniper');
 }
});
test('직접 공격 무적/저회도 거리 게이지·CC는 과반동 조건 유지·기어50/평소0.2',()=>{
 const e=reset(),a=enemy('direct-source',{x:750});r.damage({impact:{type:'direct'},source:a,target:e,dodged:true,attack:{tags:['평타']},impact:{type:'projectile'},now:clock});r.flush(e);assert.equal(progress(e,6),1);
 r.damage({impact:{type:'direct'},source:a,target:e,dodged:true,attack:{tags:['stun']},impact:{type:'area'},now:clock+16});r.flush(e);assert.equal(progress(e,6),1);assert.equal(progress(e,5),1);
 assert.equal(ch.worldEffectModules[0].radius,50);assert.equal(ch.worldEffectModules[0].idleAlpha,.2);assert.equal(ch.worldGaugeModules[0].idleAlpha,.35);
});
test('과반동: 순수 넉백/넉백 저회는 누적·자동장착·마지막 조건 변경 없음',()=>{
 const e=reset(),a=enemy('knockback-source',{x:300});
 for(let n=0;n<3;n++){r.restriction(e,'knockback',a.id,clock);r.damage({source:a,target:e,dodged:true,attack:{tags:['넉백']},impact:{type:'area'},now:clock});r.flush(e);clock+=16}
 assert.equal(progress(e,5),0);assert.notEqual(mode(e),'recoil');assert.notEqual(r.state(e).currentCondition,'recoil');
 for(let n=0;n<3;n++){r.restriction(e,'bind',a.id,clock);r.flush(e);clock+=16}assert.equal(progress(e,5),3);assert.equal(mode(e),'recoil');
 r.select(e,'rubber',clock);r.restriction(e,'knockback',a.id,clock);r.flush(e);assert.equal(mode(e),'rubber');
 assert.ok(!ch.reactiveEquipment.distanceExcludedAttackTags.includes('넉백'));
});
test('실제 엔소냐 평타 데이터/TagService/저회 사건은 과반동 미누적',()=>{
 const nsonya=vm.runInContext('('+fs.readFileSync(path.join(root,'src/data/characters/nsonya.js'),'utf8')+')',c);
 const t=vm.createContext({GAME_DATA:{characters:{nsonya},ranges:[{maxInclusive:Infinity,tag:'장거리'}]},COMBAT_STATUS_DEFS:{},COMBAT_BUFF_DEFS:{},attackTagCache:new WeakMap(),attackTagMetadataCache:new WeakMap()});
 vm.runInContext(fs.readFileSync(path.join(root,'src/core/TagService.js'),'utf8')+';globalThis.tags=TagService;',t);
 const old=c.TagService;c.TagService=t.tags;const e=reset(),a=enemy('nsonya',{x:300,character:nsonya});
 c.JustDodgeService=vm.runInContext('JustDodgeService',c);
 for(let n=0;n<3;n++){e.justCheck={expiresAt:clock+80,startedAt:clock};e.justDodgeConsumed=false;assert.equal(c.JustDodgeService.confirmDamageAttempt(e,clock,nsonya.attacks.lmb,{source:a,attack:nsonya.attacks.lmb,impact:{type:'projectile'}}),true);r.flush(e);clock+=100}
 assert.equal(progress(e,5),0);assert.notEqual(mode(e),'recoil');c.TagService=old;
});
test('실제 코녕 둔화는 유지/해제/재적용 모두 과반동 미누적',()=>{
 const raw=vm.runInContext('('+fs.readFileSync(path.join(root,'src/data/characters/konyeong.js'),'utf8')+')',c);
 const module=raw.attacks.rmbImpact.modules.find(m=>m.stateKey==='konyeong-slow-zone').onTrigger[0];
 const e=reset(),a=enemy('konyeong',{x:300});
 const h=vm.createContext({performance:c.performance,COMBAT_STATUS_DEFS:{slow:{}},CombatModifierService:{statusParams:(type,data)=>({...data})},EntityService:c.EntityService,EntitySimulationAuthorityService:c.EntitySimulationAuthorityService,ReactiveEquipmentService:r,nextCcPresentationOrder:()=>1});
 vm.runInContext(fs.readFileSync(path.join(root,'src/combat/CCService.js'),'utf8')+';globalThis.cc=CCService;',h);
 for(let n=0;n<20;n++){h.cc.add(e,'slow',module.duration,'konyeong:zone-1:slow',{...module.data,sourceEntityId:a.id});r.flush(e);clock+=50}
 assert.equal(progress(e,5),0);assert.equal(mode(e),'rubber');
 e.statuses.delete('slow');h.cc.add(e,'slow',module.duration,'konyeong:zone-1:slow',{...module.data,sourceEntityId:a.id});r.flush(e);assert.equal(progress(e,5),0);
 clock+=module.duration+1;h.cc.add(e,'slow',module.duration,'konyeong:zone-1:slow',{...module.data,sourceEntityId:a.id});r.flush(e);assert.equal(progress(e,5),0);assert.equal(mode(e),'rubber');
});
test('실제 루네프 화염 폭발 원거리 직접 피해는 정밀 누적·화염DOT 제외',()=>{
 const runef=vm.runInContext('('+fs.readFileSync(path.join(root,'src/data/characters/runef.js'),'utf8')+')',c);
 const t=vm.createContext({GAME_DATA:{characters:{runef},ranges:[{maxInclusive:Infinity,tag:'장거리'}]},COMBAT_STATUS_DEFS:{burn:{label:'화염'}},COMBAT_BUFF_DEFS:{},attackTagCache:new WeakMap(),attackTagMetadataCache:new WeakMap()});
 vm.runInContext(fs.readFileSync(path.join(root,'src/core/TagService.js'),'utf8')+';globalThis.tags=TagService;',t);
 const old=c.TagService;c.TagService=t.tags;const e=reset(),a=enemy('runef',{x:800,character:runef}),attack=runef.attacks.fireExplosion;
 assert.ok(t.tags.attackTags(attack).has('넉백'));assert.ok(t.tags.attackTags(attack).has('burn'));
 r.damage({source:a,target:e,amount:400,attack,impact:{type:'area'},now:clock});r.flush(e);assert.equal(progress(e,6),1);assert.equal(progress(e,5),0);
 for(let n=0;n<4;n++){r.damage({source:a,target:e,amount:50,attack:{tags:['상태 피해','burn']},impact:{type:'status',dot:true},now:clock+n*500});r.flush(e)}assert.equal(progress(e,6),1);
 c.TagService=old;
});
test('과반동은 이동 정지CC만3회 제작·둔화/끌어당김/넉백 제외·피해250',()=>{
 for(const status of ['stun','bind','freeze','sleep','neutralize']){
  const e=reset(),a=enemy('cc-source',{x:300});for(let n=1;n<=3;n++){r.restriction(e,status,a.id,clock);r.flush(e);assert.equal(progress(e,5),n);assert.equal(mode(e),n===3?'recoil':'rubber');clock+=16}
 }
 const e=reset(),a=enemy('excluded-source',{x:300});
 for(const type of ['slow','pull','knockback']){r.restriction(e,type,a.id,clock);r.flush(e)}
 for(const tag of ['slow','끌어오기','넉백']){r.damage({source:a,target:e,dodged:true,attack:{tags:[tag]},impact:{type:'area'},now:clock});r.flush(e)}
 assert.equal(progress(e,5),0);assert.equal(mode(e),'rubber');assert.equal(ch.baseDamage*ch.attacks.recoil.damageRatio,250);assert.equal(ch.attacks.recoil.range,650);
 r.damage({source:a,target:e,amount:100,impact:{type:'field-area',fieldDuration:3000},now:clock});r.restriction(e,'slow',a.id,clock);r.flush(e);assert.equal(progress(e,0),1);assert.equal(progress(e,5),0);
});
test('타우 적중 추격: 투사체 상태가 정리되어도 실제 적중 carrier로 이동',()=>{
 const tau=JSON.parse(fs.readFileSync(path.join(root,'src/data/characters/tau.js'),'utf8')),attack=tau.attacks.rmb;
 const e=reset(),target=enemy('tau-hit',{x:400}),moves=[];e.character=tau;
 c.ProjectileStateService={get:()=>null};c.MovementAbilityService={active:()=>false,start:(source,module,angle,options)=>{moves.push(options.runtimeDistance);return true}};c.CombatStatusApplicationService={apply:()=>true};
 const execution=c.AttackExecutionService.create(e,attack,0),carrier={x:400,y:500};
 c.AttackModuleService.onHit(e,target,attack,{execution},0,{phase:'outbound',projectile:carrier});
 assert.deepEqual(moves,[300]);c.AttackModuleService.onHit(e,target,attack,{execution},0,{phase:'outbound',projectile:carrier});assert.deepEqual(moves,[300]);
});
test('체리티 실제 저격/차징 태그: 거리500 이상 정밀·벽 뒤는 충격 우선',()=>{
 const cherity=JSON.parse(fs.readFileSync(path.join(root,'src/data/characters/cherity.js'),'utf8'));
 const t=vm.createContext({GAME_DATA:{characters:{cherity},ranges:[{maxInclusive:Infinity,tag:'장거리'}]},COMBAT_STATUS_DEFS:{bind:{label:'속박'},neutralize:{label:'무력화'}},COMBAT_BUFF_DEFS:{},attackTagCache:new WeakMap(),attackTagMetadataCache:new WeakMap()});
 vm.runInContext(fs.readFileSync(path.join(root,'src/core/TagService.js'),'utf8')+';globalThis.tags=TagService;',t);
 const old=c.TagService;c.TagService=t.tags;
 for(const x of [750,900,1500]){const e=reset(),a=enemy('cherity',{x,character:cherity}),attack={...cherity.attacks.lmb,resolvedChargeProgress:2,damageRatio:6};assert.ok(!t.tags.attackTags(attack).has('bind'));r.damage({source:a,target:e,amount:900,attack,impact:{type:'projectile'},now:clock});r.flush(e);assert.equal(progress(e,6),1)}
 const e=reset(),a=enemy('cherity',{x:800,character:cherity});walls=[{x:400,y:400,w:50,h:200}];r.damage({source:a,target:e,amount:900,attack:cherity.attacks.lmb,impact:{type:'projectile'},now:clock});r.flush(e);assert.equal(progress(e,1),1);assert.equal(progress(e,6),0);c.TagService=old;
});
test('주먹 발명: 일반/버프 걸음 제외·회피 접근 유지',()=>{
 for(const multiplier of [1,1.5,2]){const e=reset(),a=enemy('walker',{x:600,walkMultiplier:multiplier});r.update(e,1000);for(let now=1016;now<=1600;now+=16){a.x-=4.5*multiplier*16/c.GAME_DATA.frameMs;r.update(e,now)}assert.equal(progress(e,4),0)}
 const e=reset(),a=enemy('dodger',{x:550});r.update(e,1000);a.x=410;r.update(e,1130);assert.equal(progress(e,4),1);
});
test('벽뒤 발명: 직접 공격만·CC/트랩/상태DOT/저회 제외·전달300',()=>{
 const e=reset(),a=enemy('behind-source',{x:600});walls=[{x:350,y:400,w:50,h:200}];
 for(const type of ['field-area','status','unknown']){r.damage({source:a,target:e,amount:100,impact:{type},now:clock});r.damage({source:a,target:e,dodged:true,impact:{type},now:clock});r.flush(e)}
 for(const tag of ['덫 발동','상태 피해','stun','bind','freeze','sleep','neutralize','slow','끌어오기']){r.damage({source:a,target:e,amount:100,attack:{tags:[tag]},impact:{type:'area'},now:clock});r.damage({source:a,target:e,dodged:true,attack:{tags:[tag]},impact:{type:'area'},now:clock});r.flush(e)}
 r.restriction(e,'bind',a.id,clock);r.flush(e);assert.equal(progress(e,1),0);
 r.damage({source:a,target:e,amount:100,attack:{tags:['평타']},impact:{type:'projectile'},now:clock});r.flush(e);assert.equal(progress(e,1),1);
 assert.equal(ch.baseDamage*ch.attacks.wallBurst.damageRatio,250);
});
test('거리350 경계·밖만 원거리·점선 원 하나·평타300ms',()=>{
 for(const [distance,index] of [[349,7],[350,7],[351,6]]){const e=reset(),a=enemy('boundary',{x:e.x+distance});r.damage({source:a,target:e,amount:200,attack:{tags:['평타']},impact:{type:'projectile'},now:clock});r.flush(e);assert.equal(progress(e,index),1);assert.equal(progress(e,index===7?6:7),0)}
 const e=reset();c.Training.player=e;const ctx=canvas(),arcs=[];ctx.arc=(x,y,r)=>arcs.push(r);ctx.setLineDash=()=>{};c.EquipmentGaugePresentationService.thresholds(ctx,e,ch.worldGaugeModules[1]);assert.deepEqual(arcs,[350]);assert.equal(ch.attacks.lmb.cd,350);
});
test('폭발 고무탄 직격/폭발200·공유 실행은 같은 적 중첩 없이 주변 적 피해',()=>{
 const e=reset(),direct=enemy('direct',{x:200}),near=enemy('near',{x:240});
 c.NetworkHitAuthorityService={targetAuthoritative:()=>true};
 c.TriggerDispatchService={execute:(trigger,event,ctx,next)=>next()};
 c.DamagePipeline={apply:ctx=>{const amount=ch.baseDamage*ctx.attack.damageRatio;damage.push({target:ctx.target,amount});return{hit:true,applied:true,amount}}};
 const h=vm.createContext({NetworkHitAuthorityService:c.NetworkHitAuthorityService,TriggerDispatchService:c.TriggerDispatchService,DamagePipeline:c.DamagePipeline,AttackModuleService:c.AttackModuleService,AttackExecutionService:c.AttackExecutionService});
 vm.runInContext(fs.readFileSync(path.join(root,'src/combat/AttackHitTriggerService.js'),'utf8')+';globalThis.hit=AttackHitTriggerService;',h);
 const parent=c.AttackExecutionService.create(e,ch.attacks.bomb,0);
 assert.equal(h.hit.damage({source:e,target:direct,attack:ch.attacks.bomb,execution:parent}).amount,150);
 const burst=c.AttackExecutionService.create(e,ch.attacks.explosion,0);c.AttackExecutionService.shareHits(burst,parent);
 assert.equal(h.hit.damage({source:e,target:direct,attack:ch.attacks.explosion,execution:burst}).duplicateExecutionHit,true);
 assert.equal(h.hit.damage({source:e,target:near,attack:ch.attacks.explosion,execution:burst}).amount,150);
 assert.equal(damage.length,2);assert.equal(ch.attacks.bomb.modules[1].shareHitTargets,true);
 h.performance=c.performance;h.AbilityService=c.AbilityService;h.AugmentService=c.AugmentService;h.ProgressScaledAttackService=c.ProgressScaledAttackService;
 h.AttackModuleService={...c.AttackModuleService,afterAttack(){}};
 h.AreaAttackService={execute:(source,attack,angle,module,volley)=>{for(const target of [direct,near])h.hit.damage({source,target,attack,execution:volley.execution})}};
 vm.runInContext(fs.readFileSync(path.join(root,'src/projectiles/ProjectileImpactService.js'),'utf8')+';globalThis.impact=ProjectileImpactService;',h);
 damage=[];assert.equal(h.impact.resolve(projectile(e,ch.attacks.bomb,{volley:{execution:parent},behavior:{impact:ch.attacks.bomb.modules[1]}}),'target'),true);
 assert.equal(damage.length,0); // Both targets were already hit in the shared execution.

 const ranged=c.AttackExecutionService.create(e,ch.attacks.explosion,0);
 assert.equal(h.hit.damage({source:e,target:direct,attack:ch.attacks.explosion,execution:ranged}).amount,150);
});
test('벽 반사마다 속력65%·복제 속력 유지·200공격150/전달250',()=>{
 const e=reset(),p=projectile(e,{...ch.attacks.lmb},{x:9,prevX:20,vx:-24,angle:Math.PI});
 c.ProjectileRedirectService.wall(p,true);assert.ok(Math.abs(Math.hypot(p.vx,p.vy)-15.6)<1e-8);
 p.x=1991;p.vx=Math.abs(p.vx);p.angle=0;c.ProjectileRedirectService.wall(p,true);
 assert.ok(Math.abs(Math.hypot(p.vx,p.vy)-10.14)<1e-8);
 const mirror=projectile(e);c.ProjectileRedirectService.apply(mirror,{revision:1,x:p.x,y:p.y,angle:p.angle,vx:p.vx,vy:p.vy,travel:p.travel,redirectCount:2});assert.ok(Math.abs(mirror.baseSpeed-10.14)<1e-8);
 for(const key of ['wall','chain','sniper','bomb','explosion'])assert.equal(ch.attacks[key].damageRatio,1.5);
 assert.equal(ch.attacks.wallBurst.damageRatio,2.5);
});
test('반 스패너 공격1회당 공통 모드 한바퀴·원격 동일 회전·파괴 숨김',()=>{
 c.CHARACTER_DATA.van=vm.runInContext('('+fs.readFileSync(path.join(root,'src/data/characters/van.js'),'utf8')+')',c);const van=c.CharacterDataService.compile('van');
 const e=reset();e.character=van;
 const config=van.wrenchDurability,gear={stateKey:config.rotationStateKey,turnRadians:Math.PI*2};
 for(const key of ['lmb','rmb','counter'])assert.ok(van.attacks[key].modules.some(m=>m.type==='mode.toggle'&&m.when==='after-attack'));
 c.ModeStateService.toggle(e,van.attacks.lmb.modules.at(-1));assert.equal(c.ModeGearPresentationService.rotation(e,gear,300,clock+300),Math.PI*2);
 const remote=entity('remote',{character:van,local:false});c.ModeStateService.applyRemote(remote,c.ModeStateService.serialize(e,clock+150),clock+150);assert.equal(c.ModeGearPresentationService.rotation(remote,gear,300,clock+300),Math.PI*2);
 load('src/render/VanWrenchDurabilityPresentationService.js','VanWrenchDurabilityPresentationService');e.actionState.set(config.stateKey,{kind:'progress-state',stateKey:config.stateKey,value:0,max:800});assert.equal(c.VanWrenchDurabilityPresentationService.drawBehind(canvas(),e),false);
});
test('키 예고 지역/스킬좌클·우클 보상 잔류는 장판 발명 제외',()=>{
 c.CHARACTER_DATA.ki=vm.runInContext('('+fs.readFileSync(path.join(root,'src/data/characters/ki.js'),'utf8')+')',c);const ki=c.CharacterDataService.compile('ki');
 const e=reset(),a=enemy('ki',{character:ki}),module=ki.attacks.rmb.modules.find(m=>m.type==='field.area');
 assert.equal(module.reactiveEquipmentEntry,false);
 for(const rewardOnly of [false,true]){assert.equal(r.field(e,a,{module,endsAt:5000,rewardOnly},clock),false);r.flush(e);assert.equal(progress(e,0),0)}
 for(const key of ['forecastExecute','deceive'])assert.ok(ki.attacks[key].modules.some(m=>m.type==='field.area'&&m.operation==='clear'&&m.retainRewardDuration===500));
 assert.equal(r.field(e,a,{module:{duration:2000},rewardOnly:true,endsAt:5000},clock),false);
 r.field(e,a,{module:{duration:2000},endsAt:5000},clock);r.flush(e);assert.equal(progress(e,0),0);
});
test('추진 도약기 복구·지속 장판 실제 피해3회만 제작',()=>{
 const e=reset(),a=enemy();assert.equal(ch.attacks.jump.modules[0].type,'trajectory.arc');assert.equal(ch.attacks.jump.modules[1].distance,220);
 for(const [amount,dodged,duration] of [[0,false,2000],[0,true,2000],[100,false,0]]){r.damage({source:a,target:e,amount,dodged,impact:{type:'field-area',fieldDuration:duration},now:clock});r.flush(e);assert.equal(progress(e,0),0)}
 for(let n=1;n<=3;n++){clock+=500;r.damage({source:a,target:e,amount:100,impact:{type:'field-area',fieldDuration:2000},now:clock});r.flush(e);assert.equal(progress(e,0),n)}assert.equal(mode(e),'jump');
});
test('뉴 실제 마검 infinite 장판은 피해3회 제작·무적/저회 제외',()=>{
 c.CHARACTER_DATA.nyu=vm.runInContext('('+fs.readFileSync(path.join(root,'src/data/characters/nyu.js'),'utf8')+')',c);const nyu=c.CharacterDataService.compile('nyu');
 const module=nyu.attacks.rmb.modules.find(m=>m.type==='projectile.impact').field;assert.equal(module.duration,'infinite');
 const e=reset(),a=enemy('nyu',{character:nyu});
 const impact={type:'field-area',fieldDuration:0,fieldPersistent:module.duration==='infinite'};
 for(const dodged of [false,true]){r.damage({source:a,target:e,amount:0,dodged,impact,now:clock});r.flush(e);assert.equal(progress(e,0),0)}
 for(let n=1;n<=3;n++){clock+=1000;r.damage({source:a,target:e,amount:150,attack:Object.values(nyu.attacks).find(a=>a.id===module.attackId),impact,now:clock});r.flush(e);assert.equal(progress(e,0),n)}assert.equal(mode(e),'jump');
});
test('레이카 가호/뉴 마검 보유 뒤 검 표시 조건·공통 검 렌더',()=>{
 for(const id of ['reika','nyu'])c.CHARACTER_DATA[id]=vm.runInContext('('+fs.readFileSync(path.join(root,'src/data/characters/'+id+'.js'),'utf8')+')',c);
 const reika=c.CharacterDataService.compile('reika'),nyu=c.CharacterDataService.compile('nyu');
 const e=reset();e.character=reika;const rc=reika.worldEffectModules[0].conditions[0];
 assert.equal(c.TriggerConditionService.matches(rc,{source:e}),false);c.ModeStateService.set(e,'reika-mode','blessed');assert.equal(c.TriggerConditionService.matches(rc,{source:e}),true);
 e.character=nyu;const nc=nyu.worldEffectModules[0].conditions[0];assert.equal(c.TriggerConditionService.matches(nc,{source:e}),true);e.actionState.set('nyu-dark-sword',{kind:'projectile'});assert.equal(c.TriggerConditionService.matches(nc,{source:e}),false);
 const ctx=canvas();ctx.rotate=()=>{};ctx.closePath=()=>{};ctx.moveTo=()=>{};ctx.lineTo=()=>{};assert.equal(c.ModeGearPresentationService.drawSword(ctx,e,nyu.worldEffectModules[0],1),true);
});
test('레이카 가호 실제 ability 미리보기 즉시 생성·공통 색 / 뉴 마검 확대',()=>{
 const reika=c.CharacterDataService.compile('reika'),nyu=c.CharacterDataService.compile('nyu');
 const e=reset();e.character=reika;c.ModeStateService.set(e,'reika-mode','blessed');
 load('src/combat/AttackPreviewService.js','AttackPreviewService');
 c.SimulationScheduleService={scheduleContinuation(){}};
 const ability=reika.abilities.rmb,module=ability.trigger.modules.find(m=>m.type==='preview.create'&&m.requireAttackId==='attack.reika.gaho-weapon');
 assert.ok(module);const attack=reika.attacks.gahoWeapon;
 const context={source:e,ability,attack,executed:true,resolvedAttackId:attack.id,angle:0,targetPoint:{x:300,y:200},now:clock};
 c.AbilityModuleService.handlers['preview.create'](context,()=>{},module);
 assert.ok(e.attackPreview);assert.equal(e.attackPreview.until,clock+320);assert.equal(e.attackPreview.range,reika.attacks.gahoSlam.range);assert.equal(e.attackPreview.style,null);
 assert.equal(e.attackPreview.x,300);assert.equal(e.attackPreview.y,200);
 assert.equal(nyu.worldEffectModules[0].scale,1.75);
});
console.log(`PASS ${passed} Geopin regression groups`);
