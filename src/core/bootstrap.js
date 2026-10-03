

function bootstrap() {
  AuthResolutionUI.setPending(true);

  const authResolutionFailsafe=
    setTimeout(()=>{
      if(!AuthResolutionUI.pending)return;

      console.error(
        '[Duels] Firebase 로그인 상태 판정 시간 초과'
      );

      document
        .getElementById(
          'duels3-account-gate'
        )
        ?.classList.remove('hidden');

      AccountUI.setMessage(
        '로그인 상태를 확인하지 못했습니다. 다시 로그인해주세요.',
        'error'
      );

      resolveAuthState();
    },10000);

  const resolveAuthState=()=>{
    clearTimeout(
      authResolutionFailsafe
    );
    AuthResolutionUI.resolve();
  };

  FirebaseAccountMigrationUI.bind();

  document.getElementById('duels3-guest-button')?.addEventListener('click', () => AccountUI.enterGuest());

  document.getElementById('duels3-google-login-button')?.addEventListener('click', async()=>{
    AuthResolutionUI.setPending(true);
    AccountUI.setMessage('Google 로그인 중입니다.');
    try{
      if(!globalThis.DuelsFirebase){throw new Error('Firebase 초기화를 기다리는 중입니다. 잠시 후 다시 시도하세요.');}
      const result=await globalThis.DuelsFirebase.signInGoogle();
      AccountUI.setMessage('');
      document.getElementById('duels3-account-gate')?.classList.add('hidden');
      await FirebaseAccountMigrationUI.afterGoogleLogin(result);
      resolveAuthState();
    }catch(error){
      AccountUI.setMessage(error?.message||'Google 로그인에 실패했습니다.','error');
      document.getElementById('duels3-account-gate')?.classList.remove('hidden');
      resolveAuthState();
    }
  });

  document.getElementById('duels-display-settings-open')?.addEventListener('click',()=>{
    PanelController.toggle('settings');
  });

  document.getElementById('duels-display-settings-close')?.addEventListener('click',()=>{
    ProfileSettingsUI.setPickerOpen(false);
    PanelController.toggle('settings',false);
  });

  document.getElementById('duels-setting-screen-shake')?.addEventListener('input',event=>{
    DisplaySettings.set(
      'screenShake',
      Number(event.target.value)
    );
    DisplaySettings.syncUi();
  });

  document.getElementById('duels-setting-dynamic-fov')?.addEventListener('input',event=>{
    DisplaySettings.set(
      'dynamicFov',
      Number(event.target.value)
    );
    DisplaySettings.syncUi();
  });

  document.getElementById('duels-setting-sound-volume')?.addEventListener('input',event=>{
    DisplaySettings.set(
      'soundVolume',
      Number(event.target.value)
    );
    DisplaySettings.syncUi();
  });

  document.getElementById('duels-setting-natural-regen-timer')?.addEventListener('change',event=>{
    DisplaySettings.set(
      'naturalRegenTimer',
      event.target.checked
    );
  });

  document.getElementById('duels-setting-health-bar-segments')?.addEventListener('change',event=>{
    DisplaySettings.set(
      'healthBarSegments',
      event.target.checked
    );
  });

  document.getElementById('duels-setting-ko-effects')?.addEventListener('change',event=>{
    DisplaySettings.set('koEffects',event.target.checked);
  });

  document.getElementById('duels-setting-character-card-illustrations')?.addEventListener('change',event=>{
    DisplaySettings.set('characterCardIllustrations',event.target.checked);
  });

  const worldNameRow=
    document.getElementById(
      'duels-setting-world-name-row'
    );
  const cycleWorldName=()=>{
    DisplaySettings.set(
      'worldNameMode',
      WorldNamePresentationService.next(
        DisplaySettings.state.worldNameMode
      )
    );
    DisplaySettings.syncUi();
  };

  worldNameRow?.addEventListener(
    'click',
    event=>{
      if(
        event.target.closest(
          '#duels-setting-world-name-mode'
        )||
        event.target===worldNameRow||
        worldNameRow.contains(event.target)
      ){
        cycleWorldName();
      }
    }
  );
  worldNameRow?.addEventListener(
    'keydown',
    event=>{
      if(
        event.key!=='Enter'&&
        event.key!==' '
      )return;
      event.preventDefault();
      cycleWorldName();
    }
  );

  DisplaySettings.syncUi();

  document.querySelectorAll('[data-main-action]').forEach(button => {
    button.addEventListener('click', () => {
      const action=button.dataset.mainAction;
      if(action==='training'){Training.showSelect();return}
      if(action==='host'){RoomService.host();return}
      if(action==='join'){RoomService.showJoin();return}
    });
  });
  document.querySelectorAll('[data-panel-open]').forEach(button => {
    button.addEventListener('click', () => PanelController.toggle(button.dataset.panelOpen));
  });
  document.querySelectorAll('[data-panel-close]').forEach(button => {
    button.addEventListener('click', () => PanelController.toggle(button.dataset.panelClose, false));
  });
  document.querySelectorAll('[data-help-tab]').forEach(button => {
    button.addEventListener('click', () => HelpTabs.open(button.dataset.helpTab));
  });
  document.querySelectorAll('[data-patch-tab]').forEach(button => {
    button.addEventListener('click', () => PatchTabs.open(button.dataset.patchTab));
  });

  RoomUI.init();
  duels3LoadPatchNotes().catch(()=>{});
  DuelsTipService.bind();
  DuelsTipService.load().catch(()=>{});

  const inviteCode=InviteLinkService.pendingCode();
  let savedSession=null;
  try{
    savedSession=JSON.parse(
      localStorage.getItem(DUELS3_CONFIG.storageKeys.session)||'null'
    );
  }catch(_){}

  if(savedSession?.mode && !['firebase','guest'].includes(savedSession.mode)){
    localStorage.removeItem(DUELS3_CONFIG.storageKeys.session);
    savedSession=null;
  }

  if(inviteCode&&!savedSession){
    AccountUI.enterGuest();
    resolveAuthState();
    return;
  }

  if(savedSession?.mode==='guest'){
    AccountUI.enterGuest();
    resolveAuthState();
    return;
  }

  const restoreFirebase=()=>{
    const fb=globalThis.DuelsFirebase;
    if(!fb)return false;

    const gate=
      document.getElementById(
        'duels3-account-gate'
      );

    // Firebase가 저장된 로그인 상태를 IndexedDB/localStorage에서
    // 복원하는 동안 로그인 화면을 먼저 띄우지 않는다.
    gate?.classList.add('hidden');

    const unsubscribe=
      fb.onAuthStateChanged(
        fb.auth,
        async user=>{
          unsubscribe?.();

          if(!user){
            localStorage.removeItem(
              DUELS3_CONFIG.storageKeys.session
            );
            gate?.classList.remove('hidden');
            resolveAuthState();
            return;
          }

          try{
            gate?.classList.add('hidden');
            await FirebaseAccountMigrationUI
              .afterGoogleLogin(user);
            resolveAuthState();
          }catch(error){
            localStorage.removeItem(
              DUELS3_CONFIG.storageKeys.session
            );
            gate?.classList.remove('hidden');
            AccountUI.setMessage(
              error?.message||
              'Firebase 계정 복원에 실패했습니다.',
              'error'
            );
            resolveAuthState();
          }
        }
      );

    return true;
  };

  if(!restoreFirebase()){
    window.addEventListener('duels-firebase-ready',()=>restoreFirebase(),{once:true});
  }
}