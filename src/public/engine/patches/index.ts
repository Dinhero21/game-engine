import type Entity from '../entities/index.js'
import { type ExtractKeys } from '../util/types.js'

export type AnyFunction = (...args: any[]) => any

export type MaybeReturnType<T> = T extends (...args: any[]) => infer R ? R : any
export type MaybeParameters<T> = T extends AnyFunction ? Parameters<T> : any
export type MaybeFunction<T> = (...args: MaybeParameters<T>) => MaybeReturnType<T>

export type FunctionKeys<T> = ExtractKeys<T, AnyFunction>

export function isFunction (value: any): value is AnyFunction {
  return typeof value === 'function'
}

/*
Example:

patch(entity)('update', (helper, delta) => {
  // Call the original entity.update
  helper.original(delta)

  // Restore entity to its original state
  helper.restore()
})
*/

type PatchedEntities<T extends Entity = Entity, K extends keyof T = keyof T> = Map<T, Map<K, Set<T[K]>>>

const patchedEntities: PatchedEntities = new Map()

// TODO: Make a generic patch function that can patch methods not present on Entity (FunctionKeys<T extends Entity> does not work for some reason)
// TODO: Make this function return explicit return types (eslint won't do it automatically and too bored to do it manually)
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function patchEntity<T extends Entity> (entity: T) {
  interface PatchHelper<Below extends AnyFunction> {
    below: (this: ThisParameterType<Below>, ...args: Parameters<Below>) => ReturnType<Below>
    restore: () => void
  }

  return <PropertyName extends FunctionKeys<Entity>>(property: PropertyName, callback: (this: T, helper: PatchHelper<Entity[PropertyName]>) => ((this: T, ...args: Parameters<Entity[PropertyName]>) => ReturnType<Entity[PropertyName]>)): void => {
    const original = entity[property]

    // ? Should I return or throw an error?
    if (!isFunction(original)) throw new Error(`Attempted to patch a non-function property ${JSON.stringify(property)} of type ${JSON.stringify(typeof original)}`)

    type Original = typeof original
    type OriginalArgs = Parameters<Original>

    let patchedEntity = patchedEntities.get(entity)

    if (patchedEntity === undefined) {
      patchedEntity = new Map()
      patchedEntities.set(entity, patchedEntity)
    }

    let patches = patchedEntity.get(property) as Set<Original>

    if (patches === undefined) {
      patches = new Set()
      patchedEntity.set(property, patches)
    }

    patches.add(original)

    const helper: PatchHelper<Original> = {
      below (...args: OriginalArgs): ReturnType<Original> {
        let index = 0

        if (patches === undefined) throw new Error('Helper.below called before initialization phase')

        for (const entityPatch of patches) {
          if (entityPatch === patch) break

          index++
        }

        const below = Array.from(patches)[index - 1]

        if (below === undefined) throw new Error('Invalid patch ID')
        if (!isFunction(below)) throw new Error('Invalid below')

        return (below as ((...args: OriginalArgs) => ReturnType<Original>)).apply(entity, args)
      },
      restore () {
        throw new Error('Helper.restore called before initialization phase')
      }
    }

    const patch = callback.apply(entity, [helper])

    // ? Should I bind patch to entity here?

    helper.restore = () => {
      // If I (patch) am the last one, restore entity[property] to its "lower" state

      const patchArray = Array.from(patches)
      const index = patchArray.findIndex(p => p === patch)

      // If I (patch) am the last one
      if (index === patchArray.length - 1) {
        // Restore entity[property] to its "lower" state
        entity[property] = patchArray[index - 1]
      }

      patches.delete(patch as Original)
    }

    patches.add(patch as Original)

    entity[property] = patch as Original
  }
}

export default patchEntity
