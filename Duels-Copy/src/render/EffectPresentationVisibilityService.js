

const EffectPresentationVisibilityService=Object.freeze({
  visible(effect){
    const visibility=String(
      effect?.visibility||
      'all'
    );

    if(visibility==='all')return true;

    const viewer=Training.player;
    if(!viewer)return false;

    const source=
      EntityService.items.get(
        String(effect?.sourceEntityId||'')
      )||
      null;

    if(visibility==='owner'){
      return source===viewer;
    }

    if(visibility==='owner-team'){
      if(source===viewer)return true;
      return !!(
        source?.teamId&&
        viewer.teamId&&
        source.teamId===viewer.teamId
      );
    }

    return true;
  }
});