

const RoomIdentityService=Object.freeze({
  storageKey:'duels3.room.sessionIdentity.v1',
  deviceStorageKey:'duels3.room.deviceIdentity.v1',
  key(){
    let value='';
    try{
      value=String(
        sessionStorage.getItem(this.storageKey)||
        ''
      );
    }catch(_){}

    if(value)return value;

    value=
      globalThis.crypto?.randomUUID?.()||
      `room-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

    try{
      sessionStorage.setItem(
        this.storageKey,
        value
      );
    }catch(_){}

    return value;
  },
  deviceKey(){
    let value='';
    try{value=String(localStorage.getItem(this.deviceStorageKey)||'')}catch(_){}
    if(value)return value;
    value=globalThis.crypto?.randomUUID?.()||`device-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    try{localStorage.setItem(this.deviceStorageKey,value)}catch(_){}
    return value;
  },
  profileKey(profile,sessionKey=this.key()){
    const accountId=String(
      profile?.accountId||''
    ).trim();

    if(
      accountId&&
      profile?.isGuest!==true
    ){
      return `account:${accountId}`;
    }

    return `guest:${String(sessionKey||this.key())}`;
  }
});