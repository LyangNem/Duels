

/* 표현 */
const WorldViewportVisibilityService=Object.freeze({
  containsWorldPoint(x,y,margin=0){
    const camera=Training.cameraState;
    const left=camera.x-margin;
    const top=camera.y-margin;
    const right=
      camera.x+GAME_DATA.canvas.width+margin;
    const bottom=
      camera.y+GAME_DATA.canvas.height+margin;

    return (
      x>=left&&x<=right&&
      y>=top&&y<=bottom
    );
  },
  clampWorldPoint(x,y,inset=24){
    const camera=Training.cameraState;
    const safeInset=Math.max(0,Number(inset)||0);
    const left=camera.x+safeInset;
    const top=camera.y+safeInset;
    const right=camera.x+GAME_DATA.canvas.width-safeInset;
    const bottom=camera.y+GAME_DATA.canvas.height-safeInset;
    return {
      x:Math.max(left,Math.min(right,Number(x)||0)),
      y:Math.max(top,Math.min(bottom,Number(y)||0))
    };
  }
});