import { type Tile } from '../tiles/base.js'
import type Vec2 from '../../public/engine/util/vec2.js'
import { Noise2D, DistortedNoise } from './noise.js'
import Tiles from '../tiles/index.js'

const DISTORTION_SCALE = 0.001
const DISTORTION_STRENGTH = 10
const NOISE_SCALE = 0.03
const NOISE_STRENGTH = 10

export class WorldGen {
  protected readonly cache = new Map<string, Tile>()

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
    return (tilePosition.y + (Math.random() - 1) * 2 * 5) > 16 ? Tiles.stone : Tiles.dirt
  }

  public getTile (tileTilePosition: Vec2): Tile {
    const id = `${tileTilePosition.x}|${tileTilePosition.y}`

    const cached = this.cache.get(id)

    if (cached !== undefined) return cached

    const density = this.getDensity(tileTilePosition)

    let tile: Tile = Tiles.air

    if (density > 0) {
      tile = this.getFloorTile(tileTilePosition)
    }

    this.cache.set(id, tile)

    return tile
  }
}
