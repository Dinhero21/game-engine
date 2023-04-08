import HorizontalContainerEntity from '../../engine/entities/horizontal-container.js'
import type Entity from '../../engine/entities/index.js'
import VerticalContainerEntity from '../../engine/entities/vertical-container.js'
import Vec2 from '../../engine/util/vec2.js'

export class GridContainerEntity extends VerticalContainerEntity {
  constructor (spacing: Vec2, padding: Vec2, callback: (x: number, y: number) => Entity) {
    super(spacing.x, padding)

    for (let y = 0; y < 3; y++) {
      const row = new HorizontalContainerEntity(spacing.y, new Vec2(0, 0))

      for (let x = 0; x < 3; x++) {
        const child = callback(x, y)

        row.addChild(child)
      }

      this.addChild(row)
    }
  }
}

export default GridContainerEntity
