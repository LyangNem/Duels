

const StackMarkService=Object.freeze({
  KIND:'stack-mark',
  map(entity,create=false){
    if(!entity)return null;
    if(entity.stackMarks instanceof Map)return entity.stackMarks;
    if(!create)return null;
    entity.stackMarks=new Map();
    return entity.stackMarks;
  },
  key(stateKey,targetId){
    return `${String(stateKey||'mark')}:${String(targetId||'')}`;
  },
  apply(source,target,module,now=performance.now()){
    if(!source?.alive||!target?.alive)return false;
    if(RelationService.relation(source,target)!=='enemy')return false;
    const stateKey=String(module.stateKey||'stack-mark');
    const key=this.key(stateKey,target.id);
    const map=this.map(source,true);
    let state=map.get(key)||null;
    const max=Math.max(1,Math.floor(Number(module.max)||1));
    const operation=String(module.operation||'add');
    const amount=Math.max(0,Number(module.amount)||1);
    if(operation==='burst'){
      if(!state)return false;
      return this.burst(source,key,state,target,now,module);
    }
    if(operation==='add-or-burst-at-max'&&state&&Number(state.stacks)>=max){
      return this.burst(source,key,state,target,now,module);
    }
    if(!state){
      state={
        kind:this.KIND,
        stateKey,
        targetId:String(target.id||''),
        stacks:0,
        max,
        expiresAt:0,
        breakDistance:Math.max(0,Number(module.breakDistance)||0),
        burstOnExpire:module.burstOnExpire!==false,
        burstAttackId:String(module.burstAttackId||''),
        burstDamage:module.burstDamage&&typeof module.burstDamage==='object'
          ?EffectSpawnService.definitionSnapshot(module.burstDamage)
          :null,
        presentation:module.presentation&&typeof module.presentation==='object'
          ?EffectSpawnService.definitionSnapshot(module.presentation)
          :null
      };
      map.set(key,state);
    }
    state.max=max;
    state.breakDistance=Math.max(0,Number(module.breakDistance)||state.breakDistance||0);
    if(Object.prototype.hasOwnProperty.call(module,'burstOnExpire')){
      state.burstOnExpire=module.burstOnExpire!==false;
    }
    state.burstAttackId=String(module.burstAttackId||state.burstAttackId||'');
    if(module.burstDamage&&typeof module.burstDamage==='object'){
      state.burstDamage=EffectSpawnService.definitionSnapshot(module.burstDamage);
    }
    if(module.presentation)state.presentation=EffectSpawnService.definitionSnapshot(module.presentation);
    state.stacks=operation==='set-max'
      ?max
      :Math.max(0,Math.min(max,(Number(state.stacks)||0)+amount));
    const duration=Math.max(0,Number(module.duration)||0);
    state.expiresAt=duration>0
      ?now+duration
      :0;
    source.combatSnapshotDirty=true;
    return true;
  },
  remove(source,key){
    const map=this.map(source,false);
    if(!map?.has(key))return false;
    map.delete(key);
    source.combatSnapshotDirty=true;
    return true;
  },
  burst(source,key,state,target,now=performance.now(),module=null){
    if(!source?.alive||!state||!target?.alive){
      this.remove(source,key);
      return false;
    }
    const base=AbilityService.attackById(source.character,state.burstAttackId);
    if(!base){
      this.remove(source,key);
      return false;
    }
    const stacks=Math.max(1,Math.min(Number(state.max)||1,Number(state.stacks)||1));
    const prepared=AugmentService.prepareAttack(
      source,
      ProgressScaledAttackService.resolve(source,base),
      now
    );
    let damageRatio=Math.max(0,Number(prepared.damageRatio)||0)*stacks;
    const burstDamage=module?.burstDamage||state.burstDamage||null;
    if(String(burstDamage?.mode||'')==='progressive-total'){
      const first=Math.max(0,Number(burstDamage.first)||0);
      const step=Math.max(0,Number(burstDamage.step)||0);
      const totalDamage=
        stacks*first+
        step*stacks*(stacks-1)/2;
      const baseDamage=Math.max(
        0.000001,
        Number(source?.character?.baseDamage)||
        Number(source?.baseDamage)||
        1
      );
      damageRatio=totalDamage/baseDamage;
    }
    const spec={
      ...prepared,
      damageRatio,
      markStacks:stacks
    };
    const dx=(Number(target.x)||0)-(Number(source.x)||0);
    const dy=(Number(target.y)||0)-(Number(source.y)||0);
    const angle=Math.atan2(dy,dx);
    this.remove(source,key);
    return TriggeredAttackService.execute(
      source,
      spec,
      angle,
      {
        targetPoint:{x:Number(target.x)||0,y:Number(target.y)||0},
        targetEntityId:String(target.id||'')
      }
    );
  },
  update(source,now=performance.now()){
    const map=this.map(source,false);
    if(!map?.size)return false;
    if(!source.alive){
      map.clear();
      source.combatSnapshotDirty=true;
      return true;
    }
    if(!EntitySimulationAuthorityService.isLocal(source))return false;
    let changed=false;
    for(const [key,state] of [...map]){
      const target=EntityService.items.get(String(state.targetId||''));
      if(!target?.alive){
        this.remove(source,key);
        changed=true;
        continue;
      }
      const dx=(Number(source.x)||0)-(Number(target.x)||0);
      const dy=(Number(source.y)||0)-(Number(target.y)||0);
      const distance=Math.hypot(dx,dy);
      const expired=Number(state.expiresAt)>0&&now>=Number(state.expiresAt);
      const escaped=Number(state.breakDistance)>0&&distance>Number(state.breakDistance);
      if(expired){
        if(state.burstOnExpire===false){
          this.remove(source,key);
        }else{
          this.burst(source,key,state,target,now);
        }
        changed=true;
        continue;
      }
      if(escaped){
        this.burst(source,key,state,target,now);
        changed=true;
      }
    }
    return changed;
  },
  statesForTarget(target,now=performance.now()){
    const result=[];
    if(!target)return result;
    for(const source of EntityService.items.values()){
      const map=this.map(source,false);
      if(!map?.size)continue;
      for(const state of map.values()){
        if(String(state.targetId||'')!==String(target.id||''))continue;
        if(Number(state.expiresAt)>0&&Number(state.expiresAt)<=now)continue;
        result.push({source,state});
      }
    }
    return result;
  },
  serialize(source,now=performance.now()){
    const result=[];
    const map=this.map(source,false);
    if(!map)return result;
    for(const state of map.values()){
      const expiresAt=Math.max(0,Number(state.expiresAt)||0);
      const remaining=expiresAt>0
        ?Math.max(0,expiresAt-now)
        :0;
      if(expiresAt>0&&remaining<=0)continue;
      result.push({
        stateKey:state.stateKey,
        targetId:state.targetId,
        stacks:state.stacks,
        max:state.max,
        remaining,
        breakDistance:state.breakDistance,
        burstOnExpire:state.burstOnExpire!==false,
        burstAttackId:state.burstAttackId,
        burstDamage:state.burstDamage,
        presentation:state.presentation
      });
    }
    return result;
  },
  applyRemote(source,items,now=performance.now()){
    if(!source)return false;
    const map=this.map(source,true);
    map.clear();
    for(const raw of items||[]){
      const targetId=String(raw?.targetId||'');
      const stateKey=String(raw?.stateKey||'stack-mark');
      if(!targetId)continue;
      map.set(this.key(stateKey,targetId),{
        kind:this.KIND,
        stateKey,
        targetId,
        stacks:Math.max(0,Number(raw.stacks)||0),
        max:Math.max(1,Number(raw.max)||1),
        expiresAt:
          Math.max(0,Number(raw.remaining)||0)>0
            ?now+Math.max(0,Number(raw.remaining)||0)
            :0,
        breakDistance:Math.max(0,Number(raw.breakDistance)||0),
        burstOnExpire:raw.burstOnExpire!==false,
        burstAttackId:String(raw.burstAttackId||''),
        burstDamage:raw.burstDamage&&typeof raw.burstDamage==='object'
          ?EffectSpawnService.definitionSnapshot(raw.burstDamage)
          :null,
        presentation:raw.presentation&&typeof raw.presentation==='object'
          ?EffectSpawnService.definitionSnapshot(raw.presentation)
          :null
      });
    }
    return true;
  },
  clear(source){
    const map=this.map(source,false);
    if(!map)return false;
    const had=map.size>0;
    map.clear();
    if(had)source.combatSnapshotDirty=true;
    return had;
  }
});