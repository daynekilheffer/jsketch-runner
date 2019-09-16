const fs = require('fs')
const createBuilder = require('.')
const htmlsketch = require('./plugins/htmlsketch')

const { File, Page, Artboard, SymbolMaster, fileToZip } = require('jsketch')

const symbolPage = new Page()
symbolPage.name = 'Symbols'
const page = new Page()
page.name = 'Page'
const artboard = new Artboard.Desktop()
page.addLayer(artboard)
const file = new File()

const symboldb = new Map()

const builder = createBuilder()
builder.symboldb(symboldb)

builder
  .build()
  .plugin(htmlsketch)
  .process('https://r203n.csb.app/', async (jsketch) => {
    await jsketch.page(async page => page.waitFor('.MuiSwitch-root'))

    const [ singleLayer ] = await jsketch.createLayers('.MuiSwitch-root', (_, idx) => idx === 2)

    const master = new SymbolMaster()
    master.name = 'muiswitch'
    master.width = singleLayer.width
    master.height = singleLayer.height
    singleLayer.x = 0
    singleLayer.y = 0
    master.addLayer(singleLayer)

    symbolPage.addLayer(master)
    symboldb.set(singleLayer.name, master)

    // await jsketch.page(async page => {
    //   const elem = (await page.$$('.MuiSwitch-root'))[0]
    //   // await elem.click()
    //   await elem.hover()
    // })

    // const multipleLayers = await jsketch.createLayers('.MuiSwitch-root', (_, idx) => idx < 2)
    // multipleLayers.forEach(layer => {
    //   layer.y += 40
    //   page.addLayer(layer)
    // })
  })
  .process('https://5rwen.csb.app/', async (jsketch) => {
    await jsketch.page(async page => page.waitFor('.MuiFormControlLabel-root'))
    const layers = await jsketch.createLayers('.MuiFormControlLabel-root')
    layers.forEach(layer => artboard.addLayer(layer))
  })
  .run()
  .then(() => {
    file.document.addPage(page)
    file.document.addPage(symbolPage)
    fileToZip(file)
      .pipe(fs.createWriteStream('test.sketch'))
  })
  .catch((e) => console.log('help!', e.stack))
