import { type SlotType, type ISlot } from '../slot.js'
import ButtonEntity, { type IButtonEntity } from '../../engine/entities/button.js'
import type Frame from '../../engine/util/frame.js'
import { loader } from '../../assets/loader.js'
import Vec2 from '../../engine/util/vec2.js'
import RectangularCollider from '../../engine/util/collision/rectangular.js'

// ? Should I make rendering the "backplate" of the Slot the SlotEntity's responsibility?
export class SlotEntity extends ButtonEntity implements ISlot, IButtonEntity {
  protected size
  protected padding

  public type: SlotType = null

  constructor (size: Vec2, padding: Vec2) {
    super(size)

    this.size = size
    this.padding = padding
  }

  public draw (frame: Frame): void {
    super.draw(frame)

    this.drawBackground(frame)
    this.drawItem(frame)
    this.drawGlow(frame)
  }

  protected drawBackground (frame: Frame): void {
    const collider = this.getConstantCollider()
    const colliderPosition = collider.getPosition()
    const colliderSize = collider.getSize()

    const slot = loader.getTexture('slot')

    frame._drawImage(slot, colliderPosition.x, colliderPosition.y, colliderSize.x, colliderSize.y, false)
  }

  protected drawItem (frame: Frame): void {
    const itemSize = this.size
    const itemPadding = this.padding
    const itemType = this.type

    if (itemType !== null) {
      const image = loader.getTexture(itemType)

      frame._drawImage(image, itemPadding.x, itemPadding.y, itemSize.x, itemSize.y, false)
    }
  }

  protected drawGlow (frame: Frame): void {
    const manager = this.manager
    const isHovering = manager.isMouseInside()

    if (isHovering) {
      const collider = this.getConstantCollider()
      const colliderPosition = collider.getPosition()
      const colliderSize = collider.getSize()

      frame.drawRectRGBA(colliderPosition.x, colliderPosition.y, colliderSize.x, colliderSize.y, 0xFF, 0xFF, 0xFF, 0.2)
    }
  }

  public getConstantCollider (): RectangularCollider {
    const size = this.size
    const padding = this.padding

    return new RectangularCollider(new Vec2(0, 0), size.plus(padding.scaled(2)))
  }
}

export default SlotEntity
