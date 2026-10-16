
function duels2TileWalls(
  tiles,
  tileWorldSize=DUELS2_TILE_WORLD_SIZE
){
  const walls=[];
  for(let r=0;r<tiles.length;r++){
    for(let c=0;c<(tiles[r]?.length||0);c++){
      if(tiles[r][c]!==DUELS2_TILE.WALL)continue;
      walls.push({
        x:c*tileWorldSize,
        y:r*tileWorldSize,
        w:tileWorldSize,
        h:tileWorldSize
      });
    }
  }
  return walls;
}