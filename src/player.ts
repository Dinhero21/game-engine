import { type SlotId, type SlotType } from './public/game/util/inventory.js'
import type { Player as ClientPlayer } from './socket.io'
import { TypedEmitter } from 'tiny-typed-emitter'
import Inventory from './inventory.js'
import Vec2 from './public/engine/util/vec2.js'

export interface PlayerEvents {
  'inventory.update': (id: SlotId, after: SlotType, before: SlotType | undefined) => void
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

    const inventory = new Inventory(9)
    this.inventory = inventory

    const manager = inventory.manager

    manager.on('slot.update', (id, after, before) => {
      this.emit('inventory.update', id, after, before)
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
