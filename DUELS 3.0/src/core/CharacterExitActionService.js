




/*
  사망한 단일 Entity의 캐릭터 전투 수명만 초기화한다.
  매치/라운드/다른 Entity/증강 인벤토리는 건드리지 않는다.
*/
/* 캐릭터 교체/사망 직전에 현재 캐릭터에 종속된 '진행 중 행동'만 종료한다.
   외부에 이미 생성된 소환수/투사체/설치 field와 일반 CC/buff는 건드리지 않는다. */
const CharacterExitActionService=Object.freeze({
  stop(entity,now=performance.now()){
    if(!entity)return false;
    let changed=false;

    if(
      typeof OrbitInventoryService!=='undefined'
    ){
      changed=
        OrbitInventoryService.clear(
          entity,
          {preserveInventory:true}
        )||
        changed;
    }

    /* carry는 소환수 자체를 지우지 않고 내려놓기만 한다. */
    for(const [stateKey,spec] of Object.entries(entity.character?.summons||{})){
      if(!spec?.carry)continue;
      changed=SummonDeployService.dropCarry(entity,stateKey,0,now)||changed;
    }

    changed=SustainedBuffModeService.clear(entity)||changed;

    if(entity.actionState){
      for(const state of [...entity.actionState.values()]){
        if(state?.kind===StealthModeService.KIND){
          changed=StealthModeService.stop(entity,state.stateKey,now)||changed;
        }else if(state?.kind===ChannelAttackService.KIND){
          changed=ChannelAttackService.stop(
            entity,
            state.stateKey,
            now,
            {applyCooldown:false,createStopField:false}
          )||changed;
        }
      }
    }

    /* 나레 등 투사체 탑승은 태그/사망 시 정상 하차 처리한다. */
    if(entity.actionState){
      for(const state of [...entity.actionState.values()]){
        if(state?.kind!==ProjectileRideService.KIND)continue;
        changed=
          ProjectileRideService.finish(
            entity,
            state.stateKey,
            {resolveEmbedded:entity.alive!==false}
          )||changed;
      }
    }

    changed=ChargedAttackService.cancel(entity)||changed;

    /*
      태그/사망은 현재 캐릭터의 입력 세션 자체를 끝낸다.
      이미 월드에 생성된 projectile/summon/field는 지우지 않고,
      아직 실행되지 않은 ability continuation과 캐릭터 내부 진행도만 폐기한다.
    */
    changed=
      SimulationScheduleService.clearSource(entity)||
      changed;

    if(entity.abilityPending?.size){
      entity.abilityPending.clear();
      changed=true;
    }

    if(entity.attackPreview){
      entity.attackPreview=null;
      changed=true;
    }

    if(entity.character?.attacks){
      for(const attack of Object.values(entity.character.attacks)){
        const multiClick=
          MultiClickAttackService.config(attack);
        if(!multiClick)continue;

        MultiClickAttackService.clearRuntime(
          entity,
          multiClick,
          now
        );
        changed=true;
      }
    }

    changed=
      ProgressStateService.clearAll(entity)||
      changed;

    /*
      waypoint 투사체 본체는 유지하되 현재 누르고 있던 hold 입력만 종료한다.
      따라서 레비나 창 자체는 태그 후에도 남지만 차징/회수 홀드는 이어지지 않는다.
    */
    if(entity.actionState){
      for(const [key,state] of [...entity.actionState]){
        if(
          state?.kind===
            WaypointProjectileService.HOLD_KIND
        ){
          entity.actionState.delete(key);
          changed=true;
          continue;
        }

        if(
          state?.kind===ModeStateService.KIND||
          state?.kind===FormulaSequenceService.KIND||
          state?.kind===FormulaSequenceService.FLASH_KIND
        ){
          entity.actionState.delete(key);
          changed=true;
        }
      }
    }

    return changed;
  }
});