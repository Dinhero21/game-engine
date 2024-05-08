import type Frame from '../../engine/util/frame'
import SlotEntity from './slot'
import Vec2 from '../../engine/util/vec2'
import { Inventory, Slot, type SlotAmount, type SlotType, type Stack } from '../../shared/inventory'
import { TypedEventTarget } from '../../engine/util/typed-event-target'
import { loader } from '../../asset/loader'
import GridContainerEntity from '../../engine/entity/container/grid'
import ui from '../singleton/scene/plugin/entity/user-interface'

export class TypeUpdateEvent extends Event {
  public readonly data

  constructor (type: SlotType) {
    super('type.update')

    this.data = type
  }
}

export class AmountUpdateEvent extends Event {
  public readonly data

  constructor (amount: SlotAmount) {
    super('amount.update')

    this.data = amount
  }
}

export interface SlotManagerEventMap {
  'type.update': TypeUpdateEvent
  'amount.update': AmountUpdateEvent
}

export class SlotManager extends TypedEventTarget<SlotManagerEventMap> {}

export class ManagedSlot extends Slot {
  public readonly manager = new SlotManager()

  public setType (type: SlotType): void {
    super.setType(type)

    this.manager.dispatchTypedEvent('type.update', new TypeUpdateEvent(type))
  }

  public setAmount (amount: SlotAmount): void {
    super.setAmount(amount)

    this.manager.dispatchTypedEvent('amount.update', new AmountUpdateEvent(amount))
  }
}

export class SlotUpdateEvent extends Event {
  public readonly stack
  public readonly id
  public readonly slot

  constructor ({ stack, id, slot }: { stack: Stack, id: number, slot: Slot | undefined }) {
    super('slot.update')

    this.stack = stack
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

    for (let i = 0; i < size; i++) this._createSlot(i)

    // Cursor Slot
    this._createSlot(-1)
  }

  protected _createSlot (id: number): void {
    const slot = new ManagedSlot()

    this.slots.set(id, slot)

    slot.manager.addEventListener('type.update', () => {
      this.manager.dispatchTypedEvent('slot.update', new SlotUpdateEvent({ stack: slot.getStack(), id, slot }))
    })

    slot.manager.addEventListener('amount.update', () => {
      this.manager.dispatchTypedEvent('slot.update', new SlotUpdateEvent({ stack: slot.getStack(), id, slot }))
    })
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

      const stack = event.stack

      slot.type = stack.type
      slot.amount = stack.amount
    })
  }

  public draw (frame: Frame): void {
    const collider = this.getConstantCollider()
    const position = collider.getPosition()
    const size = collider.getSize()

    frame.drawRect(
      position.x, position.y,
      size.x, size.y,
      '#0404047F'
    )

    super.draw(frame)

    this.drawCursorItem(frame)
  }

  protected drawCursorItem (frame: Frame): void {
    const slot = this.inventory.getSlot(-1)

    if (slot === undefined) return

    const type = slot.getType()

    if (type === null) return

    ui.mouse.image = loader.getItemTexture(type)
  }
}

export default InventoryEntity
