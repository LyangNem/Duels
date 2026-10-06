

/* 캐릭터 설명 */
const CharacterTooltip={
  element:null,
  ensure(){
    if(this.element?.isConnected)return this.element;
    const tip=document.createElement('div');
    tip.className='duels3-global-char-tooltip';
    document.body.appendChild(tip);
    this.element=tip;
    return tip;
  },
  show(card){
    const source=card?.querySelector(':scope > .char-tooltip');
    if(!source)return;
    const tip=this.ensure();
    tip.innerHTML=source.innerHTML;
    tip.style.display='block';
    CharacterTooltipPointerTracking.start();
  },
  move(clientX,clientY){
    const tip=this.element;
    if(!tip||tip.style.display==='none')return;
    const gap=14;
    const rect=tip.getBoundingClientRect();
    const vw=document.documentElement.clientWidth;
    const vh=document.documentElement.clientHeight;
    let left=clientX+gap;
    let top=clientY+gap;
    if(left+rect.width>vw-8)left=clientX-rect.width-gap;
    if(top+rect.height>vh-8)top=clientY-rect.height-gap;
    tip.style.left=`${Math.max(8,left)}px`;
    tip.style.top=`${Math.max(8,top)}px`;
  },
  hide(){
    if(this.element)this.element.style.display='none';
    CharacterTooltipPointerTracking.stop();
  }
};