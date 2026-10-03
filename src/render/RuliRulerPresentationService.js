


/* 룰리의 기존 줄자 디자인을 현재 3.0 progress/aim 상태 위에 그리는 presentation.
   판정·입력·네트워크는 기존 3.0 시스템을 그대로 사용한다. */
const RuliRulerPresentationService=Object.freeze({
  configFor(entity){
    return entity?.character?.rulerPresentation||null;
  },
  get config(){
    return Object.values(GAME_DATA.characters).find(character=>character?.rulerPresentation)?.rulerPresentation||{};
  },
  get rgb(){return this.config.rgb;},
  visuals:new WeakMap(),
  stage(entity){
    const state=ProgressStateService.state(entity,this.config.stateKey);
    return Math.max(this.config.minStage,Math.min(this.config.maxStage,Math.floor(Number(state?.value)||this.config.minStage)));
  },
  aimAngle(runtime,entity){
    if(entity===runtime?.player)return Training.aimAngle();
    if(Number.isFinite(Number(entity?._remoteAimAngle)))return Number(entity._remoteAimAngle);
    return Number(entity?.angle)||0;
  },
  preparedAttack(entity,attackId,now=performance.now()){
    const base=AbilityService.attackById(
      entity?.character,
      String(attackId||'')
    );
    if(!base)return null;
    return AugmentService.prepareAttack(
      entity,
      base,
      now
    );
  },
  stageArea(entity,stage,now=performance.now()){
    const config=this.configFor(entity)||this.config;
    const prepared=this.preparedAttack(
      entity,
      config.stageAttackId,
      now
    );
    if(!prepared)return null;
    const area=AttackModuleService.module(prepared,'delivery.area');
    if(!area)return null;
    const resolvedStage=Math.max(
      Number(config.minStage)||1,
      Math.min(
        Number(config.maxStage)||1,
        Number(stage)||Number(config.minStage)||1
      )
    );
    return {
      ...area,
      centerDistance:
        (Number(config.originDistance)||0)+
        (resolvedStage-(Number(config.minStage)||1))*(Number(config.stageDistance)||0)
    };
  },
  counterArea(entity,now=performance.now()){
    const prepared=this.preparedAttack(
      entity,
      this.config.counterAttackId,
      now
    );
    return prepared
      ?AttackModuleService.module(
        prepared,
        'delivery.area'
      )
      :null;
  },
  wallLimited(entity,angle,distance,padding=this.config.wallPadding){
    return WorldGeometryService.raycastDistance(
      Number(entity.x)||0,
      Number(entity.y)||0,
      angle,
      Math.max(0,Number(distance)||0),
      padding
    );
  },
  geometry(entity,angle,stage,strikeLength=null,strikeWidth=null,area=null){
    const resolvedArea=
      area||
      this.stageArea(
        entity,
        stage
      )||
      {};
    const desired=
      Number.isFinite(Number(resolvedArea.centerDistance))
        ?Math.max(0,Number(resolvedArea.centerDistance))
        :this.config.originDistance+(Math.max(this.config.minStage,stage)-this.config.minStage)*this.config.stageDistance;
    const resolvedLength=
      strikeLength!==null
        ?Math.max(1,Number(strikeLength)||1)
        :Math.max(
          1,
          Math.max(
            0,
            Number(resolvedArea.halfWidth)||this.config.halfWidth
          )*2
        );
    const resolvedWidth=
      strikeWidth!==null
        ?Math.max(1,Number(strikeWidth)||1)
        :Math.max(
          1,
          Number(resolvedArea.range)||this.config.depth
        );
    const distance=
      String(resolvedArea.wallPolicy||'block')==='ignore'
        ?desired
        :this.wallLimited(
          entity,
          angle,
          desired,
          this.config.wallPadding
        );
    return {
      x:Number(entity.x)+Math.cos(angle)*distance,
      y:Number(entity.y)+Math.sin(angle)*distance,
      distance,
      desiredDistance:desired,
      angle:angle+Math.PI/2,
      length:resolvedLength,
      width:resolvedWidth,
      area:resolvedArea
    };
  },
  ticks(strikeDepth,endDistance){
    const firstInnerEdge=Math.max(
      0,
      this.config.originDistance-Math.max(1,Number(strikeDepth)||1)/2
    );
    const ticks=[];
    for(
      let index=0,distance=firstInnerEdge;
      distance<=Math.max(0,Number(endDistance)||0)+.01;
      index++,distance=firstInnerEdge+index*this.config.tickSpacing
    ){
      ticks.push({distance,index,major:index%this.config.majorEvery===0});
    }
    return ticks;
  },
  drawTicks(ctx,x,y,angle,strikeLength,strikeWidth,distance,alpha,strong){
    const dirX=Math.cos(angle),dirY=Math.sin(angle);
    const nx=-dirY,ny=dirX;
    const edgeOffset=strikeLength/2;
    const end=Math.max(0,distance+strikeWidth/2);
    for(const mark of this.ticks(strikeWidth,end)){
      const tick=mark.major?this.config.majorLength:this.config.minorLength;
      const cx=x+dirX*mark.distance-nx*edgeOffset;
      const cy=y+dirY*mark.distance-ny*edgeOffset;
      if(strong){
        ctx.beginPath();
        ctx.moveTo(cx,cy);
        ctx.lineTo(cx+nx*tick,cy+ny*tick);
        ctx.strokeStyle=`rgba(24,22,10,${alpha*.82})`;
        ctx.lineWidth=mark.major?this.config.backMajorWidth:this.config.backMinorWidth;
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(cx,cy);
      ctx.lineTo(cx+nx*tick,cy+ny*tick);
      ctx.strokeStyle=strong
        ?`rgba(${this.rgb},${alpha*(mark.major?1:.9)})`
        :(mark.major
          ?`rgba(${this.rgb},0.52)`
          :`rgba(${this.rgb},0.30)`);
      ctx.lineWidth=strong
        ?(mark.major?this.config.strongMajorWidth:this.config.strongMinorWidth)
        :(mark.major?this.config.majorWidth:this.config.minorWidth);
      ctx.stroke();
    }
  },
  drawStage(ctx,x,y,stage,alpha=1){
    ctx.save();
    ctx.font=`bold ${this.config.fontSize}px Arial`;
    ctx.textAlign='center';
    ctx.textBaseline='middle';
    ctx.strokeStyle=`rgba(0,0,0,${alpha*.9})`;
    ctx.lineWidth=4;
    ctx.strokeText(String(stage),x,y);
    ctx.fillStyle=`rgba(255,255,245,${alpha})`;
    ctx.fillText(String(stage),x,y);
    ctx.restore();
  },
  updateAdjustVisual(entity,angle,stage,now){
    let state=this.visuals.get(entity);
    if(!state){
      state={stage,until:0,angle};
      this.visuals.set(entity,state);
      return null;
    }
    if(state.stage!==stage){
      state.stage=stage;
      state.until=now+this.config.adjustFrames*GAME_DATA.frameMs;
      state.angle=angle;
    }
    return state;
  },
  drawPersistent(ctx,runtime,entity,now){
    if(
      entity!==runtime?.player||
      !this.configFor(entity)
    )return;

    const normalStage=this.stage(entity);
    const angle=this.aimAngle(runtime,entity);
    const counterPredelay=!!entity.counterWindup;
    let displayStage=normalStage;
    let displayArea=this.stageArea(
      entity,
      normalStage,
      now
    );

    if(counterPredelay){
      const counterArea=this.counterArea(
        entity,
        now
      )||{};
      const rewind=
        counterArea.steppedRewind||{};
      const minDistance=
        Math.max(
          0,
          Number(rewind.minDistance)||this.config.originDistance
        );
      const stepDistance=
        Math.max(
          1,
          Number(rewind.stepDistance)||this.config.stageDistance
        );
      const stages=
        Math.max(
          1,
          Number(rewind.stages)||this.config.maxStage
        );
      const maxDistance=
        minDistance+
        (stages-1)*stepDistance;
      const wallDistance=this.wallLimited(
        entity,
        angle,
        maxDistance,
        Math.max(
          0,
          Number(rewind.wallPadding)||this.config.wallPadding
        )
      );
      displayStage=Math.max(
        1,
        Math.min(
          stages,
          Math.floor(
            (wallDistance-minDistance)/
            stepDistance
          )+1
        )
      );
      displayArea={
        ...counterArea,
        centerDistance:
          minDistance+
          (displayStage-1)*stepDistance
      };
    }

    const geo=this.geometry(
      entity,
      angle,
      displayStage,
      null,
      null,
      displayArea
    );
    const strikeLength=geo.length;
    const strikeWidth=geo.width;

    // 기존: 반격 선딜 중 공통 counter preview가 있으므로 별도 평타 팁 박스는 숨긴다.
    if(!counterPredelay){
      ctx.save();
      ctx.translate(geo.x,geo.y);
      ctx.rotate(geo.angle);
      ctx.setLineDash([7,5]);
      ctx.fillStyle='rgba(255,255,255,0)';
      ctx.strokeStyle='rgba(255,255,255,0.55)';
      ctx.lineWidth=this.config.outlineWidth;
      ctx.globalAlpha=.85;
      ctx.strokeRect(
        -geo.length/2,
        -geo.width/2,
        geo.length,
        geo.width
      );
      ctx.restore();
    }

    ctx.save();
    ctx.globalAlpha=.92;
    ctx.lineCap='butt';
    this.drawTicks(
      ctx,
      entity.x,
      entity.y,
      angle,
      strikeLength,
      strikeWidth,
      geo.distance,
      1,
      false
    );
    this.drawStage(ctx,geo.x,geo.y,displayStage,1);
    ctx.restore();

    // 기존 rulerAdjust: RMB로 단계가 바뀌는 순간 새 길이의 눈금/숫자를 16프레임 강하게 표시한다.
    const adjust=
      SteppedRangeRewindDeliveryService.isActive(entity)
        ?null
        :this.updateAdjustVisual(
          entity,
          angle,
          normalStage,
          now
        );
    if(adjust&&adjust.until>now){
      const adjustAlpha=Math.max(
        0,
        Math.min(
          1,
          (adjust.until-now)/
          Math.max(1,this.config.adjustFrames*GAME_DATA.frameMs)
        )
      );
      const adjustArea=this.stageArea(
        entity,
        normalStage,
        now
      );
      const adjustGeo=this.geometry(
        entity,
        adjust.angle,
        normalStage,
        null,
        null,
        adjustArea
      );
      this.drawTicks(
        ctx,
        entity.x,
        entity.y,
        adjust.angle,
        adjustGeo.length,
        adjustGeo.width,
        adjustGeo.distance,
        adjustAlpha,
        true
      );
      this.drawStage(
        ctx,
        adjustGeo.x,
        adjustGeo.y,
        normalStage,
        adjustAlpha
      );
    }


  },
  drawStrike(ctx,f,alpha,progress){
    const x=Number(f.x)||0,y=Number(f.y)||0;
    const hasTarget=
      Number.isFinite(Number(f.tx))&&
      Number.isFinite(Number(f.ty));
    const targetX=hasTarget?Number(f.tx):null;
    const targetY=hasTarget?Number(f.ty):null;
    const angle=hasTarget
      ?Math.atan2(targetY-y,targetX-x)
      :(Number(f.angle)||0);
    const distance=hasTarget
      ?Math.hypot(targetX-x,targetY-y)
      :Math.max(0,Number(f.distance)||this.config.originDistance);
    const strikeLength=Math.max(1,Number(f.strikeLength)||this.config.halfWidth*2);
    const strikeWidth=Math.max(1,Number(f.strikeWidth)||this.config.depth);
    const dirX=Math.cos(angle),dirY=Math.sin(angle);
    const tx=hasTarget?targetX:x+dirX*distance;
    const ty=hasTarget?targetY:y+dirY*distance;
    const source=
      EntityService.items.get(
        String(f.sourceEntityId||'')
      )||null;
    const startDistance=
      Math.max(
        0,
        Number.isFinite(Number(f.startDistance))
          ?Number(f.startDistance)
          :(Number(source?.radius)||20)
      );
    const endDistance=
      Math.max(
        startDistance,
        distance+strikeWidth/2
      );
    const outlineLength=
      Math.max(1,endDistance-startDistance);
    const outlineCenterDistance=
      startDistance+outlineLength/2;

    // 공격 순간 줄자 윤곽은 캐릭터 중심이 아니라 테두리부터 시작한다.
    ctx.save();
    ctx.translate(
      x+dirX*outlineCenterDistance,
      y+dirY*outlineCenterDistance
    );
    ctx.rotate(angle);
    ctx.strokeStyle=`rgba(${this.rgb},${alpha*.7})`;
    ctx.lineWidth=this.config.outlineWidth;
    ctx.strokeRect(
      -outlineLength/2,
      -strikeLength/2,
      outlineLength,
      strikeLength
    );
    ctx.restore();

    // 강한 눈금도 캐릭터 테두리 안쪽은 그리지 않는다.
    const nx=-dirY,ny=dirX;
    const edgeOffset=strikeLength/2;
    const rulerEnd=Math.max(startDistance,distance+strikeWidth/2);
    for(const mark of this.ticks(strikeWidth,rulerEnd)){
      if(mark.distance+1e-6<startDistance)continue;
      const tick=mark.major?this.config.majorLength:this.config.minorLength;
      const cx=x+dirX*mark.distance-nx*edgeOffset;
      const cy=y+dirY*mark.distance-ny*edgeOffset;

      ctx.beginPath();
      ctx.moveTo(cx,cy);
      ctx.lineTo(cx+nx*tick,cy+ny*tick);
      ctx.strokeStyle=`rgba(24,22,10,${alpha*.82})`;
      ctx.lineWidth=mark.major?this.config.backMajorWidth:this.config.backMinorWidth;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx,cy);
      ctx.lineTo(cx+nx*tick,cy+ny*tick);
      ctx.strokeStyle=
        `rgba(${this.rgb},${alpha*(mark.major?1:.9)})`;
      ctx.lineWidth=mark.major?this.config.strongMajorWidth:this.config.strongMinorWidth;
      ctx.stroke();
    }

    // 기존 확대 연출의 타격 네모 자체는 남기되, 처음부터 실제 크기로 고정한다.
    ctx.save();
    ctx.translate(tx,ty);
    ctx.rotate(angle);
    ctx.fillStyle=`rgba(${this.rgb},${alpha*.24})`;
    ctx.strokeStyle=`rgba(${this.rgb},${alpha})`;
    ctx.lineWidth=2.5;
    ctx.fillRect(
      -strikeWidth/2,
      -strikeLength/2,
      strikeWidth,
      strikeLength
    );
    ctx.strokeRect(
      -strikeWidth/2,
      -strikeLength/2,
      strikeWidth,
      strikeLength
    );
    ctx.restore();
  }

});