import type Frame from '../../engine/util/frame.js'
import Vec2 from '../../engine/util/vec2.js'
import SlotEntity from './slot.js'
import { Inventory, Slot, type SlotId, type SlotType } from '../util/inventory.js'
import { TypedEventTarget } from '../../engine/util/typed-event-target.js'
import { loader } from '../../assets/loader.js'
import GridContainerEntity from '../../engine/entities/grid-container.js'

// TODO: Managed Slots (instead of InventoryManager firing when Inventory.setItem is called, InventoryManager firing when SlotManger fires and SlotManager firing when Slot.setType is called)

export class SlotUpdateEvent extends Event {
  public readonly before
  public readonly after
  public readonly id
  public readonly slot

  constructor ({ before, after, id, slot }: { before: SlotType | undefined, after: SlotType, id: number, slot: Slot | undefined }) {
    super('slot.update')

    this.before = before
    this.after = after
    this.id = id
    this.slot = slot
  }
}

export interface InventoryManagerEventMap {
  'slot.update': SlotUpdateEvent
}

export class InventoryManager extends TypedEventTarget<InventoryManagerEventMap> {}

export class ManagedInventory extends Inventory {
  public readonly manager = new InventoryManager()

  constructor (size: number) {
    super()

    const slots = this.slots

    for (let i = 0; i < size; i++) slots.set(i, new Slot())

    // Cursor Slot
    slots.set(-1, new Slot())
  }

  public setItem (id: SlotId, type: SlotType): boolean {
    const slot = this.getSlot(id)

    const before = slot?.getType()
    const after = type

    this.manager.dispatchTypedEvent('slot.update', new SlotUpdateEvent({
      before,
      after,
      id,
      slot
    }))

    return super.setItem(id, type)
  }
}

export class InventoryEntity extends GridContainerEntity<SlotEntity> {
  public readonly itemSize
  public readonly slotPadding

  public readonly inventory

  constructor (size: Vec2, spacing: Vec2, padding: Vec2, itemSize: Vec2, slotPadding: Vec2) {
    super(size, spacing, padding, () => new SlotEntity(itemSize, slotPadding))

    this.itemSize = itemSize
    this.slotPadding = slotPadding

    const inventory = new ManagedInventory(size.x * size.y)
    this.inventory = inventory

    const manager = inventory.manager

    manager.addEventListener('slot.update', event => {
      const id = event.id

      // Cursor Slot
      if (id === -1) return

      const x = id % size.x
      const y = Math.floor(id / size.x)

      const slot = this.getGridItem(new Vec2(x, y))

      // ? Should I throw an error
      if (slot === undefined) throw new Error(`slot.update emitted with invalid id (${id}) (${x}, ${y})`)

      slot.type = event.after
    })
  }

  public draw (frame: Frame): void {
    const collider = this.getConstantCollider()
    const position = collider.getPosition()
    const size = collider.getSize()

    frame._drawImage(loader.getTexture('inventory/background'), position.x, position.y, size.x, size.y)

    super.draw(frame)

    this.drawCursorItem(frame)
  }

  // ? Should I make the cursor item a slot or implement my own logic (in the Inventory) for it?
  protected drawCursorItem (frame: Frame): void {
    const slot = this.inventory.getSlot(-1)

    if (slot === undefined) return

    const type = slot.getType()

    if (type === null) return

    const mousePosition = this.getMouseParentRelativePosition()

    if (mousePosition === undefined) return

    const image = loader.getTexture(type)

    const itemSize = this.itemSize

    frame._drawImage(image, mousePosition.x - itemSize.x / 2, mousePosition.y - itemSize.y / 2, itemSize.x, itemSize.y, false)
  }
}

export default InventoryEntity
