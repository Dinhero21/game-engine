import type ServerEntityEntity from './type/base'
import type WorldEntity from '../world'
import { EntityTypes } from './type'
import Entity from '../../../engine/entity'
import socket from '../../socket.io'

export class ServerEntityContainerEntity extends Entity<ServerEntityEntity> {
  constructor () {
    super()

    socket.on('entity.add', data => {
      console.log('entity.add', data)

      const f = EntityTypes[data.type]
      const entity = f(data)

      entity.world = this.world

      this.addChild(entity)
    })

    socket.on('entity.remove', id => {
      let count = 0

      for (const entity of this.children) {
        if (entity.id !== id) continue

        count++

        this.removeChild(entity)
      }

      if (count === 1) return

      console.warn(`Expected to remove 1 entity but removed ${count}`)
    })

    socket.on('entity.update', data => {
      console.log('entity.update', data)

      let count = 0

      for (const entity of this.children) {
        if (entity.id !== data.id) continue

        count++

        const f = EntityTypes[data.type]

        f(data, entity)
      }

      if (count === 1) return

      console.warn(`Expected to update 1 entity but updated ${count}`)
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
