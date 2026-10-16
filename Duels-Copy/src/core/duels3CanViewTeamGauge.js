

// ProgressStateService: 적중 스택·무기 충전·콤보 단계처럼 0..max 범위의 범용 진행도를 actionState 하나로 관리한다.
function duels3CanViewTeamGauge(entity){
  if(!entity)return false;
  if(Training.sessionMode!=='online')return true;
  if(EntitySimulationAuthorityService.isLocal(entity))return true;
  const viewer=Training.player;
  if(!viewer)return false;
  const target=entity.kind==='summon'?(EntityService.owner(entity)||entity):entity;
  if(target===viewer)return true;
  return RelationService.relation(viewer,target)==='ally';
}