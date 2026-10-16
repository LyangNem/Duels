

const AugmentDodgeSequenceService=Object.freeze({
  repeatCount(entity){
    let total=0;
    for(const {augment,effect} of AugmentService.effects(entity)){
      if(effect.type!=='dodge.repeat')continue;
      total+=
        Math.max(0,Math.floor(Number(effect.value)||0))*
        Math.max(1,AugmentService.count(entity,augment.id));
    }
    return total;
  },
  gap(entity){
    let duration=0;
    for(const {augment,effect} of AugmentService.effects(entity)){
      if(effect.type!=='dodge.repeat')continue;
      if(AugmentService.count(entity,augment.id)<=0)continue;
      duration=Math.max(
        duration,
        Math.max(0,Number(effect.gap)||0)
      );
    }
    return duration;
  },
  reset(entity){
    if(!entity)return false;
    FieldDodgeRewardService.clear(entity);
    entity.augmentDodgeRepeatsLeft=0;
    entity.augmentDodgeRepeatAt=0;
    entity.augmentDodgeEndAt=0;
    entity.augmentDodgeDirectionX=0;
    entity.augmentDodgeDirectionY=0;
    return true;
  },
  ready(entity,now=performance.now()){
    if(!entity)return false;
    return (
      now>=Math.max(0,Number(entity.dodgeUntil)||0)&&
      Math.max(0,Number(entity.augmentDodgeEndAt)||0)<=0&&
      Math.max(0,Number(entity.augmentDodgeRepeatAt)||0)<=0
    );
  },
  begin(entity,direction){
    if(!entity)return false;
    entity.augmentDodgeRepeatsLeft=this.repeatCount(entity);
    entity.augmentDodgeDirectionX=Number(direction?.x)||0;
    entity.augmentDodgeDirectionY=Number(direction?.y)||0;
    entity.augmentDodgeRepeatAt=0;
    entity.augmentDodgeEndAt=0;
    return true;
  },
  finishSegment(entity,now=performance.now()){
    if(!entity)return false;
    const endAt=
      now+
      Math.max(0,Number(GAME_DATA.dodge.dur)||0);
    entity.augmentDodgeEndAt=endAt;
    if(Math.max(0,Number(entity.augmentDodgeRepeatsLeft)||0)<=0){
      entity.augmentDodgeRepeatAt=0;
      return false;
    }
    entity.augmentDodgeRepeatAt=
      endAt+
      this.gap(entity);
    return true;
  },
  update(entity,now=performance.now()){
    if(!entity?.alive){
      this.reset(entity);
      return false;
    }

    const endAt=
      Math.max(0,Number(entity.augmentDodgeEndAt)||0);
    if(endAt>0&&now>=endAt){
      entity.augmentDodgeEndAt=0;
      GameEvents.emit('dodge-ended',{
        target:entity,
        aimAngle:
          entity===Training.player
            ?Training.aimAngle()
            :0,
        now
      });
    }

    const repeatAt=
      Math.max(0,Number(entity.augmentDodgeRepeatAt)||0);
    if(repeatAt<=0||now<repeatAt)return false;

    const remaining=
      Math.max(0,Number(entity.augmentDodgeRepeatsLeft)||0);
    if(remaining<=0){
      this.reset(entity);
      return false;
    }

    entity.augmentDodgeRepeatsLeft=remaining-1;
    entity.augmentDodgeRepeatAt=0;

    let repeatDirection={
      x:Number(entity.augmentDodgeDirectionX)||0,
      y:Number(entity.augmentDodgeDirectionY)||0
    };
    if(
      entity===Training.player&&
      EntitySimulationAuthorityService.isLocal(entity)
    ){
      const liveInput=TrainingInputVectorService.movement(Training.keys);
      repeatDirection={
        x:Number(liveInput?.x)||0,
        y:Number(liveInput?.y)||0
      };
    }

    const activated=EntityDodgeService.activate(
      entity,
      repeatDirection,
      {
        spend:false,
        startJustDodge:true,
        emit:true,
        sequenceContinuation:true
      }
    );

    if(!activated)this.reset(entity);
    return activated;
  }
});