import type Entity from '../entity'
import { type AnyFunction, type FunctionKeys } from '../util/types'

export function isFunction (value: any): value is AnyFunction {
  return typeof value === 'function'
}

/*
Example:

const helper = patch(entity)('update', (helper, delta) => {
  // Call the original entity.update
  helper.original(delta)

  // Restore entity to its original state
  helper.restore()
})

helper
  // Set Priority
  .setPriority(1)
  // Use methods not originally available
  .patchSpecificMethod('foo', 'bar')
*/

export interface PatchOptions {
  priority: number
}

export interface Patch<Original> {
  patchedMethod: Original
  options: PatchOptions
}

export class OuterPatchHelper {
  public readonly options

  constructor (options: PatchOptions) {
    this.options = options
  }

  public setPriority (priority: number): this {
    this.options.priority = priority

    return this
  }
}

type PatchedEntities<T extends Entity = Entity, K extends keyof T = keyof T> = Map<T, Map<K, Set<Patch<T[K]>>>>

const patchedEntities: PatchedEntities = new Map()

// TODO: Make a generic patch function that can patch methods not present on Entity (FunctionKeys<T extends Entity> does not work for some reason)
// TODO: Make this function return explicit return types (eslint won't do it automatically and too bored to do it manually)
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function patchEntity<T extends Entity> (entity: T) {
  interface InnerPatchHelper<Below extends AnyFunction> {
    below: (this: ThisParameterType<Below>, ...args: Parameters<Below>) => ReturnType<Below>
    restore: () => void
  }

  return <PropertyName extends FunctionKeys<Entity>>(property: PropertyName, callback: (this: T, helper: InnerPatchHelper<Entity[PropertyName]>) => ((this: T, ...args: Parameters<Entity[PropertyName]>) => ReturnType<Entity[PropertyName]>)): OuterPatchHelper => {
    const options: PatchOptions = {
      priority: 0
    }

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

    let patches = patchedEntity.get(property) as Set<Patch<Original>>

    if (patches === undefined) {
      patches = new Set()
      patchedEntity.set(property, patches)
    }

    // original is the original method
    if (patches.size === 0) {
      patches.add({
        patchedMethod: original,
        options: {
          priority: -Infinity
        }
      })
    } else if (getPatchArray().every(value => value.patchedMethod !== original)) {
      patches.add({ patchedMethod: original, options })
    }

    const helper: InnerPatchHelper<Original> = {
      below (...args: OriginalArgs): ReturnType<Original> {
        const patchArray = getPatchArray()

        const index = patchArray.findIndex(patch => patch.patchedMethod === patchedMethod)

        if (index === -1) throw new Error('Helper.below called after Helper.restore')

        const belowPatch = patchArray[index - 1]

        if (belowPatch === undefined) throw new Error('Invalid below (undefined)')

        const belowPatchedMethod = belowPatch.patchedMethod

        if (belowPatchedMethod === undefined) throw new Error('Invalid below (method undefined)')
        if (!isFunction(belowPatchedMethod)) throw new Error('Invalid below (method not a function)')

        return (belowPatchedMethod as ((...args: OriginalArgs) => ReturnType<Original>)).apply(entity, args)
      },
      restore () {
        throw new Error('Helper.restore called before initialization phase')
      }
    }

    const patchedMethod = callback.apply(entity, [helper])

    const patch = {
      patchedMethod: patchedMethod as Original,
      options
    }

    // ? Should I bind patch to entity here?

    helper.restore = () => {
      // If I (patch) am currently "active", restore entity[property] to its "lower" state

      const patchArray = getPatchArray()
      const index = patchArray.findIndex(p => p.patchedMethod === patchedMethod)

      // If I (patch) am currently "active"
      if (entity[property] === patchedMethod) {
        // Restore entity[property] to its "lower" state
        entity[property] = patchArray[index - 1].patchedMethod
      }

      patches.delete(patch)
    }

    patches.add(patch)

    entity[property] = patchedMethod as Original

    return new OuterPatchHelper(options)

    function getPatchArray (): Array<Patch<Original>> {
      return Array.from(patches)
        .sort((a, b) => a.options.priority - b.options.priority)
    }
  }
}

export default patchEntity
