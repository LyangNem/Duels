


/* Firebase 계정 저장소
   - users/{uid}: 표시 이름/메인 캐릭터/마이그레이션 메타데이터 같은 계정 프로필
   - users/{uid}/data/progress: characterRecords / characterStats
   - permissions는 클라이언트 저장 대상에서 제외한다. */
const FirebaseProfilePersistenceService=Object.freeze({
  payload(account=AccountState.current){
    if(!account||account.isGuest||account.firebaseAccount!==true)return null;
    const displayName=String(account.displayName||'플레이어').trim().slice(0,24)||'플레이어';
    const mainCharacterId=(typeof account.mainCharacterId==='string'&&account.mainCharacterId)
      ?account.mainCharacterId
      :null;
    const mainCharacterExplicit=account.mainCharacterExplicit===true;
    return {
      displayName,
      mainCharacterId,
      mainCharacterExplicit,
      profile:{
        ...(account.profile||{}),
        mainCharacterId,
        mainCharacterExplicit
      }
    };
  },
  async save(account=AccountState.current){
    const data=this.payload(account);
    if(!data)return account;
    const fb=globalThis.DuelsFirebase;
    const user=fb?.currentUser?.();
    if(!fb||!user)throw new Error('Firebase 로그인이 필요합니다.');
    if(
      account.firebaseUid&&
      String(account.firebaseUid)!==String(user.uid)
    )throw new Error('현재 Google 계정과 듀얼즈 계정이 일치하지 않습니다.');

    await fb.upsertOwnProfile(data);
    const next={
      ...account,
      ...data,
      firebaseUid:user.uid,
      accountId:user.uid,
      firebaseAccount:true
    };
    FirebaseAccountCacheService.save(
      next,
      user
    );

    if(AccountState.current===account||AccountState.current?.firebaseUid===user.uid){
      AccountState.current=next;
      AccountUI.updateChip();
      const localMember=typeof RoomService!=='undefined'?RoomService.localMember?.():null;
      if(localMember&&typeof PlayerProfileService!=='undefined'){
        localMember.profile=PlayerProfileService.snapshot(next);
      }
    }
    return next;
  }
});