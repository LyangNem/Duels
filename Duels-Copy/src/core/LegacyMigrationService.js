

/*
 * 2026-10-31까지의 기존 계정 마이그레이션에만 사용한다.
 * 일반 로그인/회원가입/계정 load/save 기능은 제거했다.
 * AccountService는 공통 Worker 요청과 legacy ID 정규화에만 사용한다.
 */
const LegacyMigrationService=Object.freeze({
  bytesToHex(bytes){
    return Array.from(
      bytes instanceof Uint8Array
        ?bytes
        :new Uint8Array(bytes),
      byte=>
        byte.toString(16)
          .padStart(2,'0')
    ).join('');
  },
  hexToBytes(hex){
    const value=String(hex||'');
    const result=
      new Uint8Array(
        Math.floor(value.length/2)
      );

    for(
      let index=0;
      index<result.length;
      index++
    ){
      result[index]=
        parseInt(
          value.slice(
            index*2,
            index*2+2
          ),
          16
        )||0;
    }

    return result;
  },
  async hashPassword(
    password,
    saltHex,
    iterations=150000
  ){
    if(!crypto?.subtle){
      throw new Error(
        '이 브라우저에서는 안전한 비밀번호 해시를 사용할 수 없습니다.'
      );
    }

    const key=
      await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(
          String(password)
        ),
        {name:'PBKDF2'},
        false,
        ['deriveBits']
      );

    const bits=
      await crypto.subtle.deriveBits(
        {
          name:'PBKDF2',
          salt:this.hexToBytes(
            saltHex
          ),
          iterations,
          hash:'SHA-256'
        },
        key,
        256
      );

    return this.bytesToHex(bits);
  },
  decodeBase64UrlText(value){
    let base64=
      String(value||'')
        .replace(/-/g,'+')
        .replace(/_/g,'/');

    while(base64.length%4){
      base64+='=';
    }

    const binary=atob(base64);
    const bytes=
      new Uint8Array(
        binary.length
      );

    for(
      let index=0;
      index<binary.length;
      index++
    ){
      bytes[index]=
        binary.charCodeAt(index);
    }

    return new TextDecoder()
      .decode(bytes);
  },
  challengePayload(challengeToken){
    const encoded=
      String(challengeToken||'')
        .split('.')[0]||'';

    if(!encoded){
      throw new Error(
        '계정 인증 정보를 확인할 수 없습니다.'
      );
    }

    try{
      return JSON.parse(
        this.decodeBase64UrlText(
          encoded
        )
      );
    }catch{
      throw new Error(
        '계정 인증 정보가 올바르지 않습니다.'
      );
    }
  },
  challengeMessage(payload){
    return [
      'duels-auth-v1',
      String(payload?.purpose||''),
      String(payload?.accountId||''),
      String(payload?.nonce||''),
      String(payload?.expiresAt||'')
    ].join('|');
  },
  async createChallengeProof(
    password,
    challenge
  ){
    const hash=
      await this.hashPassword(
        password,
        challenge.salt,
        Number(
          challenge.iterations
        )||150000
      );

    const payload=
      this.challengePayload(
        challenge.challengeToken
      );

    const key=
      await crypto.subtle.importKey(
        'raw',
        this.hexToBytes(hash),
        {
          name:'HMAC',
          hash:'SHA-256'
        },
        false,
        ['sign']
      );

    const signature=
      await crypto.subtle.sign(
        'HMAC',
        key,
        new TextEncoder().encode(
          this.challengeMessage(
            payload
          )
        )
      );

    return this.bytesToHex(
      signature
    );
  },
  async verifyCredentials(
    accountId,
    password
  ){
    const id=
      AccountService.normalizeId(
        accountId
      );

    if(!id||!password){
      throw new Error(
        '아이디와 비밀번호를 입력하세요.'
      );
    }

    const challenge=
      await AccountService.request(
        '/account/migration/challenge',
        {
          method:'POST',
          body:JSON.stringify({
            accountId:id
          })
        }
      );

    if(
      String(
        challenge?.algorithm||
        'PBKDF2-SHA256'
      ).toUpperCase()!==
      'PBKDF2-SHA256'
    ){
      throw new Error(
        '지원하지 않는 기존 비밀번호 형식입니다.'
      );
    }

    const proof=
      await this.createChallengeProof(
        password,
        challenge
      );

    const verified=
      await AccountService.request(
        '/account/migration/verify',
        {
          method:'POST',
          body:JSON.stringify({
            accountId:id,
            challengeToken:
              challenge.challengeToken,
            proof
          })
        }
      );

    return {
      ...verified,
      accountId:id
    };
  },
  async complete(migrationToken){
    const fb=
      globalThis.DuelsFirebase;

    const user=
      fb?.currentUser?.();

    if(!fb||!user){
      throw new Error(
        'Firebase 로그인이 필요합니다.'
      );
    }

    const firebaseIdToken=
      await user.getIdToken(true);

    return AccountService.request(
      '/account/migration/complete',
      {
        method:'POST',
        body:JSON.stringify({
          migrationToken:
            String(
              migrationToken||''
            ),
          firebaseIdToken
        })
      }
    );
  },
  async cancelBinding(
    legacyAccountId
  ){
    const fb=
      globalThis.DuelsFirebase;

    const user=
      fb?.currentUser?.();

    if(!fb||!user){
      throw new Error(
        'Firebase 로그인이 필요합니다.'
      );
    }

    const firebaseIdToken=
      await user.getIdToken(true);

    return AccountService.request(
      '/account/migration/cancel',
      {
        method:'POST',
        body:JSON.stringify({
          legacyAccountId:
            AccountService.normalizeId(
              legacyAccountId
            ),
          firebaseIdToken
        })
      }
    );
  }
});