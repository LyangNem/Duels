

const BuffService=Object.freeze({
  add(entity,type,value,duration,sourceId,data={}){
    if(!entity||!COMBAT_BUFF_DEFS[type])return false;

    const now=performance.now();
    const list=entity.buffs.get(type)||[];
    const end=duration===Infinity
      ?Infinity
      :now+Math.max(0,Number(duration)||0);

    list.push({
      value:Number(value)||0,
      sourceId,
      data:{...(data||{})},
      start:now,
      end
    });

    entity.buffs.set(type,list);
    entity.combatSnapshotDirty=true;
    return true;
  },
  set(entity,type,value,sourceId,duration=Infinity,data={},now=performance.now()){
    if(!entity||!COMBAT_BUFF_DEFS[type])return false;

    const list=entity.buffs.get(type)||[];
    const end=duration===Infinity
      ?Infinity
      :now+Math.max(0,Number(duration)||0);
    const existing=list.find(item=>item.sourceId===sourceId);

    if(existing){
      existing.value=Number(value)||0;
      existing.data={...(data||{})};
      existing.start=now;
      existing.end=end;
    }else{
      list.push({
        value:Number(value)||0,
        sourceId,
        data:{...(data||{})},
        start:now,
        end
      });
    }

    entity.buffs.set(type,list);
    entity.combatSnapshotDirty=true;
    return true;
  },
  refresh(entity,type,value,sourceId,duration=Infinity,data={}){
    if(!entity||!COMBAT_BUFF_DEFS[type])return false;

    const list=entity.buffs.get(type)||[];
    const now=performance.now();
    const end=duration===Infinity
      ?Infinity
      :now+Math.max(0,Number(duration)||0);
    const existing=list.find(item=>item.sourceId===sourceId);

    if(existing){
      existing.value=Number(value)||0;
      existing.end=end;
      existing.data={
        ...(existing.data||{}),
        ...(data||{})
      };
    }else{
      const tickInterval=Math.max(
        1,
        Number(data?.tickInterval)||250
      );
      list.push({
        value:Number(value)||0,
        sourceId,
        data:{
          ...(data||{}),
          nextTick:now+tickInterval
        },
        start:now,
        end
      });
    }

    entity.buffs.set(type,list);
    entity.combatSnapshotDirty=true;
    return true;
  },
  remove(entity,type,sourceId){
    if(!entity)return false;

    const list=entity.buffs.get(type)||[];
    let write=0;
    let removed=false;

    for(let read=0;read<list.length;read++){
      const item=list[read];

      if(item.sourceId===sourceId){
        removed=true;
        continue;
      }

      list[write++]=item;
    }

    list.length=write;

    if(list.length)entity.buffs.set(type,list);
    else entity.buffs.delete(type);

    if(removed){
      entity.combatSnapshotDirty=true;
    }
    return removed;
  },
  sync(entity,type,value,sourceId,data={}){
    if(!entity||!COMBAT_BUFF_DEFS[type])return false;

    const normalized=Number(value)||0;
    if(Math.abs(normalized)<=1e-9){
      return this.remove(entity,type,sourceId);
    }

    const list=entity.buffs.get(type)||[];
    const existing=list.find(item=>item.sourceId===sourceId);
    if(
      existing&&
      existing.end===Infinity&&
      Math.abs((Number(existing.value)||0)-normalized)<=1e-9
    ){
      return false;
    }

    return this.set(
      entity,
      type,
      normalized,
      sourceId,
      Infinity,
      data
    );
  },
  hasSource(entity,type,sourceId,now=performance.now()){
    return !!entity&&this.live(entity,type,now).some(
      item=>item.sourceId===sourceId
    );
  },
  live(entity,type,now=performance.now()){
    if(!entity)return EMPTY_RUNTIME_ITEMS;

    const list=entity.buffs.get(type);
    if(!list?.length)return EMPTY_RUNTIME_ITEMS;

    let write=0;

    for(let read=0;read<list.length;read++){
      const item=list[read];

      if(item.end<=now)continue;
      list[write++]=item;
    }

    const removed=list.length-write;
    list.length=write;

    if(list.length)entity.buffs.set(type,list);
    else entity.buffs.delete(type);
    if(removed>0){
      entity.combatSnapshotDirty=true;
    }

    return list;
  },
  resolveRaw(entity,type,now=performance.now()){
    const list=this.live(entity,type,now);
    if(COMBAT_BUFF_DEFS[type]?.toggleOnly===true){
      return list.length>0?1:0;
    }

    let total=0;

    for(const item of list){
      total+=Number(item.value)||0;
    }

    return total;
  },
  resolve(entity,type,now=performance.now()){
    return ModifierLimitService.clamp(
      type,
      this.resolveRaw(entity,type,now)
    );
  },
  remaining(entity,type,now=performance.now()){
    const list=this.live(entity,type,now);
    let longest=0;

    for(const item of list){
      if(item.end===Infinity)return Infinity;
      longest=Math.max(longest,Math.max(0,item.end-now));
    }

    return longest;
  },
  presentationOpacity(entity,now=performance.now()){
    if(!entity?.buffs?.size)return 1;

    let opacity=1;
    for(const [type] of entity.buffs){
      const value=Number(COMBAT_BUFF_DEFS[type]?.presentation?.opacity);
      if(!Number.isFinite(value)||!this.live(entity,type,now).length)continue;
      opacity=Math.min(opacity,Math.max(0,Math.min(1,value)));
    }
    return opacity;
  },
  visualEntry(entity,type,now=performance.now()){
    const list=this.live(entity,type,now);
    let best=null;

    for(const item of list){
      const remaining=item.end===Infinity
        ?Infinity
        :Math.max(0,item.end-now);

      if(!best){
        best={item,remaining};
        continue;
      }

      const bestRank=best.remaining===Infinity
        ?-Infinity
        :best.remaining;
      const rank=remaining===Infinity
        ?-Infinity
        :remaining;

      if(
        rank>bestRank||
        (
          rank===bestRank&&
          item.start>(best.item.start||0)
        )
      ){
        best={item,remaining};
      }
    }

    return best;
  },
  applyToStats(entity,stats,now=performance.now()){
    const damage=this.resolve(entity,'damage',now);
    const defense=this.resolve(entity,'defense',now);
    const speed=this.resolve(entity,'speed',now);
    const regenDelay=this.resolve(entity,'regenDelay',now);
    const regenFlat=this.resolve(entity,'regenFlat',now);
    const regenPercent=this.resolve(entity,'regenPercent',now);
    const staminaRegen=this.resolve(entity,'staminaRegen',now);
    const staminaCost=this.resolve(entity,'staminaCost',now);
    const attackRate=this.resolve(entity,'attackRate',now);
    const projectileSpeed=this.resolve(entity,'projectileSpeed',now);
    const dodgeDistance=this.resolve(entity,'dodgeDistance',now);
    const dodgeSpeed=this.resolve(entity,'dodgeSpeed',now);
    const healing=this.resolve(entity,'healing',now);

    stats.damageMult*=Math.max(0,1+damage);
    stats.damageTakenMult*=Math.max(.05,1-defense);
    stats.speedMult*=Math.max(0,1+speed);
    stats.regenDelayMult*=Math.max(0,1+regenDelay);
    stats.regenFlatPerSec+=regenFlat;
    stats.regenPercentPerSec+=regenPercent;
    stats.staminaRegenAdditive+=staminaRegen;
    stats.staminaCostMult*=Math.max(0,1+staminaCost);
    // attackRate는 공격 딜레이의 직접 증감률이다. +0.35는 딜레이 -35%, -0.15는 딜레이 +15%.
    stats.attackSpeedMult*=
      1/Math.max(.10,1-attackRate);
    stats.projectileSpeedMult*=Math.max(0,1+projectileSpeed);
    stats.dodgeDistanceMult*=Math.max(0,1+dodgeDistance);
    stats.dodgeSpeedMult*=Math.max(0,1+dodgeSpeed);
    stats.healingMult*=Math.max(0,1+healing);

    return stats;
  }
});