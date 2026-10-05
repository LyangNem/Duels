/* 모드별 기어 자체 회전·사용 밝기. 기존 effect.spawn/ModeState 시간축을 공유한다. */
const ModeGearPresentationService=Object.freeze({
  rotation(entity,gear,duration,now){
    const state=ModeStateService.state(entity,gear.stateKey);
    const current=Number(state?.turns)||0,previous=Number(state?.previousTurns)||0;
    const progress=state?Math.max(0,Math.min(1,(now-Number(state.changedAt??now))/duration)):1;
    return (previous+(current-previous)*EffectSpawnService.ease(progress,'ease-out'))*Math.PI*2/3;
  },
  gearPath(ctx,radius,teeth,angle){
    ctx.beginPath();
    for(let tooth=0;tooth<teeth;tooth++){
      for(let part=0;part<4;part++){
        const theta=angle+(tooth+(part===0?0:part===1?.2:part===2?.55:.75))/teeth*Math.PI*2;
        const r=radius*((part===0||part===3) ? .81 : 1);
        const x=Math.cos(theta)*r,y=Math.sin(theta)*r;
        if(tooth===0&&part===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
      }
    }
    ctx.closePath();
  },
  drawBehind(ctx,entity,alpha=1,now=performance.now()){
    if(!ctx||!entity?.alive||entity.hidden)return false;
    const configs=entity.character?.worldEffectModules||[];
    let drawn=false;
    for(let index=0;index<configs.length;index++){
      const config=configs[index];
      if(config?.type!=='effect.spawn'||config.renderType!=='gearCluster')continue;
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
        const value=ModeStateService.current(entity,gear.stateKey,gear.initial);
        const selected=Math.max(0,(gear.values||[]).indexOf(value));
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
        // 얇은 이중 림·세 살·육각 축. 글자 없이 밝은 표시점으로 상태를 표시한다.
        ctx.beginPath();ctx.arc(0,0,radius*.73,0,Math.PI*2);
        ctx.fillStyle='rgba(18,24,25,.96)';ctx.fill();
        ctx.strokeStyle=`rgba(${rgb},.65)`;ctx.lineWidth=1.2*scale;ctx.stroke();
        const rotor=drive;
        for(let spoke=0;spoke<3;spoke++){
          const theta=rotor-Math.PI/2+spoke*Math.PI*2/3;
          ctx.beginPath();
          ctx.moveTo(Math.cos(theta-.22)*radius*.2,Math.sin(theta-.22)*radius*.2);
          ctx.lineTo(Math.cos(theta-.1)*radius*.64,Math.sin(theta-.1)*radius*.64);
          ctx.lineTo(Math.cos(theta+.1)*radius*.64,Math.sin(theta+.1)*radius*.64);
          ctx.lineTo(Math.cos(theta+.22)*radius*.2,Math.sin(theta+.22)*radius*.2);
          ctx.closePath();ctx.fillStyle=`rgba(${rgb},.42)`;ctx.fill();
          ctx.strokeStyle=`rgba(${rgb},.85)`;ctx.lineWidth=scale;ctx.stroke();
        }
        for(let pin=0;pin<3;pin++){
          const theta=-Math.PI/2+pin*Math.PI*2/3;
          ctx.beginPath();ctx.arc(Math.cos(theta)*radius*.58,Math.sin(theta)*radius*.58,3*scale,0,Math.PI*2);
          ctx.fillStyle=pin===selected?'#fff7c2':`rgba(${rgb},.2)`;ctx.fill();
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
