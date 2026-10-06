


const PointerHoldInputService=Object.freeze({
  state:{
    lmb:{
      held:false,
      blockedUntilRelease:false,
      pressedAt:0,
      holdConsumed:false,
      holdRepeatTimer:null,
      holdRepeatTicks:0,
      holdRepeatLastStepAt:0
    },
    rmb:{
      held:false,
      blockedUntilRelease:false,
      pressedAt:0,
      holdConsumed:false,
      holdRepeatTimer:null,
      holdRepeatTicks:0,
      holdRepeatLastStepAt:0
    }
  },
  slot(button){
    return button===0?'lmb':button===2?'rmb':null;
  },
  wheel(deltaY,now=performance.now()){
    const source=Training.player;
    const config=source?.character?.wheelInput;
    if(!config||!source?.alive||!Number.isFinite(Number(deltaY))||Number(deltaY)===0)return false;
    const modifier=this.state[String(config.modifierSlot||'rmb')];
    let slot=String(config.slot||'');
    if(modifier?.held){
      slot=now-modifier.pressedAt>=Math.max(1,Number(config.holdThresholdMs)||250)
        ?String(config.heldSlot||''):String(config.modifiedSlot||'');
    }
    if(!slot||!Training.use(slot,null,{modeStep:Number(deltaY)<0?-1:1}))return false;
    if(modifier?.held){modifier.wheelConsumed=true;modifier.holdConsumed=true;}
    return true;
  },
  isRepeatablePrimary(source,ability){
    if(
      !source||
      !ability||
      ability.input!=='lmb'
    )return false;

    const attack=AbilityService.attackById(
      source.character,
      ability.attackId
    );
    if(
      !attack||
      !TagService.hasAttack(
        attack,
        '평타'
      )
    )return false;

    return (
      ability.inputPolicy
        ?.repeatWhileHeld!==false
    );
  },
  matchesStateRule(source,rule){
    if(!source||!rule?.stateKey)return false;

    const condition=rule.phase
      ?{
        type:'state.phase',
        stateKey:rule.stateKey,
        phase:rule.phase
      }
      :{
        type:'state.exists',
        stateKey:rule.stateKey
      };

    return TriggerModuleService.matches(
      {
        type:'trigger',
        event:'input.hold-repeat',
        conditions:[condition]
      },
      'input.hold-repeat',
      {source}
    )===true;
  },
  matchesBlockCondition(source,ability){
    return this.matchesStateRule(
      source,
      ability?.inputPolicy?.blockRepeatWhen
    );
  },
  matchesDynamicBlockCondition(source,ability){
    return this.matchesStateRule(
      source,
      ability?.inputPolicy?.blockRepeatWhile
    );
  },
  holdGaugeStateKey(ability){
    return String(
      ability?.inputPolicy?.holdGaugeStateKey||
      `input-hold:${String(ability?.id||ability?.input||'ability')}`
    );
  },
  holdAvailable(source,ability){
    if(!source||!ability?.holdTrigger)return false;
    return AbilityService.canActivate(
      source,
      ability,
      {
        event:'input.hold',
        inputSlot:ability.input,
        angle:Training.aimAngle(),
        targetPoint:Training.mouseWorld()
      }
    )===true;
  },
  startHoldGauge(source,ability){
    if(
      !source||
      !ability||
      ability.inputPolicy?.holdGauge!==true
    )return false;

    const attack=AbilityService.eventAttack(
      source,
      ability,
      'input.hold',
      performance.now()
    );
    if(!attack?.charge){
      return ability.inputPolicy?.holdGaugeTimerOnly===true;
    }

    return ChargedAttackService.start(
      {
        source,
        attack,
        angle:Training.aimAngle(),
        now:performance.now(),
        network:false,
        handled:false
      },
      {
        stateKey:this.holdGaugeStateKey(ability)
      }
    );
  },
  clearHoldGauge(source,ability){
    if(!source||!ability)return false;
    const key=this.holdGaugeStateKey(ability);
    const state=ChargedAttackService.state(
      source,
      key
    );
    if(!state)return false;
    source.actionState.delete(key);
    if(source.attackPreview)source.attackPreview=null;
    return true;
  },
  startHoldRepeatProgress(source,ability,current){
    const config=ability?.inputPolicy?.holdRepeatProgress;
    if(!source||!ability||!current||!config?.stateKey)return false;
    const interval=Math.max(1,Number(config.interval)||200);
    current.holdRepeatTicks=0;
    current.holdRepeatLastStepAt=performance.now();
    if(current.holdRepeatTimer)clearInterval(current.holdRepeatTimer);
    current.holdRepeatTimer=setInterval(()=>{
      if(!current.held){
        clearInterval(current.holdRepeatTimer);
        current.holdRepeatTimer=null;
        return;
      }
      const state=ProgressStateService.state(
        source,
        String(config.stateKey)
      );
      const initial=Number.isFinite(Number(config.initial))
        ?Number(config.initial)
        :1;
      const currentValue=Number(state?.value);
      const value=Number.isFinite(currentValue)?currentValue:initial;
      const min=Number.isFinite(Number(config.min))?Number(config.min):0;
      if(value<=min)return;
      ProgressStateService.apply(source,{
        type:'state.progress',
        stateKey:String(config.stateKey),
        operation:'subtract',
        amount:Math.max(0,Number(config.amount)||1),
        initial,
        max:Math.max(initial,Number(config.max)||initial),
        min,
        blocksStaminaRegen:config.blocksStaminaRegen===true,
        presentation:config.presentation||null
      });
      current.holdRepeatTicks+=1;
      current.holdConsumed=true;
      current.holdRepeatLastStepAt=performance.now();
      if(config.applyCooldownEachStep===true){
        const attack=AbilityService.attackById(
          source.character,
          ability.attackId
        );
        if(attack){
          source.cooldowns.set(
            attack.id,
            current.holdRepeatLastStepAt+
            Math.max(0,Number(attack.cd)||0)
          );
        }
      }
    },interval);
    return true;
  },
  clearHoldRepeatProgress(current){
    if(!current)return;
    if(current.holdRepeatTimer){
      clearInterval(current.holdRepeatTimer);
      current.holdRepeatTimer=null;
    }
  },
  press(slot){
    const current=this.state[slot];
    const source=Training.player;
    const ability=source?.character?.abilities?.[slot];
    if(!current||!ability)return false;

    if(current.held)return true;

    if(
      CircleFormationService.handlesInput(
        source,
        slot
      )
    ){
      current.held=true;
      current.pressedAt=performance.now();
      current.holdConsumed=false;
      current.holdRepeatTicks=0;
      current.holdRepeatLastStepAt=
        current.pressedAt;
      current.blockedUntilRelease=false;

      const handled=
        CircleFormationService.press(
          source,
          slot,
          current.pressedAt
        );

      if(!handled){
        current.held=false;
        current.pressedAt=0;
        current.holdRepeatLastStepAt=0;
      }
      return handled;
    }

    current.held=true;
    current.gaugeRetainUntil=0;
    current.pressedAt=performance.now();
    current.holdConsumed=false;
    current.wheelConsumed=false;
    current.holdRepeatTicks=0;
    current.holdRepeatLastStepAt=current.pressedAt;
    current.blockedUntilRelease=this.matchesBlockCondition(
      source,
      ability
    );

    if(ability.inputPolicy?.deferTapUntilRelease===true){
      this.startHoldRepeatProgress(source,ability,current);
      if(
        ability.inputPolicy?.tapHoldSplit===true&&
        ability.holdTrigger
      ){
        if(this.holdAvailable(source,ability)){
          this.startHoldGauge(source,ability);
        }
        return true;
      }
      return true;
    }

    if(
      ability.inputPolicy?.tapHoldSplit===true&&
      ability.holdTrigger
    ){
      if(!this.holdAvailable(source,ability)){
        current.held=false;
        current.blockedUntilRelease=false;
        current.pressedAt=0;
        current.holdConsumed=false;
        return Training.use(slot);
      }

      if(
        !this.startHoldGauge(
          source,
          ability
        )
      ){
        // 홀드 준비 실패는 탭 입력까지 소비하면 안 된다.
        // 예: 탭 비용은 충분하지만 홀드 비용만 부족한 경우.
        this.clearHoldGauge(
          source,
          ability
        );
        current.held=false;
        current.blockedUntilRelease=false;
        current.pressedAt=0;
        current.holdConsumed=false;
        current.holdRepeatTicks=0;
        current.holdRepeatLastStepAt=0;
        return Training.use(slot)===true;
      }
      return true;
    }

    return Training.use(slot);
  },
  release(slot,triggerRelease=true){
    const current=this.state[slot];
    if(!current)return false;

    const wasHeld=current.held;
    const source=Training.player;
    const ability=source?.character?.abilities?.[slot];

    if(
      source&&
      CircleFormationService.handlesInput(
        source,
        slot
      )
    ){
      this.clearHoldRepeatProgress(current);
      current.held=false;
      current.blockedUntilRelease=false;
      current.pressedAt=0;
      current.holdConsumed=false;
      current.holdRepeatTicks=0;
      current.holdRepeatLastStepAt=0;

      if(!wasHeld)return true;

      return CircleFormationService.release(
        source,
        slot,
        triggerRelease,
        performance.now()
      );
    }

    const tapHoldSplit=
      ability?.inputPolicy?.tapHoldSplit===true&&
      !!ability?.holdTrigger;
    const deferredTap=ability?.inputPolicy?.deferTapUntilRelease===true;
    const elapsed=performance.now()-Number(current.pressedAt);
    const holdConsumed=current.holdConsumed===true||(
      wasHeld&&tapHoldSplit&&
      ability?.inputPolicy?.holdTriggerWhilePressed!==true&&
      performance.now()-Number(current.pressedAt)>=Math.max(1,Number(ability.inputPolicy.holdThresholdMs)||300)&&
      this.holdAvailable(source,ability)
    );
    const wheelConsumed=current.wheelConsumed===true;
    const holdRepeatTicks=Number(current.holdRepeatTicks)||0;
    this.clearHoldRepeatProgress(current);

    current.held=false;
    current.blockedUntilRelease=false;
    current.pressedAt=0;
    current.holdConsumed=false;
    current.wheelConsumed=false;
    current.holdRepeatTicks=0;
    current.holdRepeatLastStepAt=0;

    if(wasHeld&&wheelConsumed){
      this.clearHoldGauge(source,ability);
      return true;
    }

    if(wasHeld&&deferredTap&&!tapHoldSplit){
      if(
        triggerRelease&&
        holdRepeatTicks===0&&
        holdConsumed!==true
      ){
        return Training.use(slot)===true;
      }
      return true;
    }

    if(
      wasHeld&&
      tapHoldSplit&&
      triggerRelease
    ){
      let result=false;
      if(ability.inputPolicy?.cancelUnavailableHold===true&&elapsed>=Number(ability.inputPolicy.holdThresholdMs)&&!holdConsumed){this.clearHoldGauge(source,ability);return false;}

      if(holdConsumed){
        result=
          ability?.inputPolicy?.holdTriggerWhilePressed===true
            ?true
            :Training.holdInput(slot)===true;
      }else{
        result=
          Training.use(slot)===true;
      }

      if(result&&holdConsumed)current.gaugeRetainUntil=performance.now()+Math.max(0,Number(ability.inputPolicy.holdGaugeRetainMs)||0);
      this.clearHoldGauge(
        source,
        ability
      );
      return result;
    }

    if(tapHoldSplit){
      this.clearHoldGauge(
        source,
        ability
      );
    }

    if(wasHeld&&ability?.releaseTrigger){
      if(triggerRelease){
        return Training.releaseInput(slot);
      }
      ChargedAttackService.cancel(source,ability);
    }
    return true;
  },
  releaseAll(triggerRelease=false){
    this.release('lmb',triggerRelease);
    this.release('rmb',triggerRelease);
  },
  nextReadyAt(source,ability){
    if(!source||!ability)return Infinity;

    const attack=AbilityService.resolvedInputAttack(
      source,
      ability,
      performance.now()
    );
    if(!attack)return Infinity;

    return Math.max(
      Number(source.cooldowns.get(attack.id))||0,
      Number(source.abilityPending.get(ability.id))||0
    );
  },
  holdGaugePresentationState(source,now=performance.now()){
    if(!source)return {visible:false,ratio:0,full:false};
    const current=this.state.rmb;
    const ability=
      source.character?.abilities?.rmb;

    const retained=now<Number(current?.gaugeRetainUntil||0);
    if(
      (!current?.held&&!retained)||
      current.blockedUntilRelease||
      ability?.inputPolicy?.tapHoldSplit!==true||
      ability.inputPolicy?.holdGauge!==true
    )return {visible:false,ratio:0,full:false};
    if(
      !retained&&ability.inputPolicy?.holdGaugeRequireAvailable===true&&
      !this.holdAvailable(source,ability)
    )return {visible:false,ratio:0,full:false};

    const duration=Math.max(
      1,
      Number(
        ability.inputPolicy.holdThresholdMs
      )||1
    );
    const progress=retained?1:Math.max(
      0,
      Math.min(
        1,
        (
          now-
          Math.max(
            0,
            Number(current.pressedAt)||now
          )
        )/duration
      )
    );


    return {visible:progress>0,ratio:progress,full:progress>=1};
  },
  drawHoldGauge(ctx,source,now=performance.now()){
    if(!ctx||!source)return false;
    const state=this.holdGaugePresentationState(source,now);
    if(!state.visible)return false;
    const progress=state.ratio;

    return ArcGaugePresentationService.render(
      ctx,
      source,
      progress,
      {
        color:source.color,
        completeColor:source.color,
        lineWidth:
          EntityRingLayoutService.WIDTHS.gauge,
        lineCap:'butt',
        radius:
          EntityRingLayoutService.chargeRadius(source),
        showEmpty:false,
        completeAccent:false,
        maxChargeFlash:progress>=1,
        completePulseColor:source.color,
        completePulseRadius:
          EntityRingLayoutService.maxChargeFlashRadius(
            source,
            now
          )
      }
    );
  },
  update(now=performance.now()){
    const source=Training.player;
    if(!source?.alive)return;

    CircleFormationService.update(
      source,
      now
    );

    for(const slot of ['lmb','rmb']){
      if(
        CircleFormationService.handlesInput(
          source,
          slot
        )
      )continue;

      const current=this.state[slot];
      if(
        !current.held||
        current.blockedUntilRelease||
        current.wheelConsumed===true
      )continue;

      const ability=
        source.character
          ?.abilities?.[slot];

      if(
        ability?.inputPolicy?.holdTriggerWhilePressed===true&&
        ability.holdTrigger&&
        current.holdConsumed!==true
      ){
        const holdMs=Math.max(
          1,
          Number(
            ability.inputPolicy.holdThresholdMs
          )||300
        );

        if(
          now-
          Math.max(
            0,
            Number(current.pressedAt)||now
          )>=holdMs
        ){
          const runtime={
            source,
            ability,
            inputSlot:slot,
            event:'input.hold',
            now,
            angle:Training.aimAngle(),
            targetPoint:Training.mouseWorld(),
            network:false,
            handled:false,
            executed:false,
            usageTags:new Set()
          };

          if(
            TriggerModuleService.matches(
              ability.holdTrigger,
              'input.hold',
              runtime
            )
          ){
            runtime.trigger=ability.holdTrigger;
            runtime.attack=
              AbilityService.eventAttack(
                source,
                ability,
                'input.hold',
                now
              );
            if(runtime.attack){
              AbilityModuleService.run(runtime);
              if(runtime.executed===true||runtime.handled===true){
                current.holdConsumed=true;
              }
            }
          }
          continue;
        }
      }

      if(
        ability?.inputPolicy?.holdTriggerWhilePressed===true&&
        ability.holdTrigger&&
        current.holdConsumed!==true
      ){
        const holdMs=Math.max(
          1,
          Number(ability.inputPolicy.holdThresholdMs)||300
        );

        if(
          now-
          Math.max(0,Number(current.pressedAt)||now)>=holdMs
        ){
          const runtime={
            source,
            ability,
            inputSlot:slot,
            event:'input.hold',
            now,
            angle:Training.aimAngle(),
            targetPoint:Training.mouseWorld(),
            network:false,
            handled:false,
            executed:false,
            usageTags:new Set()
          };

          if(
            TriggerModuleService.matches(
              ability.holdTrigger,
              'input.hold',
              runtime
            )
          ){
            runtime.trigger=ability.holdTrigger;
            runtime.attack=
              AbilityService.eventAttack(
                source,
                ability,
                'input.hold',
                now
              );
            if(runtime.attack){
              AbilityModuleService.run(runtime);
              if(runtime.executed===true||runtime.handled===true){
                current.holdConsumed=true;
              }
            }
          }
          continue;
        }
      }

      if(
        ability?.inputPolicy?.tapHoldSplit===true&&
        ability.holdTrigger&&
        current.holdConsumed!==true
      ){
        const holdMs=Math.max(
          1,
          Number(
            ability.inputPolicy.holdThresholdMs
          )||300
        );

        if(
          now-
          Math.max(
            0,
            Number(current.pressedAt)||now
          )>=holdMs&&
          this.holdAvailable(source,ability)
        ){
          // 홀드 판정만 확정한다. 실제 능력은 버튼을 놓는 순간 한 번 실행한다.
          current.holdConsumed=true;
        }
      }

      if(
        ability?.inputPolicy?.tapHoldSplit===true&&
        ability?.inputPolicy?.holdPreviewOnComplete===true&&
        ability.holdTrigger&&
        current.holdConsumed===true
      ){
        const previewAttack=AbilityService.eventAttack(
          source,
          ability,
          'input.hold',
          now
        );
        if(previewAttack){
          source.attackPreview=AttackPreviewService.fromAttack(
            source,
            previewAttack,
            Training.aimAngle(),
            now+100,
            source.attackPreview||null
          );
        }
        continue;
      }

      if(
        !this.isRepeatablePrimary(
          source,
          ability
        )
      )continue;

      if(
        this.matchesDynamicBlockCondition(
          source,
          ability
        )
      )continue;

      if(
        now<
        this.nextReadyAt(
          source,
          ability
        )
      )continue;

      Training.use(slot);
    }
  }
});
