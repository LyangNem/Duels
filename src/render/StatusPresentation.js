

/* 상태 시각화 */
const StatusPresentation=Object.freeze({
  cc:Object.freeze({
    freeze:Object.freeze({label:'FREEZE',rgb:'122,238,255'}),
    sleep:Object.freeze({label:'SLEEP',rgb:'255,105,180'}),
    silence:Object.freeze({label:'SILENCE',rgb:'190,170,225'}),
    stun:Object.freeze({label:'STUN',rgb:'255,0,0'}),
    revive:Object.freeze({label:'REVIVE',rgb:'225,225,255'}),
    neutralize:Object.freeze({label:'KNOCKDOWN',rgb:'210,215,220'}),
    bind:Object.freeze({label:'BIND',rgb:'170,90,255'}),
    discharge:Object.freeze({label:'DISCHARGE',rgb:'255,195,30'}),
    zap:Object.freeze({label:'ZAP',rgb:'255,225,40'}),
    burn:Object.freeze({label:'BURN',rgb:'255,150,0'}),
    poison:Object.freeze({label:'POISON',rgb:'50,200,80'}),
    bleed:Object.freeze({label:'BLEED',rgb:'150,0,25'}),
    slow:Object.freeze({label:'SLOW',rgb:'100,190,255'})
  }),

  formatCc(type,item,entity=null,now=performance.now()){
    if(type==='poison'){
      const value=Math.max(
        0,
        Number(item.data?.value)||0
      );
      return `POISON ${Math.round(value*100)}%/s`;
    }

    if(type==='burn'){
      const entries=entity
        ?CCService.live(entity,'burn',now)
        :[item];
      let perSecond=0;
      for(const entry of entries){
        const interval=Math.max(
          1,
          Number(entry?.data?.interval)||
          STATUS_EFFECT_RULES.burn.interval
        );
        const flat=Math.max(
          0,
          CharacterDataService.number(entry?.data?.flat,STATUS_EFFECT_RULES.burn.flatDamage)
        );
        const stackCount=
          Math.max(
            1,
            Number(entry?.data?.stackCount)||1
          );
        perSecond+=flat*stackCount*1000/interval;
      }
      return `BURN ${Math.round(perSecond)}/s`;
    }

    return this.cc[type]?.label||type.toUpperCase();
  },

  cache:new WeakMap(),

  appliedAt(item){
    const presentationAt=Number(item?.data?.presentationAppliedAt);
    return Number.isFinite(presentationAt)
      ?presentationAt
      :Number(item?.start)||0;
  },

  presentationStart(item){
    const presentationStart=Number(item?.data?.presentationStartedAt);
    return Number.isFinite(presentationStart)
      ?presentationStart
      :Number(item?.start)||0;
  },

  presentationOrder(item){
    const order=Number(item?.data?.presentationOrder);
    return Number.isFinite(order)
      ?order
      :0;
  },

  selected(entity,now=performance.now()){
    if(!entity?.statuses?.size)return null;

    let cache=this.cache.get(entity);
    if(!cache){
      cache={now:-1,revision:-1,active:false,type:'',item:null,appliedAt:0,rgb:''};
      this.cache.set(entity,cache);
    }

    const revision=Number(entity.statusPresentationRevision)||0;
    if(
      cache.now===now&&
      cache.revision===revision
    )return cache.active?cache:null;

    cache.now=now;
    cache.revision=revision;
    cache.active=false;
    cache.type='';
    cache.item=null;
    cache.appliedAt=0;
    cache.rgb='';

    let latestStart=0;
    let latestOrder=0;

    for(const [type] of entity.statuses){
      const style=this.cc[type];
      if(!style)continue;

      for(const item of CCService.live(entity,type,now)){
        if(item.end<=now)continue;

        const appliedAt=this.appliedAt(item);
        const start=this.presentationStart(item);
        const order=this.presentationOrder(item);
        if(cache.active){
          const hasOrder=order>0;
          const latestHasOrder=latestOrder>0;

          if(hasOrder&&latestHasOrder){
            if(
              order<latestOrder||
              (order===latestOrder&&start<=latestStart)
            )continue;
          }else if(hasOrder!==latestHasOrder){
            // presentationOrder가 있는 항목은 대상 권위의 정식 CC chronology다.
            if(!hasOrder)continue;
          }else if(
            appliedAt<cache.appliedAt||
            (appliedAt===cache.appliedAt&&start<=latestStart)
          ){
            continue;
          }
        }

        cache.active=true;
        cache.type=type;
        cache.item=item;
        cache.appliedAt=appliedAt;
        cache.rgb=item.data?.presentationColor
          ?String(item.data.presentationColor)
          :style.rgb;
        latestStart=start;
        latestOrder=order;
      }
    }

    return cache.active?cache:null;
  },

  labelBottomY(entity){
    // Van은 체력바 위에 스패너 내구도 바가 한 줄 더 있으므로
    // 이름과 같은 만큼 CC 라벨도 위로 올려 기존 간격을 유지한다.
    const wrenchBarOffset=
      Number(entity?.character?.wrenchDurability?.max)>0
        ?7
        :0;
    return entity.y-entity.radius-48-wrenchBarOffset;
  },

  topLabelY(entity,now=performance.now()){
    return this.selected(entity,now)
      ?this.labelBottomY(entity)
      :this.labelBottomY(entity)+13;
  },

  draw(ctx,entity,now){
    const selected=this.selected(entity,now);
    if(!selected)return;

    const pulse=.5+.5*Math.sin(now*.012);

    ctx.save();

    ctx.beginPath();
    ctx.arc(
      entity.x,
      entity.y,
      EntityRingLayoutService.statusRadius(entity,now),
      0,
      Math.PI*2
    );
    ctx.strokeStyle=
      `rgba(${selected.rgb},${.62+.22*pulse})`;
    ctx.lineWidth=3;
    ctx.setLineDash([5,3]);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.font='800 10px Pretendard, "Noto Sans KR", Arial, sans-serif';
    ctx.textAlign='center';
    ctx.fillStyle=`rgba(${selected.rgb},.94)`;
    ctx.fillText(
      this.formatCc(
        selected.type,
        selected.item,
        entity,
        now
      ),
      entity.x,
      this.labelBottomY(entity)
    );

    ctx.restore();
  }
});