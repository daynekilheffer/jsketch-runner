1. how can a plugin best configure how it wants to act in the browser.  I'm assuming a bundle is available or being generated.  If you want configuration, do you need to regenerate each time?

  ```js
  builder.build()
    .plugin(myPlugin({ doItLikeThis: true }))
    // ...
  ```

  consider:

  ```js
  // to allow direct setting of the page object
  plugin.afterInjection(page)

  // we get the config and provide it to the plugin
  // (but how do we know the plugins global variable?)
  plugin.browserPluginConfiguration()

  // bootstrap jsketch with config after plugins are injected
  config = reduce(plugins, (cfg, plugin) => ({...cfg, ...plugin.config}), {})
  page.evaluate('jsketch.bootstrap(`${JSON.stringify(config)}`)')
  ```

1. how is the symbol and image storage accessed/used?
1. can a processing function access the dom?
  ```js
  .process('url', async (jsketch) => {
    await jsketch.page(async (page) => {
      await page.$('.button').click()
      await page.waitFor('.dropdown')
    })
    const layers = await jsketch.createLayers('.dropdown')
  })
  ```
1. can a plugin or processing function change viewport?
  - does it ever reset?
  - can the same processing be done for all viewports?
1. can we allow a processing function to customize how to select dom elements?
  ```js
  const layers = await jsketch.createLayers(
    d => d.querySelectorAll('input')[0]
  )
  // or a filter function?
  // function has to be executable inside the browser via toString()
  const layers = await jsketch.createLayers(
    '.my-elem',
    node => node.nodeName === 'DIV'
  )
  ```
1. can we allow a single execution into the browser but getting multiple sets of data?

  ```js
  const layerMap = await jsketch.createLayers({
    header: '.header',
    button1: '.btn.one',
    button2: '.btn.two',
  })
  Object.entries(layerMap)
    .forEach(([key, layers]) => {
      const symbol = new SymbolMaster()
      symbol.name = key
      symbol.addLayers(layers)
      page.addLayer(symbol)
    })
  // with the filtration logic, does it become:
  const layerMap = await jsketch.createLayers({
    header: ['.header', (_, idx) => idx % 2],
    button1: '.btn.one',
    button2: '.btn.two',
  })
  // but that's ugly, so what about:
  const layerMap = await jsketch.createLayers({
    header: jsketch.createSelector('.header', (_, idx) => idx % 2),
    button1: '.btn.one',
    button2: '.btn.two',
  })
  ```
  is this even needed?  We only loaded the page once, so the performance hit is minimal
