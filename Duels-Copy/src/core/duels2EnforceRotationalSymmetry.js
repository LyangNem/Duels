
// duels2EnforceRotationalSymmetry: 공정성을 유지하면서 좌우 복제형 반복을 피하도록 180도 회전 대칭을 적용한다. (tiles)
function duels2EnforceRotationalSymmetry(tiles){
  const rows=DUELS2_TILE_DESIGN_ROWS, cols=DUELS2_TILE_DESIGN_COLS;
  for(let r=0;r<rows;r++)for(let c=0;c<cols;c++)if(tiles[r][c]===1)tiles[rows-1-r][cols-1-c]=1;
  return tiles;
}