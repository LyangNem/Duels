

/* 포인터 홀드 입력 */

/*
  CircleFormationService
  - 동적 원 집합의 배치/관계 그래프/발현을 캐릭터 ID와 분리해 관리한다.
  - 단일 원 delivery.area로는 여러 원의 포함·교차 렌즈·연결 상속·증폭 단계와
    드래그/재입력/그룹 이동 입력을 한 AttackSpec에 표현할 수 없어 별도 상태 서비스로 분리한다.
*/
const StageStatusEffectService=Object.freeze({
  apply(source,target,stage,config={},now=performance.now()){
    const value=Math.max(0,Math.floor(Number(stage)||0));
    if(value<=0||!source||!target?.alive)return false;
    const stages=Array.isArray(config.stages)?config.stages:[];
    let selected=null;
    for(const item of stages){
      if(value<Math.max(1,Math.floor(Number(item?.stage)||1)))continue;
      if(!selected||Number(item.stage)>=Number(selected.stage))selected=item;
    }
    if(!selected?.status)return false;
    return CombatStatusApplicationService.apply({
      source,
      target,
      type:String(selected.status),
      duration:Math.max(0,Number(selected.duration??config.duration)||0),
      sourceId:String(config.sourceId||`${String(source.id||'source')}:stage-status`),
      data:{
        ...(selected.data||{}),
        stackMode:selected.stackMode||config.stackMode||'replace-source',
        sourceEntityId:source.id,
        presentationAppliedAt:now
      }
    });
  }
});