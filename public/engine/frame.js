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

  fillRect (x, y, w, h) {
    const queue = this.#queue

    queue.push(context => {
      const offset = this.offset

      x += offset.x
      y += offset.y

      if (context instanceof Frame) {
        context.fillRect(x, y, w, h)

        return
      }

      context.fillRect(x, y, w, h)
    })
  }

  strokeRect (x, y, w, h) {
    const queue = this.#queue

    queue.push(context => {
      const offset = this.offset

      x += offset.x
      y += offset.y

      if (context instanceof Frame) {
        context.strokeRect(x, y, w, h)

        return
      }

      context.strokeRect(x, y, w, h)
    })
  }

  drawImage (image, x, y) {
    const queue = this.#queue

    queue.push(context => {
      const offset = this.offset

      x += offset.x
      y += offset.y

      if (context instanceof Frame) {
        context.drawImage(image, x, y)

        return
      }

      context.drawImage(image, x, y)
    })
  }

  // Higher level methods

  drawRect (x, y, w, h, color) {
    if (color !== undefined && color !== null) this.setFillStyle(color)
    this.fillRect(x, y, w, h)
  }

  outlineRect (x, y, w, h, color, size) {
    if (color !== undefined && color !== null) this.setStrokeStyle(color)
    if (size !== undefined && size !== null) this.setLineWidth(size)
    this.strokeRect(x, y, w, h)
  }

  draw (context) {
    for (const f of this.#queue) f(context)
  }
}

export default Frame
