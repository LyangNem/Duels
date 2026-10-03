
trainingCanvas?.addEventListener('mousedown',event=>{
  if(DebugMapEditorService.active){
    if(
      DebugMapEditorService
        .beginPointer(event)
    ){
      event.preventDefault();
      event.stopPropagation();
    }
    return;
  }

  if(!Training.active||DebugPanel.capturesGameInput()||CharacterCommandInputService.capturesGameInput())return;

  if(Training.spectating){
    if(event.button===0){
      if(Training.spectatorPickPlayer()){
        event.preventDefault();
      }
      return;
    }

    if(event.button===2){
      Training.spectatorReleaseFollow();
      event.preventDefault();
      return;
    }
  }

  const slot=PointerHoldInputService.slot(event.button);
  if(!slot)return;

  event.preventDefault();
  PointerHoldInputService.press(slot);
});