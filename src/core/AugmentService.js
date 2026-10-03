

/* 증강 */
const AugmentService=Object.freeze({
  rebuild(entity){
    if(!entity)return;
    const rebuildNow=performance.now();
    const counts=new Map();
    const effects=[];
    const effectsByEvent=new Map();

    for(const id of entity.augments||[]){
      const augment=AugmentDataService.get(id);
      if(!augment)continue;
      if(!entity.augmentState.augmentAcquiredAt.has(id)){
        entity.augmentState.augmentAcquiredAt.set(id,rebuildNow);
      }
      counts.set(id,(counts.get(id)||0)+1);
    }

    for(const id of counts.keys()){
      const augment=AugmentDataService.get(id);
      if(!augment)continue;
      for(const effect of augment.effects||[]){
        const entry={augment,effect};
        effects.push(entry);
        if(effect.type==='trigger'&&effect.event){
          const list=effectsByEvent.get(effect.event)||[];
          list.push(entry);
          effectsByEvent.set(effect.event,list);
        }
      }
    }

    for(const list of effectsByEvent.values()){
      list.sort((a,b)=>(Number(a.effect.priority)||0)-(Number(b.effect.priority)||0));
    }

    entity.augmentCache={counts,effects,effectsByEvent};
    for(const id of entity.augmentState.augmentAcquiredAt.keys()){
      if(!counts.has(id))entity.augmentState.augmentAcquiredAt.delete(id);
    }
    this.cleanupRemovedTriggerBuffs(entity);
    this.syncConstantBuffs(entity);
    this.syncVitals(entity);
    AugmentEffectModuleService.runTrigger(entity,'resource.changed',{source:entity,target:entity,resource:'health',now:rebuildNow});
    AugmentEffectModuleService.runTrigger(entity,'augment.rebuilt',{
      source:entity,
      target:entity,
      now:rebuildNow
    });
  },
  owner(entity){return EntityService.owner(entity)},
  count(entity,id){return this.owner(entity)?.augmentCache?.counts?.get(id)||0},
  effects(entity){
    return this.owner(entity)?.augmentCache?.effects||
      EMPTY_AUGMENT_EFFECTS;
  },
  captureResourceConditionSnapshot(entity){
    if(!entity)return null;
    return Object.freeze({
      stamina:Object.freeze({
        value:Math.max(0,Number(entity.stamina)||0),
        max:Math.max(0,Number(entity.maxStamina)||0)
      }),
      health:Object.freeze({
        value:Math.max(0,Number(entity.health)||0),
        max:Math.max(0,Number(entity.maxHealth)||0)
      })
    });
  },
  presentationAdjustmentValue(
    entity,
    type,
    now=performance.now()
  ){
    if(!entity||!COMBAT_BUFF_DEFS[type])return 0;

    const owner=this.owner(entity);
    const counts=owner?.augmentCache?.counts;
    if(!owner||!counts)return 0;

    const bonusProperty={
      damage:'damageBonus',
      projectileSpeed:'projectileSpeedBonus',
      projectileRadius:'projectileRadiusBonus'
    }[String(type||'')]||'';

    if(!bonusProperty)return 0;

    let total=0;

    for(const [augmentId,rawCount] of counts){
      const augment=AugmentDataService.get(augmentId);
      if(!augment)continue;

      const stackCount=Math.max(1,Number(rawCount)||1);

      for(const adjustment of augment.attackAdjustments||[]){
        if(
          !Array.isArray(adjustment.presentationBuffs)||
          !adjustment.presentationBuffs.includes(type)
        )continue;

        if(
          Array.isArray(adjustment.conditions)&&
          !adjustment.conditions.every(condition=>
            AugmentEffectModuleService.conditionMatches(
              owner,
              augment,
              {id:'attack-adjustment-presentation'},
              condition,
              {source:owner,now}
            )===true
          )
        )continue;

        total+=
          (Number(adjustment[bonusProperty])||0)*
          stackCount;
      }
    }

    return total;
  },
  staminaHealthFallbackRatio(entity){
    let ratio=0;
    for(const {augment,effect} of this.effects(entity)){
      if(effect.type!=='stamina.health-fallback')continue;
      ratio+=
        Math.max(0,Number(effect.healthCostRatio)||0)*
        Math.max(1,this.count(entity,augment.id));
    }
    return ratio;
  },
  syncVitals(entity){
    const owner=this.owner(entity);
    if(!owner)return false;

    for(const candidate of EntityService.items.values()){
      if(this.owner(candidate)!==owner)continue;

      const healthBase=Math.max(
        1,
        Number(candidate.baseMaxHealth)||Number(candidate.maxHealth)||1
      );
      const staminaBase=Math.max(
        0,
        Number(candidate.baseMaxStamina)||Number(candidate.maxStamina)||0
      );

      const oldMaxHealth=Math.max(1,Number(candidate.maxHealth)||healthBase);
      const oldMaxStamina=Math.max(0,Number(candidate.maxStamina)||staminaBase);
      const healthRatio=Math.max(0,Math.min(1,candidate.health/oldMaxHealth));
      const staminaRatio=oldMaxStamina>0
        ?Math.max(0,Math.min(1,candidate.stamina/oldMaxStamina))
        :1;

      candidate.maxHealth=Math.max(
        1,
        ResourceValueService.round(
          healthBase*
            Math.max(
              .10,
              1+BuffService.resolve(candidate,'maxHealth')
            ),
          healthBase
        )
      );
      candidate.maxStamina=Math.max(
        0,
        ResourceValueService.round(
          staminaBase*
            Math.max(
              0,
              1+BuffService.resolve(candidate,'maxStamina')
            ),
          staminaBase
        )
      );

      candidate.health=Math.min(
        candidate.maxHealth,
        ResourceValueService.round(
          candidate.maxHealth*healthRatio,
          candidate.maxHealth
        )
      );
      candidate.stamina=Math.min(
        candidate.maxStamina,
        ResourceValueService.round(
          candidate.maxStamina*staminaRatio,
          candidate.maxStamina
        )
      );

      candidate.healthTrailHealth=Math.min(
        candidate.maxHealth,
        Math.max(candidate.health,Number(candidate.healthTrailHealth)||candidate.health)
      );
    }

    return true;
  },
  acquire(entity,augment){
    const owner=this.owner(entity);
    if(!owner||!augment)return false;
    const previousCount=this.count(owner,augment.id);
    if((augment.nonStackable||augment.rarity==='unique')&&previousCount>0)return false;
    owner.augments.push(augment.id);
    if(previousCount<=0){
      owner.augmentState.augmentAcquiredAt.set(augment.id,performance.now());
    }
    this.rebuild(owner);
    GameEvents.emit('augment-inventory-changed',{
      entity:owner,
      augmentId:augment.id,
      action:'acquire',
      now:performance.now()
    });
    OnlineAugmentInventorySyncService.send(owner);
    return true;
  },
  remove(entity,augment){
    const owner=this.owner(entity);
    if(!owner||!augment)return false;
    const index=owner.augments.lastIndexOf(augment.id);
    if(index<0)return false;
    owner.augments.splice(index,1);
    this.rebuild(owner);
    if(this.count(owner,augment.id)<=0){
      owner.augmentState.augmentAcquiredAt.delete(augment.id);

      for(const candidate of EntityService.items.values()){
        if(this.owner(candidate)!==owner)continue;

        const cooldowns=
          candidate?.augmentState?.effectCooldowns;
        if(!(cooldowns instanceof Map))continue;

        for(const key of [...cooldowns.keys()]){
          if(key.startsWith(`${augment.id}:`)){
            cooldowns.delete(key);
          }
        }
      }
    }
    GameEvents.emit('augment-inventory-changed',{
      entity:owner,
      augmentId:augment.id,
      action:'remove',
      now:performance.now()
    });
    OnlineAugmentInventorySyncService.send(owner);
    return true;
  },
  cleanupRemovedTriggerBuffs(entity){
    const owner=this.owner(entity);
    if(!owner)return false;

    const persistent=owner?.augmentState?.persistent;
    if(!(persistent instanceof Map))return false;

    const prefix='augment:trigger:';
    for(const key of [...persistent.keys()]){
      if(!String(key).startsWith(prefix))continue;

      const rest=String(key).slice(prefix.length);
      const separator=rest.indexOf(':trigger:');
      if(separator<0)continue;

      const type=rest.slice(0,separator);
      const sourceId=rest.slice(separator+1);
      const sourceParts=sourceId.split(':');
      const augmentId=sourceParts[1]||'';

      if(!augmentId||this.count(owner,augmentId)>0)continue;

      for(const candidate of EntityService.items.values()){
        if(this.owner(candidate)!==owner)continue;
        BuffService.remove(candidate,type,sourceId);
      }
      persistent.delete(key);
    }

    return true;
  },
  syncConstantBuffs(entity){
    const owner=this.owner(entity);
    if(!owner)return false;

    const candidates=[
      ...EntityService.items.values()
    ].filter(candidate=>
      candidate&&
      this.owner(candidate)===owner
    );

    const totals=new Map();

    for(const {augment,effect} of this.effects(owner)){
      if(
        effect.type!=='modifier.constant'||
        !COMBAT_BUFF_DEFS[effect.stat]
      )continue;

      const key=`${effect.stat}|${augment.id}`;
      totals.set(
        key,
        (totals.get(key)||0)+
        (Number(effect.value)||0)*
        (
          effect.perStack===false
            ?1
            :Math.min(
              this.count(owner,augment.id),
              Number.isFinite(Number(effect.maxStacks))
                ?Math.max(0,Number(effect.maxStacks))
                :Infinity
            )
        )
      );
    }

    for(const candidate of candidates){
      for(const type of Object.keys(COMBAT_BUFF_DEFS)){
        const prefix=`augment:constant:${type}:`;

        for(const [key] of candidate.augmentState.persistent){
          if(!key.startsWith(prefix))continue;

          BuffService.remove(
            candidate,
            type,
            key.slice(prefix.length)
          );
          candidate.augmentState.persistent.delete(key);
        }
      }

      for(const [key,value] of totals){
        const [type,sourceId]=key.split('|');

        BuffService.set(
          candidate,
          type,
          value,
          sourceId,
          Infinity,
          {
            tags:TagService.effectTags({
              type:'modifier.constant',
              value
            }),
            inheritedFromOwner:
              candidate!==owner
          }
        );

        candidate.augmentState.persistent.set(
          `augment:constant:${type}:${sourceId}`,
          true
        );
      }
    }

    return true;
  },
  update(entity,now=performance.now()){
    if(
      !entity?.alive||
      !AugmentEffectModuleService.triggers(entity,'time.update').length
    )return;
    AugmentEffectModuleService.runTrigger(
      entity,
      'time.update',
      {source:entity,target:entity,now}
    );
  },
  rangeAdjustmentTotalForTags(
    entity,
    tags
  ){
    if(!entity)return 0;

    const owner=this.owner(entity);
    const counts=owner?.augmentCache?.counts;
    if(!counts)return 0;

    let total=0;
    const resolvedTags=
      tags instanceof Set
        ?tags
        :new Set(tags||[]);

    for(const [augmentId,rawCount] of counts){
      const augment=
        AugmentDataService.get(
          augmentId
        );
      if(!augment)continue;

      const stackCount=
        Math.max(
          1,
          Number(rawCount)||1
        );

      for(
        const adjustment of
        augment.attackAdjustments||[]
      ){
        if(
          !AttackQueryService.matchesTags(
            resolvedTags,
            adjustment.selector
          )
        )continue;

        total+=
          (Number(adjustment.rangeBonus)||0)*
          stackCount;
      }
    }

    return total;
  },

  prepareRangeField(
    entity,
    field,
    now=performance.now()
  ){
    if(!entity||!field)return field;

    const tags=
      TagService.fieldTags(field);
    const rangeBonus=
      this.rangeAdjustmentTotalForTags(
        entity,
        tags
      );
    const multiplier=
      Math.max(
        .05,
        1+rangeBonus
      );

    if(multiplier===1)return field;

    return this.scaleAttackRangeModule(
      {
        ...field,
        type:'field.area'
      },
      multiplier
    );
  },

  prepareAttackLinkedGeometry(
    entity,
    attack,
    geometry,
    now=performance.now(),
    {visual=true,recursive=false}={}
  ){
    if(!entity||!attack||!geometry)return geometry;

    const totals=
      this.attackAdjustmentTotals(
        entity,
        attack,
        now
      );
    const multiplier=
      Math.max(
        .05,
        1+(Number(totals.rangeBonus)||0)
      );

    if(multiplier===1)return geometry;

    return recursive
      ?this.scaleAttackRangeModule(
        geometry,
        multiplier
      )
      :this.scaleRangeGeometry(
        geometry,
        multiplier,
        {visual}
      );
  },

  attackAdjustmentTotals(
    entity,
    spec,
    now=performance.now(),
    {
      resourceConditionSnapshot=null
    }={}
  ){
    const result={
      damageBonus:0,
      rangeBonus:0,
      projectileRadiusBonus:0,
      projectileSpeedBonus:0,
      costMultiplier:1,
      wallPierce:false
    };
    if(!entity||!spec)return result;

    const owner=this.owner(entity);
    const counts=owner?.augmentCache?.counts;
    if(!counts)return result;

    for(const [augmentId,rawCount] of counts){
      const augment=AugmentDataService.get(augmentId);
      if(!augment)continue;

      const stackCount=
        Math.max(
          1,
          Number(rawCount)||1
        );

      for(const adjustment of augment.attackAdjustments||[]){
        if(
          !AttackQueryService.matchesSelector(
            spec,
            adjustment.selector
          )
        )continue;

        if(
          Array.isArray(adjustment.conditions)&&
          !adjustment.conditions.every(condition=>
            AugmentEffectModuleService.conditionMatches(
              entity,
              augment,
              {id:'attack-adjustment'},
              condition,
              {
                source:entity,
                attack:spec,
                now,
                resourceConditionSnapshot
              }
            )===true
          )
        )continue;

        result.damageBonus+=
          (Number(adjustment.damageBonus)||0)*
          stackCount;
        result.rangeBonus+=
          (Number(adjustment.rangeBonus)||0)*
          stackCount;
        result.projectileRadiusBonus+=
          (Number(adjustment.projectileRadiusBonus)||0)*
          stackCount;
        result.projectileSpeedBonus+=
          (Number(adjustment.projectileSpeedBonus)||0)*
          stackCount;
        if(Number.isFinite(Number(adjustment.costMultiplier))){
          result.costMultiplier*=
            Math.pow(
              Math.max(0,Number(adjustment.costMultiplier)||0),
              stackCount
            );
        }
        if(adjustment.wallPierce===true){
          result.wallPierce=true;
        }
      }
    }

    return result;
  },
  attackCostMultiplier(entity,spec,now=performance.now()){
    return Math.max(
      0,
      Number(
        this.attackAdjustmentTotals(
          entity,
          spec,
          now
        ).costMultiplier
      )||0
    );
  },

  scaleRangeValue(value,multiplier){
    if(!Number.isFinite(Number(value)))return value;
    return Math.max(
      0,
      Number(value)*
      Math.max(.05,Number(multiplier)||1)
    );
  },

  scaleRangeGeometry(config,multiplier,{
    visual=false
  }={}){
    if(!config||typeof config!=='object')return config;

    const next={...config};
    const dimensions=[
      'range',
      'halfWidth',
      'startHalfWidth',
      'endHalfWidth',
      'triggerResolveRange'
    ];

    for(const key of dimensions){
      if(Number.isFinite(Number(config[key]))){
        next[key]=this.scaleRangeValue(
          config[key],
          multiplier
        );
      }
    }

    if(visual){
      for(const key of ['r','maxR','radius','len','width']){
        if(Number.isFinite(Number(config[key]))){
          next[key]=this.scaleRangeValue(
            config[key],
            multiplier
          );
        }
      }
    }

    return next;
  },

  scaleAttackRangeModule(module,multiplier){
    if(!module||typeof module==='string')return module;

    const type=AttackModuleService.type(module);

    if(type==='delivery.range-projectile'){
      const next={...module};
      if(Number.isFinite(Number(module.radius)))next.radius=this.scaleRangeValue(module.radius,multiplier);
      if(Number.isFinite(Number(module.hitRadius)))next.hitRadius=this.scaleRangeValue(module.hitRadius,multiplier);
      if(module.orbit&&typeof module.orbit==='object'){
        next.orbit={
          ...module.orbit,
          minRadius:
            Number.isFinite(Number(module.orbit.minRadius))
              ?this.scaleRangeValue(module.orbit.minRadius,multiplier)
              :module.orbit.minRadius,
          maxRadius:
            Number.isFinite(Number(module.orbit.maxRadius))
              ?this.scaleRangeValue(module.orbit.maxRadius,multiplier)
              :module.orbit.maxRadius
        };
      }
      return next;
    }

    if(
      type==='delivery.area'||
      type==='delivery.hitscan'||
      type==='attack.guard'||
      type==='field.area'
    ){
      const next=
        this.scaleRangeGeometry(
          module,
          multiplier
        );

      if(
        type==='field.area'&&
        module.presentation&&
        typeof module.presentation==='object'
      ){
        next.presentation=
          this.scaleRangeGeometry(
            module.presentation,
            multiplier,
            {visual:true}
          );
      }

      return next;
    }

    if(type==='effect.spawn'){
      const scalesVisual=
        module.clipToAttackArea===true||
        module.replaceAutoAreaEffect===true||
        module.scaleWithAttackRange===true;

      let next=
        scalesVisual
          ?this.scaleRangeGeometry(
            module,
            multiplier,
            {visual:true}
          )
          :module;

      if(
        module.damage?.module&&
        typeof module.damage.module==='object'
      ){
        next={
          ...next,
          damage:{
            ...module.damage,
            module:this.scaleAttackRangeModule(
              module.damage.module,
              multiplier
            )
          }
        };
      }

      return next;
    }

    if(type==='buff.time-add'){
      if(!module.aura||typeof module.aura!=='object'){
        return module;
      }

      return {
        ...module,
        aura:this.scaleRangeGeometry(
          module.aura,
          multiplier,
          {visual:true}
        )
      };
    }

    if(
      type==='status.apply'&&
      Number.isFinite(Number(module.maxImpactRange))
    ){
      return {
        ...module,
        maxImpactRange:this.scaleRangeValue(
          module.maxImpactRange,
          multiplier
        )
      };
    }

    if(
      type==='projectile.impact'&&
      module.field&&
      typeof module.field==='object'
    ){
      return {
        ...module,
        field:this.scaleAttackRangeModule(
          module.field,
          multiplier
        )
      };
    }

    return module;
  },

  prepareAttack(
    entity,
    spec,
    now=performance.now(),
    {
      networkAdjustments=null,
      captureAdjustments=null,
      resourceConditionSnapshot=null
    }={}
  ){
    if(!entity||!spec)return spec;

    let modules=(spec.modules||[]).map(
      module=>typeof module==='string'?module:{...module}
    );

    const projectileRadiusDelta=BuffService.resolve(
      entity,
      'projectileRadius',
      now
    );
    const combatStats=CombatStatsService.current(entity,now);
    const localAdjustmentTotals=
      this.attackAdjustmentTotals(
        entity,
        spec,
        now,
        {
          resourceConditionSnapshot
        }
      );

    /*
      온라인에서는 공격자가 AttackSpec 준비 시 확정한 attackAdjustment 결과가
      유일한 권위다. 원격 클라이언트가 자신의 현재 resource 상태로 조건을
      재평가하면 during-charge처럼 발사 전에 resource가 변하는 공격에서
      서로 다른 최종 AttackSpec이 만들어질 수 있다.
    */
    const networkNumber=(key,fallback)=>{
      const value=Number(networkAdjustments?.[key]);
      return Number.isFinite(value)
        ?value
        :fallback;
    };

    const damageBonusTotal=
      networkNumber(
        'damageBonus',
        localAdjustmentTotals.damageBonus
      );
    const rangeBonusTotal=
      networkNumber(
        'rangeBonus',
        localAdjustmentTotals.rangeBonus
      );
    const projectileRadiusBonusTotal=
      networkNumber(
        'projectileRadiusBonus',
        localAdjustmentTotals.projectileRadiusBonus
      );
    const projectileSpeedBonusTotal=
      networkNumber(
        'projectileSpeedBonus',
        localAdjustmentTotals.projectileSpeedBonus
      );
    const costMultiplier=
      Math.max(
        0,
        networkNumber(
          'costMultiplier',
          localAdjustmentTotals.costMultiplier
        )
      );
    const wallPierceAdjustment=
      typeof networkAdjustments?.wallPierce==='boolean'
        ?networkAdjustments.wallPierce
        :localAdjustmentTotals.wallPierce===true;

    if(
      captureAdjustments&&
      typeof captureAdjustments==='object'
    ){
      captureAdjustments.damageBonus=
        damageBonusTotal;
      captureAdjustments.rangeBonus=
        rangeBonusTotal;
      captureAdjustments.projectileRadiusBonus=
        projectileRadiusBonusTotal;
      captureAdjustments.projectileSpeedBonus=
        projectileSpeedBonusTotal;
      captureAdjustments.costMultiplier=
        costMultiplier;
      captureAdjustments.wallPierce=
        wallPierceAdjustment;
    }

    const damageMultiplier=
      Math.max(0,1+damageBonusTotal);
    const attackRangeMultiplier=
      Math.max(.05,1+rangeBonusTotal);
    const projectileRadiusMultiplier=
      Math.max(
        .10,
        1+
          projectileRadiusDelta+
          projectileRadiusBonusTotal
      );

    const rangeLinkedMovement=
      attackRangeMultiplier!==1&&
      TagService.hasAttack(
        spec,
        '범위 공격'
      )&&
      (spec.modules||[]).some(
        module=>
          AttackModuleService.type(module)===
          'movement.move'
      );

    if(attackRangeMultiplier!==1){
      /*
        rangeBonus 적용 대상 여부는 AttackQueryService selector가 결정한다.
        범위 공격 geometry는 기존 공통 scaler를 사용하고, 같은 AttackSpec에
        movement.move가 함께 있다면 그 이동거리도 같은 배율로 준비한다.
        단순 이동기에는 rangeLinkedMovement가 성립하지 않는다.
      */
      modules=modules.map(module=>{
        let prepared=
          this.scaleAttackRangeModule(
            module,
            attackRangeMultiplier
          );

        if(
          rangeLinkedMovement&&
          AttackModuleService.type(prepared)===
            'movement.move'&&
          Number.isFinite(
            Number(prepared.distance)
          )
        ){
          prepared={
            ...prepared,
            distance:this.scaleRangeValue(
              prepared.distance,
              attackRangeMultiplier
            )
          };
        }

        if(
          rangeLinkedMovement&&
          AttackModuleService.type(prepared)===
            'effect.spawn'&&
          prepared.damage?.requireMovementExecution===true&&
          prepared.animation&&
          Number.isFinite(
            Number(prepared.animation.distance)
          )
        ){
          prepared={
            ...prepared,
            animation:{
              ...prepared.animation,
              distance:this.scaleRangeValue(
                prepared.animation.distance,
                attackRangeMultiplier
              )
            }
          };
        }

        return prepared;
      });
    }

    if(wallPierceAdjustment){
      let hasProjectilePierce=false;
      let hasProjectile=false;

      modules=modules.map(module=>{
        if(!module||typeof module==='string')return module;
        const type=AttackModuleService.type(module);

        if(
          type==='delivery.area'||
          type==='delivery.hitscan'
        ){
          return {...module,wallPolicy:'ignore'};
        }
        if(type==='delivery.projectile'||type==='delivery.range-projectile'){
          hasProjectile=true;
          return module;
        }
        if(type==='projectile.pierce'){
          hasProjectilePierce=true;
          return {...module,walls:true};
        }
        return module;
      });

      if(hasProjectile&&!hasProjectilePierce){
        modules.push({
          type:'projectile.pierce',
          targets:false,
          walls:true
        });
      }
    }

    for(let index=0;index<modules.length;index++){
      const module=modules[index];
      if(typeof module==='string')continue;

      if(module.type==='delivery.projectile'||module.type==='delivery.range-projectile'){
        const authoredSpeed=
          Math.max(
            .0001,
            Number(module.speed)||0
          );
        const homing=
          module.homing&&
          typeof module.homing==='object'&&
          module.homing.preserveTurnRadius===true
            ?{
              ...module.homing,
              turnReferenceSpeed:
                Math.max(
                  .0001,
                  Number(
                    module.homing
                      .turnReferenceSpeed
                  )||
                  authoredSpeed
                )
            }
            :module.homing;

        modules[index]={
          ...module,
          homing,
          radius:
            Math.max(0,Number(module.radius)||0)*
            projectileRadiusMultiplier,
          hitRadius:
            Math.max(
              0,
              Number(module.hitRadius)||
              Number(module.radius)||
              0
            )*
            projectileRadiusMultiplier,
          speed:
            authoredSpeed*
            Math.max(0,combatStats.projectileSpeedMult)*
            Math.max(0,1+projectileSpeedBonusTotal)
        };
        continue;
      }

      if(module.type==='projectile.return'){
        modules[index]={
          ...module,
          speed:
            (Number(module.speed)||0)*
            Math.max(0,combatStats.projectileSpeedMult)
        };
        continue;
      }

      if(
        module.type==='projectile.presentation'&&
        projectileRadiusMultiplier!==1&&
        module.style
      ){
        modules[index]={
          ...module,
          style:{
            ...module.style,
            radius:
              Number.isFinite(Number(module.style.radius))
                ?Number(module.style.radius)*
                  projectileRadiusMultiplier
                :module.style.radius
          }
        };
      }
    }

    return {
      ...spec,
      modules,
      tags:[...(spec.tags||[])],
      damageRatio:
        AbilityService.damageRatio(
          entity.character,
          spec
        )*
        damageMultiplier,
      cost:
        Math.max(0,Number(spec.cost)||0)*
        costMultiplier,
      range:
        Math.max(
          0,
          Number(spec.range)||0
        )*
        (
          (
            (spec.modules||[]).some(module=>
              (
                module?.type==='delivery.area'||
                module?.type==='delivery.hitscan'
              )&&
              !(
                module?.type==='delivery.area'&&
                (
                  Number.isFinite(Number(module.repeatCenterDistanceStart))||
                  Number.isFinite(Number(module.repeatCenterDistanceStep))
                )
              )
            )||
            rangeLinkedMovement
          )
            ?attackRangeMultiplier
            :1
        ),
      previewGeometry:
        spec.previewGeometry&&
        typeof spec.previewGeometry==='object'&&
        rangeLinkedMovement
          ?this.scaleRangeGeometry(
            spec.previewGeometry,
            attackRangeMultiplier
          )
          :spec.previewGeometry,
      charge:
        spec.charge
          ?{
            ...spec.charge,
            range:
              spec.charge.range
                ?{
                  ...spec.charge.range,
                  from:
                    Number.isFinite(Number(spec.charge.range.from))
                      ?Number(spec.charge.range.from)*
                        attackRangeMultiplier
                      :spec.charge.range.from,
                  to:
                    Number.isFinite(Number(spec.charge.range.to))
                      ?Number(spec.charge.range.to)*
                        attackRangeMultiplier
                      :spec.charge.range.to
                }
                :spec.charge.range
          }
          :spec.charge,
      cd:Math.max(
        10,
        (Number(spec.cd)||0)/
          Math.max(.10,combatStats.attackSpeedMult)
      )
    };
  },
  /*
    숫자 사거리만 필요한 AI/프리뷰는 rangeBonus를 다시 계산하지 않고
    prepareAttack()이 만든 최종 delivery geometry를 읽는다.
  */
  preparedAttackRange(
    entity,
    attackId,
    now=performance.now(),
    fallback=0
  ){
    const owner=this.owner(entity);
    const character=
      owner?.character||
      entity?.character;
    const base=
      AbilityService.attackById(
        character,
        String(attackId||'')
      );

    if(!base){
      return Math.max(
        0,
        Number(fallback)||0
      );
    }

    const prepared=
      this.prepareAttack(
        entity,
        base,
        now
      );
    const area=
      AttackModuleService.module(
        prepared,
        'delivery.area'
      );
    const hitscan=
      AttackModuleService.module(
        prepared,
        'delivery.hitscan'
      );
    const module=
      area||
      hitscan;
    return Math.max(
      0,
      Number(module?.range)||0,
      Number(prepared.range)||0,
      Number(fallback)||0
    );
  },

  beforeDefeat({
    source,
    target,
    attack,
    execution=null,
    impact=null,
    amount,
    now=performance.now()
  }){
    if(!target?.alive)return {prevented:false,health:0};
    const context=AugmentEffectModuleService.runTrigger(
      target,
      'before-defeat',
      {
        source,
        target,
        attack,
        execution,
        impact,
        amount:Math.max(0,Number(amount)||0),
        defeatPrevented:false,
        preventedHealth:0,
        now
      }
    );
    return {
      prevented:context.defeatPrevented===true,
      health:Math.max(1,Number(context.preventedHealth)||1)
    };
  },
  damageBatchProtected(
    target,
    execution,
    now=performance.now()
  ){
    if(
      !target||
      !execution||
      !(target.augmentState?.defeatProtection instanceof WeakMap)
    )return false;

    const expiresAt=
      Number(
        target.augmentState
          .defeatProtection
          .get(execution)
      )||0;

    if(expiresAt<=0)return false;

    if(now>expiresAt){
      target.augmentState
        .defeatProtection
        .delete(execution);
      return false;
    }

    return true;
  },
  beforeIncomingDamage({
    source,
    target,
    attack,
    execution=null,
    impact=null,
    amount,
    now=performance.now()
  }){
    if(!target?.alive)return Math.max(0,Number(amount)||0);

    // 사망 방지 발동을 일으킨 동일 공격 실행의 동시 후속 피해는
    // 사용 횟수 소모 뒤에도 같은 묶음으로 보호한다.
    if(
      this.damageBatchProtected(
        target,
        execution,
        now
      )
    ){
      return 0;
    }
    const context=AugmentEffectModuleService.runTrigger(
      target,
      'before-damage-received',
      {
        source,
        target,
        attack,
        execution,
        impact,
        amount:Math.max(0,Number(amount)||0),
        now
      }
    );
    return Math.max(0,Number(context.amount)||0);
  },
  onDamageApplied(result){
    const source=result?.source;
    const target=result?.target;
    if(!target)return;

    const baseContext={
      source,
      target,
      attack:result.attack||null,
      execution:result.execution||null,
      impact:result.impact||null,
      amount:Math.max(0,Number(result.amount)||0),
      healthDamage:Math.max(0,Number(result.healthDamage)||0),
      executionHealthDamage:Math.max(
        0,
        Number(result.executionHealthDamage??result.healthDamage)||0
      ),
      now:Number(result.now)||performance.now()
    };

    const online=
      Training.sessionMode==='online'&&
      OnlineDuelService.active;

    if(
      source&&
      (
        !online||
        EntitySimulationAuthorityService
          .isLocal(source)
      )
    ){
      AugmentEffectModuleService.runTrigger(
        source,
        'damage-dealt',
        baseContext
      );
    }

    if(
      baseContext.healthDamage>0&&
      (
        !online||
        EntitySimulationAuthorityService
          .isLocal(target)
      )
    ){
      AugmentEffectModuleService.runTrigger(
        target,
        'damage-received',
        baseContext
      );
    }
  },

  onConfirmedDamageDealt({
    source,
    target,
    attack,
    execution,
    impact,
    healthDamage,
    now=performance.now()
  }){
    if(
      !source||
      !target||
      !attack||
      !EntitySimulationAuthorityService
        .isLocal(source)
    )return false;

    const amount=
      Math.max(
        0,
        Number(healthDamage)||0
      );

    const executionHealthDamage=
      execution
        ?AttackExecutionService.addDamage(
          execution,
          target,
          amount
        )
        :amount;

    AugmentEffectModuleService.runTrigger(
      source,
      'damage-dealt',
      {
        source,
        target,
        attack,
        execution,
        impact,
        amount,
        healthDamage:amount,
        executionHealthDamage,
        now
      }
    );

    return true;
  },
  onProjectileResolved(projectile,hit){
    if(hit||!projectile?.source||!projectile?.attack)return;
    const tags=TagService.attackTags(projectile.attack);
    let restore=0;
    const processed=new Set();
    for(const {augment,effect} of this.effects(projectile.source)){
      if(effect.type!=='projectile.miss-stamina'||processed.has(augment.id))continue;
      if(effect.attackTag&&!tags.has(effect.attackTag))continue;
      processed.add(augment.id);
      restore+=(Number(effect.value)||0)*this.count(projectile.source,augment.id);
    }
    if(restore>0)StaminaService.restore(projectile.source,restore);
  },
});