

const TRAINING_RUNTIME_TRIGGERS=Object.freeze({
  entityRespawn:Object.freeze({
    type:'trigger',
    event:'entity.respawn',
    conditions:Object.freeze([
      Object.freeze({type:'entity.dead'}),
      Object.freeze({
        type:'time.ready',
        sourceProperty:'respawnAt'
      })
    ])
  }),
  botCadence:Object.freeze({
    type:'trigger',
    event:'time.update',
    conditions:Object.freeze([
      Object.freeze({
        type:'source.property.lte',
        property:'phaseTimer',
        value:0
      })
    ])
  })
});