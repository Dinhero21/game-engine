import { Inventory as BaseInventory, Slot, type Stack, type SlotId, type SlotType, type SlotAmount } from './public/game/util/inventory.js'
import { TypedEmitter } from 'tiny-typed-emitter'

export interface SlotEvents {
  'type.update': (type: SlotType) => void
  'amount.update': (amount: SlotAmount) => void
}

export class SlotManger extends TypedEmitter<SlotEvents> {}

export class ManagedSlot extends Slot {
  public manager = new SlotManger()

  public setType (type: SlotType): void {
    super.setType(type)

    this.manager.emit('type.update', type)
  }

  public setAmount (amount: SlotAmount): void {
    super.setAmount(amount)

    this.manager.emit('amount.update', amount)
  }
}

export interface InventoryEvents {
  'slot.update': (id: SlotId, stack: Stack) => void
}

export class InventoryManager extends TypedEmitter<InventoryEvents> {}

export class Inventory extends BaseInventory {
  public manager: InventoryManager = new InventoryManager()

  constructor (size: number) {
    super()

    for (let i = 0; i < size; i++) this._createSlot(i)

    // Cursor Slot
    this._createSlot(-1)
  }

  protected _createSlot (id: SlotId): void {
    const slot = new ManagedSlot()

    slot.manager.on('type.update', () => {
      this.manager.emit('slot.update', id, slot.getStack())
    })

    slot.manager.on('amount.update', () => {
      this.manager.emit('slot.update', id, slot.getStack())
    })

    this.slots.set(id, slot)
  }
}

export default Inventory
