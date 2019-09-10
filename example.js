import { createBuilder } from '.'
import svg2png from './plugins/svg2png'
import htmlsketch from './plugins/htmlsketch'

import { File, Page, SymbolMaster } from 'jsketch'

const symbolStorage = new Map()
const symbolPage = new Page()
symbolPage.name = 'Symbols'
const file = new File()

const builder = createBuilder()
builder.symbolStorage(symbolStorage)
builder.imageStorage(image => {
  file.addImage(image)
})

builder
  .build()
  .plugin(svg2png)
  .plugin(htmlsketch)
  .process('url', async (jsketch) => {
    const layers = await jsketch.createLayers('some-selector')
    const symbol = new SymbolMaster()
    // setup symbol stuff
    layers.forEach(layer => symbol.addLayer(layer))
    symbolPage.addLayer(symbol)
    symbolStorage.put(symbol.name, symbol)
  })
  .process('url2', () => {})
  .run()
