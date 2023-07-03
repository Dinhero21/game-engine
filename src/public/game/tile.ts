import Tile from '../engine/util/tilemap/tile.js'
import { loader } from '../assets/loader.js'

const TILE_TEXTURE_SIZE = 8

export async function createTile (type: string): Promise<Tile> {
  const tileData = await loader.getTileData(type)

  return new Tile(type, tileData.collidable, (context, data) => {
    const nearby = data.nearby

    const tileX = (Number(nearby[0]) << 0) + (Number(nearby[1]) << 1)
    const tileY = (Number(nearby[2]) << 0) + (Number(nearby[3]) << 1)

    const x = tileX * TILE_TEXTURE_SIZE
    const y = tileY * TILE_TEXTURE_SIZE

    const texture = loader.getTexture(tileData.texture)

    const position = data.position
    const size = data.size

    context.drawImage(texture, x, y, TILE_TEXTURE_SIZE, TILE_TEXTURE_SIZE, position.x, position.y, size.x, size.y)
  })
}
