

const CharacterTitleService=Object.freeze({
  titles:Object.freeze(Object.fromEntries(
    Object.values(GAME_DATA.characters).map(character=>[character.id,character.title])
  )),

  get(characterId){
    return (
      this.titles[
        String(characterId||'')
      ]||
      '칭호 미지정'
    );
  },

  attach(card,characterId,points=0){
    if(!card)return false;

    const apply=()=>{
      if(
        !card?.isConnected&&
        !card.querySelector?.('.char-name')
      )return false;

      const name=
        card.querySelector(
          ':scope > .char-name'
        )||
        card.querySelector('.char-name');
      if(!name)return false;

      const tier=
        CharacterRecordService.tier(
          points
        );
      const visible=
        tier.id==='master'&&
        Number(tier.masterLevel)>=5;

      let title=
        name.querySelector(
          ':scope > .char-title'
        )||
        card.querySelector(
          ':scope > .char-title'
        );

      if(!visible){
        title?.remove();
        CharacterCardLayoutService.schedule(
          card
        );
        return false;
      }

      if(!title){
        title=document.createElement('span');
        title.className='char-title';
      }

      if(title.parentElement!==name){
        title.remove();
        name.appendChild(title);
      }

      title.textContent=
        this.get(characterId);
      CharacterCardLayoutService.schedule(
        card
      );
      return true;
    };

    if(apply())return true;

    queueMicrotask(()=>{
      apply();
    });
    return false;
  }
});