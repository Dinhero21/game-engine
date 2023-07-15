import type Structure from '../structures/base'
import type Vec2 from '../../public/engine/util/vec2'
import { Tile, TileInstance, type TileProperties } from './base'
import { StructureHelper } from '../structures/handler'

export interface StructureTileProperties {
  structure?: Structure
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

  protected createHelper (position: Vec2): StructureHelper {
    const world = this.getWorld()

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this

    return new StructureHelper(
      position.x,
      position.y,
      {
        setTile (tile: Tile, x: number, y: number) {
          world.setTile(tile.instance(), position.offset(x, y), true, true)
        },
        // TODO: Set the structure without setting a structure tile
        setStructure (structure: Structure, x: number, y: number) {
          const offsetedPosition = position.offset(x, y)

          const helper = self.createHelper(offsetedPosition)

          structure.create(helper)
        }
      }
    )
  }

  public ready (): void {
    const properties = this.properties
    const structure = properties.structure

    if (structure === undefined) return

    const position = this.getTilePosition()

    const helper = this.createHelper(position)

    structure.create(helper)
  }
}
