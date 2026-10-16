

const ModuleValueService=Object.freeze({
  summonFieldModifier(source,reference){
    const stateKey=String(reference?.stateKey||'');
    const stat=String(reference?.stat||'');
    if(!source?.character||!stateKey||!stat)return 0;

    const field=
      source.character.summons?.[stateKey]?.fieldArea;
    if(!field)return 0;

    const modifier=
      (field.onTrigger||[]).find(
        module=>
          module?.type==='modifier.set'&&
          String(module.stat||'')===stat
      );
    if(!modifier)return 0;

    return (
      Number(modifier.value)||0
    )*
    (
      Number.isFinite(Number(reference.multiplier))
        ?Number(reference.multiplier)
        :1
    );
  },

  attackDamage(source,reference){
    const attackId=String(reference?.attackId||'');
    if(!source?.character||!attackId)return 0;

    const baseAttack=
      AbilityService.attackById(
        source.character,
        attackId
      );
    if(!baseAttack)return 0;

    const now=performance.now();
    const prepared=
      AugmentService.prepareAttack(
        source,
        baseAttack,
        now
      );
    const baseDamage=Math.max(
      0,
      Number(source.baseDamage)||
      Number(source.character?.baseDamage)||
      0
    );
    const damageMult=
      source.buffs instanceof Map
        ?CombatStatsService.current(source,now).damageMult
        :1;

    return (
      baseDamage*
      Math.max(
        0,
        Number(prepared.damageRatio)||0
      )*
      Math.max(
        0,
        Number(damageMult)||0
      )*
      (
        Number.isFinite(Number(reference.multiplier))
          ?Number(reference.multiplier)
          :1
      )
    );
  },

  resolve(source,value,reference=null){
    if(reference?.type==='summon-field-modifier'){
      return this.summonFieldModifier(source,reference);
    }
    if(reference?.type==='attack-damage'){
      return this.attackDamage(source,reference);
    }
    return Number(value)||0;
  }
});