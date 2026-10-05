

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
  stateWriteKeys(node,out=new Set()){
    if(!node)return out;
    if(Array.isArray(node)){
      for(const item of node)this.stateWriteKeys(item,out);
      return out;
    }
    if(typeof node!=='object')return out;

    const type=String(node.type||'');
    const operation=String(node.operation||'');
    const stateKey=String(node.stateKey||'');
    const writesProgress=
      type==='state.progress'&&
      operation!=='reset'&&
      operation!=='subtract';
    const writesWindow=
      type==='state.window'&&
      operation!=='clear';
    const writesMode=
      type==='mode.set'||
      type==='mode.toggle';

    if(stateKey&&(writesProgress||writesWindow||writesMode)){
      out.add(stateKey);
    }

    for(const value of Object.values(node)){
      if(value&&typeof value==='object'){
        this.stateWriteKeys(value,out);
      }
    }
    return out;
  },
  referencedAttackIds(node,out=new Set()){
    if(!node)return out;
    if(Array.isArray(node)){
      for(const item of node)this.referencedAttackIds(item,out);
      return out;
    }
    if(typeof node!=='object')return out;

    if(typeof node.attackId==='string')out.add(node.attackId);
    for(const attackId of node.attackIds||[]){
      if(typeof attackId==='string')out.add(attackId);
    }
    for(const value of Object.values(node)){
      if(value&&typeof value==='object'){
        this.referencedAttackIds(value,out);
      }
    }
    return out;
  },
  counterOnlyStateKeys(combat){
    const counterIds=new Set();
    const counterAbility=combat?.abilities?.counter;
    if(counterAbility){
      this.referencedAttackIds(counterAbility,counterIds);
      if(counterAbility.attackId)counterIds.add(counterAbility.attackId);
    }
    for(const attack of Object.values(combat?.attacks||{})){
      if(attack?.tags?.includes?.('반격'))counterIds.add(attack.id);
    }

    const counterWrites=this.stateWriteKeys(counterAbility,new Set());
    const nonCounterWrites=new Set();

    for(const attack of Object.values(combat?.attacks||{})){
      const target=counterIds.has(attack?.id)
        ?counterWrites
        :nonCounterWrites;
      this.stateWriteKeys(attack?.modules,target);
    }
    for(const [slot,ability] of Object.entries(combat?.abilities||{})){
      if(slot==='counter')continue;
      this.stateWriteKeys(ability?.trigger?.modules,nonCounterWrites);
    }

    return new Set(
      [...counterWrites].filter(key=>!nonCounterWrites.has(key))
    );
  },
  conditionRequiresCounterOnlyState(node,counterOnly){
    if(!node||!counterOnly?.size)return false;
    if(Array.isArray(node)){
      return node.some(item=>
        this.conditionRequiresCounterOnlyState(item,counterOnly)
      );
    }
    if(typeof node!=='object')return false;

    const type=String(node.type||'');
    const positiveSingle=new Set([
      'state.exists',
      'state.progress-gte',
      'state.progress-ratio-gte',
      'state.mode-is'
    ]);
    if(
      positiveSingle.has(type)&&
      counterOnly.has(String(node.stateKey||''))
    )return true;

    if(type==='state.progress-sum-gte'){
      const keys=(node.stateKeys||[]).map(String).filter(Boolean);
      if(keys.length&&keys.every(key=>counterOnly.has(key)))return true;
    }

    for(const value of Object.values(node)){
      if(
        value&&typeof value==='object'&&
        this.conditionRequiresCounterOnlyState(value,counterOnly)
      )return true;
    }
    return false;
  },
  lmbAttackEntries(combat){
    const ability=combat?.abilities?.lmb;
    if(!ability)return [];

    const entries=[];
    const push=(attackId,conditions=null)=>{
      if(!attackId)return;
      entries.push({attackId:String(attackId),conditions});
    };
    const candidateConditions=candidate=>{
      if(Array.isArray(candidate?.conditions))return candidate.conditions;
      if(candidate?.stateKey){
        return [candidate.phase
          ?{type:'state.phase',stateKey:candidate.stateKey,phase:candidate.phase}
          :{type:'state.exists',stateKey:candidate.stateKey}];
      }
      return null;
    };
    push(ability.attackId,null);

    const visit=modules=>{
      for(const module of modules||[]){
        if(module?.type==='action.attack'){
          push(module.attackId||ability.attackId,module.conditions||null);
          for(const alternate of module.alternates||[]){
            push(alternate?.attackId,candidateConditions(alternate));
          }
          if(module.alternateWhen){
            push(
              module.alternateWhen.attackId,
              candidateConditions(module.alternateWhen)
            );
          }
        }
        if(Array.isArray(module?.modules))visit(module.modules);
      }
    };
    visit(ability?.trigger?.modules);

    const seen=new Set();
    return entries.filter(entry=>{
      const key=`${entry.attackId}|${JSON.stringify(entry.conditions||null)}`;
      if(seen.has(key))return false;
      seen.add(key);
      return true;
    });
  },
  primaryAttacks(character){
    const combat=character?.combat||character;
    const attacks=combat?.attacks;
    if(!attacks)return [];

    const counterOnly=this.counterOnlyStateKeys(combat);
    const direct=this.lmbAttackEntries(combat)
      .filter(entry=>
        !this.conditionRequiresCounterOnlyState(
          entry.conditions,
          counterOnly
        )
      )
      .map(entry=>this.attackById(combat,entry.attackId))
      .filter(attack=>
        attack?.tags?.includes?.('평타')&&
        !attack?.tags?.includes?.('반격')&&
        !attack?.tags?.includes?.('스킬')&&
        !attack?.tags?.includes?.('소환수')
      );

    if(direct.length)return [...new Set(direct)];

    return Object.values(attacks).filter(attack=>
      attack?.tags?.includes?.('평타')&&
      !attack?.tags?.includes?.('반격')&&
      !attack?.tags?.includes?.('스킬')&&
      !attack?.tags?.includes?.('소환수')
    );
  },
  rangeValue(value){
    const number=Number(value);
    if(number===Infinity)return Infinity;
    return Number.isFinite(number)
      ?Math.max(0,number)
      :0;
  },
  moduleMaxRange(modules){
    let maximum=0;
    for(const module of modules||[]){
      if(
        module?.type==='delivery.projectile'&&
        module?.targetPoint===true&&
        module?.targetPointClampToAttackRange===false
      )return Infinity;

      const type=String(module?.type||'');
      if(
        type==='delivery.projectile'||
        type==='delivery.range-projectile'||
        type==='delivery.hitscan'||
        type==='delivery.area'
      ){
        maximum=Math.max(
          maximum,
          this.rangeValue(module?.range)
        );
      }
    }
    return maximum;
  },
  impactExplosionRange(combat,modules){
    let maximum=0;
    for(const module of modules||[]){
      if(module?.type!=='projectile.impact')continue;

      const attackIds=[
        ...(module.attackIds||[])
      ];
      for(const ids of Object.values(module.reasonAttackIds||{})){
        for(const attackId of ids||[])attackIds.push(attackId);
      }

      for(const attackId of attackIds){
        const linked=this.attackById(combat,attackId);
        if(!linked)continue;

        let radius=0;
        for(const linkedModule of linked.modules||[]){
          if(linkedModule?.type!=='delivery.area')continue;
          const relations=linkedModule?.targetRelations;
          if(
            Array.isArray(relations)&&
            relations.length&&
            !relations.includes('enemy')
          )continue;
          radius=Math.max(
            radius,
            this.rangeValue(linkedModule?.range)
          );
        }
        maximum=Math.max(maximum,radius);
      }
    }
    return maximum;
  },
  scaledMaxRange(scale){
    if(!scale)return 0;

    let maximum=Math.max(
      this.rangeValue(scale?.range?.from),
      this.rangeValue(scale?.range?.to)
    );

    for(const value of scale.moduleValues||[]){
      if(String(value?.property||'')!=='range')continue;
      maximum=Math.max(
        maximum,
        this.rangeValue(value?.from),
        this.rangeValue(value?.to)
      );
    }

    return maximum;
  },
  attackMaxRange(attack,combat=null){
    if(!attack)return 0;

    const travelRange=Math.max(
      this.rangeValue(attack.range),
      this.rangeValue(attack?.charge?.range?.from),
      this.rangeValue(attack?.charge?.range?.to),
      this.scaledMaxRange(attack.progressScale),
      this.moduleMaxRange(attack.modules)
    );
    const impactRange=this.impactExplosionRange(
      combat,
      attack.modules
    );
    let maximum=
      travelRange===Infinity
        ?Infinity
        :travelRange+impactRange;

    const fullSpec=attack?.charge?.fullSpec;
    if(fullSpec){
      maximum=Math.max(
        maximum,
        this.attackMaxRange(fullSpec,combat)
      );
    }

    return maximum;
  },
  basicRange(character){
    const combat=character?.combat||character;
    let maximum=0;
    for(const attack of this.primaryAttacks(character)){
      maximum=Math.max(
        maximum,
        this.attackMaxRange(attack,combat)
      );
    }
    return maximum;
  },
  distanceTag(character){
    const combat=character?.combat||character;
    if(combat?.classification?.rangeLabel)return String(combat.classification.rangeLabel);
    const rangeId=Number(combat?.classification?.range)||0;
    if(rangeId)return CHARACTER_RULES.ranges.find(item=>item.id===rangeId)?.tag||'';
    return GAME_DATA.ranges.find(item=>this.basicRange(character)<=item.maxInclusive)?.tag||'';
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