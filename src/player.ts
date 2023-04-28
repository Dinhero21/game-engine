import type { Player as ClientPlayer } from './socket.io'
import { type Slot, type SlotType } from './public/game/slot.js'
import { TypedEmitter } from 'tiny-typed-emitter'
import Inventory from './inventory.js'
import Vec2 from './public/engine/util/vec2.js'

export interface PlayerEvents {
  'inventory.update': (slot: Slot, oldType: SlotType | undefined, newType: SlotType) => void
}

export class Player extends TypedEmitter<PlayerEvents> {
  public id
  public inventory

  public position: Vec2 = new Vec2(0, 0)
  public velocity: Vec2 = new Vec2(0, 0)

  public chunks = new Set<string>()

  constructor (id: string) {
    super()

    this.id = id

    const inventory = new Inventory(new Vec2(3, 3))
    this.inventory = inventory

    inventory.on('update', (slot, oldType, newType) => {
      this.emit('inventory.update', slot, oldType, newType)
    })
  }

  public getClientPlayer (): ClientPlayer {
    return {
      id: this.id,
      position: this.position.toArray(),
      velocity: this.velocity.toArray()
    }
  }
}

export default Player