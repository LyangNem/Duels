

GameEvents.on('dodge-started',event=>{
  const entity=event?.target;
  const now=Number(event?.now)||performance.now();
  DodgeFollowupStateService.begin(
    entity,
    event?.movement||null,
    now
  );
  PositionMemoryService.recordDodge(entity,now);
  FieldDodgeRewardService.begin(entity,now);
  for(const config of entity?.character?.dodgeStateWindows||[]){
    TimedActionStateService.open(entity,config,now);
  }

});