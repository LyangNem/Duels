
window.addEventListener('mousemove',event=>{
  Training.mouse.x=event.clientX;
  Training.mouse.y=event.clientY;

  if(DebugMapEditorService.active){
    DebugMapEditorService.movePointer(event);
    return;
  }

  DragPathInputService.sample(performance.now());
});