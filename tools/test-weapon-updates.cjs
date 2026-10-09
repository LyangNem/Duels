/* 헤브 공통 발사/출혈/조건 회복/피격 확정 패킷 회귀. 브라우저/WebRTC 대체 아님. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');let clock=1000,passed=0,shots=[],areas=[],fields=[],burns=[];
const c=vm.createContext({console,Map,Set,WeakMap,WeakSet,Math,performance:{now:()=>clock},EMPTY_RUNTIME_ITEMS:[],EMPTY_AUGMENT_EFFECTS:[]});
function load(p,n){vm.runInContext(fs.readFileSync(path.join(root,p),'utf8')+`;globalThis.${n}=${n};`,c)}
function test(n,fn){shots=[];areas=[];fields=[];burns=[];clock=1000;fn();passed++;console.log('PASS '+n)}
for(const n of ['characterValue','characterCount','characterSum','characterProduct','freezeCharacterData','CHARACTER_RULES'])load('src/data/'+n+'.js',n);
c.CHARACTER_DATA={};for(const item of JSON.parse(fs.readFileSync(path.join(root,'src/data/characters/index.json'))).characters){const raw=vm.runInContext('('+fs.readFileSync(path.join(root,item.path),'utf8')+')',c);c.CHARACTER_DATA[raw.id]=raw}
load('src/data/CharacterDataService.js','CharacterDataService');const ch=c.CharacterDataService.compile('hab');
c.GAME_DATA={frameMs:1000/60};c.Training={sessionMode:'training'};c.OnlineDuelService={active:false};
c.AbilityService={attackById:(character,id)=>Object.values(character.attacks).find(a=>a.id===id),damageRatio:(character,a)=>a?.damageRatio||0};
c.EntitySimulationAuthorityService={isLocal:e=>e.local!==false};c.EntityService={items:new Map(),owner:e=>e};
c.RelationService={relation:(s,t)=>s===t?'self':s.teamId===t.teamId?'ally':'enemy',canTarget:(s,t)=>s.teamId!==t.teamId};
c.AugmentService={update(){},captureResourceConditionSnapshot:()=>null,prepareAttack:(s,a)=>a,attackCostMultiplier:()=>1};c.ProgressScaledAttackService={resolve:(s,a)=>a};
c.TagService={derivedModuleTags:()=>[],attackTags:a=>new Set(a.tags||[])};c.AttackPreviewService={fromAttack:(s,a,angle,until)=>({attack:a,angle,until})};
c.StaminaService={nominalBudget:e=>e.stamina,spend:(e,n)=>{if(e.stamina<n)return false;e.stamina-=n;return true}};
c.AttackResourceConditionService={capture:()=>null};c.COMBAT_BUFF_DEFS={evasionInvulnerable:{}};c.COMBAT_STATUS_DEFS={burn:{},bleed:{},evasionInvulnerable:{}};
c.BuffService={set:()=>true,remove:()=>true};c.CCService={removeSource(){},isDotImpact:()=>false};
c.EffectSpawnService={removeKey(){},ease:v=>v,definitionSnapshot:x=>JSON.parse(JSON.stringify(x))};
c.MovementService={travelDistance:(x,y,a,d)=>d,resolveEmbedded(){},finalizeForcedMotion(){},knockback:()=>true};
c.OnlinePresentationSyncService={send(){}};c.WorldGeometryService={wallAtPoint:()=>null,nearestWallTarget:()=>null};
c.ProjectileStateService={get:()=>null};c.ProjectileService={spawn:data=>{shots.push(data);c.AttackModuleService.onDelivery(data.source,data.attack,data.angle,data.volley?.execution);return data}};
c.AreaAttackService={execute:(s,a,angle,m,v,options)=>{areas.push({s,a,angle,m,v,options});c.AttackModuleService.onDelivery(s,a,angle,v?.execution);return true}};
c.InstalledAreaFieldService={KIND:'installed-area-field',containmentTravelDistance:(e,a,d)=>d,baseKey:m=>m.stateKey,activatePoint:(s,m,p,o)=>{const v={s,m,p,o};fields.push(v);return v}};
for(const [p,n]of [['src/core/GameEvents.js','GameEvents'],['src/core/TriggerConditionService.js','TriggerConditionService'],['src/core/TriggerModuleService.js','TriggerModuleService'],['src/core/ArcTrajectoryService.js','ArcTrajectoryService'],['src/core/CollisionPolicyService.js','CollisionPolicyService'],['src/combat/AttackExecutionService.js','AttackExecutionService'],['src/combat/AttackModuleService.js','AttackModuleService'],['src/projectiles/ProjectileModuleService.js','ProjectileModuleService'],['src/projectiles/ProjectileImpactService.js','ProjectileImpactService'],['src/projectiles/TargetPointProjectileService.js','TargetPointProjectileService'],['src/combat/TriggeredAttackService.js','TriggeredAttackService'],['src/combat/CounterModuleService.js','CounterModuleService'],['src/abilities/MovementAbilityService.js','MovementAbilityService'],['src/abilities/ChargedAttackService.js','ChargedAttackService'],['src/ui/CharacterDescriptionService.js','CharacterDescriptionService']])load(p,n);
load('src/core/ModeStateService.js','ModeStateService');
c.CombatStatusApplicationService={apply:ctx=>{burns.push(ctx);return true}};
function entity(extra={}){return{id:'hab',teamId:'A',kind:'player',character:ch,baseDamage:ch.baseDamage,alive:true,local:true,x:400,y:500,radius:20,stamina:1000,maxStamina:1000,actionState:new Map(),cooldowns:new Map(),statuses:new Map(),buffs:new Map(),...extra}}
const originalMovement=c.MovementAbilityService;
c.MovementAbilityService={...originalMovement,applyBuffs(){},clearBuffs(){},spawnEffects:()=>[],broadcastEffects(){}};
c.AttackService={canUse:(e,a)=>e.stamina>=a.cost,execute:(s,a,angle)=>c.TriggeredAttackService.execute(s,a,angle)};

let effects=[];c.EffectSpawnService.shouldPresentAttack=()=>true;c.EffectSpawnService.spawn=(spec,context)=>{effects.push({spec,context});return spec};c.EffectSpawnService.presentationSnapshot=x=>x;load('src/core/ColorService.js','ColorService');
c.NeutralizingKnockbackService={start:args=>{moves.push(args);return true}};
let moves=[];c.MovementService.knockback=(...args)=>{moves.push(args);return true};
c.CCService={...c.CCService,has:(e,status,now=clock)=> (e.statuses.get(status)||[]).some(v=>v.end>now),isDotImpact:i=>i?.dot===true||i?.type==='status'};
c.CombatStatusApplicationService={apply:ctx=>{burns.push(ctx);ctx.target.statuses.set(ctx.type,[{end:clock+ctx.duration}]);return true}};
c.AugmentEffectModuleService={runTrigger(){}};c.AugmentService.onConfirmedDamageDealt=()=>{};
for(const [p,n]of [['src/core/ResourceValueService.js','ResourceValueService'],['src/core/ModuleValueService.js','ModuleValueService'],['src/combat/StaminaService.js','StaminaService'],['src/render/ResourceRestoreEffectService.js','ResourceRestoreEffectService'],['src/render/CharacterTriggerEffectService.js','CharacterTriggerEffectService'],['src/network/NetworkHitAuthorityService.js','NetworkHitAuthorityService']])load(p,n);
function hit(s,t,a=ch.attacks.lmb,extra={}){return c.CharacterTriggerEffectService.run(s,'damage-dealt',{source:s,target:t,attack:a,execution:c.AttackExecutionService.create(s,a,0),impact:{type:'projectile'},amount:200,now:clock,...extra})}
function bleeding(t){t.statuses.set('bleed',[{end:clock+1000}]);return t}

for(const [p,n]of [['src/abilities/AbilityService.js','AbilityService'],['src/abilities/AbilityModuleService.js','AbilityModuleService'],['src/core/ProgressStateService.js','ProgressStateService'],['src/core/RuntimeValueReferenceProviders.js','RuntimeValueReferenceProviders'],['src/core/RuntimeValueReferenceService.js','RuntimeValueReferenceService'],['src/data/WEAPON_IMAGE_DEFS.js','WEAPON_IMAGE_DEFS'],['src/render/ModeGearPresentationService.js','ModeGearPresentationService']])load(p,n);
load('src/core/InstalledAreaFieldService.js','InstalledAreaFieldService');
const intu=c.CharacterDataService.compile('intu'),siro=c.CharacterDataService.compile('siro'),reika=c.CharacterDataService.compile('reika'),phase=c.CharacterDataService.compile('phase');
function gun(extra={}){const e=entity({character:intu,baseDamage:intu.baseDamage,...extra});c.ProgressStateService.apply(e,{stateKey:'intu-ammo',operation:'set',value:7,max:12,initial:12});return e}
function fire(e,a){c.TriggeredAttackService.execute(e,a,0)}
function selected(e,slot){return c.AbilityService.resolvedInputAttack(e,e.character.abilities[slot])}
test('인투 첫 반격 탄 포함4발·이전 권총 복귀·일반 탄창 공유',()=>{const e=gun();fire(e,intu.attacks.sniperCounter);assert.equal(c.ProgressStateService.state(e,'intu-sniper').value,3);for(const n of [2,1,0]){assert.equal(selected(e,'lmb').id,intu.attacks.sniper.id);fire(e,selected(e,'lmb'));assert.equal(c.ProgressStateService.state(e,'intu-sniper').value,n);assert.equal(c.ProgressStateService.state(e,'intu-ammo').value,3+n)}assert.equal(shots.length,4);assert.equal(selected(e,'lmb').id,intu.attacks.pistol.id)});
test('인투 산탄총 모드 복귀·시간 경과로 저격 탄창 사라지지 않음',()=>{const e=gun();c.ModeStateService.set(e,'intu-weapon','shotgun','pistol');fire(e,intu.attacks.sniperCounter);clock+=60000;assert.equal(selected(e,'lmb').id,intu.attacks.sniper.id);for(let n=0;n<3;n++)fire(e,selected(e,'lmb'));assert.equal(selected(e,'lmb').id,intu.attacks.shotgun.id)});
test('인투 우클릭 강제 복귀·실행 실패 시 탄창 유지',()=>{for(const mode of ['pistol','shotgun']){const e=gun();c.ModeStateService.set(e,'intu-weapon',mode,'pistol');fire(e,intu.attacks.sniperCounter);const a=selected(e,'rmb');assert.equal(a.id,mode==='pistol'?intu.attacks.pistolReturn.id:intu.attacks.shotgunReturn.id);const clear=intu.abilities.rmb.trigger.modules.find(m=>m.stateKey==='intu-sniper');c.AbilityModuleService.handlers['state.progress']({source:e,executed:false},()=>{},clear);assert.equal(c.ProgressStateService.state(e,'intu-sniper').value,3);fire(e,a);c.AbilityModuleService.handlers['state.progress']({source:e,executed:true},()=>{},clear);assert.equal(c.ProgressStateService.state(e,'intu-sniper').value,0);assert.equal(selected(e,'lmb').id,mode==='pistol'?intu.attacks.pistol.id:intu.attacks.shotgun.id)}});
test('인투 기존12칸 탄창의 색 변환·반격 누적·소모·강제복귀',()=>{const e=gun(),g=intu.worldGaugeModules[1];assert.equal(intu.worldGaugeModules.length,2);assert.equal(g.segments.length,12);assert.equal(g.valueRef.stateKey,'intu-ammo');assert.equal(g.conditions,undefined);fire(e,intu.attacks.sniperCounter);assert.equal(c.ProgressStateService.state(e,'intu-sniper').value,3);fire(e,intu.attacks.sniperCounter);assert.equal(c.ProgressStateService.state(e,'intu-sniper').value,6);assert.equal(c.ProgressStateService.state(e,'intu-ammo').value,5);assert.equal(g.highlightColor,'#9bdcff');assert.equal(g.highlightCountRef.stateKey,'intu-sniper');assert.equal(g.colorVariants.some(v=>v.color==='#9bdcff'),false);assert.ok(c.CharacterDescriptionService.interpolate(intu,intu.tooltipSkills.at(-1)).includes('4발 추가'))});
test('헤브 출혈 타격마다 공통 이펙트·비출혈/DOT 제외·대상 위치',()=>{effects=[];const e=entity({stamina:0}),t=bleeding(entity({id:'enemy',teamId:'B',x:700,y:300}));for(let n=0;n<3;n++)hit(e,t);assert.equal(effects.length,6);assert.equal(effects.filter(f=>f.spec.type==='weaponImageEcho').length,3);for(const fx of effects.filter(f=>f.spec.type==='hitImpactRing')){assert.equal(fx.spec.x,700);assert.equal(fx.spec.y,300)}effects=[];t.statuses.clear();hit(e,t);assert.equal(effects.length,0);bleeding(t);hit(e,t,ch.attacks.lmb,{impact:{dot:true}});assert.equal(effects.length,0);for(const kind of ['summon','trainingBot']){t.kind=kind;hit(e,t);assert.equal(effects.length,0)}});
test('헤브 반격 무력화 넉백·출혈 제거·무기 모션 및3종 재타격 구성',()=>{const e=entity(),t=entity({id:'enemy',teamId:'B'}),a=ch.attacks.counter;burns=[];moves=[];c.AttackModuleService.onHit(e,t,a,{execution:c.AttackExecutionService.create(e,a,0)},0,{type:'projectile'});assert.equal(burns.length,0);assert.equal(moves.length,1);assert.equal(moves[0].distance,84);assert.equal(a.modules[0].expireAtRange,false);assert.equal(a.modules[0].rehitInterval,undefined);assert.equal(c.CounterModuleService.referencedCc(e,ch.abilities.counter.trigger.modules[0]).type,'movement.neutralize-knockback')});
test('페이즈 낮은 체력 설명은 ALWAYS 한 곳·전투 모듈 유지',()=>{assert.equal(phase.tooltipSkills[0].key,'ALWAYS');assert.equal(phase.tooltipSkills.filter(x=>x.text.includes('체력이 낮을수록')).length,1);assert.ok(!phase.tooltipSkills.find(x=>x.key==='LMB').text.includes('체력'));assert.equal(phase.passiveBuffs.length,2)});
test('레이카 동일 검 형상·가호 색/글로우·회전 동일',()=>{const e=entity({character:reika}),configs=reika.worldEffectModules;function active(){return configs.filter(x=>c.TriggerModuleService.matches({type:'trigger',event:'presentation.draw',conditions:x.conditions},'presentation.draw',{source:e,now:clock}))}assert.equal(active().length,1);assert.equal(active()[0].color,'#ff7a00');c.ModeStateService.set(e,'reika-mode','blessed','normal');assert.equal(active().length,1);assert.equal(active()[0].color,'#38bdf8');assert.equal(active()[0].empowered,undefined);assert.equal(active()[0].glow,5);assert.equal(active()[0].rotationStateKey,'reika-sword-rotation')});
test('시로 활 차징 시위0→최대·해제·발사 모션 / 헤브 작살 모션',()=>{const e=entity({character:siro}),config=siro.worldEffectModules[0];assert.equal(c.ModeGearPresentationService.weaponPose(e,config,clock).pull,0);e.actionState.set('charge:primary',{kind:c.ChargedAttackService.KIND,attackId:siro.attacks.lmb.id,startedAt:clock,angle:0});clock+=400;assert.equal(c.ModeGearPresentationService.weaponPose(e,config,clock).pull,.5);clock+=400;assert.equal(c.ModeGearPresentationService.weaponPose(e,config,clock).pull,1);e.actionState.delete('charge:primary');fire(e,siro.attacks.lmb);clock+=177;assert.ok(c.ModeGearPresentationService.weaponPose(e,config,clock).pulse>.9);assert.equal(c.ModeGearPresentationService.weaponPose(e,config,clock).pull,0);const h=entity(),cfg=ch.worldEffectModules[0];fire(h,ch.attacks.lmb);clock+=202;assert.ok(c.ModeGearPresentationService.weaponPose(h,cfg,clock).pulse>.9)});
function canvasStub(){const styles=[],ops=[];const target={styles,ops,save(){},restore(){},beginPath(){},closePath(){},moveTo(...x){ops.push(['move',...x])},lineTo(...x){ops.push(['line',...x])},bezierCurveTo(...x){ops.push(['curve',...x])},arc(...x){ops.push(['arc',...x])},scale(...v){ops.push(['scale',...v])},stroke(){styles.push(this.strokeStyle)},fill(){styles.push(this.fillStyle)},rotate(){},translate(){}};return target}
test('실제 활/작살/가호 검 렌더 경로 정상·시위 차징 형상 변화',()=>{for(const character of [siro,ch,reika]){const e=entity({character}),ctx=canvasStub();assert.equal(c.ModeGearPresentationService.drawBehind(ctx,e,1,clock),true);assert.ok(ctx.ops.length>5)}const e=entity({character:siro}),a=canvasStub(),b=canvasStub(),cfg=siro.worldEffectModules[0];c.ModeGearPresentationService.drawImage(a,e,cfg,1,clock);e.actionState.set('charge:primary',{kind:c.ChargedAttackService.KIND,attackId:siro.attacks.lmb.id,startedAt:clock-800,angle:0});c.ModeGearPresentationService.drawImage(b,e,cfg,1,clock);assert.notDeepEqual(b.ops,a.ops);const r=entity({character:reika}),ctx=canvasStub();c.ModeStateService.set(r,'reika-mode','blessed','normal');c.ModeGearPresentationService.drawBehind(ctx,r,1,clock);assert.ok(ctx.styles.includes(c.ColorService.brighten('#38bdf8',.65)))});


load('src/core/TimedActionStateService.js','TimedActionStateService');
let continuations=[];c.SimulationScheduleService={scheduleContinuation:x=>continuations.push(x)};
test('인투12칸 고갈 재장전·변환 잔량 보존·재장전 종료 색 유지',()=>{const e=gun();c.ProgressStateService.apply(e,{stateKey:'intu-ammo',operation:'set',value:12,max:12});for(let n=0;n<5;n++)fire(e,intu.attacks.sniperCounter);assert.equal(c.ProgressStateService.state(e,'intu-sniper').value,15);for(let n=0;n<7;n++)fire(e,intu.attacks.sniper);assert.equal(c.ProgressStateService.state(e,'intu-ammo').value,0);assert.equal(c.ProgressStateService.state(e,'intu-sniper').value,8);assert.ok(c.TimedActionStateService.state(e,'intu-reload'));assert.ok(continuations.some(x=>x.abilityId==='state-window:intu-reload'));clock+=1500;for(const q of continuations.filter(x=>x.abilityId==='state-window:intu-reload'))q.continue();continuations=[];assert.equal(c.ProgressStateService.state(e,'intu-ammo').value,12);assert.equal(c.ProgressStateService.state(e,'intu-sniper').value,8);assert.equal(selected(e,'lmb').id,intu.attacks.sniper.id)});
test('누적 탄환의 유한 JSON snapshot·원격 복원·일반 progress 상한 유지',()=>{const e=gun();for(let n=0;n<50;n++)c.ProgressStateService.apply(e,{stateKey:'intu-sniper',operation:'add',amount:4,growMax:true});const snapshots=JSON.parse(JSON.stringify(c.ProgressStateService.serialize(e))),remote=gun({local:false});c.ProgressStateService.applyRemote(remote,snapshots);assert.equal(c.ProgressStateService.state(remote,'intu-sniper').value,200);assert.equal(c.ProgressStateService.state(remote,'intu-sniper').max,200);c.ProgressStateService.apply(e,{stateKey:'intu-ammo',operation:'add',amount:100,max:12});assert.equal(c.ProgressStateService.state(e,'intu-ammo').value,12)});
test('공용 투명도: 모든 인투 총 재장전 동안만 .28배·상대 복원',()=>{const e=gun(),cfgs=intu.worldEffectModules;for(const cfg of cfgs)assert.equal(c.ModeGearPresentationService.imageAlpha(e,cfg,clock),.60);c.TimedActionStateService.open(e,{stateKey:'intu-reload',duration:1500,retainCompleteMs:500},clock);for(const cfg of cfgs)assert.equal(c.ModeGearPresentationService.imageAlpha(e,cfg,clock),.60*.28);const remote=gun({local:false});c.TimedActionStateService.applyRemote(remote,c.TimedActionStateService.serialize(e,clock),clock);assert.equal(c.ModeGearPresentationService.imageAlpha(remote,cfgs[0],clock),.60*.28);clock+=1500;for(const cfg of cfgs)assert.equal(c.ModeGearPresentationService.imageAlpha(e,cfg,clock),.60)});
test('모든 기존 무기 공용 렌더·원본 계열 팔레트·살/윤곽 유한·시로 차징 화살 없음',()=>{for(const name of ['reika','nyu','siro','hab','intu','van','geopin','sya','tau','roon']){const character=c.CharacterDataService.compile(name);for(const cfg of character.worldEffectModules){assert.equal(cfg.renderType,'weaponImage');assert.ok(c.WEAPON_IMAGE_DEFS[cfg.style]);const ctx=canvasStub(),fills=[];ctx.fill=()=>fills.push(ctx.fillStyle);assert.equal(c.ModeGearPresentationService.drawImage(ctx,entity({character}),cfg,1,clock),true);assert.ok(new Set(fills).size>=1);assert.ok(ctx.ops.flat().filter(x=>typeof x==='number').every(Number.isFinite))}}assert.equal(reika.worldEffectModules[0].scale,1.85);assert.equal(c.WEAPON_IMAGE_DEFS.bow.paths.length,5);assert.ok(c.WEAPON_IMAGE_DEFS.bow.string)});
load('src/combat/AttackService.js','AttackService');c.CombatStatsService={current:e=>({staminaCostMult:e.costMult||1,canAct:true})};c.AugmentService.staminaHealthFallbackRatio=e=>e.healthFallback||0;
test('레이카 부족 스테미나 미리보기/후속 잠금 차단·정확 비용·할인/체력 대체 반영',()=>{const cfg=reika.abilities.rmb.trigger.modules[0],attack=reika.attacks.gahoWeapon;function preview(e){let continued=false;const context={source:e,ability:reika.abilities.rmb,attack,angle:0,executed:false};c.AbilityModuleService.handlers['preview.create'](context,()=>{continued=true},cfg);return continued}const e=entity({character:reika,stamina:attack.cost-.01});assert.equal(preview(e),false);assert.equal(e.attackPreview,undefined);e.stamina=attack.cost;assert.equal(preview(e),true);assert.equal(e.attackPreview.attack.id,attack.id);e.attackPreview=null;e.stamina=attack.cost*.6;e.costMult=.6;assert.equal(preview(e),true);e.costMult=1;e.stamina=0;e.healthFallback=.5;e.health=1000;assert.equal(preview(e),true);e.health=1;assert.equal(preview(e),false);e.health=1000;e.cooldowns.set(attack.id,clock+1);assert.equal(preview(e),false)});
load('src/render/SegmentedGaugePresentationService.js','SegmentedGaugePresentationService');
test('인투 실제 탄창 렌더: 변환 잔량만 파랑·소모/누적/0발/탄창 초과',()=>{const e=gun(),g=intu.worldGaugeModules[1];function colors(){const fills=[];const ctx={save(){},restore(){},fillRect(){fills.push(this.fillStyle)},strokeRect(){}};c.SegmentedGaugePresentationService.draw(ctx,{...g,x:0,y:0,value:c.RuntimeValueReferenceService.resolve(e,g.valueRef),highlightCount:c.RuntimeValueReferenceService.resolve(e,g.highlightCountRef)});return fills.filter(v=>v!==g.background)}for(const [count,blue]of [[0,0],[1,1],[3,3],[7,7],[20,7]]){c.ProgressStateService.apply(e,{stateKey:'intu-sniper',operation:'set',value:count,max:20});const v=colors();assert.equal(v.length,7);assert.equal(v.filter(x=>x==='#9bdcff').length,blue);assert.equal(v.filter(x=>x==='#a18a8a').length,7-blue);assert.deepEqual(v,Array(7-blue).fill('#a18a8a').concat(Array(blue).fill('#9bdcff')))}c.ProgressStateService.apply(e,{stateKey:'intu-sniper',operation:'set',value:3,max:20});c.ProgressStateService.apply(e,{stateKey:'intu-ammo',operation:'subtract',amount:1,max:12});c.ProgressStateService.apply(e,{stateKey:'intu-sniper',operation:'subtract',amount:1});assert.equal(colors().filter(x=>x==='#9bdcff').length,2);assert.equal(colors().length,6)});
test('칸수 게이지 공용 색 변형·강조 색 우선·미변환 칸 기존 색 유지',()=>{const fills=[],ctx={save(){},restore(){},fillRect(){fills.push(this.fillStyle)},strokeRect(){}};c.SegmentedGaugePresentationService.draw(ctx,{x:0,y:0,value:3,valueMode:'count',segments:[{color:'red'},{color:'red'},{color:'red'}],colorOverride:'yellow',highlightCount:1,highlightColor:'blue',background:'bg'});assert.deepEqual(fills.filter(x=>x!=='bg'),['blue','yellow','yellow'])});
load('src/core/WorldGaugeModuleService.js','WorldGaugeModuleService');c.StackMarkService={statesForTarget:()=>[]};c.TimedThresholdBuffService={gaugeGroups:()=>new Map()};c.WorldGaugeBarPresentationService={gap:2};
test('실제 월드 게이지 연결: 변환3발만 강조·원본 segment 배열 보존',()=>{const e=gun(),g=intu.worldGaugeModules[1];e.character={...intu,worldGaugeModules:[g]};c.ProgressStateService.apply(e,{stateKey:'intu-sniper',operation:'set',value:3,max:10});const fills=[],ctx={save(){},restore(){},fillRect(){fills.push(this.fillStyle)},strokeRect(){}};assert.equal(c.WorldGaugeModuleService.draw(ctx,e,0,0,60),6);assert.equal(fills.filter(x=>x==='#9bdcff').length,3);assert.equal(fills.filter(x=>x==='#a18a8a').length,4);assert.ok(g.segments.every(x=>x.color==='#a18a8a'))});
load('src/core/SimulationScheduleService.js','SimulationScheduleService');
c.AreaGeometryService={polygon:()=>null,center:source=>({x:source.x,y:source.y})};
c.AttackWindupService={isTaggedAttack:()=>true,nextDeliveryKey:()=> 'delivery-test',sendCommit(){}};
test('큰 대검 윤곽/내부선 상한·밝은 계열 윤곽·채운 손잡이',()=>{for(const name of ['reika','nyu','hab','intu','van']){const character=c.CharacterDataService.compile(name),e=entity({character}),cfg=character.worldEffectModules[0],ctx=canvasStub(),widths=[];ctx.stroke=()=>{widths.push(ctx.lineWidth);ctx.styles.push(ctx.strokeStyle)};c.ModeGearPresentationService.drawImage(ctx,e,cfg,1,clock);assert.ok(widths.every(x=>x<=1.8),name);assert.ok(ctx.styles.includes(c.ColorService.brighten(cfg.color||character.color,.65)),name)}for(const style of ['sun','sun-blessed','dark'])assert.ok(c.WEAPON_IMAGE_DEFS[style].paths.some(p=>p.points&&p.fill&&p.points[0][1]===.83))});
test('레이카 가호 전후 실제 렌더 좌표 동일·단순 태양/글로우 유지',()=>{
 const e=entity({character:reika}),normal=canvasStub(),blessed=canvasStub();
 c.ModeGearPresentationService.drawImage(normal,e,reika.worldEffectModules[0],1,clock);
 c.ModeGearPresentationService.drawImage(blessed,e,reika.worldEffectModules[1],1,clock);
 assert.deepEqual(normal.ops,blessed.ops);assert.equal(reika.worldEffectModules[1].glow,5);
 assert.equal(c.WEAPON_IMAGE_DEFS.sun.paths[4].commands.filter(x=>x[0]==='M').length,4);
 assert.equal(c.WEAPON_IMAGE_DEFS['sun-blessed'].paths.length,c.WEAPON_IMAGE_DEFS.sun.paths.length);
});
test('헤브 평타/스킬 실제 발사 스타일은 공용 무기 원/+·범위/피해/관통 유지',()=>{
 for(const [key,radius,ratio,speed] of [['lmb',15,.5,30],['rmb',20,1,37.5]]){
  const e=entity(),a=ch.attacks[key];c.AttackModuleService.deliver(e,a,0,{execution:c.AttackExecutionService.create(e,a,0),total:1,resolved:0,hits:0});
  const shot=shots.at(-1);assert.equal(shot.behavior.presentation.kind,'weapon-projectile');assert.equal(shot.behavior.presentation.type,'anchor-cross');
  assert.equal(shot.behavior.presentation.radius,radius);assert.equal(shot.behavior.presentation.showLink,false);
  assert.equal(a.damageRatio,ratio);assert.equal(a.range,550);assert.equal(a.modules[0].speed,speed);
  assert.equal(shot.behavior.pierce.targets,key==='rmb');assert.equal(shot.behavior.pierce.walls,key==='rmb');
 }
});
test('인투 권총 실제 사격 반동/복원·시로 모션 재사용·원격 시간 일치·다른 총 회전 유지',()=>{
 const e=gun(),cfg=intu.worldEffectModules.find(x=>x.style==='pistol');
 const transforms=now=>{const ctx=canvasStub(),ops=[];ctx.rotate=x=>ops.push(['rotate',x]);ctx.translate=(...x)=>ops.push(['translate',...x]);c.ModeGearPresentationService.drawImage(ctx,e,cfg,1,now);return ops};
 const idle=transforms(clock);fire(e,intu.attacks.pistol);clock+=177;
 assert.ok(c.ModeGearPresentationService.weaponPose(e,cfg,clock).pulse>.9);assert.notDeepEqual(transforms(clock),idle);
 const remote=gun({local:false});c.ModeStateService.applyRemote(remote,JSON.parse(JSON.stringify(c.ModeStateService.serialize(e,clock))),clock);
 assert.equal(c.ModeGearPresentationService.weaponPose(remote,cfg,clock).pulse,c.ModeGearPresentationService.weaponPose(e,cfg,clock).pulse);
 clock=1420;assert.deepEqual(transforms(clock),idle);assert.equal(cfg.rotationStateKey,undefined);
 assert.equal(cfg.motion.rotation,siro.worldEffectModules[0].motion.rotation);
 for(const w of intu.worldEffectModules.filter(x=>x.style!=='pistol'))assert.equal(w.rotationRadians,-Math.PI*2);
});
test('스야/타우 실제 공격 시1회 무기 회전·원격 복원·공용 형상·숨김/사망 미표시',()=>{
 for(const [id,keys] of [['sya',['lmb','counter']],['tau',['lmb','lmbCharged','rmb','counter']]]){
  const character=c.CharacterDataService.compile(id),cfg=character.worldEffectModules[0];
  for(const key of keys){const e=entity({character}),a=character.attacks[key],ex=c.AttackExecutionService.create(e,a,0);
   assert.equal(c.ModeStateService.state(e,cfg.rotationStateKey),null);
   c.AttackModuleService.onDelivery(e,a,0,ex);c.AttackModuleService.onDelivery(e,a,0,ex);
   assert.equal(c.ModeStateService.state(e,cfg.rotationStateKey).turns,1);
   const remote=entity({character,local:false});c.ModeStateService.applyRemote(remote,JSON.parse(JSON.stringify(c.ModeStateService.serialize(e,clock))),clock);
   assert.equal(c.ModeGearPresentationService.rotation(e,cfg,350,clock+175),c.ModeGearPresentationService.rotation(remote,cfg,350,clock+175));
  }
  const e=entity({character}),ctx=canvasStub();assert.equal(c.ModeGearPresentationService.drawBehind(ctx,e,1,clock),true);
  e.hidden=true;assert.equal(c.ModeGearPresentationService.drawBehind(ctx,e,1,clock),false);e.hidden=false;e.alive=false;assert.equal(c.ModeGearPresentationService.drawBehind(ctx,e,1,clock),false);
 }
});
test('스야 서리 결정 날/그립감김 없음·실제 시계방향 회전',()=>{
 const character=c.CharacterDataService.compile('sya'),cfg=character.worldEffectModules[0],e=entity({character});
 const blade=c.WEAPON_IMAGE_DEFS['frost-scythe'].paths[1];assert.ok(blade.commands.some(x=>x[0]==='L'&&x[1]===2.75));assert.ok(blade.commands.some(x=>x[0]==='L'&&x[2]<-2.5));
 assert.equal(c.WEAPON_IMAGE_DEFS['frost-scythe'].paths.length,7);assert.equal(cfg.angle,.25);
 const a=character.attacks.lmb,ex=c.AttackExecutionService.create(e,a,0);c.AttackModuleService.onDelivery(e,a,0,ex);
 const start=c.ModeGearPresentationService.rotation(e,cfg,350,clock),during=c.ModeGearPresentationService.rotation(e,cfg,350,clock+100);
 assert.equal(start,0);assert.ok(during>0);assert.equal(c.ModeGearPresentationService.rotation(e,cfg,350,clock+350),Math.PI*2);
});
test('타우 별개 낫2개가 같은 반시계 회전·두 번 그리기/원격 동일',()=>{
 const character=c.CharacterDataService.compile('tau'),e=entity({character}),cfgs=character.worldEffectModules;
 assert.equal(cfgs.length,2);assert.equal(cfgs[0].style,cfgs[1].style);assert.equal(c.WEAPON_IMAGE_DEFS['crossed-chain-scythes'],undefined);
 c.AttackModuleService.onDelivery(e,character.attacks.lmb,0,c.AttackExecutionService.create(e,character.attacks.lmb,0));
 const left=c.ModeGearPresentationService.rotation(e,cfgs[0],350,clock+100),right=c.ModeGearPresentationService.rotation(e,cfgs[1],350,clock+100);
 assert.ok(left<0);assert.ok(right<0);assert.equal(left,right);
 const ctx=canvasStub(),angles=[];ctx.rotate=a=>angles.push(a);c.ModeGearPresentationService.drawBehind(ctx,e,1,clock+100);
 assert.deepEqual(angles,[cfgs[0].angle+left,cfgs[1].angle+right]);
 const remote=entity({character,local:false});c.ModeStateService.applyRemote(remote,JSON.parse(JSON.stringify(c.ModeStateService.serialize(e,clock))),clock);
 for(const cfg of cfgs)assert.equal(c.ModeGearPresentationService.rotation(remote,cfg,350,clock+100),c.ModeGearPresentationService.rotation(e,cfg,350,clock+100));
});
test('반 파괴0에서 작은 스패너/복구 큰 스패너·중복표시 없음·투척 모션/원격 상태',()=>{
 const character=c.CharacterDataService.compile('van'),e=entity({character}),cfgs=character.worldEffectModules;
 function active(target=e){return cfgs.filter(cfg=>c.ModeGearPresentationService.matches(target,cfg.conditions,clock))}
 assert.equal(active().length,1);assert.equal(active()[0].style,'wrench');
 for(const value of [799,1,0,800]){
  c.ProgressStateService.apply(e,{stateKey:'van-wrench-durability',operation:'set',value,max:800,initial:800});
  assert.equal(active().length,1);assert.equal(active()[0].style,value===0?'small-wrench':'wrench');
 }
 c.ProgressStateService.apply(e,{stateKey:'van-wrench-durability',operation:'set',value:0,max:800,initial:800});
 const small=active()[0];assert.ok(small.scale<cfgs[0].scale);
 const a=character.attacks.lmbThrown,ex=c.AttackExecutionService.create(e,a,0);c.AttackModuleService.onDelivery(e,a,0,ex);c.AttackModuleService.onDelivery(e,a,0,ex);
 assert.equal(c.ModeStateService.state(e,'van-wrench-rotation').turns,1);
 const remote=entity({character,local:false});c.ProgressStateService.applyRemote(remote,JSON.parse(JSON.stringify(c.ProgressStateService.serialize(e))));c.ModeStateService.applyRemote(remote,JSON.parse(JSON.stringify(c.ModeStateService.serialize(e,clock))),clock);
 assert.equal(active(remote)[0].style,'small-wrench');assert.equal(c.ModeGearPresentationService.rotation(remote,small,300,clock+100),c.ModeGearPresentationService.rotation(e,small,300,clock+100));
});
test('로온 실제 field.exists는 표시4초만 빙수·기본5초 유지 조건/상호배타/10명 공용형상',()=>{
 const character=c.CharacterDataService.compile('roon'),e=entity({character}),cfgs=character.worldEffectModules;
 function active(){return cfgs.filter(cfg=>c.ModeGearPresentationService.matches(e,cfg.conditions,clock))}
 assert.equal(active().length,1);assert.equal(active()[0].style,'melon-slice');
 const state={kind:c.InstalledAreaFieldService.KIND,baseStateKey:'roon-slush-zone',phase:'point',startedAt:1000,endsAt:6000,module:{activeDuration:4000}};
 e.actionState.set('field:test',state);clock=4999;assert.equal(active()[0].style,'melon-slush');
 clock=5000;assert.equal(active()[0].style,'melon-slice');
 const plain={type:'field.exists',stateKey:'roon-slush-zone'};assert.equal(c.TriggerModuleService.matches({type:'trigger',event:'presentation.draw',conditions:[plain]},'presentation.draw',{source:e,now:clock}),true);
 clock=2000;state.rewardOnly=true;assert.equal(active()[0].style,'melon-slice');state.rewardOnly=false;state.phase='afterlife';assert.equal(active()[0].style,'melon-slice');
 state.phase='point';clock=6000;assert.equal(active()[0].style,'melon-slice');
 for(const a of Object.values(character.attacks)){assert.equal(a.modules.at(-1).when,'on-delivery');assert.equal(a.modules.at(-1).stateKey,'roon-weapon-motion')}
});
load('src/combat/HealthService.js','HealthService');load('src/render/Presentation.js','Presentation');
c.BuffService.live=()=>[];c.NaturalHealthRegenActivityService={mark(){}};c.EntityCharacterDeathResetService={reset:e=>{e.actionState.clear()}};
c.SoundService={play(){}};c.ScreenShakeService={forceImpact(){}};c.WorldViewportVisibilityService={containsWorldPoint:()=>false};c.ImpactDirectionService={entityCenter:()=>null};c.GAME_DATA.cameraFeedback={ko:{}};
test('실제 Health 치명타 전 상태 캡처·사망 연출에서 가호 무기만 고정·중복 미재시작',()=>{
 const service=c.ModeGearPresentationService;service.clearDeathRemnants();
 const e=entity({character:reika,health:10,maxHealth:1500}),cfg=reika.worldEffectModules[1];c.ModeStateService.set(e,'reika-mode','blessed','normal');c.ModeStateService.toggle(e,{stateKey:'reika-sword-rotation',values:['a','b']});clock+=100;
 service.drawBehind(canvasStub(),e,.8,clock);const saved=service.rotation(e,cfg,300,clock);
 assert.equal(c.HealthService.damage(e,20,clock).defeated,true);assert.equal(e.actionState.size,0);assert.equal(e.alive,false);
 c.Presentation.deathLaunch(e,null,null,null,null);const ghost=service.deathState.remnants.get(e);
 assert.equal(ghost.images.length,1);assert.equal(ghost.images[0].config.style,'sun-blessed');assert.equal(ghost.images[0].sample.spin,saved);
 assert.equal(ghost.alpha,.8);assert.equal(service.drawBehind(canvasStub(),e,1,clock),false);
 clock+=100;c.Presentation.deathLaunch(e,null,null,null,null);assert.equal(service.deathState.remnants.get(e).start,1100);
 const ctx=canvasStub(),spins=[];ctx.rotate=a=>spins.push(a);service.drawDeathRemnants(ctx,clock+400);assert.equal(spins[0],cfg.angle+saved);
});
test('무기 잔류는160ms 유지/1600ms 점진 페이드/만료 삭제·원래 위치 고정',()=>{
 const service=c.ModeGearPresentationService;service.clearDeathRemnants();const e=entity({character:siro});service.captureDeath(e,clock);e.alive=false;
 assert.equal(service.presentDeath(e,{x:700,y:300},clock),true);e.x=999;e.y=999;
 function alpha(time){const ctx=canvasStub(),values=[],moves=[];ctx.stroke=()=>values.push(ctx.globalAlpha);ctx.translate=(...v)=>moves.push(v);service.drawDeathRemnants(ctx,time);if(values.length)assert.deepEqual(moves[0],[700,300]);return values[0]??0}
 assert.equal(alpha(1000),.60);assert.equal(alpha(1160),.60);assert.equal(alpha(1960),.30);assert.equal(alpha(2760),0);assert.equal(service.deathState.remnants.size,0);
});
test('온라인 확정은 마지막 실제 표시의 무기/탄창 투명도 사용·미노출/부활대체 제외',()=>{
 const service=c.ModeGearPresentationService;service.clearDeathRemnants();const e=gun(),cfg=intu.worldEffectModules[0];
 c.TimedActionStateService.open(e,{stateKey:'intu-reload',duration:1500},clock);service.drawBehind(canvasStub(),e,.4,clock);e.actionState.clear();e.hidden=true;e.alive=false;clock+=50;
 c.Presentation.deathLaunch(e,null,null,null,null,{confirmed:true,targetPoint:{x:600,y:200}});const ghost=service.deathState.remnants.get(e);
 assert.equal(ghost.images[0].sample.alpha,.60*.28);assert.equal(ghost.alpha,.4);assert.equal(ghost.x,600);assert.equal(ghost.y,200);
 service.clearDeathRemnants();const hidden=entity({character:siro});service.drawBehind(canvasStub(),hidden,0,clock);hidden.alive=false;
 c.Presentation.deathLaunch(hidden,null,null,null,null,{confirmed:true});assert.equal(service.deathState.remnants.size,0);
 const alive=entity({character:siro});service.drawBehind(canvasStub(),alive,1,clock);c.Presentation.deathLaunch(alive,null,null,null,null,{replacement:true});assert.equal(service.deathState.remnants.size,0);
});
test('샤베트/슈비 새 형상은 공용 렌더·기존 총과 구별·유한 좌표',()=>{
 for(const id of ['sherbet','shubi']){
  const character=c.CharacterDataService.compile(id),e=entity({character}),cfg=character.worldEffectModules[0],ctx=canvasStub();
  assert.ok(c.ModeGearPresentationService.drawBehind(ctx,e,1,clock));assert.ok(ctx.ops.length>10);
  assert.ok(ctx.ops.flat().filter(v=>typeof v==='number').every(Number.isFinite));
 }
 assert.notEqual(JSON.stringify(c.WEAPON_IMAGE_DEFS['electronic-shotgun']),JSON.stringify(c.WEAPON_IMAGE_DEFS.shotgun));
 assert.equal(c.WEAPON_IMAGE_DEFS['snow-crystal'].paths.length,20);
});
test('샤베트 대기 모션 없음·실제 평타/분쇄/반격 모션과 원격 복원',()=>{
 const character=c.CharacterDataService.compile('sherbet');
 // after-attack is the actual resolved progressive effect, never the window start.
 c.HitScanGeometryService={effectiveModule:(s,a,m)=>m};
 const original=c.EffectSpawnService,spawned=[];c.EffectSpawnService={...original,spawn:x=>{spawned.push(x);return x},shouldPresentAttack:()=>true};
 for(const key of ['lmbWindup','lmb','lmbFrozen','rmb','counter']){
  const e=entity({character}),a=character.attacks[key],ex=c.AttackExecutionService.create(e,a,0);
  if(key==='lmbWindup')assert.ok(!a.modules.some(m=>m.type==='mode.toggle'));
  else {
   if(key==='counter')c.AttackModuleService.onDelivery(e,a,0,ex);else c.AttackModuleService.afterAttack(e,a,0,ex);
   assert.equal(c.ModeStateService.state(e,'sherbet-crystal-motion').turns,1);
   const remote=entity({character,local:false});c.ModeStateService.applyRemote(remote,JSON.parse(JSON.stringify(c.ModeStateService.serialize(e,clock))),clock);
   const cfg=character.worldEffectModules[0];assert.equal(c.ModeGearPresentationService.rotation(e,cfg,420,clock+180),c.ModeGearPresentationService.rotation(remote,cfg,420,clock+180));
  }
 }
 c.EffectSpawnService=original;
});
test('빙결 성공만 눈결정 잔향·빙결된 적 매 타격은 확산 링·분쇄 후에도 피격 전 상태 유지',()=>{
 const character=c.CharacterDataService.compile('sherbet'),e=entity({character});
 const originalFx=c.EffectSpawnService,originalStatus=c.CombatStatusApplicationService,originalCc=c.CCService;
 let spawned=[];c.EffectSpawnService={...originalFx,spawn:x=>{spawned.push(x);return x},shouldPresentAttack:()=>true};
 c.CCService={...originalCc,clear:(t,status)=>t.statuses.delete(status)};
 for(const accepted of [false,true]){
  spawned=[];const target=entity({id:'victim',teamId:'B'});c.CombatStatusApplicationService={apply:()=>accepted};
  const a=character.attacks.lmbFrozen;c.AttackModuleService.onHit(e,target,a,{execution:c.AttackExecutionService.create(e,a,0)},0);
  assert.equal(spawned.filter(x=>x.type==='weaponImageEcho').length,accepted?1:0);assert.equal(spawned.filter(x=>x.type==='hitImpactRing').length,0);
 }
 c.CombatStatusApplicationService=originalStatus;
 for(const key of ['lmb','lmbFrozen','rmb','counter'])for(let i=0;i<2;i++){
  spawned=[];const target=entity({id:'victim-'+i,teamId:'B'});target.statuses.set('freeze',[{end:clock+1000}]);
  const a=character.attacks[key],cc=character.abilities.counter.trigger.modules[0].cc,ex=c.AttackExecutionService.create(e,a,0,key==='counter'?[cc]:null);
  c.AttackModuleService.onHit(e,target,a,{execution:ex},0);
  assert.equal(spawned.filter(x=>x.type==='hitImpactRing'&&x.maxR===48).length,key==='rmb'?1:0,key);
  assert.equal(spawned.filter(x=>x.type==='contractingPullRing').length,0,key);
  if(key==='rmb')assert.ok(spawned.some(x=>x.type==='hitImpactRing'&&x.maxR===62));
 }
 c.CombatStatusApplicationService=originalStatus;c.CCService=originalCc;c.EffectSpawnService=originalFx;
});
test('빙결 연출은 온라인 피격자 권위 1회 생성·상대 공격 replay에서도 복제·기존 공격자 효과 유지',()=>{
 const character=c.CharacterDataService.compile('sherbet'),originalFx=c.EffectSpawnService,originalSync=c.OnlinePresentationSyncService,originalStatus=c.CombatStatusApplicationService;
 let spawned=[],sent=[];c.Training.sessionMode='online';c.OnlineDuelService.active=true;
 c.EffectSpawnService={...originalFx,spawn:x=>{spawned.push(x);return x},presentationSnapshot:x=>x,shouldPresentAttack:(s,ex)=>s.local!==false&&ex.networkReplay!==true};
 c.OnlinePresentationSyncService={shouldSend:e=>e.local!==false,send:(kind,e,data)=>sent.push({kind,e,data})};
 c.CombatStatusApplicationService={apply:ctx=>ctx.target.local!==false};
 for(const localVictim of [false,true]){
  spawned=[];sent=[];const source=entity({character,local:!localVictim}),target=entity({id:'victim',local:localVictim,teamId:'B'}),a=character.attacks.lmbFrozen,ex=c.AttackExecutionService.create(source,a,0);ex.networkReplay=localVictim;
  c.AttackModuleService.onHit(source,target,a,{execution:ex},0);
  assert.equal(spawned.length,localVictim?1:0);assert.equal(sent.length,localVictim?1:0);
  if(localVictim){assert.equal(sent[0].e,target);assert.equal(sent[0].data.effect.type,'weaponImageEcho');}
 }
 const source=entity({character,local:false}),target=entity(),ex=c.AttackExecutionService.create(source,character.attacks.lmb,0);ex.networkReplay=true;
 assert.equal(c.AttackModuleService.spawnAttackEffect(source,character.attacks.lmb,0,ex,{type:'effect.spawn',renderType:'hitImpactRing'},target),null);
 c.Training.sessionMode='training';c.OnlineDuelService.active=false;c.EffectSpawnService=originalFx;c.OnlinePresentationSyncService=originalSync;c.CombatStatusApplicationService=originalStatus;
});
test('슈비 평타 짧은반동/스킬반격 회전·실제 전달1회·원격 동일',()=>{const ch=c.CharacterDataService.compile('shubi'),cfg=ch.worldEffectModules[0],svc=c.ModeGearPresentationService;for(const key of ['lmb','rmb','counter']){const e=entity({character:ch}),a=ch.attacks[key],ex=c.AttackExecutionService.create(e,a,0),stateKey=key==='lmb'?cfg.motionStateKey:cfg.rotationStateKey;for(let i=0;i<6;i++)c.AttackModuleService.onDelivery(e,a,0,ex);assert.equal(c.ModeStateService.state(e,stateKey).turns,1);const peer=entity({character:ch});c.ModeStateService.applyRemote(peer,JSON.parse(JSON.stringify(c.ModeStateService.serialize(e,clock))),clock);assert.equal(svc.rotation(e,cfg,350,clock+177),svc.rotation(peer,cfg,350,clock+177));assert.equal(svc.weaponPose(e,cfg,clock+177).pulse,svc.weaponPose(peer,cfg,clock+177).pulse);if(key==='lmb'){assert.ok(Math.abs(svc.rotation(e,cfg,350,clock+177))<1e-9);assert.ok(cfg.motion.rotation<0&&Math.abs(cfg.motion.rotation)<1);}else assert.ok(svc.rotation(e,cfg,350,clock+177)<0);}});

test('로온 빙수 게이지 완성/반격 빙결 성공에만 무기 반응·실패 제외',()=>{
 c.NetworkCollisionPositionService={point:e=>({x:e.x,y:e.y})};
 load('src/combat/ProgressHitTargetPolicy.js','ProgressHitTargetPolicy');
 const character=c.CharacterDataService.compile('roon'),source=entity({id:'roon-owner',character}),a=character.attacks.lmb,m=a.modules.find(m=>m.type==='state.progress'),oldFx=c.EffectSpawnService,oldStatus=c.CombatStatusApplicationService;
 let spawned=[];c.EffectSpawnService={...oldFx,spawn:x=>{spawned.push(x);return x},shouldPresentAttack:()=>true};
 for(const accepted of [false,true]){
  spawned=[];const target=entity({id:'enemy',teamId:'B'});c.ProgressStateService.apply(target,{...m,operation:'set',value:7});c.CombatStatusApplicationService={apply:()=>accepted};
  assert.equal(c.AttackModuleService.applyHitProgress(source,target,m,{attack:a,execution:c.AttackExecutionService.create(source,a,0),now:clock}),true);
  assert.equal(spawned.filter(x=>x.type==='weaponImageEcho').length,accepted?1:0);
  if(accepted)assert.equal(spawned[0].targetEntityId,source.id);
 }
 const cc=character.abilities.counter.trigger.modules[0].cc;assert.ok(cc.onAppliedEffects.some(x=>x.renderType==='weaponImageEcho'));
 c.EffectSpawnService=oldFx;c.CombatStatusApplicationService=oldStatus;
});
test('잔류 무기 캐시 공용 clearAll 정리·다시 죽으면 새 무기/현재 모션 캡처',()=>{
 const service=c.ModeGearPresentationService;service.clearDeathRemnants();const e=entity({character:siro});service.captureDeath(e,clock);service.presentDeath(e,null,clock);
 clock+=200;e.alive=true;c.ModeStateService.toggle(e,{stateKey:'siro-weapon-motion',values:['a','b']});service.captureDeath(e,clock);e.alive=false;assert.equal(service.presentDeath(e,null,clock),true);assert.equal(service.deathState.remnants.get(e).start,1200);
 load('src/render/EffectSpawnService.js','EffectSpawnService');c.Training.fx=[];assert.equal(c.EffectSpawnService.clearAll(),true);assert.equal(service.deathState.remnants.size,0);assert.equal(service.deathState.liveSamples.get(e),undefined);assert.equal(service.deathState.pendingSamples.get(e),undefined);
});
test('실제 진행형 빙결→눈결정 잔향·점선 링 없음·기본 무기 크기 유지/만료',()=>{
 const character=c.CharacterDataService.compile('sherbet'),source=entity({id:'sherbet-owner',character}),target=entity({id:'frozen-enemy',teamId:'B'}),a=character.attacks.lmbFrozen;
 c.Training.active=true;c.Training.fx=[];c.EntityService.items.set(source.id,source);c.EntityService.items.set(target.id,target);c.AttackHitTriggerService={damage:()=>({hit:true,authoritative:true})};
 const ex=c.AttackExecutionService.create(source,a,0),effect=c.AttackModuleService.spawnAttackEffect(source,a,0,ex,a.modules[0]);
 assert.equal(c.EffectSpawnService.effectDamageTarget(effect,target,{x:target.x,y:target.y}),true);
 const echo=c.Training.fx.find(f=>f.type==='weaponImageEcho');assert.ok(echo);assert.equal(echo.targetEntityId,source.id);assert.ok(!c.Training.fx.some(f=>f.type==='contractingPullRing'));assert.equal(c.ModeGearPresentationService.reaction(source,clock+250),0);
 const values=[];for(const at of [100,500]){const ctx=canvasStub(),alphas=[];ctx.stroke=()=>alphas.push(ctx.globalAlpha);c.ModeGearPresentationService.drawBehind(ctx,source,1,clock+at);values.push({scale:ctx.ops.find(x=>x[0]==='scale')[1],alpha:alphas[0]});}assert.ok(values[1].scale>values[0].scale);assert.ok(values[1].alpha<values[0].alpha);
 const snap=c.EffectSpawnService.presentationSnapshot(echo,clock);c.ModeGearPresentationService.weaponEchoes.clear();c.EffectSpawnService.spawn(c.EffectSpawnService.restorePresentationSnapshot(snap,clock+20),{source:target});assert.ok(c.ModeGearPresentationService.weaponEchoes.has(source.id));assert.ok(!c.ModeGearPresentationService.weaponEchoes.has(target.id));
 c.ModeGearPresentationService.drawBehind(canvasStub(),source,1,clock+670);assert.equal(c.ModeGearPresentationService.weaponEchoes.size,0);c.EffectSpawnService.clearAll();assert.equal(c.ModeGearPresentationService.weaponEchoes.size,0);c.Training.active=false;
});
test('루네프 책 실제 발사/범위 모션·선택대기/후속폭발 제외·페이지 움직임/원격 동일',()=>{
 const character=c.CharacterDataService.compile('runef'),cfg=character.worldEffectModules[0];assert.equal(cfg.style,'spellbook');
 for(const key of ['rmbSelect','fireExplosion'])assert.ok(!character.attacks[key].modules.some(m=>m.type==='mode.toggle'));
 for(const key of ['lmb','lmbChain','fire','ice','lightning','counter']){const e=entity({character}),a=character.attacks[key],ex=c.AttackExecutionService.create(e,a,0);for(let i=0;i<3;i++)c.AttackModuleService.onDelivery(e,a,0,ex);assert.equal(c.ModeStateService.state(e,'runef-book-motion').turns,1);const remote=entity({character,local:false});c.ModeStateService.applyRemote(remote,JSON.parse(JSON.stringify(c.ModeStateService.serialize(e,clock))),clock);assert.equal(c.ModeGearPresentationService.weaponPose(e,cfg,clock+200).pulse,c.ModeGearPresentationService.weaponPose(remote,cfg,clock+200).pulse);const idle=canvasStub(),active=canvasStub();c.ModeGearPresentationService.drawImage(idle,e,cfg,1,clock+500);c.ModeGearPresentationService.drawImage(active,e,cfg,1,clock+200);assert.ok(active.ops.length>idle.ops.length);}
 assert.equal(c.CharacterDataService.compile('sherbet').worldEffectModules[0].scale,2.3*.85);
});

test('잔향 생성 위치/모양 고정: 이동·무기 회전·크기 변경 후에도 생성 표본 사용',()=>{
 const service=c.ModeGearPresentationService;service.clearDeathRemnants();const e=entity({character:c.CharacterDataService.compile('sherbet'),x:100,y:200});service.echo(e,clock);
 const snap=service.weaponEchoes.get(e.id)[0].snapshot;e.x=340;e.y=380;e.radius=50;c.ModeStateService.toggle(e,{stateKey:'sherbet-crystal-motion',values:['a','b']});
 const ctx=canvasStub(),translations=[];ctx.translate=(...v)=>translations.push(v);service.drawEchoes(ctx,e,1,clock+200);
 assert.deepEqual(translations[0],[-240,-180]);assert.equal(snap.entity.radius,20);assert.equal(snap.images[0].sample.spin,0);assert.equal(snap.images[0].sample.alpha,.4);
 const fresh=canvasStub(),still=canvasStub();const ref={...snap.entity,id:e.id,x:100,y:200};service.drawEchoes(fresh,ref,1,clock+200);service.drawEchoes(still,e,1,clock+200);assert.deepEqual(fresh.ops,still.ops);service.clearDeathRemnants();
});
test('루네프 실제 마법별 책 색600ms/최신 마법/원격 복원/사망표본 색 고정',()=>{
 const character=c.CharacterDataService.compile('runef'),cfg=character.worldEffectModules[0],svc=c.ModeGearPresentationService;
 for(const [key,color]of [['fire','#ff2200'],['ice','#64c8ff'],['lightning','#ffe63c'],['counter','#00b432']]){
  const e=entity({character}),a=character.attacks[key];assert.equal(svc.activeColor(e,cfg,clock),null);const ex=c.AttackExecutionService.create(e,a,0);for(let i=0;i<3;i++)c.AttackModuleService.onDelivery(e,a,0,ex);
  assert.equal(svc.activeColor(e,cfg,clock+200),color);assert.equal(c.ModeStateService.state(e,'runef-book-'+key).turns,key==='lightning'?3:1);
  const remote=entity({character,local:false});c.ModeStateService.applyRemote(remote,JSON.parse(JSON.stringify(c.ModeStateService.serialize(e,clock))),clock);assert.equal(svc.activeColor(remote,cfg,clock+200),color);
  const canvas=canvasStub();svc.drawImage(canvas,e,cfg,1,clock+200);assert.ok(canvas.styles.includes(c.ColorService.brighten(color,.65)));assert.ok(!canvas.styles.includes('#513984'));
  const snap=svc.sampleWeapons(e,1,clock+200);assert.equal(snap.images[0].sample.activeColor,color);const frozen=canvasStub();svc.drawImage(frozen,snap.entity,cfg,1,clock+1500,snap.images[0].sample);assert.ok(frozen.styles.includes(c.ColorService.brighten(color,.65)));
  assert.equal(svc.activeColor(e,cfg,clock+600),null);
 }
 const e=entity({character});c.AttackModuleService.onDelivery(e,character.attacks.fire,0,c.AttackExecutionService.create(e,character.attacks.fire,0));clock+=100;c.AttackModuleService.onDelivery(e,character.attacks.ice,0,c.AttackExecutionService.create(e,character.attacks.ice,0));assert.equal(svc.activeColor(e,cfg,clock),'#64c8ff');
});
test('타우 완충 시 노랑 계열만 표시·소모 후 복원/원격 동일·전기선 없음',()=>{
 const character=c.CharacterDataService.compile('tau'),e=entity({character}),svc=c.ModeGearPresentationService;
 for(const cfg of character.worldEffectModules){
  c.ProgressStateService.apply(e,{stateKey:'spark-scythe',operation:'set',value:2,max:3});const before=canvasStub();svc.drawImage(before,e,cfg,1,clock);assert.equal(svc.activeColor(e,cfg,clock),null);
  c.ProgressStateService.apply(e,{stateKey:'spark-scythe',operation:'set',value:3,max:3});const full=canvasStub();svc.drawImage(full,e,cfg,1,clock);assert.deepEqual(full.ops,before.ops);assert.equal(svc.activeColor(e,cfg,clock),'#ffe13c');assert.ok(full.styles.includes(c.ColorService.brighten('#ffe13c',.65)));assert.equal(c.WEAPON_IMAGE_DEFS[cfg.style].sparks,undefined);
  const remote=entity({character,local:false});c.ProgressStateService.applyRemote(remote,JSON.parse(JSON.stringify(c.ProgressStateService.serialize(e,clock))),clock);assert.equal(svc.activeColor(remote,cfg,clock),'#ffe13c');
  c.ProgressStateService.apply(e,{stateKey:'spark-scythe',operation:'set',value:0,max:3});const reset=canvasStub();svc.drawImage(reset,e,cfg,1,clock);assert.deepEqual(reset.styles,before.styles);
 }
});
test('실제 피해 표시 바인딩: 샤베트 빙결 평타/반격 링 제거·다른 공격 링 유지',()=>{
 const callbacks={},fx=[],sent=[];const b=vm.createContext({trainingPresentationBindingsInitialized:false,GameEvents:{on:(k,fn)=>callbacks[k]=fn},Training:{active:false},performance:{now:()=>1000},CCService:{has:()=>false,isDotImpact:i=>i?.dot===true},StealthPresentationService:{exposeState(){}},ImpactDirectionService:{squashOrigin:()=>null},EntitySquashPresentationService:{impact(){}},Presentation:{damageNumber(){}},SoundService:{play(){}},GAME_DATA:{cameraFeedback:{strongDamage:300},frameMs:1000/60},EffectSpawnService:{spawn:s=>{fx.push(s);return s},presentationSnapshot:s=>s},AttackPresentationColorService:{resolve:()=> '#ff0000'},EntitySimulationAuthorityService:{isLocal:()=>true},OnlinePresentationSyncService:{send:(k)=>sent.push(k),entityPid:()=>1}});
 vm.runInContext(fs.readFileSync(path.join(root,'src/render/TrainingPresentationBindings.js'),'utf8')+';TrainingPresentationBindings.init();',b);
 const char=c.CharacterDataService.compile('sherbet');for(const key of ['lmbFrozen','counter','lmb']){fx.length=0;sent.length=0;callbacks['damage-applied']({source:entity({character:char}),target:entity({id:'victim'}),attack:char.attacks[key],amount:100,impact:{},now:1000});assert.equal(fx.length,key==='lmb'?1:0,key);assert.equal(sent.includes('effect-spawn'),key==='lmb');}
 vm.runInContext(fs.readFileSync(path.join(root,'src/combat/HitContactFeedbackService.js'),'utf8')+';globalThis.feedback=HitContactFeedbackService;',b);
 for(const key of ['lmbFrozen','counter','lmb']){fx.length=0;b.feedback.apply({source:entity({character:char}),target:entity({id:'victim'}),attack:char.attacks[key],amount:100,impact:{},now:1000});assert.equal(fx.length,key==='lmb'?1:0,key+' contact');}
});


test('실제 Training FX 루프: 무기 잔향/반응은 기본 빨간 확장 원을 그리지 않음',()=>{
 const source=fs.readFileSync(path.join(root,'src/modes/Training.js'),'utf8'),start=source.indexOf("    for(const f of this.fx){\n      if(f?.type==='recordDodgeTrail'"),end=source.indexOf('    OwnedFieldManagementPresentationService.draw(',start),loop=source.slice(start,end);
 assert.ok(start>0&&end>start);const ctx=canvasStub();const env=vm.createContext({ctx,now:1200,ColorService:c.ColorService,EffectPresentationVisibilityService:{visible:()=>true},Training:{fx:[]}});let arcs=0;ctx.arc=()=>arcs++;
 for(const type of ['weaponImageEcho','weaponImagePulse']){env.Training.fx=[{type,x:100,y:200,start:1000,dur:650}];vm.runInContext('(function(){'+loop+'}).call(Training)',env);assert.equal(arcs,0);}
 env.Training.fx=[{type:'hitImpactRing',x:100,y:200,start:1000,dur:650}];vm.runInContext('(function(){'+loop+'}).call(Training)',env);assert.equal(arcs,1);
});
test('책 색은200ms 유지 뒤400ms 원래 면/윤곽으로 페이드·사망 캡처도 중간색 유지',()=>{
 const character=c.CharacterDataService.compile('runef'),cfg=character.worldEffectModules[0],e=entity({character}),svc=c.ModeGearPresentationService,a=character.attacks.fire;
 c.AttackModuleService.onDelivery(e,a,0,c.AttackExecutionService.create(e,a,0));assert.equal(svc.activityTint(e,cfg,clock+200).amount,1);assert.equal(svc.activityTint(e,cfg,clock+400).amount,.5);assert.equal(svc.activityTint(e,cfg,clock+600),null);
 const base=canvasStub(),full=canvasStub(),middle=canvasStub(),end=canvasStub();svc.drawImage(base,e,cfg,1,clock+1000);svc.drawImage(full,e,cfg,1,clock+200);svc.drawImage(middle,e,cfg,1,clock+400);svc.drawImage(end,e,cfg,1,clock+600);assert.notDeepEqual(middle.styles,full.styles);assert.notDeepEqual(middle.styles,base.styles);assert.deepEqual(end.styles,base.styles);
 const snap=svc.sampleWeapons(e,1,clock+400),frozen=canvasStub();svc.drawImage(frozen,snap.entity,cfg,1,clock+1000,snap.images[0].sample);assert.deepEqual(frozen.styles,middle.styles);
});



test('번개 실제3회 범위 전달마다 책 노랑 새로 반응·모션은1회/원격 페이드 동일',()=>{
 const character=c.CharacterDataService.compile('runef'),e=entity({id:'lightning-owner',character}),cfg=character.worldEffectModules[0],a=character.attacks.lightning,svc=c.ModeGearPresentationService;c.SimulationScheduleService.clear();
 fire(e,a);assert.equal(c.ModeStateService.state(e,'runef-book-lightning').turns,1);assert.equal(areas.length,1);
 for(const at of [1350,1700]){clock=at;const prior=svc.activityTint(e,cfg,clock).amount;assert.ok(prior<1);c.SimulationScheduleService.update(clock);assert.equal(svc.activityTint(e,cfg,clock).amount,1);assert.equal(c.ModeStateService.state(e,'runef-book-lightning').changedAt,clock);}
 assert.equal(areas.length,3);assert.equal(c.ModeStateService.state(e,'runef-book-lightning').turns,3);assert.equal(c.ModeStateService.state(e,'runef-book-motion').turns,1);
 const remote=entity({character,local:false});c.ModeStateService.applyRemote(remote,JSON.parse(JSON.stringify(c.ModeStateService.serialize(e,clock))),clock);assert.equal(svc.activityTint(remote,cfg,clock+300).amount,svc.activityTint(e,cfg,clock+300).amount);assert.equal(svc.activeColor(e,cfg,clock+600),null);
});



test('시로400ms 1단계부터 점선링·800ms 두번째 색·링 배치가1단계 공간 확보',()=>{
 c.EntityRingLayoutService={chargeRadius:()=>28,maxChargeFlashRadius:()=>31.5,WIDTHS:{flash:2}};load('src/render/ArcGaugePresentationService.js','ArcGaugePresentationService');
 const e=entity({character:siro,color:siro.color});e.actionState.set('charge:primary',{kind:c.ChargedAttackService.KIND,attackId:siro.attacks.lmb.id,startedAt:1000,angle:0});
 for(const [elapsed,expected]of [[399,false],[400,true],[600,true],[800,true]]){clock=1000+elapsed;const ctx=canvasStub(),dashes=[];ctx.setLineDash=v=>{if(v.length)dashes.push(v)};c.ChargedAttackService.draw(ctx,e,clock);assert.equal(dashes.length,expected?1:0);assert.equal(c.ChargedAttackService.hasChargeFlash(e,clock),expected);assert.equal(c.ChargedAttackService.isFull(e,clock),elapsed===800);}
 const layout=vm.runInNewContext(fs.readFileSync(path.join(root,'src/core/EntityRingLayoutService.js'),'utf8')+';EntityRingLayoutService',{ChargedAttackService:c.ChargedAttackService,performance:{now:()=>1400}});assert.equal(layout.flashVisible.call({canViewPrivateGauge:()=>true},e,1400),true);
});
test('클레아 초승달 기존모듈·평타당1회 회전/스킬은색만·상태갱신/종료/원격',()=>{
 const character=c.CharacterDataService.compile('clea'),e=entity({id:'clea-owner',character}),cfg=character.worldEffectModules[0],svc=c.ModeGearPresentationService;
 assert.equal(cfg.style,'moon-crescent');assert.equal(cfg.motion,undefined);assert.equal(svc.activeColor(e,cfg,clock),null);
 for(const key of ['lmb','lmbShadow']){const ex=c.AttackExecutionService.create(e,character.attacks[key],0),prior=c.ModeStateService.state(e,'clea-moon-rotation')?.turns||0;for(let i=0;i<2;i++)c.AttackModuleService.onDelivery(e,character.attacks[key],0,ex);assert.equal(c.ModeStateService.state(e,'clea-moon-rotation').turns,prior+1);}
 for(const key of ['counter','counterShadow'])assert.equal(character.attacks[key].modules.find(m=>m.stateKey==='clea-moon-rotation').when,'after-attack');
 c.Training.active=true;c.ProgressStateService.apply(e,{stateKey:'clea-moon-shadow-gauge',operation:'set',value:100,max:300});const turns=c.ModeStateService.state(e,'clea-moon-rotation').turns;fire(e,character.attacks.rmb);assert.equal(c.ModeStateService.state(e,'clea-moon-rotation').turns,turns);assert.equal(svc.activeColor(e,cfg,clock),'#87c3f5');
 const remote=entity({character,local:false});c.TimedActionStateService.applyRemote(remote,JSON.parse(JSON.stringify(c.TimedActionStateService.serialize(e,clock))),clock);assert.equal(svc.activeColor(remote,cfg,clock),'#87c3f5');clock+=4999;assert.equal(svc.activeColor(e,cfg,clock),'#87c3f5');clock++;assert.equal(svc.activeColor(e,cfg,clock),null);
 c.TimedActionStateService.open(e,{stateKey:'clea-moon-shadow',duration:5000},clock);e.actionState.delete('clea-moon-shadow');assert.equal(svc.activeColor(e,cfg,clock),null);const ctx=canvasStub();svc.drawImage(ctx,e,cfg,1,clock);assert.ok(ctx.ops.some(o=>o[0]==='curve'));c.Training.active=false;
});

load('src/combat/DodgeFollowupStateService.js','DodgeFollowupStateService');
test('카논 옅은 기본무기·제자리 회피 잔향·이동회피 보정 시 한 번만 생성',()=>{
 const ch=c.CharacterDataService.compile('kanon'),e=entity({id:'kanon-echo-owner',character:ch,dodgeUntil:clock+130,forcedMotion:{kind:'dodge'}}),svc=c.ModeGearPresentationService,dodge=c.DodgeFollowupStateService;
 c.EntityService.items.set(e.id,e);c.Training.active=true;c.Training.fx=[];svc.weaponEchoes.clear();
 assert.ok(!ch.tooltipSkills[0].text.includes('넉백'));
 assert.equal(svc.sampleWeapons(e,1,clock).images.length,1);
 dodge.begin(e,{x:1,y:0},clock);assert.equal(svc.weaponEchoes.size,0);
 assert.equal(dodge.observeMovement(e,{x:0,y:0},clock+20),true);assert.equal(dodge.observeMovement(e,{x:0,y:0},clock+30),false);
 const echo=svc.weaponEchoes.get(e.id)[0];assert.equal(echo.snapshot.images[0].sample.alpha,1);assert.equal(echo.snapshot.images[0].config.style,'dodge-slip');assert.equal(echo.snapshot.x,e.x);e.x+=100;assert.notEqual(echo.snapshot.x,e.x);
 svc.weaponEchoes.clear();dodge.begin(e,{x:0,y:0},clock);assert.equal(svc.weaponEchoes.get(e.id).length,1);assert.equal(svc.sampleWeapons(e,1,clock).images.length,1);
 svc.drawBehind(canvasStub(),e,1,clock+801);assert.equal(svc.weaponEchoes.size,0);c.EffectSpawnService.clearAll();c.Training.active=false;
});
test('카논 제자리 잔향 온라인 중복방지·기존 무기 잔향 알파 유지',()=>{
 const ch=c.CharacterDataService.compile('kanon'),e=entity({id:'kanon-remote',character:ch,local:false}),svc=c.ModeGearPresentationService;
 c.Training.active=true;c.Training.sessionMode='online';c.OnlineDuelService.active=true;svc.weaponEchoes.clear();
 c.DodgeFollowupStateService.begin(e,{x:0,y:0},clock);assert.equal(svc.weaponEchoes.size,0);
 c.Training.sessionMode='training';c.OnlineDuelService.active=false;
 svc.echo(e,clock);assert.equal(svc.weaponEchoes.get(e.id)[0].snapshot.images.length,1);c.EffectSpawnService.clearAll();c.Training.active=false;
});
load('src/summons/SummonDeployService.js','SummonDeployService');
load('src/abilities/CookingService.js','CookingService');
test('추가 무기 형상·큐브 세 면·소환수 전용 목록·공용 경로 유한',()=>{
 const svc=c.ModeGearPresentationService;
 for(const name of ['shubi','kanon','clea','quri','lian','elin','dira','maisil']){
  const ch=c.CharacterDataService.compile(name),e=entity({character:ch});
  const configs=[...ch.worldEffectModules,...Object.values(ch.summons||{}).flatMap(s=>s.worldEffectModules||[])];
  for(const cfg of configs){assert.ok(c.WEAPON_IMAGE_DEFS[cfg.style]);const ctx=canvasStub();assert.equal(svc.drawImage(ctx,e,cfg,1,clock),true);assert.ok(ctx.ops.flat().filter(v=>typeof v==='number').every(Number.isFinite));}
 }
 assert.equal(c.WEAPON_IMAGE_DEFS['puzzle-cube'].paths.filter(p=>p.fill).length,27);
 assert.equal(svc.configs(entity({kind:'summon',character:intu,summonSpec:{}})).length,0);
});
test('엘린 유령 없음20%·수호/탐사 본체와 소환수 동일·칸수 제거·원격 모드',()=>{
 const ch=c.CharacterDataService.compile('elin'),owner=entity({id:'elin-owner',character:ch}),ghost=entity({id:'elin-ghost',kind:'summon',ownerId:owner.id,character:ch,summonSpec:ch.summons.spirit}),svc=c.ModeGearPresentationService,oldOwner=c.EntityService.owner;
 c.EntityService.items.set(owner.id,owner);c.EntityService.items.set(ghost.id,ghost);c.EntityService.owner=e=>e.ownerId?c.EntityService.items.get(e.ownerId):e;
 assert.equal(ch.worldGaugeModules.length,0);assert.equal(ch.summons.spirit.worldGaugeModules.length,0);
 const sample=e=>svc.sampleWeapons(e,1,clock).images;
 assert.ok(Math.abs(sample(owner)[0].sample.alpha-.2)<1e-9);assert.equal(sample(owner)[0].config.style,'spirit-shield');
 const state=c.SummonDeployService.state(owner,'spirit',true);state.active=true;
 for(const [mode,style]of [['guard','spirit-shield'],['explore','spirit-goggles']]){
  c.ModeStateService.set(owner,'spirit-mode',mode,'guard');assert.equal(sample(owner).length,1);assert.equal(sample(ghost).length,1);assert.equal(sample(owner)[0].config.style,style);assert.equal(sample(ghost)[0].config.style,style);assert.equal(sample(owner)[0].sample.alpha,.6);assert.equal(sample(ghost)[0].sample.alpha,.6);
  for(const cfg of [...ch.worldEffectModules,...ch.summons.spirit.worldEffectModules])assert.equal(cfg.motionStateKey,undefined);
 }
 const peer=entity({id:'elin-peer',character:ch,local:false});c.ModeStateService.applyRemote(peer,JSON.parse(JSON.stringify(c.ModeStateService.serialize(owner,clock))),clock);assert.equal(sample(peer)[0].config.style,'spirit-goggles');
 state.active=false;assert.ok(Math.abs(sample(owner)[0].sample.alpha-.2)<1e-9);ghost.hidden=true;assert.equal(svc.drawBehind(canvasStub(),ghost,1,clock),false);c.EntityService.owner=oldOwner;
});
test('디라 프라이팬/식재료/요리 실제 상태 및 원격 복원·요리 우선·소비 후 복귀',()=>{
 const ch=c.CharacterDataService.compile('dira'),e=entity({id:'dira-owner',character:ch}),svc=c.ModeGearPresentationService;
 const style=()=>svc.sampleWeapons(e,1,clock).images.map(x=>x.config.style).join(',');
 assert.equal(style(),'frying-pan');c.CookingService.acquire(e,2);assert.equal(style(),'loaded-pan');
 const state=c.CookingService.state(e,true);state.mealCount=3;c.CookingService.syncReady(e);assert.equal(style(),'loaded-pan');
 const peer=entity({id:'dira-peer',character:ch,local:false});c.CookingService.applyRemote(peer,JSON.parse(JSON.stringify(c.CookingService.serialize(e))));assert.equal(svc.sampleWeapons(peer,1,clock).images[0].config.style,'loaded-pan');
 state.mealCount=0;c.CookingService.syncReady(e);assert.equal(style(),'loaded-pan');c.CookingService.consumeIngredient(e,2);assert.equal(style(),'frying-pan');
});
test('메이실 실제 전달마다 가위닫힘·한 실행 중복제외·던지기 회전·원격 모션',()=>{
 const ch=c.CharacterDataService.compile('maisil'),svc=c.ModeGearPresentationService,e=entity({id:'scissors-owner',character:ch}),cfg=ch.worldEffectModules[0];
 const rotations=at=>{const ctx=canvasStub(),values=[];ctx.rotate=a=>values.push(a);svc.drawImage(ctx,e,cfg,1,at);return values;};
 const idle=rotations(clock);
 for(const key of ['lmb','rmb','counter']){const a=ch.attacks[key],ex=c.AttackExecutionService.create(e,a,0),before=c.ModeStateService.state(e,'maisil-scissor-motion')?.turns||0;c.AttackModuleService.onDelivery(e,a,0,ex);c.AttackModuleService.onDelivery(e,a,0,ex);assert.equal(c.ModeStateService.state(e,'maisil-scissor-motion').turns,before+1);assert.notDeepEqual(rotations(clock+176),idle);}
 assert.equal(c.ModeStateService.state(e,'maisil-scissor-throw').turns,1);
 const peer=entity({character:ch,local:false});c.ModeStateService.applyRemote(peer,JSON.parse(JSON.stringify(c.ModeStateService.serialize(e,clock))),clock);assert.equal(svc.weaponPose(peer,cfg,clock+176).pulse,svc.weaponPose(e,cfg,clock+176).pulse);
 assert.equal(c.WEAPON_IMAGE_DEFS['tailor-scissors'].parts.length,2);assert.equal(c.WEAPON_IMAGE_DEFS['tailor-scissors'].parts[0].pulseAngle,-c.WEAPON_IMAGE_DEFS['tailor-scissors'].parts[1].pulseAngle);
});
test('큐브/방패/프라이팬 실제 공격 전달에서만 모션·기존 쿨다운/소모 유지',()=>{
 for(const [name,key,stateKey]of [['dira','fryingPan','dira-kitchen-motion']]){
  const ch=c.CharacterDataService.compile(name),e=entity({character:ch}),cfg=ch.worldEffectModules[0],a=ch.attacks[key],svc=c.ModeGearPresentationService;
  assert.equal(c.ModeStateService.state(e,stateKey),null);const ex=c.AttackExecutionService.create(e,a,0);c.AttackModuleService.onDelivery(e,a,0,ex);c.AttackModuleService.onDelivery(e,a,0,ex);assert.equal(c.ModeStateService.state(e,stateKey).turns,1);
  if(cfg.rotationStateKey)assert.notEqual(svc.rotation(e,cfg,cfg.rotationMs,clock+150),0);else assert.notEqual(svc.weaponPose(e,cfg,clock+150).pulse,0);
 }
});
test('카논 평상시 회피이미지 유지·일반공격 추가잔향 없음',()=>{const ch=c.CharacterDataService.compile('kanon'),e=entity({character:ch}),svc=c.ModeGearPresentationService;svc.weaponEchoes.clear();for(const a of Object.values(ch.attacks)){c.AttackModuleService.onDelivery(e,a,0,c.AttackExecutionService.create(e,a,0));assert.equal(svc.sampleWeapons(e,1,clock).images.length,1);assert.equal(svc.weaponEchoes.size,0);}});
test('큐리 실제 단계0~4·CFOP 색상·상대 상태·잔향의 단계 표본 고정',()=>{
 const ch=c.CharacterDataService.compile('quri'),e=entity({character:ch,id:'cube-pattern-owner'}),svc=c.ModeGearPresentationService,names=['puzzle-cube','puzzle-cube-cross','puzzle-cube-f2l','puzzle-cube-oll','puzzle-cube-pll'];
 for(let stage=0;stage<5;stage++){
  c.ProgressStateService.apply(e,{stateKey:'quri-cube-stage',operation:'set',value:stage,max:4});const images=svc.sampleWeapons(e,1,clock).images;assert.equal(images.length,1);assert.equal(images[0].config.style,names[stage]);
  const defs=c.WEAPON_IMAGE_DEFS[names[stage]],fills=defs.paths.map(p=>p.fillColor);assert.equal(fills.length,27);if(stage===1)assert.ok([1,3,4,5,7].every(i=>fills[i]==='#bba8ed'));
  if(stage>=2){assert.ok(fills.slice(12,18).every(v=>v==='#bba8ed'));assert.ok(fills.slice(21,27).every(v=>v==='#bba8ed'));}
  if(stage>=3)assert.ok(fills.slice(0,9).every(v=>v==='#bba8ed'));if(stage===3)assert.ok(fills.slice(9,12).some(v=>v!=='#bba8ed'));if(stage===4){assert.ok(fills.slice(9,18).every(v=>v==='#bba8ed'));assert.ok(fills.slice(18,27).every(v=>v==='#bba8ed'));}
  const peer=entity({character:ch,local:false});c.ProgressStateService.applyRemote(peer,JSON.parse(JSON.stringify(c.ProgressStateService.serialize(e,clock))),clock);assert.equal(svc.sampleWeapons(peer,1,clock).images[0].config.style,names[stage]);
 }
 svc.weaponEchoes.clear();c.ProgressStateService.apply(e,{stateKey:'quri-cube-stage',operation:'set',value:1,max:4});svc.echo(e,clock);c.ProgressStateService.apply(e,{stateKey:'quri-cube-stage',operation:'set',value:4,max:4});assert.equal(svc.weaponEchoes.get(e.id)[0].snapshot.images[0].config.style,'puzzle-cube-cross');svc.weaponEchoes.clear();
});
test('디라 실제 요리 사용·소비 후에도 요리 잔향만·고정 위치/복제/만료',()=>{
 const ch=c.CharacterDataService.compile('dira'),e=entity({character:ch,id:'chef-echo-owner'}),svc=c.ModeGearPresentationService;
 c.EntityService.items.set(e.id,e);c.Training.active=true;c.Training.fx=[];svc.weaponEchoes.clear();c.ProjectileService.items=[];
 assert.equal(ch.worldEffectModules.some(v=>v.style==='cooked-meal'),false);
 const state=c.CookingService.state(e,true);state.mealCount=3;c.CookingService.syncReady(e);assert.equal(svc.weaponEchoes.size,0);
 fire(e,ch.attacks.meal);assert.equal(state.mealCount,0);assert.equal(svc.sampleWeapons(e,1,clock).images[0].config.style,'frying-pan');
 const echo=svc.weaponEchoes.get(e.id)[0],fx=c.Training.fx.find(v=>v.type==='weaponImageEcho');assert.ok(fx);assert.equal(echo.snapshot.images.length,1);assert.equal(echo.snapshot.images[0].config.style,'cooked-meal');assert.equal(echo.snapshot.images[0].sample.alpha,1);assert.equal(echo.snapshot.images[0].sample.pose.pulse,0);
 const point=echo.snapshot.x;e.x+=180;assert.equal(echo.snapshot.x,point);const ctx=canvasStub(),translations=[];ctx.translate=(...a)=>translations.push(a);svc.drawEchoes(ctx,e,1,clock+200);assert.deepEqual(translations[0],[-180,0]);
 const snap=c.EffectSpawnService.presentationSnapshot(fx,clock);svc.weaponEchoes.clear();c.EffectSpawnService.spawn(c.EffectSpawnService.restorePresentationSnapshot(snap,clock+20),{source:e});assert.equal(svc.weaponEchoes.get(e.id)[0].snapshot.images[0].config.style,'cooked-meal');assert.equal(svc.weaponEchoes.get(e.id)[0].snapshot.x,point);
 svc.drawBehind(canvasStub(),e,1,clock+700);assert.equal(svc.weaponEchoes.size,0);c.EffectSpawnService.clearAll();c.Training.active=false;
});
console.log(`PASS ${passed} weapon update regression groups`);

load('src/core/PositionMemoryService.js','PositionMemoryService');
test('리안 백업 무제한/LIFO/6초 만료·300ms 재사용',()=>{const ch=c.CharacterDataService.compile('lian'),e=entity({character:ch});for(let i=0;i<40;i++){e.x=i;c.PositionMemoryService.recordDodge(e,clock+i);}assert.equal(c.PositionMemoryService.state(e).length,40);assert.equal(c.PositionMemoryService.pop(e,'backup',1100).x,39);assert.equal(c.PositionMemoryService.prune(e,'backup',8000).length,0);assert.equal(ch.attacks.rmb.attackDelay,300);});
test('메이실/타우 실제 치명타 적중에도 무기 잔향 없음',()=>{for(const [name,key] of [['maisil','lmbCritical'],['tau','lmbCharged']]){const ch=c.CharacterDataService.compile(name),e=entity({character:ch,id:name}),t=entity({teamId:'B'}),a=ch.attacks[key],old=c.EffectSpawnService;let captured=[];c.EffectSpawnService={...old,spawn:x=>{captured.push(x);return x},shouldPresentAttack:()=>true};const ex=c.AttackExecutionService.create(e,a,0);c.AttackModuleService.onHit(e,t,a,{execution:ex},0);assert.equal(captured.filter(x=>x.type==='weaponImageEcho').length,0);assert.equal(ch.attacks.lmb.modules.some(m=>m.renderType==='weaponImageEcho'),false);c.EffectSpawnService=old;}});
test('리안 공격 알파/복원·방어 파랑·우클릭 완전회전·원격 복원',()=>{const ch=c.CharacterDataService.compile('lian'),e=entity({character:ch}),cfg=ch.worldEffectModules[0],svc=c.ModeGearPresentationService;assert.equal(svc.imageAlpha(e,cfg,clock),1);c.AttackModuleService.onDelivery(e,ch.attacks.lmb,0,c.AttackExecutionService.create(e,ch.attacks.lmb,0));assert.equal(svc.imageAlpha(e,cfg,clock),1);assert.equal(svc.imageAlpha(e,cfg,clock+500),1);c.ModeStateService.toggle(e,{stateKey:'lian-shield-block',values:['a','b']});assert.equal(svc.activeColor(e,cfg,clock),'#8ed9ff');c.AttackModuleService.afterAttack(e,ch.attacks.rmb,0,c.AttackExecutionService.create(e,ch.attacks.rmb,0));assert.equal(c.ModeStateService.state(e,'lian-shield-rotation').turns,0);assert.equal(cfg.rotationRadians,Math.PI*2);const peer=entity({character:ch});c.ModeStateService.applyRemote(peer,JSON.parse(JSON.stringify(c.ModeStateService.serialize(e,clock))),clock);assert.equal(svc.activeColor(peer,cfg,clock),'#8ed9ff');});
test('큐리 평타 고정 잔향·반격 한바퀴·공식 별도 미세모션',()=>{const ch=c.CharacterDataService.compile('quri'),e=entity({character:ch}),a=ch.attacks.lmb,old=c.EffectSpawnService;let captured=[];c.EffectSpawnService={...old,spawn:x=>{captured.push(x);return x},shouldPresentAttack:()=>true};c.AttackModuleService.afterAttack(e,a,0,c.AttackExecutionService.create(e,a,0));assert.ok(captured.some(x=>x.type==='weaponImageEcho'));assert.equal(c.ModeStateService.state(e,'quri-cube-motion'),null);assert.equal(ch.formulaSequence.inputMotion.stateKey,'quri-cube-input-motion');c.AttackModuleService.onDelivery(e,ch.attacks.counter,0,c.AttackExecutionService.create(e,ch.attacks.counter,0));assert.equal(c.ModeStateService.state(e,'quri-cube-motion').turns,1);assert.equal(ch.worldEffectModules[0].rotationRadians,Math.PI*2);c.EffectSpawnService=old;});
test('카논 회복: 소환수/봇 제외 후 같은 실행의 플레이어 타격은 회복',()=>{const ch=c.CharacterDataService.compile('kanon');for(const key of ['lmb','lmbStopped','lmbStoppedSecond']){const e=entity({character:ch,stamina:0}),a=ch.attacks[key],ex=c.AttackExecutionService.create(e,a,0);for(const kind of ['summon','trainingBot']){c.AttackModuleService.onHit(e,entity({id:kind,kind,teamId:'B'}),a,{execution:ex},0);assert.equal(e.stamina,0);}c.AttackModuleService.onHit(e,entity({id:'player',kind:'player',teamId:'B'}),a,{execution:ex},0);assert.equal(e.stamina,100);}});
load('src/abilities/FormulaSequenceConfigService.js','FormulaSequenceConfigService');
test('공식 처리 실제 핸들러: 허용 입력만 미세모션·회피 차단/원거리 제외·재생 중복 없음',()=>{const ch=c.CharacterDataService.compile('quri');for(const result of [{handled:true},{handled:true,blockedByDodge:true},{handled:false}]){const e=entity({character:ch}),old=c.FormulaSequenceService;c.FormulaSequenceService={input:()=>result};const context={source:e,targetPoint:{x:e.x,y:e.y},now:clock};c.AbilityModuleService.handlers['formula.sequence-input'](context,()=>{},{});assert.equal(!!c.ModeStateService.state(e,'quri-cube-input-motion'),result.handled&&!result.blockedByDodge);c.FormulaSequenceService=old;}});
load('src/combat/AttackGuardService.js','AttackGuardService');
test('방어 성공 실제 공용 훅·그룹 중복 없음·공격 알파와 파랑 동시에',()=>{const ch=c.CharacterDataService.compile('lian'),e=entity({character:ch}),module=ch.attacks.lmb.modules.find(m=>m.type==='attack.guard'),guard={source:e,spec:{onBlock:module.onBlock},handledBlockGroups:new Set()};assert.equal(c.AttackGuardService.registerBlockOccurrence(guard,'hit1',clock),true);assert.equal(c.AttackGuardService.registerBlockOccurrence(guard,'hit1',clock),false);assert.equal(c.ModeStateService.state(e,'lian-shield-block').turns,1);assert.equal(c.ModeGearPresentationService.imageAlpha(e,ch.worldEffectModules[0],clock),1);});
console.log('PASS '+passed+' weapon update regression groups (current)');
test('타우 같은 형상/방향/회전·손잡이 기준점·치명잔향 제거',()=>{const ch=c.CharacterDataService.compile('tau'),cfg=ch.worldEffectModules;assert.equal(cfg[0].style,cfg[1].style);assert.equal(cfg[0].angle,cfg[1].angle);assert.equal(cfg[0].rotationRadians,cfg[1].rotationRadians);assert.deepEqual(Array.from(c.WEAPON_IMAGE_DEFS[cfg[0].style].origin),[0,0]);assert.equal(ch.attacks.lmbCharged.modules.some(m=>m.renderType==='weaponImageEcho'),false);});
test('큐리2단계 십자가 유지·3/4단계에도 이전 완성칸 유지',()=>{const names=['puzzle-cube-cross','puzzle-cube-f2l','puzzle-cube-oll','puzzle-cube-pll'];for(const n of names)for(const i of [1,3,4,5,7])assert.equal(c.WEAPON_IMAGE_DEFS[n].paths[i].fillColor,'#bba8ed');for(let k=0;k<names.length-1;k++)for(let i=0;i<27;i++)if(c.WEAPON_IMAGE_DEFS[names[k]].paths[i].fillColor==='#bba8ed')assert.equal(c.WEAPON_IMAGE_DEFS[names[k+1]].paths[i].fillColor,'#bba8ed');});
c.MovementPresentationService={pushLine(){}};c.AugmentDodgeSequenceService={reset(){}};
test('카논 옛 주먹/신발 표시 상태와 모션 모듈 제거',()=>{const ch=c.CharacterDataService.compile('kanon');assert.equal(ch.worldEffectModules.length,1);for(const a of Object.values(ch.attacks))assert.equal(a.modules.some(m=>['kanon-shoe','kanon-weapon-motion'].includes(m.stateKey)),false);assert.equal(ch.dodgeFollowupState.stoppedEffects[0].duration,800);});
test('엘린 실제 평타 치유·체력최대/회복배율0 제외·유령 치유 이중 잔향/위치고정',()=>{const ch=c.CharacterDataService.compile('elin'),svc=c.ModeGearPresentationService,oldStats=c.CombatStatsService,oldOwner=c.EntityService.owner; c.CombatStatsService={current:e=>({healingMult:e.healingMult??1})};const e=entity({id:'elin-healer',character:ch}),ghost=entity({id:'elin-ghost',kind:'summon',character:ch,summonSpec:ch.summons.spirit,ownerId:e.id,teamId:'A',health:500,maxHealth:1000,x:600,y:700});c.EntityService.owner=t=>t.ownerId?c.EntityService.items.get(t.ownerId):t;c.EntityService.items.set(e.id,e);c.EntityService.items.set(ghost.id,ghost);c.Training.active=true;c.Training.fx=[];svc.weaponEchoes.clear();const a=ch.attacks.lmbHeal;
c.AttackModuleService.onHit(e,ghost,a,{execution:c.AttackExecutionService.create(e,a,0)},0);assert.equal(ghost.health,700);assert.equal(svc.weaponEchoes.get(e.id).length,1);assert.equal(svc.weaponEchoes.get(ghost.id).length,1);const fixed=svc.weaponEchoes.get(ghost.id)[0].snapshot;ghost.x+=100;assert.equal(fixed.x,600);const fx=c.Training.fx.find(x=>x.targetEntityId===ghost.id&&x.type==='weaponImageEcho');assert.ok(fx);const snapshot=c.EffectSpawnService.presentationSnapshot(fx,clock);svc.weaponEchoes.clear();c.EffectSpawnService.spawn(c.EffectSpawnService.restorePresentationSnapshot(snapshot,clock+20),{source:ghost});assert.equal(svc.weaponEchoes.get(ghost.id)[0].snapshot.x,600);
svc.weaponEchoes.clear();ghost.health=1000;c.AttackModuleService.onHit(e,ghost,a,{execution:c.AttackExecutionService.create(e,a,0)},0);assert.equal(svc.weaponEchoes.size,0);ghost.health=500;ghost.healingMult=0;c.AttackModuleService.onHit(e,ghost,a,{execution:c.AttackExecutionService.create(e,a,0)},0);assert.equal(ghost.health,500);assert.equal(svc.weaponEchoes.size,0);
ghost.healingMult=1;c.HealthService.restore(ghost,100,e);assert.equal(svc.weaponEchoes.get(ghost.id).length,1);assert.equal(svc.weaponEchoes.has(e.id),false);svc.weaponEchoes.clear();c.Training.active=false;c.CombatStatsService=oldStats;c.EntityService.owner=oldOwner;});
test('원격 치유 미러가 엘린/유령 잔향 재생성하지 않음',()=>{const ch=c.CharacterDataService.compile('elin'),e=entity({character:ch}),t=entity({kind:'summon',character:ch,summonSpec:ch.summons.spirit,health:500,maxHealth:1000,local:false}),oldStats=c.CombatStatsService,oldMode=c.Training.sessionMode;c.CombatStatsService={current:()=>({healingMult:1})};c.Training.sessionMode='online';c.Training.active=true;c.ModeGearPresentationService.weaponEchoes.clear();c.ResourceRestoreEffectService.apply({source:e,target:t,module:{resource:'health',recipient:'target',amount:100,onRestoredEffects:ch.attacks.lmbHeal.modules[1].onRestoredEffects}});assert.equal(c.ModeGearPresentationService.weaponEchoes.size,0);c.Training.sessionMode=oldMode;c.Training.active=false;c.CombatStatsService=oldStats;});
console.log('PASS '+passed+' weapon update regression groups (current137)');
test('타우 실제 치명 적중에서 무기잔향 FX/원격 전송대상 생성 안함',()=>{const ch=c.CharacterDataService.compile('tau'),e=entity({character:ch,id:'tau-no-echo'}),t=entity({teamId:'B'}),svc=c.ModeGearPresentationService;c.EntityService.items.set(e.id,e);c.Training.active=true;c.Training.fx=[];svc.weaponEchoes.clear();const a=ch.attacks.lmbCharged;c.AttackModuleService.onHit(e,t,a,{execution:c.AttackExecutionService.create(e,a,0)},0);assert.equal(c.Training.fx.some(x=>x.type==='weaponImageEcho'),false);assert.equal(svc.weaponEchoes.has(e.id),false);c.Training.active=false;});
console.log('PASS '+passed+' weapon update regression groups (current137 final)');
load('src/projectiles/ProjectileStateService.js','ProjectileStateService');
test('루뷰 망치/못 교차·투척/정지/귀환 중 망치만 숨김·회수 복원·원격 지연 상태',()=>{const ch=c.CharacterDataService.compile('ruvu'),e=entity({character:ch}),svc=c.ModeGearPresentationService,oldItems=c.ProjectileService.items,oldFind=c.ProjectileService.findByNetworkKey;c.ProjectileService.items=[];c.ProjectileService.findByNetworkKey=()=>null;const styles=()=>svc.sampleWeapons(e,1,clock).images.map(x=>x.config.style).join(',');assert.equal(styles(),'workshop-hammer,workshop-nail');assert.ok(ch.worldEffectModules[0].angle<0&&ch.worldEffectModules[1].angle>0);const p={source:e,stateKey:'primary-weapon',behavior:{returning:{phase:'outbound'}}};c.ProjectileService.items.push(p);c.ProjectileStateService.set(e,'primary-weapon',p);assert.equal(styles(),'workshop-nail');p.behavior.returning.phase='returning';assert.equal(styles(),'workshop-nail');c.ProjectileStateService.clear(p);c.ProjectileService.items=[];assert.equal(styles(),'workshop-hammer,workshop-nail');e._remoteProjectileStateKeys=new Map([['primary-weapon','pending-hammer']]);assert.equal(styles(),'workshop-nail');e._remoteProjectileStateKeys.clear();assert.equal(styles(),'workshop-hammer,workshop-nail');c.ProjectileService.items=oldItems;c.ProjectileService.findByNetworkKey=oldFind;});
test('가위 모든 여닫기 단계에서 손잡이 외곽 비겹침',()=>{const parts=c.WEAPON_IMAGE_DEFS['tailor-scissors'].parts;for(let step=0;step<=120;step++){const pulse=-.2+1.2*step/120,bounds=parts.map(p=>{const a=p.angle+p.pulseAngle*pulse,points=[];for(const cmd of p.paths[3].commands)for(let j=1;j<cmd.length;j+=2){const x=cmd[j]*(p.scaleX??1),y=cmd[j+1];points.push(x*Math.cos(a)-y*Math.sin(a));}return [Math.min(...points),Math.max(...points)];});assert.ok(bounds[0][1]<bounds[1][0],JSON.stringify({pulse,bounds}));}});
test('클레아 원형 외곽/열린 안쪽·달 절삭면·기존 모드색/회전 렌더',()=>{const d=c.WEAPON_IMAGE_DEFS['moon-crescent'];assert.deepEqual(Array.from(d.paths[0].commands[0]),['M',1.63,0]);assert.equal(d.paths[0].commands.filter(x=>x[0]==='Z').length,2);const e=entity({character:c.CharacterDataService.compile('clea')});assert.equal(c.ModeGearPresentationService.drawImage(canvasStub(),e,e.character.worldEffectModules[0],1,clock),true);});
console.log('PASS '+passed+' weapon update regression groups (current138 final)');
test('클레아 이전 공용회전 복원·대기열 제거·원격 동일',()=>{const ch=c.CharacterDataService.compile('clea'),e=entity({character:ch}),cfg=ch.worldEffectModules[0],svc=c.ModeGearPresentationService,a=ch.attacks.lmb;assert.equal(cfg.rotationMode,undefined);c.AttackModuleService.onDelivery(e,a,0,c.AttackExecutionService.create(e,a,0));clock+=100;c.AttackModuleService.onDelivery(e,a,0,c.AttackExecutionService.create(e,a,0));assert.equal(svc.rotation(e,cfg,300,clock),Math.PI*2);assert.equal(svc.rotation(e,cfg,300,clock+300),Math.PI*4);assert.equal(c.ModeStateService.state(e,cfg.rotationStateKey).rotationQueueMs,undefined);const peer=entity({character:ch});c.ModeStateService.applyRemote(peer,JSON.parse(JSON.stringify(c.ModeStateService.serialize(e,clock))),clock);assert.equal(svc.rotation(e,cfg,300,clock+150),svc.rotation(peer,cfg,300,clock+150));});
test('전체 무기 형상 중심 유한·기본위치 중앙·복수 낫 상대배치 중심 보존',()=>{for(const d of Object.values(c.WEAPON_IMAGE_DEFS)){assert.equal(d.origin.length,2);assert.ok(d.origin.every(Number.isFinite));}for(const name of Object.keys(c.CHARACTER_DATA)){const ch=c.CharacterDataService.compile(name);for(const cfg of ch.worldEffectModules||[]){if(cfg.renderType!=='weaponImage'||name==='tau')continue;assert.equal(Number(cfg.x)||0,0,name);assert.equal(Number(cfg.y)||0,0,name);const ctx=canvasStub(),translations=[];ctx.translate=(...v)=>translations.push(v);c.ModeGearPresentationService.drawImage(ctx,entity({character:ch}),cfg,1,clock);assert.deepEqual(translations[0],[0,0]);const d=c.WEAPON_IMAGE_DEFS[cfg.style],size=20*(cfg.scale||1.5);assert.ok(translations.some(v=>Math.abs(v[0]+d.origin[0]*size)<1e-9&&Math.abs(v[1]+d.origin[1]*size)<1e-9));}for(const summon of Object.values(ch.summons||{}))for(const cfg of summon.worldEffectModules||[]){assert.equal(Number(cfg.x)||0,0);assert.equal(Number(cfg.y)||0,0);}}const tau=c.CharacterDataService.compile('tau').worldEffectModules;assert.equal(tau[0].x+tau[1].x,0);assert.equal(tau[0].y+tau[1].y,0);});
test('루뷰 현대망치/못 같은 배율 및 길이·하츠 실제 공격만 붓 회전·산탄 중복없음',()=>{const ru=c.CharacterDataService.compile('ruvu');assert.equal(ru.worldEffectModules[0].scale,ru.worldEffectModules[1].scale);const ch=c.CharacterDataService.compile('hatsuhats'),e=entity({character:ch}),cfg=ch.worldEffectModules[0];assert.equal(cfg.style,'artists-brush');assert.equal(c.ModeStateService.state(e,cfg.rotationStateKey),null);const a=ch.attacks.lmb,ex=c.AttackExecutionService.create(e,a,0);for(let n=0;n<6;n++)c.AttackModuleService.onDelivery(e,a,0,ex);assert.equal(c.ModeStateService.state(e,cfg.rotationStateKey).turns,1);const ca=ch.attacks.counter;c.AttackModuleService.onDelivery(e,ca,0,c.AttackExecutionService.create(e,ca,0));assert.equal(c.ModeStateService.state(e,cfg.rotationStateKey).turns,2);assert.ok(c.ModeGearPresentationService.rotation(e,cfg,360,clock+100)>0);});
console.log('PASS '+passed+' weapon update regression groups (current139 final)');
test('루뷰 실제 평타/반격마다 망치 한바퀴·못 정지·선딜 전 회전없음',()=>{const ch=c.CharacterDataService.compile('ruvu'),e=entity({character:ch});for(const cfg of ch.worldEffectModules){assert.equal(cfg.motion,undefined);assert.ok(Math.abs(c.ModeGearPresentationService.rotation(e,cfg,400,clock))<1e-9);}for(const key of ['lmb','counter']){const a=ch.attacks[key],ex=c.AttackExecutionService.create(e,a,0);c.AttackModuleService.onDelivery(e,a,0,ex);c.AttackModuleService.onDelivery(e,a,0,ex);}assert.equal(c.ModeGearPresentationService.rotation(e,ch.worldEffectModules[0],400,clock+400),-Math.PI*4);assert.equal(ch.worldEffectModules[1].rotationStateKey,undefined);});
test('하츠 스킬 실제 실행 후 회전·평타/반격 시계방향',()=>{const ch=c.CharacterDataService.compile('hatsuhats'),e=entity({character:ch}),a=ch.attacks.rmb,ex=c.AttackExecutionService.create(e,a,0),cfg=ch.worldEffectModules[0];assert.equal(c.ModeStateService.state(e,cfg.rotationStateKey),null);c.AttackModuleService.afterAttack(e,a,0,ex);assert.equal(c.ModeStateService.state(e,cfg.rotationStateKey).turns,1);assert.ok(c.ModeGearPresentationService.rotation(e,cfg,360,clock+100)>0);});
load('src/abilities/FormulaSequenceService.js','FormulaSequenceService');
test('큐리 실제 오입력만 빨강·550ms 색 복원·반복/원격·회피차단 제외',()=>{const ch=c.CharacterDataService.compile('quri'),e=entity({character:ch}),svc=c.ModeGearPresentationService,cfg=ch.worldEffectModules[0],state=c.FormulaSequenceService.state(e,{},true),expected=c.FormulaSequenceService.expanded(state.tokens)[0],wrong=expected==='L'?'R':'L';const input=button=>c.AbilityModuleService.handlers['formula.sequence-input']({source:e,targetPoint:{x:e.x,y:e.y},now:clock},()=>{},{button});input(expected);assert.equal(c.ModeStateService.state(e,'quri-cube-input-error'),null);state.progress=0;input(wrong);assert.equal(state.mistakes,1);assert.equal(svc.activityTint(e,cfg,clock).amount,1);assert.equal(svc.activeColor(e,cfg,clock),'#ff5966');assert.ok(Math.abs(svc.activityTint(e,cfg,clock+325).amount-.5)<1e-9);assert.equal(svc.activeColor(e,cfg,clock+550),null);const peer=entity({character:ch});c.ModeStateService.applyRemote(peer,JSON.parse(JSON.stringify(c.ModeStateService.serialize(e,clock))),clock);assert.equal(svc.activityTint(peer,cfg,clock+325).amount,.5);clock+=200;input(wrong);assert.equal(svc.activityTint(e,cfg,clock).amount,1);const count=c.ModeStateService.state(e,'quri-cube-input-error').turns;e.dodgeUntil=clock+500;c.AbilityModuleService.handlers['formula.sequence-input']({source:e,targetPoint:{x:e.x,y:e.y},now:clock},()=>{},{button:wrong,blockWhileDodging:true});assert.equal(c.ModeStateService.state(e,'quri-cube-input-error').turns,count);});
console.log('PASS '+passed+' weapon update regression groups (current140 final)');
test('공용 무기면 현재 캐릭터색 동기화·명암/특수색/로온 과육 팔레트 보존',()=>{const ch=c.CharacterDataService.compile('maisil'),cfg=ch.worldEffectModules[0],svc=c.ModeGearPresentationService;assert.equal(cfg.angle,-.48);const e=entity({character:ch});const fill=()=>{let values=[],ctx=canvasStub();ctx.fill=()=>values.push(ctx.fillStyle);svc.drawImage(ctx,e,cfg,1,clock);return values;};const gold=fill();e.character={...ch,color:'#00ccff'};const blue=fill();assert.notDeepEqual(gold,blue);const pal=svc.palette(e,cfg,clock);assert.equal(pal.base,'#00ccff');assert.equal(pal.edge,c.ColorService.brighten('#00ccff',.65));assert.ok(new Set(blue).size>1);const roon=c.CharacterDataService.compile('roon');assert.ok(roon.worldEffectModules.every(x=>x.preservePalette));});
test('베르 실제 발사만 무기전환/항상100%·권총/포/폭탄·산탄/원격',()=>{const ch=c.CharacterDataService.compile('veleu'),e=entity({character:ch}),svc=c.ModeGearPresentationService;for(const [key,style]of [['lmb','chocolate-pistols'],['rmb','chocolate-bazooka'],['counter','chocolate-bomb']]){const before=svc.sampleWeapons(e,1,clock).images[0];assert.equal(before.sample.alpha,1);const a=ch.attacks[key],ex=c.AttackExecutionService.create(e,a,0);c.AttackModuleService.onDelivery(e,a,0,ex);c.AttackModuleService.onDelivery(e,a,0,ex);const images=svc.sampleWeapons(e,1,clock).images;assert.equal(images.length,1);assert.equal(images[0].config.style,style);assert.equal(images[0].sample.alpha,1);if(key!=='lmb')assert.equal(c.ModeStateService.state(e,images[0].config.motionStateKey).turns,1);assert.equal(svc.imageAlpha(e,images[0].config,clock+550),1);if(key!=='lmb')assert.ok(svc.weaponPose(e,images[0].config,clock+190).pulse>.1);const peer=entity({character:ch,local:false});c.ModeStateService.applyRemote(peer,JSON.parse(JSON.stringify(c.ModeStateService.serialize(e,clock))),clock);assert.equal(svc.sampleWeapons(peer,1,clock).images[0].config.style,style);clock+=600;}});
console.log('PASS '+passed+' weapon update regression groups (current141 final)');

test('베르 일시무기800ms 뒤 쌍권총·재사용 노랑/복귀 재시작·원격 동일',()=>{const ch=c.CharacterDataService.compile('veleu'),e=entity({character:ch}),svc=c.ModeGearPresentationService;const style=(x,t)=>svc.sampleWeapons(x,1,t).images.map(i=>i.config.style).join(',');assert.equal(style(e,clock),'chocolate-pistols');const a=ch.attacks.rmb;c.AttackModuleService.onDelivery(e,a,0,c.AttackExecutionService.create(e,a,0));assert.equal(style(e,clock+799),'chocolate-bazooka');assert.equal(style(e,clock+800),'chocolate-pistols');clock+=600;c.AttackModuleService.afterAttack(e,ch.attacks.rmbBoost,0,c.AttackExecutionService.create(e,ch.attacks.rmbBoost,0));const cfg=ch.worldEffectModules[1];assert.equal(svc.activeColor(e,cfg,clock),'#ffe13c');assert.ok(Math.abs(svc.activityTint(e,cfg,clock+225).amount-.5)<1e-9);assert.equal(svc.activeColor(e,cfg,clock+350),null);assert.equal(style(e,clock+799),'chocolate-bazooka');const peer=entity({character:ch});c.ModeStateService.applyRemote(peer,JSON.parse(JSON.stringify(c.ModeStateService.serialize(e,clock))),clock);assert.equal(style(peer,clock+799),style(e,clock+799));assert.equal(style(peer,clock+800),'chocolate-pistols');assert.deepEqual(svc.activityTint(peer,cfg,clock+225),svc.activityTint(e,cfg,clock+225));});
console.log('PASS '+passed+' weapon update regression groups (current142 final)');

test('카논/베르 공용800ms·신발복귀/무기강조·스야 손잡이 기준·헤브100피해/탄속3',()=>{const k=c.CharacterDataService.compile('kanon'),v=c.CharacterDataService.compile('veleu'),svc=c.ModeGearPresentationService,e=entity({character:k});assert.equal(k.weaponImageDuration,c.CHARACTER_RULES.weaponPresentation.transientMs);assert.equal(v.weaponImageDuration,k.weaponImageDuration);assert.equal(k.worldEffectModules[0].style,'dodge-slip');assert.equal(k.dodgeFollowupState.stoppedEffects[0].duration,800);assert.equal(k.worldEffectModules.length,1);assert.deepEqual(Array.from(c.WEAPON_IMAGE_DEFS['frost-scythe'].origin),[0,0]);const h=c.CharacterDataService.compile('hab');assert.equal(h.baseDamage*h.attacks.counter.damageRatio,100);assert.equal(h.attacks.counter.modules[0].speed,12);for(const cfg of v.worldEffectModules)assert.equal(svc.imageAlpha(entity({character:v}),cfg,clock),1);assert.ok(v.worldEffectModules[0].angle<0&&v.worldEffectModules[0].partMotions.every(m=>m.rotation<0));assert.ok(v.worldEffectModules[1].angle<0&&v.worldEffectModules[1].motion.rotation<0);});
console.log('PASS '+passed+' weapon update regression groups (current143 final)');

test('클레아 달그림자 유지 소환수/봇 제외·같은공격 플레이어 적중 가능',()=>{const ch=c.CharacterDataService.compile('clea');for(const a of Object.values(ch.attacks)){if(!a.modules.some(m=>m.type==='state.window'&&m.when==='on-hit'&&m.stateKey==='clea-moon-shadow'))continue;const e=entity({character:ch}),ex=c.AttackExecutionService.create(e,a,0);c.TimedActionStateService.open(e,{stateKey:'clea-moon-shadow',duration:100},clock);for(const kind of ['summon','trainingBot']){c.AttackModuleService.onHit(e,entity({id:kind,kind,teamId:'B'}),a,{execution:ex},0);assert.equal(e.actionState.get('clea-moon-shadow').expiresAt,clock+100);}c.AttackModuleService.onHit(e,entity({id:'player',kind:'player',teamId:'B'}),a,{execution:ex},0);assert.ok(e.actionState.get('clea-moon-shadow').expiresAt>clock+101);}});
console.log('PASS '+passed+' weapon update regression groups (current144 final)');
test('엘린 반격 실제 교환 후 수호/탐사 모드 그대로·모드 원격복원',()=>{const ch=c.CharacterDataService.compile('elin');for(const mode of ['guard','explore']){const e=entity({id:'elin-swap-'+mode,character:ch,x:100,y:120}),ghost=entity({id:c.SummonDeployService.entityId(e,'spirit'),character:ch,kind:'summon',summonSpec:ch.summons.spirit,x:400,y:420});c.EntityService.items.set(ghost.id,ghost);c.SummonDeployService.state(e,'spirit',true).active=true;c.ModeStateService.set(e,'spirit-mode',mode,'guard');const a=ch.attacks.counterExplosion;c.AttackModuleService.afterAttack(e,a,0,c.AttackExecutionService.create(e,a,0));assert.equal(e.x,400);assert.equal(ghost.x,100);assert.equal(c.ModeStateService.current(e,'spirit-mode','guard'),mode);const peer=entity({character:ch});c.ModeStateService.applyRemote(peer,JSON.parse(JSON.stringify(c.ModeStateService.serialize(e,clock))),clock);assert.equal(c.ModeStateService.current(peer,'spirit-mode','guard'),mode);c.EntityService.items.delete(ghost.id);}});
test('레비나 삼지창 투척/귀환/원격지연 동안 숨김·회수 후 복원',()=>{const ch=c.CharacterDataService.compile('levina'),e=entity({character:ch}),svc=c.ModeGearPresentationService,oldItems=c.ProjectileService.items,oldFind=c.ProjectileService.findByNetworkKey;c.ProjectileService.items=[];c.ProjectileService.findByNetworkKey=()=>null;const count=()=>svc.sampleWeapons(e,1,clock).images.length;assert.equal(count(),1);const p={source:e,stateKey:'levina-spear',behavior:{returning:{phase:'outbound'}}};c.ProjectileService.items.push(p);c.ProjectileStateService.set(e,'levina-spear',p);assert.equal(count(),0);p.behavior.returning.phase='returning';assert.equal(count(),0);c.ProjectileStateService.clear(p);c.ProjectileService.items=[];assert.equal(count(),1);e._remoteProjectileStateKeys=new Map([['levina-spear','pending-spear']]);assert.equal(count(),0);e._remoteProjectileStateKeys.clear();assert.equal(count(),1);c.ProjectileService.items=oldItems;c.ProjectileService.findByNetworkKey=oldFind;});
console.log('PASS '+passed+' weapon update regression groups (current145 final)');

test('카논 실제 공격 시계 회전·같은실행중복제외·원격동일',()=>{const ch=c.CharacterDataService.compile('kanon'),svc=c.ModeGearPresentationService,cfg=ch.worldEffectModules[0],e=entity({character:ch});for(const key of ['lmb','rmb','counter']){const a=ch.attacks[key],ex=c.AttackExecutionService.create(e,a,0);c.AttackModuleService.onDelivery(e,a,0,ex);c.AttackModuleService.onDelivery(e,a,0,ex);}assert.equal(c.ModeStateService.state(e,cfg.rotationStateKey).turns,3);assert.equal(svc.rotation(e,cfg,350,clock+350),Math.PI*6);});
test('리안 불투명/평타반격 시계/스킬반시계·전달중복제외',()=>{const ch=c.CharacterDataService.compile('lian'),e=entity({character:ch}),cfg=ch.worldEffectModules[0];assert.equal(c.ModeGearPresentationService.imageAlpha(e,cfg,clock),1);for(const key of ['lmb','counter']){const a=ch.attacks[key],ex=c.AttackExecutionService.create(e,a,0);c.AttackModuleService.onDelivery(e,a,0,ex);c.AttackModuleService.onDelivery(e,a,0,ex);}assert.equal(c.ModeStateService.state(e,cfg.rotationStateKey).turns,2);c.AttackModuleService.afterAttack(e,ch.attacks.rmb,0,c.AttackExecutionService.create(e,ch.attacks.rmb,0));assert.equal(c.ModeStateService.state(e,cfg.rotationStateKey).turns,1);});
test('프릴 평타 좌우 회전/찌르기와 스킬4타 각 회전·실행중복/원격',()=>{const ch=c.CharacterDataService.compile('prill'),e=entity({character:ch}),cfg=ch.worldEffectModules[0];for(const [key,turn] of [['lmbSwingLeft',1],['lmbSwingRight',0]]){const a=ch.attacks[key],ex=c.AttackExecutionService.create(e,a,0);c.AttackModuleService.onDelivery(e,a,0,ex);c.AttackModuleService.onDelivery(e,a,0,ex);assert.equal(c.ModeStateService.state(e,cfg.rotationStateKey).turns,turn);}const a=ch.attacks.lmbThrust;c.AttackModuleService.onDelivery(e,a,0,c.AttackExecutionService.create(e,a,0));assert.equal(c.ModeStateService.state(e,cfg.motionStateKey).turns,1);for(let i=0;i<4;i++)c.AttackModuleService.afterAttack(e,ch.attacks.rmbTick,0,c.AttackExecutionService.create(e,ch.attacks.rmbTick,0));assert.equal(c.ModeStateService.state(e,cfg.rotationStateKey).turns,4);const peer=entity({character:ch});c.ModeStateService.applyRemote(peer,JSON.parse(JSON.stringify(c.ModeStateService.serialize(e,clock))),clock);assert.equal(c.ModeGearPresentationService.rotation(peer,cfg,320,clock+160),c.ModeGearPresentationService.rotation(e,cfg,320,clock+160));});
console.log('PASS '+passed+' weapon update regression groups (current146 final)');

test('베르 탄별 좌우 발사와 뒤앞뒤/앞뒤앞 개별모션·420ms복원·원격/표본고정',()=>{const ch=c.CharacterDataService.compile('veleu'),cfg=ch.worldEffectModules[0],svc=c.ModeGearPresentationService,e=entity({character:ch});for(const pattern of [[1,-1,1],[-1,1,-1]]){e.actionState.clear();for(let i=0;i<3;i++){const side=pattern[i];c.AttackModuleService.onProjectileShot(e,ch.attacks.lmb,side*10);const expected=side===1?0:1,snap=svc.sampleImage(e,cfg,clock+30);assert.ok(Math.abs(snap.sample.partPoses[expected].pulse)>0);assert.equal(c.ModeStateService.state(e,cfg.partMotions[expected].motionStateKey).changedAt,clock);const frozen=snap.sample.partPoses[expected].pulse;const peer=entity({character:ch});c.ModeStateService.applyRemote(peer,JSON.parse(JSON.stringify(c.ModeStateService.serialize(e,clock))),clock);assert.equal(svc.sampleImage(peer,cfg,clock+30).sample.partPoses[expected].pulse,frozen);svc.sampleImage(e,cfg,clock+151);assert.equal(snap.sample.partPoses[expected].pulse,frozen);clock+=80;}}});
test('리안 회피 연계평타 실제 실행 시 시계회전',()=>{const ch=c.CharacterDataService.compile('lian'),e=entity({character:ch}),cfg=ch.worldEffectModules[0],a=ch.attacks.shieldDash;c.AttackModuleService.afterAttack(e,a,0,c.AttackExecutionService.create(e,a,0));assert.equal(c.ModeStateService.state(e,cfg.rotationStateKey).turns,1);});
console.log('PASS '+passed+' weapon update regression groups (current147 final)');
test('코녕 마시멜로꼬치 평타/스킬 실제전달 찌르기·반격1회전·모드원격',()=>{const ch=c.CharacterDataService.compile('konyeong'),e=entity({character:ch}),cfg=ch.worldEffectModules[0],svc=c.ModeGearPresentationService;assert.equal(cfg.style,'marshmallow-skewer');for(const key of ['lmb','rmbImpact']){const a=ch.attacks[key],ex=c.AttackExecutionService.create(e,a,0);c.AttackModuleService.onDelivery(e,a,0,ex);c.AttackModuleService.onDelivery(e,a,0,ex);}assert.equal(c.ModeStateService.state(e,cfg.motionStateKey).turns,2);assert.ok(svc.weaponPose(e,cfg,clock+185).pulse>.5);const a=ch.attacks.counter;c.AttackModuleService.onDelivery(e,a,0,c.AttackExecutionService.create(e,a,0));assert.equal(svc.rotation(e,cfg,380,clock+380),Math.PI*2);const peer=entity({character:ch});c.ModeStateService.applyRemote(peer,JSON.parse(JSON.stringify(c.ModeStateService.serialize(e,clock))),clock);assert.equal(svc.weaponPose(peer,cfg,clock+185).pulse,svc.weaponPose(e,cfg,clock+185).pulse);});
console.log('PASS '+passed+' weapon update regression groups (current149 final)');

test('메이실 절삭 급가속/짧은 정지/복원·원격·표본 고정',()=>{const ch=c.CharacterDataService.compile('maisil'),e=entity({character:ch}),cfg=ch.worldEffectModules[0],svc=c.ModeGearPresentationService;assert.equal(svc.weaponPose(e,cfg,clock).pulse,0);const a=ch.attacks.lmb,ex=c.AttackExecutionService.create(e,a,0);c.AttackModuleService.onDelivery(e,a,0,ex);c.AttackModuleService.onDelivery(e,a,0,ex);assert.equal(c.ModeStateService.state(e,cfg.motionStateKey).turns,1);assert.ok(svc.weaponPose(e,cfg,clock+25.2).pulse<0);assert.ok(svc.weaponPose(e,cfg,clock+50).pulse<.1);assert.equal(svc.weaponPose(e,cfg,clock+72).pulse,1);assert.equal(svc.weaponPose(e,cfg,clock+100).pulse,1);const snap=svc.sampleImage(e,cfg,clock+100);assert.ok(svc.weaponPose(e,cfg,clock+220).pulse>0);assert.equal(svc.weaponPose(e,cfg,clock+360).pulse,0);assert.equal(snap.sample.pose.pulse,1);const peer=entity({character:ch});c.ModeStateService.applyRemote(peer,JSON.parse(JSON.stringify(c.ModeStateService.serialize(e,clock))),clock);for(const dt of [25,50,72,100,220,360])assert.equal(svc.weaponPose(peer,cfg,clock+dt).pulse,svc.weaponPose(e,cfg,clock+dt).pulse);});
console.log('PASS '+passed+' weapon update regression groups (current151 final)');

load('src/projectiles/ScriptedProjectileMotionService.js','ScriptedProjectileMotionService');
test('엘린 유령 최초1000/파괴후 복구1000·최대체력 참조',()=>{const ch=c.CharacterDataService.compile('elin'),e=entity({character:ch}),spec=ch.summons.spirit,state=c.SummonDeployService.state(e,'spirit',true);assert.equal(state.health,1000);assert.equal(spec.respawnHealth,spec.maxHealth);state.health=0;state.destroyedUntil=clock+7000;clock+=7000;c.SummonDeployService.updateLifecycle(e,'spirit',state,spec,clock);assert.equal(state.health,1000);assert.equal(state.destroyedUntil,0);});
test('디라 음식 원격 afterAttack에서 자기섭취 호/아군투척·원격 소비없음',()=>{const ch=c.CharacterDataService.compile('dira'),oldPS=c.ProjectileService,oldState=c.ProjectileStateService;let arrivals=[];const off=c.GameEvents.on('scripted-projectile-arrived',ev=>arrivals.push(ev));const scripted=vm.runInNewContext(fs.readFileSync(path.join(root,'src/projectiles/ScriptedProjectileMotionService.js'),'utf8')+';ScriptedProjectileMotionService',{performance:{now:()=>clock},EntityService:c.EntityService,GameEvents:c.GameEvents,ProjectileStateService:{remove:p=>{p.removed=true;}}});for(const local of [true,false]){const e=entity({id:'meal-'+local,character:ch,local,x:10,y:30});c.EntityService.items.set(e.id,e);const state=c.CookingService.state(e,true);state.mealCount=4;const ex=c.AttackExecutionService.create(e,ch.attacks.meal,0);ex.cookingMealCount=4;ex.targetEntityId=e.id;const p={source:e,attack:ch.attacks.meal,volley:{execution:ex},x:e.x,y:e.y};c.ProjectileService={...oldPS,items:[p]};c.AttackModuleService.afterAttack(e,ch.attacks.meal,0,ex);assert.equal(state.mealCount,local?0:4);assert.equal(p.scriptedMotion.mode,'anchored-arc');assert.equal(p.radius,c.CookingService.mealProjectileRadius(e,4));assert.equal(p.collisionTargets,false);scripted.update(p,1,clock+260);assert.equal(p.y,e.y-96);e.x+=20;e.y+=10;scripted.update(p,1,clock+390);assert.equal(p.x,e.x);assert.equal(p.y,e.y-72);scripted.update(p,1,clock+520);assert.equal(p.removed,true);const allyEx=c.AttackExecutionService.create(e,ch.attacks.meal,0);allyEx.cookingMealCount=4;allyEx.targetEntityId='ally';const allyP={source:e,attack:ch.attacks.meal,volley:{execution:allyEx}};c.ProjectileService.items=[allyP];c.AttackModuleService.afterAttack(e,ch.attacks.meal,0,allyEx);assert.equal(allyP.scriptedMotion,undefined);assert.equal(allyP.cookingMealMeta.count,4);c.EntityService.items.delete(e.id);}assert.equal(arrivals.length,2);if(typeof off==='function')off();c.ProjectileService=oldPS;c.ProjectileStateService=oldState;});
console.log('PASS '+passed+' weapon update regression groups (current152 final)');

test('라임 반격 착탄범위 공용 무력화넉백·방향/거리/기존장판 유지',()=>{const ch=c.CharacterDataService.compile('lime'),e=entity({character:ch}),a=ch.attacks.stickyField,target=entity({id:'lime-enemy',teamId:'B',x:450,y:500}),old=c.NeutralizingKnockbackService;let calls=[];c.NeutralizingKnockbackService={start:args=>{calls.push(args);return true;}};const ex=c.AttackExecutionService.create(e,a,0);c.AttackExecutionService.setImpactOrigin(ex,{mode:'point',x:400,y:500});c.AttackModuleService.onHit(e,target,a,{execution:ex},0,{type:'area',origin:{x:400,y:500}});assert.equal(calls.length,1);assert.equal(calls[0].target,target);assert.equal(calls[0].distance,55);assert.equal(calls[0].speed,8);assert.equal(calls[0].angle,0);assert.equal(a.modules[2].type,'field.area');assert.equal(a.modules[2].duration,4000);c.NeutralizingKnockbackService=old;});
test('전체62명 반격의 실제 타격/대체 공격: 이동제한CC 또는 무력화넉백',()=>{const valid=m=>m?.type==='movement.neutralize-knockback'||m?.type==='movement.pull'||m?.type==='status.apply'&&['stun','bind','freeze','sleep','neutralize','discharge'].includes(m.status);let checked=0;for(const id of Object.keys(c.CHARACTER_DATA)){const ch=c.CharacterDataService.compile(id),roots=new Map();for(const ab of Object.values(ch.abilities)){const walk=o=>{if(!o||typeof o!=='object')return;if(o.type==='counter.execute'){const ref=Object.values(ch.attacks).find(a=>a.id===o.ccRefAttackId),cc=ref?.modules.find(valid)||o.cc;roots.set(ab.attackId,cc);if(o.alternateWhen)roots.set(o.alternateWhen.attackId,o.alternateWhen.cc||cc);}for(const v of Object.values(o))walk(v);};walk(ab);}for(const [key,a]of Object.entries(ch.attacks)){if(!(a.tags||[]).includes('반격')||!(a.damageRatio>0)||a.effectsOnly)continue;const p=a.modules.find(m=>/delivery.*projectile/.test(m.type));if(p?.damageOnTravel===false)continue;assert.ok(a.modules.some(valid)||valid(roots.get(a.id)),id+':'+key);checked++;}}assert.ok(checked>=60);});
test('보완5개 연결반격 실제 onHit 공용무력화넉백 호출·장판 반복',()=>{const old=c.NeutralizingKnockbackService;let calls=[];c.NeutralizingKnockbackService={start:args=>{calls.push(args);return true;}};for(const [id,key,repeat]of [['maisil','counterReturn',true],['sherina','counterEchoTick',true],['lime','stickyTick',true],['quri','counterExplosion',false],['xianelli','counterDagger',false]]){const ch=c.CharacterDataService.compile(id),e=entity({character:ch}),target=entity({id:'policy-enemy',teamId:'B',x:450,y:500}),a=ch.attacks[key],ex=c.AttackExecutionService.create(e,a,0);const before=calls.length;c.AttackModuleService.onHit(e,target,a,{execution:ex},0,{type:'area',origin:{x:400,y:500}});assert.equal(calls.length,before+1,id);assert.equal(a.modules.find(m=>m.type==='movement.neutralize-knockback').oncePerExecution,!repeat);}c.NeutralizingKnockbackService=old;});
test('타다타 비둔화 대상은 무력화넉백/둔화 대상은 기존속박·참조 유지',()=>{const ch=c.CharacterDataService.compile('tadta'),a=ch.attacks.counter,e=entity({character:ch}),old=c.NeutralizingKnockbackService;let calls=[];c.NeutralizingKnockbackService={start:args=>{calls.push(args);return true;}};const plain=entity({id:'tadta-plain',teamId:'B'});c.AttackModuleService.onHit(e,plain,a,{execution:c.AttackExecutionService.create(e,a,0)},0,{type:'area'});assert.equal(calls.length,1);const slowed=entity({id:'tadta-slow',teamId:'B'});slowed.statuses.set('slow',[{end:clock+3000}]);c.AttackModuleService.onHit(e,slowed,a,{execution:c.AttackExecutionService.create(e,a,0)},0,{type:'area'});assert.equal(calls.length,1);assert.equal(burns.at(-1).type,'bind');assert.equal(ch.abilities.counter.trigger.modules[0].cc.duration,1000);c.NeutralizingKnockbackService=old;});
console.log('PASS '+passed+' weapon update regression groups (current157 final)');
test('큐리5단계 큐브25%확대·펠루나 실제4평타망치질/반격회전·원격복원',()=>{const q=c.CharacterDataService.compile('quri');for(const cfg of q.worldEffectModules)assert.equal(cfg.scale,2);const ch=c.CharacterDataService.compile('peluna'),cfg=ch.worldEffectModules[0],e=entity({character:ch}),svc=c.ModeGearPresentationService;assert.equal(cfg.style,'forge-hammer');assert.ok(c.WEAPON_IMAGE_DEFS[cfg.style]);assert.equal(ch.summons.anvil.fieldArea.duration,Infinity);for(const key of ['lmb','lmbStage1','lmbStage2','lmbStage3']){const a=ch.attacks[key],ex=c.AttackExecutionService.create(e,a,0);c.AttackModuleService.onDelivery(e,a,0,ex);c.AttackModuleService.onDelivery(e,a,0,ex);}assert.equal(c.ModeStateService.state(e,cfg.rotationStateKey).turns,4);for(const key of ['counter','counterStage3'])c.AttackModuleService.onDelivery(e,ch.attacks[key],0,c.AttackExecutionService.create(e,ch.attacks[key],0));assert.equal(c.ModeStateService.state(e,cfg.rotationStateKey).turns,6);const peer=entity({character:ch});c.ModeStateService.applyRemote(peer,JSON.parse(JSON.stringify(c.ModeStateService.serialize(e,clock))),clock);assert.equal(svc.rotation(peer,cfg,400,clock+200),svc.rotation(e,cfg,400,clock+200));});
console.log('PASS '+passed+' weapon update regression groups (current158 final)');

test('펠루나 평타스킬반격7종시계회전/15%축소/3단계색 참조·코녕발동전링 제거',()=>{const ch=c.CharacterDataService.compile('peluna'),cfg=ch.worldEffectModules[0],e=entity({character:ch}),svc=c.ModeGearPresentationService;assert.equal(cfg.scale,1.7);assert.equal(cfg.motionStateKey,undefined);for(const key of ['lmb','lmbStage1','lmbStage2','lmbStage3','rmb','counter','counterStage3']){const a=ch.attacks[key];c.AttackModuleService.onDelivery(e,a,0,c.AttackExecutionService.create(e,a,0));}assert.equal(c.ModeStateService.state(e,cfg.rotationStateKey).turns,7);assert.equal(cfg.rotationRadians,Math.PI*2);for(const value of [0,6000,6001,9000]){c.ProgressStateService.apply(e,{stateKey:'peluna-forge-time',operation:'set',value,max:9000});assert.equal(svc.activeColor(e,cfg,clock),value>6000?ch.attacks.lmbStage3.modules[0].hitColor:null);}const k=c.CharacterDataService.compile('konyeong');assert.equal(k.abilities.rmb.trigger.modules.some(m=>m.type==='effect.spawn'&&m.renderType==='areaCircle'),false);assert.ok(k.abilities.rmb.trigger.modules.some(m=>m.type==='timing.delay'&&m.duration===300));});
test('펠루나 교차2망치 반대회전·동일단계색·원격',()=>{const ch=c.CharacterDataService.compile('peluna'),e=entity({character:ch}),[a,b]=ch.worldEffectModules,svc=c.ModeGearPresentationService;assert.equal(ch.worldEffectModules.length,2);assert.equal(a.angle,.55);assert.equal(b.angle,-.85);assert.equal(a.rotationRadians,-b.rotationRadians);assert.equal(a.scale,b.scale);const atk=ch.attacks.rmb;c.AttackModuleService.onDelivery(e,atk,0,c.AttackExecutionService.create(e,atk,0));for(const dt of [100,200,400])assert.equal(svc.rotation(e,a,400,clock+dt),-svc.rotation(e,b,400,clock+dt));c.ProgressStateService.apply(e,{stateKey:'peluna-forge-time',operation:'set',value:9000,max:9000});assert.equal(svc.activeColor(e,a,clock),svc.activeColor(e,b,clock));const peer=entity({character:ch});c.ModeStateService.applyRemote(peer,JSON.parse(JSON.stringify(c.ModeStateService.serialize(e,clock))),clock);assert.equal(svc.rotation(peer,b,400,clock+100),svc.rotation(e,b,400,clock+100));});
test('펠루나 추가망치 공용parts 좌우반전·기존반대회전 유지',()=>{const ch=c.CharacterDataService.compile('peluna'),[a,b]=ch.worldEffectModules,d=c.WEAPON_IMAGE_DEFS[b.style];assert.equal(a.style,'forge-hammer');assert.equal(b.style,'forge-hammer-mirrored');assert.equal(d.parts[0].scaleX,-1);assert.notDeepEqual(d.parts[0].paths,c.WEAPON_IMAGE_DEFS[a.style].paths);const bounds=paths=>paths.flatMap(p=>p.points||[]).reduce((v,p)=>Math.max(v,Math.abs(p[0]),Math.abs(p[1])),0);assert.ok(bounds(d.parts[0].paths)<bounds(c.WEAPON_IMAGE_DEFS[a.style].paths)*.7);assert.equal(a.rotationRadians,-b.rotationRadians);});
