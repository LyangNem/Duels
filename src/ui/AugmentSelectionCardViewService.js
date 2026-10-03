

const AugmentSelectionCardViewService=Object.freeze({
  create(augmentId,{interactive=false,ownerPid=null}={}){
    const augment=AugmentDataService.get(augmentId);
    if(!augment)return null;

    const color=AugmentRarityPresentation.color(augment.rarity);
    const card=document.createElement('div');
    card.className=`aug-pick-card${interactive?'':' augment-card-static'}`;
    card.dataset.id=augment.id;
    card.dataset.augmentId=augment.id;
    card.dataset.ownerPid=ownerPid||'';
    card.dataset.rarity=augment.rarity||'common';

    const emoji=document.createElement('div');
    emoji.className='aug-emoji';
    emoji.textContent=augment.emoji||'◆';

    const name=document.createElement('div');
    name.className='aug-name';
    name.style.color=color;
    name.textContent=augment.name;

    const rarity=document.createElement('div');
    rarity.className='aug-rarity';
    rarity.style.color=color;
    rarity.textContent=AugmentRarityPresentation.label(augment.rarity);

    const description=document.createElement('div');
    description.className='aug-desc';
    description.innerHTML=augment.desc||'';

    card.append(emoji,name,rarity,description);
    return card;
  }
});