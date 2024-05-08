// string    = item
// null      = nothing
// undefined = does not exist
export type SlotType = string | null
export type SlotAmount = number
export type SlotId = number

export interface Stack {
  type: SlotType
  amount: SlotAmount
}

// TODO: Max amount

export class Slot {
  protected readonly stack: Stack = {
    type: null,
    amount: 0
  }

  public getStack (): Stack {
    return this.stack
  }

  public setType (type: SlotType): void {
    const stack = this.getStack()

    stack.type = type
  }

  public getType (): SlotType {
    const stack = this.getStack()

    return stack.type
  }

  public setAmount (amount: SlotAmount): void {
    const stack = this.getStack()

    stack.amount = amount
  }

  public getAmount (): SlotAmount {
    const stack = this.getStack()

    return stack.amount
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

  public amountOf (predicate: SlotPredicate): SlotAmount {
    predicate = normalizeSlotPredicate(predicate)

    let total = 0

    for (const slot of this.getSlots()) {
      if (predicate(slot)) total += slot.getAmount()
    }

    return total
  }

  public list (): Map<SlotType, SlotAmount> {
    const list = new Map<SlotType, SlotAmount>()

    for (const slot of this.getSlots()) {
      const type = slot.getType()
      const amount = slot.getAmount()

      list.set(type, (list.get(type) ?? 0) + amount)
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

  public removeAmount (id: SlotId, amount: SlotAmount): number {
    const slot = this.getSlot(id)

    if (slot === undefined) return 0

    const maxAmount = slot.getAmount()

    let removedAmount = maxAmount

    if (removedAmount > amount) removedAmount = amount

    slot.setAmount(maxAmount - removedAmount)

    if (slot.getAmount() === 0) slot.setType(null)

    return removedAmount
  }

  public addItem (type: SlotType, amount: SlotAmount): boolean {
    const nonFullSlot = this.findSlot(type) ?? this.findSlot(null)

    if (nonFullSlot === undefined) return false

    nonFullSlot.setType(type)

    const oldAmount = nonFullSlot.getAmount()

    nonFullSlot.setAmount(oldAmount + amount)

    return true
  }

  public removeItem (type: SlotType, amount: SlotAmount): void {
    while (amount > 0) {
      const id = this.findSlotId(type)

      if (id === undefined) throw new Error('removeItem called with more items than there are')

      amount -= this.removeAmount(id, amount)
    }
  }
}
