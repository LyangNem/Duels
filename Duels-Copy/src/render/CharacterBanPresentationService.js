

const CharacterBanPresentationService=Object.freeze({
  syncMark(card,banned){
    if(!card)return null;

    let mark=
      card.querySelector(
        ':scope > .character-ban-mark'
      );

    if(!banned){
      mark?.remove();
      return null;
    }

    if(!mark){
      mark=document.createElement('div');
      mark.className='character-ban-mark';
      card.appendChild(mark);
    }

    mark.textContent='금지';
    mark.classList.remove('proposal');
    return mark;
  },

  apply(card,characterId){
    if(!card)return false;

    const banned=
      RoomService.isCharacterBanned(
        characterId||card.dataset.id
      );

    card.classList.toggle(
      'character-banned',
      banned
    );

    if(banned){
      card.classList.add('selection-locked');
      card.classList.remove('sel');
      card.setAttribute('aria-disabled','true');
    }else{
      card.classList.remove('selection-locked');
      card.removeAttribute('aria-disabled');
    }

    this.syncMark(card,banned);
    return banned;
  }
});