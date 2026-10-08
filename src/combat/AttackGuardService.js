

const AttackGuardService=Object.freeze({
  active:new Map(),
  key(source,module){
    return `${source.id}:${String(module.stateKey||module.shape||'guard')}`;
  },
  area(module){
    return {
      type:'delivery.area',
      shape:String(module.shape||'sector'),
      range:Math.max(0,Number(module.range)||0),
      halfAngle:Math.max(0,Number(module.halfAngle)||0),
      halfWidth:Math.max(0,Number(module.halfWidth)||0),
      wallPolicy:String(module.wallPolicy||'ignore')
    };
  },
  activate(
    source,
    module,
    angle,
    now=performance.now(),
    execution=null
  ){
    if(!source||!module)return false;
    const duration=Math.max(0,Number(module.duration)||0);
    const visualStateKey=
      String(
        module.visualState?.effectStateKey||
        module.stateKey||
        ''
      );
    const guardKey=this.key(source,module);
    const previousGuard=
      this.active.get(guardKey)||
      null;

    if(previousGuard?.visualEffectKey){
      EffectSpawnService.removeKey(
        previousGuard.visualEffectKey
      );
    }

    const guard={
      source,
      module:this.area(module),
      spec:module,
      execution,
      angle:Number(angle)||0,
      expiresAt:now+Math.max(GAME_DATA.frameMs,duration),
      oneShot:duration<=0,
      handledProjectiles:new WeakSet(),
      handledBlockGroups:new Set(),
      visualEffectKey:
        visualStateKey&&execution
          ?`attack-effect:${source.id}:${execution.sequence}:${visualStateKey}`
          :null
    };
    this.active.set(guardKey,guard);
    this.sweep(guard,now);
    if(guard.oneShot)this.active.delete(guardKey);
    return true;
  },
  hostile(guard,attackSource){
    return !!attackSource&&
      RelationService.relation(
        guard.source,
        attackSource
      )==='enemy';
  },
  containsPoint(guard,x,y,radius=0){
    return AreaAttackService.containsPoint(
      guard.module,
      guard.source,
      Number(x)||0,
      Number(y)||0,
      Math.max(0,Number(radius)||0),
      guard.angle
    );
  },
  contactPoint(guard,projectile){
    const x=Number(projectile.x)||0,y=Number(projectile.y)||0;
    const fromX=Number.isFinite(projectile.prevX)?projectile.prevX:x;
    const fromY=Number.isFinite(projectile.prevY)?projectile.prevY:y;
    const dx=x-fromX,dy=y-fromY,distance=Math.hypot(dx,dy);
    const radius=Math.max(0,Number(projectile.radius)||0);
    let reachable=distance;
    if(projectile.behavior?.collisionPolicy?.passWalls!==true&&projectile.behavior?.pierce?.walls!==true&&distance>1e-6){
      reachable=WorldGeometryService.raycastDistance(fromX,fromY,Math.atan2(dy,dx),distance,ProjectileService.wallCollisionPadding(projectile));
    }
    const count=Math.max(1,Math.ceil(reachable/Math.max(1,Math.min(4,radius||1))));
    let previous=0;
    for(let i=0;i<=count;i++){
      const along=reachable*i/count;
      const t=distance>1e-6?along/distance:0;
      if(this.containsPoint(guard,fromX+dx*t,fromY+dy*t,radius)){
        let low=previous,high=along;
        for(let j=0;j<12;j++){
          const middle=(low+high)/2,ratio=distance>1e-6?middle/distance:0;
          if(this.containsPoint(guard,fromX+dx*ratio,fromY+dy*ratio,radius))high=middle;
          else low=middle;
        }
        const ratio=distance>1e-6?high/distance:0;
        return {x:fromX+dx*ratio,y:fromY+dy*ratio,distance:high};
      }
      previous=along;
    }
    return null;
  },
  overlaps(guard,projectile){
    return !!this.contactPoint(guard,projectile);
  },
  normalizeAngle(angle){
    let value=Number(angle)||0;
    while(value>Math.PI)value-=Math.PI*2;
    while(value<-Math.PI)value+=Math.PI*2;
    return value;
  },
  angleDistance(a,b){
    return Math.abs(
      this.normalizeAngle(
        (Number(a)||0)-(Number(b)||0)
      )
    );
  },
  isHitscan(context){
    return !!(
      context?.attack&&
      TagService.hasAttack(
        context.attack,
        '히트스캔'
      )
    );
  },
  hitscanIncomingAngle(context){
    const executionDirection=
      Number(context?.execution?.directionAngle);
    const impactDirection=
      Number(context?.impact?.directionAngle);
    const direction=
      Number.isFinite(executionDirection)
        ?executionDirection
        :impactDirection;

    if(!Number.isFinite(direction)){
      return null;
    }

    // 공격 진행 방향의 반대쪽이 피격자 기준 "공격이 날아온 방향".
    return this.normalizeAngle(
      direction+Math.PI
    );
  },
  blocksHitscanDirection(guard,context){
    if(!guard||!this.isHitscan(context)){
      return false;
    }

    const incoming=
      this.hitscanIncomingAngle(context);
    if(incoming===null)return false;

    const halfAngle=
      Math.max(
        0,
        Number(guard.module?.halfAngle)||0
      );

    return (
      this.angleDistance(
        incoming,
        guard.angle
      )<=halfAngle
    );
  },
  isProjectileAttack(context){
    return !!(
      context?.attack&&
      TagService.hasAttack(
        context.attack,
        '공격형태 투사체'
      )
    );
  },
  blocksDirectAttackDirection(guard,context){
    if(!guard||!context?.attack)return false;

    const impact=context?.impact||null;

    // 지속피해/상태피해는 패리 대상이 아니다.
    if(
      impact?.dot===true||
      String(impact?.type||'')==='status'
    ){
      return false;
    }

    // 실제 투사체는 기존 projectile 접촉 판정을 그대로 사용한다.
    if(this.isProjectileAttack(context)){
      return false;
    }

    const incoming=
      this.hitscanIncomingAngle(context);

    if(incoming===null)return false;

    const halfAngle=
      Math.max(
        0,
        Number(guard.module?.halfAngle)||0
      );

    return (
      this.angleDistance(
        incoming,
        guard.angle
      )<=halfAngle
    );
  },
  incomingPoint(context){
    const impact=context?.impact||null;

    if(
      impact?.origin&&
      Number.isFinite(Number(impact.origin.x))&&
      Number.isFinite(Number(impact.origin.y))
    ){
      return {
        x:Number(impact.origin.x),
        y:Number(impact.origin.y)
      };
    }

    if(
      impact?.point&&
      Number.isFinite(Number(impact.point.x))&&
      Number.isFinite(Number(impact.point.y))&&
      String(impact.type||'')==='projectile'
    ){
      return {
        x:Number(impact.point.x),
        y:Number(impact.point.y)
      };
    }

    const source=context?.source||null;
    if(source){
      return {
        x:Number(source.x)||0,
        y:Number(source.y)||0
      };
    }

    return null;
  },
  blockingGuard(context,now=performance.now()){
    const target=context?.target||null;
    const attackSource=context?.source||null;
    if(!target||!attackSource)return null;

    for(const [key,guard] of this.active){
      if(
        !guard?.source?.alive||
        guard.expiresAt<=now
      ){
        this.active.delete(key);
        continue;
      }

      if(guard.source!==target)continue;
      if(!this.hostile(guard,attackSource))continue;

      if(this.isHitscan(context)){
        // 히트스캔 방어는 공격자/공격 중심의 거리나 위치를 전혀 보지 않는다.
        // 실제 공격 진행 방향이 방패가 바라보는 방어각에서 들어왔는지만 검사한다.
        if(
          this.blocksHitscanDirection(
            guard,
            context
          )
        ){
          return guard;
        }
        continue;
      }

      /*
       * 이동 몸통공격/effect-animation/direct 등은 delivery.area가 없어
       * '히트스캔' 태그가 없을 수 있다. 하지만 DamagePipeline까지 실제 적중이
       * 확정된 직접 공격이므로, 투사체가 아닌 경우 공격 진행 방향을 공통 방어각으로
       * 검사한다. 이 경로가 없으면 이런 공격들은 source/impact point가 방패의
       * 짧은 120px 영역 안에 있을 때만 막혀 사실상 패리가 투사체 위주로 동작한다.
       */
      if(
        this.blocksDirectAttackDirection(
          guard,
          context
        )
      ){
        return guard;
      }

      const point=this.incomingPoint(context);
      if(!point)continue;

      if(
        this.containsPoint(
          guard,
          point.x,
          point.y,
          0
        )
      ){
        return guard;
      }
    }
    return null;
  },
  broadcastBlockResolution(context){
    if(
      Training.sessionMode!=='online'||
      !OnlineDuelService.active
    ){
      return false;
    }

    const defenderPid=
      OnlineParticipantEntityService.pid(
        context?.target
      );
    const attackerPid=
      OnlineParticipantEntityService.pid(
        context?.source
      );

    if(!defenderPid||!attackerPid)return false;

    return OnlineDuelService.sendAttackGuardResolved({
      defenderPid,
      attackerPid,
      attackId:String(context?.attack?.id||''),
      executionSequence:
        Math.max(
          0,
          Math.floor(
            Number(context?.execution?.sequence)||0
          )
        ),
      impactType:String(
        context?.impact?.type||''
      )
    });
  },
  blockDamage(context,now=performance.now()){
    const target=context?.target||null;

    // 방어 성공 여부는 방패를 가진 대상의 권위 클라이언트만 판정한다.
    if(
      Training.sessionMode==='online'&&
      (
        !target||
        !EntitySimulationAuthorityService.isLocal(target)
      )
    ){
      return false;
    }

    const guard=this.blockingGuard(
      context,
      now
    );
    if(!guard)return false;

    const point=
      this.isHitscan(context)
        ?{
          x:
            (Number(guard.source.x)||0)+
            Math.cos(guard.angle)*
              Math.max(
                0,
                Number(guard.module?.range)||0
              )*.72,
          y:
            (Number(guard.source.y)||0)+
            Math.sin(guard.angle)*
              Math.max(
                0,
                Number(guard.module?.range)||0
              )*.72
        }
        :this.incomingPoint(context)||{
          x:Number(guard.source.x)||0,
          y:Number(guard.source.y)||0
        };

    this.parryFx(
      guard.source,
      point.x,
      point.y,
      now
    );
    this.registerBlockOccurrence(
      guard,
      this.damageBlockGroupKey(context),
      now
    );
    if(context.source?.character?.reactiveEquipment)ReactiveEquipmentService.blocked(context.source,guard.source.id,this.damageBlockGroupKey(context),now);
    this.broadcastBlockResolution(
      context
    );
    return true;
  },
  extendOnBlock(guard,now=performance.now()){
    const extra=Math.max(
      0,
      Number(guard?.spec?.onBlockExtend)||0
    );
    if(extra<=0)return false;

    guard.expiresAt=Math.max(
      guard.expiresAt,
      now
    )+extra;
    return true;
  },
  visualPatch(guard){
    const state=guard?.spec?.visualState;
    if(!state)return null;
    return {
      color:String(state.color||'0,220,255'),
      duration:Math.max(
        GAME_DATA.frameMs,
        Number(state.duration)||GAME_DATA.frameMs
      ),
      syncToGuardDuration:
        state.syncToGuardDuration===true
    };
  },
  replacementEffectKey(guard){
    // 방어 성공 교체본은 원본 shieldSwing과 동일한 effectKey를 사용한다.
    // 로컬에서는 원본을 지운 뒤 새로 생성하고,
    // 원격에서는 동일 key의 effect-spawn이 기존 주황 shieldSwing을 직접 교체한다.
    return String(guard?.visualEffectKey||'');
  },
  blockFeedback(guard,now=performance.now()){
    if(!guard?.source)return null;

    // 방어자 화면에서만 원본 방패를 지우고 동일 shieldSwing을 색만 바꿔 생성한다.
    if(
      Training.sessionMode==='online'&&
      !EntitySimulationAuthorityService.isLocal(
        guard.source
      )
    ){
      return null;
    }

    const patch=this.visualPatch(guard);
    const originalKey=String(guard.visualEffectKey||'');
    if(!patch||!originalKey)return null;

    const visualArea=
      AttackModuleService.module(
        guard.execution?.attack,
        'delivery.area'
      )||guard.module;
    const replacementGeometry=
      AreaGeometryService.polygon(
        guard.source,
        visualArea,
        guard.angle
      );
    const replacementPoints=
      (replacementGeometry?.points||[]).map(
        point=>({
          x:Number(point.x)||0,
          y:Number(point.y)||0
        })
      );

    EffectSpawnService.removeKey(
      originalKey
    );

    const replacement=
      EffectSpawnService.spawn(
        {
          type:'shieldSwing',
          key:this.replacementEffectKey(guard),
          x:Number(guard.source.x)||0,
          y:Number(guard.source.y)||0,
          angle:Number(guard.angle)||0,
          range:Math.max(
            0,
            Number(guard.module?.range)||0
          ),
          halfAngle:Math.max(
            0,
            Number(guard.module?.halfAngle)||0
          ),
          points:replacementPoints,
          color:patch.color,
          start:now,
          dur:
            patch.syncToGuardDuration
              ?Math.max(
                GAME_DATA.frameMs,
                Number(guard.expiresAt)-now
              )
              :patch.duration,
          sourceEntityId:guard.source.id
        },
        {source:guard.source}
      );

    if(
      replacement&&
      OnlinePresentationSyncService?.shouldSend?.(
        guard.source
      )
    ){
      OnlinePresentationSyncService.send(
        'effect-spawn',
        guard.source,
        {
          effect:
            EffectSpawnService.presentationSnapshot(
              replacement,
              now
            )
        }
      );
    }

    return replacement;
  },
  resolveBlockFeedback(guard,now=performance.now()){
    this.extendOnBlock(guard,now);
    this.blockFeedback(guard,now);
  },
  parryFx(source,x,y,now=performance.now()){
    if(
      Training.sessionMode==='online'&&
      !EntitySimulationAuthorityService.isLocal(source)
    ){
      return false;
    }

    const instance=EffectSpawnService.spawn({
      type:'parry',
      x:Number(x)||0,y:Number(y)||0,
      maxRadius:40,
      color:'255,119,0',
      start:now,
      dur:GAME_DATA.frameMs*12
    },{source});

    if(instance&&OnlinePresentationSyncService?.shouldSend?.(source)){
      OnlinePresentationSyncService.send(
        'effect-spawn',
        source,
        {effect:EffectSpawnService.presentationSnapshot(instance,now)}
      );
    }
    return !!instance;
  },
  projectileBlockGroupKey(projectile,guard=null){
    if(!projectile)return '';

    const sourceId=String(
      projectile.source?.id||
      projectile.source?.character?.id||
      'source'
    );
    const attackId=String(
      projectile.attack?.id||
      'attack'
    );
    const executionSequence=
      Math.max(
        0,
        Math.floor(
          Number(
            projectile.volley?.execution?.sequence
          )||0
        )
      );

    if(
      String(guard?.spec?.blockCountMode||'execution')===
      'projectile'
    ){
      return `${sourceId}:${attackId}:execution:${executionSequence}:projectile:${String(
        projectile.networkKey||
        projectile.projectileOrdinal||
        ''
      )}`;
    }

    if(executionSequence>0){
      return `${sourceId}:${attackId}:execution:${executionSequence}`;
    }

    // execution 정보가 없는 구형/특수 투사체는 각 투사체를 별도 방어 횟수로 본다.
    return `${sourceId}:${attackId}:projectile:${String(projectile.networkKey||'')}`;
  },
  damageBlockGroupKey(context){
    const sourceId=String(
      context?.source?.id||
      context?.source?.character?.id||
      'source'
    );
    const attackId=String(
      context?.attack?.id||
      'attack'
    );
    const sequence=Math.max(
      0,
      Math.floor(
        Number(context?.execution?.sequence)||0
      )
    );

    return sequence>0
      ?`${sourceId}:${attackId}:execution:${sequence}`
      :`${sourceId}:${attackId}:damage:${Math.floor(performance.now())}`;
  },
  registerBlockOccurrence(guard,groupKey,now=performance.now()){
    const key=String(groupKey||'');
    if(!guard||!key)return false;

    if(guard.handledBlockGroups?.has(key)){
      return false;
    }

    guard.handledBlockGroups?.add(key);

    const onBlock=
      guard.spec?.onBlock&&
      typeof guard.spec.onBlock==='object'
        ?guard.spec.onBlock
        :null;

    for(const mode of onBlock?.modes||[])ModeStateService.toggle(guard.source,mode);

    if(onBlock?.refreshGuardDuration===true){
      guard.expiresAt=
        now+
        Math.max(
          GAME_DATA.frameMs,
          Number(guard.spec?.duration)||
          GAME_DATA.frameMs
        );
    }

    if(Number(onBlock?.counterWindow)>0){
      CounterStockService.acquire(
        guard.source,
        Math.max(
          0,
          Number(onBlock.counterWindow)||0
        )+
        Math.max(
          0,
          BuffService.resolve(
            guard.source,
            'counterWindow',
            now
          )
        ),
        now,
        key,
        {
          kind:String(
            onBlock.counterKind||
            'normal'
          )
        }
      );
    }

    if(
      onBlock?.stateWindow&&
      typeof onBlock.stateWindow==='object'
    ){
      const stateKey=
        String(onBlock.stateWindow.stateKey||'');
      if(stateKey){
        TimedActionStateService.open(
          guard.source,
          {
            stateKey,
            duration:Math.max(
              0,
              Number(onBlock.stateWindow.duration)||0
            )
          },
          now
        );
      }
    }

    if(
      onBlock?.progress&&
      typeof onBlock.progress==='object'
    ){
      ProgressStateService.apply(
        guard.source,
        {
          type:'state.progress',
          ...onBlock.progress
        }
      );
    }

    this.resolveBlockFeedback(
      guard,
      now
    );
    return true;
  },
  isReturnAttack(projectile){
    return !!projectile?.behavior?.returning;
  },
  forceReturn(projectile,guard,now=performance.now()){
    if(!projectile||!guard)return false;

    this.parryFx(
      guard.source,
      projectile.x,
      projectile.y,
      now
    );
    this.registerBlockOccurrence(
      guard,
      this.projectileBlockGroupKey(
        projectile,
        guard
      ),
      now
    );

    if(projectile.source?.character?.reactiveEquipment)ReactiveEquipmentService.blocked(projectile.source,guard.source.id,this.projectileBlockGroupKey(projectile),now);

    const changed=
      ProjectileStateService.beginReturn(
        projectile,
        {manual:false}
      );

    this.broadcastProjectileResolution(
      projectile,
      'return',guard
    );

    return changed||
      projectile.behavior?.returning?.phase==='returning';
  },
  remove(projectile,index,guard,now){
    this.parryFx(guard.source,projectile.x,projectile.y,now);
    if(projectile.source?.character?.reactiveEquipment)ReactiveEquipmentService.blocked(projectile.source,guard.source.id,this.projectileBlockGroupKey(projectile),now);
    this.registerBlockOccurrence(
      guard,
      this.projectileBlockGroupKey(
        projectile,
        guard
      ),
      now
    );

    // 일부 projectile.impact는 실제 투사체가 방어에 의해 끝난 위치까지의
    // 경로/후속 효과가 필요하다. 명시적으로 요청한 공격만 guard impact를 확정한다.
    if(
      projectile.behavior?.impact?.resolveOnGuard===true
    ){
      ProjectileImpactService.resolve(
        projectile,
        'guard'
      );
    }

    this.broadcastProjectileResolution(
      projectile,
      'remove',guard
    );
    ProjectileService.finish(projectile,projectile.hadHit===true);
    ProjectileService.items.splice(index,1);
    return true;
  },
  broadcastProjectileResolution(projectile,outcome,guard=null){
    if(
      Training.sessionMode!=='online'||
      !OnlineDuelService.active
    ){
      return false;
    }

    const ownerPid=
      OnlineParticipantEntityService.pid(
        projectile?.source
      );
    if(!ownerPid)return false;

    return OnlineDuelService.sendProjectileGuardResolved(
      ownerPid,
      String(projectile?.networkKey||''),
      String(
        projectile?.stateKey||
        projectile?.behavior?.returning?.stateKey||
        ''
      ),
      outcome,
      {
        x:Number(projectile?.x)||0,
        y:Number(projectile?.y)||0
      },
      {attackId:String(projectile?.attack?.id||''),executionSequence:Number(projectile?.volley?.execution?.sequence)||0,defenderPid:OnlineParticipantEntityService.pid(guard?.source)}
    );
  },
  resolveProjectile(projectile,index,guard,now){
    if(
      Training.sessionMode==='online'&&
      !EntitySimulationAuthorityService.isLocal(
        guard.source
      )
    ){
      return false;
    }

    if(
      guard.handledProjectiles?.has(
        projectile
      )
    ){
      return false;
    }

    const contact=this.contactPoint(guard,projectile);
    if(!contact)return false;
    const overshoot=Math.hypot(projectile.x-contact.x,projectile.y-contact.y);
    projectile.x=contact.x;
    projectile.y=contact.y;
    projectile.travel=Math.max(0,(Number(projectile.travel)||0)-overshoot);

    guard.handledProjectiles?.add(
      projectile
    );

    if(this.isReturnAttack(projectile)){
      return this.forceReturn(
        projectile,
        guard,
        now
      );
    }

    return this.remove(
      projectile,
      index,
      guard,
      now
    );
  },
  sweep(guard,now=performance.now()){
    for(let index=ProjectileService.items.length-1;index>=0;index--){
      const projectile=ProjectileService.items[index];
      if(!this.hostile(guard,projectile.source)||!this.overlaps(guard,projectile))continue;
      this.resolveProjectile(
        projectile,
        index,
        guard,
        now
      );
    }
  },
  intercept(projectile,index,now=performance.now()){
    let nearest=null,nearestContact=null;
    for(const [key,guard] of this.active){
      if(!guard?.source?.alive||guard.expiresAt<=now){
        this.active.delete(key);
        continue;
      }
      if(!this.hostile(guard,projectile.source)||guard.handledProjectiles?.has(projectile))continue;
      const contact=this.contactPoint(guard,projectile);
      if(contact&&(!nearestContact||contact.distance<nearestContact.distance)){
        nearest=guard;nearestContact=contact;
      }
    }
    if(!nearest)return false;
    if(Training.sessionMode==='online'&&!EntitySimulationAuthorityService.isLocal(nearest.source)){
      // 원격 방패 접촉은 이 화면에서도 접촉 위치까지만 먼저 보정한다.
      // 실제 방어 성공/자원 처리는 방패 소유자 권위가 확정해 전송한다.
      const overshoot=Math.hypot(projectile.x-nearestContact.x,projectile.y-nearestContact.y);
      projectile.x=nearestContact.x;projectile.y=nearestContact.y;
      projectile.travel=Math.max(0,(Number(projectile.travel)||0)-overshoot);
      nearest.handledProjectiles?.add(projectile);

      // 귀환형 투사체는 방패/패리에 막혀도 제거하지 않는다.
      // 접촉 위치에서 즉시 귀환으로 전환하고, 이후 권위측 return 확정 패킷으로 재동기화한다.
      if(this.isReturnAttack(projectile)){
        ProjectileStateService.beginReturn(
          projectile,
          {manual:false}
        );
        return true;
      }

      if(projectile.behavior?.impact?.resolveOnGuard===true){
        ProjectileImpactService.resolve(projectile,'guard');
      }
      ProjectileService.finish(projectile,projectile.hadHit===true);
      ProjectileService.items.splice(index,1);
      return true;
    }
    return this.resolveProjectile(projectile,index,nearest,now);
  },
  clearSource(source){
    for(const [key,guard] of this.active){
      if(guard.source===source)this.active.delete(key);
    }
  }
});