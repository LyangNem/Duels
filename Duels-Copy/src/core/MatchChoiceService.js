

const MatchChoiceService=Object.freeze({
  rarityWeights:Object.freeze({
    common:45,
    rare:35,
    epic:20
  }),
  shuffled(items){
    const list=[...(items||[])];
    for(let i=list.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));
      [list[i],list[j]]=[list[j],list[i]];
    }
    return list;
  },
  characterIds(){
    return CharacterCardDataService.all()
      .map(character=>character.id);
  },
  characterOptions(count,{excludeIds=[]}={}){
    const excluded=new Set(
      [...(excludeIds||[])].map(String)
    );
    const pool=this.shuffled(
      this.characterIds().filter(
        id=>!excluded.has(String(id))
      )
    );
    return pool.slice(
      0,
      Math.max(0,Math.min(pool.length,Number(count)||0))
    );
  },
  augmentOptions(count,{ownedIds=[]}={}){
    const owned=new Set(ownedIds||[]);
    const selected=[];
    const targetCount=Math.max(0,Number(count)||0);

    for(let draw=0;draw<targetCount;draw++){
      const available=AugmentDataService.all().filter(augment=>{
        if(!augment)return false;
        if(selected.some(item=>item.id===augment.id))return false;
        if(
          (augment.nonStackable||augment.rarity==='unique')&&
          owned.has(augment.id)
        )return false;
        return true;
      });

      if(!available.length)break;

      const groups={common:[],rare:[],epic:[]};
      for(const augment of available){
        const rarity=
          augment.rarity==='epic'||augment.rarity==='epic'
            ?'epic'
            :augment.rarity==='rare'
              ?'rare'
              :'common';
        groups[rarity].push(augment);
      }

      const active=Object.keys(this.rarityWeights).filter(
        rarity=>groups[rarity].length>0
      );
      if(!active.length)break;

      const totalWeight=active.reduce(
        (sum,rarity)=>sum+this.rarityWeights[rarity],
        0
      );
      let roll=Math.random()*totalWeight;
      let selectedRarity=active[active.length-1];

      for(const rarity of active){
        roll-=this.rarityWeights[rarity];
        if(roll<=0){
          selectedRarity=rarity;
          break;
        }
      }

      const candidates=groups[selectedRarity];
      selected.push(
        candidates[Math.floor(Math.random()*candidates.length)]
      );
    }

    return selected.map(augment=>augment.id);
  }
});