

const OnlineParticipantEntityService=Object.freeze({
  entity(pid){
    const id=String(pid||'');
    if(!id)return null;

    if(id===OnlineDuelService.localPid){
      return Training.player||null;
    }

    return (
      Training.remotePlayers?.get(id)||
      OnlineDuelService.remotePlayers?.get(id)||
      (
        id===OnlineDuelService.remotePid
          ?Training.remotePlayer
          :null
      )||
      null
    );
  },
  pid(entity){
    if(!entity)return null;

    const root=EntityService.owner(entity);
    if(!root)return null;

    if(
      root===EntityService.owner(Training.player)
    ){
      return OnlineDuelService.localPid;
    }

    for(
      const [pid,remote] of
      Training.remotePlayers||[]
    ){
      if(
        root===EntityService.owner(remote)
      ){
        return pid;
      }
    }

    return null;
  },
});