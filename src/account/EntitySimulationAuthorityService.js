

/* 엔티티 시간 기반 전투 시뮬레이션 권한 */
const EntitySimulationAuthorityService=Object.freeze({
  root(entity){
    return EntityService.owner(entity);
  },
  isLocal(entity){
    if(!entity)return false;
    if(Training.sessionMode!=='online')return true;

    const explicitPid=
      String(
        entity.simulationAuthorityPid||
        ''
      );

    if(explicitPid){
      return explicitPid===
        String(RoomService.localPid||'');
    }

    const localRoot=this.root(Training.player);
    const targetRoot=this.root(entity);

    return !!localRoot&&targetRoot===localRoot;
  }
});