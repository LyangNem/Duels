
document.getElementById('random-btn')?.addEventListener('click',()=>{
  if(Training.sessionMode!=='online'||!OnlineDuelService.selecting)return;
  const button=document.getElementById('random-btn');
  if(button?.disabled)return;
  Training.selectRandomCharacter();
});