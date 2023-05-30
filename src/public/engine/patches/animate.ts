import { patchEntity, OuterPatchHelper, type PatchOptions } from './index.js'
import type Entity from '../entities/index.js'
import type Vec2 from '../util/vec2.js'
import { lerp2D } from '../util/math.js'

// TODO: Find a better way of doing this
export class AnimationHelper extends OuterPatchHelper {
  protected promise

  constructor (options: PatchOptions, promise: Promise<void>) {
    super(options)

    this.promise = promise
  }

  public async getPromise (): Promise<void> {
    await this.promise
  }
}

// TODO: Transformations
export function animate (entity: Entity, callback: (t: number) => void, duration: number): AnimationHelper {
  let t = 0
  let resolve: (() => void) | undefined

  const promise = new Promise<void>(_resolve => { resolve = _resolve })

  const helper = patchEntity(entity)('update', helper => {
    callback(t)

    return function animate (delta: number) {
      helper.below(delta)

      t += delta

      if (t >= duration) {
        t = duration

        callback(t)

        helper.restore()

        if (resolve === undefined) throw new Error('AnimationHelper.animate called before promise initialization')

        resolve()

        return
      }

      callback(t)
    }
  })

  return new AnimationHelper(helper.options, promise)
}

export type Transformation = (x: number) => number

export const TRANSFORMATIONS: Record<string, Transformation> = {
  Linear: x => x,
  EaseQuadratic: x => x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2,
  EaseCubic: x => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2,
  EaseQuartic: x => x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2,
  EaseQuintic: x => x < 0.5 ? 16 * x * x * x * x * x : 1 - Math.pow(-2 * x + 2, 5) / 2
}

export function animatePosition<T extends Entity> (entity: T, start: Vec2, end: Vec2, duration: number, transformation: Transformation = TRANSFORMATIONS.Linear, relative: boolean = true): AnimationHelper {
  if (relative) {
    const oldPosition = entity.position.clone()

    return animate(entity, linearT => {
      const t = transformation(linearT / duration)

      const position = lerp2D(start, end, t)

      const deltaPosition = position.minus(oldPosition)

      entity.position.add(deltaPosition)
      oldPosition.add(deltaPosition)
    }, duration)
  }

  return animate(entity, linearT => {
    const t = transformation(linearT / duration)

    const position = lerp2D(start, end, t)

    entity.position.update(position)
  }, duration)
}
