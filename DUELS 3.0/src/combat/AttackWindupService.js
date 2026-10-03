

const AttackWindupService=Object.freeze({
  TAG:'선딜레이',
  remoteContinuations:new WeakMap(),
  pendingRemoteCommits:new WeakMap(),
  windupEffects:new WeakMap(),

  continuationMap(entity,create=false){
    if(!entity)return null;
    let map=this.remoteContinuations.get(entity)||null;
    if(!map&&create){
      map=new Map();
      this.remoteContinuations.set(entity,map);
    }
    return map;
  },

  pendingCommitSet(entity,create=false){
    if(!entity)return null;
    let set=this.pendingRemoteCommits.get(entity)||null;
    if(!set&&create){
      set=new Set();
      this.pendingRemoteCommits.set(entity,set);
    }
    return set;
  },

  registerRemoteContinuation(entity,key,continuation){
    const id=String(key||'');
    if(!entity||!id||typeof continuation!=='function')return false;

    const pending=this.pendingCommitSet(entity,false);
    if(pending?.has(id)){
      pending.delete(id);
      if(pending.size===0)this.pendingRemoteCommits.delete(entity);
      continuation();
      return true;
    }

    this.continuationMap(entity,true).set(id,continuation);
    return true;
  },

  commitRemoteContinuation(entity,key){
    const id=String(key||'');
    if(!entity||!id)return false;
    const map=this.continuationMap(entity,false);
    const continuation=map?.get(id)||null;
    if(!continuation){
      this.pendingCommitSet(entity,true).add(id);
      return true;
    }
    map.delete(id);
    if(map.size===0)this.remoteContinuations.delete(entity);
    continuation();
    return true;
  },

  cancelRemoteContinuations(entity){
    let changed=false;
    const map=this.continuationMap(entity,false);
    if(map?.size){
      map.clear();
      this.remoteContinuations.delete(entity);
      changed=true;
    }
    const pending=this.pendingCommitSet(entity,false);
    if(pending?.size){
      pending.clear();
      this.pendingRemoteCommits.delete(entity);
      changed=true;
    }
    return changed;
  },

  effectMap(entity,create=false){
    if(!entity)return null;
    let map=this.windupEffects.get(entity)||null;
    if(!map&&create){
      map=new Map();
      this.windupEffects.set(entity,map);
    }
    return map;
  },

  registerEffect(entity,abilityUseId,key){
    const useId=String(abilityUseId||'');
    const effectKey=String(key||'');
    if(!entity||!useId||!effectKey)return false;

    const map=this.effectMap(entity,true);
    let keys=map.get(useId);
    if(!keys){
      keys=new Set();
      map.set(useId,keys);
    }
    keys.add(effectKey);
    return true;
  },

  releaseEffects(entity,abilityUseId){
    const map=this.effectMap(entity,false);
    const useId=String(abilityUseId||'');
    if(!map||!useId)return false;
    const existed=map.delete(useId);
    if(map.size===0)this.windupEffects.delete(entity);
    return existed;
  },

  cancelEffects(entity){
    const map=this.effectMap(entity,false);
    if(!map?.size)return false;

    let removed=false;
    for(const keys of map.values()){
      for(const key of keys){
        removed=
          EffectSpawnService.removeKey(key)||
          removed;
      }
    }
    map.clear();
    this.windupEffects.delete(entity);
    return removed;
  },

  nextAbilityStep(context){
    context._windupStep=
      Math.max(
        0,
        Math.floor(
          Number(context._windupStep)||0
        )
      )+1;

    return context._windupStep;
  },

  abilityContinuationKey(context,step){
    return [
      'ability',
      String(context?.abilityUseId||''),
      Math.max(1,Math.floor(Number(step)||1))
    ].join(':');
  },

  nextDeliveryKey(execution,spec){
    execution._windupDeliveryOrdinal=
      Math.max(
        0,
        Math.floor(
          Number(
            execution._windupDeliveryOrdinal
          )||0
        )
      )+1;

    return [
      'delivery',
      Math.max(
        0,
        Math.floor(
          Number(execution.sequence)||0
        )
      ),
      execution._windupDeliveryOrdinal,
      String(spec?.id||'')
    ].join(':');
  },

  sendCommit(source,key){
    if(
      !source||
      !key||
      Training.sessionMode!=='online'||
      !OnlineDuelService.active||
      !EntitySimulationAuthorityService.isLocal(source)||
      source!==Training.player
    ){
      return false;
    }

    RoomService.sendGameplay({
      type:'duel-windup-commit',
      roundToken:
        OnlineDuelService.roundToken,
      sourceEntityId:
        String(source.id||''),
      key:String(key)
    });

    return true;
  },


  isTaggedAttack(attack){
    return !!(
      attack&&
      Array.isArray(attack.tags)&&
      attack.tags.includes(
        this.TAG
      )
    );
  },

  attack(
    source,
    attackId
  ){
    const id=
      String(
        attackId||
        ''
      );

    if(
      !source?.character||
      !id.startsWith('attack.')
    ){
      return null;
    }

    return (
      AbilityService.attackById(
        source.character,
        id
      )||
      null
    );
  },

  isTaggedAttackId(
    source,
    attackId
  ){
    return this.isTaggedAttack(
      this.attack(
        source,
        attackId
      )
    );
  },

  contextAttackId(
    context,
    module=null
  ){
    const required=
      String(
        module?.requireAttackId||
        ''
      );

    if(
      required.startsWith(
        'attack.'
      )
    ){
      return required;
    }

    const resolved=
      String(
        context?.resolvedAttackId||
        ''
      );

    if(
      resolved.startsWith(
        'attack.'
      )
    ){
      return resolved;
    }

    return String(
      context?.ability?.attackId||
      context?.attack?.id||
      ''
    );
  },

  isContextWindup(
    context,
    module=null
  ){
    if(
      module?.interruptOnForcedMovement===
        false
    ){
      return false;
    }

    return this.isTaggedAttackId(
      context?.source,
      this.contextAttackId(
        context,
        module
      )
    );
  },

  interrupt(
    entity,
    reason='forced-movement',
    {
      networkReplay=false
    }={}
  ){
    if(!entity?.alive)return false;

    let changed=false;

    if(
      this.cancelRemoteContinuations(
        entity
      )
    ){
      changed=true;
    }

    if(
      this.cancelEffects(
        entity
      )
    ){
      changed=true;
    }

    for(
      const attack of
      Object.values(
        entity.character?.attacks||
        {}
      )
    ){
      if(
        !this.isTaggedAttack(
          attack
        )||
        !Array.isArray(
          attack.windupCancelBuffs
        )
      ){
        continue;
      }

      for(
        const cleanup of
        attack.windupCancelBuffs
      ){
        const stat=
          String(
            cleanup?.stat||
            ''
          );
        const sourceId=
          String(
            cleanup?.sourceId||
            ''
          );

        if(
          stat&&
          sourceId&&
          BuffService.remove(
            entity,
            stat,
            sourceId
          )
        ){
          changed=true;
        }
      }
    }

    if(
      SimulationScheduleService
        .interruptWindups(
          entity
        )
    ){
      changed=true;
    }

    if(
      TimedActionStateService
        .cancelOnForcedMovement(
          entity
        )
    ){
      changed=true;
    }

    if(
      ChannelAttackService
        .interruptCharging(
          entity,
          reason
        )
    ){
      changed=true;
    }


    if(
      typeof CircleFormationService!==
        'undefined'&&
      CircleFormationService
        .cancelWindupOnForcedMovement?.(
          entity,
          reason
        )
    ){
      changed=true;
    }

    if(
      typeof CommandFeatureService!==
        'undefined'&&
      CommandFeatureService
        .cancelCoolingWindup?.(
          entity
        )
    ){
      changed=true;
    }

    /*
     * 반격기는 데이터 태그 통합 대상에서는 제외하지만,
     * 기존 공통 counter windup 자체는 강제이동에 계속 취소된다.
     */
    if(entity.counterWindup){
      const abilityId=
        String(
          entity.counterWindup
            .abilityId||
          ''
        );

      if(abilityId){
        entity.abilityPending
          ?.delete(
            abilityId
          );
      }

      entity.counterWindup=null;
      changed=true;
    }

    /*
     * ChargedAttackService 및 별도 홀드 차징 상태는 여기서
     * 의도적으로 건드리지 않는다.
     */
    if(changed&&entity.attackPreview){
      entity.attackPreview=null;
    }

    if(changed){
      const now=
        performance.now();

      GameEvents.emit(
        'attack-windup-interrupted',
        {
          target:entity,
          reason,
          now
        }
      );

      if(
        !networkReplay&&
        Training.sessionMode==='online'&&
        OnlineDuelService.active&&
        EntitySimulationAuthorityService.isLocal(
          entity
        )&&
        entity===Training.player
      ){
        RoomService.sendGameplay({
          type:'duel-windup-interrupt',
          roundToken:
            OnlineDuelService.roundToken,
          reason:String(
            reason||
            'forced-movement'
          )
        });
      }
    }

    return changed;
  }
});