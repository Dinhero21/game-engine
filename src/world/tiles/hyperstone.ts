import { Tile, TileInstance, type TileProperties } from './base.js'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface HyperStoneTileProperties {}

export class HyperStoneTile extends Tile<HyperStoneTileProperties> {
  public instance () {
    return (tileProperties: TileProperties) => new HyperStoneTileInstance(tileProperties, this.properties)
  }
}

export class HyperStoneTileInstance extends TileInstance<HyperStoneTileProperties> {
  type = 'hyperstone'
}
