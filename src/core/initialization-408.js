

// 화면 전환/DOM 포커스 이동으로 blur되어도 작성 중 채팅은 닫지 않는다.
// 닫기는 Enter 전송, Escape, 명시적 외부 클릭 경로에서만 수행한다.
document.getElementById('chat-input')?.addEventListener('blur',()=>{
  OnlineChatService.syncDraftFromInput();
});