

const ProfileSettingsUI=Object.freeze({
  render(){
    const preview=document.getElementById('duels-profile-preview');
    const picker=document.getElementById('duels-profile-character-picker');
    if(!preview||!picker||!AccountState.current)return;

    preview.setAttribute('aria-busy',profileApplyingCharacterId?'true':'false');
    const p=PlayerProfileService.snapshot();
    preview.replaceChildren();

    const tier=CharacterRecordService.tier(p.recordPoints);
    preview.dataset.recordTier=tier.id;
    preview.style.setProperty('--profile-tier-gradient',tier.gradient);
    preview.style.setProperty('--profile-tier-glow',tier.glow);

    const character=ProfileCharacterService.get(p.mainCharacterId);
    const avatar=CharacterPortraitService.create(character,'duels-profile-avatar');
    const avatarStage=document.createElement('span');
    avatarStage.className='profile-avatar-stage-wrap';
    avatarStage.appendChild(avatar);
    CharacterRecordService.applyMasterStageBadge(
      avatarStage,
      p.recordPoints,
      'profile-master-stage'
    );
    avatar.classList.add('profile-character-trigger');
    avatar.tabIndex=0;
    avatar.setAttribute('role','button');
    avatar.setAttribute('aria-label','메인 캐릭터 선택');
    avatar.setAttribute('aria-expanded',profileCharacterPickerOpen?'true':'false');

    const togglePicker=event=>{
      event?.preventDefault?.();
      event?.stopPropagation?.();
      this.setPickerOpen(!profileCharacterPickerOpen);
    };

    avatar.addEventListener('click',togglePicker);
    avatar.addEventListener('keydown',event=>{
      if(event.key!=='Enter'&&event.key!==' ')return;
      togglePicker(event);
    });

    const copy=document.createElement('div');
    copy.className='duels-profile-copy';

    const name=document.createElement('strong');
    name.textContent=p.displayName;

    const title=document.createElement('span');
    title.className='duels-profile-title';
    title.textContent=
      p.mainCharacterTitle||
      '';
    title.hidden=!title.textContent;

    const main=document.createElement('small');
    main.textContent=`메인 캐릭터 · ${p.mainCharacterName}`;

    copy.append(name,title,main);
    preview.append(avatarStage,copy);
    preview.dataset.profileMode='base';
    PlayerProfileCardService.bind(preview,p);

    this.renderPicker(p.mainCharacterId);
  },
  renderPicker(selectedId){
    const picker=document.getElementById('duels-profile-character-picker');
    if(!picker)return;

    picker.replaceChildren();

    for(const [index,character] of ProfileCharacterService.all().entries()){
      const button=document.createElement('button');
      button.type='button';
      button.className='duels-profile-character-option';
      button.dataset.characterId=character.id;
      button.classList.toggle('selected',character.id===selectedId);
      button.disabled=!!profileApplyingCharacterId;
      button.style.setProperty('--profile-picker-index',String(index));
      button.style.setProperty('--profile-color',character.color);

      const portrait=CharacterPortraitService.create(
        character,
        'duels-profile-character-option-avatar'
      );

      const label=document.createElement('span');
      label.textContent=character.name;

      button.append(portrait,label);

      button.addEventListener('click',event=>{
        event.stopPropagation();
        this.setMainCharacter(character.id);
      });

      picker.appendChild(button);
    }

    picker.hidden=!profileCharacterPickerOpen;
    picker.classList.toggle('open',profileCharacterPickerOpen);
    picker.classList.toggle(
      'applying',
      !!profileApplyingCharacterId
    );
    picker.setAttribute(
      'aria-busy',
      profileApplyingCharacterId?'true':'false'
    );
  },
  setPickerOpen(open){
    profileCharacterPickerOpen=!!open;

    const picker=document.getElementById('duels-profile-character-picker');
    if(picker){
      picker.hidden=!profileCharacterPickerOpen;
      picker.classList.toggle('open',profileCharacterPickerOpen);
      picker.classList.toggle(
        'applying',
        !!profileApplyingCharacterId
      );
    }

    const trigger=document.querySelector(
      '#duels-profile-preview > .profile-character-trigger'
    );
    if(trigger){
      trigger.setAttribute(
        'aria-expanded',
        profileCharacterPickerOpen?'true':'false'
      );
    }
  },
  async setMainCharacter(id){
    if(profileApplyingCharacterId)return false;

    profileApplyingCharacterId=id;
    this.render();

    try{
      const applied=await PlayerProfileService.setMainCharacter(id);
      if(!applied)return false;
      profileCharacterPickerOpen=false;
      RoomUI.render();
      return true;
    }finally{
      profileApplyingCharacterId=null;
      this.render();
    }
  }
});