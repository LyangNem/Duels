


/* effect.spawn: 모든 게임 월드 시각 이펙트의 단일 생성 진입점.
   animation:true이면 같은 animationState를 렌더 좌표와 피해 판정이 공유한다. */
/* 이동 방식과 무관한 '이동기 사용 중' 공통 상태 판정.
   고정 방향 forcedMotion과 WASD controlled movement가 같은 게임 규칙을 공유한다. */


const EffectSpawnService=Object.freeze({
  shouldPresentAttack(source,context={}){
    // 공격의 시각 효과는 공격자 화면에서 만들고 effect-spawn으로만 복제한다.
    // 지연/파생 실행이 replay 플래그를 잃어도 원격 소유자가 다시 만들지 않는다.
    return context.networkReplay!==true&&!(
      Training.sessionMode==='online'&&
      OnlineDuelService.active&&
      !EntitySimulationAuthorityService.isLocal(source)
    );
  },
  keyed:new Map(),
  presets:Object.freeze({
    'under-move':Object.freeze({
      type:'underMove',
      dur:400,
      range:33,
      innerRadius:15,
      lineWidth:2.5,
      dash:Object.freeze([5,4])
    })
  }),
  resolve(spec={}){
    const preset=spec.preset?this.presets[String(spec.preset)]||null:null;
    const resolved={...(preset||{}),...(spec||{})};
    if(resolved.type==='effect.spawn'){
      resolved.type=
        spec.renderType||
        preset?.type||
        'effectShape';
    }
    return resolved;
  },
  networkClone(value,depth=0){
    if(depth>10)return null;
    if(
      value===null||
      typeof value==='string'||
      typeof value==='number'||
      typeof value==='boolean'
    ){
      return value;
    }

    if(Array.isArray(value)){
      return value
        .map(item=>this.networkClone(item,depth+1))
        .filter(item=>item!==undefined);
    }

    if(typeof value!=='object')return undefined;

    const result={};
    for(const [key,item] of Object.entries(value)){
      if(
        key==='animationState'||
        key==='rangeTransition'||
        key==='rangeSampleAt'||
        key==='projectileRef'||
        key==='fieldStateRef'||
        key==='execution'||
        key==='attack'
      )continue;

      const cloned=this.networkClone(
        item,
        depth+1
      );
      if(cloned!==undefined)result[key]=cloned;
    }
    return result;
  },
  definitionSnapshot(spec={}){
    return this.networkClone(spec)||{};
  },
  resolvedSnapshot(spec={}){
    return this.networkClone(
      this.resolve(spec)
    )||{};
  },
  presentationSnapshot(effect,now=performance.now()){
    const snapshot=
      this.networkClone(effect)||{};
    const start=
      Number.isFinite(Number(effect?.start))
        ?Number(effect.start)
        :now;

    // performance.now()의 절대값은 클라이언트마다 기준점이 다르므로 보내지 않는다.
    // 같은 효과의 시작 상대시점만 보존해 수신 측의 로컬 clock으로 복원한다.
    snapshot.startOffsetMs=start-now;
    delete snapshot.start;
    delete snapshot.effectKey;
    return snapshot;
  },
  restorePresentationSnapshot(snapshot,now=performance.now()){
    const restored=
      this.networkClone(snapshot)||{};
    const offset=
      Number.isFinite(Number(restored.startOffsetMs))
        ?Number(restored.startOffsetMs)
        :0;

    delete restored.startOffsetMs;
    restored.start=now+offset;
    return restored;
  },
  removeKey(key){
    const target=String(key||'');
    if(!target)return false;

    const effect=this.keyed.get(target)||null;
    if(!effect)return false;

    this.keyed.delete(target);
    const index=Training.fx.indexOf(effect);
    if(index>=0){
      Training.fx.splice(index,1);
    }
    return true;
  },
  getByKey(key){
    const target=String(key||'');
    if(!target)return null;
    return this.keyed.get(target)||null;
  },
  clearAll(){
    Training.fx.length=0;
    this.keyed.clear();
    if(typeof ModeGearPresentationService!=='undefined')ModeGearPresentationService.clearDeathRemnants();
    return true;
  },
  compact(now=performance.now()){
    this.update(now);

    let write=0;
    for(let read=0;read<Training.fx.length;read++){
      const effect=Training.fx[read];
      if(now-effect.start>=effect.dur){
        if(
          effect.effectKey&&
          this.keyed.get(effect.effectKey)===effect
        ){
          this.keyed.delete(effect.effectKey);
        }
        continue;
      }
      Training.fx[write++]=effect;
    }
    Training.fx.length=write;
    return write;
  },

  spawn(spec={},context={}){
    if(!Training.active||!spec)return null;
    const r=this.resolve(spec);
    const sourceColor=
      context.source?.color||
      context.source?.character?.color||
      '#ee00ff';
    for(const property of [
      'color',
      'fillColor',
      'strokeColor',
      'hitColor',
      'edgeColor'
    ]){
      if(r[property]==='character'){
        r[property]=sourceColor;
      }
    }
    const now=Number.isFinite(Number(r.start))?Number(r.start):performance.now();
    const key=r.key?String(r.key):null;

    if(key){
      const existing=this.keyed.get(key)||null;
      if(existing){
        const preserveTimeline=
          r.preserveTimeline===true;
        const sampleAt=Number.isFinite(r.rangeSampleAt)?r.rangeSampleAt:performance.now();
        const visibleRange=this.presentationRange(existing,sampleAt);
        const targetRange=Math.max(0,Number(r.range)||0);
        const interpolationMs=Math.max(0,Number(r.rangeInterpolationMs)||0);
        const rangeTransition=interpolationMs>0&&targetRange>visibleRange
          ?{from:visibleRange,to:targetRange,start:sampleAt,duration:interpolationMs}
          :null;
        const existingStart=existing.start;
        const existingDur=existing.dur;

        Object.assign(existing,r,{
          effectKey:key,
          followSourceX:
            r.followSource===true
              ?Number(context.source?.x)||
                Number(
                  EntityService.items.get(
                    String(r.sourceEntityId||existing.sourceEntityId||'')
                  )?.x
                )||
                Number(existing.x)||
                0
              :undefined,
          followSourceY:
            r.followSource===true
              ?Number(context.source?.y)||
                Number(
                  EntityService.items.get(
                    String(r.sourceEntityId||existing.sourceEntityId||'')
                  )?.y
                )||
                Number(existing.y)||
                0
              :undefined,
          start:preserveTimeline
            ?existingStart
            :now,
          dur:preserveTimeline
            ?existingDur
            :Math.max(
              GAME_DATA.frameMs,
              Number(r.dur)||
              Number(r.duration)||
              GAME_DATA.frameMs
            )
        });
        existing.rangeTransition=rangeTransition;
        this.initAnimation(existing,context);
        this.registerMovementDamage(existing);
        return existing;
      }
    }

    const sourceEntityId=
      r.sourceEntityId||
      context.source?.id||
      null;
    const sourceEntity=
      context.source||
      EntityService.items.get(
        String(sourceEntityId||'')
      )||
      null;
    const effect={
      ...r,
      effectKey:key,
      start:now,
      dur:Math.max(GAME_DATA.frameMs,Number(r.dur)||Number(r.duration)||GAME_DATA.frameMs),
      sourceEntityId,
      followSourceX:
        r.followSource===true
          ?Number(sourceEntity?.x)||Number(r.x)||0
          :undefined,
      followSourceY:
        r.followSource===true
          ?Number(sourceEntity?.y)||Number(r.y)||0
          :undefined
    };
    if(effect.type==='weaponImageEcho'&&typeof ModeGearPresentationService!=='undefined'){const ownerId=effect.targetEntityId||sourceEntityId;const owner=EntityService.items.get(String(ownerId))||(context.source?.id===ownerId?context.source:null);ModeGearPresentationService.echo(owner,effect.start,effect.dur,Number(effect.expansion)||.55,effect.imageAlpha??null,effect.imageConfig??null,{x:effect.x,y:effect.y},effect.imageColor??null);}
    if(effect.type==='weaponImagePulse'&&typeof ModeGearPresentationService!=='undefined')ModeGearPresentationService.react(effect.targetEntityId||sourceEntityId,effect.start,effect.dur,Number(effect.strength)||.16);
    this.initAnimation(effect,context);
    this.registerMovementDamage(effect);
    Training.fx.push(effect);
    if(key)this.keyed.set(key,effect);
    return effect;
  },
  presentationRange(effect,now=performance.now()){
    const target=Math.max(0,Number(effect?.range)||0);
    const transition=effect?.rangeTransition;
    if(!transition)return target;
    const progress=Math.max(0,Math.min(1,(now-transition.start)/transition.duration));
    // 다음 패킷을 추측해 연장하지 않는다. 방어 확정은 spawn에서 전환을 제거한다.
    return Math.min(target,transition.from+(transition.to-transition.from)*progress);
  },
  initAnimation(effect,context={}){
    if(effect.animation!==true&&typeof effect.animation!=='object'){
      delete effect.animationState;
      return effect;
    }
    const a=effect.animation===true?{}:effect.animation;
    const source=context.source||EntityService.items.get(effect.sourceEntityId)||null;
    const x=Number.isFinite(Number(effect.x))?Number(effect.x):Number(source?.x)||0;
    const y=Number.isFinite(Number(effect.y))?Number(effect.y):Number(source?.y)||0;
    effect.animationState={
      fromX:Number.isFinite(Number(a.fromX))?Number(a.fromX):x,
      fromY:Number.isFinite(Number(a.fromY))?Number(a.fromY):y,
      toX:Number.isFinite(Number(a.toX))?Number(a.toX):x,
      toY:Number.isFinite(Number(a.toY))?Number(a.toY):y,
      fromAngle:Number.isFinite(Number(a.fromAngle))?Number(a.fromAngle):(Number(effect.angle)||0),
      toAngle:Number.isFinite(Number(a.toAngle))?Number(a.toAngle):(Number(effect.angle)||0),
      fromScale:Number.isFinite(Number(a.fromScale))?Number(a.fromScale):1,
      toScale:Number.isFinite(Number(a.toScale))?Number(a.toScale):1,
      easing:String(a.easing||'linear'),
      previousX:x,
      previousY:y,
      previousProgress:0,
      movementDamagePreviousX:
        Number(source?.x)||x,
      movementDamagePreviousY:
        Number(source?.y)||y,
      movementDamageExecutionValidated:false,
      movementDamageFinished:false,
      movementDamageTargetPreviousPoints:new WeakMap(),
      attack:null,
      execution:null
    };
    const damage=effect.damage;
    if(damage&&source){
      const attack=
        damage.attack||
        (damage.attackId&&source.character
          ?AbilityService.attackById(source.character,damage.attackId)
          :null);
      if(attack){
        effect.animationState.attack=attack;
        effect.animationState.execution=
          AttackExecutionService.create(
            source,
            attack,
            Number(effect.angle)||0,
            Array.isArray(damage.extraModules)
              ?damage.extraModules
              :null
          );

        if(damage.requireMovementExecution===true){
          const movement=
            MovementAbilityService.state(
              source,
              String(
                damage.movementStateKey||
                'movement:move'
              )
            );
          effect.animationState.movementDamageExecutionValidated=
            !!(
              movement&&
              Math.max(
                0,
                Number(movement.executionSequence)||0
              )===
              Math.max(
                0,
                Number(damage.movementExecutionSequence)||0
              )
            );
        }
      }
    }
    return effect;
  },
  ease(t,type){
    if(type==='ease-in')return t*t;
    if(type==='ease-out')return 1-(1-t)*(1-t);
    if(type==='ease-in-out')return t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
    return t;
  },
  normalizeAnglePositive(angle){
    let value=Number(angle)||0;
    const tau=Math.PI*2;
    value%=tau;
    if(value<0)value+=tau;
    return value;
  },
  effectDamageTarget(effect,target,impactPoint){
    const state=effect?.animationState;
    const source=EntityService.items.get(effect?.sourceEntityId)||null;
    if(!state?.attack||!state.execution||!source||!target?.alive)return false;
    if(
      effect.damage?.oncePerExecution!==false&&
      state.execution.hitTargets.has(target.id)
    )return false;

    const effectOrigin={
      mode:'point',
      x:Number(effect.x)||0,
      y:Number(effect.y)||0
    };
    AttackExecutionService.setImpactOrigin(
      state.execution,
      effectOrigin
    );
    AttackExecutionService.setKoOrigin(
      state.execution,
      effectOrigin
    );

    const result=AttackHitTriggerService.damage({
      source,
      target,
      attack:state.attack,
      execution:state.execution,
      impact:{
        type:'effect-animation',
        shape:String(effect.damage?.hitMode||'progressive'),
        contactOnly:effect.damage?.contactOnly===true,
        suppressHitImpactRing:effect.damage?.suppressHitImpactRing===true,
        origin:{x:Number(effect.x)||0,y:Number(effect.y)||0},
        point:impactPoint||{x:Number(effect.x)||0,y:Number(effect.y)||0}
      }
    });

    if(result.hit||result.blocked||result.durabilityBlocked){state.deliveryHadContact=true;}

    if(
      result.durabilityBlocked===true&&
      result.authoritative!==false&&
      !result.duplicateExecutionHit
    ){
      // 진행형 effect-animation도 스패너에 완전 흡수된 접촉을
      // 이 실행에서 이미 소비한 것으로 기록한다.
      // 그렇지 않으면 같은 progressRect가 다음 프레임에도 같은 대상을
      // 다시 판정해 내구도를 여러 번 깎고, 조건부 고피해처럼 보일 수 있다.
      if(effect.damage?.oncePerExecution!==false){
        state.execution.hitTargets.add(target.id);
      }
      return true;
    }

    if(
      result.hit&&
      result.authoritative!==false&&
      !result.duplicateExecutionHit
    ){
      state.execution.hitTargets.add(target.id);
      AttackModuleService.onHit(
        source,
        target,
        state.attack,
        {
          execution:state.execution,
          hits:0,
          total:1,
          resolved:0,
          finished:false
        },
        Number(effect.angle)||0
      );
      return true;
    }
    return false;
  },
  applyProgressiveDamage(effect,previousProgress,currentProgress){
    const state=effect?.animationState;
    const source=EntityService.items.get(effect?.sourceEntityId)||null;
    const damage=effect?.damage||{};
    if(!state?.attack||!state.execution||!source)return false;

    const mode=String(damage.hitMode||'');
    if(
      mode!=='annular-sweep'&&
      mode!=='arc-sweep'&&
      mode!=='expanding-ring'&&
      mode!=='progressive-rect'
    )return false;

    const cx=Number(effect.x)||Number(source.x)||0;
    const cy=Number(effect.y)||Number(source.y)||0;
    const module=damage.module||null;
    let hitAny=false;

    if(mode==='progressive-rect'){
      const range=Math.max(
        0,
        Number(module?.range)||
        Number(effect.range)||
        0
      );
      const halfWidth=Math.max(
        0,
        Number(module?.halfWidth)||
        Number(effect.halfWidth)||
        Number(effect.width)/2||
        0
      );
      const growthSpeed=Math.max(
        .001,
        Number(effect.growthSpeed)||
        1
      );
      const previousLength=
        range*
        Math.min(
          1,
          Math.max(0,previousProgress)*growthSpeed
        );
      const currentLength=
        range*
        Math.min(
          1,
          Math.max(0,currentProgress)*growthSpeed
        );
      const angle=Number(effect.angle)||0;
      const cos=Math.cos(angle);
      const sin=Math.sin(angle);

      const projectileClear=damage.projectileClear;
      if(
        projectileClear&&
        EntitySimulationAuthorityService.isLocal(source)
      ){
        const relations=Array.isArray(projectileClear.targetRelations)
          ?projectileClear.targetRelations
          :['enemy'];
        for(let index=ProjectileService.items.length-1;index>=0;index--){
          const projectile=ProjectileService.items[index];
          const relation=RelationService.relation(source,projectile?.source);
          if(!relations.includes(relation))continue;

          const point=ProjectileVisualPositionService.sample(projectile);
          const dx=(Number(point?.x)||Number(projectile.x)||0)-cx;
          const dy=(Number(point?.y)||Number(projectile.y)||0)-cy;
          const along=dx*cos+dy*sin;
          const across=Math.abs(-dx*sin+dy*cos);
          const radius=Math.max(0,Number(projectile.radius)||0);
          if(across>halfWidth+radius)continue;
          if(along+radius<previousLength||along-radius>currentLength)continue;
          if(along+radius<0||along-radius>range)continue;

          AttackGuardService.parryFx(
            source,
            Number(projectile.x)||0,
            Number(projectile.y)||0
          );
          AttackGuardService.broadcastProjectileResolution(projectile,'remove');
          ProjectileService.finish(projectile,projectile.hadHit===true);
          ProjectileService.items.splice(index,1);
          hitAny=true;
        }
      }

      if(damage.projectileClearOnly===true)return hitAny;

      EntityService.forEachEnemy(source,target=>{
        if(
          damage.oncePerExecution!==false&&
          state.execution.hitTargets.has(target.id)
        )return;

        const point=NetworkCollisionPositionService.point(target);
        const dx=point.x-cx;
        const dy=point.y-cy;
        const along=dx*cos+dy*sin;
        const across=Math.abs(-dx*sin+dy*cos);
        const radius=Math.max(0,Number(target.radius)||0);

        if(across>halfWidth+radius)return;
        if(along+radius<previousLength)return;
        if(along-radius>currentLength)return;
        if(along+radius<0||along-radius>range)return;
        if(
          module?.wallPolicy!=='ignore'&&
          WorldGeometryService.segmentBlocked(
            cx,
            cy,
            point.x,
            point.y,
            0
          )
        )return;

        const contactLength=Math.max(
          previousLength,
          Math.min(currentLength,along)
        );
        const impactPoint={
          x:cx+cos*contactLength,
          y:cy+sin*contactLength
        };
        if(this.effectDamageTarget(effect,target,impactPoint))hitAny=true;
      },state.attack);
      if(currentLength>=range&&damage.missAttackId&&!state.deliveryFollowupResolved){
        state.deliveryFollowupResolved=true;
        if(!state.deliveryHadContact&&source.alive&&EntitySimulationAuthorityService.isLocal(source)){
          const followup=AbilityService.attackById(source.character,damage.missAttackId);
          const radius=Math.max(0,Number(followup?.modules?.find(m=>m.type==='delivery.projectile')?.radius)||0);
          const endpoint={x:cx+cos*range,y:cy+sin*range};
          if(followup&&!WorldGeometryService.segmentBlocked(cx,cy,endpoint.x,endpoint.y,radius)){
            const prepared=AugmentService.prepareAttack(source,followup,performance.now());
            TriggeredAttackService.execute(source,{...prepared,modules:prepared.modules.map(m=>m.type==='delivery.projectile'?{...m,origin:{type:'point',...endpoint}}:m)},angle);
          }
        }
      }
      return hitAny;
    }

    if(mode==='arc-sweep'){
      const range=Math.max(0,Number(module?.range)||Number(effect.range)||0);
      const halfAngle=Math.max(0,Number(module?.halfAngle)||Number(effect.halfAngle)||0);
      const angle=(Number(effect.angle)||0)+(Number(effect.angleOffset)||0);
      const speed=Math.max(.001,Number(effect.sweepSpeed)||1);
      const previousSweep=Math.min(1,Math.max(0,previousProgress)*speed);
      const currentSweep=Math.min(1,Math.max(0,currentProgress)*speed);
      const counterclockwise=String(effect.sweepDirection||'clockwise')==='counterclockwise';
      const startAngle=counterclockwise?angle+halfAngle:angle-halfAngle;
      const previousEnd=counterclockwise
        ?startAngle-halfAngle*2*previousSweep
        :startAngle+halfAngle*2*previousSweep;
      const currentEnd=counterclockwise
        ?startAngle-halfAngle*2*currentSweep
        :startAngle+halfAngle*2*currentSweep;

      EntityService.forEachEnemy(source,target=>{
        if(
          damage.oncePerExecution!==false&&
          state.execution.hitTargets.has(target.id)
        )return;
        const point=NetworkCollisionPositionService.point(target);
        const dx=point.x-cx;
        const dy=point.y-cy;
        const distance=Math.hypot(dx,dy);
        const targetRadius=Math.max(0,Number(target.radius)||0);
        if(distance-targetRadius>range)return;
        if(
          module?.wallPolicy!=='ignore'&&
          WorldGeometryService.segmentBlocked(cx,cy,point.x,point.y,0)
        )return;

        const targetAngle=this.normalizeAnglePositive(Math.atan2(dy,dx));
        const normalizedStart=this.normalizeAnglePositive(startAngle);
        const previousDelta=counterclockwise
          ?this.normalizeAnglePositive(normalizedStart-targetAngle)
          :this.normalizeAnglePositive(targetAngle-normalizedStart);
        const previousSpan=Math.abs(previousEnd-startAngle);
        const currentSpan=Math.abs(currentEnd-startAngle);
        const angularSlack=distance>.001
          ?Math.asin(Math.min(1,targetRadius/distance))
          :Math.PI;
        if(previousDelta+angularSlack<previousSpan)return;
        if(previousDelta-angularSlack>currentSpan)return;
        if(this.effectDamageTarget(effect,target,{x:point.x,y:point.y}))hitAny=true;
      },state.attack);
      return hitAny;
    }

    if(mode==='expanding-ring'){
      const startRadius=Number.isFinite(Number(effect.r))?Math.max(0,Number(effect.r)):0;
      const endRadius=Math.max(
        startRadius,
        Number(effect.maxR)||
        Number(module?.range)||
        Number(effect.range)||
        startRadius
      );
      const previousRadius=startRadius+(endRadius-startRadius)*Math.max(0,Math.min(1,previousProgress));
      const currentRadius=startRadius+(endRadius-startRadius)*Math.max(0,Math.min(1,currentProgress));

      EntityService.forEachEnemy(source,target=>{
        if(
          damage.oncePerExecution!==false&&
          state.execution.hitTargets.has(target.id)
        )return;
        const point=NetworkCollisionPositionService.point(target);
        const distance=Math.hypot(point.x-cx,point.y-cy);
        const radius=Math.max(0,Number(target.radius)||0);
        if(distance-radius>currentRadius)return;
        if(distance+radius<previousRadius)return;
        if(
          module?.wallPolicy!=='ignore'&&
          WorldGeometryService.segmentBlocked(
            cx,
            cy,
            point.x,
            point.y,
            0
          )
        )return;
        if(this.effectDamageTarget(effect,target,{x:point.x,y:point.y}))hitAny=true;
      },state.attack);
      return hitAny;
    }

    const sweepFraction=Math.max(.001,Math.min(.999,Number(effect.sweepFraction)||.55));
    const sweep=Math.min(1,Math.max(0,currentProgress)/sweepFraction);
    const outer=Math.max(1,Number(effect.outer)||Number(effect.r)||Number(module?.range)||60);
    const inner=Math.max(0,Number(effect.inner)||0);
    const baseAngle=(Number.isFinite(Number(effect.angle))?Number(effect.angle):-Math.PI/2)+(Number(effect.startAngleOffset)||0);
    const span=Number.isFinite(Number(effect.halfAngle))?Number(effect.halfAngle):(Number.isFinite(Number(effect.span))?Number(effect.span):Math.PI);
    const sweepCount=Math.max(1,Math.floor(Number(effect.sweepCount)||2));
    const clockwise=String(effect.sweepDirection||'clockwise')!=='counterclockwise';

    EntityService.forEachEnemy(source,target=>{
      if(
        damage.oncePerExecution!==false&&
        state.execution.hitTargets.has(target.id)
      )return;
      const point=NetworkCollisionPositionService.point(target);
      const dx=point.x-cx;
      const dy=point.y-cy;
      const distance=Math.hypot(dx,dy);
      const targetRadius=Math.max(0,Number(target.radius)||0);
      if(distance-targetRadius>outer||distance+targetRadius<inner)return;

      if(
        module?.wallPolicy!=='ignore'&&
        WorldGeometryService.segmentBlocked(
          cx,
          cy,
          point.x,
          point.y,
          0
        )
      )return;

      const targetAngle=this.normalizeAnglePositive(Math.atan2(dy,dx));
      const angularSlack=distance>.001?Math.asin(Math.min(1,targetRadius/distance)):Math.PI;
      let covered=false;
      for(let index=0;index<sweepCount&&!covered;index++){
        const start=this.normalizeAnglePositive(
          baseAngle+index*(Math.PI*2/sweepCount)
        );
        const delta=clockwise
          ?this.normalizeAnglePositive(targetAngle-start)
          :this.normalizeAnglePositive(start-targetAngle);
        if(delta<=span*sweep+angularSlack)covered=true;
      }
      if(!covered)return;
      if(this.effectDamageTarget(effect,target,{x:point.x,y:point.y}))hitAny=true;
    },state.attack);
    return hitAny;
  },
  applyAnimationDamage(effect,fromX,fromY,toX,toY,{skipMovementValidation=false}={}){
    const state=effect.animationState;
    const source=EntityService.items.get(effect.sourceEntityId)||null;
    if(!state?.attack||!state.execution||!source)return false;

    const damage=effect.damage||{};
    const firstContactKey=
      String(
        damage.firstContactKey||
        'effect-damage-first-contact'
      );

    if(
      damage.stopAfterFirstContact===true&&
      AttackExecutionService.hasEffect(
        state.execution,
        firstContactKey
      )
    ){
      return false;
    }

    if(
      damage.requireMovementExecution===true&&
      skipMovementValidation!==true
    ){
      const movement=
        MovementAbilityService.state(
          source,
          String(
            damage.movementStateKey||
            'movement:move'
          )
        );
      const localSource=
        EntitySimulationAuthorityService
          .isLocal(source);

      if(
        localSource&&
        (
          !movement||
          Math.max(
            0,
            Number(movement.executionSequence)||0
          )!==
          Math.max(
            0,
            Number(damage.movementExecutionSequence)||0
          )
        )
      ){
        return false;
      }
    }

    const contactMode=
      String(damage.hitMode||'swept')==='body-contact';
    const module=
      contactMode
        ?null
        :(
          damage.module||
          AttackModuleService.module(
            state.attack,
            'delivery.area'
          )||
          null
        );
    if(!contactMode&&!module)return false;

    const distance=Math.hypot(toX-fromX,toY-fromY);
    const bodyRadius=Math.max(
      0,
      Number.isFinite(
        Number(damage.contactRadius)
      )
        ?Number(damage.contactRadius)
        :Number(source.radius)||0
    );
    const width=
      contactMode
        ?Math.max(6,bodyRadius)
        :Math.max(
          6,
          Number(module.range)||
          Number(effect.radius)||
          12
        );
    const samples=
      contactMode
        ?1
        :String(damage.hitMode||'swept')==='swept'
          ?Math.max(
            1,
            Math.ceil(
              distance/
              Math.max(4,width*.35)
            )
          )
          :1;
    const angle=Number(effect.angle)||0;

    for(let i=0;i<=samples;i++){
      const t=i/samples;
      const x=fromX+(toX-fromX)*t;
      const y=fromY+(toY-fromY)*t;
      const anchor=Object.create(source);
      anchor.x=x;anchor.y=y;
      let contactHits=0;

      EntityService.forEachEnemy(source,target=>{
        if(
          damage.oncePerExecution!==false&&
          state.execution.hitTargets.has(target.id)
        )return;

        const point=
          NetworkCollisionPositionService.point(
            target
          );

        if(contactMode){
          /*
            양쪽이 동시에 움직이는 몸통 충돌은 상대운동으로 검사한다.
            S0→S1, T0→T1의 접촉은
            (S0-T0)→(S1-T1) 선분이 원점의 합산 반경 안으로 들어오는지와 같다.
          */
          const previousPoints=
            state.movementDamageTargetPreviousPoints instanceof WeakMap
              ?state.movementDamageTargetPreviousPoints
              :(state.movementDamageTargetPreviousPoints=new WeakMap());
          const previousTarget=
            previousPoints.get(target)||
            {
              x:Number(point.x)||0,
              y:Number(point.y)||0
            };

          const collisionDistance=
            JustDodgeService.pointSegmentDistance(
              0,
              0,
              Number(fromX)-Number(previousTarget.x),
              Number(fromY)-Number(previousTarget.y),
              Number(toX)-Number(point.x),
              Number(toY)-Number(point.y)
            );

          if(i===samples){
            previousPoints.set(
              target,
              {
                x:Number(point.x)||0,
                y:Number(point.y)||0
              }
            );
          }

          if(
            collisionDistance>
            bodyRadius+
            Math.max(
              0,
              Number(target.radius)||0
            )
          )return;
        }else if(
          !AreaAttackService.containsPoint(
            module,
            anchor,
            point.x,
            point.y,
            target.radius,
            angle
          )
        ){
          return;
        }

        const result=AttackHitTriggerService.damage({
          source,
          target,
          attack:state.attack,
          execution:state.execution,
          impact:{
            type:'effect-animation',
            shape:
              contactMode
                ?'body-contact'
                :module.shape,
            origin:{x,y},
            point:{x,y}
          }
        });
        if(
          result.durabilityBlocked===true&&
          result.authoritative!==false&&
          !result.duplicateExecutionHit
        ){
          // 반 스패너가 이동 경로 공격을 전부 흡수해도 이 실행에서의 접촉은
          // 이미 완료된 것으로 기록한다. 그렇지 않으면 다음 이동 세그먼트에서
          // 같은 AttackExecution이 같은 대상의 내구도를 다시 깎는다.
          // 체력 피해/CC/온힛은 완전 흡수 규칙대로 발동하지 않는다.
          contactHits++;
          state.execution.hitTargets.add(target.id);
        }else if(
          result.hit&&
          result.authoritative!==false&&
          !result.duplicateExecutionHit
        ){
          contactHits++;
          state.execution.hitTargets.add(target.id);
          AttackModuleService.onHit(
            source,target,state.attack,
            {execution:state.execution,hits:0,total:1,resolved:0,finished:false},
            angle
          );
        }
      },state.attack);

      if(
        contactHits>0&&
        damage.stopAfterFirstContact===true
      ){
        AttackExecutionService.markEffect(
          state.execution,
          firstContactKey
        );
        return true;
      }
    }
    return true;
  },
  registerMovementDamage(effect){
    const damage=effect?.damage||{};
    if(damage.requireMovementExecution!==true)return false;

    const source=
      EntityService.items.get(
        String(effect?.sourceEntityId||'')
      )||
      null;
    if(!source)return false;

    const remoteTimeline=
      damage.remotePathTimeline&&
      typeof damage.remotePathTimeline==='object'
        ?damage.remotePathTimeline
        :null;

    /*
      원격 프레젠테이션은 effect 패킷에 포함된 timeline만으로 즉시 복구한다.
      별도 movement snapshot이 늦거나 이미 종료됐어도 경로 FX는 누락되지 않는다.
    */
    if(
      !EntitySimulationAuthorityService.isLocal(source)&&
      remoteTimeline
    ){
      effect.animationState.movementDamageExecutionValidated=true;
      effect.animationState.movementDamagePreviousX=
        Number(source.x)||0;
      effect.animationState.movementDamagePreviousY=
        Number(source.y)||0;
      effect.animationState.movementPathTimeline={
        startX:Number(remoteTimeline.startX)||Number(source.x)||0,
        startY:Number(remoteTimeline.startY)||Number(source.y)||0,
        angle:Number(remoteTimeline.angle)||0,
        distance:Math.max(
          0,
          Number(remoteTimeline.distance)||0
        ),
        startedAt:Number(effect.start)||performance.now(),
        duration:Math.max(
          GAME_DATA.frameMs,
          Number(remoteTimeline.duration)||GAME_DATA.frameMs
        ),
        easing:String(remoteTimeline.easing||'linear'),
        collision:remoteTimeline.collision||null,
        enemyCollisionOvershoot:Math.max(0,Number(remoteTimeline.enemyCollisionOvershoot)||0),
        visualDistance:0,
        damageDistance:0
      };
      return true;
    }

    const movement=
      MovementAbilityService.state(
        source,
        String(
          damage.movementStateKey||
          'movement:move'
        )
      );
    if(!movement)return false;

    const expectedSequence=
      Math.max(
        0,
        Number(damage.movementExecutionSequence)||0
      );
    if(
      Math.max(
        0,
        Number(movement.executionSequence)||0
      )!==expectedSequence
    ){
      return false;
    }

    if(!Array.isArray(movement.pathDamageEffects)){
      movement.pathDamageEffects=[];
    }
    const newlyRegistered=
      !movement.pathDamageEffects.includes(effect);
    if(newlyRegistered){
      movement.pathDamageEffects.push(effect);
    }

    effect.animationState.movementDamageExecutionValidated=true;

    if(
      newlyRegistered&&
      Array.isArray(movement.damagePathSegments)&&
      movement.damagePathSegments.length
    ){
      for(const segment of movement.damagePathSegments){
        const fromX=Number(segment?.fromX)||0;
        const fromY=Number(segment?.fromY)||0;
        const toX=Number(segment?.toX)||0;
        const toY=Number(segment?.toY)||0;
        const pointContact=segment?.pointContact===true;
        if(
          pointContact&&
          String(damage.hitMode||'')!=='body-contact'
        ){
          continue;
        }
        if(!pointContact){
          this.appendMovementPathPresentation(
            effect,
            fromX,
            fromY,
            toX,
            toY
          );
        }
        this.applyAnimationDamage(
          effect,
          fromX,
          fromY,
          toX,
          toY,
          {skipMovementValidation:true}
        );
      }
    }

    effect.animationState.movementDamagePreviousX=
      Number(source.x)||0;
    effect.animationState.movementDamagePreviousY=
      Number(source.y)||0;
    effect.animationState.movementPathTimeline={
      startX:Number(movement.startX)||Number(source.x)||0,
      startY:Number(movement.startY)||Number(source.y)||0,
      angle:Number(movement.angle)||0,
      distance:Math.max(
        0,
        Number(movement.presentationDistance)||
        Number(movement.distance)||
        0
      ),
      startedAt:Number(movement.startedAt)||performance.now(),
      duration:Math.max(
        GAME_DATA.frameMs,
        Number(movement.duration)||GAME_DATA.frameMs
      ),
      easing:String(movement.easing||'linear'),
      visualDistance:0
    };
    return true;
  },
  appendMovementPathPresentation(effect,fromX,fromY,toX,toY){
    const damage=effect?.damage||{};
    const explicitConfig=damage.pathPresentation;
    const bodyContactFallback=
      damage.hitMode==='body-contact'&&
      Math.max(
        0,
        Number(damage.contactRadius)||0
      )>0;
    const config=
      explicitConfig||
      (
        bodyContactFallback
          ?Object.freeze({
            width:Math.max(
              0,
              Number(damage.contactRadius)||0
            ),
            duration:200
          })
          :null
      );
    const state=effect?.animationState;
    if(!config||!state)return false;
    const dx=toX-fromX,dy=toY-fromY,length=Math.hypot(dx,dy);
    if(length<=1e-6)return false;
    const angle=Math.atan2(dy,dx),now=performance.now();
    const last=state.movementPathPresentation;
    // 같은 직선 구간은 하나의 이펙트를 연장한다. 꺾이면 실제 구간별로 분리한다.
    if(last&&Training.fx.includes(last)&&
      Math.hypot(last.x+Math.cos(last.angle)*last.len-fromX,last.y+Math.sin(last.angle)*last.len-fromY)<.01&&
      Math.abs(Math.atan2(Math.sin(angle-last.angle),Math.cos(angle-last.angle)))<.001){
      last.len+=length;
      last.start=now;
    }else{
      state.movementPathPresentation=this.spawn({
        type:'botDrill',sourceEntityId:effect.sourceEntityId,x:fromX,y:fromY,angle,len:length,
        width:Math.max(0,Number(effect.damage.contactRadius)||Number(config.width)||0),
        color:AttackPresentationColorService.resolve(
          EntityService.items.get(String(effect.sourceEntityId||''))||null,
          state.attack,
          config
        ),
        start:now,dur:Math.max(1,Number(config.duration)||200)
      });
    }
    return true;
  },
  appendRemoteMovementTimelinePresentation(
    effect,
    now=performance.now()
  ){
    const timeline=
      effect?.animationState?.movementPathTimeline;
    if(!timeline)return false;

    const duration=Math.max(
      GAME_DATA.frameMs,
      Number(timeline.duration)||GAME_DATA.frameMs
    );
    const raw=Math.max(
      0,
      Math.min(
        1,
        (now-Number(timeline.startedAt||now))/duration
      )
    );
    const progress=this.ease(
      raw,
      String(timeline.easing||'linear')
    );
    const targetDistance=
      Math.max(0,Number(timeline.distance)||0)*
      progress;
    const previousDistance=
      Math.max(
        0,
        Math.min(
          targetDistance,
          Number(timeline.visualDistance)||0
        )
      );
    const delta=targetDistance-previousDistance;
    if(delta<=1e-6)return false;

    const angle=Number(timeline.angle)||0;
    const fromX=
      Number(timeline.startX)+
      Math.cos(angle)*previousDistance;
    const fromY=
      Number(timeline.startY)+
      Math.sin(angle)*previousDistance;
    const toX=
      Number(timeline.startX)+
      Math.cos(angle)*targetDistance;
    const toY=
      Number(timeline.startY)+
      Math.sin(angle)*targetDistance;

    timeline.visualDistance=targetDistance;
    return this.appendMovementPathPresentation(
      effect,
      fromX,
      fromY,
      toX,
      toY
    );
  },
  applyMovementTrackedDamage(effect){
    const state=effect?.animationState;
    const damage=effect?.damage||{};
    const source=
      EntityService.items.get(
        String(effect?.sourceEntityId||'')
      )||
      null;

    if(
      !state||
      !source||
      damage.requireMovementExecution!==true||
      state.movementDamageFinished===true
    ){
      return false;
    }

    const movement=
      MovementAbilityService.state(
        source,
        String(
          damage.movementStateKey||
          'movement:move'
        )
      );
    const expectedSequence=
      Math.max(
        0,
        Number(damage.movementExecutionSequence)||0
      );

    /*
      온라인에서는 effect-spawn과 movement snapshot이 서로 다른 패킷이라
      이펙트가 먼저 도착할 수 있다. 최초 spawn 시 movement가 없어서
      registerMovementDamage()가 실패했더라도, 원격 movement가 도착한
      첫 프레임에 다시 연결해 pathPresentation timeline을 복구한다.
    */
    if(
      movement&&
      (
        state.movementDamageExecutionValidated!==true||
        !state.movementPathTimeline
      )&&
      Math.max(
        0,
        Number(movement.executionSequence)||0
      )===expectedSequence
    ){
      this.registerMovementDamage(effect);
    }

    const movementMatches=
      !!(
        movement&&
        Math.max(
          0,
          Number(movement.executionSequence)||0
        )===expectedSequence
      );

    if(
      movement&&
      !movementMatches&&
      EntitySimulationAuthorityService.isLocal(source)
    ){
      state.movementDamageFinished=true;
      state.movementDamagePreviousX=Number(source.x)||0;
      state.movementDamagePreviousY=Number(source.y)||0;
      return false;
    }

    if(movementMatches){
      state.movementDamageExecutionValidated=true;
    }

    const fromX=
      Number.isFinite(
        Number(state.movementDamagePreviousX)
      )
        ?Number(state.movementDamagePreviousX)
        :Number(source.x)||0;
    const fromY=
      Number.isFinite(
        Number(state.movementDamagePreviousY)
      )
        ?Number(state.movementDamagePreviousY)
        :Number(source.y)||0;
    const toX=Number(source.x)||0;
    const toY=Number(source.y)||0;
    const moved=
      Math.hypot(
        toX-fromX,
        toY-fromY
      );

    let applied=false;

    const localSource=
      EntitySimulationAuthorityService.isLocal(source);

    if(!localSource){
      const timeline=state.movementPathTimeline;
      const timelineNow=performance.now();

      /*
        원격 이동 공격은 소유자가 effect-spawn에 실어 보낸 충돌 반영 완료
        movement timeline을 진실원천으로 사용한다. 원격 Entity 보간 좌표는
        패킷 순서/보간 지연에 따라 늦게 움직일 수 있으므로 이를 다시 거리
        기준으로 사용하면 경로 FX와 대상 권위 피해가 0거리로 축소된다.
      */
      if(
        state.movementDamageExecutionValidated===true&&
        timeline
      ){
        const duration=Math.max(
          GAME_DATA.frameMs,
          Number(timeline.duration)||GAME_DATA.frameMs
        );
        const raw=Math.max(
          0,
          Math.min(
            1,
            (timelineNow-Number(timeline.startedAt||timelineNow))/duration
          )
        );
        const progress=this.ease(
          raw,
          String(timeline.easing||'linear')
        );
        let targetDistance=timeline.stopped===true
          ?Math.max(0,Number(timeline.distance)||0)
          :Math.max(0,Number(timeline.distance)||0)*progress;
        const previousDistance=Math.max(
          0,
          Math.min(
            targetDistance,
            Number(timeline.damageDistance)||0
          )
        );

        if(targetDistance>previousDistance+1e-6){
          const timelineAngle=Number(timeline.angle)||0;
          const timelineStartX=Number(timeline.startX)||0;
          const timelineStartY=Number(timeline.startY)||0;
          const damageFromX=
            timelineStartX+Math.cos(timelineAngle)*previousDistance;
          const damageFromY=
            timelineStartY+Math.sin(timelineAngle)*previousDistance;
          // 발동 순간의 적 위치로 고정하지 않고 매 구간 공통 이동 충돌을 다시 검사한다.
          if(timeline.collision){
            const anchor=timeline.collisionAnchor||(timeline.collisionAnchor=Object.create(source));
            anchor.x=damageFromX;anchor.y=damageFromY;
            timeline.traveled=previousDistance;
            const travel=MovementAbilityService.travelWithEnemyOvershoot(
              anchor,timeline,
              timelineAngle,targetDistance-previousDistance
            );
            const requested=targetDistance-previousDistance;
            targetDistance=previousDistance+travel.allowed;
            if(travel.enemyCollision||travel.allowed+1e-6<requested){
              timeline.distance=targetDistance;
              timeline.stopped=true;
            }
          }
          const damageToX=
            timelineStartX+Math.cos(timelineAngle)*targetDistance;
          const damageToY=
            timelineStartY+Math.sin(timelineAngle)*targetDistance;

          applied=this.applyAnimationDamage(
            effect,
            damageFromX,
            damageFromY,
            damageToX,
            damageToY,
            {skipMovementValidation:true}
          )||applied;
          this.appendMovementPathPresentation(effect,damageFromX,damageFromY,damageToX,damageToY);
          timeline.visualDistance=targetDistance;
          timeline.damageDistance=targetDistance;
        }
      }
    }else{
      const zeroDistanceBodyContact=
        damage.hitMode==='body-contact'&&
        Math.max(
          0,
          Number(damage.contactRadius)||0
        )>0;

      if(
        state.movementDamageExecutionValidated===true&&
        (
          moved>1e-6||
          zeroDistanceBodyContact
        )
      ){
        if(moved>1e-6){
          this.appendMovementPathPresentation(
            effect,
            fromX,
            fromY,
            toX,
            toY
          );
        }
        applied=this.applyAnimationDamage(
          effect,
          fromX,
          fromY,
          toX,
          toY,
          {skipMovementValidation:true}
        );
      }
    }

    state.movementDamagePreviousX=toX;
    state.movementDamagePreviousY=toY;

    /*
      matching movement state가 사라진 첫 프레임까지는 방금 실제로 움직인
      마지막 구간을 처리한다. 그 뒤에는 일반 이동/WASD가 이어져도
      같은 공격의 경로 피해가 계속 따라붙지 않는다.
    */
    if(
      state.movementDamageExecutionValidated===true&&
      !movementMatches
    ){
      const timeline=state.movementPathTimeline;
      const visualComplete=
        !timeline||
        Number(timeline.visualDistance)>=
          Math.max(0,Number(timeline.distance)||0)-1e-6;
      const damageComplete=
        !timeline||
        localSource||
        Number(timeline.damageDistance)>=
          Math.max(0,Number(timeline.distance)||0)-1e-6;

      /*
        로컬은 실제 이동 세그먼트가 종료되면 끝내고, 원격은 embedded
        timeline의 시각/대상 권위 피해가 모두 끝날 때까지 유지한다.
      */
      state.movementDamageFinished=
        visualComplete&&damageComplete;
    }

    return applied;
  },
  update(now=performance.now()){
    if(!Training.active)return false;
    for(const effect of Training.fx){
      if(effect?.entityDecoration===true){
        const owner=EntityService.items.get(String(effect.sourceEntityId||''));
        if(!owner?.alive||owner.character?.id!==effect.decorationCharacterId){
          effect.dur=0;
          continue;
        }
      }
      if(effect?.followSource===true){
        const source=
          EntityService.items.get(
            String(effect.sourceEntityId||'')
          )||
          null;

        if(source?.alive){
          const nextX=Number(source.x)||0;
          const nextY=Number(source.y)||0;
          const previousX=
            Number.isFinite(Number(effect.followSourceX))
              ?Number(effect.followSourceX)
              :Number(effect.x)||nextX;
          const previousY=
            Number.isFinite(Number(effect.followSourceY))
              ?Number(effect.followSourceY)
              :Number(effect.y)||nextY;
          const dx=nextX-previousX;
          const dy=nextY-previousY;

          effect.x=
            (Number(effect.x)||0)+dx;
          effect.y=
            (Number(effect.y)||0)+dy;

          if(Array.isArray(effect.points)){
            for(const point of effect.points){
              if(!point)continue;
              point.x=(Number(point.x)||0)+dx;
              point.y=(Number(point.y)||0)+dy;
            }
          }

          if(effect.animationState){
            const state=effect.animationState;
            state.fromX=(Number(state.fromX)||0)+dx;
            state.fromY=(Number(state.fromY)||0)+dy;
            state.toX=(Number(state.toX)||0)+dx;
            state.toY=(Number(state.toY)||0)+dy;
            state.previousX=(Number(state.previousX)||0)+dx;
            state.previousY=(Number(state.previousY)||0)+dy;
          }

          effect.followSourceX=nextX;
          effect.followSourceY=nextY;
        }
      }

      const state=effect?.animationState;
      if(!state)continue;

      const p=Math.max(0,Math.min(1,(now-effect.start)/Math.max(1,effect.dur)));
      const t=this.ease(p,state.easing);
      const oldX=Number(effect.x)||state.previousX;
      const oldY=Number(effect.y)||state.previousY;

      effect.x=state.fromX+(state.toX-state.fromX)*t;
      effect.y=state.fromY+(state.toY-state.fromY)*t;
      effect.angle=state.fromAngle+(state.toAngle-state.fromAngle)*t;
      effect.scale=state.fromScale+(state.toScale-state.fromScale)*t;

      if(effect.damage){
        const hitMode=String(effect.damage.hitMode||'');
        if(effect.damage.requireMovementExecution===true){
          const movementSource=
            EntityService.items.get(
              String(effect.sourceEntityId||'')
            )||
            null;
          if(
            movementSource&&
            !EntitySimulationAuthorityService
              .isLocal(movementSource)
          ){
            this.applyMovementTrackedDamage(
              effect
            );
          }
        }else if(
          hitMode==='annular-sweep'||
          hitMode==='arc-sweep'||
          hitMode==='expanding-ring'||
          hitMode==='progressive-rect'
        ){
          this.applyProgressiveDamage(
            effect,
            Number(state.previousProgress)||0,
            p
          );
        }else{
          this.applyAnimationDamage(
            effect,
            oldX,
            oldY,
            effect.x,
            effect.y
          );
        }
      }
      state.previousX=effect.x;
      state.previousY=effect.y;
      state.previousProgress=p;
    }
    return true;
  }
});
