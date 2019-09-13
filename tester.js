const fs = require('fs')
const createBuilder = require('.')
const htmlsketch = require('./plugins/htmlsketch')

const { File, Page, SymbolMaster, fileToZip } = require('jsketch')

const symbolPage = new Page()
symbolPage.name = 'Symbols'
const page = new Page()
page.name = 'Page'
const file = new File()

const builder = createBuilder()

builder
  .build()
  .plugin(htmlsketch)
  .process('https://r203n.csb.app/', async (jsketch) => {
    await jsketch.page(async page => page.waitFor('.MuiSwitch-root'))

    const singleLayer = await jsketch.createLayers('.MuiSwitch-root', (_, idx) => idx === 0)

    singleLayer.forEach(layer => page.addLayer(layer))
    // const symbol = await jsketch.createSymbol('.MuiSwitch')

    await jsketch.page(async page => {
      const elem = (await page.$$('.MuiSwitch-root'))[0]
      // await elem.click()
      await elem.hover()
    })

    const multipleLayers = await jsketch.createLayers('.MuiSwitch-root', (_, idx) => idx < 5)
    multipleLayers.forEach(layer => {
      layer.y += 40
      page.addLayer(layer)
    })
  })
  .run()
  .then(() => {
    file.document.addPage(page)
    fileToZip(file)
      .pipe(fs.createWriteStream('test.sketch'))
  })
  .catch((e) => console.log('help!', e.stack))
