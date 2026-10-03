

const ClusterSummonService=Object.freeze({
  KIND:'cluster-summon',

  spec(owner,summonKey){
    const key=String(summonKey||'');
    if(!owner||!key)return null;

    const current=
      owner.character?.summons?.[key]||
      null;

    if(current){
      if(!(owner._clusterSummonSpecs instanceof Map)){
        owner._clusterSummonSpecs=new Map();
      }
      owner._clusterSummonSpecs.set(
        key,
        current
      );
      return current;
    }

    const saved=
      owner._clusterSummonSpecs instanceof Map
        ?owner._clusterSummonSpecs.get(key)
        :null;
    if(saved)return saved;

    for(const entity of EntityService.items.values()){
      if(
        entity?.clusterSummonKind!==this.KIND||
        String(entity.ownerId||'')!==
          String(owner.id||'')||
        String(entity.clusterSummonKey||'')!==
          key||
        !entity.summonSpec
      )continue;

      if(!(owner._clusterSummonSpecs instanceof Map)){
        owner._clusterSummonSpecs=new Map();
      }
      owner._clusterSummonSpecs.set(
        key,
        entity.summonSpec
      );
      return entity.summonSpec;
    }

    return null;
  },

  rememberSpec(owner,summonKey,spec){
    const key=String(summonKey||'');
    if(!owner||!key||!spec)return false;
    if(!(owner._clusterSummonSpecs instanceof Map)){
      owner._clusterSummonSpecs=new Map();
    }
    owner._clusterSummonSpecs.set(key,spec);
    return true;
  },

  entities(owner,summonKey=''){
    if(!owner)return [];
    const key=String(summonKey||'');
    const result=[];
    for(const entity of EntityService.items.values()){
      if(
        entity?.kind!=='summon'||
        entity.clusterSummonKind!==this.KIND||
        String(entity.ownerId||'')!==String(owner.id||'')
      )continue;
      if(key&&String(entity.clusterSummonKey||'')!==key)continue;
      result.push(entity);
    }
    return result;
  },

  hasStage(owner,summonKey,stage){
    const required=Math.max(1,Math.floor(Number(stage)||1));
    return this.entities(owner,summonKey).some(
      entity=>entity.alive&&Math.max(1,Math.floor(Number(entity.clusterStage)||1))>=required
    );
  },

  stageStats(spec,stage){
    const level=Math.max(1,Math.floor(Number(stage)||1));
    const healthMult=Math.max(1,Number(spec?.stageHealthMultiplier)||2);
    const damageMult=Math.max(1,Number(spec?.stageDamageMultiplier)||2);
    const baseHealth=Math.max(1,Number(spec?.maxHealth)||1);
    const baseSpeed=Math.max(0,Number(spec?.speed)||0);
    const speedPerStage=
      Number.isFinite(Number(spec?.stageSpeedPerStage))
        ?Number(spec.stageSpeedPerStage)
        :0;
    const healthGrowth=String(spec?.stageHealthGrowth||'exponential');
    return {
      maxHealth:
        healthGrowth==='linear'
          ?Math.max(1,baseHealth*level)
          :Math.max(1,baseHealth*Math.pow(healthMult,level-1)),
      baseDamage:Math.max(0,(Number(spec?.baseDamage)||0)*Math.pow(damageMult,level-1)),
      speed:Math.max(0,baseSpeed+speedPerStage*(level-1))
    };
  },

  applyStage(entity,spec,stage,health=null){
    if(!entity||!spec)return false;
    const maxStage=Math.max(1,Math.floor(Number(spec.maxStage)||4));
    const resolved=Math.max(1,Math.min(maxStage,Math.floor(Number(stage)||1)));
    const stats=this.stageStats(spec,resolved);
    entity.clusterStage=resolved;
    entity.baseMaxHealth=stats.maxHealth;
    entity.maxHealth=stats.maxHealth;
    entity.baseDamage=stats.baseDamage;
    entity.speed=Math.max(0,Number(stats.speed)||0);
    entity.radius=Math.max(1,Number(spec.radius)||20);
    if(health===null){
      entity.health=Math.min(
        entity.maxHealth,
        Math.max(1,Number(entity.health)||entity.maxHealth)
      );
    }else{
      entity.health=Math.min(
        entity.maxHealth,
        Math.max(1,Number(health)||1)
      );
    }
    entity.healthTrailHealth=entity.health;
    return true;
  },

  spawn(owner,summonKey,options={}){
    const spec=this.spec(owner,summonKey);
    if(!owner?.alive||!spec)return null;

    this.rememberSpec(
      owner,
      summonKey,
      spec
    );
    const now=Number(options.now)||performance.now();
    const stage=Math.max(1,Math.floor(Number(options.stage)||1));
    const stats=this.stageStats(spec,stage);
    const angle=Number(options.angle)||0;
    const distance=Math.max(0,Number(options.spawnDistance)||0);
    const id=`${String(owner.id)}:cluster:${String(summonKey)}:${++ClusterSummonRuntime.counter}`;
    const entity=EntityService.create({
      id,
      kind:'summon',
      ownerId:owner.id,
      teamId:owner.teamId,
      x:Number(options.x) || (Number(owner.x)+Math.cos(angle)*distance),
      y:Number(options.y) || (Number(owner.y)+Math.sin(angle)*distance),
      radius:Math.max(1,Number(spec.radius)||20),
      color:spec.presentation?.color||owner.color||'#c1fab1',
      maxHealth:stats.maxHealth,
      stamina:0,
      maxStamina:0,
      speed:Math.max(0,Number(stats.speed)||0),
      baseDamage:stats.baseDamage,
      healthRegenPolicy:spec.healthRegen===false?null:(spec.healthRegenPolicy||owner.healthRegenPolicy||GAME_DATA.healthRegen)
    });
    entity.clusterSummonKind=this.KIND;
    entity.clusterSummonKey=String(summonKey);
    entity.clusterStage=stage;
    entity.baseMaxHealth=stats.maxHealth;
    entity.summonSpec=spec;
    entity.character=
      spec.characterSnapshot||
      owner.character;
    entity.displayName=spec.name||'소환수';
    entity.health=Number.isFinite(Number(options.health))
      ?Math.max(1,Math.min(entity.maxHealth,Number(options.health)))
      :entity.maxHealth;
    entity.healthTrailHealth=entity.health;
    MovementService.ensureValidPosition(entity);
    AugmentCooldownService.initializeEntity(entity,now);
    AugmentService.syncConstantBuffs(owner);
    AugmentService.syncVitals(owner);
    SummonDeployService.spawnSpecEffect(owner,entity,spec.spawnEffect,now,{sync:true});
    return entity;
  },

  reduceOwnerMaxHealthByMissing(owner){
    if(!owner)return 0;
    const maxHealth=Math.max(1,Number(owner.maxHealth)||1);
    const health=Math.max(1,Math.min(maxHealth,Number(owner.health)||1));
    const missing=Math.max(0,maxHealth-health);
    if(missing<=0)return 0;

    const maxHealthModifier=
      Math.max(
        .10,
        1+BuffService.resolve(owner,'maxHealth')
      );
    const nextEffectiveMax=Math.max(1,health);
    const nextBaseMax=
      Math.max(
        1,
        ResourceValueService.round(
          nextEffectiveMax/maxHealthModifier,
          Math.max(1,Number(owner.baseMaxHealth)||maxHealth)
        )
      );

    owner.baseMaxHealth=nextBaseMax;
    owner.maxHealth=nextEffectiveMax;
    owner.health=nextEffectiveMax;
    owner.healthTrailHealth=nextEffectiveMax;
    owner.combatSnapshotDirty=true;

    AugmentService.syncVitals(owner);
    return missing;
  },

  spawnFromAttack(source,module,angle,execution){
    if(!source||!module)return null;
    const point=execution?.targetPoint;
    const entity=this.spawn(source,String(module.summonKey||''),{
      now:performance.now(),
      angle:Number(angle)||0,
      spawnDistance:Math.max(0,Number(module.spawnDistance)||0),
      x:point&&module.position==='target-point'?Number(point.x):undefined,
      y:point&&module.position==='target-point'?Number(point.y):undefined
    });
    if(entity&&module.maxHealthCost==='missing-health'){
      this.reduceOwnerMaxHealthByMissing(source);
    }
    return entity;
  },

  strongest(owner,summonKey){
    return this.entities(owner,summonKey)
      .filter(entity=>entity.alive)
      .sort((a,b)=>
        (Number(b.clusterStage)||1)-(Number(a.clusterStage)||1)||
        (Number(b.health)||0)-(Number(a.health)||0)||
        String(a.id).localeCompare(String(b.id))
      )[0]||null;
  },

  replacementAbsorbState(owner){
    if(!owner?.actionState)return null;
    for(const state of owner.actionState.values()){
      if(state?.kind==='cluster-replacement-absorb')return state;
    }
    return null;
  },

  processReplacementAbsorb(owner,now=performance.now(),frameScale=1){
    const state=this.replacementAbsorbState(owner);
    if(!state)return false;

    if(now<Math.max(0,Number(state.absorbAt)||0)){
      return false;
    }

    const remaining=
      this.entities(
        owner,
        String(state.summonKey||'')
      ).filter(entity=>entity.alive);

    if(!remaining.length){
      owner.actionState.delete(String(state.stateKey||''));
      owner.combatSnapshotDirty=true;
      return false;
    }

    for(const absorbed of remaining){
      const contactDistance=
        Math.max(1,Number(owner.radius)||20)+
        Math.max(1,Number(absorbed.radius)||20)+
        4;
      const distance=Math.hypot(
        Number(absorbed.x)-Number(owner.x),
        Number(absorbed.y)-Number(owner.y)
      );

      if(distance<=contactDistance){
        const absorbedHealth=
          Math.max(0,Number(absorbed.health)||0);
        EntityService.items.delete(absorbed.id);
        owner.health=Math.min(
          owner.maxHealth,
          owner.health+absorbedHealth
        );
        owner.healthTrailHealth=owner.health;
        EffectSpawnService.spawn({
          type:'areaCircle',
          x:Number(owner.x)||0,
          y:Number(owner.y)||0,
          r:0,
          maxR:34,
          durationFrames:10,
          color:ColorService.rgbString(
            owner.color,
            '193,250,177'
          ),
          fillAlpha:.08,
          strokeAlpha:.72
        },{source:owner});
        continue;
      }

      const stateKey=
        `absorbPath:${String(absorbed.id||'')}`;
      let pathState=state.paths?.[stateKey]||null;
      if(!state.paths)state.paths={};

      if(
        !pathState||
        now-Math.max(0,Number(pathState.at)||0)>=260||
        !Array.isArray(pathState.path)
      ){
        const result=GridPathfindingService.findPath(
          absorbed,
          owner,
          {
            radius:absorbed.radius,
            cellSize:48,
            maxExpansions:2600
          }
        );
        pathState={
          at:now,
          path:Array.isArray(result.path)?result.path:[],
          index:0
        };
        state.paths[stateKey]=pathState;
      }

      const threshold=Math.max(8,48*.45);
      let waypoint=null;
      while(pathState.index<pathState.path.length){
        const candidate=pathState.path[pathState.index];
        if(
          Math.hypot(
            Number(candidate.x)-Number(absorbed.x),
            Number(candidate.y)-Number(absorbed.y)
          )>=threshold
        ){
          waypoint=candidate;
          break;
        }
        pathState.index++;
      }

      if(waypoint){
        MovementService.move(
          absorbed,
          Number(waypoint.x)-Number(absorbed.x),
          Number(waypoint.y)-Number(absorbed.y),
          frameScale,
          {speedOverride:Math.max(0,Number(absorbed.speed)||4.25)}
        );
      }else{
        MovementService.move(
          absorbed,
          Number(owner.x)-Number(absorbed.x),
          Number(owner.y)-Number(absorbed.y),
          frameScale,
          {speedOverride:Math.max(0,Number(absorbed.speed)||4.25)}
        );
      }
    }

    return true;
  },

  replacementAvailable(owner){
    const policy=owner?.character?.deathReplacement;
    if(policy?.type!=='summon.cluster-strongest')return false;
    if(!EntitySimulationAuthorityService.isLocal(owner))return false;

    const replacementStateKey=
      String(policy.setStateOnReplace||'');
    if(
      replacementStateKey&&
      owner?.actionState?.has(replacementStateKey)
    )return false;

    return !!this.strongest(
      owner,
      String(policy.summonKey||'')
    );
  },

  replaceOwnerBeforeDefeat(owner,now=performance.now()){
    const policy=owner?.character?.deathReplacement;
    if(policy?.type!=='summon.cluster-strongest')return null;
    if(!EntitySimulationAuthorityService.isLocal(owner))return null;
    const summon=this.strongest(owner,String(policy.summonKey||''));
    if(!summon)return null;

    const character=owner.character;
    const inheritedStage=Math.max(1,Math.floor(Number(summon.clusterStage)||1));
    const inheritedBaseMax=Math.max(
      1,
      Number(summon.baseMaxHealth)||
      Number(summon.maxHealth)||
      Number(summon.health)||
      1
    );
    const inheritedEffectiveMax=Math.max(
      1,
      Number(summon.maxHealth)||
      inheritedBaseMax
    );
    const inheritedHealthRatio=
      String(policy.healthPolicy||'inherit')==='full'
        ?1
        :Math.max(
          0,
          Math.min(
            1,
            (Number(summon.health)||1)/
              inheritedEffectiveMax
          )
        );
    const revivePoint={x:Number(summon.x)||owner.x,y:Number(summon.y)||owner.y};
    const defeatedPoint={x:Number(owner.x)||0,y:Number(owner.y)||0};

    MovementPresentationService.pushLine(
      owner,
      defeatedPoint.x,
      defeatedPoint.y,
      revivePoint.x,
      revivePoint.y,
      {
        type:'dash-line',
        color:'193,250,177',
        width:6,
        alpha:.4,
        duration:167
      }
    );

    EntityService.items.delete(summon.id);
    EntityCharacterDeathResetService.reset(owner,now);

    owner.character=character;
    owner.color=character.color;
    owner.radius=character.radius;
    owner.speed=character.speed;
    owner.baseDamage=character.baseDamage;
    owner.baseMaxHealth=inheritedBaseMax;
    owner.maxHealth=inheritedBaseMax;
    owner.baseMaxStamina=Math.max(0,Number(owner.baseMaxStamina)||GAME_DATA.stamina.max);
    owner.maxStamina=Math.max(0,Number(owner.maxStamina)||GAME_DATA.stamina.max);

    EntityRespawnService.revive(owner,{
      x:revivePoint.x,
      y:revivePoint.y,
      clearStatuses:true
    });
    owner.health=
      Math.max(
        1,
        owner.maxHealth*
          inheritedHealthRatio
      );
    owner.healthTrailHealth=owner.health;
    owner.buffs?.clear?.();
    BuffStatusPresentation.cache.delete(owner);
    StatusPresentation.cache.delete(owner);
    AugmentService.syncConstantBuffs(owner);
    AugmentService.syncVitals(owner);

    if(policy.setStateOnReplace){
      owner.actionState.set(
        String(policy.setStateOnReplace),
        {
          kind:'replacement-state',
          stage:inheritedStage,
          startedAt:now,
          restoreBaseMaxHealth:
            Math.max(
              1,
              Number(character.maxHealth)||
              Number(owner.baseMaxHealth)||
              1
            )
        }
      );
    }

    const absorbDelay=Math.max(0,Number(policy.absorbRemainingAfterMs)||0);
    if(this.entities(owner,String(policy.summonKey||'')).some(entity=>entity.alive)){
      const absorbStateKey=`cluster-replacement-absorb:${String(policy.summonKey||'')}`;
      owner.actionState.set(
        absorbStateKey,
        {
          kind:'cluster-replacement-absorb',
          stateKey:absorbStateKey,
          summonKey:String(policy.summonKey||''),
          absorbAt:now+absorbDelay
        }
      );
    }

    owner.combatSnapshotDirty=true;
    EffectSpawnService.spawn({
      type:'areaCircle',
      x:owner.x,y:owner.y,
      r:0,maxR:48,range:48,
      durationFrames:14,
      color:'193,250,177',
      fillAlpha:.08,
      strokeAlpha:.85
    },{source:owner});
    return {
      prevented:true,
      health:owner.health,
      presentationPoint:defeatedPoint,
      presentDefeat:true
    };
  },

  mergePair(owner,a,b,spec){
    if(!a?.alive||!b?.alive||a===b)return false;
    const stageA=Math.max(1,Math.floor(Number(a.clusterStage)||1));
    const stageB=Math.max(1,Math.floor(Number(b.clusterStage)||1));
    const maxStage=Math.max(1,Math.floor(Number(spec.maxStage)||4));
    if(stageA!==stageB||stageA>=maxStage)return false;
    const healthA=Math.max(0,Number(a.health)||0);
    const healthB=Math.max(0,Number(b.health)||0);
    const maxHealthA=Math.max(1,Number(a.maxHealth)||1);
    const maxHealthB=Math.max(1,Number(b.maxHealth)||1);
    const combinedHealth=Math.max(1,healthA+healthB);
    const combinedMaxHealth=Math.max(1,maxHealthA+maxHealthB);
    const nextStage=stageA+1;
    const nextStats=this.stageStats(spec,nextStage);
    const healthPolicy=String(spec.mergeHealthPolicy||'combine');
    const mergedHealth=
      healthPolicy==='full'
        ?nextStats.maxHealth
        :healthPolicy==='ratio'
          ?nextStats.maxHealth*
            Math.max(
              0,
              Math.min(
                1,
                combinedHealth/combinedMaxHealth
              )
            )
          :combinedHealth;
    a.x=((Number(a.x)||0)+(Number(b.x)||0))/2;
    a.y=((Number(a.y)||0)+(Number(b.y)||0))/2;
    this.applyStage(a,spec,nextStage,mergedHealth);
    EntityService.items.delete(b.id);
    SummonDeployService.spawnSpecEffect(owner,a,spec.spawnEffect,performance.now(),{sync:true});
    return true;
  },

  merge(owner,summonKey){
    const spec=this.spec(owner,summonKey);
    if(!spec)return false;
    const list=this.entities(owner,summonKey).filter(entity=>entity.alive);
    for(let i=0;i<list.length;i++){
      const a=list[i];
      if(!EntityService.items.has(a.id))continue;
      for(let j=i+1;j<list.length;j++){
        const b=list[j];
        if(!EntityService.items.has(b.id))continue;
        if((Number(a.clusterStage)||1)!==(Number(b.clusterStage)||1))continue;
        const distance=Math.hypot((Number(a.x)||0)-(Number(b.x)||0),(Number(a.y)||0)-(Number(b.y)||0));
        if(distance>Math.max(1,Number(a.radius)||0)+Math.max(1,Number(b.radius)||0))continue;
        if(this.mergePair(owner,a,b,spec))return true;
      }
    }
    return false;
  },

  mergePartner(owner,entity,summonKey){
    const stage=Math.max(1,Math.floor(Number(entity?.clusterStage)||1));
    const maxStage=Math.max(1,Math.floor(Number(entity?.summonSpec?.maxStage)||4));
    if(stage>=maxStage)return null;
    let best=null;
    let bestDistance=Infinity;
    for(const candidate of this.entities(owner,summonKey)){
      if(
        candidate===entity||
        !candidate?.alive||
        Math.max(1,Math.floor(Number(candidate.clusterStage)||1))!==stage
      )continue;
      if(
        SummonAIService.segmentCrossesHostileField(
          entity,
          candidate,
          entity.summonSpec?.ai
        )
      )continue;

      const distance=Math.hypot(
        Number(candidate.x)-Number(entity.x),
        Number(candidate.y)-Number(entity.y)
      );
      if(distance>=bestDistance)continue;
      best=candidate;
      bestDistance=distance;
    }
    return best?{entity:best,distance:bestDistance}:null;
  },

  pursueMergePartner(entity,partner,spec,frameScale){
    if(!entity?.alive||!partner?.alive)return false;
    if(
      SummonAIService.segmentCrossesHostileField(
        entity,
        partner,
        spec?.ai
      )
    )return false;
    return MovementService.move(
      entity,
      Number(partner.x)-Number(entity.x),
      Number(partner.y)-Number(entity.y),
      frameScale,
      {speedOverride:Math.max(0,Number(entity.speed)||Number(spec?.speed)||0)}
    );
  },

  updateEntity(entity,owner,spec,now,frameScale,options={}){
    if(!entity?.alive||!owner||!spec)return false;
    if(entity.forcedMotion){
      MovementService.updateForced(entity,now,frameScale);
      return true;
    }

    const mergeTarget=
      options.allowMerge!==false
        ?this.mergePartner(
          owner,
          entity,
          String(entity.clusterSummonKey||'')
        )
        :null;

    // 1~2. 회피 / 라임 추종·안전 배회.
    if(
      SummonAIService.priorityUpdate(
        entity,
        owner,
        spec,
        now,
        frameScale,
        {
          ownerThreatMergeTarget:
            mergeTarget?.entity||
            null
        }
      )
    )return true;

    // 3. 같은 단계 슬라임 합체.
    if(mergeTarget){
      this.pursueMergePartner(
        entity,
        mergeTarget.entity,
        spec,
        frameScale
      );
      return true;
    }

    SummonAIService.idleUpdate(entity,owner,spec,now,frameScale);
    return true;
  },

  update(now=performance.now(),frameScale=1){
    for(const entity of EntityService.items.values()){
      if(
        entity?.clusterSummonKind!==this.KIND||
        EntitySimulationAuthorityService.isLocal(entity)
      )continue;
      if(Number.isFinite(Number(entity._remoteSummonTargetX))){
        entity.x+=(Number(entity._remoteSummonTargetX)-Number(entity.x))*0.28;
      }
      if(Number.isFinite(Number(entity._remoteSummonTargetY))){
        entity.y+=(Number(entity._remoteSummonTargetY)-Number(entity.y))*0.28;
      }
    }

    const owners=[];
    for(const entity of EntityService.items.values()){
      if(entity?.kind==='player'&&entity.alive&&EntitySimulationAuthorityService.isLocal(entity)){
        owners.push(entity);
      }
    }
    for(const owner of owners){
      const absorbActive=
        this.processReplacementAbsorb(
          owner,
          now,
          frameScale
        );
      const keys=new Set(
        this.entities(owner).map(entity=>String(entity.clusterSummonKey||'')).filter(Boolean)
      );
      for(const key of keys){
        if(absorbActive)continue;

        let guard=0;
        while(this.merge(owner,key)&&guard++<16){}

        const spec=this.spec(owner,key);
        if(!spec)continue;
        for(const entity of this.entities(owner,key)){
          this.updateEntity(
            entity,
            owner,
            spec,
            now,
            frameScale
          );
        }
      }
    }
  },

  serialize(owner,now=performance.now()){
    return this.entities(owner).map(entity=>({
      id:String(entity.id),
      summonKey:String(entity.clusterSummonKey||''),
      stage:Math.max(1,Math.floor(Number(entity.clusterStage)||1)),
      x:Number(entity.x)||0,
      y:Number(entity.y)||0,
      health:Math.max(0,Number(entity.health)||0),
      maxHealth:Math.max(1,Number(entity.maxHealth)||1),
      alive:entity.alive!==false,
      combatSnapshot:NetworkCombatSnapshotService.serialize(entity,now)
    }));
  },

  applyRemote(owner,snapshots,now=performance.now()){
    if(!owner||EntitySimulationAuthorityService.isLocal(owner))return false;
    const incoming=Array.isArray(snapshots)?snapshots:[];
    const seen=new Set();
    for(const snapshot of incoming){
      const key=String(snapshot?.summonKey||'');
      const id=String(snapshot.id||'');
      if(!id)continue;

      let entity=
        EntityService.items.get(id)||
        null;

      let spec=
        this.spec(owner,key);

      if(!spec&&entity?.summonSpec){
        spec=entity.summonSpec;
        this.rememberSpec(
          owner,
          key,
          spec
        );
      }

      if(!spec)continue;

      this.rememberSpec(
        owner,
        key,
        spec
      );

      seen.add(id);
      if(!entity){
        entity=EntityService.create({
          id,
          kind:'summon',
          ownerId:owner.id,
          teamId:owner.teamId,
          x:Number(snapshot.x)||owner.x,
          y:Number(snapshot.y)||owner.y,
          radius:Math.max(1,Number(spec.radius)||20),
          color:spec.presentation?.color||owner.color||'#c1fab1',
          maxHealth:Math.max(1,Number(snapshot.maxHealth)||Number(spec.maxHealth)||1),
          stamina:0,maxStamina:0,
          speed:Math.max(0,Number(spec.speed)||0),
          baseDamage:Math.max(0,Number(spec.baseDamage)||0),
          healthRegenPolicy:null
        });
      }
      entity.clusterSummonKind=this.KIND;
      entity.clusterSummonKey=key;
      entity.clusterStage=Math.max(1,Math.floor(Number(snapshot.stage)||1));
      entity.speed=
        this.stageStats(
          spec,
          entity.clusterStage
        ).speed;
      entity.summonSpec=spec;
      if(!entity.character){
        entity.character=owner.character;
      }
      entity.displayName=spec.name||'소환수';
      entity._remoteSummonTargetX=Number(snapshot.x)||entity.x;
      entity._remoteSummonTargetY=Number(snapshot.y)||entity.y;
      entity.maxHealth=Math.max(1,Number(snapshot.maxHealth)||entity.maxHealth);
      entity.health=Math.max(0,Math.min(entity.maxHealth,Number(snapshot.health)||0));
      entity.alive=snapshot.alive!==false;
      entity.hidden=!entity.alive;
      if(snapshot.combatSnapshot){
        NetworkCombatSnapshotService.apply(entity,snapshot.combatSnapshot,now);
      }
    }
    for(const entity of [...EntityService.items.values()]){
      if(
        entity?.clusterSummonKind===this.KIND&&
        String(entity.ownerId||'')===String(owner.id||'')&&
        !seen.has(String(entity.id||''))
      ){
        EntityService.items.delete(entity.id);
      }
    }
    return true;
  }
});