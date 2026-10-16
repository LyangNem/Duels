

const CharacterDifficultyService=Object.freeze({
  defaultLevel:CHARACTER_RULES.difficulty.default,
  koreanMap:CHARACTER_RULES.difficulty.labels,
  clamp(value){
    return Math.max(CHARACTER_RULES.difficulty.min,Math.min(CHARACTER_RULES.difficulty.max,Math.round(Number(value)||this.defaultLevel)));
  },
  normalize(characterOrId){
    if(typeof characterOrId==='string')return characterOrId;
    return String(characterOrId?.id||'');
  },
  level(characterOrId){
    const id=this.normalize(characterOrId);
    const character=
      typeof characterOrId==='string'
        ?ProfileCharacterService.get(characterOrId)
        :characterOrId;
    const raw=
      character?.difficultyLevel??
      character?.difficulty??
      character?.difficultyLabel??
      '';

    if(Number.isFinite(Number(raw))&&String(raw).trim()!==''){
      return this.clamp(raw);
    }

    const label=String(raw||'').trim();
    if(!label)return this.defaultLevel;
    if(/^[★☆]+$/.test(label)){
      return this.clamp((label.match(/★/g)||[]).length);
    }
    if(this.koreanMap[label]!=null)return this.koreanMap[label];
    return this.defaultLevel;
  },
  starsFromLevel(level){
    const count=this.clamp(level);
    const total=CHARACTER_RULES.difficulty.normalStars;
    return count>=CHARACTER_RULES.difficulty.specialLevel
      ?`<span class="difficulty-red-stars" title="사용에 주의가 필요한 수준">${'★'.repeat(total)}</span>`
      :'★'.repeat(count)+'☆'.repeat(Math.max(0,total-count));
  },
  stars(characterOrId){
    return this.starsFromLevel(this.level(characterOrId));
  }
});