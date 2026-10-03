
// duels2FinalizePlayableDesign: 통로를 확보하고 회전 대칭을 적용한 뒤 1블록 단위 격자를 그대로 반환한다. (tiles)
function duels2FinalizePlayableDesign(tiles){
  duels2ClearDesignPlayRoutes(tiles);
  duels2EnforceRotationalSymmetry(tiles);
  return duels2MergeFourDesignTiles(tiles);
}