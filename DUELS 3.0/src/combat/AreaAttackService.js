

/* 공격 */
/* 범위 공격 */
const AreaAttackService=Object.freeze({
  canApplyHitEffects(target){
    return (
      Training.sessionMode!=='online'||
      NetworkHitAuthorityService
        .targetAuthoritative(target)
    );
  },
  containsPoint(module,source,x,y,radius,angle,geometry=null){
    radius=
      Math.max(0,Number(radius)||0)+
      Math.max(0,Number(module?.contactPadding)||0);

    /*
      circle/sector는 wall-clipped polygon 하나에만 적중을 맡기지 않는다.
      벽 경계에 붙어 있거나 넓은 부채꼴에서 ray polygon이 일부 퇴화하면
      실제 공격 범위 안의 대상도 통째로 놓칠 수 있다. 먼저 벽을 무시한
      원래 공격 geometry와 대상 원의 교차를 확정하고, wallPolicy:block일 때만
      대상 원에서 실제로 보이는 접촉점이 하나라도 있는지 별도로 검사한다.
      이렇게 판정 geometry와 벽 가시성의 책임을 분리한다.
    */
    if(module?.shape==='circle'||module?.shape==='sector'){
      const idealModule=
        module.wallPolicy==='block'
          ?{...module,wallPolicy:'ignore'}
          :module;
      const idealGeometry=AreaGeometryService.polygon(
        source,
        idealModule,
        angle
      );

      if(!AreaGeometryService.overlaps(
        source,
        idealModule,
        angle,
        x,
        y,
        radius,
        idealGeometry
      ))return false;

      const innerRange=Math.max(0,Number(module.innerRange)||0);
      if(innerRange>0){
        const center=AreaGeometryService.center(source,module,angle);
        const radialDistance=Math.hypot(
          (Number(x)||0)-(Number(center.x)||0),
          (Number(y)||0)-(Number(center.y)||0)
        );
        if(radialDistance+radius<innerRange)return false;
      }

      if(module.wallPolicy!=='block')return true;

      const origin=
        module.shape==='circle'
          ?AreaGeometryService.center(source,module,angle)
          :{x:Number(source.x)||0,y:Number(source.y)||0};
      const visible=(px,py)=>
        !WorldGeometryService.segmentBlocked(
          Number(origin.x)||0,
          Number(origin.y)||0,
          Number(px)||0,
          Number(py)||0,
          0
        );

      if(visible(x,y))return true;

      if(radius>0){
        const dx=(Number(x)||0)-(Number(origin.x)||0);
        const dy=(Number(y)||0)-(Number(origin.y)||0);
        const distance=Math.hypot(dx,dy);
        if(distance>1e-6){
          const contactX=(Number(x)||0)-dx/distance*radius;
          const contactY=(Number(y)||0)-dy/distance*radius;
          if(
            AreaGeometryService.pointInPolygon(
              contactX,
              contactY,
              idealGeometry.points
            )&&
            visible(contactX,contactY)
          )return true;
        }

        for(let index=0;index<16;index++){
          const sampleAngle=index/16*Math.PI*2;
          const sampleX=(Number(x)||0)+Math.cos(sampleAngle)*radius;
          const sampleY=(Number(y)||0)+Math.sin(sampleAngle)*radius;
          if(
            AreaGeometryService.pointInPolygon(
              sampleX,
              sampleY,
              idealGeometry.points
            )&&
            visible(sampleX,sampleY)
          )return true;
        }
      }

      return false;
    }

    const dx=x-source.x;
    const dy=y-source.y;
    const cos=Math.cos(angle);
    const sin=Math.sin(angle);
    const forward=dx*cos+dy*sin;
    const lateral=Math.abs(-dx*sin+dy*cos);
    const range=Math.max(0,Number(module.range)||0);
    const innerRange=Math.max(0,Number(module.innerRange)||0);
    if(
      innerRange>0&&
      (module.shape==='circle'||module.shape==='sector')
    ){
      const center=module.centerPoint&&Number.isFinite(Number(module.centerPoint.x))&&Number.isFinite(Number(module.centerPoint.y))
        ?module.centerPoint
        :source;
      const radialDistance=Math.hypot(
        (Number(x)||0)-(Number(center.x)||0),
        (Number(y)||0)-(Number(center.y)||0)
      );
      if(radialDistance+Math.max(0,Number(radius)||0)<innerRange)return false;
    }

    if(module.shape==='tapered-rect'){
      const targetRadius=
        Math.max(
          0,
          Number(radius)||0
        );
      const startHalfWidth=
        Math.max(
          0,
          Number(module.startHalfWidth)||
          Number(module.halfWidth)||
          0
        );
      const endHalfWidth=
        Math.max(
          0,
          Number(module.endHalfWidth)||0
        );

      if(
        forward<
          -targetRadius||
        forward>
          range+
          targetRadius
      ){
        return false;
      }

      const ratio=Math.max(
        0,
        Math.min(
          1,
          range>0
            ?forward/range
            :1
        )
      );
      const halfWidth=
        startHalfWidth+
        (
          endHalfWidth-
          startHalfWidth
        )*
        ratio;

      if(
        lateral>
        halfWidth+
          targetRadius
      ){
        return false;
      }

      return AreaGeometryService.overlaps(
        source,
        module,
        angle,
        x,
        y,
        targetRadius,
        geometry
      );
    }

    if(module.shape==='rect'){
      /*
        wallPolicy:'block' 범위공격은 execute() 단계에서 이미 effectiveModule/
        wall-clipped geometry로 사거리가 잘려 있다. 여기서 대상 '중심점'까지의
        segmentBlocked를 다시 검사하면 대상의 충돌원이 유효 범위에 걸쳐 있어도
        중심이 벽/모서리 뒤라는 이유만으로 적중 전체가 취소된다.
        실제 판정은 아래의 대상 원 ↔ 최종 공격 geometry 교차만 사용한다.
      */
      const halfWidth=
        Math.max(
          0,
          Number(module.halfWidth)||0
        );
      const targetRadius=
        Math.max(
          0,
          Number(radius)||0
        );
      const centered=
        String(module.rectCenterMode||'')==='center';
      const centerDistance=
        centered
          ?Math.max(0,Number(module.centerDistance)||0)
          :0;
      const rectStart=
        centered
          ?centerDistance-range/2
          :0;
      const rectEnd=
        centered
          ?centerDistance+range/2
          :range;

      // 대상 원과 실제 사각 히트스캔의 최소 거리로 판정한다.
      // rectCenterMode:'center'는 centerDistance를 사각형 중앙으로 사용한다.
      const nearestForward=
        Math.max(
          rectStart,
          Math.min(rectEnd,forward)
        );
      const signedLateral=
        -dx*sin+dy*cos;
      const nearestLateral=
        Math.max(
          -halfWidth,
          Math.min(
            halfWidth,
            signedLateral
          )
        );

      const diffForward=
        forward-nearestForward;
      const diffLateral=
        signedLateral-nearestLateral;

      return (
        diffForward*diffForward+
        diffLateral*diffLateral
      )<=targetRadius*targetRadius;
    }

    return false;
  },
  execute(
    source,
    spec,
    angle,
    module,
    volley,
    {
      geometrySource=null
    }={}
  ){
    const resolvedModule=module;
    const networkGeometryOrigin=
      !EntitySimulationAuthorityService.isLocal(source)&&
      (
        resolvedModule?.useNetworkCollisionOrigin===true||
        (
          resolvedModule?.useNetworkCollisionOrigin!==false&&
          String(resolvedModule?.contactType||'')==='melee'
        )
      )
        ?NetworkCollisionPositionService.point(source)
        :null;
    const baseGeometryOrigin=
      geometrySource&&
      Number.isFinite(Number(geometrySource.x))&&
      Number.isFinite(Number(geometrySource.y))
        ?{
          x:Number(geometrySource.x),
          y:Number(geometrySource.y)
        }
        :networkGeometryOrigin
          ?{
            ...source,
            x:Number(networkGeometryOrigin.x)||0,
            y:Number(networkGeometryOrigin.y)||0
          }
          :source;
    const perpendicularOffset=
      Number(resolvedModule?.perpendicularOffset)||0;
    const geometryOrigin=
      perpendicularOffset!==0
        ?{
          ...baseGeometryOrigin,
          x:
            (Number(baseGeometryOrigin.x)||0)-
            Math.sin(Number(angle)||0)*
            perpendicularOffset,
          y:
            (Number(baseGeometryOrigin.y)||0)+
            Math.cos(Number(angle)||0)*
            perpendicularOffset
        }
        :baseGeometryOrigin;

    // delivery.area 실행자는 angleOffset을 포함한 최종 판정각을 전달한다.
    // AreaAttackService에서 다시 더하면 실제 판정만 두 번 기울어지므로 여기서는 전달 각도를 그대로 사용한다.
    const resolvedAngle=Number(angle)||0;

    let collisionModule=
      resolvedModule;

    if(
      resolvedModule?.stopAtFirstEnemy===true&&
      resolvedModule?.shape==='rect'
    ){
      const range=
        Math.max(
          0,
          Number(resolvedModule.range)||0
        );
      const halfWidth=
        Math.max(
          0,
          Number(resolvedModule.halfWidth)||0
        );
      const cos=
        Math.cos(Number(angle)||0);
      const sin=
        Math.sin(Number(angle)||0);
      let stopRange=range;

      for(const target of EntityService.items.values()){
        if(
          !target?.alive||
          target.hidden||
          RelationService.relation(
            source,
            target
          )!=='enemy'
        )continue;

        const point=
          NetworkCollisionPositionService.point(
            target
          );
        const dx=
          Number(point.x)-
          Number(geometryOrigin.x);
        const dy=
          Number(point.y)-
          Number(geometryOrigin.y);
        const forward=
          dx*cos+
          dy*sin;
        const lateral=
          Math.abs(
            -dx*sin+
            dy*cos
          );
        const radius=
          Math.max(
            0,
            Number(target.radius)||0
          );

        if(
          forward<0||
          forward>range||
          lateral>
            halfWidth+
            radius
        )continue;

        stopRange=
          Math.min(
            stopRange,
            Math.max(
              0,
              forward
            )
          );
      }

      if(stopRange<range){
        collisionModule={
          ...resolvedModule,
          range:stopRange
        };
      }
    }

    const effectiveModule=
      collisionModule.shape==='circle'
        ?collisionModule
        :(
          collisionModule.shape==='rect'&&
          String(collisionModule.rectCenterMode||'')==='center'
            ?{
              ...collisionModule,
              centerDistance:
                String(collisionModule.wallPolicy||'ignore')==='block'
                  ?WorldGeometryService.raycastDistance(
                    Number(source.x)||0,
                    Number(source.y)||0,
                    resolvedAngle,
                    Math.max(0,Number(collisionModule.centerDistance)||0),
                    2
                  )
                  :Math.max(0,Number(collisionModule.centerDistance)||0)
            }
            :HitScanGeometryService
              .effectiveModule(
                source,
                spec,
                collisionModule,
                resolvedAngle
              )
        );

    const areaGeometry=
      effectiveModule.shape==='circle'||
      effectiveModule.shape==='sector'||
      effectiveModule.shape==='tapered-rect'
        ?AreaGeometryService.polygon(
          geometryOrigin,
          effectiveModule,
          resolvedAngle
        )
        :null;

    GameEvents.emit('area-attack-fired',{
      source,
      attack:spec,
      angle:resolvedAngle,
      module:effectiveModule,
      center:areaGeometry?.center||null,
      polygon:areaGeometry?.points||null,
      now:performance.now()
    });

    const targetRelations=
      Array.isArray(effectiveModule.targetRelations)
        ?effectiveModule.targetRelations
        :['enemy'];

    for(const target of EntityService.items.values()){
      if(
        !target?.alive||
        target.hidden
      )continue;

      if(
        Array.isArray(
          effectiveModule.targetKinds
        )&&
        !effectiveModule.targetKinds.includes(
          target.kind
        )
      )continue;

      const sourceOwner=
        EntityService.owner(source);
      const targetOwner=
        EntityService.owner(target);

      if(
        effectiveModule.ownerScope==='source'&&
        targetOwner!==sourceOwner
      )continue;

      if(
        effectiveModule.ownerScope==='other-owner'&&
        targetOwner===sourceOwner
      )continue;

      const relation=
        RelationService.relation(
          source,
          target
        );
      if(!targetRelations.includes(relation))continue;

      const enemyTarget=relation==='enemy';
      const check=target.justCheck;

      if(
        enemyTarget&&
        check&&
        !target.justDodgeConsumed&&
        performance.now()<=check.expiresAt&&
        JustDodgeService.confirmArea(
          target,
          source,
          effectiveModule,
          resolvedAngle,
          (
            moduleValue,
            sourceValue,
            x,
            y,
            radius,
            angleValue
          )=>this.containsPoint(
            moduleValue,
            geometryOrigin,
            x,
            y,
            radius,
            angleValue,
            areaGeometry
          ),
          performance.now()
        )
      ){
        continue;
      }

      const collisionPoint=
        NetworkCollisionPositionService.point(
          target
        );

      if(!this.containsPoint(
        effectiveModule,
        geometryOrigin,
        collisionPoint.x,
        collisionPoint.y,
        target.radius,
        resolvedAngle,
        areaGeometry
      ))continue;

      if(spec.effectsOnly===true){
        if(
          !this.canApplyHitEffects(
            target
          )
        )continue;

        AttackModuleService.onHit(
          source,
          target,
          spec,
          volley,
          resolvedAngle,
          effectiveModule
        );
        volley.hits++;
        continue;
      }

      // 회복+공격처럼 하나의 AttackSpec에서 관계별 효과가 필요한 경우,
      // 비적대 대상은 피해를 주지 않고 명시적으로 onHit 효과만 실행한다.
      if(!enemyTarget){
        const targetAuthoritative=this.canApplyHitEffects(target);
        if(
          effectiveModule.applyHitEffects===true&&
          !targetAuthoritative&&
          EntitySimulationAuthorityService.isLocal(source)
        ){
          AttackModuleService.applyFriendlySourceOnHitModifiers(
            source,
            target,
            spec,
            volley?.execution||null,
            resolvedAngle
          );
        }
        if(
          effectiveModule.applyHitEffects===true&&
          targetAuthoritative
        ){
          AttackModuleService.onHit(
            source,
            target,
            spec,
            volley,
            angle,
            effectiveModule
          );
          SoundService.play('hit');
          volley.hits++;
        }
        continue;
      }

      const result=AttackHitTriggerService.damage({
        source,
        target,
        attack:spec,
        execution:volley?.execution||null,
        impact:{
          type:'area',
          shape:module.shape,
          suppressHitImpactRing:
            effectiveModule.suppressHitImpactRing===true,
          directionAngle:Number(resolvedAngle)||0,
          origin:areaGeometry?.center
            ?{
              x:areaGeometry.center.x,
              y:areaGeometry.center.y
            }
            :null,
          point:
            module.shape==='circle'&&areaGeometry?.center
              ?{
                x:areaGeometry.center.x,
                y:areaGeometry.center.y
              }
              :{
                x:collisionPoint.x,
                y:collisionPoint.y
              }
        }
      });

      if(
        result.hit&&
        result.authoritative!==false&&
        !result.duplicateExecutionHit
      ){
        AttackModuleService.onHit(
          source,
          target,
          spec,
          volley,
          resolvedAngle,
          effectiveModule
        );
        volley.hits++;
      }
    }

    AttackModuleService.onDeliveryResolved(
      source,
      spec,
      resolvedAngle,
      volley?.execution||null,
      module
    );
    volley.resolved=volley.total;
    volley.finished=true;
  }
});