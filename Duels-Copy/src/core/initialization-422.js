

document.addEventListener('pointerdown',event=>{
  if(!Training.active)return;

  const target=event.target instanceof Element
    ?event.target
    :null;
  if(!target)return;

  // 게임 캔버스/월드가 아닌 UI 탭·버튼·입력 요소를 누르는 순간
  // 이전 프레임의 키/마우스 홀드 상태를 모두 해제한다.
  if(
    target.closest(
      'button,input,select,textarea,[role="tab"],.debug-tabs,.training-simple-panel'
    )
  ){
    GameInputResetService.releaseAll();
  }
},true);