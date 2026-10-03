
// duels2PaintDesignRect: 설계 격자에 직사각형 영역을 칠한다. (tiles/c/r/w/h/v)
function duels2PaintDesignRect(tiles,c,r,w,h,v=1){for(let y=r;y<r+h;y++)for(let x=c;x<c+w;x++)duels2SetDesignTile(tiles,x,y,v);}