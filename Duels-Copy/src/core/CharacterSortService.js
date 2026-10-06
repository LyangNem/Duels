

const CharacterSortService=Object.freeze({
  storageKey:'duels3.characterSortMode',
  modes:Object.freeze([
    'release',
    'record-desc',
    'record-asc',
    'difficulty-desc',
    'difficulty-asc',
    'color-rainbow',
    'combat-style',
    'range-desc',
    'range-asc',
    'role'
  ]),
  distanceTags:Object.freeze(CHARACTER_RULES.ranges.map(item=>item.tag)),
  normalizeMode(mode){
    return this.modes.includes(mode)
      ?mode
      :'release';
  },
  loadMode(){
    try{
      return this.normalizeMode(
        String(
          localStorage.getItem(this.storageKey)||''
        )
      );
    }catch(_){
      return 'release';
    }
  },
  setMode(mode){
    const selected=this.normalizeMode(mode);
    try{
      localStorage.setItem(
        this.storageKey,
        selected
      );
    }catch(_){}
    return selected;
  },
  releaseOrder(){
    const map=new Map();
    CharacterCardDataService.all().forEach(
      (character,index)=>map.set(character.id,index)
    );
    return map;
  },
  releaseIndex(character,order){
    return order.get(character?.id)??Number.MAX_SAFE_INTEGER;
  },
  attackById(combat,attackId){
    if(!combat?.attacks||!attackId)return null;
    return Object.values(combat.attacks).find(
      attack=>String(attack?.id||'')===String(attackId)
    )||null;
  },
  initialSource(combat){
    const source={character:combat,actionState:new Map(),alive:true,
      maxHealth:combat.maxHealth||1,maxStamina:combat.maxStamina||1};
    // Passive initialization uses the same progress store as actual gameplay.
    for(const module of combat.passives||[]){
      if(module.type!=='state.progress-rate')continue;
      const mode=module.whenMode;
      if(mode&&ModeStateService.current(source,mode.stateKey,mode.initial)!==mode.value)continue;
      ProgressStateService.ensure(source,module);
    }
    return source;
  },
  initialConditionsMatch(conditions,source){
    return (conditions||[]).every(condition=>
      !String(condition.type||'').startsWith('state.')||
      TriggerConditionService.matches(condition,{source})
    );
  },
  lmbAttackEntries(combat,source=this.initialSource(combat)){
    const ability=combat?.abilities?.lmb;
    if(!ability)return [];
    const entries=[];
    const push=id=>{if(id&&!entries.includes(id))entries.push(id);};
    const candidateConditions=candidate=>Array.isArray(candidate.conditions)
      ?candidate.conditions:candidate.stateKey
        ?[{type:candidate.phase?'state.phase':'state.exists',stateKey:candidate.stateKey,phase:candidate.phase}]:[];
    let inputIds=[ability.attackId];
    for(const candidate of ability.inputAttackAlternates||[]){
      const conditions=candidateConditions(candidate);
      if(candidate.rangeAvailableInitially===true){inputIds.push(candidate.attackId);continue;}
      if(!this.initialConditionsMatch(conditions,source))continue;
      if(conditions.every(c=>String(c.type).startsWith('state.'))){inputIds=[candidate.attackId];break;}
      inputIds.push(candidate.attackId);
    }
    const visit=modules=>{
      for(const module of modules||[]){
        if(!this.initialConditionsMatch(module.conditions,source))continue;
        if(module.requireAttackId&&!entries.includes(module.requireAttackId))continue;
        if(module.type==='action.attack'){
          let defaults=module.attackId?[module.attackId]:inputIds;
          for(const candidate of [...(module.alternates||[]),...(module.alternateWhen?[module.alternateWhen]:[])]){
            const conditions=candidateConditions(candidate);
            if(candidate.rangeAvailableInitially===true){push(candidate.attackId);continue;}
            if(!this.initialConditionsMatch(conditions,source))continue;
            // Position/aim choices remain possible in the initial mode. A
            // matching state-only alternative replaces the fallback attack.
            if(conditions.length&&conditions.every(c=>String(c.type).startsWith('state.'))){defaults=[candidate.attackId];break;}
            push(candidate.attackId);
          }
          for(const id of defaults)push(id);
        }else if(module.type==='action.trigger-attack')push(module.attackId||ability.attackId);
        if(Array.isArray(module.modules))visit(module.modules);
      }
    };
    visit(ability.trigger?.modules);
    if(!entries.length)for(const id of inputIds)push(id);
    return entries.map(attackId=>({attackId}));
  },
  primaryAttacks(character,source=null){
    const combat=character?.combat||character;
    if(!combat?.attacks)return [];
    source=source||this.initialSource(combat);
    return this.lmbAttackEntries(combat,source)
      .map(entry=>this.attackById(combat,entry.attackId))
      .filter(attack=>attack?.tags?.includes?.('평타')&&
        !attack.tags.includes('반격')&&!attack.tags.includes('스킬')&&!attack.tags.includes('소환수'));
  },
  rangeValue(value){
    const number=Number(value);
    if(number===Infinity)return Infinity;
    return Number.isFinite(number)
      ?Math.max(0,number)
      :0;
  },
  enemyRangeModule(module){
    const relations=module?.targetRelations;
    return !Array.isArray(relations)||!relations.length||relations.includes('enemy');
  },
  geometryRange(module,attack){
    const range=this.rangeValue(module.range??attack.range);
    let center=this.rangeValue(module.centerDistance);
    if(module.centerMode==='live-aim-point')center=this.rangeValue(module.centerMaxRange??attack.range);
    if(Number(module.repeatCount)>1&&module.repeatCenterDistanceStart!==undefined){
      center=Math.max(center,this.rangeValue(module.repeatCenterDistanceStart)+
        (Number(module.repeatCount)-1)*this.rangeValue(module.repeatCenterDistanceStep));
    }
    return center+range*(module.shape==='rect'&&module.rectCenterMode==='center'?.5:1);
  },
  rangeVariants(attack,source=null){
    if(source&&attack.progressScale?.rangeBasis==='initial'){
      attack={...ProgressScaledAttackService.resolve(source,attack),progressScale:null};
    }
    const variants=[attack];
    for(const scale of [attack.charge,attack.progressScale]){
      if(!scale)continue;
      for(const endpoint of ['from','to']){
        const range=scale.range?.[endpoint]??attack.range;
        const modules=(attack.modules||[]).map(module=>{
          const copy={...module};
          if(scale.range&&module.range===attack.range)copy.range=range;
          for(const value of scale.moduleValues||[]){
            if(value.type===module.type&&value[endpoint]!==undefined)copy[value.property]=value[endpoint];
          }
          return copy;
        });
        variants.push({...attack,range,modules,damageRatio:scale.damageRatio?.[endpoint]??attack.damageRatio});
      }
      if(scale.fullSpec)variants.push({...attack,...scale.fullSpec,charge:null,progressScale:null});
    }
    return variants;
  },
  attackMaxRange(attack,combat=null,visited=new Set(),source=null){
    if(!attack||visited.has(attack))return 0;
    const nextVisited=new Set(visited);nextVisited.add(attack);
    let maximum=0;
    const linkedRange=id=>this.attackMaxRange(this.attackById(combat,id),combat,nextVisited,source);
    for(const variant of this.rangeVariants(attack,source)){
      const modules=variant.modules||[];
      const projectile=modules.find(m=>['delivery.projectile','delivery.range-projectile'].includes(m.type));
      let travel=this.rangeValue(variant.range);
      if(projectile?.targetPoint===true&&projectile.targetPointClampToAttackRange===false)travel=Infinity;
      const damage=Number(variant.damageRatio)>0&&variant.effectsOnly!==true;
      for(const module of modules){
        if(!this.enemyRangeModule(module))continue;
        const type=String(module.type||'');
        if(type==='delivery.area'&&damage)maximum=Math.max(maximum,this.geometryRange(module,variant));
        if(type==='delivery.hitscan'&&damage)maximum=Math.max(maximum,this.rangeValue(module.range??variant.range));
        if(['delivery.projectile','delivery.range-projectile'].includes(type)&&damage&&module.damageOnTravel!==false){
          maximum=Math.max(maximum,module.orbit
            ?this.rangeValue(module.orbit.maxRadius)+this.rangeValue(module.radius):travel);
        }
        if(type==='formation.manifest'&&damage)maximum=Math.max(maximum,travel);
        if(type==='effect.spawn'&&module.damage){
          const effectDamage=module.damage;
          if(effectDamage.module)maximum=Math.max(maximum,this.geometryRange(effectDamage.module,variant));
          else if(effectDamage.requireMovementExecution===true||effectDamage.hitMode==='body-contact'){
            const movement=modules.find(m=>m.type==='movement.move');
            const distance=movement?this.rangeValue(movement.distance??(Number(movement.speed)||0)*(Number(movement.duration)||0)/1000):0;
            maximum=Math.max(maximum,distance+this.rangeValue(effectDamage.contactRadius));
          }else maximum=Math.max(maximum,this.rangeValue(module.range??variant.range));
        }
        if(type==='projectile.impact'&&projectile){
          const ids=[...(module.attackIds||[])];
          for(const values of Object.values(module.reasonAttackIds||{}))ids.push(...values);
          for(const id of ids){const extent=linkedRange(id);if(extent>0)maximum=Math.max(maximum,travel+extent);}
          const field=module.field;
          if(field?.damageOnTrigger!==false&&field?.attackId&&Number(this.attackById(combat,field.attackId)?.damageRatio)>0&&this.enemyRangeModule(field)){
            maximum=Math.max(maximum,field.anchorMode==='projectile-path'?travel:travel+this.geometryRange(field,variant));
          }
        }
        if(type==='projectile.wall-relay'&&projectile){const extent=linkedRange(module.attackId);if(extent>0)maximum=Math.max(maximum,travel+extent);}
        if(type==='state.window'){
          for(const id of Object.values(module.resolveAttackIds||{}))maximum=Math.max(maximum,linkedRange(id));
        }
        if(type==='field.area'&&module.damageOnTrigger!==false&&module.attackId&&Number(this.attackById(combat,module.attackId)?.damageRatio)>0){
          const origin=module.anchorMode==='attack-end'?travel:0;
          maximum=Math.max(maximum,origin+this.geometryRange(module,variant));
        }
        if(type==='movement.move'&&module.damage){
          maximum=Math.max(maximum,this.rangeValue(module.distance)+this.rangeValue(module.damage.contactRadius));
        }
      }
    }
    return maximum;
  },
  basicRange(character){
    const combat=character?.combat||character;
    const source=this.initialSource(combat);
    let maximum=0;
    for(const attack of this.primaryAttacks(character,source)){
      maximum=Math.max(
        maximum,
        this.attackMaxRange(attack,combat,new Set(),source)
      );
    }
    return maximum;
  },
  distanceTag(character){
    const range=this.basicRange(character);
    return CHARACTER_RULES.ranges.find(item=>range<=item.maxInclusive)?.tag||'';
  },
  styleLabel(character){
    return [this.combatStyle(character),this.distanceTag(character),this.role(character)].filter(Boolean).join(' ');
  },
  role(character){
    const combat=character?.combat||character;
    return CHARACTER_RULES.roles[combat?.classification?.role]||'';
  },
  combatStyle(character){
    const combat=character?.combat||character;
    return CHARACTER_RULES.styles[combat?.classification?.style]||'';
  },
  colorRgb(character){
    const combat=character?.combat||character;
    const raw=String(combat?.color||'').trim();

    if(/^#[0-9a-f]{3}$/i.test(raw)){
      return {
        r:parseInt(raw[1]+raw[1],16),
        g:parseInt(raw[2]+raw[2],16),
        b:parseInt(raw[3]+raw[3],16)
      };
    }

    if(/^#[0-9a-f]{6}$/i.test(raw)){
      return {
        r:parseInt(raw.slice(1,3),16),
        g:parseInt(raw.slice(3,5),16),
        b:parseInt(raw.slice(5,7),16)
      };
    }

    const rgb=raw.match(
      /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i
    );
    if(rgb){
      return {
        r:Math.max(0,Math.min(255,Number(rgb[1])||0)),
        g:Math.max(0,Math.min(255,Number(rgb[2])||0)),
        b:Math.max(0,Math.min(255,Number(rgb[3])||0))
      };
    }

    return null;
  },
  colorOklch(character){
    const rgb=this.colorRgb(character);
    if(!rgb){
      return {l:0,c:0,h:0};
    }

    const srgbToLinear=value=>{
      const normalized=
        Math.max(
          0,
          Math.min(
            1,
            Number(value)/255
          )
        );
      return normalized<=.04045
        ?normalized/12.92
        :Math.pow(
          (normalized+.055)/1.055,
          2.4
        );
    };

    const r=srgbToLinear(rgb.r);
    const g=srgbToLinear(rgb.g);
    const b=srgbToLinear(rgb.b);

    const l=
      .4122214708*r+
      .5363325363*g+
      .0514459929*b;
    const m=
      .2119034982*r+
      .6806995451*g+
      .1073969566*b;
    const s=
      .0883024619*r+
      .2817188376*g+
      .6299787005*b;

    const lRoot=Math.cbrt(l);
    const mRoot=Math.cbrt(m);
    const sRoot=Math.cbrt(s);

    const lightness=
      .2104542553*lRoot+
      .793617785*mRoot-
      .0040720468*sRoot;
    const a=
      1.9779984951*lRoot-
      2.428592205*mRoot+
      .4505937099*sRoot;
    const bAxis=
      .0259040371*lRoot+
      .7827717662*mRoot-
      .808675766*sRoot;

    const chroma=Math.hypot(a,bAxis);
    let hue=
      Math.atan2(bAxis,a)*
      180/Math.PI;
    if(hue<0)hue+=360;

    return {
      l:lightness,
      c:chroma,
      h:hue
    };
  },
  groupOrder(characters,resolver){
    const order=new Map();
    let index=0;
    for(const character of characters){
      const key=resolver(character)||'';
      if(!order.has(key)){
        order.set(key,index++);
      }
    }
    return order;
  },
  sorted(mode,account=AccountState.current){
    const source=[
      ...CharacterCardDataService.all()
    ];
    const selected=
      this.modes.includes(mode)
        ?mode
        :'release';
    const release=this.releaseOrder();
    const releaseTie=(a,b)=>
      this.releaseIndex(a,release)-
      this.releaseIndex(b,release);

    if(selected==='release')return source;

    if(selected==='record-desc'){
      return source.sort((a,b)=>
        CharacterRecordService.points(b.id,account)-
        CharacterRecordService.points(a.id,account)||
        releaseTie(a,b)
      );
    }

    if(selected==='record-asc'){
      return source.sort((a,b)=>
        CharacterRecordService.points(a.id,account)-
        CharacterRecordService.points(b.id,account)||
        releaseTie(a,b)
      );
    }

    if(selected==='difficulty-desc'){
      return source.sort((a,b)=>
        CharacterDifficultyService.level(b)-
        CharacterDifficultyService.level(a)||
        releaseTie(a,b)
      );
    }

    if(selected==='difficulty-asc'){
      return source.sort((a,b)=>
        CharacterDifficultyService.level(a)-
        CharacterDifficultyService.level(b)||
        releaseTie(a,b)
      );
    }

    if(selected==='color-rainbow'){
      return source.sort((a,b)=>{
        const aColor=this.colorOklch(a);
        const bColor=this.colorOklch(b);

        /*
          OKLCH hue는 원형이므로 분홍 계열을 시작점으로 한 번만 회전한다.
          350° 부근을 절단점으로 잡으면 분홍→빨강→...→보라→자주 순으로
          이어지고 끝에서 다시 분홍 그룹을 만들지 않는다.
        */
        const hueStart=350;
        const aHue=
          (aColor.h-hueStart+360)%360;
        const bHue=
          (bColor.h-hueStart+360)%360;
        const hueDifference=aHue-bHue;
        if(Math.abs(hueDifference)>.0001){
          return hueDifference;
        }

        const chromaDifference=
          bColor.c-aColor.c;
        if(Math.abs(chromaDifference)>.0001){
          return chromaDifference;
        }

        const lightnessDifference=
          bColor.l-aColor.l;
        if(Math.abs(lightnessDifference)>.0001){
          return lightnessDifference;
        }

        return releaseTie(a,b);
      });
    }

    if(selected==='range-desc'){
      return source.sort((a,b)=>{
        const aRange=this.basicRange(a);
        const bRange=this.basicRange(b);
        return aRange===bRange
          ?releaseTie(a,b)
          :bRange-aRange;
      });
    }

    if(selected==='range-asc'){
      return source.sort((a,b)=>{
        const aRange=this.basicRange(a);
        const bRange=this.basicRange(b);
        return aRange===bRange
          ?releaseTie(a,b)
          :aRange-bRange;
      });
    }

    if(selected==='combat-style'){
      const groups=this.groupOrder(
        source,
        character=>this.combatStyle(character)
      );
      return source.sort((a,b)=>{
        const aStyle=this.combatStyle(a);
        const bStyle=this.combatStyle(b);
        return (
          (groups.get(aStyle)??999)-
          (groups.get(bStyle)??999)||
          releaseTie(a,b)
        );
      });
    }

    if(selected==='role'){
      const roleOrder=new Map(
        (GAME_DATA.characterRoleTags||[])
          .map((role,index)=>[role,index])
      );
      return source.sort((a,b)=>{
        const aRole=this.role(a);
        const bRole=this.role(b);
        return (
          (roleOrder.get(aRole)??999)-
          (roleOrder.get(bRole)??999)||
          releaseTie(a,b)
        );
      });
    }

    return source;
  }
});