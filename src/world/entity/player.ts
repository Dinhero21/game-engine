import type Entity from './base'
import Emitting from './emitting'
import { type EntityClientData } from './base'
import Vec2, { type Vec2Array } from '../../public/engine/util/vec2'
import { type World } from '..'
import Inventory from '../../inventory'
import { type Stack, type SlotId } from '../../public/game/util/inventory'
import { type IServerSocket as Socket } from '../../socket.io'

export interface PlayerEventMap {
  'inventory.update': (id: SlotId, stack: Stack) => void
}

export interface PlayerClientData extends EntityClientData {
  velocity: Vec2Array
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function Player (E: typeof Entity) {
  return class PlayerEntity extends Emitting<PlayerEventMap>(E) {
    public readonly type = 'player'

    public readonly socket

    public position = Vec2.ZERO
    public velocity = Vec2.ZERO

    public name: string = 'default'

    public readonly inventory

    constructor (world: World, socket: Socket) {
      super(world)

      this.socket = socket

      this.id = socket.id

      const inventory = new Inventory(9)
      this.inventory = inventory

      const manager = inventory.manager

      manager.on('slot.update', (id, stack) => {
        this.emit('inventory.update', id, stack)
      })
    }

    public getClientData (): PlayerClientData {
      return {
        ...super.getClientData(),
        velocity: this.velocity.toArray()
      }
    }
  }
}

export default Player
