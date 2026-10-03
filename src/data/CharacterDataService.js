
/* ===== 캐릭터별 단일 원본: 끝 ===== */

const CharacterDataService=Object.freeze({
  read(value,path){
    for(const key of String(path||'').split('.').filter(Boolean)){
      if(key==='__proto__'||key==='prototype'||key==='constructor')throw new Error('허용되지 않은 캐릭터 설정 경로');
      value=value?.[key];
    }
    return value;
  },
  resolve(id,source=CHARACTER_DATA){
    const raw=source[id];
    if(!raw)throw new Error(`캐릭터 설정 없음: ${id}`);
    const active=new Set(),cache=new Map();
    const resolvePath=path=>{
      if(cache.has(path))return cache.get(path);
      if(active.has(path))throw new Error(`캐릭터 설정 순환 참조: ${id}.${path}`);
      const value=this.read(raw,path);
      if(value===undefined)throw new Error(`캐릭터 설정 참조 없음: ${id}.${path}`);
      active.add(path);
      const result=resolveNode(value,path);
      active.delete(path);cache.set(path,result);
      return result;
    };
    const resolveNode=(value,path)=>{
      if(!value||typeof value!=='object')return value;
      if(Object.prototype.hasOwnProperty.call(value,'$ref')){
        const target=resolvePath(value.$ref);
        if(value.$scale!==undefined){
          if(typeof target!=='number')throw new Error(`수치가 아닌 배율 참조: ${id}.${path}`);
          return target*value.$scale;
        }
        return target;
      }
      if(Object.prototype.hasOwnProperty.call(value,'$count')){
        const list=resolvePath(value.$count);
        if(!Array.isArray(list))throw new Error(`배열이 아닌 개수 참조: ${id}.${path}`);
        return value.$types?list.filter(item=>value.$types.includes(item?.type)).length:list.length;
      }
      for(const operation of ['$sum','$product']){
        if(Object.prototype.hasOwnProperty.call(value,operation)){
          const values=value[operation].map((_,index)=>resolvePath(`${path}.${operation}.${index}`));
          if(values.some(item=>typeof item!=='number'))throw new Error(`수치가 아닌 계산 참조: ${id}.${path}`);
          return values.reduce((result,item)=>operation==='$sum'?result+item:result*item,operation==='$sum'?0:1);
        }
      }
      if(Array.isArray(value))return Object.freeze(value.map((item,index)=>resolvePath(`${path}.${index}`)));
      return Object.freeze(Object.fromEntries(Object.keys(value).map(key=>[key,resolvePath(path?`${path}.${key}`:key)])));
    };
    return resolvePath('');
  },
  compile(id,source=CHARACTER_DATA){
    const data=this.resolve(id,source);
    const {stats,classification,extraTags,...definition}=data;
    const style=CHARACTER_RULES.styles[classification.style];
    const role=CHARACTER_RULES.roles[classification.role];
    if(!style||!role||!CHARACTER_RULES.ranges.some(item=>item.id===classification.range)&&classification.range!==0){
      throw new Error(`잘못된 캐릭터 분류: ${id}`);
    }
    for(const key of ['maxHealth','speed','radius','baseDamage']){
      if(!Number.isFinite(stats[key])||stats[key]<0)throw new Error(`잘못된 캐릭터 능력치: ${id}.${key}`);
    }
    const character={
      ...definition,id,stats,classification,...stats,
      difficulty:stats.difficulty,
      moveLabel:CHARACTER_RULES.moveLabels[id]||'보통',
      // 구형 소비자를 위한 파생 문자열. 분류 원본은 classification에만 둔다.
      styleLabel:[style,role].join(' '),
      tags:Object.freeze([...new Set([style,...(extraTags||[]),role])])
    };
    return Object.freeze(character);
  },
  compileAll(source=CHARACTER_DATA){
    return Object.freeze(Object.fromEntries(Object.keys(source).map(id=>[id,this.compile(id,source)])));
  },
  number(value,fallback=0){
    return value!==null&&value!==undefined&&Number.isFinite(Number(value))?Number(value):fallback;
  },
  format(value,format='number'){
    if(typeof value!=='number')throw new Error('설명 수치 참조는 숫자여야 합니다.');
    if(value===Infinity)return '무제한';
    if(!Number.isFinite(value))throw new Error('설명에 유효하지 않은 수치가 있습니다.');
    const number=format==='seconds'?value/1000:format==='percent'?value*100:value;
    return String(Number(number.toFixed(6)));
  },
  interpolate(character,text){
    const data=character?.combat||character;
    return String(text||'').replace(/\{v:([A-Za-z0-9_.-]+)(?:\|(number|seconds|percent))?\}/g,(_,path,format)=>{
      const value=this.read(data,path);
      if(value===undefined)throw new Error(`설명 참조 없음: ${data?.id}.${path}`);
      return this.format(value,format);
    });
  },
  numbers(id){
    const result=[];
    const visit=(value,path)=>{
      if(typeof value==='number')result.push({path,value});
      else if(value&&typeof value==='object')for(const [key,child]of Object.entries(value))visit(child,path?`${path}.${key}`:key);
    };
    visit(this.resolve(id),'');
    return result;
  }
});