

const ModifierLimitService=Object.freeze({
  clamp(type,value){
    const def=COMBAT_BUFF_DEFS[type];
    const raw=Number(value)||0;
    if(!def||def.limitMode==='flat')return raw;

    const min=Number.isFinite(Number(def.min))
      ?Number(def.min)
      :-Infinity;
    const max=Number.isFinite(Number(def.max))
      ?Number(def.max)
      :Infinity;

    return Math.max(min,Math.min(max,raw));
  },
});