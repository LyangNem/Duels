

const PlayerProfileCardService=Object.freeze({
  mode(card){
    return card?.dataset?.profileMode||'base';
  },
  setMode(card,mode){
    if(!card)return;
    card.dataset.profileMode=mode;
    card.classList.toggle('profile-detail-open',mode!=='base');
  },
  detail(card){
    let detail=card.querySelector(':scope > .player-profile-detail');
    if(detail)return detail;

    detail=document.createElement('div');
    detail.className='player-profile-detail';
    card.appendChild(detail);
    return detail;
  },
  row(label,value){
    const row=document.createElement('div');
    row.className='player-profile-stat-row';

    const key=document.createElement('b');
    key.textContent=label;

    const val=document.createElement('span');
    val.textContent=value;

    row.append(key,val);
    return row;
  },
  renderStats(card,profile){
    const detail=this.detail(card);
    detail.dataset.profileDetail='stats';
    detail.replaceChildren();

    const title=document.createElement('div');
    title.className='player-profile-detail-title';
    title.textContent=profile.displayName||'플레이어';

    const normalized=PlayerProfileDetailService.normalize(profile);
    const stats=normalized.overall;

    detail.append(
      title,
      this.row('플레이',`${stats.plays}회`),
      this.row('승리',`${stats.wins}회`),
      this.row('패배',`${stats.losses}회`),
      this.row('승률',`${stats.plays?stats.winRate.toFixed(1):'0.0'}%`)
    );

    const hint=document.createElement('div');
    hint.className='player-profile-detail-hint';
    hint.textContent='우클릭: 상위 레코드';
    detail.appendChild(hint);
  },
  recordRow(entry,index){
    const row=document.createElement('div');
    row.className='player-profile-record-row';

    const tier=CharacterRecordService.tier(entry.score);
    row.dataset.recordTier=tier.id;
    row.style.setProperty(
      '--profile-record-gradient',
      tier.id==='none'
        ?'linear-gradient(135deg,#27313d,#3a4654)'
        :tier.gradient
    );
    row.style.setProperty(
      '--profile-record-glow',
      tier.id==='none'?'rgba(38,46,56,.08)':tier.glow
    );

    const rank=document.createElement('span');
    rank.className='player-profile-record-rank';
    rank.textContent=String(index+1);

    const character=document.createElement('span');
    character.className='player-profile-record-name';
    character.textContent=entry.characterName;

    const score=document.createElement('span');
    score.className='player-profile-record-score';
    score.textContent=String(entry.score);

    row.append(rank,character,score);
    return row;
  },
  renderRecords(card,profile){
    const detail=this.detail(card);
    detail.dataset.profileDetail='records';
    detail.replaceChildren();

    const title=document.createElement('div');
    title.className='player-profile-detail-title records-title';

    const name=document.createElement('div');
    name.textContent=profile.displayName||'플레이어';

    const top=document.createElement('div');
    top.textContent='TOP RECORD';

    title.append(name,top);
    detail.appendChild(title);

    const records=PlayerProfileDetailService.normalize(profile).topRecords;

    if(records.length){
      const list=document.createElement('div');
      list.className='player-profile-record-list';

      records.forEach((entry,index)=>{
        list.appendChild(this.recordRow(entry,index));
      });

      detail.appendChild(list);
    }else{
      const empty=document.createElement('div');
      empty.className='player-profile-detail-empty';
      empty.textContent='레코드가 없습니다.';
      detail.appendChild(empty);
    }

    const hint=document.createElement('div');
    hint.className='player-profile-detail-hint';
    hint.textContent='우클릭: 프로필';
    detail.appendChild(hint);
  },
  cycle(card,profile){
    if(!card||!profile)return false;
    const mode=this.mode(card);

    if(mode==='base'){
      this.setMode(card,'stats');
      this.renderStats(card,profile);
      return true;
    }

    if(mode==='stats'){
      this.setMode(card,'records');
      this.renderRecords(card,profile);
      return true;
    }

    this.setMode(card,'base');
    const detail=card.querySelector(':scope > .player-profile-detail');
    if(detail)detail.remove();
    return true;
  },
  bind(card,profile){
    if(!card)return;
    card._profileDetailData=profile;

    if(card.dataset.profileContextBound==='true')return;
    card.dataset.profileContextBound='true';

    card.addEventListener('contextmenu',event=>{
      event.preventDefault();
      event.stopPropagation();
      this.cycle(card,card._profileDetailData);
    });
  }
});