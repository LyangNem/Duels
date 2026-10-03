

/* 충격 방향 */
const ImpactDirectionService=Object.freeze({
  point(x,y){
    return Number.isFinite(x)&&Number.isFinite(y)?{x,y}:null;
  },
  entityCenter(entity){
    return entity&&Number.isFinite(entity.x)&&Number.isFinite(entity.y)
      ?{x:entity.x,y:entity.y}
      :null;
  },
  descriptor(execution,impact){
    return execution?.koOrigin||
      execution?.impactOrigin||
      impact?.originDescriptor||
      null;
  },
  isWeaponProjectile(execution){
    return (execution?.attack?.modules||[]).some(module=>
      module&&
      typeof module==='object'&&
      module.type==='projectile.presentation'&&
      module.kind==='weapon-projectile'
    );
  },
  usesAreaCenter(execution,impact){
    return (impact?.type==='area'||impact?.type==='field-area')&&impact?.shape==='circle';
  },
  squashOrigin(source,impact){
    // 피격 스퀴시는 K.O. 중심 규칙과 분리한다.
    // 투사체는 실제 충돌한 투사체 중심에서 눌려야 하므로 impact.point를 우선한다.
    if(
      impact?.type==='projectile'||
      impact?.type==='field-segment'||
      impact?.type==='field-area'||
      impact?.type==='area'
    ){
      const point=
        this.point(
          impact?.origin?.x,
          impact?.origin?.y
        )||
        this.point(
          impact?.point?.x,
          impact?.point?.y
        );
      if(point)return point;
    }
    return this.entityCenter(source);
  },
  resolveOrigin({source,target,execution,impact}){
    const descriptor=this.descriptor(execution,impact);

    if(descriptor){
      if(descriptor.mode==='point'){
        const point=this.point(descriptor.x,descriptor.y);
        if(point)return point;
      }

      if(descriptor.mode==='entity'){
        const center=this.entityCenter(descriptor.entity);
        if(center)return center;
      }

      if(descriptor.mode==='impact-point'){
        const point=this.point(impact?.point?.x,impact?.point?.y);
        if(point)return point;
      }

      if(descriptor.mode==='impact-origin'){
        const point=this.point(impact?.origin?.x,impact?.origin?.y);
        if(point)return point;
      }

      if(descriptor.mode==='source'){
        const center=this.entityCenter(source);
        if(center)return center;
      }
    }

    // 명시된 실제 발생 중심이 있으면 source보다 우선한다.
    const impactOrigin=this.point(
      impact?.origin?.x,
      impact?.origin?.y
    );
    if(impactOrigin)return impactOrigin;

    const impactPoint=this.point(
      impact?.point?.x,
      impact?.point?.y
    );
    if(impactPoint)return impactPoint;

    // 별도 발생 중심이 없는 일반 공격만 공격자 중심을 사용한다.
    const sourceCenter=this.entityCenter(source);
    if(sourceCenter)return sourceCenter;

    // 어떤 기준점도 없다면 사망 대상 바로 아래의 가상점을 사용.
    return {
      x:target.x,
      y:target.y+1
    };
  },
  resolve({source,target,execution,impact}){
    const descriptor=this.descriptor(execution,impact);

    if(
      execution?.koDirectionMode==='attack-direction'&&
      Number.isFinite(execution?.directionAngle)
    ){
      const angle=Number(execution.directionAngle);
      return {
        origin:{
          x:target.x-Math.cos(angle),
          y:target.y-Math.sin(angle)
        },
        target:{
          x:target.x,
          y:target.y
        },
        angle
      };
    }

    // 명시적으로 source K.O. 원점을 요청한 공격은 투사체 접촉점보다 공격자 본체를 우선한다.
    if(descriptor?.mode==='source'){
      const origin=this.entityCenter(source);
      if(origin){
        return {
          origin,
          target:{x:target.x,y:target.y},
          angle:Math.atan2(
            target.y-origin.y,
            target.x-origin.x
          )
        };
      }
    }

    // 무기 투사체는 플레이어 본체가 아니라 실제 충돌한 투사체를 공격 중심으로 사용한다.
    // 충돌 순간 투사체의 진행 각도를 보존해, 투사체 중심이 대상 중심과 거의 겹쳐도
    // K.O. 레이저의 연함/진함 방향이 실제 타격 방향과 일치한다.
    if(
      impact?.type==='projectile'
    ){
      const projectileAngle=
        Number(impact?.angle);
      const projectilePoint=
        this.point(
          impact?.point?.x,
          impact?.point?.y
        );

      if(Number.isFinite(projectileAngle)){
        return {
          origin:
            projectilePoint||
            {
              x:
                target.x-
                Math.cos(projectileAngle),
              y:
                target.y-
                Math.sin(projectileAngle)
            },
          target:{
            x:target.x,
            y:target.y
          },
          angle:projectileAngle
        };
      }
    }

    if(this.isWeaponProjectile(execution)){
      const projectilePoint=this.point(
        impact?.point?.x,
        impact?.point?.y
      );
      const projectileAngle=Number(impact?.angle);
      if(Number.isFinite(projectileAngle)){
        const origin=projectilePoint||{
          x:target.x-Math.cos(projectileAngle),
          y:target.y-Math.sin(projectileAngle)
        };
        return {
          origin,
          target:{x:target.x,y:target.y},
          angle:projectileAngle
        };
      }
      if(projectilePoint){
        return {
          origin:projectilePoint,
          target:{x:target.x,y:target.y},
          angle:Math.atan2(
            target.y-projectilePoint.y,
            target.x-projectilePoint.x
          )
        };
      }
    }

    if(impact?.type==='field-segment'){
      const origin=this.point(
        impact?.origin?.x,
        impact?.origin?.y
      )||this.point(
        impact?.point?.x,
        impact?.point?.y
      );
      if(origin){
        return {
          origin,
          target:{x:target.x,y:target.y},
          angle:Math.atan2(
            target.y-origin.y,
            target.x-origin.x
          )
        };
      }
    }

    // 원형 공격의 공격 중심은 실제 delivery.area 중심이다.
    // source-centered 원은 impact.origin 자체가 source 좌표이고,
    // projectile impact 원은 착탄점이 들어오므로 두 경우를 같은 규칙으로 처리한다.
    if(this.usesAreaCenter(execution,impact)){
      const origin=
        this.point(
          impact?.origin?.x,
          impact?.origin?.y
        )||
        this.point(
          impact?.point?.x,
          impact?.point?.y
        )||
        this.resolveOrigin({
          source,
          target,
          execution,
          impact
        });

      if(origin){
        return {
          origin,
          target:{x:target.x,y:target.y},
          angle:Math.atan2(
            target.y-origin.y,
            target.x-origin.x
          )
        };
      }
    }

    if(
      (
        descriptor?.mode==='attack-direction'||
        !descriptor
      )&&
      Number.isFinite(execution?.directionAngle)
    ){
      const angle=execution.directionAngle;

      return {
        origin:{
          x:target.x-Math.cos(angle),
          y:target.y-Math.sin(angle)
        },
        target:{x:target.x,y:target.y},
        angle
      };
    }

    const origin=this.resolveOrigin({
      source,
      target,
      execution,
      impact
    });

    return {
      origin,
      target:{x:target.x,y:target.y},
      angle:Math.atan2(
        target.y-origin.y,
        target.x-origin.x
      )
    };
  }
});