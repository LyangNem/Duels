

/*
 * 기존 호출부 호환용. 실제 선딜 중단의 단일 진실원천은
 * AttackWindupService다.
 */
const ForcedMovementWindupInterruptService=Object.freeze({
  interrupt(
    entity,
    reason='forced-movement',
    options={}
  ){
    return AttackWindupService.interrupt(
      entity,
      reason,
      options
    );
  }
});