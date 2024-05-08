import type Entity from './base'
import Emitting from './emitting'
import { type EntityClientData } from './base'
import Vec2, { type Vec2Array } from '../../public/engine/util/vec2'
import { type World } from '..'
import Inventory from '../../inventory'
import { type Stack, type SlotId } from '../../public/shared/inventory'
import { type IServerSocket as Socket } from '../../socket.io'
import { io } from '../../plugin/web'

export interface PlayerEventMap {
  'inventory.update': (id: SlotId, stack: Stack) => void
}

export interface PlayerClientData extends EntityClientData {
  velocity: Vec2Array
  acceleration: Vec2Array
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function Player (E: typeof Entity) {
  class PlayerEntity extends Emitting<PlayerEventMap>(E) {
    public readonly type = 'player'

    public readonly socket

    public position = Vec2.ZERO
    public velocity = Vec2.ZERO
    public acceleration = Vec2.ZERO

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

    public isTeleporting = false

    /*
      Use this method when the position
      of the client needs to be updated.
      Set Player.position directly otherwise.
    */
    public teleport (position: Vec2): void {
      this.position = position

      this.velocity = Vec2.ZERO
      this.acceleration = Vec2.ZERO

      this.isTeleporting = true

      this.queueSync()
    }

    public _sync (): void {
      const socket = this.socket

      const emitter =
        this.isTeleporting
          // all (including self)
          ? io
          // all (except self)
          : socket.broadcast

      emitter.emit('entity.update', this.getClientData())

      this.isTeleporting = false
    }

    public getClientData (): PlayerClientData {
      return {
        ...super.getClientData(),
        acceleration: this.acceleration.toArray(),
        velocity: this.velocity.toArray()
      }
    }
  }

  return PlayerEntity
}

export default Player
