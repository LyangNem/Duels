

const PlayerDisplayNameService=Object.freeze({
  profile(pid){
    return RoomService?.members?.get?.(pid)?.profile||null;
  },
  resolve(pid,profile=null){
    const id=String(pid||'플레이어');
    const data=profile||this.profile(id)||{};

    if(data.isGuest===true){
      return id;
    }

    const displayName=String(
      data.displayName||
      data.accountId||
      ''
    ).trim();

    return displayName||id;
  }
});