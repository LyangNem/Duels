

const CameraAimOffsetService=Object.freeze({
  offset(entity){
    if(!entity?.alive||typeof ChargedAttackService==='undefined')return {x:0,y:0};
    let config=null;
    let activeProgress=0;
    for(const state of ChargedAttackService.states(entity)){
      const attack=ChargedAttackService.attack(entity,state);
      if(!attack?.cameraAimOffset||state.cameraAimSuppressed===true)continue;
      const progress=ChargedAttackService.progress(state,attack,performance.now());
      const minProgress=Math.max(0,Number(attack.cameraAimOffset.minProgress)||0);
      if(progress+1e-6<minProgress)continue;
      config=attack.cameraAimOffset;
      activeProgress=progress;
      break;
    }
    if(!config)return {x:0,y:0};
    const canvas=Training.canvas||document.getElementById('gameCanvas');
    if(!canvas)return {x:0,y:0};
    const rect=canvas.getBoundingClientRect();
    const cx=rect.left+rect.width/2;
    const cy=rect.top+rect.height/2;
    const dx=(Number(Training.mouse?.x)||cx)-cx;
    const dy=(Number(Training.mouse?.y)||cy)-cy;
    const length=Math.hypot(dx,dy);
    if(length<=.001)return {x:0,y:0};
    const maxDistance=Math.max(0,Number(config.maxDistance)||0);
    const reference=Math.max(1,Math.min(rect.width,rect.height)/2);
    const strength=Math.min(1,length/reference);
    return {
      x:dx/length*maxDistance*strength,
      y:dy/length*maxDistance*strength
    };
  }
});