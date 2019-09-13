
const { ContainmentLayer } = require('jsketch')

const UnknownLayer = function (json) {
  const store = { ...json }
  const containment = new ContainmentLayer()
  containment.id = json.do_objectID
  containment.x = json.frame.x
  containment.y = json.frame.y
  containment.width = json.frame.width
  containment.height = json.frame.height
  containment.name = json.name
  json.layers.forEach(layer => {
    containment.addLayer(new UnknownLayer(layer))
  })

  return new Proxy(containment, {
    get: function (target, property) {
      if (property === 'toJSON') {
        return () => ({
          ...store,
          ...containment.toJSON(),
        })
      }
      const response = Reflect.get(target, property, target)
      return response !== undefined ? response : store[property]
    },
    set: function (target, property, value) {
      target[property] = value
    }
  })
}

module.exports = UnknownLayer
