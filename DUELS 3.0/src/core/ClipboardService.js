

const ClipboardService=Object.freeze({
  async copy(text){
    const value=String(text||'');
    if(!value)return false;
    if(navigator.clipboard?.writeText&&globalThis.isSecureContext){
      try{await navigator.clipboard.writeText(value);return true}catch(_){}
    }
    const area=document.createElement('textarea');
    area.value=value;
    area.setAttribute('readonly','');
    area.style.cssText='position:fixed;left:-9999px;top:0;opacity:0';
    document.body.appendChild(area);
    area.select();
    area.setSelectionRange(0,area.value.length);
    let ok=false;
    try{ok=document.execCommand('copy')}catch(_){ok=false}
    area.remove();
    return ok;
  },
  feedback(button,base,ok){
    if(!button)return;
    clearTimeout(button._copyTimer);
    button.textContent=ok?'복사됨 ✓':'복사 실패';
    button.style.borderColor=ok?'#4a8':'#a44';
    button.style.color=ok?'#4a8':'#f88';
    button._copyTimer=setTimeout(()=>{
      button.textContent=base;
      button.style.removeProperty('border-color');
      button.style.removeProperty('color');
    },2000);
  }
});