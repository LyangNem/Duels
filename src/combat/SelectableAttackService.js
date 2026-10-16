/* 순수 데이터로 정의한 모드별/무작위 공격 묶음. 실제 효과는 공용 AttackSpec 실행. */
const SelectableAttackService=Object.freeze({
  pick(values,count=1){
    const pool=[...new Set(values)];const result=[];
    while(pool.length&&result.length<count){result.push(pool.splice(Math.floor(Math.random()*pool.length),1)[0]);}
    return result;
  },
  select(source,module){
    const choices=module.choices||[];
    if(Array.isArray(module.selectedValues))return module.selectedValues.map(value=>choices.find(item=>item.value===value)).filter(Boolean);
    const current=ModeStateService.current(source,module.stateKey,module.initial||choices[0]?.value);
    return module.random===true?this.pick(choices,Math.max(1,Number(module.count)||1)):
      choices.filter(item=>item.value===current).slice(0,1);
  },
  prepare(source,attack,duration=0){
    if(!source?.alive||!EntitySimulationAuthorityService.isLocal(source))return attack;
    let changed=false;
    const modules=(attack?.modules||[]).map(module=>{
      if(module.type!=='attack.select'||module.telegraph!==true)return module;
      const selected=this.select(source,module);
      if(!selected.length)return module;
      changed=true;
      const display=module.displayWindow;
      if(display?.stateKey){
        ModeStateService.set(source,display.modeStateKey,selected.map(item=>item.value).sort().join('-'));
        TimedActionStateService.open(source,{...display,interruptOnForcedMovement:true,duration:Math.max(0,Number(duration)||0)+Math.max(0,Number(display.duration)||0)},performance.now());
      }
      return {...module,selectedValues:selected.map(item=>item.value)};
    });
    return changed?{...attack,modules,selectionPrepared:true}:attack;
  },
  execute(source,module,angle,execution){
    if(!source?.alive||!EntitySimulationAuthorityService.isLocal(source))return false;
    const choices=module.choices||[];
    const current=ModeStateService.current(source,module.stateKey,module.initial||choices[0]?.value);
    const selected=this.select(source,module);
    const now=performance.now();
    const display=module.displayWindow;
    if(display?.stateKey&&selected.length){
      ModeStateService.set(source,display.modeStateKey,selected.map(item=>item.value).sort().join('-'));
      TimedActionStateService.open(source,display,now);
    }
    for(const item of module.choicesOnly===true?[]:selected){
      const base=AbilityService.attackById(source.character,item.attackId);
      if(!base)continue;
      let attack=AugmentService.prepareAttack(source,base,performance.now());
      if(Array.isArray(item.modules)&&item.modules.length)attack={...attack,modules:[...attack.modules,...item.modules]};
      if(module.inheritExtraModules===true&&item.inheritExtraModules!==false)attack={...attack,tags:["반격"],modules:[...attack.modules,...(execution?.extraModules||[])]};
      TriggeredAttackService.execute(source,attack,angle,{targetPoint:execution?.targetPoint});
    }
    if(module.changeMode===true){
      const next=this.pick(choices.filter(item=>item.value!==current))[0];
      if(next){
        const state=ModeStateService.state(source,module.stateKey,true,current);
        const token={};state.pendingSelection=token;
        const apply=()=>{
          if(!source.alive||ModeStateService.state(source,module.stateKey)!==state||state.pendingSelection!==token)return;
          state.previousValue=state.value;state.changedAt=performance.now();state.previousTurns=Number(state.turns)||0;state.turns=state.previousTurns+1;
          ModeStateService.set(source,module.stateKey,next.value);delete state.pendingSelection;
        };
        const delay=Math.max(0,Number(module.changeModeDelay)||0);
        if(delay>0)SimulationScheduleService.scheduleContinuation({at:now+delay,source,continue:apply});else apply();
      }
    }
    return true;
  }
});
