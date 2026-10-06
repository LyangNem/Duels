


const OnlineChatService={
  openState:false,
  history:[],
  maxHistory:120,
  maxFloating:5,
  draftText:'',
  lastSentText:'',
  restoreLastSentOnOpen:false,
  selectAllDraftOnOpen:false,
  typingByPid:new Map(),
  typingTimer:0,
  localTypingTimer:0,
  localTypingInterval:1800,
  localName(){
    return PlayerDisplayNameService.resolve(
      RoomService.localPid,
      RoomService.localMember()?.profile
    )||'나';
  },
  reset(){
    if(this.openState){
      this.stopLocalTypingHeartbeat({
        sendFalse:true
      });
    }else{
      this.stopLocalTypingHeartbeat();
    }
    this.openState=false;
    this.history.length=0;
    this.draftText='';
    this.lastSentText='';
    this.restoreLastSentOnOpen=false;
    this.selectAllDraftOnOpen=false;
    this.typingByPid.clear();
    clearTimeout(this.typingTimer);
    this.typingTimer=0;
    clearTimeout(this.localTypingTimer);
    this.localTypingTimer=0;

    document
      .getElementById('chat-log')
      ?.replaceChildren();
    document
      .getElementById(
        'chat-history-list'
      )
      ?.replaceChildren();

    const panel=
      document.getElementById(
        'chat-history-panel'
      );
    const inputWrap=
      document.getElementById(
        'chat-input-wrap'
      );
    const input=
      document.getElementById(
        'chat-input'
      );
    const typing=
      document.getElementById(
        'chat-typing-summary'
      );

    if(panel)panel.style.display='none';
    if(inputWrap){
      inputWrap.style.display='none';
    }
    if(input)input.value='';
    if(typing)typing.textContent='';
  },
  available(){
    if(!RoomService.localPid)return false;

    const blockedScreen=[
      'scr-lobby',
      'scr-room-join'
    ].some(id=>{
      const screen=document.getElementById(id);
      return screen&&!screen.classList.contains('hidden');
    });

    return !blockedScreen;
  },
  ensureVisible(){
    const wrap=
      document.getElementById(
        'chat-wrap'
      );

    if(
      wrap&&
      this.available()
    ){
      wrap.style.display='block';
    }

    return !!wrap;
  },
  syncVisibility(){
    const wrap=document.getElementById('chat-wrap');
    if(!wrap)return false;

    const available=this.available();
    wrap.style.display=available?'block':'none';

    if(!available&&this.openState){
      this.syncDraftFromInput();
      this.close();
    }
    return available;
  },
  playerColor(pid){
    const member=RoomService.members.get(pid);
    const team=RoomTeams[member?.team];
    return team?.color||'#87939d';
  },
  applyPlayerColor(node,pid,{system=false}={}){
    if(!node)return false;

    const color=system
      ?'#87939d'
      :this.playerColor(pid);

    node.style.setProperty(
      '--chat-player-color',
      color
    );
    node.style.color=color;
    node.style.borderLeftColor=color;
    return true;
  },
  sendLocalTyping(show){
    if(!RoomService.localPid)return false;

    RoomService.sendGameplay({
      type:'duel-chat-typing',
      typing:show===true,
      name:this.localName()
    });
    return true;
  },
  stopLocalTypingHeartbeat({
    sendFalse=false
  }={}){
    clearTimeout(this.localTypingTimer);
    this.localTypingTimer=0;

    if(sendFalse){
      this.sendLocalTyping(false);
    }
    return true;
  },
  startLocalTypingHeartbeat(){
    this.stopLocalTypingHeartbeat();

    const pulse=()=>{
      if(!this.openState){
        this.localTypingTimer=0;
        return;
      }

      this.sendLocalTyping(true);
      this.localTypingTimer=setTimeout(
        pulse,
        Math.max(
          500,
          Number(this.localTypingInterval)||1800
        )
      );
    };

    pulse();
    return true;
  },
  typingNames(){
    const now=Date.now();
    const names=[];

    for(
      const [pid,state] of
      this.typingByPid
    ){
      if(
        !state||
        state.until<=now
      ){
        this.typingByPid.delete(pid);
        continue;
      }
      names.push(state.name);
    }

    return names;
  },
  renderTyping(){
    const names=this.typingNames();
    const summary=
      document.getElementById(
        'chat-typing-summary'
      );
    const log=
      document.getElementById(
        'chat-log'
      );

    if(summary){
      summary.textContent=
        names.length
          ?`${names.join(', ')} 입력 중...`
          :'';
    }

    log
      ?.querySelector(
        '#chat-typing-indicator'
      )
      ?.remove();

    if(
      names.length&&
      !this.openState&&
      log
    ){
      const indicator=
        document.createElement('div');
      indicator.className=
        'chat-msg peer typing';
      indicator.id=
        'chat-typing-indicator';
      indicator.style.animation='none';
      if(names.length===1){
        const [typingPid]=this.typingByPid.keys();
        this.applyPlayerColor(
          indicator,
          typingPid
        );
      }else{
        this.applyPlayerColor(
          indicator,
          null,
          {system:true}
        );
      }
      indicator.textContent=
        `${names.join(', ')} 입력 중...`;
      log.appendChild(indicator);
    }

    clearTimeout(this.typingTimer);
    this.typingTimer=0;

    if(this.typingByPid.size){
      this.typingTimer=setTimeout(
        ()=>this.renderTyping(),
        650
      );
    }

    return names.length;
  },
  setTyping(
    pid,
    show,
    name='상대'
  ){
    const id=String(pid||'');
    if(!id||id===RoomService.localPid){
      return false;
    }

    if(show){
      this.typingByPid.set(
        id,
        {
          name:
            String(name||'상대')
              .trim()||'상대',
          until:Date.now()+4200
        }
      );
    }else{
      this.typingByPid.delete(id);
    }

    this.renderTyping();
    return true;
  },
  clearTyping(pid){
    if(!pid)return false;
    this.typingByPid.delete(String(pid));
    this.renderTyping();
    return true;
  },
  add(
    name,
    text,
    isMine=false,
    {
      pid=null,
      system=false
    }={}
  ){
    const safeText=
      String(text||'')
        .trim()
        .slice(0,120);
    if(!safeText)return false;

    if(pid)this.clearTyping(pid);

    const safeName=
      String(name||'').trim()||
      (
        isMine
          ?this.localName()
          :'상대'
      );

    this.ensureVisible();

    const entry={
      pid:pid||null,
      name:safeName,
      text:safeText,
      isMine:!!isMine,
      system:!!system,
      at:Date.now()
    };

    this.history.push(entry);

    while(
      this.history.length>
        this.maxHistory
    ){
      this.history.shift();
    }

    const log=
      document.getElementById(
        'chat-log'
      );

    if(log){
      const message=
        document.createElement('div');

      message.className=
        system
          ?'chat-msg system'
          :`chat-msg ${isMine?'mine':'peer'}`;
      message.dataset.pid=
        pid||'';
      this.applyPlayerColor(
        message,
        pid||RoomService.localPid,
        {system}
      );

      message.textContent=
        system
          ?safeText
          :`${isMine?'나':safeName}: ${safeText}`;

      log.appendChild(message);

      while(
        [...log.children]
          .filter(node=>
            node.id!=='chat-typing-indicator'
          ).length>
          this.maxFloating
      ){
        const removable=[
          ...log.children
        ].find(node=>
          node.id!=='chat-typing-indicator'
        );
        removable?.remove();
      }

      setTimeout(
        ()=>{
          if(message.isConnected){
            message.remove();
          }
        },
        8000
      );
    }

    if(this.openState){
      this.renderHistory();
    }
    return true;
  },
  system(text){
    return this.add(
      '',
      text,
      false,
      {system:true}
    );
  },
  renderHistory(){
    const list=
      document.getElementById(
        'chat-history-list'
      );
    if(!list)return false;

    list.replaceChildren();

    for(const entry of this.history){
      const row=
        document.createElement('div');

      row.className=
        entry.system
          ?'chat-history-msg system'
          :`chat-history-msg ${entry.isMine?'mine':'peer'}`;
      row.dataset.pid=
        entry.pid||'';
      this.applyPlayerColor(
        row,
        entry.pid||RoomService.localPid,
        {system:entry.system}
      );

      const time=new Date(entry.at);
      const hh=
        String(time.getHours())
          .padStart(2,'0');
      const mm=
        String(time.getMinutes())
          .padStart(2,'0');

      const copy=
        document.createElement('span');
      copy.textContent=
        entry.system
          ?entry.text
          :`${entry.name}: ${entry.text}`;

      const stamp=
        document.createElement('span');
      stamp.className=
        'chat-history-time';
      stamp.textContent=`${hh}:${mm}`;

      row.append(copy,stamp);
      list.appendChild(row);
    }

    list.scrollTop=list.scrollHeight;
    this.renderTyping();
    return true;
  },
  syncDraftFromInput(){
    const input=
      document.getElementById(
        'chat-input'
      );
    if(!input)return false;

    this.draftText=
      String(input.value||'')
        .slice(0,120);
    return true;
  },
  restoreInput({
    focus=true
  }={}){
    const input=
      document.getElementById(
        'chat-input'
      );
    if(!input)return false;

    const useLastSent=
      !this.draftText&&
      this.restoreLastSentOnOpen&&
      this.lastSentText;

    input.value=
      useLastSent
        ?this.lastSentText
        :this.draftText;

    if(focus){
      input.focus({
        preventScroll:true
      });
    }

    if(
      useLastSent||
      this.selectAllDraftOnOpen
    ){
      input.setSelectionRange(
        0,
        input.value.length
      );
      if(useLastSent){
        this.restoreLastSentOnOpen=false;
      }
      this.selectAllDraftOnOpen=false;
    }else{
      const end=
        input.value.length;
      input.setSelectionRange(
        end,
        end
      );
    }

    return true;
  },
  preserveAcrossScreenChange(){
    if(!this.openState)return false;

    this.syncDraftFromInput();

    if(!this.available())return false;

    this.ensureVisible();

    const inputWrap=
      document.getElementById(
        'chat-input-wrap'
      );
    const panel=
      document.getElementById(
        'chat-history-panel'
      );
    const log=
      document.getElementById(
        'chat-log'
      );

    if(inputWrap){
      inputWrap.style.display='block';
    }
    if(panel){
      panel.style.display='flex';
      this.renderHistory();
    }
    if(log){
      log.style.display='none';
    }

    requestAnimationFrame(()=>{
      if(!this.openState)return;
      this.restoreInput({
        focus:true
      });
    });

    return true;
  },
  preserveAcrossMatchTransition(){
    this.syncDraftFromInput();

    if(!this.openState)return false;

    requestAnimationFrame(()=>{
      if(!this.openState)return;
      this.preserveAcrossScreenChange();
    });

    return true;
  },
  clearRoundDraft(){
    const input=
      document.getElementById(
        'chat-input'
      );

    this.draftText='';
    this.selectAllDraftOnOpen=false;
    this.restoreLastSentOnOpen=false;

    if(input){
      input.value='';
    }

    if(this.openState){
      this.close();
    }else{
      this.stopLocalTypingHeartbeat({
        sendFalse:true
      });
    }

    return true;
  },
  open(){
    if(!this.available())return false;

    this.openState=true;
    this.ensureVisible();
    GameInputResetService.releaseAll();

    const inputWrap=
      document.getElementById(
        'chat-input-wrap'
      );
    const input=
      document.getElementById(
        'chat-input'
      );
    const panel=
      document.getElementById(
        'chat-history-panel'
      );
    const log=
      document.getElementById(
        'chat-log'
      );

    if(log)log.style.display='none';

    if(panel){
      panel.style.display='flex';
      this.renderHistory();
    }

    if(inputWrap){
      inputWrap.style.display='block';
    }

    if(input){
      this.restoreInput({
        focus:true
      });
    }

    this.startLocalTypingHeartbeat();
    return true;
  },
  close({
    selectDraftOnReopen=false
  }={}){
    if(!this.openState)return false;

    this.syncDraftFromInput();
    this.selectAllDraftOnOpen=
      selectDraftOnReopen===true&&
      this.draftText.length>0;
    this.openState=false;

    const inputWrap=
      document.getElementById(
        'chat-input-wrap'
      );
    const panel=
      document.getElementById(
        'chat-history-panel'
      );
    const log=
      document.getElementById(
        'chat-log'
      );

    if(inputWrap){
      inputWrap.style.display='none';
    }
    if(panel)panel.style.display='none';
    if(log)log.style.display='flex';

    this.stopLocalTypingHeartbeat({
      sendFalse:true
    });

    this.renderTyping();
    return true;
  },
  send(){
    const input=
      document.getElementById(
        'chat-input'
      );
    if(!input)return false;

    const text=
      input.value
        .trim()
        .slice(0,120);

    if(!text){
      this.close();
      return false;
    }

    const name=this.localName();

    this.add(
      name,
      text,
      true,
      {pid:RoomService.localPid}
    );

    RoomService.sendGameplay({
      type:'duel-chat',
      name,
      text
    });

    this.lastSentText=text;
    this.draftText='';
    this.restoreLastSentOnOpen=true;
    input.value='';
    this.close();
    return true;
  },
  receive(pid,payload){
    if(payload?.type==='duel-chat'){
      const member=
        RoomService.members.get(pid);
      const fallback=
        PlayerDisplayNameService.resolve(
          pid,
          member?.profile
        );

      return this.add(
        String(
          payload.name||
          fallback
        ),
        String(payload.text||''),
        pid===RoomService.localPid,
        {pid}
      );
    }

    if(
      payload?.type===
        'duel-chat-typing'
    ){
      const member=
        RoomService.members.get(pid);
      const fallback=
        PlayerDisplayNameService.resolve(
          pid,
          member?.profile
        );

      return this.setTyping(
        pid,
        payload.typing===true,
        String(
          payload.name||
          fallback
        )
      );
    }

    if(
      payload?.type===
        'duel-chat-system'
    ){
      return this.system(
        String(payload.text||'')
      );
    }

    return false;
  },
  handleKeydown(event){
    if(
      !this.available()&&
      !this.openState
    )return false;

    const input=
      document.getElementById(
        'chat-input'
      );
    const isInput=
      event.target===input;

    if(this.openState){
      if(
        event.key==='Enter'&&
        !event.isComposing
      ){
        event.preventDefault();
        event.stopPropagation();
        this.send();
        return true;
      }

      if(event.key==='Escape'){
        event.preventDefault();
        event.stopPropagation();
        this.close({
          selectDraftOnReopen:true
        });
        return true;
      }

      if(isInput){
        event.stopPropagation();
        return true;
      }

      return false;
    }

    if(
      event.key==='Enter'&&
      !event.isComposing&&
      !event.ctrlKey&&
      !event.altKey&&
      !event.metaKey
    ){
      event.preventDefault();
      event.stopPropagation();
      this.open();
      return true;
    }

    return false;
  }
};