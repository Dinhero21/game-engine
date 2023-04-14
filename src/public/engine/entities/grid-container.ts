import type Entity from './index.js'
import HorizontalContainerEntity from './horizontal-container.js'
import VerticalContainerEntity from './vertical-container.js'
import Vec2 from '../util/vec2.js'

export class GridContainerEntity<ValidChild extends Entity = Entity> extends VerticalContainerEntity<HorizontalContainerEntity<ValidChild>> {
  constructor (size: Vec2, spacing: Vec2, padding: Vec2, callback: (x: number, y: number) => ValidChild) {
    super(spacing.x, padding)

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

    const rows = this.getChildren()

    const row = rows[Math.floor(id.x)]

    if (row === undefined) return

    const children = row.getChildren()

    const child = children[Math.floor(id.y)]

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
