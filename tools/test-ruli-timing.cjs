/* 공용 delivery.area 지연·발사 좌표·룰리 도달/채움 시점 회귀. 실전 온라인 대체 아님. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');let now=1000;const hits=[];
const c=vm.createContext({console,Map,Set,WeakMap,Math,performance:{now:()=>now},EMPTY_RUNTIME_ITEMS:[],GAME_DATA:{frameMs:1000/60},EntitySimulationAuthorityService:{isLocal:()=>true},Training:{},AreaAttackService:{execute:(source,spec,angle,module,volley,options)=>hits.push({at:now,source,spec,angle,module,options})}});
function load(file,name){vm.runInContext(fs.readFileSync(path.join(root,file),'utf8')+`;globalThis.${name}=${name};`,c)}
for(const name of ['characterValue','characterCount','characterSum','characterProduct','freezeCharacterData','CHARACTER_RULES'])load('src/data/'+name+'.js',name);
c.CHARACTER_DATA={ruli:vm.runInContext('('+fs.readFileSync(path.join(root,'src/data/characters/ruli.js'),'utf8')+')',c)};
load('src/data/CharacterDataService.js','CharacterDataService');const ch=c.CharacterDataService.compile('ruli');
load('src/core/SimulationScheduleService.js','SimulationScheduleService');load('src/combat/AttackModuleService.js','AttackModuleService');
const visual=ch.attacks.lmb.modules.find(m=>m.type==='effect.spawn');assert.equal(visual.duration,300);assert.equal(ch.attacks.lmb.modules[0].travelDelay,visual.duration*visual.travelFraction);
for(const replay of [false,true])for(const stage of [1,4,7]){
 now=1000;hits.length=0;c.SimulationScheduleService.clear();const source={id:'ruli',alive:true,x:100,y:200,radius:20};
 const attack={...ch.attacks.lmb,modules:ch.attacks.lmb.modules.map(m=>m.type==='delivery.area'?{...m,centerDistance:54+(stage-1)*72}:m)};
 c.AttackModuleService.deliver(source,attack,.3,{execution:{skipWindup:replay},hits:0});assert.equal(hits.length,0);
 source.x=900;source.y=950;now=1134;c.SimulationScheduleService.update(now);assert.equal(hits.length,0);
 now=1135;c.SimulationScheduleService.update(now);assert.equal(hits.length,1);assert.equal(hits[0].at,1135);assert.equal(hits[0].options.geometrySource.x,100);assert.equal(hits[0].options.geometrySource.y,200);assert.equal(hits[0].module.centerDistance,54+(stage-1)*72);
 now=1400;c.SimulationScheduleService.update(now);assert.equal(hits.length,1);
}
now=1000;hits.length=0;const source={alive:true,x:100,y:200};c.AttackModuleService.deliver(source,ch.attacks.lmb,0,{execution:{}});source.alive=false;now=1200;c.SimulationScheduleService.update(now);assert.equal(hits.length,0);
// 기존 일반 area 공격은 계속 즉시 전달한다.
now=1000;source.alive=true;hits.length=0;c.AttackModuleService.deliver(source,{modules:[{type:'delivery.area',shape:'circle',range:50}]},0,{execution:{}});assert.equal(hits.length,1);assert.equal(hits[0].options.geometrySource,null);
c.GAME_DATA.characters={ruli:ch};c.EntityService={items:new Map()};load('src/render/RuliRulerPresentationService.js','RuliRulerPresentationService');let fills=0;
const ctx={save(){},restore(){},translate(){},rotate(){},strokeRect(){},fillRect(){fills++},beginPath(){},moveTo(){},lineTo(){},stroke(){}};
const fx={x:100,y:200,tx:400,ty:200,strikeWidth:72,strikeLength:128,animateOutline:true,travelFraction:visual.travelFraction};
c.RuliRulerPresentationService.drawStrike(ctx,fx,1,134/visual.duration);assert.equal(fills,0);c.RuliRulerPresentationService.drawStrike(ctx,fx,1,135/visual.duration);assert.equal(fills,1);
console.log('PASS Ruli 1/4/7단계: 도달 전 피해없음·135ms 전달/채움·발사좌표고정·원격 skipWindup 유지·1회·사망취소·기존즉시범위 유지');
