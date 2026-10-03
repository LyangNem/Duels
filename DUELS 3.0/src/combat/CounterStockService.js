

const CounterStockService=Object.freeze({
  enabled(entity){
    if(!entity)return false;
    for(const {augment,effect} of AugmentService.effects(entity)){
      if(effect?.type!=='counter.stock')continue;
      if(AugmentService.count(entity,augment.id)>0)return true;
    }
    return false;
  },
  capacity(entity){
    if(!entity)return 1;
    let bonus=0;
    for(const {augment,effect} of AugmentService.effects(entity)){
      if(effect?.type!=='counter.stock')continue;
      const count=Math.max(
        0,
        AugmentService.count(entity,augment.id)
      );
      bonus+=
        Math.max(
          0,
          Number(effect.capacityBonusPerStack)||0
        )*
        count;
    }
    return Math.max(
      1,
      1+Math.floor(bonus)
    );
  },
  acquireAmount(entity){
    if(!entity)return 1;
    let bonus=0;
    for(const {augment,effect} of AugmentService.effects(entity)){
      if(effect?.type!=='counter.stock')continue;
      const count=Math.max(
        0,
        AugmentService.count(entity,augment.id)
      );
      bonus+=
        Math.max(
          0,
          Number(effect.acquireBonusPerStack)||0
        )*
        count;
    }
    return Math.max(
      1,
      1+Math.floor(bonus)
    );
  },


  clearExpired(entity,now=performance.now()){
    if(!entity)return false;
    if((Number(entity.counterReadyUntil)||0)>now)return false;
    entity.counterReadyCharges=0;
    if(Array.isArray(entity.counterReadyChargeKinds)){
      entity.counterReadyChargeKinds.length=0;
    }
    entity._counterSingleKind='normal';
    return true;
  },
  kinds(entity,now=performance.now()){
    if(!entity)return EMPTY_COUNTER_STOCK_KINDS;
    this.clearExpired(entity,now);
    if(!this.enabled(entity)){
      return EMPTY_COUNTER_STOCK_KINDS;
    }
    if(!Array.isArray(entity.counterReadyChargeKinds)){
      entity.counterReadyChargeKinds=[];
    }
    const capacity=this.capacity(entity);
    if(entity.counterReadyChargeKinds.length>capacity){
      entity.counterReadyChargeKinds.splice(
        0,
        entity.counterReadyChargeKinds.length-capacity
      );
    }
    entity.counterReadyCharges=
      entity.counterReadyChargeKinds.length;
    return entity.counterReadyChargeKinds;
  },
  charges(entity,now=performance.now()){
    if(!entity)return 0;
    this.clearExpired(entity,now);
    if(!this.enabled(entity)){
      return (Number(entity.counterReadyUntil)||0)>now
        ?1
        :0;
    }
    return this.kinds(entity,now).length;
  },
  ready(entity,now=performance.now()){
    return this.charges(entity,now)>0;
  },
  peekKind(entity,now=performance.now()){
    if(!entity)return 'normal';
    this.clearExpired(entity,now);
    if(!this.enabled(entity)){
      return String(entity._counterSingleKind||'normal');
    }
    const kinds=this.kinds(entity,now);
    return String(
      kinds[kinds.length-1]||
      'normal'
    );
  },
  acquire(
    entity,
    duration,
    now=performance.now(),
    token=null,
    options={}
  ){
    if(!entity)return 0;
    const normalizedToken=
      token===null||token===undefined
        ?null
        :String(token);

    if(
      normalizedToken!==null&&
      entity._counterStockAcquireToken===normalizedToken
    ){
      return this.charges(entity,now);
    }
    if(normalizedToken!==null){
      entity._counterStockAcquireToken=normalizedToken;
    }

    const window=Math.max(0,Number(duration)||0);
    const kind=String(options.kind||'normal');
    entity._counterStockWindow=window;

    if(this.enabled(entity)){
      const kinds=this.kinds(entity,now);
      const capacity=this.capacity(entity);
      const amount=this.acquireAmount(entity);
      for(
        let index=0;
        index<amount&&kinds.length<capacity;
        index++
      ){
        kinds.push(kind);
      }
      entity.counterReadyCharges=kinds.length;
    }else{
      entity._counterSingleKind=kind;
      entity.counterReadyCharges=0;
    }

    // 기존 충전 반격 효과: 새 반격기를 얻을 때 보유 중인 모든 스톡의 활성 시간을 갱신.
    entity.counterReadyUntil=
      window===Infinity
        ?Infinity
        :now+window;

    const charges=this.charges(entity,now);

    /*
      소환수는 저스트 회피 직후 다음 AI 프레임에서 곧바로 반격을 소비할 수 있다.
      25ms 주기 state packet만 기다리면 상대가 counter-ready 상태를 한 번도
      받지 못하는 경우가 있으므로, 로컬 소환수의 반격 획득은 소유자 state를 즉시 flush한다.
    */
    if(
      entity.kind==='summon'&&
      EntitySimulationAuthorityService.isLocal(entity)&&
      typeof Training!=='undefined'&&
      Training.sessionMode==='online'&&
      typeof OnlineDuelService!=='undefined'&&
      OnlineDuelService.active
    ){
      const owner=EntityService.owner(entity);
      if(owner?.alive&&EntitySimulationAuthorityService.isLocal(owner)){
        OnlineDuelService.lastStateSentAt=0;
        OnlineDuelService.syncLocalState(
          owner,
          performance.now()
        );
      }
    }

    return charges;
  },
  consume(entity,now=performance.now()){
    if(!entity)return 0;
    this.clearExpired(entity,now);

    if(!this.enabled(entity)){
      entity.counterReadyCharges=0;
      entity.counterReadyUntil=0;
      entity._counterSingleKind='normal';
      return 0;
    }

    const kinds=this.kinds(entity,now);
    if(kinds.length>0){
      kinds.pop();
    }
    entity.counterReadyCharges=kinds.length;

    if(kinds.length<=0){
      entity.counterReadyUntil=0;
      return 0;
    }

    const window=Math.max(
      0,
      Number(entity._counterStockWindow)||0
    );
    entity.counterReadyUntil=
      window===Infinity
        ?Infinity
        :now+window;
    return kinds.length;
  },
  setDebugKind(entity,kind='normal'){
    if(!entity)return false;
    const normalized=String(kind||'normal');
    entity._counterStockWindow=Infinity;
    entity.counterReadyUntil=Infinity;
    entity._counterSingleKind=normalized;

    if(this.enabled(entity)){
      if(!Array.isArray(entity.counterReadyChargeKinds)){
        entity.counterReadyChargeKinds=[];
      }
      entity.counterReadyChargeKinds.length=0;
      entity.counterReadyChargeKinds.push(normalized);
      entity.counterReadyCharges=1;
    }else{
      entity.counterReadyCharges=0;
    }
    return true;
  },
  reset(entity){
    if(!entity)return false;
    entity.counterReadyCharges=0;
    entity.counterReadyUntil=0;
    if(Array.isArray(entity.counterReadyChargeKinds)){
      entity.counterReadyChargeKinds.length=0;
    }
    entity._counterSingleKind='normal';
    entity._counterStockAcquireToken=null;
    entity._counterStockWindow=0;
    return true;
  }
});