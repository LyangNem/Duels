



const CharacterCommandInputService={
  get config(){return Training.player?.character?.commandFeatures?.input||{};},
  openState:false,
  buffer:'',
  resultText:'',
  resultOk:false,
  resultStatus:'error',
  resultShownAt:0,
  resultFadeAt:0,
  resultRemoveAt:0,

  available(){
    return (
      Training.active&&
      !Training.spectating&&
      CommandFeatureService.isCharacter(
        Training.player
      )
    );
  },

  clearResult(){
    this.resultText='';
    this.resultOk=false;
    this.resultStatus='error';
    this.resultShownAt=0;
    this.resultFadeAt=0;
    this.resultRemoveAt=0;
  },

  open(){
    if(!this.available())return false;

    this.clearResult();
    OnlineChatService.close();
    GameInputResetService.releaseAll();

    this.openState=true;
    this.buffer='/';

    return true;
  },

  close(){
    this.openState=false;

    GameInputResetService.releaseAll();
    return true;
  },

  reset(){
    this.close();
    this.buffer='';
    this.clearResult();
    return true;
  },

  appendCode(code){
    const keyMatch=
      /^Key([A-Z])$/.exec(
        String(code||'')
      );

    if(keyMatch){
      if(this.buffer.length<this.config.maxLength){
        this.buffer+=
          keyMatch[1].toLowerCase();
      }
      return true;
    }

    if(code==='Space'){
      if(
        this.buffer.length<this.config.maxLength&&
        !this.buffer.endsWith(' ')
      ){
        this.buffer+=' ';
      }
      return true;
    }

    if(code==='Backspace'){
      if(this.buffer.length>1){
        this.buffer=
          this.buffer.slice(0,-1);
      }
      return true;
    }

    if(code==='Slash'){
      if(this.buffer.length<this.config.maxLength){
        this.buffer+='/';
      }
      return true;
    }

    return false;
  },

  showResult(
    command,
    status='error',
    now=performance.now()
  ){
    this.clearResult();
    this.resultText=
      String(command||'/');
    this.resultStatus=
      String(status||'error');
    this.resultOk=
      this.resultStatus!=='error';
    this.resultShownAt=now;
    this.resultFadeAt=now+this.config.resultHoldMs;
    this.resultRemoveAt=now+this.config.resultHoldMs+this.config.resultFadeMs;
  },

  submit(){
    if(!this.openState)return false;

    const command=
      String(this.buffer||'/').trim();
    const result=
      CommandFeatureService.activate(
        Training.player,
        command
      );

    this.close();
    this.showResult(
      command||'/',
      result.status||(
        result.ok===true
          ?'ok'
          :'error'
      )
    );

    return result.ok===true;
  },

  capturesGameInput(){
    return this.openState===true;
  },

  handleKeydown(event){
    if(this.openState){
      event.preventDefault();
      event.stopPropagation();

      if(event.code==='Enter'){
        this.submit();
        return true;
      }

      if(event.code==='Escape'){
        this.close();
        return true;
      }

      this.appendCode(event.code);
      if(CommandFeatureService.commandMap[String(this.buffer||'').trim().toLowerCase()])this.submit();
      return true;
    }

    if(
      !this.available()||
      event.repeat||
      event.ctrlKey||
      event.altKey||
      event.metaKey
    )return false;

    if(
      event.code==='Slash'&&
      event.key==='/'
    ){
      event.preventDefault();
      event.stopPropagation();
      this.open();
      return true;
    }

    return false;
  },

  visibleText(
    now=performance.now()
  ){
    if(this.openState){
      return {
        text:String(this.buffer||'/'),
        color:'#dfe7ec',
        alpha:1,
        typing:true
      };
    }

    if(
      !this.resultText||
      now>=this.resultRemoveAt
    ){
      return null;
    }

    const alpha=
      now<=this.resultFadeAt
        ?1
        :Math.max(
          0,
          1-
          (now-this.resultFadeAt)/
          Math.max(
            1,
            this.resultRemoveAt-this.resultFadeAt
          )
        );

    return {
      text:this.resultText,
      color:
        this.resultStatus==='already'
          ?'#ffe59a'
          :this.resultStatus==='ok'
            ?'#a8e8b8'
            :'#ffaaaa',
      alpha,
      typing:false
    };
  },

  draw(
    ctx,
    entity,
    y,
    now=performance.now()
  ){
    if(
      !ctx||
      entity!==Training.player||
      !CommandFeatureService.isCharacter(entity)
    )return 0;

    const entries=CommandFeatureService.featureEntries;

    // 4개 핵심 명령을 윗줄, 기존 레이저 옵션을 아랫줄에 표시.
    const rows=[
      entries.slice(0,4),
      entries.slice(4)
    ];

    const startY=
      Number(y)+8;

    ctx.save();
    ctx.textAlign='center';
    ctx.textBaseline='top';
    ctx.lineJoin='round';
    ctx.lineWidth=2.5;
    ctx.font=
      '800 10px Pretendard, "Noto Sans KR", Arial, sans-serif';

    rows.forEach(
      (row,rowIndex)=>{
        if(!row.length)return;

        const parts=
          row.map(entry=>{
            const active=
              CommandFeatureService.has(
                entity,
                entry.feature
              );
            const paused=
              active&&
              entry.feature==='cooling'&&
              entity._commandOverclock?.active===true;

            return {
              text:entry.label,
              feature:entry.feature,
              active,
              paused
            };
          });

        const widths=
          parts.map(
            part=>
              ctx.measureText(
                part.text
              ).width
          );
        const gap=8;
        const total=
          widths.reduce(
            (a,b)=>a+b,
            0
          )+
          gap*
          Math.max(
            0,
            parts.length-1
          );

        let dx=
          (Number(entity.x)||0)-
          total/2;

        for(
          let index=0;
          index<parts.length;
          index++
        ){
          const part=parts[index];
          const tx=
            dx+
            widths[index]/2;
          const ty=
            startY+
            rowIndex*13;

          ctx.strokeStyle=
            'rgba(0,0,0,.88)';
          ctx.fillStyle=
            part.paused
              ?'#ffe59a'
              :part.active
                ?'#9fe3b0'
                :'#ff9c9c';

          ctx.shadowColor='transparent';
          ctx.shadowBlur=0;
          ctx.strokeText(
            part.text,
            tx,
            ty
          );
          ctx.fillText(
            part.text,
            tx,
            ty
          );

          ctx.shadowBlur=0;
          dx+=
            widths[index]+
            gap;
        }
      }
    );
    ctx.restore();

    const state=
      this.visibleText(now);
    if(!state)return 34;

    const commandY=
      startY+35;

    ctx.save();
    ctx.globalAlpha=state.alpha;
    ctx.font=
      '800 16px ui-monospace, SFMono-Regular, Consolas, monospace';
    ctx.textAlign='center';
    ctx.textBaseline='top';
    ctx.lineJoin='round';
    ctx.lineWidth=3;
    ctx.strokeStyle=
      'rgba(0,0,0,.90)';
    ctx.fillStyle=state.color;

    const cursor=
      state.typing&&
      Math.floor(now/420)%2===0
        ?'▌'
        :'';
    const text=
      `${state.text}${cursor}`;

    ctx.strokeText(
      text,
      Number(entity.x)||0,
      commandY
    );
    ctx.fillText(
      text,
      Number(entity.x)||0,
      commandY
    );
    ctx.restore();

    return 59+
      WorldGaugeBarPresentationService.gap;
  }
};