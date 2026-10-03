


const RecordDodgePresentationService=Object.freeze({
  points(entity){
    if(!entity||entity.kind!=='player')return 0;
    const characterId=entity.character?.id;
    if(!characterId)return 0;

    return EntitySimulationAuthorityService.isLocal(entity)
      ?CharacterRecordService.points(
        characterId,
        AccountState.current
      )
      :Math.max(
        0,
        Math.round(
          Number(entity._recordPoints)||0
        )
      );
  },

  tier(entity){
    return CharacterRecordService.tier(
      this.points(entity)
    );
  },

  profile(entity){
    const tier=this.tier(entity);

    if(tier.id==='diamond'){
      return {
        tierId:'diamond',
        primary:'104,186,255',
        secondary:'157,232,255',
        intervalMs:46,
        count:1,
        duration:20,
        spread:34
      };
    }

    if(tier.id==='platinum'){
      return {
        tierId:'platinum',
        primary:'220,244,255',
        secondary:'154,255,221',
        intervalMs:54,
        count:2,
        duration:24,
        spread:20,
        activeLimit:12,
        nearbyLimit:5
      };
    }

    if(tier.id==='master'){
      return {
        tierId:'master',
        primary:'255,227,79',
        secondary:'168,108,255',
        accent:'255,157,56',
        intervalMs:46,
        count:2,
        duration:28,
        spread:20,
        activeLimit:14,
        nearbyLimit:5,
        sizeScale:1.45,
        minSpacing:20,
        masterLevel:Math.max(
          1,
          Math.min(
            5,
            Number(tier.masterLevel)||1
          )
        )
      };
    }

    return null;
  },

  emit(entity,profile,motion={}){
    if(!entity||!profile)return false;

    const angle=
      Number.isFinite(
        Number(motion.angle)
      )
        ?Number(motion.angle)
        :0;
    const speed=
      Math.max(
        0,
        Number(motion.speed)||0
      );
    const mode=
      String(
        motion.mode||
        'travel'
      );
    const isMaster=
      profile.tierId==='master';
    const modeSeedBias=
      mode==='start'
        ?3.17
        :mode==='end'
          ?7.43
          :0;
    const baseSeed=
      performance.now()*.013+
      (Number(entity.x)||0)*.011+
      (Number(entity.y)||0)*.017+
      modeSeedBias;

    let count=
      Math.max(
        1,
        Math.floor(
          Number(profile.count)||1
        )
      );

    const fxList=Training.fx;

    if(Array.isArray(fxList)){
      const centerX=
        Number(entity.x)||0;
      const centerY=
        Number(entity.y)||0;
      const tierId=
        profile.tierId||'';
      const activeLimit=
        Math.max(
          1,
          Number(profile.activeLimit)||999
        );
      const nearbyLimit=
        Math.max(
          1,
          Number(profile.nearbyLimit)||999
        );
      const now=
        performance.now();

      let activeSameTier=0;
      let nearbySameTier=0;
      for(const fx of fxList){
        if(
          fx?.type!=='recordDodgeTrail'||
          fx?.tierId!==tierId||
          (Number(fx.start)+Number(fx.dur))<=now
        )continue;
        activeSameTier++;
        const dx=(Number(fx.x)||0)-centerX;
        const dy=(Number(fx.y)||0)-centerY;
        if(dx*dx+dy*dy<=2500){
          nearbySameTier++;
        }
      }

      count=Math.max(
        0,
        Math.min(
          count,
          activeLimit-activeSameTier,
          nearbyLimit-nearbySameTier
        )
      );

      if(count<=0)return false;
    }

    const duration=
      Math.max(
        1,
        Number(profile.duration)||1
      );
    const acceptedMasterPositions=[];

    for(let index=0;index<count;index++){
      const seed=
        baseSeed+
        index*1.927;
      let x=
        Number(entity.x)||0;
      let y=
        Number(entity.y)||0;
      const spread=
        Math.max(
          10,
          Number(profile.spread)||14
        );
      const lane=
        index-
        (count-1)/2;
      const back=
        7+
        index*5+
        Math.min(
          17,
          speed*.55
        )+
        (
          (
            seed*1.7
          )%1-
          .5
        )*5;
      const sideBase=
        lane*
        (spread*.52);
      const sideWave=
        Math.sin(
          seed*3.17+
          index*1.23
        )*
        (spread*.48);
      const side=
        Math.max(
          -spread,
          Math.min(
            spread,
            sideBase+
            sideWave
          )
        );

      x-=
        Math.cos(angle)*
        back;
      y-=
        Math.sin(angle)*
        back;
      x+=
        Math.cos(
          angle+
          Math.PI/2
        )*
        side;
      y+=
        Math.sin(
          angle+
          Math.PI/2
        )*
        side;

      const burstType=
        mode==='start'
          ?'start'
          :mode==='end'
            ?'end'
            :'travel';
      const sizeBias=
        .35+
        (
          (
            seed*1.3
          )%1
        )*
        .25;

      if(isMaster){
        const minSpacing=
          Math.max(
            14,
            Number(profile.minSpacing)||18
          );

        const collides=(testX,testY)=>{
          const now=
            performance.now();
          const existingCollision=
            Array.isArray(fxList)&&
            fxList.some(fx=>
              fx?.type==='recordDodgeTrail'&&
              fx?.tierId==='master'&&
              (
                Number(fx.start)+
                Number(fx.dur)
              )>now&&
              Math.hypot(
                (Number(fx.x)||0)-testX,
                (Number(fx.y)||0)-testY
              )<minSpacing
            );

          const batchCollision=
            acceptedMasterPositions.some(
              point=>
                Math.hypot(
                  point.x-testX,
                  point.y-testY
                )<minSpacing
            );

          return (
            existingCollision||
            batchCollision
          );
        };

        // 427 그대로: 겹치면 바깥으로 밀지 않고 그 후보를 건너뛴다.
        if(collides(x,y))continue;

        acceptedMasterPositions.push({
          x,
          y
        });
      }

      const fadeStep=
        profile.tierId==='platinum'
          ?5
          :4;
      const staggeredDuration=
        duration+
        index*fadeStep;
      const durationMs=
        staggeredDuration*
        GAME_DATA.frameMs;
      const now=
        performance.now();

      EffectSpawnService.spawn({
        type:'recordDodgeTrail',
        tierId:profile.tierId,
        masterLevel:
          profile.masterLevel||0,
        x,
        y,
        angle,
        seed,
        index,
        fadeOrder:index,
        fadeGroupSize:count,
        burstType,
        sizeBias,
        primary:profile.primary,
        secondary:profile.secondary,
        accent:
          profile.accent||
          profile.secondary,
        sizeScale:
          Math.max(
            1,
            Number(profile.sizeScale)||1
          ),
        start:now,
        dur:durationMs,
        maxDur:durationMs
      });
    }

    return true;
  },

  begin(entity,now=performance.now(),direction=null){
    const profile=this.profile(entity);
    const dx=
      Number(direction?.x)||0;
    const dy=
      Number(direction?.y)||0;
    const angle=
      Math.hypot(dx,dy)>.01
        ?Math.atan2(dy,dx)
        :(Number(entity?.angle)||0);

    entity._recordDodgeFx={
      active:!!profile,
      profile,
      lastX:Number(entity.x)||0,
      lastY:Number(entity.y)||0,
      startX:Number(entity.x)||0,
      startY:Number(entity.y)||0,
      travelDistance:0,
      nextAt:0,
      ended:false
    };

    if(profile){
      this.emit(
        entity,
        profile,
        {
          angle,
          speed:0,
          mode:'start'
        }
      );
      entity._recordDodgeFx.nextAt=
        now+
        profile.intervalMs;
    }

    return !!profile;
  },

  update(now=performance.now()){
    for(const entity of EntityService.items.values()){
      if(entity?.kind!=='player')continue;

      let state=
        entity._recordDodgeFx;
      const dodging=
        entity.alive&&
        Number(entity.dodgeUntil)>now;

      // 회피 이팩트는 실제 dodge action에서만 시작한다.
      // 지연된 duel-state의 dodgeRemaining만으로 FX를 새로 만들지 않는다.
      if(dodging&&!state)continue;

      if(!state)continue;

      const x=
        Number(entity.x)||0;
      const y=
        Number(entity.y)||0;
      const lastX=
        Number.isFinite(state.lastX)
          ?state.lastX
          :x;
      const lastY=
        Number.isFinite(state.lastY)
          ?state.lastY
          :y;
      const dx=x-lastX;
      const dy=y-lastY;
      const distance=
        Math.hypot(dx,dy);
      const angle=
        distance>.01
          ?Math.atan2(dy,dx)
          :(Number(entity.angle)||0);

      state.travelDistance=
        (
          Number(state.travelDistance)||0
        )+
        distance;

      const startX=
        Number.isFinite(state.startX)
          ?state.startX
          :x;
      const startY=
        Number.isFinite(state.startY)
          ?state.startY
          :y;
      const displacement=
        Math.hypot(
          x-startX,
          y-startY
        );
      const estimatedTotal=
        Math.max(
          48,
          Number(entity.dodgeDistance)||0,
          displacement+20
        );
      const progress=
        Math.max(
          0,
          Math.min(
            1,
            displacement/
            estimatedTotal
          )
        );

      if(!dodging){
        if(
          state.active&&
          !state.ended
        ){
          this.emit(
            entity,
            state.profile,
            {
              angle,
              speed:distance,
              mode:'end'
            }
          );
          state.ended=true;
        }

        delete entity._recordDodgeFx;
        continue;
      }

      if(
        state.active&&
        (
          !state.nextAt||
          now>=state.nextAt
        )
      ){
        this.emit(
          entity,
          state.profile,
          {
            angle,
            speed:distance,
            mode:'travel',
            progress
          }
        );
        state.nextAt=
          now+
          state.profile.intervalMs;
      }

      state.lastX=x;
      state.lastY=y;
    }
  }
});