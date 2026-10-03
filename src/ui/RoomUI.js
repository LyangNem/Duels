

const RoomUI=Object.freeze({
  profileModes:new Map(),
  showScreen(id){
    OnlineChatService.syncDraftFromInput();
    document
      .querySelectorAll('.screen')
      .forEach(screen=>
        screen.classList.add('hidden')
      );
    document
      .getElementById(id)
      ?.classList.remove('hidden');

    OnlineChatService.syncVisibility();

    if(OnlineChatService.openState){
      OnlineChatService
        .preserveAcrossScreenChange();
    }
  },
  showRoom(){this.showScreen('scr-room');this.render()},
  showJoin(){this.showScreen('scr-room-join');this.setJoinStatus('');const i=document.getElementById('room-code-input');if(i){i.value='';i.focus()}},
  showLobby(message=''){this.showScreen('scr-lobby');const s=document.getElementById('lobby-err');if(s){s.textContent=message;s.className='status'}},
  setStatus(text='',kind=''){const n=document.getElementById('room-status');if(n){n.textContent=text;n.className=`status${kind?` ${kind}`:''}`}},
  setJoinStatus(text='',kind=''){const n=document.getElementById('room-join-status');if(n){n.textContent=text;n.className=`status${kind?` ${kind}`:''}`}},
  profileCard(member){
    const team=RoomTeams[member.team]||RoomTeams.red;
    const profileTier=CharacterRecordService.tier(
      Math.max(0,Number(member.profile?.recordPoints)||0)
    );
    const card=document.createElement('article');
    card.className='room-member-card';
    card.style.setProperty('--team-color',team.color);
    card.style.setProperty('--profile-tier-gradient',profileTier.gradient);
    card.style.setProperty('--profile-tier-glow',profileTier.glow);
    const top=document.createElement('div');top.className='room-member-top';
    const profileCharacter=ProfileCharacterService.get(member.profile?.mainCharacterId);
    const avatar=CharacterPortraitService.create(profileCharacter,'room-profile-avatar');
    const avatarStage=document.createElement('span');
    avatarStage.className='profile-avatar-stage-wrap';
    avatarStage.appendChild(avatar);
    CharacterRecordService.applyMasterStageBadge(
      avatarStage,
      Math.max(
        0,
        Number(member.profile?.recordPoints)||0
      ),
      'room-profile-master-stage'
    );
    const copy=document.createElement('div');copy.className='room-profile-copy';
    const name=document.createElement('strong');name.textContent=member.profile?.displayName||'플레이어';
    const title=document.createElement('span');
    title.className='room-profile-title';
    title.textContent=
      member.profile?.mainCharacterTitle||
      '';
    title.hidden=!title.textContent;

    const main=document.createElement('small');
    main.textContent=`메인 · ${member.profile?.mainCharacterName||'-'}`;
    copy.append(name,title,main);
    top.append(avatarStage,copy);
    if(member.host){const mark=document.createElement('span');mark.className='room-host-mark';mark.textContent='HOST';top.appendChild(mark)}
    const ready=document.createElement('div');
    const matchActive=
      RoomMatchLifecycleService.matchActive(
        RoomService
      );
    const fighting=
      matchActive&&
      RoomService.activeMatchPids.has(
        member.pid
      )&&
      !member.departed;

    ready.className=
      `room-ready-state${!matchActive&&!member.host&&member.ready&&!member.spectator?' ready':''}`;
    ready.textContent=
      matchActive
        ?(
          fighting
            ?'전투 중'
            :member.spectating
              ?'관전 중'
              :'대기 중'
        )
        :member.spectator
          ?'대기 중'
          :member.host
            ?'준비 중'
            :(
              member.ready
                ?'준비 완료'
                :'준비 중'
            );
    const teams=document.createElement('div');
    teams.className='room-team-buttons';
    for(const t of Object.values(RoomTeams)){
      const b=document.createElement('button');
      b.type='button';
      b.className=`room-team-button${member.team===t.id?' active':''}`;
      b.style.setProperty('--team-color',t.color);
      b.title=t.label;
      b.disabled=
        member.spectator||
        (
          member.ready&&
          !RoomService.isHost
        )||
        RoomService.duelPhase!=='room'||
        !(RoomService.isHost||member.pid===RoomService.localPid);
      const chooseTeam=event=>{
        event?.preventDefault?.();
        event?.stopPropagation?.();
        if(b.disabled)return;
        RoomService.setTeam(member.pid,t.id);
      };
      b.addEventListener('pointerdown',chooseTeam);
      b.addEventListener('click',event=>{
        if(event.detail===0)chooseTeam(event);
      });
      teams.appendChild(b);
    }
    card.append(top,ready,teams);

    const savedMode=this.profileModes.get(member.pid)||'base';
    card.dataset.profileMode='base';
    PlayerProfileCardService.bind(card,member.profile);
    if(savedMode==='stats'){
      PlayerProfileCardService.setMode(card,'stats');
      PlayerProfileCardService.renderStats(card,member.profile);
    }else if(savedMode==='records'){
      PlayerProfileCardService.setMode(card,'records');
      PlayerProfileCardService.renderRecords(card,member.profile);
    }
    card.addEventListener('contextmenu',()=>{
      queueMicrotask(()=>{
        this.profileModes.set(
          member.pid,
          PlayerProfileCardService.mode(card)
        );
      });
    });
    return card;
  },
  render(){
    const code=document.getElementById('room-code-display');if(code)code.textContent=RoomService.code||'----';
    const title=document.getElementById('room-title');if(title)title.textContent=RoomService.isHost?'방 생성':'방 참가';
    const members=[
      ...RoomService.members.values()
    ]
      .filter(member=>
        member&&
        member.connected!==false&&
        member.departed!==true
      )
      .sort((a,b)=>
        (Number(a.joinOrder)||0)-
          (Number(b.joinOrder)||0)||
        a.pid.localeCompare(b.pid)
      );
    const count=document.getElementById('room-member-count');if(count)count.textContent=`${members.length} / 4`;
    const memberIds=new Set(members.map(member=>member.pid));
    for(const pid of this.profileModes.keys()){
      if(!memberIds.has(pid))this.profileModes.delete(pid);
    }
    const grid=document.getElementById('room-member-grid');
    if(grid){grid.replaceChildren();for(const m of members)grid.appendChild(this.profileCard(m));for(let i=members.length;i<4;i++){const e=document.createElement('div');e.className='room-member-card empty';e.textContent='빈 슬롯';grid.appendChild(e)}}
    const local=RoomService.localMember(),ready=document.getElementById('room-ready-button');
    const participants=members.filter(member=>!member.host);
    if(ready){
      if(RoomService.isHost){
        const canStart=
          RoomService.duelPhase==='room'&&
          !RoomService.characterBanProposal&&
          TriggerModuleService.matches(
            RoomService.matchEntryTrigger(),
            'room.start-request',
            {
              room:RoomService,
              source:RoomService
            }
          );

        ready.textContent='게임 시작';
        ready.classList.remove('ready');
        ready.disabled=!canStart;
      }else if(
        local?.spectator&&
        RoomService.duelPhase!=='room'
      ){
        ready.textContent=
          local.spectating
            ?'관전 중'
            :'관전';
        ready.classList.remove('ready');
        ready.disabled=
          local.spectating||
          ![
            'playing',
            'round-result',
            'start-augment',
            'between'
          ].includes(RoomService.duelPhase);
      }else{
        ready.textContent=
          local?.ready
            ?'준비 취소'
            :'준비 완료';
        ready.classList.toggle(
          'ready',
          !!local?.ready
        );
        ready.disabled=
          !local||
          RoomService.duelPhase!=='room';
      }
    }
    const summary=document.getElementById('room-ready-summary');
    if(summary)summary.textContent=`준비 ${participants.filter(member=>member.ready).length} / ${participants.length}`;

    const bannedNames=[...RoomService.bannedCharacters]
      .map(id=>GAME_DATA.characters[id]?.name)
      .filter(Boolean);

    const banButton=document.getElementById('room-character-ban-open');
    if(banButton){
      banButton.hidden=!RoomService.isHost;
      banButton.disabled=
        !RoomService.isHost||
        RoomService.duelPhase!=='room'||
        !!RoomService.characterBanProposal;
    }
    const banListButton=document.getElementById('room-character-ban-list');
    if(banListButton){
      banListButton.hidden=false;
      banListButton.disabled=!bannedNames.length&&!RoomService.characterBanProposal;
    }
    const banSummary=document.getElementById('room-character-ban-summary');
    if(banSummary){
      banSummary.textContent=bannedNames.length
        ?`${bannedNames.length}명`
        :'없음';
    }
    CharacterBanUI.sync();

    const controls=[
      ['room-format-total','winsRequired'],
      ['room-char-choices','characterCount'],
      ['room-aug-choices','augmentCount']
    ];

    for(const [id,key] of controls){
      const select=document.getElementById(id);
      if(!select)continue;
      select.value=String(RoomService.settings[key]);
      select.disabled=!RoomService.isHost;
    }
  },
  init(){
    CharacterBanUI.init();
    for(const id of ['room-char-choices','room-aug-choices']){
      const select=document.getElementById(id);
      if(!select||select.options.length)continue;

      for(let value=0;value<=RoomService.maxChoiceCount;value++){
        const option=document.createElement('option');
        option.value=String(value);
        option.textContent=String(value);
        select.appendChild(option);
      }
    }

    const syncSettings=()=>RoomService.setSettings({
      winsRequired:document.getElementById('room-format-total')?.value,
      characterCount:document.getElementById('room-char-choices')?.value,
      augmentCount:document.getElementById('room-aug-choices')?.value
    });

    document.getElementById('room-format-total')?.addEventListener('change',syncSettings);
    document.getElementById('room-char-choices')?.addEventListener('change',syncSettings);
    document.getElementById('room-aug-choices')?.addEventListener('change',syncSettings);

    document.getElementById('room-ready-button')?.addEventListener('click',()=>{
      const member=RoomService.localMember();
      if(!member)return;

      if(
        member.spectator&&
        RoomService.duelPhase!=='room'
      ){
        RoomService.requestSpectate();
        return;
      }

      if(RoomService.isHost){
        RoomService.requestGameStart();
      }else{
        RoomService.setReady(!member.ready);
      }
    });
    document.getElementById('room-leave-button')?.addEventListener('click',()=>{RoomService.leave();this.showLobby()});
    document.getElementById('room-copy-code')?.addEventListener('click',async event=>{
      const button=event.currentTarget;
      ClipboardService.feedback(button,'코드 복사',await ClipboardService.copy(RoomService.code));
    });
    document.getElementById('room-copy-link')?.addEventListener('click',async event=>{
      const button=event.currentTarget;
      const link=InviteLinkService.url(RoomService.code);
      ClipboardService.feedback(button,'링크 복사',!!link&&await ClipboardService.copy(link));
    });
    document.getElementById('room-join-confirm')?.addEventListener('click',()=>RoomService.join(document.getElementById('room-code-input')?.value));
    document.getElementById('room-code-input')?.addEventListener('keydown',e=>{if(e.key==='Enter')RoomService.join(e.currentTarget.value)});
    document.getElementById('room-join-back')?.addEventListener('click',()=>{RoomService.reset();this.showLobby()});
  }
});