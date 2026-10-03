

const ProjectileTargetFilterService=Object.freeze({
  handlers:new Map(),
  register(moduleType,handler){
    const key=String(moduleType||'');
    if(!key||typeof handler!=='function')return false;
    this.handlers.set(key,handler);
    return true;
  },
  allows(projectile,target){
    if(!projectile||!target)return false;
    for(const module of projectile.attack?.modules||[]){
      const type=AttackModuleService.type(module);
      const handler=this.handlers.get(type);
      if(typeof handler!=='function')continue;
      if(handler({projectile,target,module})===false)return false;
    }
    return true;
  }
});