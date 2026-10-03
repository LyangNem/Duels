

const InviteLinkService=Object.freeze({
  parameter:'room',
  pendingCode(){
    try{
      const code=new URL(location.href).searchParams.get(this.parameter);
      return /^\d{4}$/.test(String(code||''))?String(code):'';
    }catch(_){
      return '';
    }
  },
  url(code=RoomService.code){
    const value=String(code||'').trim();
    if(!/^\d{4}$/.test(value))return '';
    const url=new URL(location.href);
    url.searchParams.set(this.parameter,value);
    url.hash='';
    return url.toString();
  },
  clear(){
    try{
      const url=new URL(location.href);
      if(!url.searchParams.has(this.parameter))return;
      url.searchParams.delete(this.parameter);
      history.replaceState(null,'',url.toString());
    }catch(_){}
  },
  consume(){
    const code=this.pendingCode();
    if(!code||!AccountState.current)return false;
    this.clear();
    RoomService.join(code);
    return true;
  }
});