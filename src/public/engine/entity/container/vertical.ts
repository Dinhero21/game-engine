import type Entity from '..'
import ContainerEntity from '.'
import RectangularCollider from '../../util/collision/rectangular'
import Vec2 from '../../util/vec2'

export class VerticalContainerEntity<ValidChild extends Entity = Entity> extends ContainerEntity<ValidChild> {
  public getConstantCollider (): RectangularCollider {
    const children = Array.from(this.children)

    const spacing = this.spacing
    const padding = this.padding

    let width = 0

    for (const child of children) {
      const childCollider = child.getConstantCollider()

      const childSize = childCollider.getSize()
      const childWidth = childSize.x

      width = Math.max(width, childWidth)
    }

    let height = 0

    for (const child of children) {
      const childCollider = child.getConstantCollider()

      const childSize = childCollider.getSize()
      const childHeight = childSize.y

      height += childHeight
    }

    const size = new Vec2(width, height)

    size.y += spacing * (children.length - 1)

    size.add(padding.scaled(2))

    return new RectangularCollider(Vec2.ZERO, size)
  }

  protected positionChildren (): void {
    const spacing = this.spacing
    const padding = this.padding

    const position = padding.clone()

    for (const child of this.children) {
      child.position.update(position)

      const childCollider = child.getConstantCollider()

      const childSize = childCollider.getSize()
      const childWidth = childSize.y

      position.y += childWidth + spacing
    }
  }
}

export default VerticalContainerEntity
