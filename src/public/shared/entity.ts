import RootEntity from './root-entity'
import Vec2 from '../engine/util/vec2'
import RectangularCollider from '../engine/util/collision/rectangular'

export class SharedEntity<ValidChild extends SharedEntity = SharedEntity<any>, ValidRoot extends RootEntity = RootEntity<any, any>> extends RootEntity<ValidChild, ValidRoot> {
  // Game Loop

  public ready (): void {}

  public update (delta: number): void {
    for (const child of this.children) child.update(delta)
  }

  // Position

  public position: Vec2 = Vec2.ZERO

  protected getParentGlobalPosition (): Vec2 {
    return this.parent?.getGlobalPosition() ?? Vec2.ZERO
  }

  public getGlobalPosition (): Vec2 {
    return this.position.plus(this.getParentGlobalPosition())
  }

  public setGlobalPosition (position: Vec2): this {
    this.position = position.minus(this.getParentGlobalPosition())

    return this
  }

  // Collision Detection

  // TODO: Find a better name
  public getConstantCollider (): RectangularCollider {
    return new RectangularCollider(Vec2.ZERO, Vec2.ZERO)
  }

  public getParentRelativeCollider (): RectangularCollider {
    const collider = this.getConstantCollider()

    const position = this.position

    return collider.offset(position)
  }

  public getGlobalCollider (): RectangularCollider {
    const collider = this.getConstantCollider()

    const globalPosition = this.getGlobalPosition()

    return collider.offset(globalPosition)
  }
}

export default SharedEntity
