

/* 계정 UI */
const AccountUI = Object.freeze({
  setMessage(text = '', kind = '') {
    const el = document.getElementById('duels3-account-message');
    el.textContent = text;
    el.className = `duels3-account-msg${kind ? ` ${kind}` : ''}`;
  },
  setTab() {
    this.setMessage();
  },
  getGuestIdentity() {
    const key = DUELS3_CONFIG.storageKeys.guestIdentity;
    let id = String(localStorage.getItem(key) || '').trim();
    if (!id) {
      id = (crypto?.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`).toLowerCase();
      localStorage.setItem(key, id);
    }
    return id;
  },
  enter(account, mode = 'account') {
    const savedMainCharacterId=
      (
        typeof account.mainCharacterId==='string'&&
        account.mainCharacterId
      )
        ?account.mainCharacterId
        :(
          typeof account.profile?.mainCharacterId==='string'&&
          account.profile.mainCharacterId
            ?account.profile.mainCharacterId
            :null
        );
    const savedMainCharacterExplicit=
      account.mainCharacterExplicit===true||
      account.profile?.mainCharacterExplicit===true;

    account.mainCharacterId=savedMainCharacterId;
    account.mainCharacterExplicit=savedMainCharacterExplicit;
    account.profile={
      ...(account.profile||{}),
      mainCharacterId:savedMainCharacterId,
      mainCharacterExplicit:savedMainCharacterExplicit
    };
    AccountState.current = account;
    if(globalThis.DebugPanel&&!DebugAccessService.canUse(account))DebugPanel.close();
    if(mode === 'firebase') {
      localStorage.setItem(
        DUELS3_CONFIG.storageKeys.session,
        JSON.stringify({
          mode:'firebase',
          firebaseUid:
            account.firebaseUid||
            account.accountId,
          updatedAt:Date.now()
        })
      );
      if(account.firebaseSyncPending!==true){
        FirebaseAccountCacheService.save(
          account,
          {
            uid:
              account.firebaseUid||
              account.accountId
          }
        );
      }
    } else {
      localStorage.setItem(DUELS3_CONFIG.storageKeys.session, JSON.stringify({mode:'guest',updatedAt:Date.now()}));
    }
    document.getElementById('duels3-account-gate').classList.add('hidden');
    this.updateChip();
    requestAnimationFrame(()=>{
      ProfileSettingsUI.render();
      if(!account.isGuest){
        CharacterRecordService.loadAllRankings().catch(()=>{});
      }
      InviteLinkService.consume();

      const prewarmCharacterSelection=()=>{
        try{
          Training.renderCharacterCards();
        }catch(_){}
      };

      if('requestIdleCallback' in window){
        requestIdleCallback(
          prewarmCharacterSelection,
          {timeout:1200}
        );
      }else{
        setTimeout(
          prewarmCharacterSelection,
          120
        );
      }
    });
  },
  enterGuest() {
    const id = this.getGuestIdentity();
    this.enter({accountId:`guest-${id}`,displayName:'게스트',isGuest:true,characterRecords:{},characterStats:{},mainCharacterId:null,mainCharacterExplicit:false,profile:{mainCharacterId:null,mainCharacterExplicit:false},permissions:{debugTools:false,accountAdmin:false,rankingAdmin:false}}, 'guest');
  },
  logout() {
    const wasFirebase=AccountState.current?.firebaseAccount===true;
    localStorage.removeItem(DUELS3_CONFIG.storageKeys.session);
    DebugPanel?.close?.();
    AccountState.current = null;
    if(wasFirebase){globalThis.DuelsFirebase?.signOutCurrent?.().catch?.(()=>{});}
    document.getElementById('duels3-account-gate').classList.remove('hidden');
    this.setMessage();
    this.updateChip();
  },
  async cancelFirebaseMigration(){
    const account=AccountState.current;
    if(
      !account ||
      account.firebaseAccount!==true ||
      !String(account.legacyAccountId||'').trim()
    ){
      alert('취소할 마이그레이션 계정이 아닙니다.');
      return false;
    }

    const legacyAccountId=String(account.legacyAccountId||'').trim();
    const confirmed=confirm(
      `마이그레이션을 취소할까요?\n\n`+
      `Firebase에 저장된 현재 듀얼즈 계정 데이터는 삭제되고, 기존 GitHub 계정(${legacyAccountId}) 데이터는 그대로 유지됩니다.\n`+
      `다시 마이그레이션하면 GitHub에 남아 있는 기존 계정 데이터를 기준으로 새로 가져옵니다.`
    );
    if(!confirmed)return false;

    const fb=globalThis.DuelsFirebase;
    const user=fb?.currentUser?.();
    if(!fb||!user){
      alert('Firebase 로그인이 필요합니다.');
      return false;
    }
    if(
      account.firebaseUid &&
      String(account.firebaseUid)!==String(user.uid)
    ){
      alert('현재 Google 계정과 마이그레이션된 계정이 일치하지 않습니다.');
      return false;
    }

    try{
      /* 서버의 1:1 바인딩을 먼저 해제한다. 서버 해제가 실패하면 Firebase 문서는 지우지 않는다. */
      const cancelled=
        await LegacyMigrationService.cancelBinding(
          legacyAccountId
        );

      if(cancelled?.accountReset!==true){
        throw new Error(
          '서버에서 계정 초기화가 완료되지 않았습니다.'
        );
      }

      localStorage.removeItem(
        DUELS3_CONFIG.storageKeys.session
      );
      DebugPanel?.close?.();
      AccountState.current=null;
      this.updateChip();

      document
        .getElementById(
          'duels3-account-gate'
        )
        ?.classList.add('hidden');

      FirebaseAccountMigrationUI.open(
        user
      );

      FirebaseAccountMigrationUI.message(
        cancelled?.rankingCleanupPending
          ?`마이그레이션을 취소했습니다. 계정 초기화는 완료됐고 랭킹 정리는 다음 전체 랭킹 재구축 때 반영됩니다. 기존 GitHub 계정 ${legacyAccountId} 데이터는 그대로 유지됩니다.`
          :`마이그레이션을 취소했습니다. 기존 GitHub 계정 ${legacyAccountId} 데이터는 그대로 유지되며, 이 Google 계정은 다시 마이그레이션하거나 새 계정으로 시작할 수 있습니다.`,
        'success'
      );

      return true;
    }catch(error){
      alert(error?.message||'마이그레이션 취소에 실패했습니다.');
      return false;
    }
  },
  setSyncState(text='연결됨',state=''){
    const el=
      document.getElementById(
        'duels3-account-sync-state'
      );
    if(!el)return;
    el.textContent=String(text||'');
    if(state)el.dataset.state=state;
    else delete el.dataset.state;
  },
  updateChip() {
    const chip = document.getElementById('duels3-account-chip');
    const user = AccountState.current;
    chip.replaceChildren();
    chip.style.display = user ? 'flex' : 'none';
    if (!user) { chip.replaceChildren(); return; }

    const strong = document.createElement('strong');
    strong.textContent = user.isGuest ? '게스트' : (user.displayName || user.accountId);
    chip.appendChild(strong);

    const status = document.createElement('span');
    if (user.isGuest) {
      status.dataset.state = 'guest';
      status.textContent = '레코드 저장 안 됨';
    } else {
      status.id = 'duels3-account-sync-state';
      status.textContent =
        user.firebaseSyncPending===true
          ?'동기화 중'
          :'연결됨';
      if(user.firebaseSyncPending===true){
        status.dataset.state='syncing';
      }
    }
    chip.appendChild(status);

    const logout = document.createElement('button');
    logout.type = 'button';
    logout.textContent = user.isGuest ? '로그인' : '로그아웃';
    logout.addEventListener('click', () => this.logout());
    chip.appendChild(logout);
  },
  async restoreSession() {
    let session = null;
    try { session = JSON.parse(localStorage.getItem(DUELS3_CONFIG.storageKeys.session) || 'null'); } catch (_) {}
    if (session?.mode === 'guest') {
      this.enterGuest();
      return true;
    }
    if(session?.mode && session.mode!=='firebase'){
      localStorage.removeItem(DUELS3_CONFIG.storageKeys.session);
    }
    return false;
  }});