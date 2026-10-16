

const MasterRecordMilestonePresentationService=Object.freeze({
  masterLevel(entity){
    const tier=
      RecordDodgePresentationService.tier(entity);
    return tier.id==='master'
      ?Math.max(
        1,
        Math.min(
          5,
          Number(tier.masterLevel)||1
        )
      )
      :0;
  },
  justDodge(entity,now=performance.now()){
    const level=this.masterLevel(entity);
    if(level<2)return false;
    EffectSpawnService.spawn({
      type:'masterJustDodgeHex',
      x:Number(entity.x)||0,
      y:Number(entity.y)||0,
      level,
      start:now,
      dur:520
    });
    return true;
  },
  victory(entity,now=performance.now()){
    const level=this.masterLevel(entity);
    if(level<4)return false;
    if(!entity?.alive)return false;

    EffectSpawnService.spawn({
      type:'masterVictoryHexBloom',
      entity,
      x:Number(entity.x)||0,
      y:Number(entity.y)||0,
      start:now,
      dur:1050
    });

    return true;
  },

  elimination(entity,x,y,kind='kill',now=performance.now()){
    if(String(kind||'kill')!=='kill')return false;
    const level=this.masterLevel(entity);
    if(level<3)return false;
    EffectSpawnService.spawn({
      type:'masterEliminationHex',
      x:Number(x)||0,
      y:Number(y)||0,
      level,
      roman:
        CharacterRecordService.roman(level),
      eventKind:String(kind||'kill'),
      start:now,
      dur:1200
    });
    return true;
  }
});