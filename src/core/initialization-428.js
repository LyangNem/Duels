
document.getElementById('training-select-back')?.addEventListener('click',()=>{
  if(Training.sessionMode!=='training')return;
  const select=document.getElementById('scr-select');
  const lobby=document.getElementById('scr-lobby');
  select.style.removeProperty('display');
  lobby.style.removeProperty('display');
  select.classList.add('hidden');
  lobby.classList.remove('hidden');
});