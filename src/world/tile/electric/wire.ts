import { Tile, TileInstance, type TileProperties } from '../base'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface WireTileProperties {
  active: boolean
}

export class WireTile extends Tile<WireTileProperties> {
  public setActiveState (active: boolean): WireTile {
    return new WireTile({
      ...this.properties,
      active
    })
  }

  public instance () {
    return (tileProperties: TileProperties) => new WireTileInstance(tileProperties, this.properties)
  }
}

export class WireTileInstance extends TileInstance<WireTileProperties> {
  type = 'wire'

  public active

  constructor (tileProperties: TileProperties, properties: WireTileProperties) {
    super(tileProperties, properties)

    this.active = properties.active
  }

  protected shouldBeActive (): boolean {
    for (const neighbor of this.getNeighbors()) {
      if (!('active' in neighbor)) continue

      const active = neighbor.active

      if (typeof active !== 'boolean') continue

      if (active) return true
    }

    return false
  }

  public update (): void {
    const shouldBeActive = this.shouldBeActive()

    if (this.active === shouldBeActive) return

    this.active = shouldBeActive

    this.updateNeighbors()

    this.syncTile(this)
  }

  public getMeta (): any {
    return this.active
  }
}
