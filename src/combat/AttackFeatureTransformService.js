

const AttackFeatureTransformService=Object.freeze({
  path(root,path){
    let value=root;
    for(const key of String(path||'').split('.').filter(Boolean)){
      if(!value||typeof value!=='object'||!(key in value))return null;
      value=value[key];
    }
    return value;
  },
  active(entity,profile,key){
    const feature=String(profile?.features?.[key]||'');
    if(!feature)return false;
    return ModeStateService.current(
      entity,
      `${String(profile.statePrefix||'')}${feature}`,
      profile.initialFeatures?.includes(feature)?'active':'inactive'
    )==='active';
  },
  modularLaser(entity,spec,profile){
    if(spec._modularLaserPrepared===true)return spec;
    const laser=this.path(entity?.character,profile.configPath)||null;
    if(!laser||!this.active(entity,profile,'base'))return spec;

    const dual=this.active(entity,profile,'dual');
    const pierce=this.active(entity,profile,'pierce');
    const instant=this.active(entity,profile,'instant');
    const wide=this.active(entity,profile,'wide');
    const rangeBoost=this.active(entity,profile,'range');
    const electric=this.active(entity,profile,'electric');
    const accelerate=this.active(entity,profile,'accelerate');
    const electricRgb=electric?String(profile.electricColor||'255,145,35'):null;
    const baseRange=Math.max(0,Number(spec.range)||0);
    const rangeBonus=rangeBoost
      ?(Number.isFinite(Number(profile.rangeBonus))
        ?Math.max(0,Number(profile.rangeBonus))
        :baseRange*Math.max(0,Math.max(1,Number(profile.rangeMultiplier??laser.rangeMultiplier))-1))
      :0;
    const widthMultiplier=wide
      ?Math.max(1,Number(profile.wideMultiplier??laser.wideMultiplier)||1)
      :1;
    const resolvedRange=baseRange+rangeBonus;
    const replacedTypes=new Set([
      'delivery.projectile','projectile.pierce','pattern.scatter',
      'delivery.delayed-projectile-volley','projectile.presentation'
    ]);
    const modules=(spec.modules||[]).filter(module=>!replacedTypes.has(AttackModuleService.type(module)));

    for(const [feature,values]of Object.entries(profile.hitFeatureModules||{})){
      if(this.active(entity,profile,feature))for(const value of values)modules.push(Object.freeze({...value}));
    }
    if(instant){
      const halfWidth=Math.max(0,Number(laser.instantHalfWidth??laser.radius)||0)*widthMultiplier;
      const count=dual?Math.max(1,Math.floor(Number(laser.dualCount)||1)):1;
      const offsets=dual
        ?Array.from({length:count},(_,index)=>(index-(count-1)/2)*Math.max(0,Number(laser.dualOffset)||0)*2)
        :[0];
      const baseEffect=this.path(entity?.character,profile.effectPath)||{};
      const effect=electric?{...baseEffect,color:electricRgb,coreColor:electricRgb}:baseEffect;
      for(const perpendicularOffset of offsets){
        modules.push(Object.freeze({
          type:'delivery.area',shape:'rect',range:resolvedRange,halfWidth,perpendicularOffset,
          wallPolicy:'block',stopAtFirstEnemy:pierce!==true,projectileClassification:'instant-laser'
        }));
        modules.push(Object.freeze({
          type:'effect.spawn',when:'after-attack',renderType:'beamLine',range:resolvedRange,halfWidth,
          perpendicularOffset,...effect,followSource:false,endFlare:pierce===true,
          clipToAttackArea:true,replaceAutoAreaEffect:true,scaleWithAttackRange:true
        }));
      }
    }else{
      if(dual){
        modules.push(
          Object.freeze({type:'pattern.scatter',count:Math.max(1,Math.floor(Number(laser.dualCount)||1)),spread:0}),
          Object.freeze({
            type:'delivery.delayed-projectile-volley',count:1,interval:0,aimMode:'locked',perVolleyPellets:true,
            perpendicularOffset:Math.max(0,Number(laser.dualOffset)||0),phaseKey:String(profile.phaseKey||'feature-dual-laser')
          })
        );
      }
      modules.push(
        Object.freeze({
          type:'delivery.projectile',speed:Math.max(0,Number(laser.speed)||0),
          radius:Math.max(0,Number(laser.radius)||0)*widthMultiplier,
          hitRadius:Math.max(0,Number(laser.hitRadius)||0)*widthMultiplier
        }),
        Object.freeze({type:'projectile.pierce',targets:pierce,walls:false}),
        Object.freeze({
          type:'projectile.presentation',kind:'projectile-style',
          style:Object.freeze({
            type:String(profile.projectileStyle||'laser-bolt'),baseRadius:Math.max(0,Number(laser.radius)||0),
            outerColor:electricRgb||'122,134,144',midColor:electricRgb||'190,202,210',coreColor:electricRgb||'225,233,238',centerColor:electricRgb||'255,255,255'
          })
        })
      );
    }

    return Object.freeze({...spec,_modularLaserPrepared:true,_modularLaserBaseCd:spec._modularLaserBaseCd??spec.cd,cd:accelerate?Number(spec._modularLaserBaseCd??spec.cd)/(1+Number(profile.attackRateIncrease||0)):(spec._modularLaserBaseCd??spec.cd),range:resolvedRange,modules:Object.freeze(modules),tags:spec.tags});
  },
  modeModules(entity,spec,profile){
    if(spec._modeModulesPrepared===true)return spec;
    let modules=[...(spec.modules||[])];
    let rate=1;
    for(const option of profile.options||[]){
      if(ModeStateService.current(entity,option.stateKey,option.initial)!==String(option.value))continue;
      const removeTypes=new Set(option.removeTypes||[]);
      modules=modules.filter(module=>!removeTypes.has(AttackModuleService.type(module)));
      modules=modules.map(module=>{
        const override=option.moduleOverrides?.find(candidate=>candidate.type===AttackModuleService.type(module))?.values;
        return override?Object.freeze({...module,...override}):module;
      });
      for(const module of option.modules||[])modules.push(Object.freeze({...module}));
      rate*=1+Math.max(0,Number(option.attackRateIncrease)||0);
    }
    return Object.freeze({...spec,_modeModulesPrepared:true,
      cd:Number(spec.cd||0)/rate,attackDelay:Number(spec.attackDelay||0)/rate,
      modules:Object.freeze(modules)});
  },
  pulseTint(entity,spec,profile,now=performance.now()){
    if(!entity||!spec||!profile)return spec;
    const active=this.path(entity,profile.activePath);
    if(active!==true)return spec;
    const color=this.path(entity?.character,profile.colorConfigPath)||null;
    if(!color)return spec;

    const pulse=.5+.5*Math.sin((Number(now)||0)*(Number(color.pulseSpeed)||0));
    const r=Math.max(0,Math.min(255,Math.round(Number(color.red)||0)));
    const g=Math.max(0,Math.min(255,Math.round((Number(color.greenBase)||0)+(Number(color.greenAmplitude)||0)*pulse)));
    const b=Math.max(0,Math.min(255,Math.round((Number(color.blueBase)||0)+(Number(color.blueAmplitude)||0)*pulse)));
    const rgb=`${r},${g},${b}`;
    const projectileColors=profile.projectileColors||{};
    const modules=(spec.modules||[]).map(module=>{
      const type=AttackModuleService.type(module);
      if(type==='effect.spawn'){
        return Object.freeze({
          ...module,
          color:rgb,
          coreColor:String(profile.effectCoreColor||module.coreColor||'255,255,255')
        });
      }
      if(type==='projectile.presentation'&&module.style){
        return Object.freeze({
          ...module,
          style:Object.freeze({
            ...module.style,
            outerColor:rgb,
            midColor:String(projectileColors.midColor||module.style.midColor||rgb),
            coreColor:String(projectileColors.coreColor||module.style.coreColor||rgb),
            centerColor:String(projectileColors.centerColor||module.style.centerColor||'255,255,255'),
            fillColor:rgb,
            strokeColor:rgb,
            trailStart:String(projectileColors.trailStart||module.style.trailStart||rgb),
            trailEnd:String(projectileColors.trailEnd||module.style.trailEnd||rgb)
          })
        });
      }
      return module;
    });

    return Object.freeze({
      ...spec,
      presentation:Object.freeze({
        ...(spec.presentation||{}),
        color:`rgb(${r},${g},${b})`
      }),
      modules:Object.freeze(modules)
    });
  },
  prepare(entity,spec,now=performance.now()){
    if(!entity||!spec)return spec;
    let resolved=spec;
    const featureProfile=resolved?.attackFeatureTransform;
    if(String(featureProfile?.type||'')==='modular-laser'){
      resolved=this.modularLaser(entity,resolved,featureProfile);
    }
    if(String(featureProfile?.type||'')==='mode-modules'){
      resolved=this.modeModules(entity,resolved,featureProfile);
    }
    const presentationProfile=entity?.character?.attackPresentationTransform;
    if(String(presentationProfile?.type||'')==='pulse-tint'){
      resolved=this.pulseTint(entity,resolved,presentationProfile,now);
    }
    return resolved;
  }
});
