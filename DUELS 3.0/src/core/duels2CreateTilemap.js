
function duels2CreateTilemap(
  name,
  mapClass,
  tiles,
  opt={}
){
  const tileWorldSize=Math.max(
    1,
    Number(opt.tileWorldSize)||
      DUELS2_TILE_WORLD_SIZE
  );
  const rows=tiles.length;
  const cols=Math.max(
    0,
    ...tiles.map(row=>row.length)
  );

  return Object.freeze({
    id:String(
      opt.id||
      `${mapClass}-${Date.now()}`
    ),
    name:String(name||'새 맵'),
    type:String(
      opt.type||
      DUELS2_MAP_CLASS_LABEL[mapClass]||
      '커스텀'
    ),
    mapClass,
    mapMode:
      String(opt.mapMode||'basic'),
    isTraining:!!opt.isTraining,
    isFfa:!!opt.isFfa,
    isTeam:!!opt.isTeam,
    tileSize:1,
    tileWorldSize,
    cols,
    rows,
    worldWidth:
      Number(opt.worldWidth)||
      cols*tileWorldSize,
    worldHeight:
      Number(opt.worldHeight)||
      rows*tileWorldSize,
    tiles:Object.freeze(
      tiles.map(
        row=>Object.freeze([...row])
      )
    ),
    walls:Object.freeze(
      duels2TileWalls(
        tiles,
        tileWorldSize
      ).map(Object.freeze)
    )
  });
}