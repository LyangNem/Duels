
// duels2PaintDesignSymmetricRect: 좌우 대칭 직사각형을 설계 격자에 칠한다. (tiles/c/r/w/h)
function duels2PaintDesignSymmetricRect(tiles,c,r,w,h){duels2PaintDesignRect(tiles,c,r,w,h,1);duels2PaintDesignRect(tiles,DUELS2_TILE_DESIGN_COLS-c-w,r,w,h,1);}