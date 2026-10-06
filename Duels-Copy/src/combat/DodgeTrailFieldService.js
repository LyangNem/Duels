


/*
  회피 이동 중 일정 간격으로 설치형 field를 남기는 범용 passive.
  character.passives의 dodge.trail-field만 읽으며 캐릭터 ID를 검사하지 않는다.
*/
const DodgeTrailFieldService=Object.freeze({
  KIND:'dodge-trail-field-runtime',
  runtimeKey(module){
    return `dodge-trail-runtime:${String(module.stateKey||'trail')}`;
  },
  modeAllowed(entity,module){
    const mode=module.whenMode||null;
    if(!mode)return true;
    return (
      ModeStateService.current(
        entity,
        String(mode.stateKey||''),
        String(mode.initial||'')
      )===String(mode.value||'')
    );
  },
  update(entity,now=performance.now()){
    if(
      !entity?.alive||
      !EntitySimulationAuthorityService.isLocal(entity)
    )return false;

    let changed=false;
    const dodging=Number(entity.dodgeUntil)>now;

    for(const module of entity.character?.passives||[]){
      if(module?.type!=='dodge.trail-field')continue;
      const key=this.runtimeKey(module);
      const allowed=dodging&&this.modeAllowed(entity,module);
      let state=entity.actionState?.get(key)||null;

      if(!allowed){
        if(state?.kind===this.KIND){
          entity.actionState.delete(key);
          changed=true;
        }
        continue;
      }

      const x=Number(entity.x)||0;
      const y=Number(entity.y)||0;
      if(!state||state.kind!==this.KIND){
        state={
          kind:this.KIND,
          lastX:x,
          lastY:y
        };
        entity.actionState.set(key,state);
        continue;
      }

      const dx=x-state.lastX;
      const dy=y-state.lastY;
      const distance=Math.hypot(dx,dy);
      const spacing=Math.max(4,Number(module.spacing)||14);
      if(distance<spacing)continue;

      const steps=Math.min(
        16,
        Math.max(1,Math.floor(distance/spacing))
      );
      for(let index=1;index<=steps;index++){
        const ratio=Math.min(1,(spacing*index)/distance);
        const point={
          x:state.lastX+dx*ratio,
          y:state.lastY+dy*ratio
        };
        InstalledAreaFieldService.activatePoint(
          entity,
          module.field,
          point,
          {now}
        );
      }

      state.lastX=x;
      state.lastY=y;
      changed=true;
    }

    return changed;
  }
});