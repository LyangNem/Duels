

const WorldNamePresentationService=Object.freeze({
  modes:Object.freeze([
    'both',
    'nickname',
    'character'
  ]),
  next(mode){
    const index=this.modes.indexOf(mode);
    return this.modes[
      (index+1+this.modes.length)%
      this.modes.length
    ];
  },
  nickname(entity){
    const pid=
      OnlineParticipantEntityService.pid(entity);
    if(pid){
      return PlayerDisplayNameService.resolve(pid);
    }

    if(entity?.kind==='player'){
      return String(
        AccountState.current?.displayName||
        AccountState.current?.accountId||
        entity?.displayName||
        '플레이어'
      );
    }

    return String(
      entity?.displayName||
      AccountState.current?.displayName||
      AccountState.current?.accountId||
      '플레이어'
    );
  },
  label(entity){
    const nickname=this.nickname(entity);
    const character=
      entity?.character?.name||
      '캐릭터';

    switch(DisplaySettings.state.worldNameMode){
      case 'nickname':
        return nickname;
      case 'character':
        return character;
      default:
        return `${nickname} • ${character}`;
    }
  }
});