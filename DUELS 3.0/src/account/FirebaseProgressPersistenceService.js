

const FirebaseProgressPersistenceService=Object.freeze({
  payload(account=AccountState.current){
    if(!account||account.isGuest||account.firebaseAccount!==true)return null;
    return {
      version:1,
      characterRecords:{...(account.characterRecords||{})},
      characterStats:{...(account.characterStats||{})}
    };
  },
  async save(){
    throw new Error('진행도는 클라이언트에서 직접 저장할 수 없습니다. 온라인 경기 결과를 통해 서버에서만 갱신됩니다.');
  }
});