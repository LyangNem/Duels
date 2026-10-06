

window.addEventListener('contextmenu',()=>{
  if(
    OnlineChatService.openState
  ){
    OnlineChatService
      .syncDraftFromInput();
  }
},{capture:true});