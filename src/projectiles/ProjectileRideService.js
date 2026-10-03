


const ProjectileRideService=Object.freeze({
  KIND:'projectile-ride-state',
  state(entity,rideStateKey='projectile-ride'){
    const state=
      entity?.actionState?.get(
        String(rideStateKey||'projectile-ride')
      )||
      null;
    return state?.kind===this.KIND
      ?state
      :null;
  },
  active(entity,rideStateKey='projectile-ride'){
    return !!this.state(entity,rideStateKey);
  },
  projectile(entity,state){
    if(!entity||!state)return null;
    return ProjectileStateService.get(
      entity,
      String(state.projectileStateKey||'')
    );
  },
  start(
    entity,
    {
      projectileStateKey='',
      rideStateKey='projectile-ride',
      control='input',
      turnPerFrame=0,
      wallPass=false
    }={}
  ){
    if(!entity?.alive||!entity.actionState)return false;
    const projectile=
      ProjectileStateService.get(
        entity,
        String(projectileStateKey||'')
      );
    if(!projectile)return false;

    const move=
      MovementAbilityService.state(
        entity,
        'movement:move'
      );
    if(move){
      MovementAbilityService.finish(
        entity,
        move,
        performance.now()
      );
    }

    entity.actionState.set(
      String(rideStateKey||'projectile-ride'),
      {
        kind:this.KIND,
        stateKey:String(rideStateKey||'projectile-ride'),
        projectileStateKey:String(projectileStateKey||''),
        control:
          String(control||'fixed')==='input'
            ?'input'
            :'fixed',
        turnPerFrame:
          Math.max(
            0,
            Number(turnPerFrame)||0
          ),
        wallPass:
          wallPass===true,
        lastInputAngle:
          Number.isFinite(Number(projectile.angle))
            ?Number(projectile.angle)
            :Math.atan2(
              Number(projectile.vy)||0,
              Number(projectile.vx)||0
            )
      }
    );

    if(wallPass===true){
      BuffService.set(
        entity,
        'wallPass',
        1,
        `projectile-ride:${String(rideStateKey||'projectile-ride')}`,
        Infinity,
        {
          tags:Object.freeze(['벽 통과'])
        }
      );
    }

    entity.attackPreview=null;
    entity.x=Number(projectile.x)||entity.x;
    entity.y=Number(projectile.y)||entity.y;
    return true;
  },
  finish(
    entity,
    rideStateKey='projectile-ride',
    {resolveEmbedded=true}={}
  ){
    const state=this.state(entity,rideStateKey);
    if(!state)return false;
    const projectile=this.projectile(entity,state);
    if(projectile){
      entity.x=Number(projectile.x)||entity.x;
      entity.y=Number(projectile.y)||entity.y;
    }
    entity.actionState.delete(state.stateKey);
    if(state.wallPass===true){
      BuffService.remove(
        entity,
        'wallPass',
        `projectile-ride:${String(state.stateKey||'projectile-ride')}`
      );
    }
    if(resolveEmbedded&&entity?.alive){
      MovementService.resolveEmbedded(entity);
    }
    return true;
  },
  updateControl(entity,state,frameScale=1){
    if(!entity?.alive||!state)return false;
    const projectile=this.projectile(entity,state);
    if(!projectile)return false;

    const baseSpeed=Math.max(
      0,
      Number(projectile.projectile?.speed)||
      Number(projectile.baseSpeed)||
      Math.hypot(
        Number(projectile.vx)||0,
        Number(projectile.vy)||0
      )
    );

    let angle=
      Number.isFinite(Number(projectile.angle))
        ?Number(projectile.angle)
        :Number(state.lastInputAngle)||0;

    if(
      state.control==='input'&&
      entity===Training.player
    ){
      const movement=
        TrainingInputVectorService.movement(
          Training.keys
        );
      const dx=Number(movement?.x)||0;
      const dy=Number(movement?.y)||0;
      if(Math.hypot(dx,dy)>.0001){
        const desiredAngle=Math.atan2(dy,dx);
        const maxTurn=
          Math.max(
            0,
            Number(state.turnPerFrame)||0
          )*
          Math.max(
            0,
            Number(frameScale)||0
          );
        const rawDifference=desiredAngle-angle;
        let difference=Math.atan2(
          Math.sin(rawDifference),
          Math.cos(rawDifference)
        );
        difference=
          Math.max(
            -maxTurn,
            Math.min(maxTurn,difference)
          );
        angle+=difference;
        state.lastInputAngle=angle;
        entity.lastMovementInputAngle=angle;
      }
    }

    projectile.angle=angle;
    projectile.vx=Math.cos(angle)*baseSpeed;
    projectile.vy=Math.sin(angle)*baseSpeed;
    return true;
  },
  serialize(entity){
    if(!entity?.actionState)return null;
    for(const state of entity.actionState.values()){
      if(state?.kind!==this.KIND)continue;

      const projectile=this.projectile(entity,state);
      return {
        active:true,
        rideStateKey:String(state.stateKey||'projectile-ride'),
        projectileStateKey:String(state.projectileStateKey||''),
        angle:
          Number.isFinite(Number(projectile?.angle))
            ?Number(projectile.angle)
            :Number(state.lastInputAngle)||0,
        control:String(state.control||'fixed'),
        turnPerFrame:Math.max(0,Number(state.turnPerFrame)||0),
        wallPass:state.wallPass===true
      };
    }
    return null;
  },
  applyRemote(entity,snapshot){
    if(!entity?.actionState)return false;

    const previousKey=
      String(
        entity._remoteProjectileRideStateKey||
        'projectile-ride'
      );

    if(
      !snapshot||
      snapshot.active!==true||
      !snapshot.projectileStateKey
    ){
      const previous=this.state(entity,previousKey);
      if(previous){
        entity.actionState.delete(previous.stateKey);
      }
      entity._remoteProjectileRideStateKey=null;
      return false;
    }

    const rideStateKey=
      String(snapshot.rideStateKey||'projectile-ride');

    const state={
      kind:this.KIND,
      stateKey:rideStateKey,
      projectileStateKey:
        String(snapshot.projectileStateKey||''),
      remoteAngle:
        Number.isFinite(Number(snapshot.angle))
          ?Number(snapshot.angle)
          :0,
      control:String(snapshot.control||'fixed'),
      turnPerFrame:
        Math.max(0,Number(snapshot.turnPerFrame)||0),
      wallPass:snapshot.wallPass===true,
      remote:true
    };

    if(previousKey!==rideStateKey){
      const previous=this.state(entity,previousKey);
      if(previous){
        entity.actionState.delete(previous.stateKey);
      }
    }

    entity.actionState.set(
      rideStateKey,
      state
    );
    entity._remoteProjectileRideStateKey=
      rideStateKey;
    return true;
  },
  updateControls(frameScale=1){
    for(const entity of EntityService.items.values()){
      if(!EntitySimulationAuthorityService.isLocal(entity))continue;
      if(!entity?.actionState)continue;

      for(const state of entity.actionState.values()){
        if(state?.kind!==this.KIND)continue;
        if(!entity.alive){
          this.finish(
            entity,
            state.stateKey,
            {resolveEmbedded:false}
          );
          break;
        }
        if(!this.projectile(entity,state)){
          this.finish(entity,state.stateKey);
          break;
        }
        this.updateControl(
          entity,
          state,
          frameScale
        );
      }
    }
  },
  syncAll(){
    for(const entity of EntityService.items.values()){
      if(!entity?.actionState)continue;

      for(const state of entity.actionState.values()){
        if(state?.kind!==this.KIND)continue;
        const projectile=this.projectile(entity,state);
        if(!projectile){
          if(EntitySimulationAuthorityService.isLocal(entity)){
            this.finish(entity,state.stateKey);
          }
          break;
        }

        if(EntitySimulationAuthorityService.isLocal(entity)){
          const x=Number(projectile.x)||entity.x;
          const y=Number(projectile.y)||entity.y;
          entity.x=x;
          entity.y=y;
          continue;
        }

        /*
          원격 탑승 표시는 플레이어의 기존 네트워크 보간 위치가 기준이다.
          비행기 쪽을 그 위치에 붙여서, 상대 화면에서도 '플레이어가 조종하고
          비행기가 따라가는' 하나의 결합된 표시로 보이게 한다.
        */
        const x=Number(entity.x)||0;
        const y=Number(entity.y)||0;
        projectile.x=x;
        projectile.y=y;

        if(Number.isFinite(Number(state.remoteAngle))){
          projectile.angle=Number(state.remoteAngle);
          const speed=Math.max(
            0,
            Number(projectile.baseSpeed)||
            Math.hypot(
              Number(projectile.vx)||0,
              Number(projectile.vy)||0
            )
          );
          projectile.vx=Math.cos(projectile.angle)*speed;
          projectile.vy=Math.sin(projectile.angle)*speed;
        }
      }
    }
  }
});