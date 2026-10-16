

/* Firebase Google 계정 온보딩 / 기존 계정 마이그레이션 */
const FirebaseAccountCacheService=Object.freeze({
  key(uid){
    return (
      DUELS3_CONFIG
        .storageKeys
        .firebaseAccountCachePrefix+
      String(uid||'')
    );
  },
  sanitize(profile,user){
    if(
      !profile ||
      typeof profile!=='object' ||
      profile.duelsAccountReady!==true
    )return null;

    const uid=
      String(
        user?.uid ||
        profile.firebaseUid ||
        profile.accountId ||
        ''
      );

    if(!uid)return null;

    return {
      version:Number(profile.version)||2,
      duelsAccountReady:true,
      firebaseUid:uid,
      accountId:uid,
      legacyAccountId:
        String(profile.legacyAccountId||''),
      displayName:
        String(profile.displayName||'플레이어')
          .trim()
          .slice(0,24)||
        '플레이어',
      mainCharacterId:
        typeof profile.mainCharacterId==='string'
          ?profile.mainCharacterId
          :null,
      mainCharacterExplicit:
        profile.mainCharacterExplicit===true,
      profile:{
        ...(profile.profile||{})
      },
      characterRecords:{
        ...(profile.characterRecords||{})
      },
      characterStats:{
        ...(profile.characterStats||{})
      },
      cachedAt:Date.now()
    };
  },
  save(profile,user){
    const safe=
      this.sanitize(profile,user);

    if(!safe)return false;

    try{
      localStorage.setItem(
        this.key(safe.firebaseUid),
        JSON.stringify(safe)
      );
      return true;
    }catch(_){
      return false;
    }
  },
  load(user){
    const uid=String(user?.uid||'');
    if(!uid)return null;

    try{
      const raw=
        JSON.parse(
          localStorage.getItem(
            this.key(uid)
          )||'null'
        );

      if(
        !raw ||
        raw.duelsAccountReady!==true ||
        String(raw.firebaseUid||raw.accountId||'')!==uid
      )return null;

      /*
       * 캐시는 빠른 화면 복원 전용이다.
       * 관리자 권한은 캐시하지 않고 항상 서버 응답으로만 복구한다.
       */
      return {
        ...raw,
        firebaseUid:uid,
        accountId:uid,
        permissions:{
          debugTools:false,
          accountAdmin:false,
          rankingAdmin:false
        }
      };
    }catch(_){
      return null;
    }
  },
  remove(uid){
    try{
      localStorage.removeItem(
        this.key(uid)
      );
    }catch(_){}
  }
});