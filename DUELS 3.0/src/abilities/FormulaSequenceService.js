

const FormulaSequenceService=Object.freeze({
  KIND:'formula-sequence',
  FLASH_KIND:'formula-sequence-complete-flash',

  flashStateKey(config={}){
    return `${String(config.stateKey||'formula:sequence')}:complete-flash`;
  },

  completeFlashActive(entity,config={},now=performance.now()){
    if(!entity)return false;

    if(
      String(config.completeFlashMode||'')==='final-persistent'
    ){
      const maxStage=Math.max(
        1,
        Math.floor(Number(config.maxStage)||1)
      );
      return this.stage(entity,config)>=maxStage;
    }

    if(!entity.actionState)return false;
    const key=this.flashStateKey(config);
    const state=entity.actionState.get(key);
    if(state?.kind!==this.FLASH_KIND)return false;
    if((Number(state.expiresAt)||0)<=now){
      entity.actionState.delete(key);
      return false;
    }
    return true;
  },

  startCompleteFlash(entity,config={},now=performance.now()){
    if(!entity?.actionState)return false;
    const duration=Math.max(
      500,
      Number(config.completeFlashMs)||500
    );
    entity.actionState.set(
      this.flashStateKey(config),
      {
        kind:this.FLASH_KIND,
        startedAt:now,
        expiresAt:now+duration
      }
    );
    return true;
  },

  normalizeFormula(formula){
    return Array.isArray(formula)
      ?formula
        .map(token=>String(token||'').toUpperCase().trim())
        .filter(Boolean)
      :[];
  },

  expanded(tokens){
    return this.normalizeFormula(tokens)
      .join('')
      .split('')
      .filter(value=>value==='L'||value==='R');
  },

  stage(entity,config){
    const maxStage=Math.max(1,Math.floor(Number(config.maxStage)||5));
    const progress=ProgressStateService.state(
      entity,
      String(config.progressStateKey||'')
    );
    return Math.max(
      0,
      Math.min(
        maxStage,
        Math.floor(Number(progress?.value)||0)
      )
    );
  },

  pointerDistance(source,targetPoint){
    if(
      !source||
      !targetPoint||
      !Number.isFinite(Number(targetPoint.x))||
      !Number.isFinite(Number(targetPoint.y))
    )return Infinity;
    return Math.hypot(
      Number(targetPoint.x)-Number(source.x),
      Number(targetPoint.y)-Number(source.y)
    );
  },

  withinActivation(source,targetPoint,config){
    return this.pointerDistance(source,targetPoint)<=
      Math.max(0,Number(config.activationRange)||100);
  },

  chooseIndex(entity,stage,formulas){
    if(!Array.isArray(formulas)||!formulas.length)return 0;
    const seed=
      String(entity?.id||'')
        .split('')
        .reduce((sum,ch)=>sum+ch.charCodeAt(0),0)+
      stage*17+
      Math.floor(performance.now()/37);
    return Math.abs(seed)%formulas.length;
  },

  state(entity,module={},create=true){
    if(!entity?.actionState)return null;
    const config=FormulaSequenceConfigService(entity,module);
    const stateKey=String(config.stateKey||'formula:sequence');
    const stage=this.stage(entity,config);
    const maxStage=Math.max(1,Math.floor(Number(config.maxStage)||5));

    if(stage>=maxStage){
      entity.actionState.delete(stateKey);
      return null;
    }

    const stagePools=Array.isArray(config.formulas)?config.formulas:[];
    const formulas=Array.isArray(stagePools[stage])?stagePools[stage]:[];
    if(!formulas.length)return null;

    let state=entity.actionState.get(stateKey);
    if(
      state?.kind!==this.KIND||
      Number(state.stage)!==stage
    ){
      if(!create)return null;
      const selectedIndex=this.chooseIndex(entity,stage,formulas);
      state={
        kind:this.KIND,
        stateKey,
        stage,
        selectedIndex,
        tokens:this.normalizeFormula(formulas[selectedIndex]),
        progress:0,
        mistakes:0
      };
      entity.actionState.set(stateKey,state);
    }
    return state;
  },

  mistakeProgress(progress,config={}){
    const current=
      Math.max(
        0,
        Math.floor(Number(progress)||0)
      );
    const rule=
      config?.mistakeProgress&&
      typeof config.mistakeProgress==='object'
        ?config.mistakeProgress
        :null;

    if(
      !rule||
      String(rule.operation||'reset')!=='retain-ratio'
    )return 0;

    const ratio=
      Math.max(
        0,
        Math.min(
          1,
          Number(rule.ratio)||0
        )
      );
    const raw=current*ratio;
    const round=String(rule.round||'floor');

    if(round==='ceil')return Math.ceil(raw);
    if(round==='round')return Math.round(raw);
    return Math.floor(raw);
  },

  input(source,module,button,targetPoint,now=performance.now()){
    if(!source?.alive)return {handled:false};
    const config=FormulaSequenceConfigService(source,module);
    const maxStage=Math.max(1,Math.floor(Number(config.maxStage)||5));

    if(this.stage(source,config)>=maxStage){
      return {
        handled:false,
        maxed:true
      };
    }

    if(
      config.blockWhileDodging===true&&
      Math.max(0,Number(source.dodgeUntil)||0)>now
    ){
      return {
        handled:true,
        executed:false,
        blockedByDodge:true
      };
    }

    if(!this.withinActivation(source,targetPoint,config)){
      return {handled:false};
    }

    const state=this.state(source,module,true);
    if(!state)return {handled:true};

    const input=String(button||'').toUpperCase();
    if(input!=='L'&&input!=='R')return {handled:true};

    const expected=this.expanded(state.tokens);
    if(expected[state.progress]!==input){
      state.progress=
        this.mistakeProgress(
          state.progress,
          config
        );
      state.mistakes=(Number(state.mistakes)||0)+1;
      state.lastInputAt=now;
      return {handled:true,wrong:true,state};
    }

    state.progress++;
    state.lastInputAt=now;

    if(state.progress<expected.length){
      return {handled:true,state};
    }

    ProgressStateService.apply(
      source,
      {
        type:'state.progress',
        stateKey:String(config.progressStateKey||''),
        operation:'add',
        amount:1,
        max:maxStage
      }
    );

    const completedStage=this.stage(source,config);
    source.actionState.delete(String(config.stateKey||'formula:sequence'));

    const flashMode=
      String(config.completeFlashMode||'each-stage');
    const shouldFlash=
      flashMode==='final-only'
        ?completedStage>=maxStage
        :(
          flashMode==='final-persistent'
            ?false
            :flashMode!=='none'
        );

    if(shouldFlash){
      this.startCompleteFlash(
        source,
        config,
        now
      );
    }

    return {
      handled:true,
      completed:true,
      stage:completedStage,
      maxed:completedStage>=maxStage
    };
  },

  presentation(entity,stateKey){
    if(!entity)return null;
    return this.state(entity,{stateKey:String(stateKey||'')},true);
  },

  tokenProgress(state){
    if(!state)return [];
    const progress=Math.max(0,Math.floor(Number(state.progress)||0));
    let consumed=0;
    return (state.tokens||[]).map(token=>{
      const text=String(token||'');
      const chars=text
        .split('')
        .filter(value=>value==='L'||value==='R')
        .map((char,index)=>{
          const absoluteIndex=consumed+index;
          return {
            char,
            complete:progress>absoluteIndex,
            active:progress===absoluteIndex
          };
        });
      const complete=
        chars.length>0&&
        chars.every(item=>item.complete);
      const active=
        chars.some(item=>item.active);
      consumed+=chars.length;
      return {
        token:text,
        chars,
        complete,
        active
      };
    });
  }
});