
// duels2PaintDesignFramePair: 좌우에 열린 사각 프레임형 엄폐물을 만든다. (tiles/c/r/w/h/thickness)
function duels2PaintDesignFramePair(tiles,c,r,w,h,thickness=2){
  duels2PaintDesignSymmetricRect(tiles,c,r,w,thickness);
  duels2PaintDesignSymmetricRect(tiles,c,r+h-thickness,w,thickness);
  duels2PaintDesignSymmetricRect(tiles,c,r,thickness,h);
  duels2PaintDesignSymmetricRect(tiles,c+w-thickness,r,thickness,h);
}