// string    = item
// null      = nothing
// undefined = does not exist
export type SlotType = string | null
export type SlotId = number

export class Slot {
  protected type: SlotType = null

  public setType (type: SlotType): void {
    this.type = type
  }

  public getType (): SlotType {
    return this.type
  }
}

export type NormalizedSlotPredicate = (slot: Slot) => boolean
export type SlotPredicate = NormalizedSlotPredicate | SlotType

export function normalizeSlotPredicate (predicate: SlotPredicate): NormalizedSlotPredicate {
  if (typeof predicate === 'function') return predicate

  return slot => slot.getType() === predicate
}

export class Inventory {
  protected readonly slots = new Map<number, Slot>()

  public getSlotMap (): Map<number, Slot> {
    return this.slots
  }

  public getSlots (): IterableIterator<Slot> {
    return this.getSlotMap().values()
  }

  public getSlot (id: SlotId): Slot | undefined {
    return this.getSlotMap().get(id)
  }

  public findSlotAndId (predicate: SlotPredicate): [SlotId, Slot] | undefined {
    predicate = normalizeSlotPredicate(predicate)

    for (const [id, slot] of this.getSlotMap()) {
      if (predicate(slot)) return [id, slot]
    }

    return undefined
  }

  public findSlotId (predicate: SlotPredicate): SlotId | undefined {
    const slotAndId = this.findSlotAndId(predicate)

    if (slotAndId === undefined) return undefined

    return slotAndId[0]
  }

  public findSlot (predicate: SlotPredicate): Slot | undefined {
    const slotAndId = this.findSlotAndId(predicate)

    if (slotAndId === undefined) return undefined

    return slotAndId[1]
  }

  public amountOf (predicate: SlotPredicate): number {
    predicate = normalizeSlotPredicate(predicate)

    let total = 0

    for (const slot of this.getSlots()) {
      if (predicate(slot)) total++
    }

    return total
  }

  public list (): Map<SlotType, number> {
    const list = new Map<SlotType, number>()

    for (const slot of this.getSlots()) {
      list.set(slot.getType(), list.get(slot.getType()) ?? 0 + 1)
    }

    return list
  }

  public every (predicate: SlotPredicate): boolean {
    predicate = normalizeSlotPredicate(predicate)

    for (const slot of this.getSlots()) {
      if (!predicate(slot)) return false
    }

    return true
  }

  public some (predicate: SlotPredicate): boolean {
    predicate = normalizeSlotPredicate(predicate)

    for (const slot of this.getSlots()) {
      if (predicate(slot)) return true
    }

    return false
  }

  public clear (): void {
    for (const slot of this.getSlots()) {
      slot.setType(null)
    }
  }

  public isEmpty (): boolean {
    return this.every(null)
  }

  public isFull (): boolean {
    return !this.some(null)
  }

  public setItem (id: SlotId, type: SlotType): boolean {
    const slot = this.getSlot(id)

    if (slot === undefined) return false

    slot.setType(type)

    return true
  }

  public addItem (type: SlotType): boolean {
    const emptyId = this.findSlotId(null)

    if (emptyId === undefined) return false

    this.setItem(emptyId, type)

    return true
  }

  public removeItem (type: SlotType): boolean {
    const id = this.findSlotId(type)

    if (id === undefined) return false

    this.setItem(id, null)

    return true
  }
}

// ServerInventory extends Inventory
// ClientInventory extends Inventory
