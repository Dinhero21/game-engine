import type { IClientSocket as Socket } from '../../../socket.io.js'
import Entity from '../../engine/entities/index.js'
import PlayerEntity, { type OverlapDetector } from '../entities/player.js'
import Vec2 from '../../engine/util/vec2.js'

export class MultiplayerContainerEntity extends Entity<PlayerEntity> {
  private readonly socket

  private overlapping?: OverlapDetector

  constructor (socket: Socket) {
    super()

    this.socket = socket

    socket.on('player.add', player => {
      // if (players.has(player.id)) throw new Error(`Player ${player.id} already exists!`)

      const position = new Vec2(...player.position)
      const velocity = new Vec2(...player.velocity)

      const entity = new PlayerEntity(player.id)
      entity.position = position
      entity.velocity = velocity

      entity.controllable = player.id === socket.id

      entity.overlapping = this.overlapping

      this.addChild(entity)
    })

    socket.on('player.remove', player => {
      const entity = Array.from(this.children).find(child => child.id === player.id)

      // ? Should I warn or throw an error?
      if (entity === undefined) return

      this.removeChild(entity)
    })

    socket.on('player.physics.update', player => {
      const entity = Array.from(this.children).find(child => child.id === player.id)

      // ? Should I warn or throw an error?
      if (entity === undefined) return

      const position = new Vec2(...player.position)
      const velocity = new Vec2(...player.velocity)

      entity.position.set(position.x, position.y)
      entity.velocity.set(velocity.x, velocity.y)
    })
  }

  public setOverlapDetector (overlapping: OverlapDetector): void {
    this.overlapping = overlapping

    for (const child of this.children) child.overlapping = overlapping
  }

  public update (delta: number): void {
    super.update(delta)

    const socket = this.socket

    const entity = Array.from(this.children).find(child => child.id === socket.id)

    if (entity === undefined) return

    socket.emit('physics.update', entity.position.toArray(), entity.velocity.toArray())
  }
}

export default MultiplayerContainerEntity
