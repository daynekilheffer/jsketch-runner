// server to browser

const fs = require('fs')
const path = require('path')
const reduce = require('async/reduce')
const eachSeries = require('async/eachSeries')
const mapSeries = require('async/mapSeries')

const browserApi = fs.readFileSync(path.resolve(__dirname, './browser.js'))
const isFunction = obj => typeof obj === 'function'
const identity = i => i

module.exports = (page, context, buildConfig) => {
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  return {
    page: (fn) => fn(page),
    createLayers: async (selector, filter = identity) => {
      await page.addScriptTag({ content: browserApi.toString() })
      await eachSeries(context.plugins, async plugin => {
          const browserPlugin = isFunction(plugin.browser) ? await plugin.browser() : plugin.browser
          if (browserPlugin) {
            await page.addScriptTag({ content: browserPlugin.toString() })
          }
        })

      const rawLayers = await page.evaluate(`jsketch.getLayers(${JSON.stringify(selector)}, ${filter})`)
      const layers = JSON.parse(rawLayers)

      return mapSeries(
        layers,
        async layer => {
          return reduce(
            context.plugins.filter(plugin => plugin.processLayer),
            layer,
            async (layer, plugin) => plugin.processLayer(layer, buildConfig) || layer
          )
        }
      )
    }
  }
}
