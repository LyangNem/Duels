

const CharacterRecordService=Object.freeze({
  rankingCache:new Map(),
  rankingCacheMs:30000,
  allRankingState:{characters:{},loadedAt:0,promise:null},
  clearRankingCache(){
    this.rankingCache.clear();
    this.allRankingState.characters={};
    this.allRankingState.loadedAt=0;
    this.allRankingState.promise=null;
    return true;
  },
  masteryTiers:Object.freeze([
    Object.freeze({id:'master',name:'마스터 I',min:12000,gradient:'linear-gradient(135deg,#ffe34f,#ff9d38,#a86cff,#6f3dd6)',glow:'rgba(205,120,255,.72)',text:'#f0c3ff'}),
    Object.freeze({id:'platinum',name:'플레티넘',min:8000,gradient:'linear-gradient(135deg,#76d8ff,#9eeeff,#aaf2c1,#66d991)',glow:'rgba(105,225,205,.72)',text:'#8fe8cf'}),
    Object.freeze({id:'diamond',name:'다이아',min:5000,gradient:'linear-gradient(135deg,#1769d2,#4aa8ff,#9de8ff,#2476df)',glow:'rgba(45,145,255,.72)',text:'#68baff'}),
    Object.freeze({id:'gold',name:'골드',min:3000,gradient:'linear-gradient(135deg,#9b6500,#ffe066,#c99200)',glow:'rgba(255,205,45,.58)',text:'#ffd84c'}),
    Object.freeze({id:'silver',name:'실버',min:1500,gradient:'linear-gradient(135deg,#7d8792,#eef4fa,#89939d)',glow:'rgba(210,225,240,.52)',text:'#dce8f2'}),
    Object.freeze({id:'bronze',name:'브론즈',min:500,gradient:'linear-gradient(135deg,#5f2f18,#a95625,#d07a3b,#713419)',glow:'rgba(184,86,37,.58)',text:'#d98248'}),
    Object.freeze({id:'none',name:'없음',min:0,gradient:'linear-gradient(135deg,#27313d,#3a4654)',glow:'rgba(80,100,120,.12)',text:'#7e8995'})
  ]),
  normalizeAllRankings(payload){
    const source=
      payload?.characters&&
      typeof payload.characters==='object'&&
      !Array.isArray(payload.characters)
        ?payload.characters
        :{};

    const characters={};

    for(const [characterId,entries] of Object.entries(source)){
      if(!ProfileCharacterService.has(characterId))continue;
      characters[characterId]=this.normalizeRanking(entries,characterId);
    }

    return characters;
  },
  refreshTopPlayerBadges(root=document){
    const account=AccountState.current;
    const accountId=String(
      account?.firebaseUid||
      account?.accountId||
      ''
    ).trim();
    const enabled=!!accountId&&!account?.isGuest;

    for(const card of root.querySelectorAll?.('.char-card[data-id]')||[]){
      const characterId=card.dataset.id;
      const topAccountId=String(
        this.allRankingState.characters?.[characterId]?.[0]?.accountId||
        ''
      ).trim();
      const shouldShow=enabled&&topAccountId===accountId;
      let badge=card.querySelector(':scope > .char-top-player-badge');

      if(shouldShow){
        if(!badge){
          badge=document.createElement('div');
          badge.className='char-top-player-badge';
          badge.textContent='TOP-PLAYER';
          card.appendChild(badge);
        }
        badge.hidden=false;
      }else if(badge){
        badge.remove();
      }

      CharacterCardLayoutService.schedule(
        card
      );
    }
  },
  async loadAllRankings(force=false){
    const state=this.allRankingState;
    const now=Date.now();

    if(
      !force&&
      state.loadedAt&&
      now-state.loadedAt<this.rankingCacheMs
    ){
      this.refreshTopPlayerBadges();
      return state.characters;
    }

    if(state.promise&&!force)return state.promise;

    state.promise=(async()=>{
      const body=await AccountService.request(
        '/ranking/characters?limit=3',
        {method:'GET'}
      );

      const characters=this.normalizeAllRankings(body);
      state.characters=characters;
      state.loadedAt=Date.now();

      for(const [characterId,entries] of Object.entries(characters)){
        this.rankingCache.set(characterId,{
          entries,
          loadedAt:state.loadedAt
        });
      }

      this.refreshTopPlayerBadges();
      return characters;
    })();

    try{
      return await state.promise;
    }finally{
      state.promise=null;
    }
  },
  stats(
    characterId,
    account=AccountState.current
  ){
    const raw=
      account?.characterStats?.[characterId]||{};
    const plays=Math.max(
      0,
      Math.floor(Number(raw.plays)||0)
    );
    const wins=Math.max(
      0,
      Math.floor(Number(raw.wins)||0)
    );
    return {
      plays,
      wins,
      losses:Math.max(
        0,
        Math.floor(
          Number(raw.losses)||
          Math.max(0,plays-wins)
        )
      ),
      winRate:plays>0
        ?wins/plays*100
        :0
    };
  },
  points(
    characterId,
    account=AccountState.current
  ){
    return Math.max(
      0,
      Math.floor(
        Number(
          account?.characterRecords?.[
            characterId
          ]
        )||0
      )
    );
  },
  roman(value){
    return ['', 'I', 'II', 'III', 'IV', 'V'][Math.max(1,Math.min(5,Math.floor(Number(value)||1)))]||'I';
  },
  masterStage(points){
    const value=Math.max(0,Math.round(Number(points)||0));
    if(value>=20000)return {level:5,roman:'V',min:20000};
    if(value>=18000)return {level:4,roman:'IV',min:18000};
    if(value>=16000)return {level:3,roman:'III',min:16000};
    if(value>=14000)return {level:2,roman:'II',min:14000};
    if(value>=12000)return {level:1,roman:'I',min:12000};
    return null;
  },
  tier(points){
    const value=Math.max(0,Math.round(Number(points)||0));
    const master=this.masteryTiers.find(item=>item.id==='master');
    const stage=this.masterStage(value);
    if(master&&stage)return {...master,name:`마스터 ${stage.roman}`,min:stage.min,masterLevel:stage.level,masterRoman:stage.roman};
    return this.masteryTiers.find(item=>value>=item.min)||this.masteryTiers[this.masteryTiers.length-1];
  },
  applyMasterStageBadge(element,points,className='master-stage-badge'){
    if(!element)return null;
    const tier=this.tier(points);
    let badge=element.querySelector(`:scope > .${className}`);
    if(tier.id!=='master'){badge?.remove();return null}
    if(!badge){badge=document.createElement('span');badge.className=className;element.appendChild(badge)}
    badge.textContent=tier.masterRoman||this.roman(tier.masterLevel);
    return badge;
  },

  applyMasteryStyle(
    element,
    characterId,
    className,
    account=AccountState.current
  ){
    if(!element||!characterId)return null;

    const points=account?.isGuest
      ?0
      :this.points(
        characterId,
        account
      );
    const tier=this.tier(points);

    if(className)element.classList.add(className);
    element.dataset.masteryTier=tier.id;
    element.style.setProperty('--mastery-gradient',tier.gradient);
    element.style.setProperty('--mastery-glow',tier.glow);
    return tier;
  },
  applyCardStyle(
    card,
    characterId,
    account=AccountState.current
  ){
    if(!card||!characterId)return;

    // 기본 카드에는 레코드 텍스트를 표시하지 않는다.
    card.querySelector(':scope > .char-mastery')?.remove();

    // 게스트도 일반 계정의 0점과 완전히 같은 none 티어 외곽선을 사용한다.
    const points=
      account?.isGuest
        ?0
        :this.points(
          characterId,
          account
        );
    const tier=this.tier(points);

    card.classList.add('mastery-card');
    card.dataset.masteryTier=tier.id;
    card.style.setProperty(
      '--mastery-gradient',
      tier.gradient
    );
    card.style.setProperty(
      '--mastery-glow',
      tier.glow
    );
    const masterLevel=
      tier.id==='master'
        ?Math.max(
          1,
          Math.min(
            5,
            Number(tier.masterLevel)||1
          )
        )
        :0;
    card.dataset.masterLevel=String(masterLevel);
    this.applyMasterStageBadge(
      card,
      points,
      'master-card-stage'
    );
    CharacterTitleService.attach(
      card,
      characterId,
      points
    );
  },
  applyHudIconStyle(
    icon,
    characterId,
    account=AccountState.current
  ){
    return this.applyMasteryStyle(
      icon,
      characterId,
      'mastery-icon',
      account
    );
  },
  normalizeRanking(payload,characterId){
    const source=
      Array.isArray(payload)?payload:
      Array.isArray(payload?.entries)?payload.entries:
      Array.isArray(payload?.ranking)?payload.ranking:
      Array.isArray(payload?.rankings)?payload.rankings:
      Array.isArray(payload?.data)?payload.data:
      [];

    const seen=new Set();
    const result=[];

    for(const raw of source){
      const accountId=String(
        raw?.accountId??
        raw?.id??
        raw?.userId??
        ''
      )
        .replace(/[\u0000-\u001f\u007f]/g,'')
        .trim()
        .slice(0,128);
      if(!accountId||seen.has(accountId))continue;
      seen.add(accountId);

      const nested=
        raw?.characterRecords&&typeof raw.characterRecords==='object'
          ?raw.characterRecords[characterId]
          :undefined;

      result.push({
        accountId,
        displayName:String((raw?.displayName??raw?.name??accountId)||'이름 없음')
          .replace(/[\u0000-\u001f\u007f]/g,'')
          .trim()||'이름 없음',
        score:Math.max(
          0,
          Math.floor(Number(raw?.score??raw?.points??raw?.masteryPoints??nested)||0)
        )
      });
    }

    return result
      .sort((a,b)=>b.score-a.score||a.displayName.localeCompare(b.displayName,'ko'))
      .slice(0,3);
  },
  async ranking(characterId,force=false){
    if(!ProfileCharacterService.has(characterId))throw new Error('존재하지 않는 캐릭터입니다.');

    const cached=this.rankingCache.get(characterId);
    if(!force&&cached&&Date.now()-cached.loadedAt<this.rankingCacheMs){
      return cached.entries;
    }

    const body=await AccountService.request('/ranking/character',{
      method:'POST',
      body:JSON.stringify({
        charId:characterId,
        limit:3
      })
    });

    const entries=this.normalizeRanking(body,characterId);
    this.rankingCache.set(characterId,{entries,loadedAt:Date.now()});
    return entries;
  },
  resetCardView(card){
    if(!card)return false;

    card
      .querySelector(
        ':scope > .char-record-detail'
      )
      ?.remove();

    delete card.dataset.detailMode;
    delete card.dataset.rankingCharacterId;
    card.classList.remove(
      'record-detail-open',
      'record-ranking-open'
    );

    return true;
  },

  resetGridViews(grid){
    if(!grid)return false;

    for(
      const card of
      grid.querySelectorAll(
        ':scope > .char-card[data-id]'
      )
    ){
      this.resetCardView(card);
    }

    return true;
  },

  detail(card){
    let detail=card.querySelector(':scope > .char-record-detail');
    if(detail)return detail;

    detail=document.createElement('div');
    detail.className='char-record-detail';
    card.appendChild(detail);
    return detail;
  },
  renderStats(card,character){
    const detail=this.detail(card);
    detail.dataset.detailMode='stats';
    detail.replaceChildren();

    const account=
      card._recordAccountData||
      AccountState.current;

    if(account?.isGuest){
      const title=document.createElement('div');
      title.className='char-record-detail-title';
      title.textContent=character.name;

      const empty=document.createElement('div');
      empty.className='char-record-detail-empty';
      empty.textContent='로그인 필요';

      const hint=document.createElement('div');
      hint.className='char-record-detail-hint';
      hint.textContent='우클릭: 캐릭터 랭킹';

      detail.append(title,empty,hint);
      return;
    }

    const stats=this.stats(
      character.id,
      account
    );
    const points=this.points(
      character.id,
      account
    );
    const tier=this.tier(points);

    const title=document.createElement('div');
    title.className='char-record-detail-title';
    title.textContent=character.name;
    detail.appendChild(title);

    const row=(label,value)=>{
      const line=document.createElement('div');
      line.className='char-record-detail-row';
      const key=document.createElement('b');
      key.textContent=label;
      const val=document.createElement('span');
      val.textContent=value;
      line.append(key,val);
      detail.appendChild(line);
    };

    row('플레이',`${stats.plays}회`);
    row('승률',`${stats.plays?stats.winRate.toFixed(1):'0.0'}%`);

    const record=document.createElement('div');
    record.className='char-record-detail-record';

    const recordTop=document.createElement('div');
    recordTop.className='char-record-detail-record-top';

    const recordLabel=document.createElement('b');
    recordLabel.textContent='레코드';

    const recordTier=document.createElement('span');
    recordTier.textContent=tier.name;

    const recordScore=document.createElement('div');
    recordScore.className='char-record-detail-record-score';
    recordScore.textContent=String(points);

    recordTop.append(recordLabel,recordTier);
    record.append(recordTop,recordScore);
    detail.appendChild(record);

    const hint=document.createElement('div');
    hint.className='char-record-detail-hint';
    hint.textContent='우클릭: 캐릭터 랭킹';
    detail.appendChild(hint);
  },
  async renderRanking(card,character){
    const detail=this.detail(card);
    detail.dataset.detailMode='ranking';
    const requestId=`${character.id}:${performance.now()}`;
    detail.dataset.requestId=requestId;
    detail.replaceChildren();

    const title=document.createElement('div');
    title.className='char-record-detail-title ranking-title';

    const name=document.createElement('div');
    name.textContent=character.name;

    const top=document.createElement('div');
    top.textContent='TOP';

    title.append(name,top);
    detail.appendChild(title);

    const loading=document.createElement('div');
    loading.className='char-record-detail-empty';
    loading.textContent='랭킹 불러오는 중…';
    detail.appendChild(loading);

    try{
      const entries=await this.ranking(character.id);
      if(detail.dataset.requestId!==requestId||card.dataset.detailMode!=='ranking')return;

      detail.replaceChildren(title);

      if(!entries.length){
        const empty=document.createElement('div');
        empty.className='char-record-detail-empty';
        empty.textContent='등록된 랭킹이 없습니다.';
        detail.appendChild(empty);
      }else{
        const list=document.createElement('div');
        list.className='char-record-ranking-list';

        entries.forEach((entry,index)=>{
          const row=document.createElement('div');
          row.className='char-record-ranking-row';

          const tier=this.tier(entry.score);
          const borderColor=tier.id==='none'?'#3d4650':tier.text;
          const borderGlow=tier.id==='none'?'rgba(38,46,56,.08)':tier.glow;
          const borderGradient=tier.id==='none'?'linear-gradient(135deg,#27313d,#3a4654)':tier.gradient;
          row.dataset.recordTier=tier.id;
          row.style.setProperty('--ranking-tier-color',borderColor);
          row.style.setProperty('--ranking-tier-glow',borderGlow);
          row.style.setProperty('--ranking-tier-gradient',borderGradient);

          const rank=document.createElement('span');
          rank.className='char-record-ranking-rank';
          rank.textContent=String(index+1);

          const name=document.createElement('span');
          name.className='char-record-ranking-name';
          name.textContent=entry.displayName;

          const score=document.createElement('span');
          score.className='char-record-ranking-score';
          score.textContent=String(entry.score);

          row.append(rank,name,score);
          list.appendChild(row);
        });

        detail.appendChild(list);
      }

      const hint=document.createElement('div');
      hint.className='char-record-detail-hint';
      hint.textContent='우클릭: 카드 앞면';
      detail.appendChild(hint);
    }catch(error){
      if(detail.dataset.requestId!==requestId)return;
      detail.replaceChildren(title);

      const empty=document.createElement('div');
      empty.className='char-record-detail-empty';
      empty.textContent='랭킹을 불러오지 못했습니다.';
      detail.appendChild(empty);
    }
  },
  cycle(card){
    if(!card)return false;
    const character=CharacterCardDataService.get(card.dataset.id);
    if(!character)return false;

    if(!card.classList.contains('record-detail-open')){
      card.classList.add('record-detail-open');
      card.dataset.detailMode='stats';
      this.renderStats(card,character);
      return true;
    }

    if(card.dataset.detailMode==='stats'){
      card.dataset.detailMode='ranking';
      this.renderRanking(card,character);
      return true;
    }

    card.classList.remove('record-detail-open');
    delete card.dataset.detailMode;
    const detail=card.querySelector(':scope > .char-record-detail');
    if(detail)delete detail.dataset.detailMode;
    return true;
  }
});