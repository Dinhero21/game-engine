import Tile from '../engine/util/tilemap/tile.js'
import { loader } from '../assets/loader.js'

export async function createTile (type: string): Promise<Tile> {
  const tileData = await loader.getTileData(type)

  return new Tile(type, tileData.collidable, (context, data) => {
    const position = data.position
    const size = data.size

    const texture = loader.getTexture(tileData.texture)

    context.drawImage(texture, position.x, position.y, size.x, size.y)
  })
}
