

const SelectionEntranceAnimationService=Object.freeze({
  duration:280,
  delayStep:12,
  animate(container,selector=':scope > *'){
    if(!container)return false;

    const items=[
      ...container.querySelectorAll(selector)
    ];

    for(const [index,item] of items.entries()){
      item.classList.remove('duels-choice-enter');

      for(
        const animation of
        item.getAnimations?.()||[]
      ){
        if(
          animation.effect?.target===item&&
          animation.id==='duels-choice-enter'
        ){
          animation.cancel();
        }
      }

      const animation=item.animate(
        [
          {
            opacity:0,
            transform:
              'translateY(-8px) scale(.94)'
          },
          {
            opacity:1,
            transform:
              'translateY(0) scale(1)'
          }
        ],
        {
          duration:this.duration,
          delay:index*this.delayStep,
          easing:'cubic-bezier(.2,.75,.28,1)',
          // 지연 중에는 첫 프레임을 유지하되 완료 뒤에는 CSS의 hover/sel transform이 즉시 다시 적용되게 한다.
          fill:'backwards'
        }
      );

      animation.id='duels-choice-enter';
    }

    return items.length>0;
  }
});