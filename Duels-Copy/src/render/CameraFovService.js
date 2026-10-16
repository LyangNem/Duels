

const CameraFovService={
  state:{zoom:1,startedAt:0,durationMs:0,peak:0,forceUntil:0},
  batches:new Map(),
  debugScale:1,

  setDebugScale(value){
    this.debugScale=Math.max(.25,Math.min(2,Number(value)||1));
    return this.debugScale;
  },

  triggerStrongHit(damage=0){
    if(DisplaySettings.strength('dynamicFov')<=0)return false;
    const amount=Math.max(0,Number(damage)||0);
    const config=GAME_DATA.cameraFeedback;
    if(amount<config.strongDamage)return false;

    const preset=config.strongHitZoom;
    const now=performance.now();
    this.state.startedAt=now;
    this.state.durationMs=preset.duration;
    this.state.peak=Math.min(
      preset.maxPeak,
      preset.basePeak+
      (amount-config.strongDamage)*preset.damagePeakStep
    );
    return true;
  },

  queue(role,damage,key='global'){
    if(DisplaySettings.strength('dynamicFov')<=0)return;
    const amount=Math.max(0,Number(damage)||0);
    if(amount<=0)return;

    const bucketKey=`${role}:${key}`;
    const now=performance.now();
    let bucket=this.batches.get(bucketKey);
    if(!bucket){
      bucket={role,total:0,flushAt:now+52};
      this.batches.set(bucketKey,bucket);
    }
    bucket.total+=amount;
  },

  flush(now=performance.now()){
    for(const [key,bucket] of this.batches){
      if(now<bucket.flushAt)continue;
      this.batches.delete(key);
      this.triggerStrongHit(bucket.total);
    }
  },

  trigger(zoom,durationMs){
    if(DisplaySettings.strength('dynamicFov')<=0)return false;
    const now=performance.now();
    const target=Math.max(1,Number(zoom)||1);
    const duration=Math.max(1,Number(durationMs)||1);
    this.state.startedAt=now;
    this.state.durationMs=duration;
    this.state.peak=Math.max(0,target-1);
    return true;
  },


  forceKo(){
    const preset=GAME_DATA.cameraFeedback.ko;
    const now=performance.now();
    const state=this.state;
    state.peak=Math.max(state.peak,preset.zoom-1);
    state.startedAt=now;
    state.durationMs=Math.max(state.durationMs,preset.duration);
    state.forceUntil=Math.max(state.forceUntil,now+preset.duration);
  },

  dynamicScale(now=performance.now()){
    const strength=DisplaySettings.strength('dynamicFov');
    if(strength<=0)return 1;
    this.flush(now);

    const state=this.state;
    if(state.peak<=0||state.durationMs<=0)return 1;

    const elapsed=now-state.startedAt;
    const t=Math.max(0,Math.min(1,elapsed/state.durationMs));

    if(t>=1){
      state.peak=0;
      state.zoom=1;
      return 1;
    }

    if(now<state.forceUntil){
      const wave=Math.pow(1-t,1.8);
      state.zoom=1+state.peak*wave*strength;
      return state.zoom;
    }

    const preset=GAME_DATA.cameraFeedback.strongHitZoom;
    const attackRatio=preset.attackRatio;
    let wave=0;

    if(t<attackRatio){
      const a=t/attackRatio;
      wave=1-Math.pow(1-a,3);
    }else{
      const r=(t-attackRatio)/(1-attackRatio);
      wave=Math.pow(1-r,preset.releasePower);
    }

    state.zoom=1+state.peak*wave*strength;
    return state.zoom;
  },

  scale(now=performance.now()){
    return this.dynamicScale(now)*this.debugScale;
  },

  reset(){
    this.batches.clear();
    this.state.zoom=1;
    this.state.peak=0;
    this.state.startedAt=0;
    this.state.durationMs=0;
    this.state.forceUntil=0;
  }
};