

const WorldGaugeModuleService=Object.freeze({
  timedSegmentCache:new Map(),
  timedSegments(count,color){
    const max=Math.max(1,Math.floor(Number(count)||1));
    const resolvedColor=String(color||'#ee00ff');
    const key=`${max}|${resolvedColor}`;
    let segments=this.timedSegmentCache.get(key);
    if(segments)return segments;
    segments=Array.from({length:max},(_,index)=>Object.freeze({
      value:index+1,
      color:resolvedColor
    }));
    this.timedSegmentCache.set(key,Object.freeze(segments));
    return segments;
  },
  modules(entity){
    if(!entity)return [];

    if(
      entity.kind==='summon'&&
      Array.isArray(
        entity.summonSpec?.worldGaugeModules
      )
    ){
      return entity.summonSpec.worldGaugeModules;
    }

    if(entity.kind==='player'){
      return Array.isArray(entity.character?.worldGaugeModules)
        ?entity.character.worldGaugeModules
        :[];
    }

    return [];
  },

  value(entity,ref){
    return RuntimeValueReferenceService.resolve(entity,ref);
  },

  variant(entity,items,now=performance.now()){
    if(!Array.isArray(items))return null;
    for(const item of items){
      if(!item||!Array.isArray(item.conditions))continue;
      if(
        TriggerModuleService.matches(
          {type:'trigger',event:'gauge.variant',conditions:item.conditions},
          'gauge.variant',
          {source:entity,target:entity,now}
        )
      )return item;
    }
    return null;
  },

  draw(ctx,entity,x,y,width=48){
    let usedHeight=0;
    const worldArcGaugeCount=
      (entity?.character?.worldGaugeModules||[])
        .filter(module=>module?.type==='gauge.arc')
        .length;

    const markEntries=StackMarkService.statesForTarget(entity,performance.now());
    for(const entry of markEntries){
      const state=entry.state;
      const presentation=state.presentation||{};
      const ring=presentation.rangeRing||null;
      if(ring&&Number(state.breakDistance)>0){
        const rgb=ColorService.rgbString(
          ring.color||entry.source?.color||'#ffe6f7',
          '255,230,247'
        );
        ctx.save();
        ctx.beginPath();
        ctx.arc(
          Number(entity.x)||0,
          Number(entity.y)||0,
          Number(state.breakDistance)||0,
          0,
          Math.PI*2
        );
        ctx.strokeStyle=`rgba(${rgb},${Math.max(0,Math.min(1,Number(ring.alpha)||.42))})`;
        ctx.lineWidth=Math.max(.5,Number(ring.lineWidth)||1.5);
        ctx.setLineDash(Array.isArray(ring.dash)?ring.dash:[6,6]);
        ctx.stroke();
        ctx.restore();
      }
      const gauge=presentation.gauge||null;
      if(gauge?.type==='segmented-gauge'&&(Number(state.stacks)||0)>0){
        const height=Math.max(1,Number(gauge.height)||4);
        const segments=Array.isArray(gauge.segments)
          ?gauge.segments
          :Array.from({length:Math.max(1,Number(state.max)||1)},(_,i)=>({value:i+1,color:entry.source?.color||entity.color}));
        if(SegmentedGaugePresentationService.draw(ctx,{
          ...gauge,
          x,
          y:y+usedHeight,
          width,
          value:Math.max(0,Number(state.stacks)||0),
          segments
        })){
          usedHeight+=height+WorldGaugeBarPresentationService.gap;
        }
      }
    }

    for(const state of entity?.actionState?.values?.()||[]){
      if(
        state?.kind!==ProgressStateService.KIND||
        (Number(state.value)||0)<=0
      )continue;
      const gauge=state.presentation;
      if(!gauge||typeof gauge!=='object')continue;
      const height=Math.max(1,Number(gauge.height)||4);
      let drawn=false;
      if(gauge.type==='segmented-gauge'){
        drawn=SegmentedGaugePresentationService.draw(ctx,{
          ...gauge,
          x,
          y:y+usedHeight,
          width,
          value:Math.max(0,Number(state.value)||0),
          segments:Array.isArray(gauge.segments)?gauge.segments:[]
        });
      }else if(gauge.type==='bar-gauge'){
        drawn=WorldGaugeBarPresentationService.render(ctx,{
          x,
          y:y+usedHeight,
          width,
          height,
          progress:
            Math.max(0,Number(state.value)||0)/
            Math.max(1,Number(state.max)||1),
          color:String(gauge.color||entity.color||'#4af'),
          background:String(gauge.background||'#111')
        });
      }
      if(!drawn)continue;
      usedHeight+=height+WorldGaugeBarPresentationService.gap;
    }

    for(const module of this.modules(entity)){
      if(
        Array.isArray(module?.conditions)&&
        !TriggerModuleService.matches(
          {
            type:'trigger',
            event:'gauge.render',
            conditions:module.conditions
          },
          'gauge.render',
          {
            source:entity,
            target:entity,
            now:performance.now()
          }
        )
      )continue;

      if(
        module.visibility==='owner'&&
        module?.type!=='gauge.arc'&&
        entity!==Training.player&&
        EntityService.owner(entity)!==Training.player
      )continue;

      if(module?.type==='range.equipment-thresholds'){EquipmentGaugePresentationService.thresholds(ctx,entity,module);continue;}

      if(module?.type==='gauge.equipment-bank'){
        EquipmentGaugePresentationService.draw(ctx,entity,module);
        continue;
      }

      if(module?.type==='range.circle'){

        if(
          module.rangeRef==='character.formulaSequence.activationRange'
        ){
          const formulaConfig=FormulaSequenceConfigService(entity,{});
          const formulaMaxStage=
            Math.max(
              1,
              Math.floor(Number(formulaConfig.maxStage)||5)
            );
          if(
            FormulaSequenceService.stage(
              entity,
              formulaConfig
            )>=formulaMaxStage
          )continue;
        }

        const radius=Math.max(0,
          module.rangeRef==='character.formulaSequence.activationRange'
            ?Number(entity.character?.formulaSequence?.activationRange)||0
            :Number(module.range)||0
        );
        if(radius>0){
          const rgb=ColorService.rgbString(module.color||entity.color,'139,108,217');
          ctx.save();
          ctx.beginPath();
          ctx.arc(Number(entity.x)||0,Number(entity.y)||0,radius,0,Math.PI*2);
          ctx.strokeStyle=`rgba(${rgb},${Math.max(0,Math.min(1,Number(module.alpha)||.42))})`;
          ctx.lineWidth=Math.max(.5,Number(module.lineWidth)||1.5);
          ctx.setLineDash(Array.isArray(module.dash)?module.dash:[5,5]);
          ctx.stroke(); ctx.setLineDash([]); ctx.restore();
        }
        continue;
      }

      if(module?.type==='gauge.arc'){
        if(!duels3CanViewTeamGauge(entity))continue;
        const ratio=Number(
          this.value(
            entity,
            module.valueRef
          )
        )||0;
        const gaugeRadius=
          Number(module.radius)||
          (
            EntityRingLayoutService.chargeRadius(entity)+
            (Number(module.radiusOffset)||0)
          );
        const arcVariant=
          this.variant(
            entity,
            module.colorVariants
          );
        const pulseColorVariant=
          this.variant(
            entity,
            module.completePulseColorVariants
          );
        const now=performance.now();
        const formulaGauge=
          module.valueRef?.type===
            'formula-sequence-progress-ratio';
        const formulaConfig=
          formulaGauge
            ?FormulaSequenceConfigService(
              entity,
              {
                stateKey:String(
                  module.valueRef?.stateKey||''
                )
              }
            )
            :null;
        const formulaFlashActive=
          formulaGauge&&
          FormulaSequenceService.completeFlashActive(
            entity,
            formulaConfig,
            now
          );
        const completePulseColor=
          pulseColorVariant?.color||
          arcVariant?.completePulseColor||
          module.completePulseColor||
          arcVariant?.color||
          module.color||
          entity.color;

        ArcGaugePresentationService.render(
          ctx,
          entity,
          ratio,
          {
            ...module,
            ...(arcVariant||{}),
            completeAccent:
              worldArcGaugeCount<=1&&
              ratio>=1,
            maxChargeFlash:
              formulaGauge
                ?false
                :module.maxChargeFlash,
            completePulseColor,
            radius:gaugeRadius,
            completePulseRadius:
              Number(module.completePulseRadius)||
              EntityRingLayoutService.nextRadius(
                gaugeRadius,
                Math.max(
                  .1,
                  Number(module.lineWidth)||
                  EntityRingLayoutService.WIDTHS.gauge
                ),
                Math.max(
                  .1,
                  Number(module.completePulseLineWidth)||
                  EntityRingLayoutService.WIDTHS.flash
                )
              )
          }
        );

        if(formulaFlashActive){
          ArcGaugePresentationService.render(
            ctx,
            entity,
            1,
            {
              color:
                arcVariant?.color||
                module.color||
                entity.color,
              lineWidth:
                Number(module.lineWidth)||
                EntityRingLayoutService.WIDTHS.gauge,
              lineCap:String(module.lineCap||'butt'),
              radius:gaugeRadius,
              completeAccent:
                worldArcGaugeCount<=1,
              hideArcAtComplete:true,
              maxChargeFlash:true,
              completePulseColor,
              completePulseRadius:
                Number(module.completePulseRadius)||
                EntityRingLayoutService.nextRadius(
                  gaugeRadius,
                  Math.max(
                    .1,
                    Number(module.lineWidth)||
                    EntityRingLayoutService.WIDTHS.gauge
                  ),
                  EntityRingLayoutService.WIDTHS.flash
                ),
              completePulseLineWidth:
                EntityRingLayoutService.WIDTHS.flash
            }
          );
        }
        continue;
      }

      if(module?.type==='formula.sequence-text'){
        const state=FormulaSequenceService.presentation(entity,String(module.stateKey||''));
        if(state){
          const tokens=FormulaSequenceService.tokenProgress(state);
          const config=FormulaSequenceConfigService(entity,{});
          const stageIndex=Math.max(0,Math.floor(Number(state.stage)||0));
          const stageLabel=
            Array.isArray(config.stageLabels)&&config.stageLabels[stageIndex]
              ?String(config.stageLabels[stageIndex])
              :`STAGE ${stageIndex+1}`;
          const yText=y+usedHeight+7;
          const baseColor=String(module.color||entity.color||'#fff');
          const activeColor=String(module.activeColor||'#ffffff');
          const suffix=
            `  [${Math.max(0,Math.floor(Number(state.progress)||0))}/${FormulaSequenceService.expanded(state.tokens||[]).length}]`;

          ctx.save();
          ctx.font=String(module.font||'800 10px Pretendard, "Noto Sans KR", Arial, sans-serif');
          ctx.textAlign='left';
          ctx.textBaseline='middle';
          ctx.lineWidth=3;

          const parts=[{text:`${stageLabel}  `,color:baseColor}];
          tokens.forEach((item,index)=>{
            if(index>0)parts.push({text:' - ',color:baseColor});
            if(Array.isArray(item.chars)&&item.chars.length){
              item.chars.forEach(charState=>{
                parts.push({
                  text:charState.char,
                  color:charState.active===true
                    ?activeColor
                    :baseColor
                });
              });
            }else{
              parts.push({
                text:item.token,
                color:item.active===true
                  ?activeColor
                  :baseColor
              });
            }
          });
          parts.push({text:suffix,color:baseColor});

          const total=
            parts.reduce(
              (sum,p)=>sum+ctx.measureText(p.text).width,
              0
            );
          let dx=Number(x)+Number(width)/2-total/2;
          for(const p of parts){
            ctx.strokeStyle='rgba(10,8,18,.78)';
            ctx.fillStyle=p.color;
            ctx.strokeText(p.text,dx,yText);
            ctx.fillText(p.text,dx,yText);
            dx+=ctx.measureText(p.text).width;
          }
          ctx.restore();

          usedHeight+=
            Math.max(14,Number(module.height)||14)+
            WorldGaugeBarPresentationService.gap;
        }
        continue;
      }

      if(module?.type!=='gauge.segmented')continue;

      const height=Math.max(
        1,
        Number(module.height)||4
      );

      const colorVariant=this.variant(entity,module.colorVariants);
      const dynamicSegmentCount=
        module.segmentCountRef
          ?Math.max(
            0,
            Math.floor(
              Number(
                this.value(
                  entity,
                  module.segmentCountRef
                )
              )||0
            )
          )
          :0;

      const baseSegments=
        Array.isArray(module.segments)
          ?module.segments
          :(
            dynamicSegmentCount>0
              ?this.timedSegments(
                dynamicSegmentCount,
                String(
                  module.segmentColor||
                  module.color||
                  entity.color||
                  '#4af'
                )
              )
              :[]
          );

      const resolvedSegments=colorVariant?.color
        ?baseSegments.map(segment=>({...segment,color:String(colorVariant.color)}))
        :baseSegments;
      const gaugeY=y+usedHeight;
      const drawn=
        SegmentedGaugePresentationService.draw(
          ctx,
          {
            ...module,
            x,
            y:gaugeY,
            width,
            value:this.value(
              entity,
              module.valueRef
            ),
            segments:resolvedSegments
          }
        );

      if(!drawn)continue;

      const labelVariant=this.variant(entity,module.labelVariants);
      const labelText=String(labelVariant?.text??module.label??'');
      if(labelText){
        ctx.save();
        ctx.font=String(module.labelFont||'bold 11px sans-serif');
        ctx.textAlign='left';
        ctx.textBaseline='middle';
        ctx.fillStyle=String(labelVariant?.color||module.labelColor||entity.color||'#d4b8b8');
        ctx.fillText(labelText,Number(x)+Number(width)+5,gaugeY+height/2);
        ctx.restore();
      }

      usedHeight+=
        height+
        WorldGaugeBarPresentationService.gap;
    }

    for(
      const timerState of
      TimedThresholdBuffService
        .gaugeGroups(
          entity,
          performance.now()
        )
        .values()
    ){
      const gauge=timerState.gauge||{};
      const segmentDuration=Math.max(
        1,
        Number(timerState.segmentDuration)||5000
      );
      const max=Math.max(
        1,
        Math.ceil(
          Number(timerState.maxDuration)/
          segmentDuration
        )
      );
      const segments=this.timedSegments(
        max,
        gauge.color||
        entity.color||
        '#ee00ff'
      );
      const height=Math.max(
        1,
        Number(gauge.height)||4
      );

      const drawn=
        SegmentedGaugePresentationService.draw(
          ctx,
          {
            x,
            y:y+usedHeight,
            width,
            height,
            gap:Math.max(
              0,
              Number(gauge.gap)||2
            ),
            value:timerState.remaining,
            valueMode:'time',
            segmentDuration,
            activeAlpha:
              Number.isFinite(
                Number(gauge.activeAlpha)
              )
                ?Number(gauge.activeAlpha)
                :.95,
            background:
              gauge.background||
              'rgba(10,18,22,0.92)',
            stroke:
              gauge.stroke||
              'rgba(238,0,255,0.34)',
            segments
          }
        );

      if(!drawn)continue;

      usedHeight+=
        height+
        WorldGaugeBarPresentationService.gap;
    }

    return usedHeight;
  }
});