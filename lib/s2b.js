// server to browser

const fs = require('fs')
const path = require('path')

const browserApi = fs.readFileSync(path.resolve(__dirname, './browser.js'))
const isFunction = obj => typeof obj === 'function'
const identity = i => i

const pEachSync = (items, fn) => items.reduce((promise, item) => {
  return promise.then(() => fn(item))
}, Promise.resolve())

module.exports = (page, context, buildConfig) => {
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  return {
    createLayers: async (selector, filter = identity) => {
      await page.addScriptTag({ content: browserApi.toString() })
      await pEachSync(context.plugins, async plugin => {
          const browserPlugin = isFunction(plugin.browser) ? await plugin.browser() : plugin.browser
          if (browserPlugin) {
            await page.addScriptTag({ content: browserPlugin.toString() })
          }
        })

      const rawLayers = await page.evaluate(`jsketch.getLayers(${JSON.stringify(selector)}, ${filter})`)
      const layers = JSON.parse(rawLayers)

      await pEachSync(
        layers,
        layer =>
          pEachSync(
            context.plugins.filter(plugin => plugin.processLayer),
            async plugin => plugin.processLayer(layer, buildConfig))
      )

      return layers
    }
  }
}
