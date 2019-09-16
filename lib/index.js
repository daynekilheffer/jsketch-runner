const runner = require('./runner')

const createBuilder = () => {
  const building = {}
  const builder = {
    symboldb: (db) => building.symboldb = db,
    imageStorage: (storage) => building.imageStorage = storage,
    build: () => runner(building)
  }
  return builder
}

module.exports = createBuilder
