// server to browser

const fs = require('fs')
const path = require('path')

const browserApi = fs.readFileSync(path.resolve(__dirname, './browser.js'))
const isFunction = obj => typeof obj === 'function'

const promiseEach = (items, fn) => items.reduce((promise, item) => {
  return promise.then(fn(item))
}, Promise.resolve())

module.exports = (page, context, buildConfig) => {
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  return {
    createLayers: async (selectors) => {
      await page.addScriptTag({ content: browserApi.toString() })
      await promiseEach(context.plugins, (plugin) =>
        async () => {
          const browserPlugin = isFunction(plugin.browser) ? await plugin.browser() : plugin.browser
          if (browserPlugin) {
            await page.addScriptTag({ content: browserPlugin.toString() })
          }
        })
      const rawLayers = await page.evaluate(`jsketch.getLayers('${selectors}')`)
      const layers = JSON.parse(rawLayers)
      return layers
    }
  }
}
