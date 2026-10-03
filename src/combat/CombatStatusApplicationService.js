

const CombatStatusApplicationService={
  packetSequence:0,
  packetIds:new Set(),
  durationForTarget(target,type,duration,now=performance.now()){
    if(
      duration===Infinity||
      COMBAT_STATUS_DEFS[type]?.kind!=='cc'
    )return duration;

    return Math.max(0,Number(duration)||0)*
      Math.max(
        .10,
        1+BuffService.resolve(
          target,
          'ccDuration',
          now
        )
      );
  },
  nextPresentationOrder(){
    return nextCcPresentationOrder();
  },
  nativeEntry(entity,type,sourceId,now=performance.now()){
    const list=entity?.statuses?.get(type)||[];
    return list.find(item=>
      item.sourceId===sourceId&&
      item.end>now&&
      item.data?.networkReplicated!==true
    )||null;
  },
  removeReplicated(entity,type,sourceId){
    if(!entity)return false;
    const list=entity.statuses.get(type)||[];
    let write=0;
    let removed=false;

    for(let read=0;read<list.length;read++){
      const item=list[read];
      if(
        item.sourceId===sourceId&&
        item.data?.networkReplicated===true
      ){
        removed=true;
        continue;
      }
      list[write++]=item;
    }

    list.length=write;
    if(list.length)entity.statuses.set(type,list);
    else entity.statuses.delete(type);
    return removed;
  },
  targetPid(target){
    if(Training.sessionMode!=='online')return null;
    return OnlineParticipantEntityService.pid(target);
  },
  apply({
    source,
    target,
    type,
    duration,
    sourceId,
    data={}
  }){
    if(!target||!COMBAT_STATUS_DEFS[type])return false;

    const normalizedData={...(data||{})};

    if(type==='poison'){
      const maximum=Math.max(
        1,
        Number(target.maxHealth)||1
      );
      if(normalizedData.mode==='flat'){
        normalizedData.value=
          Math.max(
            0,
            Number(normalizedData.value)||0
          )/maximum;
      }
      normalizedData.mode='percent';
      delete normalizedData.flat;
    }

    if(type==='burn'){
      normalizedData.flat=
        Math.max(
          0,
          CharacterDataService.number(normalizedData.flat,STATUS_EFFECT_RULES.burn.flatDamage)
        );
      normalizedData.interval=
        Math.max(
          1,
          Number(normalizedData.interval)||
          STATUS_EFFECT_RULES.burn.interval
        );
      delete normalizedData.ratio;
      delete normalizedData.mode;
      delete normalizedData.value;
    }

    const actualSourceId=
      sourceId||
      source?.id||
      target.id;
    const resolvedData={...normalizedData};
    if(!Number.isFinite(Number(resolvedData.presentationOrder))){
      resolvedData.presentationOrder=this.nextPresentationOrder();
    }

    if(EntitySimulationAuthorityService.isLocal(target)){
      // 네트워크 복제본이 먼저 도착한 뒤 실제 공격 재생이 들어오면
      // 복제본만 제거하고 동일한 CCService.add 경로를 실행한다.
      this.removeReplicated(
        target,
        type,
        actualSourceId
      );

      return CCService.add(
        target,
        type,
        this.durationForTarget(target,type,duration),
        actualSourceId,
        resolvedData
      );
    }

    /*
      온라인 원격 대상은 로컬 미러의 statuses Map을 예측 수정하지 않는다.
      해당 Map은 대상 권위 duel-state combatSnapshot이 단일 진실 원천이다.
      공격자 쪽에서 먼저 CCService.add()를 하면, 대상 snapshot이 도착하는 프레임마다
      예측 상태가 삭제/재생성될 수 있어 장판형 반복 CC의 링이 깜빡인다.
    */
    if(
      Training.sessionMode==='online'&&
      OnlineDuelService.active&&
      EntitySimulationAuthorityService.isLocal(
        source
      )
    ){
      const targetPid=this.targetPid(target);
      if(targetPid){
        const networkData={...resolvedData};
        RoomService.sendGameplay({
          type:'duel-status-apply',
          roundToken:OnlineDuelService.roundToken,
          statusPacketId:
            `${OnlineDuelService.localPid||'local'}:${++this.packetSequence}`,
          targetPid,
          targetEntityId:String(target.id||''),
          status:type,
          duration:
            duration===Infinity
              ?0
              :Math.max(0,Number(duration)||0),
          durationInfinite:duration===Infinity,
          sourceEntityId:actualSourceId,
          data:networkData
        });
        return true;
      }
    }

    // 오프라인/비네트워크 원격 객체는 기존 공통 상태 경로를 그대로 사용한다.
    return CCService.add(
      target,
      type,
      this.durationForTarget(target,type,duration),
      actualSourceId,
      resolvedData
    );
  },
  receive(pid,payload){
    if(
      !OnlineDuelService.active||
      payload?.targetPid!==OnlineDuelService.localPid
    )return false;

    if(
      Number(payload.roundToken)!==
      Number(OnlineDuelService.roundToken)
    )return false;

    const packetId=String(payload.statusPacketId||'');
    if(packetId&&this.packetIds.has(packetId))return false;
    if(packetId){
      this.packetIds.add(packetId);
      if(this.packetIds.size>512){
        const first=this.packetIds.values().next().value;
        this.packetIds.delete(first);
      }
    }

    const targetEntityId=String(
      payload.targetEntityId||''
    );
    const candidate=
      targetEntityId
        ?EntityService.items.get(targetEntityId)||null
        :null;
    const localOwner=
      EntityService.owner(Training.player);

    /*
      targetEntityId가 있는 authoritative 상태 패킷은 정확한 대상에게만 적용한다.
      소환수가 치명타로 먼저 제거된 뒤 CC 패킷이 늦게 도착했을 때
      candidate가 null이라는 이유로 주인 플레이어에게 fallback하면
      죽은 소환수의 기절/빙결/속박이 플레이어에게 전이된다.
      명시 대상이 사라졌거나 로컬 소유 엔티티가 아니면 해당 패킷은 만료된 것으로 폐기한다.
      대상 ID가 없는 구형 패킷만 기존 플레이어 fallback을 허용한다.
    */
    if(
      targetEntityId&&
      (
        !candidate||
        EntityService.owner(candidate)!==localOwner
      )
    ){
      return false;
    }

    const target=
      targetEntityId
        ?candidate
        :Training.player;
    const type=String(payload.status||'');
    const sourceId=String(
      payload.sourceEntityId||
      `duel.${pid}`
    );

    if(!target||!COMBAT_STATUS_DEFS[type])return false;

    // 실제 원격 공격 재생이 이미 같은 상태를 적용했다면 상태 자체는 중복 적용하지 않는다.
    // 다만 sender가 보낸 causal chronology는 native 상태에 병합해야 한다.
    // 그렇지 않으면 field-before-attack처럼 논리적으로 먼저 발생한 CC가 패킷 도착 순서 때문에
    // 나중 CC보다 최신 표시로 뒤집힐 수 있다.
    const native=this.nativeEntry(target,type,sourceId);
    if(native){
      /*
        실제 원격 공격 재생이 먼저 native CC를 만들었더라도,
        대상 권위가 받은 authoritative status packet 시점을 그 CC의
        최종 부여 순서로 확정한다. point field의 replace-source 갱신은
        최초 presentationOrder를 보존하므로 이후 SLOW tick이 이 순서를
        다시 덮지 않는다.
      */
      const receivedAt=performance.now();
      native.data={
        ...(native.data||{}),
        presentationAppliedAt:receivedAt,
        presentationStartedAt:receivedAt,
        presentationOrder:this.nextPresentationOrder()
      };
      target.statusPresentationRevision=
        (Number(target.statusPresentationRevision)||0)+1;
      return true;
    }

    const duration=payload.durationInfinite===true
      ?Infinity
      :Math.max(0,Number(payload.duration)||0);

    /*
      presentation chronology is target-authoritative. performance.now() and
      local presentation sequences are not comparable across peers, so never
      import a sender's chronology metadata verbatim. The local target assigns
      it once; replace-source refreshes preserve that local value.
    */
    const replicatedData={...(payload.data||{})};
    delete replicatedData.presentationAppliedAt;
    delete replicatedData.presentationStartedAt;
    delete replicatedData.presentationOrder;

    const receivedAt=performance.now();
    replicatedData.presentationAppliedAt=receivedAt;
    replicatedData.presentationStartedAt=receivedAt;
    replicatedData.presentationOrder=this.nextPresentationOrder();
    replicatedData.networkReplicated=true;

    return CCService.add(
      target,
      type,
      this.durationForTarget(target,type,duration),
      sourceId,
      replicatedData
    );
  },
  reset(){
    this.packetIds.clear();
    this.packetSequence=0;
    CC_PRESENTATION_SEQUENCE=0;
  }
};