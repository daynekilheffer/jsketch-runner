const normalizeColor = require('normalize-css-color')

const walkLayers = (layers, selector, fn) => {
  let workingSet = layers
  if (!Array.isArray(layers)) {
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
      },
      fills: [
        {
          _class: 'fill',
          isEnabled: true,
          color: {
            _class: 'color',
            alpha,
            blue,
            green,
            red,
          }
        }
      ]
    }
  })
}


const clearRectPoints = (layers) => {
  walkLayers(layers,
    layer => layer._class === 'rectangle',
    currentLayer => {
      Object.keys(currentLayer.path).filter(key => key !== '_class')
        .forEach(key =>
          currentLayer[key] = currentLayer.path[key]
      )
      delete currentLayer.path
    }
  )
}

module.exports = (layer) => {
  cleanText(layer)
  clearRectPoints(layer)
}
