const puppeteer = require('puppeteer')
const s2bapi = require('./s2b')

const executePlugins = (plugins, methodName, context) =>
  plugins.reduce((prom, plugin) => {
    if (plugin[methodName]) {
      return prom.then(() => plugins[methodName](context))
    }
    return prom
  }, Promise.resolve())

const runner = build => {
  const plugins = []
  const processes = []
  const chain = fn => (...args) => { fn(...args); return runner }
  const runner = {
    plugin: chain((plugin) => plugins.push(plugin)),
    process: chain((target, fn) => processes.push([target, fn])),
    run: async () => {
      const browser = await puppeteer.launch({
          args: [],
          headless: true,
          devtools: false,
      });

      try {
        await executePlugins(plugins, 'afterLaunch', { browser })

        const page = await browser.newPage();

        await executePlugins(plugins, 'afterPageCreation', { page })

        await processes.reduce((prom, [target, fn]) =>
          prom.then(async () => {
            await page.goto(target)
            await executePlugins(plugins, 'afterPageInstantiation', { page })

            // inject something into the page
            // inject any plugin code into the page
            // run fn()

            await fn(s2bapi(page, { plugins }, build))
          }),
          Promise.resolve())
      } finally {
        browser.close()
      }
    }
  }
  return runner
}


module.exports = runner
