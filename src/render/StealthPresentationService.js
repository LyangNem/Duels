

const StealthPresentationService=Object.freeze({
  revealUntil:new WeakMap(),
  revealStartedAt:new WeakMap(),
  entry(entity,now=performance.now()){
    return BuffService.visualEntry(entity,'stealth',now);
  },
  active(entity,now=performance.now()){
    return !!this.entry(entity,now);
  },
  fadeRatio(entity,now=performance.now()){
    const entry=this.entry(entity,now);
    if(!entry)return 0;
    const duration=Math.max(1,Number(entry.item?.data?.fadeDuration)||500);
    return Math.max(0,Math.min(1,(now-(Number(entry.item?.start)||now))/duration));
  },
  revealRadius(entity,now=performance.now()){
    const entry=this.entry(entity,now);
    return Math.max(0,Number(entry?.item?.data?.revealRadius)||80);
  },
  detectedBy(viewer,target,now=performance.now()){
    if(!viewer?.alive||!target?.alive||viewer===target||!this.active(target,now))return false;
    if(RelationService.relation(viewer,target)!=='enemy')return false;
    const radius=this.revealRadius(target,now)+Math.max(0,Number(viewer.radius)||0)+Math.max(0,Number(target.radius)||0);
    const dx=(Number(viewer.x)||0)-(Number(target.x)||0);
    const dy=(Number(viewer.y)||0)-(Number(target.y)||0);
    return dx*dx+dy*dy<=radius*radius;
  },
  detectedByAnyEnemy(target,now=performance.now()){
    if(!this.active(target,now))return false;
    for(const viewer of EntityService.items.values()){
      if(this.detectedBy(viewer,target,now))return true;
    }
    return false;
  },
  revealRemaining(entity,now=performance.now()){
    return Math.max(0,(Number(this.revealUntil.get(entity))||0)-now);
  },
  temporarilyRevealed(entity,now=performance.now()){
    return this.active(entity,now)&&this.revealRemaining(entity,now)>0;
  },
  reveal(entity,duration=600,now=performance.now(),{broadcast=true}={}){
    if(!entity||!this.active(entity,now))return false;
    const revealDuration=Math.max(0,Number(duration)||0);
    if(revealDuration<=0)return false;
    const nextEnd=now+revealDuration;
    const currentEnd=Number(this.revealUntil.get(entity))||0;
    this.revealUntil.set(entity,Math.max(currentEnd,nextEnd));
    if(broadcast&&typeof OnlinePresentationSyncService!=='undefined'){
      OnlinePresentationSyncService.send(
        'stealth-reveal',
        entity,
        {duration:revealDuration}
      );
    }
    return true;
  },
  revealAlpha(entity,now=performance.now()){
    const end=Number(this.revealUntil.get(entity))||0;
    if(end<=now)return 0;
    /*
      기존 스야처럼 노출 시간 동안 서서히 나타났다가 다시 사라진다.
      현재 노출의 총 길이는 저장된 종료 시각과 최근 시작 시각으로 계산한다.
    */
    const startedAt=Number(this.revealStartedAt.get(entity))||0;
    const duration=Math.max(1,end-startedAt);
    const progress=Math.max(0,Math.min(1,(now-startedAt)/duration));
    return Math.max(0,Math.sin(Math.PI*progress))*.6;
  },
  exposeState(entity,duration,now=performance.now(),options={}){
    if(!entity||!this.active(entity,now))return false;
    const revealDuration=Math.max(0,Number(duration)||0);
    if(revealDuration<=0)return false;
    this.revealStartedAt.set(entity,now);
    return this.reveal(entity,revealDuration,now,options);
  },
  exposedByAnyEnemy(target,now=performance.now()){
    return this.temporarilyRevealed(target,now)||this.detectedByAnyEnemy(target,now);
  },
  hiddenFromDeadSpectator(viewer,target,now=performance.now()){
    if(
      typeof Training==='undefined'||
      Training.spectating!==true||
      !viewer||viewer.alive!==false||
      !target?.alive||
      target.kind!=='player'||
      viewer===target||
      !this.active(target,now)
    )return false;
    return RelationService.relation(viewer,target)!=='ally';
  },
  state(viewer,target,now=performance.now()){
    if(!this.active(target,now))return {active:false,alpha:1,hostile:false,detected:false,revealed:false,hideWorldUi:false};
    if(this.hiddenFromDeadSpectator(viewer,target,now)){
      return {active:true,alpha:0,hostile:true,detected:false,revealed:false,hideWorldUi:true,hiddenFromSpectator:true};
    }
    const hostile=viewer&&viewer!==target&&RelationService.relation(viewer,target)==='enemy';
    const fade=this.fadeRatio(target,now);
    if(!hostile){
      return {active:true,alpha:1-.75*fade,hostile:false,detected:false,revealed:false,hideWorldUi:false};
    }
    const proximityDetected=this.detectedBy(viewer,target,now);
    const revealed=this.temporarilyRevealed(target,now);
    const exposed=proximityDetected||revealed;
    return {
      active:true,
      alpha:proximityDetected
        ?1
        :revealed
          ?Math.max(1-fade,this.revealAlpha(target,now))
          :1-fade,
      hostile:true,
      detected:exposed,
      revealed,
      hideWorldUi:!exposed
    };
  }
});