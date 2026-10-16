

/* 플레이어 프로필 상세 */
const PlayerProfileDetailService=Object.freeze({
  overallFromAccount(account){
    const stats=account?.characterStats||{};
    let plays=0;
    let wins=0;
    let losses=0;

    for(const character of ProfileCharacterService.all()){
      const raw=stats[character.id]||{};
      const characterPlays=Math.max(0,Math.floor(Number(raw.plays)||0));
      const characterWins=Math.max(0,Math.floor(Number(raw.wins)||0));
      const characterLosses=Math.max(
        0,
        Math.floor(
          Number(raw.losses)||
          Math.max(0,characterPlays-characterWins)
        )
      );

      plays+=characterPlays;
      wins+=characterWins;
      losses+=characterLosses;
    }

    return {
      plays,
      wins,
      losses,
      winRate:plays>0?wins/plays*100:0
    };
  },
  topRecordsFromAccount(account,limit=3){
    const records=account?.characterRecords||[];
    const entries=[];

    const characters=ProfileCharacterService.all();

    for(let index=0;index<characters.length;index++){
      const character=characters[index];
      const score=Math.max(
        0,
        Math.floor(Number(records[character.id])||0)
      );

      entries.push({
        characterId:character.id,
        characterName:character.name,
        score,
        order:index
      });
    }

    entries.sort((a,b)=>{
      if(b.score!==a.score)return b.score-a.score;
      return a.order-b.order;
    });

    return entries.slice(0,Math.max(0,Number(limit)||0));
  },
  payload(account=AccountState.current){
    return {
      overall:this.overallFromAccount(account),
      topRecords:this.topRecordsFromAccount(account,3)
    };
  },
  normalize(profile){
    const overall=profile?.overallStats||{};
    const topRecords=Array.isArray(profile?.topRecords)?profile.topRecords:[];

    return {
      overall:{
        plays:Math.max(0,Math.floor(Number(overall.plays)||0)),
        wins:Math.max(0,Math.floor(Number(overall.wins)||0)),
        losses:Math.max(0,Math.floor(Number(overall.losses)||0)),
        winRate:Math.max(0,Number(overall.winRate)||0)
      },
      topRecords:topRecords
        .filter(entry=>ProfileCharacterService.has(entry?.characterId))
        .map(entry=>({
          characterId:entry.characterId,
          characterName:
            ProfileCharacterService.get(entry.characterId)?.name||
            String(entry.characterName||entry.characterId),
          score:Math.max(0,Math.floor(Number(entry.score)||0))
        }))
        .sort((a,b)=>b.score-a.score)
        .slice(0,3)
    };
  }
});