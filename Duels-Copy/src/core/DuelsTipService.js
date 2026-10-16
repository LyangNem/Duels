
const DuelsTipService={
  tips:[],
  currentIndex:-1,
  normalize(source){
    const raw=Array.isArray(source)?source:source?.tips;
    if(!Array.isArray(raw))return [];
    return raw
      .map(item=>typeof item==='string'?item:(item&&typeof item==='object'?item.text:''))
      .map(text=>String(text||'').trim())
      .filter(Boolean);
  },
  render(message=''){
    const text=this.tips[this.currentIndex]||message||'';
    document.querySelectorAll('[data-duels-tip]').forEach(button=>{
      button.hidden=!text;
      const target=button.querySelector('[data-duels-tip-text]');
      if(target)target.textContent=text;
    });
  },
  selectedCharacterName(){
    const selectedCard=
      document.querySelector(
        '#scr-between:not(.hidden) #between-char-grid .char-card.sel[data-id]'
      )||
      document.querySelector(
        '#scr-select:not(.hidden) .char-card.sel[data-id]'
      );
    const id=String(selectedCard?.dataset?.id||'').trim();
    if(!id)return '';
    const character=GAME_DATA?.characters?.[id]||null;
    return String(character?.name||'').trim();
  },
  randomIndex(indices){
    const pool=(Array.isArray(indices)?indices:[])
      .filter(index=>Number.isInteger(index)&&index>=0&&index<this.tips.length);
    if(!pool.length)return -1;
    const alternatives=pool.filter(index=>index!==this.currentIndex);
    const source=alternatives.length?alternatives:pool;
    return source[Math.floor(Math.random()*source.length)];
  },
  next(){
    const length=this.tips.length;
    if(!length){this.currentIndex=-1;this.render();return;}
    if(length===1){this.currentIndex=0;this.render();return;}

    let next=-1;
    const characterName=this.selectedCharacterName();
    if(characterName&&Math.random()<0.2){
      const characterTips=[];
      for(let index=0;index<length;index++){
        if(this.tips[index].includes(characterName))characterTips.push(index);
      }
      next=this.randomIndex(characterTips);
    }

    if(next<0){
      next=this.randomIndex(Array.from({length},(_,index)=>index));
    }
    this.currentIndex=next;
    this.render();
  },
  async fetchSource(url){
    const separator=url.includes('?')?'&':'?';
    const response=await fetch(`${url}${separator}t=${Date.now()}`,{
      cache:'no-store',
      mode:'cors',
      credentials:'omit'
    });
    if(!response.ok)throw new Error(`HTTP ${response.status}`);
    const text=(await response.text()).replace(/^\uFEFF/,'').trim();
    if(!text)throw new Error('EMPTY');
    const parsed=JSON.parse(text);
    const tips=this.normalize(parsed);
    if(!tips.length)throw new Error('NO TIPS');
    return tips;
  },
  async load(){
    this.tips=[];
    this.currentIndex=-1;
    this.render('팁 불러오는 중...');
    for(const url of DUELS_TIPS_URLS){
      try{
        this.tips=await this.fetchSource(url);
        this.next();
        return;
      }catch(error){
        console.warn('[DuelsTipService] tip.json load failed:',url,error);
      }
    }
    this.tips=[];
    this.currentIndex=-1;
    this.render('팁을 불러오지 못했습니다. 클릭해서 다시 시도');
  },
  bind(){
    document.querySelectorAll('[data-duels-tip]').forEach(button=>{
      button.addEventListener('click',()=>{
        if(this.tips.length)this.next();
        else this.load().catch(()=>{});
      });
    });
  }
};