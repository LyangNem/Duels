





const OnlineDuelService={
  active:false,selecting:false,spectatorOnly:false,mode:MatchModeService.DUEL,
  localPid:null,remotePid:null,remotePids:[],remotePlayer:null,remotePlayers:new Map(),
  lastStateSentAt:0,stateInterval:25,lastCombatSnapshotSentAt:0,combatSnapshotInterval:150,
  packetSequence:0,lastRemoteStateSequence:0,lastRemoteStateSequences:new Map(),remoteClockBaselines:new Map(),remoteStateSamples:new Map(),
  actionSequence:0,lastRemoteActionSequence:0,lastRemoteActionSequences:new Map(),
  lastRemoteCounterResolveSequence:0,lastRemoteCounterResolveSequences:new Map(),
  localAugments:[],remoteAugments:[],remoteAugmentsByPid:new Map(),
  round:1,scores:{},winsRequired:5,roundToken:0,roundResolving:false,pendingDeathAt:0,_deadPids:new Set(),_deathOrder:[],
  _deathPresentations:new Map(),_confirmedDeathPids:new Set(),_processedConfirmedDeathEffects:new Set(),localDefeatPresentation:null,lastConfirmedDeath:null,
  handledRoundResults:new Set(),
  startAugmentSelected:null,betweenCharacterId:null,betweenAugmentId:null,
  betweenReady:false,betweenStateSelections:{},betweenReadyPids:new Set(),
  member(pid){return RoomService.members.get(pid)||null},
  characterPreviewGrid(){
    if(RoomService.duelPhase==='between'){
      return document.getElementById(
        'between-char-grid'
      );
    }

    return document.getElementById(
      'char-grid'
    );
  },
  clearCharacterPreviewPresentation(){
    const grid=
      this.characterPreviewGrid();
    if(!grid)return false;

    for(
      const card of
      grid.querySelectorAll(
        ':scope > .char-card'
      )
    ){
      card.classList.remove(
        'team-preview-selected'
      );
      card.style.removeProperty(
        '--team-preview-color'
      );
      card.querySelector(
        '.team-preview-badges'
      )?.remove();
    }
    return true;
  },
  renderCharacterPreviews(){
    const grid=
      this.characterPreviewGrid();
    if(!grid)return false;

    this.clearCharacterPreviewPresentation();

    const localMember=
      RoomService.localMember();
    if(!localMember?.team)return false;

    const byCharacter=new Map();

    for(
      const [pid,characterId] of
      RoomService.characterPreviewSelections
    ){
      const member=
        RoomService.members.get(pid);

      if(
        pid===RoomService.localPid||
        !member||
        member.team!==localMember.team||
        member.departed===true||
        !GAME_DATA.characters[characterId]||
        RoomService.isCharacterBanned(characterId)
      )continue;

      if(!byCharacter.has(characterId)){
        byCharacter.set(
          characterId,
          []
        );
      }
      byCharacter.get(characterId).push(
        {
          pid,
          member
        }
      );
    }

    for(
      const [characterId,entries] of
      byCharacter
    ){
      const card=grid.querySelector(
        `.char-card[data-id="${CSS.escape(characterId)}"]`
      );
      if(!card)continue;

      const team=
        RoomTeams[entries[0]?.member?.team];
      const color=
        team?.color||'#4af';

      card.classList.add(
        'team-preview-selected'
      );
      card.style.setProperty(
        '--team-preview-color',
        color
      );

      const badges=
        document.createElement('div');
      badges.className=
        'team-preview-badges';

      for(
        const {pid,member} of entries
      ){
        const badge=
          document.createElement('span');
        badge.className=
          'team-preview-badge';
        badge.textContent=
          PlayerDisplayNameService.resolve(
            pid,
            member.profile
          );
        badge.style.setProperty(
          '--team-preview-color',
          color
        );
        badges.appendChild(badge);
      }

      card.appendChild(badges);
    }

    return true;
  },
  updateCharacterPreview(payload){
    if(
      RoomService.duelPhase!=='select'&&
      RoomService.duelPhase!=='between'&&
      this.selecting!==true
    )return false;

    const pid=String(payload?.pid||'');
    const characterId=
      String(
        payload?.characterId||''
      );

    if(pid){
      if(
        characterId&&
        GAME_DATA.characters[characterId]
      ){
        RoomService.characterPreviewSelections
          .set(
            pid,
            characterId
          );
      }else if(!characterId){
        RoomService.characterPreviewSelections
          .delete(pid);
      }
    }

    return this.renderCharacterPreviews();
  },
  clearAugmentPreviewPresentation(){
    const grid=
      document.getElementById(
        'between-aug-grid'
      );
    if(!grid)return false;

    for(
      const card of
      grid.querySelectorAll(
        '.aug-pick-card'
      )
    ){
      card.classList.remove(
        'team-augment-preview-selected'
      );
      card.style.removeProperty(
        '--team-preview-color'
      );
      card.querySelector(
        '.team-augment-preview-badges'
      )?.remove();
    }

    return true;
  },
  renderAugmentPreviews(){
    const grid=
      document.getElementById(
        'between-aug-grid'
      );
    if(
      !grid||
      RoomService.duelPhase!=='between'
    )return false;

    this.clearAugmentPreviewPresentation();

    const localMember=
      RoomService.localMember();
    if(!localMember?.team)return false;

    for(
      const [pid,augmentId] of
      RoomService.augmentPreviewSelections
    ){
      const member=
        RoomService.members.get(pid);

      if(
        pid===RoomService.localPid||
        !member||
        member.team!==localMember.team||
        member.departed===true||
        !AugmentDataService.get(augmentId)
      )continue;

      const card=grid.querySelector(
        `.aug-pick-card[data-owner-pid="${CSS.escape(pid)}"][data-id="${CSS.escape(augmentId)}"]`
      );

      if(!card)continue;

      const team=
        RoomTeams[member.team];
      const color=
        team?.color||'#4af';

      card.classList.add(
        'team-augment-preview-selected'
      );
      card.style.setProperty(
        '--team-preview-color',
        color
      );

      let badges=card.querySelector(
        '.team-augment-preview-badges'
      );
      if(!badges){
        badges=document.createElement('div');
        badges.className=
          'team-augment-preview-badges';
        card.appendChild(badges);
      }

      const badge=
        document.createElement('span');
      badge.className=
        'team-augment-preview-badge';
      badge.textContent=
        PlayerDisplayNameService.resolve(
          pid,
          member.profile
        );
      badge.style.setProperty(
        '--team-preview-color',
        color
      );
      badges.appendChild(badge);
    }

    return true;
  },
  updateAugmentPreview(payload){
    if(
      RoomService.duelPhase!=='between'
    )return false;

    const pid=String(payload?.pid||'');
    const augmentId=String(
      payload?.augmentId||''
    );

    if(pid){
      if(
        augmentId&&
        AugmentDataService.get(augmentId)
      ){
        RoomService.augmentPreviewSelections
          .set(
            pid,
            augmentId
          );
      }else if(!augmentId){
        RoomService.augmentPreviewSelections
          .delete(pid);
      }
    }

    return this.renderAugmentPreviews();
  },
  showSelect(payload=null){
    this.mode=
      payload?.mode||
      RoomService.matchMode||
      this.mode||
      MatchModeService.DUEL;
    RoomService.matchMode=this.mode;
    this.selecting=true;
    this.active=false;

    const result=document.getElementById('result-oveleulay');
    if(result)result.style.display='none';
    const roundOverlay=document.getElementById('round-result-overlay');
    if(roundOverlay)roundOverlay.style.display='none';

    RoomService.characterPreviewSelections.clear();
    Training.showSelect('online');
    this.updateCharacterReadyState({ready:[],selections:{}});
    this.renderCharacterPreviews();
  },
  updateCharacterReadyState(payload){
    if(
      RoomService.duelPhase!=='select'&&
      this.selecting!==true
    )return false;

    if(
      payload?.selections&&
      typeof payload.selections==='object'
    ){
      for(
        const [pid,charId] of
        Object.entries(payload.selections)
      ){
        if(pid&&GAME_DATA.characters[charId]){
          RoomService.duelSelections.set(
            pid,
            charId
          );
          RoomService.characterPreviewSelections
            .set(
              pid,
              charId
            );
        }
      }
    }

    const readySet=
      new Set(payload?.ready||[]);
    const localReady=
      readySet.has(RoomService.localPid);
    const others=
      RoomService.matchPids()
        .filter(pid=>pid!==RoomService.localPid);
    const readyOthers=
      others.filter(pid=>readySet.has(pid)).length;

    const status=
      document.getElementById('sel-status');
    if(status){
      if(!others.length){
        status.textContent='다른 플레이어 대기 중';
        status.className='status';
      }else if(readyOthers===others.length){
        status.textContent=
          others.length===1
            ?'상대 준비 완료'
            :`다른 플레이어 준비 완료 ${readyOthers} / ${others.length}`;
        status.className='status ok';
      }else{
        status.textContent=
          others.length===1
            ?'상대 준비 중'
            :`다른 플레이어 준비 중 ${readyOthers} / ${others.length}`;
        status.className='status';
      }
    }

    const confirm=
      document.getElementById('confirm-btn');
    if(confirm){
      confirm.disabled=localReady;
      confirm.textContent=
        localReady?'준비 완료':'선택 완료';
    }

    this.renderCharacterPreviews();
    return true;
  },
  confirmCharacter(){
    if(!this.selecting)return false;
    const characterId=Training.selectedCharacterId;
    if(!GAME_DATA.characters[characterId]){UiStatusService.set('sel-status','캐릭터를 선택해주세요!','err');return false}
    RoomService.submitCharacter(characterId);
    const confirm=document.getElementById('confirm-btn');
    if(confirm){confirm.disabled=true;confirm.textContent='준비 완료'}
    const randomButton=document.getElementById('random-btn');
    if(randomButton)randomButton.disabled=true;
    document.querySelectorAll('#char-grid .char-card').forEach(card=>card.classList.add('selection-locked'));
    return true;
  },
  showStartAugment(payload){
    const normalMode=(payload?.gameMode||RoomService.settings.gameMode)!=='augment';
    document.getElementById('scr-start-aug')?.classList.toggle('normal-match',normalMode);
    document.querySelectorAll('#char-grid .char-card').forEach(card=>{
      card.classList.remove('selection-locked');
    });
    this.setStartAugChoiceVisibility(true);
    this.startAugmentReady=false;
    this.startAugmentSelected=null;
    this.startAugmentReadyPids=new Set();
    this.startAugmentSelections={};
    this.startAugmentNoPickWarned=false;
    this.active=false;

    if(payload?.selections&&typeof payload.selections==='object'){
      for(const [pid,charId] of Object.entries(payload.selections)){
        if(pid&&GAME_DATA.characters[charId])RoomService.duelSelections.set(pid,charId);
      }
    }

    const startCharacterRow=document.getElementById('start-aug-char-row');
    if(startCharacterRow){
      startCharacterRow.style.removeProperty('grid-template-columns');
      startCharacterRow.style.removeProperty('width');
      startCharacterRow.style.removeProperty('display');
      startCharacterRow.style.removeProperty('flex-wrap');
      [...startCharacterRow.children].forEach(card=>{
        card.style.removeProperty('flex');
        card.style.removeProperty('width');
        card.style.removeProperty('max-width');
      });
    }

    const startTitle=document.getElementById('start-aug-title');
    const startSubtitle=document.getElementById('start-aug-subtitle');
    if(startTitle){startTitle.style.display='';startTitle.textContent=normalMode?'게임 준비':'증강 선택';}
    if(startSubtitle){startSubtitle.style.display='';startSubtitle.textContent=normalMode?'캐릭터를 확인하고 준비를 완료하세요':'게임 시작 전 증강을 하나 선택하세요';}

    const peerInfo=document.getElementById('start-aug-peer-info');
    const countdown=document.getElementById('start-aug-countdown');
    const button=document.getElementById('start-aug-confirm-btn');
    if(peerInfo){peerInfo.style.display='none';peerInfo.innerHTML=''}
    if(countdown){countdown.style.display='none';countdown.textContent=''}
    if(button){button.style.display='';button.disabled=false;button.textContent=normalMode?'준비 완료':'선택 완료'}

    const gridElement=document.getElementById('start-aug-grid');
    if(gridElement){
      gridElement.style.removeProperty('display');
    }

    const charRow=document.getElementById('start-aug-char-row');
    if(charRow){
      charRow.innerHTML='';

      const renderChar=(charId,cls,label,pid)=>{
        const char=GAME_DATA.characters[charId];
        if(!char)return;

        const card=document.createElement('div');
        card.className=`char-card start-aug-char-card ${cls}`;
        card.dataset.id=char.id;
        card.dataset.pid=pid||'';
        card.dataset.charTooltip='true';
        card.dataset.hideDifficulty='true';
        card.style.cursor='default';

        const stats=
          CharacterCardStatsService.rows(char)
            .filter(([key])=>key!=='난이도');
        const statsHtml=CharacterCardStatsService.html(stats);

        const labelColor=
          pid
            ?TeamColorPresentationService.colorForPid(
              pid,
              cls==='me'
                ?'#fa0'
                :'#67a'
            )
            :(
              cls==='me'
                ?'#fa0'
                :'#67a'
            );

        card.innerHTML=`
          <div class="char-tooltip">${CharacterDescriptionService.html(char)}</div>
          <div class="char-icon" style="${CharacterCardColorService.inlineIconStyle(char)}"></div>
          <div class="char-name" style="${CharacterCardColorService.inlineNameStyle(char)}">${CharacterCardColorService.inlineNameHtml(char)}</div>
          <div style="font-size:9px;color:${labelColor};letter-spacing:2px;margin-bottom:4px;">${label}</div>
          <div class="char-stats">${statsHtml}</div>`;

        const ownerProfile=
          RoomService.members.get(pid)?.profile||
          (
            pid===RoomService.localPid
              ?PlayerProfileService.snapshot()
              :null
          )||
          AccountState.current;

        card.dataset.masteryPid=pid||'';
        card._recordAccountData=
          ownerProfile;

        if(typeof CharacterRecordService?.applyCardStyle==='function'){
          CharacterRecordService.applyCardStyle(
            card,
            char.id,
            ownerProfile
          );
        }
        CharacterCardPortraitService.attach(card,char);

charRow.appendChild(card);
      };

      const localPid=RoomService.localPid||'P1';
      const participantPids=
        Object.keys(payload?.selections||{})
          .sort((a,b)=>a.localeCompare(b));

      for(const pid of participantPids){
        const charId=
          RoomService.duelSelections.get(pid)||
          payload?.selections?.[pid]||
          null;
        if(!charId)continue;

        renderChar(
          charId,
          pid===localPid?'me':'peer',
          pid===localPid
            ?`${PlayerDisplayNameService.resolve(pid)} · 나`
            :PlayerDisplayNameService.resolve(pid),
          pid
        );
      }
    }

    const options=normalMode?[]:payload?.choicesByPid?.[RoomService.localPid]||[];
    const grid=document.getElementById('start-aug-grid');
    if(grid){
      grid.style.display=normalMode?'none':'';
      grid.innerHTML='';

      for(const id of options){
        const augment=AugmentDataService.get(id);
        if(!augment)continue;

        const rarityColor=AugmentRarityPresentation.color(augment.rarity);
        const card=document.createElement('div');
        card.className='start-aug-item';
        card.dataset.id=augment.id;
        card.dataset.rarity=augment.rarity||'common';

        card.innerHTML=`
          <div class="start-aug-emoji">${augment.emoji||'◆'}</div>
          <div class="start-aug-name" style="color:${rarityColor}">${augment.name}</div>
          <div class="start-aug-rarity" style="color:${rarityColor}">${AugmentRarityPresentation.label(augment.rarity)}</div>
          <div class="start-aug-desc"></div>`;

        const desc=card.querySelector('.start-aug-desc');
        if(desc)desc.innerHTML=augment.desc||'';

        card.onclick=()=>{
          if(this.startAugmentReady)return;
          grid.querySelectorAll('.start-aug-item').forEach(node=>node.classList.remove('sel'));
          card.classList.add('sel');
          this.startAugmentSelected=augment.id;
          this.startAugmentNoPickWarned=false;
        };

        grid.appendChild(card);
      }
    }

    requestAnimationFrame(()=>{
      const startCharRow=document.getElementById(
        'start-aug-char-row'
      );
      const startAugGrid=document.getElementById(
        'start-aug-grid'
      );

      MatchSelectionLayoutService.apply(
        startCharRow,
        startCharRow?.children.length||0,
        160
      );
      MatchSelectionLayoutService.applyHorizontalRow(
        startAugGrid,
        180,
        5
      );

      SelectionEntranceAnimationService.animate(
        startCharRow,
        ':scope > .start-aug-char-card'
      );
      SelectionEntranceAnimationService.animate(
        startAugGrid,
        ':scope > .start-aug-item'
      );
    });

    document.querySelectorAll('.screen').forEach(screen=>screen.classList.add('hidden'));
    document.getElementById('scr-start-aug')?.classList.remove('hidden');
    OnlineChatService.syncVisibility();

    const status=document.getElementById('start-aug-status');
    const spectatorOnly=
      this.spectatorOnly===true||
      RoomService.localMember()?.spectator===true;

    if(status){
      status.textContent=
        spectatorOnly?'대기 중':'';
      status.className='status';
    }

    if(spectatorOnly){
      grid
        ?.querySelectorAll('.start-aug-item')
        .forEach(card=>{
          card.style.pointerEvents='none';
          card.classList.add('locked');
        });

      if(button){
        button.disabled=true;
        button.textContent='대기 중';
        button.onclick=null;
      }
      return;
    }

    if(button){
      button.onclick=()=>{
        if(this.startAugmentReady)return;

        if(!normalMode&&!this.startAugmentSelected&&!this.startAugmentNoPickWarned){
          this.startAugmentNoPickWarned=true;
          if(status){
            status.textContent='⚠ 증강을 선택하지 않았습니다. 계속하려면 다시 누르세요.';
            status.className='status err';
          }
          return;
        }

        this.startAugmentReady=true;
        grid?.querySelectorAll('.start-aug-item').forEach(card=>{
          card.style.pointerEvents='none';
        });

        button.disabled=true;
        if(status){
          const others=
            Math.max(
              1,
              RoomService.matchPids().length-1
            );
          const waiting=
            others===1
              ?'상대방 대기 중...'
              :'다른 플레이어 대기 중...';
          status.textContent=
            this.startAugmentSelected
              ?waiting
              :`선택 없이 시작합니다. ${waiting}`;
          status.className='status';
        }

        RoomService.submitStartAugment(this.startAugmentSelected);
      };
    }
  },
  updateStartAugmentReadyState(payload){
    const readyPids=
      Array.isArray(payload)
        ?payload
        :(payload?.ready||[]);
    const selected=
      Array.isArray(payload)
        ?{}
        :(payload?.selected||{});

    this.startAugmentReadyPids=
      new Set(readyPids);
    this.startAugmentSelections={
      ...(this.startAugmentSelections||{}),
      ...selected
    };

    const otherPids=
      RoomService.matchPids().filter(
        pid=>pid!==RoomService.localPid
      );
    const readyOthers=
      otherPids.filter(
        pid=>
          this.startAugmentReadyPids.has(pid)
      ).length;

    const status=
      document.getElementById(
        'start-aug-status'
      );

    if(
      this.spectatorOnly||
      RoomService.localMember()?.spectator
    ){
      if(status){
        status.textContent='대기 중';
        status.className='status';
      }
      const button=
        document.getElementById(
          'start-aug-confirm-btn'
        );
      if(button){
        button.disabled=true;
        button.textContent='대기 중';
      }
      return false;
    }

    if(
      status&&
      this.startAugmentReady
    ){
      if(readyOthers===otherPids.length){
        status.textContent=
          otherPids.length===1
            ?'상대방 준비 완료'
            :'다른 플레이어 준비 완료';
        status.className='status ok';
      }else{
        status.textContent=
          otherPids.length===1
            ?'상대방 대기 중...'
            :`다른 플레이어 대기 중 ${readyOthers} / ${otherPids.length}`;
        status.className='status';
      }
    }

    return (
      otherPids.length>0&&
      readyOthers===otherPids.length
    );
  },

  setStartAugChoiceVisibility(visible){
    const grid=document.getElementById('start-aug-grid');
    const button=document.getElementById('start-aug-confirm-btn');
    const screen=document.getElementById('scr-start-aug');

    if(screen)screen.classList.toggle('duels2-both-ready',!visible);

    if(grid){
      grid.classList.toggle('duels2-start-aug-hidden',!visible);
      if(visible)grid.style.removeProperty('display');
      else grid.style.setProperty('display','none','important');
    }

    if(button){
      if(visible)button.style.removeProperty('display');
      else button.style.setProperty('display','none','important');
    }
  },
  showStartAugmentCountdown(payload){
    const seconds=
      Math.max(
        0,
        Number(payload?.seconds)||0
      );
    const selected=
      payload?.selected||{};

    this.setStartAugChoiceVisibility(false);

    const status=
      document.getElementById(
        'start-aug-status'
      );
    const peerInfo=
      document.getElementById(
        'start-aug-peer-info'
      );
    const countdown=
      document.getElementById(
        'start-aug-countdown'
      );
    const button=
      document.getElementById(
        'start-aug-confirm-btn'
      );

    if(button){
      button.style.removeProperty('display');
      button.disabled=true;
    }

    if(peerInfo){
      peerInfo.replaceChildren();
      peerInfo.style.cssText=
        'display:flex;flex-wrap:wrap;justify-content:center;align-items:flex-start;gap:14px;margin-bottom:12px;';

      const remotePids=RoomService.settings.gameMode!=='augment'?[]:
        RoomService.matchPids().filter(
          pid=>pid!==RoomService.localPid
        );

      if(RoomService.settings.gameMode!=='augment')peerInfo.style.display='none';
      for(const pid of remotePids){
        const result=
          document.createElement('div');
        result.className=
          'start-aug-peer-result';
        result.dataset.pid=pid;

        AugmentAcquisitionResultRenderer.render(
          result,
          selected[pid]||null,
          {
            title:
              remotePids.length===1
                ?'상대방이 획득한 증강'
                :`${KoreanParticleService.subject(PlayerDisplayNameService.resolve(pid))} 획득한 증강`,
            emptyText:
              remotePids.length===1
                ?'상대방은 증강을 선택하지 않았습니다.'
                :`${KoreanParticleService.topic(PlayerDisplayNameService.resolve(pid))} 증강을 선택하지 않았습니다.`
          }
        );

        peerInfo.appendChild(result);
      }
    }

    if(countdown){
      countdown.style.display='none';
      countdown.textContent='';
    }

    const ffa=
      this.mode===MatchModeService.FFA;

    const spectatorOnly=
      this.spectatorOnly===true||
      RoomService.localMember()?.spectator===true;

    if(button){
      button.disabled=true;
      button.textContent=
        spectatorOnly
          ?'대기 중'
          :seconds>0
            ?`${seconds}초 후 시작...`
            :'게임 시작';
    }

    if(status){
      status.textContent=
        spectatorOnly
          ?'대기 중'
          :(
            ffa||
            this.mode===MatchModeService.TEAM
          )
            ?'모든 플레이어 선택 완료!'
            :'양쪽 선택 완료!';
      status.className=
        spectatorOnly
          ?'status'
          :'status ok';
    }
  },

  startRound(payload){
    OnlineChatService
      .preserveAcrossMatchTransition();
    CombatStatusApplicationService.reset();
    OnlinePresentationSyncService.reset();
    OnlineAugmentInventorySyncService.reset();
    NetworkHitAuthorityService.reset();
    OnlineDebugControlSyncService.reset();

    if(payload?.mapId){
      RoomService.currentMapId=payload.mapId;
      MatchMapService.apply(payload.mapId);
    }

    const localPid=RoomService.localPid;
    const pids=Object.keys(
      payload?.selections||{}
    );
    const localMember=
      RoomService.localMember();
    const spectatorOnly=
      payload?.spectatorActivation===true||
      payload?.type==='duel-spectator-start'||
      localMember?.spectating===true;

    if(
      localMember?.spectator===true&&
      !spectatorOnly
    ){
      return false;
    }
    const remotePids=
      spectatorOnly
        ?[...pids]
        :pids.filter(pid=>pid!==localPid);

    if(
      !localPid||
      pids.length<2||
      !remotePids.length
    )return false;

    this.mode=
      payload.mode||
      RoomService.matchMode||
      MatchModeService.resolve(
        RoomService.members
      )||
      MatchModeService.DUEL;
    RoomService.matchMode=this.mode;

    this.localPid=localPid;
    this.spectatorOnly=spectatorOnly;
    this.remotePids=remotePids;
    this.remotePid=remotePids[0]||null;
    this.selecting=false;
    this.active=true;
    this.roundResolving=false;
    this.pendingDeathAt=0;
    this._deadPids=new Set();
    this._deathOrder.length=0;
    this._deathPresentations.clear();
    this._confirmedDeathPids.clear();
    this._processedConfirmedDeathEffects.clear();
    OnlineKillAttributionService.reset();
    KillRewardService.reset();
    CombatEventToastService.reset();
    document
      .getElementById('kill-log')
      ?.replaceChildren();
    this.localDefeatPresentation=null;
    this.lastConfirmedDeath=null;
    this._deathRoundToken=0;
    this._reportedLocalDeathToken=0;

    this.remotePlayer=null;
    this.remotePlayers.clear();
    this.lastStateSentAt=0;
    this.lastCombatSnapshotSentAt=0;
    this.packetSequence=0;
    this.lastRemoteStateSequence=0;
    this.lastRemoteStateSequences.clear();
    this.remoteClockBaselines.clear();
    this.remoteStateSamples.clear();
    this.actionSequence=0;
    this.lastRemoteActionSequence=0;
    this.lastRemoteActionSequences.clear();
    this.lastRemoteCounterResolveSequence=0;
    this.lastRemoteCounterResolveSequences.clear();

    this.round=
      Math.max(1,Number(payload.round)||1);
    this.roundToken=
      Math.max(
        1,
        Number(payload.roundToken)||this.round
      );

    if(
      this.round===1&&
      this.roundToken===1
    ){
      this.handledRoundResults.clear();
    }

    this.scores={
      ...(payload.scores||{})
    };
    this.winsRequired=
      Math.max(
        1,
        Math.min(
          8,
          Number(
            payload.winsRequired??
            (
              payload.total!==undefined
                ?Math.ceil(
                  Math.max(
                    1,
                    Number(payload.total)||9
                  )/2
                )
                :RoomService.settings.winsRequired
            )
          )||5
        )
      );

    this.localAugments=
      spectatorOnly
        ?[]
        :[
          ...(payload.augments?.[localPid]||[])
        ];
    this.remoteAugmentsByPid.clear();

    for(const pid of remotePids){
      this.remoteAugmentsByPid.set(
        pid,
        [
          ...(payload.augments?.[pid]||[])
        ]
      );
    }

    this.remoteAugments=[
      ...(this.remoteAugmentsByPid.get(
        this.remotePid
      )||[])
    ];

    if(
      payload.selections&&
      typeof payload.selections==='object'
    ){
      for(
        const [pid,charId] of
        Object.entries(payload.selections)
      ){
        if(
          pid&&
          GAME_DATA.characters[charId]
        ){
          RoomService.duelSelections.set(
            pid,
            charId
          );
        }
      }
    }

    const memberByPid=new Map(
      (payload.members||[]).map(
        member=>[member.pid,member]
      )
    );

    const participants=pids.map(pid=>{
      const member=
        this.member(pid)||
        memberByPid.get(pid)||
        {};
      const roomTeam=
        payload.teams?.[pid]||
        member.team||
        pid;

      return {
        pid,
        characterId:
          payload.selections[pid],
        team:roomTeam,
        roomTeam,
        profile:
          member.profile||{},
        augments:[
          ...(payload.augments?.[pid]||[])
        ]
      };
    });

    const overlay=
      document.getElementById(
        'round-result-overlay'
      );
    if(overlay)overlay.style.display='none';

    Training.startOnline({
      mode:this.mode,
      localPid,
      participants,
      spectatorOnly,
      spawnOrder:Array.isArray(payload.spawnOrder)
        ?[...payload.spawnOrder]
        :participants.map(item=>item.pid)
    });

    this.remotePlayers=
      Training.remotePlayers;
    this.remotePlayer=
      this.remotePlayers.get(
        this.remotePid
      )||
      this.remotePlayers.values().next().value||
      null;

    this.updateRoundScore();
    return true;
  },
  updateRoundScore(){
    const score=
      document.getElementById(
        'round-score'
      );
    if(!score)return;

    if(!this.active){
      score.style.display='none';
      return;
    }

    RoundScorePresentationService.render(
      score,
      this.scores,
      this.winsRequired,
      this.mode
    );
  },
  serializeAuthoritativeDummies(){
    const authorityPid=
      String(this.localPid||'');

    if(!authorityPid)return [];

    const result=[];

    for(const dummy of Training.dummies){
      if(
        !dummy||
        dummy.kind!=='dummy'||
        !EntityService.items.has(dummy.id)||
        String(dummy.simulationAuthorityPid||'')!==
          authorityPid
      )continue;

      result.push({
        id:String(dummy.id),
        x:Number(dummy.x)||0,
        y:Number(dummy.y)||0,
        radius:Math.max(1,Number(dummy.radius)||20),
        maxHealth:Math.max(1,Number(dummy.maxHealth)||1),
        health:Math.max(0,Number(dummy.health)||0),
        maxStamina:Math.max(0,Number(dummy.maxStamina)||0),
        stamina:Math.max(0,Number(dummy.stamina)||0),
        alive:dummy.alive!==false,
        hidden:dummy.hidden===true,
        respawnRemaining:
          dummy.respawnAt>0
            ?Math.max(
              0,
              dummy.respawnAt-performance.now()
            )
            :0
      });
    }

    return result;
  },
  applyAuthoritativeDummies(
    authorityPid,
    snapshots,
    now=performance.now()
  ){
    const pid=String(authorityPid||'');
    if(!pid||!Array.isArray(snapshots))return false;

    let changed=false;

    for(const snapshot of snapshots){
      const id=String(snapshot?.id||'');
      if(!id)continue;

      let dummy=
        EntityService.items.get(id)||
        null;

      if(!dummy){
        dummy=
          OnlineDebugControlSyncService
            .createDummyFromSpec({
              id,
              x:Number(snapshot.x)||0,
              y:Number(snapshot.y)||0,
              radius:Math.max(
                1,
                Number(snapshot.radius)||20
              ),
              maxHealth:Math.max(
                1,
                Number(snapshot.maxHealth)||10000
              ),
              maxStamina:Math.max(
                0,
                Number(snapshot.maxStamina)||
                  GAME_DATA.stamina.max
              ),
              stamina:Math.max(
                0,
                Number(snapshot.stamina)||
                  GAME_DATA.stamina.max
              ),
              simulationAuthorityPid:pid
            });
      }

      if(
        !dummy||
        dummy.kind!=='dummy'
      )continue;

      dummy.ownerId=id;
      dummy.teamId=id;
      dummy.simulationAuthorityPid=pid;

      const x=Number(snapshot.x);
      const y=Number(snapshot.y);

      if(Number.isFinite(x)){
        dummy.x=x;
        dummy.netAuthoritativeX=x;
        dummy.netCollisionX=x;
        dummy.netTargetX=x;
      }

      if(Number.isFinite(y)){
        dummy.y=y;
        dummy.netAuthoritativeY=y;
        dummy.netCollisionY=y;
        dummy.netTargetY=y;
      }

      dummy.netStateAt=now;
      dummy._networkStateReady=true;

      const maxHealth=
        Math.max(
          1,
          Number(snapshot.maxHealth)||
            dummy.maxHealth||
            1
        );
      const maxStamina=
        Math.max(
          0,
          Number(snapshot.maxStamina)||
            dummy.maxStamina||
            0
        );

      dummy.maxHealth=maxHealth;
      dummy.maxStamina=maxStamina;
      dummy.health=
        Math.max(
          0,
          Math.min(
            maxHealth,
            Number(snapshot.health)||0
          )
        );
      dummy.stamina=
        Math.max(
          0,
          Math.min(
            maxStamina,
            Number(snapshot.stamina)||0
          )
        );
      dummy.alive=snapshot.alive!==false;
      dummy.hidden=snapshot.hidden===true;
      dummy.respawnAt=
        Math.max(
          0,
          Number(snapshot.respawnRemaining)||0
        )>0
          ?now+
            Math.max(
              0,
              Number(snapshot.respawnRemaining)||0
            )
          :0;

      changed=true;
    }

    return changed;
  },
  statePacket(player,now,includeCombatSnapshot=false){
    const regenDelayMult=
      player.healthRegenPolicy
        ?Math.max(
          0,
          CombatStatsService
            .current(player,now)
            .regenDelayMult
        )
        :1;
    const naturalRegenReadyAt=
      player.healthRegenPolicy
        ?NaturalHealthRegenActivityService
          .latest(player)+
          Math.max(
            0,
            Number(
              player.healthRegenPolicy.idle
            )||0
          )*
          regenDelayMult
        :0;

    return {
      type:'duel-state',
      worldDestruction:includeCombatSnapshot?WorldDestructionService.snapshot():undefined,
      sequence:++this.packetSequence,
      roundToken:this.roundToken,
      sentAt:Date.now(),
      x:player.x,
      y:player.y,
      health:player.health,
      maxHealth:player.maxHealth,
      shield:ShieldService.current(player),
      stamina:player.stamina,
      maxStamina:player.maxStamina,
      commandOverclockActive:
        player._commandOverclock?.active===true,
      alive:player.alive,
      recordPoints:
        CharacterRecordService.points(
          player.character?.id,
          AccountState.current
        ),
      naturalRegenReadyRemaining:
        player.healthRegenPolicy
          ?Math.max(
            0,
            naturalRegenReadyAt-now
          )
          :0,
      naturalRegenReady:
        !!player.healthRegenPolicy&&
        now>=naturalRegenReadyAt,
      lastDamageSourcePid:
        player.lastDamageSourcePid||null,
      lastKillerCandidatePid:
        player.lastDamageSourcePid||null,
      dodgeRemaining:NetworkTimeValueService.serializeDeadline(
        player.dodgeUntil||0,
        now
      ).remaining,
      dodgeInfinite:player.dodgeUntil===Infinity,
      invincibleRemaining:NetworkTimeValueService.serializeDeadline(
        player.invincibleUntil||0,
        now
      ).remaining,
      invincibleInfinite:player.invincibleUntil===Infinity,
      counterRemaining:NetworkTimeValueService.serializeDeadline(
        player.counterReadyUntil||0,
        now
      ).remaining,
      counterInfinite:player.counterReadyUntil===Infinity,
      counterCharges:Math.max(0,Math.floor(Number(player.counterReadyCharges)||0)),
      counterKind:
        CounterStockService.peekKind(
          player,
          now
        ),
      counterKinds:
        CounterStockService.enabled(player)
          ?CounterStockService.kinds(
            player,
            now
          )
          :null,
      aimAngle:
        Training.player===player
          ?Training.aimAngle()
          :0,
      aimTargetPoint:
        Training.player===player
          ?{
            x:Number(Training.mouseWorld().x)||0,
            y:Number(Training.mouseWorld().y)||0
          }
          :null,
      counterWindupAngle:
        player.counterWindup
          ?Number(player.counterWindup.angle)||0
          :null,
      combatSnapshot:includeCombatSnapshot
        ?NetworkCombatSnapshotService.serialize(
          player,
          now
        )
        :null,
      summons:
        SummonDeployService.serialize(
          player,
          now
        ),
      clusterSummons:
        ClusterSummonService.serialize(
          player,
          now
        ),
      movementAbility:MovementAbilityService.serialize(player),
      attackChannels:
        ChannelAttackService.serialize(player),
      timedActionStates:
        TimedActionStateService.serialize(player,now),
      progressStates:
        ProgressStateService.serialize(player),
      modeStates:ModeStateService.serialize(player,now),
      limitedUseBuffs:LimitedUseBuffService.serialize(player),
      fieldDodgeRewards:
        FieldDodgeRewardService.serialize(player,now),
      projectileStates:ProjectileStateService.serialize(player),
      stationaryProjectiles:StationaryProjectileInteractionService.networkSnapshots(player,now),
      projectileHomingTargets:
        ProjectileHomingTargetSyncService.serialize(player),
      projectileRide:
        ProjectileRideService.serialize(player),
      circleFormation:
        CircleFormationService.serialize(
          player,
          now
        ),
      orbitInventory:
        OrbitInventoryService.serialize(
          player,
          now
        ),
      cooking:
        CookingService.serialize(
          player
        ),
      dynamicWalls:
        DynamicWallService.serialize(player),
      debugDummies:
        this.serializeAuthoritativeDummies()
    };
  },
  syncLocalState(player,now=performance.now()){
    if(
      !this.active||
      !player||
      now-this.lastStateSentAt<this.stateInterval
    )return false;

    this.lastStateSentAt=now;

    const includeCombatSnapshot=
      player.combatSnapshotDirty===true||
      now-this.lastCombatSnapshotSentAt>=
        this.combatSnapshotInterval;

    const sent=
      RoomService.sendGameplay(
        this.statePacket(
          player,
          now,
          includeCombatSnapshot
        )
      );

    if(sent&&includeCombatSnapshot){
      player.combatSnapshotDirty=false;
      this.lastCombatSnapshotSentAt=now;
    }

    return sent;
  },
  sendFieldClear(stateKey){
    if(!this.active||this.roundResolving)return false;

    RoomService.sendGameplay({
      type:'duel-field-clear',
      roundToken:this.roundToken,
      sentAt:Date.now(),
      stateKey:String(stateKey||'segment')
    });
    return true;
  },
  sendFieldResolved(fieldOwnerPid,fieldDescriptor,outcome){
    if(!this.active||this.roundResolving)return false;

    const descriptor=
      fieldDescriptor&&typeof fieldDescriptor==='object'
        ?fieldDescriptor
        :{
          instanceId:String(fieldDescriptor||''),
          baseStateKey:'segment',
          phase:'source-wall',
          wallA:null,
          wallB:null
        };

    RoomService.sendGameplay({
      type:'duel-field-resolved',
      roundToken:this.roundToken,
      sentAt:Date.now(),
      fieldOwnerPid:String(fieldOwnerPid||''),
      resolvedByPid:String(this.localPid||''),
      field:{
        instanceId:String(descriptor.instanceId||''),
        baseStateKey:String(descriptor.baseStateKey||'segment'),
        phase:String(descriptor.phase||'source-wall'),
        point:descriptor.point
          ?{
            x:Number(descriptor.point.x)||0,
            y:Number(descriptor.point.y)||0
          }
          :null,
        anchorEntityId:String(descriptor.anchorEntityId||''),
        wallA:descriptor.wallA
          ?{
            x:Number(descriptor.wallA.x)||0,
            y:Number(descriptor.wallA.y)||0,
            w:Math.max(0,Number(descriptor.wallA.w)||0),
            h:Math.max(0,Number(descriptor.wallA.h)||0)
          }
          :null,
        wallB:descriptor.wallB
          ?{
            x:Number(descriptor.wallB.x)||0,
            y:Number(descriptor.wallB.y)||0,
            w:Math.max(0,Number(descriptor.wallB.w)||0),
            h:Math.max(0,Number(descriptor.wallB.h)||0)
          }
          :null
      },
      outcome:outcome==='dodged'?'dodged':'hit'
    });
    return true;
  },
  sendProjectileImpactConfirmed(
    projectile,
    reason='target'
  ){
    if(
      !this.active||
      this.roundResolving||
      !projectile
    )return false;

    const ownerPid=
      OnlineParticipantEntityService.pid(
        projectile.source
      );
    if(!ownerPid)return false;

    RoomService.sendGameplay({
      type:'duel-projectile-impact-confirmed',
      roundToken:this.roundToken,
      sentAt:Date.now(),
      projectileOwnerPid:String(ownerPid),
      projectileKey:String(
        projectile.networkKey||''
      ),
      attackId:String(
        projectile.attack?.id||''
      ),
      executionSequence:
        Math.max(
          0,
          Math.floor(
            Number(
              projectile.volley
                ?.execution
                ?.sequence
            )||0
          )
        ),
      reason:String(reason||'target'),
      impactPoint:{
        x:Number(projectile.x)||0,
        y:Number(projectile.y)||0
      },
      angle:
        Number.isFinite(Number(projectile.angle))
          ?Number(projectile.angle)
          :Math.atan2(
            Number(projectile.vy)||0,
            Number(projectile.vx)||0
          )
    });
    return true;
  },

  sendProjectileGuardResolved(
    projectileOwnerPid,
    projectileKey,
    stateKey,
    outcome,
    impactPoint=null,
    blockMetadata={}
  ){
    if(!this.active||this.roundResolving)return false;

    RoomService.sendGameplay({
      type:'duel-projectile-guard-resolved',
      attackId:String(blockMetadata.attackId||''),executionSequence:Number(blockMetadata.executionSequence)||0,defenderPid:String(blockMetadata.defenderPid||''),
      roundToken:this.roundToken,
      sentAt:Date.now(),
      projectileOwnerPid:String(projectileOwnerPid||''),
      projectileKey:String(projectileKey||''),
      stateKey:String(stateKey||''),
      impactPoint:
        impactPoint&&
        Number.isFinite(Number(impactPoint.x))&&
        Number.isFinite(Number(impactPoint.y))
          ?{
            x:Number(impactPoint.x),
            y:Number(impactPoint.y)
          }
          :null,
      outcome:
        outcome==='return'
          ?'return'
          :'remove'
    });
    return true;
  },
  sendAttackGuardResolved({
    defenderPid,
    attackerPid,
    attackId,
    executionSequence,
    impactType
  }={}){
    if(!this.active||this.roundResolving)return false;

    RoomService.sendGameplay({
      type:'duel-attack-guard-resolved',
      roundToken:this.roundToken,
      sentAt:Date.now(),
      defenderPid:String(defenderPid||''),
      attackerPid:String(attackerPid||''),
      attackId:String(attackId||''),
      executionSequence:Math.max(
        0,
        Math.floor(Number(executionSequence)||0)
      ),
      impactType:String(impactType||'')
    });
    return true;
  },
  sendAbilityAction(action,slot,angle,result=null,targetPoint=null){
    if(!this.active||this.roundResolving)return false;

    const resolvedTargetPoint=result?.targetPoint||targetPoint;
    const hasTargetPoint=
      resolvedTargetPoint&&
      Number.isFinite(Number(resolvedTargetPoint.x))&&
      Number.isFinite(Number(resolvedTargetPoint.y));

    RoomService.sendGameplay({
      type:'duel-action',
      action:String(action||'ability'),
      roundToken:this.roundToken,
      actionSequence:++this.actionSequence,
      sentAt:Date.now(),
      sourceX:Number(Training.player?.x),
      sourceY:Number(Training.player?.y),
      slot,
      angle:Number(angle)||0,
      abilityUseId:
        String(
          result?.abilityUseId||
          ''
        ),
      handled:result?.handled===true,
      modeStep:Number(result?.modeStep)<0?-1:1,
      modeStates:result?.modeStates||ModeStateService.serialize(Training.player),
      skipAttackWindup:
        result?.skipAttackWindup===true,
      resolvedAttackId:String(result?.attackId||''),
      targetEntityId:String(result?.targetEntityId||''),
      cookingMealCount:Math.max(0,Math.floor(Number(result?.cookingMealCount)||0)),
      executionSequence:
        Number.isFinite(Number(result?.executionSequence))
          ?Math.max(
            0,
            Math.floor(Number(result.executionSequence)||0)
          )
          :null,
      networkAttackAdjustments:
        result?.networkAttackAdjustments
          ?{...result.networkAttackAdjustments}
          :null,
      stateWindowSelection:
        result?.stateWindowSelection&&
        typeof result.stateWindowSelection==='object'
          ?EffectSpawnService.definitionSnapshot(result.stateWindowSelection)
          :null,
      commandFeatures:
        CommandFeatureService.networkSnapshot(
          Training.player
        ),
      targetPoint:hasTargetPoint
        ?{
          x:Number(resolvedTargetPoint.x),
          y:Number(resolvedTargetPoint.y)
        }
        :null
    });
    return true;
  },
  sendAbility(slot,angle,result=null,targetPoint=null){
    return this.sendAbilityAction(
      'ability',
      slot,
      angle,
      result,
      targetPoint
    );
  },
  sendScheduledProjectileShot({
    attack,
    execution,
    shotIndex=0,
    angle=0,
    perpendicularOffset=0,
    sourceX=0,
    sourceY=0
  }={}){
    if(
      !this.active||
      this.roundResolving||
      !attack||
      !execution
    )return false;

    RoomService.sendGameplay({
      type:'duel-scheduled-projectile-shot',
      roundToken:this.roundToken,
      sentAt:Date.now(),
      attackId:String(attack.id||''),
      networkAttackAdjustments:
        execution.networkAttackAdjustments
          ?{...execution.networkAttackAdjustments}
          :null,
      executionSequence:
        Math.max(
          0,
          Math.floor(
            Number(execution.sequence)||0
          )
        ),
      shotIndex:
        Math.max(
          0,
          Math.floor(Number(shotIndex)||0)
        ),
      angle:Number(angle)||0,
      perpendicularOffset:
        Number(perpendicularOffset)||0,
      sourceX:Number(sourceX)||0,
      sourceY:Number(sourceY)||0
    });
    return true;
  },

  sendAbilityHold(slot,angle,result=null,targetPoint=null){
    return this.sendAbilityAction(
      'ability-hold',
      slot,
      angle,
      result,
      targetPoint
    );
  },

  sendAbilityRelease(slot,angle,releaseData=null,result=null){
    if(!this.active||this.roundResolving)return false;

    RoomService.sendGameplay({
      type:'duel-action',
      action:'ability-release',
      roundToken:this.roundToken,
      actionSequence:++this.actionSequence,
      sentAt:Date.now(),
      sourceX:Number(Training.player?.x),
      sourceY:Number(Training.player?.y),
      slot,
      angle:Number(angle)||0,
      senderHandled:result?.handled===true,
      modeStates:result?.modeStates||ModeStateService.serialize(Training.player),
      senderExecuted:result?.executed===true,
      resolvedAttackId:String(result?.attackId||''),
      executionSequence:
        Number.isFinite(Number(result?.executionSequence))
          ?Math.max(
            0,
            Math.floor(Number(result.executionSequence)||0)
          )
          :null,
      networkAttackAdjustments:
        result?.networkAttackAdjustments
          ?{...result.networkAttackAdjustments}
          :null,
      commandFeatures:
        CommandFeatureService.networkSnapshot(
          Training.player
        ),
      resolvedChargeProgress:
        Number.isFinite(Number(releaseData?.resolvedChargeProgress))
          ?Number(releaseData.resolvedChargeProgress)
          :null,
      deferredWhileMovement:releaseData?.deferredWhileMovement===true,
      dragStateKey:String(releaseData?.dragStateKey||''),
      dragDistance:
        Math.max(0,Number(releaseData?.dragDistance)||0),
      dragProgress:
        Number.isFinite(Number(releaseData?.dragProgress))
          ?Math.max(0,Math.min(1,Number(releaseData.dragProgress)))
          :null,
      dragPath:
        Array.isArray(releaseData?.dragPath)
          ?releaseData.dragPath.slice(0,DragPathInputService.MAX_POINTS).map(
            point=>({
              x:Number(point?.x)||0,
              y:Number(point?.y)||0
            })
          )
          :null
    });
    return true;
  },
  sendDodge(direction){
    if(!this.active||this.roundResolving)return false;

    RoomService.sendGameplay({
      type:'duel-action',
      action:'dodge',
      roundToken:this.roundToken,
      actionSequence:++this.actionSequence,
      sentAt:Date.now(),
      sourceX:Number(Training.player?.x),
      sourceY:Number(Training.player?.y),
      direction:{
        x:Number(direction?.x)||0,
        y:Number(direction?.y)||0
      }
    });
    return true;
  },
  sendJustDodgeConfirmed(
    startedAt,
    confirmedAt=performance.now()
  ){
    if(
      !this.active||
      this.roundResolving
    )return false;

    RoomService.sendGameplay({
      type:'duel-just-dodge-confirmed',
      roundToken:this.roundToken,
      sentAt:Date.now(),
      startedAt:
        Math.max(0,Number(startedAt)||0),
      confirmedAt:
        Math.max(0,Number(confirmedAt)||0)
    });
    return true;
  },
  rollbackPredictedDodgeDamage(
    pid,
    remote,
    payload
  ){
    if(!remote)return false;

    const ledger=
      remote._predictedDodgeDamage||[];
    let restore=0;

    for(const item of ledger){
      restore+=Math.max(
        0,
        Number(item?.amount)||0
      );
    }

    remote._predictedDodgeDamage=[];

    if(restore>0){
      remote.health=Math.min(
        remote.maxHealth,
        Math.max(0,remote.health)+restore
      );
      if(remote.health>0){
        remote.alive=true;
        remote.hidden=false;
      }
      remote.healthTrailHealth=
        Math.max(
          Number(remote.healthTrailHealth)||0,
          remote.health
        );
    }

    remote.lastDamageSourcePid=null;
    return true;
  },
  sendCounterResolve(angle,attack=null){
    if(!this.active||this.roundResolving)return false;

    const projectile=AttackModuleService.projectile(attack);
    const resolvedCharge=attack?{
      range:Math.max(0,Number(attack.range)||0),
      spread:AttackModuleService.spread(attack),
      projectileSpeed:Math.max(0,Number(projectile?.speed)||0)
    }:null;

    RoomService.sendGameplay({
      type:'duel-counter-resolve',
      roundToken:this.roundToken,
      counterSequence:++this.actionSequence,
      sentAt:Date.now(),
      sourceX:Number(Training.player?.x),
      sourceY:Number(Training.player?.y),
      angle:Number(angle)||0,
      resolvedCharge,
      formationSnapshot:
        CircleFormationService
          .counterNetworkSnapshot(
            Training.player
          )
    });
    return true;
  },
  networkDelayMs(pid,sentAt){
    const stamp=Number(sentAt);
    if(!Number.isFinite(stamp)||stamp<=0)return 0;
    const delta=Date.now()-stamp;
    const old=this.remoteClockBaselines.get(pid);
    const baseline=Number.isFinite(old)?Math.min(old,delta):delta;
    this.remoteClockBaselines.set(pid,baseline);
    return Math.max(0,Math.min(120,delta-baseline));
  },
  reconcileRemoteAction(pid,remote,payload){
    if(!remote)return 0;
    const x=Number(payload?.sourceX);
    const y=Number(payload?.sourceY);
    if(Number.isFinite(x)&&Number.isFinite(y)){
      remote.x=Math.max(remote.radius,Math.min(WorldBoundsService.width()-remote.radius,x));
      remote.y=Math.max(remote.radius,Math.min(WorldBoundsService.height()-remote.radius,y));
      remote.netCollisionX=remote.x;
      remote.netCollisionY=remote.y;
    }
    const delay=this.networkDelayMs(pid,payload?.sentAt);
    remote._networkActionDelayMs=delay;
    remote._networkActionReceivedAt=performance.now();
    remote._networkActionSentAt=
      Math.max(0,Number(payload?.sentAt)||0);
    return delay;
  },
  receive(pid,payload){
    if(!this.active||pid===this.localPid||!this.remotePids.includes(pid)){
      return false;
    }
    if(Number(payload?.roundToken)&&Number(payload.roundToken)!==this.roundToken){
      return false;
    }

    if(payload.type==='duel-world-destruction'){
      return OnlineWorldDestructionSyncService.receive(payload);
    }

    const remote=
      this.remotePlayers.get(pid)||
      Training.remotePlayers.get(pid);

    if(payload.type==='duel-attack-snapshot'){
      if(!remote)return false;
      this.reconcileRemoteAction(pid,remote,payload);
      return GameplayAttackSnapshotSyncService.apply(remote,payload);
    }

    if(payload.type==='duel-effect-event'){
      return GameplayEffectEventSyncService.apply(payload);
    }

    if(payload.type==='duel-field-clear'){
      InstalledAreaFieldService.clear(
        remote,
        String(payload.stateKey||'segment'),
        {broadcast:false}
      );
      return true;
    }
    if(payload.type==='duel-field-resolved'){
      const fieldOwnerPid=String(
        payload.fieldOwnerPid||''
      );
      if(!fieldOwnerPid)return false;

      const source=
        OnlineParticipantEntityService.entity(
          fieldOwnerPid
        );
      if(!source)return false;

      const descriptor=
        payload.field&&
        typeof payload.field==='object'
          ?payload.field
          :{
            instanceId:String(payload.stateKey||''),
            baseStateKey:'segment',
            phase:'source-wall',
            point:null,
            anchorEntityId:'',
            wallA:null,
            wallB:null
          };

      return InstalledAreaFieldService.clearResolved(
        source,
        descriptor,
        {broadcast:false,triggered:true}
      );
    }

    if(payload.type==='duel-projectile-relay'){
      const source=OnlineParticipantEntityService.entity(String(payload.ownerPid||''));
      if(String(payload.ownerPid||'')!==pid||!(Number(payload.executionSequence)>0))return false;
      const relay=(Object.values(source?.character?.attacks||{})).some(a=>(a.modules||[]).some(m=>m.type==='projectile.wall-relay'&&m.attackId===payload.attackId));
      return relay&&ProjectileRedirectService.fireRelay(source,source&&AbilityService.attackById(source.character,String(payload.attackId||'')),payload.point,Number(payload.angle),String(payload.key||''),Number(payload.executionSequence));
    }

    if(payload.type==='duel-projectile-redirect'){
      const owner=OnlineParticipantEntityService.entity(String(payload.projectileOwnerPid||''));
      return ProjectileRedirectSyncService.receive(owner,payload);
    }

    if(payload.type==='duel-attack-guard-resolved'){
      const attacker=OnlineParticipantEntityService.entity(String(payload.attackerPid||''));
      if(attacker?.character?.reactiveEquipment)ReactiveEquipmentService.blocked(attacker,String(payload.defenderPid||''),`${attacker.id}:${payload.attackId}:execution:${payload.executionSequence}`);
      return true;
    }

    if(payload.type==='duel-projectile-impact-confirmed'){
      const ownerPid=String(
        payload.projectileOwnerPid||''
      );
      const projectileKey=String(
        payload.projectileKey||''
      );
      const reason=String(
        payload.reason||'target'
      );
      const point=
        payload.impactPoint&&
        Number.isFinite(
          Number(payload.impactPoint.x)
        )&&
        Number.isFinite(
          Number(payload.impactPoint.y)
        )
          ?{
            x:Number(payload.impactPoint.x),
            y:Number(payload.impactPoint.y)
          }
          :null;

      if(!ownerPid||!point)return false;

      const dedupeKey=
        `${ownerPid}:${projectileKey||String(payload.attackId||'')}:${Math.max(
          0,
          Math.floor(
            Number(payload.executionSequence)||0
          )
        )}:${reason}`;

      this._confirmedProjectileImpacts=
        this._confirmedProjectileImpacts||
        new Set();

      if(
        this._confirmedProjectileImpacts
          .has(dedupeKey)
      ){
        return true;
      }
      this._confirmedProjectileImpacts
        .add(dedupeKey);

      if(
        this._confirmedProjectileImpacts.size>
        256
      ){
        this._confirmedProjectileImpacts
          .delete(
            this._confirmedProjectileImpacts
              .values()
              .next()
              .value
          );
      }

      const owner=
        OnlineParticipantEntityService.entity(
          ownerPid
        );
      if(!owner)return false;

      let projectile=
        projectileKey
          ?ProjectileService.findByNetworkKey(
            owner,
            projectileKey
          )
          :null;

      if(projectile){
        const index=
          ProjectileService.items.indexOf(
            projectile
          );

        projectile.x=point.x;
        projectile.y=point.y;
        projectile.prevX=point.x;
        projectile.prevY=point.y;
        if(
          projectile.origin&&
          Number.isFinite(Number(projectile.origin.x))&&
          Number.isFinite(Number(projectile.origin.y))
        ){
          projectile.travel=Math.hypot(
            point.x-Number(projectile.origin.x),
            point.y-Number(projectile.origin.y)
          );
        }

        if(
          Number.isFinite(Number(payload.angle))
        ){
          projectile.angle=
            Number(payload.angle);
        }

        ProjectileImpactService.resolve(
          projectile,
          reason
        );

        const confirmedArrival=
          TargetPointProjectileService.arrival(projectile);
        if(
          reason==='target'&&
          confirmedArrival?.linger?.atTarget===true
        ){
          if(!projectile.stationaryArrival){
            TargetPointProjectileService.beginLinger(
              projectile,
              performance.now(),
              'target'
            );
          }else{
            projectile.arrivalReason='target';
            projectile.stationaryArrival.arrivalReason='target';
            projectile.stationaryArrival.fixedX=point.x;
            projectile.stationaryArrival.fixedY=point.y;
            projectile.stationaryArrival.fixedTravel=
              Math.max(0,Number(projectile.travel)||0);
          }
          projectile.x=point.x;
          projectile.y=point.y;
          projectile.prevX=point.x;
          projectile.prevY=point.y;
          return true;
        }

        if(index>=0){
          ProjectileService.finish(
            projectile,
            projectile.hadHit===true
          );
          ProjectileService.items.splice(
            index,
            1
          );
        }
        return true;
      }

      const attackId=
        String(payload.attackId||'');
      const baseAttack=
        AbilityService.attackById(
          owner.character,
          attackId
        );
      if(!baseAttack)return false;

      const attack=
        AugmentService.prepareAttack(
          owner,
          baseAttack,
          performance.now()
        );
      const impactConfig=
        ProjectileModuleService.config(
          attack
        )?.impact||
        null;
      if(!impactConfig)return false;

      const execution=
        AttackExecutionService.replica(
          owner,
          attack,
          Math.max(
            0,
            Math.floor(
              Number(
                payload.executionSequence
              )||0
            )
          ),
          Number(payload.angle)||0
        );
      execution.networkReplay=true;

      const carrier={
        source:owner,
        attack,
        x:point.x,
        y:point.y,
        prevX:point.x,
        prevY:point.y,
        angle:Number(payload.angle)||0,
        behavior:{
          impact:impactConfig
        },
        volley:{
          execution
        },
        networkKey:
          projectileKey||
          `confirmed-impact:${attackId}:${execution.sequence}`
      };

      ProjectileImpactService.resolve(
        carrier,
        reason
      );
      const delivery=AttackModuleService.module(attack,'delivery.projectile');
      if(reason==='target'&&delivery?.arrival?.linger?.atTarget===true){
        const restored=ProjectileService.spawn({...carrier,projectile:{...delivery,networkSpawnCompensation:false},
          behavior:ProjectileModuleService.config(attack),angle:Number(payload.angle)||0});
        restored.impactResolved=true;
        TargetPointProjectileService.beginLinger(restored,performance.now(),'target');
      }
      return true;
    }

    if(payload.type==='duel-projectile-guard-resolved'){
      const ownerPid=String(
        payload.projectileOwnerPid||''
      );
      if(!ownerPid)return false;

      const owner=
        OnlineParticipantEntityService.entity(
          ownerPid
        );
      if(!owner)return false;
      if(owner.character?.reactiveEquipment)ReactiveEquipmentService.blocked(owner,String(payload.defenderPid||''),Number(payload.executionSequence)>0?`${owner.id}:${payload.attackId}:execution:${payload.executionSequence}`:`${owner.id}:${payload.attackId}:projectile:${payload.projectileKey}`);

      if(payload.outcome==='remove'){
        ProjectileImpactService.correctGuardPath(owner,payload.projectileKey,payload.impactPoint);
      }

      let projectile=
        ProjectileService.findByNetworkKey(
          owner,
          payload.projectileKey
        );

      if(!projectile&&payload.stateKey){
        projectile=
          ProjectileStateService.get(
            owner,
            String(payload.stateKey)
          );
      }

      if(!projectile){
        // 이미 이 화면에서 같은 결과를 먼저 반영한 경우 멱등 성공.
        return true;
      }


      if(payload.outcome==='return'){
        if(!projectile.behavior?.returning)return false;

        const guardPoint=
          payload.impactPoint&&
          Number.isFinite(Number(payload.impactPoint.x))&&
          Number.isFinite(Number(payload.impactPoint.y))
            ?payload.impactPoint
            :null;
        if(guardPoint){
          projectile.x=Number(guardPoint.x);
          projectile.y=Number(guardPoint.y);
          projectile.prevX=projectile.x;
          projectile.prevY=projectile.y;
        }

        return (
          ProjectileStateService.beginReturn(
            projectile,
            {manual:false}
          )||
          projectile.behavior?.returning?.phase==='returning'
        );
      }

      const index=
        ProjectileService.items.indexOf(
          projectile
        );
      if(index<0)return true;

      const guardPoint=
        payload.impactPoint&&
        Number.isFinite(Number(payload.impactPoint.x))&&
        Number.isFinite(Number(payload.impactPoint.y))
          ?payload.impactPoint
          :null;
      if(guardPoint){
        projectile.x=Number(guardPoint.x);
        projectile.y=Number(guardPoint.y);
      }
      if(
        projectile.behavior?.impact?.resolveOnGuard===true
      ){
        ProjectileImpactService.resolve(
          projectile,
          'guard'
        );
      }

      ProjectileService.finish(
        projectile,
        projectile.hadHit===true
      );
      ProjectileService.items.splice(
        index,
        1
      );
      return true;
    }


    if(
      payload.type===
        'duel-scheduled-projectile-shot'
    ){
      if(!remote)return false;

      const attackId=
        String(payload.attackId||'');
      const baseAttack=
        AbilityService.attackById(
          remote.character,
          attackId
        );
      if(!baseAttack)return false;
      const attack=
        AugmentService.prepareAttack(
          remote,
          baseAttack,
          performance.now(),
          {
            networkAdjustments:
              payload.networkAttackAdjustments&&
              typeof payload.networkAttackAdjustments==='object'
                ?payload.networkAttackAdjustments
                :null
          }
        );

      const projectile=
        AttackModuleService.projectile(
          attack
        );
      if(!projectile)return false;

      const delayedVolley=
        AttackModuleService.module(
          attack,
          'delivery.delayed-projectile-volley'
        );
      const perShotProjectileOverrides=
        Array.isArray(
          delayedVolley?.perShotProjectileOverrides
        )
          ?delayedVolley.perShotProjectileOverrides
          :null;

      const executionSequence=
        Math.max(
          0,
          Math.floor(
            Number(payload.executionSequence)||0
          )
        );
      const shotIndex=
        Math.max(
          0,
          Math.floor(
            Number(payload.shotIndex)||0
          )
        );
      const projectileOverride=
        perShotProjectileOverrides&&
        perShotProjectileOverrides[shotIndex]&&
        typeof perShotProjectileOverrides[shotIndex]==='object'
          ?perShotProjectileOverrides[shotIndex]
          :null;
      const packetKey=
        `${attackId}:${executionSequence}:${shotIndex}`;

      const received=
        remote._scheduledProjectileShotKeys||
        (
          remote._scheduledProjectileShotKeys=
            new Set()
        );

      if(received.has(packetKey)){
        return true;
      }
      received.add(packetKey);
      if(received.size>128){
        received.delete(
          received.values().next().value
        );
      }

      const volleyKey=
        `${attackId}:${executionSequence}`;
      const replayStarts=
        remote._networkScheduledVolleyStarts||
        (
          remote._networkScheduledVolleyStarts=
            new Map()
        );
      let replayStartAt=replayStarts.get(volleyKey);
      if(!Number.isFinite(Number(replayStartAt))){
        const replayDelayUntil=
          remote._networkAttackDelayReplayUntil||
          (
            remote._networkAttackDelayReplayUntil=
              new Map()
          );
        const delayKey=AttackService.delayKey(attack);
        const delayDuration=AttackService.delayDuration(attack);
        replayStartAt=Math.max(
          performance.now(),
          delayKey
            ?Number(replayDelayUntil.get(delayKey))||0
            :0
        );
        replayStarts.set(volleyKey,replayStartAt);
        if(delayKey&&delayDuration>0){
          replayDelayUntil.set(
            delayKey,
            replayStartAt+delayDuration
          );
        }
        if(replayStarts.size>128){
          replayStarts.delete(
            replayStarts.keys().next().value
          );
        }
      }

      const perVolleyPellets=
        delayedVolley?.perVolleyPellets===true;
      const pelletsPerVolley=
        perVolleyPellets
          ?Math.max(
            1,
            AttackModuleService.pelletCount(attack)
          )
          :1;
      const volleyIndex=
        perVolleyPellets
          ?Math.floor(shotIndex/pelletsPerVolley)
          :shotIndex;
      const replayShotAt=
        Number(replayStartAt)+
        Math.max(0,Number(delayedVolley?.delay)||0)+
        Math.max(0,Number(delayedVolley?.interval)||0)*
          Math.max(0,volleyIndex);

      const spawnScheduledShot=()=>{
        if(!remote?.alive)return false;

        const volleys=
          remote._networkScheduledVolleys||
          (
            remote._networkScheduledVolleys=
              new Map()
          );

        let volley=volleys.get(volleyKey);
        if(!volley){
          const execution=
            AttackExecutionService.replica(
              remote,
              attack,
              executionSequence,
              Number(payload.angle)||0
            );
          execution.networkReplay=true;

          volley={
            execution,
            total:
              AttackModuleService
                .deliveryCount(attack),
            resolved:0,
            hits:0,
            source:remote,
            attack,
            finished:false
          };
          volleys.set(volleyKey,volley);
        }

        const angle=
          Number(payload.angle)||0;
        const offset=
          Number(payload.perpendicularOffset)||0;
        const sourceX=
          Number.isFinite(Number(payload.sourceX))
            ?Number(payload.sourceX)
            :Number(remote.x)||0;
        const sourceY=
          Number.isFinite(Number(payload.sourceY))
            ?Number(payload.sourceY)
            :Number(remote.y)||0;
        const px=
          -Math.sin(angle)*offset;
        const py=
          Math.cos(angle)*offset;
        const spawnX=sourceX+px;
        const spawnY=sourceY+py;

        ProjectileService.spawn({
          source:remote,
          perpendicularOffset:offset,
          attack,
          volley,
          x:spawnX,
          y:spawnY,
          origin:{
            x:spawnX,
            y:spawnY
          },
          angle,
          targetEntityId:
            volley?.execution?.targetEntityId||'',
          projectile,
          networkKey:
            `${attackId}:${executionSequence}:${shotIndex}`,
          behavior:
            ProjectileModuleService.withShotOverride(
              ProjectileModuleService.config(
                attack
              ),
              projectileOverride
            )
        });

        if(
          shotIndex>=
          AttackModuleService.deliveryCount(attack)-1
        ){
          setTimeout(()=>{
            if(
              remote._networkScheduledVolleys?.
                get(volleyKey)===volley
            ){
              remote._networkScheduledVolleys
                .delete(volleyKey);
            }
            remote._networkScheduledVolleyStarts?.
              delete(volleyKey);
          },2000);
        }

        return true;
      };

      if(Number(replayShotAt)>performance.now()+1){
        SimulationScheduleService.scheduleContinuation({
          at:Number(replayShotAt),
          source:remote,
          continue:spawnScheduledShot
        });
      }else{
        spawnScheduledShot();
      }

      return true;
    }

    if(payload.type==='duel-status-apply'){
      return CombatStatusApplicationService.receive(
        pid,
        payload
      );
    }

    if(payload.type==='duel-presentation'){
      return OnlinePresentationSyncService.receive(
        pid,
        payload
      );
    }

    if(payload.type==='duel-augment-inventory'){
      return OnlineAugmentInventorySyncService.receive(
        pid,
        payload
      );
    }

    if(payload.type==='duel-debug-map-change'){
      return OnlineDebugMapSyncService.receive(
        payload
      );
    }

    if(payload.type==='duel-debug-control'){
      return OnlineDebugControlSyncService.receive(
        pid,
        payload
      );
    }

    if(
      payload.type===
        'duel-triggered-attack'
    ){
      return TriggeredAttackService.receive(
        pid,
        payload
      );
    }

    if(!remote)return false;

    if(
      payload.type===
        'duel-hit-confirmed'
    ){
      return NetworkHitAuthorityService
        .receive(
          pid,
          payload
        );
    }

    if(
      payload.type===
        'duel-just-dodge-confirmed'
    ){
      return this.rollbackPredictedDodgeDamage(
        pid,
        remote,
        payload
      );
    }

    if(payload.type==='duel-counter-resolve'){
      const sequence=Math.max(
        0,
        Math.floor(
          Number(payload.counterSequence)||0
        )
      );
      const previous=
        this.lastRemoteCounterResolveSequences.get(pid)||0;

      if(
        sequence>0&&
        sequence<=previous
      )return false;

      if(sequence>0){
        this.lastRemoteCounterResolveSequences.set(
          pid,
          sequence
        );
        if(pid===this.remotePid){
          this.lastRemoteCounterResolveSequence=
            sequence;
        }
      }

      if(!remote.counterWindup)return false;

      this.reconcileRemoteAction(pid,remote,payload);

      const resolvedCharge=payload.resolvedCharge;
      if(
        remote.counterWindup?.charge&&
        resolvedCharge&&
        typeof resolvedCharge==='object'
      ){
        remote.counterWindup.lockedChargeValues={
          range:Math.max(0,Number(resolvedCharge.range)||0),
          spread:Math.max(0,Number(resolvedCharge.spread)||0),
          projectileSpeed:Math.max(0,Number(resolvedCharge.projectileSpeed)||0)
        };
        const rangeSpec=remote.counterWindup.charge?.range;
        const from=Number(rangeSpec?.from);
        const to=Number(rangeSpec?.to);
        remote.counterWindup.lockedChargeProgress=(
          Number.isFinite(from)&&Number.isFinite(to)&&Math.abs(to-from)>1e-9
        )
          ?Math.max(0,Math.min(1,(remote.counterWindup.lockedChargeValues.range-from)/(to-from)))
          :1;
        remote.counterWindup.holding=false;
      }

      if(
        Array.isArray(
          payload.formationSnapshot
        )
      ){
        CircleFormationService
          .setPendingCounterSnapshot(
            remote,
            payload.formationSnapshot
          );
      }

      const angle=Number(payload.angle);
      return CounterModuleService.finish(
        remote,
        Number.isFinite(angle)
          ?angle
          :remote.counterWindup.angle
      );
    }

    if(payload.type==='duel-state'){
      const sequence=Math.max(
        0,
        Math.floor(Number(payload.sequence)||0)
      );
      const previous=
        this.lastRemoteStateSequences.get(pid)||0;

      if(
        sequence>0&&
        sequence<=previous
      )return false;

      if(sequence>0){
        this.lastRemoteStateSequences.set(
          pid,
          sequence
        );
        if(pid===this.remotePid){
          this.lastRemoteStateSequence=sequence;
        }
      }

      if(Number(payload.roundToken)===Number(this.roundToken)&&payload.worldDestruction){
        WorldDestructionService.applySnapshot(payload.worldDestruction);
      }

      const x=Number(payload.x);
      const y=Number(payload.y);

      if(!remote._networkStateReady){
        if(Number.isFinite(x))remote.x=x;
        if(Number.isFinite(y))remote.y=y;
        remote._networkStateReady=true;
      }

      const senderAt=Number(payload.sentAt);
      const delayMs=this.networkDelayMs(pid,senderAt);
      const previousSample=this.remoteStateSamples.get(pid)||null;
      let velocityX=0;
      let velocityY=0;
      if(
        previousSample&&
        Number.isFinite(senderAt)&&
        senderAt>previousSample.sentAt&&
        senderAt-previousSample.sentAt<=250&&
        Number.isFinite(x)&&
        Number.isFinite(y)
      ){
        const dt=senderAt-previousSample.sentAt;
        velocityX=(x-previousSample.x)/dt;
        velocityY=(y-previousSample.y)/dt;
      }
      if(Number.isFinite(senderAt)&&Number.isFinite(x)&&Number.isFinite(y)){
        this.remoteStateSamples.set(pid,{x,y,sentAt:senderAt});
      }
      const movementSample=payload.movementAbility?.active===true;
      const movementWasActive=remote._remoteMovementAbilityActive===true;
      const leadMs=movementSample||movementWasActive
        ?0:Math.min(90,Math.max(12,delayMs+20));
      let predictedX=Number.isFinite(x)?x+velocityX*leadMs:remote.x;
      let predictedY=Number.isFinite(y)?y+velocityY*leadMs:remote.y;
      const leadDx=predictedX-x;
      const leadDy=predictedY-y;
      const leadDistance=Math.hypot(leadDx,leadDy);
      if(leadDistance>80){
        const scale=80/leadDistance;
        predictedX=x+leadDx*scale;
        predictedY=y+leadDy*scale;
      }
      predictedX=Math.max(remote.radius,Math.min(WorldBoundsService.width()-remote.radius,predictedX));
      predictedY=Math.max(remote.radius,Math.min(WorldBoundsService.height()-remote.radius,predictedY));
      remote.netAuthoritativeX=x;
      remote.netAuthoritativeY=y;
      remote.netCollisionX=predictedX;
      remote.netCollisionY=predictedY;
      remote.netTargetX=predictedX;
      remote.netTargetY=predictedY;
      remote.netStateAt=performance.now();

      const remoteMaxHealth=
        Math.max(
          1,
          Number(payload.maxHealth)||
            remote.maxHealth||
            1
        );
      const remoteMaxStamina=
        Math.max(
          0,
          Number(payload.maxStamina)||
            remote.maxStamina||
            0
        );

      remote.maxHealth=remoteMaxHealth;
      remote.maxStamina=remoteMaxStamina;
      remote.health=Math.max(
        0,
        Math.min(
          remoteMaxHealth,
          Number(payload.health)||0
        )
      );
      remote.shield=Math.max(
        0,
        Math.min(
          remoteMaxHealth,
          Number(payload.shield)||0
        )
      );
      remote.stamina=Math.max(
        0,
        Math.min(
          remoteMaxStamina,
          Number(payload.stamina)||0
        )
      );
      if(payload.commandOverclockActive===true){
        remote._commandOverclock={
          ...(remote._commandOverclock||{}),
          active:true
        };
      }else{
        remote._commandOverclock=null;
        BuffService.remove(
          remote,
          'attackRate',
          'command-feature:overclock'
        );
      }
      remote.alive=payload.alive!==false;
      remote._recordPoints=
        Math.max(
          0,
          Math.round(
            Number(payload.recordPoints)||0
          )
        );
      if(Number.isFinite(Number(payload.aimAngle))){
        remote._remoteAimAngle=Number(payload.aimAngle);
      }
      if(
        payload.aimTargetPoint&&
        Number.isFinite(Number(payload.aimTargetPoint.x))&&
        Number.isFinite(Number(payload.aimTargetPoint.y))
      ){
        remote._remoteAimTargetPoint={
          x:Number(payload.aimTargetPoint.x),
          y:Number(payload.aimTargetPoint.y)
        };
      }
      MovementAbilityService.applyRemote(
        remote,
        payload.movementAbility,
        performance.now()
      );
      ChannelAttackService.applyRemote(
        remote,
        payload.attackChannels
      );
      TimedActionStateService.applyRemote(
        remote,
        payload.timedActionStates||[],
        performance.now()
      );
      ProgressStateService.applyRemote(
        remote,
        payload.progressStates||[]
      );
      if(Array.isArray(payload.modeStates))ModeStateService.applyRemote(remote,payload.modeStates);
      if(Array.isArray(payload.limitedUseBuffs))LimitedUseBuffService.applyRemote(remote,payload.limitedUseBuffs);
      FieldDodgeRewardService.applyRemote(
        remote,
        payload.fieldDodgeRewards||[],
        performance.now()
      );
      ProjectileStateService.applyRemote(
        remote,
        payload.projectileStates,
        payload.sentAt
      );
      StationaryProjectileInteractionService.applyNetworkSnapshots(
        remote,
        payload.stationaryProjectiles||[],
        payload.sentAt,
        performance.now(),
        delayMs
      );
      ProjectileHomingTargetSyncService.applyRemote(
        remote,
        payload.projectileHomingTargets,
        performance.now()
      );
      ProjectileRideService.applyRemote(
        remote,
        payload.projectileRide
      );
      CircleFormationService.applyRemote(
        remote,
        payload.circleFormation,
        performance.now()
      );
      OrbitInventoryService.applyRemote(
        remote,
        payload.orbitInventory,
        performance.now(),
        payload.sentAt
      );
      CookingService.applyRemote(
        remote,
        payload.cooking
      );
      DynamicWallService.applyRemote(
        remote,
        payload.dynamicWalls
      );

      this.applyAuthoritativeDummies(
        pid,
        payload.debugDummies,
        performance.now()
      );

      remote.hidden=!remote.alive;

      const attackerPid=
        payload.lastKillerCandidatePid||
        payload.lastDamageSourcePid||
        null;

      if(attackerPid){
        remote.lastDamageSourcePid=
          String(attackerPid);

        if(RoomService.isHost){
          OnlineKillAttributionService.remember(
            pid,
            remote.lastDamageSourcePid,
            this.roundToken
          );
        }
      }

      const now=performance.now();

      remote._networkNaturalRegenReady=
        payload.naturalRegenReady===true;
      remote._networkNaturalRegenReadyAt=
        remote._networkNaturalRegenReady
          ?now
          :now+
            Math.max(
              0,
              Number(
                payload
                  .naturalRegenReadyRemaining
              )||0
            );

      remote.dodgeUntil=
        NetworkTimeValueService.restoreDeadline(
          payload.dodgeRemaining,
          payload.dodgeInfinite===true,
          now
        );
      remote.invincibleUntil=
        NetworkTimeValueService.restoreDeadline(
          payload.invincibleRemaining,
          payload.invincibleInfinite===true,
          now
        );
      remote.counterReadyUntil=
        NetworkTimeValueService.restoreDeadline(
          payload.counterRemaining,
          payload.counterInfinite===true,
          now
        );
      remote.counterReadyCharges=
        Math.max(0,Math.floor(Number(payload.counterCharges)||0));
      remote._counterSingleKind=
        String(payload.counterKind||'normal');
      if(Array.isArray(payload.counterKinds)){
        if(!Array.isArray(remote.counterReadyChargeKinds)){
          remote.counterReadyChargeKinds=[];
        }
        remote.counterReadyChargeKinds.length=0;
        for(const kind of payload.counterKinds){
          remote.counterReadyChargeKinds.push(
            String(kind||'normal')
          );
        }
      }

      if(
        remote.counterWindup&&
        Number.isFinite(
          Number(payload.counterWindupAngle)
        )
      ){
        remote.counterWindup.angle=
          Number(payload.counterWindupAngle);
        CounterModuleService.trackAim(
          remote,
          ()=>remote.counterWindup.angle
        );
      }

      if(payload.combatSnapshot){
        NetworkCombatSnapshotService.apply(
          remote,
          payload.combatSnapshot,
          now
        );
      }

      SummonDeployService.applyRemote(
        remote,
        payload.summons,
        now
      );
      ClusterSummonService.applyRemote(
        remote,
        payload.clusterSummons,
        now
      );

      // 사망 판정은 상태 미러의 alive=false를 추론하지 않는다.
      // 실제 소유자가 보낸 duel-round-death만 authoritative death 진입점으로 사용한다.
      return true;
    }

    if(payload.type==='duel-feature-state'){
      return GameplayFeatureStateSyncService.apply(remote,payload);
    }

    if(payload.type==='duel-windup-commit'){
      const packetRoundToken=
        Math.max(
          0,
          Math.floor(
            Number(
              payload.roundToken
            )||0
          )
        );

      if(
        packetRoundToken>0&&
        packetRoundToken!==
          Math.max(
            0,
            Math.floor(
              Number(
                OnlineDuelService.roundToken
              )||0
            )
          )
      ){
        return false;
      }

      const sourceEntityId=
        String(
          payload.sourceEntityId||
          ''
        );

      const windupSource=
        (
          sourceEntityId
            ?EntityService.items.get(
              sourceEntityId
            )
            :null
        )||
        remote;

      return AttackWindupService.commitRemoteContinuation(
        windupSource,
        String(
          payload.key||
          ''
        )
      );
    }

    if(payload.type==='duel-windup-interrupt'){
      const packetRoundToken=
        Math.max(
          0,
          Math.floor(
            Number(
              payload.roundToken
            )||0
          )
        );

      if(
        packetRoundToken>0&&
        packetRoundToken!==
          Math.max(
            0,
            Math.floor(
              Number(
                OnlineDuelService.roundToken
              )||0
            )
          )
      ){
        return false;
      }

      return ForcedMovementWindupInterruptService.interrupt(
        remote,
        String(
          payload.reason||
          'forced-movement'
        ),
        {
          networkReplay:true
        }
      );
    }

    if(payload.type==='duel-action'){
      const actionSequence=Math.max(
        0,
        Math.floor(
          Number(payload.actionSequence)||0
        )
      );
      const previous=
        this.lastRemoteActionSequences.get(pid)||0;

      if(actionSequence>0&&actionSequence<=previous){
        return false;
      }
      if(actionSequence>0){
        this.lastRemoteActionSequences.set(
          pid,
          actionSequence
        );
        if(pid===this.remotePid){
          this.lastRemoteActionSequence=
            actionSequence;
        }
      }

      this.reconcileRemoteAction(pid,remote,payload);
      if(Array.isArray(payload.modeStates))ModeStateService.applyRemote(remote,payload.modeStates);

      if(Array.isArray(payload.commandFeatures)){
        CommandFeatureService.applyNetworkSnapshot(
          remote,
          payload.commandFeatures
        );
      }

      if(payload.action==='ability'){
        const ability=
          remote.character?.abilities?.[
            payload.slot
          ];
        if(!ability)return false;

        const remoteStateWindowSelection=
          payload.stateWindowSelection&&
          typeof payload.stateWindowSelection==='object'
            ?payload.stateWindowSelection
            :null;
        if(remoteStateWindowSelection){
          const stateKey=String(remoteStateWindowSelection.stateKey||'');
          const state=stateKey
            ?remote.actionState?.get(stateKey)||null
            :null;
          if(
            state?.kind==='timed-action-state'&&
            (
              Number(state.retainUntil)||
              Number(state.expiresAt)||0
            )>performance.now()
          ){
            state.data={
              ...(state.data||{}),
              ...(remoteStateWindowSelection.data&&
                typeof remoteStateWindowSelection.data==='object'
                  ?remoteStateWindowSelection.data
                  :{})
            };
          }
          // state.window select 입력은 공격 실행 패킷이 아니라 선택 확정 패킷이다.
          // 수신 시 현재 시각으로 조건을 다시 검사해 새 windup을 만들지 않는다.
          return true;
        }

        const activated=AbilityService.activate(
          remote,
          ability,
          {
            event:'input.press',
            modeStep:Number(payload.modeStep)<0?-1:1,
            modeStates:payload.modeStates,
            inputSlot:payload.slot,
            angle:Number(payload.angle)||0,
            targetPoint:
              payload.targetPoint&&
              Number.isFinite(Number(payload.targetPoint.x))&&
              Number.isFinite(Number(payload.targetPoint.y))
                ?{
                  x:Number(payload.targetPoint.x),
                  y:Number(payload.targetPoint.y)
                }
                :null,
            network:true,
            abilityUseId:
              String(
                payload.abilityUseId||
                ''
              )||
              undefined,
            senderHandled:payload.handled===true,
            handled:false,
            skipAttackWindup:
              payload.skipAttackWindup===true,
            resolvedAttackId:String(payload.resolvedAttackId||''),
            targetEntityId:String(payload.targetEntityId||''),
            cookingMealCount:Math.max(0,Math.floor(Number(payload.cookingMealCount)||0)),
            executionSequence:
              Number.isFinite(Number(payload.executionSequence))
                ?Math.max(
                  0,
                  Math.floor(Number(payload.executionSequence)||0)
                )
                :null,
            networkAttackAdjustments:
              payload.networkAttackAdjustments&&
              typeof payload.networkAttackAdjustments==='object'
                ?{...payload.networkAttackAdjustments}
                :null
          }
        );
        return activated;
      }

      if(payload.action==='ability-hold'){
        const ability=
          remote.character?.abilities?.[
            payload.slot
          ];
        if(!ability?.holdTrigger)return false;

        return AbilityService.activate(
          remote,
          ability,
          {
            event:'input.hold',
            modeStates:payload.modeStates,
            inputSlot:payload.slot,
            angle:Number(payload.angle)||0,
            targetPoint:
              payload.targetPoint&&
              Number.isFinite(Number(payload.targetPoint.x))&&
              Number.isFinite(Number(payload.targetPoint.y))
                ?{
                  x:Number(payload.targetPoint.x),
                  y:Number(payload.targetPoint.y)
                }
                :null,
            network:true,
            senderHandled:payload.handled===true,
            handled:false,
            resolvedAttackId:String(payload.resolvedAttackId||''),
            executionSequence:
              Number.isFinite(Number(payload.executionSequence))
                ?Math.max(
                  0,
                  Math.floor(Number(payload.executionSequence)||0)
                )
                :null,
            networkAttackAdjustments:
              payload.networkAttackAdjustments&&
              typeof payload.networkAttackAdjustments==='object'
                ?{...payload.networkAttackAdjustments}
                :null
          }
        );
      }

      if(payload.action==='ability-release'){
        const ability=
          remote.character?.abilities?.[
            payload.slot
          ];
        if(!ability?.releaseTrigger)return false;

        const resolvedChargeProgress=
          Number.isFinite(Number(payload.resolvedChargeProgress))
            ?Number(payload.resolvedChargeProgress)
            :null;
        const chargedAttack=
          resolvedChargeProgress!==null
            ?AbilityService.attackById(
              remote.character,
              ability.attackId
            )
            :null;
        const chargeStateKey=String(
          (ability.releaseTrigger.modules||[]).find(
            module=>AttackModuleService.type(module)==='charge.attack.release'
          )?.stateKey||'charge:primary'
        );

        // 네트워크 릴리스는 송신자가 확정한 차징률 자체가 canonical 값이다.
        // 이동 종료 후 발사를 의도한 릴리스만 기존 remote state 큐를 유지하고,
        // 그 외 차징 공격은 수신 측 임시 charge state 존재 여부와 무관하게 같은 dynamic AttackSpec을 직접 재생한다.
        if(
          payload.senderExecuted===true&&
          chargedAttack?.charge&&
          payload.deferredWhileMovement!==true
        ){
          ChargedAttackService.cancel(remote,ability);
          const spec=ChargedAttackService.dynamicSpec(
            chargedAttack,
            resolvedChargeProgress
          );
          return AttackService.execute(
            remote,
            spec,
            Number(payload.angle)||0,
            {
              networkReplay:true,
              freeAttack:true,
              executionSequence:
                Number.isFinite(Number(payload.executionSequence))
                  ?Math.max(
                    0,
                    Math.floor(Number(payload.executionSequence)||0)
                  )
                  :null,
              networkAttackAdjustments:
                payload.networkAttackAdjustments&&
                typeof payload.networkAttackAdjustments==='object'
                  ?{...payload.networkAttackAdjustments}
                  :null
            }
          );
        }

        return AbilityService.activate(
          remote,
          ability,
          {
            event:'input.release',
            inputSlot:payload.slot,
            angle:Number(payload.angle)||0,
            network:true,
            senderHandled:payload.senderHandled===true,
            senderExecuted:payload.senderExecuted===true,
            resolvedAttackId:String(payload.resolvedAttackId||''),
            executionSequence:
              Number.isFinite(Number(payload.executionSequence))
                ?Math.max(
                  0,
                  Math.floor(Number(payload.executionSequence)||0)
                )
                :null,
            networkAttackAdjustments:
              payload.networkAttackAdjustments&&
              typeof payload.networkAttackAdjustments==='object'
                ?{...payload.networkAttackAdjustments}
                :null,
            resolvedChargeProgress,
            deferredWhileMovement:payload.deferredWhileMovement===true,
            dragStateKey:String(payload.dragStateKey||''),
            dragDistance:
              Math.max(0,Number(payload.dragDistance)||0),
            dragProgress:
              Number.isFinite(Number(payload.dragProgress))
                ?Math.max(0,Math.min(1,Number(payload.dragProgress)))
                :null,
            dragPath:
              Array.isArray(payload.dragPath)
                ?payload.dragPath.slice(0,DragPathInputService.MAX_POINTS).map(
                  point=>({
                    x:Number(point?.x)||0,
                    y:Number(point?.y)||0
                  })
                )
                :null
          }
        );
      }

      if(payload.action==='dodge'){
        remote._predictedDodgeDamage=[];
        remote._networkDodgeStartedAt=
          performance.now();

        return EntityDodgeService.activate(
          remote,
          payload.direction,
          {
            spend:true,
            startJustDodge:false,
            emit:true
          }
        );
      }
    }

    return false;
  },
  interpolateRemote(frameScale=1){
    if(!this.active)return;

    const factor=
      1-Math.pow(
        1-.32,
        Math.max(.25,frameScale)
      );

    const interpolateEntity=entity=>{
      if(!entity?._networkStateReady)return false;

      const targetX=Number(entity.netTargetX);
      const targetY=Number(entity.netTargetY);
      if(
        !Number.isFinite(targetX)||
        !Number.isFinite(targetY)
      )return false;

      const dx=targetX-Number(entity.x);
      const dy=targetY-Number(entity.y);
      const distance=Math.hypot(dx,dy);

      // 큰 위치 교정/순간이동은 보간하지 않는다.
      if(distance>180){
        entity.x=targetX;
        entity.y=targetY;
        return true;
      }

      entity.x+=dx*factor;
      entity.y+=dy*factor;
      return true;
    };

    for(const remote of this.remotePlayers.values()){
      interpolateEntity(remote);

    }
  },
  captureLocalDefeat(event){
    if(
      !this.active||
      Training.sessionMode!=='online'||
      event?.entity!==Training.player
    )return false;

    const sourcePid=
      OnlineParticipantEntityService.pid(
        event.source
      )||
      event.entity?.lastDamageSourcePid||
      null;

    this.localDefeatPresentation={
      sourcePid:sourcePid||null,
      deathX:Number(event.entity?.x)||0,
      deathY:Number(event.entity?.y)||0,
      koOrigin:event.koOrigin
        ?{
          x:Number(event.koOrigin.x)||0,
          y:Number(event.koOrigin.y)||0
        }
        :null,
      koTarget:event.koTarget
        ?{
          x:Number(event.koTarget.x)||0,
          y:Number(event.koTarget.y)||0
        }
        :{
          x:Number(event.entity?.x)||0,
          y:Number(event.entity?.y)||0
        },
      direction:
        Number.isFinite(Number(event.direction))
          ?Number(event.direction)
          :null
    };
    return true;
  },
  deathInfoPayload(){
    return this.localDefeatPresentation
      ?{...this.localDefeatPresentation}
      :{
        sourcePid:
          Training.player?.lastDamageSourcePid||
          OnlineKillAttributionService.sourceFor(
            this.localPid,
            this.roundToken
          )||
          null,
        deathX:Number(Training.player?.x)||0,
        deathY:Number(Training.player?.y)||0,
        koOrigin:null,
        koTarget:{
          x:Number(Training.player?.x)||0,
          y:Number(Training.player?.y)||0
        },
        direction:null
      };
  },
  confirmHostDeaths(roundToken){
    if(
      !RoomService.isHost||
      roundToken!==this.roundToken
    )return 0;

    let count=0;

    for(const pid of this._deadPids){
      if(this._confirmedDeathPids.has(pid)){
        continue;
      }

      this._confirmedDeathPids.add(pid);
      const info=
        this._deathPresentations.get(pid)||
        {};

      const victimEntity=
        OnlineParticipantEntityService.entity(
          pid
        );
      const resolvedSourcePid=
        info.sourcePid||
        OnlineKillAttributionService.sourceFor(
          pid,
          roundToken
        )||
        victimEntity?.lastDamageSourcePid||
        null;

      const packet={
        type:'duel-death-confirmed',
        roundToken,
        deadPid:pid,
        sourcePid:resolvedSourcePid,
        killerPid:resolvedSourcePid,
        deathX:Number(info.deathX),
        deathY:Number(info.deathY),
        koOrigin:info.koOrigin||null,
        koTarget:info.koTarget||null,
        direction:
          Number.isFinite(Number(info.direction))
            ?Number(info.direction)
            :null,
        silent:info.silent===true
      };

      RoomService.sendToPeers(packet);
      this.receiveConfirmedDeath(packet);
      count++;
    }

    return count;
  },
  receiveConfirmedDeath(payload){
    if(
      !payload||
      Number(payload.roundToken)!==
        Number(this.roundToken)
    )return false;

    const deadPid=String(
      payload.deadPid||''
    );
    if(!deadPid)return false;

    const killerPid=
      String(
        payload.killerPid||
        payload.sourcePid||
        ''
      )||null;

    if(killerPid){
      payload={
        ...payload,
        sourcePid:killerPid,
        killerPid
      };
    }

    const entity=
      OnlineParticipantEntityService.entity(deadPid);
    const source=
      killerPid
        ?OnlineParticipantEntityService.entity(
          killerPid
        )
        :null;

    const deathX=
      Number.isFinite(Number(payload.deathX))
        ?Number(payload.deathX)
        :Number(entity?.x)||0;
    const deathY=
      Number.isFinite(Number(payload.deathY))
        ?Number(payload.deathY)
        :Number(entity?.y)||0;

    this.lastConfirmedDeath={
      deadPid,
      sourcePid:payload.sourcePid||null,
      deathX,
      deathY
    };

    if(deadPid===this.localPid){
      Training.lastDeathSourcePid=
        payload.sourcePid||null;
    }

    if(payload.silent===true){
      return true;
    }

    const effectKey=
      KillRewardService.key(
        payload.roundToken,
        deadPid
      );

    if(
      this._processedConfirmedDeathEffects.has(
        effectKey
      )
    ){
      return true;
    }
    this._processedConfirmedDeathEffects.add(
      effectKey
    );

    if(deadPid===this.localPid){
      Training.spectating=true;
      Training.spectatorFollowPlayer(killerPid);
    }

    KillRewardService.rewardLocalKiller(
      payload
    );
    CombatEventToastService.kill(
      payload
    );

    if(source?.kind==='player'){
      MasterRecordMilestonePresentationService.elimination(
        source,
        deathX,
        deathY,
        'kill'
      );
    }

    Presentation.deathLaunch(
      entity,
      source,
      payload.koOrigin||null,
      payload.koTarget||{
        x:deathX,
        y:deathY
      },
      payload.direction,
      {
        targetPoint:{
          x:deathX,
          y:deathY
        },
        confirmed:true,
        forceDirectionalBeam:
          !!killerPid&&killerPid===this.localPid
      }
    );

    return true;
  },
  reportLocalDeath(){
    if(!this.active||this.roundResolving)return false;
    if(this._reportedLocalDeathToken===this.roundToken)return false;

    this._reportedLocalDeathToken=this.roundToken;
    const deathInfo=this.deathInfoPayload();
    const killerPid=
      deathInfo.sourcePid||
      deathInfo.killerPid||
      null;

    if(RoomService.isHost){
      RoomService.receiveRoundDeath(
        this.localPid,
        this.roundToken,
        {
          ...deathInfo,
          killerPid
        }
      );
    }else{
      RoomService.sendGameplay({
        type:'duel-round-death',
        roundToken:this.roundToken,
        ...deathInfo,
        killerPid
      });
    }
    return true;
  },
  eliminateDepartedPlayer(pid){
    const entity=
      OnlineParticipantEntityService.entity(pid);

    if(entity){
      entity.health=0;
      entity.alive=false;
      entity.hidden=true;
    }

    this._deadPids.add(pid);
    this._confirmedDeathPids.add(pid);
    this._deathPresentations.delete(pid);
    this.removePeer(pid);

    // 탈주는 즉시 탈락 처리하지만 남은 생존자까지 라운드 종료시키지 않는다.
    // 실제 참가자가 한 명만 남은 경우에만 방 수명주기에서 매치를 종료한다.
    this.pendingDeathAt=0;
    clearTimeout(this._deathResolveTimer);
    this._deathResolveTimer=0;

    if(
      RoomService.isHost&&
      this.active&&
      RoomService.duelPhase==='playing'
    ){
      // 탈주 자체는 activeMatchPids에서 빠졌더라도 기존 사망자와
      // 남은 생존자를 즉시 재평가해야 마지막 생존자 승리가 막히지 않는다.
      this.evaluateRoundSurvivors(
        this.roundToken
      );
    }

    return true;
  },
  hostReportDeath(
    pid,
    roundToken=this.roundToken,
    deathInfo=null
  ){
    if(!RoomService.isHost||!this.active||this.roundResolving)return false;

    const token=Math.max(1,Number(roundToken)||this.roundToken||1);
    if(token!==this.roundToken||RoomService.resolvedRoundTokens.has(token))return false;

    if(this._deathRoundToken!==token){
      this._deathRoundToken=token;
      this._deadPids=new Set();
      this._deathOrder.length=0;
    }

    if(!this._deadPids.has(pid)){
      this._deathOrder.push(pid);
    }
    this._deadPids.add(pid);

    if(deathInfo&&typeof deathInfo==='object'){
      this._deathPresentations.set(
        pid,
        {
          sourcePid:
            deathInfo.killerPid||
            deathInfo.sourcePid||
            OnlineKillAttributionService.sourceFor(
              pid,
              token
            )||
            OnlineParticipantEntityService.entity(
              pid
            )?.lastDamageSourcePid||
            null,
          deathX:Number(deathInfo.deathX),
          deathY:Number(deathInfo.deathY),
          koOrigin:deathInfo.koOrigin||null,
          koTarget:deathInfo.koTarget||null,
          direction:
            Number.isFinite(Number(deathInfo.direction))
              ?Number(deathInfo.direction)
              :null,
          silent:deathInfo.silent===true
        }
      );
    }

    if(!this.pendingDeathAt){
      this.pendingDeathAt=performance.now()+80;
      clearTimeout(this._deathResolveTimer);
      this._deathResolveTimer=setTimeout(()=>{
        this.resolveHostDeaths(token);
      },82);
    }
    return true;
  },
  isRoundParticipantAlive(pid){
    if(!pid)return false;
    if(this._deadPids.has(pid))return false;

    const entity=
      OnlineParticipantEntityService.entity(
        pid
      );

    if(entity){
      return (
        entity.alive!==false&&
        Number(entity.health)>0
      );
    }

    // Entity가 없는 경우에도 connected active participant만 생존 후보.
    const member=
      RoomService.members.get(pid);
    return !!(
      member&&
      member.connected!==false&&
      member.departed!==true
    );
  },
  evaluateRoundSurvivors(
    roundToken=this.roundToken
  ){
    if(
      !RoomService.isHost||
      !this.active||
      RoomService.duelPhase!=='playing'
    )return false;

    return this.resolveHostDeaths(
      roundToken
    );
  },
  teamGroups(
    pids=RoomService.matchPids()
  ){
    const groups=new Map();

    for(const pid of pids||[]){
      const team=
        RoomService.members.get(pid)?.team||
        pid;

      if(!groups.has(team)){
        groups.set(team,[]);
      }
      groups.get(team).push(pid);
    }

    return groups;
  },
  aliveTeamIds(pids,alivePids){
    const groups=this.teamGroups(pids);
    const aliveSet=new Set(alivePids);
    const teams=[];

    for(const [team,members] of groups){
      if(
        members.some(pid=>
          aliveSet.has(pid)
        )
      ){
        teams.push(team);
      }
    }

    return teams;
  },
  ffaPlacements(pids,winnerTeamId){
    const participants=[
      ...new Set(
        (pids||[]).filter(Boolean)
      )
    ];
    const placements={};
    const groups=this.teamGroups(participants);
    const teamCount=groups.size;

    if(!participants.length||!teamCount){
      return {placements,teamCount:0};
    }

    const remaining=new Map();
    const eliminated=[];
    const eliminatedSet=new Set();
    for(const [team,members] of groups){
      remaining.set(team,members.length);
    }

    for(const pid of this._deathOrder){
      if(!participants.includes(pid))continue;
      const team=RoomService.members.get(pid)?.team||pid;
      if(!remaining.has(team)||eliminatedSet.has(team))continue;

      const left=Math.max(0,(remaining.get(team)||0)-1);
      remaining.set(team,left);
      if(left===0&&team!==winnerTeamId){
        eliminated.push(team);
        eliminatedSet.add(team);
      }
    }

    for(const [team] of groups){
      if(
        team===winnerTeamId||
        eliminatedSet.has(team)
      )continue;
      eliminated.push(team);
      eliminatedSet.add(team);
    }

    let placement=teamCount;
    for(const team of eliminated){
      for(const pid of groups.get(team)||[]){
        placements[pid]=placement;
      }
      placement=Math.max(2,placement-1);
    }

    for(const pid of groups.get(winnerTeamId)||[]){
      placements[pid]=1;
    }

    return {placements,teamCount};
  },

  winningGroup(pids,alivePids){
    const groups=this.teamGroups(pids);
    const aliveTeams=
      this.aliveTeamIds(
        pids,
        alivePids
      );

    if(aliveTeams.length!==1){
      return null;
    }

    const teamId=aliveTeams[0];
    const members=[
      ...(groups.get(teamId)||[])
    ].filter(pid=>
      RoomService.activeMatchPids.has(pid)&&
      RoomService.members.get(pid)?.departed!==true
    );
    const winnerPid=
      members.find(pid=>
        alivePids.includes(pid)
      )||
      members[0]||
      null;

    if(!winnerPid)return null;

    return {
      teamId,
      members,
      winnerPid,
      teamVictory:members.length>=2
    };
  },
  orderedDuelDeathResult(pids){
    const participants=[
      ...new Set(
        (pids||[]).filter(Boolean)
      )
    ];
    if(participants.length!==2)return null;

    const firstDeadPid=
      this._deathOrder.find(pid=>
        participants.includes(pid)
      )||null;

    if(firstDeadPid){
      const info=
        this._deathPresentations.get(
          firstDeadPid
        )||{};
      const confirmedKillerPid=
        String(info.sourcePid||'');
      const otherPid=
        participants.find(pid=>
          pid!==firstDeadPid
        )||null;
      const winnerPid=
        confirmedKillerPid&&
        confirmedKillerPid!==firstDeadPid&&
        participants.includes(confirmedKillerPid)
          ?confirmedKillerPid
          :otherPid;

      if(!winnerPid)return null;
      return {
        winnerPid,
        loserPid:firstDeadPid,
        simultaneousDeath:false,
        ordered:true
      };
    }

    const hostPid=
      participants.includes(RoomService.localPid)
        ?RoomService.localPid
        :participants[0];
    const loserPid=
      participants.find(pid=>
        pid!==hostPid
      )||null;

    if(!hostPid||!loserPid)return null;
    return {
      winnerPid:hostPid,
      loserPid,
      simultaneousDeath:true,
      ordered:false
    };
  },
  resolveHostDeaths(roundToken){
    if(
      !RoomService.isHost||
      !this.active||
      this.roundResolving||
      roundToken!==this.roundToken||
      RoomService.resolvedRoundTokens.has(
        roundToken
      )
    )return false;

    const pids=
      RoomService.matchPids();

    if(!pids.length)return false;

    this.confirmHostDeaths(roundToken);

    const alivePids=pids.filter(
      pid=>this.isRoundParticipantAlive(pid)
    );

    if(
      this.mode===MatchModeService.TEAM||
      this.mode===MatchModeService.FFA
    ){
      const descriptor=
        this.winningGroup(
          pids,
          alivePids
        );

      if(!descriptor){
        this.pendingDeathAt=0;
        return true;
      }

      const loserPids=pids.filter(
        pid=>!descriptor.members.includes(pid)
      );

      this.roundResolving=true;
      this.pendingDeathAt=0;

      const ffaPlacementData=
        this.mode===MatchModeService.FFA
          ?this.ffaPlacements(
            pids,
            descriptor.teamId
          )
          :null;

      return RoomService.finalizeRound(
        descriptor.winnerPid,
        loserPids,
        roundToken,
        {
          winnerTeamId:descriptor.teamId,
          teamVictory:
            this.mode===MatchModeService.TEAM||
            descriptor.teamVictory,
          placements:ffaPlacementData?.placements||null,
          ffaTeamCount:ffaPlacementData?.teamCount||0
        }
      );
    }

    if(pids.length!==2)return false;

    const firstPid=pids[0]||null;
    const secondPid=pids[1]||null;
    const firstDead=
      firstPid
        ?!this.isRoundParticipantAlive(firstPid)
        :false;
    const secondDead=
      secondPid
        ?!this.isRoundParticipantAlive(secondPid)
        :false;

    let winnerPid=null;
    let loserPid=null;
    let simultaneousDeath=false;

    if(firstDead&&secondDead){
      const orderedResult=
        this.orderedDuelDeathResult(
          pids
        );
      winnerPid=
        orderedResult?.winnerPid||null;
      loserPid=
        orderedResult?.loserPid||null;
      simultaneousDeath=
        orderedResult?.simultaneousDeath===true;
    }else if(firstDead){
      winnerPid=secondPid;
      loserPid=firstPid;
    }else if(secondDead){
      winnerPid=firstPid;
      loserPid=secondPid;
    }

    if(!winnerPid||!loserPid){
      this.pendingDeathAt=0;
      return false;
    }

    this.roundResolving=true;
    this.pendingDeathAt=0;

    return RoomService.finalizeRound(
      winnerPid,
      [loserPid],
      roundToken,
      {
        simultaneousDeath
      }
    );
  },

  tickRound(){
    if(!this.active)return;

    this.interpolateRemote(
      (Training.lastFrameDt||GAME_DATA.frameMs)/GAME_DATA.frameMs
    );

    if(!Training.player?.alive)this.reportLocalDeath();
  },
  handleRoundResult(payload){
    const token=
      Math.max(
        1,
        Number(payload?.roundToken)||1
      );
    if(token<this.roundToken)return false;

    if(this.handledRoundResults.has(token)){
      if(payload?.scores){
        this.scores={
          ...payload.scores
        };
        this.updateRoundScore();
      }
      return true;
    }

    this.handledRoundResults.add(token);
    this.roundToken=token;

    // 라운드 결과 표시 중에도 기존 게임 세션과 조작 권한을 유지한다.
    this.roundResolving=false;
    this.active=true;
    this.scores={
      ...(payload.scores||this.scores)
    };

    if(
      payload.teamVictory&&
      payload.winnerTeamId
    ){
      const teamWinnerPids=
        RoomService.matchPids().filter(
          pid=>
            RoomService.members.get(pid)?.team===
              payload.winnerTeamId
        );

      RoundResolutionProtectionService
        .protectMany(teamWinnerPids);
    }else{
      RoundResolutionProtectionService.protectWinner(
        payload.winnerPid
      );
    }
    this.updateRoundScore();

    const won=
      payload.teamVictory&&
      payload.winnerTeamId
        ?RoomService.localMember()?.team===
          payload.winnerTeamId
        :payload.winnerPid===
          RoomService.localPid;
    const spectator=
      this.spectatorOnly===true||
      RoomService.localMember()?.spectator===true;

    const recordResult=
      spectator
        ?null
        :CharacterRecordProgressionService
          .applyRoundResult(payload);

    if(payload.simultaneousDeath!==true){
      const victoryPids=
        payload.teamVictory&&
        payload.winnerTeamId
          ?RoomService.matchPids().filter(
            pid=>
              RoomService.members.get(pid)?.team===
              payload.winnerTeamId
          )
          :[
            payload.winnerPid
          ];

      for(const victoryPid of victoryPids){
        const victoryEntity=
          OnlineParticipantEntityService.entity(
            victoryPid
          );

        if(victoryEntity?.alive){
          MasterRecordMilestonePresentationService
            .victory(victoryEntity);
        }
      }
    }

    const overlay=
      document.getElementById(
        'round-result-overlay'
      );
    const text=
      document.getElementById(
        'round-result-text'
      );
    const sub=
      document.getElementById(
        'round-result-sub'
      );

    if(text){
      const winnerName=
        PlayerDisplayNameService.resolve(
          payload.winnerPid
        );
      const team=
        payload.teamVictory&&
        payload.winnerTeamId
          ?RoomTeams[
            payload.winnerTeamId
          ]
          :null;

      text.textContent=
        team
          ?`${team.label} 승리!`
          :`${winnerName} 승리!`;

      text.style.color=
        team
          ?team.color
          :won?'#4f8':'#f66';

      text.style.textShadow=
        team
          ?`0 0 24px ${team.color}99`
          :won
            ?'0 0 24px rgba(68,255,136,.65)'
            :'0 0 24px rgba(255,80,80,.65)';
    }

    if(sub){
      sub.textContent='';
      sub.style.display='none';
    }

    if(overlay){
      overlay.style.display='flex';
    }

    if(
      payload.matchOver&&
      RoomService.isHost
    ){
      clearTimeout(
        RoomService._roundResolveTimer
      );

      RoomService._roundResolveTimer=
        setTimeout(()=>{
          if(
            !RoomService.isHost||
            RoomService.duelPhase!==
              'match-result'
          )return;

          const endingPacket={
            type:'duel-match-ending'
          };

          RoomService.sendToPeers(
            endingPacket
          );
          this.showMatchEnding();

          clearTimeout(
            RoomService._roundResolveTimer
          );
          RoomService._roundResolveTimer=
            setTimeout(()=>{
              if(
                RoomService.isHost&&
                RoomService.duelPhase===
                  'match-result'
              ){
                RoomService
                  .finishMatchToRoom();
              }
            },2000);
        },3000);
    }

    return true;
  },
  showMatchEnding(){
    const overlay=
      document.getElementById(
        'round-result-overlay'
      );
    const text=
      document.getElementById(
        'round-result-text'
      );
    const sub=
      document.getElementById(
        'round-result-sub'
      );

    if(text){
      text.textContent='매치 종료';
      text.style.color='#d8dde5';
      text.style.textShadow=
        '0 0 18px rgba(216,221,229,.34)';
    }

    if(sub){
      sub.textContent='';
      sub.style.display='none';
    }

    if(overlay){
      overlay.style.display='flex';
    }

    return true;
  },
  renderBetweenScore(scores=this.scores){
    const scoreElement=
      document.getElementById(
        'between-score'
      );
    if(!scoreElement)return;

    RoundScorePresentationService.render(
      scoreElement,
      scores,
      this.winsRequired,
      this.mode
    );
  },
  showBetween(payload){
    OnlineChatService.syncDraftFromInput();
    OnlineChatService.preserveAcrossMatchTransition();

    const overlay=document.getElementById('round-result-overlay');
    if(overlay)overlay.style.display='none';

    Training.stopSessionOnly();

    this.active=false;
    this.roundResolving=false;
    this.betweenCharacterId=null;
    this.betweenAugmentId=null;
    this.betweenReady=false;
    this.betweenNoAugWarned=false;
    this._betweenPacket=payload;
    RoomService.characterPreviewSelections.clear();
    RoomService.augmentPreviewSelections.clear();

    if(payload?.scores)this.scores={...payload.scores};

    document.querySelectorAll('.screen').forEach(
      screen=>screen.classList.add('hidden')
    );
    document.getElementById('scr-between')?.classList.remove('hidden');
    OnlineChatService.syncVisibility();

    if(OnlineChatService.openState){
      OnlineChatService.preserveAcrossScreenChange();
    }

    const title=document.getElementById('between-title');
    if(title){
      title.textContent=
        `라운드 ${Math.max(1,Number(payload.nextRound)||2)-1} 종료 — ${Math.max(2,Number(payload.nextRound)||2)}라운드 준비`;
    }

    this.renderBetweenScore(payload.scores||this.scores);
    BetweenMapPreviewService.render(
      payload?.mapId||RoomService.currentMapId
    );

    const status=document.getElementById('between-status');
    const charStatus=document.getElementById('between-char-status');
    const readyButton=document.getElementById('between-ready-btn');
    const charGrid=document.getElementById('between-char-grid');
    const augmentGrid=document.getElementById('between-aug-grid');
    const augmentTitle=document.getElementById('between-aug-title');
    const peerAugmentResult=document.getElementById(
      'between-peer-augment-result'
    );
    const readyCharacterRow=document.getElementById(
      'between-ready-character-row'
    );

    if(peerAugmentResult){
      peerAugmentResult.replaceChildren();
      peerAugmentResult.classList.remove('show');
    }
    if(readyCharacterRow){
      readyCharacterRow.replaceChildren();
      delete readyCharacterRow.dataset.renderSignature;
    }
    this.setBetweenReadyResultVisible(false);

    if(status){
      status.textContent='';
      status.className='status';
    }
    if(charStatus){
      charStatus.textContent='미선택 시 현재 캐릭터 유지';
      charStatus.className='status';
    }
this.betweenReadyPids=new Set();
    this.betweenStateSelections={};
    BetweenAugmentHudService.render(this.betweenStateSelections);
    const spectatorOnly=
      this.spectatorOnly===true||
      RoomService.localMember()?.spectator===true;

    if(readyButton){
      readyButton.disabled=spectatorOnly;
      readyButton.textContent=
        spectatorOnly
          ?'대기 중'
          :'준비 완료';
    }

    if(spectatorOnly&&status){
      status.textContent='대기 중';
      status.className='status';
    }

    if(charGrid){
      CharacterRecordService.resetGridViews(
        charGrid
      );
      charGrid.style.display='';
      charGrid.replaceChildren();

      for(const characterId of payload.charChoices||[]){
        const character=GAME_DATA.characters[characterId];
        if(
          !character||
          RoomService.isCharacterBanned(characterId)
        )continue;

        const card=CharacterCardViewService.create(
          character,
          {account:AccountState.current}
        );
        if(!card)continue;

        card.addEventListener('click',event=>{
          event.preventDefault();
          if(
            spectatorOnly||
            this.betweenReady
          )return;

          if(this.betweenCharacterId===characterId){
            card.classList.remove('sel');
            this.betweenCharacterId=null;
            RoomService.submitCharacterPreview(
              null
            );
          }else{
            charGrid.querySelectorAll('.char-card').forEach(
              node=>node.classList.remove('sel')
            );
            card.classList.add('sel');
            this.betweenCharacterId=characterId;
            RoomService.submitCharacterPreview(
              characterId
            );
          }
        });

        charGrid.appendChild(card);
      }

      this.renderCharacterPreviews();
    }
    const localPid=RoomService.localPid;
    const loserPids=(
      Array.isArray(payload.loserPids)
        ?payload.loserPids
        :payload.loserPid
          ?[payload.loserPid]
          :[]
    )
      .filter(pid=>RoomService.matchPids().includes(pid))
      .sort((a,b)=>a.localeCompare(b));

    const isLoser=
      loserPids.includes(localPid);
    const localAugChoices=
      payload.augChoicesByPid?.[localPid]||
      (
        localPid===payload.loserPid
          ?payload.augChoices
          :[]
      )||
      [];

    const normalBetween=(payload.gameMode||RoomService.settings.gameMode)!=='augment';
    const choiceOrder=normalBetween?[]:[
      ...loserPids
    ];

    if(isLoser){
      const index=choiceOrder.indexOf(localPid);
      if(index>0){
        choiceOrder.splice(index,1);
        choiceOrder.unshift(localPid);
      }
    }

    if(augmentTitle){
      augmentTitle.style.display=normalBetween?'none':'';
      augmentTitle.textContent=
        loserPids.length
          ?'선택지'
          :'증강 선택 없음';
    }

    if(augmentGrid){
      augmentGrid.classList.toggle('normal-match',normalBetween);
      augmentGrid.style.display=normalBetween?'none':'';
      augmentGrid.replaceChildren();

      const createAugmentCard=(
        augmentId,
        {
          interactive=false,
          ownerPid=null
        }={}
      )=>{
        const card=AugmentSelectionCardViewService.create(
          augmentId,
          {interactive,ownerPid}
        );
        if(!card)return null;
        if(!interactive)card.classList.add('locked');

        if(interactive){
          card.addEventListener(
            'click',
            event=>{
              event.preventDefault();
              if(this.betweenReady)return;

              augmentGrid
                .querySelectorAll(
                  `.aug-pick-card[data-owner-pid="${localPid}"]`
                )
                .forEach(
                  node=>node.classList.remove('sel')
                );

              card.classList.add('sel');
              this.betweenAugmentId=
                augmentId;
              this.betweenNoAugWarned=false;

              RoomService.submitAugmentPreview(
                augmentId
              );
            }
          );
        }

        return card;
      };

      for(const pid of choiceOrder){
        const choices=
          payload.augChoicesByPid?.[pid]||
          (
            pid===payload.loserPid
              ?payload.augChoices
              :[]
          )||
          [];

        const section=
          document.createElement('section');
        section.className=
          `between-aug-choice-section${pid===localPid?' local':''}`;
        section.dataset.pid=pid;

        const heading=
          document.createElement('div');
        heading.className=
          'between-aug-choice-title';

        const playerName=
          PlayerDisplayNameService.resolve(
            pid,
            RoomService.members.get(pid)?.profile
          );

        heading.textContent=
          pid===localPid
            ?`${playerName} · 내 선택지`
            :`${playerName} · 선택지`;

        const row=
          document.createElement('div');
        row.className=
          'between-aug-option-row';

        for(const augmentId of choices){
          const card=createAugmentCard(
            augmentId,
            {
              interactive:
                !spectatorOnly&&
                pid===localPid&&
                isLoser,
              ownerPid:pid
            }
          );
          if(card)row.appendChild(card);
        }

        if(!row.children.length){
          const empty=
            document.createElement('div');
          empty.className='status';
          empty.textContent='선택지 없음';
          row.appendChild(empty);
        }

        section.append(
          heading,
          row
        );
        augmentGrid.appendChild(section);
      }

      if(!choiceOrder.length){
        const empty=
          document.createElement('div');
        empty.className='status';
        empty.textContent=
          '이번 라운드에서 증강 선택지가 있는 플레이어가 없습니다.';
        augmentGrid.appendChild(empty);
      }
    }
    requestAnimationFrame(()=>{
      MatchSelectionLayoutService.apply(
        charGrid,
        charGrid?.children.length||0,
        160
      );
      SelectionEntranceAnimationService.animate(
        charGrid,
        ':scope > .char-card'
      );
      for(
        const row of
        augmentGrid?.querySelectorAll(
          '.between-aug-option-row'
        )||[]
      ){
        MatchSelectionLayoutService
          .applyHorizontalRow(
            row,
            180,
            5
          );
      }

      SelectionEntranceAnimationService.animate(
        augmentGrid,
        '.aug-pick-card'
      );
      this.renderAugmentPreviews();
    });

    if(readyButton){
      readyButton.onclick=()=>{
        if(
          spectatorOnly||
          this.betweenReady
        )return;

        const choices=localAugChoices;
        if(
          isLoser&&
          choices.length>0&&
          !this.betweenAugmentId&&
          !this.betweenNoAugWarned
        ){
          this.betweenNoAugWarned=true;
          if(status){
            status.textContent='⚠ 증강을 선택하지 않았습니다. 계속하려면 다시 누르세요.';
            status.className='status err';
          }
          return;
        }

        this.betweenReady=true;
        readyButton.disabled=true;

        document.querySelectorAll('#between-char-grid .char-card').forEach(
          card=>card.classList.add('selection-locked')
        );
        document.querySelectorAll('.aug-pick-card').forEach(
          card=>card.style.pointerEvents='none'
        );

        if(status){
          status.textContent=
            this.mode===MatchModeService.DUEL
              ?'상대방 대기 중...'
              :'다른 플레이어 대기 중...';
          status.className='status';
        }

        if(
          !isLoser||
          !this.betweenAugmentId
        ){
          RoomService.submitAugmentPreview(
            null
          );
        }

        RoomService.submitBetween({
          characterId:this.betweenCharacterId,
          augmentId:isLoser?this.betweenAugmentId:null
        });
      };
    }
  },
  createBetweenResultCharacterCard(
    characterId,
    label,
    className='',
    ownerPid=null
  ){
    const character=GAME_DATA.characters[characterId];
    if(!character)return null;

    const stats=
      CharacterCardStatsService.rows(character)
        .filter(([key])=>key!=='난이도');

    const card=document.createElement('div');
    card.className=`char-card ${className}`.trim();
    card.dataset.id=character.id;
    card.dataset.charTooltip='true';

    const tooltip=document.createElement('div');
    tooltip.className='char-tooltip';
    tooltip.innerHTML=
      CharacterDescriptionService.html(character);

    const icon=document.createElement('div');
    icon.className='char-icon';
    CharacterCardColorService.applyIcon(
      icon,
      character
    );

    const name=document.createElement('div');
    name.className='char-name';
    CharacterCardColorService.applyName(
      name,
      character
    );
    name.textContent=character.name;

    const role=document.createElement('div');
    role.className='between-ready-char-label';
    role.style.color=
      ownerPid
        ?TeamColorPresentationService.colorForPid(
          ownerPid,
          className.includes('peer')
            ?'#67a'
            :'#fa0'
        )
        :(
          className.includes('peer')
            ?'#67a'
            :'#fa0'
        );
    role.textContent=label;

    const statsNode=document.createElement('div');
    statsNode.className='char-stats';
    statsNode.innerHTML=CharacterCardStatsService.html(stats);

    card.append(
      tooltip,
      icon,
      name,
      role,
      statsNode
    );

    const ownerProfile=
      ownerPid===RoomService.localPid
        ?PlayerProfileService.snapshot(
          AccountState.current
        )
        :(
          RoomService.members.get(ownerPid)?.profile||
          AccountState.current
        );

    card.dataset.masteryPid=ownerPid||'';
    card._recordAccountData=ownerProfile;

    CharacterRecordService.applyCardStyle(
      card,
      character.id,
      ownerProfile
    );
    CharacterCardInteractionService.bind(
      card,
      {
        account:ownerProfile
      }
    );
    CharacterRecordService.resetCardView(
      card
    );
    CharacterCardPortraitService.attach(
      card,
      character
    );

    return card;
  },
  renderBetweenReadyCharacters(selections={}){
    const row=
      document.getElementById(
        'between-ready-character-row'
      );
    if(!row)return false;

    const pids=
      RoomService.matchPids();

    const resolvedId=pid=>
      selections?.[pid]
        ?.resolvedCharacterId||
      RoomService.duelSelections.get(pid)||
      null;

    const signature=
      pids
        .map(
          pid=>`${pid}:${resolvedId(pid)||''}`
        )
        .join('|');

    if(
      row.dataset.renderSignature===
        signature&&
      row.children.length===pids.length
    ){
      return true;
    }

    row.replaceChildren();
    row.dataset.renderSignature=signature;

    for(const pid of pids){
      const characterId=
        resolvedId(pid);
      const card=
        this.createBetweenResultCharacterCard(
          characterId,
          pid===RoomService.localPid
            ?`${PlayerDisplayNameService.resolve(pid)} · 나`
            :PlayerDisplayNameService.resolve(pid),
          pid===RoomService.localPid
            ?'me'
            :'peer',
          pid
        );
      if(card){
        card.dataset.pid=pid;
        row.appendChild(card);
      }
    }

    return row.children.length>0;
  },

  setBetweenReadyResultVisible(visible){
    const result=document.getElementById(
      'between-ready-result'
    );
    const charPanel=document.getElementById(
      'between-char-panel'
    );
    const augPanel=document.getElementById(
      'between-aug-panel'
    );

    result?.classList.toggle('show',!!visible);

    if(charPanel){
      if(visible){
        charPanel.style.setProperty(
          'display',
          'none',
          'important'
        );
      }else{
        charPanel.style.removeProperty('display');
      }
    }

    if(augPanel){
      if(visible){
        augPanel.style.setProperty(
          'display',
          'none',
          'important'
        );
      }else{
        augPanel.style.removeProperty('display');
      }
    }

    return true;
  },
  renderPeerBetweenAugments(
    selections={}
  ){
    const slot=
      document.getElementById(
        'between-peer-augment-result'
      );
    if(!slot)return false;

    slot.replaceChildren();

    const remotePids=
      RoomService.matchPids().filter(
      pid=>pid!==RoomService.localPid
    ).sort(
      (a,b)=>a.localeCompare(b)
    );

    let count=0;

    for(const pid of remotePids){
      const augmentId=
        selections?.[pid]?.augmentId||
        null;
      if(!augmentId)continue;

      const result=
        document.createElement('div');
      result.className=
        'between-peer-augment-entry';
      result.dataset.pid=pid;

      AugmentAcquisitionResultRenderer.render(
        result,
        augmentId,
        {
          title:
            remotePids.length===1
              ?'상대방이 획득한 증강'
              :`${KoreanParticleService.subject(PlayerDisplayNameService.resolve(pid))} 획득한 증강`
        }
      );

      slot.appendChild(result);
      count++;
    }

    slot.classList.toggle(
      'show',
      count>0
    );
    return count>0;
  },

  updateBetweenState(payload){
    const ready=
      new Set(payload?.ready||[]);
    const selections=
      payload?.selections||{};

    this.betweenReadyPids=ready;
    this.betweenStateSelections={
      ...selections
    };

    const localPid=
      RoomService.localPid;
    const otherPids=
      RoomService.matchPids().filter(
        pid=>pid!==localPid
      );
    const readyOthers=
      otherPids.filter(
        pid=>ready.has(pid)
      ).length;
    const allReady=
      RoomService.matchPids()
        .every(pid=>ready.has(pid));

    const spectatorOnly=
      this.spectatorOnly===true||
      RoomService.localMember()?.spectator===true;

    const charStatus=
      document.getElementById(
        'between-char-status'
      );
    const augTitle=
      document.getElementById(
        'between-aug-title'
      );

    if(spectatorOnly){
      if(charStatus){
        charStatus.textContent='대기 중';
        charStatus.className='status';
      }
      const readyButton=
        document.getElementById(
          'between-ready-btn'
        );
      if(readyButton){
        readyButton.disabled=true;
        readyButton.textContent='대기 중';
      }
    }else if(charStatus){
      if(
        readyOthers===otherPids.length&&
        otherPids.length
      ){
        charStatus.textContent=
          otherPids.length===1
            ?'상대 준비 완료'
            :'다른 플레이어 준비 완료';
        charStatus.className='status ok';
      }else{
        charStatus.textContent=
          otherPids.length===1
            ?'상대 준비 중'
            :`다른 플레이어 준비 중 ${readyOthers} / ${otherPids.length}`;
        charStatus.className='status';
      }
    }

    if(augTitle){
      augTitle.textContent=
        readyOthers===otherPids.length&&
        otherPids.length
          ?(
            otherPids.length===1
              ?'상대방 준비 완료 ✓'
              :'다른 플레이어 준비 완료 ✓'
          )
          :'증강 선택';
    }

    if(allReady){
      this.renderBetweenReadyCharacters(
        selections
      );
      this.renderPeerBetweenAugments(
        selections
      );
      this.setBetweenReadyResultVisible(
        true
      );
    }

    return true;
  },

  showBetweenCountdown(payload){
    const seconds=
      Math.max(
        0,
        Number(payload?.seconds)||0
      );

    const selections=
      payload?.selections||{};

    BetweenAugmentHudService.render(
      selections
    );
    this.renderBetweenReadyCharacters(
      selections
    );
    this.renderPeerBetweenAugments(
      selections
    );
    this.setBetweenReadyResultVisible(
      true
    );

    if(payload?.mapId){
      RoomService.currentMapId=
        payload.mapId;
      MatchMapService.apply(
        payload.mapId
      );
    }

    const button=
      document.getElementById(
        'between-ready-btn'
      );
    const status=
      document.getElementById(
        'between-status'
      );

    document
      .querySelectorAll(
        '#between-char-grid .char-card'
      )
      .forEach(
        card=>
          card.classList.add('selection-locked')
      );

    document
      .querySelectorAll(
        '.aug-pick-card'
      )
      .forEach(
        card=>
          card.style.pointerEvents='none'
      );

    const spectatorOnly=
      this.spectatorOnly===true||
      RoomService.localMember()?.spectator===true;

    if(button){
      button.disabled=true;
      button.textContent=
        spectatorOnly
          ?'대기 중'
          :seconds>0
            ?`${seconds}초 후 시작...`
            :'준비 완료';
    }

    if(status){
      const multiplayer=
        this.mode!==MatchModeService.DUEL;
      status.textContent=
        spectatorOnly
          ?'대기 중'
          :seconds>0
            ?(
              multiplayer
                ?'모든 플레이어 준비 완료!'
                :'양쪽 준비 완료!'
            )
            :'';
      status.className=
        spectatorOnly
          ?'status'
          :seconds>0
            ?'status ok'
            :'status';
    }
  },

  returnToRoomAfterMatch(){
    OnlineChatService
      .preserveAcrossMatchTransition();

    this.active=false;
    this.selecting=false;
    this.spectatorOnly=false;
    this.remotePlayer=null;
    this.remotePlayers.clear();
    this.remotePids=[];
    this.roundResolving=false;
    this.pendingDeathAt=0;
    this._deadPids.clear();
    this._deathOrder.length=0;
    this._confirmedProjectileImpacts?.clear?.();
    clearTimeout(this._deathResolveTimer);

    if(Training.active&&Training.sessionMode==='online'){
      Training.stopSessionOnly();
    }
    GameHudVisibilityService.hideAll();

    const roundScore=document.getElementById('round-score');
    if(roundScore)roundScore.style.display='none';

    const roundOverlay=document.getElementById('round-result-overlay');
    if(roundOverlay)roundOverlay.style.display='none';

    document.querySelectorAll('.screen').forEach(screen=>{
      screen.classList.add('hidden');
      screen.style.removeProperty('display');
    });

    RoomUI.setStatus('');
    RoomUI.showRoom();
    return true;
  },
  removePeer(pid){
    const remote=
      this.remotePlayers.get(pid);

    if(remote){
      ProjectileHomingTargetSyncService
        .clearSource(remote);
      EntityService.items.delete(
        remote.id
      );
      this.remotePlayers.delete(pid);
    }

    this.remotePids=
      this.remotePids.filter(
        remotePid=>remotePid!==pid
      );

    this.remotePid=
      this.remotePids[0]||null;
    this.remotePlayer=
      this.remotePid
        ?this.remotePlayers.get(
          this.remotePid
        )||null
        :null;

    this.remoteAugmentsByPid.delete(pid);
    CombatHudRosterService.rows
      .get(pid)?.root?.remove();
    CombatHudRosterService.rows.delete(pid);

    document
      .querySelectorAll(
        `[data-pid="${pid}"]`
      )
      .forEach(node=>{
        if(
          node.closest(
            '#start-aug-char-row,#between-ready-character-row,#between-aug-grid,#between-peer-augment-result,#aug-hud'
          )
        ){
          node.remove();
        }
      });

    this.startAugmentReadyPids?.delete?.(pid);
    this.betweenReadyPids?.delete?.(pid);

    if(Training.active){
      Training.renderAugHud();
      Training.syncHud();
    }

    MatchSelectionLayoutService.refresh();
    this.updateRoundScore();
    return true;
  },
  applyRosterUpdate(payload){
    if(!payload)return false;

    if(payload.mode){
      this.mode=payload.mode;
      RoomService.matchMode=payload.mode;
    }

    const active=
      new Set(
        payload.activeMatchPids||[]
      );
    RoomService.activeMatchPids=active;

    if(Array.isArray(payload.members)){
      for(const data of payload.members){
        if(!data?.pid)continue;

        const previous=
          RoomService.members.get(
            data.pid
          );

        RoomService.members.set(
          data.pid,
          {
            ...(previous||{}),
            ...data,
            profile:{
              ...(previous?.profile||{}),
              ...(data.profile||{})
            }
          }
        );
      }
    }

    if(payload.scores){
      this.scores={...payload.scores};
    }

    if(payload.selections){
      for(
        const [pid,characterId] of
        Object.entries(payload.selections)
      ){
        if(characterId){
          RoomService.duelSelections.set(
            pid,
            characterId
          );
        }
      }
    }

    if(payload.augments){
      for(
        const [pid,ids] of
        Object.entries(payload.augments)
      ){
        RoomService.matchAugments.set(
          pid,
          [...(ids||[])]
        );
      }
    }

    for(const pid of [...this.remotePids]){
      if(!active.has(pid)){
        this.removePeer(pid);
      }
    }

    this.remotePids=
      [...active]
        .filter(pid=>pid!==this.localPid)
        .sort((a,b)=>a.localeCompare(b));

    this.remotePid=this.remotePids[0]||null;
    this.remotePlayer=
      this.remotePid
        ?this.remotePlayers.get(
          this.remotePid
        )||null
        :null;

    document
      .querySelectorAll(
        '#start-aug-char-row [data-pid],#between-ready-character-row [data-pid],#between-aug-grid [data-pid],#between-peer-augment-result [data-pid],#aug-hud [data-pid]'
      )
      .forEach(node=>{
        if(
          node.dataset.pid&&
          !active.has(node.dataset.pid)
        ){
          node.remove();
        }
      });

    this.startAugmentReadyPids=
      new Set(
        [...(this.startAugmentReadyPids||[])]
          .filter(pid=>active.has(pid))
      );
    this.betweenReadyPids=
      new Set(
        [...(this.betweenReadyPids||[])]
          .filter(pid=>active.has(pid))
      );

    if(Training.active){
      Training.renderAugHud();
      Training.syncHud();
    }

    this.updateRoundScore();
    return true;
  },
  stop({returnToRoom=true}={}){
    if(returnToRoom&&RoomService.localPid){
      OnlineChatService
        .preserveAcrossMatchTransition();
    }else{
      OnlineChatService.reset();
    }
    CombatStatusApplicationService.reset();
    OnlinePresentationSyncService.reset();
    OnlineAugmentInventorySyncService.reset();
    OnlineDebugControlSyncService.reset();
    this.active=false;
    this.selecting=false;
    this.spectatorOnly=false;
    this.remotePlayer=null;
    this.remotePlayers.clear();
    this.remotePids=[];
    this.localPid=null;
    this.remotePid=null;
    this.roundResolving=false;
    this.pendingDeathAt=0;
    this._deadPids.clear();
    this._deathOrder.length=0;
    clearTimeout(this._deathResolveTimer);

    const roundScore=document.getElementById('round-score');
    if(roundScore)roundScore.style.display='none';

    const roundOverlay=document.getElementById('round-result-overlay');
    if(roundOverlay)roundOverlay.style.display='none';

    const result=document.getElementById('result-oveleulay');
    if(result)result.style.display='none';

    if(Training.active&&Training.sessionMode==='online'){
      Training.stopSessionOnly();
    }
    GameHudVisibilityService.hideAll();

    if(returnToRoom&&RoomService.localPid){
      RoomService.duelPhase='room';
      RoomUI.showRoom();
    }
  }
};
