




const StealthModeService=Object.freeze({
  KIND:'stealth-mode',
  detectedTargetBuffer:[],
  state(entity,stateKey){
    const value=entity?.actionState?.get(String(stateKey||''))||null;
    return value?.kind===this.KIND?value:null;
  },
  start(entity,module,now=performance.now()){
    if(!entity?.alive||!entity.actionState)return false;
    const stateKey=String(module.stateKey||'stealth:mode');
    if(this.state(entity,stateKey))return false;
    const stealthSourceId=`stealth-mode:${entity.id}:${stateKey}:stealth`;
    const speedSourceId=`stealth-mode:${entity.id}:${stateKey}:speed`;
    const state={
      kind:this.KIND,stateKey,startedAt:now,lastUpdatedAt:now,
      expiresAt:now+Math.max(0,Number(module.maxDuration)||0),
      drainPerSecond:Math.max(0,Number(module.drainPerSecond)||0),
      detectRange:
        Number.isFinite(Number(module.detectRange))
          ?Math.max(0,Number(module.detectRange))
          :(()=>{
            const detectAttackId=String(module.detectAttackId||'');
            if(!detectAttackId)return 0;
            const baseAttack=
              AbilityService.attackById(
                entity.character,
                detectAttackId
              );
            if(!baseAttack)return 0;
            const prepared=
              AugmentService.prepareAttack(
                entity,
                baseAttack,
                now
              );
            const area=
              AttackModuleService.module(
                prepared,
                'delivery.area'
              );
            return Math.max(
              0,
              Number(area?.range)||
              Number(prepared.range)||
              0
            );
          })(),
      detectDelay:Math.max(0,Number(module.detectDelay)||0),
      detectAttackId:String(module.detectAttackId||''),
      cooldownOnStop:Math.max(0,Number(module.cooldownOnStop)||0),
      attackId:String(module.attackId||''),
      attackBoost:module.attackBoost&&typeof module.attackBoost==='object'?{...module.attackBoost}:null,
      stealthSourceId,speedSourceId
    };
    entity.actionState.set(stateKey,state);
    BuffService.set(entity,'stealth',1,stealthSourceId,Infinity,{data:{...(module.stealthData||{})},tags:['은신']});
    if(Number(module.speedModifier)||0){
      BuffService.set(entity,'speed',Number(module.speedModifier)||0,speedSourceId,Infinity,{tags:TagService.effectTags({type:'modifier.constant',value:Number(module.speedModifier)||0})});
    }
    EffectSpawnService.spawn({type:'dodge',x:entity.x,y:entity.y,start:now,dur:12*GAME_DATA.frameMs},{source:entity});
    return true;
  },
  stop(entity,stateKey,now=performance.now(),{detected=false}={}){
    const state=this.state(entity,stateKey);
    if(!state)return false;
    BuffService.remove(entity,'stealth',state.stealthSourceId);
    BuffService.remove(entity,'speed',state.speedSourceId);
    entity.actionState.delete(state.stateKey);
    if(state.attackId&&state.cooldownOnStop>0){
      entity.cooldowns.set(state.attackId,now+state.cooldownOnStop);
    }
    if(detected&&state.attackBoost){
      LimitedUseBuffService.grant(entity,{...state.attackBoost,stateKey:`${state.stateKey}:attack-boost`},now);
    }
    return true;
  },
  detectedTargets(entity,state){
    const result=this.detectedTargetBuffer;
    result.length=0;
    for(const target of EntityService.items.values()){
      if(!target?.alive||target===entity)continue;
      if(RelationService.relation(entity,target)!=='enemy')continue;
      const radius=
        state.detectRange+
        Math.max(0,Number(entity.radius)||0)+
        Math.max(0,Number(target.radius)||0);
      const dx=(Number(target.x)||0)-(Number(entity.x)||0);
      const dy=(Number(target.y)||0)-(Number(entity.y)||0);
      if(dx*dx+dy*dy<=radius*radius)result.push(target);
    }
    return result;
  },
  update(entity,now=performance.now()){
    if(!entity?.actionState||!EntitySimulationAuthorityService.isLocal(entity))return false;
    let changed=false;
    for(const state of entity.actionState.values()){
      if(state?.kind!==this.KIND)continue;
      if(!entity.alive){this.stop(entity,state.stateKey,now);changed=true;continue;}
      const elapsed=Math.max(0,now-(Number(state.lastUpdatedAt)||now));
      state.lastUpdatedAt=now;
      const request=state.drainPerSecond*elapsed/1000;
      if(request>0){
        const available=Math.max(0,Number(entity.stamina)||0);
        const spend=Math.min(request,available);
        if(spend>0)StaminaService.spend(entity,spend,now);
        if(spend+1e-6<request||entity.stamina<=1e-6){this.stop(entity,state.stateKey,now);changed=true;continue;}
      }
      if(now>=state.expiresAt){this.stop(entity,state.stateKey,now);changed=true;continue;}
      if(
        now<
        Math.max(
          0,
          Number(state.startedAt)||0
        )+
        Math.max(
          0,
          Number(state.detectDelay)||0
        )
      ){
        continue;
      }
      const targets=this.detectedTargets(entity,state);
      if(targets.length){
        this.stop(entity,state.stateKey,now,{detected:true});
        if(state.detectAttackId){
          const baseAttack=
            AbilityService.attackById(
              entity.character,
              state.detectAttackId
            );
          if(baseAttack){
            const prepared=
              AugmentService.prepareAttack(
                entity,
                baseAttack,
                now
              );

            /*
              detectRange는 은신 해제 조건 전용이다.
              감지 후 실행되는 detectAttackId의 실제 효과 범위는
              해당 AttackSpec 자체의 range/delivery.area를 그대로 사용한다.
            */
            TriggeredAttackService.execute(
              entity,
              prepared,
              0
            );
          }
        }
        changed=true;
      }
    }
    return changed;
  }
});