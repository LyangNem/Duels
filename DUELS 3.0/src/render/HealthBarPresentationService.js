

const HealthBarPresentationService=Object.freeze({
  sync(fill,trail,width,state,key){
    if(!fill||!trail)return;

    const next=Math.max(0,Math.min(100,Number(width)||0));
    const previous=Number(state[key]);

    if(previous===next)return;

    state[key]=next;
    fill.style.width=`${next}%`;

    const instantKey=`${key}TrailInstant`;

    if(!Number.isFinite(previous)||next>=previous){
      trail.style.transition='none';
      trail.style.width=`${next}%`;
      state[instantKey]=true;
      return;
    }

    if(state[instantKey]){
      trail.style.removeProperty('transition');
      state[instantKey]=false;
    }

    trail.style.width=`${next}%`;
  }
});