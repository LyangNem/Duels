

const EntityRingLayoutService=Object.freeze({
  // 캐릭터에서 바깥쪽 순서:
  // 호 게이지 -> 최대차징 점멸 링 -> 버프/CC 점선 링 -> 반격 활성 링.
  BODY_GAP:5,
  INTER_RING_GAP:1,
  WIDTHS:Object.freeze({
    gauge:3,
    flash:2,
    status:3,
    counter:3
  }),

  base(entity){
    return Math.max(
      1,
      Number(entity?.radius)||20
    );
  },

  lineOuter(radius,lineWidth){
    return (
      Math.max(
        0,
        Number(radius)||0
      )+
      Math.max(
        0,
        Number(lineWidth)||0
      )/2
    );
  },

  nextRadius(innerRadius,innerWidth,outerWidth){
    return (
      Math.max(
        0,
        Number(innerRadius)||0
      )+
      Math.max(
        0,
        Number(innerWidth)||0
      )/2+
      this.INTER_RING_GAP+
      Math.max(
        0,
        Number(outerWidth)||0
      )/2
    );
  },

  chargeRadius(entity){
    return (
      this.base(entity)+
      this.BODY_GAP
    );
  },

  summonReadyFlashActive(state,now=performance.now()){
    const until=
      Number(state?.readyFlashUntil)||0;
    if(until<=now)return false;

    // deployable summon의 ready flash는 복구 완료 직후 500ms만 유효하다.
    return now>=until-500;
  },

  canViewPrivateGauge(entity){
    if(Training.sessionMode!=='online')return true;
    return EntitySimulationAuthorityService.isLocal(entity);
  },

  characterRingPresentation(entity){
    const config=entity?.character?.ringPresentation;
    return config&&typeof config==='object'?config:null;
  },

  directionalArcIndicatorConfig(entity){
    const config=
      entity?.character?.directionalArcIndicator;
    return config&&typeof config==='object'
      ?config
      :null;
  },

  directionalArcIndicatorState(entity){
    if(
      !this.canViewPrivateGauge(entity)||
      entity!==Training.player||
      !entity?.alive||
      entity.hidden
    ){
      return {
        visible:false,
        direction:'right',
        centerAngle:0
      };
    }

    const config=
      this.directionalArcIndicatorConfig(entity);
    if(!config){
      return {
        visible:false,
        direction:'right',
        centerAngle:0
      };
    }

    const direction=
      CardinalDirectionService.resolve(
        Training.aimAngle()
      );

    return {
      visible:true,
      direction,
      centerAngle:
        CardinalDirectionService.centerAngle(direction),
      config
    };
  },

  characterHoldGaugeState(entity,now=performance.now()){
    if(!this.canViewPrivateGauge(entity)){
      return {visible:false,ratio:0,full:false};
    }
    if(entity!==Training.player){
      return {visible:false,ratio:0,full:false};
    }

    const pointerGauge=PointerHoldInputService?.holdGaugePresentationState?.(entity,now);
    if(pointerGauge?.visible)return pointerGauge;

    const config=
      this.characterRingPresentation(entity)?.holdGauge;
    if(!config){
      return {visible:false,ratio:0,full:false};
    }

    const slot=String(config.input||'');
    const input=PointerHoldInputService?.state?.[slot];
    if(input?.held!==true){
      return {visible:false,ratio:0,full:false};
    }

    const interval=Math.max(
      1,
      Number(config.interval)||200
    );
    const progressState=
      config.stateKey
        ?ProgressStateService.state(
          entity,
          String(config.stateKey)
        )
        :null;
    const value=Number.isFinite(Number(progressState?.value))
      ?Number(progressState.value)
      :Number(config.initial)||0;
    const minimum=Number.isFinite(Number(config.min))
      ?Number(config.min)
      :0;
    const anchor=
      Number(input.holdRepeatLastStepAt)||
      Number(input.pressedAt)||
      now;

    // 기존 룰리: 최소 단계에서는 더 줄일 수 없으므로 호 게이지가 완료 상태(1)에 고정된다.
    const ratio=
      value<=minimum
        ?1
        :Math.min(
          1,
          Math.max(
            0,
            (now-anchor)/interval
          )
        );

    return {
      visible:true,
      ratio,
      full:ratio>=1
    };
  },

  characterHoldGaugeVisible(entity,now=performance.now()){
    return this.characterHoldGaugeState(entity,now).visible;
  },

  worldArcGaugeState(entity,now=performance.now()){
    // 실제 WorldGaugeModuleService.draw의 gauge.arc 렌더 조건과 동일하게 맞춘다.
    // 적 화면처럼 팀 게이지를 볼 수 없는 경우, 보이지 않는 호가 링 배치 공간까지
    // 차지해 CC/반격 링을 바깥으로 밀어내지 않도록 한다.
    if(!duels3CanViewTeamGauge(entity)){
      return {
        visible:false,
        full:false,
        outerRadius:0,
        outerWidth:0
      };
    }

    const modules=entity?.character?.worldGaugeModules;
    if(!Array.isArray(modules)){
      return {
        visible:false,
        full:false,
        outerRadius:0,
        outerWidth:0
      };
    }

    let visible=false;
    let full=false;
    let outerRadius=0;
    let outerWidth=0;

    const takeOuter=(radius,width)=>{
      const nextRadius=Math.max(0,Number(radius)||0);
      const nextWidth=Math.max(0,Number(width)||0);
      if(
        this.lineOuter(nextRadius,nextWidth)>
        this.lineOuter(outerRadius,outerWidth)
      ){
        outerRadius=nextRadius;
        outerWidth=nextWidth;
      }
    };

    for(const module of modules){
      if(module?.type!=='gauge.arc')continue;
      if(
        module.visibility!=='all'&&
        !this.canViewPrivateGauge(entity)
      )continue;

      if(
        Array.isArray(module.conditions)&&
        !TriggerModuleService.matches(
          {
            type:'trigger',
            event:'gauge.layout',
            conditions:module.conditions
          },
          'gauge.layout',
          {
            source:entity,
            target:entity,
            now
          }
        )
      )continue;

      const ref=module.valueRef||null;
      if(!ref)continue;

      const resolvedValue=
        RuntimeValueReferenceService.resolve(
          entity,
          ref
        );
      const numericValue=Number(resolvedValue);
      if(!Number.isFinite(numericValue))continue;
      const ratio=Math.max(0,Math.min(1,numericValue));

      const moduleVisible=
        ratio>0||
        module.showEmpty===true;
      const gaugeRadius=
        Number(module.radius)||
        (
          this.chargeRadius(entity)+
          (Number(module.radiusOffset)||0)
        );
      const gaugeWidth=
        Math.max(
          .1,
          Number(module.lineWidth)||
          this.WIDTHS.gauge
        );

      if(moduleVisible){
        visible=true;
        takeOuter(
          gaugeRadius,
          gaugeWidth
        );
      }

      let moduleFull=false;
      if(module.maxChargeFlash===true){
        if(
          ref.type==='formula-sequence-progress-ratio'
        ){
          const config=
            FormulaSequenceConfigService(
              entity,
              {
                stateKey:String(ref.stateKey||'')
              }
            );
          moduleFull=
            FormulaSequenceService.completeFlashActive(
              entity,
              config,
              now
            );
        }else{
          moduleFull=ratio>=1;
        }

        if(moduleFull){
          full=true;
          const flashWidth=
            Math.max(
              .1,
              Number(module.completePulseLineWidth)||
              this.WIDTHS.flash
            );
          const flashRadius=
            Number(module.completePulseRadius)||
            this.nextRadius(
              gaugeRadius,
              gaugeWidth,
              flashWidth
            );
          takeOuter(
            flashRadius,
            flashWidth
          );
        }
      }
    }

    return {
      visible,
      full,
      outerRadius,
      outerWidth
    };
  },

  privateGaugeVisible(entity,now=performance.now()){
    const canViewPrivate=
      this.canViewPrivateGauge(entity);

    if(
      (
        canViewPrivate&&
        (
          entity?.counterWindup?.charge?.gauge||
          ChargedAttackService.hasGauge(entity)||
          MultiClickAttackService.hasGauge(entity,now)||
          WaypointProjectileService.hasHoldGauge(entity)||
          ChannelAttackService.hasGauge(entity)||
          ProgressStateService.hasGauge(entity)||
          this.characterHoldGaugeVisible(entity,now)||
          this.directionalArcIndicatorState(entity).visible||
          (
            typeof CircleFormationService!=='undefined'&&
            CircleFormationService
              .entityHoldGaugeState(
                entity,
                now
              ).visible
          )
        )
      )||
      this.worldArcGaugeState(entity,now).visible
    )return true;

    const summons=
      entity?.character?.summons;

    if(
      !canViewPrivate||
      !summons||
      !duels3CanViewTeamGauge(entity)
    )return false;

    for(const stateKey in summons){
      if(
        !Object.prototype.hasOwnProperty.call(
          summons,
          stateKey
        )
      )continue;

      const state=
        SummonDeployService.state(
          entity,
          stateKey,
          false
        );

      if(!state)continue;

      if(
        SummonDeployService.cooldownProgress(
          entity,
          stateKey,
          now
        )
      )return true;

      if(
        this.summonReadyFlashActive(
          state,
          now
        )
      )return true;
    }

    return false;
  },

  flashVisible(entity,now=performance.now()){
    const canViewPrivate=
      this.canViewPrivateGauge(entity);
    const windup=
      entity?.counterWindup;

    if(
      canViewPrivate&&
      windup?.charge?.gauge&&
      CounterModuleService
        .chargeProgress(
          windup,
          now
        )>=1&&
      Number(now)>=
        Number(windup.chargeEndsAt)&&
      Number(now)<
        Number(
          windup.completeHoldUntil||
          windup.endsAt
        )
    )return true;

    if(
      canViewPrivate&&
      ChargedAttackService.isFull(
        entity,
        now
      )
    )return true;

    if(
      canViewPrivate&&
      MultiClickAttackService.isFull(
        entity,
        now
      )
    )return true;

    if(
      canViewPrivate&&
      entity?.actionState
    ){
      for(const state of entity.actionState.values()){
        if(
          state?.kind===
            WaypointProjectileService.HOLD_KIND&&
          String(
            state.projectileStateKey||''
          )==='levina-spear'&&
          (
            now-
            Number(state.startedAt||now)
          )>=
            Math.max(
              1,
              Number(state.threshold)||300
            )
        )return true;
      }
    }

    if(
      canViewPrivate&&
      ChannelAttackService.hasFlash(entity)
    )return true;

    if(
      canViewPrivate&&
      this.characterHoldGaugeState(entity,now).full
    )return true;

    if(
      canViewPrivate&&
      typeof CircleFormationService!=='undefined'&&
      CircleFormationService
        .entityHoldGaugeState(
          entity,
          now
        ).full
    )return true;

    if(this.worldArcGaugeState(entity,now).full)return true;

    if(canViewPrivate&&entity?.actionState){
      for(const state of entity.actionState.values()){
        if(
          state?.kind===ProgressStateService.KIND&&
          state.presentation?.maxChargeFlash===true&&
          (Number(state.value)||0)>=Math.max(1,Number(state.max)||1)
        )return true;
      }
    }

    const summons=
      entity?.character?.summons;

    if(
      canViewPrivate&&
      summons&&
      duels3CanViewTeamGauge(entity)
    ){
      for(const stateKey in summons){
        if(
          !Object.prototype.hasOwnProperty.call(
            summons,
            stateKey
          )
        )continue;

        const state=
          SummonDeployService.state(
            entity,
            stateKey,
            false
          );

        if(
          state&&
          this.summonReadyFlashActive(
            state,
            now
          )
        )return true;
      }
    }

    return false;
  },

  maxChargeFlashRadius(entity,now=performance.now()){
    // 점멸 링은 호 게이지 바로 바깥 슬롯.
    return this.nextRadius(
      this.chargeRadius(entity),
      this.WIDTHS.gauge,
      this.WIDTHS.flash
    );
  },

  statusRadius(entity,now=performance.now()){
    const base=
      this.base(entity);
    let radius=base;
    let width=0;

    const take=(
      candidateRadius,
      candidateWidth
    )=>{
      if(
        this.lineOuter(
          candidateRadius,
          candidateWidth
        )>
        this.lineOuter(
          radius,
          width
        )
      ){
        radius=candidateRadius;
        width=candidateWidth;
      }
    };

    if(
      this.privateGaugeVisible(
        entity,
        now
      )
    ){
      take(
        this.chargeRadius(entity),
        this.WIDTHS.gauge
      );
    }

    if(
      this.flashVisible(
        entity,
        now
      )
    ){
      take(
        this.maxChargeFlashRadius(
          entity,
          now
        ),
        this.WIDTHS.flash
      );
    }

    const worldArc=
      this.worldArcGaugeState(
        entity,
        now
      );
    if(
      worldArc.outerRadius>0&&
      worldArc.outerWidth>0
    ){
      take(
        worldArc.outerRadius,
        worldArc.outerWidth
      );
    }

    if(
      radius<=base||
      width<=0
    ){
      return base+this.BODY_GAP;
    }

    return this.nextRadius(
      radius,
      width,
      this.WIDTHS.status
    );
  },

  outermostRing(
    entity,
    now=performance.now(),
    options={}
  ){
    const base=
      this.base(entity);
    const includePrivateGauges=
      options.includePrivateGauges!==false;
    let radius=base;
    let width=0;

    const take=(
      candidateRadius,
      candidateWidth
    )=>{
      if(
        this.lineOuter(
          candidateRadius,
          candidateWidth
        )>
        this.lineOuter(
          radius,
          width
        )
      ){
        radius=candidateRadius;
        width=candidateWidth;
      }
    };

    if(
      includePrivateGauges&&
      this.privateGaugeVisible(
        entity,
        now
      )
    ){
      take(
        this.chargeRadius(entity),
        this.WIDTHS.gauge
      );
    }

    if(
      includePrivateGauges&&
      this.flashVisible(
        entity,
        now
      )
    ){
      take(
        this.maxChargeFlashRadius(
          entity,
          now
        ),
        this.WIDTHS.flash
      );
    }

    if(includePrivateGauges){
      const worldArc=
        this.worldArcGaugeState(
          entity,
          now
        );
      if(
        worldArc.outerRadius>0&&
        worldArc.outerWidth>0
      ){
        take(
          worldArc.outerRadius,
          worldArc.outerWidth
        );
      }
    }

    if(
      StatusPresentation.selected(
        entity,
        now
      )
    ){
      take(
        this.statusRadius(
          entity,
          now
        ),
        this.WIDTHS.status
      );
    }

    return {
      radius,
      width
    };
  },


  counterRadius(
    entity,
    now=performance.now(),
    options={}
  ){
    const base=
      this.base(entity);
    const ring=
      this.outermostRing(
        entity,
        now,
        options
      );

    if(
      ring.radius<=base||
      ring.width<=0
    ){
      return (
        base+
        this.BODY_GAP
      );
    }

    return this.nextRadius(
      ring.radius,
      ring.width,
      this.WIDTHS.counter
    );
  }
});