import type RectangularCollider from '../util/collision/rectangular'
import type Vec2 from '../util/vec2'
import Entity from '.'

export abstract class ContainerEntity<ValidChild extends Entity = Entity> extends Entity<ValidChild> {
  public readonly spacing
  public readonly padding

  constructor (spacing: number, padding: Vec2) {
    super()

    this.spacing = spacing
    this.padding = padding
  }

  public abstract getConstantCollider (): RectangularCollider
}

export default ContainerEntity
