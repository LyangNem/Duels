

const StatusDamageService=Object.freeze({
  specs:new Map(),
  attack(type){
    if(this.specs.has(type))return this.specs.get(type);

    const spec=Object.freeze({
      id:`status.damage.${type}`,
      damageRatio:0,
      cost:0,
      cd:0,
      range:0,
      modules:Object.freeze([]),
      tags:Object.freeze(['상태 피해',type])
    });

    this.specs.set(type,spec);
    return spec;
  },
  apply({type,source,target,amount,statusLabel=type}){
    if(!target||amount<=0)return {applied:false,amount:0};

    return DamagePipeline.apply({
      source:source||target,
      target,
      attack:this.attack(type),
      amountOverride:amount,
      impact:{
        type:'status',
        status:statusLabel,
        dot:true
      },
      targetPolicy:{
        allowSelf:true,
        allowAllies:true,
        ignoreEvasionInvulnerable:true
      }
    });
  }
});