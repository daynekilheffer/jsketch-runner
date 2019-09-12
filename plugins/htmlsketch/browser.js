/* global jsketch:true */
const htmlSketchapp = require('@brainly/html-sketchapp')

jsketch.addPlugin({
  beforeLayer: () => {},
  getLayers: async (node) => htmlSketchapp.nodeTreeToSketchGroup(node),
  afterLayer: () => {},
})
