import type Player from '../../../player'
import { activateSignal, deactivateSignal, isSignalActive } from './signal'
import { Tile, TileInstance, type TileProperties } from '../base'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface SwitchTileProperties {}

export class SwitchTile extends Tile<SwitchTileProperties> {
  public instance () {
    return (tileProperties: TileProperties) => new SwitchTileInstance(tileProperties, this.properties)
  }
}

export class SwitchTileInstance extends TileInstance<SwitchTileProperties> {
  type = 'switch'

  private readonly signal = Symbol('signal.switch')

  public onInteraction (player: Player): void {
    const signal = this.signal

    const active = isSignalActive(signal)

    if (active) {
      deactivateSignal(signal)
    } else {
      activateSignal(signal)
    }

    this.syncTile(this)

    this.updateNeighbors()
  }

  public destroy (): void {
    const signal = this.signal

    deactivateSignal(signal)
  }

  public getMeta (): boolean {
    const signal = this.signal

    const active = isSignalActive(signal)

    return active
  }
}
