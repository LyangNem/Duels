

const CharacterTooltipPointerTracking={
  active:false,
  move(event){
    CharacterTooltip.move(
      event.clientX,
      event.clientY
    );
  },
  start(){
    if(this.active)return;
    this.active=true;
    document.addEventListener(
      'pointermove',
      this.move,
      true
    );
  },
  stop(){
    if(!this.active)return;
    this.active=false;
    document.removeEventListener(
      'pointermove',
      this.move,
      true
    );
  }
};