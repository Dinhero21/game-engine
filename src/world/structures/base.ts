import { type Tile } from '../tiles/base'

export type SetTileFunction = (tile: Tile, x: number, y: number) => void

export abstract class Structure {
  public abstract create (setTile: SetTileFunction): void
}

export default Structure
