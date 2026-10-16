

const MatchSelectionLayoutService=Object.freeze({
  columns(count,availableWidth,cardWidth,gap=10){
    const total=Math.max(0,Number(count)||0);
    if(total<=0)return 1;

    const oneRowWidth=
      total*cardWidth+
      Math.max(0,total-1)*gap;

    if(total<=7&&oneRowWidth<=availableWidth)return total;

    const physicalColumns=Math.max(
      1,
      Math.floor((availableWidth+gap)/(cardWidth+gap))
    );
    const maximumColumns=Math.min(5,physicalColumns);
    const rows=Math.max(
      2,
      Math.ceil(total/Math.max(1,maximumColumns))
    );

    return Math.max(
      1,
      Math.min(
        maximumColumns,
        Math.ceil(total/rows)
      )
    );
  },
  availableWidth(grid,cardWidth){
    if(!grid)return cardWidth;

    if(
      grid.id==='between-char-grid'||
      grid.id==='between-aug-grid'
    ){
      return Math.max(
        180,
        Math.floor(window.innerWidth-32)
      );
    }

    const parentWidth=
      grid.parentElement?.getBoundingClientRect?.().width||0;

    return Math.max(
      cardWidth,
      Math.floor(
        parentWidth>cardWidth
          ?Math.min(window.innerWidth-32,parentWidth)
          :window.innerWidth-32
      )
    );
  },
  apply(grid,count,cardWidth){
    if(!grid)return;

    const total=Math.max(0,Number(count)||0);
    const gap=10;
    const available=this.availableWidth(grid,cardWidth);
    const columns=this.columns(
      total,
      available,
      cardWidth,
      gap
    );

    const targetWidth=Math.min(
      available,
      columns*cardWidth+
      Math.max(0,columns-1)*gap
    );

    grid.style.setProperty('display','flex','important');
    grid.style.setProperty('flex-direction','row','important');
    grid.style.setProperty(
      'flex-wrap',
      columns<total?'wrap':'nowrap',
      'important'
    );
    grid.style.setProperty('justify-content','center','important');
    grid.style.setProperty('align-items','stretch','important');
    grid.style.setProperty('align-content','flex-start','important');
    grid.style.setProperty('gap',`${gap}px`,'important');
    grid.style.setProperty(
      'width',
      `${Math.max(cardWidth,targetWidth)}px`,
      'important'
    );
    grid.style.setProperty('min-width','0','important');
    grid.style.setProperty('max-width','100%','important');
    grid.style.setProperty('margin-left','auto','important');
    grid.style.setProperty('margin-right','auto','important');

    [...grid.children].forEach(card=>{
      card.style.setProperty(
        'flex',
        `0 0 ${cardWidth}px`,
        'important'
      );
      card.style.setProperty(
        'width',
        `${cardWidth}px`,
        'important'
      );
      card.style.setProperty(
        'min-width',
        `${cardWidth}px`,
        'important'
      );
      card.style.setProperty(
        'max-width',
        `${cardWidth}px`,
        'important'
      );
    });

    grid.dataset.balancedColumns=String(columns);
  },
  applyHorizontalRow(row,cardWidth=180,cardsPerRow=5){
    if(!row)return;

    const cards=Array.from(row.children).filter(
      card=>
        card.classList.contains('aug-pick-card')||
        card.classList.contains('start-aug-item')
    );

    this.apply(
      row,
      cards.length,
      cardWidth
    );

    const gap=10;
    const columns=Math.max(
      1,
      Math.min(
        Math.max(1,Number(cardsPerRow)||5),
        cards.length||1
      )
    );
    const targetWidth=
      columns*cardWidth+
      Math.max(0,columns-1)*gap;

    row.style.setProperty(
      'flex-wrap',
      cards.length>columns?'wrap':'nowrap',
      'important'
    );
    row.style.setProperty(
      'width',
      `${targetWidth}px`,
      'important'
    );
    row.style.setProperty(
      'max-width',
      'none',
      'important'
    );
    row.style.setProperty(
      'box-sizing',
      'content-box',
      'important'
    );

    row.style.setProperty(
      'overflow-x',
      'visible',
      'important'
    );
    row.dataset.balancedColumns=String(columns);
  },
  refresh(){
    const startChars=document.getElementById('start-aug-char-row');
    const startAugs=document.getElementById('start-aug-grid');
    const betweenChars=document.getElementById('between-char-grid');
    const betweenAugs=document.getElementById('between-aug-grid');

    if(startChars&&!startChars.closest('.hidden')){
      this.apply(startChars,startChars.children.length,160);
    }
    if(startAugs&&!startAugs.closest('.hidden')){
      this.applyHorizontalRow(
        startAugs,
        180,
        5
      );
    }
    if(betweenChars&&!betweenChars.closest('.hidden')){
      this.apply(
          betweenChars,
          betweenChars.children.length,
          160
        );
    }
    if(betweenAugs&&!betweenAugs.closest('.hidden')){
      for(
        const row of
        betweenAugs.querySelectorAll(
          '.between-aug-option-row'
        )
      ){
        this.applyHorizontalRow(
          row,
          180,
          5
        );
      }
    }
  }
});