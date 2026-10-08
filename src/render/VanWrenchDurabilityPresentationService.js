

const VanWrenchDurabilityPresentationService=Object.freeze({
  state(entity){
    if(!entity?.character?.wrenchDurability)return null;
    return ProgressStateService.state(
      entity,
      'van-wrench-durability'
    );
  },
  value(entity){
    if(!entity?.character?.wrenchDurability)return 0;
    const state=this.state(entity);
    if(state)return Math.max(0,Number(state.value)||0);
    return Math.max(
      0,
      Number(entity.character?.wrenchDurability?.max)||0
    );
  }
});
