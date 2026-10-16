

const CharacterSelectionDeferredWorkService={
  token:0,
  schedulePortraits(grid){
    if(!grid)return false;

    const token=++this.token;
    const cards=[
      ...grid.querySelectorAll(
        '.char-card[data-id]'
      )
    ].filter(card=>
      !card.querySelector(
        ':scope > .char-card-portrait-bg'
      )
    );

    let index=0;

    const run=deadline=>{
      if(
        token!==this.token||
        !grid.isConnected
      )return;

      let budget=2;

      while(index<cards.length&&budget>0){
        if(
          deadline&&
          typeof deadline.timeRemaining==='function'&&
          deadline.timeRemaining()<2
        )break;

        const card=cards[index++];
        const character=
          CharacterCardDataService.get(
            card.dataset.id
          );

        if(character){
          CharacterCardPortraitService.attach(
            card,
            character,
            ()=>{
              if(
                document.getElementById('scr-select')
                  ?.classList.contains('hidden')
              )return;

              CharacterCardPortraitService
                .animateEntrance(card);
            }
          );
        }

        budget--;
      }

      if(index>=cards.length)return;

      if('requestIdleCallback' in window){
        requestIdleCallback(
          run,
          {timeout:60}
        );
      }else{
        setTimeout(
          ()=>run(null),
          16
        );
      }
    };

    if('requestIdleCallback' in window){
      requestIdleCallback(
        run,
        {timeout:60}
      );
    }else{
      setTimeout(
        ()=>run(null),
        0
      );
    }

    return true;
  },
  cancel(){
    this.token++;
  }
};