

const OnlinePresentationSyncService={
  sequence:0,
  received:new Set(),
  entityPid(entity){
    return OnlineParticipantEntityService.pid(entity);
  },
  shouldSend(entity){
    return !!(
      Training.sessionMode==='online'&&
      OnlineDuelService.active&&
      entity&&
      EntitySimulationAuthorityService.isLocal(entity)
    );
  },
  send(kind,entity,data={}){
    if(!this.shouldSend(entity))return false;

    RoomService.sendGameplay({
      type:'duel-presentation',
      roundToken:OnlineDuelService.roundToken,
      presentationId:
        `${OnlineDuelService.localPid||'local'}:${++this.sequence}`,
      entityPid:this.entityPid(entity),
      entityId:String(entity.id||''),
      kind,
      data:{...(data||{})}
    });
    return true;
  },
  receive(pid,payload){
    if(
      !OnlineDuelService.active||
      Number(payload?.roundToken)!==Number(OnlineDuelService.roundToken)
    )return false;

    const id=String(payload.presentationId||'');
    if(id&&this.received.has(id))return false;
    if(id){
      this.received.add(id);
      if(this.received.size>512){
        this.received.delete(this.received.values().next().value);
      }
    }

    const entity=
      EntityService.items.get(
        String(payload.entityId||'')
      )||
      OnlineParticipantEntityService.entity(
        payload.entityPid
      );
    if(!entity)return false;

    const data=payload.data||{};
    if(payload.kind==='just-dodge'){
      Presentation.justDodge(entity);
      return true;
    }
    if(payload.kind==='stealth-reveal'){
      StealthPresentationService.exposeState(
        entity,
        Math.max(0,Number(data.duration)||0),
        performance.now(),
        {broadcast:false}
      );
      return true;
    }
    if(payload.kind==='health-restored'){
      const amount=Math.max(0,Number(data.amount)||0);
      if(amount>0){
        const stealthVisual=StealthPresentationService.state(
          Training.player,
          entity,
          performance.now()
        );
        if(stealthVisual.hostile&&!stealthVisual.detected){
          return true;
        }
        Presentation.healPulse(entity,String(data.presentation||'default'));
        Presentation.healNumber(entity,amount);
      }
      return true;
    }
    if(payload.kind==='field-point-spawn'){
      const module=data.module;
      const point=data.point;
      if(
        !module||typeof module!=='object'||
        !point||
        !Number.isFinite(Number(point.x))||
        !Number.isFinite(Number(point.y))
      )return false;
      const attackId=String(data.attackId||'');
      const baseAttack=attackId
        ?AbilityService.attackById(entity.character,attackId)
        :null;
      const attack=baseAttack
        ?AugmentService.prepareAttack(
          entity,
          baseAttack,
          performance.now()
        )
        :null;
      const executionSequence=Math.max(
        0,
        Math.floor(Number(data.executionSequence)||0)
      );
      const execution=executionSequence>0
        ?AttackExecutionService.bySequence(
          entity,
          executionSequence,
          attack,
          Number(data.executionDirectionAngle)||0
        )
        :null;
      return !!InstalledAreaFieldService.activatePoint(
        entity,
        module,
        {x:Number(point.x),y:Number(point.y)},
        {
          attack,
          execution,
          instanceId:String(data.instanceId||''),
          preserveState:data.preserveState===true,
          interpolatePresentation:true,
          now:performance.now()
        }
      );
    }
    if(payload.kind==='effect-spawn'){
      const effect=data.effect;
      if(!effect||typeof effect!=='object')return false;

      const restored=
        EffectSpawnService.restorePresentationSnapshot(
          effect,
          performance.now()
        );

      EffectSpawnService.spawn(
        {
          ...restored,
          sourceEntityId:entity.id
        },
        {source:entity}
      );
      return true;
    }

    if(payload.kind==='wall-contact'){
      EntitySquashPresentationService.wallContact(
        entity,
        Number(data.angle)||0,
        {
          broadcast:false,
          targetPid:payload.entityPid
        },
        performance.now()
      );
      return true;
    }
    if(payload.kind==='hit-contact'){
      /*
        피격자 본인은 damage-applied에서 이미 로컬 스퀴시를 적용한다.
        그 외 모든 클라이언트(공격자/관전자)는 동일한 hit-contact
        프레젠테이션 경로를 사용한다.
      */
      if(
        String(payload.entityPid||'')===
        String(OnlineDuelService.localPid||'')
      )return true;

      const sourceEntity=
        EntityService.items.get(
          String(data.sourceEntityId||'')
        )||
        OnlineParticipantEntityService.entity(
          data.sourcePid
        );
      const impactPoint=data.impactPoint&&
        Number.isFinite(Number(data.impactPoint.x))&&
        Number.isFinite(Number(data.impactPoint.y))
          ?{
            x:Number(data.impactPoint.x),
            y:Number(data.impactPoint.y)
          }
          :null;
      const impactType=String(data.impactType||'');
      const squashOrigin=
        (
          impactType==='projectile'||
          impactType==='field-segment'
        )&&impactPoint
          ?impactPoint
          :sourceEntity;
      const amount=Math.max(0,Number(data.amount)||0);
      if(amount<=0)return false;
      const presentationAmount=
        data.strongPresentation===true
          ?Math.max(
            amount,
            GAME_DATA.cameraFeedback.strongDamage
          )
          :amount;

      EntitySquashPresentationService.impact(
        entity,
        presentationAmount,
        squashOrigin,
        {
          targetPid:payload.entityPid,
          directionless:false
        },
        performance.now()
      );
      return true;
    }
    if(payload.kind==='status-damage'){
      const source=
        OnlineParticipantEntityService.entity(
          data.sourcePid
        );
      const amount=Math.max(0,Number(data.amount)||0);
      EntitySquashPresentationService.impact(
        entity,
        amount,
        source,
        {
          targetPid:payload.entityPid,
          directionless:true
        }
      );
      Presentation.damageNumber(entity,amount);
      SoundService.play('hit');
      return true;
    }
    if(payload.kind==='status-defeat'){
      // 구버전 호환 패킷은 실제 라운드 사망 확정이 아니므로
      // K.O. 레이저를 재생하지 않는다.
      return false;
    }
    return false;
  },
  reset(){
    this.sequence=0;
    this.received.clear();
  }
};