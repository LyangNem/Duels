


const SummonVisualPresentationService=Object.freeze({
  visibleToLocal(entity,presentation){
    const visibility=String(
      presentation?.visibility||
      'all'
    );

    if(visibility==='all')return true;

    const local=Training.player;
    if(!local)return false;

    const owner=
      EntityService.owner(entity)||
      entity;

    if(visibility==='owner')return owner===local;

    if(visibility==='owner-team'){
      if(owner===local)return true;

      return !!(
        owner?.teamId&&
        local.teamId&&
        owner.teamId===local.teamId
      );
    }

    return true;
  },
  body(ctx,entity,now=performance.now()){
    if(!ctx||!entity)return false;

    const presentation=entity.summonSpec?.presentation||{};
    const isPeer=
      Training.sessionMode==='online'&&
      !EntitySimulationAuthorityService.isLocal(entity);
    const pulse=.88+.12*Math.sin(now*.004);
    const baseAlpha=isPeer?.45:.90;
    const stageColors=
      Array.isArray(presentation.stageColors)
        ?presentation.stageColors
        :null;
    const stageIndex=
      Math.max(
        0,
        Math.min(
          Math.max(0,(stageColors?.length||1)-1),
          Math.max(1,Math.floor(Number(entity.clusterStage)||1))-1
        )
      );
    const stageColor=
      stageColors?.[stageIndex]||
      presentation.color||
      entity.color||
      '#c8d8f0';

    ctx.save();
    ctx.globalAlpha=baseAlpha;
    ctx.beginPath();
    ctx.arc(0,0,entity.radius*pulse,0,Math.PI*2);
    ctx.fillStyle=String(
      stageColors
        ?stageColor
        :(presentation.fillColor||entity.color||'#c8d8f0')
    );
    ctx.globalAlpha*=isPeer?.67:.61;
    ctx.fill();
    ctx.globalAlpha=baseAlpha;
    ctx.strokeStyle=String(
      stageColors
        ?stageColor
        :(presentation.strokeColor||entity.color||'#c8d8f0')
    );
    ctx.lineWidth=2;
    ctx.setLineDash([4,3]);
    ctx.stroke();
    ctx.setLineDash([]);

    const barrel=presentation.barrel;
    if(barrel){
      const targetId=String(entity.summonAIState?.targetId||'');
      const target=targetId?EntityService.items.get(targetId):null;
      const angle=target?.alive
        ?Math.atan2(
          Number(target.y)-Number(entity.y),
          Number(target.x)-Number(entity.x)
        )
        :Number(barrel.angle)||0;
      const width=Math.max(1,Number(barrel.width)||8);
      const length=Math.max(1,Number(barrel.length)||entity.radius*1.1);
      ctx.save();
      ctx.rotate(angle);
      ctx.globalAlpha=baseAlpha;
      ctx.fillStyle=String(barrel.color||presentation.strokeColor||entity.color);
      ctx.fillRect(entity.radius*.2,-width/2,length,width);
      ctx.restore();
    }

    ctx.restore();
    return true;
  },
  stageGaugeMetrics(entity){
    const presentation=
      entity?.summonSpec?.presentation||{};
    if(
      presentation.stageGauge!==true||
      entity?.clusterSummonKind!==
        ClusterSummonService.KIND
    )return null;

    return {
      width:34,
      height:4,
      gap:2,
      offsetY:1
    };
  },
  stageGaugeStackHeight(entity){
    const metrics=this.stageGaugeMetrics(entity);
    if(!metrics)return 0;
    return (
      Math.max(0,Number(metrics.offsetY)||0)+
      Math.max(1,Number(metrics.height)||4)+
      Math.max(0,Number(metrics.gap)||2)
    );
  },
  range(ctx,entity,now=performance.now()){
    if(!ctx||!entity)return false;

    let rendered=false;
    const presentation=
      entity.summonSpec?.presentation||{};
    if(
      presentation.stageGauge===true&&
      entity.clusterSummonKind===ClusterSummonService.KIND
    ){
      const stage=Math.max(1,Math.floor(Number(entity.clusterStage)||1));
      const maxStage=Math.max(1,Math.floor(Number(entity.summonSpec?.maxStage)||4));
      const stageColors=Array.isArray(presentation.stageColors)?presentation.stageColors:null;
      const activeColor=
        stageColors?.[Math.max(0,Math.min(stageColors.length-1,stage-1))]||
        presentation.color||
        entity.color||
        '#c1fab1';
      const metrics=
        this.stageGaugeMetrics(entity);
      const width=Math.max(1,Number(metrics?.width)||34);
      const height=Math.max(1,Number(metrics?.height)||4);
      const gap=Math.max(0,Number(metrics?.gap)||2);
      const cell=(width-gap*(maxStage-1))/maxStage;
      const y=
        Number(entity.y)+
        Math.max(1,Number(entity.radius)||20)+
        7+
        Math.max(0,Number(metrics?.offsetY)||1);
      ctx.save();
      for(let index=0;index<maxStage;index++){
        ctx.globalAlpha=.90;
        ctx.fillStyle=index<stage?activeColor:'rgba(70,90,70,.45)';
        ctx.fillRect(
          Number(entity.x)-width/2+index*(cell+gap),
          y,
          cell,
          height
        );
      }
      ctx.restore();
      rendered=true;
    }

    const ownerRange=
      entity.summonSpec?.ownerRangePresentation;
    const owner=EntityService.owner(entity);

    if(
      ownerRange&&
      owner&&
      this.visibleToLocal(
        entity,
        ownerRange
      )&&
      String(ownerRange.shape||'circle')==='circle'
    ){
      const radius=
        ownerRange.rangeRef==='ai.ownerGuardRange'
          ?Math.max(
            0,
            Number(
              entity.summonSpec?.ai?.ownerGuardRange
            )||0
          )
          :Math.max(
            0,
            Number(ownerRange.range)||0
          );

      if(radius>0){
        const rgb=ColorService.rgbString(
          ownerRange.color||entity.color,
          '200,216,240'
        );
        ctx.save();
        ctx.beginPath();
        ctx.arc(
          owner.x,
          owner.y,
          radius,
          0,
          Math.PI*2
        );
        ctx.strokeStyle=
          `rgba(${rgb},${Math.max(
            0,
            Math.min(
              1,
              Number(ownerRange.alpha)||.32
            )
          )})`;
        ctx.lineWidth=Math.max(
          .5,
          Number(ownerRange.lineWidth)||2
        );
        ctx.setLineDash(
          Array.isArray(ownerRange.dash)
            ?ownerRange.dash
            :[9,7]
        );
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
        rendered=true;
      }
    }

    const attackRange=
      entity.summonSpec?.attackRangePresentation;

    if(
      attackRange&&
      this.visibleToLocal(
        entity,
        attackRange
      )&&
      String(attackRange.shape||'circle')==='circle'
    ){
      const radius=
        attackRange.rangeRef==='ai-melee-range'
          ?SummonAIService.meleeRange(
            entity,
            entity.summonSpec,
            now
          )
          :attackRange.attackId
            ?AugmentService.preparedAttackRange(
              entity,
              attackRange.attackId,
              now,
              Number(attackRange.range)||0
            )
            :Math.max(
              0,
              Number(attackRange.range)||0
            );
      if(radius>0){
        const rgb=
          ColorService.rgbString(
            attackRange.color||
            entity.color,
            '200,216,240'
          );

        ctx.save();
        ctx.beginPath();
        ctx.arc(
          entity.x,
          entity.y,
          radius,
          0,
          Math.PI*2
        );
        ctx.strokeStyle=
          `rgba(${rgb},${Math.max(
            0,
            Math.min(
              1,
              Number(attackRange.alpha)||.45
            )
          )})`;
        ctx.lineWidth=
          Math.max(
            .5,
            Number(attackRange.lineWidth)||1.5
          );
        ctx.setLineDash(
          Array.isArray(attackRange.dash)
            ?attackRange.dash
            :[5,5]
        );
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
        rendered=true;
      }
    }

    const carry=entity.summonSpec?.carry;
    if(
      carry&&
      this.visibleToLocal(entity,{visibility:String(carry.visibility||'owner')})
    ){
      const pickupRange=Math.max(0,Number(carry.pickupRange)||0);
      if(pickupRange>0){
        ctx.save();
        ctx.beginPath();
        ctx.arc(entity.x,entity.y,pickupRange,0,Math.PI*2);
        const pickupRgb=ColorService.rgbString(
          carry.color||entity.color,
          '0,200,151'
        );
        ctx.strokeStyle=`rgba(${pickupRgb},${Math.max(0,Math.min(1,Number(carry.alpha)||.35))})`;
        ctx.lineWidth=Math.max(.5,Number(carry.lineWidth)||1.5);
        ctx.setLineDash(
          Array.isArray(carry.dash)
            ?carry.dash
            :[4,4]
        );
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
        rendered=true;
      }
    }

    const leash=entity.summonSpec?.leash;
    const ownerState=owner&&entity.summonStateKey
      ?SummonDeployService.state(owner,entity.summonStateKey,false)
      :null;
    if(
      leash&&
      owner&&
      ownerState?.leashBreakAt>now&&
      this.visibleToLocal(entity,{visibility:String(leash.visibility||'owner')})
    ){
      const delay=Math.max(1,Number(leash.delay)||1);
      const remain=Math.max(0,Number(ownerState.leashBreakAt)-now);
      const alpha=.3+.4*(1-remain/delay);
      const leashRange=Math.max(0,Number(leash.range)||0);
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(entity.x,entity.y);
      ctx.lineTo(owner.x,owner.y);
      ctx.strokeStyle=`rgba(255,80,80,${alpha})`;
      ctx.lineWidth=2;
      ctx.setLineDash([8,6]);
      ctx.stroke();
      if(leashRange>0){
        ctx.beginPath();
        ctx.arc(entity.x,entity.y,leashRange,0,Math.PI*2);
        ctx.strokeStyle=`rgba(255,80,80,${alpha*.6})`;
        ctx.lineWidth=1.5;
        ctx.setLineDash([5,5]);
        ctx.stroke();
      }
      ctx.setLineDash([]);
      ctx.restore();
      rendered=true;
    }

    const field=entity.summonSpec?.fieldArea;
    if(
      !field||
      field.presentationEffect||
      String(field.shape||'circle')!=='circle'
    )return rendered;

    const preparedField=
      AugmentService.prepareRangeField(
        entity,
        field,
        now
      );
    const fieldRange=
      Math.max(
        0,
        Number(preparedField.range)||0
      );
    const pulse=
      .65+.35*Math.sin(now*.006);
    AreaZonePresentationService.draw(
      ctx,
      {
        x:entity.x,
        y:entity.y,
        radius:fieldRange,
        bodyColor:entity.color,
        source:entity,
        pulse,
        alpha:1
      }
    );
    return true;
  }
});