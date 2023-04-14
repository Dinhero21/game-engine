import GridContainerEntity from '../../engine/entities/grid-container.js'
import Vec2 from '../../engine/util/vec2.js'
import SlotEntity from './slot.js'

export type SlotFilter = string | ((slot: SlotEntity) => boolean)

export class InventoryEntity extends GridContainerEntity<SlotEntity> {
  constructor (size: Vec2, spacing: Vec2, padding: Vec2) {
    super(size, spacing, padding, (x, y) => {
      const slot = new SlotEntity(new Vec2(64, 64), new Vec2(16, 16))

      slot.type = 'sus'

      return slot
    })
  }

  public getSlot (id: number | Vec2): SlotEntity | undefined {
    return this.getGridItem(id)
  }

  public getSlots (filter: SlotFilter = () => true): SlotEntity[] {
    if (typeof filter === 'string') filter = (slot: SlotEntity) => slot.type === filter

    const slots = this.getGridItems()

    return slots.filter(filter)
  }

  public findSlot (filter: SlotFilter): SlotEntity | undefined {
    if (typeof filter === 'string') filter = (slot: SlotEntity) => slot.type === filter

    const slots = this.getGridItems()

    return slots.find(filter)
  }

  public findSlotId (filter: SlotFilter): number | undefined {
    if (typeof filter === 'string') filter = (slot: SlotEntity) => slot.type === filter

    const slots = this.getGridItems()

    return slots.findIndex(filter)
  }
}

export default InventoryEntity
