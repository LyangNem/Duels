

const AccountService = Object.freeze({
  normalizeId(value) {
    return String(value || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g,'')
      .slice(0,32);
  },
  async request(path, options = {}) {
    const response = await fetch(
      `${DUELS3_CONFIG.accountApiBase}${path}`,
      {
        ...options,
        headers: {
          'Content-Type':'application/json',
          ...(options.headers || {})
        },
        cache:'no-store'
      }
    );

    let body=null;
    try{body=await response.json();}catch{}

    if(!response.ok||body?.ok===false){
      const code=body?.error||'';
      const message=
        body?.message||
        (
          code==='ACCOUNT_NOT_FOUND'
            ?'존재하지 않는 계정입니다.'
            :code==='INVALID_ACCOUNT_DATA'
              ?'계정 데이터 형식이 올바르지 않습니다.'
              :`계정 서버 요청 실패 (${response.status})`
        );

      const error=new Error(message);
      error.status=response.status;
      error.code=code;
      throw error;
    }

    return body||{ok:true};
  }
});