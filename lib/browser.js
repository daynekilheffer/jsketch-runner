/* global document:true */

var jsketch = (function () { // eslint-disable-line no-unused-vars
  const has = (obj, path) => !!(obj && obj[path])
  const hasFilter = path => obj => has(obj, path)
  const promiseEach = (items, fn) => items.reduce((promise, item) => {
    return promise.then(fn(item))
  }, Promise.resolve())

  const promiseMap = (items, fn) => {
    const results = []
    return promiseEach(items, item =>
      () =>
        fn(item).then(val => {
          results.push(val)
          return val
        })
      )
      .then(() => results)
  }
  const plugins = []
  return (
    {
      addPlugin: plugin => plugins.push(plugin),
      getLayers: async (selector) => {
        return promiseMap(Array.from(document.querySelectorAll(selector)),
          async node => {

            await promiseEach(
              plugins.filter(hasFilter('beforeLayer')),
              plugin =>
                () => plugin.beforeLayer(node))

            const layers = await promiseEach(
              plugins.filter(hasFilter('getLayers')),
              plugin =>
                layers => {
                  const newLayers = plugin.getLayers(node, layers)
                  return newLayers || layers
                })

            await promiseEach(
              plugins.filter(hasFilter('afterLayer')),
              plugin =>
                () => plugin.afterLayer(layers, node))
            return layers
          }
        )
        .then(layers => JSON.stringify(layers))
      }
    }
  )
})()
