import type Vec2 from '../engine/util/vec2.js'

export type Slot = Vec2 | number

export type SlotType = string | null

export type SlotFilter = SlotType | ((type: SlotType) => boolean)

export interface ISlot {
  type: SlotType
}
