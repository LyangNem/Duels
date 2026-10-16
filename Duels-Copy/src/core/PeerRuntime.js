const PeerRuntime={
  urls:Object.freeze([
    'https://cdn.jsdelivr.net/npm/peerjs@1.5.5/dist/peerjs.min.js',
    'https://unpkg.com/peerjs@1.5.5/dist/peerjs.min.js'
  ]),
  loading:null,
  ensure(){
    if(typeof window.Peer==='function')return Promise.resolve(window.Peer);
    if(this.loading)return this.loading;
    const pending=new Promise((resolve,reject)=>{
      let index=0;
      const load=()=>{
        if(typeof window.Peer==='function'){resolve(window.Peer);return}
        if(index>=this.urls.length){reject(new Error('네트워크 모듈을 불러오지 못했습니다. 인터넷 연결을 확인하고 다시 시도해주세요.'));return}
        const script=document.createElement('script');let finished=false;
        const timer=setTimeout(()=>finish(false),10000);
        const finish=success=>{
          if(finished)return;finished=true;clearTimeout(timer);script.onload=null;script.onerror=null;
          if(success&&typeof window.Peer==='function')resolve(window.Peer);
          else{script.remove();load()}
        };
        script.src=this.urls[index++];script.async=true;
        script.onload=()=>finish(true);script.onerror=()=>finish(false);document.head.appendChild(script);
      };load();
    });
    this.loading=pending;
    pending.then(()=>{if(this.loading===pending)this.loading=null},()=>{if(this.loading===pending)this.loading=null});
    return pending;
  }
};
