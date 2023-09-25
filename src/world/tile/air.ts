import { Tile, TileInstance, type TileProperties } from './base'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface AirTileProperties {}

export class AirTile extends Tile<AirTileProperties> {
  public instance () {
    return (tileProperties: TileProperties) => new AirTileInstance(tileProperties, this.properties)
  }
}

export const LIGHT_ABSORPTION = 1 / 64

export class AirTileInstance extends TileInstance<AirTileProperties> {
  type = 'air'
  LIGHT_ABSORPTION = LIGHT_ABSORPTION

  public updateLight (): void {
    super.updateLight()

    this.light = Math.max(this.light, 1)
  }
}
