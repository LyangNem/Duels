



// ChargedAttackService: 홀드 시간·지속 스테미나 소모·릴리스 수치를 하나의 범용 차징 공격 상태로 관리한다.
const ChargedAttackService=Object.freeze({
  KIND:'charged-attack-state',
  state(entity,stateKey='charge:primary'){
    const value=entity?.actionState?.get(stateKey)||null;
    return value?.kind===this.KIND?value:null;
  },
  states(entity){
    if(!entity?.actionState)return [];
    const result=[];
    for(const value of entity.actionState.values()){
      if(value?.kind===this.KIND)result.push(value);
    }
    return result;
  },
  attack(entity,state){
    return AbilityService.attackById(entity?.character,state?.attackId);
  },
  maxProgress(attack){
    return Math.max(1,Number(attack?.charge?.maxProgress)||1);
  },
  resourceProgressCap(entity,state,attack,now=performance.now()){
    const maxProgress=this.maxProgress(attack);
    const charge=attack?.charge||{};
    const configuredFullCost=Number(charge.fullCost);

    if(
      !entity||
      state?.freeAttack===true||
      !Number.isFinite(configuredFullCost)||
      configuredFullCost<=0||
      String(charge.costTiming||'release')==='during-charge'
    ){
      return maxProgress;
    }

    const multiplier=
      AugmentService.attackCostMultiplier(
        entity,
        attack,
        now
      );
    const fullCost=Math.max(
      0,
      configuredFullCost*multiplier
    );
    if(fullCost<=0)return maxProgress;

    const availableBudget=
      Math.max(0,Number(state?.drained)||0)+
      StaminaService.nominalBudget(entity,now);

    return Math.max(
      0,
      Math.min(
        maxProgress,
        availableBudget/fullCost*maxProgress
      )
    );
  },
  progress(state,attack,now=performance.now()){
    const maxProgress=this.maxProgress(attack);
    if(Number.isFinite(state?.frozenProgress)){
      return Math.max(0,Math.min(maxProgress,state.frozenProgress));
    }
    const duration=Math.max(1,Number(attack?.charge?.duration)||1);
    const timeProgress=Math.max(
      0,
      Math.min(
        maxProgress,
        (now-Number(state?.startedAt||now))/duration*maxProgress
      )
    );
    const resourceCap=Number(state?.resourceProgressCap);
    return Number.isFinite(resourceCap)
      ?Math.min(
        timeProgress,
        Math.max(0,Math.min(maxProgress,resourceCap))
      )
      :timeProgress;
  },
  lerp(pair,progress,fallback){
    if(!pair||typeof pair!=='object')return fallback;
    const from=Number(pair.from);
    const to=Number(pair.to);
    if(!Number.isFinite(from)||!Number.isFinite(to))return fallback;
    return from+(to-from)*progress;
  },
  dynamicSpec(attack,progress){
    const charge=attack?.charge||{};
    const maxProgress=this.maxProgress(attack);
    const resolvedProgress=Math.max(
      0,
      Math.min(maxProgress,Number(progress)||0)
    );
    const normalizedProgress=
      maxProgress>0
        ?resolvedProgress/maxProgress
        :0;
    const full=
      resolvedProgress>=1&&
      charge.fullSpec&&
      typeof charge.fullSpec==='object'
        ?charge.fullSpec
        :null;

    const range=full&&Number.isFinite(Number(full.range))
      ?Number(full.range)
      :this.lerp(
        charge.range,
        normalizedProgress,
        Number(attack?.range)||0
      );
    const damageRatio=full&&Number.isFinite(Number(full.damageRatio))
      ?Number(full.damageRatio)
      :this.lerp(
        charge.damageRatio,
        normalizedProgress,
        Number(attack?.damageRatio)||0
      );
    const projectileSpeed=this.lerp(
      charge.projectileSpeed,
      normalizedProgress,
      Number(AttackModuleService.projectile(attack)?.speed)||0
    );
    const pierceWallsAt=Number(charge.pierceWallsAt);
    const modules=Array.isArray(full?.modules)
      ?[...full.modules]
      :(attack?.modules||[]).map(module=>{
        const type=AttackModuleService.type(module);
        if(type==='delivery.area')return {...module,range};
        if((type==='delivery.projectile'||type==='delivery.range-projectile')&&Number.isFinite(projectileSpeed)){
          return {...module,speed:projectileSpeed};
        }
        if(type==='projectile.pierce'&&Number.isFinite(pierceWallsAt)){
          return {...module,walls:resolvedProgress>=pierceWallsAt};
        }
        return module;
      });

    return {
      ...attack,
      ...(full||{}),
      id:attack.id,
      tags:attack.tags,
      charge:attack.charge,
      range,
      damageRatio,
      resolvedChargeProgress:resolvedProgress,
      cost:0,
      modules
    };
  },
  syncPreview(entity,state,attack,angle,now=performance.now()){
    if(
      !entity||
      !state||
      !attack?.charge||
      !EntitySimulationAuthorityService.isLocal(entity)
    )return false;

    const resolvedAngle=Number(angle);
    if(Number.isFinite(resolvedAngle))state.angle=resolvedAngle;

    const progress=this.progress(state,attack,now);
    const continuousPreview=!!attack.charge.preview;
    const fullOnlyPreview=
      attack.charge.previewAtFull===true&&
      progress>=1;

    if(!continuousPreview&&!fullOnlyPreview){
      if(entity.attackPreview)entity.attackPreview=null;
      return false;
    }

    const dynamic=this.dynamicSpec(attack,progress);
    entity.attackPreview=AttackPreviewService.fromAttack(
      entity,
      dynamic,
      Number.isFinite(state.angle)?state.angle:0,
      now+Math.max(50,GAME_DATA.frameMs*2),
      entity.attackPreview
    );
    return true;
  },
  start(context,module){
    const source=context?.source;
    const attack=context?.attack;
    if(!source?.actionState||!attack?.charge)return false;
    const stateKey=String(module?.stateKey||'charge:primary');
    if(this.state(source,stateKey))return false;

    const now=Number(context.now)||performance.now();
    const costMultiplier=
      AugmentService.attackCostMultiplier(
        source,
        attack,
        now
      );
    const minimum=
      Math.max(
        0,
        Number(attack.charge.costMin)||Number(attack.cost)||0
      )*costMultiplier;
    if(
      context.network!==true&&
      context.freeAttack!==true
    ){
      AugmentService.update(source,now);
      if(!AttackService.canUse(source,{...attack,cost:minimum})){
        return false;
      }
    }

    const costTiming=String(attack.charge.costTiming||'release');
    const resourceConditionSnapshot=
      AugmentService.captureResourceConditionSnapshot(
        source
      );
    let initiallyDrained=0;
    if(
      context.network!==true&&
      context.freeAttack!==true&&
      costTiming==='during-charge'&&
      minimum>0
    ){
      if(!StaminaService.spend(source,minimum,now))return false;
      initiallyDrained=minimum;
    }

    source.actionState.set(stateKey,{
      kind:this.KIND,
      stateKey,
      attackId:attack.id,
      startedAt:now,
      lastUpdatedAt:now,
      drained:initiallyDrained,
      resourceConditionSnapshot,
      freeAttack:context.freeAttack===true,
      frozenProgress:null,
      resourceProgressCap:null,
      cameraAimSuppressed:false,
      angle:Number.isFinite(Number(context.angle))?Number(context.angle):0
    });
    const startedState=this.state(source,stateKey);
    if(startedState){
      startedState.resourceProgressCap=
        this.resourceProgressCap(
          source,
          startedState,
          attack,
          now
        );
    }
    const selfStatus=attack.charge.selfStatus;
    if(selfStatus?.type&&COMBAT_STATUS_DEFS[selfStatus.type]){
      CCService.add(
        source,
        String(selfStatus.type),
        Infinity,
        `charge:${stateKey}:self-status`,
        {sourceEntityId:source.id}
      );
    }
    this.syncPreview(
      source,
      this.state(source,stateKey),
      attack,
      context.angle,
      now
    );
    // 차징 시작 자체는 실제 공격이 아니므로 자연 체력 회복 대기시간을 초기화하지 않는다.
    // 실제 발사는 release() -> AttackService.execute()에서 기존대로 자연 회복을 중단한다.
    context.handled=true;
    return true;
  },
  update(entity,now=performance.now(),resolveAim=null){
    if(!entity?.actionState)return false;
    let changed=false;
    for(const state of this.states(entity)){
      const attack=this.attack(entity,state);
      const charge=attack?.charge;
      if(!charge)continue;

      const liveAngle=Number(
        resolveAim
          ?resolveAim()
          :entity?._remoteAimAngle
      );
      if(Number.isFinite(liveAngle))state.angle=liveAngle;

      if(state.queuedRelease&&!MovementAbilityService.active(entity)){
        this.releaseQueued(entity,now);
        changed=true;
        continue;
      }

      if(
        EntitySimulationAuthorityService.isLocal(entity)&&
        !Number.isFinite(state.frozenProgress)
      ){
        state.resourceProgressCap=
          this.resourceProgressCap(
            entity,
            state,
            attack,
            now
          );
      }

      if(
        EntitySimulationAuthorityService.isLocal(entity)&&
        state.freeAttack!==true&&
        !Number.isFinite(state.frozenProgress)
      ){
        const duration=Math.max(1,Number(charge.duration)||1);
        const chargeEnd=state.startedAt+duration;
        const previous=Math.min(state.lastUpdatedAt,chargeEnd);
        const current=Math.min(now,chargeEnd);
        const elapsed=Math.max(0,current-previous);
        state.lastUpdatedAt=now;
        const costMultiplier=
          AugmentService.attackCostMultiplier(
            entity,
            attack,
            now
          );
        const configuredRate=
          Math.max(0,Number(charge.drainRate)||0)*
          costMultiplier;
        const minCost=
          Math.max(0,Number(charge.costMin)||0)*
          costMultiplier;
        const maxCost=Math.max(
          minCost,
          (Number(charge.costMax)||Number(charge.costMin)||0)*
            costMultiplier
        );
        const rate=String(charge.costTiming||'release')==='during-charge'
          ?Math.max(0,(maxCost-minCost)/(duration/1000))
          :configuredRate;
        const request=rate*elapsed/1000;
        if(request>0){
          const available=StaminaService.nominalBudget(entity,now);
          const spend=Math.min(request,available);
          if(spend>0){
            StaminaService.spend(entity,spend,now);
            state.drained+=spend;
          }
          if(spend+1e-6<request||entity.stamina<=1e-6){
            const depletionAt=
              previous+
              (rate>0?spend/rate*1000:0);
            state.frozenProgress=Math.max(
              0,
              Math.min(
                this.maxProgress(attack),
                (depletionAt-state.startedAt)/duration*this.maxProgress(attack)
              )
            );
          }
        }
      }
      this.syncPreview(entity,state,attack,state.angle,now);
      changed=true;
    }
    return changed;
  },
  releaseData(entity,ability,now=performance.now()){
    if(!entity||!ability)return null;
    this.update(entity,now);
    for(const state of this.states(entity)){
      if(state.attackId!==ability.attackId)continue;
      const attack=this.attack(entity,state);
      if(!attack)return null;
      const releaseModule=(ability.releaseTrigger?.modules||[]).find(
        module=>AttackModuleService.type(module)==='charge.attack.release'
      )||null;
      return {
        resolvedChargeProgress:this.progress(state,attack,now),
        deferredWhileMovement:
          releaseModule?.deferWhileMovement===true&&
          MovementAbilityService.active(entity)
      };
    }
    return null;
  },
  release(context,module){
    const source=context?.source;
    const stateKey=String(module?.stateKey||'charge:primary');
    const state=this.state(source,stateKey);
    const attack=context?.attack;
    if(!state||!attack?.charge)return false;

    const now=Number(context.now)||performance.now();
    if(context.network!==true)this.update(source,now);

    if(module?.deferWhileMovement===true&&MovementAbilityService.active(source)){
      const frozen=this.progress(state,attack,now);
      state.frozenProgress=frozen;
      state.queuedRelease={
        angle:Number.isFinite(Number(context.angle))?Number(context.angle):Number(state.angle)||0,
        targetPoint:context.targetPoint||null,
        network:context.network===true,
        freeAttack:
          context.freeAttack===true||
          state.freeAttack===true,
        resolvedChargeProgress:Number.isFinite(Number(context.resolvedChargeProgress))
          ?Number(context.resolvedChargeProgress)
          :frozen
      };
      context.handled=true;
      context.executed=true;
      return true;
    }
    const networkProgress=Number(context.resolvedChargeProgress);
    const maxProgress=this.maxProgress(attack);
    const progress=Number.isFinite(networkProgress)
      ?Math.max(0,Math.min(maxProgress,networkProgress))
      :this.progress(state,attack,now);

    let resolvedProgress=progress;
    const costTiming=String(attack.charge.costTiming||'release');
    if(
      context.network!==true&&
      context.freeAttack!==true&&
      state.freeAttack!==true&&
      costTiming!=='during-charge'&&
      !Number.isFinite(state.frozenProgress)
    ){
      const costMultiplier=
        AugmentService.attackCostMultiplier(
          source,
          attack,
          now
        );
      const minCost=
        Math.max(
          0,
          Number(attack.charge.costMin)||Number(attack.cost)||0
        )*costMultiplier;
      const maxCost=Math.max(
        minCost,
        (Number(attack.charge.costMax)||Number(attack.charge.costMin)||Number(attack.cost)||0)*
          costMultiplier
      );
      const availableBudget=Math.max(0,Number(state.drained)||0)+StaminaService.nominalBudget(source,now);
      const normalizedProgress=maxProgress>0?resolvedProgress/maxProgress:0;
      const configuredFullCost=Number(attack.charge.fullCost);
      const hasDiscreteFullCost=Number.isFinite(configuredFullCost);
      const fullCost=
        hasDiscreteFullCost
          ?Math.max(minCost,configuredFullCost*costMultiplier)
          :maxCost;
      const requestedCost=
        hasDiscreteFullCost
          ?(resolvedProgress>=1?fullCost:minCost)
          :minCost+(maxCost-minCost)*normalizedProgress;

      // fullCost가 있으면 최대 차징 순간에만 별도 비용으로 전환한다.
      // 최대차징 전용 비용이 부족하면 하위 공격으로 자동 강등하지 않고
      // 해당 릴리스를 실패 처리한다. 기존 연속 비용형 차징만 종전처럼
      // 현재 예산에 맞춰 진행률을 낮춘다.
      if(
        hasDiscreteFullCost&&
        resolvedProgress>=1&&
        requestedCost>availableBudget+1e-6
      ){
        source.actionState.delete(stateKey);
        const failedSelfStatus=attack.charge.selfStatus;
        if(failedSelfStatus?.type){
          CCService.removeSource(
            source,
            String(failedSelfStatus.type),
            `charge:${stateKey}:self-status`
          );
        }
        source.attackPreview=null;
        context.handled=true;
        return false;
      }
      if(
        !hasDiscreteFullCost&&
        requestedCost>availableBudget+1e-6&&
        maxCost>minCost
      ){
        resolvedProgress=Math.max(
          0,
          Math.min(
            maxProgress,
            (availableBudget-minCost)/(maxCost-minCost)*maxProgress
          )
        );
      }

      const resolvedCost=
        hasDiscreteFullCost
          ?(resolvedProgress>=1?fullCost:minCost)
          :minCost+(maxCost-minCost)*(maxProgress>0?resolvedProgress/maxProgress:0);
      const remaining=Math.max(0,resolvedCost-state.drained);
      if(remaining>0){
        StaminaService.spend(
          source,
          remaining,
          now
        );
      }
    }

    source.actionState.delete(stateKey);
    const selfStatus=attack.charge.selfStatus;
    if(selfStatus?.type){
      CCService.removeSource(
        source,
        String(selfStatus.type),
        `charge:${stateKey}:self-status`
      );
    }
    source.attackPreview=null;
    const spec=this.dynamicSpec(attack,resolvedProgress);
    const result=AttackService.execute(
      source,
      spec,
      context.angle,
      {
        networkReplay:context.network===true,
        freeAttack:
          context.freeAttack===true||
          state.freeAttack===true,
        targetPoint:context.targetPoint||null,
        resourceConditionSnapshot:
          state.resourceConditionSnapshot||
          null
      }
    );
    if(result){
      context.handled=true;
      context.executed=true;
      context.resolvedAttackId=spec.id;
      if(context.usageTags instanceof Set){
        for(const tag of TagService.attackTags(spec)){
          context.usageTags.add(tag);
        }
      }
    }
    return result;
  },
  releaseQueued(entity,now=performance.now()){
    if(!entity?.actionState||MovementAbilityService.active(entity))return false;
    for(const state of this.states(entity)){
      const queued=state.queuedRelease;
      if(!queued)continue;
      state.queuedRelease=null;
      const attack=this.attack(entity,state);
      if(!attack)return false;
      const liveTargetPoint=
        EntitySimulationAuthorityService.isLocal(entity)&&Training.player===entity
          ?(()=>{
            const point=Training.mouseWorld();
            return {x:Number(point.x)||0,y:Number(point.y)||0};
          })()
          :(
            entity?._remoteAimTargetPoint&&
            Number.isFinite(Number(entity._remoteAimTargetPoint.x))&&
            Number.isFinite(Number(entity._remoteAimTargetPoint.y))
              ?{
                x:Number(entity._remoteAimTargetPoint.x),
                y:Number(entity._remoteAimTargetPoint.y)
              }
              :queued.targetPoint
          );
      return this.release({
        source:entity,
        attack,
        angle:Number.isFinite(Number(state.angle))?Number(state.angle):queued.angle,
        targetPoint:liveTargetPoint,
        network:queued.network,
        freeAttack:queued.freeAttack===true,
        resolvedChargeProgress:queued.resolvedChargeProgress,
        now
      },{stateKey:state.stateKey});
    }
    return false;
  },
  cancel(entity,ability=null){
    if(!entity?.actionState)return false;
    let removed=false;
    for(const [key,state] of entity.actionState){
      if(state?.kind!==this.KIND)continue;
      if(ability&&state.attackId!==ability.attackId)continue;
      const attack=this.attack(entity,state);
      const selfStatus=attack?.charge?.selfStatus;
      if(selfStatus?.type){
        CCService.removeSource(
          entity,
          String(selfStatus.type),
          `charge:${key}:self-status`
        );
      }
      entity.actionState.delete(key);
      removed=true;
    }
    if(removed)entity.attackPreview=null;
    return removed;
  },
  blocksMovement(entity){
    return false;
  },
  allowsStaminaRegen(entity){
    for(const state of this.states(entity)){
      const attack=this.attack(entity,state);
      if(attack?.charge?.staminaRegenDuringCharge===false){
        return false;
      }
    }
    return true;
  },
  hasGauge(entity){
    for(const state of this.states(entity)){
      const attack=this.attack(entity,state);
      if(attack?.charge?.gauge)return true;
    }
    return false;
  },
  isFull(entity,now=performance.now()){
    for(const state of this.states(entity)){
      const attack=this.attack(entity,state);
      if(attack?.charge?.gauge&&this.progress(state,attack,now)>=this.maxProgress(attack))return true;
    }
    return false;
  },
  draw(ctx,entity,now=performance.now()){
    for(const state of this.states(entity)){
      const attack=this.attack(entity,state);
      if(!attack?.charge?.gauge)continue;
      const rawProgress=this.progress(state,attack,now);
      const progress=rawProgress/this.maxProgress(attack);
      const gaugeStyle=attack.charge.gauge===true?{}:(attack.charge.gauge||{});
      const layers=Math.max(1,Math.floor(Number(gaugeStyle.layers)||1));
      const radius=EntityRingLayoutService.chargeRadius(entity);
      const baseOptions={
        color:entity.color,
        lineWidth:3,
        lineCap:'butt',
        radius,
        showEmpty:true,
        maxChargeFlash:false,
        completePulseRadius:EntityRingLayoutService.maxChargeFlashRadius(entity,now)
      };
      if(layers<=1){
        ArcGaugePresentationService.render(ctx,entity,progress,{
          ...baseOptions,
          completeAccent:progress>=1,
          maxChargeFlash:progress>=1
        });
        return true;
      }
      baseOptions.completeAccent=false;
      const scaled=progress*layers;
      const first=Math.max(0,Math.min(1,scaled));
      const second=Math.max(0,Math.min(1,scaled-1));
      ArcGaugePresentationService.render(ctx,entity,first,baseOptions);
      if(second>0){
        ArcGaugePresentationService.render(ctx,entity,second,{
          ...baseOptions,
          color:gaugeStyle.overflowColor||entity.color,
          showEmpty:false
        });
      }
      if(progress>=1&&gaugeStyle.maxChargeFlash!==false){
        ArcGaugePresentationService.render(ctx,entity,1,{
          ...baseOptions,
          hideArcAtComplete:true,
          maxChargeFlash:true,
          completePulseColor:gaugeStyle.overflowColor||entity.color
        });
      }
      return true;
    }
    return false;
  }
});