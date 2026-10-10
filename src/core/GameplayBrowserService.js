const GameplayBrowserService={
  installed:false,
  enter(){
    if(this.installed)return;
    this.installed=true;
    window.addEventListener('keydown',event=>{
      if(!Training.active)return;
      if((event.ctrlKey||event.metaKey)&&(event.code==='KeyW'||String(event.key).toLowerCase()==='w')){
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    },true);
  }
};
