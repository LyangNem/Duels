
// 훈련장 외의 내장 전투 맵은 제거한다.
function duels2BuildTrainingTileLayout(){
  const tiles=Array.from(
    {length:28},
    ()=>Array(40).fill(
      DUELS2_TILE.FLOOR
    )
  );
  const wallRects=[
    [3,12,25,25],[3,12,34,34],[24,24,3,7],[23,24,10,14],[22,24,17,21],[21,24,24,28],[20,24,31,36]
  ];

  for(const [
    rowStart,
    rowEnd,
    colStart,
    colEnd
  ] of wallRects){
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
        tiles[row][col]=
          DUELS2_TILE.WALL;
      }
    }
  }

  return tiles;
}