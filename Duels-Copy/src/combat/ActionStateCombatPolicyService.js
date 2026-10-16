

/* 관계 */
/* 행동 상태가 대상 지정 가능 여부를 제어하는 공통 정책이다. 캐릭터 이름을 검사하지 않는다. */
const ActionStateCombatPolicyService=Object.freeze({
  isEvasionUntargetable(entity,now=performance.now()){
    if(
      entity&&
      typeof BuffService!=='undefined'&&
      BuffService.live(entity,'evasionInvulnerable',now).length
    )return true;
    if(entity?.actionState){
      for(const state of entity.actionState.values()){
        if(state?.evasionUntargetable===true)return true;
      }
    }
    return entity?._remoteEvasionUntargetable===true;
  },
  blocksAttackInteraction(entity,policy={}){
    if(
      policy.ignoreEvasionInvulnerable!==true&&
      this.isEvasionUntargetable(entity)
    )return true;
    if(entity?.actionState){
      for(const state of entity.actionState.values()){
        // 다른 시스템이 사용하는 일반 비대상 상태와의 호환은 유지한다.
        if(state?.untargetable===true)return true;
      }
    }
    return entity?._remoteUntargetable===true;
  },
  blocksTargeting(entity,policy={}){
    return this.blocksAttackInteraction(entity,policy);
  }
});