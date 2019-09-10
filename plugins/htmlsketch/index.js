const fs = require('fs')
const path = require('path')

module.exports = {
  browser: () => fs.readFileSync(path.resolve(__dirname, './browser-build.js'))
}
