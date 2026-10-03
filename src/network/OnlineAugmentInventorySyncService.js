

const OnlineAugmentInventorySyncService={
  sequence:0,
  received:new Set(),
  send(entity){
    if(
      Training.sessionMode!=='online'||
      !OnlineDuelService.active||
      !EntitySimulationAuthorityService.isLocal(entity)
    )return false;

    const owner=AugmentService.owner(entity);
    const targetPid=OnlineParticipantEntityService.pid(owner);
    if(!owner||!targetPid)return false;

    RoomService.sendGameplay({
      type:'duel-augment-inventory',
      roundToken:OnlineDuelService.roundToken,
      inventoryPacketId:
        `${OnlineDuelService.localPid||'local'}:${++this.sequence}`,
      targetPid,
      augments:[...(owner.augments||[])]
    });
    return true;
  },
  receive(pid,payload){
    if(
      !OnlineDuelService.active||
      Number(payload?.roundToken)!==Number(OnlineDuelService.roundToken)
    )return false;

    const packetId=String(payload.inventoryPacketId||'');
    if(packetId&&this.received.has(packetId))return false;
    if(packetId){
      this.received.add(packetId);
      if(this.received.size>256){
        this.received.delete(this.received.values().next().value);
      }
    }

    const target=
      OnlineParticipantEntityService.entity(
        payload.targetPid
      );
    if(!target)return false;

    target.augments=(Array.isArray(payload.augments)
      ?payload.augments
      :[]
    ).filter(id=>!!AugmentDataService.get(id));

    // 현재 Entity 표시만 갱신하지 않고 다음 라운드의 authoritative 인벤토리도
    // 동일 canonical packet으로 갱신한다. 특히 비호스트 소유자가 개발자모드로
    // 증강을 변경했을 때 호스트의 round-start 원본이 이전 값으로 돌아가지 않게 한다.
    if(RoomService.activeMatchPids.has(payload.targetPid)){
      RoomService.matchAugments.set(
        payload.targetPid,
        [...target.augments]
      );
    }

    if(payload.targetPid===OnlineDuelService.localPid){
      OnlineDuelService.localAugments=[
        ...target.augments
      ];
    }else{
      OnlineDuelService.remoteAugmentsByPid.set(
        payload.targetPid,
        [...target.augments]
      );
      if(
        payload.targetPid===
          OnlineDuelService.remotePid
      ){
        OnlineDuelService.remoteAugments=[
          ...target.augments
        ];
      }
    }

    AugmentService.rebuild(target);
    Training.renderAugHud();
    return true;
  },
  reset(){
    this.sequence=0;
    this.received.clear();
  }
};