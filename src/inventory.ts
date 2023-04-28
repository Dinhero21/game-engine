import { type Slot, type SlotType, type SlotFilter } from './public/game/slot.js'
import { TypedEmitter } from 'tiny-typed-emitter'
import Vec2 from './public/engine/util/vec2.js'

export interface InventoryEvents {
  'update': (slot: Slot, oldType: SlotType | undefined, newType: SlotType) => void
}

export class Inventory extends TypedEmitter<InventoryEvents> {
  private readonly slots = new Map<number, SlotType>()

  public size

  constructor (size: Vec2) {
    super()

    this.size = size

    for (let x = 0; x < size.x; x++) {
      for (let y = 0; y < size.y; y++) {
        this.setSlot(new Vec2(x, y), null)
      }
    }
  }

  public getSlotId (slot: Slot): number {
    const size = this.size
    if (slot instanceof Vec2) slot = slot.x + slot.y * size.x

    return slot
  }

  public getSlotPosition (slot: Slot): Vec2 {
    const size = this.size
    if (typeof slot === 'number') {
      slot = new Vec2(
        Math.floor(slot / size.x),
        Math.floor(slot % size.x)
      )
    }

    return slot
  }

  public getSlotArray (): SlotType[] {
    return Array.from(this.slots.values())
  }

  public setSlot (slot: Slot, type: SlotType): void {
    const slotId = this.getSlotId(slot)

    const oldType = this.getSlot(slot)

    this.slots.set(slotId, type)

    this.emit('update', slot, oldType, type)
  }

  public getSlot (slot: Slot): SlotType | undefined {
    const slotId = this.getSlotId(slot)

    return this.slots.get(slotId)
  }

  public findSlot (filter: SlotFilter): SlotType | undefined {
    if (typeof filter === 'string' || filter === null) filter = (type: SlotType) => type === filter

    const slots = this.getSlotArray()

    return slots.find(filter)
  }

  public findSlotId (filter: SlotFilter): number | undefined {
    if (typeof filter === 'string' || filter === null) filter = (type: SlotType) => type === filter

    const slots = this.getSlotArray()

    return slots.findIndex(filter)
  }

  public clear (): void {
    this.slots.clear()
  }

  public isEmpty (): boolean {
    return this.getSlotArray().every(type => type === null)
  }

  public isFull (): boolean {
    return this.findSlot(null) === undefined
  }

  public addItem (item: SlotType): boolean {
    const size = this.size

    for (let y = 0; y < size.y; y++) {
      for (let x = 0; x < size.x; x++) {
        const position = new Vec2(x, y)
        const slot = this.getSlot(position)

        if (slot !== null) continue

        this.setSlot(position, item)

        return true
      }
    }

    return false
  }
}

export default Inventory
