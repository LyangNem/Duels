

/* 표현 */
const WorldViewportVisibilityService=Object.freeze({
  bounds(inset=0){
    const camera=Training.cameraState,canvas=Training.canvas||GAME_DATA.canvas;
    const zoom=Math.max(.01,CameraFovService.scale(performance.now())*Training.spectatorZoom());
    const shake=ScreenShakeService.offset(performance.now());
    const cx=camera.x+canvas.width/2-shake.x,cy=camera.y+canvas.height/2-shake.y;
    return {left:cx-canvas.width/2/zoom+inset,top:cy-canvas.height/2/zoom+inset,right:cx+canvas.width/2/zoom-inset,bottom:cy+canvas.height/2/zoom-inset};
  },
  followedBounds(entity,now=performance.now()){
    const canvas=Training.canvas||GAME_DATA.canvas;
    // This is the followed player's view: observer spectator zoom must not change its world size.
    const zoom=Math.max(.01,CameraFovService.scale(now));
    const width=canvas.width/zoom,height=canvas.height/zoom;
    const overscan=Math.max(0,Number(GAME_DATA.cameraFollow.edgeOverscanRatio)||0);
    const ox=canvas.width*overscan,oy=canvas.height*overscan;
    const left=Math.max(-ox,Math.min(Math.max(-ox,WorldBoundsService.width()-width+ox),Number(entity.x)-width/2));
    const top=Math.max(-oy,Math.min(Math.max(-oy,WorldBoundsService.height()-height+oy),Number(entity.y)-height/2));
    return {left,top,right:left+width,bottom:top+height};
  },
  containsWorldPoint(x,y,margin=0){
    const b=this.bounds(-margin);
    return x>=b.left&&x<=b.right&&y>=b.top&&y<=b.bottom;
  },
  clampWorldPoint(x,y,inset=24){
    const b=this.bounds(Math.max(0,Number(inset)||0));
    return {x:Math.max(b.left,Math.min(b.right,Number(x)||0)),y:Math.max(b.top,Math.min(b.bottom,Number(y)||0))};
  }
});
