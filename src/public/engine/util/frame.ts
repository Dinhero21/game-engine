import Vec2 from './vec2'
import Loop from './loop'
import { isNone, type None } from '../../none'
import { Debug, Frame as FrameGlobals } from '../../globals'

let color = 0

Loop.draw()(() => {
  color = 0
})

export type HTMLRenderingContext2D = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D
export type RenderingContext2D = Frame | HTMLRenderingContext2D

export class Frame {
  // TODO: (Optionally) use CanvasRenderingContext2D.translate
  public offset: Vec2 = new Vec2(0, 0)

  protected readonly context

  constructor (context: RenderingContext2D) {
    this.context = context
  }

  // Context properties

  public setFillStyle (fillStyle: HTMLRenderingContext2D['fillStyle']): this {
    const context = this.context

    if (context instanceof Frame) {
      context.setFillStyle(fillStyle)

      return this
    }

    context.fillStyle = fillStyle

    return this
  }

  public setStrokeStyle (strokeStyle: HTMLRenderingContext2D['strokeStyle']): this {
    const context = this.context

    if (context instanceof Frame) {
      context.setStrokeStyle(strokeStyle)

      return this
    }

    context.strokeStyle = strokeStyle

    return this
  }

  public setLineWidth (lineWidth: HTMLRenderingContext2D['lineWidth']): this {
    const context = this.context

    if (context instanceof Frame) {
      context.setLineWidth(lineWidth)

      return this
    }

    context.lineWidth = lineWidth

    return this
  }

  public setFont (font: HTMLRenderingContext2D['font']): this {
    const context = this.context

    if (context instanceof Frame) {
      context.setFont(font)

      return this
    }

    context.font = font

    return this
  }

  public setAlpha (globalAlpha: HTMLRenderingContext2D['globalAlpha']): this {
    const context = this.context

    if (context instanceof Frame) {
      context.setAlpha(globalAlpha)

      return this
    }

    context.globalAlpha = globalAlpha

    return this
  }

  // Context methods

  public _fillRect (x: number, y: number, w: number, h: number): this {
    const context = this.context

    const offset = this.offset

    const type = context instanceof Frame ? 'frame' : 'canvas'

    if (FrameGlobals.integer_approximation[type]) {
      x = Math.floor(x)
      y = Math.floor(y)
    }

    x += offset.x
    y += offset.y

    if (context instanceof Frame) {
      context._fillRect(x, y, w, h)

      return this
    }

    context.fillRect(x, y, w, h)

    return this
  }

  public _strokeRect (x: number, y: number, w: number, h: number): this {
    const context = this.context

    const offset = this.offset

    const type = context instanceof Frame ? 'frame' : 'canvas'

    if (FrameGlobals.integer_approximation[type]) {
      x = Math.floor(x)
      y = Math.floor(y)
    }

    x += offset.x
    y += offset.y

    if (context instanceof Frame) {
      context._strokeRect(x, y, w, h)

      return this
    }

    context.strokeRect(x, y, w, h)

    return this
  }

  public _beginPath (): this {
    const context = this.context

    if (context instanceof Frame) {
      context._beginPath()

      return this
    }

    context.beginPath()

    return this
  }

  public _moveTo (x: number, y: number): this {
    const context = this.context

    const offset = this.offset

    const type = context instanceof Frame ? 'frame' : 'canvas'

    if (FrameGlobals.integer_approximation[type]) {
      x = Math.floor(x)
      y = Math.floor(y)
    }

    x += offset.x
    y += offset.y

    if (context instanceof Frame) {
      context._moveTo(x, y)

      return this
    }

    context.moveTo(x, y)

    return this
  }

  public _lineTo (x: number, y: number): this {
    const context = this.context

    const offset = this.offset

    const type = context instanceof Frame ? 'frame' : 'canvas'

    if (FrameGlobals.integer_approximation[type]) {
      x = Math.floor(x)
      y = Math.floor(y)
    }

    x += offset.x
    y += offset.y

    if (context instanceof Frame) {
      context._lineTo(x, y)

      return this
    }

    context.lineTo(x, y)

    return this
  }

