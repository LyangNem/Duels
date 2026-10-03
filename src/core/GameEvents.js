

/* 이벤트 */
const GameEvents=Object.freeze({
  listeners:new Map(),
  on(type,handler){
    const list=this.listeners.get(type)||new Set();
    list.add(handler);
    this.listeners.set(type,list);
    return ()=>list.delete(handler);
  },
  emit(type,payload){
    const list=this.listeners.get(type);
    if(!list?.size)return false;
    for(const handler of list)handler(payload);
    return true;
  }
});