

/*
  개발자 모드 게이지 조작.
  캐릭터 정의를 재귀 탐색해 state.progress / buff.time-add gauge를 자동 발견한다.
  캐릭터 추가 시 별도 버튼/ID 등록이 필요 없다.
*/
const DebugGaugeControlService=Object.freeze({
  collect(character){
    const progress=new Map();
    const timed=new Map();
    const visited=new Set();

    const walk=value=>{
      if(
        !value||
        typeof value!=='object'||
        visited.has(value)
      )return;

      visited.add(value);

      if(
        (
          value.type==='state.progress'||
          value.type==='state.progress-rate'
        )&&
        value.stateKey
      ){
        progress.set(
          String(value.stateKey),
          value
        );
      }

      if(
        value.type==='buff.time-add'&&
        (
          value.gauge||
          value.aura
        )
      ){
        const config=
          TimedThresholdBuffService
            .normalizeConfig(value);
        timed.set(
          String(config.group),
          {
            module:value,
            config
          }
        );
      }

      if(Array.isArray(value)){
        for(const item of value)walk(item);
        return;
      }

      for(const child of Object.values(value)){
        walk(child);
      }
    };

    walk(character);

    return {progress,timed};
  },

  entries(entity,now=performance.now()){
    if(!entity?.character)return [];

    const definitions=this.collect(
      entity.character
    );
    const result=[];

    for(const [stateKey,module] of definitions.progress){
      const state=
        ProgressStateService.state(
          entity,
          stateKey
        );
      const max=
        ProgressStateService.maximum(
          entity,
          module,
          state
        );

      result.push({
        kind:'progress',
        key:stateKey,
        label:
          String(
            module.debugLabel||
            module.presentation?.label||
            stateKey
          ),
        value:Math.max(
          0,
          Math.min(
            max,
            Number(state?.value)||0
          )
        ),
        max
      });
    }

    for(const [group,entry] of definitions.timed){
      const max=Math.max(
        1,
        Number(entry.config.maxDuration)||1
      );
      const remaining=
        TimedThresholdBuffService.remaining(
          entity,
          group,
          now
        );

      result.push({
        kind:'timed-threshold',
        key:group,
        label:String(
          entry.module.debugLabel||
          group
        ),
        value:
          remaining===Infinity
            ?max
            :Math.max(
              0,
              Math.min(
                max,
                Number(remaining)||0
              )
            ),
        max
      });
    }

    // 현재 실제로 진행 중인 홀드 차징도 별도 캐릭터 등록 없이 자동 노출.
    for(const state of ChargedAttackService.states(entity)){
      const attack=
        ChargedAttackService.attack(
          entity,
          state
        );
      if(!attack?.charge?.gauge)continue;

      result.push({
        kind:'charged-attack',
        key:String(state.stateKey),
        label:String(
          attack.id||
          state.stateKey
        ),
        value:
          ChargedAttackService.progress(
            state,
            attack,
            now
          )*100,
        max:100
      });
    }

    return result;
  },

  set(entity,kind,key,value,now=performance.now()){
    if(!entity?.character)return false;

    const definitions=this.collect(
      entity.character
    );

    if(kind==='progress'){
      const module=
        definitions.progress.get(
          String(key)
        );
      if(!module)return false;

      const max=
        ProgressStateService.maximum(
          entity,
          module,
          ProgressStateService.state(
            entity,
            key
          )
        );

      return ProgressStateService.apply(
        entity,
        {
          ...module,
          operation:'set',
          value:Math.max(
            0,
            Math.min(
              max,
              Number(value)||0
            )
          )
        }
      );
    }

    if(kind==='timed-threshold'){
      const entry=
        definitions.timed.get(
          String(key)
        );
      if(!entry)return false;

      const total=Math.max(
        0,
        Math.min(
          entry.config.maxDuration,
          Number(value)||0
        )
      );

      if(total<=0){
        for(
          let index=0;
          index<entry.config.stages.length;
          index++
        ){
          const stage=entry.config.stages[index];
          BuffService.remove(
            entity,
            stage.stat,
            TimedThresholdBuffService.sourceId(
              entry.config.group,
              index+1
            )
          );
        }
        return true;
      }

      TimedThresholdBuffService.sync(
        entity,
        entry.config,
        total,
        entity,
        now,
        {
          auraEnabled:
            entry.config.aura!==null
        }
      );
      return true;
    }

    if(kind==='charged-attack'){
      const state=
        ChargedAttackService.state(
          entity,
          String(key)
        );
      const attack=
        ChargedAttackService.attack(
          entity,
          state
        );
      if(!state||!attack?.charge)return false;

      state.frozenProgress=
        Math.max(
          0,
          Math.min(
            1,
            (Number(value)||0)/100
          )
        );
      return true;
    }

    return false;
  }
});