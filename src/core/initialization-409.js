

window.addEventListener('mousedown',event=>{
  if(!OnlineChatService.openState)return;

  const inputWrap=
    document.getElementById(
      'chat-input-wrap'
    );

  // 실제 채팅 입력 영역을 누른 경우에만 열린 상태를 유지한다.
  if(
    inputWrap?.contains(
      event.target
    )
  )return;

  // 입력 영역 바깥을 누르면 작성 내용만 보존하고 채팅창은 닫는다.
  OnlineChatService
    .syncDraftFromInput();
  OnlineChatService.close();
});