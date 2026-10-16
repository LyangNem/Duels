

const TriggerDispatchService=Object.freeze({
  execute(trigger,event,context={},executor=null){
    if(!TriggerModuleService.matches(trigger,event,context))return false;
    if(typeof executor!=='function')return true;
    executor(trigger.modules||[],context,trigger);
    return true;
  }
});