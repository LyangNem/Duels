
const CCService=Object.freeze({
  touchPresentation(entity){
    if(!entity)return;
    entity.statusPresentationRevision=
      (Number(entity.statusPresentationRevision)||0)+1;
  },
  add(entity,type,duration,sourceId,data={}){
    if(!entity||!COMBAT_STATUS_DEFS[type])return false;

    const now=performance.now();
    const list=entity.statuses.get(type)||[];
    const params=CombatModifierService.statusParams(type,data);
    const finiteDuration=duration===Infinity
      ?Infinity
      :Math.max(0,Number(duration)||0);

    // Maintaining an active CC instance is not a new restriction event.
    const refreshesRestriction=
      (params.stackMode==='replace-source'||params.stackMode==='refresh-type')&&
      list.some(item=>item.end>now&&item.sourceId===sourceId);
    if(!refreshesRestriction&&entity.character?.reactiveEquipment&&finiteDuration>0&&EntitySimulationAuthorityService.isLocal(entity))ReactiveEquipmentService.restriction(entity,type,String(data?.sourceEntityId||sourceId||''),now);

    let storedParams=params;

    if(params.stackMode==='refresh-type'){
      let primary=null;
      const preserved=[];
      for(const item of list){
        if(item.end<=now)continue;

        if(item.data?.stackMode==='stack-count-source'){
          preserved.push(item);
          continue;
        }

        if(
          !primary||
          Number(item.nextTick)<Number(primary.nextTick)
        ){
          primary=item;
        }
      }
      if(primary){
        primary.sourceId=sourceId;
        primary.sourceEntityId=
          data?.sourceEntityId||
          (EntityService.items.has(sourceId)?sourceId:null);
        primary.end=finiteDuration===Infinity
          ?Infinity
          :now+finiteDuration;
        storedParams={
          ...params,
          presentationAppliedAt:
            Number.isFinite(Number(primary.data?.presentationAppliedAt))
              ?Number(primary.data.presentationAppliedAt)
              :params.presentationAppliedAt,
          presentationStartedAt:
            Number.isFinite(Number(primary.data?.presentationStartedAt))
              ?Number(primary.data.presentationStartedAt)
              :params.presentationStartedAt,
          presentationOrder:
            Number.isFinite(Number(primary.data?.presentationOrder))
              ?Number(primary.data.presentationOrder)
              :params.presentationOrder
        };
        primary.data=storedParams;
        list.length=0;
        list.push(primary,...preserved);
        entity.statuses.set(type,list);
        entity.combatSnapshotDirty=true;
        this.touchPresentation(entity);
        return true;
      }
    }

    if(params.stackMode==='stack-count-source'){
      const refreshedEnd=
        finiteDuration===Infinity
          ?Infinity
          :now+finiteDuration;

      for(const item of list){
        if(
          item.end<=now||
          item.sourceId!==sourceId||
          item.data?.stackMode!=='stack-count-source'
        )continue;

        item.end=refreshedEnd;
        item.data={
          ...(item.data||{}),
          ...params,
          stackCount:
            Math.max(
              1,
              Number(item.data?.stackCount)||1
            )+1
        };
        entity.statuses.set(type,list);
        entity.combatSnapshotDirty=true;
        this.touchPresentation(entity);
        return true;
      }

      storedParams={
        ...params,
        stackCount:1
      };
    }

    if(params.stackMode==='replace-source'){
      let preservedPresentation=null;
      let write=0;
      for(let read=0;read<list.length;read++){
        const item=list[read];
        if(item.sourceId===sourceId){
          if(!preservedPresentation){
            preservedPresentation={
              presentationAppliedAt:item.data?.presentationAppliedAt,
              presentationStartedAt:item.data?.presentationStartedAt,
              presentationOrder:item.data?.presentationOrder
            };
          }
          continue;
        }
        list[write++]=item;
      }
      list.length=write;

      if(preservedPresentation){
        storedParams={
          ...params,
          presentationAppliedAt:
            Number.isFinite(Number(preservedPresentation.presentationAppliedAt))
              ?Number(preservedPresentation.presentationAppliedAt)
              :params.presentationAppliedAt,
          presentationStartedAt:
            Number.isFinite(Number(preservedPresentation.presentationStartedAt))
              ?Number(preservedPresentation.presentationStartedAt)
              :params.presentationStartedAt,
          presentationOrder:
            Number.isFinite(Number(preservedPresentation.presentationOrder))
              ?Number(preservedPresentation.presentationOrder)
              :params.presentationOrder
        };
      }
    }

    if(!Number.isFinite(Number(storedParams.presentationOrder))){
      storedParams={
        ...storedParams,
        presentationOrder:nextCcPresentationOrder()
      };
    }

    list.push({
      sourceId,
      sourceEntityId:
        data?.sourceEntityId||
        (EntityService.items.has(sourceId)?sourceId:null),
      start:now,
      end:finiteDuration===Infinity
        ?Infinity
        :now+finiteDuration,
      nextTick:now+Math.max(
        1,
        Number(params.interval)||1000
      ),
      data:storedParams
    });

    entity.statuses.set(type,list);
    entity.combatSnapshotDirty=true;
    this.touchPresentation(entity);
    return true;
  },
  live(entity,type,now=performance.now()){
    if(!entity)return EMPTY_RUNTIME_ITEMS;

    const list=entity.statuses.get(type);
    if(!list?.length)return EMPTY_RUNTIME_ITEMS;

    const originalLength=list.length;
    let write=0;

    for(let read=0;read<list.length;read++){
      const item=list[read];

      /*
        만료 시각에 도달했더라도 아직 소비하지 않은 마지막 DOT 틱이 있으면
        CCService.update()가 그 틱을 처리할 때까지 상태를 보존한다.
        CombatStats/표시 조회가 update보다 먼저 live()를 호출해도 마지막 틱이 사라지지 않는다.
      */
      const terminalDotTickPending=
        item.data?.tickAtEnd===true&&
        Number(item.nextTick)<=Number(item.end);

      const freezeReleasePending=
        type==='freeze'&&
        !item.releaseApplied;

      if(
        item.end<=now&&
        !terminalDotTickPending&&
        !freezeReleasePending
      ){
        continue;
      }

      list[write++]=item;
    }

    list.length=write;

    if(list.length)entity.statuses.set(type,list);
    else entity.statuses.delete(type);
    if(list.length!==originalLength){
      entity.combatSnapshotDirty=true;
      this.touchPresentation(entity);
    }

    return list;
  },
  active(entity,type,now=performance.now()){
    const list=this.live(entity,type,now);
    let active=null;

    for(const item of list){
      if(item.end<=now)continue;
      if(!active||item.end>active.end)active=item;
    }

    return active;
  },
  has(entity,type,now=performance.now()){
    return !!this.active(entity,type,now);
  },
  remaining(entity,type,now=performance.now()){
    const active=this.active(entity,type,now);

    if(!active)return 0;
    if(active.end===Infinity)return Infinity;

    return Math.max(0,active.end-now);
  },
  applyFreezeRelease(
    entity,
    status,
    now=performance.now()
  ){
    if(
      !entity?.alive||
      !status||
      status.releaseApplied
    )return false;

    status.releaseApplied=true;

    /*
      빙결 해제 피해는 별도 추가 피해가 아니다.
      빙결 유지 중 실제 freeze DOT 피해를 단 한 번도 받지 못한 경우에만
      정상 빙결 DOT 1회를 보장한다. 저스트 회피 등으로 틱 피해가 적용되지
      않았다면 applied tick으로 세지 않으므로 해제 시 다시 한 번 시도한다.
    */
    if(
      Math.max(0,Number(status.data?.dotTicksApplied)||0)>0
    )return false;

    const ratio=Math.max(
      0,
      CharacterDataService.number(status.data?.ratio,STATUS_EFFECT_RULES.freeze.maxHealthDamageRatio)
    );

    if(ratio<=0)return false;

    const source=
      EntityService.items.get(
        status.sourceEntityId
      )||
      EntityService.items.get(
        status.sourceId
      )||
      entity;

    const result=StatusDamageService.apply({
      type:'freeze',
      source,
      target:entity,
      amount:entity.maxHealth*ratio,
      statusLabel:'freeze'
    });

    if(result?.applied){
      status.data={
        ...(status.data||{}),
        dotTicksApplied:
          Math.max(0,Number(status.data?.dotTicksApplied)||0)+1
      };
    }

    return !!result?.applied;
  },
  removeSource(entity,type,sourceId){
    if(!entity)return false;

    const list=entity.statuses.get(type)||[];
    let write=0;
    let removed=false;

    for(let read=0;read<list.length;read++){
      const item=list[read];

      if(item.sourceId===sourceId){
        if(type==='freeze'){
          this.applyFreezeRelease(
            entity,
            item
          );
        }
        removed=true;
        continue;
      }

      list[write++]=item;
    }

    list.length=write;

    if(list.length)entity.statuses.set(type,list);
    else entity.statuses.delete(type);

    if(removed){
      entity.combatSnapshotDirty=true;
      this.touchPresentation(entity);
    }
    return removed;
  },
  hasSource(entity,type,sourceId,now=performance.now()){
    return !!entity&&this.live(entity,type,now).some(
      item=>item.sourceId===sourceId&&item.end>now
    );
  },
  clear(entity,type,options={}){
    if(!entity)return;
    const applyRelease=options?.applyRelease!==false;

    if(type){
      if(type==='freeze'&&applyRelease){
        for(
          const status of
          entity.statuses.get('freeze')||[]
        ){
          this.applyFreezeRelease(
            entity,
            status
          );
        }
      }
      if(entity.statuses.delete(type)){
        entity.combatSnapshotDirty=true;
        this.touchPresentation(entity);
      }
      return;
    }

    if(applyRelease){
      for(
        const status of
        entity.statuses.get('freeze')||[]
      ){
        this.applyFreezeRelease(
          entity,
          status
        );
      }
    }

    if(entity.statuses.size){
      entity.statuses.clear();
      entity.combatSnapshotDirty=true;
      this.touchPresentation(entity);
    }
  },
  applyToStats(entity,stats,now=performance.now()){
    for(const type of COMBAT_STATUS_TYPES){
      const active=this.active(entity,type,now);
      if(active){
        CombatModifierService.applyStatus(
          stats,
          type,
          active.data||{}
        );
      }
    }

    return stats;
  },
  tickDamage(entity,status,type,now){
    const source=
      EntityService.items.get(status.sourceEntityId)||
      EntityService.items.get(status.sourceId)||
      entity;

    const interval=Math.max(
      1,
      Number(status.data.interval)||1000
    );

    const terminalTickInclusive=status.data.tickAtEnd===true;
    while(
      status.nextTick<=now&&
      (terminalTickInclusive?status.nextTick<=status.end:status.nextTick<status.end)
    ){
      let amount=0;

      if(type==='poison'){
        const value=Math.max(
          0,
          Number(status.data.value)||0
        );
        amount=entity.maxHealth*value;
      }else if(type==='burn'){
        const flat=Math.max(
          0,
          CharacterDataService.number(status.data.flat,STATUS_EFFECT_RULES.burn.flatDamage)
        );
        const stackCount=
          Math.max(
            1,
            Number(status.data?.stackCount)||1
          );
        amount=flat*stackCount;
      }else{
        const ratio=Math.max(
          0,
          Number(status.data.ratio)||0
        );
        const flat=Math.max(
          0,
          Number(status.data.flat)||0
        );

        amount=flat+entity.maxHealth*ratio;
      }

      if(amount>0){
        const result=StatusDamageService.apply({
          type,
          source,
          target:entity,
          amount
        });
        if(result?.applied){
          status.data={
            ...(status.data||{}),
            dotTicksApplied:
              Math.max(0,Number(status.data?.dotTicksApplied)||0)+1
          };
        }
      }

      status.nextTick+=interval;
    }
  },
  shouldReleaseDynamicStatus(entity,status,now=performance.now()){
    const condition=String(status?.data?.releaseCondition||'');
    if(!condition)return false;
    const source=EntityService.items.get(status.sourceEntityId)||EntityService.items.get(status.sourceId)||null;
    if(!source?.alive)return true;
    if(condition==='source-contact-or-movement-end'){
      const distance=Math.hypot((Number(source.x)||0)-(Number(entity.x)||0),(Number(source.y)||0)-(Number(entity.y)||0));
      const contact=Math.max(0,Number(source.radius)||0)+Math.max(0,Number(entity.radius)||0)+1;
      if(distance<=contact)return true;
      const active=MovementAbilityService.active(source);
      if(active)status.data.movementObserved=true;
      if(status.data.movementObserved===true&&!active)return true;
    }
    return false;
  },
  update(entity,now=performance.now()){
    if(!entity?.alive)return;

    for(const type of COMBAT_STATUS_TYPES){
      const list=entity.statuses.get(type);
      if(!list?.length)continue;

      let released=false;
      for(let index=list.length-1;index>=0;index--){
        const status=list[index];
        if(!this.shouldReleaseDynamicStatus(entity,status,now))continue;
        if(type==='freeze'){
          this.applyFreezeRelease(
            entity,
            status,
            now
          );
        }
        list.splice(index,1);
        released=true;
      }
      if(released){
        entity.combatSnapshotDirty=true;
        this.touchPresentation(entity);
      }
      if(list.length)entity.statuses.set(type,list);else entity.statuses.delete(type);
    }

    /*
      모든 DOT는 먼저 현재 시각까지의 틱을 처리한다. tickAtEnd 상태는
      정확한 종료 시각의 마지막 틱도 포함한다. 그 뒤 빙결만 해제 fallback을
      검사하므로 1초 빙결은 1초 틱 + 별도 해제 피해로 중복되지 않는다.
    */
    for(const type of COMBAT_DOT_STATUS_TYPES){
      const list=
        entity.statuses.get(type)||
        EMPTY_RUNTIME_ITEMS;
      for(const status of list){
        const terminalTickPending=
          status.data.tickAtEnd===true&&
          status.nextTick<=status.end&&
          status.nextTick<=now;
        if(status.end>now||terminalTickPending){
          this.tickDamage(entity,status,type,now);
        }
      }
    }

    const freezeList=
      entity.statuses.get('freeze')||
      EMPTY_RUNTIME_ITEMS;
    for(const status of freezeList){
      if(
        status.end<=now&&
        !status.releaseApplied
      ){
        this.applyFreezeRelease(
          entity,
          status,
          now
        );
      }
    }

    for(const type of COMBAT_STATUS_TYPES){
      this.live(entity,type,now);
    }
  },
  isDotImpact(impact){
    return !!(
      impact?.dot===true||
      impact?.type==='status'||
      COMBAT_DOT_STATUS_TYPES.has(
        impact?.status
      )
    );
  },
  onDamaged(entity,result){
    if(!entity||!result?.applied)return;

    TimedActionStateService.cancelOnDamage(entity);
    if(this.has(entity,'sleep',result.now)){
      this.clear(entity,'sleep');
    }
  }
});
