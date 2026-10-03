

/* 플레이어 프로필 */
const PlayerProfileService=Object.freeze({
  highestRecordCharacter(account=AccountState.current){
    const characters=ProfileCharacterService.all();
    if(!characters.length)return null;

    const records=account?.characterRecords||{};
    let best=characters[0];
    let bestScore=-Infinity;

    for(const character of characters){
      const score=Math.max(0,Number(records[character.id])||0);
      if(score>bestScore){
        best=character;
        bestScore=score;
      }
    }

    return best?.id||null;
  },
  normalizeMainCharacter(account=AccountState.current){
    const explicit=
      account?.mainCharacterExplicit===true||
      account?.profile?.mainCharacterExplicit===true;
    const requested=String(
      account?.mainCharacterId||
      account?.profile?.mainCharacterId||
      ''
    );

    if(explicit&&ProfileCharacterService.has(requested)){
      return requested;
    }

    return (
      this.highestRecordCharacter(account)||
      ProfileCharacterService.all()[0]?.id||
      null
    );
  },
  isAutomatic(account=AccountState.current){
    return !(
      account?.mainCharacterExplicit===true||
      account?.profile?.mainCharacterExplicit===true
    );
  },
  snapshot(account=AccountState.current){
    const mainCharacterId=this.normalizeMainCharacter(account);
    const character=ProfileCharacterService.get(mainCharacterId);

    const detail=PlayerProfileDetailService.payload(account);
    const recordPoints=
      Math.max(
        0,
        Math.floor(
          Number(
            account?.characterRecords?.[
              mainCharacterId
            ]
          )||0
        )
      );

    return {
      accountId:String(account?.accountId||'guest'),
      displayName:String(account?.displayName||'게스트').trim().slice(0,24)||'게스트',
      isGuest:!!account?.isGuest,
      mainCharacterId,
      mainCharacterName:character?.name||mainCharacterId||'-',
      mainCharacterTitle:
        (
          CharacterRecordService.tier(
            recordPoints
          ).id==='master'&&
          Number(
            CharacterRecordService.tier(
              recordPoints
            ).masterLevel
          )>=5
        )
          ?CharacterTitleService.get(
            mainCharacterId
          )
          :'',
      color:character?.color||'#8292a0',
      image:ProfileCharacterImageService.source(mainCharacterId),
      recordPoints,
      characterRecords:Object.fromEntries(
        ProfileCharacterService.all().map(character=>[
          character.id,
          Math.max(
            0,
            Math.floor(
              Number(account?.characterRecords?.[character.id])||0
            )
          )
        ])
      ),
      characterStats:Object.fromEntries(
        ProfileCharacterService.all().map(character=>{
          const raw=
            account?.characterStats?.[character.id]||{};
          const plays=Math.max(
            0,
            Math.floor(Number(raw.plays)||0)
          );
          const wins=Math.max(
            0,
            Math.floor(Number(raw.wins)||0)
          );
          const losses=Math.max(
            0,
            Math.floor(
              Number(raw.losses)||
              Math.max(0,plays-wins)
            )
          );

          return [
            character.id,
            {
              plays,
              wins,
              losses
            }
          ];
        })
      ),
      overallStats:detail.overall,
      topRecords:detail.topRecords,
      mainCharacterAutomatic:this.isAutomatic(account)
    };
  },
  async setMainCharacter(characterId){
    const account=AccountState.current;
    if(!account||!ProfileCharacterService.has(characterId))return false;

    account.mainCharacterId=characterId;
    account.mainCharacterExplicit=true;
    account.profile={
      ...(account.profile||{}),
      mainCharacterId:characterId,
      mainCharacterExplicit:true
    };

    if(!account.isGuest){
      AccountState.current=
        await FirebaseProfilePersistenceService.save(
          account
        );
    }

    return true;
  }
});