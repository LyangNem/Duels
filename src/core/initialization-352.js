

document.addEventListener('pointerover',event=>{
  const card=event.target instanceof Element?event.target.closest('[data-char-tooltip="true"]'):null;
  if(!card||card.contains(event.relatedTarget))return;
  CharacterTooltip.show(card);
  CharacterTooltip.move(event.clientX,event.clientY);
},true);