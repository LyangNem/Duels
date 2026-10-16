

/* 선택/라운드 준비가 공유하는 단일 캐릭터 카드 뷰 */
const CharacterCardViewService=Object.freeze({
  create(characterLike,{
    account=AccountState.current,
    selected=false,
    cursor='pointer'
  }={}){
    const combat=characterLike?.combat||characterLike;
    if(!combat?.id)return null;
    const characterId=combat.id;
    const card=document.createElement('div');
    card.className=`char-card${selected?' sel':''}`;
    card.dataset.id=characterId;
    card.dataset.charTooltip='true';
    if(cursor)card.style.cursor=cursor;

    const tooltip=document.createElement('div');
    tooltip.className='char-tooltip';
    tooltip.innerHTML=CharacterDescriptionService.html(
      combat,
      {
        recordPoints:CharacterRecordService.points(
          characterId,
          account
        )
      }
    );

    const icon=document.createElement('div');
    icon.className='char-icon';
    CharacterCardColorService.applyIcon(icon,combat);

    const name=document.createElement('div');
    name.className='char-name';
    CharacterCardColorService.applyName(name,combat);
    name.textContent=combat.name;

    const stats=document.createElement('div');
    stats.className='char-stats';
    stats.innerHTML=CharacterCardStatsService.html(
      CharacterCardStatsService.rows(combat)
    );

    card.append(tooltip,icon,name,stats);
    CharacterRecordService.applyCardStyle?.(
      card,
      characterId,
      account
    );
    CharacterCardInteractionService.bind(
      card,
      {account}
    );
    CharacterRecordService.resetCardView(card);
    CharacterCardPortraitService.attach(card,combat);
    return card;
  }
});