


/*
  캐릭터 데이터의 passives 배열에 정의된 state.progress-rate를 처리한다.
  캐릭터 ID 분기 없이 진행도 자동 충전/소모와 mode 종료를 담당한다.
*/
const PassiveProgressRateService=Object.freeze({
  update(entity,now=performance.now()){
    if(
      !entity?.alive||
      !EntitySimulationAuthorityService.isLocal(entity)
    )return false;

    let changed=false;

    for(const module of entity.character?.passives||[]){
      if(module?.type!=='state.progress-rate')continue;
      const stateKey=String(module.stateKey||'');
      if(!stateKey)continue;

      const mode=module.whenMode||null;
      if(mode){
        const current=
          ModeStateService.current(
            entity,
            String(mode.stateKey||''),
            String(mode.initial||'')
          );
        if(current!==String(mode.value||'')){
          continue;
        }
      }

      const state=
        ProgressStateService.ensure(
          entity,
          module
        );
      if(!state)continue;

      const previousAt=
        Number.isFinite(Number(state.passiveUpdatedAt))
          ?Number(state.passiveUpdatedAt)
          :now;
      const elapsed=
        Math.max(
          0,
          Math.min(
            250,
            now-previousAt
          )
        );
      state.passiveUpdatedAt=now;

      if(elapsed<=0)continue;

      const rate=
        Number(module.ratePerSecond)||0;
      if(rate===0)continue;

      const previous=
        Math.max(0,Number(state.value)||0);
      state.value=
        Math.max(
          0,
          Math.min(
            state.max,
            previous+
            rate*elapsed/1000
          )
        );

      if(state.value!==previous){
        changed=true;
      }

      if(
        state.value<=0&&
        module.setModeAtEmpty
      ){
        ModeStateService.set(
          entity,
          String(module.setModeAtEmpty.stateKey||''),
          String(module.setModeAtEmpty.value||''),
          String(module.setModeAtEmpty.initial||'')
        );
      }
    }

    return changed;
  }
});