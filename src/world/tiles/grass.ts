import { Tile, TileInstance, type TileProperties } from './base'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface GrassTileProperties {}

export class GrassTile extends Tile<GrassTileProperties> {
  public instance () {
    return (tileProperties: TileProperties) => new GrassTileInstance(tileProperties, this.properties)
  }
}

export class GrassTileInstance extends TileInstance<GrassTileProperties> {
  type = 'grass'
}
