

document.getElementById('mobile-debug-button')?.addEventListener('click',event=>{
  event.preventDefault();
  event.stopPropagation();
  if(!DebugAccessService.canUse())return;
  GameInputResetService.releaseAll();
  DebugPanel.toggle();
});