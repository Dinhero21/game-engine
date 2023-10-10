import { type World } from '..'
import { io } from '../../plugin/web'
import Vec2, { type Vec2Array } from '../../public/engine/util/vec2'
import { type EntityTypes } from '../../public/game/entity/server-entity/type'
import { randomUUID } from 'crypto'

export interface EntityClientData {
  type: keyof typeof EntityTypes
  id: any
  position: Vec2Array
}

// TODO: Separate Networking (somehow)
export class Entity {
  public readonly type: keyof typeof EntityTypes = 'base'

  protected readonly world

  constructor (world: World) {
    this.world = world
  }

  // Game Loop

  public update (delta: number): void {}

  // Position

  public position = Vec2.ZERO

  public setPosition (position: Vec2): void {
    this.position = position

    this.sync()
  }

  // Networking

  // ! This is supposed to be read-only but can't be made as so
  // ! as derived classes should be able to override it without
  // ! any work-around-s
  public id: any = randomUUID()

  public getClientData (): EntityClientData {
    return {
      type: this.type,
      id: this.id,
      position: this.position.toArray()
    }
  }

  public sync (): void {
    io.emit('entity.update', this.getClientData())
  }
}

export default Entity
