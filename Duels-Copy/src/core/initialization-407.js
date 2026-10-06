

document.getElementById('chat-input')?.addEventListener('input',()=>{
  OnlineChatService.syncDraftFromInput();
});