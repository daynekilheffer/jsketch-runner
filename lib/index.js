const runner = require('./runner')

const createBuilder = () => {
  const building = {}
  const builder = {
    symbolStorage: (storage) => building.symbolStorage = storage,
    imageStorage: (storage) => building.imageStorage = storage,
    build: () => runner(building)
  }
  return builder
}

module.exports = createBuilder
