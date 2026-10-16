
// duels2MergeFourDesignTiles: 80×56 설계 격자를 기존 40×28 실제 블록 격자로 정렬한다. 설계 칸 중 하나라도 벽이면 해당 실제 블록 하나를 벽으로 만든다.
function duels2MergeFourDesignTiles(designTiles){
  const merged=Array.from(
    {length:DUELS2_TILE_ROWS},
    ()=>Array(DUELS2_TILE_COLS).fill(DUELS2_TILE.FLOOR)
  );

  for(let r=0;r<DUELS2_TILE_ROWS;r++){
    for(let c=0;c<DUELS2_TILE_COLS;c++){
      let wall=false;

      for(let dy=0;dy<2&&!wall;dy++){
        for(let dx=0;dx<2;dx++){
          if(
            designTiles[r*2+dy]?.[c*2+dx]===
              DUELS2_TILE.WALL
          ){
            wall=true;
            break;
          }
        }
      }

      merged[r][c]=
        wall
          ?DUELS2_TILE.WALL
          :DUELS2_TILE.FLOOR;
    }
  }

  return merged;
}