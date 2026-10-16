

window.addEventListener('mouseup',event=>{
  if(DebugMapEditorService.active){
    if(
      DebugMapEditorService
        .endPointer(event)
    ){
      event.preventDefault();
      event.stopPropagation();
    }
    return;
  }

  const slot=PointerHoldInputService.slot(event.button);
  if(slot)PointerHoldInputService.release(slot);
});