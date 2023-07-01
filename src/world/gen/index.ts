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

  public getTile (tileTilePosition: Vec2): Tile {
    const id = `${tileTilePosition.x}|${tileTilePosition.y}`

    const cached = this.cache.get(id)

    if (cached !== undefined) return cached

    const noise = this.noise.get(tileTilePosition)

    const baseTerrain = -tileTilePosition.y + noise

    let tile: Tile = Tiles.air

    if (baseTerrain < 0) tile = Tiles.stone

    this.cache.set(id, tile)

    return tile
  }
}
