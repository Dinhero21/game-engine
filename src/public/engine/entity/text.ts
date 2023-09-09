import type Frame from '../util/frame'
import Entity from '.'
import RectangularCollider from '../util/collision/rectangular'
import Vec2 from '../util/vec2'
import { setOrigin } from '../util/debug'

export interface FontOptions {
  style?: string
  weight?: string
  size?: number
  family?: string
}

export interface TextOptions {
  baseline?: CanvasTextBaseline
  style?: string
  width?: number
  height: number
  maxWidth?: number
  font?: FontOptions
}

// TODO: Metrics Caching
// TODO: Text Alignment (centered text)
export class TextEntity extends Entity<never> {
  protected canvas = new OffscreenCanvas(0, 0)

  public alpha: number = 1

  public text: string = ''
  public baseline: CanvasTextBaseline = 'middle'
  public fillStyle = 'white'

  public fontStyle = 'normal'
  public fontWeight = 'normal'
  public fontSize = 24
  public fontFamily = 'monospace'

  public width
  public height
  public maxWidth

  constructor (options: TextOptions) {
    super()

    setOrigin(this.canvas, `${this.constructor.name}.constructor`)

    if (options.baseline !== undefined) this.baseline = options.baseline
    if (options.style !== undefined) this.fillStyle = options.style

    const font = options.font

    if (font !== undefined) {
      if (font.style !== undefined) this.fontStyle = font.style
      if (font.weight !== undefined) this.fontWeight = font.weight
      if (font.size !== undefined) this.fontSize = font.size
      if (font.family !== undefined) this.fontFamily = font.family
    }

    this.width = options.width
    this.height = options.height
    this.maxWidth = options.maxWidth
  }

  public configureContext (): void {
    const canvas = this.canvas
    const context = canvas.getContext('2d')

    if (context === null) return

    const fontStyle = this.fontStyle
    const fontWeight = this.fontWeight
    const fontSize = String(this.fontSize) + 'px'
    const fontFamily = this.fontFamily

    const font = [
      fontStyle,
      fontWeight,
      fontSize,
      fontFamily
    ].join(' ')

    context.font = font
    context.fillStyle = this.fillStyle
    context.textBaseline = this.baseline
  }

  protected getMetrics (): TextMetrics | undefined {
    const canvas = this.canvas
    const context = canvas.getContext('2d')

    if (context === null) return

    const text = this.text

    const metrics = context.measureText(text)

    return metrics
  }

  protected getTextBoundingBox (): RectangularCollider | undefined {
    const metrics = this.getMetrics()

    if (metrics === undefined) return

    const left = metrics.actualBoundingBoxLeft
    const ascend = metrics.actualBoundingBoxAscent
    const right = metrics.actualBoundingBoxRight
    const bottom = metrics.actualBoundingBoxDescent

    const position = new Vec2(
      -left,
      -ascend
    )

    const size = new Vec2(
      right + left,
      bottom + ascend
    )

    return new RectangularCollider(position, size)
  }

  protected getTextPosition (): Vec2 {
    // const width = this.width
    const height = this.height

    const x = 0

    let y = 0

    switch (this.baseline) {
      case 'top':
        y = 0
        break
      case 'middle':
        y = height / 2
        break
      case 'bottom':
        y = height
        break
    }

    return new Vec2(x, y)
  }

  // TODO: Make collider adjust with options
  public getConstantCollider (): RectangularCollider {
    let width = this.width
    const height = this.height

    if (width === undefined) {
      const metrics = this.getMetrics()

      if (metrics === undefined) throw new Error('metrics undefined')

      width = metrics.width
    }

    return new RectangularCollider(
      new Vec2(0, 0),
      new Vec2(width, height)
    )
  }

  public draw (frame: Frame): void {
    super.draw(frame)

    const canvas = this.canvas
    const context = canvas.getContext('2d')

    // ? Should I throw an error here?
    if (context === null) return

    this.configureContext()

    const textBoundingBox = this.getTextBoundingBox()

    if (textBoundingBox === undefined) return

    const textBoundingBoxPosition = textBoundingBox.getPosition()
    const textBoundingBoxSize = textBoundingBox.getSize()

    canvas.width = textBoundingBoxSize.x
    canvas.height = textBoundingBoxSize.y

    this.configureContext()

    context.clearRect(
      0, 0,
      canvas.width, canvas.height
    )

    const text = this.text
    const maxWidth = this.maxWidth

    context.fillText(text, -textBoundingBoxPosition.x, -textBoundingBoxPosition.y, maxWidth)

    // * You can not render a canvas that has 0 width or height

    if (canvas.height === 0 || canvas.width === 0) return

    const textPosition = this.getTextPosition()

    const alpha = this.alpha

    frame.setAlpha(alpha)

    frame._drawImage(
      canvas,
      textPosition.x + textBoundingBoxPosition.x,
      textPosition.y + textBoundingBoxPosition.y
    )
  }
}

export default TextEntity
