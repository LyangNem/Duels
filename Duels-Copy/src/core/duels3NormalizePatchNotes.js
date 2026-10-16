
function duels3NormalizePatchNotes(source){
  const value=source&&typeof source==='object'?source:{};
  const list=(...keys)=>{
    for(const key of keys){
      const candidate=value[key];
      if(Array.isArray(candidate))return candidate.map(duels3NormalizePatchNoteItem).filter(Boolean);
      if(typeof candidate==='string')return candidate.split(/\r?\n/).map(item=>duels3NormalizePatchNoteItem(item.replace(/^[-*•]\s*/, '').trim())).filter(Boolean);
    }
    return [];
  };
  return {version:String(value.version||value.title||'').trim(),date:String(value.date||value.updatedAt||value.updated||'').trim(),features:list('features','additions','added','newFeatures'),balance:list('balance','balanceChanges','balancing'),bugfixes:list('bugfixes','bugFixes','fixes','bugs')};
}