

window.addEventListener('blur',()=>{
  CharacterCommandInputService.close();
  GameInputResetService.releaseAll();
});