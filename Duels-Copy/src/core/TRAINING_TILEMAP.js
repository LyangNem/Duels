

const TRAINING_TILEMAP=
  duels2CreateTilemap(
    '타일 훈련장',
    'training',
    duels2BuildTrainingTileLayout(),
    {
      id:'training-tilemap',
      isTraining:true,
      mapMode:'training'
    }
  );