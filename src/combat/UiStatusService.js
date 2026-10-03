

const UiStatusService=Object.freeze({
  set(id,text='',state=''){
    const node=document.getElementById(id);
    if(!node)return false;
    node.textContent=String(text||'');
    node.className=`status${state?` ${state}`:''}`;
    return true;
  }
});