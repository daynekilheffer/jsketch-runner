const fs = require('fs')
const createBuilder = require('.')
// import svg2png from './plugins/svg2png'
const htmlsketch = require('./plugins/htmlsketch')

const { File, Page, SymbolMaster, RawJSONLayer, fileToZip } = require('jsketch')

// const symbolStorage = new Map()
const page = new Page()
page.name = 'Page'
const file = new File()

const builder = createBuilder()
// builder.symbolStorage(symbolStorage)
// builder.imageStorage(image => {
//   file.addImage(image)
// })

builder
  .build()
  // .plugin(svg2png)
  .plugin(htmlsketch)
  .process('https://google.com', async (jsketch) => {
    const layerGroups = await jsketch.createLayers('#hptl *')
    console.log('done', layerGroups);
    // const symbol = new SymbolMaster()
    // // setup symbol stuff
    // layers.forEach(layer => symbol.addLayer(layer))
    // page.addLayer(symbol)
    // symbolStorage.put(symbol.name, symbol)
    layerGroups.forEach(layerGroup => {
      layerGroup.forEach(layer => {
        page.addLayer(new RawJSONLayer(layer))
      })
    })
  })
  .run()
  .then(() => {
    file.document.addPage(page)
    fileToZip(file)
      .pipe(fs.createWriteStream('test.sketch'))
  })
  .catch((e) => console.log('help!', e.stack))
