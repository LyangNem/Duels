
const RuntimeValueReferenceService=Object.freeze({
  register(type,resolver){
    const key=String(type||'');
    if(!key||typeof resolver!=='function')return false;
    RuntimeValueReferenceProviders.set(key,resolver);
    return true;
  },
  resolve(entity,ref){

    if(!entity||!ref)return '';

    const provider=RuntimeValueReferenceProviders.get(String(ref.type||''));
    if(provider)return provider(entity,ref);

    if(ref.type==='limited-use-buff-remaining'){
      const target=
        ref.target==='owner'
          ?(
            EntityService.owner(entity)||
            entity
          )
          :entity;
      const state=
        target?.actionState?.get?.(
          String(ref.stateKey||'')
        )||
        null;
      return state?.kind===LimitedUseBuffService.KIND
        ?Math.max(
          0,
          Math.floor(
            Number(state.remaining)||0
          )
        )
        :0;
    }

    if(ref.type==='limited-use-buff-maximum'){
      const target=
        ref.target==='owner'
          ?(
            EntityService.owner(entity)||
            entity
          )
          :entity;
      const state=
        target?.actionState?.get?.(
          String(ref.stateKey||'')
        )||
        null;
      if(
        state?.kind===LimitedUseBuffService.KIND
      ){
        return Math.max(
          0,
          Math.floor(
            Number(state.maximum)||
            Number(state.remaining)||
            0
          )
        );
      }

      const fallbackPath=
        String(ref.fallbackPath||'');
      if(!fallbackPath)return 0;

      const character=
        target?.character||
        entity?.character||
        null;
      if(!character)return 0;

      let value=character;
      for(const key of fallbackPath.split('.')){
        if(
          !value||
          typeof value!=='object'||
          !(key in value)
        ){
          return 0;
        }
        value=value[key];
      }

      return Math.max(
        0,
        Math.floor(
          Number(value)||0
        )
      );
    }

    if(ref.type==='action-state-choice'){
      const target=
        ref.target==='owner'
          ?(EntityService.owner(entity)||entity)
          :entity;
      for(const choice of ref.choices||[]){
        const key=String(choice?.stateKey||'');
        if(
          key&&
          TimedActionStateService.state(
            target,
            key
          )
        ){
          return String(choice?.value||'');
        }
      }
      return '';
    }

    if(ref.type==='mode-match-count-ratio'||ref.type==='mode-match-count'){
      const target=
        ref.target==='owner'
          ?(EntityService.owner(entity)||entity)
          :entity;
      const modes=Array.isArray(ref.modes)?ref.modes:[];
      if(!modes.length)return 0;
      let matched=0;
      for(const mode of modes){
        if(
          ModeStateService.current(
            target,
            String(mode?.stateKey||''),
            String(mode?.initial||'')
          )===String(mode?.value||'')
        )matched+=1;
      }
      return ref.type==='mode-match-count'?matched:Math.max(0,Math.min(1,matched/modes.length));
    }

    if(ref.type==='mode'){
      const target=
        ref.target==='owner'
          ?(
            EntityService.owner(entity)||
            entity
          )
          :entity;

      return ModeStateService.current(
        target,
        String(ref.stateKey||''),
        String(ref.initial||'')
      );
    }

    if(ref.type==='progress'){
      const target=
        ref.target==='owner'
          ?(
            EntityService.owner(entity)||
            entity
          )
          :entity;
      const state=ProgressStateService.state(
        target,
        String(ref.stateKey||'')
      );
      const value=state
        ?Math.max(0,Number(state.value)||0)
        :Math.max(0,Number(ref.initial)||0);
      const mode=String(ref.mode||'');
      if(mode==='steps'){
        return Math.max(
          0,
          Math.floor(
            value/
            Math.max(1,Number(ref.stepSize)||1)
          )
        );
      }
      if(mode==='ratio'){
        return Math.max(
          0,
          Math.min(
            1,
            value/
            Math.max(
              1,
              Number(state?.max)||
              Number(ref.max)||
              1
            )
          )
        );
      }
      if(mode==='decay-time'){
        if(value<=0)return 0;
        const stepInterval=Math.max(
          1,
          Number(ref.stepInterval)||
          Number(state?.decay?.stepInterval)||
          5000
        );
        const now=performance.now();
        const remainingCurrent=
          Number(state?.nextDecayStepAt)>0
            ?Math.max(
              0,
              Math.min(
                stepInterval,
                Number(state.nextDecayStepAt)-now
              )
            )
            :stepInterval;
        return Math.max(
          0,
          (Math.ceil(value)-1)*stepInterval+remainingCurrent
        );
      }
      return value;
    }

    if(ref.type==='progress-sum'){
      const target=
        ref.target==='owner'
          ?(
            EntityService.owner(entity)||
            entity
          )
          :entity;
      let total=0;
      for(const stateKey of ref.stateKeys||[]){
        const state=ProgressStateService.state(
          target,
          String(stateKey||'')
        );
        total+=Math.max(0,Number(state?.value)||0);
      }
      const maximum=Number(ref.max);
      return Number.isFinite(maximum)
        ?Math.max(0,Math.min(maximum,total))
        :Math.max(0,total);
    }

    if(ref.type==='progress-timed-remaining'){
      const target=
        ref.target==='owner'
          ?(
            EntityService.owner(entity)||
            entity
          )
          :entity;
      const progressState=
        ProgressStateService.state(
          target,
          String(ref.progressStateKey||'')
        );
      const now=performance.now();
      const timedState=
        TimedActionStateService.state(
          target,
          String(ref.timedStateKey||''),
          now
        );

      if(!progressState||!timedState)return 0;

      const progressRatio=
        Math.max(
          0,
          Math.min(
            1,
            (Number(progressState.value)||0)/
            Math.max(
              1,
              Number(progressState.max)||1
            )
          )
        );
      const duration=
        Math.max(
          1,
          Number(timedState.expiresAt)-
          Number(timedState.startedAt)
        );
      const remainingRatio=
        Math.max(
          0,
          Math.min(
            1,
            (
              Number(timedState.expiresAt)-
              now
            )/
            duration
          )
        );

      return progressRatio*remainingRatio;
    }

    if(ref.type==='cooldown-remaining-ratio'){
      const target=
        ref.target==='owner'
          ?(
            EntityService.owner(entity)||
            entity
          )
          :entity;
      const attackId=String(ref.attackId||'');
      if(!attackId||!target?.cooldowns)return 0;

      const attack=
        AbilityService.attackById(
          target.character,
          attackId
        );
      const duration=Math.max(
        1,
        Number(ref.duration)||
        Number(attack?.cd)||
        1
      );
      const remaining=Math.max(
        0,
        Number(target.cooldowns.get(attackId)||0)-
        performance.now()
      );
      return Math.max(
        0,
        Math.min(1,remaining/duration)
      );
    }

    if(ref.type==='timed-action-remaining'){
      const target=
        ref.target==='owner'
          ?(
            EntityService.owner(entity)||
            entity
          )
          :entity;
      const now=performance.now();
      const state=TimedActionStateService.state(target,String(ref.stateKey||''),now);
      if(!state)return 0;
      const duration=Math.max(1,Number(state.expiresAt)-Number(state.startedAt));
      return Math.max(0,Math.min(1,(Number(state.expiresAt)-now)/duration));
    }

    if(ref.type==='timed-action-progress'){
      const target=
        ref.target==='owner'
          ?(
            EntityService.owner(entity)||
            entity
          )
          :entity;
      const now=performance.now();
      const state=TimedActionStateService.state(target,String(ref.stateKey||''),now);
      if(!state)return 0;
      if(Number(state.completedAt)>0&&Number(state.retainUntil)>now)return 1;
      const duration=Math.max(1,Number(state.expiresAt)-Number(state.startedAt));
      return Math.max(0,Math.min(1,(now-Number(state.startedAt))/duration));
    }

    if(ref.type==='stationary-projectile-count'){
      const target=
        ref.target==='owner'
          ?(
            EntityService.owner(entity)||
            entity
          )
          :entity;
      if(
        typeof StationaryProjectileInteractionService==='undefined'||
        !target
      )return 0;
      return StationaryProjectileInteractionService.items(
        target,
        String(ref.groupKey||'')
      ).length;
    }

    if(ref.type==='field-count'){
      const target=
        ref.target==='owner'
          ?(
            EntityService.owner(entity)||
            entity
          )
          :entity;
      if(String(ref.countMode||'')==='anchors'){
        let count=0;
        const base=InstalledAreaFieldService.baseKey(
          String(ref.stateKey||'area')
        );
        for(const state of target?.actionState?.values?.()||[]){
          if(
            state?.kind!==InstalledAreaFieldService.KIND||
            state.baseStateKey!==base
          )continue;
          if(state.phase==='source-wall')count+=1;
          else if(state.phase==='wall-wall')count+=2;
          else if(state.phase==='point')count+=1;
        }
        return count;
      }
      return InstalledAreaFieldService.countStates(
        target,
        String(ref.stateKey||'area'),
        'point'
      );
    }

    if(ref.type==='projectile-progress-ratio'){
      const target=
        ref.target==='owner'
          ?(
            EntityService.owner(entity)||
            entity
          )
          :entity;
      const projectile=ProjectileStateService.get(
        target,
        String(ref.stateKey||'')
      );
      if(!projectile)return 0;
      const requiredAttackId=String(ref.attackId||'');
      if(
        requiredAttackId&&
        String(projectile.attack?.id||'')!==requiredAttackId
      )return 0;
      const distance=
        Number.isFinite(Number(projectile.targetDistance))&&
        Number(projectile.targetDistance)>0
          ?Number(projectile.targetDistance)
          :Math.max(0,Number(projectile.attack?.range)||0);
      if(!(distance>0))return 0;
      const completeAt=Math.max(
        .0001,
        Number(ref.completeAt)||1
      );
      return Math.max(
        0,
        Math.min(
          1,
          (Math.max(0,Number(projectile.travel)||0)/distance)/completeAt
        )
      );
    }

    return '';
  }
});