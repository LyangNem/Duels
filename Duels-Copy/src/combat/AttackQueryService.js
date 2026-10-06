

const AttackQueryService=Object.freeze({
  rangeRank(tag){
    return GAME_DATA.ranges.findIndex(
      item=>item.tag===tag
    );
  },
  matchesTags(tags,selector){
    if(!selector)return false;
    const resolvedTags=
      tags instanceof Set
        ?tags
        :new Set(tags||[]);

    if(Array.isArray(selector.any)){
      return selector.any.some(
        item=>this.matchesTags(
          resolvedTags,
          item
        )
      );
    }

    for(const tag of selector.tags||[]){
      if(!resolvedTags.has(tag)){
        return false;
      }
    }

    return true;
  },
  matchesSelector(spec,selector){
    if(!spec||!selector)return false;

    if(
      !this.matchesTags(
        TagService.attackTags(spec),
        selector
      )
    )return false;

    if(selector.maxRangeTag){
      const actual=
        this.rangeRank(
          TagService.rangeTag(
            TagService.attackRange(spec)
          )
        );
      const maximum=
        this.rangeRank(
          selector.maxRangeTag
        );

      if(
        actual<0||
        maximum<0||
        actual>maximum
      )return false;
    }

    return true;
  },
  minimumCost(character,tag='공격'){
    let minimum=Infinity;

    for(const attack of Object.values(
      character?.attacks||{}
    )){
      if(!TagService.hasAttack(attack,tag))continue;

      minimum=Math.min(
        minimum,
        Math.max(0,Number(attack.cost)||0)
      );
    }

    return Number.isFinite(minimum)
      ?minimum
      :0;
  }
});