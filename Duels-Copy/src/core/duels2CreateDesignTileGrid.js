
// duels2CreateDesignTileGrid: 기존 80×56 설계 해상도의 빈 타일 격자를 만든다.
function duels2CreateDesignTileGrid(){return Array.from({length:DUELS2_TILE_DESIGN_ROWS},()=>Array(DUELS2_TILE_DESIGN_COLS).fill(0));}