





const OnlineDebugMapSyncService=Object.freeze({
  apply(mapId,{broadcast=true}={}){
    const id=String(mapId||'');
    if(!DebugMapService.set(id))return false;

    if(
      Training.sessionMode==='online'&&
      OnlineDuelService.active
    ){
      RoomService.currentMapId=id;

      if(broadcast){
        RoomService.sendGameplay({
          type:'duel-debug-map-change',
          roundToken:OnlineDuelService.roundToken,
          mapId:id
        });
      }
    }

    return true;
  },
  receive(payload){
    if(
      !OnlineDuelService.active||
      Number(payload?.roundToken)!==
        Number(OnlineDuelService.roundToken)
    )return false;

    return this.apply(
      payload.mapId,
      {broadcast:false}
    );
  }
});