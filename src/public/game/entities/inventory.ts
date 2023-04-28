import { loader } from '../../assets/loader.js'
import GridContainerEntity from '../../engine/entities/grid-container.js'
import type Frame from '../../engine/util/frame.js'
import Vec2 from '../../engine/util/vec2.js'
import { type SlotType } from '../slot.js'
import SlotEntity from './slot.js'

// TODO: Make this configurable
const ITEM_SIZE = new Vec2(64, 64)
const SLOT_PADDING_SIZE = new Vec2(16, 16)

export type SlotFilter = string | ((slot: SlotEntity) => boolean)

export class InventoryEntity extends GridContainerEntity<SlotEntity> {
  protected cursorItem: string | null = 'sus'

  constructor (size: Vec2, spacing: Vec2, padding: Vec2) {
    super(size, spacing, padding, (x, y) => {
      const position = new Vec2(x, y)

      const slot = new SlotEntity(ITEM_SIZE, SLOT_PADDING_SIZE)

      const manager = slot.manager

      // Swap cursor slot to slot
      manager.addEventListener('left.up', () => {
        this.swapWithCursor(position)
      })

      return slot
    })
  }

  public draw (frame: Frame): void {
    const collider = this.getConstantCollider()
    const position = collider.getPosition()
    const size = collider.getSize()

    console.log(position)

    frame.drawRect(position.x, position.y, size.x, size.y, '#9d9d9d')

    super.draw(frame)

    this.drawCursorItem(frame)
  }

  // ? Should I make the cursor item a slot or implement my own logic (on the Inventory) for it?
  protected drawCursorItem (frame: Frame): void {
    const type = this.cursorItem

    if (type === null) return

    const mousePosition = this.getMouseParentRelativePosition()

    if (mousePosition === undefined) return

    const image = loader.getTexture(type)

    frame._drawImage(image, mousePosition.x - ITEM_SIZE.x / 2, mousePosition.y - ITEM_SIZE.y / 2, ITEM_SIZE.x, ITEM_SIZE.y, false)
  }

  public getSlot (id: number | Vec2): SlotEntity | undefined {
    return this.getGridItem(id)
  }

  public setSlot (id: number | Vec2, type: SlotType): void {
    const slot = this.getGridItem(id)

    if (slot === undefined) return

    slot.type = type
  }

  // ? Should I make this public or protected (or private)?
  public swapWithCursor (id: number | Vec2): void {
    const slot = this.getGridItem(id)

    if (slot === undefined) return

    [this.cursorItem, slot.type] = [slot.type, this.cursorItem]
  }

  // public getSlots (filter: SlotFilter = () => true): SlotEntity[] {
  //   if (typeof filter === 'string') filter = (slot: SlotEntity) => slot.type === filter

  //   const slots = this.getGridItems()

  //   return slots.filter(filter)
  // }

  // public findSlot (filter: SlotFilter): SlotEntity | undefined {
  //   if (typeof filter === 'string') filter = (slot: SlotEntity) => slot.type === filter

  //   const slots = this.getGridItems()

  //   return slots.find(filter)
  // }

  // public findSlotId (filter: SlotFilter): number | undefined {
  //   if (typeof filter === 'string') filter = (slot: SlotEntity) => slot.type === filter

  //   const slots = this.getGridItems()

  //   return slots.findIndex(filter)
  // }
}

export default InventoryEntity
