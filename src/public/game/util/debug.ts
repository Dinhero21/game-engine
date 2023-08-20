export const ORIGIN_SYMBOL = Symbol('origin')

export function setOrigin (object: any, origin: any): void {
  Object.defineProperty(object, ORIGIN_SYMBOL, {
    value: origin
  })
}

export function getOrigin (object: any): any {
  return object[ORIGIN_SYMBOL]
}
