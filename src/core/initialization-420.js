

document.addEventListener('visibilitychange',()=>{
  if(document.hidden){
    CharacterCommandInputService.close();
    GameInputResetService.releaseAll();
  }
});