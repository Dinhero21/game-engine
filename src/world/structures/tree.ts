import Structures from '.'
import Structure from './base'
import { type StructureHelper } from './handler'
import Tiles from '../tiles'

export interface TreeStructureProperties {
  height: number
}

export class TreeStructure extends Structure<TreeStructureProperties> {
  public setHeight (height: number): TreeStructure {
    return new TreeStructure({
      ...this.properties,
      height
    })
  }

  public create (helper: StructureHelper): void {
    const properties = this.properties
    const height = properties.height

    // Leaves
    const radius = 2

    const structure = Structures.disk
      .setPosition(-radius, -radius)
      .setRadius(radius)
      .setTile(Tiles.leaves)

    helper.setStructure(structure, 0, -height)

    // Trunk
    for (let i = 0; i < height; i++) {
      helper.setTile(Tiles.trunk, 0, -i)
    }
  }
}

export default TreeStructure
