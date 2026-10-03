

/* 캐릭터 데이터에 선언된 지속 패시브를 공통 BuffService 값으로 동기화한다.
   스킬 쿨다운을 직접 변경하지 않고 attackRate 등 기존 전투 버프 스탯을 단일 경로로 사용한다. */
const CharacterPassiveBuffService=Object.freeze({
  dataCache:new WeakMap(),
  data(config){
    if(!config||typeof config!=='object')return EMPTY_RUNTIME_ITEMS;
    let data=this.dataCache.get(config);
    if(data)return data;
    data=Object.freeze({tags:config.tags||EMPTY_RUNTIME_ITEMS});
    this.dataCache.set(config,data);
    return data;
  },
  value(entity,ref={}){
    const type=String(ref?.type||'');

    if(type==='health-ratio-cooldown-scale'){
      const maxHealth=Math.max(1,Number(entity?.maxHealth)||1);
      const health=Math.max(0,Math.min(maxHealth,Number(entity?.health)||0));
      const healthRatio=health/maxHealth;
      const baseCooldown=Math.max(1,Number(ref.baseCooldown)||1);
      const minCooldown=Math.max(1,Math.min(baseCooldown,Number(ref.minCooldown)||baseCooldown));
      const targetCooldown=
        minCooldown+
        (baseCooldown-minCooldown)*healthRatio;
      return Math.max(
        0,
        Math.min(.90,1-targetCooldown/baseCooldown)
      );
    }

    if(type==='missing-health-ratio'){
      const maxHealth=Math.max(1,Number(entity?.maxHealth)||1);
      const health=Math.max(0,Math.min(maxHealth,Number(entity?.health)||0));
      const missingRatio=1-health/maxHealth;
      const from=Number.isFinite(Number(ref.from))?Number(ref.from):0;
      const to=Number.isFinite(Number(ref.to))?Number(ref.to):from;
      return from+(to-from)*missingRatio;
    }

    return Number(ref?.value)||0;
  },
  sync(entity){
    if(!entity?.buffs)return false;
    const characterId=String(entity.character?.id||'');
    let changed=false;

    if(entity._passiveBuffCharacterId!==characterId){
      for(const [stat,list] of entity.buffs){
        for(const item of [...list]){
          if(!String(item?.sourceId||'').startsWith('character-passive:'))continue;
          if(BuffService.remove(entity,stat,item.sourceId))changed=true;
        }
      }
      entity._passiveBuffCharacterId=characterId;
    }

    const configs=entity.character?.passiveBuffs||[];
    for(const config of configs){
      const stat=String(config?.stat||'');
      if(!COMBAT_BUFF_DEFS[stat])continue;
      const sourceId=String(
        config.sourceId||
        `character-passive:${entity.character?.id||'character'}:${stat}`
      );
      const conditions=Array.isArray(config?.conditions)?config.conditions:[];
      const conditionsMatch=conditions.every(condition=>
        TriggerConditionService.matches(condition,{
          source:entity,
          target:entity,
          now:performance.now()
        })===true
      );
      if(!conditionsMatch){
        if(BuffService.remove(entity,stat,sourceId))changed=true;
        continue;
      }
      const value=this.value(entity,config.valueRef||{});
      if(
        BuffService.sync(
          entity,
          stat,
          value,
          sourceId,
          this.data(config)
        )
      )changed=true;
    }

    return changed;
  }
});