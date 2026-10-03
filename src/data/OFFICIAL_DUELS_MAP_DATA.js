

const OFFICIAL_DUELS_MAP_DATA={
  entries:
    OFFICIAL_DUELS_MAP_SOURCE.map(
      source=>({
        id:source.id,
        name:source.name,
        mode:source.mode,
        rows:source.rows,
        cols:source.cols,
        tileWorldSize:
          source.tileWorldSize,
        tiles:
          duels2DecodeOfficialMapTiles(
            source
          )
      })
    )
};