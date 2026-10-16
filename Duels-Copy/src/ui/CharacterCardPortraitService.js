

/* 캐릭터 카드 배경 초점 */
const CharacterCardPortraitService=Object.freeze({
  cache:new Map(),
  fallback:Object.freeze({x:50,y:22}),
  directions:Object.freeze([
    Object.freeze({x:-14,y:0}),
    Object.freeze({x:14,y:0}),
    Object.freeze({x:0,y:-12}),
    Object.freeze({x:0,y:12}),
    Object.freeze({x:-10,y:-8}),
    Object.freeze({x:10,y:-8}),
    Object.freeze({x:-10,y:8}),
    Object.freeze({x:10,y:8})
  ]),
  direction(characterId){
    const id=String(characterId||'');
    let hash=2166136261;

    for(let index=0;index<id.length;index++){
      hash^=id.charCodeAt(index);
      hash=Math.imul(hash,16777619);
    }

    return this.directions[Math.abs(hash) % this.directions.length];
  },
  async focus(source,loadedImage=null){
    if(!source)return this.fallback;
    if(this.cache.has(source))return this.cache.get(source);

    const request=this.detect(source,loadedImage).catch(()=>this.fallback);
    this.cache.set(source,request);
    return request;
  },
  async load(source,loadedImage=null){
    if(
      loadedImage?.complete&&
      loadedImage.naturalWidth>0&&
      loadedImage.naturalHeight>0
    ){
      return loadedImage;
    }

    const image=new Image();
    image.crossOrigin='anonymous';
    image.decoding='async';
    image.src=source;
    await image.decode();
    return image;
  },
  silhouetteFocus(image){
    const width=128;
    const height=160;
    const canvas=document.createElement('canvas');
    canvas.width=width;
    canvas.height=height;

    const ctx=canvas.getContext('2d',{
      alpha:true,
      willReadFrequently:true
    });
    if(!ctx)return this.fallback;

    ctx.clearRect(0,0,width,height);

    const scale=Math.min(
      width/image.naturalWidth,
      height/image.naturalHeight
    );
    const drawWidth=image.naturalWidth*scale;
    const drawHeight=image.naturalHeight*scale;
    const drawX=(width-drawWidth)*.5;
    const drawY=(height-drawHeight)*.5;
    ctx.drawImage(image,drawX,drawY,drawWidth,drawHeight);

    const pixels=ctx.getImageData(0,0,width,height).data;
    let minX=width;
    let maxX=-1;
    let minY=height;
    let maxY=-1;
    let opaqueCount=0;

    for(let y=0;y<height;y++){
      for(let x=0;x<width;x++){
        const alpha=pixels[(y*width+x)*4+3];
        if(alpha<24)continue;

        opaqueCount++;
        if(x<minX)minX=x;
        if(x>maxX)maxX=x;
        if(y<minY)minY=y;
        if(y>maxY)maxY=y;
      }
    }

    if(
      opaqueCount<80||
      maxX<minX||
      maxY<minY
    ){
      return this.fallback;
    }

    const bodyWidth=maxX-minX+1;
    const bodyHeight=maxY-minY+1;

    const headBottom=Math.min(
      maxY,
      minY+Math.max(16,Math.round(bodyHeight*.38))
    );

    let weight=0;
    let weightedX=0;
    let weightedY=0;

    for(let y=minY;y<=headBottom;y++){
      const vertical=
        1.25-
        .45*((y-minY)/Math.max(1,headBottom-minY));

      for(let x=minX;x<=maxX;x++){
        const alpha=pixels[(y*width+x)*4+3]/255;
        if(alpha<.10)continue;

        const centerBias=
          .72+
          .28*Math.max(
            0,
            1-Math.abs(
              (x-(minX+maxX)*.5)/
              Math.max(1,bodyWidth*.5)
            )
          );

        const w=alpha*vertical*centerBias;
        weight+=w;
        weightedX+=x*w;
        weightedY+=y*w;
      }
    }

    if(weight<=0)return this.fallback;

    const headX=weightedX/weight;
    const headY=weightedY/weight;

    return {
      x:Math.max(16,Math.min(84,headX/width*100)),
      y:Math.max(7,Math.min(40,headY/height*100-2))
    };
  },
  async detect(source,loadedImage=null){
    const image=await this.load(source,loadedImage);
    return this.silhouetteFocus(image);
  },
  sync(root=document){
    if(!root)return;

    if(!DisplaySettings.state.characterCardIllustrations){
      for(const background of root.querySelectorAll('.char-card-portrait-bg')){
        background.remove();
      }
      return;
    }

    for(const card of root.querySelectorAll('.char-card[data-id]')){
      if(card.querySelector(':scope > .char-card-portrait-bg'))continue;
      const character=CharacterCardDataService.get(card.dataset.id);
      if(character)this.attach(card,character);
    }
  },
  animateEntrance(root=document){
    if(
      !root||
      !DisplaySettings.state.characterCardIllustrations
    )return false;

    const cards=root.matches?.('.char-card[data-id]')
      ?[root]
      :[
        ...root.querySelectorAll(
          '.char-card[data-id]'
        )
      ];

    let animated=0;

    for(const [index,card] of cards.entries()){
      const background=card.querySelector(
        ':scope > .char-card-portrait-bg.loaded'
      );
      if(!background)continue;

      const direction=this.direction(card.dataset.id);

      for(const animation of background.getAnimations?.()||[]){
        if(animation.id==='duels-portrait-enter'){
          animation.cancel();
        }
      }

      const animation=background.animate(
        [
          {
            opacity:0,
            transform:
              `translate(${direction.x}%, ${direction.y}%) scale(1.075)`
          },
          {
            opacity:.75,
            transform:
              'translate(0, 0) scale(1.055)'
          }
        ],
        {
          duration:420,
          delay:index*10,
          easing:'cubic-bezier(.2,.76,.24,1)',
          fill:'both'
        }
      );

      animation.id='duels-portrait-enter';
      animation.addEventListener(
        'finish',
        ()=>animation.cancel(),
        {once:true}
      );

      animated++;
    }

    return animated>0;
  },
  attach(card,character,onReady=null){
    if(
      !card||
      !character||
      !DisplaySettings.state.characterCardIllustrations||
      card.querySelector(':scope > .char-card-portrait-bg')
    )return null;

    const source=ProfileCharacterImageService.source(character.id);
    if(!source)return;

    const direction=this.direction(character.id);
    const background=document.createElement('div');
    background.className='char-card-portrait-bg';
    background.style.backgroundImage=`url("${source}")`;
    background.style.setProperty('--portrait-focus-x','50%');
    background.style.setProperty('--portrait-focus-y','22%');
    background.style.setProperty('--portrait-enter-x',`${direction.x}%`);
    background.style.setProperty('--portrait-enter-y',`${direction.y}%`);

    const image=new Image();
    image.crossOrigin='anonymous';
    image.decoding='async';
    image.src=source;

    image.addEventListener('load',()=>{
      if(!background.isConnected)return;

      this.focus(source,image).then(focus=>{
        if(!background.isConnected)return;
        const focusX=Math.max(22,Math.min(78,focus.x));
        const focusY=Math.max(10,Math.min(30,focus.y-1));
        background.style.setProperty('--portrait-focus-x',`${focusX}%`);
        background.style.setProperty('--portrait-focus-y',`${focusY}%`);
      });

      requestAnimationFrame(()=>{
        if(!background.isConnected)return;
        background.classList.add('loaded');
        onReady?.(background,card);
      });
    },{once:true});

    image.addEventListener('error',()=>{
      background.remove();
    },{once:true});

    card.prepend(background);
    return background;
  }
});