

const TriggerModuleService=Object.freeze({
  matches(trigger,event,context={},conditionResolver=null){
    if(!trigger||trigger.type!=='trigger'||trigger.event!==event)return false;
    for(const condition of trigger.conditions||[]){
      let matched;
      if(typeof conditionResolver==='function'){
        matched=conditionResolver(condition,context);
      }
      if(matched===undefined){
        matched=TriggerConditionService.matches(condition,context);
      }
      if(matched!==true)return false;
    }
    return true;
  }
});