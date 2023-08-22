import type Vec2 from '../util/vec2'
import Entity from '.'
import RectangularCollider from '../util/collision/rectangular'
import Frame from '../util/frame'
import { setOrigin } from '../../game/util/debug'

export class ClippingEntity extends Entity {
  protected offset
  protected size

  constructor (offset: Vec2, size: Vec2) {
    super()

    this.offset = offset
    this.size = size
  }

  // ! See https://stackoverflow.com/questions/63138513/canvas-drawimage-slow-first-time-another-canvas-is-used-as-the-source-argument
  protected readonly CANVAS = setOrigin(new OffscreenCanvas(0, 0), `${this.constructor.name}.draw`)
  protected readonly CONTEXT = this.CANVAS.getContext('2d')

  public getConstantCollider (): RectangularCollider {
    return new RectangularCollider(this.offset, this.size)
  }

  // This code is not on draw because it takes over 15 milliseconds to drawImage this.CANVAS after being called
  // ! See https://stackoverflow.com/questions/63138513/canvas-drawimage-slow-first-time-another-canvas-is-used-as-the-source-argument
  public render (): void {
    const size = this.size

    const subFrame = new Frame()
    subFrame.offset = this.offset

    super.draw(subFrame)

    const canvas = this.CANVAS
    if (canvas.width !== size.x) canvas.width = size.x
    if (canvas.height !== size.y) canvas.height = size.y

    const context = this.CONTEXT

    if (context === null) throw new Error('Failed to get canvas context')

    context.clearRect(
      0, 0,
      size.x, size.y
    )

    subFrame.draw(context)
  }

  public draw (frame: Frame): void {
    const canvas = this.CANVAS

    if (canvas.width === 0) return
    if (canvas.height === 0) return

    frame._drawImage(
      canvas,
      0, 0,
      undefined, undefined,
      false
    )
  }
}

export default ClippingEntity
