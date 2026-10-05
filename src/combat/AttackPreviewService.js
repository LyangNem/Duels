

const AttackPreviewService=Object.freeze({
  delayedProjectileVolleyParts(source,attack,angle,options=null){
    if(!source||!attack?.previewProjectilePaths)return [];

    const volley=AttackModuleService.module(
      attack,
      'delivery.delayed-projectile-volley'
    );
    if(!volley)return [];
    const projectileAttackBase=
      volley.attackId
        ?AbilityService.attackById(
          source.character,
          String(volley.attackId)
        )
        :attack;
    const projectileAttack=
      projectileAttackBase===attack
        ?attack
        :AugmentService.prepareAttack(
          source,
          ProgressScaledAttackService.resolve(
            source,
            projectileAttackBase
          ),
          performance.now()
        );
    const projectile=AttackModuleService.module(
      projectileAttack,
      'delivery.projectile'
    )||AttackModuleService.module(
      projectileAttack,
      'delivery.range-projectile'
    );
    if(!projectile)return [];

    const count=Math.max(1,Math.floor(Number(volley.count)||1));
    const offsets=Array.isArray(volley.angleOffsets)
      ?volley.angleOffsets
      :null;
    const spread=Math.max(0,AttackModuleService.spread(projectileAttack));
    const baseAngle=
      String(volley.angleMode||'relative')==='absolute'
        ?Number(volley.angle)||0
        :Number(angle)||0;
    const pierce=AttackModuleService.module(
      projectileAttack,
      'projectile.pierce'
    );
    const radius=Math.max(
      1,
      Number(projectile.hitRadius)||
      Number(projectile.radius)||
      1
    );
    const wallPolicy=pierce?.walls===true?'ignore':'block';
    const wallPadding=
      ProjectileWallCollisionModeService.resolve(
        projectile,
        source
      )==='center'
        ?0
        :radius;
    const range=AttackModuleService.volleyTravelRange(source,projectileAttack,volley,options?.targetPoint);
    const parts=[];

    for(let index=0;index<count;index++){
      const explicit=
        offsets&&Number.isFinite(Number(offsets[index]))
          ?Number(offsets[index])
          :null;
      const offset=
        explicit!==null
          ?explicit
          :(count===1?0:(index/(count-1)-.5)*spread);
      const partAngle=baseAngle+offset;
      const partRange=
        wallPolicy==='block'
          ?WorldGeometryService.raycastDistance(
            Number(source.x)||0,
            Number(source.y)||0,
            partAngle,
            range,
            wallPadding
          )
          :range;
      const impactSource={...source,x:(Number(source.x)||0)+Math.cos(partAngle)*partRange,
        y:(Number(source.y)||0)+Math.sin(partAngle)*partRange};
      for(const id of AttackModuleService.module(projectileAttack,'projectile.impact')?.attackIds||[]){
        const base=AbilityService.attackById(source.character,String(id));
        if(!base)continue;
        const linked=AugmentService.prepareAttack(source,ProgressScaledAttackService.resolve(source,base),performance.now());
        parts.push(...AttackPreviewAreaService.parts(impactSource,linked,partAngle,[],{includeDeliveryAreas:true}));
      }
      if(attack.previewProjectilePaths!=='impact-only')parts.push({
        type:'projectile-path',
        angle:partAngle,
        range:partRange,
        halfWidth:radius,
        projectileRadius:radius,
        projectile:true,
        wallPolicy
      });
    }
    return parts;
  },
  fromAttack(source,attack,angle,until,reuse=null,options=null){
    const preview=(reuse&&typeof reuse==='object')?reuse:{};
    const preparedAttack=
      AugmentService.prepareAttack(
        source,
        ProgressScaledAttackService.resolve(source,attack),
        performance.now()
      );
    if(preparedAttack.previewProjectilePaths==='impact-only'){
      preview.parts=this.delayedProjectileVolleyParts(source,preparedAttack,angle,options);
      preview.type='circle';preview.range=0;preview.halfWidth=0;preview.halfAngle=0;
      preview.projectile=false;preview.angle=angle;preview.until=until;
      if(Array.isArray(preview.points))preview.points.length=0;
      return preview;
    }
    preview.parts=
      AttackPreviewAreaService.parts(
        source,
        preparedAttack,
        angle,
        preview.parts,
        options
      );
    const delayedVolleyPreviewParts=
      this.delayedProjectileVolleyParts(
        source,
        preparedAttack,
        angle,
        options
      );
    if(delayedVolleyPreviewParts.length){
      preview.parts=Array.isArray(preview.parts)?preview.parts:[];
      preview.parts.push(...delayedVolleyPreviewParts);
    }
    const rawArea=
      preparedAttack?.previewGeometry&&
      typeof preparedAttack.previewGeometry==='object'
        ?preparedAttack.previewGeometry
        :AttackModuleService.module(
          preparedAttack,
          'delivery.area'
        );
    const area=rawArea
      ?HitScanGeometryService.effectiveModule(
        source,
        preparedAttack,
        rawArea,
        angle
      )
      :null;

    const areaAngle=
      angle+
      (Number(area?.angleOffset)||0);

    preview.until=until;
    preview.angle=area?areaAngle:angle;
    preview.progress=Math.max(0,Math.min(1,Number(preparedAttack?.resolvedProgressRatio)||0));
    preview.style=preparedAttack?.charge?.preview||preparedAttack?.previewStyle||null;

    if(
      rawArea?.shape==='rect'&&
      rawArea?.steppedRewind&&
      attack?.previewStyle?.steppedRangeSpan===true
    ){
      const config=SteppedRangeRewindDeliveryService.config(rawArea);
      const liveAngle=SteppedRangeRewindDeliveryService.liveAngle(source,angle);
      const stage=SteppedRangeRewindDeliveryService.reachableStage(
        source,
        liveAngle,
        config
      );
      const firstDistance=Math.min(
        config.minDistance,
        WorldGeometryService.raycastDistance(
          Number(source.x)||0,
          Number(source.y)||0,
          liveAngle,
          config.minDistance,
          config.wallPadding
        )
      );
      const lastDesired=
        config.minDistance+
        (stage-1)*config.stepDistance;
      const lastDistance=Math.min(
        lastDesired,
        WorldGeometryService.raycastDistance(
          Number(source.x)||0,
          Number(source.y)||0,
          liveAngle,
          lastDesired,
          config.wallPadding
        )
      );
      const depth=Math.max(1,Number(rawArea.range)||1);
      const previewStart=Math.max(
        Math.max(0,Number(source.radius)||0),
        config.minDistance-depth/2
      );
      const previewEnd=Math.max(previewStart,lastDistance+depth/2);

      if(Array.isArray(preview.parts)){
        preview.parts.length=0;
      }
      preview.type='rect';
      preview.anchorX=
        Number(source.x)+
        Math.cos(liveAngle)*previewStart;
      preview.anchorY=
        Number(source.y)+
        Math.sin(liveAngle)*previewStart;
      preview.angle=liveAngle;
      preview.range=Math.max(0,previewEnd-previewStart);
      preview.halfWidth=Math.max(0,Number(rawArea.halfWidth)||0);
      preview.halfAngle=0;
      preview.endChord=false;
      preview.wallPolicy='block';
      if(Array.isArray(preview.points))preview.points.length=0;
      return preview;
    }

    if(area?.shape==='rect'){
      preview.type='rect';
      preview.range=Math.max(0,Number(area.range)||Number(preparedAttack.range)||0);
      preview.halfWidth=Math.max(0,Number(area.halfWidth)||0);
      preview.halfAngle=0;
      preview.endChord=false;
      preview.wallPolicy=area.wallPolicy;
      const perpendicularOffset=
        Number(area.perpendicularOffset)||0;
      if(perpendicularOffset!==0){
        preview.anchorX=
          (Number(source.x)||0)-
          Math.sin(areaAngle)*
          perpendicularOffset;
        preview.anchorY=
          (Number(source.y)||0)+
          Math.cos(areaAngle)*
          perpendicularOffset;
      }else{
        delete preview.anchorX;
        delete preview.anchorY;
      }
      if(Array.isArray(preview.points))preview.points.length=0;
      return preview;
    }

    if(
      area?.shape==='circle'&&
      Math.max(1,Math.floor(Number(area.repeatCount)||1))>1&&
      (
        Number.isFinite(Number(area.repeatCenterDistanceStart))||
        Number.isFinite(Number(area.repeatCenterDistanceStep))
      )
    ){
      const repeatCount=
        Math.max(
          1,
          Math.floor(Number(area.repeatCount)||1)
        );
      const startDistance=
        Number.isFinite(Number(area.repeatCenterDistanceStart))
          ?Number(area.repeatCenterDistanceStart)
          :0;
      const stepDistance=
        Number.isFinite(Number(area.repeatCenterDistanceStep))
          ?Number(area.repeatCenterDistanceStep)
          :0;
      const finalCenter=
        startDistance+
        stepDistance*
        (repeatCount-1);

      preview.type='rect';
      preview.range=
        area.repeatPathWallPolicy==='block'
          ?WorldGeometryService.raycastDistance(
            Number(source.x)||0,
            Number(source.y)||0,
            areaAngle,
            Math.max(0,finalCenter),
            0
          )
          :Math.max(
            0,
            finalCenter
          );
      preview.halfWidth=Math.max(
        0,
        Number(area.range)||0
      );
      preview.halfAngle=0;
      preview.endChord=false;
      preview.wallPolicy=area.wallPolicy;
      if(Array.isArray(preview.points))preview.points.length=0;
      return preview;
    }

    if(
      area?.shape==='circle'&&
      String(rawArea?.centerMode||'')==='live-aim-point'&&
      source===Training.player
    ){
      const point=Training.mouseWorld();
      const sx=Number(source.x)||0;
      const sy=Number(source.y)||0;
      const dx=Number(point?.x)-sx;
      const dy=Number(point?.y)-sy;
      const distance=Math.hypot(dx,dy);
      const maxRange=Math.max(0,Number(rawArea.centerMaxRange)||Number(preparedAttack?.range)||0);
      const ratio=maxRange>0&&distance>maxRange
        ?maxRange/Math.max(.001,distance)
        :1;
      let anchorX=sx+dx*ratio;
      let anchorY=sy+dy*ratio;
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
      preview.type='circle';
      preview.range=Math.max(0,Number(area.range)||0);
      preview.halfAngle=0;
      preview.halfWidth=0;
      preview.endChord=false;
      preview.wallPolicy=area.wallPolicy;
      preview.anchorX=anchorX;
      preview.anchorY=anchorY;
      const anchoredSource={...source,x:anchorX,y:anchorY};
      AreaGeometryService.polygon(
        anchoredSource,
        {...area,centerPoint:null,centerDistance:0},
        areaAngle,
        96,
        preview
      );
      return preview;
    }

    if(area?.shape==='sector'||area?.shape==='circle'){
      preview.type=area.shape;
      preview.range=Math.max(0,Number(area.range)||Number(preparedAttack.range)||0);
      preview.halfAngle=Math.max(0,Number(area.halfAngle)||0);
      preview.endChord=
        area.shape==='sector'&&
        area.endChord===true;
      preview.wallPolicy=area.wallPolicy;
      AreaGeometryService.polygon(
        source,
        area,
        areaAngle,
        96,
        preview
      );
      return preview;
    }

    const fallbackRange=Math.max(0,Number(preparedAttack?.range)||0);
    const fallbackHalfAngle=AttackModuleService.spread(preparedAttack)/2;
    const projectileModule=
      AttackModuleService.module(preparedAttack,'delivery.projectile')||
      AttackModuleService.module(preparedAttack,'delivery.range-projectile');
    const projectile=!!projectileModule;


    if(
      projectile&&
      projectileModule?.targetPoint===true&&
      preparedAttack?.previewProjectilePaths===true&&
      options?.targetPoint&&
      Number.isFinite(Number(options.targetPoint.x))&&
      Number.isFinite(Number(options.targetPoint.y))
    ){
      const sx=Number(source.x)||0;
      const sy=Number(source.y)||0;
      let tx=Number(options.targetPoint.x);
      let ty=Number(options.targetPoint.y);
      let dx=tx-sx;
      let dy=ty-sy;
      let targetDistance=Math.hypot(dx,dy);
      const maxRange=Math.max(
        0,
        Number(preparedAttack?.range)||0
      );

      if(maxRange>0&&targetDistance>maxRange){
        const ratio=maxRange/Math.max(.001,targetDistance);
        tx=sx+dx*ratio;
        ty=sy+dy*ratio;
        dx=tx-sx;
        dy=ty-sy;
        targetDistance=maxRange;
      }

      if(projectileModule.targetPointResolve==='nearest-open'){
        const openPoint=
          WorldGeometryService.nearestOpenPoint(
            tx,
            ty,
            Math.max(
              1,
              Number(projectileModule.targetPointClearance)||1
            )
          );
        if(openPoint){
          tx=Number(openPoint.x);
          ty=Number(openPoint.y);
          dx=tx-sx;
          dy=ty-sy;
          targetDistance=Math.hypot(dx,dy);
        }
      }

      const mainAngle=
        targetDistance>.001
          ?Math.atan2(dy,dx)
          :angle;
      const pierce=
        AttackModuleService.module(
          preparedAttack,
          'projectile.pierce'
        );
      const projectileRadius=Math.max(
        1,
        Number(projectileModule.hitRadius)||
        Number(projectileModule.radius)||
        1
      );
      const wallCollisionPadding=
        ProjectileWallCollisionModeService.resolve(
          projectileModule,
          source
        )==='center'
          ?0
          :projectileRadius;
      const wallPolicy=
        pierce?.walls===true||projectileModule.arrival?.passWallsInFlight===true
          ?'ignore'
          :'block';
      const mainRange=
        wallPolicy==='block'
          ?Math.min(
            targetDistance,
            WorldGeometryService.raycastDistance(
              sx,
              sy,
              mainAngle,
              targetDistance,
              wallCollisionPadding
            )
          )
          :targetDistance;
      const impactX=sx+Math.cos(mainAngle)*mainRange;
      const impactY=sy+Math.sin(mainAngle)*mainRange;

      preview.parts=
        Array.isArray(preview.parts)
          ?preview.parts
          :[];
      preview.parts.length=0;

      preview.parts.push({
        type:'projectile-path',
        angle:mainAngle,
        range:mainRange,
        halfWidth:projectileRadius,
        projectileRadius,
        projectile:true,
        wallPolicy
      });

      const impactModule=
        AttackModuleService.module(
          preparedAttack,
          'projectile.impact'
        );
      if(
        impactModule&&
        Array.isArray(impactModule.previewAttackIds||impactModule.attackIds)
      ){
        const impactSource={
          ...source,
          x:impactX,
          y:impactY
        };

        for(const linkedAttackId of (impactModule.previewAttackIds||impactModule.attackIds)){
          const linkedBase=
            AbilityService.attackById(
              source.character,
              String(linkedAttackId||'')
            );
          if(!linkedBase)continue;

          const linkedAttack=
            AugmentService.prepareAttack(
              source,
              ProgressScaledAttackService.resolve(
                source,
                linkedBase
              ),
              performance.now()
            );
          const linkedParts=
            AttackPreviewAreaService.parts(
              impactSource,
              linkedAttack,
              mainAngle,
              [],
              {
                includeDeliveryAreas:true
              }
            );
          for(const linkedPart of linkedParts){
            preview.parts.push(linkedPart);
          }
        }
      }

      preview.type='projectile-path';
      preview.angle=mainAngle;
      preview.range=mainRange;
      preview.halfWidth=projectileRadius;
      preview.projectile=true;
      preview.wallPolicy=wallPolicy;
      return preview;
    }

    const scatterModule=AttackModuleService.module(
      preparedAttack,
      'pattern.scatter'
    );
    const scatterCount=Math.max(
      1,
      Math.floor(Number(scatterModule?.count)||1)
    );
    if(
      projectile&&
      preparedAttack?.previewProjectilePaths===true
    ){
      const spread=Math.max(0,Number(scatterModule?.spread)||0);
      const pierce=AttackModuleService.module(
        preparedAttack,
        'projectile.pierce'
      );
      const projectileRadius=Math.max(
        1,
        Number(projectileModule.hitRadius)||
        Number(projectileModule.radius)||
        1
      );
      const wallCollisionPadding=
        ProjectileWallCollisionModeService.resolve(
          projectileModule,
          source
        )==='center'
          ?0
          :projectileRadius;
      const impactField=AttackModuleService.module(
        preparedAttack,
        'projectile.impact'
      )?.field;
      const previewHalfWidth=Math.max(
        projectileRadius,
        Number(impactField?.halfWidth)||0
      );
      preview.parts=Array.isArray(preview.parts)?preview.parts:[];
      preview.parts.length=0;
      const impactModule=
        AttackModuleService.module(
          preparedAttack,
          'projectile.impact'
        );
      const delayedVolley=
        AttackModuleService.module(
          preparedAttack,
          'delivery.delayed-projectile-volley'
        );
      const pelletMuzzleOffset=
        delayedVolley?.perVolleyPellets===true
          ?Math.max(
            0,
            Number(
              delayedVolley.perpendicularOffset
            )||0
          )
          :0;

      for(let index=0;index<scatterCount;index++){
        const partAngle=
          angle+
          (scatterCount<=1?0:(index/(scatterCount-1)-.5)*spread);
        const sideRatio=
          scatterCount<=1
            ?0
            :(index/(scatterCount-1))*2-1;
        const perpendicularOffset=
          pelletMuzzleOffset*sideRatio;
        const anchorX=
          Number(source.x)-
          Math.sin(partAngle)*
          perpendicularOffset;
        const anchorY=
          Number(source.y)+
          Math.cos(partAngle)*
          perpendicularOffset;
        const part={
          type:'projectile-path',
          angle:partAngle,
          halfWidth:previewHalfWidth,
          projectileRadius,
          projectile:true,
          anchorX,
          anchorY,
          wallPolicy:
            pierce?.walls===true
              ?'ignore'
              :'block'
        };
        part.range=
          part.wallPolicy==='block'
            ?WorldGeometryService.raycastDistance(
              anchorX,
              anchorY,
              partAngle,
              fallbackRange,
              wallCollisionPadding
            )
            :fallbackRange;
        if(impactModule?.previewStopAtFirstEnemy===true&&pierce?.targets!==true){
          const probe={...source,x:anchorX,y:anchorY};
          part.range=HitScanGeometryService.firstEnemyRange(probe,{range:part.range,halfWidth:projectileRadius,stopAtFirstEnemy:true},partAngle);
        }
        preview.parts.push(part);

        if(
          impactModule&&
          Array.isArray(impactModule.previewAttackIds||impactModule.attackIds)
        ){
          const impactSource={
            ...source,
            x:
              anchorX+
              Math.cos(partAngle)*part.range,
            y:
              anchorY+
              Math.sin(partAngle)*part.range
          };

          for(const linkedAttackId of (impactModule.previewAttackIds||impactModule.attackIds)){
            const linkedBase=
              AbilityService.attackById(
                source.character,
                String(linkedAttackId||'')
              );
            if(!linkedBase)continue;

            const linkedAttack=
              AugmentService.prepareAttack(
                source,
                ProgressScaledAttackService.resolve(
                  source,
                  linkedBase
                ),
                performance.now()
              );
            const linkedParts=
              AttackPreviewAreaService.parts(
                impactSource,
                linkedAttack,
                partAngle,
                [],
                {
                  includeDeliveryAreas:true
                }
              );
            for(const linkedPart of linkedParts){
              preview.parts.push(linkedPart);
            }
          }
        }
      }
      preview.type='projectile-path';
      preview.angle=angle;
      preview.range=fallbackRange;
      preview.halfWidth=previewHalfWidth;
      preview.projectile=true;
      preview.wallPolicy=
        pierce?.walls===true
          ?'ignore'
          :'block';
      return preview;
    }

    if(
      projectile&&
      fallbackHalfAngle<=1e-6
    ){
      const pierce=
        AttackModuleService.module(
          preparedAttack,
          'projectile.pierce'
        );
      const projectileRadius=Math.max(
        1,
        Number(projectileModule.hitRadius)||
        Number(projectileModule.radius)||
        1
      );
      const wallCollisionPadding=
        ProjectileWallCollisionModeService.resolve(
          projectileModule,
          source
        )==='center'
          ?0
          :projectileRadius;
      preview.type='projectile-path';
      preview.halfWidth=projectileRadius;
      preview.projectileRadius=projectileRadius;
      preview.halfAngle=0;
      preview.projectile=true;
      preview.endChord=false;
      preview.wallPolicy=
        pierce?.walls===true
          ?'ignore'
          :'block';
      preview.range=
        preview.wallPolicy==='block'
          ?WorldGeometryService.raycastDistance(
            Number(source.x)||0,
            Number(source.y)||0,
            angle,
            fallbackRange,
            wallCollisionPadding
          )
          :fallbackRange;
      if(Array.isArray(preview.points)){
        preview.points.length=0;
      }

      return preview;
    }

    const fallbackArea=preview._fallbackArea||(
      preview._fallbackArea={shape:'sector',range:0,halfAngle:0,wallPolicy:'ignore'}
    );
    fallbackArea.range=fallbackRange;
    fallbackArea.halfAngle=fallbackHalfAngle;
    fallbackArea.wallPolicy=projectile?'block':'ignore';

    preview.type='sector';
    preview.range=fallbackRange;
    preview.halfAngle=fallbackHalfAngle;
    preview.projectile=projectile;
    preview.endChord=false;
    preview.wallPolicy=fallbackArea.wallPolicy;
    AreaGeometryService.polygon(
      source,
      fallbackArea,
      angle,
      96,
      preview
    );
    return preview;
  },
  updateAim(source,angle,now=performance.now()){
    const config=source?.character?.aimPreview;
    if(!config||!source.alive){source.aimAttackPreview=null;return false;}
    const ability=source.character.abilities?.[config.input||'lmb'];
    const attack=AbilityService.resolvedInputAttack(source,ability);
    if(!attack){source.aimAttackPreview=null;return false;}
    source.aimAttackPreview=this.fromAttack(source,attack,angle,now+100,
      source.aimAttackPreview,{includeDeliveryAreas:true});
    return true;
  },
  updateLive(source,resolveAim,now=performance.now()){
    const preview=source?.attackPreview;
    const tracking=preview?.liveTracking||null;
    if(!preview||!tracking)return false;
    if(Number(preview.until)<=now){
      source.attackPreview=null;
      return false;
    }

    const attack=
      AbilityService.attackById(
        source.character,
        String(tracking.attackId||'')
      );
    if(!attack)return false;

    let angle=Number(tracking.angle)||0;
    if(tracking.aimMode==='live-source'){
      const liveAngle=Number(resolveAim?.());
      if(Number.isFinite(liveAngle))angle=liveAngle;
    }
    tracking.angle=angle;

    const previewAttack=tracking.multiClickProgress===true
      ?ProgressScaledAttackService.resolve(source,attack)
      :attack;
    source.attackPreview=this.fromAttack(
      source,
      previewAttack,
      angle,
      preview.until,
      preview,
      {includeDeliveryAreas:tracking.includeDeliveryAreas!==false}
    );
    source.attackPreview.liveTracking=tracking;
    return true;
  }
});