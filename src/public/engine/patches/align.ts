import type Entity from '../entities/index.js'
import { patchEntity } from './index.js'
import Vec2 from '../util/vec2.js'

export function align (entity: Entity, anchor: number | Vec2): void {
  patchEntity(entity)('update', helper => {
    const centeredPosition = entity.position.clone()

    let oldPosition = new Vec2(0, 0)

    return function (delta: number) {
      const positionDelta = entity.position.subtract(oldPosition)
      centeredPosition.add(positionDelta)

      {
        const preBelowPosition = entity.position.clone()

        helper.below(delta)

        const belowPositionDelta = entity.position.subtract(preBelowPosition)

        centeredPosition.add(belowPositionDelta)
      }

      {
        const collider = entity.getConstantCollider()

        const size = collider.getSize()

        entity.position = centeredPosition.minus(size.scaled(anchor))
      }

      oldPosition = entity.position.clone()
    }
  })
}

export default align
