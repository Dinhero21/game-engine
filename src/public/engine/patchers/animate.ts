import type Entity from '../entities/index.js'
import { patch } from './index.js'
import type Vec2 from '../util/vec2.js'
import { lerp2D } from '../util/math.js'

export async function animate<T extends Entity> (entity: T, callback: (t: number) => void, duration: number): Promise<void> {
  let t = 0

  await new Promise<void>(resolve => {
    patch(entity)('update', update => {
      callback(t)

      return function (delta: number) {
        update(delta)

        t += delta

        if (t >= duration) {
          t = duration

          callback(t)

          entity.update = update

          resolve()

          return
        }

        callback(t)
      }
    })
  })
}

export type Transformation = (x: number) => number

export const TRANSFORMATIONS: Record<string, Transformation> = {
  Linear: x => x,
  EaseQuadratic: x => x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2,
  EaseCubic: x => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2,
  EaseQuartic: x => x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2,
  EaseQuintic: x => x < 0.5 ? 16 * x * x * x * x * x : 1 - Math.pow(-2 * x + 2, 5) / 2
}

export async function animatePosition<T extends Entity> (entity: T, start: Vec2, end: Vec2, duration: number, transformation: Transformation = TRANSFORMATIONS.Linear): Promise<void> {
  await animate(entity, t => {
    const delta = transformation(t / duration)

    const position = lerp2D(start, end, delta)

    entity.position = position
  }, duration)
}
