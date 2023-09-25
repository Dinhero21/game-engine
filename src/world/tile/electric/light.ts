import { activateSignal, deactivateSignal, isSignalActive } from './signal'
import { Tile, TileInstance, type TileProperties } from '../base'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface LightTileProperties {}

export class LightTile extends Tile<LightTileProperties> {
  public instance () {
    return (tileProperties: TileProperties) => new LightTileInstance(tileProperties, this.properties)
  }
}

export class LightTileInstance extends TileInstance<LightTileProperties> {
  type = 'light'

  public signal?: TileInstance

  protected getActiveSignal (): TileInstance | undefined {
    for (const neighbor of this.getNeighbors()) {
      if (!('signal' in neighbor)) continue

      const signal = neighbor.signal

      if (!(signal instanceof TileInstance)) continue

      const active = isSignalActive(signal)

      if (active) return signal
    }
  }

  public update (): void {
    const activeSignal = this.getActiveSignal()

    if (this.signal === activeSignal) return

    this.signal = activeSignal

    this.updateNeighbors()

    this.queueLight()

    this.syncTile(this)
  }

  public destroy (): void {
    const signal = this.signal

    if (signal === undefined) return

    const active = isSignalActive(signal)

    if (!active) return

    deactivateSignal(signal)

    this.updateNeighbors()

    activateSignal(signal)

    signal.updateNeighbors()
  }

  public getMeta (): boolean {
    const signal = this.signal

    if (signal === undefined) return false

    return isSignalActive(signal)
  }

  public updateLight (): void {
    super.updateLight()

    const active = this.getMeta()

    if (active) {
      this.light += 1.5
    }
  }
}
