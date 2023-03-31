import Tile from '../engine/util/tilemap/tile.js'
import { loader } from '../assets/loader.js'

export async function createTile (name: string): Promise<Tile> {
  const tileData = await loader.getTileData(name)

  return new Tile(name, tileData.collidable, (context, data) => {
    const position = data.position
    const size = data.size

    const texture = loader.getTexture(name)

    context.drawImage(texture, position.x, position.y, size.x, size.y)
  })
}
