import { Inventory as BaseInventory, Slot, type SlotId, type SlotType } from './public/game/util/inventory.js'
import { TypedEmitter } from 'tiny-typed-emitter'

// TODO: Managed Slots (instead of InventoryManager firing when Inventory.setItem is called, InventoryManager firing when SlotManger fires and SlotManager firing when Slot.setType is called)

export interface InventoryEvents {
  'slot.update': (id: SlotId, after: SlotType, before: SlotType | undefined) => void
}

export class InventoryManager extends TypedEmitter<InventoryEvents> {}

export class Inventory extends BaseInventory {
  public manager: InventoryManager = new InventoryManager()

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

    this.manager.emit('slot.update', id, after, before)

    return super.setItem(id, type)
  }
}

export default Inventory
