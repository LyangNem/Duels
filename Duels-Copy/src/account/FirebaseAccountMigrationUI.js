

const FirebaseAccountMigrationUI={
  legacyAccount:null,
  migrationToken:'',
  firebaseUser:null,
  gate(){return document.getElementById('duels3-migration-gate')},
  message(text='',kind=''){
    const el=document.getElementById('duels3-migration-message');
    if(!el)return;
    el.textContent=String(text||'');
    el.className=`duels3-migration-msg${kind?` ${kind}`:''}`;
  },
  setProgressWarning(show=true){
    document
      .getElementById(
        'duels3-migration-progress-warning'
      )
      ?.classList.toggle(
        'hidden',
        !show
      );
  },
  showForm(show=true){
    document.getElementById('duels3-migration-form')?.classList.toggle('hidden',!show);
    if(show){
      document.getElementById('duels3-new-account-form')?.classList.add('hidden');
      document.getElementById('duels3-migration-id')?.focus();
    }
  },
  showNewAccountForm(show=true){
    document.getElementById('duels3-new-account-form')?.classList.toggle('hidden',!show);
    if(show){
      document.getElementById('duels3-migration-form')?.classList.add('hidden');
      const input=document.getElementById('duels3-new-account-nickname');
      if(input){
        input.value='';
        setTimeout(()=>input.focus(),0);
      }
    }
  },
  resetLegacy(){
    this.legacyAccount=null;
    this.migrationToken='';
    const preview=document.getElementById('duels3-migration-preview');
    preview?.classList.add('hidden');
    if(preview)preview.replaceChildren();
    const confirm=document.getElementById('duels3-migration-confirm');
    if(confirm)confirm.disabled=true;
  },
  open(user){
    this.firebaseUser=user||globalThis.DuelsFirebase?.currentUser?.()||null;
    this.resetLegacy();
    this.showForm(false);
    this.showNewAccountForm(false);
    this.setProgressWarning(false);
    this.message('');
    const account=document.getElementById('duels3-migration-google-account');
    if(account){
      account.textContent=this.firebaseUser
        ?`Google 계정: ${this.firebaseUser.email||this.firebaseUser.displayName||this.firebaseUser.uid}`
        :'';
    }
    this.gate()?.classList.remove('hidden');
  },
  close(){this.gate()?.classList.add('hidden')},
  accountForGame(data,user){
    const profile=(data&&typeof data.profile==='object')?data.profile:{};
    const displayName=String(data?.displayName||user?.displayName||'플레이어').trim().slice(0,24)||'플레이어';
    const mainCharacterId=(typeof data?.mainCharacterId==='string'&&data.mainCharacterId)
      ?data.mainCharacterId
      :(typeof profile.mainCharacterId==='string'&&profile.mainCharacterId?profile.mainCharacterId:null);
    const mainCharacterExplicit=data?.mainCharacterExplicit===true||profile.mainCharacterExplicit===true;
    return {
      version:Number(data?.version)||2,
      accountId:String(user?.uid||data?.accountId||''),
      firebaseUid:String(user?.uid||''),
      legacyAccountId:String(data?.legacyAccountId||''),
      displayName,
      characterRecords:{...(data?.characterRecords||{})},
      characterStats:{...(data?.characterStats||{})},
      mainCharacterId,
      mainCharacterExplicit,
      profile:{...profile,mainCharacterId,mainCharacterExplicit},
      permissions:{
        debugTools:
          data?.permissions?.debugTools===true,
        accountAdmin:
          data?.permissions?.accountAdmin===true,
        rankingAdmin:
          data?.permissions?.rankingAdmin===true
      },
      firebaseAccount:true,
      isGuest:false
    };
  },
  async enterFirebaseProfile(profile,user){
    const account=this.accountForGame(profile,user);
    this.close();
    AccountUI.enter(account,'firebase');
    return account;
  },
  async afterGoogleLogin(resultOrUser){
    const user=
      resultOrUser?.user||
      resultOrUser||
      globalThis.DuelsFirebase
        ?.currentUser?.();

    if(!user){
      throw new Error(
        'Google 로그인 정보를 확인할 수 없습니다.'
      );
    }

    this.firebaseUser=user;

    const cached=
      FirebaseAccountCacheService
        .load(user);

    if(cached){
      /*
       * Firebase Auth가 UID를 확인한 순간 캐시 프로필로 즉시 진입한다.
       * 이 캐시는 화면 복원용일 뿐이며 관리자 권한은 항상 false다.
       * 실제 서버 계정은 아래 백그라운드 요청으로 다시 확인한다.
       */
      const cachedAccount=
        this.accountForGame(
          cached,
          user
        );

      cachedAccount.firebaseSyncPending=true;

      this.close();
      AccountUI.enter(
        cachedAccount,
        'firebase'
      );

      void globalThis.DuelsFirebase
        .loadOwnAccount()
        .then(profile=>{
          if(
            profile?.duelsAccountReady===true
          ){
            FirebaseAccountCacheService
              .save(profile,user);

            const authoritative=
              this.accountForGame(
                profile,
                user
              );

            authoritative.firebaseSyncPending=false;

            if(
              globalThis.DuelsFirebase
                ?.currentUser?.()?.uid===
              user.uid
            ){
              AccountState.current=
                authoritative;

              AccountUI.updateChip();
              ProfileSettingsUI.render();

              const localMember=
                typeof RoomService!=='undefined'
                  ?RoomService.localMember?.()
                  :null;

              if(
                localMember &&
                typeof PlayerProfileService!=='undefined'
              ){
                localMember.profile=
                  PlayerProfileService
                    .snapshot(
                      authoritative
                    );
              }
            }

            return;
          }

          /*
           * 서버에서 계정 준비 상태가 사라졌다면 오래된 캐시를 폐기하고
           * 계정 설정 화면으로 전환한다.
           */
          FirebaseAccountCacheService
            .remove(user.uid);

          if(
            globalThis.DuelsFirebase
              ?.currentUser?.()?.uid===
            user.uid
          ){
            AccountState.current=null;
            AccountUI.updateChip();
            document
              .getElementById(
                'duels3-account-gate'
              )
              ?.classList.add(
                'hidden'
              );
            this.open(user);
          }
        })
        .catch(error=>{
          console.error(
            '[Duels] Firebase 계정 백그라운드 동기화 실패',
            error
          );

          if(
            globalThis.DuelsFirebase
              ?.currentUser?.()?.uid===
            user.uid &&
            AccountState.current
              ?.firebaseUid===
            user.uid
          ){
            AccountState.current.firebaseSyncPending=false;
            AccountUI.updateChip();
            AccountUI.setSyncState(
              '동기화 실패',
              'error'
            );
          }
        });

      return cachedAccount;
    }

    /*
     * 첫 로그인/캐시 없음은 서버에서 계정 존재 여부를 알아야 하므로
     * 기존처럼 1회 기다린다. 성공 후부터는 캐시가 생겨 다음 새로고침이 빨라진다.
     */
    const profile=
      await globalThis.DuelsFirebase
        .loadOwnAccount();

    if(
      profile?.duelsAccountReady===true
    ){
      FirebaseAccountCacheService
        .save(profile,user);

      return this.enterFirebaseProfile(
        profile,
        user
      );
    }

    document
      .getElementById(
        'duels3-account-gate'
      )
      ?.classList.add('hidden');

    this.open(user);
    return null;
  },
  async verifyLegacy(){
    this.resetLegacy();
    const id=document.getElementById('duels3-migration-id')?.value||'';
    const password=document.getElementById('duels3-migration-password')?.value||'';
    if(!id||!password){this.message('기존 아이디와 비밀번호를 입력하세요.','error');return false;}
    this.setProgressWarning(true);
    this.message('기존 계정 인증 정보를 받는 중입니다.');
    try{
      /*
       * Worker는 PBKDF2를 계산하지 않는다.
       * challenge의 salt/iterations로 브라우저가 기존 PBKDF2-SHA256 150000회를 계산하고,
       * 그 결과를 HMAC key로 사용한 proof만 Worker에 보낸다.
       */
      const verified=await LegacyMigrationService.verifyCredentials(id,password);
      this.migrationToken=String(verified?.migrationToken||'');
      if(!this.migrationToken)throw new Error('마이그레이션 인증 토큰을 받지 못했습니다.');

      /*
       * 기존 /account/load API는 폐기되었으므로 인증 응답의 요약 정보만 사용한다.
       * 실제 기존 계정 전체 데이터는 /account/migration/complete에서 서버가 GitHub에서 다시 읽는다.
       */
      const serverAccount=verified?.account||{};
      this.legacyAccount={
        accountId:String(serverAccount.accountId||verified?.accountId||id),
        displayName:String(serverAccount.displayName||''),
        mainCharacterId:typeof serverAccount.mainCharacterId==='string'
          ?serverAccount.mainCharacterId
          :null
      };

      const records=Number.isFinite(Number(serverAccount.characterRecordCount))
        ?Number(serverAccount.characterRecordCount)
        :0;
      const stats=Number.isFinite(Number(serverAccount.characterStatsCount))
        ?Number(serverAccount.characterStatsCount)
        :0;
      const preview=document.getElementById('duels3-migration-preview');
      if(preview){
        preview.replaceChildren();
        const lines=[
          ['기존 아이디',serverAccount.accountId||verified?.accountId||id],
          ['표시 이름',serverAccount.displayName||'-'],
          ['레코드 캐릭터 수',String(records)],
          ['통계 캐릭터 수',String(stats)]
        ];
        for(const [label,value] of lines){
          const row=document.createElement('div');
          const strong=document.createElement('strong');
          strong.textContent=`${label}: `;
          row.append(strong,document.createTextNode(String(value)));
          preview.appendChild(row);
        }
        preview.classList.remove('hidden');
      }
      const confirm=document.getElementById('duels3-migration-confirm');
      if(confirm)confirm.disabled=false;
      const passwordInput=document.getElementById('duels3-migration-password');
      if(passwordInput)passwordInput.value='';
      this.setProgressWarning(false);
      this.message('기존 계정 인증에 성공했습니다. 이전할 Google 계정을 확인한 뒤 진행하세요.','success');
      return true;
    }catch(error){
      const code=String(error?.code||'');
      const friendly=(
        code==='ACCOUNT_ALREADY_MIGRATED'?'이미 마이그레이션된 계정입니다.':
        code==='MIGRATION_PERIOD_ENDED'?'마이그레이션은 10월 31일까지만 지원됩니다.':
        code==='INVALID_LEGACY_CREDENTIALS'?'아이디 또는 비밀번호가 올바르지 않습니다.':
        code==='INVALID_OR_EXPIRED_CHALLENGE'?'인증 시간이 만료되었습니다. 다시 확인해주세요.':
        error?.message||'기존 계정을 확인하지 못했습니다.'
      );
      this.setProgressWarning(false);
      this.message(friendly,'error');
      return false;
    }
  },
  async migrateLegacy(){
    const user=this.firebaseUser||globalThis.DuelsFirebase?.currentUser?.();
    const legacy=this.legacyAccount;
    const migrationToken=String(this.migrationToken||'');
    if(!user||!legacy||!migrationToken){this.message('먼저 기존 계정을 다시 인증하세요.','error');return false;}
    this.setProgressWarning(true);
    const beforeUnloadHandler=event=>{
      event.preventDefault();
      event.returnValue='';
    };
    window.addEventListener(
      'beforeunload',
      beforeUnloadHandler
    );

    this.message('기존 계정과 Google 계정을 1:1로 연결하는 중입니다. 잠시만 기다려주세요.');
    try{
      /*
       * 서버가 migrationToken + Firebase ID Token을 검증한 뒤
       * GitHub의 migration binding 인덱스에 legacyAccountId <-> Firebase UID를 1:1로 고정한다.
       * 서버가 다시 읽어 반환한 GitHub 계정 데이터를 실제 이전 기준으로 사용한다.
       */
      const completed=await LegacyMigrationService.complete(migrationToken);
      const authoritativeLegacy=completed?.account;
      if(!authoritativeLegacy||typeof authoritativeLegacy!=='object'){
        throw new Error('서버에서 이전할 기존 계정 데이터를 받지 못했습니다.');
      }
      if(String(completed?.firebaseUid||'')!==String(user.uid)){
        throw new Error('서버의 Google 계정 연결 정보가 현재 로그인과 일치하지 않습니다.');
      }

      const now=new Date().toISOString();
      const mainCharacterId=(typeof authoritativeLegacy.mainCharacterId==='string'&&authoritativeLegacy.mainCharacterId)
        ?authoritativeLegacy.mainCharacterId
        :(typeof authoritativeLegacy.profile?.mainCharacterId==='string'?authoritativeLegacy.profile.mainCharacterId:null);
      const mainCharacterExplicit=authoritativeLegacy.mainCharacterExplicit===true||authoritativeLegacy.profile?.mainCharacterExplicit===true;
      const migrated={
        version:2,
        duelsAccountReady:true,
        firebaseUid:user.uid,
        legacyAccountId:String(completed?.legacyAccountId||authoritativeLegacy.accountId||legacy.accountId||''),
        displayName:String(authoritativeLegacy.displayName||user.displayName||'플레이어').slice(0,24),
        email:user.email||null,
        createdAt:authoritativeLegacy.createdAt||now,
        updatedAt:now,
        migrated:true,
        migratedAt:completed?.boundAt||now,
        legacyCredentialVerified:true,
        migrationBindingVersion:1,
        mainCharacterId,
        mainCharacterExplicit,
        profile:{...(authoritativeLegacy.profile||{}),mainCharacterId,mainCharacterExplicit},
        characterRecords:{...(authoritativeLegacy.characterRecords||{})},
        characterStats:{...(authoritativeLegacy.characterStats||{})}
      };

      /*
       * 프로필/마이그레이션 메타/진행도는 complete 요청에서 Worker가 서버 권한으로 저장한다.
       * 브라우저는 저장을 반복하지 않고 서버에서 다시 읽은 최종 계정만 사용한다.
       */
      const authoritativeFirebase=await globalThis.DuelsFirebase.loadOwnAccount();
      if(!authoritativeFirebase?.duelsAccountReady){
        throw new Error('서버에 마이그레이션 계정이 생성되지 않았습니다.');
      }
      this.setProgressWarning(false);
      window.removeEventListener(
        'beforeunload',
        beforeUnloadHandler
      );
      this.message('마이그레이션이 완료되었습니다.','success');
      await this.enterFirebaseProfile(authoritativeFirebase,user);
      return true;
    }catch(error){
      const code=String(error?.code||'');
      const friendly=(
        code==='LEGACY_ACCOUNT_ALREADY_BOUND'?'이 기존 계정은 이미 다른 Google 계정에 연결되어 있습니다.':
        code==='FIREBASE_ACCOUNT_ALREADY_BOUND'?'이 Google 계정은 이미 다른 기존 계정에 연결되어 있습니다.':
        code==='INVALID_MIGRATION_TOKEN'?'마이그레이션 인증 시간이 만료되었습니다. 기존 계정을 다시 확인해주세요.':
        code==='INVALID_FIREBASE_TOKEN'?'Google 로그인 인증이 만료되었습니다. 다시 로그인해주세요.':
        error?.message||'마이그레이션 저장에 실패했습니다.'
      );
      this.setProgressWarning(false);
      window.removeEventListener(
        'beforeunload',
        beforeUnloadHandler
      );
      this.message(friendly,'error');
      return false;
    }
  },
  async createNew(){
    const user=this.firebaseUser||globalThis.DuelsFirebase?.currentUser?.();
    if(!user){
      this.message('Google 로그인이 필요합니다.','error');
      return false;
    }

    const input=
      document.getElementById(
        'duels3-new-account-nickname'
      );

    const displayName=
      String(input?.value||'')
        .replace(/[\u0000-\u001f\u007f]/g,'')
        .trim();

    if(!displayName){
      this.message('사용할 닉네임을 입력하세요.','error');
      input?.focus();
      return false;
    }

    if(displayName.length>24){
      this.message('닉네임은 24자 이하로 입력하세요.','error');
      input?.focus();
      return false;
    }

    const confirmed=confirm(
      `닉네임을 "${displayName}"(으)로 설정하고 새 계정을 생성할까요?\n\n`+
      `닉네임은 최초 1회만 설정할 수 있습니다.`
    );
    if(!confirmed)return false;

    const button=
      document.getElementById(
        'duels3-new-account-confirm'
      );
    if(button)button.disabled=true;

    this.message('새 계정을 생성하는 중입니다.');

    try{
      const account=
        await globalThis.DuelsFirebase
          .createOwnAccount({
            displayName
          });

      if(!account?.duelsAccountReady){
        throw new Error(
          '새 계정 생성 결과를 확인할 수 없습니다.'
        );
      }

      return this.enterFirebaseProfile(
        account,
        user
      );
    }catch(error){
      this.message(
        error?.message||
        '새 계정을 만들지 못했습니다.',
        'error'
      );
      return false;
    }finally{
      if(button)button.disabled=false;
    }
  },
  async switchGoogleAccount(){
    const fb=globalThis.DuelsFirebase;
    const button=document.getElementById('duels3-migration-switch-google');

    if(!fb){
      this.message('Firebase 초기화를 기다리는 중입니다.','error');
      return false;
    }

    AuthResolutionUI.setPending(true);
    if(button)button.disabled=true;
    this.message('다른 Google 계정을 선택하는 중입니다.');

    try{
      await fb.signOutCurrent();

      AccountState.current=null;
      localStorage.removeItem(DUELS3_CONFIG.storageKeys.session);
      this.close();
      AccountUI.updateChip();

      const gate=document.getElementById('duels3-account-gate');
      gate?.classList.remove('hidden');
      AccountUI.setMessage('다른 Google 계정으로 로그인하세요.');

      const result=await fb.signInGoogle();

      gate?.classList.add('hidden');
      AccountUI.setMessage('');
      await this.afterGoogleLogin(result);
      AuthResolutionUI.resolve();
      return true;
    }catch(error){
      const code=String(error?.code||'');
      if(
        code==='auth/popup-closed-by-user'||
        code==='auth/cancelled-popup-request'
      ){
        AccountUI.setMessage('Google 계정 선택이 취소되었습니다.');
      }else{
        AccountUI.setMessage(
          error?.message||'Google 계정 변경에 실패했습니다.',
          'error'
        );
      }

      document.getElementById('duels3-account-gate')?.classList.remove('hidden');
      AuthResolutionUI.resolve();
      return false;
    }finally{
      if(button)button.disabled=false;
    }
  },
  bind(){
    document.getElementById('duels3-migration-switch-google')?.addEventListener('click',()=>this.switchGoogleAccount());
    document.getElementById('duels3-migration-existing')?.addEventListener('click',()=>{
      this.resetLegacy();
      this.showNewAccountForm(false);
      this.showForm(true);
      this.message('기존 듀얼즈 계정 정보를 입력하세요.');
    });
    document.getElementById('duels3-migration-new')?.addEventListener('click',()=>{
      this.resetLegacy();
      this.showForm(false);
      this.showNewAccountForm(true);
      this.message('새 계정에서 사용할 닉네임을 입력하세요.');
    });
    document.getElementById('duels3-new-account-confirm')?.addEventListener('click',()=>this.createNew());
    document.getElementById('duels3-new-account-nickname')?.addEventListener('keydown',event=>{
      if(event.key==='Enter')this.createNew();
    });
    document.getElementById('duels3-migration-check')?.addEventListener('click',()=>this.verifyLegacy());
    document.getElementById('duels3-migration-confirm')?.addEventListener('click',()=>this.migrateLegacy());
    document.getElementById('duels3-migration-password')?.addEventListener('keydown',event=>{
      if(event.key==='Enter')this.verifyLegacy();
    });
  }
};