

const DisplaySettings={
  storageKey:'duels3.displaySettings',
  state:{
    screenShake:100,
    dynamicFov:100,
    soundVolume:100,
    naturalRegenTimer:false,
    healthBarSegments:true,
    koEffects:true,
    characterCardIllustrations:true,
    worldNameMode:'both'
  },
  percent(value,fallback=100){
    if(typeof value==='boolean'){
      return value?100:0;
    }

    const number=Number(value);
    return Number.isFinite(number)
      ?Math.max(0,Math.min(100,number))
      :fallback;
  },
  strength(key){
    return this.percent(
      this.state[key],
      100
    )/100;
  },
  load(){
    try{
      const raw=localStorage.getItem(this.storageKey);
      if(!raw)return;
      const saved=JSON.parse(raw);

      if(
        typeof saved.screenShake==='boolean'||
        Number.isFinite(Number(saved.screenShake))
      ){
        this.state.screenShake=
          this.percent(saved.screenShake);
      }

      if(
        typeof saved.dynamicFov==='boolean'||
        Number.isFinite(Number(saved.dynamicFov))
      ){
        this.state.dynamicFov=
          this.percent(saved.dynamicFov);
      }

      if(
        typeof saved.soundVolume==='boolean'||
        Number.isFinite(Number(saved.soundVolume))
      ){
        this.state.soundVolume=
          this.percent(saved.soundVolume);
      }

      if(typeof saved.naturalRegenTimer==='boolean'){
        this.state.naturalRegenTimer=
          saved.naturalRegenTimer;
      }

      if(typeof saved.healthBarSegments==='boolean'){
        this.state.healthBarSegments=
          saved.healthBarSegments;
      }

      if(typeof saved.koEffects==='boolean'){
        this.state.koEffects=saved.koEffects;
      }

      if(typeof saved.characterCardIllustrations==='boolean'){
        this.state.characterCardIllustrations=saved.characterCardIllustrations;
      }

      if(
        ['both','nickname','character'].includes(
          saved.worldNameMode
        )
      ){
        this.state.worldNameMode=saved.worldNameMode;
      }
    }catch(_){}
  },
  save(){
    try{
      localStorage.setItem(
        this.storageKey,
        JSON.stringify(this.state)
      );
    }catch(_){}
  },
  set(key,value){
    if(
      !Object.prototype.hasOwnProperty.call(
        this.state,
        key
      )
    )return false;

    if(key==='worldNameMode'){
      if(
        !['both','nickname','character'].includes(value)
      )return false;
      this.state.worldNameMode=value;
    }else if(
      key==='screenShake'||
      key==='dynamicFov'||
      key==='soundVolume'
    ){
      this.state[key]=
        this.percent(value);
    }else{
      this.state[key]=!!value;
    }

    this.save();

    if(
      key==='screenShake'&&
      this.state.screenShake<=0
    ){
      ScreenShakeService.reset();
    }

    if(
      key==='dynamicFov'&&
      this.state.dynamicFov<=0
    ){
      CameraFovService.reset();
    }

    if(key==='soundVolume'){
      SoundService.setMasterVolume(
        this.state.soundVolume/100
      );
    }

    if(key==='characterCardIllustrations'){
      document.documentElement.dataset.characterCardIllustrations=
        this.state.characterCardIllustrations
          ?'true'
          :'false';
      CharacterCardPortraitService.sync(
        document
      );
    }

    return true;
  },
  syncUi(){
    document.documentElement.dataset.characterCardIllustrations=
      this.state.characterCardIllustrations
        ?'true'
        :'false';

    const shake=
      document.getElementById(
        'duels-setting-screen-shake'
      );
    const shakeValue=
      document.getElementById(
        'duels-setting-screen-shake-value'
      );
    const fov=
      document.getElementById(
        'duels-setting-dynamic-fov'
      );
    const fovValue=
      document.getElementById(
        'duels-setting-dynamic-fov-value'
      );
    const sound=
      document.getElementById(
        'duels-setting-sound-volume'
      );
    const soundValue=
      document.getElementById(
        'duels-setting-sound-volume-value'
      );
    const naturalRegenTimer=
      document.getElementById(
        'duels-setting-natural-regen-timer'
      );
    const healthBarSegments=
      document.getElementById(
        'duels-setting-health-bar-segments'
      );
    const ko=
      document.getElementById(
        'duels-setting-ko-effects'
      );
    const cardIllustrations=
      document.getElementById(
        'duels-setting-character-card-illustrations'
      );
    const worldNameMode=
      document.getElementById(
        'duels-setting-world-name-mode'
      );

    if(shake){
      shake.value=
        String(
          Math.round(
            this.state.screenShake
          )
        );
    }
    if(shakeValue){
      shakeValue.textContent=
        `${Math.round(this.state.screenShake)}%`;
    }

    if(fov){
      fov.value=
        String(
          Math.round(
            this.state.dynamicFov
          )
        );
    }
    if(fovValue){
      fovValue.textContent=
        `${Math.round(this.state.dynamicFov)}%`;
    }

    if(sound){
      sound.value=
        String(
          Math.round(
            this.state.soundVolume
          )
        );
    }
    if(soundValue){
      soundValue.textContent=
        `${Math.round(this.state.soundVolume)}%`;
    }

    if(naturalRegenTimer){
      naturalRegenTimer.checked=
        this.state.naturalRegenTimer;
    }
    const segmentStep=document.getElementById('duels-setting-health-segment-step');
    if(segmentStep)segmentStep.textContent=String(WorldHealthBarSegmentPresentationService.step);
    if(healthBarSegments){
      healthBarSegments.checked=
        this.state.healthBarSegments;
    }
    if(ko)ko.checked=this.state.koEffects;
    if(cardIllustrations){
      cardIllustrations.checked=
        this.state.characterCardIllustrations;
    }

    if(worldNameMode){
      const labels={
        both:'닉네임 • 캐릭터 이름',
        nickname:'닉네임만 표시',
        character:'캐릭터 이름만 표시'
      };
      worldNameMode.textContent=
        labels[this.state.worldNameMode]||
        labels.both;
    }
  }
}