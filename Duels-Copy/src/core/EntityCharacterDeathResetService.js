

const EntityCharacterDeathResetService=Object.freeze({
  reset(entity,now=performance.now(),options={}){
    if(!entity)return false;

    const preserveReplacementState=
      options?.preserveReplacementState===true;

    ProjectileService.removeInstalledOwnedBy(
      entity
    );

    CharacterExitActionService.stop(entity,now);

    if(
      typeof OrbitInventoryService!=='undefined'
    ){
      OrbitInventoryService.clear(
        entity,
        {preserveInventory:false}
      );
    }

    SimulationScheduleService.clearSource(
      entity
    );
    AttackGuardService.clearSource(
      entity
    );


    MovementAbilityService.clear(
      entity
    );

    if(entity.actionState){
      for(
        const state of
        entity.actionState.values()
      ){
        if(
          !preserveReplacementState&&
          state?.kind==='replacement-state'&&
          Number.isFinite(
            Number(state.restoreBaseMaxHealth)
          )
        ){
          const restoredMax=
            Math.max(
              1,
              Number(state.restoreBaseMaxHealth)
            );
          entity.baseMaxHealth=restoredMax;
          entity.maxHealth=restoredMax;
          entity.health=Math.min(
            Number(entity.health)||0,
            restoredMax
          );
          entity.healthTrailHealth=
            Math.min(
              Number(entity.healthTrailHealth)||0,
              restoredMax
            );
        }
      }

      for(
        const [key,state] of
        entity.actionState
      ){
        /*
          deployable summon state만 유지한다.
          소환수 객체를 남긴 채 owner 쪽 상태만 삭제하는 orphan을 방지하고,
          progress/charge/channel/mode/field 등 캐릭터 전투 상태는 모두 초기화한다.
        */
        if(
          state?.kind===
            SummonDeployService.stateKind||
          state?.kind===
            InstalledAreaFieldService.KIND||
          (
            preserveReplacementState&&
            state?.kind==='replacement-state'
          )
        )continue;

        entity.actionState.delete(key);
      }
    }

    entity.abilityPending?.clear?.();
    entity.counterWindup=null;
    entity.counterReadyUntil=0;
    entity.attackPreview=null;
    MovementService.finalizeForcedMotion(entity);
    entity.justCheck=null;
    entity.justDodgeStartedAt=0;
    entity.justDodgeWindowUntil=0;
    entity.justDodgeConsumed=false;
    entity._positionMemories?.clear?.();
    entity.wallDeferredAttacks=[];

    return true;
  }
});