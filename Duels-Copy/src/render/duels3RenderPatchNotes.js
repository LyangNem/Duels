
function duels3RenderPatchNotes(notes){
  applyDuels3Release(notes);
  const meta=document.getElementById('duels-patch-meta');
  if(meta)meta.textContent=[DUELS3_RELEASE.version,DUELS3_RELEASE.date].filter(Boolean).join(' · ')||'LATEST PATCH';
  duels3RenderPatchNotesSection('duels-patch-features',notes.features);
  duels3RenderPatchNotesSection('duels-patch-balance',notes.balance);
  duels3RenderPatchNotesSection('duels-patch-bugfixes',notes.bugfixes);
  const state=document.getElementById('duels-patch-state');if(state)state.textContent='';
}