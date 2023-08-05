import type Structure from './base'
import { type Tile } from '../tiles/base'

export interface StructureHandlerSetters {
  setTile: (tile: Tile, x: number, y: number) => void
  setStructure: (structure: Structure, x: number, y: number) => void
}

export class StructureHelper {
  protected x
  protected y
  protected setters

  constructor (x: number, y: number, setters: StructureHandlerSetters) {
    this.x = x
    this.y = y
    this.setters = setters
  }

  public setTile (tile: Tile, x: number, y: number): void {
    this.setters.setTile(tile, x, y)
  }

  public setStructure (structure: Structure, x: number, y: number): void {
    this.setters.setStructure(structure, x, y)
  }
}
