

const WorldBoundsService=Object.freeze({
  width(){
    const map=
      typeof DebugMapService!=='undefined'
        ?DebugMapService.current?.()
        :null;
    return Math.max(
      GAME_DATA.canvas.width,
      Number(map?.worldWidth)||
        GAME_DATA.world.width
    );
  },
  height(){
    const map=
      typeof DebugMapService!=='undefined'
        ?DebugMapService.current?.()
        :null;
    return Math.max(
      GAME_DATA.canvas.height,
      Number(map?.worldHeight)||
        GAME_DATA.world.height
    );
  },
});