import { Tile, TileInstance, type TileProperties } from './base.js'
import Tiles from './index.js'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface HyperStoneTileProperties {}

export class HyperStoneTile extends Tile<HyperStoneTileProperties> {
  public instance () {
    return (tileProperties: TileProperties) => new HyperStoneTileInstance(tileProperties, this.properties)
  }
}

export class HyperStoneTileInstance extends TileInstance<HyperStoneTileProperties> {
  type = 'hyperstone'

  public update (): void {
    const world = this.getWorld()

    const position = this.getTilePosition()

    const x = Math.floor((Math.random() * 3) - 1)
    const y = Math.floor((Math.random() * 3) - 1)

    const offsetedPosition = position.offset(x, y)

    let tile: Tile = Tiles.stone

    if (Math.random() < 0.125) tile = Tiles.hyperstone

    world.setTile(tile.instance(), offsetedPosition, true, true)
  }
}
