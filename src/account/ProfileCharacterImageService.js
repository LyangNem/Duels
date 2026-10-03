

const ProfileCharacterImageService=Object.freeze({
  source(characterId){
    const id=String(characterId||'').trim();
    return id?`${PROFILE_CHARACTER_IMAGE_BASE}${id}.png`:'';
  }
});