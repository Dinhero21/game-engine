import { Tile, TileInstance, type TileProperties } from './base.js'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface StoneTileProperties {}

export class StoneTile extends Tile<StoneTileProperties> {
  public instance () {
    return (tileProperties: TileProperties) => new StoneTileInstance(tileProperties, this.properties)
  }
}

export class StoneTileInstance extends TileInstance<StoneTileProperties> {
  type = 'stone'
}
