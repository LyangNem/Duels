

const OnlineKillAttributionService=Object.freeze({
  byVictim:new Map(),
  reset(){
    this.byVictim.clear();
  },
  key(roundToken,victimPid){
    return `${Number(roundToken)||0}:${String(victimPid||'')}`;
  },
  remember(
    victimPid,
    sourcePid,
    roundToken=OnlineDuelService.roundToken
  ){
    const victim=String(victimPid||'');
    const source=String(sourcePid||'');

    if(
      !victim||
      !source||
      victim===source
    )return false;

    this.byVictim.set(
      this.key(roundToken,victim),
      source
    );
    return true;
  },
  sourceFor(
    victimPid,
    roundToken=OnlineDuelService.roundToken
  ){
    return (
      this.byVictim.get(
        this.key(roundToken,victimPid)
      )||
      null
    );
  }
});