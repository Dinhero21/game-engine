import Vec2 from './vec2.js'

export class Frame {
  #queue = []
  offset = new Vec2(0, 0)

  // Context properties

  setFillStyle (fillStyle) {
    const queue = this.#queue

    queue.push(context => {
      if (context instanceof Frame) context.setFillStyle(fillStyle)

      context.fillStyle = fillStyle
    })
  }

  setStrokeStyle (strokeStyle) {
    const queue = this.#queue

    queue.push(context => {
      if (context instanceof Frame) {
        context.setStrokeStyle(strokeStyle)

        return
      }

      context.strokeStyle = strokeStyle
    })
  }

  setLineWidth (lineWidth) {
    const queue = this.#queue

    queue.push(context => {
      if (context instanceof Frame) {
        context.setLineWidth(lineWidth)

        return
      }

      context.lineWidth = lineWidth
    })
  }

  // Context methods

  _fillRect (x, y, w, h) {
    const queue = this.#queue

    queue.push(context => {
      const offset = this.offset

      x += offset.x
      y += offset.y

      if (context instanceof Frame) {
        context._fillRect(x, y, w, h)

        return
      }

      context.fillRect(x, y, w, h)
    })
  }

  _strokeRect (x, y, w, h) {
    const queue = this.#queue

    queue.push(context => {
      const offset = this.offset

      x += offset.x
      y += offset.y

      if (context instanceof Frame) {
        context._strokeRect(x, y, w, h)

        return
      }

      context.strokeRect(x, y, w, h)
    })
  }

  _drawImage (image, x, y) {
    const queue = this.#queue

    queue.push(context => {
      const offset = this.offset

      x += offset.x
      y += offset.y

      if (context instanceof Frame) {
        context._drawImage(image, x, y)

        return
      }

      context.drawImage(image, x, y)
    })
  }

  // Higher level methods

  drawRect (x, y, w, h, color) {
    if (color !== undefined && color !== null) this.setFillStyle(color)
    this._fillRect(x, y, w, h)
  }

  outlineRect (x, y, w, h, color, size) {
    if (color !== undefined && color !== null) this.setStrokeStyle(color)
    if (size !== undefined && size !== null) this.setLineWidth(size)
    this._strokeRect(x, y, w, h)
  }

  drawRectRGBA (x, y, w, h, r, g, b, a = 1) {
    this.drawRect(x, y, w, h, `rgba(${r},${g},${b},${a})`)
  }

  outlineRectRGBA (x, y, w, h, r, g, b, a = 1, size) {
    this.outlineRect(x, y, w, h, `rgba(${r},${g},${b},${a})`, size)
  }

  drawFancyRectRGBA (x, y, w, h, r, g, b, a = 1, outlineSize = 8) {
    this.outlineRectRGBA(x, y, w, h, r, g, b, a, outlineSize)
    this.drawRectRGBA(x, y, w, h, r, g, b, a * 0.20)
  }

  draw (context) {
    for (const f of this.#queue) f(context)
  }
}

export default Frame
