import { type OuterPatchHelper, patchEntity } from '.'
import type Entity from '../entities'
import Vec2 from '../util/vec2'

export function align (entity: Entity, anchor: number | Vec2, relative: boolean = true): OuterPatchHelper {
  return patchEntity(entity)('update', helper => {
    if (relative) {
      const centeredPosition = entity.position.clone()

      let oldPosition = entity.position.clone()

      return function (delta: number) {
        const positionDelta = entity.position.minus(oldPosition)
        centeredPosition.add(positionDelta)

        {
          const preBelowPosition = entity.position.clone()

          helper.below(delta)

          const belowPositionDelta = entity.position.minus(preBelowPosition)

          centeredPosition.add(belowPositionDelta)
        }

        {
          const collider = entity.getConstantCollider()

          const size = collider.getSize()

          entity.position = centeredPosition.minus(size.scaled(anchor))
        }

        oldPosition = entity.position.clone()
      }
    }

    let oldPosition = new Vec2(NaN, NaN)

    return function (delta: number) {
      if (!oldPosition.equals(entity.position)) updatePosition()

      oldPosition = entity.position.clone()

      helper.below(delta)

      if (!oldPosition.equals(entity.position)) updatePosition()

      oldPosition = entity.position.clone()
    }

    function updatePosition (): void {
      const position = entity.position

      const collider = entity.getConstantCollider()

      const size = collider.getSize()

      position.subtract(size.scaled(anchor))
    }
  })
}

export default align
