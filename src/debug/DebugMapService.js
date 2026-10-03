

const DebugMapService={
  currentId:'training-tilemap',
  currentMap:null,
  maps:[],
  rebuild(){
    const normalized=
      OFFICIAL_DUELS_MAP_DATA.entries.map(
        entry=>
          OfficialMapDataService
            .normalize(entry)
      );

    OFFICIAL_DUELS_MAP_DATA.entries
      .splice(
        0,
        OFFICIAL_DUELS_MAP_DATA.entries.length,
        ...normalized
      );

    this.maps=[
      TRAINING_TILEMAP,
      ...normalized.map(
        record=>
          OfficialMapDataService
            .toMap(record)
      )
    ];

    if(
      !this.maps.some(
        map=>map.id===this.currentId
      )
    ){
      this.currentId=
        'training-tilemap';
    }

    this.currentMap=
      this.maps.find(
        map=>map.id===this.currentId
      )||TRAINING_TILEMAP;

    return this.maps;
  },
  current(){
    if(!this.maps.length){
      this.rebuild();
    }
    return (
      this.maps.find(
        map=>map.id===this.currentId
      )||
      TRAINING_TILEMAP
    );
  },
  walls(){
    return this.current()?.walls||[];
  },
  movementWalls(){
    const staticWalls=this.current()?.walls||[];
    const dynamicWalls=DynamicWallService.all();
    if(!dynamicWalls.length)return staticWalls;
    return staticWalls.concat(dynamicWalls);
  },
  record(mapId=this.currentId){
    return (
      OFFICIAL_DUELS_MAP_DATA.entries.find(
        entry=>
          entry.id===String(mapId||'')
      )||null
    );
  },
  set(mapId){
    if(!this.maps.length){
      this.rebuild();
    }

    const map=this.maps.find(
      item=>item.id===String(mapId||'')
    );
    if(!map)return false;

    this.currentId=map.id;
    this.currentMap=map;
    StaticWorldRenderer.invalidate();
    ProjectileService.clear();
    SimulationScheduleService.clear();
    return true;
  },
  create({name,mode}={}){
    const record=
      OfficialMapDataService
        .createRecord({name,mode});

    OFFICIAL_DUELS_MAP_DATA.entries
      .push(record);

    this.rebuild();
    this.set(record.id);
    return record;
  },
  updateRecord(record){
    if(!record?.id)return false;

    const index=
      OFFICIAL_DUELS_MAP_DATA.entries
        .findIndex(
          entry=>entry.id===record.id
        );
    if(index<0)return false;

    OFFICIAL_DUELS_MAP_DATA.entries[index]=
      OfficialMapDataService
        .normalize(record);

    this.rebuild();
    this.set(record.id);
    return true;
  },
  rename(mapId,name){
    const record=this.record(mapId);
    if(!record)return false;

    record.name=
      String(name||record.name);

    return this.updateRecord(record);
  },
  remove(mapId){
    const id=String(mapId||'');
    if(
      !id||
      id==='training-tilemap'
    )return false;

    const index=
      OFFICIAL_DUELS_MAP_DATA.entries
        .findIndex(
          entry=>entry.id===id
        );
    if(index<0)return false;

    OFFICIAL_DUELS_MAP_DATA.entries
      .splice(index,1);

    if(this.currentId===id){
      this.currentId=
        'training-tilemap';
    }

    this.rebuild();
    return true;
  },
  exportOfficialData(){
    return OfficialMapDataService
      .serialize();
  },
  downloadMap(mapId=this.currentId){
    const record=this.record(mapId);
    if(!record)return false;
    return OfficialMapDataService
      .downloadMap(record);
  },
  downloadAllMaps(){
    return OfficialMapDataService
      .downloadBundle();
  }
};