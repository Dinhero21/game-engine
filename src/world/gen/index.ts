import type Vec2 from '../../public/engine/util/vec2'
import type Structure from '../structure/base'
import { Noise2D, DistortedNoise, Noise } from './noise'
import { type Tile } from '../tile/base'
import Tiles from '../tile'
import Structures from '../structure'
import { chance, randomInt } from '../../public/engine/util/math'

// TODO: Use x, y
export class WorldGen {
  protected readonly distortion = new Noise2D({
    scale: 0.001,
    strength: 10
  })

  protected readonly noise = new DistortedNoise({
    scale: 0.03,
    strength: 10
  }, this.distortion)

  protected readonly caveNoise = new Noise({
    scale: 0.01,
    strength: 1
  })

  protected getNoise (tilePosition: Vec2): number {
    return this.noise.get(tilePosition)
  }

  protected getDensity (tilePosition: Vec2): number {
    const noise = this.getNoise(tilePosition)

    return noise + tilePosition.y
  }

  protected getCaveNoise (tilePosition: Vec2): number {
    return this.caveNoise.get(tilePosition)
  }

  protected getCaveDensity (tilePosition: Vec2): number {
    const noise = this.getCaveNoise(tilePosition)

    return Math.abs(noise) - (tilePosition.y / 1000 + 0.1)
  }

  protected getFloorTile (tilePosition: Vec2): Tile {
    if (this.getCaveDensity(tilePosition) <= 0) {
      return Tiles.air
    }

    if (this.getDensity(tilePosition.offset(0, -1)) <= 0) {
      return Tiles.grass
    }

    return (tilePosition.y + (Math.random() - 1) * 2 * 5) > 16 ? Tiles.stone : Tiles.dirt
  }

  protected readonly cache = new Map<number, Map<number, Tile>>()

  protected getCachedTile (x: number, y: number): Tile | undefined {
    const cache = this.cache

    return cache.get(x)?.get(y)
  }

  protected setCachedTile (tile: Tile, x: number, y: number): void {
    const cache = this.cache

    const row = cache.get(x) ?? new Map()
    cache.set(x, row)

    row.set(y, tile)
  }

  protected getGroundTile (tileTilePosition: Vec2): Tile {
    const density = this.getDensity(tileTilePosition)

    if (density > 0) {
      return this.getFloorTile(tileTilePosition)
    }

    return Tiles.air
  }

  protected getDecorator (): Structure {
    const height = chance(0.3)
      // Bush
      ? randomInt(0, 1)
      // Tree
      : randomInt(3, 7)

    return Structures.tree
      .setHeight(height)
  }

  protected _getTile (tileTilePosition: Vec2): Tile {
    const groundTile = this.getGroundTile(tileTilePosition)

    if (groundTile !== Tiles.air) return groundTile

    const belowTileTilePosition = tileTilePosition.offset(0, 1)
    const belowGroundTile = this.getGroundTile(belowTileTilePosition)

    if (belowGroundTile !== Tiles.grass) return groundTile

    if (Math.random() > 0.1) return groundTile

    const structure = this.getDecorator()

    return Tiles.structure
      .setStructure(structure)
  }

  public getTile (tileTilePosition: Vec2): Tile {
    const cached = this.getCachedTile(tileTilePosition.x, tileTilePosition.y)

    if (cached !== undefined) return cached

    const tile = this._getTile(tileTilePosition)

    this.setCachedTile(tile, tileTilePosition.x, tileTilePosition.y)

    return tile
  }
}
