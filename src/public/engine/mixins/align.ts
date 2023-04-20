import { type Constructor } from './index.js'
import type Entity from '../entities/index.js'
import Vec2 from '../util/vec2.js'

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function Align<T extends Constructor<Entity>> (BaseEntity: T, anchor: Vec2) {
  return class AlignedEntity extends BaseEntity {
    private readonly _position: Vec2 = new Vec2(0, 0)

    update (delta: number): void {
      this.position = this._position.clone()

      const oldPosition = this.position.clone()

      super.update(delta)

      const positionDelta = this.position.minus(oldPosition)

      this._position.add(positionDelta)

      {
        const collider = this.getConstantCollider()

        if (collider === null) {
          super.update(delta)

          return
        }

        const size = collider.getSize()
        const offset = size.scaled(anchor)

        this.position.subtract(offset)
      }
    }
  }
}

export default Align