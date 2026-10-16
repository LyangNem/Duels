

const ProgressScaledAttackService=Object.freeze({
  stateValue(source,config){
    const stateKey=String(config?.stateKey||'');
    if(!stateKey)return {
      state:null,
      value:0
    };

    const progressState=
      ProgressStateService.state(
        source,
        stateKey
      );
    if(progressState){
      return {
        state:progressState,
        value:
          Number(
            progressState.scaleStage??
            progressState.value
          )||0
      };
    }

    const actionState=
      source?.actionState?.get?.(
        stateKey
      )||
      null;

    return {
      state:actionState,
      value:
        Number(
          actionState?.scaleStage??
          actionState?.value
        )||0
    };
  },
  ratio(source,config){
    const resolved=this.stateValue(
      source,
      config
    );
    const state=resolved.state;
    if(!state)return 0;

    const value=resolved.value;
    const valueRange=config?.valueRange;
    if(valueRange&&typeof valueRange==='object'){
      const from=Number(valueRange.from);
      const to=Number(valueRange.to);
      if(
        Number.isFinite(from)&&
        Number.isFinite(to)&&
        Math.abs(to-from)>1e-9
      ){
        return Math.max(
          0,
          Math.min(
            1,
            (value-from)/(to-from)
          )
        );
      }
    }

    return Math.max(
      0,
      Math.min(
        1,
        value/Math.max(
          1,
          Number(state.max)||1
        )
      )
    );
  },
  stage(source,config){
    return Math.max(
      0,
      this.stateValue(
        source,
        config
      ).value
    );
  },
  lerp(pair,t,fallback){
    if(!pair||typeof pair!=='object')return fallback;
    const from=Number(pair.from),to=Number(pair.to);
    return Number.isFinite(from)&&Number.isFinite(to)?from+(to-from)*t:fallback;
  },
  scaledValue(source,config,pair,t,fallback){
    if(!pair||typeof pair!=='object')return fallback;

    if(
      String(config?.curve||'')==='multiplicative'
    ){
      const from=Number(pair.from);
      const factor=Number(config.factor);
      const range=config?.valueRange;
      const firstStage=
        Number.isFinite(Number(range?.from))
          ?Number(range.from)
          :1;
      const lastStage=
        Number.isFinite(Number(range?.to))
          ?Number(range.to)
          :firstStage;
      const stage=Math.max(
        firstStage,
        Math.min(
          lastStage,
          this.stage(source,config)
        )
      );

      if(
        Number.isFinite(from)&&
        Number.isFinite(factor)&&
        factor>0
      ){
        return from*
          Math.pow(
            factor,
            Math.max(
              0,
              stage-firstStage
            )
          );
      }
    }

    return this.lerp(
      pair,
      t,
      fallback
    );
  },
  stepped(source,config,pair,fallback){
    if(!pair||!Array.isArray(pair.steps)||!pair.steps.length)return fallback;
    const value=Math.max(
      0,
      this.stateValue(
        source,
        config
      ).value
    );
    const stepSize=Math.max(1,Number(pair.stepSize)||1);
    const index=Math.max(0,Math.min(pair.steps.length-1,Math.floor(value/stepSize)));
    const resolved=Number(pair.steps[index]);
    return Number.isFinite(resolved)?resolved:fallback;
  },
  runtimeStateScale(source,spec){
    if(!source||!spec||spec.runtimeStateScaleResolved===true)return spec;
    const config=source.character?.replacementAttackScaling;
    if(!config)return spec;
    const state=source.actionState?.get?.(String(config.stateKey||''))||null;
    if(!state)return spec;
    const rule=(config.rules||[]).find(item=>String(item?.attackId||'')===String(spec.id||''));
    if(!rule)return spec;
    const stage=Math.max(1,Math.floor(Number(state[config.stageProperty||'stage'])||1));
    const damageMultiplier=
      1+(stage-1)*Math.max(0,Number(config.damagePerStage)||0);
    const movementMultiplier=
      1+(stage-1)*Math.max(0,Number(config.movementPerStage)||0);
    if(
      Math.abs(damageMultiplier-1)<.0001&&
      Math.abs(movementMultiplier-1)<.0001
    ){
      return {
        ...spec,
        runtimeStateScaleResolved:true,
        runtimeStateScaleMultiplier:1
      };
    }
    const modules=(spec.modules||[]).map(module=>{
      const type=AttackModuleService.type(module);
      if(
        rule.movementDistance===true&&
        type==='movement.move'&&
        Number.isFinite(Number(module.distance))
      ){
        return {...module,distance:Math.max(0,Number(module.distance)*movementMultiplier)};
      }
      if(
        rule.deliveryRange===true&&
        type==='delivery.area'&&
        Number.isFinite(Number(module.range))
      ){
        return {...module,range:Math.max(0,Number(module.range)*movementMultiplier)};
      }
      return module;
    });
    return {
      ...spec,
      damageRatio:
        rule.damage===true
          ?Math.max(0,Number(spec.damageRatio)||0)*damageMultiplier
          :spec.damageRatio,
      range:
        rule.range===true
          ?Math.max(0,Number(spec.range)||0)*movementMultiplier
          :spec.range,
      modules,
      runtimeStateScaleResolved:true,
      runtimeStateScaleMultiplier:damageMultiplier
    };
  },
  resolve(source,spec){
    if(!spec)return spec;
    let resolved=spec;
    if(spec?.progressScaleResolved!==true&&spec?.progressScale){
      const config=spec.progressScale;
      const t=this.ratio(source,config);
      const range=this.scaledValue(
        source,
        config,
        config.range,
        t,
        Number(spec.range)||0
      );
      const damageRatio=Array.isArray(config.damageRatio?.steps)
        ?this.stepped(source,config,config.damageRatio,Number(spec.damageRatio)||0)
        :this.lerp(config.damageRatio,t,Number(spec.damageRatio)||0);
      const rules=Array.isArray(config.moduleValues)?config.moduleValues:[];
      const modules=(spec.modules||[]).map(module=>{
        const type=AttackModuleService.type(module);
        let next=module;
        for(const rule of rules){
          if(String(rule?.type||'')!==type)continue;
          const property=String(rule?.property||'');
          if(!property)continue;
          next={
            ...next,
            [property]:this.scaledValue(
              source,
              config,
              rule,
              t,
              Number(next[property])||0
            )
          };
        }
        return next;
      });
      resolved={...spec,range,damageRatio,modules,resolvedProgressRatio:t,progressScaleResolved:true};
    }
    return this.runtimeStateScale(source,resolved);
  },

  counterCc(spec,cc){
    const config=spec?.progressScale;
    const t=Number.isFinite(Number(spec?.resolvedProgressRatio))
      ?Math.max(0,Math.min(1,Number(spec.resolvedProgressRatio)))
      :0;
    let next=cc;
    for(const rule of config?.moduleValues||[]){
      if(String(rule?.type||'')!=='counter.cc')continue;
      const property=String(rule?.property||'');
      if(!property)continue;
      next={...next,[property]:this.lerp(rule,t,Number(next?.[property])||0)};
    }
    return next;
  }
});