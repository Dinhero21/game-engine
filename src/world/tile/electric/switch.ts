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

  public signal = this

  public onInteraction (player: Player): void {
    const active = isSignalActive(this)

    if (active) {
      deactivateSignal(this)
    } else {
      activateSignal(this)
    }

    this.syncTile(this)

    this.updateNeighbors()
  }

  public destroy (): void {
    deactivateSignal(this)
  }

  public getMeta (): boolean {
    const active = isSignalActive(this)

    return active
  }
}
