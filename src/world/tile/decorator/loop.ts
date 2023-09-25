import { TileInstance } from '../base'

export function loop (checkTile: boolean): (target: TileInstance, propertyKey: string | symbol, descriptor: PropertyDescriptor) => void {
  return function (target, propertyKey, descriptor) {
    const original = descriptor.value

    descriptor.value = function (this: unknown) {
      if (!(this instanceof TileInstance)) return

      const world = this.getWorld()

      original.apply(this, arguments)

      world.queueTick(() => {
        if (!(this instanceof TileInstance)) throw new Error(`this is not an instance of TileInstance (${String((this as any).constructor.name)})`)

        if (checkTile) {
          const position = this.getTilePosition()

          const tile = world.getTile(position, false)

          if (tile !== this) return
        }

        this.update()
      })
    }
  }
}

export default loop
