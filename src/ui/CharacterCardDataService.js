

/* 캐릭터 카드 카탈로그 */
const CharacterCardDataService=Object.freeze({
  cache:new Map(),
  list:[],
  all(){
    if(this.list.length)return this.list;

    for(const character of ProfileCharacterService.all()){
      const card=this.get(character.id);
      if(card)this.list.push(card);
    }

    return this.list;
  },
  get(characterId){
    if(this.cache.has(characterId)){
      return this.cache.get(characterId);
    }

    const combat=
      ProfileCharacterService.get(characterId);
    if(!combat)return null;

    const card=Object.freeze({
      ...combat,
      maxHealth:combat.maxHealth,
      moveLabel:combat.moveLabel,
      styleLabel:
        combat.styleLabel||
        TagService.characterStyleLabel(combat),
      desc:combat.desc||'',
      combat
    });

    this.cache.set(characterId,card);
    return card;
  }
});