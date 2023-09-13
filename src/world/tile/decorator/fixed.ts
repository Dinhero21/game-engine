import { TileInstance } from '../base'

const lasts = new WeakMap<TileInstance, number>()

export function fixed (interval: number): (target: TileInstance, propertyKey: string | symbol, descriptor: PropertyDescriptor) => void {
  return function (target, propertyKey, descriptor) {
    const original = descriptor.value

    descriptor.value = function (this: unknown) {
      if (!(this instanceof TileInstance)) return

      const now = performance.now()

      const last = lasts.get(this) ?? now

      const delta = now - last

      if (delta >= interval) {
        original.apply(this, arguments)
      }

      lasts.set(this, last)
    }
  }
}

export default fixed
