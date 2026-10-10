


/* 하나의 누적 시간을 여러 단계 임계치 효과로 변환한다.
   전체 시간은 master Buff 엔트리의 남은 시간이며 각 단계 효과는 threshold만큼 늦게 만료된다.
   BuffService/combatSnapshot을 그대로 사용하므로 별도 캐릭터 네트워크 상태가 필요 없다. */
const TimedThresholdBuffService=Object.freeze({
  auraStateBuffer:[],
  auraStatePool:[],
  gaugeGroupScratch:new Map(),
  gaugeGroupPool:[],
  auraTargets:new Map(),
  auraTargetPool:[],
  configSnapshotCache:new WeakMap(),
  sourceId(group,index){
    return `threshold:${String(group||'timer')}:${Math.max(1,Number(index)||1)}`;
  },

  master(entity,group=null,now=performance.now()){
    if(!entity?.buffs)return null;
    const expected=
      group===null
        ?null
        :String(group||'');

    for(const [type] of entity.buffs){
      for(const item of BuffService.live(entity,type,now)){
        if(item?.data?.timedThresholdMaster!==true)continue;
        if(
          expected!==null&&
          String(item.data?.timedThresholdGroup||'')!==expected
        )continue;

        return {
          type,
          item,
          group:String(item.data?.timedThresholdGroup||''),
          config:item.data?.timedThresholdConfig||null
        };
      }
    }

    return null;
  },

  remaining(entity,group,now=performance.now()){
    const master=this.master(entity,group,now);
    if(!master)return 0;
    return master.item.end===Infinity
      ?Infinity
      :Math.max(0,Number(master.item.end)-now);
  },

  normalizeConfig(module={}){
    const stages=
      Array.isArray(module.stages)
        ?module.stages
          .map((stage,index)=>({
            stat:String(stage?.stat||''),
            value:Number(stage?.value)||0,
            thresholdMs:Math.max(
              0,
              Number(stage?.thresholdMs)||
              index*
                Math.max(
                  1,
                  Number(module.segmentDuration)||5000
                )
            )
          }))
          .filter(stage=>COMBAT_BUFF_DEFS[stage.stat])
        :[];

    return {
      group:String(module.group||module.stateKey||'timer'),
      maxDuration:Math.max(
        1,
        Number(module.maxDuration)||15000
      ),
      segmentDuration:Math.max(
        1,
        Number(module.segmentDuration)||5000
      ),
      stages,
      gauge:
        module.gauge&&
        typeof module.gauge==='object'
          ?{...module.gauge}
          :null,
      aura:
        module.aura&&
        typeof module.aura==='object'
          ?{...module.aura}
          :null
    };
  },

  configSnapshot(config,auraEnabled=false){
    if(!config||typeof config!=='object')return null;

    let cached=this.configSnapshotCache.get(config);
    if(!cached){
      cached={withAura:null,withoutAura:null};
      this.configSnapshotCache.set(config,cached);
    }

    const key=
      auraEnabled&&config.aura
        ?'withAura'
        :'withoutAura';

    if(cached[key])return cached[key];

    const snapshot={
      group:config.group,
      maxDuration:config.maxDuration,
      segmentDuration:config.segmentDuration,
      stages:config.stages,
      gauge:config.gauge,
      aura:
        key==='withAura'
          ?config.aura
          :null
    };

    cached[key]=snapshot;
    return snapshot;
  },

  sync(
    entity,
    config,
    remainingMs,
    source=null,
    now=performance.now(),
    {
      auraEnabled=false
    }={}
  ){
    if(!entity?.alive||!config)return 0;

    const total=Math.max(
      0,
      Math.min(
        Number(config.maxDuration)||0,
        Number(remainingMs)||0
      )
    );

    config.stages.forEach((stage,index)=>{
      const sourceId=this.sourceId(config.group,index+1);
      const duration=Math.max(
        0,
        total-
        Math.max(0,Number(stage.thresholdMs)||0)
      );

      if(duration<=0){
        BuffService.remove(
          entity,
          stage.stat,
          sourceId
        );
        return;
      }

      BuffService.set(
        entity,
        stage.stat,
        stage.value,
        sourceId,
        duration,
        {
          timedThresholdGroup:config.group,
          timedThresholdMaster:index===0,
          timedThresholdConfig:index===0
            ?this.configSnapshot(
              config,
              auraEnabled
            )
            :null,
          sourceEntityId:source?.id||null
        },
        now
      );
    });

    return total;
  },

  add(
    target,
    module,
    source=null,
    now=performance.now()
  ){
    if(!target?.alive||!module)return 0;
    const config=this.normalizeConfig(module);
    if(!config.stages.length)return 0;

    const current=this.remaining(
      target,
      config.group,
      now
    );
    const addDuration=Math.max(
      0,
      Number(module.addDuration)||0
    );
    const total=Math.min(
      config.maxDuration,
      current+addDuration
    );

    return this.sync(
      target,
      config,
      total,
      source,
      now,
      {
        auraEnabled:
          target===source&&
          config.aura!==null
      }
    );
  },

  extendFromAura(
    target,
    sourceState,
    elapsedMs,
    now=performance.now(),
    auraCount=1
  ){
    if(
      !target?.alive||
      !sourceState?.config||
      elapsedMs<=0
    )return 0;

    const group=String(
      sourceState.config.group||
      ''
    );
    const existingMaster=
      this.master(
        target,
        group,
        now
      );
    const existingConfig=
      existingMaster?.config||
      null;

    /*
      대상이 자기 스킬로 이미 만든 config가 있으면 그 객체를 그대로 유지한다.
      없으면 source config를 시간 계산에만 재사용하고 auraEnabled=false로 저장한다.
      프레임마다 config/aura 객체를 복제하지 않는다.
    */
    const config=
      existingConfig||
      sourceState.config;
    const current=this.remaining(
      target,
      config.group,
      now
    );
    const count=Math.max(
      1,
      Math.floor(
        Number(auraCount)||1
      )
    );

    /* Compensate one frame of decay even at zero. Otherwise an ally entering
       after the pulse loses each tiny increment before the next update and
       never accumulates time. Casting remains a separate one-segment add. */
    const extension=elapsedMs*(count+1);

    return this.sync(
      target,
      config,
      Math.min(
        config.maxDuration,
        current+extension
      ),
      sourceState.source,
      now,
      {
        auraEnabled:
          !!existingConfig?.aura
      }
    );
  },

  gaugeGroups(entity,now=performance.now()){
    const groups=this.gaugeGroupScratch;
    groups.clear();
    if(!entity?.buffs)return groups;

    let poolIndex=0;
    for(const [type] of entity.buffs){
      for(const item of BuffService.live(entity,type,now)){
        if(item?.data?.timedThresholdMaster!==true)continue;

        const config=item.data?.timedThresholdConfig;
        const group=String(
          item.data?.timedThresholdGroup||
          config?.group||
          ''
        );
        if(!group||!config)continue;

        const remaining=
          item.end===Infinity
            ?Number(config.maxDuration)||0
            :Math.max(0,Number(item.end)-now);

        let state=this.gaugeGroupPool[poolIndex];
        if(!state){
          state={};
          this.gaugeGroupPool[poolIndex]=state;
        }
        poolIndex+=1;
        state.group=group;
        state.remaining=remaining;
        state.maxDuration=Math.max(
          1,
          Number(config.maxDuration)||15000
        );
        state.segmentDuration=Math.max(
          1,
          Number(config.segmentDuration)||5000
        );
        state.gauge=
          config.gauge&&
          typeof config.gauge==='object'
            ?config.gauge
            :null;
        groups.set(group,state);
      }
    }

    return groups;
  },

  auraStates(now=performance.now()){
    const result=this.auraStateBuffer;
    result.length=0;
    let index=0;

    for(const source of EntityService.items.values()){
      if(!source?.alive)continue;

      const master=this.master(source,null,now);
      if(!master?.config?.aura)continue;

      const remaining=
        master.item.end===Infinity
          ?Infinity
          :Math.max(
            0,
            Number(master.item.end)-now
          );
      if(remaining<=0)continue;

      let state=this.auraStatePool[index];
      if(!state){
        state={};
        this.auraStatePool[index]=state;
      }

      state.source=source;
      state.group=master.group;
      state.config=master.config;
      state.aura=master.config.aura;
      state.remaining=remaining;

      result.push(state);
      index++;
    }

    return result;
  },

  updateAuras(
    now=performance.now(),
    dt=GAME_DATA.frameMs
  ){
    const elapsed=Math.max(
      0,
      Math.min(
        250,
        Number(dt)||0
      )
    );
    const targets=this.auraTargets;
    targets.clear();
    let targetPoolIndex=0;

    for(const state of this.auraStates(now)){
      const aura=state.aura||{};
      const range=Math.max(
        0,
        Number(aura.range)||0
      );
      if(range<=0)continue;

      EffectSpawnService.spawn(
        {
          type:'areaCircle',
          key:`timed-threshold-aura:${state.source.id}:${state.group}`,
          sourceEntityId:state.source.id,
          followSource:true,
          x:Number(state.source.x)||0,
          y:Number(state.source.y)||0,
          range,
          r:range,
          color:String(aura.color||'238,0,255'),
          fillAlpha:Number.isFinite(Number(aura.fillAlpha))
            ?Number(aura.fillAlpha)
            :.04,
          strokeAlpha:Number.isFinite(Number(aura.strokeAlpha))
            ?Number(aura.strokeAlpha)
            :.42,
          lineWidth:Math.max(1,Number(aura.lineWidth)||2),
          timerGroup:state.group,
          timerMaxMs:Math.max(
            1,
            Number(state.config.maxDuration)||15000
          ),
          timerRingRadiusRatio:
            Number.isFinite(Number(aura.timerRingRadiusRatio))
              ?Number(aura.timerRingRadiusRatio)
              :.84,
          timerRingLineWidth:Math.max(
            1,
            Number(aura.timerRingLineWidth)||2.5
          ),
          hollowInnerRatio:
            Number.isFinite(Number(aura.hollowInnerRatio))
              ?Math.max(
                0,
                Math.min(
                  .98,
                  Number(aura.hollowInnerRatio)
                )
              )
              :0,
          cardinalGuides:
            aura.cardinalGuides===true,
          cardinalGuideInnerRatio:
            Number.isFinite(
              Number(aura.cardinalGuideInnerRatio)
            )
              ?Math.max(
                0,
                Math.min(
                  .98,
                  Number(aura.cardinalGuideInnerRatio)
                )
              )
              :0,
          cardinalGuideOuterRatio:
            Number.isFinite(
              Number(aura.cardinalGuideOuterRatio)
            )
              ?Math.max(
                0,
                Math.min(
                  1,
                  Number(aura.cardinalGuideOuterRatio)
                )
              )
              :1,
          cardinalGuideAlpha:
            Number.isFinite(
              Number(aura.cardinalGuideAlpha)
            )
              ?Math.max(
                0,
                Math.min(
                  1,
                  Number(aura.cardinalGuideAlpha)
                )
              )
              :.34,
          cardinalGuideWidth:Math.max(
            .5,
            Number(aura.cardinalGuideWidth)||1
          ),
          timerFillAlpha:
            Number.isFinite(
              Number(aura.timerFillAlpha)
            )
              ?Math.max(
                0,
                Math.min(
                  1,
                  Number(aura.timerFillAlpha)
                )
              )
              :undefined,
          timerStrokeAlpha:
            Number.isFinite(
              Number(aura.timerStrokeAlpha)
            )
              ?Math.max(
                0,
                Math.min(
                  1,
                  Number(aura.timerStrokeAlpha)
                )
              )
              :undefined,
          strokeColorMode:String(
            aura.strokeColorMode||''
          ),
          nonFriendlyAlphaScale:
            Number.isFinite(
              Number(aura.nonFriendlyAlphaScale)
            )
              ?Math.max(
                0,
                Math.min(
                  1,
                  Number(aura.nonFriendlyAlphaScale)
                )
              )
              :1,
          renderLayer:String(
            aura.renderLayer||
            'default'
          ),
          start:now,
          dur:Math.max(
            GAME_DATA.frameMs*3,
            elapsed*3
          )
        },
        {source:state.source}
      );

      if(elapsed<=0)continue;

      for(const target of EntityService.items.values()){
        if(
          !target?.alive||
          target===state.source||
          RelationService.relation(
            state.source,
            target
          )!=='ally'||
          !NetworkHitAuthorityService
            .targetAuthoritative(target)
        )continue;

        const dx=
          Number(target.x)-
          Number(state.source.x);
        const dy=
          Number(target.y)-
          Number(state.source.y);
        const reach=
          range+
          Math.max(0,Number(target.radius)||0);

        if(dx*dx+dy*dy>reach*reach)continue;

        const key=
          `${target.id}:${state.group}`;
        const existing=
          targets.get(key);

        if(existing){
          existing.auraCount++;
        }else{
          let entry=
            this.auraTargetPool[
              targetPoolIndex
            ];
          if(!entry){
            entry={};
            this.auraTargetPool[
              targetPoolIndex
            ]=entry;
          }
          targetPoolIndex++;

          entry.target=target;
          entry.state=state;
          entry.auraCount=1;
          targets.set(
            key,
            entry
          );
        }
      }
    }

    for(
      const {
        target,
        state,
        auraCount
      } of targets.values()
    ){
      this.extendFromAura(
        target,
        state,
        elapsed,
        now,
        auraCount
      );
    }

    return targets.size>0;
  }
});