

const NeutralizingKnockbackService=Object.freeze({
  postDuration(source){
    const maxHealth=Math.max(
      1,
      Number(source?.maxHealth)||1
    );
    const ratio=Math.max(
      0,
      Math.min(
        1,
        (Number(source?.health)||0)/maxHealth
      )
    );

    // 무력화를 건 자신의 HP 기준:
    // 내 HP 100% = 0.5초, 내 HP 0% = 1초.
    return 500+(1-ratio)*500;
  },
  start({
    source,
    target,
    angle,
    distance,
    speed,
    execution,
    module
  }={}){
    if(!source||!target||!module)return false;

    // 같은 대상에 기존 무력화 넉백이 남아있다면
    // 이전 이동 종료 처리를 먼저 확정한다.
    if(
      target.forcedMotion?.completion?.type===
      'neutralize'
    ){
      MovementService.finalizeForcedMotion(target);
    }

    const knockbackDistance=
      Math.max(
        0,
        Number(distance)||0
      );

    const sourceId=
      `${source.id}:neutralize:${Math.max(
        0,
        Number(execution?.sequence)||0
      )}`;

    const presentationColor=
      ColorService.rgbString(
        module.presentationColor||
        '210,215,220',
        '210,215,220'
      );

    // 넉백 이동 중에는 기절과 동일하게 무력화 상태를 무기한 유지.
    CCService.add(
      target,
      'neutralize',
      Infinity,
      sourceId,
      {
        phase:'knockback',
        presentationColor,
        sourceEntityId:source.id,
        knockbackDistance
      }
    );

    const started=MovementService.knockback(
      target,
      Number(angle)||0,
      knockbackDistance,
      Math.max(.001,Number(speed)||10),
      {
        completion:{
          type:'neutralize',
          sourceId,
          sourceEntityId:source.id,
          presentationColor,
          knockbackDistance,
          postDurationFallback:
            this.postDuration(source),
          wallImpactStatus:
            module.wallImpactStatus&&
            typeof module.wallImpactStatus==='object'
              ?{
                status:String(module.wallImpactStatus.status||'stun'),
                duration:Math.max(0,Number(module.wallImpactStatus.duration)||0)
              }
              :null
        }
      }
    );

    if(!started){
      // 이동 거리가 0이어도 '넉백 종료 이후' 후속 무력화는 적용한다.
      this.finish(
        target,
        {
          completion:{
            type:'neutralize',
            sourceId,
            sourceEntityId:source.id,
            presentationColor,
            knockbackDistance,
            postDurationFallback:
              this.postDuration(source),
            wallImpactStatus:
              module.wallImpactStatus&&
              typeof module.wallImpactStatus==='object'
                ?{
                  status:String(module.wallImpactStatus.status||'stun'),
                  duration:Math.max(0,Number(module.wallImpactStatus.duration)||0)
                }
                :null
          }
        },
        performance.now()
      );
    }

    return true;
  },
  finish(target,motion,now=performance.now()){
    const completion=motion?.completion;
    if(
      !target||
      completion?.type!=='neutralize'
    ){
      return false;
    }

    const sourceId=String(
      completion.sourceId||
      'neutralize'
    );

    CCService.removeSource(
      target,
      'neutralize',
      sourceId
    );

    if(!target.alive)return true;

    const source=
      EntityService.items.get(
        String(
          completion.sourceEntityId||
          ''
        )
      )||
      null;

    const duration=
      source
        ?this.postDuration(source)
        :Math.max(
          500,
          Math.min(
            1000,
            Number(
              completion.postDurationFallback
            )||500
          )
        );

    CCService.add(
      target,
      'neutralize',
      duration,
      sourceId,
      {
        phase:'recovery',
        presentationColor:String(
          completion.presentationColor||
          '210,215,220'
        ),
        sourceEntityId:
          completion.sourceEntityId||
          null,
        knockbackDistance:
          Math.max(
            0,
            Number(
              completion.knockbackDistance
            )||0
          )
      }
    );

    if(
      motion?.blocked===true&&
      completion.wallImpactStatus&&
      typeof completion.wallImpactStatus==='object'
    ){
      const status=String(
        completion.wallImpactStatus.status||
        'stun'
      );
      const wallDuration=Math.max(
        0,
        Number(
          completion.wallImpactStatus.duration
        )||0
      );
      if(status&&wallDuration>0){
        CCService.add(
          target,
          status,
          wallDuration,
          `${sourceId}:wall-impact`,
          {
            phase:'wall-impact',
            sourceEntityId:
              completion.sourceEntityId||
              null
          }
        );
      }
    }

    return true;
  },

  followupHit({
    source,
    target,
    now=performance.now()
  }={}){
    if(
      !source||
      !target||
      !target.alive
    )return false;

    const neutralize=
      CCService.active(
        target,
        'neutralize',
        now
      );

    if(
      !neutralize||
      neutralize.data?.phase!=='recovery'
    )return false;

    const baseDistance=
      Math.max(
        0,
        Number(
          neutralize.data?.knockbackDistance
        )||0
      );
    if(baseDistance<=0)return false;

    const angle=
      Math.atan2(
        Number(target.y)-Number(source.y),
        Number(target.x)-Number(source.x)
      );

    return MovementService.knockback(
      target,
      angle,
      baseDistance*.25,
      10
    );
  }
});