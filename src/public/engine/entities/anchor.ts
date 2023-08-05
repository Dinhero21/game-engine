import Entity from '.'
import Vec2 from '../util/vec2'

export class AnchorEntity<ValidChild extends Entity = Entity> extends Entity<ValidChild> {
  protected anchor

  constructor (anchor: Vec2 = new Vec2(0, 0)) {
    super()

    this.anchor = anchor
  }

  public update (delta: number): void {
    super.update(delta)

    const parent = this.parent

    if (parent === undefined) return
    if (!(parent instanceof Entity)) return

    const collider = parent.getConstantCollider()
    const position = collider.getPosition()
    const size = collider.getSize()

    const anchor = this.anchor

    // this.position = (anchor * collider.size) // + collider.position
    this.position = anchor.scaled(size).plus(position)
  }
}

export default AnchorEntity
