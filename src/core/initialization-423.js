

document.addEventListener('contextmenu',event=>{
  if(DebugMapEditorService.active){
    event.preventDefault();
    return;
  }
  if(CharacterCardInteractionService.handleContextMenu(event))return;
  event.preventDefault();
});