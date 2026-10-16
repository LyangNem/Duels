

/*
  캐릭터 데이터의 전투 Trigger를 공통 실행한다.
  증강 Trigger와 마찬가지로 event/condition/module 데이터만 보고 처리하며
  캐릭터 ID를 검사하지 않는다.
*/
const ProgressHitTargetPolicy=Object.freeze({
  eligible(target){
    if(!target)return true;
    const kind=String(target.kind||'');
    return kind!=='summon'&&kind!=='trainingBot';
  },
  damageProgressEligible(target,context={}){
    if(!target)return true;
    /*
      부활/태그 강제교체처럼 '사망만 방지'된 치명타는 실제 체력 피해가
      정상 적용된 적중이다. 네트워크 확정 패킷의 prevented=true만 보고
      source state.progress까지 취소하면 타우 강화 평타 소비처럼 막타
      on-hit 효과가 누락된다. 실제 healthDamage가 0인 완전 방지만 제외한다.
    */
    if(
      context.prevented===true&&
      Math.max(0,Number(context.healthDamage)||0)<=0
    )return false;
    return !HealthService.isInvulnerable(
      target,
      Number(context.now)||performance.now()
    );
  }
});