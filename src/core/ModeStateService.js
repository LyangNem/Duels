


/* 플레이어/소환수/설치물에서 공통으로 쓰는 범용 모드 상태. */
const ModeStateService=Object.freeze({
  KIND:'mode-state',
  key(stateKey){
    return `mode:${String(stateKey||'default')}`;
  },
  state(entity,stateKey,create=false,initial=''){
    if(!entity?.actionState||!stateKey)return null;

    const key=this.key(stateKey);
    let state=entity.actionState.get(key)||null;

    if(
      state?.kind!==this.KIND
    ){
      state=null;
    }

    if(!state&&create){
      state={
        kind:this.KIND,
        stateKey:String(stateKey),
        value:String(initial||'')
      };
      entity.actionState.set(key,state);
    }

    return state;
  },
  current(entity,stateKey,initial=''){
    return String(
      this.state(
        entity,
        stateKey,
        false
      )?.value||
      initial||
      ''
    );
  },
  set(entity,stateKey,value,initial=''){
    const state=this.state(
      entity,
      stateKey,
      true,
      initial
    );
    if(!state)return false;

    state.value=String(value||'');
    return true;
  },
  toggle(entity,module){
    const stateKey=String(module?.stateKey||'');
    const values=Array.isArray(module?.values)
      ?module.values.map(value=>String(value))
      :[];
    if(!entity||!stateKey||values.length<2)return null;

    const current=this.current(
      entity,
      stateKey,
      String(module.initial||values[0]||'')
    );
    const index=Math.max(
      0,
      values.indexOf(current)
    );
    const step=Number(module.step)<0?-1:1;
    const next=values[(index+step+values.length)%values.length];
    const state=this.state(entity,stateKey,true,current);
    state.previousTurns=Number(state.turns)||0;
    state.turns=state.previousTurns+step;
    state.changedAt=performance.now();

    this.set(
      entity,
      stateKey,
      next,
      String(module.initial||values[0]||'')
    );

    return {
      previous:current,
      value:next
    };
  },
  serialize(entity,now=performance.now()){
    const result=[];
    for(const state of entity?.actionState?.values?.()||[]){
      if(state?.kind!==this.KIND)continue;
      result.push({stateKey:state.stateKey,value:state.value,previousValue:String(state.previousValue||''),
        turns:Number(state.turns)||0,previousTurns:Number(state.previousTurns)||0,
        changedAgoMs:Math.max(0,now-Number(state.changedAt??now)),
        hasChanged:state.changedAt!==undefined});
    }
    return result;
  },
  applyRemote(entity,snapshots,now=performance.now()){
    if(!entity?.actionState||!Array.isArray(snapshots))return false;
    const keys=new Set();
    for(const snapshot of snapshots.slice(0,64)){
      const stateKey=String(snapshot?.stateKey||'');
      if(!stateKey||typeof snapshot.value!=='string')continue;
      keys.add(this.key(stateKey));
      const state=this.state(entity,stateKey,true,snapshot.value);
      const turns=Number(snapshot.turns)||0;
      const changed=state.value!==snapshot.value||Number(state.turns||0)!==turns||state.changedAt===undefined;
      state.value=snapshot.value;
      state.previousValue=String(snapshot.previousValue||'');
      state.turns=turns;
      state.previousTurns=Number(snapshot.previousTurns)||0;
      if(changed&&snapshot.hasChanged!==false)state.changedAt=now-Math.max(0,Number(snapshot.changedAgoMs)||0);
    }
    for(const [key,state] of entity.actionState){
      if(state?.kind===this.KIND&&!keys.has(key))entity.actionState.delete(key);
    }
    return true;
  }
});
