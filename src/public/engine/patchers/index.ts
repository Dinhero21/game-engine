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

// TODO: Make a generic patch function that can patch methods not present on Entity (FunctionKeys<T extends Entity> does not work for some reason)
// TODO: Make this function return explicit return types (too bored ngl)
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function patchEntity (entity: Entity) {
  interface PatchHelper<Original> {
    original: Original
    restore: () => void
  }

  return <PropertyName extends FunctionKeys<Entity> = FunctionKeys<Entity>>(property: PropertyName, callback: (this: Entity, test: PatchHelper<Entity[PropertyName]>, ...args: MaybeParameters<Entity[PropertyName]>) => MaybeReturnType<Entity[PropertyName]>): void => {
    let original = entity[property]

    // ? Should I return or throw an error?
    if (!isFunction(original)) throw new Error(`Attempted to patch a non-function property ${JSON.stringify(property)} of type ${JSON.stringify(typeof original)}`)

    type Original = typeof original

    original = original.bind(entity) as Original

    (entity[property] as MaybeFunction<Entity[PropertyName]>) = (...args) => {
      return callback.apply(entity, [
        {
          original,
          restore () {
            entity[property] = original
          }
        },
        ...args
      ])
    }
  }
}
