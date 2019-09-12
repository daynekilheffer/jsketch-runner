const fs = require('fs')
const path = require('path')

const processLayer = require('./process-layer')

module.exports = {
  browser: () => fs.readFileSync(path.resolve(__dirname, './browser-build.js')),
  processLayer,
}
