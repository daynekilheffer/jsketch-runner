/* global jsketch:true */
const htmlSketchapp = require('@brainly/html-sketchapp')

jsketch.addPlugin({
  beforeLayer: () => {},
  getLayers: async (node) => {
    const namingFn = node => node.className || node.nodeName
    const layers = htmlSketchapp.nodeTreeToSketchGroup(node, {
      getGroupName: namingFn,
      getRectangleName: namingFn,
    })
    layers.name = node.className
    return layers
  },
  afterLayer: () => {},
})
