import { type Stack, type SlotId } from './public/game/util/inventory.js'
import type { Player as ClientPlayer } from './socket.io'
import { TypedEmitter } from 'tiny-typed-emitter'
import Inventory from './inventory.js'
import Vec2 from './public/engine/util/vec2.js'

export interface PlayerEvents {
  'inventory.update': (id: SlotId, stack: Stack) => void
}

export class Player extends TypedEmitter<PlayerEvents> {
  public readonly id
  public readonly inventory

  public position: Vec2 = new Vec2(0, 0)
  public velocity: Vec2 = new Vec2(0, 0)

  constructor (id: string) {
    super()

    this.id = id

    const inventory = new Inventory(9)
    this.inventory = inventory

    const manager = inventory.manager

    manager.on('slot.update', (id, stack) => {
      this.emit('inventory.update', id, stack)
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
