import Tile from './base.js'

export class SusTile extends Tile {
  public type = 'sus'

  public update (): void {
    const chunk = this.getChunk()
    const world = chunk.getWorld()

    const tilePosition = this.getTilePosition()

    const floorTilePosition = tilePosition.offset(0, 1)
    const floorTile = world.getTile(floorTilePosition)

    if (floorTile === undefined) return

    if (floorTile.type === 'air') {
      world.setTile('air', tilePosition, 'change', 'change')
      world.setTile('sus', floorTilePosition, 'change', 'change')
    }
  }
}

export default SusTile
