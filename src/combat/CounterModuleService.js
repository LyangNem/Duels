

const CounterModuleService=Object.freeze({
  requiredWindup:300,
  completionTrigger:{
    type:'trigger',
    event:'time.update',
    conditions:[
      {type:'time.ready',at:0},
      {type:'entity.alive'}
    ]
  },
  isCcModule(module){
    if(!module||typeof module==='string')return false;
    if(
      module.type==='movement.neutralize-knockback'&&
      module.target==='hit-target'
    )return true;
    if(
      module.type==='movement.knockback'&&
      module.target==='hit-target'&&
      typeof module.wallImpactStatus?.status==='string'&&
      module.wallImpactStatus.status.length>0&&
      Math.max(0,Number(module.wallImpactStatus.duration)||0)>0
    )return true;
    if(
      module.type==='status.apply'&&
      typeof module.status==='string'&&
      module.status.length>0
    )return true;
    if(
      module.type==='movement.pull'&&
      module.target==='hit-target'
    )return true;
    return false;
  },
  validate(module){
    return Number(module?.windup)===this.requiredWindup&&(
      this.isCcModule(module?.cc)||
      !!String(module?.ccRefAttackId||'')
    );
  },
  referencedCc(source,module){
    const attackId=String(module?.ccRefAttackId||'');
    if(!source||!attackId)return null;
    const attack=AbilityService.attackById(
      source.character,
      attackId
    );
    if(!attack)return null;
    return (attack.modules||[]).find(candidate=>
      this.isCcModule(candidate)
    )||null;
  },
  chargeDuration(windup){
    return Math.max(
      1,
      Number(windup?.charge?.duration)||this.requiredWindup
    );
  },
  chargeProgress(windup,now=performance.now()){
    if(!windup?.charge)return 0;
    if(windup.lockedChargeProgress!==null&&windup.lockedChargeProgress!==undefined&&Number.isFinite(Number(windup.lockedChargeProgress))){
      return Math.max(0,Math.min(1,Number(windup.lockedChargeProgress)));
    }
    const duration=this.chargeDuration(windup);
    const sampledNow=Number(now);
    return Math.max(0,Math.min(1,(sampledNow-Number(windup.startedAt))/duration));
  },
  lerpChargeValue(from,to,progress){
    const a=Number(from);
    const b=Number(to);
    return Number.isFinite(a)&&Number.isFinite(b)
      ?a+(b-a)*progress
      :Number.isFinite(b)?b:a;
  },
  chargeValues(windup,now=performance.now(),progressOverride=null){
    const base=windup?.attack;
    const charge=windup?.charge;
    if(!base||!charge){
      return {
        range:Math.max(0,Number(base?.range)||0),
        spread:AttackModuleService.spread(base)
      };
    }

    const hasProgressOverride=
      progressOverride!==null&&
      progressOverride!==undefined&&
      Number.isFinite(Number(progressOverride));
    const progress=hasProgressOverride
      ?Math.max(0,Math.min(1,Number(progressOverride)))
      :this.chargeProgress(windup,now);
    const rangeSpec=charge.range||{};
    const spreadSpec=charge.spread||{};
    const speedSpec=charge.projectileSpeed||{};
    const baseSpread=AttackModuleService.spread(base);
    const baseProjectile=AttackModuleService.projectile(base);

    return {
      range:Math.max(0,this.lerpChargeValue(
        rangeSpec.from??base.range,
        rangeSpec.to??base.range,
        progress
      )),
      spread:Math.max(0,this.lerpChargeValue(
        spreadSpec.from??baseSpread,
        spreadSpec.to??baseSpread,
        progress
      )),
      projectileSpeed:Math.max(0,this.lerpChargeValue(
        speedSpec.from??baseProjectile?.speed??0,
        speedSpec.to??baseProjectile?.speed??0,
        progress
      ))
    };
  },
  createPreviewAttack(windup){
    const base=windup?.previewResolvedAttack||windup?.attack;
    if(!base||!windup?.charge)return base;

    const modules=(base.modules||[]).map(module=>{
      const type=AttackModuleService.type(module);
      if(type==='pattern.scatter'||type==='delivery.projectile'||type==='delivery.range-projectile')return {...module};
      return module;
    });
    return {...base,modules};
  },
  updatePreviewAttack(windup,now=performance.now()){
    const preview=windup?.previewAttack;
    if(!preview||!windup?.charge)return windup?.previewResolvedAttack||windup?.attack||preview;

    const values=this.chargeValues(windup,now);
    preview.range=values.range;
    const scatter=AttackModuleService.module(preview,'pattern.scatter');
    if(scatter)scatter.spread=values.spread;
    const projectile=AttackModuleService.module(preview,'delivery.projectile')||AttackModuleService.module(preview,'delivery.range-projectile');
    if(projectile&&Number.isFinite(values.projectileSpeed))projectile.speed=values.projectileSpeed;
    return preview;
  },
  chargedAttack(windup,now=performance.now()){
    const base=windup?.attack;
    if(!base||!windup?.charge)return base;

    const values=windup.lockedChargeValues||this.chargeValues(windup,now);
    const modules=(base.modules||[]).map(module=>{
      const type=AttackModuleService.type(module);
      if(type==='pattern.scatter')return Object.freeze({...module,spread:values.spread});
      if(type==='delivery.projectile'||type==='delivery.range-projectile')return Object.freeze({...module,speed:values.projectileSpeed});
      return module;
    });
    return Object.freeze({
      ...base,
      range:values.range,
      modules:Object.freeze(modules)
    });
  },
  targetPointPreviewAttack(windup){
    const area=windup?.previewTargetPointArea;
    const point=windup?.targetPoint;
    if(
      !area||
      !point||
      !Number.isFinite(Number(point.x))||
      !Number.isFinite(Number(point.y))
    )return null;

    const range=Math.max(0,Number(area.range)||0);
    return {
      id:`counter-target-preview:${String(windup.abilityId||'')}`,
      damageRatio:0,
      cost:0,
      cd:0,
      range,
      effectsOnly:true,
      presentation:{
        color:
          area.color||
          windup?.attack?.presentation?.color||
          null
      },
      modules:[
        {
          type:'delivery.area',
          shape:String(area.shape||'circle'),
          range,
          wallPolicy:String(area.wallPolicy||'block'),
          centerPoint:{
            x:Number(point.x),
            y:Number(point.y)
          }
        }
      ],
      tags:['미리보기']
    };
  },
  aimTargetPoint(source){
    if(!source)return null;

    if(
      EntitySimulationAuthorityService.isLocal(source)&&
      typeof Training!=='undefined'&&
      Training.active&&
      typeof Training.mouseWorld==='function'
    ){
      const point=Training.mouseWorld();
      if(
        Number.isFinite(Number(point?.x))&&
        Number.isFinite(Number(point?.y))
      ){
        return {
          x:Number(point.x),
          y:Number(point.y)
        };
      }
    }

    if(
      Number.isFinite(Number(source._remoteAimTargetPoint?.x))&&
      Number.isFinite(Number(source._remoteAimTargetPoint?.y))
    ){
      return {
        x:Number(source._remoteAimTargetPoint.x),
        y:Number(source._remoteAimTargetPoint.y)
      };
    }

    return null;
  },
  execute(context,module){
    if(!this.validate(module)){
      console.error('반격 모듈 규칙 위반:',context.ability?.id,module);
      return false;
    }

    const source=context.source;

    // 이미 선딜 중인 반격은 재입력으로 시작 시각/종료 시각을 절대 갱신하지 않는다.
    if(source.counterWindup)return false;
    if(!AttackService.canUse(source,context.attack))return false;
    const now=performance.now();
    const resolvedAttack=ProgressScaledAttackService.resolve(source,context.attack);
    const baseCc=
      this.referencedCc(source,module)||
      module.cc;
    const resolvedCc=ProgressScaledAttackService.counterCc(resolvedAttack,baseCc);
    const counterKind=
      CounterStockService.peekKind(
        source,
        now
      );
    const alternate=
      module.alternateWhen||null;
    const alternateKindMatched=
      !alternate?.counterKind||
      String(alternate.counterKind)===
        counterKind;
    const alternateConditionsMatched=
      !Array.isArray(alternate?.conditions)||
      TriggerModuleService.matches(
        {
          type:'trigger',
          event:'counter.preview',
          conditions:alternate.conditions
        },
        'counter.preview',
        {source,now,counterKind}
      );
    const alternateSelected=
      !!(
        alternate?.attackId&&
        alternateKindMatched&&
        alternateConditionsMatched
      );

    if(module.consumeState==='counter-ready'){
      CounterStockService.consume(source,now);
    }

    const chargeDuration=Math.min(
      this.requiredWindup,
      Math.max(
        1,
        Number(module.charge?.duration)||this.requiredWindup
      )
    );
    const chargeHoldDuration=Math.max(
      0,
      Number(module.charge?.holdDuration)||0
    );

    source.counterWindup={
      abilityId:context.ability.id,
      startedCharacterId:
        String(source.character?.id||''),
      attack:resolvedAttack,
      charge:module.charge||null,
      previewAttack:null,
      previewProjectiles:Array.isArray(module.preview?.projectiles)?module.preview.projectiles.map(item=>({...item})):[],
      previewHideAttackShape:module.preview?.hideAttackShape===true,
      previewTargetPointArea:
        module.preview?.targetPointArea&&
        typeof module.preview.targetPointArea==='object'
          ?{...module.preview.targetPointArea}
          :null,
      cc:resolvedCc,
      selfModifiers:Array.isArray(module.selfModifiers)?module.selfModifiers:[],
      alternateWhen:
        module.alternateWhen||null,
      counterKind,
      alternateSelected,
      followUpAttacks:
        Array.isArray(module.followUpAttacks)
          ?module.followUpAttacks.map(item=>({...item}))
          :[],
      onFinishModules:
        Array.isArray(module.onFinishModules)
          ?module.onFinishModules.map(item=>({...item}))
          :[],
      startedAt:now,
      chargeEndsAt:now+chargeDuration,
      completeHoldUntil:Math.min(
        now+this.requiredWindup,
        now+chargeDuration+chargeHoldDuration
      ),
      endsAt:now+this.requiredWindup,
      releasedAt:null,
      lockedChargeProgress:null,
      lockedChargeValues:null,
      releaseRequested:false,
      holding:true,
      angle:context.angle,
      targetPointMode:String(module.targetPointMode||''),
      targetPoint:
        String(module.targetPointMode||'')==='aim-point'
          ?(
            (
              context.targetPoint&&
              Number.isFinite(Number(context.targetPoint.x))&&
              Number.isFinite(Number(context.targetPoint.y))
            )
              ?{
                x:Number(context.targetPoint.x),
                y:Number(context.targetPoint.y)
              }
              :this.aimTargetPoint(source)
          )
          :null
    };

    if(alternateSelected){
      source.counterWindup.previewResolvedAttack=
        AbilityService.attackById(
          source.character,
          module.alternateWhen.attackId
        )||resolvedAttack;
    }else{
      source.counterWindup.previewResolvedAttack=resolvedAttack;
    }

    source.counterWindup.previewAttack=
      this.createPreviewAttack(source.counterWindup);

    if(context.attack?.progressScale?.consumeOnCounterStart===true){
      ProgressStateService.apply(source,{type:'state.progress',stateKey:context.attack.progressScale.stateKey,operation:'reset'});
    }

    {
      const targetPreviewAttack=
        this.targetPointPreviewAttack(
          source.counterWindup
        );
      const previewAttack=
        targetPreviewAttack||
        (
          source.counterWindup.previewHideAttackShape
            ?null
            :this.updatePreviewAttack(
              source.counterWindup,
              now
            )
        );
      source.attackPreview=
        previewAttack
          ?AttackPreviewService.fromAttack(
            source,
            previewAttack,
            context.angle,
            now+this.requiredWindup,
            null,
            {
              targetPoint:
                source.counterWindup.targetPoint
            }
          )
          :null;
    }

    source.abilityPending.set(context.ability.id,source.counterWindup.endsAt);
    GameEvents.emit('ability-telegraph',context);
    if(
      EntitySimulationAuthorityService
        .isLocal(source)
    ){
      AugmentEffectModuleService.runTrigger(
        source,
        'counter-windup-started',
        {
          source,
          target:source,
          attack:resolvedAttack,
          angle:context.angle,
          now
        }
      );
      GameEvents.emit(
        'counter-windup-started',
        {
          source,
          attack:resolvedAttack,
          angle:context.angle,
          now
        }
      );
    }
    return true;
  },
  trackAim(source,resolveAim){
    const windup=source?.counterWindup;
    if(!windup)return false;

    const angle=Number(resolveAim?.());
    if(Number.isFinite(angle)){
      windup.angle=angle;
    }

    if(windup.targetPointMode==='aim-point'){
      const point=this.aimTargetPoint(source);
      if(point)windup.targetPoint=point;
    }

    {
      const targetPreviewAttack=
        this.targetPointPreviewAttack(
          windup
        );
      const previewAttack=
        targetPreviewAttack||
        (
          windup.previewHideAttackShape
            ?null
            :this.updatePreviewAttack(
              windup,
              performance.now()
            )
        );
      source.attackPreview=
        previewAttack
          ?AttackPreviewService.fromAttack(
            source,
            previewAttack,
            windup.angle,
            windup.endsAt,
            source.attackPreview||null,
            {
              targetPoint:windup.targetPoint
            }
          )
          :null;
    }

    return true;
  },
  drawProjectilePreviews(ctx,source,now=performance.now()){
    const windup=source?.counterWindup;
    if(!ctx||!windup||!Array.isArray(windup.previewProjectiles)||!windup.previewProjectiles.length)return false;
    let drawn=false;
    for(const ref of windup.previewProjectiles){
      const stateKey=String(ref.stateKey||'');
      let projectile=ProjectileStateService.get(
        source,
        stateKey
      );
      if(!projectile){
        projectile=
          ProjectileService.items.find(item=>
            item?.source===source&&
            (
              String(item.stateKey||'')===stateKey||
              String(item.behavior?.returning?.stateKey||'')===stateKey
            )
          )||null;
      }
      if(!projectile)continue;
      const attack=AbilityService.attackById(source.character,String(ref.attackId||''));
      if(!attack)continue;
      const anchor=Object.create(source);
      anchor.x=Number(projectile.x)||0;
      anchor.y=Number(projectile.y)||0;
      anchor.radius=Number(source.radius)||20;
      const preview=AttackPreviewService.fromAttack(anchor,attack,windup.angle,windup.endsAt);
      if(!preview)continue;
      TrainingWorldDrawService.drawAttackPreview(ctx,anchor,preview,now);
      drawn=true;
    }
    return drawn;
  },
  requestRelease(source,angle=null,now=performance.now(),deferFinish=false){
    const windup=source?.counterWindup;
    if(!windup||windup.charge?.lockOnRelease!==true)return false;

    const resolvedAngle=Number(angle);
    if(Number.isFinite(resolvedAngle))windup.angle=resolvedAngle;

    if(windup.lockedChargeProgress===null||windup.lockedChargeProgress===undefined||!Number.isFinite(Number(windup.lockedChargeProgress))){
      const sampledAt=Math.min(
        Number(windup.chargeEndsAt)||Number(windup.endsAt)||Number(now)||performance.now(),
        Number(now)||performance.now()
      );
      const duration=this.chargeDuration(windup);
      const lockedProgress=Math.max(
        0,
        Math.min(1,(sampledAt-Number(windup.startedAt))/duration)
      );
      windup.releasedAt=sampledAt;
      windup.lockedChargeProgress=lockedProgress;
      windup.lockedChargeValues=this.chargeValues(
        windup,
        sampledAt,
        lockedProgress
      );
    }
    windup.holding=false;
    windup.releaseRequested=true;

    // 릴리스는 발사 트리거가 아니라 현재 차징률을 잠그는 입력이다.
    // 실제 반격은 모든 캐릭터와 동일하게 0.3초 선딜 종료 시 한 번만 발동한다.
    return true;
  },
  executeFollowUp(source,followUp,angle=0){
    if(
      !source?.alive||
      !followUp||
      !EntitySimulationAuthorityService.isLocal(source)
    )return false;

    const attackId=String(followUp.attackId||'');
    const baseAttack=AbilityService.attackById(source.character,attackId);
    if(!baseAttack)return false;

    const now=performance.now();
    let attack=AugmentService.prepareAttack(source,baseAttack,now);
    let targetPoint=null;

    const projectileStateKey=String(followUp.projectileStateKey||'');
    if(projectileStateKey){
      let projectile=
        ProjectileStateService.get(
          source,
          projectileStateKey
        );

      if(!projectile){
        projectile=
          ProjectileService.items.find(item=>
            item?.source===source&&
            (
              String(item.stateKey||'')===projectileStateKey||
              String(item.behavior?.returning?.stateKey||'')===projectileStateKey
            )
          )||null;
      }

      if(projectile){
        targetPoint={
          x:Number(projectile.x)||0,
          y:Number(projectile.y)||0
        };
      }
    }

    if(!targetPoint&&followUp.fallbackToSource!==false){
      targetPoint={
        x:Number(source.x)||0,
        y:Number(source.y)||0
      };
    }

    if(targetPoint){
      attack={
        ...attack,
        modules:Object.freeze((attack.modules||[]).map(item=>{
          const type=AttackModuleService.type(item);

          if(type==='delivery.area'){
            return Object.freeze({
              ...item,
              centerPoint:Object.freeze({...targetPoint})
            });
          }

          if(type==='effect.spawn'){
            const damageArea=
              item.damage?.module&&
              AttackModuleService.type(item.damage.module)==='delivery.area'
                ?Object.freeze({
                  ...item.damage.module,
                  centerPoint:Object.freeze({...targetPoint})
                })
                :item.damage?.module;

            return Object.freeze({
              ...item,
              position:'attack-center',
              damage:item.damage
                ?Object.freeze({
                  ...item.damage,
                  module:damageArea
                })
                :item.damage
            });
          }

          return item;
        }))
      };
    }

    return TriggeredAttackService.execute(
      source,
      attack,
      Number(angle)||0,
      {
        targetPoint,
        broadcast:true
      }
    );
  },
  scheduleFollowUps(source,followUps,angle=0){
    if(
      !source||
      !Array.isArray(followUps)||
      !followUps.length||
      !EntitySimulationAuthorityService.isLocal(source)
    )return false;

    for(const followUp of followUps){
      const delay=Math.max(0,Number(followUp?.delay)||0);
      SimulationScheduleService.scheduleContinuation({source,at:performance.now()+delay,continue:()=>{
        this.executeFollowUp(
          source,
          followUp,
          angle
        );
      }});
    }
    return true;
  },
  currentCounterBinding(source,windup,now=performance.now()){
    if(!source?.character)return null;

    const ability=
      source.character.abilities?.counter||
      null;
    if(!ability)return null;

    const module=
      (ability.trigger?.modules||[])
        .find(item=>
          item?.type==='counter.execute'
        )||
      null;
    if(!module)return null;

    const baseAttack=
      AbilityService.attackById(
        source.character,
        String(ability.attackId||'')
      );
    if(!baseAttack)return null;

    let attack=
      ProgressScaledAttackService.resolve(
        source,
        baseAttack
      );

    let cc=
      ProgressScaledAttackService.counterCc(
        attack,
        this.referencedCc(source,module)||
        module.cc
      );

    const counterKind=
      windup?.counterKind||
      CounterStockService.peekKind(
        source,
        now
      );
    const alternate=
      module.alternateWhen||null;
    const kindMatched=
      !alternate?.counterKind||
      String(alternate.counterKind)===
        String(counterKind||'');
    const conditionsMatched=
      !Array.isArray(alternate?.conditions)||
      TriggerModuleService.matches(
        {
          type:'trigger',
          event:'counter.finish',
          conditions:alternate.conditions
        },
        'counter.finish',
        {source,now,counterKind}
      );

    if(
      alternate?.attackId&&
      kindMatched&&
      conditionsMatched
    ){
      const alternateAttack=
        AbilityService.attackById(
          source.character,
          String(alternate.attackId)
        );
      if(alternateAttack){
        attack=
          ProgressScaledAttackService.resolve(
            source,
            alternateAttack
          );
        if(
          alternate.cc&&
          typeof alternate.cc==='object'
        ){
          cc=
            ProgressScaledAttackService.counterCc(
              attack,
              alternate.cc
            );
        }
      }
    }

    return {
      ability,
      module,
      attack,
      cc,
      followUpAttacks:
        Array.isArray(module.followUpAttacks)
          ?module.followUpAttacks.map(item=>({...item}))
          :[],
      onFinishModules:
        Array.isArray(module.onFinishModules)
          ?module.onFinishModules.map(item=>({...item}))
          :[],
      selfModifiers:
        Array.isArray(module.selfModifiers)
          ?module.selfModifiers
          :[]
    };
  },
  finish(source,angle=null){
    const windup=source?.counterWindup;
    if(!windup||!source.alive)return false;

    const resolvedAngle=Number(angle);
    if(Number.isFinite(resolvedAngle)){
      windup.angle=resolvedAngle;
    }

    const now=performance.now();
    const characterChanged=
      String(windup.startedCharacterId||'')!==
      String(source.character?.id||'');

    const currentBinding=
      characterChanged
        ?this.currentCounterBinding(
          source,
          windup,
          now
        )
        :null;

    let chargedAttack=
      currentBinding?.attack||
      this.chargedAttack(
        windup,
        now
      );
    let resolvedCounterCc=
      currentBinding?.cc||
      windup.cc;

    if(!currentBinding){
      const alternate=
        windup.alternateWhen;
      if(
        windup.alternateSelected===true&&
        alternate?.attackId
      ){
        chargedAttack=
          AbilityService.attackById(
            source.character,
            alternate.attackId
          )||
          chargedAttack;

        if(
          alternate.cc&&
          typeof alternate.cc==='object'
        ){
          resolvedCounterCc=
            ProgressScaledAttackService.counterCc(
              chargedAttack,
              alternate.cc
            );
        }
      }
    }

    const followUpAttacks=
      currentBinding?.followUpAttacks||
      (
        Array.isArray(windup.followUpAttacks)
          ?windup.followUpAttacks.map(item=>({...item}))
          :[]
      );
    const finishModules=
      currentBinding?.onFinishModules||
      windup.onFinishModules||
      [];
    const selfModifiers=
      currentBinding?.selfModifiers||
      windup.selfModifiers||
      [];
    const finishAbilityId=
      String(
        currentBinding?.ability?.id||
        windup.abilityId||
        ''
      );

    source.abilityPending.delete(windup.abilityId);
    source.counterWindup=null;
    source.attackPreview=null;

    AttackService.execute(
      source,
      chargedAttack,
      windup.angle,
      {
        extraModules:resolvedCounterCc?[resolvedCounterCc]:[],
        targetPoint:
          windup.targetPoint&&
          Number.isFinite(Number(windup.targetPoint.x))&&
          Number.isFinite(Number(windup.targetPoint.y))
            ?{
              x:Number(windup.targetPoint.x),
              y:Number(windup.targetPoint.y)
            }
            :null,
        broadcastTriggeredAttack:
          source.kind==='summon'&&
          EntitySimulationAuthorityService.isLocal(source)
      }
    );

    this.scheduleFollowUps(
      source,
      followUpAttacks,
      windup.angle
    );

    if(
      Array.isArray(finishModules)&&
      finishModules.length
    ){
      AbilityModuleService.run({
        source,
        ability:{id:finishAbilityId},
        attack:chargedAttack,
        trigger:{
          modules:finishModules
        },
        angle:windup.angle,
        now:performance.now(),
        event:'counter.finish',
        handled:false,
        executed:true,
        usageTags:new Set(
          TagService.attackTags(
            chargedAttack
          )
        )
      });
    }

    for(const modifier of selfModifiers){
      const stat=String(modifier?.stat||'');
      if(!COMBAT_BUFF_DEFS[stat])continue;
      BuffService.set(
        source,
        stat,
        Number(modifier.value)||0,
        String(modifier.sourceId||`counter:${finishAbilityId}:${stat}`),
        Number.isFinite(Number(modifier.duration))
          ?Math.max(0,Number(modifier.duration)||0)
          :Infinity,
        {sourceEntityId:source.id}
      );
    }

    GameEvents.emit('ability-finished',{
      source,
      attack:chargedAttack,
      angle:windup.angle
    });
    return true;
  },
  drawCharge(ctx,source,now=performance.now()){
    const windup=source?.counterWindup;
    if(!ctx||!windup?.charge?.gauge)return false;

    const progress=this.chargeProgress(windup,now);
    const baseRadius=Number(source.radius)||20;
    const inCompleteHold=
      progress>=1&&
      Number(now)>=Number(windup.chargeEndsAt)&&
      Number(now)<Number(windup.completeHoldUntil||windup.endsAt);

    return ArcGaugePresentationService.render(
      ctx,
      source,
      progress,
      {
        color:source.color,
        lineWidth:3,
        lineCap:'butt',
        radius:baseRadius+8,
        showEmpty:true,
        maxChargeFlash:inCompleteHold,
        completePulseRadius:EntityRingLayoutService.maxChargeFlashRadius(
          source,
          now
        )
      }
    );
  },
  update(source,now,resolveAim){
    const debugModes=
      source?.character?.debugCounterModes;
    if(Array.isArray(debugModes)&&debugModes.length){
      const activeMode=
        debugModes.find(mode=>
          source?.debugControl?.[
            String(mode.flag||'')
          ]===true
        )||null;
      if(activeMode){
        CounterStockService.setDebugKind(
          source,
          String(activeMode.kind||'normal')
        );
      }
    }else if(source?.debugControl?.counterActive){
      CounterStockService.setDebugKind(
        source,
        'normal'
      );
    }

    const windup=source?.counterWindup;
    if(!windup)return false;

    this.trackAim(source,resolveAim);

    this.completionTrigger.conditions[0].at=
      windup.endsAt;

    if(!TriggerModuleService.matches(
      this.completionTrigger,
      'time.update',
      {source,now}
    ))return true;

    return !this.finish(source,windup.angle);
  }
});