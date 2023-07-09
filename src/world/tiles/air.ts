import { Tile, TileInstance, type TileProperties } from './base'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface AirTileProperties {}

export class AirTile extends Tile<AirTileProperties> {
  public instance () {
    return (tileProperties: TileProperties) => new AirTileInstance(tileProperties, this.properties)
  }
}

export class AirTileInstance extends TileInstance<AirTileProperties> {
  type = 'air'
}
