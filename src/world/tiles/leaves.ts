import { Tile, TileInstance, type TileProperties } from './base'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface LeavesTileProperties {}

export class LeavesTile extends Tile<LeavesTileProperties> {
  public instance () {
    return (tileProperties: TileProperties) => new LeavesTileInstance(tileProperties, this.properties)
  }
}

export class LeavesTileInstance extends TileInstance<LeavesTileProperties> {
  type = 'leaves'
}
