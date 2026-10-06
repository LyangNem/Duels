

const AugmentAcquisitionResultRenderer=Object.freeze({
  render(container,augmentId,{
    title='상대방이 획득한 증강',
    emptyText='상대방은 증강을 선택하지 않았습니다.'
  }={}){
    if(!container)return false;
    container.replaceChildren();
    const card=AugmentSelectionCardViewService.create(augmentId);
    if(!card){
      container.classList.add('augment-acquisition-result-empty');
      container.textContent=emptyText;
      return false;
    }
    container.classList.remove('augment-acquisition-result-empty');
    const titleNode=document.createElement('div');
    titleNode.className='augment-acquisition-result-title';
    titleNode.textContent=title;
    card.classList.add('augment-acquisition-result-card');
    container.append(titleNode,card);
    return true;
  }
});