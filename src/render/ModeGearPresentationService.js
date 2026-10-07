/* 모드별 기어 자체 회전·사용 밝기. 기존 effect.spawn/ModeState 시간축을 공유한다. */
const ModeGearPresentationService=Object.freeze({
  weaponImages:new WeakMap(),
  presentWeaponTransition(entity,configs,alpha,now){
    const visible=configs.filter(config=>
      ['swordSilhouette','gunSilhouette'].includes(config?.renderType)&&
      TriggerModuleService.matches({type:'trigger',event:'presentation.draw',conditions:config.conditions||[]},'presentation.draw',{source:entity,now})
    );
    const signature=visible.map(config=>`${config.renderType}:${config.style||''}`).join('|');
    const previous=this.weaponImages.get(entity);
    this.weaponImages.set(entity,{character:entity.character,signature});
    if(!previous||previous.character!==entity.character||previous.signature===signature||alpha<=0)return false;
    if(typeof StealthPresentationService!=='undefined'&&StealthPresentationService.active(entity,now))return false;
    const color=visible[0]?.color||entity.character?.color||'#ffffff';
    return DamageResourceLayerService.spawnTransitionEffect(entity,{
      type:'areaCircle',radiusMultiplier:2.8,minRadius:40,color,
      strokeColor:ColorService.rgbString(color,'255,255,255'),
      fillAlpha:.04,strokeAlpha:.72,lineWidth:2,
      pulse:true,pulseStrokeMin:.5,pulseStrokeMax:.8,pulseSpeed:.02,
      fadeOut:true,duration:240
    },now);
  },
  rotation(entity,gear,duration,now){
    const state=ModeStateService.state(entity,gear.stateKey);
    const current=Number(state?.turns)||0,previous=Number(state?.previousTurns)||0;
    const progress=state?Math.max(0,Math.min(1,(now-Number(state.changedAt??now))/duration)):1;
    return (previous+(current-previous)*EffectSpawnService.ease(progress,'ease-out'))*(Number(gear.turnRadians)||Math.PI*2/3);
  },
  gearPath(ctx,radius,teeth,angle){
    ctx.beginPath();
    for(let tooth=0;tooth<teeth;tooth++){
      for(let part=0;part<4;part++){
        const theta=angle+(tooth+(part===0?0:part===1?.2:part===2?.55:.75))/teeth*Math.PI*2;
        const r=radius*((part===0||part===3) ? .87 : 1);
        const x=Math.cos(theta)*r,y=Math.sin(theta)*r;
        if(tooth===0&&part===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
      }
    }
    ctx.closePath();
  },
  drawSword(ctx,entity,config,alpha,now=performance.now()){
    const size=Math.max(12,Number(entity.radius)||20)*(Number(config.scale)||1);
    const rgb=ColorService.rgbString(entity.character?.color,'255,160,65');
    const spin=config.rotationStateKey?this.rotation(entity,{stateKey:config.rotationStateKey,turnRadians:Math.PI*2},Number(config.rotationMs)||300,now):0;
    ctx.save();ctx.rotate((Number(config.angle)||0)+spin);ctx.globalAlpha=alpha*.8;
    const dark=config.style==='dark';
    const blade=dark
      ?[[0,-3.1],[.5,-2.35],[.35,-1.45],[.53,-1.1],[.32,-.92],[.34,.6],[-.34,.6],[-.32,-.92],[-.53,-1.1],[-.35,-1.45],[-.5,-2.35]]
      :[[0,-2.95],[.48,-2.55],[.48,.65],[-.48,.65],[-.48,-2.55]];
    ctx.beginPath();blade.forEach(([x,y],i)=>i?ctx.lineTo(x*size,y*size):ctx.moveTo(x*size,y*size));ctx.closePath();
    ctx.fillStyle=dark?'#292035':'#9c6e2a';ctx.fill();
    ctx.strokeStyle=dark?`rgba(${rgb},.95)`:'#ffe6a1';ctx.lineWidth=2;ctx.stroke();
    ctx.beginPath();ctx.moveTo(0,-size*(dark?2.8:2.65));
    if(dark){ctx.lineTo(-size*.13,-size*1.7);ctx.lineTo(size*.12,-size*1.05);}
    ctx.lineTo(0,size*.48);ctx.strokeStyle=dark?'#dc83e8':'#fff2c7';ctx.lineWidth=dark?1.7:3;ctx.stroke();
    const guard=dark
      ?[[-.94,.25],[-.6,.8],[0,.65],[.6,.8],[.94,.25],[.5,.46],[0,.42],[-.5,.46]]
      :[[-1,.5],[-.82,.82],[-.3,.78],[0,.9],[.3,.78],[.82,.82],[1,.5],[.42,.55],[0,.35],[-.42,.55]];
    ctx.beginPath();guard.forEach(([x,y],i)=>i?ctx.lineTo(x*size,y*size):ctx.moveTo(x*size,y*size));ctx.closePath();
    ctx.fillStyle=dark?'#493057':'#dba94b';ctx.fill();ctx.strokeStyle=dark?`rgb(${rgb})`:'#ffe6a1';ctx.lineWidth=1.5;ctx.stroke();
    ctx.beginPath();ctx.moveTo(0,size*.8);ctx.lineTo(0,size*1.5);ctx.strokeStyle=dark?'#171322':'#594126';ctx.lineWidth=size*.23;ctx.stroke();
    if(!dark){
      ctx.beginPath();ctx.arc(0,size*.6,size*.24,0,Math.PI*2);ctx.fillStyle='#fff0a3';ctx.fill();
      ctx.beginPath();
      for(let i=0;i<8;i++){const angle=i*Math.PI/4;ctx.moveTo(Math.cos(angle)*size*.29,size*.6+Math.sin(angle)*size*.29);ctx.lineTo(Math.cos(angle)*size*.4,size*.6+Math.sin(angle)*size*.4);}
      ctx.strokeStyle='#ffdb75';ctx.lineWidth=1.4;ctx.stroke();
    }
    ctx.beginPath();ctx.moveTo(0,size*1.42);ctx.lineTo(size*.2,size*1.65);ctx.lineTo(0,size*1.85);ctx.lineTo(-size*.2,size*1.65);ctx.closePath();
    ctx.fillStyle=dark?'#b36dc9':'#ffe19a';ctx.fill();
    ctx.restore();return true;
  },
  drawGun(ctx,entity,config,alpha,now=performance.now()){
    const size=Math.max(12,Number(entity.radius)||20)*1.5;
    const sniper=config.style==='sniper',pistol=config.style==='pistol';
    const accent=config.color||entity.character?.color||'#a18a8a';
    const spin=config.rotationStateKey?this.rotation(entity,{stateKey:config.rotationStateKey,turnRadians:-Math.PI*2},Number(config.rotationMs)||300,now):0;
    ctx.save();ctx.rotate((Number(config.angle)||0)+spin);ctx.translate(0,-size*.4);ctx.globalAlpha=alpha*.9;
    ctx.lineJoin='round';
    const polygon=(points,fill,stroke=accent,width=1.6)=>{
      ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x*size,y*size):ctx.moveTo(x*size,y*size));ctx.closePath();ctx.fillStyle=fill;ctx.fill();ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke();
    };
    const line=(points,color,width)=>{
      ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x*size,y*size):ctx.moveTo(x*size,y*size));ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();
    };
    const steel=sniper?'#547c98':'#66616b',edge=sniper?'#c7efff':'#d5c9ce',grip='#292b35';
    if(pistol){
      polygon([[-1.55,-.52],[1.15,-.52],[1.37,-.32],[1.37,.03],[-1.55,.03]],steel);
      polygon([[-1.3,.03],[.91,.03],[.76,.23],[-.38,.23],[-.61,1.27],[-1.27,1.27],[-1.04,.2]],grip);
      polygon([[-.46,.22],[.34,.22],[.22,.64],[-.54,.64]],grip);
      line([[-.28,.32],[.12,.32],[.05,.51],[-.31,.51]],edge,1.2);
      line([[-1.32,-.37],[.96,-.37]],edge,1.5);
      for(let i=0;i<3;i++)line([[-1.16+i*.17,-.28],[-1.1+i*.17,-.07]],accent,1.4);
      line([[-1.08,1.12],[-.7,1.12]],accent,2);
    }else{
      const length=sniper?3.1:2.65;
      polygon([[.55,-.24],[length,-.24],[length,-.05],[.55,-.05]],steel);
      polygon([[length-.13,-.29],[length+.12,-.29],[length+.12,.02],[length-.13,.02]],grip);
      polygon([[-1.15,-.39],[.75,-.39],[.89,-.2],[.71,.3],[-.93,.3],[-1.15,.09]],steel);
      polygon([[-1.15,-.21],[-1.42,-.21],[-2.15,-.38],[-2.58,-.38],[-2.58,.56],[-2.12,.56],[-1.55,.17],[-1.1,.14]],grip);
      line([[-2.4,-.23],[-2.4,.39]],accent,3);
      polygon([[-.72,.3],[-.26,.3],[-.49,1.02],[-.99,1.02]],grip);
      polygon([[-.25,.3],[.34,.3],[.2,.64],[-.34,.64]],grip);
      line([[-.13,.4],[.2,.4],[.12,.54],[-.19,.54]],edge,1.1);
      line([[-.95,-.24],[.59,-.24]],edge,1.7);
      if(sniper){
        polygon([[.1,.3],[.55,.3],[.45,.85],[-.02,.85]],'#36516b');
        line([[-.55,-.42],[-.55,-.62],[.25,-.62],[.25,-.42]],accent,2);
        polygon([[-1.03,-.85],[.69,-.85],[.69,-.56],[-1.03,-.56]],'#3a607a');
        polygon([[-1.16,-.96],[-.85,-.96],[-.85,-.46],[-1.16,-.46]],steel);
        polygon([[.5,-1],[.94,-1],[.94,-.42],[.5,-.42]],steel);
        line([[.78,-.87],[.78,-.55]],'#d4f7ff',3);
      }else{
        polygon([[.8,-.12],[1.95,-.12],[1.95,.4],[.8,.4]],'#59525e');
        for(let i=0;i<5;i++)line([[.97+i*.17,0],[.97+i*.17,.26]],accent,1.5);
        line([[.78,.18],[2.25,.18]],accent,3);
      }
    }
    ctx.restore();return true;
  },
  drawBehind(ctx,entity,alpha=1,now=performance.now()){
    if(!ctx||!entity?.alive||entity.hidden)return false;
    const configs=entity.character?.worldEffectModules||[];
    this.presentWeaponTransition(entity,configs,alpha,now);
    let drawn=false;
    for(let index=0;index<configs.length;index++){
      const config=configs[index];
      if(config?.type!=='effect.spawn')continue;
      if(config.renderType==='gunSilhouette'){
        if(TriggerModuleService.matches({type:'trigger',event:'presentation.draw',conditions:config.conditions||[]},'presentation.draw',{source:entity,now}))drawn=this.drawGun(ctx,entity,config,alpha,now)||drawn;
        continue;
      }
      if(config.renderType==='swordSilhouette'){
        if(TriggerModuleService.matches({type:'trigger',event:'presentation.draw',conditions:config.conditions||[]},'presentation.draw',{source:entity,now}))drawn=this.drawSword(ctx,entity,config,alpha,now)||drawn;
        continue;
      }
      if(config.renderType!=='gearCluster')continue;
      const key=`entity-decoration:${entity.id}:${index}`;
      let effect=EffectSpawnService.getByKey(key);
      if(!effect){
        effect=EffectSpawnService.spawn({...config,key,dur:Infinity,followSource:true,
          decorationCharacterId:entity.character.id,entityDecoration:true},{source:entity});
      }
      if(!effect)continue;
      const gears=effect.gears||[];
      const relation=RelationService.relation(Training.player,entity);
      const relationAlpha=relation==='enemy'?Number(effect.enemyAlpha??.4):Number(effect.allyAlpha??1);
      const scale=Math.max(.5,(Number(entity.radius)||20)/20);
      const radius=Math.max(8,Number(effect.radius)||22)*scale;

      const rgb=ColorService.rgbString(effect.color,'255,220,36');
      if(effect._gearRgb!==rgb){
        effect._gearRgb=rgb;
        effect._gearDark=rgb.split(',').map(value=>Math.round(Number(value)*.28)).join(',');
      }
      const dark=effect._gearDark;
      ctx.save();

      for(let gearIndex=0;gearIndex<gears.length;gearIndex++){
        const gear=gears[gearIndex];
        const state=ModeStateService.state(entity,gear.stateKey);
        const usedAt=Number(state?.changedAt??-Infinity);
        const elapsed=now-usedAt;
        const hold=Math.max(0,Number(effect.useHoldMs)||0),fade=Math.max(1,Number(effect.useFadeMs)||1);
        const activity=Math.max(0,Math.min(1,1-(elapsed-hold)/fade));
        const idle=Math.max(0,Math.min(1,Number(effect.idleAlpha??1)));
        const drive=this.rotation(entity,gear,Math.max(1,Number(effect.rotationMs)||180),now);
        ctx.save();
        ctx.globalAlpha=Math.max(0,Math.min(1,alpha*relationAlpha*(idle+(1-idle)*activity)));
        ctx.translate(Number(gear.x||0)*scale,Number(gear.y||0)*scale);
        this.gearPath(ctx,radius,Math.max(6,Math.floor(Number(effect.teeth)||12)),
          drive+Number(gear.phase||0));
        ctx.fillStyle=`rgb(${dark})`;
        ctx.strokeStyle=`rgb(${rgb})`;
        ctx.lineWidth=2*scale;
        ctx.fill();ctx.stroke();
        // 촘촘한 톱니·이중 림·여섯 살·회전 볼트·육각 축의 기계식 플레이트.
        ctx.beginPath();ctx.arc(0,0,radius*.73,0,Math.PI*2);
        ctx.fillStyle='rgba(18,24,25,.96)';ctx.fill();
        ctx.strokeStyle=`rgba(${rgb},.65)`;ctx.lineWidth=1.2*scale;ctx.stroke();
        const rotor=drive;
        for(let spoke=0;spoke<6;spoke++){
          const theta=rotor-Math.PI/2+spoke*Math.PI/3;
          ctx.beginPath();
          ctx.moveTo(Math.cos(theta-.22)*radius*.2,Math.sin(theta-.22)*radius*.2);
          ctx.lineTo(Math.cos(theta-.1)*radius*.64,Math.sin(theta-.1)*radius*.64);
          ctx.lineTo(Math.cos(theta+.1)*radius*.64,Math.sin(theta+.1)*radius*.64);
          ctx.lineTo(Math.cos(theta+.22)*radius*.2,Math.sin(theta+.22)*radius*.2);
          ctx.closePath();ctx.fillStyle=`rgba(${rgb},.42)`;ctx.fill();
          ctx.strokeStyle=`rgba(${rgb},.85)`;ctx.lineWidth=scale;ctx.stroke();
        }
        for(let pin=0;pin<6;pin++){
          const theta=drive-Math.PI/2+pin*Math.PI/3;
          ctx.beginPath();ctx.arc(Math.cos(theta)*radius*.58,Math.sin(theta)*radius*.58,3*scale,0,Math.PI*2);
          ctx.fillStyle=`rgba(${rgb},.85)`;ctx.fill();
          ctx.strokeStyle=`rgba(${dark},.95)`;ctx.lineWidth=scale;ctx.stroke();
        }
        ctx.beginPath();
        for(let corner=0;corner<6;corner++){
          const theta=Math.PI/6+corner*Math.PI/3;
          const x=Math.cos(theta)*radius*.22,y=Math.sin(theta)*radius*.22;
          if(corner===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
        }
        ctx.closePath();ctx.fillStyle=`rgb(${dark})`;ctx.fill();
        ctx.strokeStyle=`rgb(${rgb})`;ctx.lineWidth=1.5*scale;ctx.stroke();
        ctx.beginPath();ctx.arc(0,0,radius*.075,0,Math.PI*2);
        ctx.fillStyle='#fff7c2';ctx.fill();
        ctx.restore();
      }
      ctx.restore();
      drawn=true;
    }
    return drawn;
  }
});
