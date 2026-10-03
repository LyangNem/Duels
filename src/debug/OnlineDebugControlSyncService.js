

const OnlineDebugControlSyncService={
  sequence:0,
  received:new Set(),
  isOnline(){
    return !!(
      Training.sessionMode==='online'&&
      OnlineDuelService.active
    );
  },
  targetId(target){
    return target?.id||null;
  },
  resolveTarget(targetId){
    if(!targetId)return null;
    return EntityService.items.get(String(targetId))||null;
  },
  globalCommands:new Set(),
  isGlobalCommand(command){
    return this.globalCommands.has(String(command||''));
  },
  send(command,target,data={}){
    if(!this.isOnline())return false;

    const globalCommand=this.isGlobalCommand(command);
    const targetId=globalCommand
      ?null
      :this.targetId(target);
    if(!globalCommand&&!targetId)return false;

    RoomService.sendGameplay({
      type:'duel-debug-control',
      roundToken:OnlineDuelService.roundToken,
      debugSequence:++this.sequence,
      targetId,
      targetPid:
        globalCommand
          ?null
          :this.participantPid(target),
      command,
      data:{...(data||{})}
    });
    return true;
  },
  createDummyFromSpec(spec={}){
    const id=String(spec.id||'');
    if(!id)return null;

    const existing=EntityService.items.get(id);
    if(existing)return existing;

    const dummy=EntityService.create({
      id,
      kind:'dummy',
      ownerId:id,
      teamId:id,
      simulationAuthorityPid:
        String(
          spec.simulationAuthorityPid||
          ''
        )||null,
      x:Number(spec.x)||WorldBoundsService.width()*.5,
      y:Number(spec.y)||WorldBoundsService.height()*.5,
      radius:Math.max(1,Number(spec.radius)||20),
      color:String(spec.color||'#888'),
      maxHealth:Math.max(1,Number(spec.maxHealth)||10000),
      maxStamina:Math.max(
        0,
        Number(spec.maxStamina)||GAME_DATA.stamina.max
      ),
      stamina:Math.max(
        0,
        Number(spec.stamina)||GAME_DATA.stamina.max
      ),
      healthPolicy:{
        minimum:Number(spec.minimumHealth)||0
      },
      deathPolicy:{respawnMs:3000}
    });

    dummy.alive=true;
    dummy.hidden=false;
    Training.dummies.push(dummy);

    if(!Training.dummy){
      Training.dummy=dummy;
    }

    return dummy;
  },
  spawnDummy(){
    const dummy=DebugControlService.spawnDummy();
    if(!dummy)return null;

    if(this.isOnline()){
      this.send(
        'dummy-spawn',
        Training.player,
        {
          id:dummy.id,
          x:dummy.x,
          y:dummy.y,
          radius:dummy.radius,
          color:dummy.color,
          maxHealth:dummy.maxHealth,
          maxStamina:dummy.maxStamina,
          stamina:dummy.stamina,
          minimumHealth:
            dummy.healthPolicy?.minimum||0,
          simulationAuthorityPid:
            dummy.simulationAuthorityPid
        }
      );
    }

    return dummy;
  },
  removeNearestDummy(origin=Training.player){
    const dummy=DebugControlService.nearestDummy(origin);
    if(!dummy)return false;

    const id=dummy.id;
    DebugControlService.removeNearestDummy(origin);

    if(this.isOnline()){
      this.send(
        'dummy-remove',
        Training.player,
        {id}
      );
    }

    return true;
  },
  shouldApplyLocally(target,command){
    if(!this.isOnline())return true;
    if(!target)return false;

    // 강제 행동과 처치는 실제 소유자 한 곳에서만 실행해야
    // 공격/사망 이벤트가 중복되지 않는다.
    if(
      command==='force-action'||
      command==='kill'||
      command==='augment-acquire'||
      command==='augment-remove'
    ){
      return EntitySimulationAuthorityService.isLocal(target);
    }
    return true;
  },
  participantPid(target){
    const owner=
      AugmentService.owner(target)||
      target;

    return (
      OnlineParticipantEntityService.pid(
        owner
      )||
      OnlineParticipantEntityService.pid(
        target
      )||
      null
    );
  },
  persistCharacter(target,characterId){
    if(!this.isOnline())return false;

    const pid=this.participantPid(target);
    const id=String(characterId||'');

    if(
      !pid||
      !RoomService.activeMatchPids.has(pid)||
      !GAME_DATA.characters[id]
    )return false;

    RoomService.duelSelections.set(
      pid,
      id
    );

    /*
      라운드 준비 중 이미 준비 완료한 캐릭터 선택이 있으면
      countdown 마지막에 그 값이 다시 덮어쓰므로 debug 변경값으로 함께 갱신한다.
    */
    const between=
      RoomService.betweenSelections.get(pid);

    if(between){
      RoomService.betweenSelections.set(
        pid,
        {
          ...between,
          characterId:id,
          resolvedCharacterId:id
        }
      );
    }

    return true;
  },
  persistAugments(target){
    if(!this.isOnline())return false;

    const owner=
      AugmentService.owner(target)||
      target;
    const pid=this.participantPid(owner);

    if(
      !pid||
      !RoomService.activeMatchPids.has(pid)
    )return false;

    const ids=[
      ...(owner.augments||[])
    ].filter(id=>
      !!AugmentDataService.get(id)
    );

    RoomService.matchAugments.set(
      pid,
      ids
    );

    return true;
  },
  perform(command,target,data={},{
    broadcast=true,
    fromNetwork=false
  }={}){
    const globalCommand=this.isGlobalCommand(command);
    if(!globalCommand&&!target)return false;

    let result=false;

    if(globalCommand){
      result=this.applyLocal(command,null,data);
    }else if(this.shouldApplyLocally(target,command)){
      result=this.applyLocal(command,target,data);
    }else{
      result=true;
    }

    if(
      broadcast&&
      this.isOnline()&&
      !fromNetwork
    ){
      const inventoryCommand=
        command==='augment-acquire'||
        command==='augment-remove';
      const localAuthority=
        globalCommand
          ?false
          :EntitySimulationAuthorityService.isLocal(
            target
          );

      if(
        !inventoryCommand||
        !localAuthority
      ){
        this.send(command,target,data);
      }
    }

    return result;
  },
  applyLocal(command,target,data={}){
    switch(command){
      case 'character':{
        const id=String(data.characterId||'');
        const changed=
          DebugManipulationService.setCharacter(
            target,
            id
          );
        if(changed){
          this.persistCharacter(
            target,
            id
          );

          if(target===Training.player){
            Training.selectedCharacterId=id;
          }

          Training.renderAugHud();
        }
        return changed;
      }

      case 'augment-acquire':{
        const augment=
          AugmentDataService.get(data.augmentId);
        if(!augment)return false;
        const changed=
          AugmentService.acquire(
            target,
            augment
          );

        if(changed){
          this.persistAugments(target);
          Training.renderAugHud();
        }

        return changed;
      }

      case 'augment-remove':{
        const augment=
          AugmentDataService.get(data.augmentId);
        if(!augment)return false;
        const changed=
          AugmentService.remove(
            target,
            augment
          );

        if(changed){
          this.persistAugments(target);
          Training.renderAugHud();
        }

        return changed;
      }

      case 'flag':{
        const key=String(data.key||'');
        const desired=data.value===true;
        const current=DebugControlService.flag(
          target,
          key
        );
        if(current===desired)return desired;
        DebugControlService.toggleFlag(target,key);
        return desired;
      }

      case 'health-set':{
        const min=
          target.debugControl?.healthInfinite
            ?1
            :0;
        target.health=Math.max(
          min,
          Math.min(
            target.maxHealth,
            Number(data.value)||0
          )
        );
        if(target.health>0&&!target.alive){
          target.alive=true;
          target.hidden=false;
          target.respawnAt=0;
        }
        return true;
      }

      case 'health-max':
        target.health=target.maxHealth;
        if(!target.alive){
          target.alive=true;
          target.hidden=false;
          target.respawnAt=0;
        }
        return true;

      case 'shield-set':
        ShieldService.set(
          target,
          Number(data.value)||0,
          Training.player||target,
          {reason:'debug'}
        );
        return true;

      case 'shield-max':
        ShieldService.set(
          target,
          ShieldService.maximum(target),
          Training.player||target,
          {reason:'debug'}
        );
        return true;

      case 'kill':{
        if(
          this.isOnline()&&
          !EntitySimulationAuthorityService.isLocal(target)
        )return true;

        return !!DamagePipeline.apply({
          source:Training.player||target,
          target,
          attack:
            StatusDamageService.attack('debug-kill'),
          amountOverride:
            target.health+target.maxHealth,
          impact:{type:'debug'},
          targetPolicy:{
            allowSelf:true,
            allowAllies:true
          }
        });
      }

      case 'stamina-set':
        target.stamina=Math.max(
          0,
          Math.min(
            target.maxStamina||0,
            Number(data.value)||0
          )
        );
        return true;

      case 'stamina-max':
        target.stamina=target.maxStamina||0;
        return true;

      case 'command-feature-toggle':{
        if(!CommandFeatureService.isCharacter(target))return false;
        const feature=String(data.feature||'');
        if(!feature)return false;
        const desired=data.value===true;
        const current=CommandFeatureService.has(target,feature);
        if(current===desired)return desired;
        CommandFeatureService.toggle(target,feature);
        return desired;
      }

      case 'command-feature-repair':
        if(!CommandFeatureService.isCharacter(target))return false;
        return CommandFeatureService.runRepair(target);

      case 'gauge-set':
        return DebugGaugeControlService.set(
          target,
          String(data.kind||''),
          String(data.key||''),
          Number(data.value)||0,
          performance.now()
        );

      case 'cc-toggle':{
        const status=String(data.status||'');
        const desired=data.active===true;
        const current=DebugControlService.isCcActive(
          target,
          status
        );
        if(current===desired)return desired;

        DebugControlService.toggleCc(
          target,
          status,
          data.infinite===false
            ?Math.max(0,Number(data.duration)||0)
            :Infinity
        );
        return desired;
      }

      case 'poison-toggle':{
        const desired=data.active===true;
        const current=
          DebugControlService.isPoisonActive(target);
        if(current===desired)return desired;

        DebugControlService.togglePoison(
          target,
          Number(data.value)||0,
          data.infinite===false
            ?Math.max(0,Number(data.duration)||0)
            :Infinity
        );
        return desired;
      }

      case 'burn-toggle':{
        const desired=data.active===true;
        const current=
          DebugControlService.isBurnActive(target);
        if(current===desired)return desired;

        DebugControlService.toggleBurn(
          target,
          Number(data.value)||0,
          data.infinite===false
            ?Math.max(0,Number(data.duration)||0)
            :Infinity
        );
        return desired;
      }

      case 'buff-toggle':{
        const buff=String(data.buff||'');
        const desired=data.active===true;
        const current=
          DebugControlService.isModifierActive(
            target,
            buff
          );
        if(current===desired)return desired;

        DebugControlService.toggleModifier(
          target,
          buff,
          Number(data.value)||0,
          data.infinite===false
            ?Math.max(0,Number(data.duration)||0)
            :Infinity
        );
        return desired;
      }

      case 'force-action':{
        if(
          this.isOnline()&&
          !EntitySimulationAuthorityService.isLocal(target)
        )return true;
        return DebugControlService.forceAction(
          target,
          String(data.slot||'')
        );
      }

      case 'dummy-spawn':
        return !!this.createDummyFromSpec(data);

      case 'dummy-remove':{
        const id=String(data.id||'');
        const dummy=EntityService.items.get(id);
        if(!dummy||dummy.kind!=='dummy')return false;

        EntityService.items.delete(id);
        const index=Training.dummies.indexOf(dummy);
        if(index>=0)Training.dummies.splice(index,1);
        if(Training.dummy===dummy){
          Training.dummy=Training.dummies[0]||null;
        }
        return true;
      }

      default:
        return false;
    }
  },
  receive(pid,payload){
    if(
      !this.isOnline()||
      Number(payload?.roundToken)!==
        Number(OnlineDuelService.roundToken)
    )return false;

    const id=`${pid}:${Number(payload.debugSequence)||0}`;
    if(this.received.has(id))return false;
    this.received.add(id);
    if(this.received.size>512){
      this.received.delete(
        this.received.values().next().value
      );
    }

    const command=String(payload.command||'');

    if(this.isGlobalCommand(command)){
      return this.perform(
        command,
        null,
        payload.data||{},
        {
          broadcast:false,
          fromNetwork:true
        }
      );
    }

    const target=
      (
        payload.targetPid
          ?OnlineParticipantEntityService
            .entity(payload.targetPid)
          :null
      )||
      this.resolveTarget(
        payload.targetId
      );
    if(!target)return false;

    return this.perform(
      command,
      target,
      payload.data||{},
      {
        broadcast:false,
        fromNetwork:true
      }
    );
  },
  reset(){
    this.sequence=0;
    this.received.clear();
  }
};