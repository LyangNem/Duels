

/* 레코드 실시간 UI 동기화 */
const CharacterRecordLiveRefreshService=Object.freeze({
  profileFor(pid,fallback=null){
    const id=String(pid||'');

    if(
      !id||
      id===String(RoomService.localPid||'')
    ){
      return AccountState.current||fallback;
    }

    return (
      RoomService.members.get(id)?.profile||
      fallback||
      null
    );
  },

  updateTooltip(node,characterId,profile){
    if(!node||!characterId)return false;

    const character=
      GAME_DATA.characters[characterId]||
      null;
    if(!character)return false;

    const tooltip=
      node.matches?.('.char-tooltip')
        ?node
        :node.querySelector?.(
          ':scope > .char-tooltip'
        );

    if(!tooltip)return false;

    tooltip.innerHTML=
      CharacterDescriptionService.html(
        character,
        {
          recordPoints:
            CharacterRecordService.points(
              characterId,
              profile
            )
        }
      );

    return true;
  },

  updateCard(card,characterId,profile){
    if(!card||!characterId)return false;

    card._recordAccountData=
      profile||
      card._recordAccountData||
      AccountState.current;

    CharacterRecordService.applyCardStyle(
      card,
      characterId,
      card._recordAccountData
    );

    this.updateTooltip(
      card,
      characterId,
      card._recordAccountData
    );

    if(
      card.classList.contains(
        'record-detail-open'
      )&&
      card.dataset.detailMode==='stats'
    ){
      const character=
        CharacterCardDataService.get(
          characterId
        );
      if(character){
        CharacterRecordService.renderStats(
          card,
          character
        );
      }
    }

    return true;
  },

  ownerPid(node){
    return String(
      node?.dataset?.masteryPid||
      node?.dataset?.pid||
      ''
    );
  },

  matchesOwner(node,pid,isLocal){
    const ownerPid=this.ownerPid(node);

    if(ownerPid){
      return ownerPid===String(pid||'');
    }

    return isLocal;
  },

  refresh({
    pid=null,
    characterId=null,
    profile=null
  }={}){
    const id=String(characterId||'');
    if(!id)return false;

    const resolvedPid=
      String(pid||RoomService.localPid||'');
    const isLocal=
      !resolvedPid||
      resolvedPid===String(RoomService.localPid||'');

    const resolvedProfile=
      profile||
      this.profileFor(
        resolvedPid,
        isLocal
          ?AccountState.current
          :null
      );

    if(!resolvedProfile)return false;

    // 이미 존재하는 모든 캐릭터 카드: 선택창/시작 증강/라운드 준비 포함.
    for(
      const card of
      document.querySelectorAll(
        `.char-card[data-id="${CSS.escape(id)}"]`
      )
    ){
      if(
        !this.matchesOwner(
          card,
          resolvedPid,
          isLocal
        )
      )continue;

      this.updateCard(
        card,
        id,
        resolvedProfile
      );
    }

    // 카드가 아닌 캐릭터 버튼/HUD 아이콘/훈련장 캐릭터 툴팁.
    for(
      const node of
      document.querySelectorAll(
        `[data-char-tooltip="true"][data-id="${CSS.escape(id)}"]`
      )
    ){
      if(node.classList.contains('char-card'))continue;

      if(
        !this.matchesOwner(
          node,
          resolvedPid,
          isLocal
        )
      )continue;

      CharacterRecordService.applyHudIconStyle(
        node,
        id,
        resolvedProfile
      );
      this.updateTooltip(
        node,
        id,
        resolvedProfile
      );
    }

    // 로컬 프로필은 메인 캐릭터 레코드/등급/칭호가 즉시 다시 계산되어야 한다.
    if(isLocal){
      if(
        typeof ProfileSettingsUI!=='undefined'
      ){
        ProfileSettingsUI.render();
      }
    }

    // 방 프로필은 해당 PID의 최신 snapshot을 읽어 다시 그린다.
    if(
      typeof RoomUI!=='undefined'&&
      !document
        .getElementById('scr-room')
        ?.classList.contains('hidden')
    ){
      RoomUI.render();
    }

    // 전투 HUD는 참가자별 profile/record를 다시 읽어 즉시 반영한다.
    if(
      typeof Training!=='undefined'&&
      Training.active
    ){
      Training.renderAugHud();
    }

    if(
      typeof OnlineDuelService!=='undefined'&&
      OnlineDuelService.active&&
      typeof OnlineDuelService
        .renderCharacterPreviews==='function'
    ){
      OnlineDuelService
        .renderCharacterPreviews();
    }

    return true;
  }
});