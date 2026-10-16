/* 지형 사건 송수신과 늦은 관전자/승계 스냅샷. 게임 모듈에는 전송 코드를 넣지 않는다. */
const OnlineWorldDestructionSyncService=Object.freeze({
  send(event){
    if(Training.sessionMode!=='online'||!OnlineDuelService.active||
      !EntitySimulationAuthorityService.isLocal(event?.source))return false;
    RoomService.sendGameplay({type:'duel-world-destruction',
      roundToken:OnlineDuelService.roundToken,snapshot:event.snapshot});
    return true;
  },
  receive(payload){
    if(!OnlineDuelService.active||Number(payload?.roundToken)!==Number(OnlineDuelService.roundToken))return false;
    return WorldDestructionService.applySnapshot(payload.snapshot);
  }
});
GameEvents.on('world-walls-destroyed',event=>OnlineWorldDestructionSyncService.send(event));
