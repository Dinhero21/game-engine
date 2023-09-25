import { Tile, TileInstance, type TileProperties } from './base'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TrunkTileProperties {}

export class TrunkTile extends Tile<TrunkTileProperties> {
  public instance () {
    return (tileProperties: TileProperties) => new TrunkTileInstance(tileProperties, this.properties)
  }
}

export class TrunkTileInstance extends TileInstance<TrunkTileProperties> {
  type = 'trunk'
  LIGHT_ABSORPTION = 1 / 16
}
