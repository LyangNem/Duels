
const TagService=Object.freeze({
  rangeTag(range){
    const value=Math.max(0,Number(range)||0);
    return GAME_DATA.ranges.find(item=>value<=item.maxInclusive)?.tag||'초장거리';
  },
  isDerivedTag(tag){
    return GAME_DATA.ranges.some(item=>item.tag===tag)||
      Object.entries(COMBAT_STATUS_DEFS).some(([id,definition])=>tag===id||tag===definition.label)||
      Object.entries(COMBAT_BUFF_DEFS).some(([id,definition])=>tag===id||tag===definition.label)||
      [
        '공격','히트스캔','범위 공격','공격형태 원','공격형태 사각','공격형태 부채꼴','공격형태 투사체',
        '일반 투사체','무기 투사체','레이저 투사체','즉발 레이저 투사체','범위 투사체','특수 투사체',
        '근접 무기','이동기','벽 관통','적 관통','유도','귀환','설치형','소환','차징','충전','채널링',
        '다중 공격','대상당 1회','넉백','무력화 넉백','끌어오기','체력 회복','스테미나 회복','보호막',
        '최대 체력 비례 피해','조건부 피해','방어','버프','은신',
        // 예전 표기의 별칭도 보관된 태그에서 다시 유입시키지 않는다.
        '범위','투사체','일반','관통','근접','회복'
      ].includes(tag);
  },
  explicitAttackTags(spec){
    return new Set((spec?.tags||[]).filter(tag=>!this.isDerivedTag(tag)));
  },
  characterFor(spec){
    if(!spec?.id)return null;
    return Object.values(GAME_DATA.characters||{}).find(character=>
      Object.values(character.attacks||{}).some(attack=>attack.id===spec.id||attack.charge?.fullSpec?.id===spec.id)
    )||null;
  },
  characterMetadata(character){
    if(!character)return {fields:new Map(),channels:new Set(),combos:new Set()};
    const cached=attackTagMetadataCache.get(character);
    if(cached)return cached;
    const fields=new Map(),byState=new Map(),expansions=[],channels=new Set(),combos=new Set();
    const addField=field=>{
      if(field.removeOnly===true)return;
      if(field.stateKey&&!byState.has(field.stateKey))byState.set(field.stateKey,field);
      if(field.attackId&&field.damageOnTrigger===true){
        if(!fields.has(field.attackId))fields.set(field.attackId,[]);
        fields.get(field.attackId).push(field);
      }
    };
    const visit=value=>{
      if(!value||typeof value!=='object')return;
      if(value.type==='field.area')addField(value);
      if(value.type==='field.expand-recent')expansions.push(value);
      if(value.type==='channel.attack'&&value.attackId)channels.add(value.attackId);
      for(const child of Object.values(value))visit(child);
    };
    visit(character);
    for(const expansion of expansions){
      const original=byState.get(expansion.sourceStateKey);
      if(!original||!expansion.attackId)continue;
      addField({...original,...expansion,type:'field.area',stateKey:expansion.outputStateKey,
        damageOnTrigger:true,halfWidth:(Number(original.halfWidth)||0)*(Number(expansion.halfWidthMultiplier)||1)});
    }
    // 별도 AttackSpec으로 발사되는 콤보는 전달형태/CC를 서로 복사하지 않고 연타 의미만 공유한다.
    for(const ability of Object.values(character.abilities||{})){
      for(const trigger of Object.values(ability)){
        if(!Array.isArray(trigger?.modules))continue;
        const groups=new Map();
        for(const module of trigger.modules){
          if(module?.type!=='action.trigger-attack'||!module.attackId)continue;
          const first=module.requireAttackId||ability.attackId;
          if(!first)continue;
          if(!groups.has(first))groups.set(first,new Set([first]));
          groups.get(first).add(module.attackId);
        }
        for(const [first,ids] of groups){
          const attack=Object.values(character.attacks||{}).find(item=>item.id===first);
          const delivers=(attack?.modules||[]).some(module=>
            /^delivery\./.test(module.type)||module.type==='effect.spawn'&&module.damage
          );
          if(!delivers)ids.delete(first);
          if(ids.size>1)for(const id of ids)combos.add(id);
        }
      }
    }
    const result={fields,channels,combos};
    attackTagMetadataCache.set(character,result);
    return result;
  },
  attackRange(spec){
    if(!spec)return 0;
    const value=number=>Math.max(0,Number(number)||0);
    let range=value(spec.range);
    const readModules=modules=>{
      for(const module of modules||[]){
        if(!module||typeof module!=='object')continue;
        if(['delivery.projectile','delivery.range-projectile','delivery.area','delivery.hitscan'].includes(module.type)){
          range=Math.max(range,value(module.range));
          if(module.targetPoint===true&&module.targetPointClampToAttackRange===false)range=Infinity;
        }
        if(module.type==='effect.spawn'&&module.damage?.module)readModules([module.damage.module]);
      }
    };
    const readScale=scale=>{
      range=Math.max(range,value(scale?.range?.from),value(scale?.range?.to));
      for(const item of scale?.moduleValues||[]){
        if(item.property==='range')range=Math.max(range,value(item.from),value(item.to));
      }
    };
    readModules(spec.modules);
    readScale(spec.charge);
    readScale(spec.progressScale);
    if(spec.charge?.fullSpec)range=Math.max(range,this.attackRange(spec.charge.fullSpec));
    const character=this.characterFor(spec);
    for(const ability of Object.values(character?.abilities||{})){
      for(const trigger of Object.values(ability)){
        for(const module of trigger?.modules||[]){
          if(module.type==='counter.execute'&&ability.attackId===spec.id)readScale(module.charge);
        }
      }
    }
    return range;
  },
  addStatusTags(tags,status){
    if(!status)return;
    const id=typeof status==='string'?status:status.status;
    if(!id||typeof status==='object'&&Number(status.duration)===0)return;
    tags.add(id);
    const definition=COMBAT_STATUS_DEFS[id]||COMBAT_BUFF_DEFS[id];
    if(definition?.label)tags.add(definition.label);
    if(id==='stealth')tags.add('은신');
  },
  addBuffTags(tags,stat,value){
    if(!stat||Number(value)===0)return;
    tags.add('버프');
    tags.add(stat);
    if(COMBAT_BUFF_DEFS[stat]?.label)tags.add(COMBAT_BUFF_DEFS[stat].label);
    if(stat==='stealth')tags.add('은신');
  },
  addShapeTags(tags,shape){
    if(shape==='rect'||shape==='rectangle')tags.add('공격형태 사각');
    else if(['sector','cone','tapered-rect'].includes(shape))tags.add('공격형태 부채꼴');
    else if(shape==='circle')tags.add('공격형태 원');
  },
  fieldGeometryTags(field){
    const tags=new Set();
    if(!field||typeof field!=='object')return tags;
    tags.add('설치형');
    // 회수 명령과 다른 공격을 호출하는 감지 반경은 피해/지원 범위가 아니다.
    if(field.removeOnly===true||field.attackId&&field.damageOnTrigger!==true)return tags;
    const hasGeometry=['range','halfWidth','startHalfWidth','endHalfWidth'].some(key=>Number(field[key])>0)||field.pairWalls===true;
    if(!hasGeometry)return tags;
    tags.add('범위 공격');
    this.addShapeTags(tags,field.pairWalls?'rect':String(field.shape||'circle'));
    return tags;
  },
  derivedModuleTags(modules,{character=null,visited=new Set()}={}){
    const tags=new Set();
    const merge=items=>{
      for(const tag of this.derivedModuleTags(items,{character,visited}))tags.add(tag);
    };
    const linkModules=id=>{
      const linked=Object.values(character?.attacks||{}).find(attack=>attack.id===id);
      if(linked)merge(linked.modules);
    };
    const list=Array.isArray(modules)?modules:[];
    const projectile=list.find(module=>['delivery.projectile','delivery.range-projectile'].includes(module?.type||module));
    let scatterCount=1;
    for(const module of list){
      if(!module)continue;
      const type=typeof module==='string'?module:module.type;
      if(typeof module==='object'){
        if(visited.has(module))continue;
        visited.add(module);
      }
      if(type==='delivery.projectile'||type==='delivery.range-projectile'){
        tags.add('공격형태 투사체');
        if(type==='delivery.range-projectile'){
          // 기존 범위 투사체는 이동하는 원형 범위 판정이며 범위 증폭 대상이다.
          tags.add('범위 투사체');tags.add('히트스캔');tags.add('범위 공격');tags.add('공격형태 원');
        }
        if(module.homing)tags.add('유도');
        if(module.phase==='returning')tags.add('귀환');
      }
      if(type==='delivery.hitscan'||type==='delivery.area'){
        tags.add('히트스캔');tags.add('범위 공격');
        this.addShapeTags(tags,String(module.shape||'rect'));
        if(module.wallPolicy==='ignore')tags.add('벽 관통');
        if(String(module.contactType||'').toLowerCase()==='melee')tags.add('근접 무기');
        if(module.projectileClassification==='instant-laser'){
          tags.add('공격형태 투사체');tags.add('레이저 투사체');tags.add('즉발 레이저 투사체');
        }
        if(Number(module.repeatCount??module.repeat?.count)>1)tags.add('다중 공격');
      }
      if(type==='field.area'){
        for(const tag of this.fieldGeometryTags(module))tags.add(tag);
        if(module.removeOnly!==true){
          merge(module.onTrigger);
          if(module.wallPolicy==='ignore'&&tags.has('범위 공격'))tags.add('벽 관통');
        }
      }
      if(type==='effect.spawn'&&module.damage){
        const damage=module.damage;
        if(damage.module)merge([damage.module]);
        if(damage.hitMode==='body-contact'){
          // 현재 본체 원의 접촉/실제 이동 선분을 검사한다. 선행 사각 히트스캔이 아니다.
          tags.add('범위 공격');tags.add('공격형태 원');
        }
        if(damage.oncePerExecution===true)tags.add('대상당 1회');
        if(damage.projectileClear)tags.add('방어');
      }
      if(type==='movement.move'){
        // 자가 반동은 이동기나 적에게 주는 넉백으로 분류하지 않는다.
        if(module.motionMode!=='knockback'){
          tags.add('이동기');
          const collision=MovementAbilityService.normalizeCollision(module);
          if(collision.passWalls)tags.add('벽 관통');
          if(collision.passEnemies)tags.add('적 관통');
        }
      }
      if(['movement.stationary-projectile-swap','projectile.ride.start'].includes(type))tags.add('이동기');
      if(type==='projectile.impact'){
        if(module.field)merge([module.field]);
        if(module.sourceRelocate)merge([{...module.sourceRelocate,type:'movement.move',tags:[]}]);
        if(module.summon)tags.add('소환');
        // 별도 impact AttackSpec의 전달형태/CC는 그 공격이 직접 조회될 때만 계산한다.
      }
      if(type==='projectile.pierce'){
        if(module.targets)tags.add('적 관통');
        if(module.walls)tags.add('벽 관통');
      }
      if(type==='hit.sequence'){
        for(const step of module.steps||[])merge(step.modules);
      }
      if(type==='delivery.delayed-projectile-volley'){
        if(module.attackId)linkModules(module.attackId);
      }
      if(type==='state.progress'||type==='state.progress-rate'){
        if(!['subtract','reset'].includes(module.operation)&&Number(module.amount)!==0)tags.add('충전');
        this.addStatusTags(tags,module.onFull);
      }
      if(type==='resource.restore'){
        if(module.resource==='health')tags.add('체력 회복');
        if(module.resource==='stamina')tags.add('스테미나 회복');
        if(module.resource==='shield')tags.add('보호막');
      }
      if(type==='modifier.set')this.addBuffTags(tags,module.stat,module.value);
      if(type==='status.apply'&&module.target!=='self'&&module.target!=='source')this.addStatusTags(tags,module);
      if(type==='damage.target-max-health-ratio')tags.add('최대 체력 비례 피해');
      if(type==='damage.range-band-multiplier'||type==='damage.target-health-ratio-multiplier'||type==='damage.target-status-multiplier')tags.add('조건부 피해');
      if(type==='attack.guard')tags.add('방어');
      if(type==='hit.once-per-execution')tags.add('대상당 1회');
      if(['movement.knockback','movement.neutralize-knockback'].includes(type)&&module.target==='hit-target'){
        tags.add('넉백');
        if(type==='movement.neutralize-knockback'){
          tags.add('무력화 넉백');this.addStatusTags(tags,'neutralize');
        }
        this.addStatusTags(tags,module.wallImpactStatus);
      }
      if(type==='movement.pull'||type==='movement.projectile-tether'){
        tags.add('끌어오기');
        this.addStatusTags(tags,module.status);
      }
      if(type==='pattern.scatter'||type==='delivery.delayed-projectile-volley')scatterCount=Math.max(scatterCount,Number(module.count)||1);
      if(type==='buff.time-add'){
        tags.add('버프');
        if(Number(module.aura?.range)>0){tags.add('범위 공격');tags.add('공격형태 원');}
        for(const stage of module.stages||[])this.addBuffTags(tags,stage.stat,stage.value);
      }
      if(type==='sustain.toggle')for(const buff of module.buffs||[])this.addBuffTags(tags,buff.type,buff.value);
      if(type==='stealth.toggle'){this.addBuffTags(tags,'stealth',1);}
      if(type==='channel.attack')tags.add('채널링');
      if(['summon.spawn','summon.cluster-spawn','summon.toggle','summon.recall','summon.return-owner','summon.retarget'].includes(type))tags.add('소환');
      if(type==='field.expand-recent')tags.add('설치형');
      if(type==='formation.place-minimum'||type==='obstacle.wall-deploy')tags.add('설치형');
      if(type==='formation.manifest'){
        tags.add('범위 공격');tags.add('히트스캔');tags.add('공격형태 원');
        for(const status of ['slow','bind','freeze'])this.addStatusTags(tags,status);
      }
      // 모듈의 의미 태그만 병합한다. 계산 태그를 수동 값으로 덮어쓰지 않는다.
      for(const tag of this.explicitAttackTags(module))tags.add(tag);
    }
    if(scatterCount>1)tags.add('다중 공격');
    if(projectile&&(projectile.type||projectile)!=='delivery.range-projectile'){
      const presentation=list.find(module=>module?.type==='projectile.presentation');
      const collision=list.find(module=>module?.type==='projectile.collision');
      if(presentation?.kind==='weapon-projectile')tags.add('무기 투사체');
      else if(presentation?.style?.type==='laser-bolt')tags.add('레이저 투사체');
      else if(presentation?.style?.shape==='diamond'||collision?.shape==='diamond'||scatterCount>1&&list.some(module=>module?.type==='hit.once-per-execution'))tags.add('특수 투사체');
      else tags.add('일반 투사체');
    }
    return tags;
  },
  linkedAbilityModuleTags(spec,character=this.characterFor(spec)){
    const tags=new Set();
    const merge=modules=>{
      for(const tag of this.derivedModuleTags(modules,{character}))tags.add(tag);
    };
    for(const ability of Object.values(character?.abilities||{})){
      for(const trigger of Object.values(ability)){
        const modules=trigger?.modules;
        if(!Array.isArray(modules))continue;
        const direct=ability.attackId===spec.id||ability.holdAttackId===spec.id||
          (ability.inputAttackAlternates||[]).some(item=>item.attackId===spec.id);
        const hasDelivery=(spec.modules||[]).some(module=>
          /^delivery\./.test(module?.type)||module?.type==='effect.spawn'&&module.damage||module?.type==='formation.manifest'
        );
        const selected=direct||modules.some(module=>
          module.requireAttackId===spec.id||module.alternateWhen?.attackId===spec.id||
          (module.alternates||[]).some(item=>item.attackId===spec.id)
        );
        if(!selected)continue;
        for(const module of modules){
          if(module.requireAttackId&&module.requireAttackId!==spec.id)continue;
          if(module.type==='counter.execute'){
            const alternate=module.alternateWhen?.attackId===spec.id?module.alternateWhen:null;
            if(!direct&&!alternate)continue;
            const cc=alternate?.cc||module.cc;
            if(cc)merge(Array.isArray(cc)?cc:[cc]);
            if(module.charge)tags.add('차징');
          }else if(module.type==='charge.attack.start'||module.type==='charge.attack.release'){
            if(spec.charge||spec.multiClick)tags.add('차징');
          }else{
            // 입력 선딜·무적·버프·이동은 AttackSpec의 판정 태그가 아니다.
            // 실제 피해/CC는 해당 AttackSpec의 modules 또는 counter.execute.cc에만 둔다.
            continue;
          }
        }
      }
    }
    const metadata=this.characterMetadata(character);
    if(metadata.channels.has(spec.id))tags.add('채널링');
    if(metadata.combos.has(spec.id))tags.add('다중 공격');
    for(const field of metadata.fields.get(spec.id)||[])merge([field]);
    return tags;
  },
  derivedAttackTags(spec){
    const tags=new Set();
    if(!spec)return tags;
    tags.add('공격');
    const range=this.attackRange(spec);
    if(range>0)tags.add(this.rangeTag(range));
    if(spec.charge||spec.multiClick)tags.add('차징');
    const character=this.characterFor(spec);
    for(const tag of this.derivedModuleTags(spec.modules,{character}))tags.add(tag);
    for(const tag of this.linkedAbilityModuleTags(spec,character))tags.add(tag);
    return tags;
  },
  attackTags(spec){
    if(!spec||typeof spec!=='object')return new Set();
    const cached=attackTagCache.get(spec);
    if(cached)return cached;
    const tags=this.explicitAttackTags(spec);
    for(const tag of this.derivedAttackTags(spec))tags.add(tag);
    attackTagCache.set(spec,tags);
    return tags;
  },
  isCrowdControlAttack(spec){
    if(!spec)return false;
    const tags=this.attackTags(spec);
    return Object.entries(COMBAT_STATUS_DEFS).some(([status,definition])=>definition.kind==='cc'&&tags.has(status))||tags.has('넉백')||tags.has('끌어오기');
  },
  fieldTags(field){
    if(!field||typeof field!=='object')return new Set();
    const tags=this.derivedModuleTags([{...field,type:'field.area'}]);
    if((field.targetRelations||[]).some(relation=>relation==='ally'||relation==='self'))tags.add('아군 대상');
    return tags;
  },
  primaryAttackRange(character){
    let maxRange=null;

    for(const spec of Object.values(character?.attacks||{})){
      if(!spec?.tags?.includes('평타'))continue;

      const range=this.attackRange(spec);
      maxRange=maxRange===null
        ?range
        :Math.max(maxRange,range);
    }

    return maxRange;
  },
  characterTags(character){
    const tags=new Set(character?.tags||[]);
    const range=CharacterSortService.distanceTag(character);
    if(range)tags.add(range);
    return tags;
  },
  characterStyleLabel(character){
    return CharacterSortService.styleLabel(character);
  },
  hasAttack(spec,tag){
    return this.attackTags(spec).has(tag);
  },
  effectTags(effect){
    const tags=new Set(effect?.tags||[]);
    if(!effect)return tags;

    if(effect.type==='modifier.constant'){
      const value=Number(effect.value)||0;
      if(value>0)tags.add('증강 버프');
      if(value<0)tags.add('증강 디버프');
    }

    if(effect.type==='trigger'){
      for(const module of effect.modules||[]){
        if(module?.type==='status.apply'&&module.status){
          tags.add(module.status);
          const label=COMBAT_STATUS_DEFS[module.status]?.label;
          if(label)tags.add(label);
        }
        if(module?.type==='resource.restore'){
          if(module.resource==='health')tags.add('체력 회복');
          if(module.resource==='stamina')tags.add('스테미나 회복');
        }
        if(module?.type==='modifier.set'){
          const value=Number(module.value)||0;
          if(value>0)tags.add('증강 버프');
          if(value<0)tags.add('증강 디버프');
        }
        if(module?.type==='damage.multiply'&&Number(module.value)<1){
          tags.add('피해 감소');
        }
        if(module?.type==='defeat.prevent')tags.add('생존');
        if(module?.type==='attack.trigger'&&module.attack){
          for(const tag of this.attackTags(module.attack))tags.add(tag);
        }
      }
    }

    return tags;
  },
});