import { isNone, type None } from '../../none.js'
import { Frame as FrameGlobals } from '../../globals.js'
import Vec2 from './vec2.js'

const INTEGER_APPROXIMATION = FrameGlobals.integer_approximation

export type HTMLRenderingContext2D = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D
export type RenderingContext2D = Frame | HTMLRenderingContext2D

export class Frame {
  private readonly queue: Array<(context: RenderingContext2D) => void> = []

  public offset: Vec2 = new Vec2(0, 0)

  // Context properties

  public setFillStyle (fillStyle: HTMLRenderingContext2D['fillStyle']): this {
    const queue = this.queue

    queue.push(context => {
      if (context instanceof Frame) {
        context.setFillStyle(fillStyle)

        return
      }

      context.fillStyle = fillStyle
    })

    return this
  }

  public setStrokeStyle (strokeStyle: HTMLRenderingContext2D['strokeStyle']): this {
    const queue = this.queue

    queue.push(context => {
      if (context instanceof Frame) {
        context.setStrokeStyle(strokeStyle)

        return
      }

      context.strokeStyle = strokeStyle
    })

    return this
  }

  public setLineWidth (lineWidth: HTMLRenderingContext2D['lineWidth']): this {
    const queue = this.queue

    queue.push(context => {
      if (context instanceof Frame) {
        context.setLineWidth(lineWidth)

        return
      }

      context.lineWidth = lineWidth
    })

    return this
  }

  public setFont (font: HTMLRenderingContext2D['font']): this {
    const queue = this.queue

    queue.push(context => {
      if (context instanceof Frame) {
        context.setFont(font)

        return
      }

      context.font = font
    })

    return this
  }

  // Context methods

  public _fillRect (x: number, y: number, w: number, h: number): this {
    const queue = this.queue

    if (INTEGER_APPROXIMATION) {
      x = Math.floor(x)
      y = Math.floor(y)
    }

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

    return this
  }

  public _strokeRect (x: number, y: number, w: number, h: number): this {
    const queue = this.queue

    if (INTEGER_APPROXIMATION) {
      x = Math.floor(x)
      y = Math.floor(y)
    }

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

    return this
  }

  public _drawImage (image: CanvasImageSource, x: number, y: number): this {
    const queue = this.queue

    if (INTEGER_APPROXIMATION) {
      x = Math.floor(x)
      y = Math.floor(y)
    }

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

    return this
  }

  public _beginPath (): this {
    const queue = this.queue

    queue.push(context => {
      if (context instanceof Frame) {
        context._beginPath()

        return
      }

      context.beginPath()
    })

    return this
  }

  public _moveTo (x: number, y: number): this {
    const queue = this.queue

    if (INTEGER_APPROXIMATION) {
      x = Math.floor(x)
      y = Math.floor(y)
    }

    queue.push(context => {
      const offset = this.offset

      x += offset.x
      y += offset.y

      if (context instanceof Frame) {
        context._moveTo(x, y)

        return
      }

      context.moveTo(x, y)
    })

    return this
  }

  public _lineTo (x: number, y: number): this {
    const queue = this.queue

    if (INTEGER_APPROXIMATION) {
      x = Math.floor(x)
      y = Math.floor(y)
    }

    queue.push(context => {
      const offset = this.offset

      x += offset.x
      y += offset.y

      if (context instanceof Frame) {
        context._lineTo(x, y)

        return
      }

      context.lineTo(x, y)
    })

    return this
  }

  public _stroke (): this {
    const queue = this.queue

    queue.push(context => {
      if (context instanceof Frame) {
        context._stroke()

        return
      }

      context.stroke()
    })

    return this
  }

  public _fillText (text: string, x: number, y: number, maxWidth?: number): this {
    const queue = this.queue

    if (INTEGER_APPROXIMATION) {
      x = Math.floor(x)
      y = Math.floor(y)
    }

    queue.push(context => {
      const offset = this.offset

      x += offset.x
      y += offset.y

      if (context instanceof Frame) {
        context._fillText(text, x, y, maxWidth)

        return
      }

      context.fillText(text, x, y, maxWidth)
    })

    return this
  }

  // High level methods

  public drawLine (startX: number, startY: number, endX: number, endY: number, color: HTMLRenderingContext2D['strokeStyle'] | None, width: HTMLRenderingContext2D['lineWidth'] | None = 8): this {
    if (!isNone(color)) this.setStrokeStyle(color)
    if (!isNone(width)) this.setLineWidth(width)

    this._beginPath()
    this._moveTo(startX, startY)
    this._lineTo(endX, endY)
    this._stroke()

    return this
  }

  public drawRect (x: number, y: number, w: number, h: number, color: HTMLRenderingContext2D['fillStyle'] | None): this {
    if (!isNone(color)) this.setFillStyle(color)

    this._fillRect(x, y, w, h)

    return this
  }

  public drawRectRGBA (x: number, y: number, w: number, h: number, r: number, g: number, b: number, a: number = 1): this {
    this.drawRect(x, y, w, h, `rgba(${r},${g},${b},${a})`)

    return this
  }

  public outlineRect (x: number, y: number, w: number, h: number, color: HTMLRenderingContext2D['fillStyle'] | None, outlineWidth: HTMLRenderingContext2D['lineWidth'] | None): this {
    if (!isNone(color)) this.setStrokeStyle(color)
    if (!isNone(outlineWidth)) this.setLineWidth(outlineWidth)

    this._strokeRect(x, y, w, h)

    return this
  }

  public outlineRectRGBA (x: number, y: number, w: number, h: number, r: number, g: number, b: number, a: number = 1, outlineWidth: HTMLRenderingContext2D['lineWidth'] | None): this {
    this.outlineRect(x, y, w, h, `rgba(${r},${g},${b},${a})`, outlineWidth)

    return this
  }

  public drawFancyRectRGBA (x: number, y: number, w: number, h: number, r: number, g: number, b: number, a: number = 1, outlineWidth: HTMLRenderingContext2D['lineWidth'] | None = 8): this {
    this.outlineRectRGBA(x, y, w, h, r, g, b, a, outlineWidth)
    this.drawRectRGBA(x, y, w, h, r, g, b, a * 0.20)

    return this
  }

  public draw (context: RenderingContext2D): this {
    for (const f of this.queue) f(context)

    return this
  }
}

export default Frame
