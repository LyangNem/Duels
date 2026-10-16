/* 위치 이동은 선딜을 유지하고 기절/빙결/무력화/수면만 공용 선딜 취소 경로로 전달한다. */
const ForcedMovementWindupInterruptService=Object.freeze({
  interrupt(entity,reason='forced-movement',options={}){
    return AttackWindupService.statusInterrupts(reason)?AttackWindupService.interrupt(entity,reason,options):false;
  }
});
