import type Player from '../../../player'
import { Tile, TileInstance, type TileProperties } from '../base'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface SwitchTileProperties {
  active: boolean
}

export class SwitchTile extends Tile<SwitchTileProperties> {
  public setActiveState (active: boolean): SwitchTile {
    return new SwitchTile({
      ...this.properties,
      active
    })
  }

  public instance () {
    return (tileProperties: TileProperties) => new SwitchTileInstance(tileProperties, this.properties)
  }
}

export class SwitchTileInstance extends TileInstance<SwitchTileProperties> {
  type = 'switch'

  public active

  constructor (tileProperties: TileProperties, properties: SwitchTileProperties) {
    super(tileProperties, properties)

    this.active = properties.active
  }

  public onInteraction (player: Player): void {
    this.active = !this.active

    this.syncTile(this)

    this.updateNeighbors()
  }

  public getMeta (): any {
    return this.active
  }
}
