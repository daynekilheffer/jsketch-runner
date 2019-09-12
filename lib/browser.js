/* eslint-env browser */

(function (global) {
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
  const promiseReduce = (items, fn, initial) => items.reduce((promise, item) => {
    return promise.then(fn(item))
  }, Promise.resolve(initial))
  const plugins = []

  global.jsketch = {
    addPlugin: plugin => {
      plugins.push(plugin)
    },
    getLayers: async (selector, filterFn) => {
      console.log(selector, filterFn.toString())
      return promiseMap(
        Array.from(document.querySelectorAll(selector)).filter(filterFn),
        async node => {

          await promiseEach(
            plugins.filter(hasFilter('beforeLayer')),
            plugin =>
              () => plugin.beforeLayer(node))

          const layers = await promiseReduce(
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
})(window)
