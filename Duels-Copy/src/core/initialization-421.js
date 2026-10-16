

window.addEventListener('pagehide',()=>{
  GameInputResetService.releaseAll();
  if(RoomService.localPid)RoomService.leave({silent:true});
});