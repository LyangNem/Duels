

const RoundResolutionProtectionService=Object.freeze({
  protectWinner(pid){
    const entity=
      OnlineParticipantEntityService.entity(pid);
    if(!entity?.alive)return false;

    entity.invincibleUntil=Infinity;
    return true;
  },
  protectMany(pids){
    let applied=false;

    for(const pid of pids||[]){
      applied=
        this.protectWinner(pid)||
        applied;
    }

    return applied;
  }
});