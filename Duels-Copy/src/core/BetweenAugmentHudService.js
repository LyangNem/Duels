

const BetweenAugmentHudService=Object.freeze({
  characterIcon(
    container,
    characterId,
    peer=false,
    pid=null
  ){
    const character=
      GAME_DATA.characters[characterId];
    if(!container||!character)return;

    const icon=document.createElement('div');
    icon.className=
      `aug-icon training-char-icon${peer?' peer-char-icon':''}`;
    icon.dataset.id=character.id;
    if(pid)icon.dataset.pid=pid;
    icon.dataset.charTooltip='true';
    icon.style.setProperty(
      '--char-color',
      character.color
    );
    const ownerProfile=
      RoomService.members.get(pid)?.profile||
      (
        pid===RoomService.localPid
          ?PlayerProfileService.snapshot()
          :null
      )||
      AccountState.current;

    CharacterRecordService.applyMasteryStyle(
      icon,
      character.id,
      'mastery-icon',
      ownerProfile
    );
    icon.textContent=
      String(
        character.id||'?'
      ).charAt(0).toUpperCase();

    const tooltip=
      document.createElement('div');
    tooltip.className='char-tooltip';
    tooltip.innerHTML=
      CharacterDescriptionService.html(
        character,
        {
          recordPoints:CharacterRecordService.points(
            character.id,
            ownerProfile
          )
        }
      );
    icon.appendChild(tooltip);
    container.appendChild(icon);
  },
  augmentIcons(
    container,
    ids,
    side,
    pid=null
  ){
    for(const id of ids||[]){
      const augment=
        AugmentDataService.get(id);
      if(!augment)continue;

      const icon=
        document.createElement('div');
      icon.className=
        AugmentHudStyleService.className(
          side
        );
      icon.dataset.augmentId=
        augment.id;
      if(pid)icon.dataset.pid=pid;
      icon.dataset.charTooltip='true';
      icon.textContent=augment.emoji;

      const tooltip=
        document.createElement('div');
      tooltip.className='char-tooltip';
      tooltip.innerHTML=
        `<div style="font-weight:800;color:${AugmentRarityPresentation.color(augment.rarity)}">${augment.name}</div>`+
        `<div style="margin-top:5px;line-height:1.45;color:#aab">${augment.desc||''}</div>`;
      icon.appendChild(tooltip);

      container.appendChild(icon);
    }
  },
  render(selections={}){
    const wrapper=
      document.getElementById('aug-wrapper');
    const local=
      document.getElementById('aug-hud');
    const peer=
      document.getElementById('peer-aug-hud');
    const divider=
      document.getElementById('aug-divider');

    if(!wrapper||!local||!peer||!divider){
      return false;
    }

    local.replaceChildren();
    peer.replaceChildren();
    divider.style.display='none';
    peer.style.display='none';

    const localPid=RoomService.localPid;
    const pids=RoomService.matchPids();

    const resolvedCharacterId=pid=>
      selections?.[pid]?.resolvedCharacterId||
      RoomService.duelSelections.get(pid)||
      null;

    for(const pid of pids){
      const row=document.createElement('div');
      row.className='aug-player-row';
      row.dataset.pid=pid;

      const label=document.createElement('div');
      label.className='aug-player-label';
      label.textContent=
        PlayerDisplayNameService.resolve(pid);
      row.appendChild(label);

      this.characterIcon(
          row,
          resolvedCharacterId(pid),
          pid!==localPid,
          pid
        );

        const ids=
          pid===localPid
            ?OnlineDuelService.localAugments||[]
            :OnlineDuelService
              .remoteAugmentsByPid
              .get(pid)||[];

        this.augmentIcons(
          row,
          ids,
          pid===localPid?'local':'peer',
          pid
        );

      local.appendChild(row);
    }

    wrapper.style.display=
      local.children.length
        ?'flex'
        :'none';
    return true;
  }});