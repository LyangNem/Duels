


/* 디버깅 */
const DebugAccessService=Object.freeze({
  permissionKeys:Object.freeze([
    'debugTools',
    'accountAdmin',
    'rankingAdmin'
  ]),
  permissionLabels:Object.freeze({
    debugTools:'DEBUG',
    accountAdmin:'ACCOUNT ADMIN',
    rankingAdmin:'RANKING ADMIN'
  }),
  has(permission,account=AccountState.current){
    return !!(
      account&&
      !account.isGuest&&
      account.permissions?.[
        permission
      ]===true
    );
  },
  canUse(account=AccountState.current){
    return this.has(
      'debugTools',
      account
    );
  },
  canManageAccounts(account=AccountState.current){
    return this.has(
      'accountAdmin',
      account
    );
  },
  canManageRankings(account=AccountState.current){
    return this.has(
      'rankingAdmin',
      account
    );
  },
  currentFirebaseUser(){
    const fb=
      globalThis.DuelsFirebase;
    const user=
      fb?.currentUser?.();

    if(!user){
      throw new Error(
        'Firebase 로그인이 필요합니다.'
      );
    }

    return user;
  },
  async parseResponse(response,fallback){
    let payload=null;
    try{
      payload=
        await response.json();
    }catch{}

    if(!response.ok||!payload?.ok){
      throw new Error(
        payload?.message||
        payload?.error||
        `${fallback} (${response.status})`
      );
    }

    return payload;
  },
  async setPermission(
    targetUid,
    permission,
    allowed
  ){
    if(!this.canManageAccounts()){
      throw new Error(
        '계정 관리자 권한이 없습니다.'
      );
    }

    const uid=
      String(targetUid||'')
        .trim();

    if(!uid){
      throw new Error(
        '대상 Firebase UID를 입력하세요.'
      );
    }

    if(
      !this.permissionKeys
        .includes(permission)
    ){
      throw new Error(
        '지원하지 않는 권한입니다.'
      );
    }

    const user=
      this.currentFirebaseUser();

    const firebaseIdToken=
      await user.getIdToken(true);

    const response=
      await fetch(
        `${DUELS3_CONFIG.accountApiBase}/firebase/admin/permissions/set`,
        {
          method:'POST',
          headers:{
            'Content-Type':
              'application/json'
          },
          body:JSON.stringify({
            firebaseIdToken,
            targetUid:uid,
            permission,
            allowed:
              allowed===true
          })
        }
      );

    const payload=
      await this.parseResponse(
        response,
        '관리자 권한 변경 실패'
      );

    if(
      AccountState.current
        ?.firebaseUid===uid||
      AccountState.current
        ?.accountId===uid
    ){
      AccountState.current.permissions={
        debugTools:
          payload.permissions
            ?.debugTools===true,
        accountAdmin:
          payload.permissions
            ?.accountAdmin===true,
        rankingAdmin:
          payload.permissions
            ?.rankingAdmin===true
      };

      if(
        !this.canUse()&&
        globalThis.DebugPanel
      ){
        DebugPanel.close();
      }
    }

    return payload;
  },
  async setProgress({
    characterRecords=null,
    characterStats=null,
    targetUid=null
  }={}){
    if(!this.canUse()){
      throw new Error(
        '디버깅 권한이 없습니다.'
      );
    }

    const user=
      this.currentFirebaseUser();

    const uid=
      String(
        targetUid||
        AccountState.current
          ?.firebaseUid||
        user.uid||
        ''
      ).trim();

    if(!uid){
      throw new Error(
        '대상 Firebase UID를 확인할 수 없습니다.'
      );
    }

    const firebaseIdToken=
      await user.getIdToken(true);

    const response=
      await fetch(
        `${DUELS3_CONFIG.accountApiBase}/firebase/admin/progress/set`,
        {
          method:'POST',
          headers:{
            'Content-Type':
              'application/json'
          },
          body:JSON.stringify({
            firebaseIdToken,
            targetUid:uid,
            ...(characterRecords
              ?{characterRecords}
              :{}),
            ...(characterStats
              ?{characterStats}
              :{})
          })
        }
      );

    const payload=
      await this.parseResponse(
        response,
        '진행도 수정 실패'
      );

    if(
      AccountState.current
        ?.firebaseUid===uid||
      AccountState.current
        ?.accountId===uid
    ){
      AccountState.current
        .characterRecords={
          ...(payload.progress
            ?.characterRecords||{})
        };

      AccountState.current
        .characterStats={
          ...(payload.progress
            ?.characterStats||{})
        };

      CharacterRecordService
        .clearRankingCache();

      CharacterRecordService
        .loadAllRankings(true)
        .catch(()=>{});
    }

    return payload;
  },
  async deleteAccount(targetUid){
    if(!this.canManageAccounts()){
      throw new Error(
        '계정 관리자 권한이 없습니다.'
      );
    }

    const uid=
      String(targetUid||'')
        .trim();

    if(
      !uid||
      uid.includes('/')||
      uid.length>128
    ){
      throw new Error(
        '삭제할 Firebase UID를 확인하세요.'
      );
    }

    const user=
      this.currentFirebaseUser();

    const firebaseIdToken=
      await user.getIdToken(true);

    const response=
      await fetch(
        `${DUELS3_CONFIG.accountApiBase}/firebase/admin/account/delete`,
        {
          method:'POST',
          headers:{
            'Content-Type':
              'application/json'
          },
          body:JSON.stringify({
            firebaseIdToken,
            targetUid:uid
          })
        }
      );

    const payload=
      await this.parseResponse(
        response,
        '계정 삭제 실패'
      );

    return {
      targetUid:uid,
      legacyAccountId:
        String(
          payload?.legacyAccountId||
          ''
        ),
      removedRankings:
        Math.max(
          0,
          Math.floor(
            Number(
              payload?.removedRankings
            )||0
          )
        ),
      removedSettlementDocuments:
        Math.max(
          0,
          Math.floor(
            Number(
              payload
                ?.removedSettlementDocuments
            )||0
          )
        )
    };
  },
  async deleteCharacterRecord(targetUid,characterId){
    if(!this.canUse()){
      throw new Error(
        '디버깅 권한이 없습니다.'
      );
    }
    if(!this.canManageRankings()){
      throw new Error(
        '랭킹 관리자 권한이 없습니다.'
      );
    }

    const uid=
      String(targetUid||'')
        .trim();
    const id=
      String(characterId||'')
        .trim();

    if(
      !uid||
      uid.includes('/')||
      uid.length>128
    ){
      throw new Error(
        '대상 Firebase UID를 확인하세요.'
      );
    }

    if(!ProfileCharacterService.has(id)){
      throw new Error(
        '삭제할 캐릭터를 확인하세요.'
      );
    }

    const user=
      this.currentFirebaseUser();
    const firebaseIdToken=
      await user.getIdToken(true);

    const response=
      await fetch(
        `${DUELS3_CONFIG.accountApiBase}/firebase/admin/progress/character/delete`,
        {
          method:'POST',
          headers:{
            'Content-Type':
              'application/json'
          },
          body:JSON.stringify({
            firebaseIdToken,
            targetUid:uid,
            characterId:id
          })
        }
      );

    const payload=
      await this.parseResponse(
        response,
        '캐릭터 레코드 삭제 실패'
      );

    if(
      AccountState.current&&
      (
        AccountState.current.firebaseUid===uid||
        AccountState.current.accountId===uid
      )
    ){
      if(payload.progress){
        AccountState.current.characterRecords={
          ...(payload.progress.characterRecords||{})
        };
        AccountState.current.characterStats={
          ...(payload.progress.characterStats||{})
        };
      }else{
        const records={
          ...(AccountState.current.characterRecords||{})
        };
        const stats={
          ...(AccountState.current.characterStats||{})
        };
        delete records[id];
        delete stats[id];
        AccountState.current.characterRecords=records;
        AccountState.current.characterStats=stats;
      }

      const localMember=RoomService.localMember?.();
      if(localMember){
        localMember.profile=
          PlayerProfileService.snapshot(
            AccountState.current
          );
      }
    }

    CharacterRecordService
      .clearRankingCache();
    CharacterRecordService
      .loadAllRankings(true)
      .catch(()=>{});

    return {
      targetUid:uid,
      characterId:id,
      removedRankingEntries:
        Math.max(
          0,
          Math.floor(
            Number(
              payload?.removedRankingEntries??
              payload?.removedRankings
            )||0
          )
        ),
      progress:payload?.progress||null
    };
  },
  async rebuildRankings(){
    if(!this.canManageRankings()){
      throw new Error(
        '랭킹 관리자 권한이 없습니다.'
      );
    }

    const user=
      this.currentFirebaseUser();

    const firebaseIdToken=
      await user.getIdToken(true);

    const response=
      await fetch(
        `${DUELS3_CONFIG.accountApiBase}/firebase/admin/ranking/rebuild`,
        {
          method:'POST',
          headers:{
            'Content-Type':
              'application/json'
          },
          body:JSON.stringify({
            firebaseIdToken
          })
        }
      );

    const payload=
      await this.parseResponse(
        response,
        '랭킹 재구축 실패'
      );

    CharacterRecordService
      .clearRankingCache();

    CharacterRecordService
      .loadAllRankings(true)
      .catch(()=>{});

    return payload;
  }
});