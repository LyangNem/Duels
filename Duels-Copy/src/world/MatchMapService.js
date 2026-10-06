

const MatchMapService=Object.freeze({
  playable(
    mode=
      RoomService?.matchMode||
      MatchModeService.DUEL
  ){
    const ffa=
      MatchModeService.isFfa(mode);
    const team=
      MatchModeService.isTeam(mode);

    return (DebugMapService.maps||[]).filter(
      map=>
        map&&
        !map.isTraining&&
        (!!map.isFfa===ffa)&&
        (!!map.isTeam===team)
    );
  },
  pick(
    mode=
      RoomService?.matchMode||
      MatchModeService.DUEL
  ){
    const maps=this.playable(mode);
    if(!maps.length)return null;

    return maps[
      Math.floor(Math.random()*maps.length)
    ]?.id||null;
  },
  apply(mapId){
    if(!mapId)return false;
    return DebugMapService.set(mapId);
  }
});