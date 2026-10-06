

const AttackPresentationColorService=Object.freeze({
  resolve(source,attack=null,module=null){
    if(
      attack?.presentation?.teamColor===true||
      module?.teamColor===true||
      module?.presentation?.teamColor===true
    ){
      return ColorService.rgbString(
        TeamColorPresentationService.colorForEntity(
          source,
          source?.color||'#4af'
        )
      );
    }

    const chargeColors=Array.isArray(attack?.presentation?.chargeColors)
      ?attack.presentation.chargeColors
      :null;
    if(chargeColors?.length){
      const progress=Math.max(0,Math.min(1,Number(attack?.resolvedChargeProgress)||0));
      let selected=null;
      for(const entry of chargeColors){
        const min=Math.max(0,Math.min(1,Number(entry?.min)||0));
        if(progress>=min)selected=entry;
      }
      if(selected?.color)return ColorService.rgbString(selected.color);
    }

    const explicit=
      module?.presentation?.color||
      module?.color||
      attack?.presentation?.color||
      attack?.color||
      null;

    return explicit
      ?ColorService.rgbString(explicit)
      :ColorService.rgbString(source?.color);
  }
});