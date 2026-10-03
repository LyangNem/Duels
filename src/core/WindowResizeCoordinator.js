






const WindowResizeCoordinator={
  frame:0,
  request(){
    cancelAnimationFrame(this.frame);
    this.frame=requestAnimationFrame(()=>{
      this.frame=0;
      CharacterTooltip.hide();
      MatchSelectionLayoutService.refresh();

      if(Training.active){
        Training.resize();
      }
    });
  }
};