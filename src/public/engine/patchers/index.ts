import type Entity from '../entities/index.js'

function isFunction (value: any): value is (...args: any[]) => any {
  return typeof value === 'function'
}

export function patch<T extends Entity> (entity: T): <PropertyName extends keyof T = keyof T>(property: PropertyName, callback: (this: T, original: T[PropertyName]) => T[PropertyName] & ((this: T, ...args: any[]) => any)) => void {
  type TKey = keyof T

  // TODO: Make it so Property can only be TKeys when T[TKey] extends ((...args: any[]) => any)
  return <PropertyName extends TKey = TKey>(property: PropertyName, callback: (this: T, original: T[PropertyName]) => T[PropertyName] & ((this: T, ...args: any[]) => any)) => {
    let original = entity[property]

    // ? Should I return or throw an error?
    if (!isFunction(original)) throw new Error(`Attempted to patch a non-function property ${JSON.stringify(property)} of type ${JSON.stringify(typeof original)}`)

    type Original = typeof original

    original = original.bind(entity) as Original

    let newFunction = callback.apply(entity, [original])

    if (!isFunction(newFunction)) throw new Error('Callback returned a non-function')

    newFunction = newFunction.bind(entity) as Original

    entity[property] = newFunction as Original
  }
}
