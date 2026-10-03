
async function duels3LoadPatchNotes(forceReload=false){
  if(duels3PatchNotesLoaded&&!forceReload)return;
  const state=document.getElementById('duels-patch-state');if(state)state.textContent='패치노트를 불러오는 중...';
  try{
    const separator=DUELS_PATCH_NOTES_URL.includes('?')?'&':'?';
    const response=await fetch(`${DUELS_PATCH_NOTES_URL}${separator}t=${Date.now()}`,{cache:'no-store'});
    if(!response.ok)throw new Error(`HTTP ${response.status}`);
    const text=await response.text();let parsed;
    try{parsed=duels3NormalizePatchNotes(JSON.parse(text));}
    catch(parseError){const trimmed=text.trimStart();if(trimmed.startsWith('{')||trimmed.startsWith('['))throw new Error(duels3DescribePatchNoteJsonError(parseError,text));parsed=duels3ParsePatchNotesText(text);}
    duels3RenderPatchNotes(parsed);duels3PatchNotesLoaded=true;
  }catch(error){duels3PatchNotesLoaded=false;if(state)state.textContent=`패치노트를 불러오지 못했습니다. (${error.message||'NETWORK ERROR'})`;}
}