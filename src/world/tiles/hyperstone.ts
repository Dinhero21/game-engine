import Tile from './base.js'

export class HyperStoneTile extends Tile {
  public type = 'hyperstone'

  public update (): void {
    const chunk = this.getChunk()
    const world = chunk.getWorld()

    const tilePosition = this.getTilePosition()

    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        const offsetTilePosition = tilePosition.offset(x, y)
        const offsetTile = world.getTile(offsetTilePosition)

        if (offsetTile === undefined) continue

        if (offsetTile.type === 'air') {
          if (Math.random() < 0.2) world.setTile('hyperstone', offsetTilePosition, 'change', 'change')
        }
      }
    }

    world.setTile('stone', tilePosition, 'change', 'change')
  }
}

export default HyperStoneTile
