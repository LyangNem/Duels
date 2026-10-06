

function duels3NormalizePatchNoteItem(item){
  if(typeof item==='string'){
    const change=item.trim();
    return change?{character:'',changes:[change]}:null;
  }
  if(!item||typeof item!=='object')return null;
  const character=String(item.character||item.characterName||item.target||item.name||'').trim();
  const rawChanges=item.changes??item.descriptions??item.items??item.description??item.text??item.change??item.details;
  const changes=(Array.isArray(rawChanges)?rawChanges:[rawChanges])
    .flatMap(value=>typeof value==='string'?value.split(/\r?\n/):[])
    .map(value=>value.replace(/^[-*•]\s*/, '').trim()).filter(Boolean);
  return changes.length?{character,changes}:null;
}