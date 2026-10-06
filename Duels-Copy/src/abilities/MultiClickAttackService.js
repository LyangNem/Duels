

/* 능력 */

// MultiClickAttackService: 반복 클릭으로 진행도를 올리고 마지막 입력 후 일정 무입력 시간이 지나면 실제 AttackSpec을 한 번 실행한다.
// 캐릭터 ID를 알지 않으며 AttackSpec.multiClick 데이터만 사용한다.
const MultiClickAttackService=Object.freeze({
  config(attack){
    const raw=attack?.multiClick;
    if(!raw||typeof raw!=='object')return null;
    const maxClicks=Math.max(1,Math.floor(Number(raw.maxClicks)||1));
    return {
      progressStateKey:String(raw.progressStateKey||`multi-click:${attack.id}:progress`),
      lifetimeStateKey:String(raw.lifetimeStateKey||`multi-click:${attack.id}:lifetime`),
      idleStateKey:String(raw.idleStateKey||`multi-click:${attack.id}:idle`),
      maxClicks,
      maxWindow:Math.max(0,Number(raw.maxWindow)||0),
      unlimitedWindow:raw.unlimitedWindow===true,
      activationRange:Math.max(0,Number(raw.activationRange)||0),
      releaseOnAimExit:raw.releaseOnAimExit===true,
      fireOutsideAsMinimum:raw.fireOutsideAsMinimum===true,
      blockWhileDodging:raw.blockWhileDodging===true,
      blockWhileMovement:raw.blockWhileMovement===true,
      progressiveWindow:
        raw.progressiveWindow&&
        typeof raw.progressiveWindow==='object'
          ?{
            minClicks:Math.max(
              1,
              Math.floor(Number(raw.progressiveWindow.minClicks)||1)
            ),
            maxClicks:Math.max(
              1,
              Math.floor(
                Number(raw.progressiveWindow.maxClicks)||
                Math.max(1,maxClicks-1)
              )
            ),
            minDuration:Math.max(
              GAME_DATA.frameMs,
              Number(raw.progressiveWindow.minDuration)||
              GAME_DATA.frameMs
            ),
            maxDuration:Math.max(
              GAME_DATA.frameMs,
              Number(raw.progressiveWindow.maxDuration)||
              Math.max(0,Number(raw.maxWindow)||0)
            )
          }
          :null,
      idleRelease:Math.max(GAME_DATA.frameMs,Number(raw.idleRelease)||300),
      holdAfterWindow:raw.holdAfterWindow===true,
      holdGrace:Math.max(
        0,
        Number(raw.holdGrace)||0
      ),
      fireOnMax:raw.fireOnMax===true,
      fireOnWindowEnd:raw.fireOnWindowEnd===true,
      cancelOnWindowEnd:raw.cancelOnWindowEnd===true,
      holdStateKey:String(
        raw.holdStateKey||
        `multi-click:${attack.id}:hold`
      ),
      inputSlot:String(raw.inputSlot||'lmb'),
      clickCost:Math.max(0,Number(raw.clickCost)||0),
      boostStateKey:String(raw.boostStateKey||''),
      preview:raw.preview!==false,
      gauge:
        raw.gauge===true
          ?{}
          :(
            raw.gauge&&typeof raw.gauge==='object'
              ?raw.gauge
              :null
          )
    };
  },
  progress(source,config){return ProgressStateService.state(source,config.progressStateKey);},
  boostClicks(config,boost=null){
    return Math.max(
      0,
      Math.min(
        config.maxClicks,
        Math.round(Number(boost?.value)||0)
      )
    );
  },
  active(entity,now=performance.now()){
    if(!entity?.character?.attacks)return null;
    for(const attack of Object.values(entity.character.attacks)){
      const config=this.config(attack);
      if(!config?.gauge)continue;
      const progress=this.progress(entity,config);
      const boost=config.boostStateKey
        ?ProgressStateService.state(entity,config.boostStateKey)
        :null;
      if(!progress&&!(Number(boost?.value)>0))continue;
      return {attack,config,progress,boost};
    }
    return null;
  },
  hasGauge(entity,now=performance.now()){
    return !!this.active(entity,now);
  },
  isFull(entity,now=performance.now()){
    const active=this.active(entity,now);
    if(!active)return false;
    const {config,progress,boost}=active;
    const clickCount=progress
      ?Math.max(0,Math.min(config.maxClicks,Number(progress.value)||0))
      :(Number(boost?.value)>0?this.boostClicks(config,boost):0);
    return clickCount>=config.maxClicks;
  },
  drawGauge(ctx,entity,now=performance.now()){
    if(!ctx||!entity)return false;
    if(
      Training.sessionMode==='online'&&
      !EntitySimulationAuthorityService.isLocal(entity)
    )return false;

    const active=this.active(entity,now);
    if(!active)return false;

    const {config,progress,boost}=active;
    const gauge=config.gauge||{};
    const radius=
      EntityRingLayoutService.chargeRadius(entity);
    const lineWidth=
      Math.max(
        1,
        Number(gauge.lineWidth)||3
      );
    const boostActive=
      !progress&&
      Number(boost?.value)>0;
    const clickCount=
      progress
        ?Math.max(
          0,
          Math.min(
            config.maxClicks,
            Number(progress.value)||0
          )
        )
        :(
          boostActive
            ?this.boostClicks(config,boost)
            :0
        );
    const clickRatio=
      Math.max(
        0,
        Math.min(
          1,
          clickCount/
            Math.max(1,config.maxClicks)
        )
      );

    /*
      클레아 달 그림자와 동일한 레이어 구조:
      1) 현재 클릭 충전량 호를 기본 chargeRadius에 먼저 그린다.
      2) 시간 호도 정확히 같은 radius에 다시 그려 위에 겹친다.
      3) 시간 호 값은 progress × timed remaining.
      startAngle/span을 따로 지정하지 않아 ArcGaugePresentationService의
      공통 기본 방향(12시 시작)을 그대로 사용한다.
    */
    ArcGaugePresentationService.render(
      ctx,
      entity,
      clickRatio,
      {
        radius,
        color:
          `rgba(${ColorService.rgbString(
            gauge.chargeColor||
              entity.color||
              '#ffffff',
            '191,161,54'
          )},0.9)`,
        lineWidth,
        lineCap:'butt',
        showEmpty:false,
        completeAccent:false,
        maxChargeFlash:false
      }
    );

    const timeState=
      TimedActionStateService.state(
        entity,
        config.lifetimeStateKey,
        now
      );

    if(
      timeState&&
      config.maxWindow>0
    ){
      const duration=
        Math.max(
          1,
          Number(timeState.expiresAt)-
          Number(timeState.startedAt)
        );
      const remainingRatio=
        Math.max(
          0,
          Math.min(
            1,
            (
              Number(timeState.expiresAt)-
              now
            )/
            duration
          )
        );
      const timeRatio=
        String(gauge.timeArcMode||'')===
          'progress-timed-remaining'
          ?clickRatio*remainingRatio
          :Math.max(
            0,
            Math.min(
              1,
              (
                now-
                Number(timeState.startedAt)
              )/
              duration
            )
          );

      if(timeRatio>0){
        ArcGaugePresentationService.render(
          ctx,
          entity,
          timeRatio,
          {
            radius,
            color:
              `rgba(${ColorService.rgbString(
                gauge.timeColor||
                  '80,110,160',
                '80,110,160'
              )},0.95)`,
            lineWidth,
            lineCap:'butt',
            showEmpty:false,
            completeAccent:false,
            maxChargeFlash:false
          }
        );
      }
    }

    if(clickRatio>=1){
      ArcGaugePresentationService.render(
        ctx,
        entity,
        1,
        {
          radius,
          color:
            `rgba(${ColorService.rgbString(
              gauge.chargeColor||
                entity.color||
                '#ffffff',
              '191,161,54'
            )},0.9)`,
          lineWidth,
          lineCap:'butt',
          showEmpty:false,
          completeAccent:false,
          hideArcAtComplete:true,
          maxChargeFlash:true,
          completePulseColor:
            String(
              gauge.fullColor||
              entity.color||
              '#ffffff'
            ),
          completePulseLineWidth:
            Math.max(
              1,
              Number(gauge.fullLineWidth)||2.5
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
  },
  liveTargetPoint(source){
    if(
      EntitySimulationAuthorityService.isLocal(source)&&
      Training.player===source
    ){
      const point=Training.mouseWorld();
      return {
        x:Number(point?.x)||0,
        y:Number(point?.y)||0
      };
    }

    const remote=source?._remoteAimTargetPoint;
    if(
      Number.isFinite(Number(remote?.x))&&
      Number.isFinite(Number(remote?.y))
    ){
      return {
        x:Number(remote.x),
        y:Number(remote.y)
      };
    }

    const angle=
      Number.isFinite(Number(source?._remoteAimAngle))
        ?Number(source._remoteAimAngle)
        :0;
    return {
      x:(Number(source?.x)||0)+Math.cos(angle)*99999,
      y:(Number(source?.y)||0)+Math.sin(angle)*99999
    };
  },
  pointerDistance(source,targetPoint){
    if(
      !source||
      !targetPoint||
      !Number.isFinite(Number(targetPoint.x))||
      !Number.isFinite(Number(targetPoint.y))
    )return Infinity;
    return Math.hypot(
      Number(targetPoint.x)-Number(source.x),
      Number(targetPoint.y)-Number(source.y)
    );
  },
  withinActivation(source,config,targetPoint=null){
    if(!(Number(config?.activationRange)>0))return true;
    return this.pointerDistance(
      source,
      targetPoint||this.liveTargetPoint(source)
    )<=Number(config.activationRange);
  },
  blockedByAction(source,config,now=performance.now()){
    if(
      config?.blockWhileDodging===true&&
      Math.max(0,Number(source?.dodgeUntil)||0)>now
    )return true;
    if(
      config?.blockWhileMovement===true&&
      MovementAbilityService.active(source)
    )return true;
    return false;
  },
  liveAim(source,fallbackAngle=0){
    if(EntitySimulationAuthorityService.isLocal(source)&&Training.player===source)return Training.aimAngle();
    return Number.isFinite(Number(source?._remoteAimAngle))?Number(source._remoteAimAngle):(Number(fallbackAngle)||0);
  },
  syncPreview(source,attack,config,angle){
    if(!config.preview)return false;
    const resolved=ProgressScaledAttackService.resolve(source,attack);
    const preview=AttackPreviewService.fromAttack(source,resolved,angle,Infinity,source.attackPreview,{includeDeliveryAreas:true});
    if(!preview)return false;
    preview.liveTracking={attackId:String(attack.id||''),aimMode:'live-source',followSource:true,includeDeliveryAreas:true,angle:Number(angle)||0,multiClickProgress:true};
    source.attackPreview=preview;
    return true;
  },
  holdState(source,config,create=false){
    if(!source?.actionState||!config)return null;
    let state=source.actionState.get(config.holdStateKey);
    if(
      state?.kind!=='multi-click-hold'
    ){
      if(!create)return null;
      state={
        kind:'multi-click-hold',
        held:false,
        windowEndsAt:0,
        graceEndsAt:0,
        windowComplete:false,
        graceComplete:false
      };
      source.actionState.set(
        config.holdStateKey,
        state
      );
    }
    return state;
  },
  clearRuntime(source,config,now=performance.now()){
    if(!source||!config)return false;
    TimedActionStateService.consume(
      source,
      config.idleStateKey,
      now
    );
    TimedActionStateService.consume(
      source,
      config.lifetimeStateKey,
      now
    );
    source.actionState?.delete(
      config.holdStateKey
    );
    source.actionState?.delete(
      `${config.progressStateKey}:resource-condition-snapshot`
    );
    source.attackPreview=null;
    return true;
  },
  resourceSnapshotStateKey(config){
    return `${config.progressStateKey}:resource-condition-snapshot`;
  },
  resourceSnapshot(source,config){
    return source?.actionState?.get(
      this.resourceSnapshotStateKey(config)
    )?.snapshot||
    null;
  },
  captureResourceSnapshot(source,config){
    if(!source?.actionState||!config)return null;
    const key=this.resourceSnapshotStateKey(config);
    const existing=source.actionState.get(key);
    if(existing?.snapshot)return existing.snapshot;
    const snapshot=
      AugmentService.captureResourceConditionSnapshot(
        source
      );
    source.actionState.set(
      key,
      {
        kind:'resource-condition-snapshot',
        stateKey:key,
        snapshot
      }
    );
    return snapshot;
  },
  releaseNow(source,attack,config,angle,now=performance.now()){
    if(!source?.alive||!attack||!config)return false;

    const resourceConditionSnapshot=
      this.resourceSnapshot(
        source,
        config
      )||
      this.captureResourceSnapshot(
        source,
        config
      );

    const liveAngle=this.liveAim(
      source,
      angle
    );
    const resolved=
      ProgressScaledAttackService.resolve(
        source,
        attack
      );
    const prepared=
      AugmentService.prepareAttack(
        source,
        resolved,
        now,
        {
          resourceConditionSnapshot
        }
      );

    this.clearRuntime(
      source,
      config,
      now
    );

    const authoritativeRelease=
      Training.sessionMode!=='online'||
      !OnlineDuelService.active||
      EntitySimulationAuthorityService
        .isLocal(source);

    if(authoritativeRelease){
      AttackService.execute(
        source,
        prepared,
        liveAngle,
        {
          preparedSpec:true,
          broadcastTriggeredAttack:
            Training.sessionMode==='online'&&
            OnlineDuelService.active
        }
      );
    }

    ProgressStateService.apply(
      source,
      {
        type:'state.progress',
        stateKey:config.progressStateKey,
        operation:'reset'
      }
    );
    return true;
  },
  cancelNow(source,config,now=performance.now()){
    if(!source||!config)return false;
    this.clearRuntime(source,config,now);
    ProgressStateService.apply(
      source,
      {
        type:'state.progress',
        stateKey:config.progressStateKey,
        operation:'reset'
      }
    );
    return true;
  },
  fireStoredOrMinimum(
    source,
    attack,
    config,
    angle,
    now=performance.now()
  ){
    if(!source?.alive||!attack||!config)return false;

    const progress=
      this.progress(
        source,
        config
      );
    const storedValue=
      Math.max(
        0,
        Number(progress?.value)||0
      );

    if(storedValue<=0){
      this.captureResourceSnapshot(
        source,
        config
      );
      ProgressStateService.apply(
        source,
        {
          type:'state.progress',
          stateKey:config.progressStateKey,
          operation:'set',
          value:1,
          max:config.maxClicks,
          blocksStaminaRegen:true
        }
      );
    }

    return this.releaseNow(
      source,
      attack,
      config,
      angle,
      now
    );
  },
  updateAimExit(
    source,
    targetPoint=null,
    now=performance.now()
  ){
    if(
      !source?.alive||
      !EntitySimulationAuthorityService.isLocal(source)
    )return false;

    for(const attack of Object.values(source.character?.attacks||{})){
      const config=this.config(attack);
      if(
        !config?.releaseOnAimExit||
        !(config.activationRange>0)
      )continue;

      const progress=this.progress(source,config);
      if(!progress)continue;

      if(this.blockedByAction(source,config,now)){
        continue;
      }

      if(
        this.withinActivation(
          source,
          config,
          targetPoint||this.liveTargetPoint(source)
        )
      )continue;

      return this.releaseNow(
        source,
        attack,
        config,
        this.liveAim(source,0),
        now
      );
    }

    return false;
  },
  fixedWindowDuration(config,clickCount){
    const progressive=config?.progressiveWindow;
    if(!progressive){
      return Math.max(0,Number(config?.maxWindow)||0);
    }

    const minClicks=Math.max(
      1,
      Number(progressive.minClicks)||1
    );
    const maxClicks=Math.max(
      minClicks,
      Number(progressive.maxClicks)||minClicks
    );
    const count=Math.max(
      minClicks,
      Math.min(
        maxClicks,
        Number(clickCount)||minClicks
      )
    );
    const ratio=
      maxClicks<=minClicks
        ?1
        :(count-minClicks)/(maxClicks-minClicks);

    return (
      Math.max(
        GAME_DATA.frameMs,
        Number(progressive.minDuration)||
        GAME_DATA.frameMs
      )+
      (
        Math.max(
          GAME_DATA.frameMs,
          Number(progressive.maxDuration)||
          Math.max(0,Number(config?.maxWindow)||0)
        )-
        Math.max(
          GAME_DATA.frameMs,
          Number(progressive.minDuration)||
          GAME_DATA.frameMs
        )
      )*
      Math.max(0,Math.min(1,ratio))
    );
  },
  rescheduleFixedWindow(
    source,
    attack,
    config,
    angle,
    now=performance.now()
  ){
    const current=
      source?.actionState?.get(
        config?.lifetimeStateKey
      )||null;
    const progress=this.progress(source,config);
    if(
      !current||
      !progress||
      current.kind!=='timed-action'
    )return false;

    const duration=this.fixedWindowDuration(
      config,
      Number(progress.value)||0
    );

    current.startedAt=now;
    current.expiresAt=now+duration;
    current.complete=false;

    this.scheduleFixedWindowEnd(
      source,
      attack,
      config,
      current,
      angle
    );
    return true;
  },
  scheduleFixedWindowEnd(
    source,
    attack,
    config,
    expectedLifetime,
    angle
  ){
    if(
      !source||
      !attack||
      !config||
      !expectedLifetime
    )return false;

    SimulationScheduleService.scheduleContinuation({
      at:Number(expectedLifetime.expiresAt),
      source,
      abilityId:`multi-click-fixed-window:${attack.id}`,
      continue:()=>{
        if(!source.alive)return;

        const currentRaw=
          source.actionState?.get(
            config.lifetimeStateKey
          )||null;

        // 이미 완료/취소되었거나 새 세션으로 교체되었으면 이전 예약은 무시.
        if(currentRaw!==expectedLifetime)return;

        const now=performance.now();

        /*
          retainCompleteMs는 오직 종료 continuation이 소비할 시간을 보장한다.
          실제 공격 시점은 원래 expiresAt 그대로이며 보존 구간만큼 늦추지 않는다.
        */
        if(
          Number(expectedLifetime.expiresAt)>now+
            GAME_DATA.frameMs
        )return;
        const progress=this.progress(source,config);

        if(
          (
            config.fireOnWindowEnd===true&&
            (Number(progress?.value)||0)>0
          )||
          (
            config.fireOnMax===true&&
            (Number(progress?.value)||0)>=config.maxClicks
          )
        ){
          this.releaseNow(
            source,
            attack,
            config,
            angle,
            now
          );
          return;
        }

        if(config.cancelOnWindowEnd===true){
          this.cancelNow(
            source,
            config,
            now
          );
        }
      }
    });

    return true;
  },
  scheduleWindowEnd(
    source,
    attack,
    config,
    state,
    angle
  ){
    if(
      !source||
      !attack||
      !config||
      !state||
      !Number.isFinite(
        Number(state.windowEndsAt)
      )
    )return false;

    SimulationScheduleService.scheduleContinuation({
      at:Number(state.windowEndsAt),
      source,
      abilityId:`multi-click-window:${attack.id}`,
      continue:()=>{
        const current=
          this.holdState(
            source,
            config,
            false
          );
        if(
          !current||
          current!==state||
          !source.alive
        )return;

        const now=performance.now();
        current.windowComplete=true;
        current.graceEndsAt=
          now+
          config.holdGrace;
        current.graceComplete=
          config.holdGrace<=0;

        /*
          고정 차징 구간 종료 직후에는 holdGrace 동안 입력 전환 시간을 준다.
          이 구간에서는 클릭/keyup 모두 발사를 만들지 않고, 오직 held 상태만 갱신한다.
        */
        if(config.holdGrace>0){
          SimulationScheduleService.scheduleContinuation({
            at:current.graceEndsAt,
            source,
            abilityId:`multi-click-hold-grace:${attack.id}`,
            continue:()=>{
              const latest=
                this.holdState(
                  source,
                  config,
                  false
                );
              if(
                !latest||
                latest!==current||
                !source.alive
              )return;

              latest.graceComplete=true;

              if(latest.held===true)return;

              this.releaseNow(
                source,
                attack,
                config,
                angle,
                performance.now()
              );
            }
          });
          return;
        }

        if(current.held===true)return;

        this.releaseNow(
          source,
          attack,
          config,
          angle,
          now
        );
      }
    });
    return true;
  },
  scheduleRelease(source,attack,config,expected,angle){
    if(!expected)return false;
    SimulationScheduleService.scheduleContinuation({
      at:expected.expiresAt,source,abilityId:`multi-click:${attack.id}`,
      continue:()=>{
        const current=TimedActionStateService.state(source,config.idleStateKey,performance.now());
        if(!current||current!==expected||!source.alive)return;
        const now=performance.now();
        this.releaseNow(
          source,
          attack,
          config,
          angle,
          now
        );
      }
    });
    return true;
  },
  press(context){
    const source=context?.source,attack=context?.attack;
    const config=this.config(attack);
    if(!source||!attack||!config)return false;
    const now=Number(context.now)||performance.now();

    if(this.blockedByAction(source,config,now)){
      context.handled=true;
      context.executed=false;
      context.suppressStealthRevealOnAbilityUse=true;
      return true;
    }

    const liveTargetPoint=this.liveTargetPoint(source);
    let progress=this.progress(source,config);

    if(
      !this.withinActivation(
        source,
        config,
        liveTargetPoint
      )
    ){
      const liveAngle=
        this.liveAim(
          source,
          context.angle
        );

      if(config.fireOutsideAsMinimum===true){
        const released=
          this.fireStoredOrMinimum(
            source,
            attack,
            config,
            liveAngle,
            now
          );
        context.handled=true;
        context.executed=released===true;
        context.suppressStealthRevealOnAbilityUse=true;
        return true;
      }

      if(progress&&config.releaseOnAimExit===true){
        const released=this.releaseNow(
          source,
          attack,
          config,
          liveAngle,
          now
        );
        context.handled=true;
        context.executed=released===true;
        context.suppressStealthRevealOnAbilityUse=true;
        return true;
      }

      context.handled=true;
      context.executed=false;
      context.suppressStealthRevealOnAbilityUse=true;
      return true;
    }

    let holdState=
      config.holdAfterWindow
        ?this.holdState(
          source,
          config,
          true
        )
        :null;

    if(
      config.holdAfterWindow&&
      holdState
    ){
      holdState.held=true;
    }

    if(!progress){
      if((source.cooldowns.get(attack.id)||0)>now){
        if(holdState)holdState.held=false;
        return false;
      }

      this.captureResourceSnapshot(
        source,
        config
      );

      let initial=1,boosted=false;
      if(config.boostStateKey){
        const boost=ProgressStateService.state(source,config.boostStateKey);
        if((Number(boost?.value)||0)>0){
          boosted=true;
          initial=this.boostClicks(config,boost);
          ProgressStateService.apply(source,{type:'state.progress',stateKey:config.boostStateKey,operation:'reset'});
        }
      }
      if(!boosted&&context.network!==true&&config.clickCost>0&&!StaminaService.spend(source,config.clickCost,now)){
        if(holdState)holdState.held=false;
        return false;
      }
      ProgressStateService.apply(source,{type:'state.progress',stateKey:config.progressStateKey,operation:'set',value:initial,max:config.maxClicks,blocksStaminaRegen:true});

      if(!config.unlimitedWindow){
        TimedActionStateService.open(
          source,
          {
            stateKey:config.lifetimeStateKey,
            duration:this.fixedWindowDuration(
              config,
              initial
            ),
            /*
              fixed-window 종료 continuation과 같은 프레임에
              게이지/상태 조회가 먼저 만료 state를 삭제하지 않도록
              완료 후 짧은 보존 구간을 둔다.
            */
            retainCompleteMs:
              (
                config.cancelOnWindowEnd===true||
                config.fireOnWindowEnd===true||
                config.fireOnMax===true
              )
                ?Math.max(
                  100,
                  GAME_DATA.frameMs*4
                )
                :0
          },
          now
        );
      }

      progress=this.progress(source,config);

      if(
        config.holdAfterWindow&&
        holdState
      ){
        holdState.windowEndsAt=
          now+
          config.maxWindow;
        holdState.windowComplete=
          config.maxWindow<=0;
        this.scheduleWindowEnd(
          source,
          attack,
          config,
          holdState,
          context.angle
        );
      }else if(
        !config.unlimitedWindow&&
        (
          config.cancelOnWindowEnd===true||
          config.fireOnWindowEnd===true||
          config.fireOnMax===true
        )
      ){
        const expectedLifetime=
          source.actionState?.get(
            config.lifetimeStateKey
          )||null;
        this.scheduleFixedWindowEnd(
          source,
          attack,
          config,
          expectedLifetime,
          context.angle
        );
      }
    }else{
      const holdWindowComplete=
        config.holdAfterWindow&&
        holdState?.windowComplete===true;

      if(!holdWindowComplete){
        const lifetime=
          config.unlimitedWindow
            ?null
            :TimedActionStateService.state(
              source,
              config.lifetimeStateKey,
              now
            );
        const canIncrease=
          (
            config.unlimitedWindow||
            (
              !!lifetime&&
              Number(lifetime.expiresAt)>now
            )
          )&&
          (Number(progress.value)||0)<config.maxClicks;
        if(canIncrease){
          let paid=true;
          if(context.network!==true&&config.clickCost>0)paid=StaminaService.spend(source,config.clickCost,now);
          if(paid){
            ProgressStateService.apply(source,{type:'state.progress',stateKey:config.progressStateKey,operation:'add',amount:1,max:config.maxClicks,blocksStaminaRegen:true});
            if(
              config.progressiveWindow&&
              (
                config.cancelOnWindowEnd===true||
                config.fireOnWindowEnd===true||
                config.fireOnMax===true
              )
            ){
              this.rescheduleFixedWindow(
                source,
                attack,
                config,
                context.angle,
                now
              );
            }
          }
        }
      }
    }

    const liveAngle=this.liveAim(source,context.angle);
    this.syncPreview(source,attack,config,liveAngle);

    const currentProgress=this.progress(source,config);

    if(
      config.fireOnMax===true&&
      (Number(currentProgress?.value)||0)>=config.maxClicks
    ){
      this.releaseNow(
        source,
        attack,
        config,
        liveAngle,
        now
      );
      NaturalHealthRegenActivityService.mark(source,now);
      context.handled=true;
      context.executed=true;
      context.suppressStealthRevealOnAbilityUse=true;
      return true;
    }

    if(
      !config.unlimitedWindow&&
      !config.holdAfterWindow&&
      config.cancelOnWindowEnd!==true&&
      config.fireOnWindowEnd!==true
    ){
      TimedActionStateService.open(source,{stateKey:config.idleStateKey,duration:config.idleRelease,retainCompleteMs:Math.max(100,GAME_DATA.frameMs*4)},now);
      const expected=TimedActionStateService.state(source,config.idleStateKey,now);
      this.scheduleRelease(source,attack,config,expected,liveAngle);
    }

    // 멀티클릭 차징의 입력 누적만으로는 자연 체력 회복을 끊지 않는다.
    // 실제 방출 시 releaseNow()가 공격 실행 경로에서 회복 대기시간을 갱신한다.
    context.handled=true;context.executed=true;context.suppressStealthRevealOnAbilityUse=true;
    return true;
  },
  release(context){
    const source=context?.source;
    const attack=context?.attack;
    const config=this.config(attack);
    if(
      !source||
      !attack||
      !config||
      !config.holdAfterWindow
    )return false;

    const now=
      Number(context.now)||
      performance.now();
    const state=
      this.holdState(
        source,
        config,
        false
      );
    if(!state)return false;

    state.held=false;

    const windowComplete=
      state.windowComplete===true||
      (
        Number.isFinite(
          Number(state.windowEndsAt)
        )&&
        now>=Number(state.windowEndsAt)
      );

    const graceComplete=
      state.graceComplete===true||
      (
        windowComplete&&
        (
          !Number.isFinite(
            Number(state.graceEndsAt)
          )||
          now>=Number(state.graceEndsAt)
        )
      );

    /*
      고정 차징 구간 안의 mouseup은 연타 입력의 일부라 발사하지 않는다.
      차징 종료 후 holdGrace 동안의 mouseup도 홀드 전환 유예로 취급해 발사하지 않는다.
      grace가 끝난 이후의 mouseup만 즉시 발사한다.
    */
    if(
      windowComplete&&
      graceComplete
    ){
      this.releaseNow(
        source,
        attack,
        config,
        context.angle,
        now
      );
    }

    context.handled=true;
    context.executed=false;
    context.suppressStealthRevealOnAbilityUse=true;
    return true;
  }
});