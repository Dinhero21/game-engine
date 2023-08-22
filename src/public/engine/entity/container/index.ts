import type RectangularCollider from '../../util/collision/rectangular'
import type Vec2 from '../../util/vec2'
import Entity from '..'

export abstract class ContainerEntity<ValidChild extends Entity = Entity> extends Entity<ValidChild> {
  public readonly spacing
  public readonly padding

  constructor (spacing: number, padding: Vec2) {
    super()

    this.spacing = spacing
    this.padding = padding
  }

  public abstract getConstantCollider (): RectangularCollider

  public update (delta: number): void {
    super.update(delta)

    this.positionChildren()
  }

  public addChild (child: ValidChild): this {
    super.addChild(child)

    this.positionChildren()

    return this
  }

  public removeChild (child: ValidChild): this {
    super.removeChild(child)

    this.positionChildren()

    return this
  }

  protected abstract positionChildren (): void
}

export default ContainerEntity
