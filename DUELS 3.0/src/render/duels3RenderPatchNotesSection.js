
function duels3RenderPatchNotesSection(containerId,items){
  const container=document.getElementById(containerId); if(!container)return;
  container.replaceChildren();
  const list=Array.isArray(items)?items:[];
  if(!list.length){const empty=document.createElement('li');empty.className='duels-patch-empty';empty.textContent='등록된 내용이 없습니다.';container.appendChild(empty);return;}
  list.forEach(raw=>{
    const entry=duels3NormalizePatchNoteItem(raw); if(!entry)return;
    const item=document.createElement('li');item.className=entry.character?'duels-patch-group':'duels-patch-single';
    if(entry.character){const character=document.createElement('div');character.className='duels-patch-character';character.textContent=entry.character;item.appendChild(character);}
    const changes=document.createElement('div');changes.className='duels-patch-changes';
    entry.changes.forEach(change=>{const description=document.createElement('div');description.className='duels-patch-description';description.textContent=change;changes.appendChild(description);});
    item.appendChild(changes);container.appendChild(item);
  });
}