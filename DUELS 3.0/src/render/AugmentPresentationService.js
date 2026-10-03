


/* 증강 표시 */
const AugmentPresentationService=Object.freeze({
  cache:new WeakMap(),
  work(entity){
    let work=this.cache.get(entity);
    if(work)return work;

    work={
      bars:[],
      pool:[],
      seen:new Set()
    };
    this.cache.set(entity,work);
    return work;
  },
  chargeBars(entity,now=performance.now()){
    if(!entity)return EMPTY_AUGMENT_EFFECTS;

    const work=this.work(entity);
    const bars=work.bars;
    const seen=work.seen;
    bars.length=0;
    seen.clear();

    let index=0;

    for(const {augment,effect} of AugmentService.effects(entity)){
      const presentationType=String(effect.presentation?.type||'');
      const cooldownBar=
        effect.type==='cooldown'&&
        presentationType==='charge-bar';
      const stockSegments=
        effect.type==='counter.stock'&&
        presentationType==='stock-segments';
      if(!cooldownBar&&!stockSegments)continue;

      const key=
        `${augment.id}:${effect.id||effect.type||'effect'}`;
      if(seen.has(key))continue;
      seen.add(key);

      let bar=work.pool[index];
      if(!bar){
        bar={state:{}};
        work.pool[index]=bar;
      }

      bar.id=key;
      bar.augmentId=augment.id;
      bar.emoji=augment.emoji||'◆';

      if(stockSegments){
        const count=CounterStockService.charges(entity,now);
        if(count<=0)continue;
        bar.type='stock-segments';
        bar.count=count;
        bar.kinds=
          CounterStockService.kinds(
            entity,
            now
          );
        bar.duration=0;
        bar.progress=1;
        bar.ready=true;
      }else{
        const state=AugmentCooldownService.state(
          entity,
          augment,
          effect,
          now,
          bar.state
        );
        bar.type='charge-bar';
        bar.count=0;
        bar.duration=state.duration;
        bar.progress=state.progress;
        bar.ready=state.ready;
      }

      bars.push(bar);
      index++;
    }

    return bars;
  }
});