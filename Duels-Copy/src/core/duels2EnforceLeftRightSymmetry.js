
// duels2EnforceLeftRightSymmetry: 설계 격자의 왼쪽 절반을 기준으로 오른쪽 절반을 강제 대칭 복사한다. (tiles)
function duels2EnforceLeftRightSymmetry(tiles){
  const cols=DUELS2_TILE_DESIGN_COLS;
  for(let r=0;r<DUELS2_TILE_DESIGN_ROWS;r++)for(let c=0;c<Math.floor(cols/2);c++)tiles[r][cols-1-c]=tiles[r][c];
  return tiles;
}