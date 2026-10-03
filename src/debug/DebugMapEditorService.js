

const DebugMapEditorService={
  active:false,
  mapId:null,
  drag:null,
  hover:null,
  previousSpectating:false,
  previousSpectator:null,
  overlay:null,
  frame:0,
  lastFrameAt:0,
  symmetry:{
    diagonal:false
  },
  canEdit(mapId=DebugMapService.currentId){
    return (
      !!DebugMapService.record(mapId)&&
      String(mapId)!=='training-tilemap'
    );
  },
  record(){
    return DebugMapService.record(
      this.mapId
    );
  },
  modeLabel(mode){
    return (
      OfficialMapDataService
        .modeSpecs[mode]?.label||
      mode
    );
  },
  start(mapId){
    const id=String(mapId||'');
    if(!this.canEdit(id))return false;
    DebugMapService.set(id);

    this.active=true;
    this.mapId=id;
    this.drag=null;
    this.hover=null;

    this.previousSpectating=
      !!Training.spectating;
    this.previousSpectator={
      ...Training.spectator
    };

    Training.spectating=true;
    Training.spectator.followPid=null;
    Training.spectator.zoom=1;
    Training.spectator.dashRemaining=0;
    Training.clampSpectatorPoint(
      WorldBoundsService.width()/2,
      WorldBoundsService.height()/2
    );
    Training.keys.clear();

    this.mountOverlay();
    DebugPanel.close();
    this.startLoop();
    return true;
  },
  stop({reopen=true}={}){
    if(!this.active)return false;

    this.active=false;
    cancelAnimationFrame(this.frame);
    this.frame=0;
    this.lastFrameAt=0;
    this.drag=null;
    this.hover=null;
    this.overlay?.remove();
    this.overlay=null;

    Training.keys.clear();
    Training.spectating=
      this.previousSpectating;

    if(this.previousSpectator){
      Object.assign(
        Training.spectator,
        this.previousSpectator
      );
    }

    if(reopen&&DebugAccessService.canUse()){
      DebugPanel.open=true;
      DebugPanel.tab='map';
      DebugPanel.render();
    }
    return true;
  },
  startLoop(){
    cancelAnimationFrame(this.frame);
    this.frame=0;
    this.lastFrameAt=performance.now();

    const tick=now=>{
      if(!this.active){
        this.frame=0;
        return;
      }

      const dt=Math.max(
        0,
        Math.min(
          50,
          now-this.lastFrameAt
        )
      );
      this.lastFrameAt=now;

      const frameScale=
        dt/Math.max(
          1,
          GAME_DATA.frameMs
        );

      this.update(
        dt,
        frameScale
      );

      if(
        Training.canvas||
        document.getElementById(
          'gameCanvas'
        )
      ){
        Training.draw();
      }

      this.frame=requestAnimationFrame(tick);
    };

    this.frame=requestAnimationFrame(tick);
  },
  oppositeCell(
    record,
    row,
    col
  ){
    return {
      row:
        record.rows-1-row,
      col:
        record.cols-1-col
    };
  },
  symmetryEnabled(){
    return (
      this.symmetry
        .diagonal===true
    );
  },
  symmetricCells(
    record,
    row,
    col
  ){
    const result=[
      {row,col}
    ];

    if(
      !this.symmetryEnabled()
    ){
      return result;
    }

    const opposite=
      this.oppositeCell(
        record,
        row,
        col
      );

    if(
      opposite.row!==row||
      opposite.col!==col
    ){
      result.push(opposite);
    }

    return result;
  },
  symmetryLabel(){
    return (
      this.symmetry.diagonal
        ?'대각선 대칭'
        :'없음'
    );
  },
  toggleSymmetry(){
    this.symmetry.diagonal=
      !this.symmetry.diagonal;

    this.refreshOverlay();
    return true;
  },
  mountOverlay(){
    this.overlay?.remove();

    const overlay=document.createElement('div');
    overlay.className='debug-map-editor-hud';
    overlay.innerHTML=
      '<strong>MAP EDITOR</strong>'+
      '<span>WASD 이동 · Space 대시 · 휠 확대/축소</span>'+
      '<span>좌클릭 벽 설치 · 우클릭 벽 제거 · 드래그 범위 편집</span>'+
      '<span>FFA는 3인/4인 실제 시작 위치를 함께 표시</span>'+
      '<span>ESC 편집 종료</span>';

    document.body.appendChild(overlay);
    this.overlay=overlay;
    this.refreshOverlay();
  },
  refreshOverlay(){
    if(!this.overlay)return;

    const map=DebugMapService.current();
    const status=document.createElement('span');
    const record=this.record();
    const drag=this.drag;

    status.textContent=
      `${record?.name||map.name} · ${this.modeLabel(record?.mode)} · `+
      `${map.cols}×${map.rows} · 대칭 ${this.symmetryLabel()}`+
      (
        drag
          ?` · ${drag.value===DUELS2_TILE.WALL?'채우기':'지우기'} 드래그 중`
          :''
      );

    const old=
      this.overlay.querySelector(
        '[data-map-editor-status]'
      );
    if(old){
      old.textContent=status.textContent;
    }else{
      status.dataset.mapEditorStatus='true';
      this.overlay.appendChild(status);
    }
  },
  worldTileFromEvent(event){
    const map=DebugMapService.current();
    if(!map)return null;

    Training.mouse.x=event.clientX;
    Training.mouse.y=event.clientY;

    const point=Training.mouseWorld();
    const col=Math.floor(
      point.x/map.tileWorldSize
    );
    const row=Math.floor(
      point.y/map.tileWorldSize
    );

    if(
      row<0||col<0||
      row>=map.rows||
      col>=map.cols
    )return null;

    return {row,col};
  },
  applyRect(from,to,value){
    const record=this.record();
    if(!record||!from||!to)return false;

    const rowMin=Math.min(
      from.row,to.row
    );
    const rowMax=Math.max(
      from.row,to.row
    );
    const colMin=Math.min(
      from.col,to.col
    );
    const colMax=Math.max(
      from.col,to.col
    );

    for(
      let row=rowMin;
      row<=rowMax;
      row++
    ){
      for(
        let col=colMin;
        col<=colMax;
        col++
      ){
        for(
          const point of
            this.symmetricCells(
              record,
              row,
              col
            )
        ){
          record.tiles[
            point.row
          ][
            point.col
          ]=value;
        }
      }
    }

    DebugMapService.updateRecord(record);
    this.mapId=record.id;
    StaticWorldRenderer.invalidate();
    return true;
  },
  beginPointer(event){
    if(!this.active)return false;
    if(event.button!==0&&event.button!==2){
      return false;
    }

    const tile=
      this.worldTileFromEvent(event);
    if(!tile)return false;

    this.drag={
      start:tile,
      current:tile,
      value:
        event.button===0
          ?DUELS2_TILE.WALL
          :DUELS2_TILE.FLOOR
    };
    this.hover=tile;
    this.refreshOverlay();
    return true;
  },
  movePointer(event){
    if(!this.active)return false;
    const tile=
      this.worldTileFromEvent(event);
    if(!tile)return false;

    this.hover=tile;
    if(this.drag){
      this.drag.current=tile;
      this.refreshOverlay();
    }
    return true;
  },
  endPointer(event){
    if(!this.active||!this.drag){
      return false;
    }

    const tile=
      this.worldTileFromEvent(event)||
      this.drag.current||
      this.drag.start;

    const drag=this.drag;
    this.drag=null;

    this.applyRect(
      drag.start,
      tile,
      drag.value
    );
    this.refreshOverlay();
    return true;
  },
  adjustZoom(deltaY){
    if(!this.active)return false;
    return Training.spectatorAdjustZoom(
      deltaY
    );
  },
  dash(){
    if(!this.active)return false;
    return Training.spectatorDash();
  },
  update(dt,frameScale){
    if(!this.active)return false;

    Training.spectating=true;
    Training.spectator.followPid=null;
    Training.updateSpectatorDash(dt);

    const movement=
      TrainingInputVectorService
        .movement(Training.keys);
    if(
      Math.hypot(
        movement.x,
        movement.y
      )>0
    ){
      Training.moveSpectator(
        movement.x,
        movement.y,
        frameScale
      );
    }
    return true;
  },
  spawnPreview(){
    const record=this.record();
    if(!record)return [];

    if(record.mode==='team'){
      const ids=[
        'editor-p1',
        'editor-p2',
        'editor-p3',
        'editor-p4'
      ];
      const teamByPid={
        'editor-p1':'editor-red',
        'editor-p2':'editor-red',
        'editor-p3':'editor-blue',
        'editor-p4':'editor-blue'
      };
      const points=
        MatchSpawnService.pointMap(
          ids,
          MatchModeService.TEAM,
          teamByPid
        );

      return ids.map(
        (id,index)=>({
          id,
          label:`P${index+1}`,
          team:
            index<2
              ?'red'
              :'blue',
          ...(points[id]||{})
        })
      );
    }

    if(record.mode==='ffa'){
      const previewGroups=[
        {
          playerCount:3,
          ids:[
            'editor-ffa3-p1',
            'editor-ffa3-p2',
            'editor-ffa3-p3'
          ]
        },
        {
          playerCount:4,
          ids:[
            'editor-ffa4-p1',
            'editor-ffa4-p2',
            'editor-ffa4-p3',
            'editor-ffa4-p4'
          ]
        }
      ];

      return previewGroups.flatMap(
        group=>{
          const points=
            MatchSpawnService.pointMap(
              group.ids,
              MatchModeService.FFA,
              {}
            );

          return group.ids.map(
            (id,index)=>({
              id,
              label:`${group.playerCount}인 P${index+1}`,
              team:'ffa',
              playerCount:
                group.playerCount,
              ...(points[id]||{})
            })
          );
        }
      );
    }

    const ids=[
      'editor-p1',
      'editor-p2'
    ];
    const points=
      MatchSpawnService.pointMap(
        ids,
        MatchModeService.DUEL,
        {}
      );

    return ids.map(
      (id,index)=>({
        id,
        label:`P${index+1}`,
        team:
          index===0
            ?'red'
            :'blue',
        ...(points[id]||{})
      })
    );
  },
  drawSpawnPreview(ctx){
    if(!this.active)return false;

    const points=this.spawnPreview();
    if(!points.length)return false;

    const zoom=Math.max(
      .1,
      Training.spectatorZoom()
    );

    for(const point of points){
      if(
        !Number.isFinite(point.x)||
        !Number.isFinite(point.y)
      )continue;

      const color=
        point.team==='red'
          ?'255,105,105'
          :point.team==='blue'
            ?'105,175,255'
            :point.playerCount===3
              ?'110,225,210'
              :'240,220,110';

      ctx.save();
      ctx.translate(
        point.x,
        point.y
      );

      ctx.fillStyle=
        `rgba(${color},.16)`;
      ctx.strokeStyle=
        `rgba(${color},.95)`;
      ctx.lineWidth=2/zoom;

      ctx.beginPath();
      ctx.arc(
        0,
        0,
        24,
        0,
        Math.PI*2
      );
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(-9,0);
      ctx.lineTo(9,0);
      ctx.moveTo(0,-9);
      ctx.lineTo(0,9);
      ctx.stroke();

      ctx.font=
        `${Math.max(10,12/zoom)}px Pretendard`;
      ctx.textAlign='center';
      ctx.textBaseline='bottom';
      ctx.fillStyle=
        `rgba(${color},.98)`;
      ctx.fillText(
        point.label,
        0,
        -30
      );

      ctx.restore();
    }

    return true;
  },
  draw(ctx){
    if(!this.active)return false;
    const map=DebugMapService.current();
    if(!map)return false;

    this.drawSpawnPreview(ctx);

    const tile=this.hover;
    if(!tile)return true;

    const size=map.tileWorldSize;
    let rowMin=tile.row;
    let rowMax=tile.row;
    let colMin=tile.col;
    let colMax=tile.col;

    if(this.drag){
      rowMin=Math.min(
        this.drag.start.row,
        this.drag.current.row
      );
      rowMax=Math.max(
        this.drag.start.row,
        this.drag.current.row
      );
      colMin=Math.min(
        this.drag.start.col,
        this.drag.current.col
      );
      colMax=Math.max(
        this.drag.start.col,
        this.drag.current.col
      );
    }

    ctx.save();
    ctx.fillStyle=
      this.drag?.value===DUELS2_TILE.FLOOR
        ?'rgba(255,90,90,.18)'
        :'rgba(100,190,255,.18)';
    ctx.strokeStyle=
      this.drag?.value===DUELS2_TILE.FLOOR
        ?'rgba(255,100,100,.95)'
        :'rgba(110,205,255,.95)';
    ctx.lineWidth=2/Math.max(
      .1,
      Training.spectatorZoom()
    );

    ctx.fillRect(
      colMin*size,
      rowMin*size,
      (colMax-colMin+1)*size,
      (rowMax-rowMin+1)*size
    );
    ctx.strokeRect(
      colMin*size,
      rowMin*size,
      (colMax-colMin+1)*size,
      (rowMax-rowMin+1)*size
    );
    ctx.restore();
    return true;
  }
};