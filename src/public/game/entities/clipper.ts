import type Vec2 from '../../engine/util/vec2.js'
import Entity from '../../engine/entities/index.js'
import RectangularCollider from '../../engine/util/collision/rectangular.js'
import Frame from '../../engine/util/frame.js'

export class ClippingEntity extends Entity {
  protected offset
  protected size

  constructor (offset: Vec2, size: Vec2) {
    super()

    this.offset = offset
    this.size = size
  }

  public getConstantCollider (): RectangularCollider {
    return new RectangularCollider(this.offset, this.size)
  }

  public draw (frame: Frame): void {
    const size = this.size

    const subFrame = new Frame()
    subFrame.offset = this.offset

    super.draw(subFrame)

    const canvas = new OffscreenCanvas(size.x, size.y)
    const context = canvas.getContext('2d')

    if (context === null) throw new Error('Failed to get canvas context')

    subFrame.draw(context)

    frame._drawImage(canvas, 0, 0, this.size.x, this.size.y, false)
  }
}

export default ClippingEntity
