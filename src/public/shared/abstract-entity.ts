import RootEntity from './root-entity'
import { getId } from './entity-manager'
import Vec2 from '../engine/util/vec2'
import RectangularCollider from '../engine/util/collision/rectangular'
// import { setName } from '../engine/util/reflection'

export const IdSymbol = Symbol('entity.id')

export class AbstractEntity<ValidChild extends AbstractEntity = AbstractEntity<any>, ValidRoot extends RootEntity = RootEntity<any, any>> extends RootEntity<ValidChild, ValidRoot> {
  // Debugging

  public readonly [IdSymbol] = getId()

  // constructor () {
  //   super()

  //   const prototype = Object.getPrototypeOf(this) as object
  //   const constructor = prototype.constructor
  //   const name = constructor.name

  //   const id = this[IdSymbol]

  //   setName(
  //     `${name}$${id}`,
  //     this
  //   )
  // }

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

export default AbstractEntity
