

const CharacterBanUI=Object.freeze({
  state:{mode:null,proposalId:0},
  selectedIds:new Set(),
  screen(){return document.getElementById('scr-character-ban')},
  grid(){return document.getElementById('character-ban-screen-grid')},
  status(text='',kind=''){
    const node=document.getElementById('character-ban-screen-status');
    if(!node)return;
    node.textContent=text;
    node.className=`status${kind?` ${kind}`:''}`;
  },
  sortMode(){
    return CharacterSortService.loadMode();
  },
  totalCharacters(){
    return CharacterCardDataService.all().length;
  },
  proposedBannedSet(){
    const proposed=
      new Set(RoomService.bannedCharacters);

    for(const characterId of this.selectedIds){
      if(proposed.has(characterId)){
        proposed.delete(characterId);
      }else{
        proposed.add(characterId);
      }
    }

    return proposed;
  },
  proposalLeavesAllowedCharacter(){
    return (
      this.proposedBannedSet().size<
      this.totalCharacters()
    );
  },
  sortedCharacters(){
    return CharacterSortService.sorted(
      this.sortMode(),
      AccountState.current
    );
  },
  markCard(card,text,kind=''){
    if(!card)return null;
    let mark=card.querySelector(':scope > .character-ban-mark');
    if(!mark){
      mark=document.createElement('div');
      mark.className='character-ban-mark';
      card.appendChild(mark);
    }
    mark.textContent=text;
    mark.classList.toggle('proposal',kind==='proposal');
    return mark;
  },
  clearMark(card){
    card?.querySelector(':scope > .character-ban-mark')?.remove();
  },
  showScreen(){
    RoomUI.showScreen('scr-character-ban');
    const select=document.getElementById('character-ban-sort-select');
    if(select)select.value=this.sortMode();
  },
  returnToRoom(){
    this.state.mode=null;
    this.state.proposalId=0;
    this.selectedIds.clear();
    RoomUI.showRoom();
  },
  openSelection(){
    if(
      !RoomService.isHost||
      RoomService.duelPhase!=='room'||
      RoomService.characterBanProposal
    )return false;
    this.state.mode='select';
    this.state.proposalId=0;
    this.selectedIds.clear();
    this.status('');
    this.renderSelection();
    this.showScreen();
    return true;
  },
  openBannedList(){
    if(RoomService.characterBanProposal){
      return this.renderVote();
    }
    this.state.mode='list';
    this.state.proposalId=0;
    this.status('');
    this.renderBannedList();
    this.showScreen();
    return true;
  },
  setHeader(title,message=''){
    const titleNode=document.getElementById('character-ban-screen-title');
    const messageNode=document.getElementById('character-ban-screen-message');
    if(titleNode)titleNode.textContent=title;
    if(messageNode)messageNode.textContent=message;
  },
  setActions({
    propose=false,
    agree=false,
    reject=false,
    back=true,
    proposeDisabled=true,
    agreeDisabled=false,
    agreeText='동의'
  }={}){
    const proposeNode=document.getElementById('character-ban-screen-propose');
    const agreeNode=document.getElementById('character-ban-screen-agree');
    const rejectNode=document.getElementById('character-ban-screen-reject');
    const backNode=document.getElementById('character-ban-screen-back');
    if(proposeNode){
      proposeNode.hidden=!propose;
      proposeNode.disabled=!!proposeDisabled;
    }
    if(agreeNode){
      agreeNode.hidden=!agree;
      agreeNode.disabled=!!agreeDisabled;
      agreeNode.textContent=agreeText;
    }
    if(rejectNode){
      rejectNode.hidden=!reject;
      rejectNode.disabled=false;
    }
    if(backNode)backNode.hidden=!back;
  },
  renderCards(characters,{
    interactive=false,
    showBanState='auto',
    proposalHighlight=false
  }={}){
    const grid=this.grid();
    if(!grid)return false;
    grid.replaceChildren();

    const fragment=document.createDocumentFragment();

    for(const character of characters||[]){
      const card=CharacterCardViewService.create(
        character,
        {account:AccountState.current}
      );
      if(!card)continue;

      const characterId=character?.id||character?.combat?.id;
      const banned=RoomService.isCharacterBanned(characterId);

      /*
        금지 화면은 일반 캐릭터 선택 카드의 밝기/초상/프레임을 그대로 쓴다.
        실제 금지 여부는 별도 배지로만 표시한다.
      */
      if(
        showBanState===true||
        (showBanState==='auto'&&banned)
      ){
        card.classList.add('character-banned');
        card.setAttribute('aria-disabled','true');
        this.markCard(card,'금지');
      }

      if(proposalHighlight){
        card.classList.add('proposal-selected');
        this.markCard(card,'금지 제안','proposal');
      }

      if(interactive){
        const applySelected=selected=>{
          if(banned&&selected){
            /*
              이미 금지된 캐릭터를 다시 선택하면 해제 예정 상태.
              별도 `금지 해제 선택` 표시는 쓰지 않고 완전히 일반 카드로
              되돌려 현재 제안 결과를 그대로 미리 보여준다.
            */
            card.classList.remove(
              'character-banned',
              'selection-locked',
              'proposal-selected'
            );
            card.removeAttribute('aria-disabled');
            this.clearMark(card);
            return;
          }

          card.classList.toggle(
            'proposal-selected',
            selected
          );

          if(selected){
            this.markCard(
              card,
              '금지 선택',
              'proposal'
            );
          }else if(banned){
            card.classList.add(
              'character-banned'
            );
            card.setAttribute(
              'aria-disabled',
              'true'
            );
            this.markCard(card,'금지');
          }else{
            this.clearMark(card);
          }
        };

        applySelected(
          this.selectedIds.has(characterId)
        );

        card.addEventListener('click',event=>{
          event.preventDefault();

          if(this.selectedIds.has(characterId)){
            this.selectedIds.delete(characterId);
          }else{
            this.selectedIds.add(characterId);

            if(!this.proposalLeavesAllowedCharacter()){
              this.selectedIds.delete(characterId);
              this.status(
                '최소 1개의 캐릭터는 금지하지 않고 남겨야 합니다.',
                'err'
              );
              return;
            }
          }

          applySelected(
            this.selectedIds.has(characterId)
          );
          this.status('');

          const proposeNode=
            document.getElementById(
              'character-ban-screen-propose'
            );

          if(proposeNode){
            proposeNode.disabled=
              this.selectedIds.size===0||
              !this.proposalLeavesAllowedCharacter();
          }
        });
      }

      fragment.appendChild(card);
    }

    grid.appendChild(fragment);
    CharacterRecordService.refreshTopPlayerBadges(grid);
    SelectionEntranceAnimationService.animate(
      grid,
      ':scope > .char-card'
    );
    CharacterSelectionDeferredWorkService.schedulePortraits(grid);
    return true;
  },
  renderSelection(refreshHeader=true){
    this.state.mode='select';

    if(refreshHeader){
      this.setHeader(
        '캐릭터 금지',
        '금지를 제안할 캐릭터를 선택하세요.'
      );
    }

    this.setActions({
      propose:true,
      agree:false,
      reject:false,
      back:true,
      proposeDisabled:
        this.selectedIds.size===0||
        !this.proposalLeavesAllowedCharacter()
    });

    this.renderCards(
      this.sortedCharacters(),
      {interactive:true,showBanState:'auto'}
    );
  },
  renderBannedList(){
    const characters=this.sortedCharacters();
    const bannedCount=
      characters.filter(
        character=>
          RoomService.isCharacterBanned(character.id)
      ).length;

    this.setHeader(
      '금지 캐릭터 목록',
      bannedCount
        ?`현재 금지된 캐릭터 ${bannedCount}명`
        :'현재 금지된 캐릭터가 없습니다.'
    );

    this.status('');

    this.setActions({
      propose:false,
      agree:false,
      reject:false,
      back:true
    });

    this.renderCards(
      characters,
      {interactive:false,showBanState:'auto'}
    );
  },
  renderVote(refreshCards=true){
    const proposal=RoomService.characterBanProposal;
    if(!proposal)return false;

    this.state.mode='vote';
    this.state.proposalId=Number(proposal.id)||0;

    const proposedIds=
      new Set(proposal.characterIds||[]);

    const allCharacters=
      this.sortedCharacters().filter(
        character=>
          proposedIds.has(character.id)
      );

    /*
      제안 시점에는 실제 금지 목록이 아직 바뀌지 않는다.
      따라서 현재 bannedCharacters를 기준으로
      - 현재 허용됨 -> 금지 제안
      - 현재 금지됨 -> 금지 해제 제안
      으로 확실히 구분할 수 있다.
    */
    const banCharacters=
      allCharacters.filter(
        character=>
          !RoomService.isCharacterBanned(character.id)
      );
    const unbanCharacters=
      allCharacters.filter(
        character=>
          RoomService.isCharacterBanned(character.id)
      );

    const approved=
      proposal.approvals instanceof Set
        ?proposal.approvals.has(RoomService.localPid)
        :(proposal.approvals||[]).includes(RoomService.localPid);

    const onlyBan=
      banCharacters.length>0&&
      unbanCharacters.length===0;
    const onlyUnban=
      unbanCharacters.length>0&&
      banCharacters.length===0;

    this.setHeader(
      onlyBan
        ?'캐릭터 금지 제안'
        :onlyUnban
          ?'캐릭터 금지 해제 제안'
          :'캐릭터 금지 설정 요청',
      onlyBan
        ?`${banCharacters.length}명의 캐릭터 금지가 제안되었습니다.`
        :onlyUnban
          ?`${unbanCharacters.length}명의 캐릭터 금지 해제가 제안되었습니다.`
          :`금지 ${banCharacters.length}명 · 금지 해제 ${unbanCharacters.length}명이 제안되었습니다.`
    );

    this.status('');

    this.setActions({
      propose:false,
      agree:true,
      reject:true,
      back:false,
      agreeDisabled:approved,
      agreeText:approved?'동의 완료':'동의'
    });

    const root=this.grid();
    if(root&&refreshCards){
      root.replaceChildren();

      const renderSection=(
        label,
        characters,
        kind
      )=>{
        if(!characters.length)return;

        const section=
          document.createElement('section');
        section.className=
          'character-ban-proposal-section';

        const heading=
          document.createElement('div');
        heading.className=
          `character-ban-proposal-label ${kind}`;
        heading.textContent=
          `${label} · ${characters.length}명`;

        const cardGrid=
          document.createElement('div');
        cardGrid.className=
          'char-grid character-ban-proposal-grid';

        const fragment=
          document.createDocumentFragment();

        for(const character of characters){
          const card=
            CharacterCardViewService.create(
              character,
              {account:AccountState.current}
            );
          if(card)fragment.appendChild(card);
        }

        cardGrid.appendChild(fragment);
        section.append(
          heading,
          cardGrid
        );
        root.appendChild(section);

        CharacterRecordService
          .refreshTopPlayerBadges(cardGrid);
        SelectionEntranceAnimationService.animate(
          cardGrid,
          ':scope > .char-card'
        );
        CharacterSelectionDeferredWorkService
          .schedulePortraits(cardGrid);
      };

      renderSection(
        '금지 제안',
        banCharacters,
        'ban'
      );
      renderSection(
        '금지 해제 제안',
        unbanCharacters,
        'unban'
      );
    }

    this.showScreen();
    return true;
  },
  sync(){
    const proposal=RoomService.characterBanProposal;

    if(proposal){
      const needsCardRender=
        this.state.mode!=='vote'||
        this.state.proposalId!==Number(proposal.id)||
        this.screen()?.classList.contains('hidden');

      /*
        준비/팀/방 상태 패킷도 RoomUI.render()를 통해 여기까지 들어온다.
        같은 금지 제안이라면 카드 목록은 의미상 바뀌지 않으므로
        기존 DOM을 유지해 입장 애니메이션과 초상 로딩을 재시작하지 않는다.
        헤더와 동의 상태 같은 가벼운 UI만 갱신한다.
      */
      this.renderVote(needsCardRender);
      return true;
    }

    if(this.state.mode==='vote'){
      this.returnToRoom();
      return false;
    }

    /*
      select/list 화면의 카드 내용은 일반 ready 상태와 무관하다.
      이미 열린 금지 화면은 그대로 유지하고, 실제 재정렬/재오픈/제안 변경처럼
      카드 구성이 달라지는 명시적 경로에서만 renderSelection/renderBannedList를 호출한다.
    */
    return false;
  },
  init(){
    document.getElementById('room-character-ban-open')?.addEventListener(
      'click',
      ()=>this.openSelection()
    );

    document.getElementById('room-character-ban-list')?.addEventListener(
      'click',
      ()=>this.openBannedList()
    );

    document.getElementById('character-ban-screen-back')?.addEventListener(
      'click',
      ()=>{
        if(this.state.mode!=='vote'){
          this.returnToRoom();
        }
      }
    );

    document.getElementById('character-ban-screen-propose')?.addEventListener(
      'click',
      ()=>{
        if(!this.selectedIds.size)return;

        if(!this.proposalLeavesAllowedCharacter()){
          this.status(
            '최소 1개의 캐릭터는 금지하지 않고 남겨야 합니다.',
            'err'
          );
          return;
        }

        const ids=[...this.selectedIds];

        if(RoomService.submitCharacterBanProposal(ids)){
          this.selectedIds.clear();
          this.sync();
        }
      }
    );

    document.getElementById('character-ban-screen-agree')?.addEventListener(
      'click',
      ()=>RoomService.submitCharacterBanVote(true)
    );

    document.getElementById('character-ban-screen-reject')?.addEventListener(
      'click',
      ()=>RoomService.submitCharacterBanVote(false)
    );

    document.getElementById('character-ban-sort-select')?.addEventListener(
      'change',
      event=>{
        CharacterSortService.setMode(
          String(event.target?.value||'release')
        );

        if(this.state.mode==='select'){
          this.renderSelection(false);
        }else if(this.state.mode==='list'){
          this.renderBannedList();
        }else if(this.state.mode==='vote'){
          this.renderVote();
        }
      }
    );
  }
});