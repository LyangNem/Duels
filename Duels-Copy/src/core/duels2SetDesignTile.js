
// duels2SetDesignTile: 설계 격자의 한 칸을 범위 안에서 설정한다. (tiles: 설계 격자, c/r: 좌표, v: 타일 값)
function duels2SetDesignTile(tiles,c,r,v){if(r>=0&&r<DUELS2_TILE_DESIGN_ROWS&&c>=0&&c<DUELS2_TILE_DESIGN_COLS)tiles[r][c]=v;}