import { isSignalActive } from './signal'
import { Tile, TileInstance, type TileProperties } from '../base'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface WireTileProperties {
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

  public signal?: symbol

  protected getActiveSignal (): symbol | undefined {
    for (const neighbor of this.getNeighbors()) {
      if (!('signal' in neighbor)) continue

      const signal = neighbor.signal

      if (typeof signal !== 'symbol') continue

      const active = isSignalActive(signal)

      if (active) return signal
    }
  }

  public update (): void {
    const activeSignal = this.getActiveSignal()

    if (this.signal === activeSignal) return

    this.signal = activeSignal

    this.updateNeighbors()

    this.syncTile(this)
  }

  public getMeta (): boolean {
    const signal = this.signal

    if (signal === undefined) return false

    return isSignalActive(signal)
  }
}
