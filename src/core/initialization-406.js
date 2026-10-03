

window.addEventListener('keydown',event=>{
  SoundService.unlock();

  if(DebugMapEditorService.active){
    if(event.code==='Escape'){
      event.preventDefault();
      event.stopPropagation();
      DebugMapEditorService.stop();
      return;
    }

    if(
      ['KeyW','KeyA','KeyS','KeyD'].includes(event.code)
    ){
      event.preventDefault();
      Training.keys.add(event.code);
      return;
    }

    if(event.code==='Space'){
      event.preventDefault();
      if(!event.repeat){
        DebugMapEditorService.dash();
      }
      return;
    }
  }

  if(
    event.code==='Backquote'&&
    DebugAccessService.canUse()&&
    (
      DebugPanel.open||
      !DebugPanel.isTypingTarget(event.target)
    )
  ){
    event.preventDefault();
    event.stopPropagation();
    GameInputResetService.releaseAll();
    DebugPanel.toggle();
    return;
  }

  if(DebugPanel.capturesGameInput()){
    if(event.code==='Escape'&&!DebugPanel.isTypingTarget(event.target)){
      event.preventDefault();
      event.stopPropagation();
      DebugPanel.close();
    }
    return;
  }


  if(CharacterCommandInputService.handleKeydown(event))return;

  if(OnlineChatService.handleKeydown(event))return;

  if(!Training.active)return;
  Training.keys.add(event.code);

  if(event.code==='Tab'){
    event.preventDefault();
  }

  if(event.code==='Space'){
    event.preventDefault();

    if(!event.repeat){
      if(Training.spectating){
        Training.spectatorDash();
      }else{
        Training.dodge();
      }
    }
  }

  if(event.code==='ShiftLeft'){
    event.preventDefault();
    if(!event.repeat)Training.use('counter');
  }

  if(event.code==='Escape'){
    const opened=['training-settings-panel','training-char-panel','training-aug-panel'].some(id=>document.getElementById(id));
    if(opened){
      event.preventDefault();
      Training.closePanels();
      Training.buildHud();
    }
  }
});