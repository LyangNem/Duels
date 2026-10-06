
document.getElementById('training-confirm-btn')?.addEventListener('click',()=>{
  if(Training.sessionMode!=='training')return;
  Training.start();
});