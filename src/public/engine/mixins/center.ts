import Vec2 from '../util/vec2.js'
import type Entity from '../entities'

type Constructor<T = Record<string, unknown>> = new (...args: any[]) => T

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function Center<T extends Constructor<Entity>> (BaseEntity: T) {
  return class CenteredEntity extends BaseEntity {
    private readonly _position: Vec2 = new Vec2(0, 0)

    update (delta: number): void {
      this.position = this._position.clone()

      const oldPosition = this.position.clone()

      super.update(delta)

      const positionDelta = this.position.minus(oldPosition)

      this._position.add(positionDelta)

      {
        const boundingBox = this.getBoundingBox()

        if (boundingBox === null) {
          super.update(delta)

          return
        }

        const size = boundingBox.getSize()
        const offset = size.divided(2)

        this.position.subtract(offset)
      }
    }
  }
}
