/* 실제 캐릭터와 공통 차징/전달/착탄/이동/장판 경로 회귀. 브라우저/WebRTC 대체 아님. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');let clock=1000,passed=0,shots=[],areas=[],fields=[],burns=[];
const c=vm.createContext({console,Map,Set,WeakMap,WeakSet,Math,performance:{now:()=>clock},EMPTY_RUNTIME_ITEMS:[],EMPTY_AUGMENT_EFFECTS:[]});
function load(p,n){vm.runInContext(fs.readFileSync(path.join(root,p),'utf8')+`;globalThis.${n}=${n};`,c)}
function test(n,fn){shots=[];areas=[];fields=[];burns=[];clock=1000;fn();passed++;console.log('PASS '+n)}
for(const n of ['characterValue','characterCount','characterSum','characterProduct','freezeCharacterData','CHARACTER_RULES'])load('src/data/'+n+'.js',n);
c.CHARACTER_DATA={};for(const item of JSON.parse(fs.readFileSync(path.join(root,'src/data/characters/index.json'))).characters){const raw=vm.runInContext('('+fs.readFileSync(path.join(root,item.path),'utf8')+')',c);c.CHARACTER_DATA[raw.id]=raw}
load('src/data/CharacterDataService.js','CharacterDataService');const ch=c.CharacterDataService.compile('siro');
c.GAME_DATA={frameMs:1000/60};c.Training={sessionMode:'training'};c.OnlineDuelService={active:false};
c.AbilityService={attackById:(character,id)=>Object.values(character.attacks).find(a=>a.id===id),damageRatio:(character,a)=>a?.damageRatio||0};
c.EntitySimulationAuthorityService={isLocal:e=>e.local!==false};c.EntityService={items:new Map(),owner:e=>e};
c.RelationService={relation:(s,t)=>s===t?'self':s.teamId===t.teamId?'ally':'enemy',canTarget:(s,t)=>s.teamId!==t.teamId};
c.AugmentService={update(){},captureResourceConditionSnapshot:()=>null,prepareAttack:(s,a)=>a,attackCostMultiplier:()=>1};c.ProgressScaledAttackService={resolve:(s,a)=>a};
c.TagService={derivedModuleTags:()=>[],attackTags:a=>new Set(a.tags||[])};c.AttackPreviewService={fromAttack:(s,a,angle,until)=>({attack:a,angle,until})};
c.StaminaService={nominalBudget:e=>e.stamina,spend:(e,n)=>{if(e.stamina<n)return false;e.stamina-=n;return true}};
c.AttackResourceConditionService={capture:()=>null};c.COMBAT_BUFF_DEFS={evasionInvulnerable:{}};c.COMBAT_STATUS_DEFS={burn:{},evasionInvulnerable:{}};
c.BuffService={set:()=>true,remove:()=>true};c.CCService={removeSource(){},isDotImpact:()=>false};
c.EffectSpawnService={removeKey(){},ease:v=>v,definitionSnapshot:x=>JSON.parse(JSON.stringify(x))};
let neutralizeCalls=[];c.NeutralizingKnockbackService={start:args=>{neutralizeCalls.push(args);return true;}};
c.MovementService={travelDistance:(x,y,a,d)=>d,resolveEmbedded(){},finalizeForcedMotion(){},knockback:()=>true};
c.OnlinePresentationSyncService={send(){}};c.WorldGeometryService={wallAtPoint:()=>null,nearestWallTarget:()=>null};
c.ProjectileStateService={get:()=>null};c.ProjectileService={spawn:data=>{shots.push(data);c.AttackModuleService.onDelivery(data.source,data.attack,data.angle,data.volley?.execution);return data}};
c.AreaAttackService={execute:(s,a,angle,m,v,options)=>{areas.push({s,a,angle,m,v,options});return true}};
c.InstalledAreaFieldService={KIND:'installed-area-field',containmentTravelDistance:(e,a,d)=>d,baseKey:m=>m.stateKey,activatePoint:(s,m,p,o)=>{const v={s,m,p,o};fields.push(v);return v}};
for(const [p,n]of [['src/core/GameEvents.js','GameEvents'],['src/core/TriggerConditionService.js','TriggerConditionService'],['src/core/TriggerModuleService.js','TriggerModuleService'],['src/core/ArcTrajectoryService.js','ArcTrajectoryService'],['src/core/CollisionPolicyService.js','CollisionPolicyService'],['src/combat/AttackExecutionService.js','AttackExecutionService'],['src/combat/AttackModuleService.js','AttackModuleService'],['src/projectiles/ProjectileModuleService.js','ProjectileModuleService'],['src/projectiles/ProjectileImpactService.js','ProjectileImpactService'],['src/projectiles/TargetPointProjectileService.js','TargetPointProjectileService'],['src/combat/TriggeredAttackService.js','TriggeredAttackService'],['src/combat/CounterModuleService.js','CounterModuleService'],['src/abilities/MovementAbilityService.js','MovementAbilityService'],['src/abilities/ChargedAttackService.js','ChargedAttackService'],['src/ui/CharacterDescriptionService.js','CharacterDescriptionService']])load(p,n);
load('src/core/ModeStateService.js','ModeStateService');
c.CombatStatusApplicationService={apply:ctx=>{burns.push(ctx);return true}};
function entity(extra={}){return{id:'siro',teamId:'A',kind:'player',character:ch,baseDamage:ch.baseDamage,alive:true,local:true,x:400,y:500,radius:20,stamina:1000,actionState:new Map(),cooldowns:new Map(),statuses:new Map(),buffs:new Map(),...extra}}
function carrier(s,a=ch.attacks.counterArrow){return{source:s,attack:a,behavior:c.ProjectileModuleService.config(a),x:400,y:500,angle:Math.PI,radius:12,targetPoint:{x:400,y:500},networkKey:'arrow-'+clock,volley:{execution:c.AttackExecutionService.create(s,a,Math.PI)}}}
const originalMovement=c.MovementAbilityService;
c.MovementAbilityService={...originalMovement,applyBuffs(){},clearBuffs(){},spawnEffects:()=>[],broadcastEffects(){}};
c.AttackService={canUse:(e,a)=>e.stamina>=a.cost,execute:(s,a,angle)=>c.TriggeredAttackService.execute(s,a,angle)};
test('62명 순수 데이터·중복 없는 적색·체력/매우빠름/칭호 및 공통 반격 CC',()=>{
 assert.equal(Object.keys(c.CHARACTER_DATA).length,62);assert.equal(ch.maxHealth,1100);assert.equal(ch.speed,4.5);assert.equal(ch.moveLabel,'매우 빠름');assert.equal(ch.title,'토끼 궁수');assert.equal(ch.classification.style,3);assert.equal(ch.classification.role,2);
 for(const raw of Object.values(c.CHARACTER_DATA))if(raw.id!=='siro')assert.notEqual(String(raw.color).toLowerCase(),ch.color);
 assert.ok(Object.isFrozen(ch));const m=ch.abilities.counter.trigger.modules[0];assert.equal(c.CounterModuleService.validate(m),true);assert.equal(c.CounterModuleService.referencedCc(entity(),m).status,'burn');
});
test('차징 해제 비용·400/800ms 경계·홀드 중 미소모·1/2/3발 산탄',()=>{
 for(const [ms,count,cost]of [[0,1,150],[399,1,150],[400,2,250],[799,2,250],[800,3,350],[1500,3,350]]){
  shots=[];clock=1000;const e=entity();assert.equal(c.ChargedAttackService.start({source:e,attack:ch.attacks.lmb,angle:0,now:clock},{}),true);
  assert.equal(e.stamina,1000);clock+=ms;c.ChargedAttackService.update(e,clock);assert.equal(e.stamina,1000);
  assert.equal(c.ChargedAttackService.release({source:e,attack:ch.attacks.lmb,angle:0,now:clock},{}),true);
  assert.equal(e.stamina,1000-cost);assert.equal(shots.length,count);assert.equal(e.actionState.has('charge:primary'),false);
  for(const shot of shots){assert.equal(shot.attack.range,1200);assert.equal(shot.attack.damageRatio*ch.baseDamage,100)}
  const half=count===1?0:count===2?.04:.08;assert.equal(shots[0].angle,half===0?0:-half);assert.equal(shots.at(-1).angle,half);
 }
});
test('비용 부족한 단계는 무소모·미발사·해제 정리 / 취소 무소모',()=>{
 const poor=entity({stamina:149});assert.equal(c.ChargedAttackService.start({source:poor,attack:ch.attacks.lmb,now:clock},{}),false);
 for(const [ms,budget]of [[400,249],[800,349]]){
  clock=1000;const e=entity({stamina:budget});assert.equal(c.ChargedAttackService.start({source:e,attack:ch.attacks.lmb,angle:0,now:clock},{}),true);
  clock+=ms;c.ChargedAttackService.update(e,clock);assert.equal(e.stamina,budget);
  assert.equal(c.ChargedAttackService.release({source:e,attack:ch.attacks.lmb,angle:0,now:clock},{}),false);
  assert.equal(e.stamina,budget);assert.equal(shots.length,0);assert.equal(e.actionState.has('charge:primary'),false);assert.equal(e.attackPreview,null);
 }
 const cancel=entity();c.ChargedAttackService.start({source:cancel,attack:ch.attacks.lmb,now:clock},{});c.ChargedAttackService.cancel(cancel);assert.equal(shots.length,0);assert.equal(cancel.stamina,1000);assert.equal(cancel.actionState.has('charge:primary'),false);
});
test('공통 차징 확장은 기존 체리티 사거리/피해/탄속/관통을 보존',()=>{
 const old=c.CharacterDataService.compile('cherity').attacks.lmb;const spec=c.ChargedAttackService.dynamicSpec(old,2);
 assert.equal(spec.range,1400);assert.equal(spec.damageRatio,6);assert.equal(spec.modules.find(m=>m.type==='delivery.projectile').speed,53);assert.equal(spec.modules.find(m=>m.type==='projectile.pierce').walls,true);
 assert.equal(old.modules.some(m=>m.type==='pattern.scatter'),false);
});
test('백드래프트: 충돌 전용 본체·실제 착탄 중심 폭발 1회·넉백/화염 연결',()=>{
 const e=entity(),p=carrier(e,ch.attacks.rmb);p.x=920;p.y=650;
 assert.equal(c.AttackModuleService.projectile(ch.attacks.rmb).damageOnTravel,false);
 assert.equal(c.ProjectileImpactService.resolve(p,'target'),true);assert.equal(areas.length,1);assert.equal(areas[0].options.geometrySource.x,920);assert.equal(areas[0].options.geometrySource.y,650);assert.equal(areas[0].a.damageRatio*ch.baseDamage,200);assert.equal(areas[0].m.wallPolicy,'block');
 assert.equal(c.ProjectileImpactService.resolve(p,'target'),false);assert.equal(areas.length,1);
 const target=entity({id:'enemy',teamId:'B'});c.AttackModuleService.onHit(e,target,ch.attacks.rmbExplosion,areas[0].v,0,{shape:'circle',center:{x:920,y:650}});assert.equal(burns.length,1);assert.equal(burns[0].duration,4000);
});
test('점프 최고점에서 최초 출발 위치로 화살 1회·착지 전에 발사·시각 높이 캡처',()=>{
 const e=entity(),m=ch.attacks.counter.modules[1];c.AttackModuleService.afterAttack(e,ch.attacks.counter,0,c.AttackExecutionService.create(e,ch.attacks.counter,0));
 clock=1349;c.MovementAbilityService.update(e,clock,349);assert.equal(shots.length,0);
 clock=1350;c.MovementAbilityService.update(e,clock,1);assert.equal(shots.length,1);assert.equal(e.x,225);const shot=shots[0];assert.equal(shot.x,225);assert.equal(shot.y,500);assert.equal(shot.targetPoint.x,400);assert.equal(shot.targetPoint.y,500);assert.equal(shot.angle,0);assert.equal(shot.targetDistance,175);assert.equal(shot.behavior.trajectory.startHeight,140);assert.equal(c.TargetPointProjectileService.arrival(shot).passWallsInFlight,true);
 clock=1550;c.MovementAbilityService.update(e,clock,200);assert.equal(shots.length,1);clock=1700;c.MovementAbilityService.update(e,clock,150);assert.equal(shots.length,1);assert.equal(e.x,50);assert.equal(e.actionState.has(m.stateKey),false);
 assert.equal(fields.length,0); // 장판은 실제 화살 착탄 시 생성
});
test('긴 프레임에서도 정확한 최고점 위치에서 발사한 뒤 남은 이동 진행',()=>{
 const e=entity();c.AttackModuleService.afterAttack(e,ch.attacks.counter,0,c.AttackExecutionService.create(e,ch.attacks.counter,0));clock=1700;c.MovementAbilityService.update(e,clock,700);
 assert.equal(shots.length,1);assert.equal(shots[0].x,225);assert.equal(shots[0].behavior.trajectory.startHeight,140);assert.equal(e.x,50);assert.equal(e.actionState.has('movement:siro-jump'),false);
});
test('다른 조준각·이동 중 조준 변경에도 저장된 시작점으로 발사',()=>{
 const e=entity(),angle=Math.PI/2;c.AttackModuleService.afterAttack(e,ch.attacks.counter,angle,c.AttackExecutionService.create(e,ch.attacks.counter,angle));e._remoteAimAngle=0;
 clock=1350;c.MovementAbilityService.update(e,clock,350);assert.equal(shots.length,1);assert.ok(Math.abs(shots[0].x-400)<1e-8);assert.equal(shots[0].y,325);assert.equal(shots[0].targetPoint.x,400);assert.equal(shots[0].targetPoint.y,500);assert.ok(Math.abs(shots[0].angle-Math.PI/2)<1e-8);
});
test('원격 미러·최고점 이전 취소·사망은 추가 화살을 생성하지 않음',()=>{
 for(const mode of ['remote','cancel','dead']){shots=[];const e=entity();c.AttackModuleService.afterAttack(e,ch.attacks.counter,0,c.AttackExecutionService.create(e,ch.attacks.counter,0));if(mode==='remote')e.local=false;if(mode==='cancel')c.MovementAbilityService.clear(e);if(mode==='dead')e.alive=false;clock=1350;c.MovementAbilityService.update(e,clock,350);assert.equal(shots.length,0,mode);clock=1000;}
});
test('화살 착탄에만 3초 장판 1개·온라인 원격 착탄은 중복 생성 금지',()=>{
 const e=entity(),p=carrier(e);assert.equal(c.TargetPointProjectileService.arrived(p),true);assert.equal(fields.length,1);const f=fields[0];assert.equal(f.p.x,400);assert.equal(f.p.y,500);assert.equal(f.m.duration,3000);assert.equal(f.m.interval,500);assert.equal(f.o.attack.id,ch.attacks.rainTick.id);assert.equal(f.o.attack.damageRatio*ch.baseDamage,100);assert.equal(f.m.wallPolicy,'ignore');assert.equal(c.TargetPointProjectileService.arrived(p),false);assert.equal(fields.length,1);
 c.Training.sessionMode='online';e.local=false;assert.equal(c.ProjectileImpactService.resolve(carrier(e),'arrival'),true);assert.equal(fields.length,1);c.Training.sessionMode='training';
});
test('온라인 최고점 후속 패킷은 원점/출발 목표/높이의 동일 스냅샷 사용',()=>{
 const packets=[];c.RoomService={sendGameplay:p=>packets.push(p)};c.Training.sessionMode='online';c.OnlineDuelService.active=true;c.OnlineDuelService.roundToken=7;
 const e=entity();c.AttackModuleService.afterAttack(e,ch.attacks.counter,0,c.AttackExecutionService.create(e,ch.attacks.counter,0));clock=1350;c.MovementAbilityService.update(e,clock,350);
 assert.equal(packets.length,1);const p=packets[0];assert.equal(p.type,'duel-triggered-attack');assert.equal(p.sourceX,225);assert.equal(p.targetPoint.x,400);assert.equal(p.attack.modules.find(m=>m.type==='trajectory.arc').startHeight,140);assert.equal(p.roundToken,7);
 c.Training.sessionMode='training';c.OnlineDuelService.active=false;
});
test('스킬 설명 수치 참조는 실제 피해/화염 시간으로 완전히 치환',()=>{
 for(const skill of ch.tooltipSkills){const text=c.CharacterDescriptionService.interpolate(ch,skill);assert.ok(!text.includes('{'),text);assert.ok(text.includes('4초'),text)}
 assert.ok(c.CharacterDescriptionService.interpolate(ch,ch.tooltipSkills[0]).includes('(100)'));
 assert.ok(c.CharacterDescriptionService.interpolate(ch,ch.tooltipSkills[2]).includes('(200)'));
 assert.ok(c.CharacterDescriptionService.interpolate(ch,ch.tooltipSkills[3]).includes('(100)'));
});
test('공통 궤적: 최고점 화살의 높이가 착탄까지 감소·기존 점프 유지',()=>{
 const arc={type:'trajectory.arc',height:0,startHeight:70,screenLiftRatio:0.55};assert.equal(c.ArcTrajectoryService.sample(0,arc).offsetY,-38.5);assert.equal(c.ArcTrajectoryService.sample(0.5,arc).offsetY,-19.25);assert.ok(Math.abs(c.ArcTrajectoryService.sample(1,arc).offsetY)<1e-10);
 const old=c.CharacterDataService.compile('phase').attacks.rmb.modules[0];assert.equal(c.ArcTrajectoryService.sample(.5,old).lift,55);assert.equal(c.ArcTrajectoryService.sample(0,old).lift,0);
});
// 실제 field trigger 시간과 onHit 경로 확인 (생성/렌더는 앞 검사에서 실제 착탄 연결 확인).
load('src/core/InstalledAreaFieldService.js','InstalledAreaFieldService');
c.AttackHitTriggerService={damage:ctx=>({hit:true,authoritative:true,amount:ctx.attack.damageRatio*ctx.source.baseDamage})};
test('화살 비 틱: 진입 1회·500ms 간격·대상별 독립·피격 시 화염',()=>{
 const e=entity(),a=entity({id:'A',teamId:'B'}),b=entity({id:'B',teamId:'B'}),module=ch.attacks.counterArrow.modules.find(m=>m.type==='projectile.impact').field;
 const state={module,attack:ch.attacks.rainTick,execution:c.AttackExecutionService.create(e,ch.attacks.rainTick,0),lastTriggerAt:new Map()};const area={module:{shape:'circle'},center:{x:400,y:500}};
 assert.equal(c.InstalledAreaFieldService.fieldTrigger(e,state,a,area,1000).hit,false);assert.equal(burns.length,0);assert.equal(c.InstalledAreaFieldService.fieldTrigger(e,state,a,area,1499).hit,false);assert.equal(c.InstalledAreaFieldService.fieldTrigger(e,state,a,area,1500).hit,true);assert.equal(c.InstalledAreaFieldService.fieldTrigger(e,state,b,area,1500).hit,false);assert.equal(c.InstalledAreaFieldService.fieldTrigger(e,state,b,area,2000).hit,true);assert.equal(burns.length,2);assert.equal(neutralizeCalls.length,2);assert.equal(burns.at(-1).duration,4000);
});
test('단계 비용은 증강 배율·온라인 재생에 기존 자원 정책 적용',()=>{
 const original=c.AugmentService.attackCostMultiplier;c.AugmentService.attackCostMultiplier=()=>.5;
 const e=entity({stamina:175});assert.equal(c.ChargedAttackService.start({source:e,attack:ch.attacks.lmb,now:clock},{}),true);clock+=800;
 assert.equal(c.ChargedAttackService.release({source:e,attack:ch.attacks.lmb,now:clock},{}),true);assert.equal(e.stamina,0);assert.equal(shots.length,3);
 c.AugmentService.attackCostMultiplier=original;shots=[];const remote=entity({local:false,stamina:0});
 assert.equal(c.ChargedAttackService.start({source:remote,attack:ch.attacks.lmb,network:true,now:clock},{}),true);
 assert.equal(c.ChargedAttackService.release({source:remote,attack:ch.attacks.lmb,network:true,resolvedChargeProgress:2,now:clock},{}),true);assert.equal(shots.length,3);assert.equal(remote.stamina,0);
});
test('높은 점프의 최고점 체류와 이전 점프 궤적 보존',()=>{
 const arc=ch.attacks.counter.modules[0];for(const p of [.4,.45,.5,.55,.6])assert.equal(c.ArcTrajectoryService.sample(p,arc).lift,140);
 assert.ok(c.ArcTrajectoryService.sample(.3,arc).lift<140);assert.ok(c.ArcTrajectoryService.sample(.7,arc).lift<140);
 assert.equal(c.ArcTrajectoryService.sample(0,arc).lift,0);assert.ok(c.ArcTrajectoryService.sample(1,arc).lift<1e-10);
 assert.equal(ch.attacks.counter.modules[1].duration,700);
});
// 실제 미리보기/geometry로 홀드 업데이트와 해제 탄 수를 함께 검증.
c.TagService.hasAttack=()=>false;c.WorldGeometryService.raycastDistance=(x,y,a,r)=>r;
for(const [p,n]of [['src/world/HitScanGeometryService.js','HitScanGeometryService'],['src/world/AreaGeometryService.js','AreaGeometryService'],['src/projectiles/ProjectileWallCollisionModeService.js','ProjectileWallCollisionModeService'],['src/combat/AttackPreviewAreaService.js','AttackPreviewAreaService'],['src/combat/AttackPreviewService.js','AttackPreviewService']])load(p,n);
test('단발 미리보기 없음·단계별 고정 탄퍼짐/미리보기와 실제 산탄 일치',()=>{
 const e=entity();assert.equal(c.ChargedAttackService.start({source:e,attack:ch.attacks.lmb,angle:0,now:clock},{}),true);assert.equal(e.attackPreview??null,null);let reused=null;
 for(const [ms,count,spread]of [[0,1,0],[399,1,0],[400,2,.08],[600,2,.08],[799,2,.08],[800,3,.16]]){
  clock=1000+ms;c.ChargedAttackService.update(e,clock,()=>.6);const preview=e.attackPreview;
  const spec=c.ChargedAttackService.dynamicSpec(ch.attacks.lmb,ms/800*2);assert.ok(Math.abs(spec.modules.find(m=>m.type==='pattern.scatter').spread-spread)<1e-10);
  if(ms<400){assert.equal(preview??null,null);continue;}
  if(reused)assert.equal(preview,reused);reused=preview;assert.equal(preview.parts.length,count);assert.equal(preview.type,'projectile-path');
  const angles=c.AttackModuleService.buildAngles(spec,.6);
  preview.parts.forEach((part,i)=>{assert.equal(part.angle,angles[i]);assert.equal(part.range,1200);assert.equal(part.halfWidth,12)});
 }
 assert.equal(ch.attacks.rmb.cost,600);assert.equal(ch.attacks.rmb.range,1200);
});
test('토끼뜀 미리보기는 출발지의 실제 화살 비 원·벽 관통 공용 형상',()=>{
 const e=entity();const preview=c.AttackPreviewService.fromAttack(e,ch.attacks.counter,.8,1300);
 assert.equal(preview.type,'circle');assert.equal(preview.range,ch.attacks.rainTick.range);assert.equal(preview.wallPolicy,'ignore');assert.equal(preview.center.x,e.x);assert.equal(preview.center.y,e.y);
 assert.equal(preview.parts.length,1);assert.equal(preview.parts[0].type,'circle');assert.equal(preview.parts[0].range,150);assert.equal(preview.parts[0].center.x,400);
 c.WorldGeometryService.raycastDistance=(x,y,a,r)=>Math.min(60,r);const blocked=c.AttackPreviewService.fromAttack(e,ch.attacks.counter,.8,1300,preview);
 for(const p of blocked.points)assert.ok(Math.abs(Math.hypot(p.x-400,p.y-500)-150)<1e-8);c.WorldGeometryService.raycastDistance=(x,y,a,r)=>r;
});
test('일반 산탄은 탄별 타격 및 비용 설명 분리·체력 구분선 실제 값 참조',()=>{
 assert.equal(ch.attacks.lmb.modules.some(m=>m.type==='hit.once-per-execution'),false);assert.equal(ch.attacks.lmb.modules.some(m=>m.type==='projectile.presentation'),false);
 assert.equal(c.CharacterDescriptionService.interpolate(ch,{...ch.tooltipSkills[0],text:ch.tooltipSkills[0].costText}),'스테미나 150');
 assert.equal(c.CharacterDescriptionService.interpolate(ch,{...ch.tooltipSkills[1],text:ch.tooltipSkills[1].costText}),'스테미나 250/350');
 const ui=vm.createContext({document:{documentElement:{dataset:{}},getElementById:id=>id==='duels-setting-health-segment-step'?label:null},WorldHealthBarSegmentPresentationService:{step:300}}),label={textContent:''};
 vm.runInContext(fs.readFileSync(path.join(root,'src/core/DisplaySettings.js'),'utf8')+';globalThis.settings=DisplaySettings',ui);
 ui.settings.syncUi();assert.equal(label.textContent,'300');ui.WorldHealthBarSegmentPresentationService.step=375;ui.settings.syncUi();assert.equal(label.textContent,'375');
 const html=fs.readFileSync(path.join(root,'Duels.html'),'utf8');assert.ok(html.includes('id="duels-setting-health-segment-step"'));assert.ok(!html.includes('400 체력마다'));
});
load('src/combat/CCService.js','CCService');
test('모든 시로 화염은 실제 CC 틱으로500ms당25·초당50·4초200',()=>{
 const ticks=[];c.StatusDamageService={apply:ctx=>{ticks.push(ctx.amount);return{applied:true}}};c.STATUS_EFFECT_RULES={burn:{flatDamage:50}};
 const source=entity(),target=entity({id:'enemy',teamId:'B'});c.EntityService.items.set(source.id,source);
 for(const key of ['lmb','rmbExplosion','rainTick']){
  ticks.length=0;const data=ch.attacks[key].modules.find(m=>m.type==='status.apply'&&m.status==='burn').data;
  assert.equal(data.flat,15);assert.equal(data.interval,500);
  const status={sourceEntityId:source.id,sourceId:source.id,data:{...data},nextTick:1500,end:5000};
  c.CCService.tickDamage(target,status,'burn',2000);assert.equal(ticks.length,2);assert.equal(ticks.reduce((a,b)=>a+b,0),30);
  c.CCService.tickDamage(target,status,'burn',5000);assert.equal(ticks.length,8);assert.equal(ticks.reduce((a,b)=>a+b,0),120);
 }
});
test('모든1ms 진행점에서 단계 고정 스펙 직접 선택·연속 산탄 설정 없음',()=>{
 assert.equal(ch.attacks.lmb.charge.spread,undefined);assert.equal(ch.attacks.lmb.charge.pelletCount,undefined);
 for(let ms=0;ms<=1200;ms++){
  const spec=c.ChargedAttackService.dynamicSpec(ch.attacks.lmb,ms/400);
  const scatter=spec.modules.find(m=>m.type==='pattern.scatter');
  assert.equal(scatter.count,ms<400?1:ms<800?2:3);assert.equal(scatter.spread,ms<400?0:ms<800?.08:.16);
 }
});
test('반격 점프 시작과 최고점 화살 실제 발사에 각각 무기 모션·원격 시간축 복원',()=>{const e=entity();c.AttackModuleService.afterAttack(e,ch.attacks.counter,0,c.AttackExecutionService.create(e,ch.attacks.counter,0));const first=c.ModeStateService.state(e,'siro-weapon-motion');assert.equal(first.changedAt,1000);assert.equal(first.turns,1);clock=1350;c.MovementAbilityService.update(e,clock,350);assert.equal(shots.length,1);const second=c.ModeStateService.state(e,'siro-weapon-motion');assert.equal(second.changedAt,1350);assert.equal(second.turns,2);clock=1400;c.MovementAbilityService.update(e,clock,50);assert.equal(shots.length,1);assert.equal(c.ModeStateService.state(e,'siro-weapon-motion').turns,2);const remote=entity({local:false});c.ModeStateService.applyRemote(remote,c.ModeStateService.serialize(e,clock),clock);assert.equal(c.ModeStateService.state(remote,'siro-weapon-motion').changedAt,1350)});
console.log(`PASS ${passed} Siro regression groups`);

test('시로 백드래프트 발사와 동시 후방240 낮은점프180ms·사거리1200',()=>{const e=entity(),a=ch.attacks.rmb;shots=[];assert.equal(c.TriggeredAttackService.execute(e,a,0),true);assert.equal(shots.length,1);assert.equal(shots[0].x,400);const state=e.actionState.get('movement:siro-backdraft');assert.ok(state);assert.equal(state.distance,240);assert.equal(state.duration,300);assert.equal(state.trajectory.height,60);clock+=150;c.MovementAbilityService.update(e,clock,1);assert.ok(e.x<400);clock+=150;c.MovementAbilityService.update(e,clock,1);assert.ok(Math.abs(e.x-160)<1e-8);assert.equal(e.actionState.has('movement:siro-backdraft'),false);assert.equal(ch.attacks.lmb.range,1200);assert.equal(a.range,1200);});

test('화살비 생성 피해는 적전용100/화염·무력화넉백·최초틱 없음',()=>{const e=entity({local:false}),p=carrier(e);c.Training.sessionMode='online';areas=[];assert.equal(c.TargetPointProjectileService.arrived(p),true);assert.equal(areas.length,1);const {a,m}=areas[0];assert.equal(a.id,ch.attacks.rainArrival.id);assert.equal(a.damageRatio*ch.baseDamage,100);assert.equal(m.targetKinds,undefined);assert.equal(m.wallPolicy,'ignore');assert.ok(a.modules.some(m=>m.type==='status.apply'&&m.status==='burn'));assert.ok(a.modules.some(m=>m.type==='movement.neutralize-knockback'));assert.equal(ch.attacks.counterArrow.modules[2].field.triggerOnEnter,false);const jump=ch.attacks.rmb.modules.find(m=>m.type==='movement.move');assert.equal(jump.collision.passWalls,true);assert.equal(jump.buffs[0].type,'evasionInvulnerable');c.Training.sessionMode='training';});

test('화살비 생성과 지속틱 동일 넉백·범위 대상 더미/봇/소환수 제외없음',()=>{const arrival=ch.attacks.rainArrival,tick=ch.attacks.rainTick;const a=arrival.modules.find(m=>m.type==='delivery.area');assert.equal(a.targetKinds,undefined);assert.deepEqual(Array.from(a.targetRelations),['enemy']);const kb=tick.modules.find(m=>m.type==='movement.neutralize-knockback');assert.equal(kb.type,arrival.modules.find(m=>m.type==='movement.neutralize-knockback').type);assert.equal(kb.distance,84);assert.equal(kb.oncePerExecution,false);assert.equal(tick.damageRatio,arrival.damageRatio);assert.equal(ch.attacks.counterArrow.modules[2].field.triggerOnEnter,false);});
