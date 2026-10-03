

/* 프로필/레코드 캐릭터 목록은 실제 전투 캐릭터 데이터만 사용한다. */
const ProfileCharacterService=Object.freeze({
  catalog:Object.freeze(
    Object.values(GAME_DATA.characters)
  ),
  all(){
    return this.catalog;
  },
  get(characterId){
    return GAME_DATA.characters[characterId]||null;
  },
  has(characterId){
    return !!GAME_DATA.characters[characterId];
  }
});