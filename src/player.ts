import type { Player as ClientPlayer, IServerSocket as ISocket, IServerServer as IServer } from './socket.io'
import { type Stack, type SlotId } from './public/game/util/inventory'
import Inventory from './inventory'
import Vec2 from './public/engine/util/vec2'
import { TypedEmitter } from 'tiny-typed-emitter'

export interface PlayerEvents {
  'inventory.update': (id: SlotId, stack: Stack) => void
}

export class Player extends TypedEmitter<PlayerEvents> {
  public readonly socket
  public readonly io

  public readonly inventory

  public position: Vec2 = new Vec2(0, 0)
  public velocity: Vec2 = new Vec2(0, 0)

  public name: string = 'default'

  constructor (socket: ISocket, io: IServer) {
    super()

    this.socket = socket
    this.io = io

    const inventory = new Inventory(9)
    this.inventory = inventory

    const manager = inventory.manager

    manager.on('slot.update', (id, stack) => {
      this.emit('inventory.update', id, stack)
    })
  }

  public getClientPlayer (): ClientPlayer {
    return {
      id: this.socket.id,
      position: this.position.toArray(),
      velocity: this.velocity.toArray()
    }
  }
}

export default Player
