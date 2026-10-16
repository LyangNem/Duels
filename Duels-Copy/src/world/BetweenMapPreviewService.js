


const BetweenMapPreviewService=Object.freeze({
  map(mapId){
    if(!DebugMapService.maps.length){
      DebugMapService.rebuild();
    }
    return DebugMapService.maps.find(
      map=>map?.id===String(mapId||'')
    )||null;
  },
  render(mapId){
    const wrap=document.getElementById(
      'between-next-map-preview'
    );
    const canvas=document.getElementById(
      'between-next-map-canvas'
    );
    const label=document.getElementById(
      'between-next-map-label'
    );
    if(!wrap||!canvas)return false;

    const map=this.map(mapId);
    if(!map){
      wrap.classList.remove('show');
      return false;
    }

    const width=140;
    const worldWidth=Math.max(
      1,
      Number(map.worldWidth)||1
    );
    const worldHeight=Math.max(
      1,
      Number(map.worldHeight)||1
    );
    const height=Math.max(
      1,
      Math.round(
        width*worldHeight/worldWidth
      )
    );

    canvas.width=width;
    canvas.height=height;
    canvas.style.height=`${height}px`;

    const ctx=canvas.getContext('2d');
    if(!ctx)return false;

    ctx.clearRect(0,0,width,height);
    ctx.fillStyle='rgba(0,0,0,.55)';
    ctx.fillRect(0,0,width,height);

    const sx=width/worldWidth;
    const sy=height/worldHeight;
    ctx.fillStyle='rgba(100,160,255,.4)';
    for(const wall of map.walls||[]){
      ctx.fillRect(
        wall.x*sx,
        wall.y*sy,
        Math.max(1,wall.w*sx),
        Math.max(1,wall.h*sy)
      );
    }

    ctx.strokeStyle='rgba(100,160,255,.3)';
    ctx.lineWidth=1;
    ctx.strokeRect(.5,.5,width-1,height-1);

    if(label){
      label.textContent=`다음 맵 · ${map.name||'알 수 없음'}`;
    }
    wrap.classList.add('show');
    return true;
  }
});