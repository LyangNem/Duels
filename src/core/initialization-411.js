

window.addEventListener('keyup',event=>{
  Training.keys.delete(event.code);
  if(DebugMapEditorService.active){
    if(
      ['KeyW','KeyA','KeyS','KeyD','Space']
        .includes(event.code)
    ){
      event.preventDefault();
      event.stopPropagation();
    }
  }
  if(event.code==='ShiftLeft'&&Training.active){
    Training.releaseInput('counter');
  }
  if(DebugPanel.capturesGameInput()){
    event.preventDefault();
    event.stopPropagation();
  }
});