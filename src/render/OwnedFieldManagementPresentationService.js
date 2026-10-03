


/* 소유자에게만 설치 field의 관리용 연결선/순번을 표시한다. */
const OwnedFieldManagementPresentationService=Object.freeze({
  sourceStateScratch:[],
  ownerStateScratch:[],
  groupScratch:new Map(),
  groupPool:[],
  friendly(viewer,source){
    if(!viewer||!source)return false;
    if(viewer===source)return true;
    const viewerTeam=String(viewer.teamId||'');
    const sourceTeam=String(source.teamId||'');
    return !!(viewerTeam&&sourceTeam&&viewerTeam===sourceTeam);
  },
  trapColor(source,presentation){
    return presentation?.teamColor===true
      ?TeamColorPresentationService.colorForEntity(source,source.color||'#4af')
      :String(presentation?.color||source?.color||'#4af');
  },
  drawTrapBody(ctx,state,source,index,now){
    const presentation=state?.module?.presentation;
    if(!presentation?.managedTrap)return false;
    const x=Number(state.pointX)||0;
    const y=Number(state.pointY)||0;
    const radius=Math.max(8,Number(state.module?.range)||39);
    const triggerRadius=Math.max(radius,Number(state.module?.triggerResolveRange)||radius);
    const startedAt=Number(state.startedAt)||now;
    const armedAt=Math.max(startedAt,Number(state.armedAt)||startedAt);
    const armDuration=Math.max(1,armedAt-startedAt);
    const elapsed=Math.max(0,now-startedAt);
    const armed=now>=armedAt;
    const fade=Math.max(0,Math.min(1,elapsed/armDuration));
    const pulse=.5+.5*Math.sin(now*.005+index*.8);
    const alpha=armed ? (.18+.08*pulse) : (.72-.42*fade);
    const color=this.trapColor(source,presentation);
    const revealed=!!state.pendingTrigger;
    const resolvedColor=revealed
      ?ColorService.brighten(
        color,
        Number.isFinite(Number(presentation.revealBrighten))
          ?Number(presentation.revealBrighten)
          :.55
      )
      :color;
    const resolvedAlpha=revealed?Math.min(1,alpha*2.15):alpha;
    const rgb=ColorService.rgbString(resolvedColor);

    ctx.save();
    ctx.translate(x,y);
    ctx.strokeStyle=`rgba(${rgb},${Math.min(1,resolvedAlpha*1.25)})`;
    ctx.fillStyle=`rgba(${rgb},${resolvedAlpha*.12})`;
    ctx.lineWidth=armed?1.4:2;

    // 단순 덫 디자인: 얇은 원형 베이스 + 중앙 트리거 + 네 개의 짧은 안쪽 표시.
    ctx.beginPath();
    ctx.arc(0,0,radius,0,Math.PI*2);
    ctx.fill();
    ctx.setLineDash([4,4]);
    ctx.stroke();
    ctx.setLineDash([]);

    if(revealed&&triggerRadius>radius+1e-6){
      ctx.beginPath();
      ctx.arc(0,0,triggerRadius,0,Math.PI*2);
      ctx.strokeStyle=`rgba(${rgb},${Math.min(1,resolvedAlpha*.9)})`;
      ctx.lineWidth=1.6;
      ctx.setLineDash([6,5]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.beginPath();
    ctx.arc(0,0,radius*.22,0,Math.PI*2);
    ctx.fillStyle=`rgba(${rgb},${Math.min(1,resolvedAlpha*1.7)})`;
    ctx.fill();

    ctx.strokeStyle=`rgba(${rgb},${Math.min(1,resolvedAlpha*1.35)})`;
    ctx.lineWidth=armed?1.2:1.7;
    for(let i=0;i<4;i++){
      const a=Math.PI*.5*i;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a)*radius*.48,Math.sin(a)*radius*.48);
      ctx.lineTo(Math.cos(a)*radius*.78,Math.sin(a)*radius*.78);
      ctx.stroke();
    }
    ctx.restore();
    return true;
  },
  startedAtOrder(a,b){
    return (Number(a?.startedAt)||0)-(Number(b?.startedAt)||0);
  },
  draw(ctx,viewer){
    if(!ctx||!viewer)return false;
    let drawn=false;
    const now=performance.now();

    // 설치자/아군은 덫을 계속 본다. 적은 설치/무장 0.5초 동안만 보며,
    // 무장 후에는 숨겨졌다가 밟아 pendingTrigger가 생기면 0.3초 예고 동안 다시 덫 본체가 보인다.
    for(const source of EntityService.items.values()){
      if(!source?.actionState)continue;
      const friendly=this.friendly(viewer,source);
      const states=this.sourceStateScratch;
      states.length=0;
      for(const state of source.actionState.values()){
        if(
          state?.kind!==InstalledAreaFieldService.KIND||
          state.phase!=='point'||
          state.module?.presentation?.managedTrap!==true
        )continue;
        states.push(state);
      }
      if(states.length>1){
        states.sort(this.startedAtOrder);
      }
      for(let index=0;index<states.length;index++){
        const state=states[index];
        const armedAt=Math.max(Number(state.startedAt)||0,Number(state.armedAt)||0);
        const hostileVisibleBeforeArm=!friendly&&now<armedAt;
        const hostileRevealed=!friendly&&!!state.pendingTrigger;
        if(!friendly&&!hostileVisibleBeforeArm&&!hostileRevealed)continue;
        drawn=this.drawTrapBody(ctx,state,source,index,now)||drawn;
      }
    }

    // 번호와 연결선은 설치자 본인에게만 표시한다. 같은 stateKey의 순서는 프레임당 한 번만 계산한다.
    if(viewer.actionState){
      const ownerStates=this.ownerStateScratch;
      ownerStates.length=0;
      const groups=this.groupScratch;
      groups.clear();
      let groupPoolIndex=0;
      for(const state of viewer.actionState.values()){
        if(
          state?.kind!==InstalledAreaFieldService.KIND||
          state.phase!=='point'
        )continue;
        const presentation=state.module?.presentation;
        if(!presentation||typeof presentation!=='object')continue;
        if(presentation.ownerLink!==true&&presentation.ownerIndexLabel!==true)continue;
        ownerStates.push(state);
        let group=groups.get(state.baseStateKey);
        if(!group){
          group=this.groupPool[groupPoolIndex]||[];
          groupPoolIndex++;
          group.length=0;
          this.groupPool[groupPoolIndex-1]=group;
          groups.set(state.baseStateKey,group);
        }
        group.push(state);
      }
      for(const group of groups.values()){
        if(group.length>1){
          group.sort(this.startedAtOrder);
        }
      }

      for(const state of ownerStates){
        const presentation=state.module.presentation;
        const siblings=groups.get(state.baseStateKey)||[];
        const index=siblings.indexOf(state);
        if(index<0)continue;

        const color=this.trapColor(viewer,presentation);
        const x=Number(state.pointX)||0;
        const y=Number(state.pointY)||0;

        ctx.save();
        if(presentation.ownerLink===true){
          ctx.beginPath();
          ctx.moveTo(Number(viewer.x)||0,Number(viewer.y)||0);
          ctx.lineTo(x,y);
          ctx.strokeStyle=`rgba(${ColorService.rgbString(color)},.28)`;
          ctx.lineWidth=1.5;
          ctx.setLineDash([5,6]);
          ctx.stroke();
          ctx.setLineDash([]);
        }
        if(presentation.ownerIndexLabel===true){
          const label=String(index+1);
          ctx.font='800 12px Pretendard';
          ctx.textAlign='center';
          ctx.textBaseline='middle';
          ctx.lineJoin='round';
          ctx.strokeStyle='rgba(0,0,0,.9)';
          ctx.lineWidth=3;
          ctx.strokeText(label,x,y);
          ctx.fillStyle=color;
          ctx.fillText(label,x,y);
        }
        ctx.restore();
        drawn=true;
      }
    }
    return drawn;
  }
});