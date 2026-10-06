

const CombatHudInputShieldService=Object.freeze({
  bind(){
    const wrapper=document.getElementById('aug-wrapper');
    if(!wrapper)return false;

    // aug-wrapper는 game-wrapper 바깥에 있으므로 버블링만으로는
    // 전투 입력에 도달하지 않는다. 동일 PointerHoldInputService를 직접 사용한다.
    wrapper.addEventListener(
      'mousedown',
      event=>{
        if(
          !Training.active||
          DebugPanel.capturesGameInput()
        )return;

        const slot=
          PointerHoldInputService.slot(
            event.button
          );
        if(!slot)return;

        event.preventDefault();
        PointerHoldInputService.press(slot);
      }
    );

    wrapper.addEventListener(
      'contextmenu',
      event=>{
        event.preventDefault();
      }
    );

    return true;
  }
});