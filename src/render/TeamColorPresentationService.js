

const TeamColorPresentationService=Object.freeze({
  colorForTeam(teamId,fallback='#4af'){
    return RoomTeams[String(teamId||'')]?.color||fallback;
  },
  colorForPid(pid,fallback='#4af'){
    const member=RoomService.members.get(String(pid||''));
    return this.colorForTeam(member?.team,fallback);
  },
  colorForEntity(entity,fallback=null){
    if(!entity)return fallback||'#4af';
    const entityFallback=fallback||entity.color||'#4af';
    const teamId=String(entity.teamId||'');
    if(teamId){
      const direct=RoomTeams[teamId]?.color;
      return direct||entityFallback;
    }
    const pid=typeof OnlineParticipantEntityService!=='undefined'
      ?OnlineParticipantEntityService.pid(entity)
      :null;
    return pid
      ?this.colorForPid(pid,entityFallback)
      :entityFallback;
  }
});