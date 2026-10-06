


/* 반격 */
const AttackPreviewAreaService=Object.freeze({
  parts(source,preparedAttack,angle,reuse=[],options=null){
    const result=
      Array.isArray(reuse)
        ?reuse
        :[];
    let write=0;

    const pushArea=(rawArea,extraAngle=0,areaSource=source,areaAttack=preparedAttack,anchored=false)=>{
      const module={
        ...rawArea,
        repeatCount:1,
        angleOffset:
          (Number(rawArea.angleOffset)||0)+
          (Number(extraAngle)||0)
      };
      const resolved=
        HitScanGeometryService.effectiveModule(
          areaSource,
          areaAttack,
          module,
          angle
        );
      if(!resolved)return;

      const part=
        result[write]&&
        typeof result[write]==='object'
          ?result[write]
          :{};
      const partAngle=
        angle+
        (Number(resolved.angleOffset)||0);

      part.angle=partAngle;
      part.wallPolicy=resolved.wallPolicy;
      part.endChord=
        resolved.shape==='sector'&&
        resolved.endChord===true;
      part.projectile=false;

      if(resolved.shape==='rect'){
        part.type='rect';
        part.range=Math.max(
          0,
          Number(resolved.range)||0
        );
        part.halfWidth=Math.max(
          0,
          Number(resolved.halfWidth)||0
        );
        part.halfAngle=0;
        part.innerRange=0;
        if(Array.isArray(part.points)){
          part.points.length=0;
        }
        const perpendicularOffset=
          Number(resolved.perpendicularOffset)||0;
        if(anchored||perpendicularOffset!==0){
          part.anchorX=
            (Number(areaSource.x)||0)-
            Math.sin(partAngle)*
            perpendicularOffset;
          part.anchorY=
            (Number(areaSource.y)||0)+
            Math.cos(partAngle)*
            perpendicularOffset;
        }else{
          delete part.anchorX;
          delete part.anchorY;
        }
        result[write++]=part;
        return;
      }

      if(
        resolved.shape==='sector'||
        resolved.shape==='circle'
      ){
        part.type=resolved.shape;
        part.range=Math.max(
          0,
          Number(resolved.range)||0
        );
        part.halfWidth=0;
        part.halfAngle=Math.max(
          0,
          Number(resolved.halfAngle)||0
        );
        part.innerRange=Math.max(
          0,
          Number(resolved.innerRange)||0
        );
        AreaGeometryService.polygon(
          areaSource,
          resolved,
          partAngle,
          96,
          part
        );

        if(
          resolved.shape==='circle'&&
          part.innerRange>0
        ){
          const innerModule=
            part.innerModule&&
            typeof part.innerModule==='object'
              ?part.innerModule
              :(part.innerModule={});
          Object.assign(
            innerModule,
            resolved
          );
          innerModule.range=part.innerRange;
          innerModule.innerRange=0;

          const innerGeometry=
            part.innerGeometry&&
            typeof part.innerGeometry==='object'
              ?part.innerGeometry
              :(
                part.innerGeometry={
                  center:{x:0,y:0},
                  points:[]
                }
              );

          AreaGeometryService.polygon(
            areaSource,
            innerModule,
            partAngle,
            96,
            innerGeometry
          );
          part.innerPoints=innerGeometry.points;
        }else{
          if(Array.isArray(part.innerPoints)){
            part.innerPoints.length=0;
          }
        }
        if(anchored){
          part.anchorX=Number(areaSource.x)||0;
          part.anchorY=Number(areaSource.y)||0;
        }else{
          delete part.anchorX;
          delete part.anchorY;
        }
        result[write++]=part;
      }
    };

    const previewAreaModules=[];
    if(options?.includeDeliveryAreas!==false){
      for(const module of preparedAttack?.modules||[]){
        const type=AttackModuleService.type(module);
        if(type==='delivery.area'){
          previewAreaModules.push(module);
          continue;
        }
        if(
          type==='effect.spawn'&&
          module?.damage?.module&&
          AttackModuleService.type(module.damage.module)==='delivery.area'
        ){
          previewAreaModules.push(module.damage.module);
        }
      }
    }

    for(const rawArea of previewAreaModules){
      const repeatCount=
        Math.max(
          1,
          Math.floor(
            Number(rawArea.repeatCount)||1
          )
        );
      const hasRepeatAngles=
        repeatCount>1&&
        (
          Number.isFinite(
            Number(rawArea.repeatAngleFrom)
          )||
          Number.isFinite(
            Number(rawArea.repeatAngleTo)
          )
        );
      const hasRepeatCenters=
        repeatCount>1&&
        (
          Number.isFinite(
            Number(rawArea.repeatCenterDistanceStart)
          )||
          Number.isFinite(
            Number(rawArea.repeatCenterDistanceStep)
          )
        );

      if(hasRepeatCenters&&!hasRepeatAngles){
        const startDistance=
          Number.isFinite(Number(rawArea.repeatCenterDistanceStart))
            ?Number(rawArea.repeatCenterDistanceStart)
            :Number(rawArea.centerDistance)||0;
        const stepDistance=
          Number.isFinite(Number(rawArea.repeatCenterDistanceStep))
            ?Number(rawArea.repeatCenterDistanceStep)
            :0;
        const baseAngle=
          angle+
          (Number(rawArea.angleOffset)||0);

        for(let index=0;index<repeatCount;index++){
          const centerDistance=
            startDistance+
            stepDistance*index;
          const anchorX=
            (Number(source.x)||0)+
            Math.cos(baseAngle)*centerDistance;
          const anchorY=
            (Number(source.y)||0)+
            Math.sin(baseAngle)*centerDistance;

          if(
            rawArea.repeatPathWallPolicy==='block'&&
            centerDistance>0&&
            WorldGeometryService.segmentBlocked(
              Number(source.x)||0,
              Number(source.y)||0,
              anchorX,
              anchorY,
              0
            )
          ){
            break;
          }

          pushArea(
            {
              ...rawArea,
              centerDistance:0,
              repeatCount:1,
              repeatCenterDistanceStart:undefined,
              repeatCenterDistanceStep:undefined
            },
            0,
            {
              ...source,
              x:anchorX,
              y:anchorY
            },
            preparedAttack,
            true
          );
        }
        continue;
      }

      if(hasRepeatAngles){
        const from=
          Number.isFinite(
            Number(rawArea.repeatAngleFrom)
          )
            ?Number(rawArea.repeatAngleFrom)
            :0;
        const to=
          Number.isFinite(
            Number(rawArea.repeatAngleTo)
          )
            ?Number(rawArea.repeatAngleTo)
            :from;

        for(let index=0;index<repeatCount;index++){
          const ratio=
            repeatCount<=1
              ?0
              :index/(repeatCount-1);
          pushArea(
            rawArea,
            from+(to-from)*ratio
          );
        }
        continue;
      }

      if(
        rawArea?.shape==='circle'&&
        String(rawArea.centerMode||'')==='live-aim-point'&&
        source===Training.player
      ){
        const point=Training.mouseWorld();
        const sx=Number(source.x)||0,sy=Number(source.y)||0;
        const dx=Number(point?.x)-sx,dy=Number(point?.y)-sy;
        const distance=Math.hypot(dx,dy);
        const maxRange=Math.max(0,Number(rawArea.centerMaxRange)||Number(preparedAttack?.range)||0);
        const ratio=maxRange>0&&distance>maxRange?maxRange/Math.max(.001,distance):1;
        let anchorX=sx+dx*ratio,anchorY=sy+dy*ratio;
        if(String(rawArea.centerPointResolve||'nearest-open')==='nearest-open'){
          const openPoint=WorldGeometryService.nearestOpenPoint(
            anchorX,
            anchorY,
            Math.max(1,Number(rawArea.centerPointClearance)||1)
          );
          if(openPoint){
            anchorX=Number(openPoint.x);
            anchorY=Number(openPoint.y);
          }
        }
        const anchor={...source,x:anchorX,y:anchorY};
        pushArea({...rawArea,centerMode:'',centerPoint:null},0,anchor,preparedAttack,true);
        continue;
      }

      pushArea(rawArea,0);
    }

    // 명시적 미리보기 geometry는 이동 후속 범위와 함께 합성한다.
    if(preparedAttack?.previewGeometry&&!(preparedAttack.modules||[]).some(module=>AttackModuleService.type(module)==='delivery.area')){
      pushArea(preparedAttack.previewGeometry,0);
    }

    /* projectile.impact가 후속 범위 공격을 실행하면 투사체의 예상 종점에 그 범위도 함께 표시한다. */
    const previewProjectile=
      AttackModuleService.module(preparedAttack,'delivery.projectile')||
      AttackModuleService.module(preparedAttack,'delivery.range-projectile');
    const previewImpact=AttackModuleService.module(preparedAttack,'projectile.impact');
    if(
      previewProjectile&&
      previewImpact&&
      Array.isArray(previewImpact.attackIds)&&
      previewImpact.attackIds.length
    ){
      const pierce=AttackModuleService.module(preparedAttack,'projectile.pierce');
      const projectileRadius=Math.max(
        0,
        Number(previewProjectile.hitRadius)||
        Number(previewProjectile.radius)||0
      );
      const desiredDistance=Math.max(0,Number(preparedAttack.range)||0);
      const terminalDistance=
        pierce?.walls===true
          ?desiredDistance
          :WorldGeometryService.raycastDistance(
            Number(source.x)||0,
            Number(source.y)||0,
            angle,
            desiredDistance,
            ProjectileWallCollisionModeService.resolve(
              previewProjectile,
              source
            )==='center'
              ?0
              :projectileRadius
          );
      const anchor={
        ...source,
        x:(Number(source.x)||0)+Math.cos(angle)*terminalDistance,
        y:(Number(source.y)||0)+Math.sin(angle)*terminalDistance
      };

      const pathPart=
        result[write]&&typeof result[write]==='object'
          ?result[write]
          :{};
      pathPart.type='projectile-path';
      pathPart.angle=angle;
      pathPart.range=terminalDistance;
      pathPart.halfWidth=Math.max(1,projectileRadius);
      pathPart.projectileRadius=Math.max(1,projectileRadius);
      pathPart.projectile=true;
      pathPart.wallPolicy=pierce?.walls===true?'ignore':'block';
      delete pathPart.anchorX;
      delete pathPart.anchorY;
      result[write++]=pathPart;

      for(const impactAttackId of previewImpact.attackIds){
        const impactBase=AbilityService.attackById(
          source.character,
          String(impactAttackId)
        );
        if(!impactBase)continue;
        const impactAttack=AugmentService.prepareAttack(
          source,
          impactBase,
          performance.now()
        );
        for(const impactArea of impactAttack.modules||[]){
          if(AttackModuleService.type(impactArea)!=='delivery.area')continue;
          pushArea(impactArea,0,anchor,impactAttack,true);
        }
      }
    }

    /*
      preview:true인 attack-end field.area도 실제 설치 위치/벽 절단 geometry를
      같은 공격 미리보기 parts에 포함한다. 특정 캐릭터/스킬 ID를 알지 않는다.
    */
    for(const field of preparedAttack?.modules||[]){
      if(AttackModuleService.type(field)!=='field.area')continue;
      if(field.preview!==true||field.anchorMode!=='attack-end')continue;

      const distance=AttackEndAnchorService.distance(
        source,
        preparedAttack,
        field,
        angle
      );
      const anchor={
        ...source,
        x:(Number(source.x)||0)+Math.cos(angle)*distance,
        y:(Number(source.y)||0)+Math.sin(angle)*distance
      };
      pushArea(
        {
          type:'delivery.area',
          shape:String(field.shape||'circle'),
          range:Math.max(0,Number(field.range)||0),
          halfWidth:Math.max(0,Number(field.halfWidth)||0),
          halfAngle:Math.max(0,Number(field.halfAngle)||0),
          wallPolicy:String(field.wallPolicy||'ignore')
        },
        0,
        anchor,
        preparedAttack,
        true
      );
    }

    for(const movement of preparedAttack?.modules||[]){
      if(AttackModuleService.type(movement)!=='movement.move')continue;
      if(!Array.isArray(movement.onEndAttackIds)||!movement.onEndAttackIds.length)continue;
      const desiredDistance=Math.max(0,Number(movement.distance)||0);
      if(desiredDistance<=0)continue;
      // 다단 공격의 후속 범위 미리보기는 현재 적 배치나 예상 충돌점이 아니라
      // 스킬 데이터에 정의된 최대 이동 종점에 고정한다. 실제 충돌 결과는 실행 단계가 담당한다.
      const anchor={
        ...source,
        x:(Number(source.x)||0)+Math.cos(angle)*desiredDistance,
        y:(Number(source.y)||0)+Math.sin(angle)*desiredDistance
      };
      for(const followupId of movement.onEndAttackIds){
        const followupBase=AbilityService.attackById(
          source.character,
          String(followupId)
        );
        if(!followupBase)continue;
        const followup=AugmentService.prepareAttack(
          source,
          followupBase,
          performance.now()
        );
        for(const followArea of followup.modules||[]){
          if(AttackModuleService.type(followArea)!=='delivery.area')continue;
          pushArea(followArea,0,anchor,followup,true);
        }
      }
    }

    result.length=write;
    return result;
  }
});