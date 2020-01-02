# jsketch-runner

**NOTE** work in progress

a layer around puppeteer that allows for easier use of jsketch in the browser

## quick start

```js
const fs = require('fs')
const createBuilder = require('jsketch-runner')
const htmlsketch = require('jsketch-runner/plugins/htmlsketch')

const { File, Page, Artboard, fileToZip } = require('jsketch')

// this represents the file we will save to disk
// it contains metadata, user info, images,
//  and most importantly, the document that the user sees
const file = new File()

// create a new page to hold our design elements
const page = new Page()
page.name = 'Page'

// create an artboard to hold our layers
const artboard = new Artboard.Desktop()

// add the artboard to our page, and the page to the document
page.addLayer(artboard)
file.document.addPage(page)

// a builder has some customization available, but this example just needs the defaults
createBuilder()
  .build()
  // we'll use html-sketchapp to process the webpage
  // this plugin bridges the gap between html-sketchapp's "almost sketch" format and sketch
  .plugin(htmlsketch)
  // define how to process the example site (material-ui switches with labels)
  .process('https://5rwen.csb.app/', async (jsketch) => {
    // code sandbox does a loader spinner, so wait for a switch to be on the page
    await jsketch.page(async page => page.waitFor('.MuiFormControlLabel-root'))
    // create the layers for any form control label
    const layers = await jsketch.createLayers('.MuiFormControlLabel-root')
    // add each layer to the artboard
    layers.forEach(layer => artboard.addLayer(layer))
  })
  // execute the processing
  .run()
  .then(() => {
    // convert the file to a stream and write to disk
    fileToZip(file)
      .pipe(fs.createWriteStream('example.sketch'))
  })
  // catch any errors
  .catch((e) => console.log('help!', e.stack))
```
