

/* 입력 */
const GameInputResetService=Object.freeze({
  releaseAll(){
    if(Training.active&&Training.keys.has('ShiftLeft')){
      Training.releaseInput('counter');
    }
    Training.keys.clear();
    PointerHoldInputService.releaseAll();
    DragPathInputService.clearAll(Training.player);
    return true;
  }
});