
const CharacterCardLayoutService=Object.freeze({
  measureBaseline(root=document){
    let best=null;

    for(const card of root.querySelectorAll('.char-card')){
      if(
        card.classList.contains('char-card-compact-lines')
      )continue;

      const badge=
        card.querySelector(
          ':scope > .char-top-player-badge'
        );
      if(!badge||badge.hidden)continue;

      const top=
        badge.offsetTop;
      if(!Number.isFinite(Number(top)))continue;

      if(best===null||top>best){
        best=top;
      }
    }

    if(best!==null){
      characterCardTopPlayerBaseline=best;
    }

    return characterCardTopPlayerBaseline;
  },
  sync(card){
    if(!card?.classList)return false;

    card.classList.remove(
      'char-card-compact-lines'
    );
    card.style.removeProperty(
      '--top-player-shift'
    );

    const badge=
      card.querySelector(
        ':scope > .char-top-player-badge'
      );
    if(!badge||badge.hidden)return false;

    const stats=
      card.querySelector(
        ':scope > .char-stats'
      );
    if(!stats)return false;

    let wrapped=false;
    for(const row of stats.children){
      const style=getComputedStyle(row);
      const lineHeight=
        Number.parseFloat(style.lineHeight)||
        Number.parseFloat(style.fontSize)*1.32||
        15;
      if(
        row.getBoundingClientRect().height>
        lineHeight*1.55
      ){
        wrapped=true;
        break;
      }
    }

    if(wrapped){
      card.classList.add(
        'char-card-compact-lines'
      );
    }

    requestAnimationFrame(()=>{
      const baseline=
        this.measureBaseline(
          card.closest(
            '#scr-select,#scr-between'
          )||document
        );

      if(
        wrapped&&
        baseline!==null
      ){
        const current=
          badge.offsetTop;
        const delta=
          Math.round(
            Number(baseline)-
            Number(current)
          );

        card.style.setProperty(
          '--top-player-shift',
          `${delta}px`
        );
      }
    });

    return wrapped;
  },
  schedule(card){
    if(!card)return false;
    requestAnimationFrame(()=>
      this.sync(card)
    );
    return true;
  }
});