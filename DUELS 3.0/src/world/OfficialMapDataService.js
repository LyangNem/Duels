

const OfficialMapDataService=Object.freeze({
  modeSpecs:Object.freeze({
    basic:Object.freeze({
      label:'기본',
      cols:40,
      rows:28,
      tileWorldSize:
        DUELS2_TILE_WORLD_SIZE
    }),
    ffa:Object.freeze({
      label:'FFA',
      cols:54,
      rows:54,
      tileWorldSize:
        DUELS2_TILE_WORLD_SIZE
    }),
    team:Object.freeze({
      label:'팀전',
      cols:50,
      rows:35,
      tileWorldSize:
        DUELS2_TILE_WORLD_SIZE
    })
  }),
  normalize(raw){
    const mode=
      this.modeSpecs[raw?.mode]
        ?String(raw.mode)
        :'basic';
    const spec=this.modeSpecs[mode];
    const rows=Math.max(
      1,
      Math.floor(
        Number(raw?.rows)||spec.rows
      )
    );
    const cols=Math.max(
      1,
      Math.floor(
        Number(raw?.cols)||spec.cols
      )
    );

    return {
      id:String(raw?.id||''),
      name:String(raw?.name||'새 맵'),
      mode,
      rows,
      cols,
      tileWorldSize:
        Math.max(
          1,
          Number(raw?.tileWorldSize)||
          spec.tileWorldSize
        ),
      tiles:Array.from(
        {length:rows},
        (_,row)=>Array.from(
          {length:cols},
          (_,col)=>
            Number(
              raw?.tiles?.[row]?.[col]
            )===DUELS2_TILE.WALL
              ?DUELS2_TILE.WALL
              :DUELS2_TILE.FLOOR
        )
      )
    };
  },
  createRecord(
    {
      name='새 맵',
      mode='basic'
    }={}
  ){
    const actualMode=
      this.modeSpecs[mode]
        ?mode
        :'basic';
    const spec=
      this.modeSpecs[actualMode];
    const existing=
      OFFICIAL_DUELS_MAP_DATA.entries;
    let sequence=existing.length+1;
    let id='';

    do{
      id=
        `official-${actualMode}-${String(sequence).padStart(2,'0')}`;
      sequence++;
    }while(
      existing.some(
        entry=>entry.id===id
      )
    );

    return {
      id,
      name:String(name||'새 맵'),
      mode:actualMode,
      rows:spec.rows,
      cols:spec.cols,
      tileWorldSize:
        spec.tileWorldSize,
      tiles:Array.from(
        {length:spec.rows},
        ()=>Array(spec.cols).fill(
          DUELS2_TILE.FLOOR
        )
      )
    };
  },
  toMap(raw){
    const record=this.normalize(raw);
    const modeSpec=
      this.modeSpecs[record.mode];

    return duels2CreateTilemap(
      record.name,
      'official',
      record.tiles,
      {
        id:record.id,
        type:
          `공식 · ${modeSpec.label}`,
        mapMode:record.mode,
        isFfa:
          record.mode==='ffa',
        isTeam:
          record.mode==='team',
        tileWorldSize:
          record.tileWorldSize,
        worldWidth:
          record.cols*
          record.tileWorldSize,
        worldHeight:
          record.rows*
          record.tileWorldSize
      }
    );
  },
  fileSafeName(value){
    const name=String(value||'map')
      .trim()
      .replace(/[\\/:*?"<>|]+/g,'_')
      .replace(/\s+/g,'_')
      .replace(/^_+|_+$/g,'');
    return name||'map';
  },
  mapFilePayload(raw){
    const map=this.normalize(raw);
    return {
      format:'duels3-map',
      version:1,
      map
    };
  },
  bundleFilePayload(){
    return {
      format:'duels3-map-bundle',
      version:1,
      maps:
        OFFICIAL_DUELS_MAP_DATA.entries
          .map(entry=>this.normalize(entry))
    };
  },
  serialize(){
    return JSON.stringify(
      this.bundleFilePayload(),
      null,
      2
    );
  },
  downloadJson(filename,payload){
    const blob=new Blob(
      [
        JSON.stringify(
          payload,
          null,
          2
        )
      ],
      {
        type:'application/json;charset=utf-8'
      }
    );
    const url=URL.createObjectURL(blob);
    const anchor=document.createElement('a');
    anchor.href=url;
    anchor.download=String(filename||'Duels3_Map.json');
    anchor.style.display='none';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(
      ()=>URL.revokeObjectURL(url),
      0
    );
    return true;
  },
  downloadMap(raw){
    const map=this.normalize(raw);
    return this.downloadJson(
      `Duels3_Map_${this.fileSafeName(map.name)}.json`,
      this.mapFilePayload(map)
    );
  },
  downloadBundle(){
    return this.downloadJson(
      'Duels3_Maps.json',
      this.bundleFilePayload()
    );
  }
});