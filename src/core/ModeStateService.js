


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
    const next=
      values[
        (index+1)%values.length
      ];

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
  }
});