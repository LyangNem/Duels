


function FormulaSequenceConfigService(entity,module={}){
  const characterConfig=
    entity?.character?.formulaSequence&&
    typeof entity.character.formulaSequence==='object'
      ?entity.character.formulaSequence
      :{};
  const merged={
    ...characterConfig,
    ...module
  };
  const progressModule=
    merged.progressModule&&
    typeof merged.progressModule==='object'
      ?merged.progressModule
      :null;

  return {
    ...merged,
    progressStateKey:String(
      merged.progressStateKey||
      progressModule?.stateKey||
      ''
    ),
    maxStage:Math.max(
      1,
      Math.floor(
        Number(merged.maxStage)||
        Number(progressModule?.max)||
        5
      )
    )
  };
}