import type Structure from '../structure/base'
import type Vec2 from '../../public/engine/util/vec2'
import { Tile, TileInstance, type TileType, type TileProperties } from './base'
import { StructureHelper } from '../structure/handler'

export interface StructureTileProperties {
  structure?: Structure
  safeTiles: Set<TileType>
}

export class StructureTile extends Tile<StructureTileProperties> {
  public setStructure (structure: Structure): StructureTile {
    return new StructureTile({
      ...this.properties,
      structure
    })
  }

  public setSafeTiles (safeTiles: Set<TileType>): StructureTile {
    return new StructureTile({
      ...this.properties,
      safeTiles
    })
  }

  public instance () {
    return (tileProperties: TileProperties) => new StructureTileInstance(tileProperties, this.properties)
  }
}

export class StructureTileInstance extends TileInstance<StructureTileProperties> {
  type = 'structure'

  protected createHelper (position: Vec2): StructureHelper {
    const properties = this.properties
    const tiles = properties.safeTiles

    const world = this.getWorld()

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this

    return new StructureHelper(
      position.x,
      position.y,
      {
        setTile (tile: Tile, x: number, y: number) {
          const offsetedPosition = position.offset(x, y)

          const offsetedTile = world.getTile(offsetedPosition)
          const offsetedTileType = offsetedTile?.type

          if (offsetedTileType !== undefined && !tiles.has(offsetedTileType)) return

          world.setTile(tile.instance(), offsetedPosition, true, true)
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
