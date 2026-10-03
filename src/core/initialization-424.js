



/* 캐릭터 선택 UI */
document.getElementById('character-sort-select')?.addEventListener('change',event=>{
  const mode=String(event.target.value||'release');
  Training.characterSortMode=
    CharacterSortService.setMode(mode);

  const grid=document.getElementById('char-grid');
  const selectedId=Training.selectedCharacterId;

  Training.renderCharacterCards();

  if(selectedId){
    grid
      ?.querySelector(
        `.char-card[data-id="${selectedId}"]`
      )
      ?.scrollIntoView({
        block:'nearest',
        inline:'nearest'
      });
  }
});