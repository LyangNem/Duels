

const ScreenShakeService={
  state:{power:0,startedAt:0,durationMs:0,seed:0,forceUntil:0},
  offsetState:{x:0,y:0},
  batches:new Map(),
  add(role,damage=0){
    if(DisplaySettings.strength('screenShake')<=0)return false;
    const amount=Math.max(0,Number(damage)||0);
    if(amount<=0)return false;
    const now=performance.now();
    const attacker=role==='attacker';
    const power=attacker
      ?Math.max(5.2,Math.min(15.5,4.5+Math.sqrt(amount)*1.18))
      :Math.max(3.8,Math.min(11.5,3.2+Math.sqrt(amount)*.86));
    const durationMs=attacker
      ?Math.max(118,Math.min(210,108+Math.sqrt(amount)*9.2))
      :Math.max(102,Math.min(186,94+Math.sqrt(amount)*7));
    const state=this.state;
    if(power>=state.power||now>=state.startedAt+state.durationMs){
      state.power=power;
      state.startedAt=now;
      state.durationMs=durationMs;
      state.seed=(state.seed+1)%997;
    }else{
      state.durationMs=Math.max(state.durationMs,now-state.startedAt+durationMs*.65);
    }
    return true;
  },
  fire(){
    if(DisplaySettings.strength('screenShake')<=0)return false;
    const now=performance.now();
    const state=this.state;
    const power=4.4,durationMs=125;
    if(state.power<=power||now>=state.startedAt+state.durationMs){
      state.power=power;
      state.startedAt=now;
      state.durationMs=durationMs;
      state.seed=(state.seed+1)%997;
    }
  },
  forceImpact(power=28,durationMs=320){
    const now=performance.now();
    const state=this.state;
    const duration=Math.max(1,Number(durationMs)||1);
    state.power=Math.max(state.power,Math.max(0,Number(power)||0));
    state.startedAt=now;
    state.durationMs=Math.max(state.durationMs,duration);
    state.forceUntil=Math.max(state.forceUntil,now+duration);
    state.seed=(state.seed+211)%997;
    return true;
  },
  queue(role,damage,key='global'){
    if(DisplaySettings.strength('screenShake')<=0)return;
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
      this.add(bucket.role,bucket.total);
    }
  },
  offset(now=performance.now()){
    const out=this.offsetState;
    out.x=0;
    out.y=0;

    const forced=now<this.state.forceUntil;
    const strength=
      DisplaySettings.strength(
        'screenShake'
      );
    if(strength<=0)return out;

    if(strength>0)this.flush(now);

    const state=this.state;
    if(state.power<=0||state.durationMs<=0)return out;

    const elapsed=now-state.startedAt;
    const t=Math.max(0,Math.min(1,elapsed/state.durationMs));

    if(t>=1){
      state.power=0;
      return out;
    }

    const decay=Math.pow(1-t,1.55);
    const phase=elapsed*.074+state.seed*1.73;
    const kick=t<.18?1-t/.18:0;

    out.x=
      (Math.sin(phase)+Math.sin(phase*2.17+.6)*.42)*
      state.power*decay+
      state.power*.58*kick;

    out.y=
      (Math.sin(phase*1.31+1.1)+Math.sin(phase*2.63)*.34)*
      state.power*.72*decay-
      state.power*.24*kick;

    out.x*=strength;
    out.y*=strength;

    return out;
  },
  reset(){
    this.batches.clear();
    this.state.power=0;
    this.state.startedAt=0;
    this.state.durationMs=0;
    this.state.seed=0;
    this.state.forceUntil=0;
  }
};