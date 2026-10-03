



/* 사운드 */
const SoundService=Object.freeze({
  volume:.5,
  volumes:Object.freeze({
    hit:.5,
    shoot:.5,
    kill:.21
  }),
  assets:Object.freeze({
    hit:Object.freeze([
      'https://Lyangnem.github.io/Duels/hitted.mp3',
      'https://raw.githubusercontent.com/LyangNem/Duels/main/hitted.mp3'
    ]),
    shoot:Object.freeze([
      'https://Lyangnem.github.io/Duels/shoot.mp3',
      'https://raw.githubusercontent.com/LyangNem/Duels/main/shoot.mp3'
    ]),
    kill:Object.freeze([
      'https://raw.githubusercontent.com/LyangNem/Duels/main/kill.mp3',
      'https://LyangNem.github.io/Duels/kill.mp3'
    ])
  }),
  pools:new Map(),
  lastFrame:new Map(),
  state:{unlockInstalled:false,unlocked:false,masterVolume:1},
  effectiveVolume(kind){
    return Math.max(
      0,
      Math.min(
        1,
        (this.volumes[kind]??this.volume)*
        this.state.masterVolume
      )
    );
  },
  setMasterVolume(value){
    const resolved=Math.max(
      0,
      Math.min(
        1,
        Number(value)||0
      )
    );
    this.state.masterVolume=resolved;

    for(const [kind,pool] of this.pools){
      const volume=this.effectiveVolume(kind);
      for(const audio of pool){
        if(audio)audio.volume=volume;
      }
    }

    return resolved;
  },
  getPool(kind){
    if(this.pools.has(kind))return this.pools.get(kind);

    const urls=this.assets[kind]||[];
    const primary=urls[0];
    if(!primary){
      this.pools.set(kind,[]);
      return [];
    }

    const pool=Array.from({length:6},()=>{
      const audio=new Audio();
      audio.preload='auto';
      audio.src=primary;
      audio.volume=this.effectiveVolume(kind);
      audio.load();
      return audio;
    });

    this.pools.set(kind,pool);
    return pool;
  },
  preload(){
    for(const kind of Object.keys(this.assets)){
      this.getPool(kind);
    }
  },
  unlock(){
    if(this.state.unlocked)return false;
    this.state.unlocked=true;

    for(const pool of this.pools.values()){
      const audio=pool[0];
      if(!audio)continue;

      const oldMuted=audio.muted;
      const oldVolume=audio.volume;
      audio.muted=true;
      audio.volume=0;

      try{
        const promise=audio.play();
        promise?.then?.(()=>{
          audio.pause();
          audio.currentTime=0;
          audio.muted=oldMuted;
          audio.volume=oldVolume;
        }).catch?.(()=>{
          audio.muted=oldMuted;
          audio.volume=oldVolume;
        });
      }catch(_){
        audio.muted=oldMuted;
        audio.volume=oldVolume;
      }
    }
    return true;
  },
  installUnlock(){
    if(this.state.unlockInstalled)return;
    this.state.unlockInstalled=true;
    window.addEventListener(
      'pointerdown',
      ()=>this.unlock(),
      {capture:true,once:true}
    );
  },
  play(kind){
    const frame=Math.floor(performance.now()/GAME_DATA.frameMs);
    if(this.lastFrame.get(kind)===frame)return false;
    this.lastFrame.set(kind,frame);

    const pool=this.getPool(kind);
    const audio=pool.find(item=>item.paused||item.ended)||pool[0];
    if(!audio)return false;

    try{
      audio.muted=false;
      audio.volume=this.effectiveVolume(kind);
      audio.currentTime=0;
      audio.play()?.catch?.(()=>{});
      return true;
    }catch(_){
      return false;
    }
  },
});