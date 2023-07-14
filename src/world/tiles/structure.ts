import type Structure from '../structures/base'
import { Tile, TileInstance, type TileProperties } from './base'

export interface StructureTileProperties {
  structure: Structure
}

export class StructureTile extends Tile<StructureTileProperties> {
  public setStructure (structure: Structure): StructureTile {
    return new StructureTile({
      ...this.properties,
      structure
    })
  }

  public instance () {
    return (tileProperties: TileProperties) => new StructureTileInstance(tileProperties, this.properties)
  }
}

export class StructureTileInstance extends TileInstance<StructureTileProperties> {
  type = 'structure'

  public ready (): void {
    const world = this.getWorld()

    const position = this.getTilePosition()

    const properties = this.properties
    const structure = properties.structure

    structure.create((tile, x, y) => {
      // ? Should I update?
      world.setTile(tile.instance(), position.offset(x, y), true, true)
    })
  }
}
