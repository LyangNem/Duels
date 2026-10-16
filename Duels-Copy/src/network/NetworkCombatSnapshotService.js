

const NetworkCombatSnapshotService=Object.freeze({
  serializeTimedMap(map,now=performance.now()){
    const result={};
    if(!(map instanceof Map))return result;

    for(const [type,list] of map){
      if(!Array.isArray(list)||!list.length)continue;
      const items=[];

      for(const item of list){
        if(!item)continue;
        const endTime=NetworkTimeValueService.serializeDeadline(
          item.end,
          now
        );
        if(!endTime.infinite&&endTime.remaining<=0)continue;

        const startValue=Number(item.start);
        const startAge=Math.max(
          0,
          now-(Number.isFinite(startValue)?startValue:now)
        );

        let nextTickRemaining=null;
        let nextTickInfinite=false;
        if(item.nextTick!==undefined){
          const nextTick=NetworkTimeValueService.serializeDeadline(
            item.nextTick,
            now
          );
          nextTickRemaining=nextTick.remaining;
          nextTickInfinite=nextTick.infinite;
        }

        items.push({
          value:NetworkTimeValueService.finite(item.value,0),
          sourceId:item.sourceId||null,
          sourceEntityId:item.sourceEntityId||null,
          startAge,
          remaining:endTime.remaining,
          infinite:endTime.infinite,
          nextTickRemaining,
          nextTickInfinite,
          releaseApplied:item.releaseApplied===true,
          data:{...(item.data||{})}
        });
      }

      if(items.length)result[type]=items;
    }

    return result;
  },
  serialize(entity,now=performance.now()){
    if(!entity)return {statuses:{},buffs:{}};
    return {
      shield:ShieldService.current(entity),
      statuses:this.serializeTimedMap(entity.statuses,now),
      buffs:this.serializeTimedMap(entity.buffs,now),
      stackMarks:StackMarkService.serialize(entity,now)
    };
  },
  restoreTimedMap(serialized,{status=false,now=performance.now()}={}){
    const map=new Map();
    if(!serialized||typeof serialized!=='object')return map;

    for(const [type,rawItems] of Object.entries(serialized)){
      if(!Array.isArray(rawItems))continue;
      const items=[];

      for(const raw of rawItems){
        if(!raw)continue;
        const remaining=NetworkTimeValueService.finite(
          raw.remaining,
          0
        );
        const infinite=raw.infinite===true;
        if(!infinite&&remaining<=0)continue;

        const data={...(raw.data||{})};

        const item={
          value:NetworkTimeValueService.finite(raw.value,0),
          sourceId:raw.sourceId||null,
          sourceEntityId:raw.sourceEntityId||null,
          start:now-Math.max(
            0,
            NetworkTimeValueService.finite(raw.startAge,0)
          ),
          end:NetworkTimeValueService.restoreDeadline(
            remaining,
            infinite,
            now
          ),
          data
        };

        if(status){
          if(raw.nextTickInfinite===true){
            item.nextTick=Infinity;
          }else{
            item.nextTick=
              raw.nextTickRemaining===null||
              raw.nextTickRemaining===undefined
                ?now+Math.max(
                  1,
                  NetworkTimeValueService.finite(
                    data.interval,
                    1000
                  )
                )
                :now+Math.max(
                  0,
                  NetworkTimeValueService.finite(
                    raw.nextTickRemaining,
                    0
                  )
                );
          }
          item.releaseApplied=raw.releaseApplied===true;
        }

        items.push(item);
      }

      if(items.length)map.set(type,items);
    }

    return map;
  },
  apply(entity,snapshot,now=performance.now()){
    if(!entity||!snapshot||typeof snapshot!=='object')return false;

    entity.shield=Math.max(
      0,
      Math.min(
        Math.max(0,Number(entity.maxHealth)||0),
        Number(snapshot.shield)||0
      )
    );
    entity.statuses=this.restoreTimedMap(
      snapshot.statuses,
      {status:true,now}
    );
    entity.buffs=this.restoreTimedMap(
      snapshot.buffs,
      {status:false,now}
    );
    StackMarkService.applyRemote(
      entity,
      Array.isArray(snapshot.stackMarks)?snapshot.stackMarks:[],
      now
    );
    return true;
  }
});