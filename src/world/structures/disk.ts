// ? Should I use disk or disc? Codeium has led me
// ? to believe it's the latter but Phind says it
// ? doesn't matter. I ended up choosing disk because
// ? its what its in my muscle memory.

import Structure from './base'
import { type StructureHelper } from './handler'
import Vec2 from '../../public/engine/util/vec2'
import { type Tile } from '../tiles/base'

export interface DiskStructureProperties {
  tile?: Tile
  x: number
  y: number
  radius: number
}

export class DiskStructure extends Structure<DiskStructureProperties> {
  public setTile (tile: Tile): DiskStructure {
    return new DiskStructure({
      ...this.properties,
      tile
    })
  }

  public setPosition (x: number, y: number): DiskStructure {
    return new DiskStructure({
      ...this.properties,
      x,
      y
    })
  }

  public setRadius (radius: number): DiskStructure {
    return new DiskStructure({
      ...this.properties,
      radius
    })
  }

  public create (helper: StructureHelper): void {
    const properties = this.properties

    const tile = properties.tile

    if (tile === undefined) return

    const positionX = properties.x
    const positionY = properties.y

    const radius = properties.radius
    const diameter = radius * 2

    const center = new Vec2(radius, radius)

    for (let x = 0; x <= diameter; x++) {
      for (let y = 0; y <= diameter; y++) {
        const position = new Vec2(x, y)
        const distance = position.distanceTo(center)

        if (distance > radius) continue

        helper.setTile(tile, positionX + x, positionY + y)
      }
    }
  }
}

export default DiskStructure
