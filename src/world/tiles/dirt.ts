import { Tile, TileInstance, type TileProperties } from './base.js'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface DirtTileProperties {}

export class DirtTile extends Tile<DirtTileProperties> {
  public instance () {
    return (tileProperties: TileProperties) => new DirtTileInstance(tileProperties, this.properties)
  }
}

export class DirtTileInstance extends TileInstance<DirtTileProperties> {
  type = 'dirt'
}
