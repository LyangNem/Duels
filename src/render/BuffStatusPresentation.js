

/* 버프 텍스트 표시.
   평상시에는 전투에 중요한 4종만 축약 표시하고,
   TAB을 누르는 동안 현재 활성 버프 전체를 정확한 수치로 펼친다. */
const BuffStatusPresentation=Object.freeze({
  styles:Object.freeze({
    damage:Object.freeze({label:'DMG',rgb:'190,90,255'}),
    defense:Object.freeze({label:'DEF',rgb:'80,170,255'}),
    speed:Object.freeze({label:'SPD',rgb:'245,245,255'}),
    attackRate:Object.freeze({label:'ATK SPD',rgb:'255,70,70'}),
    projectileSpeed:Object.freeze({label:'BULLET SPD',rgb:'255,70,70'}),
    staminaRegen:Object.freeze({label:'STAM REGEN',rgb:'255,155,50'}),
    staminaCost:Object.freeze({label:'STAM COST',rgb:'255,175,70'}),
    dodgeDistance:Object.freeze({label:'DODGE DIS',rgb:'190,230,255'}),
    dodgeSpeed:Object.freeze({label:'DODGE SPD',rgb:'190,230,255'}),
    regenDelay:Object.freeze({label:'REGEN WAIT',rgb:'255,120,190'}),
    healing:Object.freeze({label:'HEAL',rgb:'120,240,170'}),
    regeneration:Object.freeze({label:'REGEN',rgb:'170,255,90'}),
    regenPercent:Object.freeze({label:'REGEN',rgb:'170,255,90'}),
    regenFlat:Object.freeze({label:'REGEN',rgb:'170,255,90'}),
    maxHealth:Object.freeze({label:'MAX HP',rgb:'120,220,255'}),
    maxStamina:Object.freeze({label:'MAX STAM',rgb:'255,175,70'}),
    projectileRadius:Object.freeze({label:'BULLET SIZE',rgb:'230,230,255'}),
    wallPass:Object.freeze({label:'WALL PASS',rgb:'110,255,220'}),
    shield:Object.freeze({label:'SHIELD',rgb:'207,239,255'})
  }),

  compactTypes:Object.freeze([
    'damage',
    'defense',
    'speed',
    'wallPass'
  ]),

  regenTypes:Object.freeze([
    'regeneration',
    'regenPercent',
    'regenFlat'
  ]),

  cache:new WeakMap(),

  work(entity){
    let work=this.cache.get(entity);
    if(work)return work;

    work={compact:[],expanded:[],pool:[]};
    this.cache.set(entity,work);
    return work;
  },

  item(work,index,type,text,rgb){
    let item=work.pool[index];
    if(!item){
      item={type:'',text:'',rgb:''};
      work.pool[index]=item;
    }
    item.type=type;
    item.text=text;
    item.rgb=rgb;
    return item;
  },

  value(entity,type,now){
    const buffValue=BuffService.resolve(
      entity,
      type,
      now
    );
    const adjustmentValue=
      AugmentService.presentationAdjustmentValue(
        entity,
        type,
        now
      );

    return ModifierLimitService.clamp(
      type,
      buffValue+adjustmentValue
    );
  },

  sign(value){
    return Number(value)>=0?'+':'-';
  },

  stealthDetected(entity,now){
    return (
      this.value(entity,'stealth',now)!==0&&
      StealthPresentationService.exposedByAnyEnemy(entity,now)
    );
  },

  stealthRgb(entity,now){
    return (
      entity===Training.player&&
      this.stealthDetected(entity,now)
    )
      ?'255,77,77'
      :'245,245,255';
  },

  compact(entity,now){
    const work=this.work(entity);
    const result=work.compact;
    result.length=0;
    let index=0;

    for(const type of this.compactTypes){
      const value=this.value(entity,type,now);
      if(value===0)continue;
      const style=this.styles[type];
      const text=COMBAT_BUFF_DEFS[type]?.toggleOnly===true
        ?style.label
        :`${style.label}${this.sign(value)}`;
      result.push(this.item(work,index++,type,text,style.rgb));
    }

    let regenValue=0;
    let regenActive=false;
    for(const type of this.regenTypes){
      const value=this.value(entity,type,now);
      if(value===0)continue;
      regenActive=true;
      regenValue+=value;
    }

    if(regenActive){
      const style=this.styles.regeneration;
      result.push(this.item(work,index++,'regen',`${style.label}${this.sign(regenValue)}`,style.rgb));
    }

    if(
      entity===Training.player&&
      this.stealthDetected(entity,now)
    ){
      result.push(
        this.item(
          work,
          index++,
          'stealth',
          COMBAT_BUFF_DEFS.stealth.label,
          this.stealthRgb(entity,now)
        )
      );
    }

    if(ShieldService.current(entity)>0){
      const style=this.styles.shield;
      result.push(
        this.item(
          work,
          index++,
          'shield',
          style.label,
          style.rgb
        )
      );
    }

    return result;
  },

  format(type,value,entity,now){
    const style=this.styles[type]||{
      label:
        COMBAT_BUFF_DEFS[type]?.label||
        type.toUpperCase(),
      rgb:'220,225,235'
    };

    if(type==='regenFlat'){
      return `${style.label} ${value>=0?'+':''}${Math.round(value)}/s`;
    }

    if(type==='regenPercent'){
      return `${style.label} ${value>=0?'+':''}${Math.round(value*100)}%/s`;
    }

    if(COMBAT_BUFF_DEFS[type]?.toggleOnly===true){
      return style.label;
    }

    if(type==='regeneration'){
      const visual=BuffService.visualEntry(
        entity,
        type,
        now
      );
      const interval=Math.max(
        1,
        Number(
          visual?.item?.data?.tickInterval
        )||250
      );
      const perSecond=
        value*1000/interval;

      return `${style.label} ${perSecond>=0?'+':''}${Math.round(perSecond)}/s`;
    }

    return `${style.label} ${value>=0?'+':''}${Math.round(value*100)}%`;
  },

  expanded(entity,now){
    const work=this.work(entity);
    const result=work.expanded;
    result.length=0;
    let index=0;

    for(const type of Object.keys(COMBAT_BUFF_DEFS)){
      if(
        COMBAT_BUFF_DEFS[type]?.presentationHidden===true
      )continue;
      const value=this.value(entity,type,now);
      if(value===0)continue;
      result.push(
        this.item(
          work,
          index++,
          type,
          this.format(type,value,entity,now),
          type==='stealth'
            ?this.stealthRgb(entity,now)
            :(this.styles[type]?.rgb||'220,225,235')
        )
      );
    }

    const shield=ShieldService.current(entity);
    const maxShield=Math.max(
      0,
      Number(entity?.maxHealth)||0
    );
    if(shield>0&&maxShield>0){
      const style=this.styles.shield;
      result.push(
        this.item(
          work,
          index++,
          'shield',
          `${style.label} ${Math.round(shield/maxShield*100)}%`,
          style.rgb
        )
      );
    }

    return result;
  },

  draw(ctx,entity,now,expanded=false){
    const items=
      expanded
        ?this.expanded(entity,now)
        :this.compact(entity,now);

    if(!items.length)return;

    const lineHeight=
      expanded
        ?15
        :16;
    const x=
      entity.x-
      entity.radius-
      12;
    const totalHeight=
      (items.length-1)*
      lineHeight;
    const startY=
      entity.y-
      totalHeight/2;

    ctx.save();
    ctx.font=
      expanded
        ?'700 11px Pretendard, "Noto Sans KR", Arial, sans-serif'
        :'800 13px Pretendard, "Noto Sans KR", Arial, sans-serif';
    ctx.textAlign='right';
    ctx.textBaseline='middle';
    ctx.lineJoin='round';
    ctx.strokeStyle='rgba(0,0,0,.88)';
    ctx.lineWidth=
      expanded
        ?3.5
        :4;

    for(let index=0;index<items.length;index++){
      const item=items[index];
      const y=
        startY+
        index*
        lineHeight;

      ctx.strokeText(
        item.text,
        x,
        y
      );
      ctx.fillStyle=
        `rgba(${item.rgb},.94)`;
      ctx.fillText(
        item.text,
        x,
        y
      );
    }

    ctx.restore();
  }
});