


const EntityTargetReferenceService=Object.freeze({
  encode(entity){
    if(!entity)return '';

    if(
      entity.kind==='player'&&
      Training.sessionMode==='online'
    ){
      const pid=
        OnlineParticipantEntityService.pid(
          entity
        );
      if(pid)return `pid:${pid}`;
    }

    return entity.id
      ?`entity:${String(entity.id)}`
      :'';
  },
  resolve(reference){
    const value=String(reference||'');
    if(!value)return null;

    if(value.startsWith('pid:')){
      return OnlineParticipantEntityService.entity(
        value.slice(4)
      );
    }

    if(value.startsWith('entity:')){
      return EntityService.items.get(
        value.slice(7)
      )||null;
    }

    // 3.821 이하의 로컬 entity id 저장값도 읽을 수 있게 유지한다.
    return (
      EntityService.items.get(value)||
      OnlineParticipantEntityService.entity(value)||
      null
    );
  }
});