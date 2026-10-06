


const ProjectileHomingTargetSyncService=Object.freeze({
  pendingBySource:new Map(),

  sourceKey(source){
    return String(
      source?.networkPid||
      source?.ownerPid||
      source?.id||
      ''
    );
  },

  pending(source,create=true){
    const key=this.sourceKey(source);
    if(!key)return null;
    let map=this.pendingBySource.get(key)||null;
    if(!map&&create){
      map=new Map();
      this.pendingBySource.set(key,map);
    }
    return map;
  },

  descriptor(projectile){
    return {
      networkKey:String(projectile?.networkKey||''),
      attackId:String(projectile?.attack?.id||''),
      executionSequence:
        Math.max(
          0,
          Math.floor(
            Number(projectile?.volley?.execution?.sequence)||0
          )
        ),
      projectileOrdinal:
        Math.max(
          0,
          Math.floor(
            Number(projectile?.projectileOrdinal)||0
          )
        )
    };
  },

  serialize(source){
    if(!source)return [];
    const result=[];

    for(const projectile of ProjectileService.items){
      if(
        projectile?.source!==source||
        !projectile.homing
      )continue;

      const descriptor=this.descriptor(projectile);
      if(!descriptor.networkKey)continue;

      const attackRange=
        Math.max(
          .001,
          Number(projectile.attack?.range)||1
        );
      const idleWanderActive=
        projectile.homingIdleWanderState
          ?.active===true;
      const homingActive=
        idleWanderActive||
        (
          (
            projectile.homing.startAfterHit!==true||
            projectile.hadHit===true
          )&&
          (
            Number(projectile.travel)||0
          )/attackRange>=
          Math.max(
            0,
            Number(
              projectile.homing.startTravelRatio
            )||0
          )
        );

      projectile.homingSampleSequence=
        Math.max(
          0,
          Math.floor(
            Number(projectile.homingSampleSequence)||0
          )
        )+1;

      result.push({
        ...descriptor,
        revision:
          Math.max(
            0,
            Math.floor(Number(projectile.homingRevision)||0)
          ),
        sampleSequence:
          projectile.homingSampleSequence,
        sampleTime:performance.now(),
        active:homingActive,
        idleWanderActive,
        x:Number(projectile.x)||0,
        y:Number(projectile.y)||0,
        vx:Number(projectile.vx)||0,
        vy:Number(projectile.vy)||0,
        travel:
          Math.max(
            0,
            Number(projectile.travel)||0
          ),
        angle:
          Number.isFinite(Number(projectile.angle))
            ?Number(projectile.angle)
            :Math.atan2(
              Number(projectile.vy)||0,
              Number(projectile.vx)||0
            ),
        targetReference:
          String(projectile.homingTargetReference||''),
        hadHit:projectile.hadHit===true,
        maxTravelDistance:
          Math.max(
            0,
            Number(projectile.maxTravelDistance)||
            Number(projectile.attack?.range)||
            0
          ),
        fadeResetTravel:
          Math.max(
            0,
            Number(projectile.fadeResetTravel)||0
          )
      });
    }

    return result;
  },

  findProjectile(source,snapshot){
    if(!source||!snapshot)return null;

    const networkKey=
      String(snapshot.networkKey||'');
    if(networkKey){
      const exact=
        ProjectileService.findByNetworkKey(
          source,
          networkKey
        );
      if(exact)return exact;
    }

    const attackId=String(snapshot.attackId||'');
    const sequence=
      Math.max(
        0,
        Math.floor(
          Number(snapshot.executionSequence)||0
        )
      );
    const ordinal=
      Math.max(
        0,
        Math.floor(
          Number(snapshot.projectileOrdinal)||0
        )
      );

    return ProjectileService.items.find(projectile=>
      projectile?.source===source&&
      projectile?.homing&&
      String(projectile.attack?.id||'')===attackId&&
      Math.max(
        0,
        Math.floor(
          Number(projectile.volley?.execution?.sequence)||0
        )
      )===sequence&&
      Math.max(
        0,
        Math.floor(
          Number(projectile.projectileOrdinal)||0
        )
      )===ordinal
    )||null;
  },

  applySnapshot(projectile,snapshot){
    if(!projectile?.homing||!snapshot)return false;

    const revision=
      Math.max(
        0,
        Math.floor(Number(snapshot.revision)||0)
      );
    const applied=
      Math.max(
        0,
        Math.floor(Number(projectile.appliedHomingRevision)||0)
      );

    if(revision<applied)return false;

    const targetReference=
      String(snapshot.targetReference||'');

    const sampleSequence=
      Math.max(
        0,
        Math.floor(Number(snapshot.sampleSequence)||0)
      );
    const appliedSampleSequence=
      Math.max(
        0,
        Math.floor(
          Number(
            projectile.appliedHomingSampleSequence
          )||0
        )
      );

    if(sampleSequence<appliedSampleSequence)return false;

    if(
      (!projectile.authoritativeHomingSample||sampleSequence>appliedSampleSequence)&&
      Number.isFinite(Number(snapshot.x))&&
      Number.isFinite(Number(snapshot.y))&&
      Number.isFinite(Number(snapshot.vx))&&
      Number.isFinite(Number(snapshot.vy))&&
      Number.isFinite(Number(snapshot.angle))
    ){
      const receivedAt=
        Math.max(
          0,
          Number(snapshot.receivedAt)||
          performance.now()
        );
      projectile.authoritativeHomingSample={
        sequence:sampleSequence,
        active:snapshot.active===true,
        idleWanderActive:
          snapshot.idleWanderActive===true,
        x:Number(snapshot.x),
        y:Number(snapshot.y),
        vx:Number(snapshot.vx),
        vy:Number(snapshot.vy),
        angle:Number(snapshot.angle),
        travel:
          Math.max(
            0,
            Number(snapshot.travel)||0
          ),
        receivedAt
      };

      if(
        !EntitySimulationAuthorityService.isLocal(
          projectile.source
        )
      ){
        const samples=
          Array.isArray(
            projectile.remoteHomingPresentationSamples
          )
            ?projectile.remoteHomingPresentationSamples
            :(
              projectile.remoteHomingPresentationSamples=[]
            );
        const last=
          samples.length
            ?samples[samples.length-1]
            :null;

        if(
          !last||
          sampleSequence>
          Math.max(
            0,
            Math.floor(
              Number(last.sequence)||0
            )
          )
        ){
          samples.push({
            sequence:sampleSequence,
            active:snapshot.active===true,
            idleWanderActive:
              snapshot.idleWanderActive===true,
            x:Number(snapshot.x),
            y:Number(snapshot.y),
            vx:Number(snapshot.vx),
            vy:Number(snapshot.vy),
            angle:Number(snapshot.angle),
            sampleTime:Number.isFinite(snapshot.sampleTime)
              ?snapshot.sampleTime:receivedAt,
            receivedAt
          });

          if(!projectile.remoteHomingPresentationClock){
            const first=samples[0];
            projectile.remoteHomingPresentationClock={
              offset:first.receivedAt-first.sampleTime
            };
          }

          if(samples.length>32){
            samples.splice(
              0,
              samples.length-32
            );
          }
        }
      }

      projectile.appliedHomingSampleSequence=
        sampleSequence;
    }

    if(
      Object.prototype.hasOwnProperty.call(
        snapshot,
        'hadHit'
      )
    ){
      projectile.hadHit=
        snapshot.hadHit===true;
    }

    if(
      projectile.homing?.idleWander
    ){
      const state=
        projectile.homingIdleWanderState||
        (
          projectile.homingIdleWanderState={
            target:null,
            nextTargetAt:0,
            seed:0,
            active:false
          }
        );
      state.active=
        snapshot.idleWanderActive===true;
      if(state.active!==true){
        state.target=null;
        state.nextTargetAt=0;
      }
    }

    projectile.homingTargetReference=
      targetReference;
    projectile.homingTargetSynced=
      !!targetReference;

    if(
      Number.isFinite(
        Number(snapshot.maxTravelDistance)
      )
    ){
      projectile.maxTravelDistance=
        Math.max(
          0,
          Number(snapshot.maxTravelDistance)||0
        );
    }

    if(
      Number.isFinite(
        Number(snapshot.fadeResetTravel)
      )
    ){
      projectile.fadeResetTravel=
        Math.max(
          0,
          Number(snapshot.fadeResetTravel)||0
        );
    }

    projectile.appliedHomingRevision=
      Math.max(applied,revision);

    return true;
  },

  applyRemote(source,snapshots,now=performance.now()){
    if(!source)return false;

    const incoming=
      Array.isArray(snapshots)
        ?snapshots
        :[];
    const pending=this.pending(source);
    if(!pending)return false;

    const seen=new Set();

    for(const snapshot of incoming){
      const key=
        String(snapshot?.networkKey||'')||
        [
          String(snapshot?.attackId||''),
          Math.max(0,Math.floor(Number(snapshot?.executionSequence)||0)),
          Math.max(0,Math.floor(Number(snapshot?.projectileOrdinal)||0))
        ].join(':');

      if(!key)continue;
      seen.add(key);

      const previous=pending.get(key)||null;
      const previousRevision=
        Math.max(
          0,
          Math.floor(Number(previous?.revision)||0)
        );
      const incomingRevision=
        Math.max(
          0,
          Math.floor(Number(snapshot?.revision)||0)
        );

      const newer=
        !previous||
        incomingRevision>=previousRevision;
      const previousSampleSequence=
        Math.max(
          0,
          Math.floor(Number(previous?.sampleSequence)||0)
        );
      const incomingSampleSequence=
        Math.max(
          0,
          Math.floor(Number(snapshot?.sampleSequence)||0)
        );
      // 중복/역순 패킷은 좌표뿐 아니라 receivedAt도 보존한다.
      if(previous&&incomingSampleSequence<=previousSampleSequence)continue;

      const newerSample=
        !previous||
        incomingSampleSequence>=previousSampleSequence;

      const merged={
        ...(newer?(previous||{}):(snapshot||{})),
        ...(newer?(snapshot||{}):(previous||{})),
        revision:
          Math.max(
            previousRevision,
            incomingRevision
          ),
        sampleSequence:
          Math.max(
            previousSampleSequence,
            incomingSampleSequence
          ),
        sampleTime:
          newerSample&&Number.isFinite(snapshot?.sampleTime)
            ?snapshot.sampleTime:previous?.sampleTime,
        active:
          newerSample
            ?snapshot?.active===true
            :previous?.active===true,
        idleWanderActive:
          newerSample
            ?snapshot?.idleWanderActive===true
            :previous?.idleWanderActive===true,
        x:
          newerSample&&
          Number.isFinite(Number(snapshot?.x))
            ?Number(snapshot.x)
            :Number(previous?.x),
        y:
          newerSample&&
          Number.isFinite(Number(snapshot?.y))
            ?Number(snapshot.y)
            :Number(previous?.y),
        vx:
          newerSample&&
          Number.isFinite(Number(snapshot?.vx))
            ?Number(snapshot.vx)
            :Number(previous?.vx),
        vy:
          newerSample&&
          Number.isFinite(Number(snapshot?.vy))
            ?Number(snapshot.vy)
            :Number(previous?.vy),
        travel:
          newerSample&&
          Number.isFinite(Number(snapshot?.travel))
            ?Math.max(0,Number(snapshot.travel)||0)
            :Math.max(0,Number(previous?.travel)||0),
        angle:
          newerSample&&
          Number.isFinite(Number(snapshot?.angle))
            ?Number(snapshot.angle)
            :Number(previous?.angle),
        hadHit:
          newerSample&&
          Object.prototype.hasOwnProperty.call(
            snapshot||{},
            'hadHit'
          )
            ?snapshot?.hadHit===true
            :previous?.hadHit===true,
        targetReference:
          String(
            newer
              ?(
                Object.prototype.hasOwnProperty.call(
                  snapshot||{},
                  'targetReference'
                )
                  ?snapshot?.targetReference||''
                  :previous?.targetReference||''
              )
              :(previous?.targetReference||'')
          ),
        maxTravelDistance:
          newer&&Number.isFinite(Number(snapshot?.maxTravelDistance))
            ?Number(snapshot.maxTravelDistance)
            :Number(previous?.maxTravelDistance)||0,
        fadeResetTravel:
          newer&&Number.isFinite(Number(snapshot?.fadeResetTravel))
            ?Number(snapshot.fadeResetTravel)
            :Number(previous?.fadeResetTravel)||0,
        receivedAt:
          Math.max(
            0,
            Number(now)||performance.now()
          )
      };

      pending.set(key,merged);

      const projectile=
        this.findProjectile(
          source,
          merged
        );
      if(projectile){
        this.applySnapshot(
          projectile,
          merged
        );
      }
    }

    for(const [key,snapshot] of pending){
      if(seen.has(key))continue;
      const age=now-(Number(snapshot?.receivedAt)||0);
      if(age>100){
        const projectile=this.findProjectile(source,snapshot);
        if(projectile){
          const index=ProjectileService.items.indexOf(projectile);
          ProjectileService.discard(projectile);
          if(index>=0)ProjectileService.items.splice(index,1);
        }
        pending.delete(key);
      }
    }

    return true;
  },

  renderSnapshot(projectile){
    if(
      !projectile?.homing||
      EntitySimulationAuthorityService.isLocal(
        projectile.source
      )
    )return null;

    const networkKey=
      String(projectile.networkKey||'');
    if(!networkKey)return null;

    const pending=
      this.pending(
        projectile.source,
        false
      );
    const snapshot=
      pending?.get(networkKey)||
      null;

    if(
      !snapshot||
      snapshot.active!==true||
      !Number.isFinite(Number(snapshot.x))||
      !Number.isFinite(Number(snapshot.y))||
      !Number.isFinite(Number(snapshot.vx))||
      !Number.isFinite(Number(snapshot.vy))||
      !Number.isFinite(Number(snapshot.angle))
    )return null;

    return snapshot;
  },

  updatePending(){
    for(const source of EntityService.items.values()){
      if(
        !source||
        EntitySimulationAuthorityService.isLocal(source)
      )continue;

      const pending=this.pending(source,false);
      if(!pending?.size)continue;

      for(const snapshot of pending.values()){
        const projectile=
          this.findProjectile(
            source,
            snapshot
          );
        if(projectile){
          this.applySnapshot(
            projectile,
            snapshot
          );
        }
      }
    }
  },

  clearSource(source){
    const key=this.sourceKey(source);
    if(!key)return false;
    return this.pendingBySource.delete(key);
  },
  clear(){
    this.pendingBySource.clear();
  }
});