



/* field.segment
   살아있는 source Entity와 고정 anchor 사이의 선분을 일정 시간 전투 영역으로 유지한다.
   캐릭터 이름을 모르며, 같은 stateKey 재활성화 시 이전 필드를 교체한다. */
const InstalledAreaFieldService=Object.freeze({
  KIND:'installed-area-field-state',

  baseKey(moduleOrStateKey='area'){
    const raw=
      typeof moduleOrStateKey==='string'
        ?moduleOrStateKey
        :moduleOrStateKey?.stateKey;
    return String(raw||'area');
  },

  states(source,baseStateKey=null){
    if(!source?.actionState)return [];
    const base=
      baseStateKey===null
        ?null
        :this.baseKey(baseStateKey);
    const result=[];
    for(const state of source.actionState.values()){
      if(state?.kind!==this.KIND)continue;
      if(base!==null&&state.baseStateKey!==base)continue;
      result.push(state);
    }
    return result;
  },

  // UI/조건 조회처럼 상태 객체 배열이 필요 없는 경우 임시 배열 생성을 피한다.
  countStates(source,baseStateKey=null,phase=null){
    if(!source?.actionState)return 0;
    const base=
      baseStateKey===null
        ?null
        :this.baseKey(baseStateKey);
    const wantedPhase=
      phase===null||phase===undefined
        ?null
        :String(phase);
    let count=0;
    for(const state of source.actionState.values()){
      if(state?.kind!==this.KIND)continue;
      if(base!==null&&state.baseStateKey!==base)continue;
      if(wantedPhase!==null&&state.phase!==wantedPhase)continue;
      count++;
    }
    return count;
  },

  findState(source,baseStateKey=null,predicate=null){
    if(!source?.actionState)return null;
    const base=
      baseStateKey===null
        ?null
        :this.baseKey(baseStateKey);
    for(const state of source.actionState.values()){
      if(state?.kind!==this.KIND)continue;
      if(base!==null&&state.baseStateKey!==base)continue;
      if(predicate&&!predicate(state))continue;
      return state;
    }
    return null;
  },

  pending(source,moduleOrStateKey){
    const base=this.baseKey(moduleOrStateKey);
    return this.findState(
      source,
      base,
      state=>state.phase==='source-wall'
    );
  },

  pairAnchorCount(source,moduleOrStateKey){
    if(!source?.actionState)return 0;
    const base=this.baseKey(moduleOrStateKey);
    let count=0;
    for(const state of source.actionState.values()){
      if(
        state?.kind!==this.KIND||
        state.baseStateKey!==base
      )continue;
      if(state.phase==='source-wall')count+=1;
      else if(state.phase==='wall-wall')count+=2;
    }
    return count;
  },

  ensurePairAnchorCapacity(source,module,additional=1){
    const maxAnchors=Math.max(0,Math.floor(Number(module?.maxAnchors)||0));
    if(maxAnchors<=0)return true;
    const base=this.baseKey(module);
    const needed=Math.max(0,Math.floor(Number(additional)||0));

    while(this.pairAnchorCount(source,base)+needed>maxAnchors){
      let oldest=null;
      for(const state of source.actionState.values()){
        if(
          state?.kind!==this.KIND||
          state.baseStateKey!==base||
          (state.phase!=='source-wall'&&state.phase!=='wall-wall')
        )continue;
        if(
          !oldest||
          (Number(state.startedAt)||0)<(Number(oldest.startedAt)||0)
        )oldest=state;
      }
      if(!oldest)break;
      this.clearState(source,oldest);
    }
    return true;
  },

  nextId(source,baseStateKey){
    source._installedAreaFieldSequence=
      Math.max(
        0,
        Number(source._installedAreaFieldSequence)||0
      )+1;
    return `${baseStateKey}:${source._installedAreaFieldSequence}`;
  },

  storageKey(instanceId){
    return `field:${String(instanceId||'area')}`;
  },

  interval(module){
    return Math.max(
      0,
      Number(module?.interval)||0
    );
  },

  intervalMode(module){
    return (
      String(module?.intervalMode||'per-target')==='global'
        ?'global'
        :'per-target'
    );
  },

  pathTimeline(state,now=performance.now()){
    const config=state?.module?.pathTimeline;
    if(!config||state?.phase!=='point')return null;
    const fullRange=Math.max(0,Number(state.module?.range)||0);
    const duration=Math.max(GAME_DATA.frameMs,Number(state.endsAt)-Number(state.startedAt));
    if(!Number.isFinite(duration)||duration<=0)return null;
    const progress=Math.max(0,Math.min(1,(now-Number(state.startedAt||now))/duration));
    const revealEnd=Math.max(.001,Math.min(.49,Number(config.revealRatio)||.10));
    const fadeStart=Math.max(revealEnd,Math.min(.999,Number(config.fadeStart)||.75));
    let offset=0;
    let length=fullRange;
    if(progress<revealEnd){
      length=fullRange*(progress/revealEnd);
    }else if(progress>=fadeStart){
      const shrink=(progress-fadeStart)/Math.max(.001,1-fadeStart);
      offset=fullRange*Math.max(0,Math.min(1,shrink));
      length=fullRange*(1-Math.max(0,Math.min(1,shrink)));
    }
    return {progress,offset,length:Math.max(0,length),fullRange,revealEnd,fadeStart};
  },

  damageStackGroup(module){
    return String(module?.damageStackGroup||'').trim();
  },

  damageStackStore(source){
    if(!(source?._fieldDamageStackCooldowns instanceof Map)){
      source._fieldDamageStackCooldowns=new Map();
    }
    return source._fieldDamageStackCooldowns;
  },

  damageStackKey(module,target){
    const group=this.damageStackGroup(module);
    const targetKey=this.targetKey(target);
    return group&&targetKey?`${group}:${targetKey}`:'';
  },

  damageStackReady(source,state,target,now){
    const key=this.damageStackKey(state?.module,target);
    if(!key)return true;
    const last=Number(this.damageStackStore(source).get(key)||0);
    const interval=Math.max(0,this.interval(state?.module));
    return last<=0||interval<=0||now-last>=interval;
  },

  markDamageStack(source,state,target,now){
    const key=this.damageStackKey(state?.module,target);
    if(!key)return false;
    this.damageStackStore(source).set(key,now);
    return true;
  },

  attackBaseDamage(source,state){
    return Math.max(0,Number(source?.baseDamage)||0)*Math.max(0,Number(state?.attack?.damageRatio)||0);
  },

  dominantDamageState(source,state,target,now){
    const group=this.damageStackGroup(state?.module);
    if(!group||!source?.actionState)return state;
    const point=NetworkCollisionPositionService.point(target);
    let best=null;
    let bestDamage=-Infinity;
    for(const candidate of source.actionState.values()){
      if(
        candidate?.kind!==this.KIND||
        candidate.phase==='afterlife'||
        now>=Number(candidate.endsAt||Infinity)||
        this.damageStackGroup(candidate.module)!==group||
        !candidate.attack||
        !this.relationAllowed(source,target,candidate.module)||
        !this.triggerReady(candidate,target,now)
      )continue;
      const area=this.collisionArea(candidate,now);
      if(!area||!this.overlapsAreaPoint(area,point.x,point.y,target.radius,candidate.areaGeometry))continue;
      const damage=this.attackBaseDamage(source,candidate);
      if(
        damage>bestDamage+.0001||
        (
          Math.abs(damage-bestDamage)<=.0001&&
          (
            !best||
            (Number(candidate.startedAt)||0)<(Number(best.startedAt)||0)||
            (
              (Number(candidate.startedAt)||0)===(Number(best.startedAt)||0)&&
              String(candidate.instanceId||'')<String(best.instanceId||'')
            )
          )
        )
      ){
        best=candidate;
        bestDamage=damage;
      }
    }
    return best||state;
  },

  relationAllowed(source,target,module){
    if(
      Array.isArray(module?.targetKinds)&&
      !module.targetKinds.includes(target?.kind)
    )return false;

    const sourceOwner=
      EntityService.owner(source);
    const targetOwner=
      EntityService.owner(target);

    if(
      module?.ownerScope==='source'&&
      targetOwner!==sourceOwner
    )return false;

    if(
      module?.ownerScope==='other-owner'&&
      targetOwner===sourceOwner
    )return false;

    const relation=
      target===source
        ?'self'
        :RelationService.relation(
          source,
          target
        );
    const allowed=
      Array.isArray(module?.targetRelations)
        ?module.targetRelations
        :['enemy'];
    return allowed.includes(relation);
  },

  targetKey(target){
    return String(
      target?.id||
      OnlineParticipantEntityService.pid(target)||
      ''
    );
  },

  sourceIdentity(source){
    if(!source)return '';
    if(Training.sessionMode==='online'){
      const pid=OnlineParticipantEntityService.pid(source);
      if(pid)return `pid:${pid}`;
    }
    return `entity:${String(source.id||'unknown')}`;
  },

  triggerReady(state,target,now){
    const interval=this.interval(state?.module);
    if(interval<=0)return true;

    if(this.intervalMode(state.module)==='global'){
      return now>=Number(state.nextGlobalTriggerAt||0);
    }

    const key=this.targetKey(target);
    if(!key)return false;

    const last=Number(state.lastTriggerAt?.get(key)||0);
    if(last>0)return now-last>=interval;

    if(state.module?.triggerOnEnter!==false){
      return true;
    }

    const firstSeen=Number(
      state.firstSeenAt?.get(key)||0
    );
    if(firstSeen<=0){
      if(!(state.firstSeenAt instanceof Map)){
        state.firstSeenAt=new Map();
      }
      state.firstSeenAt.set(key,now);
      return false;
    }

    return now-firstSeen>=interval;
  },

  markTriggered(state,target,now){
    if(this.intervalMode(state?.module)==='global'){
      return true;
    }

    const key=this.targetKey(target);
    if(!key)return false;
    if(!(state.lastTriggerAt instanceof Map)){
      state.lastTriggerAt=new Map();
    }
    state.lastTriggerAt.set(key,now);
    return true;
  },

  markGlobalTriggered(state,now){
    state.nextGlobalTriggerAt=
      now+
      Math.max(
        1,
        this.interval(state?.module)
      );
    return true;
  },

  triggerModules(state){
    return Array.isArray(state?.module?.onTrigger)
      ?state.module.onTrigger
      :[];
  },

  modifierStackGroup(module){
    return String(module?.stackGroup||'').trim();
  },

  modifierSourceId(source,state,module,stat){
    const stackGroup=this.modifierStackGroup(module);
    return stackGroup
      ?`${source.id}:field-stack:${stackGroup}:${stat}`
      :`${source.id}:${state.instanceId}:${stat}`;
  },

  statusSourceId(source,state,type){
    return `${this.sourceIdentity(source)}:${state.instanceId}:${String(type||'')}`;
  },

  hasOtherModifierCoverage(
    source,
    excludedState,
    target,
    module,
    stat,
    now=performance.now()
  ){
    const stackGroup=this.modifierStackGroup(module);
    if(
      !stackGroup||
      !source?.actionState||
      !target?.alive
    )return false;

    const point=
      NetworkCollisionPositionService.point(
        target
      );

    for(const candidate of source.actionState.values()){
      if(
        candidate===excludedState||
        candidate?.kind!==this.KIND||
        candidate.phase==='afterlife'||
        now>=Number(candidate.endsAt||Infinity)||
        !this.relationAllowed(
          source,
          target,
          candidate.module
        )
      )continue;

      const matchingModifier=
        this.triggerModules(candidate).some(
          candidateModule=>
            candidateModule?.type==='modifier.set'&&
            String(candidateModule.stat||'')===stat&&
            this.modifierStackGroup(candidateModule)===stackGroup
        );
      if(!matchingModifier)continue;

      const area=this.collisionArea(candidate);
      if(
        area&&
        this.overlapsAreaPoint(
          area,
          point.x,
          point.y,
          target.radius,
          candidate.areaGeometry
        )
      ){
        return true;
      }
    }

    return false;
  },

  applyTriggerModule(
    source,
    state,
    target,
    module,
    now
  ){
    if(!module||!target)return false;

    if(module.type==='resource.restore'){
      return ResourceRestoreEffectService.apply({
        source,target,module,defaultRecipient:'target',presentationDefault:'zone',reason:'field.resource.restore',now
      })>0;
    }

    if(module.type==='status.apply'){
      const type=String(module.status||'');
      if(!COMBAT_STATUS_DEFS[type])return false;

      /*
        온라인 point field는 field-point-spawn으로 대상 권위 클라이언트에
        동일 gameplay state 자체가 복제된다. source 권위 화면에서 원격 대상에게
        status 패킷까지 별도로 보내면, 대상 쪽 field가 적용한 native status 뒤에
        복제 status가 늦게 도착해 presentationOrder를 다시 덮을 수 있다.
        따라서 동기화되는 point field의 원격 대상 status는 대상 권위 field 실행
        한 경로에서만 적용한다.
      */
      if(
        Training.sessionMode==='online'&&
        OnlineDuelService.active&&
        state?.phase==='point'&&
        EntitySimulationAuthorityService.isLocal(source)&&
        !EntitySimulationAuthorityService.isLocal(target)&&
        OnlinePresentationSyncService?.shouldSend?.(source)
      ){
        return true;
      }

      const duration=Math.max(
        0,
        Number(module.duration)||0
      );

      const targetKey=this.targetKey(target);
      if(!(state.presentationOrderByTarget instanceof Map)){
        state.presentationOrderByTarget=new Map();
      }
      let presentationOrder=Number(
        state.presentationOrderByTarget.get(targetKey)
      );
      if(!Number.isFinite(presentationOrder)){
        presentationOrder=
          CombatStatusApplicationService.nextPresentationOrder();
        state.presentationOrderByTarget.set(
          targetKey,
          presentationOrder
        );
      }

      return CombatStatusApplicationService.apply({
        source,
        target,
        type,
        duration,
        sourceId:this.statusSourceId(source,state,type),
        data:{
          ...(module.data||{}),
          sourceEntityId:source.id,
          fieldInstanceId:state.instanceId,
          presentationAppliedAt:
            Number(
              state.enteredAt?.get(targetKey)
            )||now,
          presentationStartedAt:
            Number(
              state.enteredAt?.get(targetKey)
            )||now,
          presentationOrder,
          preservePresentationOnRefresh:true
        }
      });
    }

    if(module.type==='modifier.set'){
      const stat=String(module.stat||'');
      if(!COMBAT_BUFF_DEFS[stat])return false;

      return BuffService.refresh(
        target,
        stat,
        Number(module.value)||0,
        this.modifierSourceId(
          source,
          state,
          module,
          stat
        ),
        Number.isFinite(Number(module.duration))
          ?Math.max(0,Number(module.duration)||0)
          :Infinity,
        {
          ...(module.data||{}),
          sourceEntityId:source.id,
          fieldInstanceId:state.instanceId
        }
      );
    }

    return false;
  },

  runEnterCcModules(
    source,
    state,
    target,
    now
  ){
    let applied=false;

    for(const module of this.triggerModules(state)){
      if(module?.type!=='status.apply')continue;

      const type=String(module.status||'');
      if(
        COMBAT_STATUS_DEFS[type]?.kind!=='cc'
      )continue;

      applied=
        this.applyTriggerModule(
          source,
          state,
          target,
          module,
          now
        )||applied;
    }

    return applied;
  },

  runTriggerModules(
    source,
    state,
    target,
    now
  ){
    let triggered=false;

    for(const module of this.triggerModules(state)){
      triggered=
        this.applyTriggerModule(
          source,
          state,
          target,
          module,
          now
        )||triggered;
    }

    return triggered;
  },

  removeExitModules(
    source,
    state,
    target
  ){
    if(!source||!state||!target)return false;

    let removed=false;

    for(const module of this.triggerModules(state)){
      if(module?.removeOnExit!==true)continue;

      if(module.type==='modifier.set'){
        const stat=String(module.stat||'');
        if(!COMBAT_BUFF_DEFS[stat])continue;

        if(
          this.hasOtherModifierCoverage(
            source,
            state,
            target,
            module,
            stat
          )
        ){
          continue;
        }

        removed=
          BuffService.remove(
            target,
            stat,
            this.modifierSourceId(
              source,
              state,
              module,
              stat
            )
          )||removed;
        continue;
      }

      if(module.type==='status.apply'){
        const type=String(module.status||'');
        if(!COMBAT_STATUS_DEFS[type])continue;

        removed=
          CCService.removeSource(
            target,
            type,
            this.statusSourceId(source,state,type)
          )||removed;
      }
    }

    return removed;
  },


  fieldTrigger(source,state,target,area,now){
    if(!this.triggerReady(state,target,now)){
      return {triggered:false,hit:false};
    }

    let triggered=false;
    let hit=false;

    if(state.attack){
      const targetKey=this.targetKey(target);
      const alreadyDamagedInExecution=
        state.module?.skipIfExecutionAlreadyDamagedTarget===true&&
        (
          ExecutionDamageLedgerService.hasDamage(
            source,
            target,
            state.execution
          )||
          (
            state.execution?.damageByTarget instanceof Map&&
            Math.max(0,Number(state.execution.damageByTarget.get(targetKey))||0)>0
          )
        );

      if(alreadyDamagedInExecution){
        return {
          triggered:false,
          hit:false,
          skippedExistingExecutionDamage:true,
          dodged:false,
          consumed:false
        };
      }

      const result=
        AttackHitTriggerService.damage({
          source,
          target,
          attack:state.attack,
          execution:state.execution,
          impact:{
            type:'field-area',
            shape:String(area?.module?.shape||state.module?.shape||'circle'),
            directionAngle:Number(area?.angle)||0,
            origin:area?.center
              ?{x:area.center.x,y:area.center.y}
              :null,
            point:{
              x:Number(target.x)||0,
              y:Number(target.y)||0
            }
          }
        });

      if(
        result.hit&&
        result.authoritative!==false&&
        !result.duplicateExecutionHit
      ){
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
          Number(area?.angle)||0
        );
      }

      hit=
        result.hit&&
        result.authoritative!==false;

      // field.area의 한 피해 틱을 저스트 회피/무적으로 막았어도 그 틱 자체는 소비한다.
      // 반복 장판은 원래 interval 뒤에 다음 틱을 시도하고, 일회성 장판은 기존처럼 즉시 소비된다.
      // 같은 틱을 매 프레임 재시도해 회피 무적 종료 직후 피해가 새어 들어가는 것을 막는다.
      if(result.dodged===true){
        this.markTriggered(
          state,
          target,
          now
        );
        const consumed=state.module?.removeOnTrigger===true;
        return {
          triggered:false,
          hit:false,
          dodged:true,
          consumed
        };
      }

      // 반 스패너가 장판 피해를 100% 흡수한 경우도 '이번 장판 틱의 접촉'은 완료된 것이다.
      // hit:false만 보고 틱을 소비하지 않으면 같은 field.area가 다음 프레임에 즉시 재시도해
      // 내구도가 프레임 단위로 연속 감소한다. 틱 시계만 소비하고 CC/온힛/기타 onTrigger는
      // 완전 흡수 규칙대로 발동시키지 않는다.
      if(result.durabilityBlocked===true){
        this.markTriggered(
          state,
          target,
          now
        );
        const consumed=state.module?.removeOnTrigger===true;
        return {
          triggered:false,
          hit:false,
          dodged:false,
          durabilityBlocked:true,
          consumed
        };
      }

      triggered=hit||triggered;
    }

    triggered=
      this.runTriggerModules(
        source,
        state,
        target,
        now
      )||triggered;

    if(triggered){
      this.markTriggered(
        state,
        target,
        now
      );
    }

    return {triggered,hit,dodged:false,consumed:false};
  },

  wallDescriptor(wall){
    if(!wall)return null;
    return {
      x:Number(wall.x)||0,
      y:Number(wall.y)||0,
      w:Math.max(0,Number(wall.w)||0),
      h:Math.max(0,Number(wall.h)||0)
    };
  },

  descriptor(state){
    if(!state)return null;
    return {
      instanceId:String(state.instanceId||''),
      baseStateKey:String(state.baseStateKey||'segment'),
      phase:String(state.phase||'source-wall'),
      point:
        state.phase==='point'
          ?{
            x:Number(state.pointX)||0,
            y:Number(state.pointY)||0
          }
          :null,
      anchorEntityId:
        state.phase==='attached'
          ?String(state.anchorEntityId||'')
          :'',
      wallA:this.wallDescriptor(state.wallA),
      wallB:this.wallDescriptor(state.wallB)
    };
  },

  sameWall(a,b,tolerance=.01){
    if(!a||!b)return a===b;
    const eps=Math.max(0,Number(tolerance)||0);
    return (
      Math.abs((Number(a.x)||0)-(Number(b.x)||0))<=eps&&
      Math.abs((Number(a.y)||0)-(Number(b.y)||0))<=eps&&
      Math.abs((Number(a.w)||0)-(Number(b.w)||0))<=eps&&
      Math.abs((Number(a.h)||0)-(Number(b.h)||0))<=eps
    );
  },

  matchesDescriptor(state,descriptor){
    if(!state||!descriptor)return false;
    if(
      String(state.baseStateKey||'segment')!==
      String(descriptor.baseStateKey||'segment')
    )return false;
    const phase=String(state.phase||'source-wall');
    if(
      phase!==
      String(descriptor.phase||'source-wall')
    )return false;

    if(phase==='point'){
      const point=descriptor.point;
      if(!point)return false;
      const tolerance=1;
      return (
        Math.abs((Number(state.pointX)||0)-(Number(point.x)||0))<=tolerance&&
        Math.abs((Number(state.pointY)||0)-(Number(point.y)||0))<=tolerance
      );
    }

    if(phase==='attached'){
      return (
        String(state.anchorEntityId||'')===
        String(descriptor.anchorEntityId||'')
      );
    }

    if(!this.sameWall(state.wallA,descriptor.wallA))return false;
    if(
      phase==='wall-wall'&&
      !this.sameWall(state.wallB,descriptor.wallB)
    )return false;
    return true;
  },

  clearResolved(source,descriptor,options={}){
    if(!source?.actionState||!descriptor)return false;

    const instanceId=String(descriptor.instanceId||'');
    if(instanceId){
      const exact=this.findState(
        source,
        null,
        state=>
          state.instanceId===instanceId||
          state.storageKey===instanceId
      );
      if(exact){
        if(
          options.triggered===true&&
          Math.max(0,Number(exact.module?.triggerAfterlife)||0)>0
        ){
          return this.settleTriggered(source,exact,performance.now(),false);
        }
        return this.clearState(source,exact,options);
      }
    }

    const matched=this.findState(
      source,
      String(descriptor.baseStateKey||'segment'),
      state=>this.matchesDescriptor(state,descriptor)
    );

    if(matched){
      if(
        options.triggered===true&&
        Math.max(0,Number(matched.module?.triggerAfterlife)||0)>0
      ){
        return this.settleTriggered(source,matched,performance.now(),false);
      }
      return this.clearState(
        source,
        matched,
        options
      );
    }

    // 이미 이 화면에서 먼저 제거된 동일 필드라면 네트워크 결과는 멱등적으로 처리한다.
    return true;
  },

  settleTriggered(source,state,now=performance.now(),presentation=true){
    const duration=Math.max(0,Number(state?.module?.triggerAfterlife)||0);
    if(!source?.actionState||!state||duration<=0)return false;

    if(presentation){
      this.detonationPointPresentation(source,state,now);
    }
    if(state.insideTargets instanceof Map){
      for(const target of state.insideTargets.values()){
        this.removeExitModules(source,state,target);
      }
      state.insideTargets.clear();
    }
    state.nextInsideTargets?.clear?.();
    state.enteredAt?.clear();
    state.containedTargetKeys?.clear?.();
    state.presentationOrderByTarget?.clear();
    state.pendingTrigger=null;
    state.attack=null;
    state.phase='afterlife';
    state.armedAt=Infinity;
    state.endsAt=now+duration;

    EffectSpawnService.removeKey(state.ropeEffectKey);
    EffectSpawnService.removeKey(state.areaEffectKey);
    for(const effectKey of state.wallEffectKeys||[]){
      EffectSpawnService.removeKey(effectKey);
    }
    return true;
  },

  blocksStaminaRegen(source,now=performance.now()){
    return !!this.findState(
      source,
      null,
      state=>
        state?.module?.blocksStaminaRegen===true&&
        state?.phase!=='afterlife'&&
        state?.rewardOnly!==true&&
        now<Number(state?.endsAt||Infinity)
    );
  },

  retainRewardOnly(source,state,duration,now=performance.now()){
    const retain=Math.max(0,Number(duration)||0);
    if(!source?.actionState||!state||retain<=0)return false;
    if(!state.module?.dodgeReward)return this.clearState(source,state);
    state.rewardOnly=true;
    state.endsAt=now+retain;
    state.pendingTrigger=null;
    if(state.insideTargets instanceof Map){
      for(const target of state.insideTargets.values())this.removeExitModules(source,state,target);
      state.insideTargets.clear();
    }
    state.nextInsideTargets?.clear?.();
    state.enteredAt?.clear?.();
    state.containedTargetKeys?.clear?.();
    EffectSpawnService.removeKey(state.ropeEffectKey);
    EffectSpawnService.removeKey(state.areaEffectKey);
    for(const effectKey of state.wallEffectKeys||[])EffectSpawnService.removeKey(effectKey);
    return true;
  },

  clearState(source,state,options={}){
    if(!source?.actionState||!state)return false;

    if(options.triggered===true){
      this.revealSegmentTrigger(source,state,performance.now());
    }

    if(state.insideTargets instanceof Map){
      for(const target of state.insideTargets.values()){
        this.removeExitModules(
          source,
          state,
          target
        );
      }
      state.insideTargets.clear();
    }
    state.enteredAt?.clear();
    state.containedTargetKeys?.clear?.();
    state.presentationOrderByTarget?.clear();

    const key=String(state.storageKey||'');
    if(key&&source.actionState.get(key)===state){
      source.actionState.delete(key);
    }else{
      for(const [candidate,value] of source.actionState){
        if(value!==state)continue;
        source.actionState.delete(candidate);
        break;
      }
    }

    EffectSpawnService.removeKey(state.ropeEffectKey);
    EffectSpawnService.removeKey(state.areaEffectKey);
    for(const effectKey of state.wallEffectKeys||[]){
      EffectSpawnService.removeKey(effectKey);
    }

    if(
      options.broadcast!==false&&
      EntitySimulationAuthorityService.isLocal(source)&&
      Training.sessionMode==='online'&&
      typeof OnlineDuelService!=='undefined'&&
      OnlineDuelService.active
    ){
      OnlineDuelService.sendFieldClear(
        state.instanceId
      );
    }
    return true;
  },

  clear(source,stateKey='segment',options={}){
    if(!source?.actionState)return false;

    const raw=String(stateKey||'segment');
    const exact=this.findState(
      source,
      null,
      state=>
        state.instanceId===raw||
        state.storageKey===raw
    );
    if(exact){
      return this.clearState(source,exact,options);
    }

    // 기존 호출 호환: base stateKey를 넘기면 해당 base의 모든 field 제거.
    const base=this.baseKey(raw);
    let changed=false;
    for(const state of source.actionState.values()){
      if(
        state?.kind!==this.KIND||
        state.baseStateKey!==base
      )continue;
      changed=
        this.clearState(source,state,options)||
        changed;
    }
    return changed;
  },

  resolveContact(source,state,target,outcome){
    if(!source||!state||!target)return false;

    if(
      !NetworkHitAuthorityService
        .targetAuthoritative(target)
    )return false;

    const descriptor=this.descriptor(state);

    const afterlife=
      Math.max(0,Number(state.module?.triggerAfterlife)||0)>0;
    if(afterlife){
      this.settleTriggered(source,state,performance.now(),true);
    }else{
      this.clearState(
        source,
        state,
        {broadcast:false,triggered:true}
      );
    }

    if(
      Training.sessionMode==='online'&&
      OnlineDuelService.active
    ){
      const fieldOwnerPid=
        OnlineParticipantEntityService.pid(
          EntityService.owner(source)
        );

      if(fieldOwnerPid){
        // 피격자 소유 클라이언트가 확정 결과를 모든 참가자에게 보낸다.
        // 송신자와 로프 소유자가 같을 수도/다를 수도 있으므로 PID 역할을 분리한다.
        OnlineDuelService.sendFieldResolved(
          fieldOwnerPid,
          descriptor,
          outcome
        );
      }
    }

    return true;
  },

  wallCopy(wall){
    return {
      x:Number(wall?.x)||0,
      y:Number(wall?.y)||0,
      w:Math.max(0,Number(wall?.w)||0),
      h:Math.max(0,Number(wall?.h)||0)
    };
  },

  revealSegmentTrigger(source,state,now=performance.now()){
    if(
      !source||
      !state||
      state.phase!=='wall-wall'||
      state.module?.revealOnTrigger!==true
    )return false;

    const duration=Math.max(
      GAME_DATA.frameMs,
      Number(state.module?.triggerRevealDuration)||300
    );
    EffectSpawnService.spawn({
      type:'segmentRope',
      key:`field-segment-trigger:${source.id}:${state.instanceId}:${Math.floor(now)}`,
      sourceEntityId:source.id,
      fromX:Number(state.ax)||0,
      fromY:Number(state.ay)||0,
      tx:Number(state.bx)||0,
      ty:Number(state.by)||0,
      width:Math.max(1,Number(state.module?.ropeLineWidth)||4),
      color:state.module?.ropeColor||'74,222,128',
      alpha:Math.max(0,Math.min(1,Number(state.module?.ropeAlpha)||.9)),
      lineCap:state.module?.ropeLineCap||'round',
      fadeOut:true,
      start:now,
      dur:duration
    },{source});
    return true;
  },

  wallEffect(source,state,wall,index,now,duration){
    if(state.module?.wallOutline===false)return null;

    const key=
      `field-segment-wall:${source.id}:${state.instanceId}:${index}`;

    const pairedVisibilityPolicy=String(
      state.module?.pairedVisibilityPolicy||''
    );
    const visibility=
      state.phase==='wall-wall'
        ?(
          pairedVisibilityPolicy==='owner-only'
            ?'owner'
            :pairedVisibilityPolicy==='friendly-only'
              ?'owner-team'
              :'all'
        )
        :'all';

    EffectSpawnService.spawn({
      type:'wallOutline',
      key,
      x:wall.x,
      y:wall.y,
      w:wall.w,
      h:wall.h,
      color:source.color,
      sourceEntityId:source.id,
      visibility,
      lineWidth:Math.max(
        1,
        Number(state.module?.wallLineWidth)||3
      ),
      alpha:Math.max(
        0,
        Math.min(
          1,
          Number(state.module?.wallAlpha)||.82
        )
      ),
      start:now,
      dur:duration
    },{source});

    return key;
  },

  spawnRopeEffect(source,state,now,duration){
    const module=state.module||{};
    const ropeEffectKey=
      `field-segment-rope:${source.id}:${state.instanceId}`;
    state.ropeEffectKey=ropeEffectKey;

    EffectSpawnService.spawn({
      type:'segmentRope',
      key:ropeEffectKey,
      sourceEntityId:source.id,
      fieldStateRef:state,
      width:Math.max(
        1,
        Number(module.ropeLineWidth)||4
      ),
      color:
        module.ropeColor||
        '74,222,128',
      alpha:Math.max(
        0,
        Math.min(
          1,
          Number(module.ropeAlpha)||.9
        )
      ),
      lineCap:
        module.ropeLineCap||
        'round',
      start:now,
      dur:duration
    },{source});
  },

  collisionArea(state,now=performance.now()){
    if(!state)return null;

    if(state.phase==='point'){
      let x=Number(state.pointX)||0;
      let y=Number(state.pointY)||0;
      const shape=String(state.module?.shape||'circle');
      let range=Math.max(0,Number(state.module?.range)||0);
      const angle=Number(state.module?.angle)||0;
      const timeline=this.pathTimeline(state,now);
      if(timeline&&shape==='rect'){
        x+=Math.cos(angle)*timeline.offset;
        y+=Math.sin(angle)*timeline.offset;
        range=timeline.length;
      }

      return {
        source:{x,y},
        module:{
          type:'delivery.area',
          shape,
          range,
          halfWidth:Math.max(0,Number(state.module?.halfWidth)||0),
          halfAngle:Math.max(0,Number(state.module?.halfAngle)||0),
          wallPolicy:String(
            state.module?.wallPolicy||
            'ignore'
          )
        },
        angle,
        center:{x,y}
      };
    }

    if(state.phase==='attached'){
      const anchor=
        EntityService.items.get(
          String(state.anchorEntityId||'')
        );
      if(!anchor?.alive)return null;

      const shape=
        String(state.module?.shape||'circle');
      const range=
        Math.max(
          0,
          Number(state.module?.range)||0
        );
      const angle=
        Number(state.module?.angle)||0;

      return {
        source:{
          x:Number(anchor.x)||0,
          y:Number(anchor.y)||0
        },
        module:{
          type:'delivery.area',
          shape,
          range,
          halfWidth:Math.max(
            0,
            Number(state.module?.halfWidth)||0
          ),
          halfAngle:Math.max(
            0,
            Number(state.module?.halfAngle)||0
          ),
          wallPolicy:String(
            state.module?.wallPolicy||
            'ignore'
          )
        },
        angle,
        center:{
          x:Number(anchor.x)||0,
          y:Number(anchor.y)||0
        }
      };
    }

    const ax=Number(state.ax)||0;
    const ay=Number(state.ay)||0;
    const bx=Number(state.bx)||0;
    const by=Number(state.by)||0;
    const dx=bx-ax;
    const dy=by-ay;
    const range=Math.hypot(dx,dy);
    const angle=
      range>1e-8
        ?Math.atan2(dy,dx)
        :0;

    return {
      source:{x:ax,y:ay},
      module:{
        type:'delivery.area',
        shape:'rect',
        range,
        halfWidth:
          Math.max(
            0,
            Number(state.module?.width)||28
          )/2,
        wallPolicy:'ignore'
      },
      angle,
      center:{
        x:ax+dx*.5,
        y:ay+dy*.5
      }
    };
  },

  overlapsAreaPoint(area,x,y,radius=0,geometry=null){
    if(!area)return false;

    return AreaAttackService.containsPoint(
      area.module,
      area.source,
      Number(x)||0,
      Number(y)||0,
      Math.max(0,Number(radius)||0),
      area.angle,
      geometry
    );
  },

  containsTarget(source,baseStateKey,target=source,now=performance.now()){
    if(!source?.actionState||!target?.alive)return false;
    const base=this.baseKey(baseStateKey);
    const point=NetworkCollisionPositionService.point(target);

    for(const state of source.actionState.values()){
      if(
        state?.kind!==this.KIND||
        state.baseStateKey!==base||
        state.phase==='afterlife'||
        now>=Number(state.endsAt||Infinity)||
        (
          Number.isFinite(Number(state.module?.activeDuration))&&
          now>=Number(state.startedAt||0)+Math.max(0,Number(state.module.activeDuration)||0)
        )
      )continue;

      const area=this.collisionArea(state,now);
      if(!area)continue;
      const geometry=(area.module.shape==='circle'||area.module.shape==='sector'||area.module.shape==='tapered-rect')
        ?AreaGeometryService.polygon(area.source,area.module,area.angle)
        :null;
      if(this.overlapsAreaPoint(area,point.x,point.y,target.radius,geometry))return true;
    }

    return false;
  },



  refreshEndpoints(source,state){
    if(!source||!state)return false;

    if(state.phase==='point'){
      return (
        Number.isFinite(Number(state.pointX))&&
        Number.isFinite(Number(state.pointY))
      );
    }

    if(state.phase==='attached'){
      return !!EntityService.items.get(
        String(state.anchorEntityId||'')
      );
    }

    if(state.phase==='source-wall'){
      const point=
        WorldGeometryService.closestPointOnRectPerimeter(
          source.x,
          source.y,
          state.wallA
        );

      state.ax=Number(source.x)||0;
      state.ay=Number(source.y)||0;
      state.bx=point.x;
      state.by=point.y;
      return true;
    }

    if(state.phase==='wall-wall'){
      const aCenterX=
        state.wallA.x+state.wallA.w/2;
      const aCenterY=
        state.wallA.y+state.wallA.h/2;
      const bCenterX=
        state.wallB.x+state.wallB.w/2;
      const bCenterY=
        state.wallB.y+state.wallB.h/2;

      const a=
        WorldGeometryService.closestPointOnRectPerimeter(
          bCenterX,
          bCenterY,
          state.wallA
        );
      const b=
        WorldGeometryService.closestPointOnRectPerimeter(
          aCenterX,
          aCenterY,
          state.wallB
        );

      state.ax=a.x;
      state.ay=a.y;
      state.bx=b.x;
      state.by=b.y;
      return true;
    }

    return false;
  },


  attachedState(
    source,
    module,
    anchorEntity
  ){
    if(!source?.actionState||!module||!anchorEntity){
      return null;
    }

    const base=this.baseKey(module);
    return this.findState(
      source,
      base,
      state=>
        state.phase==='attached'&&
        state.anchorEntityId===anchorEntity.id
    );
  },

  ensureAttached(
    source,
    module,
    anchorEntity,
    now=performance.now()
  ){
    if(
      !source?.actionState||
      !module||
      !anchorEntity?.alive
    )return false;

    const existing=this.attachedState(
      source,
      module,
      anchorEntity
    );
    if(existing){
      existing.endsAt=
        Number.isFinite(Number(module.duration))
          ?Math.max(
            existing.endsAt,
            now+Math.max(
              GAME_DATA.frameMs,
              Number(module.duration)||GAME_DATA.frameMs
            )
          )
          :Infinity;
      existing.module=module;

      if(existing.areaEffectKey){
        const effect=
          EffectSpawnService.getByKey(
            existing.areaEffectKey
          );
        if(effect){
          effect.range=Math.max(
            0,
            Number(
              module.presentationEffect?.range
            )||
            Number(module.range)||
            0
          );
          effect.r=effect.range;
          effect.dur=
            existing.endsAt===Infinity
              ?Infinity
              :Math.max(
                GAME_DATA.frameMs,
                existing.endsAt-now
              );
        }
      }

      return existing;
    }

    const baseStateKey=this.baseKey(module);
    const instanceId=this.nextId(
      source,
      baseStateKey
    );
    const storageKey=this.storageKey(instanceId);
    const duration=
      Number.isFinite(Number(module.duration))
        ?Math.max(
          GAME_DATA.frameMs,
          Number(module.duration)||GAME_DATA.frameMs
        )
        :Infinity;

    const state={
      kind:this.KIND,
      storageKey,
      instanceId,
      baseStateKey,
      phase:'attached',
      attack:null,
      execution:null,
      module,
      anchorEntityId:anchorEntity.id,
      startedAt:now,
      endsAt:
        duration===Infinity
          ?Infinity
          :now+duration,
      nextGlobalTriggerAt:
        now+Math.max(
          0,
          this.interval(module)
        ),
      lastTriggerAt:new Map(),
      firstSeenAt:new Map(),
      insideTargets:new Map(),
      enteredAt:new Map(),
      pendingTrigger:null,
      ropeEffectKey:null,
      areaEffectKey:null,
      wallEffectKeys:[]
    };

    source.actionState.set(
      storageKey,
      state
    );

    const presentationEffect=
      module.presentationEffect&&
      typeof module.presentationEffect==='object'&&
      module.presentationEffect.type==='effect.spawn'
        ?module.presentationEffect
        :null;

    if(presentationEffect){
      const key=
        `field-attached:${source.id}:${instanceId}`;
      state.areaEffectKey=key;

      EffectSpawnService.spawn({
        ...presentationEffect,
        type:String(
          presentationEffect.renderType||
          'areaCircle'
        ),
        strokeColorMode:'source-team',
        key,
        sourceEntityId:anchorEntity.id,
        followSource:true,
        x:Number(anchorEntity.x)||0,
        y:Number(anchorEntity.y)||0,
        range:Math.max(
          0,
          Number(
            presentationEffect.range
          )||
          Number(module.range)||
          0
        ),
        r:Math.max(
          0,
          Number(
            presentationEffect.r
          )||
          Number(module.range)||
          0
        ),
        start:now,
        dur:duration
      },{source:anchorEntity});
    }

    return state;
  },

  activatePoint(
    source,
    module,
    point,
    {
      attack=null,
      execution=null,
      instanceId=null,
      now=performance.now(),
      broadcast=true,
      preserveState=false,
      interpolatePresentation=false
    }={}
  ){
    if(
      !source?.actionState||
      !module||
      !point||
      !Number.isFinite(Number(point.x))||
      !Number.isFinite(Number(point.y))
    )return false;

    const baseStateKey=this.baseKey(module);

    const placementBlockRadius=Math.max(
      0,
      Number(module.placementBlockRadius)||0
    );
    if(placementBlockRadius>0){
      const blocked=this.findState(
        source,
        baseStateKey,
        state=>
          state.phase==='afterlife'&&
          Math.hypot(
            (Number(state.pointX)||0)-Number(point.x),
            (Number(state.pointY)||0)-Number(point.y)
          )<=placementBlockRadius
      );
      if(blocked)return false;
    }

    if(module.removeOwnedAtTarget===true){
      const removeRadius=Math.max(
        0,
        Number(module.removeTargetRadius)||Number(module.range)||0
      );
      let nearest=null;
      let nearestDistance=Infinity;
      for(const candidate of source.actionState.values()){
        if(
          candidate?.kind!==this.KIND||
          candidate.baseStateKey!==baseStateKey||
          candidate.phase!=='point'||
          candidate.pendingTrigger
        )continue;
        const distance=Math.hypot(
          Number(candidate.pointX)-Number(point.x),
          Number(candidate.pointY)-Number(point.y)
        );
        if(distance>removeRadius||distance>=nearestDistance)continue;
        nearest=candidate;
        nearestDistance=distance;
      }
      if(nearest){
        this.clearState(source,nearest);
        return {removed:true,state:nearest};
      }
      if(module.removeOnly===true)return false;
    }

    const maxInstances=Math.max(
      0,
      Math.floor(Number(module.maxInstances)||0)
    );
    if(maxInstances>0){
      while(true){
        let count=0;
        let oldest=null;
        for(const state of source.actionState.values()){
          if(
            state?.kind!==this.KIND||
            state.baseStateKey!==baseStateKey||
            state.phase!=='point'
          )continue;
          count++;
          if(
            !oldest||
            (Number(state.startedAt)||0)<
              (Number(oldest.startedAt)||0)
          ){
            oldest=state;
          }
        }
        if(count<maxInstances||!oldest)break;
        this.clearState(source,oldest);
      }
    }

    const resolvedInstanceId=
      String(instanceId||'').trim()||
      this.nextId(source,baseStateKey);
    const storageKey=this.storageKey(resolvedInstanceId);
    const infiniteDuration=String(module.duration||'')==='infinite';
    const duration=infiniteDuration
      ?Infinity
      :Math.max(
        GAME_DATA.frameMs,
        Number(module.duration)||GAME_DATA.frameMs
      );
    const x=Number(point.x);
    const y=Number(point.y);

    const state={
      kind:this.KIND,
      storageKey,
      instanceId:resolvedInstanceId,
      baseStateKey,
      phase:'point',
      attack,
      execution,
      module,
      pointX:x,
      pointY:y,
      presentationUpdatedAt:now,
      startedAt:now,
      armedAt:now+Math.max(0,Number(module.armDelay)||0),
      endsAt:duration===Infinity?Infinity:now+duration,
      nextGlobalTriggerAt:
        now+Math.max(0,this.interval(module)),
      lastTriggerAt:new Map(),
      firstSeenAt:new Map(),
      insideTargets:new Map(),
      enteredAt:new Map(),
      containedTargetKeys:new Set(),
      ropeEffectKey:null,
      areaEffectKey:null,
      areaGeometry:null,
      wallEffectKeys:[]
    };

    const previous=source.actionState.get(storageKey);
    if(
      previous?.kind===this.KIND&&
      (
        preserveState||
        module.liveProjectilePath===true||
        previous.module?.liveProjectilePath===true
      )
    ){
      for(const key of ['startedAt','armedAt','nextGlobalTriggerAt','lastTriggerAt',
        'firstSeenAt','insideTargets','enteredAt','containedTargetKeys']){
        state[key]=previous[key];
      }
      // 최종 고정 잔향으로 전환할 때도 원래 전체 수명을 유지한다.
      if(
        module.liveProjectilePath!==true&&
        Number.isFinite(Number(previous.endsAt))
      ){
        state.endsAt=Number(previous.endsAt);
      }
    }
    source.actionState.set(storageKey,state);

    const areaForGeometry=this.collisionArea(state);
    if(
      areaForGeometry&&
      (
        areaForGeometry.module.shape==='circle'||
        areaForGeometry.module.shape==='sector'
      )
    ){
      state.areaGeometry=
        AreaGeometryService.polygon(
          areaForGeometry.source,
          areaForGeometry.module,
          areaForGeometry.angle
        );
    }

    const presentation=
      module.presentation&&
      typeof module.presentation==='object'
        ?module.presentation
        :null;

    if(presentation){
      const key=`field-area:${source.id}:${resolvedInstanceId}`;
      state.areaEffectKey=key;

      const geometry=state.areaGeometry;

      const presentationColor=
        presentation.teamColor===true
          ?TeamColorPresentationService.colorForEntity(
            source,
            source.color||'#4af'
          )
          :null;

      const managedTrap=presentation.managedTrap===true;
      const areaEffect=managedTrap
        ?null
        :EffectSpawnService.spawn({
          ...presentation,
          // 실제 설치 field.area의 외곽선은 기본 실선이다.
          // 예고/경고 목적 field는 preserveDash:true일 때 명시 presentation dash를 그대로 사용한다.
          ...(presentation.preserveDash===true
            ?{}
            :{lineDash:[],dash:[]}),
          ...(presentationColor
            ?{
              color:presentationColor,
              fillColor:presentationColor
            }
            :{}),
          strokeColorMode:String(presentation.strokeColorMode||'source-team'),
          type:String(presentation.type||'areaCircle'),
          visibility:String(presentation.visibility||'all'),
          key,
          x,
          y,
          angle:Number.isFinite(Number(presentation.angle))
            ?Number(presentation.angle)
            :Number(module.angle)||0,
          halfWidth:Math.max(
            0,
            Number(presentation.halfWidth)||Number(module.halfWidth)||0
          ),
          r:Math.max(
            0,
            Number(presentation.r)||Number(module.range)||0
          ),
          range:Math.max(
            0,
            Number(presentation.range)||Number(module.range)||0
          ),
          // 수신된 확정 길이 사이만 보간한다. 종료/방어/축소는 즉시 반영한다.
          rangeInterpolationMs:
            interpolatePresentation&&module.liveProjectilePath===true&&
            previous?.module?.liveProjectilePath===true&&!preserveState
              ?Math.min(100,Math.max(GAME_DATA.frameMs,
                now-previous.presentationUpdatedAt||GAME_DATA.frameMs))
              :0,
          rangeSampleAt:now,
          pathTimeline:
            module.pathTimeline&&typeof module.pathTimeline==='object'
              ?{...module.pathTimeline}
              :null,
          points:
            (geometry?.points||[]).map(
              point=>({
                x:Number(point.x)||0,
                y:Number(point.y)||0
              })
            ),
          sourceEntityId:source.id,
          /*
            실시간 projectile-path field가 최종 고정 잔향으로 바뀔 때
            같은 effect key의 시작 시각을 지금으로 리셋하면 reveal 애니메이션이
            처음부터 한 번 더 재생된다. 기존 live effect의 타임라인을 그대로 이어간다.
          */
          preserveTimeline:
            previous?.kind===this.KIND&&
            (preserveState||previous.module?.liveProjectilePath===true)&&
            module.liveProjectilePath!==true,
          // 실시간 경로 장판의 표시와 피해는 같은 수명을 사용한다.
          holdVisibleUntilEnd:module.liveProjectilePath===true,
          start:module.liveProjectilePath===true?state.startedAt:now,
          dur:module.liveProjectilePath===true
            ?state.endsAt-state.startedAt
            :Number.isFinite(Number(presentation.initialVisibleDuration))
              ?Math.max(GAME_DATA.frameMs,Number(presentation.initialVisibleDuration)||0)
              :duration
        },{source});

    }

    // point field의 게임플레이 상태 동기화는 presentation 유무와 무관하다.
    // 시각 요소가 없는 피해/CC 전용 field도 상대의 로컬 대상 권위 클라이언트에
    // 동일 state를 만들어야 실제 onTrigger 판정이 실행된다.
    if(
      broadcast&&OnlinePresentationSyncService?.shouldSend?.(source)
    ){
      OnlinePresentationSyncService.send(
        'field-point-spawn',
        source,
        {
          module:EffectSpawnService.definitionSnapshot(module),
          preserveState:preserveState===true,
          point:{x,y},
          instanceId:resolvedInstanceId,
          attackId:String(attack?.id||''),
          executionSequence:Math.max(0,Math.floor(Number(execution?.sequence)||0)),
          executionDirectionAngle:Number(execution?.directionAngle)||0
        }
      );
    }

    return state;
  },

  activateFirst(
    source,
    attack,
    module,
    execution,
    targetPoint,
    wall,
    now
  ){
    const baseStateKey=this.baseKey(module);
    const instanceId=this.nextId(
      source,
      baseStateKey
    );
    const storageKey=this.storageKey(instanceId);
    const infiniteDuration=String(module.duration||'')==='infinite';
    const duration=infiniteDuration
      ?Infinity
      :Math.max(
        GAME_DATA.frameMs,
        Number(module.duration)||GAME_DATA.frameMs
      );

    const state={
      kind:this.KIND,
      storageKey,
      instanceId,
      baseStateKey,
      phase:'source-wall',
      attack,
      execution,
      module,
      wallA:this.wallCopy(wall),
      wallB:null,
      ax:Number(source.x)||0,
      ay:Number(source.y)||0,
      bx:Number(targetPoint.x)||0,
      by:Number(targetPoint.y)||0,
      startedAt:now,
      endsAt:duration===Infinity?Infinity:now+duration,
      nextGlobalTriggerAt:
        now+Math.max(
          0,
          this.interval(module)
        ),
      lastTriggerAt:new Map(),
      firstSeenAt:new Map(),
      insideTargets:new Map(),
      enteredAt:new Map(),
      ropeEffectKey:null,
      wallEffectKeys:[]
    };

    this.refreshEndpoints(source,state);
    source.actionState.set(storageKey,state);
    this.spawnRopeEffect(
      source,
      state,
      now,
      duration
    );

    const wallKey=this.wallEffect(
      source,
      state,
      state.wallA,
      0,
      now,
      duration
    );
    if(wallKey)state.wallEffectKeys.push(wallKey);

    return state;
  },

  completePair(
    source,
    pending,
    attack,
    module,
    execution,
    wall,
    now
  ){
    if(!pending)return false;

    const remainingDuration=
      pending.endsAt===Infinity
        ?Infinity
        :Math.max(
          GAME_DATA.frameMs,
          pending.endsAt-now
        );

    pending.phase='wall-wall';
    pending.attack=attack;
    pending.execution=execution;
    pending.module=module;
    pending.wallB=this.wallCopy(wall);
    pending.pairedVisibilityStartedAt=now;

    this.refreshEndpoints(source,pending);

    // 수명 기준은 첫 번째 벽에 연결된 시점이다.
    // 두 번째 벽을 연결해도 startedAt/endsAt을 갱신하지 않는다.
    this.spawnRopeEffect(
      source,
      pending,
      now,
      remainingDuration
    );

    if(pending.module?.hideWallOutlineWhenPaired===true){
      for(const effectKey of pending.wallEffectKeys||[]){
        EffectSpawnService.removeKey(effectKey);
      }
      pending.wallEffectKeys.length=0;
    }else{
      const firstWallKey=this.wallEffect(
        source,
        pending,
        pending.wallA,
        0,
        now,
        remainingDuration
      );
      if(
        firstWallKey&&
        !pending.wallEffectKeys.includes(firstWallKey)
      ){
        pending.wallEffectKeys.push(firstWallKey);
      }

      const secondWallKey=this.wallEffect(
        source,
        pending,
        pending.wallB,
        1,
        now,
        remainingDuration
      );
      if(
        secondWallKey&&
        !pending.wallEffectKeys.includes(secondWallKey)
      ){
        pending.wallEffectKeys.push(secondWallKey);
      }
    }

    // 기존 effect 객체의 fieldStateRef는 같은 state를 참조하므로
    // source↔wall에서 wall↔wall로 끊김 없이 전환된다.
    return pending;
  },

  activate(
    source,
    attack,
    module,
    execution,
    targetPoint,
    wall,
    now=performance.now()
  ){
    if(
      !source?.actionState||
      !attack||
      !module||
      !targetPoint||
      !wall
    )return false;

    if(module.pairWalls===true){
      const pending=this.pending(
        source,
        module
      );

      if(pending){
        return this.completePair(
          source,
          pending,
          attack,
          module,
          execution,
          wall,
          now
        );
      }

      this.ensurePairAnchorCapacity(
        source,
        module,
        1
      );

      return this.activateFirst(
        source,
        attack,
        module,
        execution,
        targetPoint,
        wall,
        now
      );
    }

    // 동일한 field.area 인스턴스는 항상 독립적으로 중첩된다.
    return this.activateFirst(
      source,
      attack,
      module,
      execution,
      targetPoint,
      wall,
      now
    );
  },

  revealPointPresentation(source,state,now,duration){
    const presentation=state?.module?.presentation;
    if(!source||!state||!presentation||typeof presentation!=='object')return false;
    const baseColor=presentation.triggerColor
      ?String(presentation.triggerColor)
      :(presentation.teamColor===true
        ?TeamColorPresentationService.colorForEntity(source,source.color||'#4af')
        :String(presentation.color||source.color||'#4af'));
    const revealColor=ColorService.brighten(
      baseColor,
      Number.isFinite(Number(presentation.revealBrighten))
        ?Number(presentation.revealBrighten)
        :.55
    );
    const triggerDuration=Math.max(GAME_DATA.frameMs,Number(duration)||300);
    const warningEffect=EffectSpawnService.spawn({
      type:'annularDoubleSweep',
      visibility:'all',
      key:`field-trigger-warning:${source.id}:${state.instanceId}`,
      x:Number(state.pointX)||0,
      y:Number(state.pointY)||0,
      r:Math.max(1,Number(state.module?.triggerResolveRange)||Number(state.module?.range)||39),
      maxR:Math.max(1,Number(state.module?.triggerResolveRange)||Number(state.module?.range)||39),
      radius:Math.max(1,Number(state.module?.triggerResolveRange)||Number(state.module?.range)||39),
      color:revealColor,
      hitColor:revealColor,
      fillAlpha:.10,
      strokeAlpha:1,
      lineWidth:2.5,
      edgeLine:false,
      clockwise:true,
      sweepCount:1,
      span:Math.PI*2,
      sweepFraction:1,
      startAngleOffset:0,
      sourceEntityId:source.id,
      start:now,
      dur:triggerDuration
    },{source});
    const presentationSender=Training.player;
    if(
      warningEffect&&
      presentationSender&&
      OnlinePresentationSyncService?.shouldSend?.(presentationSender)
    ){
      OnlinePresentationSyncService.send(
        'effect-spawn',
        presentationSender,
        {effect:EffectSpawnService.presentationSnapshot(warningEffect)}
      );
    }
    return true;
  },

  detonationPointPresentation(source,state,now){
    const presentation=state?.module?.presentation;
    if(!source||!state||!presentation||typeof presentation!=='object')return false;
    const baseColor=presentation.detonationColor
      ?String(presentation.detonationColor)
      :(presentation.teamColor===true
        ?TeamColorPresentationService.colorForEntity(source,source.color||'#4af')
        :String(presentation.color||source.color||'#4af'));
    const range=Math.max(
      1,
      Number(state.module?.placementBlockRadius)||
      Number(state.module?.triggerResolveRange)||
      Number(state.module?.range)||
      39
    );
    const effect=EffectSpawnService.spawn({
      type:'areaCircle',
      visibility:'all',
      key:`field-trigger-detonate:${source.id}:${state.instanceId}:${Math.floor(now)}`,
      x:Number(state.pointX)||0,
      y:Number(state.pointY)||0,
      r:range,
      maxR:range,
      radius:range,
      color:baseColor,
      fillAlpha:.18,
      strokeAlpha:.95,
      lineWidth:2.5,
      fadeOut:presentation.detonationFadeOut===true,
      start:now,
      dur:Math.max(
        GAME_DATA.frameMs,
        Number(presentation.detonationDuration)||180
      )
    },{source});
    const presentationSender=Training.player;
    if(
      effect&&
      presentationSender&&
      OnlinePresentationSyncService?.shouldSend?.(presentationSender)
    ){
      OnlinePresentationSyncService.send(
        'effect-spawn',
        presentationSender,
        {effect:EffectSpawnService.presentationSnapshot(effect)}
      );
    }
    return true;
  },

  containmentTravelDistance(target,angle,requested,now=performance.now()){
    let allowed=Math.max(0,Number(requested)||0);
    if(!target?.alive||!EntitySimulationAuthorityService.isLocal(target))return allowed;
    const key=this.targetKey(target);
    if(!key)return allowed;
    const ux=Math.cos(angle),uy=Math.sin(angle);
    for(const source of EntityService.items.values()){
      if(!source?.actionState)continue;
      for(const state of source.actionState.values()){
        const module=state?.module;
        if(state?.kind!==this.KIND||state.phase!=='point'||
          module?.containEnteredTargets!==true||
          String(module.shape||'circle')!=='circle'||
          now>=Number(state.endsAt)||!this.relationAllowed(source,target,module))continue;
        const activeDuration=Number(module.activeDuration);
        if(Number.isFinite(activeDuration)&&now>=Number(state.startedAt||0)+Math.max(0,activeDuration))continue;
        const captured=state.containedTargetKeys instanceof Set
          ?state.containedTargetKeys:(state.containedTargetKeys=new Set());
        if(module.containDodgeEscape===true&&Number(target.dodgeUntil||0)>now){
          captured.delete(key);
          continue;
        }
        const range=Math.max(0,Number(module.range)||0);
        if(!range)continue;
        const dx=Number(target.x)-Number(state.pointX||0);
        const dy=Number(target.y)-Number(state.pointY||0);
        const radius=Math.max(0,Number(target.radius)||0);
        const distance=Math.hypot(dx,dy);
        if(distance<range+radius)captured.add(key);
        if(!captured.has(key))continue;
        const limit=Math.max(1,range-radius);
        const forward=dx*ux+dy*uy;
        const discriminant=forward*forward+limit*limit-distance*distance;
        // 원 내부에서 진행 광선이 경계와 만나는 최초 이탈 지점까지만 허용.
        // 이미 밖인 예외는 기존 enforceContainment가 복구한다.
        const exit=discriminant>=0?-forward+Math.sqrt(discriminant):0;
        allowed=Math.min(allowed,Math.max(0,exit));
      }
    }
    return allowed;
  },

  enforceContainment(source,state,now=performance.now()){
    const module=state?.module;
    if(
      !source||
      !state||
      state.phase!=='point'||
      module?.containEnteredTargets!==true||
      String(module.shape||'circle')!=='circle'
    )return false;

    const range=Math.max(0,Number(module.range)||0);
    if(!(range>0))return false;
    const captured=state.containedTargetKeys instanceof Set
      ?state.containedTargetKeys
      :(state.containedTargetKeys=new Set());
    let changed=false;

    for(const target of EntityService.items.values()){
      if(
        !target?.alive||
        target.hidden||
        !this.relationAllowed(source,target,module)||
        !EntitySimulationAuthorityService.isLocal(target)
      )continue;

      const key=this.targetKey(target);
      if(!key)continue;
      if(module.containDodgeEscape===true&&Math.max(0,Number(target.dodgeUntil)||0)>now){
        captured.delete(key);
        continue;
      }

      const dx=(Number(target.x)||0)-(Number(state.pointX)||0);
      const dy=(Number(target.y)||0)-(Number(state.pointY)||0);
      const distance=Math.hypot(dx,dy);
      const radius=Math.max(0,Number(target.radius)||0);
      if(distance<range+radius)captured.add(key);
      if(!captured.has(key))continue;

      const limit=Math.max(1,range-radius);
      if(distance<=limit)continue;
      const angle=distance>.0001?Math.atan2(dy,dx):0;
      target.x=(Number(state.pointX)||0)+Math.cos(angle)*limit;
      target.y=(Number(state.pointY)||0)+Math.sin(angle)*limit;
      if(Number.isFinite(Number(target.netCollisionX)))target.netCollisionX=target.x;
      if(Number.isFinite(Number(target.netCollisionY)))target.netCollisionY=target.y;
      changed=true;
    }
    return changed;
  },

  updateState(
    source,
    state,
    now=performance.now()
  ){
    if(state?.rewardOnly===true){
      if(now>=Number(state.endsAt||0)){
        this.clearState(source,state);
        return false;
      }
      return true;
    }
    if(state?.phase==='afterlife'){
      if(now>=state.endsAt){
        this.clearState(source,state,{broadcast:false});
        return false;
      }
      return true;
    }
    if(
      !state||
      now>=state.endsAt
    ){
      if(state)this.clearState(source,state);
      return false;
    }

    const activeDuration=Number(state.module?.activeDuration);
    if(
      Number.isFinite(activeDuration)&&
      now>=Number(state.startedAt||0)+Math.max(0,activeDuration)
    ){
      state.containedTargetKeys?.clear?.();
      if(state.insideTargets instanceof Map&&state.insideTargets.size){
        for(const target of state.insideTargets.values())this.removeExitModules(source,state,target);
        state.insideTargets.clear();
      }
      state.nextInsideTargets?.clear?.();
      state.enteredAt?.clear?.();
      return true;
    }

    this.refreshEndpoints(source,state);
    this.enforceContainment(source,state,now);

    const area=this.collisionArea(state,now);
    if(!area){
      if(state.phase==='attached'){
        this.clearState(source,state);
        return false;
      }
      return true;
    }

    if(
      state.phase==='point'&&
      !state.areaGeometry&&
      (
        area.module.shape==='circle'||
        area.module.shape==='sector'
      )
    ){
      state.areaGeometry=
        AreaGeometryService.polygon(
          area.source,
          area.module,
          area.angle
        );
    }

    if(now<Math.max(0,Number(state.armedAt)||0)){
      return true;
    }

    if(state.pendingTrigger){
      if(now<(Number(state.pendingTrigger.at)||0))return true;
      const pending=state.pendingTrigger;
      state.pendingTrigger=null;

      if(String(state.module?.triggerDelayTargetMode||'')==='area-current'){
        let resolvedAny=false;
        let resolvedTarget=null;
        const resolveRange=Math.max(
          0,
          Number(state.module?.triggerResolveRange)||Number(area.module?.range)||0
        );
        const resolveArea=resolveRange>0
          ?{...area,module:{...area.module,range:resolveRange}}
          :area;
        for(const candidate of EntityService.items.values()){
          if(
            !candidate?.alive||candidate.hidden||
            !this.relationAllowed(source,candidate,state.module)||
            !NetworkHitAuthorityService.targetAuthoritative(candidate)
          )continue;
          const point=NetworkCollisionPositionService.point(candidate);
          if(!this.overlapsAreaPoint(resolveArea,point.x,point.y,candidate.radius,null))continue;
          const result=this.fieldTrigger(source,state,candidate,resolveArea,now);
          if(result.triggered||result.consumed){
            resolvedAny=resolvedAny||result.triggered;
            resolvedTarget=resolvedTarget||candidate;
          }
        }
        if(state.module?.removeOnTrigger===true){
          const triggerAuthorityTarget=
            EntityService.items.get(String(pending.targetId||''))||
            resolvedTarget||
            source;
          this.resolveContact(
            source,
            state,
            triggerAuthorityTarget,
            resolvedAny?'hit':'triggered'
          );
          return false;
        }
      }else{
        const pendingTarget=EntityService.items.get(String(pending.targetId||''));
        if(pendingTarget?.alive)this.fieldTrigger(source,state,pendingTarget,area,now);
        if(state.module?.removeOnTrigger===true){
          this.resolveContact(source,state,pendingTarget||source,'hit');
          return false;
        }
      }
    }

    const mode=this.intervalMode(state.module);
    const globalDue=
      mode!=='global'||
      this.triggerReady(
        state,
        source,
        now
      );

    if(!globalDue)return true;

    let removeField=false;
    let triggeredAny=false;
    let triggeredTarget=null;

    const previousInside=
      state.insideTargets instanceof Map
        ?state.insideTargets
        :new Map();
    const currentInside=
      state.nextInsideTargets instanceof Map
        ?state.nextInsideTargets
        :new Map();
    currentInside.clear();

    for(const target of EntityService.items.values()){
      if(
        removeField||
        !target?.alive||
        target.hidden||
        (
          state.module?.excludeAnchor===true&&
          state.phase==='attached'&&
          String(target.id||'')===
            String(state.anchorEntityId||'')
        )||
        !this.relationAllowed(
          source,
          target,
          state.module
        )||
        !NetworkHitAuthorityService
          .targetAuthoritative(target)
      ){
        continue;
      }

      const collisionPoint=
        NetworkCollisionPositionService.point(
          target
        );

      if(
        !this.overlapsAreaPoint(
          area,
          collisionPoint.x,
          collisionPoint.y,
          target.radius,
          state.areaGeometry
        )
      ){
        continue;
      }

      const targetKey=this.targetKey(target);
      if(targetKey){
        currentInside.set(
          targetKey,
          target
        );

        if(!(state.enteredAt instanceof Map)){
          state.enteredAt=new Map();
        }

        const newlyEntered=
          !state.insideTargets?.has(targetKey)||
          !state.enteredAt.has(targetKey);

        if(newlyEntered){
          state.enteredAt.set(
            targetKey,
            now
          );

          if(
            state.module?.triggerOnEnter===false
          ){
            // 첫 피해/회복 틱은 interval 뒤에 유지하되,
            // 장판 자체의 CC는 진입 즉시 적용한다.
            // markTriggered를 호출하지 않으므로 field tick 시계는 소비하지 않는다.
            this.runEnterCcModules(
              source,
              state,
              target,
              now
            );
          }
        }
      }

      if(
        mode==='per-target'&&
        !this.triggerReady(
          state,
          target,
          now
        )
      ){
        continue;
      }

      if(
        state.attack&&
        this.damageStackGroup(state.module)
      ){
        if(!this.damageStackReady(source,state,target,now))continue;
        if(this.dominantDamageState(source,state,target,now)!==state)continue;
      }

      const triggerDelay=Math.max(0,Number(state.module?.triggerDelay)||0);
      if(triggerDelay>0){
        if(!state.pendingTrigger){
          state.pendingTrigger={targetId:String(target.id||''),at:now+triggerDelay};
          if(state.module?.revealOnTrigger===true){
            this.revealPointPresentation(source,state,now,triggerDelay);
          }
        }
        break;
      }

      const result=this.fieldTrigger(
        source,
        state,
        target,
        area,
        now
      );

      if(
        state.attack&&
        this.damageStackGroup(state.module)&&
        (result.hit||result.dodged||result.durabilityBlocked)
      ){
        this.markDamageStack(source,state,target,now);
      }

      if(result.triggered||result.consumed){
        triggeredAny=triggeredAny||result.triggered;
        triggeredTarget=triggeredTarget||target;

        if(
          state.module?.removeOnTrigger===true
        ){
          removeField=true;
        }
      }
    }

    for(const [targetKey,target] of previousInside){
      if(currentInside.has(targetKey))continue;

      this.removeExitModules(
        source,
        state,
        target
      );

      state.enteredAt?.delete(
        targetKey
      );
      state.presentationOrderByTarget?.delete(
        targetKey
      );
    }

    state.insideTargets=currentInside;
    state.nextInsideTargets=previousInside;

    if(mode==='global'){
      // 글로벌 틱은 대상 유무와 상관없이 필드 자체의 시계로 계속 진행한다.
      this.markGlobalTriggered(
        state,
        now
      );
    }

    if(removeField){
      this.resolveContact(
        source,
        state,
        triggeredTarget||source,
        'hit'
      );
      return false;
    }

    return true;
  },

  update(now=performance.now()){
    for(
      const source of
      EntityService.items.values()
    ){
      if(!source?.actionState)continue;

      for(
        const state of
        source.actionState.values()
      ){
        if(state?.kind!==this.KIND)continue;
        this.updateState(
          source,
          state,
          now
        );
      }
    }
  }
});