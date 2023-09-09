export const ORIGIN_SYMBOL = Symbol('origin')

export function setOrigin<T> (object: T, origin: any): T {
  Object.defineProperty(object, ORIGIN_SYMBOL, {
    value: origin
  })

  return object
}

export function getOrigin (object: any): any {
  return object[ORIGIN_SYMBOL]
}
