/* 실제 캐릭터 데이터→EffectSpec→원격 이동 접촉 판정 회귀. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');let now=1000,count=0;
const c=vm.createContext({console,Map,Set,WeakMap,WeakSet,Math,performance:{now:()=>now},EMPTY_RUNTIME_ITEMS:[],GAME_DATA:{frameMs:16},Training:{active:true,sessionMode:'training',fx:[]},OnlineDuelService:{active:false},OnlinePresentationSyncService:{shouldSend:()=>false}});
function load(file,name){vm.runInContext(fs.readFileSync(path.join(root,file),'utf8')+`;globalThis.${name}=${name};`,c)}
for(const n of ['characterValue','characterCount','characterSum','characterProduct','freezeCharacterData','CHARACTER_RULES'])load('src/data/'+n+'.js',n);
c.CHARACTER_DATA={};for(const id of ['lime','reika'])c.CHARACTER_DATA[id]=vm.runInContext('('+fs.readFileSync(path.join(root,'src/data/characters/'+id+'.js'),'utf8')+')',c);
c.CHARACTER_DATA['reflection-regression']={id:'reflection-regression',name:'회귀',color:'#fff',classification:{style:1,range:2,role:1},stats:{maxHealth:1000,baseDamage:100,radius:20,speed:4,difficulty:1},attacks:{assassin:JSON.parse(fs.readFileSync(path.join(root,'tools/fixtures/reflection-attack.json'),'utf8'))}};
load('src/data/CharacterDataService.js','CharacterDataService');
c.EntitySimulationAuthorityService={isLocal:e=>e.local!==false};c.RelationService={relation:(s,t)=>s.teamId===t.teamId?'ally':'enemy'};
c.EntityService={items:new Map(),forEachEnemy(s,fn){for(const t of this.items.values())if(t.alive&&t.teamId!==s.teamId)fn(t)}};
c.MovementService={travelDistance:(x,y,a,d)=>Math.min(d,wall)};let wall=Infinity;
c.InstalledAreaFieldService={containmentTravelDistance:(e,a,d)=>d};
c.AttackPresentationColorService={resolve:()=> '255,122,0'};c.AttackExecutionService={create:()=>({sequence:1,hitTargets:new Set()}),hasEffect:()=>false,markEffect(){}};
c.JustDodgeService={pointSegmentDistance(px,py,ax,ay,bx,by){const dx=bx-ax,dy=by-ay,den=dx*dx+dy*dy,t=den?Math.max(0,Math.min(1,((px-ax)*dx+(py-ay)*dy)/den)):0;return Math.hypot(px-ax-dx*t,py-ay-dy*t)}};
let hits=[];c.AttackHitTriggerService={damage:ctx=>{hits.push(ctx.target.id);return{hit:true,authoritative:true}}};
c.AbilityService={attackById:(ch,id)=>Object.values(ch.attacks).find(a=>a.id===id)};c.CombatStatusApplicationService={apply(){}};
load('src/network/NetworkCollisionPositionService.js','NetworkCollisionPositionService');load('src/core/CollisionPolicyService.js','CollisionPolicyService');load('src/abilities/MovementAbilityService.js','MovementAbilityService');load('src/render/EffectSpawnService.js','EffectSpawnService');load('src/combat/AttackModuleService.js','AttackModuleService');
function setup(id,key){now=1000;wall=Infinity;hits=[];c.Training.sessionMode='training';c.Training.fx=[];c.EntityService.items.clear();const ch=c.CharacterDataService.compile(id),attack=ch.attacks[key],move=attack.modules.find(m=>m.type==='movement.move'),fx=attack.modules.find(m=>m.type==='effect.spawn');
 const source={id:'source',teamId:'a',alive:true,local:true,character:ch,x:100,y:100,radius:20,actionState:new Map()},target={id:'target',teamId:'b',alive:true,local:true,x:185,y:100,radius:20};c.EntityService.items.set(source.id,source);c.EntityService.items.set(target.id,target);
 const k=c.MovementAbilityService.resolveKinematics(move);source.actionState.set('movement:move',{kind:c.MovementAbilityService.KIND,stateKey:'movement:move',executionSequence:1,startX:100,startY:100,startedAt:1000,angle:0,distance:k.distance,presentationDistance:45,duration:k.duration,collision:{passWalls:true,passEnemies:false},enemyCollisionOvershoot:24,pathDamageEffects:[]});
 const owner=c.AttackModuleService.spawnAttackEffect(source,attack,0,{sequence:1},fx);assert.equal(owner.damage.remotePathTimeline.distance,k.distance);assert.equal(owner.damage.remotePathTimeline.duration,k.duration);
 const spec=c.EffectSpawnService.definitionSnapshot(owner);delete spec.animationState;source.actionState.clear();source.local=false;c.Training.sessionMode='online';const effect=c.EffectSpawnService.spawn(spec,{source});assert.ok(effect.animationState.movementPathTimeline);return{source,target,effect,k};}
function tick(h,elapsed,x){now=1000+elapsed;h.target.x=x;c.EffectSpawnService.applyMovementTrackedDamage(h.effect)}
for(const [id,key] of [['lime','lmb']]){
 let h=setup(id,key);for(let ms=10;ms<=h.k.duration;ms+=10)tick(h,ms,185+ms*.24);assert.deepEqual(hits,['target'],id+' moving away');count++;
 // 같은 실행의 접촉은 중복 피해 없음.
 tick(h,h.k.duration+16,h.target.x);assert.deepEqual(hits,['target']);count++;
 h=setup(id,key);tick(h,10,185);tick(h,30,185);tick(h,60,185);assert.deepEqual(hits,['target']);const stopped=h.effect.animationState.movementPathTimeline.distance;tick(h,h.k.duration,185);assert.equal(h.effect.animationState.movementPathTimeline.distance,stopped);count++;
 // 실제 이동이 막힌 첫 적 뒤로 같은 공격 경로가 이어지지 않는다.
 const other={id:'behind',teamId:'b',alive:true,x:320,y:100,radius:20};c.EntityService.items.set(other.id,other);tick(h,h.k.duration+20,185);assert.deepEqual(hits,['target']);count++;
 h=setup(id,key);for(let ms=10;ms<=h.k.duration;ms+=10)tick(h,ms,185+ms*2);assert.deepEqual(hits,[]);count++;
 h=setup(id,key);h.target.y=180;for(let ms=10;ms<=h.k.duration;ms+=10)tick(h,ms,185);assert.deepEqual(hits,[]);count++;
}
// 이동 중 충돌도 렌더 보간점 대신 공통 최신 충돌점을 사용한다.
const h=setup('lime','lmb');h.target._networkStateReady=true;h.target.netCollisionX=500;h.target.netCollisionY=100;assert.equal(c.CollisionPolicyService.enemyTravelDistance(h.source,0,126),126);count++;

// Reflected contact uses the same wall geometry in local movement and target-authority replay.
c.TagService={attackTags:a=>new Set(a.tags||[]),derivedModuleTags:()=>[]};
load('src/combat/AttackExecutionService.js','AttackExecutionService');
c.DebugMapService={movementWalls:()=>[{x:500,y:0,w:40,h:2000}],walls:()=>[{x:500,y:0,w:40,h:2000}]};
c.WorldBoundsService={width:()=>2000,height:()=>2000};
load('src/world/WorldGeometryService.js','WorldGeometryService');load('src/core/MovementService.js','MovementService');
c.AttackModuleService.onHit=()=>{};
function reflectedSetup(remote=false){
 now=1000;hits=[];c.Training.fx=[];c.Training.sessionMode=remote?'online':'training';c.EntityService.items.clear();
 const ch=c.CharacterDataService.compile('reflection-regression'),attack=ch.attacks.assassin;
 const source={id:'source',teamId:'a',alive:true,local:!remote,attackSequence:0,character:ch,x:400,y:500,radius:20,actionState:new Map()};
 const target={id:'target',teamId:'b',alive:true,local:true,x:430,y:500,radius:5};
 c.EntityService.items.set(source.id,source);c.EntityService.items.set(target.id,target);
 const movement={kind:c.MovementAbilityService.KIND,stateKey:'movement:reflection',executionSequence:1,
  startX:400,startY:500,startedAt:1000,endsAt:1500,angle:0,distance:800,speed:1600,traveled:0,
  duration:500,easing:'linear',collision:{passWalls:false,passEnemies:true},reflectWalls:true,pathDamageEffects:[],damagePathSegments:[]};
 source.actionState.set(movement.stateKey,movement);
 const owner=c.AttackModuleService.spawnAttackEffect(source,attack,0,{sequence:1},attack.modules[1]);
 if(!remote)return{source,target,effect:owner,movement};
 const spec=c.EffectSpawnService.definitionSnapshot(owner);delete spec.animationState;source.actionState.clear();
 const effect=c.EffectSpawnService.spawn(spec,{source});return{source,target,effect,movement};
}
{
 const h=reflectedSetup();now=1100;c.MovementAbilityService.update(h.source,now,100);
 assert.deepEqual(hits,['target','target']);assert.ok(Math.abs(h.source.x-400)<1e-6);
 const sequence=h.effect.animationState.execution.sequence;
 now=1120;c.MovementAbilityService.update(h.source,now,20);
 assert.deepEqual(hits,['target','target']);assert.equal(h.effect.animationState.execution.sequence,sequence);count++;
}
{
 const h=reflectedSetup(true);now=1100;c.EffectSpawnService.applyMovementTrackedDamage(h.effect);
 assert.deepEqual(hits,['target','target']);const timeline=h.effect.animationState.movementPathTimeline;
 assert.ok(Math.abs(timeline.currentX-400)<1e-6);assert.equal(timeline.damageDistance,160);
 now=1120;c.EffectSpawnService.applyMovementTrackedDamage(h.effect);assert.deepEqual(hits,['target','target']);count++;
}
{
 const h=reflectedSetup(true);h.effect.damage.resetHitsOnWallReflection=false;
 now=1100;c.EffectSpawnService.applyMovementTrackedDamage(h.effect);
 assert.deepEqual(hits,['target']);count++;
}
console.log(`PASS ${count} movement contact regression scenarios`);
