

const ProgressStateService=Object.freeze({
  KIND:'progress-state',
  updateIdleRepair(entity,now=performance.now()){
      const combatIdleProgressRepair=
        entity.character?.combatIdleProgressRepair||null;

      if(
        combatIdleProgressRepair&&
        EntitySimulationAuthorityService.isLocal(entity)
      ){
        const durabilityStateKey=
          String(combatIdleProgressRepair.stateKey||'');
        const progressStateKey=
          String(
            combatIdleProgressRepair.progressStateKey||
            `${durabilityStateKey}:repair-progress`
          );
        const delay=Math.max(
          0,
          Number(combatIdleProgressRepair.delay)||0
        );
        const hitCountRepair=combatIdleProgressRepair.repairMode==='hit-count';
        const duration=Math.max(
          1,
          Number(hitCountRepair
            ?combatIdleProgressRepair.requiredHits
            :combatIdleProgressRepair.duration)||(hitCountRepair?1:3000)
        );
        const durability=
          durabilityStateKey
            ?ProgressStateService.state(
              entity,
              durabilityStateKey
            )
            :null;

        if(durability){
          const repairProgress=
            ProgressStateService.ensure(
              entity,
              {
                stateKey:progressStateKey,
                initial:0,
                max:duration
              }
            );
          const durabilityValue=Math.max(0,Number(durability.value)||0);
          const full=
            durabilityValue>=
            Math.max(1,Number(durability.max)||1)-.0001;
          const depleted=durabilityValue<=.0001;
          const onlyWhenDepleted=
            combatIdleProgressRepair.onlyWhenDepleted===true;
          const intactRegenPerSecond=Math.max(
            0,
            Number(combatIdleProgressRepair.intactRegenPerSecond)||0
          );

          if(!(entity._combatIdleRepairTickAt instanceof Map)){
            entity._combatIdleRepairTickAt=new Map();
          }
          const lastRepairTickAt=Math.max(
            0,
            Number(
              entity._combatIdleRepairTickAt.get(progressStateKey)
            )||now
          );
          entity._combatIdleRepairTickAt.set(
            progressStateKey,
            now
          );

          if(full||(onlyWhenDepleted&&!depleted)){
            if((Number(repairProgress?.value)||0)>0){
              ProgressStateService.apply(
                entity,
                {
                  stateKey:progressStateKey,
                  max:duration,
                  operation:'set',
                  value:0
                }
              );
            }

            // 고갈되지 않은 자원은 전투 여부와 관계없이
            // 초당 지정량만큼 내구도를 자연 회복한다. 파괴 상태(0)는
            // 지정된 시간 또는 적중 누적 정책으로만 복구한다.
            if(
              !full&&
              !depleted&&
              intactRegenPerSecond>0
            ){
              const elapsedMs=Math.max(0,now-lastRepairTickAt);
              const regenAmount=
                intactRegenPerSecond*elapsedMs/1000;
              if(regenAmount>0){
                ProgressStateService.apply(
                  entity,
                  {
                    stateKey:durabilityStateKey,
                    max:durability.max,
                    operation:'add',
                    amount:regenAmount
                  }
                );
              }
            }
          }else{
            const lastRepairInterruptAt=Math.max(
              0,
              Number(entity.lastAbilityActionTime)||0,
              Number(entity.lastAttackTime)||0,
              Number(entity.lastDamageTime)||0
            );
            const idleFor=Math.max(
              0,
              now-lastRepairInterruptAt
            );

            if(hitCountRepair||idleFor>=delay){
              const currentProgress=Math.max(
                0,
                Math.min(
                  duration,
                  Number(repairProgress?.value)||0
                )
              );
              const nextProgress=Math.min(
                duration,
                currentProgress+(hitCountRepair?0:Math.max(0,now-lastRepairTickAt))
              );

              if(Math.abs(currentProgress-nextProgress)>.5){
                ProgressStateService.apply(
                  entity,
                  {
                    stateKey:progressStateKey,
                    max:duration,
                    operation:'set',
                    value:nextProgress
                  }
                );
              }

              if(nextProgress>=duration-(hitCountRepair?0:.5)){
                const durabilityBeforeRepair=Math.max(
                  0,
                  Number(
                    ProgressStateService.state(
                      entity,
                      durabilityStateKey
                    )?.value
                  )||0
                );
                ProgressStateService.apply(
                  entity,
                  {
                    stateKey:durabilityStateKey,
                    max:durability.max,
                    operation:'set-max'
                  }
                );

                const repairedEffect=combatIdleProgressRepair.repairedEffect||null;
                if(
                  repairedEffect&&
                  durabilityBeforeRepair<=.0001
                ){
                  const repairRadius=Math.max(
                    Math.max(0,Number(repairedEffect.minRadius)||0),
                    (Number(entity.radius)||20)*
                    Math.max(0,Number(repairedEffect.radiusMultiplier)||0)
                  );
                  const repairFx=EffectSpawnService.spawn({
                    ...repairedEffect,
                    type:String(repairedEffect.type||'areaCircle'),
                    x:Number(entity.x)||0,
                    y:Number(entity.y)||0,
                    r:repairRadius,
                    range:repairRadius,
                    color:repairedEffect.color||entity.character?.color||entity.color||'#9fcf55',
                    start:now,
                    dur:Math.max(1,Number(repairedEffect.duration)||360),
                    sourceEntityId:entity.id
                  },{source:entity});
                  if(repairFx){
                    OnlinePresentationSyncService?.send(
                      'effect-spawn',
                      entity,
                      {effect:EffectSpawnService.presentationSnapshot(repairFx,now)}
                    );
                  }
                }

                ProgressStateService.apply(
                  entity,
                  {
                    stateKey:progressStateKey,
                    max:duration,
                    operation:'set',
                    value:0
                  }
                );
              }
            }
          }
        }
      }

  },
  state(entity,stateKey){
    const value=entity?.actionState?.get(String(stateKey||''))||null;
    return value?.kind===this.KIND?value:null;
  },

  blocksStaminaRegen(entity){
    if(!entity?.actionState)return false;
    for(const value of entity.actionState.values()){
      if(
        value?.kind===this.KIND&&
        value.blocksStaminaRegen===true
      )return true;
    }
    return false;
  },
  maximum(entity,module,state=null){
    const maxHealthRatio=
      Number(module?.maxHealthRatio);
    const maxStaminaRatio=
      Number(module?.maxStaminaRatio);
    const dynamicMax=
      Number.isFinite(maxHealthRatio)
        ?Math.max(
          1,
          Math.max(1,Number(entity?.maxHealth)||1)*
          Math.max(0,maxHealthRatio)
        )
        :Number.isFinite(maxStaminaRatio)
          ?Math.max(
            1,
            Math.max(1,Number(entity?.maxStamina)||1)*
            Math.max(0,maxStaminaRatio)
          )
          :null;

    return Math.max(
      1,
      Number(
        dynamicMax??
        module?.max??
        state?.max??
        1
      )||1
    );
  },
  ensure(entity,module){
    if(!entity?.actionState)return null;
    const stateKey=String(module?.stateKey||'');
    if(!stateKey)return null;
    let state=this.state(entity,stateKey);
    const max=this.maximum(
      entity,
      module,
      state
    );
    if(!state){
      state={kind:this.KIND,stateKey,value:Math.max(0,Math.min(max,Number(module?.initial)||0)),max,presentation:module?.presentation||null,decay:module?.decay||null,onEmpty:module?.onEmpty||null,thresholdModifiers:Array.isArray(module?.thresholdModifiers)?module.thresholdModifiers:null,blocksStaminaRegen:module?.blocksStaminaRegen===true,lastActivityAt:performance.now(),nextDecayStepAt:0};
      entity.actionState.set(stateKey,state);
    }else{
      state.max=max;
      if(module?.presentation)state.presentation=module.presentation;
      if(module?.decay)state.decay=module.decay;
      if(module?.onEmpty)state.onEmpty=module.onEmpty;
      if(module?.blocksStaminaRegen!==undefined)state.blocksStaminaRegen=module.blocksStaminaRegen===true;
      if(Array.isArray(module?.thresholdModifiers))state.thresholdModifiers=module.thresholdModifiers;
    }
    return state;
  },
  syncThresholdModifiers(entity,state){
    if(!entity||!state)return false;
    const modules=Array.isArray(state.thresholdModifiers)
      ?state.thresholdModifiers
      :EMPTY_RUNTIME_ITEMS;
    let changed=false;
    for(let index=0;index<modules.length;index++){
      const module=modules[index];
      const stat=String(module?.stat||'');
      if(!COMBAT_BUFF_DEFS[stat])continue;
      const threshold=Number(module?.threshold)||0;
      const value=Number(state.value)||0;
      const active=module?.strict===true?value>threshold:value>=threshold;
      const sourceId=String(module?.sourceId||`progress:${state.stateKey}:${index}:${stat}`);
      if(active){
        const modifierValue=Number(module?.value)||0;
        let existing=null;
        for(const item of BuffService.live(entity,stat)){
          if(item.sourceId!==sourceId)continue;
          existing=item;
          break;
        }
        if(!existing||Math.abs((Number(existing.value)||0)-modifierValue)>1e-9||existing.end!==Infinity){
          BuffService.set(entity,stat,modifierValue,sourceId,Infinity,{tags:TagService.effectTags({type:'modifier.constant',value:modifierValue})});
          changed=true;
        }
      }else if(BuffService.remove(entity,stat,sourceId)){
        changed=true;
      }
    }
    return changed;
  },
  apply(entity,module){
    if(!entity||!module)return false;
    const operation=String(module.operation||'add');
    if(operation==='reset'){
      const current=this.state(entity,module.stateKey);
      if(current){
        current.value=0;
        this.syncThresholdModifiers(entity,current);
      }
      entity.actionState?.delete(String(module.stateKey||''));
      return true;
    }
    const state=this.ensure(entity,module);
    if(!state)return false;
    const now=performance.now();
    // Stacking counters grow a finite capacity; snapshots remain JSON-safe.
    if(module.growMax===true&&operation==='add'){
      state.max=Math.max(state.max,state.value+Math.max(0,Number(module.amount)||0));
    }
    if(operation==='set-max'){
      state.value=state.max;
    }else if(operation==='set'){
      state.value=Math.max(0,Math.min(state.max,Number(module.value)||0));
    }else if(operation==='subtract'){
      state.value=Math.max(
        0,
        Math.min(
          state.max,
          state.value-
          Math.max(0,Number(module.amount)||0)
        )
      );
    }else{
      state.value=Math.max(0,Math.min(state.max,state.value+(Number(module.amount)||1)));
    }
    state.lastActivityAt=now;
    const stepInterval=Math.max(0,Number(state.decay?.stepInterval)||0);
    if(stepInterval>0){
      state.nextDecayStepAt=(Number(state.value)||0)>0?now+stepInterval:0;
    }
    this.syncThresholdModifiers(entity,state);
    return true;
  },
  serialize(entity){
    const result=[];
    if(!entity?.actionState)return result;
    for(const state of entity.actionState.values()){
      if(state?.kind!==this.KIND)continue;
      const stateKey=String(state.stateKey||'');
      if(!stateKey)continue;
      const now=performance.now();
      result.push({
        stateKey,
        value:Math.max(0,Number(state.value)||0),
        max:Math.max(1,Number(state.max)||1),
        presentation:
          state.presentation&&typeof state.presentation==='object'
            ?EffectSpawnService.definitionSnapshot(state.presentation)
            :null,
        blocksStaminaRegen:state.blocksStaminaRegen===true,
        nextDecayRemainingMs:
          Number(state.nextDecayStepAt)>0
            ?Math.max(0,Number(state.nextDecayStepAt)-now)
            :0
      });
    }
    return result;
  },
  applyRemote(entity,snapshots){
    if(!entity?.actionState||!Array.isArray(snapshots))return false;
    const incoming=new Set();
    for(const snapshot of snapshots){
      const stateKey=String(snapshot?.stateKey||'');
      if(!stateKey)continue;
      incoming.add(stateKey);
      const max=Math.max(1,Number(snapshot?.max)||1);
      const value=Math.max(0,Math.min(max,Number(snapshot?.value)||0));
      const current=this.state(entity,stateKey);
      const now=performance.now();
      const nextDecayRemainingMs=Math.max(0,Number(snapshot?.nextDecayRemainingMs)||0);
      const presentation=
        snapshot?.presentation&&typeof snapshot.presentation==='object'
          ?EffectSpawnService.definitionSnapshot(snapshot.presentation)
          :null;
      if(current){
        current.max=max;
        current.value=value;
        current.blocksStaminaRegen=snapshot?.blocksStaminaRegen===true;
        if(presentation)current.presentation=presentation;
        current.nextDecayStepAt=nextDecayRemainingMs>0?now+nextDecayRemainingMs:0;
        continue;
      }
      entity.actionState.set(stateKey,{
        kind:this.KIND,
        stateKey,
        value,
        max,
        presentation,
        decay:null,
        onEmpty:null,
        blocksStaminaRegen:snapshot?.blocksStaminaRegen===true,
        lastActivityAt:now,
        nextDecayStepAt:nextDecayRemainingMs>0?now+nextDecayRemainingMs:0
      });
    }
    for(const [stateKey,state] of entity.actionState){
      if(state?.kind===this.KIND&&!incoming.has(String(stateKey))){
        entity.actionState.delete(stateKey);
      }
    }
    return true;
  },

  update(entity,now=performance.now(),dt=0){
    if(!entity?.actionState)return false;
    let changed=false;
    for(const state of entity.actionState.values()){
      if(state?.kind!==this.KIND||!state.decay||(Number(state.value)||0)<=0)continue;

      const stepInterval=Math.max(0,Number(state.decay.stepInterval)||0);
      if(stepInterval>0){
        const pauseFieldStateKey=String(state.decay.pauseFieldStateKey||'');
        const paused=
          pauseFieldStateKey&&
          typeof InstalledAreaFieldService!=='undefined'&&
          InstalledAreaFieldService.containsTarget(
            entity,
            pauseFieldStateKey,
            entity,
            now
          );

        if(paused){
          if(Number(state.nextDecayStepAt)>0){
            state.nextDecayStepAt+=Math.max(0,Number(dt)||0);
          }
          this.syncThresholdModifiers(entity,state);
          continue;
        }

        if(!(Number(state.nextDecayStepAt)>0)){
          state.nextDecayStepAt=now+stepInterval;
        }

        const stepAmount=Math.max(0.000001,Number(state.decay.stepAmount)||1);
        let guard=0;
        while(
          now>=Number(state.nextDecayStepAt)&&
          (Number(state.value)||0)>0&&
          guard<8
        ){
          state.value=Math.max(0,(Number(state.value)||0)-stepAmount);
          state.nextDecayStepAt+=stepInterval;
          changed=true;
          guard++;
        }

        if((Number(state.value)||0)<=0){
          state.value=0;
          state.nextDecayStepAt=0;
          if(state.onEmpty&&typeof state.onEmpty==='object'){
            for(const resetStateKey of state.onEmpty.resetStateKeys||[]){
              entity.actionState.delete(String(resetStateKey||''));
            }
          }
        }
        this.syncThresholdModifiers(entity,state);
        continue;
      }

      const pauseFieldStateKey=String(state.decay.pauseFieldStateKey||'');
      const paused=
        pauseFieldStateKey&&
        typeof InstalledAreaFieldService!=='undefined'&&
        InstalledAreaFieldService.containsTarget(
          entity,
          pauseFieldStateKey,
          entity,
          now
        );
      if(paused){
        this.syncThresholdModifiers(entity,state);
        continue;
      }

      const delay=Math.max(0,Number(state.decay.delay)||0);
      const activityAt=state.decay.activity==='combat'
        ?Math.max(
          Number(state.lastActivityAt)||0,
          Number(entity.lastAttackTime)||0,
          Number(entity.lastHitTime)||0
        )
        :(Number(state.lastActivityAt)||0);
      if(now-activityAt<=delay){
        this.syncThresholdModifiers(entity,state);
        continue;
      }
      const rate=Math.max(0,Number(state.decay.rate)||0);
      if(rate<=0){
        this.syncThresholdModifiers(entity,state);
        continue;
      }
      const current=Math.max(0,Number(state.value)||0);
      const floorStepSize=Math.max(0,Number(state.decay.floorStepSize)||0);
      const completedStepFloor=floorStepSize>0
        ?Math.floor((current+1e-9)/floorStepSize)*floorStepSize
        :0;
      const next=Math.max(
        completedStepFloor,
        current-rate*Math.max(0,Number(dt)||0)/1000
      );
      if(Math.abs(next-state.value)>1e-9){
        state.value=next;
        changed=true;
      }

      if(
        current>0&&
        state.value<=0&&
        state.onEmpty&&
        typeof state.onEmpty==='object'
      ){
        for(const resetStateKey of state.onEmpty.resetStateKeys||[]){
          entity.actionState.delete(String(resetStateKey||''));
        }
      }
      if(this.syncThresholdModifiers(entity,state))changed=true;
    }
    return changed;
  },
  clearAll(entity){
    if(!entity?.actionState)return false;
    let changed=false;

    for(const [key,state] of [...entity.actionState]){
      if(state?.kind!==this.KIND)continue;

      state.value=0;
      this.syncThresholdModifiers(
        entity,
        state
      );

      entity.actionState.delete(key);
      changed=true;
    }

    return changed;
  },
  consume(entity,stateKey,amount){
    const state=this.state(entity,stateKey);
    if(!state)return 0;
    const before=Math.max(0,Number(state.value)||0);
    state.value=Math.max(
      0,
      before-
      Math.max(0,Number(amount)||0)
    );
    this.syncThresholdModifiers(entity,state);
    return before-state.value;
  },
  hasGauge(entity){
    if(!entity?.actionState)return false;
    if(!duels3CanViewTeamGauge(entity))return false;
    for(const state of entity.actionState.values()){
      if(state?.kind===this.KIND&&state.presentation?.type==='arc-gauge'&&(Number(state.value)||0)>0)return true;
    }
    return false;
  },
  draw(ctx,entity,now=performance.now()){
    if(!ctx||!entity?.actionState||!duels3CanViewTeamGauge(entity))return false;
    for(const state of entity.actionState.values()){
      if(state?.kind!==this.KIND||state.presentation?.type!=='arc-gauge')continue;
      const cycleSize=Math.max(0,Number(state.presentation?.cycleSize)||0);
      const rawValue=Math.max(0,Number(state.value)||0);
      const ratio=cycleSize>0
        ?Math.max(0,Math.min(1,(rawValue%cycleSize)/cycleSize))
        :Math.max(
          0,
          Math.min(
            1,
            rawValue/
            Math.max(1,Number(state.max)||1)
          )
        );
      if(ratio<=0)continue;

      const style=state.presentation||{};
      const layers=Math.max(
        1,
        Math.floor(Number(style.layers)||1)
      );
      const lineWidth=
        Number(style.lineWidth)||
        EntityRingLayoutService.WIDTHS.gauge;
      const radius=
        EntityRingLayoutService.chargeRadius(
          entity
        );

      if(layers<=1){
        ArcGaugePresentationService.render(
          ctx,
          entity,
          ratio,
          {
            color:
              ratio>=1
                ?(
                  style.readyColor||
                  style.color||
                  entity.color
                )
                :(
                  style.color||
                  entity.color
                ),
            lineWidth,
            lineCap:String(style.lineCap||'butt'),
            radius,
            completeAccent:ratio>=1,
            maxChargeFlash:
              ratio>=1&&
              style.maxChargeFlash===true,
            completePulseColor:
              style.readyColor||
              style.color||
              entity.color,
            completePulseRadius:
              EntityRingLayoutService
                .maxChargeFlashRadius(
                  entity,
                  now
                )
          }
        );
        return true;
      }

      const scaled=
        ratio*layers;
      const baseRatio=
        Math.max(
          0,
          Math.min(1,scaled)
        );
      const overflowRatio=
        Math.max(
          0,
          Math.min(
            1,
            scaled-1
          )
        );
      const readyAtRatio=
        Number.isFinite(
          Number(style.readyAtRatio)
        )
          ?Math.max(
            0,
            Math.min(
              1,
              Number(style.readyAtRatio)
            )
          )
          :1/layers;

      ArcGaugePresentationService.render(
        ctx,
        entity,
        baseRatio,
        {
          color:
            style.color||
            entity.color,
          lineWidth,
          lineCap:String(style.lineCap||'butt'),
          radius,
          completeAccent:false,
          maxChargeFlash:false,
          completePulseColor:
            style.color||
            entity.color,
          completePulseRadius:
            EntityRingLayoutService
              .maxChargeFlashRadius(
                entity,
                now
              )
        }
      );

      if(overflowRatio>0){
        ArcGaugePresentationService.render(
          ctx,
          entity,
          overflowRatio,
          {
            color:
              style.overflowColor||
              style.readyColor||
              style.color||
              entity.color,
            lineWidth,
            lineCap:String(style.lineCap||'butt'),
            radius,
            completeAccent:false,
            maxChargeFlash:false,
            completePulseColor:
              style.overflowColor||
              style.readyColor||
              style.color||
              entity.color,
            completePulseRadius:
              EntityRingLayoutService
                .maxChargeFlashRadius(
                  entity,
                  now
                )
          }
        );
      }

      const firstLayerComplete=
        scaled>=1;
      const allLayersComplete=
        scaled>=layers;

      if(
        firstLayerComplete&&
        style.maxChargeFlash===true&&
        style.flashAfterFirstLayer===true
      ){
        ArcGaugePresentationService.render(
          ctx,
          entity,
          1,
          {
            color:
              style.color||
              entity.color,
            lineWidth,
            lineCap:String(style.lineCap||'butt'),
            radius,
            completeAccent:false,
            hideArcAtComplete:true,
            maxChargeFlash:true,
            completePulseColor:
              allLayersComplete
                ?(
                  style.overflowColor||
                  style.readyColor||
                  style.color||
                  entity.color
                )
                :(
                  style.color||
                  entity.color
                ),
            completePulseRadius:
              EntityRingLayoutService
                .maxChargeFlashRadius(
                  entity,
                  now
                )
          }
        );
      }

      return true;
    }
    return false;
  }
});