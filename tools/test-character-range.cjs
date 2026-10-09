/* 실제 데이터/서비스를 로드하는 구조 검사 및 회귀 검사. 브라우저/E2E 검사를 대체하지 않는다. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');let passed=0;
const c=vm.createContext({console,Map,Set,WeakMap,WeakSet,Math,performance:{now:()=>1000},EMPTY_RUNTIME_ITEMS:[],EMPTY_AUGMENT_EFFECTS:[],attackTagMetadataCache:new WeakMap(),attackTagCache:new WeakMap()});
function load(file,name){vm.runInContext(fs.readFileSync(path.join(root,file),'utf8')+`;globalThis.${name}=${name};`,c)}
function test(name,fn){fn();passed++;console.log('PASS '+name)}
for(const name of ['characterValue','characterCount','characterSum','characterProduct','freezeCharacterData','CHARACTER_RULES','STATUS_EFFECT_RULES'])load('src/data/'+name+'.js',name);
const index=JSON.parse(fs.readFileSync(path.join(root,'src/data/characters/index.json'),'utf8'));c.CHARACTER_DATA={};
for(const entry of index.characters){const source=fs.readFileSync(path.join(root,entry.path),'utf8');const raw=vm.runInContext('('+source+')',c);c.CHARACTER_DATA[raw.id]=raw;}
load('src/data/CharacterDataService.js','CharacterDataService');const chars=c.CharacterDataService.compileAll();

for(const name of ['TimedActionStateService','RuntimeValueReferenceProviders','ProgressStateService','ModeStateService','RuntimeValueReferenceService','TriggerConditionService'])load('src/core/'+name+'.js',name);
load('src/combat/ProgressScaledAttackService.js','ProgressScaledAttackService');
c.AttackModuleService={type:module=>module.type};
c.GAME_DATA={characters:chars,ranges:c.CHARACTER_RULES.ranges};load('src/core/CharacterSortService.js','CharacterSortService');const sort=c.CharacterSortService;
const area=(id,range,extra={})=>({id,range,damageRatio:1,modules:[{type:'delivery.area',shape:'circle',range}],...extra});
const combat=(...attacks)=>({attacks:Object.fromEntries(attacks.map(a=>[a.id,a]))});
test('폭발은 탄환 이동거리 뒤 실제 피해 반경 포함',()=>{const boom=area('boom',100),a={id:'a',range:650,damageRatio:0,modules:[{type:'delivery.projectile',damageOnTravel:false},{type:'projectile.impact',attackIds:['boom']}]};assert.equal(sort.attackMaxRange(a,combat(a,boom)),750)});
test('피해 없는 이동/회복/장식 거리 제외',()=>{assert.equal(sort.attackMaxRange({range:2000,damageRatio:0,modules:[{type:'movement.move',distance:2000},{type:'effect.spawn',range:2000}]}),0)});
test('피해 없는 차징 설치 거리 제외 / 실제 차징 범위 반영',()=>{const a=area('a',100);a.charge={range:{from:100,to:200},fullSpec:{range:1000,damageRatio:0,modules:[{type:'obstacle.wall-deploy',maxRange:1000}]}};assert.equal(sort.attackMaxRange(a),200)});
test('스케일 중심 이동/원형 반복 중심을 실제 외곽까지 계산',()=>{const a=area('a',90,{progressScale:{range:{from:90,to:522},moduleValues:[{type:'delivery.area',property:'centerDistance',from:54,to:486}]}});a.modules[0]={type:'delivery.area',shape:'rect',range:72,centerDistance:54,rectCenterMode:'center'};assert.equal(sort.attackMaxRange(a),522);const b=area('b',20);Object.assign(b.modules[0],{repeatCount:3,repeatCenterDistanceStart:50,repeatCenterDistanceStep:40});assert.equal(sort.attackMaxRange(b),150)});
test('준비 창의 실제 후속 공격 참조 / 순환 참조 종료',()=>{const a={id:'a',range:900,damageRatio:0,modules:[{type:'state.window',resolveAttackIds:{normal:'b',loop:'a'}}]},b=area('b',250);assert.equal(sort.attackMaxRange(a,combat(a,b)),250)});
test('착탄 후속 투사체와 폭발의 중첩 도달 범위',()=>{const boom=area('boom',50),b={id:'b',range:300,damageRatio:1,modules:[{type:'delivery.projectile'},{type:'projectile.impact',attackIds:['boom']}]},a={id:'a',range:200,damageRatio:0,modules:[{type:'delivery.projectile'},{type:'projectile.impact',attackIds:['b']}]};assert.equal(sort.attackMaxRange(a,combat(a,b,boom)),550)});
test('지속 장판 피해는 포함 / 아군 회복 폭발은 제외',()=>{const tick={id:'tick',damageRatio:1,range:0,modules:[]},heal=area('heal',999);heal.modules[0].targetRelations=['ally'];const a={id:'a',range:500,damageRatio:0,modules:[{type:'delivery.projectile'},{type:'projectile.impact',attackIds:['heal'],field:{shape:'circle',range:90,attackId:'tick',damageOnTrigger:true}}]};assert.equal(sort.attackMaxRange(a,combat(a,tick,heal)),590)});
test('이동 피해는 이동거리+접촉 반경 / 타격 뒤 이동은 제외',()=>{const a={id:'a',range:500,damageRatio:1,modules:[{type:'movement.move',distance:120},{type:'effect.spawn',damage:{hitMode:'body-contact',requireMovementExecution:true,contactRadius:40}}]};assert.equal(sort.attackMaxRange(a),160);assert.equal(sort.basicRange(chars.yui),144)});
test('실제62명 사거리와 순서 변화 검수',()=>{assert.equal(Object.keys(chars).length,62);const expected={van:220,geopin:650,intu:650,meramona:550,ruli:522,quri:150,raise:192,deltroove:170,reika:350,lime:170,hapupu:240,sherbet:294,terdion:970,kines:900,elin:1204,nyu:210,tinya:Infinity};for(const [id,value] of Object.entries(expected))assert.equal(sort.basicRange(chars[id]),value,id);for(const ch of Object.values(chars))assert.ok(sort.basicRange(ch)>0,ch.id)});
test('초기 무기 선택 / 대체 공격의 기본값 제외',()=>{for(const [id,attack] of [['van','attack.van.lmb'],['reika','attack.reika.lmb'],['geopin','attack.geopin.lmb'],['intu','attack.intu.pistol']]){assert.ok(sort.primaryAttacks(chars[id]).some(a=>a.id===attack),id);assert.equal(sort.primaryAttacks(chars[id]).length,id==='intu'?2:1,id)}});
test('초기 상태와 공간 조건을 구분 / 가호 전용 후속 제외',()=>{
 const base={...area('base',100),tags:['평타']},enhanced={...area('enhanced',500),tags:['평타']},near={...area('near',70),tags:['평타']},wave={...area('wave',900),tags:['평타']};
 const ch={...combat(base,enhanced,near,wave),abilities:{lmb:{attackId:'base',trigger:{modules:[{type:'action.attack',alternates:[{attackId:'enhanced',conditions:[{type:'state.mode-is',stateKey:'weapon',initial:'base',value:'enhanced'}]},{attackId:'near',conditions:[{type:'attack.proximity-near'}]}]},{type:'action.trigger-attack',attackId:'wave',requireAttackId:'enhanced'}]}}}};
 assert.equal(sort.basicRange(ch),100);assert.deepEqual(Array.from(sort.primaryAttacks(ch),a=>a.id),['near','base']);
});
test('정렬용 초기 진행도는 공유 서비스로 생성 / 원본 데이터 유지',()=>{
 const raw=JSON.stringify(chars.van),source=sort.initialSource(chars.van.combat||chars.van);
 assert.equal(c.ProgressStateService.state(source,'van-wrench-durability').value,800);
 source.actionState.clear();assert.equal(sort.basicRange(chars.van),220);assert.equal(JSON.stringify(chars.van),raw);
 assert.equal(sort.basicRange(chars.reika),350);assert.equal(sort.basicRange(chars.geopin),650);
});
test('미성장 사거리와 스타일 표시 같은 기준 / 고정 분류 우회',()=>{
 for(const [id,range,tag] of [['meramona',550,'중거리'],['quri',150,'초근거리'],['geopin',650,'중거리'],['ruli',522,'중거리'],['reika',350,'근거리'],['van',220,'근거리']]){
  assert.equal(sort.basicRange(chars[id]),range,id);assert.equal(sort.distanceTag(chars[id]),tag,id);assert.ok(sort.styleLabel(chars[id]).includes(tag),id);
 }
 for(const ch of Object.values(chars)){
  const expected=c.CHARACTER_RULES.ranges.find(item=>sort.basicRange(ch)<=item.maxInclusive).tag;
  assert.equal(sort.distanceTag(ch),expected,ch.id);
 }
});
test('카드 카탈로그도 구형 스타일 문자열보다 공통 분류 사용',()=>{
 c.ProfileCharacterService={get:id=>chars[id]};c.TagService={characterStyleLabel:ch=>sort.styleLabel(ch)};
 load('src/ui/CharacterCardDataService.js','CharacterCardDataService');
 for(const id of ['meramona','quri','geopin'])assert.equal(c.CharacterCardDataService.get(id).styleLabel,sort.styleLabel(chars[id]),id);
});
test('직접 조절/차징 평타는 최대 / 성장 범위만 초기',()=>{
 assert.equal(sort.basicRange(chars.raise),192);assert.equal(sort.basicRange(chars.ruli),522);
 assert.equal(sort.basicRange(chars.quri),150);assert.equal(sort.basicRange(chars.meramona),550);assert.equal(sort.basicRange(chars.geopin),650);
 assert.equal(sort.distanceTag(chars.raise),'근거리');assert.equal(sort.distanceTag(chars.ruli),'중거리');
 assert.equal(sort.basicRange(chars.hatsuhats),575);
 const scaled={...area('scaled',100),tags:['평타'],progressScale:{range:{from:100,to:600}}};
 const ch={...combat(scaled),abilities:{lmb:{attackId:'scaled',trigger:{modules:[{type:'action.attack'}]}}}};
 assert.equal(sort.basicRange(ch),600);scaled.progressScale.rangeBasis='initial';assert.equal(sort.basicRange(ch),100);
 const charged={...area('charged',100),tags:['평타'],charge:{range:{from:100,to:700}}};
 assert.equal(sort.basicRange({...combat(charged),abilities:{lmb:{attackId:'charged',trigger:{modules:[{type:'action.attack'}]}}}}),700);
});
console.log(`PASS ${passed} character range groups / 62 characters`);
