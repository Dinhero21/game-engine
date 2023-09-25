import Tiles from '.'
import { AirTileInstance } from './air'
import { Tile, TileInstance, type TileProperties } from './base'
import loop from './decorator/loop'
import once from './decorator/once'
import { chance, lerp } from '../../public/engine/util/math'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface HyperStoneTileProperties {}

export class HyperStoneTile extends Tile<HyperStoneTileProperties> {
  public instance () {
    return (tileProperties: TileProperties) => new HyperStoneTileInstance(tileProperties, this.properties)
  }
}

export class HyperStoneTileInstance extends TileInstance<HyperStoneTileProperties> {
  type = 'hyperstone'

  @once()
  @loop(true)
  public update (): void {
    const world = this.getWorld()

    const position = this.getTilePosition()

    if (chance(0.125)) world.setTile(Tiles.stone.instance(), position, true, true)

    const x = Math.floor(lerp(-1, 2, Math.random()))
    const y = Math.floor(lerp(-1, 2, Math.random()))

    const offsetedPosition = position.offset(x, y)

    const oldTile = world.getTile(offsetedPosition, false)

    if (!(oldTile instanceof AirTileInstance)) return

    let tile = Tiles.stone

    if (chance(0.5)) tile = Tiles.hyperstone

    world.setTile(tile.instance(), offsetedPosition, true, true)
  }
}
