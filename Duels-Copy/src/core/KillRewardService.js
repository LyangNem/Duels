

const KillRewardService=Object.freeze({
  healthRatio:.30,
  key(roundToken,deadPid){
    return `${Number(roundToken)||0}:${String(deadPid||'')}`;
  },
  reset(){
    return true;
  },
  isValidKill(payload){
    if(
      !payload||
      payload.silent===true
    )return false;

    const deadPid=String(
      payload.deadPid||''
    );
    const sourcePid=String(
      payload.sourcePid||''
    );

    if(
      !deadPid||
      !sourcePid||
      deadPid===sourcePid
    )return false;

    const deadMember=
      RoomService.members.get(deadPid);
    const sourceMember=
      RoomService.members.get(sourcePid);

    if(
      deadMember?.team&&
      sourceMember?.team
    ){
      return (
        deadMember.team!==
        sourceMember.team
      );
    }

    const victim=
      OnlineParticipantEntityService.entity(
        deadPid
      );
    const killer=
      OnlineParticipantEntityService.entity(
        sourcePid
      );

    return !!(
      victim&&
      killer&&
      RelationService.relation(
        killer,
        victim
      )==='enemy'
    );
  },
  rewardLocalKiller(payload){
    if(!this.isValidKill(payload)){
      return false;
    }

    const sourcePid=String(
      payload.sourcePid||''
    );

    if(
      sourcePid!==
        OnlineDuelService.localPid
    )return false;

    const killer=
      OnlineParticipantEntityService.entity(
        sourcePid
      );

    if(!killer?.alive)return false;

    const maxHealth=
      Math.max(
        1,
        Number(killer.maxHealth)||1
      );
    const maxStamina=
      Math.max(
        0,
        Number(killer.maxStamina)||0
      );
    const healthBefore=
      Math.max(
        0,
        Number(killer.health)||0
      );

    const healthGain=
      maxHealth*this.healthRatio;

    HealthService.restore(
      killer,
      healthGain,
      killer,
      {
        applyHealingModifier:false,
        notify:false,
        presentation:'kill-reward'
      }
    );
    if(
      String(
        killer.character?.killRewardStaminaMode||
        'restore'
      )==='decrease'
    ){
      StaminaService.set(
        killer,
        Math.max(
          0,
          (Number(killer.stamina)||0)-
          maxStamina
        )
      );
    }else{
      StaminaService.restore(
        killer,
        maxStamina
      );
    }

    const rewardNow=performance.now();

    // 처치 보상 자연회복은 0.5초 뒤 반드시 한 번 시작한다.
    // 이 0.5초 동안의 행동은 시작 시각을 미루지 않으며,
    // 첫 회복이 시작된 뒤의 행동부터는 기존 자연회복 규칙으로 다시 중단된다.
    killer.forcedNaturalRegenAt=
      rewardNow+500;

    // 즉시 UI와 네트워크 상태에 반영한다.
    if(
      Number(killer.healthTrailHealth)<
        killer.health
    ){
      killer.healthTrailHealth=
        killer.health;
    }
    killer.lastStaminaUse=0;


    Training.syncHud();

    if(
      OnlineDuelService.active&&
      Training.sessionMode==='online'
    ){
      // 다음 33ms tick을 기다리지 않고 처치 보상을 즉시 authoritative state로 송신.
      OnlineDuelService.lastStateSentAt=0;
      OnlineDuelService.syncLocalState(
        killer,
        performance.now()
      );
    }

    return true;
  }
});