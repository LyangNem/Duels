/* Actual formation gestures, camera templates, manifest delivery and public miniature. VM, not WebRTC. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');let now=1000,mouse={x:0,y:0},zoom=1,executions=[];
const c=vm.createContext({console,Map,Set,WeakMap,Math,performance:{now:()=>now},EMPTY_RUNTIME_ITEMS:[]});
function load(p,n){vm.runInContext(fs.readFileSync(path.join(root,p),'utf8')+';globalThis.'+n+'='+n,c)}
load('src/combat/AttackVisualStyle.js','AttackVisualStyle');
for(const n of ['characterValue','characterCount','characterSum','characterProduct','freezeCharacterData','CHARACTER_RULES'])load('src/data/'+n+'.js',n);
c.CHARACTER_DATA={tinya:vm.runInContext('('+fs.readFileSync(path.join(root,'src/data/characters/tinya.js'),'utf8')+')',c)};load('src/data/CharacterDataService.js','CharacterDataService');const ch=c.CharacterDataService.compile('tinya');
c.GAME_DATA={canvas:{width:1000,height:800}};c.EntitySimulationAuthorityService={isLocal:e=>e.local!==false};c.CombatStatsService={current:()=>({canAct:true,damageMult:1})};c.AugmentService={prepareAttack:(e,a)=>a,attackAdjustmentTotals:()=>({rangeMultiplier:1})};c.ProgressScaledAttackService={resolve:(e,a)=>a};
c.Training={active:true,canvas:{width:1000,height:800},cameraState:{x:100,y:200},spectatorZoom:()=>zoom,mouseWorld:()=>({x:c.Training.cameraState.x+500+mouse.x/zoom,y:c.Training.cameraState.y+400+mouse.y/zoom})};c.StaminaService={canSpend:(e,n)=>e.stamina>=n,spend:(e,n)=>{if(e.stamina<n)return false;e.stamina-=n;return true}};
c.EntityService={items:new Map()};c.GameplayAttackSnapshotSyncService={send:()=>true};c.ColorService={rgbString:()=> '146,203,214',brighten:()=> '#d9f0f5'};
c.AttackService={cooldownReady:(e,a)=>now>=(e.cooldowns.get(a.id)||0),execute:(e,a,angle,options={})=>{if(!c.CircleFormationService.circleCount(e)||(!options.resourcePrepaid&&!c.StaminaService.spend(e,a.cost)))return false;e.attackSequence=(e.attackSequence||0)+1;const ex={sourceBaseDamageSnapshot:50};const m=a.modules.find(m=>m.type==='formation.manifest');const circles=c.CircleFormationService.resolveModuleCircles(e,m,ex);executions.push({circles,a,ex});e.cooldowns.set(a.id,now+a.cd);return true}};
const formationHarness={stamina:c.StaminaService,attack:c.AttackService};
load('src/abilities/CircleFormationService.js','CircleFormationService');const svc=c.CircleFormationService;
function entity(){const e={id:'tinya',character:ch,kind:'player',color:ch.color,alive:true,x:500,y:500,radius:20,stamina:1000,cooldowns:new Map(),actionState:new Map()};c.Training.player=e;return e}
function reset(){now=1000;mouse={x:0,y:0};zoom=1;executions=[];c.Training.cameraState={x:100,y:200};return entity()}
function ctx(){let balance=0;return{ops:[],save(){balance++},restore(){balance--},translate(...p){this.ops.push(['translate',...p])},scale(...p){this.ops.push(['scale',...p])},rotate(){},closePath(){},beginPath(){},arc(...p){this.ops.push(['arc',...p])},fill(){},stroke(){},setLineDash(){},get balance(){return balance}}}
load('src/core/ColorService.js','ColorService');load('src/core/ModeStateService.js','ModeStateService');c.TriggerModuleService={matches:()=>true};c.WEAPON_IMAGE_DEFS={};load('src/render/ModeGearPresentationService.js','ModeGearPresentationService');
let count=0;function test(n,f){f();count++;console.log('PASS '+n)}
test('RMB click deletes newest selected only; empty click no circle; drag is free; LMB click never becomes hold',()=>{
 const e=reset(),state=svc.state(e);svc.press(e,'rmb',now);svc.release(e,'rmb',true,now+30);assert.equal(state.circles.length,0);assert.equal(e.stamina,1000);
 svc.press(e,'rmb',now);mouse={x:150,y:0};now+=40;svc.updateCircleInput(e,state,now);svc.release(e,'rmb',true,now+10);assert.equal(state.circles.length,1);assert.equal(e.stamina,1000);
 const old=state.circles[0];state.circles.push({...old,id:'new',order:99});mouse={x:old.x,y:old.y};svc.press(e,'rmb',now);svc.release(e,'rmb',true,now+50);assert.equal(state.circles.length,1);assert.equal(state.circles[0].id,old.id);
 assert.equal(ch.attacks.spellbook,undefined);assert.ok(!ch.tooltipSkills.some(t=>t.key==='LMB HOLD'||t.key==='LMB/LMB'||t.key==='LMB/RMB'));assert.equal(ch.tooltipSkills.filter(t=>t.key==='RMB HOLD').length,1);assert.ok(ch.tooltipSkills.find(t=>t.key==='AMP').text.includes('타 마법진의 윤곽선'));
});
test('RMB HOLD moves connected group only, preserves circles/stamina, no previous single-circle hold',()=>{
 const e=reset(),state=svc.state(e);state.circles=[{id:'a',x:0,y:0,r:150,order:1},{id:'b',x:180,y:0,r:150,order:2},{id:'c',x:700,y:0,r:68,order:3}];
 svc.press(e,'rmb',now);now+=160;svc.updateCircleInput(e,state,now);assert.equal(state.circleInput.mode,'move');mouse={x:50,y:30};svc.updateCircleInput(e,state,now+20);assert.equal(state.circles[0].x,50/.75);assert.equal(state.circles[1].x,180+50/.75);assert.equal(state.circles[2].x,700);svc.release(e,'rmb',true,now+30);assert.equal(state.circles.length,3);assert.equal(e.stamina,1000);
});
test('camera templates stay screen-fixed after camera movement/zoom; radius scale retains minimum AMP; cast outer bounds centre follows mouse',()=>{
 const e=reset(),state=svc.state(e);state.circles=[{id:'a',x:-100,y:0,r:68,order:1},{id:'b',x:100,y:0,r:150,order:2}];
 function screen(){const view=svc.view();return svc.displayTemplate(state.circles).map(x=>[(x.x-view.x)*view.zoom,(x.y-view.y)*view.zoom,x.r*view.zoom])}
 const before=screen();c.Training.cameraState={x:800,y:900};assert.deepEqual(screen(),before);zoom=2;assert.deepEqual(screen(),before);assert.ok(svc.isMinimum(e,svc.displayTemplate(state.circles)[0]));
 const circles=svc.castTemplate(e,{x:2500,y:-100});assert.deepEqual(JSON.parse(JSON.stringify(svc.boundsCenter(circles))),{x:2500,y:-100});assert.ok(svc.isMinimum(e,circles[0]));assert.deepEqual(state.circles.map(x=>x.x),[-100,100]);
});
test('LMB costs50 per circle and preserves template; release/long hold/double click no editing or saved summon; empty disallowed',()=>{
 const e=reset(),state=svc.state(e);assert.equal(svc.press(e,'lmb',now),false);state.circles=[{id:'a',x:0,y:0,r:100,order:1},{id:'b',x:200,y:0,r:100,order:2}];
 e.stamina=99;assert.equal(svc.press(e,'lmb',now),false);e.stamina=500;mouse={x:300,y:100};assert.equal(svc.press(e,'lmb',now),true);assert.equal(state.activation.phase,'reveal');assert.equal(e.stamina,400);assert.equal(svc.press(e,'lmb',now+100),false);svc.release(e,'lmb',true,now+200);now=state.activation.revealUntil;svc.updateActivation(e,state,now);assert.equal(e.stamina,400);assert.equal(executions.length,1);assert.equal(state.circles.length,2);assert.equal(executions[0].a.cost,100);assert.equal((executions[0].circles[0].x+executions[0].circles[1].x)/2,900);assert.equal(executions[0].circles[0].y,700);
 state.circles=[];assert.equal(svc.beginActivation(e,{x:0,y:0},{now:2000}),false);
});
test('counter uses same current template/no fallback; preview nonconsuming; no circle guard; public miniature updates locally/remotely',()=>{
 const e=reset(),state=svc.state(e),a=ch.attacks.counter,m=a.modules.find(m=>m.type==='formation.manifest');assert.equal(m.source,'template');assert.equal(svc.resolveModuleCircles(e,m,{}).length,0);
 state.circles=[{id:'a',x:-200,y:0,r:68,order:1},{id:'b',x:200,y:0,r:200,order:2}];let circles=svc.resolveModuleCircles(e,m,{targetPoint:{x:1000,y:500}});assert.equal(circles.length,2);assert.equal(circles[0].x,800.5);assert.equal(svc.attackCost(e,a),0);assert.equal(state.circles.length,2);
 const config=ch.worldEffectModules[0],first=ctx();assert.equal(svc.drawWeapon(first,e,config),true);assert.equal(first.balance,0);state.circles[0].r=90;const next=ctx();svc.drawWeapon(next,e,config);assert.notDeepEqual(next.ops,first.ops);
 const snapshot=JSON.parse(JSON.stringify(svc.serialize(e))),remote={...entity(),id:'remote',local:false};svc.applyRemote(remote,snapshot);const peer=ctx();svc.drawWeapon(peer,remote,config);assert.deepEqual(peer.ops,next.ops);const snapshotWeapon=c.ModeGearPresentationService.sampleWeapons(e,1,now);assert.equal(snapshotWeapon.images.length,1);const fixed=snapshotWeapon.images[0].sample.definition;state.circles[0].r=120;assert.notEqual(svc.weaponDefinition(e,config),fixed);const corpse=ctx();assert.equal(c.ModeGearPresentationService.drawImage(corpse,snapshotWeapon.entity,config,1,now,snapshotWeapon.images[0].sample),true);assert.deepEqual(corpse.ops,next.ops);assert.ok(a.formationCost&&ch.abilities.counter.trigger.conditions.some(t=>t.type==='formation.nonempty'));
});
test('out-of-map placement uses actual unclamped mouseWorld option, other characters keep world clamp',()=>{
 const source=fs.readFileSync(path.join(root,'src/modes/Training.js'),'utf8'),a=source.indexOf('  mouseWorld('),b=source.indexOf('  aimAngle(){',a),method=source.slice(a,b).trim().replace(/},$/,'}');
 const h=vm.createContext({WorldBoundsService:{width:()=>100,height:()=>100},WaypointProjectileService:{pointerAnchor:()=>({x:50,y:50})},WorldGeometryService:{boundaryRayDistance:()=>50}});
 const fn=vm.runInContext('({'+method+'}).mouseWorld',h);const tr={canvas:{width:1000,height:800,getBoundingClientRect:()=>({left:0,top:0,width:1000,height:800})},mouse:{x:900,y:600},cameraState:{x:0,y:0},mouseWorldState:{},spectatorZoom:()=>1};
 assert.equal(fn.call(tr,null,{allowOutsideWorld:true}).x,900);assert.equal(fn.call(tr).x,100);
});
test('outer bounds include circle sizes, duplicate small circles never pull cast centre',()=>{
 const e=reset(),state=svc.state(e);state.circles=[{id:'large',x:100,y:80,r:150,order:1},{id:'small',x:-100,y:-20,r:40,order:2}];
 const original=svc.castTemplate(e,{x:1000,y:2000});assert.deepEqual(JSON.parse(JSON.stringify(svc.boundsCenter(original))),{x:1000,y:2000});
 for(let i=0;i<5;i++)state.circles.push({...state.circles[1],id:'duplicate'+i});
 const repeated=svc.castTemplate(e,{x:1000,y:2000});assert.equal(repeated[0].x,original[0].x);assert.equal(repeated[0].y,original[0].y);
 state.circles=[{id:'single',x:200,y:-400,r:68}];assert.equal(svc.castTemplate(e,{x:1000,y:2000})[0].x,1000);
});
test('local and replicated windup use same progressive fill, follow cast pointer and disappear at windup end',()=>{
 const e=reset(),state=svc.state(e);state.circles=[{id:'a',x:0,y:0,r:100,order:1}];assert.equal(svc.press(e,'lmb',now),true);
 const delay=state.activation.revealUntil-now;mouse={x:200,y:100};now+=delay/3;svc.updateActivation(e,state,now);
 const remote={...entity(),id:'remote',local:false};svc.applyRemote(remote,JSON.parse(JSON.stringify(svc.serialize(e,now))),now);
 c.EntityService.items=new Map([['local',e],['remote',remote]]);let calls=[];
 const renderer={...svc,drawSet(){return true},drawReveal(ctx,actor,circles,progress){calls.push({actor,circles,options:{teamOutline:true,revealProgress:progress}});return true},drawCounterPreview(){}};
 renderer.draw({}, {},now);let windups=calls.filter(x=>x.options.teamOutline);assert.equal(windups.length,2);assert.ok(Math.abs(windups[0].options.revealProgress-1/3)<1e-9);assert.ok(Math.abs(windups[1].options.revealProgress-1/3)<1e-9);assert.equal(windups[0].circles[0].x,windups[1].circles[0].x);
 now+=delay/3;calls=[];renderer.draw({}, {},now);windups=calls.filter(x=>x.options.teamOutline);assert.ok(windups.every(x=>Math.abs(x.options.revealProgress-2/3)<1e-9));
 now=state.activation.revealUntil+1;calls=[];renderer.draw({}, {},now);assert.equal(calls.filter(x=>x.options.teamOutline).length,0);
 const real=ctx();real.moveTo=(...p)=>real.ops.push(['move',...p]);real.clip=()=>real.ops.push(['clip']);real.fill=()=>real.ops.push(['fill']);
 c.TeamColorPresentationService={colorForEntity:e=>e.color};svc.drawSet(real,e,[{id:'single',x:0,y:0,r:100}],.7,{teamOutline:true,hideRoleIcons:true,revealProgress:.5});
 assert.ok(real.ops.some(x=>x[0]==='arc'&&x[4]===-Math.PI/2&&x[5]===Math.PI/2));assert.ok(real.ops.some(x=>x[0]==='clip'));assert.ok(real.ops.some(x=>x[0]==='fill'));assert.equal(real.balance,0);
});
test('start consumes once / zero remaining still fires / cancelled windup stays consumed / insufficient start no effect',()=>{
 const e=reset(),state=svc.state(e);state.circles=[{id:'a',x:0,y:0,r:100}];e.stamina=50;
 assert.equal(svc.press(e,'lmb',now),true);assert.equal(e.stamina,0);now=state.activation.revealUntil;svc.updateActivation(e,state,now);assert.equal(executions.length,1);assert.equal(e.stamina,0);
 now+=1000;e.stamina=50;assert.equal(svc.press(e,'lmb',now),true);assert.equal(e.stamina,0);svc.cancelActivation(e,'test');assert.equal(e.stamina,0);assert.equal(svc.press(e,'lmb',now),false);assert.equal(state.activation,null);
});
test('hold pending AND move reserve entity gauge / selected circle surrounding arc follows screen projection / release removes both',()=>{
 const e=reset(),state=svc.state(e);state.circles=[{id:'a',x:0,y:0,r:100}];c.EntityService.items=new Map([[e.id,e]]);svc.press(e,'rmb',now);
 let draws=[];const renderer={...svc,drawSet(){return true},drawCounterPreview(){},drawHoldGauge(ctx,target,ratio){draws.push({target,ratio});return true}};
 assert.equal(svc.entityHoldGaugeState(e,now+75).visible,true);renderer.draw({}, {},now+75);assert.equal(draws.length,2);assert.equal(draws[1].target.r,75);assert.equal(draws[1].ratio,.5);
 now+=160;svc.updateCircleInput(e,state,now);assert.equal(state.circleInput.mode,'move');assert.equal(svc.entityHoldGaugeState(e,now).visible,true);assert.equal(svc.entityHoldGaugeState(e,now).full,true);
 mouse={x:100,y:50};svc.updateCircleInput(e,state,now);draws=[];renderer.draw({}, {},now);assert.equal(draws.length,2);assert.equal(draws[1].target.x,700);assert.equal(draws[1].target.y,650);
 const remote={...e,id:'remote',local:false};assert.equal(svc.entityHoldGaugeState(remote,now).visible,false);svc.release(e,'rmb',true,now);assert.equal(svc.entityHoldGaugeState(e,now).visible,false);
});
test('real ring layout pushes counter ring during move only for owner; release restores spacing',()=>{
 const e=reset(),state=svc.state(e);state.circles=[{id:'a',x:0,y:0,r:100}];svc.press(e,'rmb',now);now+=160;svc.updateCircleInput(e,state,now);
 for(const name of ['ChargedAttackService','MultiClickAttackService','ChannelAttackService','ProgressStateService'])c[name]={hasGauge:()=>false};c.WaypointProjectileService={hasHoldGauge:()=>false};c.StatusPresentation={selected:()=>null};
 load('src/core/EntityRingLayoutService.js','EntityRingLayoutService');const layout={...c.EntityRingLayoutService,canViewPrivateGauge:e=>e.local!==false,characterHoldGaugeVisible:()=>false,directionalArcIndicatorState:()=>({visible:false}),worldArcGaugeState:()=>({visible:false,outerRadius:0,outerWidth:0}),flashVisible:(e,t)=>svc.entityHoldGaugeState(e,t).full};
 const radius=layout.counterRadius(e,now);assert.ok(radius>layout.chargeRadius(e)+layout.WIDTHS.gauge/2);const remote={...e,local:false};assert.equal(layout.counterRadius(remote,now),layout.chargeRadius(remote));svc.release(e,'rmb',true,now);assert.equal(layout.counterRadius(e,now),layout.chargeRadius(e));
});
test('all edited circle hold arcs / viewport center bounds / group spacing preserved / resize and zoom',()=>{
 const e=reset(),state=svc.state(e);state.circles=[{id:'a',x:0,y:0,r:100},{id:'b',x:150,y:0,r:100},{id:'c',x:800,y:500,r:68}];svc.press(e,'rmb',now);now+=160;svc.updateCircleInput(e,state,now);let targets=[];
 const renderer={...svc,drawSet(){return true},drawCounterPreview(){},drawHoldGauge(ctx,target){targets.push(target);return true}};c.EntityService.items=new Map([[e.id,e]]);renderer.draw({}, {},now);assert.equal(targets.length,4);assert.equal(targets.filter(x=>x.r!==undefined).length,3);
 mouse={x:5000,y:5000};svc.updateCircleInput(e,state,now);assert.equal(state.circles[1].x,500/.75);assert.equal(state.circles[0].x,500/.75-150);assert.equal(state.circles[0].y,400/.75);assert.equal(state.circles[1].x-state.circles[0].x,150);assert.equal(state.circles[2].x,800);
 const pointer=svc.templatePointer(e);assert.equal(pointer.x,500/.75);assert.equal(pointer.y,400/.75);svc.release(e,'rmb',true,now);
 assert.equal(svc.placeCircle(e,{x:-5000,y:5000,r:68},now),true);assert.equal(state.circles.at(-1).x,-500/.75);assert.equal(state.circles.at(-1).y,400/.75);
 c.Training.canvas={width:400,height:300};svc.update(e,now);const displayed=svc.displayTemplate(state.circles,e),view=svc.view();for(const circle of displayed){assert.ok(Math.abs(circle.x-view.x)<=200);assert.ok(Math.abs(circle.y-view.y)<=150)}zoom=2;assert.equal(svc.templateBounds(e).x,200/.75);c.Training.canvas={width:1000,height:800};
});
test('fixed375ms / cooldown650ms / fixed aim / cast75% / freeze per weighted source',()=>{
 const e=reset(),state=svc.state(e);state.circles=[{id:'a',x:0,y:0,r:68}];assert.equal(svc.press(e,'lmb',now),true);assert.equal(state.activation.revealUntil-now,375);const started=now;mouse={x:200,y:150};now+=374;svc.updateActivation(e,state,now);assert.equal(state.activation.activationCircles[0].x,600);assert.equal(state.activation.activationCircles[0].y,600);assert.equal(state.activation.activationCircles[0].r,51);assert.equal(executions.length,0);now+=1;svc.updateActivation(e,state,now);assert.equal(e.cooldowns.get(ch.attacks.lmb.id),started+375+650);now+=649;assert.equal(svc.press(e,'lmb',now),false);now+=1;assert.equal(svc.press(e,'lmb',now),true);
 const config=svc.amplifierStatusConfig(e);assert.equal(config.stages[0].duration,100);assert.equal(config.stages[1].duration,200);assert.ok(config.stages.every(x=>x.status==='freeze'));assert.equal(ch.circleFormation.amplifier.containedStageWeight,2);assert.equal(ch.circleFormation.amplifier.maxStage,12);assert.equal(ch.circleFormation.editingScale,.75);assert.equal(ch.baseDamage,20);assert.equal(ch.difficulty,5);assert.equal(ch.abilities.counter.trigger.modules[0].cc,null);
});
test('AMP freeze100ms each, containment doubles to200ms, unique weighted sources / actual hit applies duration',()=>{
 const e=reset();e.baseDamage=20;const target={id:'victim',alive:true,x:0,y:0,radius:20};const receiver={id:'receiver',x:0,y:0,r:200},a={id:'amp-a',x:200,y:0,r:68},b={id:'amp-b',x:200,y:50,r:68},outer={id:'outer',x:200,y:0,r:150};
 const configurations=[[[receiver,a],1,100],[[receiver,a,b],2,200],[[receiver,a,outer],2,200],[[receiver,a,b,outer],4,400]];
 for(const [circles,stage,duration]of configurations){const model=svc.damageModel(e,circles);assert.equal(svc.amplifierStageForTarget(model,target),stage);assert.equal(svc.amplifierStatusConfig(e).stages[stage-1].duration,duration);}
 const union={list:[{id:'x',x:0,y:0,r:100},{id:'y',x:0,y:0,r:100}],amplifier:{stackBySource:true,sourceContributionByCircle:new Map([['x',new Map([['a',2],['b',1]])],['y',new Map([['a',2],['c',1]])]]),stageByCircle:new Map([['x',3],['y',3]])}};assert.equal(svc.amplifierStageForTarget(union,target),4);
 let applied=[];c.CombatStatusApplicationService={apply:args=>(applied.push(args),true)};load('src/render/StageStatusEffectService.js','StageStatusEffectService');load('src/combat/WeightedCircleAttackDeliveryService.js','WeightedCircleAttackDeliveryService');
 const savedModules=c.AttackModuleService;c.AttackModuleService={onHit(){}};c.AttackExecutionService={setImpactOrigin(){},setKoOrigin(){}};c.AttackHitTriggerService={damage:()=>({hit:true,authoritative:true})};c.NetworkCollisionPositionService={point:e=>e};c.RelationService={canTarget:()=>true};c.EntityService.items=new Map([[target.id,target]]);
 svc.applyManifestDamage(e,ch.attacks.lmb,{sourceBaseDamageSnapshot:20},[receiver,a,b,outer],0,now);assert.equal(applied.length,1);assert.equal(applied[0].type,'freeze');assert.equal(applied[0].duration,400);applied=[];c.AttackHitTriggerService={damage:()=>({hit:false})};svc.applyManifestDamage(e,ch.attacks.lmb,{sourceBaseDamageSnapshot:20},[receiver,a,b,outer],0,now);assert.equal(applied.length,0);c.AttackModuleService=savedModules;
});
test('real AttackService prepaid resource skips only spending, retains cooldown/events/action checks',()=>{
 const e=reset(),state=svc.state(e);state.circles=[{id:'a',x:0,y:0,r:100}];e.stamina=0;let spent=0,delivered=0,fired=0;
 c.StaminaService={canSpend:(e,n)=>e.stamina>=n,spend:()=>{spent++;return false}};c.AugmentService.update=()=>{};c.AugmentEffectModuleService={runTrigger:()=>null};c.WallOverlapAttackDeferService={shouldDefer:()=>false};c.NaturalHealthRegenActivityService={mark(){}};c.AttackExecutionService={create:()=>({sequence:1})};c.AttackModuleService={type:m=>m.type,deliveryCount:()=>1,deliver:()=>delivered++,afterAttack(){}};c.GameEvents={emit:()=>fired++};
 load('src/combat/AttackService.js','AttackService');const a={...ch.attacks.lmb,cost:100};assert.equal(c.AttackService.execute(e,a,0,{preparedSpec:true,resourcePrepaid:true}),true);assert.equal(spent,0);assert.equal(delivered,1);assert.equal(fired,1);assert.equal(e.cooldowns.get(a.id),now+a.cd);
 assert.equal(c.AttackService.execute(e,a,0,{preparedSpec:true,resourcePrepaid:true}),false);e.cooldowns.clear();assert.equal(c.AttackService.execute(e,a,0,{preparedSpec:true}),false);e.alive=false;assert.equal(c.AttackService.execute(e,a,0,{preparedSpec:true,resourcePrepaid:true}),false);
});
test('editing and cast same size/spacing; screen pointer round trip/zoom and AMP remain correct',()=>{
 const e=reset(),state=svc.state(e);state.circles=[{id:'a',x:-100,y:0,r:68},{id:'b',x:100,y:0,r:240}];
 let display=svc.displayTemplate(state.circles,e);assert.equal(display[0].r,51);assert.equal(display[1].r,180);assert.equal(display[1].x-display[0].x,150);assert.equal(svc.isMinimum(e,display[0]),true);
 let cast=svc.castTemplate(e,{x:1000,y:500});assert.equal(cast[0].r,51);assert.equal(cast[1].r,180);assert.equal(cast[1].x-cast[0].x,150);assert.equal(svc.boundsCenter(cast).x,1000);
 mouse={x:50,y:25};assert.deepEqual(JSON.parse(JSON.stringify(svc.templatePointer(e))),{x:50/.75,y:25/.75});zoom=2;display=svc.displayTemplate(state.circles,e);cast=svc.castTemplate(e,{x:1000,y:500});assert.equal(display[0].r,25.5);assert.equal(cast[0].r,25.5);assert.equal(svc.isMinimum(e,display[0]),true);
 assert.ok(ch.tooltipSkills.filter(t=>t.section==='CIRCLE').every(t=>!t.key.startsWith('RMB ')));
});
test('original formation preview restored with relations; overflow red flag / owner and remote weapon exclusion unchanged',()=>{
 const e=reset(),state=svc.state(e);c.EntityService.items=new Map([[e.id,e]]);const circle={x:0,y:0,r:100};let calls=[];
 const renderer={...svc,drawSet(ctx,actor,list,alpha,options){calls.push({list,alpha,options});return true},drawCounterPreview(){}};
 state.circles=[{id:'placed',x:20,y:0,r:240}];state.circleInput={mode:'create',preview:circle};renderer.draw({}, {},now);assert.equal(calls.length,1);assert.equal(calls[0].list.length,2);assert.equal(calls[0].list[1].id,'preview');assert.equal(calls[0].alpha,.48);assert.equal(calls[0].options.extraInvalidIds,null);
 state.circles=Array.from({length:6},(_,i)=>({id:String(i),x:i*100,y:0,r:68}));calls=[];renderer.draw({}, {},now);assert.equal(calls[0].list.length,7);assert.ok(calls[0].options.extraInvalidIds.has('preview'));
 assert.equal(svc.weaponDefinition(e,ch.worldEffectModules[0]).rings.length,12);const remote={...e,id:'remote',local:false};svc.applyRemote(remote,JSON.parse(JSON.stringify(svc.serialize(e,now))),now);assert.equal(svc.weaponDefinition(remote,ch.worldEffectModules[0]).rings.length,12);
 assert.equal(svc.placeCircle(e,circle,now),false);assert.equal(state.circles.length,6);assert.ok(state.limitPreview.endAt>now);state.circles.pop();assert.equal(svc.weaponDefinition(e,ch.worldEffectModules[0]).rings.length,12);
});
test('windup uses same annular sweep renderer/style as Meramona; actual half sweep and owner/peer identical',()=>{
 const e=reset();load('src/render/AnnularSweepPresentationService.js','AnnularSweepPresentationService');c.TeamColorPresentationService={colorForEntity:e=>e.color};const circle={x:100,y:200,r:120};
 const canvas=()=>{const v=ctx();v.stroke=()=>v.ops.push(['stroke',v.strokeStyle,v.lineWidth]);return v};const actual=canvas();svc.drawReveal(actual,e,[circle],.5,now);
 const mera=vm.runInContext('('+fs.readFileSync(path.join(root,'src/data/characters/meramona.js'),'utf8')+')',c);const module=mera.abilities.rmb.trigger.modules.find(m=>m.renderType==='annularDoubleSweep');const reference=canvas();c.AnnularSweepPresentationService.draw(reference,{...module,x:100,y:200,r:120,hitColor:e.color,start:now-225,dur:600},now);assert.deepEqual(actual.ops,reference.ops);assert.equal(actual.balance,0);
 const remote={...e,id:'remote',local:false},peer=canvas();svc.drawReveal(peer,remote,[circle],.5,now);assert.deepEqual(peer.ops,actual.ops);assert.ok(fs.readFileSync(path.join(root,'src/modes/Training.js'),'utf8').includes('AnnularSweepPresentationService.draw(ctx,f,now)'));
});
test('editingScale references castingScale; three radii and zooms always match cast radii',()=>{
 const e=reset(),state=svc.state(e);assert.equal(ch.circleFormation.editingScale,ch.circleFormation.castingScale);
 for(const factor of [1,.75,2]){zoom=factor;state.circles=[{id:'min',x:-100,y:0,r:68},{id:'mid',x:0,y:0,r:150},{id:'max',x:100,y:0,r:240}];const drawn=svc.displayTemplate(state.circles,e),cast=svc.castTemplate(e,{x:1000,y:500});for(let i=0;i<3;i++)assert.equal(drawn[i].r,cast[i].r);assert.equal(drawn[2].x-drawn[0].x,cast[2].x-cast[0].x);}
});
console.log('PASS '+count+' Tinya267 groups');

test('started formation windup survives non-interrupting action restriction; new activation blocked and death cancels',()=>{
 c.StaminaService=formationHarness.stamina;c.AttackModuleService.deliver=(e,a)=>executions.push({a});c.CombatStatsService.current=()=>({canAct:true,damageMult:1});
 const e=reset(),state=svc.state(e);state.circles=[{id:'a',x:0,y:0,r:100}];assert.equal(svc.press(e,'lmb',now),true);const cast=state.activation,stats=c.CombatStatsService.current;c.CombatStatsService.current=()=>({canAct:false,damageMult:1});now=cast.revealUntil;assert.equal(svc.updateActivation(e,state,now),true);assert.equal(executions.length,1);assert.equal(state.activation,null);assert.equal(svc.press(e,'lmb',now+1000),false);c.CombatStatsService.current=stats;now+=1000;assert.equal(svc.press(e,'lmb',now),true);e.alive=false;now=state.activation.revealUntil;assert.equal(svc.updateActivation(e,state,now),false);assert.equal(state.activation,null);assert.equal(executions.length,1);
});

test('actual shared CC add cancels Tinya reveal on stun/freeze/neutralize/sleep; push remains non-cancelling',()=>{
 load('src/combat/AttackWindupService.js','AttackWindupService');load('src/core/ForcedMovementWindupInterruptService.js','ForcedMovementWindupInterruptService');load('src/combat/CCService.js','CCService');c.SimulationScheduleService={interruptWindups:()=>false};c.TimedActionStateService={cancelOnForcedMovement:()=>false};c.ChannelAttackService={interruptCharging:()=>false};c.BuffService={remove:()=>false};c.COMBAT_STATUS_DEFS=Object.fromEntries(['stun','freeze','neutralize','sleep'].map(t=>[t,{}]));c.CombatModifierService={statusParams:()=>({stackMode:'replace-source'})};c.nextCcPresentationOrder=()=>1;
 for(const type of ['stun','freeze','neutralize','sleep']){const e=reset(),state=svc.state(e);e.statuses=new Map();state.circles=[{id:'a',x:0,y:0,r:100}];assert.equal(svc.press(e,'lmb',now),true);const until=state.activation.revealUntil;assert.equal(c.ForcedMovementWindupInterruptService.interrupt(e,'knockback'),false);assert.ok(state.activation);assert.equal(c.CCService.add(e,type,1,'enemy'),true);assert.equal(state.activation,null);now=until;svc.updateActivation(e,state,now);assert.equal(executions.length,0);}
});
