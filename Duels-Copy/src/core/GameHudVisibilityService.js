

const GameHudVisibilityService=Object.freeze({
  selectors:Object.freeze([
    '#game-wrapper',
    '#hud',
    '#aug-wrapper',
    '#round-score',
    '#round-result-overlay',
    '#chat-wrap',
    '#training-hud',
    '#training-stats',
    '#mobile-debug-button'
  ]),
  syncMobileDebugButton(){
    const button=document.getElementById('mobile-debug-button');
    if(!button)return false;
    const visible=
      document.documentElement.dataset.duelsMobile==='true'&&
      DebugAccessService.canUse()&&
      Training.active===true;
    button.style.display=visible?'block':'none';
    return visible;
  },
  hideAll(){
    const keepChatVisible=
      OnlineChatService.available();
    const keepChatOpen=
      OnlineChatService.openState&&
      keepChatVisible;

    for(const selector of this.selectors){
      if(
        selector==='#chat-wrap'&&
        keepChatVisible
      )continue;

      const node=
        document.querySelector(
          selector
        );
      if(!node)continue;
      node.style.display='none';
    }

    if(keepChatOpen){
      OnlineChatService
        .preserveAcrossScreenChange();
    }else{
      document
        .getElementById(
          'chat-history-panel'
        )
        ?.style.setProperty(
          'display',
          'none'
        );
      document
        .getElementById(
          'chat-input-wrap'
        )
        ?.style.setProperty(
          'display',
          'none'
        );
    }

    return true;
  },
  showGame(){
    const wrapper=document.getElementById('game-wrapper');
    const hud=document.getElementById('hud');

    if(wrapper)wrapper.style.display='flex';
    if(hud)hud.style.display='flex';

    this.syncMobileDebugButton();
    OnlineChatService.syncVisibility();

    return true;
  }
});