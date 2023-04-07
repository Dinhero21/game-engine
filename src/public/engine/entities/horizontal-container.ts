import RectangularCollider from '../util/collision/rectangular.js'
import Vec2 from '../util/vec2.js'
import ContainerEntity from './container.js'

export class HorizontalContainerEntity extends ContainerEntity {
  public getBoundingBox (): RectangularCollider {
    const children = Array.from(this.children)

    const spacing = this.spacing
    const padding = this.padding

    const globalPosition = this.getGlobalPosition()

    let width = 0

    for (const child of children) {
      const childBoundingBox = child.getBoundingBox()

      if (childBoundingBox === null) continue

      const childSize = childBoundingBox.getSize()
      const childWidth = childSize.x

      width += childWidth
    }

    let height = 0

    for (const child of children) {
      const childBoundingBox = child.getBoundingBox()

      if (childBoundingBox === null) continue

      const childSize = childBoundingBox.getSize()
      const childHeight = childSize.y

      height = Math.max(height, childHeight)
    }

    const size = new Vec2(width, height)

    size.x += spacing * (children.length - 1)

    size.add(padding.scaled(2))

    return new RectangularCollider(globalPosition, size)
  }

  // ? Should I move the children during the draw or update phase?
  public update (delta: number): void {
    super.update(delta)

    const spacing = this.spacing
    const padding = this.padding

    const position = padding.clone()

    for (const child of this.children) {
      child.position.update(position)

      const childBoundingBox = child.getBoundingBox()

      if (childBoundingBox === null) continue

      const childSize = childBoundingBox.getSize()
      const childWidth = childSize.x

      position.x += childWidth + spacing
    }
  }
}

export default HorizontalContainerEntity
