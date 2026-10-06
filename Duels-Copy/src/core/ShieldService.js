

const ShieldService=Object.freeze({
  maximum(entity){
    return Math.max(0,Number(entity?.maxHealth)||0);
  },
  normalize(entity){
    if(!entity)return 0;
    entity.shield=Math.max(
      0,
      Math.min(
        this.maximum(entity),
        Number(entity.shield)||0
      )
    );
    return entity.shield;
  },
  current(entity){
    return this.normalize(entity);
  },
  grant(entity,amount,source=entity,options={}){
    if(!entity?.alive)return 0;
    const before=this.normalize(entity);
    const value=Math.max(0,Number(amount)||0);
    if(value<=0)return 0;

    const now=Number(options.now)||performance.now();

    entity.shield=Math.min(
      this.maximum(entity),
      ResourceValueService.round(before+value,before)
    );
    const gained=Math.max(0,entity.shield-before);

    if(
      Number.isFinite(Number(options.decayMaxHealthRatio))&&
      Number(options.decayMaxHealthRatio)>0
    ){
      const delay=Math.max(
        0,
        Number(options.decayStartDelay)||0
      );
      const interval=Math.max(
        1,
        Number(options.decayInterval)||1000
      );
      entity.shieldDecay={
        maxHealthRatio:
          Math.max(
            0,
            Number(options.decayMaxHealthRatio)||0
          ),
        interval,
        nextTickAt:now+delay,
        sourceId:String(source?.id||entity.id||'')
      };
      entity.combatSnapshotDirty=true;
    }

    if(gained>0){
      entity.combatSnapshotDirty=true;
      if(Training.sessionMode==='online'&&OnlineDuelService.active&&EntitySimulationAuthorityService.isLocal(entity)){
        OnlineDuelService.lastStateSentAt=0;
      }
      GameEvents.emit('shield-changed',{
        source:source||entity,target:entity,before,after:entity.shield,
        amount:gained,now,reason:String(options.reason||'grant')
      });
    }
    return gained;
  },
  set(entity,amount,source=entity,options={}){
    if(!entity)return 0;
    const before=this.normalize(entity);
    entity.shield=Math.max(
      0,
      Math.min(
        this.maximum(entity),
        ResourceValueService.round(Number(amount)||0,before)
      )
    );
    const delta=entity.shield-before;
    if(entity.shield<=0){
      entity.shieldDecay=null;
    }
    if(Math.abs(delta)>.0001){
      entity.combatSnapshotDirty=true;
      if(Training.sessionMode==='online'&&OnlineDuelService.active&&EntitySimulationAuthorityService.isLocal(entity)){
        OnlineDuelService.lastStateSentAt=0;
      }
      GameEvents.emit('shield-changed',{
        source:source||entity,target:entity,before,after:entity.shield,
        amount:delta,now:performance.now(),reason:String(options.reason||'set')
      });
    }
    return entity.shield;
  },
  absorb(entity,amount,source=null,options={}){
    const value=Math.max(0,Number(amount)||0);
    if(!entity?.alive){
      return {absorbed:0,remaining:value,before:0,after:0};
    }
    const before=this.normalize(entity);
    if(value<=0||before<=0){
      return {absorbed:0,remaining:value,before,after:before};
    }
    const expected=Math.min(before,value);
    entity.shield=Math.max(
      0,
      ResourceValueService.round(before-expected,before)
    );
    const absorbed=Math.max(0,before-entity.shield);
    const remaining=Math.max(0,value-absorbed);
    if(entity.shield<=0){
      entity.shieldDecay=null;
    }
    if(absorbed>0){
      entity.combatSnapshotDirty=true;
      entity.lastDamageTime=Number(options.now)||performance.now();
      if(Training.sessionMode==='online'&&OnlineDuelService.active&&EntitySimulationAuthorityService.isLocal(entity)){
        OnlineDuelService.lastStateSentAt=0;
      }
      GameEvents.emit('shield-changed',{
        source:source||entity,target:entity,before,after:entity.shield,
        amount:-absorbed,now:Number(options.now)||performance.now(),
        reason:String(options.reason||'damage')
      });
    }
    return {absorbed,remaining,before,after:entity.shield};
  },
  update(entity,now=performance.now()){
    if(!entity?.alive)return false;

    const decay=entity.shieldDecay;
    if(!decay)return false;

    if(this.current(entity)<=0){
      entity.shieldDecay=null;
      return false;
    }

    const interval=Math.max(
      1,
      Number(decay.interval)||1000
    );
    let nextTickAt=Number(decay.nextTickAt);

    if(!Number.isFinite(nextTickAt)){
      nextTickAt=now+interval;
    }

    let changed=false;
    let guard=0;

    while(
      now>=nextTickAt&&
      this.current(entity)>0&&
      guard<8
    ){
      const loss=
        this.maximum(entity)*
        Math.max(
          0,
          Number(decay.maxHealthRatio)||0
        );

      if(loss<=0){
        entity.shieldDecay=null;
        break;
      }

      this.set(
        entity,
        this.current(entity)-loss,
        EntityService.items.get(decay.sourceId)||entity,
        {
          now:nextTickAt,
          reason:'shield-decay'
        }
      );

      changed=true;
      nextTickAt+=interval;
      guard++;
    }

    if(entity.shieldDecay){
      entity.shieldDecay.nextTickAt=nextTickAt;
    }

    return changed;
  },
  clear(entity,source=entity,options={}){
    return this.set(entity,0,source,{...options,reason:String(options.reason||'clear')});
  }
});