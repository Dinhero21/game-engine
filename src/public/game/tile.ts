import Tile from '../engine/util/tilemap/tile'
import { loader } from '../asset/loader'
import Vec2 from '../engine/util/vec2'

export const TILE_TEXTURE_SIZE = 8

export async function createTile (type: string, meta: unknown): Promise<Tile> {
  const tileData = await loader.getTileData(type)

  return new Tile(type, meta, tileData.collidable, (context, data) => {
    const nearby = data.nearby

    const tileX = (Number(nearby[0]) << 0) + (Number(nearby[1]) << 1)
    const tileY = (Number(nearby[2]) << 0) + (Number(nearby[3]) << 1)

    const x = tileX * TILE_TEXTURE_SIZE
    const y = tileY * TILE_TEXTURE_SIZE

    const texture = loader.getTileTexture(tileData.texture)

    const position = data.position.clone()

    const size = new Vec2(TILE_TEXTURE_SIZE, TILE_TEXTURE_SIZE)

    // TODO: Make it possible for tiles to "inject" their own rendering function automatically

    const oldGlobalAlpha = context.globalAlpha

    if (type === 'water') {
      if (typeof meta !== 'number') throw new TypeError('Expected WaterTile.meta to be a number')

      // Range: [0,8]
      const pressure = meta

      // nearby[0] = up
      if (nearby[0]) {
        const normalizedPressure = pressure / 8

        context.globalAlpha = Math.max(normalizedPressure, 0.25)
      } else {
        const height = pressure + 1
        const delta = (8 - height)

        position.y += delta

        size.y -= delta
      }
    }

    context.drawImage(
      texture,
      x, y,
      TILE_TEXTURE_SIZE, TILE_TEXTURE_SIZE,
      position.x, position.y,
      size.x, size.y
    )

    context.globalAlpha = oldGlobalAlpha
  })
}
