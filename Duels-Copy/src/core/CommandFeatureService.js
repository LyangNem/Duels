/* 모듈형 명령 기능·기본 모드·일회성 회복 및 원격 표시. 자원은 공통 전투 규칙 사용. */
const CommandFeatureService={
  commandMap:Object.freeze({'/laser':'laser','/knockback':'knockback','/accelerate':'accelerate','/fix':'fix','/electric':'electric','/dual':'laser-dual','/pierce':'laser-pierce','/instant':'laser-instant','/wide':'laser-wide','/range':'laser-range'}),
  featureEntries:Object.freeze([
    {feature:'knockback',label:'KNOCKBACK'},{feature:'accelerate',label:'ACCELERATE'},
    {feature:'fix',label:'FIX',oneShot:true},{feature:'electric',label:'ELECTRIC'},
    {feature:'laser-dual',label:'DUAL'},{feature:'laser-pierce',label:'PIERCE'},
    {feature:'laser-instant',label:'INSTANT'},{feature:'laser-wide',label:'WIDE'},{feature:'laser-range',label:'RANGE'}
  ].map(Object.freeze)),
  isCharacter(e){return !!e?.character?.commandFeatures;},
  stateKey(f){return `command:${String(f||'')}`;},
  ensure(e){
    if(!this.isCharacter(e))return false;
    if(!e._commandFeatureInitialized){e._commandFeatureInitialized=true;e._commandOverclock=null;ModeStateService.set(e,this.stateKey('laser'),'active','active');}
    return true;
  },
  resetEntity(e){if(!e)return false;for(const f of ['laser',...this.featureEntries.map(x=>x.feature)])e.actionState?.delete(ModeStateService.key(this.stateKey(f)));e._commandFixGlowUntil=0;e._commandFeatureInitialized=false;return true;},
  has(e,f){return f==='fix'?performance.now()<Number(e?._commandFixGlowUntil||0):ModeStateService.current(e,this.stateKey(f),f==='laser'?'active':'inactive')==='active';},
  networkSnapshot(e){if(!this.isCharacter(e))return null;return ['laser',...this.featureEntries.filter(x=>!x.oneShot).map(x=>x.feature)].filter(f=>this.has(e,f));},
  applyNetworkSnapshot(e,snapshot){if(!this.isCharacter(e)||!Array.isArray(snapshot))return false;for(const f of ['laser',...this.featureEntries.filter(x=>!x.oneShot).map(x=>x.feature)])this.setState(e,f,snapshot.includes(f),{network:true});return true;},
  setState(e,f,active=true,{network=false}={}){if(!this.ensure(e)||f==='fix')return false;ModeStateService.set(e,this.stateKey(f),active?'active':'inactive',f==='laser'?'active':'inactive');if(!network)GameplayFeatureStateSyncService.send(e,'command',f,active===true);return true;},
  runFix(e,{network=false}={}){
    if(!this.ensure(e))return false;
    e._commandFixGlowUntil=performance.now()+Number(e.character.commandFeatures.fixGlowDuration||1000);
    if(!network&&EntitySimulationAuthorityService.isLocal(e))ResourceRestoreEffectService.apply({source:e,target:e,module:{type:'resource.restore',resource:'health',recipient:'source',missingResourceRatio:e.character.commandFeatures.fixMissingHealthRatio,applyHealingModifier:false}});
    if(!network)GameplayFeatureStateSyncService.send(e,'command','fix',true);
    return true;
  },
  runRepair(e){return this.runFix(e);},
  toggle(e,f,options={}){return f==='fix'?this.runFix(e,options):this.setState(e,f,!this.has(e,f),options);},
  activate(e,command,{network=false}={}){if(!this.ensure(e))return {ok:false,status:'error',feature:''};const feature=this.commandMap[String(command||'').trim().toLowerCase()];if(!feature)return {ok:false,status:'error',feature:''};if(feature==='fix')return {ok:this.runFix(e,{network}),status:'ok',feature};if(this.has(e,feature))return {ok:true,status:'already',feature};return {ok:this.setState(e,feature,true,{network}),status:'ok',feature};},
  applyRemote(e,f,active=true){return f==='fix'?this.runFix(e,{network:true}):this.setState(e,f,active,{network:true});},
  blocksNaturalStaminaRegen(){return false;},
  onAction(){return false;},
  update(e){return this.ensure(e);},
  cancelCoolingWindup(){return false;},
  coolingInterrupted(){return false;},
  rapidCoolingState(){return null;},
  stopRapidCooling(){return false;}
};
