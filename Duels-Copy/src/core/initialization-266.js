


RuntimeValueReferenceService.register(
  'formula-sequence-progress-ratio',
  (entity,ref)=>{
    const target=ref.target==='owner'?(EntityService.owner(entity)||entity):entity;
    const config=FormulaSequenceConfigService(target,{stateKey:String(ref.stateKey||'')});
    const maxStage=Math.max(1,Math.floor(Number(config.maxStage)||1));
    const stage=FormulaSequenceService.stage(target,config);
    if(stage>=maxStage)return 1;
    const state=FormulaSequenceService.state(target,config,true);
    if(!state)return 0;
    const total=FormulaSequenceService.expanded(state.tokens||[]).length;
    return total>0?Math.max(0,Math.min(1,(Number(state.progress)||0)/total)):0;
  }
);