

const DebugControlService=Object.freeze({
  state(target){
    if(!target)return null;
    if(!target.debugControl){
      target.debugControl={
        healthInfinite:false,
        staminaInfinite:false,
        healthFrozen:false,
        staminaFrozen:false,
        counterActive:false,
        counterParryActive:false
      };
    }
    return target.debugControl;
  },
  flag(target,key){
    return !!this.state(target)?.[key];
  },
  toggleFlag(target,key){
    const state=this.state(target);
    if(!state||!(key in state))return false;

    state[key]=!state[key];

    if(key==='healthInfinite'&&state[key]){
      target.health=Math.max(1,target.health);
      if(!target.alive){
        target.alive=true;
        target.hidden=false;
        target.respawnAt=0;
      }
    }

    if(key==='staminaInfinite'&&state[key]){
      target.stamina=target.maxStamina||target.stamina||0;
    }

    const counterModes=
      target.character?.debugCounterModes;
    const counterMode=
      Array.isArray(counterModes)
        ?counterModes.find(mode=>
          String(mode.flag||'')===key
        )
        :null;

    if(counterMode){
      if(state[key]){
        for(const mode of counterModes){
          const flag=String(mode.flag||'');
          if(flag&&flag!==key){
            state[flag]=false;
          }
        }
        CounterStockService.setDebugKind(
          target,
          String(counterMode.kind||'normal')
        );
      }else if(
        !counterModes.some(mode=>
          state[String(mode.flag||'')]===true
        )
      ){
        CounterStockService.reset(target);
      }
    }else if(key==='counterActive'){
      if(state[key]){
        CounterStockService.setDebugKind(
          target,
          'normal'
        );
      }else{
        CounterStockService.reset(target);
      }
    }

    return state[key];
  },
  ccDefaults(type){
    if(type==='slow')return {factor:.45};
    if(type==='zap')return {staminaRegenMultiplier:.60};
    if(type==='burn')return {ratio:.04,interval:500};
    if(type==='poison')return {mode:'percent',value:.01,interval:1000};
    if(type==='bleed')return {ratio:.05,interval:1000};
    if(type==='freeze')return {ratio:.05,interval:1000};
    return {};
  },
  ccSourceId(type){
    return `debug:cc:${type}`;
  },
  buffSourceId(type){
    return `debug:buff:${type}`;
  },
  isCcActive(target,type){
    return !!target&&CCService.hasSource(target,type,this.ccSourceId(type));
  },
  toggleCc(target,type,durationMs=Infinity){
    if(!target)return false;
    const sourceId=this.ccSourceId(type);

    if(CCService.hasSource(target,type,sourceId)){
      CCService.removeSource(target,type,sourceId);
      return false;
    }

    CCService.add(
      target,
      type,
      durationMs===Infinity?Infinity:Math.max(0,Number(durationMs)||0),
      sourceId,
      {
        ...this.ccDefaults(type),
        sourceEntityId:Training.player?.id||target.id,
        presentationSource:'debug'
      }
    );
    return true;
  },
  isPoisonActive(target){
    return this.isCcActive(target,'poison');
  },
  togglePoison(target,value,durationMs=Infinity){
    if(!target)return false;
    const sourceId=this.ccSourceId('poison');

    if(CCService.hasSource(target,'poison',sourceId)){
      CCService.removeSource(target,'poison',sourceId);
      return false;
    }

    CCService.add(
      target,
      'poison',
      durationMs===Infinity?Infinity:Math.max(0,Number(durationMs)||0),
      sourceId,
      {
        mode:'percent',
        value:Math.max(0,Number(value)||0),
        interval:1000,
        sourceEntityId:Training.player?.id||target.id,
        presentationSource:'debug'
      }
    );
    return true;
  },
  isBurnActive(target){
    return this.isCcActive(target,'burn');
  },
  toggleBurn(target,value,durationMs=Infinity){
    if(!target)return false;
    const sourceId=this.ccSourceId('burn');

    if(CCService.hasSource(target,'burn',sourceId)){
      CCService.removeSource(target,'burn',sourceId);
      return false;
    }

    CCService.add(
      target,
      'burn',
      durationMs===Infinity?Infinity:Math.max(0,Number(durationMs)||0),
      sourceId,
      {
        flat:Math.max(0,Number(value)||0),
        interval:500,
        tickAtEnd:true,
        stackMode:'refresh-type',
        sourceEntityId:Training.player?.id||target.id,
        presentationSource:'debug'
      }
    );
    return true;
  },
  isModifierActive(target,type){
    return !!target&&BuffService.hasSource(target,type,this.buffSourceId(type));
  },
  toggleModifier(target,type,value,durationMs=Infinity){
    if(!target||!COMBAT_BUFF_DEFS[type])return false;
    const sourceId=this.buffSourceId(type);

    if(BuffService.hasSource(target,type,sourceId)){
      BuffService.remove(target,type,sourceId);
      return false;
    }

    const raw=Number(value)||0;
    const normalized=type==='regenFlat'?raw:raw/100;

    BuffService.add(
      target,
      type,
      normalized,
      durationMs===Infinity?Infinity:Math.max(0,Number(durationMs)||0),
      sourceId,
      {presentationSource:'debug'}
    );
    return true;
  },
  activeCc(target,now=performance.now()){
    const result=[];
    if(!target)return result;
    for(const [type,def] of Object.entries(COMBAT_STATUS_DEFS)){
      const remaining=CCService.remaining(target,type,now);
      if(remaining>0)result.push({type,label:def.label,remaining});
    }
    return result;
  },
  activeModifiers(target,now=performance.now()){
    const result=[];
    if(!target)return result;
    for(const [type,def] of Object.entries(COMBAT_BUFF_DEFS)){
      const value=BuffService.resolve(target,type,now);
      const remaining=BuffService.remaining(target,type,now);
      if(value!==0)result.push({type,label:def.label,value,remaining});
    }
    return result;
  },
  canForceAction(target,slot){
    if(!target?.alive)return false;

    if(target.kind==='player'){
      if(slot==='dodge')return true;
      return !!target.character?.abilities?.[slot];
    }

    if(target.kind==='trainingBot'){
      if(slot==='dodge')return false;
      return !!GAME_DATA.trainingBots[target.botType]?.attacks?.[slot];
    }

    return false;
  },
  forceAction(target,slot){
    if(!this.canForceAction(target,slot))return false;

    if(target.kind==='player'){
      if(
        Training.sessionMode==='online'&&
        !EntitySimulationAuthorityService.isLocal(target)
      )return false;

      if(slot==='dodge'){
        target.stamina=Math.max(
          target.stamina,
          GAME_DATA.dodge.cost
        );
        target.dodgeUntil=0;

        if(target===Training.player){
          return Training.dodge();
        }

        return EntityDodgeService.activate(
          target,
          {x:1,y:0},
          {
            spend:true,
            startJustDodge:true,
            emit:true
          }
        );
      }

      const ability=
        target.character?.abilities?.[slot];
      const attack=
        ability
          ?AbilityService.attackById(
            target.character,
            ability.attackId
          )
          :null;

      if(attack){
        target.cooldowns.delete(attack.id);
        target.stamina=Math.max(
          target.stamina,
          attack.cost||0
        );
      }

      if(slot==='counter'){
        target.counterReadyUntil=Infinity;
      }

      if(target===Training.player){
        return Training.use(slot);
      }

      return AbilityService.activate(
        target,
        ability,
        {
          event:'input.press',
          inputSlot:slot,
          angle:0,
          network:false
        }
      );
    }

    const config=GAME_DATA.trainingBots[target.botType];
    const attack=config?.attacks?.[slot];
    if(!attack)return false;
    target.cooldowns.delete(attack.id);
    return Training.botAttack(target,slot);
  },
  spawnDummy(){
    const index=++Training.dummySequence;
    const angle=index*.92;
    const distance=100+36*Math.floor((index-1)/6);
    const centerX=WorldBoundsService.width()*.5;
    const centerY=WorldBoundsService.height()/2;

    const authorityPid=
      Training.sessionMode==='online'
        ?String(RoomService.localPid||'local')
        :'training';
    const id=
      Training.sessionMode==='online'
        ?`training.target.${authorityPid}.${index}`
        :`training.target.${index}`;

    const dummy=EntityService.create({
      id,
      kind:'dummy',
      ownerId:id,
      teamId:id,
      simulationAuthorityPid:
        Training.sessionMode==='online'
          ?authorityPid
          :null,
      x:Math.max(24,Math.min(WorldBoundsService.width()-24,centerX+Math.cos(angle)*distance)),
      y:Math.max(24,Math.min(WorldBoundsService.height()-24,centerY+Math.sin(angle)*distance)),
      radius:20,
      color:'#888',
      maxHealth:10000,
      maxStamina:GAME_DATA.stamina.max,
      stamina:GAME_DATA.stamina.max,
      healthPolicy:{minimum:Training.settings.dummyHp==='infinite'?1:0},
      deathPolicy:{respawnMs:3000}
    });

    dummy.alive=true;
    dummy.hidden=false;
    Training.dummies.push(dummy);

    if(!Training.dummy||!EntityService.items.has(Training.dummy.id)){
      Training.dummy=dummy;
    }

    return dummy;
  },
  nearestDummy(origin=Training.player){
    if(!origin)return Training.dummies[0]||null;
    let best=null;
    let bestDistance=Infinity;

    for(const dummy of Training.dummies){
      if(!dummy||!EntityService.items.has(dummy.id))continue;
      const distance=Math.hypot(dummy.x-origin.x,dummy.y-origin.y);
      if(distance<bestDistance){
        best=dummy;
        bestDistance=distance;
      }
    }

    return best;
  },
  removeNearestDummy(origin=Training.player){
    const dummy=this.nearestDummy(origin);
    if(!dummy)return false;

    EntityService.items.delete(dummy.id);

    const index=Training.dummies.indexOf(dummy);
    if(index>=0)Training.dummies.splice(index,1);

    if(Training.dummy===dummy){
      Training.dummy=Training.dummies[0]||null;
    }

    return dummy;
  }
});