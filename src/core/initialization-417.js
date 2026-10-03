

trainingCanvas?.addEventListener(
  'wheel',
  event=>{
    if(DebugMapEditorService.active){
      if(
        DebugMapEditorService
          .adjustZoom(event.deltaY)
      ){
        event.preventDefault();
      }
      return;
    }

    if(
      !Training.active||
      !Training.spectating||
      DebugPanel.capturesGameInput()
    )return;

    if(
      Training.spectatorAdjustZoom(
        event.deltaY
      )
    ){
      event.preventDefault();
    }
  },
  {passive:false}
);