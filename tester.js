const fs = require('fs')
const createBuilder = require('.')
const htmlsketch = require('./plugins/htmlsketch')

const { File, Page, RawJSONLayer, fileToZip } = require('jsketch')

// const symbolStorage = new Map()
const page = new Page()
page.name = 'Page'
const file = new File()

const builder = createBuilder()

builder
  .build()
  .plugin(htmlsketch)
  .process('https://material-ui.com/components/switches/', async (jsketch) => {
    const singleLayers = await jsketch.createLayers('.MuiSwitch-root', (_, idx) => idx === 0)
    singleLayers.forEach(layer => {
      page.addLayer(new RawJSONLayer(layer))
    })
    const multipleLayers = await jsketch.createLayers('.MuiSwitch-root', (_, idx) => idx < 5)
    multipleLayers.forEach(layer => {
      page.addLayer(new RawJSONLayer(layer))
    })
  })
  .run()
  .then(() => {
    file.document.addPage(page)
    fileToZip(file)
      .pipe(fs.createWriteStream('test.sketch'))
  })
  .catch((e) => console.log('help!', e.stack))
