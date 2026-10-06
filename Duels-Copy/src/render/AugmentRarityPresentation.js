



const AugmentRarityPresentation=Object.freeze({
  color(rarity){if(rarity==='epic'||rarity==='epic')return '#bd79ff';if(rarity==='rare')return '#ffbd45';return '#66bfff'},
  label(rarity){if(rarity==='epic'||rarity==='epic')return '에픽';if(rarity==='rare')return '희귀';return '일반'}
});