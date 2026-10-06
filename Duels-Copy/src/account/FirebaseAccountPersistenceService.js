

const FirebaseAccountPersistenceService=Object.freeze({
  async save(account=AccountState.current){
    if(!account||account.isGuest)return account;
    if(account.firebaseAccount!==true){
      throw new Error('기존 듀얼즈 계정의 직접 저장은 종료되었습니다. Google 계정으로 마이그레이션해주세요.');
    }
    const profile=await FirebaseProfilePersistenceService.save(account);
    const next={
      ...profile,
      characterRecords:{...(account.characterRecords||{})},
      characterStats:{...(account.characterStats||{})}
    };
    if(AccountState.current===account||AccountState.current?.firebaseUid===next?.firebaseUid){
      AccountState.current=next;
      AccountUI.updateChip();
    }
    return next;
  }
});