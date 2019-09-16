const normalizeColor = require('normalize-css-color')

const UnknownLayer = require('./unknown-layer')

const visitLayers = (layers, parent, selector, fn) => {
  layers.forEach((layer, idx) => {
    selector(layer, parent) && fn(layer, parent, idx)
    layer.layers && visitLayers(layer.layers, layer, selector, fn)
  })
}
const walkLayers = (layers, selector, fn) => {
  layers.forEach(layer => {
    selector(layer) && fn(layer)
    visitLayers(layer.layers, layer, selector, fn)
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
            alpha: alpha === undefined ? 1 : alpha,
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

const createInstances = symboldb =>
  (layer) => {
    if (symboldb.has(layer.name)) {
      const inst = symboldb.get(layer.name).createInstance()
      inst.x = layer.x
      inst.y = layer.y
      return inst
    }
    visitLayers(layer.layers, layer, () => true, (layer, parent, idx) => {
      if (symboldb.has(layer.name)) {
        const inst = symboldb.get(layer.name).createInstance()
        inst.x = layer.x
        inst.y = layer.y
        parent.layers.splice(idx, 1, inst)
      }
    })
    return layer
  }

module.exports = (layer, { symboldb }) => {
  let workspace = layer
  if (!Array.isArray(layer)) {
    workspace = [layer]
  }
  cleanText(workspace)
  clearRectPoints(workspace)

  const wrapperLayers = workspace
    .map(layer => new UnknownLayer(layer))
    .map(createInstances(symboldb))

  return Array.isArray(layer) ? wrapperLayers : wrapperLayers[0]
}
