

const CharacterCardStatsService=Object.freeze({
  difficulty(character){
    return CharacterDifficultyService.stars(character);
  },
  rows(character){
    return [
      ['체력',character?.maxHealth],
      ['이동속도',character?.moveLabel||character?.speed],
      ['스타일',CharacterSortService.styleLabel(character)||'-'],
      ['난이도',this.difficulty(character)]
    ];
  },
  html(rows){
    return (rows||[])
      .map(
        ([key,value])=>
          `<div><b>${key}</b>: <span>${value}</span></div>`
      )
      .join('');
  },
  refreshCard(card){
    if(!card)return false;
    const id=String(card.dataset.id||'');
    if(!id)return false;

    const character=
      GAME_DATA.characters[id]||
      CharacterCardDataService.get(id)?.combat||
      null;
    const statsNode=card.querySelector(':scope > .char-stats');
    if(!character||!statsNode)return false;

    const rows=this.rows(character);
    statsNode.innerHTML=this.html(
      card.dataset.hideDifficulty==='true'
        ?rows.filter(([key])=>key!=='난이도')
        :rows
    );
    return true;
  },
  refreshAll(root=document){
    if(!root)return false;
    let updated=0;
    for(const card of root.querySelectorAll('.char-card[data-id], .start-aug-char-card[data-id]')){
      if(this.refreshCard(card))updated++;
    }
    return updated>0;
  }
});