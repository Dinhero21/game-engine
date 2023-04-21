import { type SlotType, type ISlot } from '../slot.js'
import type Frame from '../../engine/util/frame.js'
import { loader } from '../../assets/loader.js'
import Vec2 from '../../engine/util/vec2.js'
import Entity from '../../engine/entities/index.js'
import RectangularCollider from '../../engine/util/collision/rectangular.js'

export class SlotEntity extends Entity<never> implements ISlot {
  protected size
  protected padding

  public type: SlotType = null

  constructor (size: Vec2, padding: Vec2) {
    super()

    this.size = size
    this.padding = padding
  }

  public draw (frame: Frame): void {
    super.draw(frame)

    const size = this.size
    const padding = this.padding
    const type = this.type

    if (type !== null) {
      const image = loader.getTexture(type)

      frame._drawImage(image, padding.x, padding.y, size.x, size.y, false)
    }

    frame.drawText('Item Type:', 0, 0 + 16, 'white', '16px cursive')

    if (type === null) {
      frame.drawText('Empty', 0, 16 + 24, '#ABB2BF', '24px cursive')

      return
    }

    frame.drawText(type, 0, 16 + 24, 'white', '24px cursive')
  }

  public getConstantCollider (): RectangularCollider {
    const size = this.size
    const padding = this.padding

    return new RectangularCollider(new Vec2(0, 0), size.plus(padding.scaled(2)))
  }
}

export default SlotEntity
