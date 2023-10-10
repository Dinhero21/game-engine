import type ServerEntityEntity from './type/base'
import type WorldEntity from '../world'
import { EntityTypes } from './type'
import Entity from '../../../engine/entity'
import socket from '../../socket.io'

export class ServerEntityContainerEntity extends Entity<ServerEntityEntity> {
  constructor () {
    super()

    socket.on('entity.add', data => {
      const f = EntityTypes[data.type]
      const entity = f(data)

      entity.world = this.world

      this.addChild(entity)
    })

    socket.on('entity.remove', id => {
      const entity = Array.from(this.children).find(child => child.id === id)

      // ? Should I warn or throw an error?
      if (entity === undefined) return

      this.removeChild(entity)
    })

    socket.on('entity.update', data => {
      const entity = Array.from(this.children).find(child => child.id === data.id)

      if (entity === undefined) return

      const f = EntityTypes[data.type]

      f(data, entity)
    })
  }

  protected world?: WorldEntity

  public setWorld (world: WorldEntity): void {
    this.world = world

    for (const child of this.children) {
      child.world = world
    }
  }
}

export default ServerEntityContainerEntity
