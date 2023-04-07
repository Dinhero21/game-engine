import RectangularCollider from '../util/collision/rectangular.js'
import Vec2 from '../util/vec2.js'
import Entity from './index.js'

export class VerticalContainerEntity extends Entity {
  public getBoundingBox (): RectangularCollider {
    const globalPosition = this.getGlobalPosition()

    let width = 0

    for (const child of this.children) {
      const childBoundingBox = child.getBoundingBox()

      if (childBoundingBox === null) continue

      const childSize = childBoundingBox.getSize()
      const childWidth = childSize.x

      width += childWidth
    }

    let height = 0

    for (const child of this.children) {
      const childBoundingBox = child.getBoundingBox()

      if (childBoundingBox === null) continue

      const childSize = childBoundingBox.getSize()
      const childHeight = childSize.y

      height = Math.max(height, childHeight)
    }

    const size = new Vec2(width, height)

    return new RectangularCollider(globalPosition, size)
  }

  // ? Should I move the children during the draw or update phase?
  public update (delta: number): void {
    super.update(delta)

    let x = 0

    for (const child of this.children) {
      child.position.x = x

      const childBoundingBox = child.getBoundingBox()

      if (childBoundingBox === null) continue

      const childSize = childBoundingBox.getSize()
      const childWidth = childSize.x

      x += childWidth
    }
  }
}

export default VerticalContainerEntity
