

const EntityDodgeService=Object.freeze({
  activate(entity,direction=null,{
    spend=true,
    startJustDodge=true,
    emit=true,
    sequenceContinuation=false,
    distanceOverride=null
  }={}){
    if(!entity?.alive)return false;
    if(ChannelAttackService.locksAction(entity,'dodge'))return false;
    const now=performance.now();
    const activeMovement=
      MovementAbilityService.active(entity);
    if(activeMovement)return false;
    if(
      !sequenceContinuation&&
      !AugmentDodgeSequenceService.ready(entity,now)
    )return false;
    const movement=direction||{x:0,y:0};
    let dx=Number(movement?.x)||0;
    let dy=Number(movement?.y)||0;

    const dodgeResourcePolicy=
      entity.character?.dodgeResourcePolicy||null;
    const dodgeGainMode=
      spend&&
      dodgeResourcePolicy?.mode==='gain';
    const dodgeGainSuppressed=
      dodgeGainMode&&
      entity._commandOverclock?.active===true;

    if(
      dodgeGainMode&&
      !dodgeGainSuppressed
    ){
      ResourceValueService.normalizeStamina(entity);
      const gainAmount=
        Math.max(
          0,
          Number(dodgeResourcePolicy.amount)||0
        );
      if(
        (
          (Number(entity.maxStamina)||0)-
          (Number(entity.stamina)||0)
        )<
        gainAmount-1e-6
      ){
        return false;
      }
    }

    if(
      spend&&
      !dodgeGainMode&&
      !StaminaService.spend(
        entity,
        GAME_DATA.dodge.cost,
        now
      )
    ){
      return false;
    }

    if(!sequenceContinuation){
      AugmentDodgeSequenceService.begin(entity,movement);
    }

    if(
      dodgeGainMode&&
      !dodgeGainSuppressed
    ){
      StaminaService.restore(
        entity,
        Math.max(
          0,
          Number(dodgeResourcePolicy.amount)||0
        ),
        now
      );
    }

    // 회피도 이동과 구분되는 실제 전투 행동이다.
    // 성공한 회피는 Van의 무행동 수리 대기/진행을 즉시 끊는다.
    entity.lastAbilityActionTime=now;

    entity.dodgeUntil=now+GAME_DATA.dodge.dur;

    // 회피의 피해 무시는 저스트 회피 80ms 창과 완전히 동일하다.
    // 80ms 이후에는 회피 이동 중이어도 피해를 받을 수 있다.
    const dodgeProtectionDuration=
      GAME_DATA.dodge.justWindow;
    entity.invincibleUntil=
      now+
      dodgeProtectionDuration;
    BuffService.set(
      entity,
      'invulnerable',
      1,
      'system:dodge',
      dodgeProtectionDuration,
      {presentation:{opacity:.45}}
    );

    NaturalHealthRegenActivityService.mark(
      entity,
      now
    );

    if(startJustDodge){
      JustDodgeService.begin(entity,now);
    }

    if(emit){
      GameEvents.emit('dodge-started',{
        target:entity,
        aimAngle:
          entity===Training.player
            ?Training.aimAngle()
            :0,
        movement:Object.freeze({
          x:dx,
          y:dy
        }),
        now
      });
    }

    RecordDodgePresentationService.begin(
      entity,
      now,
      {x:dx,y:dy}
    );

    AugmentDodgeSequenceService.finishSegment(
      entity,
      now
    );

    const len=Math.hypot(dx,dy);
    if(len<=.01)return true;

    const stats=CombatStatsService.current(entity,now);
    const defaultDodgeDistance=
      GAME_DATA.dodge.dist*
      stats.dodgeDistanceMult;
    const hasDistanceOverride=
      distanceOverride!==null&&
      distanceOverride!==undefined&&
      Number.isFinite(Number(distanceOverride));
    entity.dodgeDistance=
      hasDistanceOverride
        ?Math.max(
          0,
          Number(distanceOverride)
        )
        :defaultDodgeDistance;

    const tx=Math.max(
      entity.radius,
      Math.min(
        WorldBoundsService.width()-entity.radius,
        entity.x+dx/len*entity.dodgeDistance
      )
    );
    const ty=Math.max(
      entity.radius,
      Math.min(
        WorldBoundsService.height()-entity.radius,
        entity.y+dy/len*entity.dodgeDistance
      )
    );

    MovementService.startMotion(
      entity,
      tx,
      ty,
      GAME_DATA.dodge.speed*
        Math.max(.10,Number(stats.dodgeSpeedMult)||1),
      {kind:'dodge',ignoreWalls:true}
    );

    return true;
  }
});