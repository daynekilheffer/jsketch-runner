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
1. can a plugin or processing function change viewport?
  - does it ever reset?
  - can the same processing be done for all viewports?
