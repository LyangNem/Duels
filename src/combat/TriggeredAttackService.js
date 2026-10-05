

const TriggeredAttackService=Object.freeze({
  broadcast(
    source,
    spec,
    angle,
    execution
  ){
    if(
      !source||
      !spec||
      !execution||
      Training.sessionMode!=='online'||
      !OnlineDuelService.active||
      !EntitySimulationAuthorityService
        .isLocal(source)
    )return false;

    RoomService.sendGameplay({
      type:'duel-triggered-attack',
      roundToken:
        OnlineDuelService.roundToken,
      sentAt:Date.now(),
      sourceEntityId:
        String(source.id||''),
      sourceX:Number(source.x)||0,
      sourceY:Number(source.y)||0,
      angle:Number(angle)||0,
      executionSequence:
        Math.max(
          0,
          Math.floor(
            Number(execution.sequence)||0
          )
        ),
      skipWindup:
        execution.skipWindup===true,
      hitGroupSequence:execution.hitGroupSequence??null,
      targetEntityId:
        String(
          execution.targetEntityId||''
        ),
      targetPoint:
        execution.targetPoint
          ?{
            x:Number(execution.targetPoint.x)||0,
            y:Number(execution.targetPoint.y)||0
          }
          :null,
      attack:
        EffectSpawnService
          .definitionSnapshot(spec)
    });

    return true;
  },
  execute(
    source,
    spec,
    angle=0,
    {
      networkReplay=false,
      executionSequence=null,
      broadcast=true,
      targetPoint=null,
      abilityUseId=null,
      skipWindup=false,
      targetEntityId=null,
      hitGroupSequence=null
    }={}
  ){
    if(
      !source||
      !spec||
      (
        networkReplay!==true&&
        !source.alive
      )
    )return false;

    let execution=null;

    if(
      networkReplay===true&&
      Number.isFinite(
        Number(executionSequence)
      )
    ){
      execution=
        AttackExecutionService.replica(
          source,
          spec,
          Math.max(
            0,
            Math.floor(
              Number(executionSequence)||0
            )
          ),
          angle
        );
      execution.networkReplay=true;
      AttackExecutionService.remember(
        source,
        execution
      );
    }else{
      execution=
        AttackExecutionService.create(
          source,
          spec,
          angle
        );
    }

    execution.networkReplay=networkReplay===true;
    if(hitGroupSequence!==null&&Number.isFinite(Number(hitGroupSequence))){
      const parent=source._attackExecutionRegistry?.get(Math.floor(Number(hitGroupSequence)));
      AttackExecutionService.shareHits(execution,parent);
    }
    execution.abilityUseId=abilityUseId||null;
    execution.skipWindup=
      skipWindup===true;
    execution.targetEntityId=
      targetEntityId
        ?String(targetEntityId)
        :'';

    if(
      targetPoint&&
      Number.isFinite(Number(targetPoint.x))&&
      Number.isFinite(Number(targetPoint.y))
    ){
      execution.targetPoint={
        x:Number(targetPoint.x),
        y:Number(targetPoint.y)
      };
    }

    const volley={
      execution,
      total:AttackModuleService.deliveryCount(spec),
      resolved:0,
      hits:0,
      source,
      attack:spec,
      finished:false
    };

    AttackModuleService.deliver(
      source,
      spec,
      angle,
      volley
    );
    AttackModuleService.afterAttack(
      source,
      spec,
      angle,
      execution
    );

    if(
      broadcast&&
      networkReplay!==true
    ){
      this.broadcast(
        source,
        spec,
        angle,
        execution
      );
    }

    /*
      트리거 공격도 일반 AttackService.execute와 동일하게
      실제 공격 실행 완료 이벤트를 발생시킨다.
      - 로컬 소환수: 공격 스퀴시 / attack-fired 증강
      - 원격 재생 소환수: 동일 공격 스퀴시
      attack-fired의 증강 처리는 기존 listener가 local authority만 허용하므로
      원격 재생에서 게임플레이 효과가 중복되지 않는다.
    */
    GameEvents.emit(
      'attack-fired',
      {
        source,
        attack:spec,
        execution,
        angle,
        now:performance.now()
      }
    );

    return true;
  },
  receive(pid,payload){
    if(
      !OnlineDuelService.active||
      Number(payload?.roundToken)!==
        Number(
          OnlineDuelService.roundToken
        )
    )return false;

    const source=
      EntityService.items.get(
        String(
          payload.sourceEntityId||''
        )
      )||
      OnlineParticipantEntityService
        .entity(pid);

    if(!source)return false;

    const spec=
      payload.attack&&
      typeof payload.attack==='object'
        ?payload.attack
        :null;

    if(!spec)return false;

    const x=Number(payload.sourceX);
    const y=Number(payload.sourceY);

    if(Number.isFinite(x)){
      source.x=x;
      source.netCollisionX=x;
    }
    if(Number.isFinite(y)){
      source.y=y;
      source.netCollisionY=y;
    }

    const previousAlive=
      source.alive;
    const previousHidden=
      source.hidden;

    // 발동 여부는 source 권위 클라이언트가 이미 before-defeat에서 확정했다.
    // 수신 측의 원격 생존 미러는 state packet 순서에 따라 한 프레임 늦을 수 있으므로
    // 이 일회성 전투 재생에서만 source를 활성 상태로 취급한다.
    source.alive=true;
    source.hidden=false;

    const executed=this.execute(
      source,
      spec,
      Number(payload.angle)||0,
      {
        networkReplay:true,
        executionSequence:
          payload.executionSequence,
        broadcast:false,
        hitGroupSequence:payload.hitGroupSequence??null,
        skipWindup:
          payload.skipWindup===true,
        targetEntityId:
          String(
            payload.targetEntityId||''
          ),
        targetPoint:
          payload.targetPoint&&
          Number.isFinite(Number(payload.targetPoint.x))&&
          Number.isFinite(Number(payload.targetPoint.y))
            ?{
              x:Number(payload.targetPoint.x),
              y:Number(payload.targetPoint.y)
            }
            :null
      }
    );

    source.alive=previousAlive;
    source.hidden=previousHidden;

    return executed;
  }
});
