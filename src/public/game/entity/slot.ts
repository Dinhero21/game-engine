import type Frame from '../../engine/util/frame'
import { type SlotType } from '../../shared/inventory'
import { loader } from '../../asset/loader'
import ButtonEntity from '../../engine/entity/button'
import Vec2 from '../../engine/util/vec2'
import RectangularCollider from '../../engine/util/collision/rectangular'

// ? Should I make rendering the "backplate" of the Slot the SlotEntity's responsibility?
export class SlotEntity extends ButtonEntity {
  public readonly size
  public readonly padding

  constructor (size: Vec2, padding: Vec2) {
    super(size)

    this.size = size
    this.padding = padding
  }

  public draw (frame: Frame): void {
    super.draw(frame)

    this.drawBackground(frame)
    this.drawItem(frame)
    this.drawForeground(frame)
  }

  protected drawBackground (frame: Frame): void {
    const collider = this.getConstantCollider()
    const colliderPosition = collider.getPosition()
    const colliderSize = collider.getSize()

    frame.drawRect(
      colliderPosition.x, colliderPosition.y,
      colliderSize.x, colliderSize.y,
      // TODO: Find a better color for this
      '#0F0F0F'
    )
  }

  public type: SlotType = null
  public amount: number = 0

  protected drawItem (frame: Frame): void {
    this.drawItemType(frame)
    this.drawItemAmount(frame)
  }

  protected drawItemType (frame: Frame): void {
    const size = this.size
    const padding = this.padding
    const type = this.type

    if (type === null) return

    const image = loader.getItemTexture(type)

    frame._drawImage(
      image,
      padding.x, padding.y,
      size.x, size.y,
      false
    )
  }

  protected drawItemAmount (frame: Frame): void {
    const size = this.size
    const padding = this.padding
    const amount = this.amount

    if (amount === 0 || amount === 1) return

    frame.drawText(`${amount}`, padding.x, padding.y + size.y, 'white', '32px monospace')
  }

  public outlineColor?: string

  protected drawForeground (frame: Frame): void {
    const collider = this.getConstantCollider()
    const colliderPosition = collider.getPosition()
    const colliderSize = collider.getSize()

    const manager = this.manager
    const isHovering = manager.isMouseInside()

    if (isHovering) {
      frame.drawRect(
        colliderPosition.x, colliderPosition.y,
        colliderSize.x, colliderSize.y,
        '#FFFFFF0F'
      )
    }

    const outlineColor = this.outlineColor

    if (outlineColor !== undefined) {
      frame.outlineRect(
        colliderPosition.x, colliderPosition.y,
        colliderSize.x, colliderSize.y,
        outlineColor,
        8
      )
    }
  }

  public getConstantCollider (): RectangularCollider {
    const size = this.size
    const padding = this.padding

    return new RectangularCollider(Vec2.ZERO, size.plus(padding.scaled(2)))
  }
}

export default SlotEntity
