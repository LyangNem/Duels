
// duels2ClearDesignPlayRoutes: 양쪽 스폰과 중앙 이동 통로를 설계 격자에서 비운다.
function duels2ClearDesignPlayRoutes(tiles){
  const midY=Math.floor(DUELS2_TILE_DESIGN_ROWS/2),midX=Math.floor(DUELS2_TILE_DESIGN_COLS/2);
  duels2PaintDesignRect(tiles,2,midY-8,16,16,0);duels2PaintDesignRect(tiles,DUELS2_TILE_DESIGN_COLS-18,midY-8,16,16,0);
  duels2PaintDesignRect(tiles,0,midY-3,DUELS2_TILE_DESIGN_COLS,6,0);duels2PaintDesignRect(tiles,midX-3,0,6,DUELS2_TILE_DESIGN_ROWS,0);
  return tiles;
}