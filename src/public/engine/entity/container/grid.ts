import type Entity from '.'
import HorizontalContainerEntity from './horizontal'
import VerticalContainerEntity from './vertical'
import Vec2 from '../../util/vec2'

export class GridContainerEntity<ValidChild extends Entity = Entity> extends VerticalContainerEntity<HorizontalContainerEntity<ValidChild>> {
  public readonly spacing2D

  constructor (size: Vec2, spacing: Vec2, padding: Vec2, callback: (x: number, y: number) => ValidChild) {
    super(spacing.x, padding)

    this.spacing2D = spacing

    for (let y = 0; y < size.y; y++) {
      const row = new HorizontalContainerEntity<ValidChild>(spacing.y, new Vec2(0, 0))

      for (let x = 0; x < size.x; x++) {
        const child = callback(x, y)

        row.addChild(child)
      }

      this.addChild(row)
    }
  }

  public getGridItem (id: number | Vec2): ValidChild | undefined {
    if (typeof id === 'number') {
      const items = this.getGridItems()

      return items[id]
    }

    const columns = this.getChildren()

    const column = columns[Math.floor(id.y)]

    if (column === undefined) return

    const children = column.getChildren()

    const child = children[Math.floor(id.x)]

    if (child === undefined) return

    return child
  }

  public getGridItems (): ValidChild[] {
    const items: ValidChild[] = []

    const rows = this.getChildren()

    for (const row of rows) {
      const children = row.getChildren()

      items.push(...children)
    }

    return items
  }
}

export default GridContainerEntity