  public _stroke (): this {
    const context = this.context

    if (context instanceof Frame) {
      context._stroke()

      return this
    }

    context.stroke()

    return this
  }

  public _fillText (text: string, x: number, y: number, maxWidth?: number): this {
    const context = this.context

    const offset = this.offset

    const type = context instanceof Frame ? 'frame' : 'canvas'

    if (FrameGlobals.integer_approximation[type]) {
      x = Math.floor(x)
      y = Math.floor(y)
    }

    x += offset.x
    y += offset.y

    if (context instanceof Frame) {
      context._fillText(text, x, y, maxWidth)

      return this
    }

    context.fillText(text, x, y, maxWidth)

    return this
  }

  public _drawImage (image: CanvasImageSource, dx: number, dy: number, dw?: number, dh?: number, imageSmoothingEnabled: boolean = true): this {
    const context = this.context

    const offset = this.offset

    const type = context instanceof Frame ? 'frame' : 'canvas'

    if (FrameGlobals.integer_approximation[type]) {
      dx = Math.floor(dx)
      dy = Math.floor(dy)
      if (dw !== undefined) dw = Math.floor(dw)
      if (dh !== undefined) dh = Math.floor(dh)
    }

    dx += offset.x
    dy += offset.y

    if (context instanceof Frame) {
      context._drawImage(
        image,
        dx, dy,
        dw, dh,
        imageSmoothingEnabled
      )

      return this
    }

    const smoothing = context.imageSmoothingEnabled

    context.imageSmoothingEnabled = imageSmoothingEnabled

    // TODO: Find out if this really increases performance
    if (dw === undefined || dh === undefined) context.drawImage(image, dx, dy)
    else context.drawImage(image, dx, dy, dw, dh)

    context.imageSmoothingEnabled = smoothing

    if (Debug.frame.outline_drawImage) {
      let width = 0

      if ('width' in image) {
        if (typeof image.width === 'number') width = image.width
      }

      if ('getContext' in image) {
        const context = image.getContext('2d')

        if (context !== null) width = context.canvas.width
      }

      let height = 0

      if ('height' in image) {
        if (typeof image.height === 'number') height = image.height
      }

      if ('getContext' in image) {
        const context = image.getContext('2d')

        if (context !== null) height = context.canvas.height
      }

      dw ??= width
      dh ??= height

      color++

      this.drawFancyRectRGBA(
        dx, dy,
        dw, dh,
        [0xFF, 0x00, 0x00][color % 3],
        [0x00, 0xFF, 0x00][color % 3],
        [0x00, 0x00, 0xFF][color % 3],
        0.5,
        1
      )
    }

    return this
  }

  // High level methods

  public drawText (text: string, x: number, y: number, color: HTMLRenderingContext2D['fillStyle'] | None, font: HTMLRenderingContext2D['font'] | None, maxWidth?: number): this {
    if (!isNone(color)) this.setFillStyle(color)
    if (!isNone(font)) this.setFont(font)

    this._fillText(text, x, y, maxWidth)

    return this
  }

  public drawTextRGBA (text: string, x: number, y: number, r: number, g: number, b: number, a: number = 1, font: HTMLRenderingContext2D['font'] | None, maxWidth?: number): this {
    this.drawText(text, x, y, `rgba(${r},${g},${b},${a})`, font, maxWidth)

    return this
  }

  public drawLine (startX: number, startY: number, endX: number, endY: number, color: HTMLRenderingContext2D['strokeStyle'] | None, width: HTMLRenderingContext2D['lineWidth'] | None = 8): this {
    if (!isNone(color)) this.setStrokeStyle(color)
    if (!isNone(width)) this.setLineWidth(width)

    this._beginPath()
    this._moveTo(startX, startY)
    this._lineTo(endX, endY)
    this._stroke()

    return this
  }

  public drawLineRGBA (startX: number, startY: number, endX: number, endY: number, r: number, g: number, b: number, a: number = 1, width: HTMLRenderingContext2D['lineWidth'] | None = 8): this {
    this.drawLine(startX, startY, endX, endY, `rgba(${r},${g},${b},${a})`, width)

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
}

export default Frame
