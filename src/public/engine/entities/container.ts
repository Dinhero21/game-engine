import type RectangularCollider from '../util/collision/rectangular.js'
import type Vec2 from '../util/vec2.js'
import Entity from './index.js'

export abstract class ContainerEntity<ValidChild extends Entity = Entity> extends Entity<ValidChild> {
  protected spacing
  protected padding

  constructor (spacing: number, padding: Vec2) {
    super()

    this.spacing = spacing
    this.padding = padding
  }

  public abstract getConstantCollider (): RectangularCollider
}

export default ContainerEntity
