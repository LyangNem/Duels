

function duels2DecodeOfficialMapTiles(source){
  const rows=Math.max(
    1,
    Math.floor(Number(source?.rows)||1)
  );
  const cols=Math.max(
    1,
    Math.floor(Number(source?.cols)||1)
  );
  const tiles=Array.from(
    {length:rows},
    ()=>Array(cols).fill(
      DUELS2_TILE.FLOOR
    )
  );

  for(
    const rect of
    source?.wallRects||[]
  ){
    const [
      rowStart,
      rowEnd,
      colStart,
      colEnd
    ]=rect;

    for(
      let row=rowStart;
      row<=rowEnd;
      row++
    ){
      for(
        let col=colStart;
        col<=colEnd;
        col++
      ){
        if(
          row>=0&&row<rows&&
          col>=0&&col<cols
        ){
          tiles[row][col]=
            DUELS2_TILE.WALL;
        }
      }
    }
  }

  return tiles;
}