

window.addEventListener('pagehide',()=>{
  GameInputResetService.releaseAll();
});