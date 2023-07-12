import type Frame from '../util/frame'
import Entity from '.'
import RectangularCollider from '../util/collision/rectangular'
import Vec2 from '../util/vec2'

export interface TextOptions {
  baseline?: CanvasTextBaseline
  size?: number
  type?: string
  style?: string
  width: number
  height: number
}

// TODO: Metrics Caching
// TODO: Text Alignment (centered text)
export class TextEntity extends Entity<never> {
  protected canvas = new OffscreenCanvas(0, 0)

  public text: string = ''
  public fontSize = 24
  public fontType = 'monospace'
  public fillStyle = 'white'
  public baseline: CanvasTextBaseline = 'middle'

  public width
  public height

  constructor (options: TextOptions) {
    super()

    if (options.baseline !== undefined) this.baseline = options.baseline
    if (options.size !== undefined) this.fontSize = options.size
    if (options.type !== undefined) this.fontType = options.type
    if (options.style !== undefined) this.fillStyle = options.style

    this.width = options.width
    this.height = options.height
  }

  protected getMetrics (): TextMetrics | undefined {
    const canvas = this.canvas
    const context = canvas.getContext('2d')

    if (context === null) return

    const text = this.text

    const metrics = context.measureText(text)

    return metrics
  }

  // public getTextBoundingBox (): RectangularCollider | undefined {
  //   const metrics = this.getMetrics()

  //   if (metrics === undefined) return

  //   const left = metrics.actualBoundingBoxLeft
  //   const ascend = metrics.actualBoundingBoxAscent
  //   const right = metrics.actualBoundingBoxRight
  //   const bottom = metrics.actualBoundingBoxDescent

  //   const position = new Vec2(
  //     -left,
  //     -ascend
  //   )

  //   const size = new Vec2(
  //     right + left,
  //     bottom + ascend
  //   )

  //   return new RectangularCollider(position, size)
  // }

  public getTextPosition (): Vec2 {
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
    const width = this.width
    const height = this.height

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

    canvas.width = this.width
    canvas.height = this.height

    context.font = `${String(this.fontSize)}px ${this.fontType}`
    context.fillStyle = this.fillStyle
    context.textBaseline = this.baseline

    context.clearRect(0, 0, canvas.width, canvas.height)

    const textPosition = this.getTextPosition()

    const text = this.text

    context.fillText(text, textPosition.x, textPosition.y)

    // * You can not render a canvas that has 0 width or height

    if (canvas.height === 0 || canvas.width === 0) return

    frame._drawImage(canvas, 0, 0)
  }
}

export default TextEntity
