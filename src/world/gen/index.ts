import type Vec2 from '../../public/engine/util/vec2'
import { Noise2D, DistortedNoise } from './noise'
import { type Tile } from '../tiles/base'
import Tiles from '../tiles'

const DISTORTION_SCALE = 0.001
const DISTORTION_STRENGTH = 10
const NOISE_SCALE = 0.03
const NOISE_STRENGTH = 10

// TODO: Use x, y
export class WorldGen {
  protected readonly distortion = new Noise2D({
    scale: DISTORTION_SCALE,
    strength: DISTORTION_STRENGTH
  })

  protected readonly noise = new DistortedNoise({
    scale: NOISE_SCALE,
    strength: NOISE_STRENGTH
  }, this.distortion)

  protected getNoise (tilePosition: Vec2): number {
    return this.noise.get(tilePosition)
  }

  protected getDensity (tilePosition: Vec2): number {
    const noise = this.getNoise(tilePosition)

    return noise + tilePosition.y
  }

  protected getFloorTile (tilePosition: Vec2): Tile {
    if (this.getDensity(tilePosition.offset(0, -1)) < 0) {
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

  protected _getTile (tileTilePosition: Vec2): Tile {
    const density = this.getDensity(tileTilePosition)

    if (tileTilePosition.x === 0 && tileTilePosition.y === 0) {
      return Tiles.structure
    }

    if (density > 0) {
      return this.getFloorTile(tileTilePosition)
    }

    return Tiles.air
  }

  public getTile (tileTilePosition: Vec2): Tile {
    const cached = this.getCachedTile(tileTilePosition.x, tileTilePosition.y)

    if (cached !== undefined) return cached

    const tile = this._getTile(tileTilePosition)

    this.setCachedTile(tile, tileTilePosition.x, tileTilePosition.y)

    return tile
  }
}
