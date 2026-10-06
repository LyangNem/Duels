
document.getElementById('confirm-btn')?.addEventListener('click',()=>{
  if(Training.sessionMode!=='online'||!OnlineDuelService.selecting)return;
  OnlineDuelService.confirmCharacter();
});