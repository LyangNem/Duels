
gameWrapper?.addEventListener('mousedown',event=>{
  if(
    event.target===trainingCanvas||
    !Training.active||
    DebugPanel.capturesGameInput()||
    CharacterCommandInputService.capturesGameInput()
  )return;

  const slot=PointerHoldInputService.slot(event.button);
  if(!slot)return;

  event.preventDefault();
  PointerHoldInputService.press(slot);
});