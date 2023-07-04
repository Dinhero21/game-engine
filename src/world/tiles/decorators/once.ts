import { TileInstance } from '../base.js'

const ticks = new WeakMap<TileInstance, symbol>()

export function once (): (target: TileInstance, propertyKey: string | symbol, descriptor: PropertyDescriptor) => void {
  return function (target, propertyKey, descriptor) {
    const original = descriptor.value

    descriptor.value = function (this: unknown) {
      if (!(this instanceof TileInstance)) return

      const lastTick = ticks.get(this)

      const world = this.getWorld()

      const currentTick = world.currentTick

      if (currentTick === lastTick) return

      original.apply(this, arguments)

      ticks.set(this, currentTick)
    }
  }
}

export default once
