/* global jsketch:true */
const htmlSketchapp = require('@brainly/html-sketchapp')
const normalizeColor = require('normalize-color-css')

const walkLayers = (layers, selector, fn) => {
  let workingSet = layers
  if (typeof workingSet === 'object') {
    workingSet = [layers]
  }
  workingSet.forEach(layer => {
    selector(layer) && fn(layer)
    layer.layers && walkLayers(layer.layers, selector, fn)
  })
}

const cleanText = (layers) => {
  walkLayers(layers, layer => layer._class === 'text', currentLayer => {
    const text = currentLayer.text
    const colorStr = currentLayer.style.color

    const nullableColor = normalizeColor(colorStr);
    const colorInt = nullableColor === null ? 0x00000000 : nullableColor;
    const {red, green, blue, alpha} = normalizeColor.rgba(colorInt);

    const attributes = {
      MSAttributedStringFontAttribute: {
        _class: 'fontDescriptor',
        attributes: { name: currentLayer.style.fontFamily, size: currentLayer.style.fontSize }
      },
      MSAttributedStringColorAttribute: {
        _class: 'color',
        alpha,
        blue,
        green,
        red,
      },
    }

    currentLayer.attributedString = {
      _class: 'attributedString',
      string: text,
      attributes: [
        {
          _class: 'stringAttribute',
          location: 0,
          length: text.length,
          attributes,
        }
      ]
    }
    currentLayer.style = {
      _class: 'style',
      endMarkerType: 0,
      miterLimit: 10,
      startMarkerType: 0,
      textStyle: {
        _class: 'textStyle',
        encodedAttributes: attributes,
      }
    }
  })
}

const clean = layer => {
  const raw = layer.toJSON()
  cleanText(raw)
  return raw
}


jsketch.addPlugin({
  beforeLayer: () => {},
  getLayers: async (node) => {
    const layers = htmlSketchapp.nodeToSketchLayers(node)
    return layers.map(clean)
  },
  afterLayer: () => {},
})
