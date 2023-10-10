import { activateSignal, deactivateSignal, isSignalActive } from './signal'
import { Tile, TileInstance, type TileProperties } from '../base'
import { type IPlayer } from '../../entity'

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

  public onInteraction (player: IPlayer): void {
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
