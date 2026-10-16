

/* 캐릭터 프로필 시각화 */
const CharacterPortraitService=Object.freeze({
  imageSource(character){
    if(!character)return '';

    const explicitKeys=[
      'profileImage',
      'portrait',
      'portraitUrl',
      'image',
      'imageUrl',
      'icon',
      'iconUrl',
      'sprite'
    ];

    for(const key of explicitKeys){
      const value=character[key];
      if(typeof value==='string'&&value.trim())return value.trim();
    }

    if(ProfileCharacterService.has(character.id)){
      return ProfileCharacterImageService.source(character.id);
    }

    return '';
  },
  create(character,className=''){
    const node=document.createElement('div');
    node.className=className;

    const color=character?.color||'#8292a0';
    node.style.setProperty('--profile-color',color);

    const source=this.imageSource(character);

    if(source){
      const image=document.createElement('img');
      image.src=source;
      image.alt='';
      image.draggable=false;
      image.loading='eager';

      image.addEventListener('load',()=>{
        node.classList.add('has-image');
        node.classList.remove('color-only');
        node.style.background='#091018';
      },{once:true});

      image.addEventListener('error',()=>{
        image.remove();
        node.classList.remove('has-image');
        node.classList.add('color-only');
        node.style.background=color;
      },{once:true});

      node.style.background='#091018';
      node.appendChild(image);
    }else{
      node.classList.add('color-only');
      node.style.background=color;
    }

    return node;
  }
});