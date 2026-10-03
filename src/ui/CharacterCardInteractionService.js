

const CharacterCardInteractionService=Object.freeze({
  target(event){
    const card=event?.target?.closest?.('.char-card[data-id]');
    if(!card||!card.isConnected)return null;
    return card;
  },
  handleContextMenu(event){
    const card=this.target(event);
    if(!card)return false;

    event.preventDefault();
    event.stopPropagation();
    CharacterTooltip.hide();
    CharacterRecordService.cycle(card);
    return true;
  },

  bind(
    card,
    {
      account=AccountState.current
    }={}
  ){
    if(!card)return false;

    card._recordAccountData=
      account||
      AccountState.current;

    if(
      card.dataset.characterCardContextBound===
      'true'
    )return true;

    card.dataset.characterCardContextBound=
      'true';

    card.addEventListener(
      'contextmenu',
      event=>{
        this.handleContextMenu(event);
      }
    );

    return true;
  }
});